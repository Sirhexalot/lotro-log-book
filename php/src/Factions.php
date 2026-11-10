<?php

declare(strict_types=1);

namespace Llb;

/**
 * Faction browser: a filter index plus the catalogue pages behind it.
 *
 * A faction has no place of its own, but its reputation sources do. The index
 * therefore carries the set of regions and areas its quests and deeds play in,
 * and the browser filters by those. The detail pages stay catalogue pages
 * (kind "f"); this class only serves the list under /de/fraktion/.
 */
final class Factions
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
                'title' => 'Fraktionen', 'intro' => 'Wessen Gunst du gewinnen kannst – mit Stufen, Beschreibung und allen Aufgaben und Taten, die Ruf bringen.',
                'search' => 'Fraktion suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                'wo' => 'Region und Landschaft',
                'count' => '%s Fraktionen', 'count_one' => '1 Fraktion',
                'empty' => 'Keine passende Fraktion gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s',
                'mit' => 'Nur mit belegten Rufquellen',
                'filter_note' => 'Die Orte stammen aus den Aufgaben und Taten, die Ruf bei dieser Fraktion geben.',
                'quests' => '%s Aufgaben', 'quests_one' => '1 Aufgabe',
                'deeds' => '%s Taten', 'deeds_one' => '1 Tat',
                'none' => 'Keine Rufquelle belegt', 'nowhere' => 'Kein Ort belegt',
            ],
            'en' => [
                'title' => 'Factions', 'intro' => 'Whose favour you can earn – with tiers, description and every quest and deed that brings reputation.',
                'search' => 'Search for a faction', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                'wo' => 'Region and landscape',
                'count' => '%s factions', 'count_one' => '1 faction',
                'empty' => 'No matching faction found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s',
                'mit' => 'Only with recorded reputation sources',
                'filter_note' => 'Places come from the quests and deeds that give reputation with this faction.',
                'quests' => '%s quests', 'quests_one' => '1 quest',
                'deeds' => '%s deeds', 'deeds_one' => '1 deed',
                'none' => 'No reputation source recorded', 'nowhere' => 'No place recorded',
            ],
            'fr' => [
                'title' => 'Factions', 'intro' => 'Qui tu peux gagner la faveur – avec paliers, description et toutes les quêtes et prouesses qui donnent de la réputation.',
                'search' => 'Chercher une faction', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                'wo' => 'Région et pays',
                'count' => '%s factions', 'count_one' => '1 faction',
                'empty' => 'Aucune faction correspondante.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'mit' => 'Uniquement avec sources de réputation attestées',
                'filter_note' => 'Les lieux viennent des quêtes et prouesses qui donnent de la réputation auprès de cette faction.',
                'quests' => '%s quêtes', 'quests_one' => '1 quête',
                'deeds' => '%s prouesses', 'deeds_one' => '1 prouesse',
                'none' => 'Aucune source de réputation attestée', 'nowhere' => 'Aucun lieu attesté',
            ],
        ][$lang];
    }

    /** Search, place and "only with sources". Unknown values never match. */
    public static function matches(array $row, array $f): bool
    {
        $q = mb_strtolower($f['q'] ?? '');
        if ($q !== '' && !str_contains($row['search'], $q)) {
            return false;
        }
        if (($f['region'] ?? []) && !array_intersect($row['regions'], $f['region'])) {
            return false;
        }
        if (($f['area'] ?? []) && !array_intersect($row['areas'], $f['area'])) {
            return false;
        }
        if (!empty($f['mit']) && ($row['quests'] + $row['deeds']) < 1) {
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
        return $this->catalogue->appRoute($lang ?? $this->lang, 'factions')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'factions');
        return [
            'lang' => $this->lang, 'kind' => 'f', 'w' => $this->shell->words(), 'fw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu('f'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
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
        $index = $this->data->factionIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['factions'];
        $filters = $this->query($input, $labels);
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
            $row['url'] = $this->catalogue->route($this->lang, 'f', $row['id']);
            $namen = [];
            foreach (array_slice($row['areas'], 0, 3) as $gebiet) {
                $name = $labels['area'][(string) $gebiet] ?? $labels['region'][(string) $gebiet] ?? '';
                if ($name !== '' && !in_array($name, $namen, true)) {
                    $namen[] = $name;
                }
            }
            $teile = $namen ? [implode(' · ', $namen)] : [$words['nowhere']];
            if ($row['quests'] > 0) {
                $teile[] = str_replace('%s', (string) $row['quests'],
                    $row['quests'] === 1 ? $words['quests_one'] : $words['quests']);
            }
            if ($row['deeds'] > 0) {
                $teile[] = str_replace('%s', (string) $row['deeds'],
                    $row['deeds'] === 1 ? $words['deeds_one'] : $words['deeds']);
            }
            if ($row['quests'] + $row['deeds'] === 0) {
                $teile[] = $words['none'];
            }
            $row['meta'] = implode(' · ', $teile);
        }
        unset($row);

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        return $this->view->render('factions/list.twig', $this->context(
            $words['title'], $words['intro'], $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'factions' => $page_rows,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }
}
