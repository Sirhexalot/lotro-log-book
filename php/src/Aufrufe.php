<?php

declare(strict_types=1);

namespace Llb;

/**
 * Monthly page views per entity.
 *
 * One row per (month, kind, id). The same entity is one entry in three
 * languages, so the count is language-independent. Only the aggregate exists:
 * no address, no cookie, no individual visit, no history.
 *
 * The table is created by hand (`deploy/aufrufe-schema.sql`); this class never
 * runs DDL. Every database failure stays silent: a page must render even when
 * the database is unreachable or the table is still missing.
 */
final class Aufrufe
{
    private ?\PDO $pdo = null;

    public function __construct(private string $envFile)
    {
    }

    /**
     * Count one view. Called after the response is sent; nothing in here may
     * reach the page, so a missing table, a dead connection or a locked row is
     * simply not counted.
     */
    public function zaehle(string $art, string $kennung, array $server, ?string $monat = null): void
    {
        if (!self::zaehlbar($art, $kennung, $server)) {
            return;
        }
        try {
            $statement = $this->database()->prepare(
                'INSERT INTO llb_aufrufe (monat, art, kennung, zahl) '
                . 'VALUES (:monat, :art, :kennung, 1) '
                . 'ON DUPLICATE KEY UPDATE zahl = zahl + 1');
            $statement->execute([
                ':monat' => $monat ?? self::monat(),
                ':art' => $art,
                ':kennung' => $kennung,
            ]);
        } catch (\Throwable) {
            // Drop the connection: the next view tries again. No log line per
            // view, because that would be noise, not information.
            $this->pdo = null;
        }
    }

    /**
     * Whether the database answers at all. The daily report needs to tell
     * "no views yet" from "the counter is unreachable"; both would otherwise
     * look like an empty list.
     */
    public function verbunden(): bool
    {
        try {
            $this->database()->query('SELECT 1');
            return true;
        } catch (\Throwable) {
            $this->pdo = null;
            return false;
        }
    }

    /** Views of one entity in one month; 0 when nothing is recorded. */
    public function zahl(string $art, string $kennung, ?string $monat = null): int
    {
        try {
            $statement = $this->database()->prepare(
                'SELECT zahl FROM llb_aufrufe '
                . 'WHERE monat = :monat AND art = :art AND kennung = :kennung');
            $statement->execute([
                ':monat' => $monat ?? self::monat(),
                ':art' => $art,
                ':kennung' => $kennung,
            ]);
            $wert = $statement->fetchColumn();
            return $wert === false ? 0 : (int) $wert;
        } catch (\Throwable) {
            $this->pdo = null;
            return 0;
        }
    }

    /**
     * The most-viewed entities of one month, biggest first.
     *
     * Returned as [{art, kennung, zahl}]; names and links are the caller's job,
     * because they depend on the visitor's language.
     */
    public function spitze(int $anzahl = 10, ?string $monat = null): array
    {
        $anzahl = max(1, min(100, $anzahl));
        try {
            $statement = $this->database()->prepare(
                'SELECT art, kennung, zahl FROM llb_aufrufe WHERE monat = :monat '
                . 'ORDER BY zahl DESC, art, kennung LIMIT ' . $anzahl);
            $statement->execute([':monat' => $monat ?? self::monat()]);
            return array_map(static fn (array $row): array => [
                'art' => (string) $row['art'],
                'kennung' => (string) $row['kennung'],
                'zahl' => (int) $row['zahl'],
            ], $statement->fetchAll());
        } catch (\Throwable) {
            $this->pdo = null;
            return [];
        }
    }

    public static function monat(?int $zeit = null): string
    {
        return gmdate('Y-m', $zeit ?? time());
    }

    /**
     * Only a real page view counts: no crawler, no prefetch or prerender, no
     * request without a browser string. The kind and the id are checked, so a
     * stray call cannot write arbitrary keys.
     */
    public static function zaehlbar(string $art, string $kennung, array $server): bool
    {
        if (!preg_match('/^[a-z]{1,12}$/', $art)) {
            return false;
        }
        if (!preg_match('/^[A-Za-z0-9:_-]{1,32}$/', $kennung)) {
            return false;
        }
        $agent = (string) ($server['HTTP_USER_AGENT'] ?? '');
        if ($agent === '') {
            return false;
        }
        $zweck = strtolower((string) ($server['HTTP_SEC_PURPOSE'] ?? $server['HTTP_PURPOSE'] ?? ''));
        if (str_contains($zweck, 'prefetch') || str_contains($zweck, 'prerender')) {
            return false;
        }
        // Without the bot list nothing can be trusted: fail closed rather than
        // count every crawler as a reader.
        if (!class_exists(\Jaybizzle\CrawlerDetect\CrawlerDetect::class)) {
            return false;
        }
        if ((new \Jaybizzle\CrawlerDetect\CrawlerDetect())->isCrawler($agent)) {
            return false;
        }
        return true;
    }

    private function database(): \PDO
    {
        if ($this->pdo instanceof \PDO) {
            return $this->pdo;
        }
        // Same file and keys as the feedback form: one place for the database
        // access data. A checkout without that file keeps the counter quiet.
        $values = Feedback::readEnv($this->envFile);
        $host = (string) ($values['LLB_FEEDBACK_DB_HOST'] ?? '');
        $name = (string) ($values['LLB_FEEDBACK_DB_NAME'] ?? '');
        $user = (string) ($values['LLB_FEEDBACK_DB_USER'] ?? '');
        if ($host === '' || $name === '' || $user === '') {
            throw new \RuntimeException('Datenbank nicht konfiguriert');
        }
        $this->pdo = new \PDO(
            sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $host, (int) ($values['LLB_FEEDBACK_DB_PORT'] ?? 3306), $name),
            $user,
            (string) ($values['LLB_FEEDBACK_DB_PASSWORD'] ?? ''),
            [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_EMULATE_PREPARES => false,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                // A page must not hang on an unreachable database.
                \PDO::ATTR_TIMEOUT => 2,
            ],
        );
        return $this->pdo;
    }
}
