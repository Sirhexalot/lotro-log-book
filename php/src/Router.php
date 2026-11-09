<?php

declare(strict_types=1);

namespace Llb;

/**
 * Turns a request path into a page, a redirect or a real 404.
 *
 * Only the trailing-slash form is a page. The flat `.html` form, the form
 * without the slash and a lowercase id are 301s to the canonical address, so
 * search engines keep one address per entity.
 */
final class Router
{
    public function __construct(
        private Catalogue $catalogue,
        private Data $data,
    ) {
    }

    /** @return array{status:int, kind?:string, id?:string, page?:int, redirect?:string} */
    public function resolve(string $path): array
    {
        // Keep the trailing slash: it distinguishes a page from a redirect.
        $path = '/' . ltrim($path, '/');
        if ($path === '/sitemap.xml') {
            return ['status' => 200, 'sitemap' => '/sitemap.xml'];
        }
        if (preg_match('~^/([a-z]{2})/([a-z]+)/sitemap(?:-[0-9]+)?\.xml$~', $path, $m)) {
            return ['status' => 200, 'sitemap' => $path];
        }
        if ($path === '/sitemap-seiten.xml') {
            return ['status' => 200, 'sitemap' => $path];
        }
        if ($path === '/') {
            return ['status' => 404];
        }

        // /de/aufgabe/700005C0.html → 301 to the canonical directory form.
        if (preg_match('~^/([a-z]{2})/([a-z]+)/([0-9A-Za-z_]+)\.html$~', $path, $m)) {
            return $this->canonical($m[1], $m[2], $m[3], true);
        }
        // /de/aufgabe/700005C0 → 301 with the trailing slash.
        if (preg_match('~^/([a-z]{2})/([a-z]+)/([0-9A-Za-z_]+)$~', $path, $m)) {
            return $this->canonical($m[1], $m[2], $m[3], false);
        }
        // /de/aufgabe/700005C0/ → the page.
        if (preg_match('~^/([a-z]{2})/([a-z]+)/([0-9A-Za-z_]+)/$~', $path, $m)) {
            return $this->page($m[1], $m[2], $m[3]);
        }
        // Overview pages: /de/aufgabe/, /de/aufgabe/seite/2/, /de/gegenstand/ruestung/.
        // Their shape is decided by the prepared data, not by a URI pattern.
        if (preg_match('~^/([a-z]{2})/((?:[a-z0-9]+/)+)$~', $path, $m)) {
            return $this->listPage($m[1], $m[2]);
        }
        // /de/aufgabe (no slash) and /de/aufgabe/index.html → 301.
        if (preg_match('~^/([a-z]{2})/((?:[a-z0-9]+/)*[a-z0-9]+)(?:\.html)?$~', $path, $m)
            && !str_contains($path, '.')) {
            return ['status' => 301, 'redirect' => '/' . $m[1] . '/' . $m[2] . '/'];
        }
        if (preg_match('~^/([a-z]{2})/(.*)/index\.html$~', $path, $m)) {
            return ['status' => 301, 'redirect' => '/' . $m[1] . '/' . $m[2] . '/'];
        }

        return ['status' => 404];
    }

    /** An overview page is a data lookup; unknown paths stay 404. */
    private function listPage(string $lang, string $rest): array
    {
        if (!$this->catalogue->isLang($lang)) {
            return ['status' => 404];
        }
        $segment = explode('/', $rest)[0];
        $kind = $this->catalogue->kindOf($lang, $segment);
        if ($kind === null) {
            return ['status' => 404];
        }
        $key = $lang . '/' . $rest;
        if ($this->data->listPage($key) === null) {
            return ['status' => 404];
        }
        return ['status' => 200, 'list' => $key];
    }

    private function page(string $lang, string $segment, string $identifier): array
    {
        if (!$this->catalogue->isLang($lang)) {
            return ['status' => 404];
        }
        $kind = $this->catalogue->kindOf($lang, $segment);
        if ($kind === null || !Catalogue::validId($kind, $identifier)) {
            // Not an id: an item sub-index such as /de/gegenstand/ruestung/.
            return $this->listPage($lang, $segment . '/' . $identifier . '/');
        }
        $canonical = Catalogue::canonicalId($identifier);
        if ($canonical !== $identifier) {
            return ['status' => 301, 'redirect' => $this->catalogue->route($lang, $kind, $canonical)];
        }
        if (!$this->data->has($lang, $kind, $identifier)) {
            return ['status' => 404];
        }
        return ['status' => 200, 'kind' => $kind, 'id' => $identifier];
    }

    private function canonical(string $lang, string $segment, string $identifier, bool $flat): array
    {
        if (!$this->catalogue->isLang($lang)) {
            return ['status' => 404];
        }
        $kind = $this->catalogue->kindOf($lang, $segment);
        if ($kind === null || !Catalogue::validId($kind, $identifier)) {
            // Not an id, but maybe an overview page written without its slash
            // ("/de/gegenstand/ruestung") or with index.html.
            $key = $lang . '/' . $segment . '/' . $identifier . '/';
            if ($identifier === 'index') {
                $key = $lang . '/' . $segment . '/';
            }
            if ($this->data->listPage($key) !== null) {
                return ['status' => 301, 'redirect' => '/' . $key];
            }
            return ['status' => 404];
        }
        $canonical = Catalogue::canonicalId($identifier);
        if (!$this->data->has($lang, $kind, $canonical)) {
            return ['status' => 404];
        }
        return ['status' => 301, 'redirect' => $this->catalogue->route($lang, $kind, $canonical)];
    }
}
