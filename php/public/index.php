<?php

declare(strict_types=1);

/**
 * Front controller of the catalogue site.
 *
 * Every public page goes through here: one small PHP entry, shared Twig
 * templates, prepared data shards. Nothing is written and no session is used.
 */

use Llb\Catalogue;
use Llb\Data;
use Llb\Sprache;
use Llb\Page;
use Llb\Router;
use Llb\Shell;
use Llb\Sitemap;
use Llb\View;

// A release lays the app into the web root; the local checkout keeps it one
// level above. Both define the root before this file runs.
$root = getenv('LLB_ROOT') ?: (defined('LLB_ROOT') ? LLB_ROOT : dirname(__DIR__, 2));

// A failing page must never look like a successful one.
set_exception_handler(static function (Throwable $fehler): void {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    error_log('llb: ' . $fehler->getMessage() . ' @ ' . $fehler->getFile() . ':' . $fehler->getLine());
    echo 'Interner Fehler';
});
register_shutdown_function(static function (): void {
    $fehler = error_get_last();
    if ($fehler !== null && in_array($fehler['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)
        && !headers_sent()) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Interner Fehler';
    }
});
// iCloud evicts files in the repository; the local checkouts keep vendor/ out
// of it. A release bundle carries its own vendor/ next to this file.
$vendor = getenv('LLB_VENDOR') ?: $root . '/vendor';
require $vendor . '/autoload.php';

$dataDir = getenv('LLB_DATA') ?: $root . '/phpdata';
$webRoot = getenv('LLB_WEB')
    ?: (defined('LLB_WEB_ROOT') ? LLB_WEB_ROOT : $root . '/web');
$base = getenv('LLB_BASE') ?: 'https://llb.sirhexalot.de';
$cacheDir = getenv('LLB_CACHE') ?: $root . '/phptmp/twig';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}

$catalogue = new Catalogue($dataDir . '/labels.json', $base);
$data = new Data($dataDir);
// Addresses without a language (root, old flat files) follow the visitor:
// chosen language, then the browser's list, then English.
$sprache = Sprache::ausRequest($_COOKIE, (string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''));
header('Vary: Accept-Language');
$router = new Router($catalogue, $data, $sprache);
$view = new View($root . '/php/templates', is_writable($cacheDir) ? $cacheDir : null);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if ($path === '/api/statistik') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    $input = json_decode((string) file_get_contents('php://input'), true);
    $input = is_array($input) ? $input : [];
    $statsFile = getenv('LLB_STATS_FILE') ?: $root . '/phptmp/statistik.json';
    $statistics = new \Llb\Statistics($statsFile);
    $action = (string) ($input['action'] ?? 'current');
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('llb_statistik');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
    $visitor = 'v3-' . session_id();
    session_write_close();
    $result = $action === 'heartbeat'
        ? $statistics->heartbeat($visitor)
        : ($action === 'import'
            ? $statistics->import((string) ($input['event'] ?? ''))
            : $statistics->current());
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    return;
}

// Old application addresses keep working: one 301 to the language path.
if (preg_match('~^/(start(-(en|fr))?|index|gegenstaende|handwerk|reise|ruf|belohnungen|spielstand|companion|plugin|suche|gegenstand)\.html$~', $path)) {
    $ziel = $router->legacyTarget($path, $_GET);
    if ($ziel !== null) {
        // An explicit ?lang= is permanent; a detected language is not, because
        // the same address answers differently for another browser.
        $code = isset($_GET['lang']) ? 301 : 302;
        header('Location: ' . $ziel, true, $code);
        header('X-Robots-Tag: noindex');
        return;
    }
}
// The reward browser lists items only. Old shared links that opened its title
// or virtue tab keep working and land on that catalogue list instead.
// A language in the path wins over the visitor's detected language.
$pfadsprache = preg_match('~^/(de|en|fr)(/|$)~', $path, $treffer) ? $treffer[1] : $sprache;
if (rtrim($path, '/') === rtrim($catalogue->appRoute($pfadsprache, 'belohnungen'), '/')) {
    $ziel = $catalogue->rewardTabTarget($pfadsprache, $_GET);
    if ($ziel !== null) {
        header('Location: ' . $ziel, true, 301);
        header('X-Robots-Tag: noindex');
        return;
    }
}

$result = $router->resolve($path);

if ($result['status'] === 301 || $result['status'] === 302) {
    $code = $result['status'] === 301 ? 301 : 302;
    header('Location: ' . $result['redirect'], true, $code);
    header('X-Robots-Tag: noindex');
    return;
}

if ($result['status'] === 404) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    $file = $webRoot . '/404.html';
    if (is_file($file)) {
        readfile($file);
        return;
    }
    echo '<!doctype html><meta charset="utf-8"><title>404</title><h1>404</h1>';
    return;
}

if (isset($result['sitemap'])) {
    $sitemaps = new Sitemap($dataDir, $base);
    $xml = $result['sitemap'] === '/sitemap.xml'
        ? $sitemaps->index()
        : $sitemaps->section($result['sitemap']);
    if ($xml === null) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Unbekannte Sitemap';
        return;
    }
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    echo $xml;
    return;
}

$lang = explode('/', trim($path, '/'))[0];
$shell = new Shell($catalogue, $data, $webRoot, $lang);
$page = new Page($catalogue, $data, $shell, $view, $lang);
$html = match (true) {
    isset($result['app']) => $page->renderApp($result['lang'], $result['app']),
    isset($result['list']) => $page->renderList($result['list']),
    default => $page->render($result['kind'], $result['id']),
};

if ($html === null) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    readfile($webRoot . '/404.html');
    return;
}

header('Content-Type: text/html; charset=utf-8');
// Revalidate on every navigation: a page cached for minutes kept showing
// a half-written upload long after the data was there.
header('Cache-Control: public, max-age=0, must-revalidate');
echo $html;
