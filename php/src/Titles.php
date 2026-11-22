<?php

declare(strict_types=1);

namespace Llb;

require_once __DIR__ . '/Sortierung.php';

/**
 * Title browser under the same segment as the title pages.
 *
 * A title has no place and no category of its own; its sources do. The index
 * therefore carries the origin (deed or quest), the deed kind and the set of
 * regions and areas those sources play in, and this browser filters by them.
 * The detail pages stay catalogue pages (kind "title").
 */
final class Titles
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
                'title' => 'Titel', 'intro' => 'Alle Titel aus Mittelerde – mit der Tat oder Aufgabe, die sie verleiht.',
                'search' => 'Titel suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                'wo' => 'Region und Landschaft', 'kind' => 'Herkunft', 'art' => 'Art',
                'count' => '%s Titel', 'count_one' => '1 Titel',
                'empty' => 'Kein passender Titel gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s',
                'filter_note' => 'Die Orte stammen aus den Taten und Aufgaben, die diesen Titel verleihen.',
                'from_deed' => 'Aus einer Tat', 'from_quest' => 'Aus einer Aufgabe',
                'unknown_origin' => 'Herkunft nicht belegt',
                'source' => 'Quelle', 'sources' => '%s Quellen',
            ],
            'en' => [
                'title' => 'Titles', 'intro' => 'Every title in Middle-earth – with the deed or quest that grants it.',
                'search' => 'Search for a title', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                'wo' => 'Region and landscape', 'kind' => 'Origin', 'art' => 'Kind',
                'count' => '%s titles', 'count_one' => '1 title',
                'empty' => 'No matching title found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s',
                'filter_note' => 'Places come from the deeds and quests that grant this title.',
                'from_deed' => 'From a deed', 'from_quest' => 'From a quest',
                'unknown_origin' => 'Origin not recorded',
                'source' => 'Source', 'sources' => '%s sources',
            ],
            'fr' => [
                'title' => 'Titres', 'intro' => 'Tous les titres de la Terre du Milieu – avec la prouesse ou la quête qui les accorde.',
                'search' => 'Chercher un titre', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                'wo' => 'Région et zone', 'kind' => 'Origine', 'art' => 'Type',
                'count' => '%s titres', 'count_one' => '1 titre',
                'empty' => 'Aucun titre correspondant.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'filter_note' => 'Les lieux viennent des prouesses et quêtes qui accordent ce titre.',
                'from_deed' => 'D’une prouesse', 'from_quest' => 'D’une quête',
                'unknown_origin' => 'Origine non attestée',
                'source' => 'Source', 'sources' => '%s sources',
            ],
        ][$lang];
    }

    /** Search, origin, deed kind and place. Unknown values never match. */
    public static function matches(array $row, array $f): bool
    {
        $q = mb_strtolower($f['q'] ?? '');
        if ($q !== '' && !str_contains($row['search'], $q)) {
            return false;
        }
        if (($f['kind'] ?? []) && !array_intersect(array_keys(self::origins($row)), $f['kind'])) {
            return false;
        }
        if (($f['art'] ?? []) && !array_intersect($row['arten'], $f['art'])) {
            return false;
        }
        if (($f['region'] ?? []) && !array_intersect($row['regions'], $f['region'])) {
            return false;
        }
        if (($f['area'] ?? []) && !array_intersect($row['areas'], $f['area'])) {
            return false;
        }
        return true;
    }

    /** Origin keys a row really has; an empty list stays unknown, never "none". */
    private static function origins(array $row): array
    {
        $out = [];
        if ($row['deeds'] > 0) {
            $out['deed'] = $row['deeds'];
        }
        if ($row['quests'] > 0) {
            $out['quest'] = $row['quests'];
        }
        return $out;
    }

    /** Name, then the id so equal names keep a stable order. */
    public static function sorted(array $rows): array
    {
        usort($rows, static fn (array $a, array $b): int =>
            Sortierung::name($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']));
        return $rows;
    }

    private function query(array $input, array $rows): array
    {
        $out = ['q' => is_string($input['q'] ?? '') ? mb_substr(trim($input['q'] ?? ''), 0, 200) : ''];
        $erlaubt = ['region' => [], 'area' => [], 'art' => []];
        foreach ($rows as $row) {
            foreach (['region' => 'regions', 'area' => 'areas', 'art' => 'arten'] as $key => $field) {
                foreach ($row[$field] as $wert) {
                    $erlaubt[$key][$wert] = true;
                }
            }
        }
        foreach (['region', 'area'] as $key) {
            $allowed = array_map('intval', array_keys($erlaubt[$key]));
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $werte = array_map('intval', array_map('strval', $values));
            $out[$key] = array_values(array_filter($allowed, static fn ($v) => in_array($v, $werte, true)));
        }
        $values = $input['art'] ?? [];
        $values = is_array($values) ? $values : [$values];
        $out['art'] = array_values(array_filter(array_keys($erlaubt['art']),
            static fn ($v) => in_array($v, $values, true)));
        $values = $input['kind'] ?? [];
        $values = is_array($values) ? $values : [$values];
        $out['kind'] = array_values(array_intersect(['deed', 'quest'], $values));
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
        return $this->catalogue->appRoute($lang ?? $this->lang, 'titles')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'titles');
        return [
            'lang' => $this->lang, 'kind' => 'title', 'w' => $this->shell->words(), 'tw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'asset_stand' => $this->shell->assetStand(),
            'menu' => $this->shell->menu('title'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'entity_symbol' => $this->shell->icon('titel'),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => $this->shell->crumbHtml($this->shell->appCrumbs('titles')),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $base, 'noindex' => $noindex,
        ];
    }

    public function listing(array $input): ?string
    {
        $index = $this->data->titleIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['titles'];
        $filters = $this->query($input, $rows);
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected);
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page = is_scalar($input['page'] ?? 1) ? filter_var($input['page'] ?? 1, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) {
            return null;
        }

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
            usort($options, static fn ($a, $b) => Sortierung::name($a['label'], $b['label']));
            $facets[$key] = $options;
        }
        $arten = [];
        foreach (array_keys($labels['art']) as $value) {
            $candidate = $filters;
            $candidate['art'] = [$value];
            $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
            $checked = in_array($value, $filters['art'], true);
            if ($count || $checked) {
                $arten[] = ['value' => $value, 'label' => $labels['art'][$value],
                            'count' => $count, 'checked' => $checked];
            }
        }
        usort($arten, static fn ($a, $b) => Sortierung::name($a['label'], $b['label']));
        $facets['art'] = $arten;

        $herkunft = [];
        foreach (['deed' => $words['from_deed'], 'quest' => $words['from_quest']] as $value => $label) {
            $candidate = $filters;
            $candidate['kind'] = [$value];
            $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
            $checked = in_array($value, $filters['kind'], true);
            if ($count || $checked) {
                $herkunft[] = ['value' => $value, 'label' => $label, 'count' => $count, 'checked' => $checked];
            }
        }
        $facets['kind'] = $herkunft;

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
            $row['url'] = $this->catalogue->route($this->lang, 'title', $row['id']);
            $teile = [];
            if ($row['deeds'] > 0) {
                $teile[] = $words['from_deed'];
            }
            if ($row['quests'] > 0) {
                $teile[] = $words['from_quest'];
            }
            foreach (array_slice($row['arten'], 0, 2) as $art) {
                $teile[] = $art;
            }
            $namen = [];
            foreach (array_slice($row['areas'], 0, 2) as $gebiet) {
                $name = $labels['area'][(string) $gebiet] ?? $labels['region'][(string) $gebiet] ?? '';
                if ($name !== '' && !in_array($name, $namen, true)) {
                    $namen[] = $name;
                }
            }
            if ($namen) {
                $teile[] = implode(' · ', $namen);
            }
            if ($row['deeds'] + $row['quests'] === 0) {
                // No origin to list.
            }
            $row['meta'] = implode(' · ', $teile);
        }
        unset($row);

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        return $this->view->render('titles/list.twig', $this->context(
            // Folgeseiten nennen ihre Seite, sonst tragen sie den Text der ersten.
            $page > 1 ? $words['title'] . ' – ' . sprintf($words['page'], $page, $pages) : $words['title'],
            $page > 1 ? $words['intro'] . ' ' . sprintf($words['page'], $page, $pages) . '.' : $words['intro'],
            $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'titles' => $page_rows,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }
}
