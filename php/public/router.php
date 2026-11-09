<?php

declare(strict_types=1);

/**
 * Router for `php -S`, so the local preview behaves like the host.
 *
 * Real files (CSS, JS, images, data) are served directly; everything else goes
 * through the front controller, which keeps the same 301/404 rules as Apache.
 */
$root = dirname(__DIR__, 2);
$webRoot = getenv('LLB_WEB') ?: $root . '/web';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// Apache serves the map application at "/" through its directory index.
if ($path === '/') {
    $index = $webRoot . '/index.html';
    if (is_file($index)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($index);
        return true;
    }
}

$file = realpath($webRoot . $path);
if ($file !== false && is_file($file) && str_starts_with($file, realpath($webRoot))) {
    return false;
}

require __DIR__ . '/index.php';
