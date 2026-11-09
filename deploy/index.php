<?php

declare(strict_types=1);

/**
 * Entry point of the published site.
 *
 * The release lays the application next to this file (php/, phpdata/, vendor/),
 * and the static files (CSS, scripts, images) live here too. The front
 * controller does the rest; this file only names the two roots.
 */

define('LLB_ROOT', __DIR__);
define('LLB_WEB_ROOT', __DIR__);
// Twig keeps compiled templates instead of checking them on every request.
putenv('LLB_PRODUCTION=1');

require __DIR__ . '/php/public/index.php';
