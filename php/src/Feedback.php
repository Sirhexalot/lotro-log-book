<?php

declare(strict_types=1);

namespace Llb;

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PDO;
use PDOException;

/** Private feedback form, SMTP delivery and short-lived abuse protection. */
final class Feedback
{
    private const MAX_MESSAGE = 5000;
    private const MAX_REPLY_TO = 254;
    private const MIN_FORM_SECONDS = 3;
    private const RATE_LIMIT = 3;
    private const RATE_WINDOW = 3600;

    private array $config;
    private string $logFile;

    public function __construct(
        private readonly string $envFile,
        private readonly string $rateFile,
        private readonly string $siteHost = 'llb.sirhexalot.de',
        ?string $logFile = null,
    ) {
        $this->logFile = $logFile ?? dirname($rateFile) . '/llb-feedback.log';
        $this->config = self::readEnv($envFile);
        $this->writeLog(
            'config',
            @is_file($envFile) && @is_readable($envFile) ? 'file_readable' : 'file_missing_or_unreadable',
            'path=' . $envFile
                . '; open_basedir=' . (ini_get('open_basedir') === '' ? 'off' : 'on')
                . '; keys=' . implode(',', array_keys($this->config)),
        );
    }

    public static function defaultEnvPath(string $documentRoot, string $fallbackRoot): string
    {
        $roots = array_unique([
            rtrim($documentRoot, DIRECTORY_SEPARATOR),
            rtrim(realpath($documentRoot) ?: $documentRoot, DIRECTORY_SEPARATOR),
        ]);
        $publicHtmlParent = null;
        foreach ($roots as $root) {
            $cursor = $root;
            while ($cursor !== '' && dirname($cursor) !== $cursor) {
                $candidate = $cursor . DIRECTORY_SEPARATOR . 'llb-feedback.env';
                if (is_file($candidate)) {
                    return $candidate;
                }
                if (basename($cursor) === 'public_html') {
                    $publicHtmlParent = dirname($cursor);
                }
                $cursor = dirname($cursor);
            }
        }
        if ($publicHtmlParent !== null) {
            return $publicHtmlParent . DIRECTORY_SEPARATOR . 'llb-feedback.env';
        }
        $fallback = rtrim($fallbackRoot, DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR . 'llb-feedback.env';
        if (is_file($fallback)) {
            return $fallback;
        }
        $parent = dirname(rtrim($documentRoot, DIRECTORY_SEPARATOR));
        if ($parent === $documentRoot || $parent === '.') {
            $parent = $fallbackRoot;
        }
        return $parent . DIRECTORY_SEPARATOR . 'llb-feedback.env';
    }

    public static function readEnv(string $path): array
    {
        if (!is_file($path) || !is_readable($path)) {
            return [];
        }
        $values = [];
        foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            if (!preg_match('/^(?:LLB_FEEDBACK_[A-Z_]+|HOST|USER|PWD|RECP|PORT|DB_HOST|DB_USER|DB_PWD|DB_NAME|DB_PORT)$/', $key)) {
                continue;
            }
            $value = trim($value);
            if (strlen($value) >= 2
                && (($value[0] === '"' && str_ends_with($value, '"'))
                    || ($value[0] === "'" && str_ends_with($value, "'")))) {
                $value = substr($value, 1, -1);
            }
            $values[$key] = $value;
        }
        foreach ([
            'HOST' => 'LLB_FEEDBACK_SMTP_HOST',
            'USER' => 'LLB_FEEDBACK_SMTP_USER',
            'PWD' => 'LLB_FEEDBACK_SMTP_PASSWORD',
            'RECP' => 'LLB_FEEDBACK_TO',
            'PORT' => 'LLB_FEEDBACK_SMTP_PORT',
            'DB_HOST' => 'LLB_FEEDBACK_DB_HOST',
            'DB_USER' => 'LLB_FEEDBACK_DB_USER',
            'DB_PWD' => 'LLB_FEEDBACK_DB_PASSWORD',
            'DB_NAME' => 'LLB_FEEDBACK_DB_NAME',
            'DB_PORT' => 'LLB_FEEDBACK_DB_PORT',
        ] as $source => $target) {
            if (!isset($values[$target]) && isset($values[$source])) {
                $values[$target] = $values[$source];
            }
        }
        if (!isset($values['LLB_FEEDBACK_FROM']) && isset($values['LLB_FEEDBACK_SMTP_USER'])) {
            $values['LLB_FEEDBACK_FROM'] = $values['LLB_FEEDBACK_SMTP_USER'];
        }
        if (!isset($values['LLB_FEEDBACK_RATE_KEY'])) {
            $seed = $values['LLB_FEEDBACK_SMTP_PASSWORD']
                ?? $values['LLB_FEEDBACK_DB_PASSWORD']
                ?? '';
            if ($seed === '') {
                $seed = implode('|', [
                    $values['LLB_FEEDBACK_DB_HOST'] ?? '',
                    $values['LLB_FEEDBACK_DB_USER'] ?? '',
                    $values['LLB_FEEDBACK_DB_NAME'] ?? '',
                ]);
            }
            $values['LLB_FEEDBACK_RATE_KEY'] = hash('sha256', $seed);
        }
        return $values;
    }

    private function databaseConfigured(): bool
    {
        return $this->missingDatabaseKeys() === [];
    }

    private function smtpConfigured(): bool
    {
        return $this->missingSmtpKeys() === [];
    }

    private function missingDatabaseKeys(): array
    {
        $missing = [];
        foreach (['LLB_FEEDBACK_DB_HOST', 'LLB_FEEDBACK_DB_USER',
                  'LLB_FEEDBACK_DB_NAME', 'LLB_FEEDBACK_RATE_KEY'] as $key) {
            if (!isset($this->config[$key]) || $this->config[$key] === '') {
                $missing[] = $key;
            }
        }
        return $missing;
    }

    private function missingSmtpKeys(): array
    {
        $missing = [];
        foreach (['LLB_FEEDBACK_SMTP_HOST', 'LLB_FEEDBACK_SMTP_USER',
                  'LLB_FEEDBACK_SMTP_PASSWORD', 'LLB_FEEDBACK_TO', 'LLB_FEEDBACK_FROM'] as $key) {
            if (!isset($this->config[$key]) || $this->config[$key] === '') {
                $missing[] = $key;
            }
        }
        if (!isset($this->config['LLB_FEEDBACK_TO'])
            || filter_var($this->config['LLB_FEEDBACK_TO'], FILTER_VALIDATE_EMAIL) === false) {
            $missing[] = 'LLB_FEEDBACK_TO_INVALID';
        }
        if (!isset($this->config['LLB_FEEDBACK_FROM'])
            || filter_var($this->config['LLB_FEEDBACK_FROM'], FILTER_VALIDATE_EMAIL) === false) {
            $missing[] = 'LLB_FEEDBACK_FROM_INVALID';
        }
        return array_values(array_unique($missing));
    }

    private function pdoError(PDOException $error): string
    {
        $info = $error->errorInfo ?? [];
        return 'SQLSTATE=' . ($info[0] ?? (string) $error->getCode())
            . '; driver_code=' . ($info[1] ?? 'unknown');
    }

    private function safeLogDetail(string $detail): string
    {
        foreach ($this->config as $value) {
            if (is_string($value) && strlen($value) >= 2) {
                $detail = str_replace($value, '[redacted]', $detail);
            }
        }
        $detail = preg_replace('/[\r\n\t]+/', ' ', $detail) ?? '';
        return mb_substr(trim($detail), 0, 400, 'UTF-8');
    }

    /** The private phptmp directory is blocked from HTTP by .htaccess. */
    private function writeLog(string $area, string $event, string $detail = ''): void
    {
        $detail = $this->safeLogDetail($detail);
        $line = sprintf("[%s] %s %s%s\n", gmdate('Y-m-d\TH:i:s\Z'), $area, $event,
            $detail !== '' ? ' ' . $detail : '');
        $handle = @fopen($this->logFile, 'ab');
        if ($handle !== false) {
            if (flock($handle, LOCK_EX)) {
                fwrite($handle, $line);
                fflush($handle);
                flock($handle, LOCK_UN);
            }
            fclose($handle);
            @chmod($this->logFile, 0600);
            return;
        }
        error_log('llb feedback ' . rtrim($line));
    }

    public static function formToken(): string
    {
        self::startSession();
        $token = bin2hex(random_bytes(32));
        $_SESSION['llb_feedback_form'] = ['token' => $token, 'started' => time()];
        return $token;
    }

    /** @return array{status:int,body:array<string,string>} */
    public function submit(array $server, array $post): array
    {
        if (($server['REQUEST_METHOD'] ?? '') !== 'POST') {
            return ['status' => 405, 'body' => ['error' => 'method']];
        }
        if (!$this->databaseConfigured()) {
            $this->writeLog('mysql', 'configuration_incomplete',
                'missing=' . implode(',', $this->missingDatabaseKeys()));
            return ['status' => 503, 'body' => ['error' => 'unavailable']];
        }

        self::startSession();
        $form = $_SESSION['llb_feedback_form'] ?? null;
        unset($_SESSION['llb_feedback_form']);
        $token = (string) ($post['token'] ?? '');
        if (!is_array($form) || !hash_equals((string) ($form['token'] ?? ''), $token)) {
            return ['status' => 403, 'body' => ['error' => 'expired']];
        }
        if (time() - (int) ($form['started'] ?? 0) < self::MIN_FORM_SECONDS) {
            return ['status' => 400, 'body' => ['error' => 'too_fast']];
        }
        if (trim((string) ($post['website'] ?? '')) !== '') {
            return ['status' => 400, 'body' => ['error' => 'invalid']];
        }
        if (!$this->sameOrigin($server)) {
            return ['status' => 403, 'body' => ['error' => 'origin']];
        }

        $message = trim((string) ($post['message'] ?? ''));
        if ($message === '' || mb_strlen($message, 'UTF-8') > self::MAX_MESSAGE) {
            return ['status' => 422, 'body' => ['error' => 'message']];
        }
        $replyTo = trim((string) ($post['reply_email'] ?? ''));
        if (strlen($replyTo) > self::MAX_REPLY_TO
            || ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL) === false)
            || preg_match('/[\r\n]/', $replyTo)) {
            return ['status' => 422, 'body' => ['error' => 'email']];
        }

        $pageUrl = $this->pageUrl((string) ($post['page_url'] ?? ''));
        if ($pageUrl === null) {
            return ['status' => 422, 'body' => ['error' => 'context']];
        }
        $entityType = $this->cleanLine((string) ($post['entity_type'] ?? ''), 60);
        $entityId = $this->cleanLine((string) ($post['entity_id'] ?? ''), 80);
        $entityName = $this->cleanLine((string) ($post['entity_name'] ?? ''), 180);
        $viewport = $this->cleanLine((string) ($post['viewport'] ?? ''), 40);
        if ($viewport !== '' && !preg_match('/^\d{2,5}x\d{2,5}$/', $viewport)) {
            $viewport = '';
        }

        $ip = (string) ($server['REMOTE_ADDR'] ?? '');
        if (!$this->allowRate($ip)) {
            return ['status' => 429, 'body' => ['error' => 'limit']];
        }

        try {
            $feedbackId = $this->store(
                $message, $replyTo, $pageUrl, $entityType, $entityId, $entityName, $viewport, $server
            );
        } catch (PDOException $error) {
            $this->writeLog('mysql', 'insert_failed', $this->pdoError($error));
            return ['status' => 503, 'body' => ['error' => 'store']];
        }
        $this->writeLog('mysql', 'insert_ok');
        if (!$this->smtpConfigured()) {
            $this->writeLog('smtp', 'configuration_incomplete',
                'missing=' . implode(',', $this->missingSmtpKeys()));
            return ['status' => 200, 'body' => ['ok' => 'saved_mail_failed']];
        }
        try {
            $this->send($message, $replyTo, $pageUrl, $entityType, $entityId, $entityName, $viewport, $server);
            $this->writeLog('smtp', 'send_ok');
            $this->markNotified($feedbackId);
        } catch (MailException|\RuntimeException $error) {
            $this->writeLog('smtp', 'send_failed',
                get_class($error) . ': ' . $this->safeLogDetail($error->getMessage()));
            return ['status' => 200, 'body' => ['ok' => 'saved_mail_failed']];
        } catch (PDOException $error) {
            // The mail has already gone out and the feedback is durable. A
            // failed notification marker must not make the visitor resubmit.
            $this->writeLog('mysql', 'notification_marker_failed', $this->pdoError($error));
        }
        return ['status' => 200, 'body' => ['ok' => 'sent']];
    }

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
        session_name('llb_feedback');
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/', 'secure' => $secure,
            'httponly' => true, 'samesite' => 'Lax',
        ]);
        session_start();
    }

    private function sameOrigin(array $server): bool
    {
        $origin = (string) ($server['HTTP_ORIGIN'] ?? '');
        if ($origin === '') {
            return true;
        }
        $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
        $requestHost = strtolower(explode(':', (string) ($server['HTTP_HOST'] ?? $this->siteHost))[0]);
        return $host === $this->siteHost && $requestHost === $this->siteHost;
    }

    private function pageUrl(string $value): ?string
    {
        if (strlen($value) > 2048 || preg_match('/[\r\n]/', $value)) {
            return null;
        }
        $parts = parse_url($value);
        if (!is_array($parts) || strtolower((string) ($parts['scheme'] ?? '')) !== 'https'
            || strtolower((string) ($parts['host'] ?? '')) !== $this->siteHost
            || isset($parts['user']) || isset($parts['pass'])) {
            return null;
        }
        $path = (string) ($parts['path'] ?? '/');
        if (!str_starts_with($path, '/')) {
            return null;
        }
        return 'https://' . $this->siteHost . $path
            . (isset($parts['query']) ? '?' . $parts['query'] : '')
            . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '');
    }

    private function cleanLine(string $value, int $max): string
    {
        $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
        return mb_substr(trim($value), 0, $max, 'UTF-8');
    }

    private function database(): PDO
    {
        $host = $this->config['LLB_FEEDBACK_DB_HOST'];
        $port = (int) ($this->config['LLB_FEEDBACK_DB_PORT'] ?? 3306);
        $name = $this->config['LLB_FEEDBACK_DB_NAME'];
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name);
        return new PDO($dsn, $this->config['LLB_FEEDBACK_DB_USER'],
            $this->config['LLB_FEEDBACK_DB_PASSWORD'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
    }

    private function store(
        string $message,
        string $replyTo,
        string $pageUrl,
        string $entityType,
        string $entityId,
        string $entityName,
        string $viewport,
        array $server,
    ): int {
        $pdo = $this->database();
        $sql = 'INSERT INTO llb_feedback '
            . '(created_at_utc, entity_type, entity_id, entity_name, page_url, message, reply_email, user_agent, viewport) '
            . 'VALUES (:created, :type, :id, :name, :url, :message, :email, :agent, :viewport)';
        $statement = $pdo->prepare($sql);
        $statement->execute([
            ':created' => gmdate('Y-m-d H:i:s'),
            ':type' => $entityType,
            ':id' => $entityId,
            ':name' => $entityName,
            ':url' => $pageUrl,
            ':message' => $message,
            ':email' => $replyTo,
            ':agent' => $this->cleanLine((string) ($server['HTTP_USER_AGENT'] ?? ''), 512),
            ':viewport' => $viewport,
        ]);
        return (int) $pdo->lastInsertId();
    }

    private function markNotified(int $id): void
    {
        $statement = $this->database()->prepare(
            'UPDATE llb_feedback SET email_notified = 1 WHERE id = :id'
        );
        $statement->execute([':id' => $id]);
    }

    private function allowRate(string $ip): bool
    {
        if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP)) {
            return false;
        }
        $directory = dirname($this->rateFile);
        if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
            return false;
        }
        $handle = @fopen($this->rateFile, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            if (is_resource($handle)) {
                fclose($handle);
            }
            return false;
        }
        try {
            rewind($handle);
            $raw = stream_get_contents($handle);
            $state = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
            $state = is_array($state) ? $state : [];
            $now = time();
            foreach ($state as $key => $timestamps) {
                $timestamps = is_array($timestamps) ? $timestamps : [];
                $state[$key] = array_values(array_filter(
                    $timestamps,
                    static fn ($stamp): bool => is_int($stamp) && $now - $stamp < self::RATE_WINDOW
                ));
                if ($state[$key] === []) {
                    unset($state[$key]);
                }
            }
            $key = hash_hmac('sha256', $ip, $this->config['LLB_FEEDBACK_RATE_KEY']);
            $hits = $state[$key] ?? [];
            if (count($hits) >= self::RATE_LIMIT) {
                return false;
            }
            $hits[] = $now;
            $state[$key] = $hits;
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, (string) json_encode($state));
            fflush($handle);
            @chmod($this->rateFile, 0600);
            return true;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    private function send(
        string $message,
        string $replyTo,
        string $pageUrl,
        string $entityType,
        string $entityId,
        string $entityName,
        string $viewport,
        array $server,
    ): void {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = $this->config['LLB_FEEDBACK_SMTP_HOST'];
        $mailer->Port = (int) ($this->config['LLB_FEEDBACK_SMTP_PORT'] ?? 587);
        $mailer->SMTPAuth = true;
        $mailer->Username = $this->config['LLB_FEEDBACK_SMTP_USER'];
        $mailer->Password = $this->config['LLB_FEEDBACK_SMTP_PASSWORD'];
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->Timeout = 15;
        $mailer->SMTPDebug = SMTP::DEBUG_OFF;
        $mailer->CharSet = PHPMailer::CHARSET_UTF8;
        $mailer->setFrom($this->config['LLB_FEEDBACK_FROM'], 'LOTRO Log Book Feedback');
        $mailer->addAddress($this->config['LLB_FEEDBACK_TO']);
        if ($replyTo !== '') {
            $mailer->addReplyTo($replyTo);
        }
        $mailer->isHTML(false);
        $mailer->Subject = 'LOTRO Log Book feedback';
        $userAgent = $this->cleanLine((string) ($server['HTTP_USER_AGENT'] ?? 'unknown'), 512);
        $lines = [
            'Feedback:',
            $message,
            '',
            'Page: ' . $pageUrl,
            'Entity type: ' . ($entityType !== '' ? $entityType : '—'),
            'Entity ID: ' . ($entityId !== '' ? $entityId : '—'),
            'Entity name: ' . ($entityName !== '' ? $entityName : '—'),
            'Received (UTC): ' . gmdate('Y-m-d H:i:s'),
            'Browser/device (User-Agent): ' . ($userAgent !== '' ? $userAgent : '—'),
            'Viewport: ' . ($viewport !== '' ? $viewport : '—'),
        ];
        $mailer->Body = implode("\n", $lines);
        $mailer->send();
    }
}
