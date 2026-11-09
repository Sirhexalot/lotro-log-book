<?php
/* Catalogue IDs are stored in uppercase. A hand-typed or shared lowercase link
 * would otherwise end on the error page, so the basic .htaccess redirects send
 * only IDs containing a lowercase letter here (Apache cannot change case).
 *
 * This script never renders content: it answers 301 to the one public address
 * when the stored file exists, and the real 404 page otherwise. The host does
 * not load mod_speling, which is why this small fallback exists at all.
 */

declare(strict_types=1);

$segmente = [
    'de' => ['aufgabe', 'tat', 'gegenstand', 'gebiet', 'region', 'beruf', 'rezept', 'handwerk', 'katalog',
             'titel', 'tugend'],
    'en' => ['quest', 'deed', 'item', 'area', 'region', 'profession', 'recipe', 'crafting', 'catalogue',
             'title', 'virtue'],
    'fr' => ['quete', 'prouesse', 'objet', 'zone', 'region', 'metier', 'recette', 'artisanat', 'catalogue',
             'titre', 'vertu'],
];

function fehlerseite(): void
{
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    $datei = __DIR__ . '/404.html';
    if (is_readable($datei)) {
        readfile($datei);
        return;
    }
    echo '<!doctype html><meta charset="utf-8"><title>404</title><h1>404</title>';
}

$pfad = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (!preg_match('~^/([a-z]{2})/([a-z]+)/([0-9A-Za-z_]{1,32})/?$~', $pfad, $treffer)) {
    fehlerseite();
    exit;
}

[, $sprache, $art, $kennung] = $treffer;
if (!isset($segmente[$sprache]) || !in_array($art, $segmente[$sprache], true)) {
    fehlerseite();
    exit;
}

/* Catalogue keys are hexadecimal; professions are uppercase words. Anything else
 * is not an ID and gets the error page instead of a guessed redirect. */
$gross = strtoupper($kennung);
$ist_kennung = preg_match('~^([0-9A-F]{8}|[A-Z][A-Z_]{1,20})$~', $gross) === 1;
if (!$ist_kennung || !is_file(__DIR__ . '/' . $sprache . '/' . $art . '/' . $gross . '.html')) {
    fehlerseite();
    exit;
}

header('Location: /' . $sprache . '/' . $art . '/' . $gross . '/', true, 301);
header('X-Robots-Tag: noindex');
