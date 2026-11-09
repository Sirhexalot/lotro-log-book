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
