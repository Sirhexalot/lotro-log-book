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
        // /de/aufgabe/seite/2/
        if (preg_match('~^/([a-z]{2})/([a-z]+)/seite/([0-9]+)/$~', $path, $m)) {
            return ['status' => 404];
        }
        // /de/aufgabe/ → the type index.
        if (preg_match('~^/([a-z]{2})/([a-z]+)/$~', $path, $m)) {
            return ['status' => 404];
        }

        return ['status' => 404];
    }

    private function page(string $lang, string $segment, string $identifier): array
    {
        if (!$this->catalogue->isLang($lang)) {
            return ['status' => 404];
        }
        $kind = $this->catalogue->kindOf($lang, $segment);
        if ($kind === null || !Catalogue::validId($kind, $identifier)) {
            return ['status' => 404];
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
            return ['status' => 404];
        }
        $canonical = Catalogue::canonicalId($identifier);
        if (!$this->data->has($lang, $kind, $canonical)) {
            return ['status' => 404];
        }
        return ['status' => 301, 'redirect' => $this->catalogue->route($lang, $kind, $canonical)];
    }
}
