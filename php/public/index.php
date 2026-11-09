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
use Llb\Page;
use Llb\Router;
use Llb\Shell;
use Llb\View;

$root = dirname(__DIR__, 2);
// iCloud evicts files in the repository; the local checkouts keep vendor/ out
// of it. A release bundle carries its own vendor/ next to this file.
$vendor = getenv('LLB_VENDOR') ?: $root . '/vendor';
require $vendor . '/autoload.php';

$dataDir = getenv('LLB_DATA') ?: $root . '/phpdata';
$webRoot = getenv('LLB_WEB') ?: $root . '/web';
$base = getenv('LLB_BASE') ?: 'https://llb.sirhexalot.de';
$cacheDir = getenv('LLB_CACHE') ?: $root . '/phptmp/twig';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}

$catalogue = new Catalogue($dataDir . '/labels.json', $base);
$data = new Data($dataDir);
$router = new Router($catalogue, $data);
$view = new View($root . '/php/templates', is_writable($cacheDir) ? $cacheDir : null);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$result = $router->resolve($path);

if ($result['status'] === 301) {
    header('Location: ' . $result['redirect'], true, 301);
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

$lang = explode('/', trim($path, '/'))[0];
$shell = new Shell($catalogue, $data, $webRoot, $lang);
$page = new Page($catalogue, $data, $shell, $view, $lang);
$html = $page->render($result['kind'], $result['id']);

if ($html === null) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    readfile($webRoot . '/404.html');
    return;
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
echo $html;
