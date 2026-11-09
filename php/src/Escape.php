<?php

declare(strict_types=1);

namespace Llb;

/**
 * Escapes text exactly like the static generator (Python `html.escape`).
 *
 * Byte-identical output makes the migration verifiable: the PHP page and the
 * page it replaces can be compared directly instead of by eye.
 */
function esc(string $text): string
{
    return strtr($text, [
        '&' => '&amp;',
        '<' => '&lt;',
        '>' => '&gt;',
        '"' => '&quot;',
        "'" => '&#x27;',
    ]);
}

/** Builds an anchor; attributes are escaped like the generator's helper. */
function link_tag(string $url, string $text, array $attributes = []): string
{
    $extra = '';
    foreach ($attributes as $name => $value) {
        $extra .= ' ' . str_replace('_', '-', $name) . '="' . esc((string) $value) . '"';
    }
    return '<a href="' . esc($url) . '"' . $extra . '>' . esc($text) . '</a>';
}
