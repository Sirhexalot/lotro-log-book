<?php

declare(strict_types=1);

/**
 * Daily report: the ten most-viewed entities of the month.
 *
 * Run by the host's cron manager (konsoleH → Cronjob-Manager):
 *
 *   /usr/bin/php /usr/www/users/<konto>/public_html/mm/php/cron/report.php
 *
 * Flags for a manual run: `--trocken` prints the mail instead of sending it,
 * `--monat=2026-11` reads another month, `--anzahl=25` another length.
 *
 * The mail goes to LLB_REPORT_TO (default llb@sirhexalot.de) over the same
 * SMTP account as the feedback form. Every run appends one line to
 * phptmp/llb-report.log; no visitor data is involved.
 */

use Llb\Aufrufe;
use Llb\Catalogue;
use Llb\Data;
use Llb\Feedback;
use PHPMailer\PHPMailer\PHPMailer;

// Only the shell may run this. `.htaccess` already blocks /php, but a request
// must never be able to trigger a mail.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$root = getenv('LLB_ROOT') ?: dirname(__DIR__, 2);
require $root . '/vendor/autoload.php';

$optionen = ['trocken' => false, 'html' => false, 'monat' => null, 'anzahl' => 10];
foreach (array_slice($argv ?? [], 1) as $argument) {
    if ($argument === '--trocken') {
        $optionen['trocken'] = true;
    } elseif ($argument === '--html') {
        $optionen['html'] = true;
    } elseif (str_starts_with($argument, '--monat=')) {
        $optionen['monat'] = substr($argument, 8);
    } elseif (str_starts_with($argument, '--anzahl=')) {
        $optionen['anzahl'] = max(1, min(50, (int) substr($argument, 9)));
    } else {
        fwrite(STDERR, 'Unbekannte Option: ' . $argument . PHP_EOL);
        exit(2);
    }
}
$monat = $optionen['monat'] ?? Aufrufe::monat();
if (!preg_match('/^\d{4}-(?:0[1-9]|1[0-2])$/', $monat)) {
    fwrite(STDERR, 'Ungültiger Monat: ' . $monat . PHP_EOL);
    exit(2);
}

$envFile = getenv('LLB_FEEDBACK_ENV') ?: $root . '/phptmp/llb-feedback.env';
if (!is_file($envFile)) {
    protokoll($root, $monat, 'Zugangsdatei fehlt: ' . $envFile);
    fwrite(STDERR, 'MISSING: ' . $envFile . PHP_EOL);
    exit(1);
}

$daten = new Data(getenv('LLB_DATA') ?: $root . '/phpdata');
$katalog = new Catalogue($root . '/phpdata/labels.json', 'https://llb.sirhexalot.de');
$aufrufe = new Aufrufe($envFile);

/** One [key, label] per language, from the entity's own name. */
function namen(Data $daten, string $art, string $kennung): array
{
    $namen = [];
    foreach (Catalogue::LANGS as $lang) {
        $name = '';
        if ($art === 'instance') {
            $name = (string) ($daten->instanceDetail($lang, $kennung)['name'] ?? '');
        } else {
            $seite = $daten->page($lang, $art, $kennung);
            $name = (string) ($seite['name'] ?? '');
            if ($name === '') {
                $satz = $daten->entity($lang, $art, $kennung);
                $name = (string) ($satz['n'] ?? $satz['name'] ?? '');
            }
        }
        $namen[$lang] = $name;
    }
    return $namen;
}

function verweis(Catalogue $katalog, string $lang, string $art, string $kennung): string
{
    try {
        return 'https://llb.sirhexalot.de' . $katalog->route($lang, $art, $kennung);
    } catch (\Throwable) {
        return '';
    }
}

/** German type name from the public URL segment, e.g. 'q' -> 'Aufgabe'. */
function artname(Catalogue $katalog, string $art): string
{
    try {
        return strtr(ucfirst($katalog->segment('de', $art)), ['Haendler' => 'Händler']);
    } catch (\Throwable) {
        return $art;
    }
}

function protokoll(string $root, string $monat, string $zeile): void
{
    $verzeichnis = $root . '/phptmp';
    if (!is_dir($verzeichnis)) {
        @mkdir($verzeichnis, 0775, true);
    }
    @file_put_contents($verzeichnis . '/llb-report.log',
        gmdate('Y-m-d H:i:s') . ' UTC · ' . $monat . ' · ' . $zeile . PHP_EOL,
        FILE_APPEND | LOCK_EX);
}

$MONATE = [1 => 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
    'August', 'September', 'Oktober', 'November', 'Dezember'];
[$jahr, $monatszahl] = array_map('intval', explode('-', $monat));
$monatsname = $MONATE[$monatszahl] . ' ' . $jahr;

if (!$aufrufe->verbunden()) {
    protokoll($root, $monat, 'Datenbank nicht erreichbar');
    echo 'Datenbank nicht erreichbar – keine Auswertung.' . PHP_EOL;
    exit(1);
}

$spitze = $aufrufe->spitze($optionen['anzahl'], $monat);
$zeilen = [];
$summe = 0;
foreach ($spitze as $eintrag) {
    $art = $eintrag['art'];
    $kennung = $eintrag['kennung'];
    $summe += $eintrag['zahl'];
    $zeilen[] = [
        'zahl' => $eintrag['zahl'],
        'art' => $art,
        'kennung' => $kennung,
        'namen' => namen($daten, $art, $kennung),
        'links' => [
            'de' => verweis($katalog, 'de', $art, $kennung),
            'en' => verweis($katalog, 'en', $art, $kennung),
            'fr' => verweis($katalog, 'fr', $art, $kennung),
        ],
    ];
}

$betreff = 'LOTRO Log Book · Top ' . count($zeilen) . ' im ' . $monatsname;
// The list's own sum is not the month: the ten busiest entities leave out
// every entity with one or two views. Say both, so nobody reads 31 as the total.
$monatlich = $aufrufe->uebersicht($monat);
$einleitung = $zeilen === []
    ? 'Im ' . $monatsname . ' wurde noch keine Entität aufgerufen.'
    : 'Die meistgeöffneten Entitäten im ' . $monatsname . '. Die '
        . count($zeilen) . ' Zeilen kommen auf ' . $summe . ' Aufrufe; im ganzen '
        . 'Monat sind es ' . $monatlich['zahl'] . ' Aufrufe auf '
        . $monatlich['eintraege'] . ' Entitäten:';

$html = '<p>' . htmlspecialchars($einleitung, ENT_QUOTES) . '</p>';
if ($zeilen !== []) {
    $html .= '<table cellpadding="6" cellspacing="0" border="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">'
        . '<tr style="background:#eee;text-align:left">'
        . '<th>Anzahl</th><th>Typ</th><th>Name</th><th>DE</th><th>EN</th><th>FR</th></tr>';
    foreach ($zeilen as $zeile) {
        // A row whose entity no longer exists keeps its id instead of a name.
        $name = htmlspecialchars($zeile['namen']['de'] ?: $zeile['kennung'], ENT_QUOTES);
        $zellen = ['<b>' . $zeile['zahl'] . '</b>',
            htmlspecialchars(artname($katalog, $zeile['art']), ENT_QUOTES), $name];
        foreach (['de', 'en', 'fr'] as $sprache) {
            $url = $zeile['links'][$sprache];
            $zellen[] = $url === '' ? '—'
                : '<a href="' . htmlspecialchars($url, ENT_QUOTES) . '">'
                    . strtoupper($sprache) . '</a>';
        }
        $html .= '<tr style="border-top:1px solid #ddd">'
            . implode('', array_map(static fn (string $z): string => '<td>' . $z . '</td>', $zellen))
            . '</tr>';
    }
    $html .= '</table>';
}
$html .= '<p style="color:#666;font-size:12px">Sprachübergreifend gezählt: /de, /en und /fr einer '
    . 'Entität landen in derselben Zeile. Bots und Vorabladen zählen nicht.</p>';

$text = $einleitung . "\n\n";
foreach ($zeilen as $nummer => $zeile) {
    $text .= sprintf("%2d. %5d  %-13s %s\n", $nummer + 1, $zeile['zahl'],
        artname($katalog, $zeile['art']),
        $zeile['namen']['de'] ?: $zeile['kennung']) . '          '
        . implode(' ', array_filter([$zeile['links']['de'], $zeile['links']['en'], $zeile['links']['fr']]))
        . "\n";
}

if ($optionen['trocken']) {
    if ($optionen['html']) {
        echo $html . PHP_EOL;
        exit(0);
    }
    echo 'BETREFF: ' . $betreff . PHP_EOL . PHP_EOL . $text . PHP_EOL;
    echo 'HTML: ' . strlen($html) . ' Bytes' . PHP_EOL;
    exit(0);
}

$werte = Feedback::readEnv($envFile);
$empfaenger = getenv('LLB_REPORT_TO') ?: 'llb@sirhexalot.de';
$absender = (string) ($werte['LLB_FEEDBACK_FROM'] ?? $werte['LLB_FEEDBACK_SMTP_USER'] ?? '');
try {
    if ($absender === '' || empty($werte['LLB_FEEDBACK_SMTP_HOST'])) {
        throw new RuntimeException('SMTP ist nicht konfiguriert');
    }
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = $werte['LLB_FEEDBACK_SMTP_HOST'];
    $mailer->Port = (int) ($werte['LLB_FEEDBACK_SMTP_PORT'] ?? 587);
    $mailer->SMTPAuth = true;
    $mailer->Username = $werte['LLB_FEEDBACK_SMTP_USER'];
    $mailer->Password = $werte['LLB_FEEDBACK_SMTP_PASSWORD'];
    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mailer->Timeout = 20;
    $mailer->SMTPDebug = 0;
    $mailer->CharSet = PHPMailer::CHARSET_UTF8;
    $mailer->setFrom($absender, 'LOTRO Log Book');
    $mailer->addAddress($empfaenger);
    $mailer->Subject = $betreff;
    $mailer->isHTML(true);
    $mailer->Body = $html;
    $mailer->AltBody = $text;
    $mailer->send();
} catch (\Throwable $fehler) {
    protokoll($root, $monat, 'Versand fehlgeschlagen: ' . $fehler->getMessage());
    fwrite(STDERR, 'Versand fehlgeschlagen: ' . $fehler->getMessage() . PHP_EOL);
    exit(1);
}

protokoll($root, $monat, count($zeilen) . ' Zeilen, ' . $summe . ' Aufrufe darin, '
    . $monatlich['zahl'] . ' Aufrufe im Monat, gesendet an ' . $empfaenger);
echo 'Gesendet an ' . $empfaenger . ': ' . count($zeilen) . ' Zeilen, ' . $summe
    . ' Aufrufe darin, ' . $monatlich['zahl'] . ' Aufrufe im Monat.' . PHP_EOL;
