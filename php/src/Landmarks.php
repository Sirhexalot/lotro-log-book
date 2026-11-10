<?php

declare(strict_types=1);

namespace Llb;

/**
 * Landmark browser: a filter index plus the catalogue pages behind it.
 *
 * The index holds one row per landmark with its area and region, so a request
 * reads one file and filters in memory. The detail pages stay catalogue pages
 * (kind "l"); this class only serves the list under /de/landmarke/.
 *
 * Same shape as the quest-giver browser: the filter tree is expanded by
 * auftraggeber.js, the form itself is filtered by sets.js, and without
 * JavaScript the GET form still works.
 */
final class Landmarks
{
    private const PAGE_SIZE = 30;

    public function __construct(
        private Catalogue $catalogue,
        private Data $data,
        private Shell $shell,
        private View $view,
        private string $lang,
    ) {
    }

    public static function words(string $lang): array
    {
        return [
            'de' => [
                'title' => 'Landmarken', 'intro' => 'Benannte Orte in Mittelerde – Gasthäuser, Höhlen, Ruinen und Lager, mit ihrer Landschaft und den Aufgaben, die dorthin führen.',
                'search' => 'Landmarke suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                'wo' => 'Region und Landschaft',
                'count' => '%s Landmarken', 'count_one' => '1 Landmarke',
                'quests' => '%s Aufgaben', 'quests_one' => '1 Aufgabe',
                'empty' => 'Keine passende Landmarke gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s',
                'mit' => 'Nur mit belegten Aufgaben', 'no_area' => 'Ohne Landschaft',
                'filter_note' => 'Die Filter beziehen sich auf die belegten Standorte und Aufgaben.',
                'no_quests' => 'Keine Aufgabe belegt', 'back' => 'Alle Landmarken',
                'seo_detail' => 'Lage, Karte und Aufgaben zu %s.',
            ],
            'en' => [
                'title' => 'Landmarks', 'intro' => 'Named places in Middle-earth – inns, caves, ruins and camps, with their landscape and the quests that lead there.',
                'search' => 'Search for a landmark', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                'wo' => 'Region and landscape',
                'count' => '%s landmarks', 'count_one' => '1 landmark',
                'quests' => '%s quests', 'quests_one' => '1 quest',
                'empty' => 'No matching landmark found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s',
                'mit' => 'Only with recorded quests', 'no_area' => 'No landscape',
                'filter_note' => 'Filters use the recorded locations and quests.',
                'no_quests' => 'No quest recorded', 'back' => 'All landmarks',
                'seo_detail' => 'Location, map and quests for %s.',
            ],
            'fr' => [
                'title' => 'Sites', 'intro' => 'Lieux nommés en Terre du Milieu – auberges, grottes, ruines et campements, avec leur pays et les quêtes qui y mènent.',
                'search' => 'Chercher un site', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                'wo' => 'Région et pays',
                'count' => '%s sites', 'count_one' => '1 site',
                'quests' => '%s quêtes', 'quests_one' => '1 quête',
                'empty' => 'Aucun site correspondant.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'mit' => 'Uniquement avec quêtes attestées', 'no_area' => 'Sans pays',
                'filter_note' => 'Les filtres reposent sur les lieux et quêtes attestés.',
                'no_quests' => 'Aucune quête attestée', 'back' => 'Tous les sites',
                'seo_detail' => 'Emplacement, carte et quêtes pour %s.',
            ],
        ][$lang];
    }

    /** Search, place and "only with quests". Unknown values never match. */
    public static function matches(array $row, array $f): bool
    {
        $q = mb_strtolower($f['q'] ?? '');
        if ($q !== '' && !str_contains($row['search'], $q)) {
            return false;
        }
        if (($f['region'] ?? []) && !in_array($row['region'], $f['region'], true)) {
            return false;
        }
        if (($f['area'] ?? []) && !in_array($row['area'], $f['area'], true)) {
            return false;
        }
        if (!empty($f['mit']) && ($row['quests'] ?? 0) < 1) {
            return false;
        }
        return true;
    }

    /** Name, then the id so equal names keep a stable order. */
    public static function sorted(array $rows): array
    {
        usort($rows, static fn (array $a, array $b): int =>
            strnatcasecmp($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']));
        return $rows;
    }

    private function query(array $input, array $labels): array
    {
        $out = ['q' => is_string($input['q'] ?? '') ? mb_substr(trim($input['q'] ?? ''), 0, 200) : ''];
        foreach (['region', 'area'] as $key) {
            $allowed = array_map('intval', array_keys($labels[$key]));
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $werte = array_map('intval', array_map('strval', $values));
            $out[$key] = array_values(array_filter($allowed, static fn ($v) => in_array($v, $werte, true)));
        }
        $out['mit'] = ($input['mit'] ?? '') === '1' ? '1' : '';
        return $out;
    }

    private function params(array $f, int $page = 1): array
    {
        $params = array_filter($f, static fn ($value) => $value !== '' && $value !== []);
        if ($page > 1) {
            $params['page'] = $page;
        }
        return $params;
    }

    private function url(array $filters, int $page = 1, ?string $lang = null): string
    {
        $params = $this->params($filters, $page);
        return $this->catalogue->appRoute($lang ?? $this->lang, 'landmarks')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'landmarks');
        return [
            'lang' => $this->lang, 'kind' => 'l', 'w' => $this->shell->words(), 'lw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu('l'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => link_tag($base, $words['title']),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $base, 'noindex' => $noindex,
        ];
    }

    public function listing(array $input): ?string
    {
        $index = $this->data->landmarkIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['landmarks'];
        $filters = $this->query($input, $labels);
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected);
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page = is_scalar($input['page'] ?? 1) ? filter_var($input['page'] ?? 1, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) {
            return null;
        }

        // Facets: every value counts against the other filters, so a selected
        // region never hides the landscapes inside it.
        $facets = [];
        foreach (['region', 'area'] as $key) {
            $options = [];
            foreach (array_keys($labels[$key]) as $value) {
                $candidate = $filters;
                $candidate[$key] = [(int) $value];
                $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
                $checked = in_array((int) $value, $filters[$key], true);
                if ($count || $checked) {
                    $options[] = ['value' => $value, 'label' => $labels[$key][$value],
                                  'count' => $count, 'checked' => $checked];
                }
            }
            usort($options, static fn ($a, $b) => strnatcasecmp($a['label'], $b['label']));
            $facets[$key] = $options;
        }
        $area_by_region = [];
        $area_rest = [];
        foreach ($facets['area'] as $option) {
            $region = $labels['area_region'][(string) $option['value']] ?? null;
            if ($region === null || $region === '') {
                $area_rest[] = $option;
            } else {
                $area_by_region[(string) $region][] = $option;
            }
        }

        $page_rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        foreach ($page_rows as &$row) {
            $row['url'] = $this->catalogue->route($this->lang, 'l', $row['id']);
            $teile = [];
            if ($row['area'] !== null) {
                // A region map is its own area; its name is the region name.
                $teile[] = $labels['area'][(string) $row['area']]
                    ?? $labels['region'][(string) $row['area']] ?? '';
            }
            if ($row['region'] !== null && $row['region'] !== $row['area']) {
                $teile[] = $labels['region'][(string) $row['region']] ?? '';
            }
            $teile = array_values(array_filter($teile));
            if (!$teile) {
                $teile[] = $words['no_area'];
            }
            $teile[] = $row['quests'] > 0
                ? str_replace('%s', (string) $row['quests'],
                    $row['quests'] === 1 ? $words['quests_one'] : $words['quests'])
                : $words['no_quests'];
            $row['meta'] = implode(' · ', $teile);
        }
        unset($row);

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        return $this->view->render('landmarks/list.twig', $this->context(
            $words['title'], $words['intro'], $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'landmarks' => $page_rows,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }
}
