<?php

declare(strict_types=1);

namespace Llb;

final class Vendors
{
    private const PAGE_SIZE = 30;

    public function __construct(
        private Catalogue $catalogue,
        private Data $data,
        private Shell $shell,
        private View $view,
        private string $lang,
    ) {}

    public static function words(string $lang): array
    {
        return [
            'de' => ['title' => 'Händler', 'intro' => 'Händler mit Standort und Warenangebot.',
                     'search' => 'Händler suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                     'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                     'type' => 'Art', 'type_vendor' => 'Normaler Händler',
                     'type_barter' => 'Tauschhändler', 'type_both' => 'Händler und Tauschhändler',
                     'type_filter_vendor' => 'Normaler Händler', 'type_filter_both' => 'Tauschhändler',
                     'level' => 'Gegenstandsstufe', 'from' => 'von', 'to' => 'bis',
                     'filter_items' => 'Anwenden', 'reset_items' => 'Alle Gegenstände',
                     'wo' => 'Region und Landschaft', 'empty' => 'Keinen passenden Händler gefunden.',
                     'previous' => 'Zurück', 'next' => 'Weiter', 'page' => 'Seite %s von %s',
                      'items' => 'Warenangebot', 'vendor_items' => 'Warenangebot',
                     'items_count' => '%s Gegenstände', 'items_count_one' => '1 Gegenstand',
                     'places' => 'Standort', 'map' => 'Auf Karte zeigen', 'route' => 'Route planen',
                     'no_place' => 'Kein Standort in den Spieldaten belegt.', 'back' => 'Alle Händler',
                     'count' => '%s Händler', 'count_one' => '1 Händler'],
            'en' => ['title' => 'Vendors', 'intro' => 'Vendors with their locations and stock.',
                     'search' => 'Search for a vendor', 'filter' => 'Filters', 'apply' => 'Apply',
                     'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                      'type' => 'Type', 'type_vendor' => 'Regular vendor',
                      'type_barter' => 'Barterer', 'type_both' => 'Vendor and barterer',
                      'type_filter_vendor' => 'Regular vendor', 'type_filter_both' => 'Barterer',
                     'level' => 'Item level', 'from' => 'from', 'to' => 'to',
                     'filter_items' => 'Apply', 'reset_items' => 'All items',
                     'wo' => 'Region and landscape', 'empty' => 'No matching vendor found.',
                     'previous' => 'Previous', 'next' => 'Next', 'page' => 'Page %s of %s',
                      'items' => 'Stock', 'vendor_items' => 'Stock',
                     'items_count' => '%s items', 'items_count_one' => '1 item',
                     'places' => 'Location', 'map' => 'Show on map', 'route' => 'Plan a route',
                     'no_place' => 'No location is recorded in the game data.', 'back' => 'All vendors',
                     'count' => '%s vendors', 'count_one' => '1 vendor'],
            'fr' => ['title' => 'Marchands', 'intro' => 'Marchands avec leur emplacement et leurs marchandises.',
                     'search' => 'Chercher un marchand', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                     'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                      'type' => 'Type', 'type_vendor' => 'Marchand normal',
                      'type_barter' => 'Marchand troqueur', 'type_both' => 'Marchand et troqueur',
                      'type_filter_vendor' => 'Marchand normal', 'type_filter_both' => 'Marchand troqueur',
                     'level' => 'Niveau des objets', 'from' => 'de', 'to' => 'à',
                     'filter_items' => 'Appliquer', 'reset_items' => 'Tous les objets',
                     'wo' => 'Région et pays', 'empty' => 'Aucun marchand correspondant.',
                     'previous' => 'Précédent', 'next' => 'Suivant', 'page' => 'Page %s sur %s',
                      'items' => 'Marchandises', 'vendor_items' => 'Marchandises',
                     'items_count' => '%s objets', 'items_count_one' => '1 objet',
                     'places' => 'Lieu', 'map' => 'Voir sur la carte', 'route' => 'Planifier un trajet',
                     'no_place' => 'Aucun emplacement n’est attesté dans les données du jeu.', 'back' => 'Tous les marchands',
                     'count' => '%s marchands', 'count_one' => '1 marchand'],
        ][$lang];
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        return [
            'lang' => $this->lang, 'kind' => 'vendor', 'w' => $this->shell->words(), 'gw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical, 'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'asset_stand' => $this->shell->assetStand(), 'menu' => $this->shell->menu('vendor'),
            'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'entity_symbol' => $this->shell->icon('haendler'),
            'entity_filter_url' => $this->catalogue->appRoute($this->lang, 'vendors'),
            'entity_filter_label' => ['de' => 'In der gefilterten Übersicht suchen', 'en' => 'Browse the filtered list', 'fr' => 'Parcourir la liste filtrée'][$this->lang],
            'suche_pfad' => $this->shell->appRoute('suche'), 'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => $this->shell->crumbHtml($this->shell->appCrumbs('vendors')),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $this->catalogue->appRoute($this->lang, 'vendors'),
            'noindex' => $noindex,
        ];
    }

    public static function matches(array $row, array $filters): bool
    {
        if ($filters['q'] !== '' && !str_contains($row['search'], mb_strtolower($filters['q']))) {
            return false;
        }
        if ($filters['region'] && !array_intersect($row['regions'], $filters['region'])) {
            return false;
        }
        if ($filters['area'] && !array_intersect($row['areas'], $filters['area'])) {
            return false;
        }
        if ($filters['type'] && !in_array($row['type'], $filters['type'], true)) {
            return false;
        }
        return true;
    }

    private function query(array $input, array $rows): array
    {
        $query = $input['q'] ?? '';
        $filters = ['q' => is_string($query) ? mb_substr(trim($query), 0, 200) : '',
                    'region' => [], 'area' => [], 'type' => []];
        foreach (['region', 'area', 'type'] as $key) {
            $allowed = [];
            foreach ($rows as $row) {
                $values_for_row = $key === 'type' ? [$row['type']] : $row[$key . 's'];
                foreach ($values_for_row as $value) {
                    $allowed[$key === 'type' ? (string) $value : (int) $value] = true;
                }
            }
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $selected = $key === 'type'
                ? array_map('strval', $values)
                : array_map('intval', array_map('strval', $values));
            $filters[$key] = array_values(array_filter(array_keys($allowed),
                static fn ($value) => in_array($value, $selected, true)));
        }
        return $filters;
    }

    private function params(array $filters, int $page = 1): array
    {
        $params = array_filter($filters, static fn ($value) => $value !== '' && $value !== []);
        if ($page > 1) {
            $params['page'] = $page;
        }
        return $params;
    }

    private function url(array $filters, int $page = 1, ?string $lang = null): string
    {
        $params = $this->params($filters, $page);
        return $this->catalogue->appRoute($lang ?? $this->lang, 'vendors')
            . ($params ? '?' . http_build_query($params) : '');
    }

    public function detail(string $id): ?string
    {
        $vendor = $this->data->page($this->lang, 'vendor', $id);
        if (!$vendor) return null;
        foreach ($vendor['places'] as &$place) {
            foreach ($place['chain'] as &$part) {
                $part['url'] = $this->catalogue->route(
                    $this->lang, $part['tier'] === 1 ? 'region' : 'area', (string) $part['id']);
            }
        }
        unset($place, $part);
        $alternates = [];
        foreach (Catalogue::LANGS as $lang) {
            if ($this->data->has($lang, 'vendor', $id)) {
                $alternates[] = ['lang' => $lang, 'url' => $this->catalogue->route($lang, 'vendor', $id)];
            }
        }
        $context = $this->context($vendor['name'], $vendor['seo']['description'],
            $this->catalogue->route($this->lang, 'vendor', $id), $alternates);
        $vendor['type_label'] = self::words($this->lang)['type_' . ($vendor['type'] ?? 'vendor')];
        $vendor['item_ids'] = implode(',', array_column($vendor['items'], 'id'));
        $vendor['item_total'] = count($vendor['items']);
        $vendor['total'] = $vendor['item_total'];
        $context['crumbs'] = $this->shell->crumbHtml($this->shell->appCrumbs('vendors'));
        $context['icon'] = $this->shell->icon('auftraggeber');
        return $this->view->render('vendors/detail.twig', $context + ['vendor' => $vendor]);
    }

    public function listing(array $input): ?string
    {
        $index = $this->data->vendorIndex($this->lang);
        if (!$index) return null;
        $words = self::words($this->lang);
        $rows = $index['vendors'];
        $filters = $this->query($input, $rows);
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        usort($selected, static fn ($a, $b): int =>
            strnatcasecmp($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']));
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page_input = $input['page'] ?? 1;
        $page = is_scalar($page_input) ? filter_var($page_input, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) return null;

        $facets = [];
        foreach (['region', 'area', 'type'] as $key) {
            $options = [];
            foreach (array_keys($index['labels'][$key]) as $value) {
                $candidate = $filters;
                $candidate[$key] = [$key === 'type' ? (string) $value : (int) $value];
                $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
                $label = $key === 'type'
                    ? $words['type_filter_' . $value]
                    : $index['labels'][$key][$value];
                $options[] = ['value' => $value, 'label' => $label,
                              'count' => $count,
                              'checked' => in_array($key === 'type' ? (string) $value : (int) $value,
                                                   $filters[$key], true)];
            }
            usort($options, static fn ($a, $b): int => strnatcasecmp($a['label'], $b['label']));
            $facets[$key] = array_values(array_filter($options,
                static fn ($option) => $option['count'] || $option['checked']));
        }
        $area_by_region = [];
        $area_rest = [];
        foreach ($facets['area'] as $option) {
            $region = $index['labels']['area_region'][(string) $option['value']] ?? null;
            if ($region === null || $region === '') $area_rest[] = $option;
            else $area_by_region[(string) $region][] = $option;
        }

        $page_rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        foreach ($page_rows as &$row) {
            $row['url'] = $this->catalogue->route($this->lang, 'vendor', $row['id']);
            $names = [];
            foreach (array_slice($row['areas'], 0, 3) as $area) {
                $name = $index['labels']['area'][(string) $area]
                    ?? $index['labels']['region'][(string) $area] ?? '';
                if ($name !== '' && !in_array($name, $names, true)) $names[] = $name;
            }
            $meta = $names ? [implode(' · ', $names)] : [];
            $row['meta'] = implode(' · ', $meta);
        }
        unset($row);

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        $context = $this->context(
            $page > 1 ? $words['title'] . ' – ' . sprintf($words['page'], $page, $pages) : $words['title'],
            $words['intro'], $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($value) => $value !== '' && $value !== []));
        return $this->view->render('vendors/list.twig', $context + [
            'vendors' => $page_rows, 'filters' => $filters, 'facets' => $facets,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
            'words' => $words,
        ]);
    }
}
