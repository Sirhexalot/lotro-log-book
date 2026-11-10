<?php

declare(strict_types=1);

namespace Llb;

/**
 * Assembles one catalogue page: shell variables plus the entity body.
 *
 * Entity bodies live in their own Twig template, so a wording or layout change
 * touches one file instead of every generated page.
 */
final class Page
{
    private array $w;

    public function __construct(
        private Catalogue $catalogue,
        private Data $data,
        private Shell $shell,
        private View $view,
        private string $lang,
    ) {
        $this->w = $shell->words();
    }

    public function render(string $kind, string $identifier): ?string
    {
        if ($kind === 'set') {
            return (new Sets($this->catalogue, $this->data, $this->shell, $this->view, $this->lang))->detail($identifier);
        }
        if ($kind === 'giver') {
            return (new Givers($this->catalogue, $this->data, $this->shell, $this->view, $this->lang))->detail($identifier);
        }
        $page = $this->data->page($this->lang, $kind, $identifier);
        if ($page === null) {
            return null;
        }
        $template = 'entity/' . self::templateFor($kind) . '.twig';
        $maps = $page['crumb_maps'] ?? $this->crumbMaps($page, $identifier);

        $context = [
            'lang' => $this->lang,
            'kind' => $kind,
            'w' => $this->w,
            'page' => $page,
            'page_seo' => $page['seo'],
            'base' => $this->catalogue->base,
            'canonical_url' => $this->catalogue->route($this->lang, $kind, $identifier),
            'alternates' => $this->shell->alternates($kind, $identifier),
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => [
                'de' => 'Breeland-Karte mit Aufgabenmarkierungen',
                'en' => 'Bree-land map with quest markers',
                'fr' => 'Carte du Pays de Bree avec repères de quêtes',
            ][$this->lang],
            'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(),
            'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu($kind),
            'start_page' => $this->shell->startPage(),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => $this->katalogTexte(),
            'crumbs' => $this->crumbsHtml($kind, $page, $maps),
            'languages' => $this->languagesHtml($kind, $identifier),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->w['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->w['privacy']),
            'icon' => $this->shell->icon($page['icon'] ?? ''),
            // Recipes and items show the client's own symbol next to the name.
            'symbol_gross' => !empty($page['symbol'])
                ? '<img class="symbol symbol-gross" src="/bild/items/' . esc((string) $page['symbol'])
                  . '.webp" alt="" width="32" height="32" decoding="async">'
                : '',
        ];

        return $this->view->render($template, $context);
    }

    /**
     * An overview page: same shell, list body from `entity/list.twig`.
     *
     * The model already carries its canonical address and its per-language
     * alternates, because item sub-indexes have paths no rule can derive.
     */
    public function renderList(string $key): ?string
    {
        $page = $this->data->listPage($key);
        if ($page === null) {
            return null;
        }
        // Every overview model carries the same keys, so the template can
        // stay free of `is defined` checks under strict_variables.
        $page += ['intro' => '', 'entries' => [], 'sections' => [], 'links' => [],
                  'nav' => null, 'search_hint' => null, 'foot_link' => null, 'symbol' => null];
        $kind = $page['kind'];
        $context = [
            'lang' => $this->lang,
            'kind' => $kind,
            'w' => $this->w,
            'page' => $page,
            'page_seo' => $page['seo'],
            'base' => $this->catalogue->base,
            'canonical_url' => $page['canonical'],
            'alternates' => array_map(
                static fn (string $other, string $url): array => ['lang' => $other, 'url' => $url],
                array_keys($page['alternates']),
                $page['alternates']
            ),
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => [
                'de' => 'Breeland-Karte mit Aufgabenmarkierungen',
                'en' => 'Bree-land map with quest markers',
                'fr' => 'Carte du Pays de Bree avec repères de quêtes',
            ][$this->lang],
            'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(),
            'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu($kind),
            'start_page' => $this->shell->startPage(),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => $this->katalogTexte(),
            'crumbs' => $this->listCrumbs($kind),
            'languages' => $this->listLanguages($page),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->w['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->w['privacy']),
            'icon' => $this->shell->icon($page['symbol'] ?? ''),
            'symbol_gross' => '',
        ];
        return $this->view->render('entity/list.twig', $context);
    }

    /**
     * An application page: shared shell from `app/layout.twig`, the page's own
     * main markup and script list from its template.
     */
    public function renderApp(string $lang, string $page): ?string
    {
        if ($page === 'sets') {
            return (new Sets($this->catalogue, $this->data, $this->shell, $this->view, $lang))->listing($_GET);
        }
        if ($page === 'givers') {
            return (new Givers($this->catalogue, $this->data, $this->shell, $this->view, $lang))->listing($_GET);
        }
        // The deeds view is the map with another mode; the crafting browser
        // shares its template with nothing else.
        $template = match ($page) {
            'start' => 'start-' . $lang,
            'taten' => 'karte',
            default => $page,
        };
        // The title and description live in build_seo.PAGES, exported with the labels.
        $datei = match ($page) {
            'start' => 'start' . ($lang === 'de' ? '' : '-' . $lang) . '.html',
            'karte', 'taten' => 'index.html',
            'gegenstandssuche' => 'gegenstaende.html',
            default => $page . '.html',
        };
        $seo = $this->catalogue->appSeo($datei) ?? ['title' => 'LOTRO Log Book', 'description' => ''];
        $sprachen = [];
        foreach (Catalogue::LANGS as $other) {
            $sprachen[] = [
                'lang' => $other,
                'label' => strtoupper($other),
                'url' => $this->catalogue->appRoute($other, $page),
                'aktiv' => $other === $lang,
            ];
        }
        $context = [
            'lang' => $lang,
            'w' => $this->w,
            'page_seo' => $seo,
            'base' => $this->catalogue->base,
            'canonical_url' => $this->catalogue->appRoute($lang, $page),
            'alternates' => array_map(static fn (array $s): array => [
                'lang' => $s['lang'], 'url' => $s['url']], $sprachen),
            'sprachen' => $sprachen,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$lang],
            'og_image_alt' => [
                'de' => 'Breeland-Karte mit Aufgabenmarkierungen',
                'en' => 'Bree-land map with quest markers',
                'fr' => 'Carte du Pays de Bree avec repères de quêtes',
            ][$lang],
            'tracking' => $this->shell->tracking(),
            'asset_stand' => $this->assetStand(),
        ];
        return $this->view->render('app/' . $template . '.twig', $context);
    }

    /** Stamp for every app script and stylesheet.
     *
     * The URL has to change when any of them changes, not only the two base
     * stylesheets: otherwise a browser keeps an old texte-reise.js or
     * reise.css and the page shows a key name instead of its text.
     */
    private function assetStand(): string
    {
        $root = $this->shell->webRoot();
        $teile = [];
        foreach (['*.js', '*.css'] as $muster) {
            foreach (glob($root . '/' . $muster) ?: [] as $datei) {
                $teile[] = basename($datei) . ':' . filemtime($datei);
            }
        }
        sort($teile);
        return substr(md5(implode('|', $teile)), 0, 10);
    }

    private function listCrumbs(string $kind): string
    {
        $parts = [];
        foreach ($this->shell->crumbs($kind) as $crumb) {
            $parts[] = $crumb['url'] === null
                ? esc($crumb['text'])
                : link_tag($crumb['url'], $crumb['text']);
        }
        return implode(' › ', $parts);
    }

    private function listLanguages(array $page): string
    {
        $parts = [];
        foreach ($page['language_urls'] ?? $page['alternates'] as $other => $url) {
            $parts[] = link_tag($url, strtoupper($other), ['hreflang' => $other, 'lang' => $other]);
        }
        return implode(' · ', $parts);
    }

    private static function templateFor(string $kind): string
    {
        return match ($kind) {
            'q' => 'quest',
            'd' => 'deed',
            'i' => 'item',
            'recipe' => 'recipe',
            'title' => 'title',
            'virtue' => 'virtue',
            'area', 'region' => 'area',
            'p' => 'profession',
            default => 'catalog',
        };
    }

    /**
     * The status wording the catalogue JavaScript reads from the page.
     *
     * Same keys and same spacing as the static generator, so the client script
     * cannot notice a difference after the switch.
     */
    private function katalogTexte(): string
    {
        $order = ['status_done', 'status_unknown', 'status_running', 'none', 'known',
                  'foreign', 'recipe_unknown', 'recipe_missing'];
        $parts = [];
        foreach ($order as $key) {
            $parts[] = json_encode($key) . ': ' . json_encode($this->w[$key], JSON_UNESCAPED_UNICODE);
        }
        return '{' . implode(', ', $parts) . '}';
    }

    private function crumbMaps(array $page, string $identifier): array
    {
        return [];
    }

    private function crumbsHtml(string $kind, array $page, array $maps): string
    {
        $parts = [];
        foreach ($this->shell->crumbs($kind, ['crumb_maps' => $maps] + $page) as $crumb) {
            $parts[] = $crumb['url'] === null
                ? esc($crumb['text'])
                : link_tag($crumb['url'], $crumb['text']);
        }
        return implode(' › ', $parts);
    }

    private function languagesHtml(string $kind, string $identifier): string
    {
        $parts = [];
        foreach ($this->shell->languages($kind, $identifier) as $entry) {
            $parts[] = link_tag($entry['url'], $entry['label'],
                ['hreflang' => $entry['lang'], 'lang' => $entry['lang']]);
        }
        return implode(' · ', $parts);
    }
}
