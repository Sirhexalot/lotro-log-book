<?php

declare(strict_types=1);

namespace Llb;

/**
 * Sitemaps rendered from the same URL set the router serves.
 *
 * Nothing here invents addresses: the build writes one list per sitemap file,
 * and this class turns a list into XML. A URL that has no page cannot end up
 * in a sitemap, because both come from the same prepared data.
 */
final class Sitemap
{
    private const NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

    private array $data;

    public function __construct(private string $root, private string $base)
    {
        $file = $root . '/sitemaps.json';
        $json = is_file($file) ? (string) file_get_contents($file) : '{}';
        $this->data = json_decode($json, true) ?: [];
    }

    /** The stable index that search engines read first. */
    public function index(): ?string
    {
        $names = $this->data['index'] ?? [];
        if ($names === []) {
            return null;
        }
        $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<sitemapindex xmlns="' . self::NAMESPACE . '">';
        foreach ($names as $name) {
            $out .= '<sitemap><loc>' . esc($this->base . $name) . '</loc></sitemap>';
        }
        return $out . '</sitemapindex>';
    }

    /** One section, e.g. "/de/aufgabe/sitemap.xml". */
    public function section(string $name): ?string
    {
        $urls = $this->data['sections'][$name] ?? null;
        if ($urls === null) {
            return null;
        }
        $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="' . self::NAMESPACE . '">';
        foreach ($urls as $path) {
            $out .= '<url><loc>' . esc($this->base . $path) . '</loc></url>';
        }
        return $out . '</urlset>';
    }
}
