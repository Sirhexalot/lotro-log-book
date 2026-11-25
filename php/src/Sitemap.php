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
    private const XML_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

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
            . '<sitemapindex xmlns="' . self::XML_NAMESPACE . '">';
        $lastmod = $this->data['lastmod'] ?? [];
        foreach ($names as $name) {
            $dates = $lastmod[$name] ?? [];
            $urls = $this->data['sections'][$name] ?? [];
            $date = null;
            if (is_array($dates) && is_array($urls) && count($dates) === count($urls)) {
                foreach ($dates as $candidate) {
                    if ($this->validDate($candidate) && ($date === null || $candidate > $date)) {
                        $date = $candidate;
                    }
                }
            }
            $out .= '<sitemap><loc>' . esc($this->base . $name) . '</loc>';
            if ($date !== null) {
                $out .= '<lastmod>' . $date . '</lastmod>';
            }
            $out .= '</sitemap>';
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
            . '<urlset xmlns="' . self::XML_NAMESPACE . '">';
        $dates = $this->data['lastmod'][$name] ?? [];
        if (!is_array($dates) || count($dates) !== count($urls)) {
            $dates = [];
        }
        foreach ($urls as $index => $path) {
            $out .= '<url><loc>' . esc($this->base . $path) . '</loc>';
            $date = is_array($dates) ? ($dates[$index] ?? null) : null;
            if ($this->validDate($date)) {
                $out .= '<lastmod>' . $date . '</lastmod>';
            }
            $out .= '</url>';
        }
        return $out . '</urlset>';
    }

    private function validDate(mixed $value): bool
    {
        if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return false;
        }
        $parsed = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        return $parsed !== false && $parsed->format('Y-m-d') === $value;
    }
}
