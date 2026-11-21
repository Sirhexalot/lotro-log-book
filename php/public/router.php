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

// Generated terrain stays outside the checkout during local development.
// A release carries the same files under its public gelaende/ directory.
if (preg_match('~^/gelaende/(manifest\.json|[a-f0-9]{12}/r[0-9]+/[0-8]/[0-9]+_[0-9]+\.webp|[a-f0-9]{12}/thumb/[0-9]+\.webp)$~', $path, $terrain)) {
    $terrainRoot = getenv('LLB_TERRAIN') ?: (getenv('HOME') . '/.cache/llb-terrain/public');
    $file = $terrainRoot . '/' . $terrain[1];
    if (is_file($file)) {
        header('Content-Type: ' . (str_ends_with($file, '.json') ? 'application/json' : 'image/webp'));
        header('Cache-Control: ' . (str_ends_with($file, '.json') ? 'no-cache' : 'public, max-age=31536000, immutable'));
        readfile($file);
        return true;
    }
}

// Cropped interior previews are generated outside the checkout; release serves
// the same paths directly.
if (preg_match('~^/karten/instanzen/([0-9]+-crop-v1\.png)$~', $path, $interior)) {
    $file = getenv('HOME') . '/.cache/llb-instance-map-preview/' . $interior[1];
    if (is_file($file)) {
        header('Content-Type: image/png');
        header('Cache-Control: no-cache');
        readfile($file);
        return true;
    }
}

// Generated chest icons are outside the checkout in the local preview.
if (preg_match('~^/bild/items/([0-9]+\.webp)$~', $path, $icon) && !is_file($webRoot . $path)) {
    $file = getenv('HOME') . '/.cache/llb-instance-icons/' . $icon[1];
    if (is_file($file)) {
        header('Content-Type: image/webp');
        readfile($file);
        return true;
    }
}

// Apache serves the map application at "/" through its directory index.
if ($path === '/') {
    $index = $webRoot . '/index.html';
    if (is_file($index)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($index);
        return true;
    }
}

// Application pages are rendered by PHP now; their old .html files must not
// be served as files, so a bookmark still lands on the 301.
$alt = '~^/(start(-(en|fr))?|index|gegenstaende|handwerk|reise|ruf|belohnungen|spielstand|companion|plugin|suche|gegenstand)\.html$~';
if (preg_match($alt, $path)) {
    require __DIR__ . '/index.php';
    return true;
}

// A release copies the map images to karten/<lang>/. A local checkout keeps
// only webp/<lang>/, so the preview would show an empty frame. Serve the same
// URL from webp/ here; the host needs no such rule.
if (preg_match('~^/karten/([a-z]{2})/([A-Za-z0-9._-]+)$~', $path, $karte)) {
    $bild = $root . '/webp/' . $karte[1] . '/' . $karte[2];
    if (is_file($bild)) {
        header('Content-Type: image/webp');
        header('Content-Length: ' . filesize($bild));
        readfile($bild);
        return true;
    }
}

// The preview folder carries symlinks into the repository (and to the maps),
// so the resolved path is not inside the root. A path without ".." is enough
// here: this router only ever runs on the developer machine.
if (!str_contains($path, '..') && is_file($webRoot . $path)) {
    return false;
}

require __DIR__ . '/index.php';
