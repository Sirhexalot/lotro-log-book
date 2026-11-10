<?php

declare(strict_types=1);

namespace Llb;

/** Server-rendered set catalogue: small index for filters, shards for details. */
final class Sets
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
                'title' => 'Sets', 'intro' => 'Zusammengehörige Ausrüstung und ihre Setboni.',
                'search' => 'Set oder Gegenstand suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'class' => 'Klasse', 'category' => 'Ausrüstungsart',
                'armour' => 'Rüstungsart', 'level' => 'Benötigte Charakterstufe', 'from' => 'Von', 'to' => 'Bis',
                'count' => '%s Sets', 'parts' => '%s Teile', 'incomplete' => 'Gegenstandsdaten unvollständig',
                'empty' => 'Keine passenden Sets gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s', 'pieces' => 'Setteile', 'bonuses' => 'Setboni',
                'threshold' => '%s Teile', 'unclear_threshold' => 'Bonuszuordnung unklar',
                'unresolved' => 'Wert oder Wirkung nicht vollständig auswertbar.',
                'scaling' => 'Stufenabhängig; ein verlässlicher Zahlenwert liegt nicht vor.',
                'no_bonuses' => 'Keine Bonusangaben in den vorhandenen Daten.',
                'missing' => 'Zu diesem Teil fehlen Gegenstandsdaten.', 'unnamed' => 'Name nicht belegt',
                'item' => 'Gegenstand ansehen', 'back' => 'Alle Sets', 'unknown' => 'Unbekannt',
                'scale' => 'Die Werte gelten für den vorliegenden Datenstand. Der Gegenstand ist skalierbar.',
                'details_description' => 'Setteile, Gegenstandswerte und belegte Bonusangaben.',
                'filter_note' => 'Filter beziehen sich auf die belegten Angaben der Setteile.',
            ],
            'en' => [
                'title' => 'Sets', 'intro' => 'Matching equipment and its set bonuses.',
                'search' => 'Search for a set or item', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'class' => 'Class', 'category' => 'Equipment type',
                'armour' => 'Armour type', 'level' => 'Required character level', 'from' => 'From', 'to' => 'To',
                'count' => '%s sets', 'parts' => '%s pieces', 'incomplete' => 'Incomplete item data',
                'empty' => 'No matching sets found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s', 'pieces' => 'Set pieces', 'bonuses' => 'Set bonuses',
                'threshold' => '%s pieces', 'unclear_threshold' => 'Unclear bonus requirement',
                'unresolved' => 'The value or effect cannot be fully resolved.',
                'scaling' => 'Level-dependent; no reliable numeric value is available.',
                'no_bonuses' => 'No bonus information in the available data.',
                'missing' => 'Item data is missing for this piece.', 'unnamed' => 'Name not recorded',
                'item' => 'View item', 'back' => 'All sets', 'unknown' => 'Unknown',
                'scale' => 'Values reflect the available data. This item scales with level.',
                'details_description' => 'Set pieces, item stats and recorded bonus information.',
                'filter_note' => 'Filters use the recorded properties of the set pieces.',
            ],
            'fr' => [
                'title' => 'Ensembles', 'intro' => 'Les pièces d’équipement assorties et leurs bonus d’ensemble.',
                'search' => 'Chercher un ensemble ou un objet', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'class' => 'Classe', 'category' => 'Type d’équipement',
                'armour' => 'Type d’armure', 'level' => 'Niveau de personnage requis', 'from' => 'De', 'to' => 'À',
                'count' => '%s ensembles', 'parts' => '%s pièces', 'incomplete' => 'Données d’objet incomplètes',
                'empty' => 'Aucun ensemble correspondant.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s', 'pieces' => 'Pièces de l’ensemble', 'bonuses' => 'Bonus d’ensemble',
                'threshold' => '%s pièces', 'unclear_threshold' => 'Condition du bonus incertaine',
                'unresolved' => 'La valeur ou l’effet ne peut pas être entièrement déterminé.',
                'scaling' => 'Dépend du niveau ; aucune valeur numérique fiable n’est disponible.',
                'no_bonuses' => 'Aucune information sur les bonus dans les données disponibles.',
                'missing' => 'Les données de cette pièce sont manquantes.', 'unnamed' => 'Nom non attesté',
                'item' => 'Voir l’objet', 'back' => 'Tous les ensembles', 'unknown' => 'Inconnu',
                'scale' => 'Les valeurs reflètent les données disponibles. Cet objet évolue avec le niveau.',
                'details_description' => 'Pièces, caractéristiques des objets et bonus attestés.',
                'filter_note' => 'Les filtres utilisent les propriétés attestées des pièces.',
            ],
        ][$lang];
    }

    /** Filters must all be witnessed by the SAME available piece. */
    public static function matches(array $set, array $filters): bool
    {
        $q = mb_strtolower($filters['q'] ?? '');
        if ($q !== '' && !str_contains(mb_strtolower($set['name'] . ' ' . implode(' ', array_column($set['members'], 'name'))), $q)) {
            return false;
        }
        $active = !empty($filters['class']) || !empty($filters['category']) || !empty($filters['armour'])
            || ($filters['from'] ?? '') !== '' || ($filters['to'] ?? '') !== '';
        if (!$active) {
            return true;
        }
        foreach ($set['members'] as $member) {
            if (!$member['available']) { continue; }
            if (!empty($filters['class']) && (!$member['class_known']
                || ($member['class'] !== null && !array_intersect($member['classes'] ?? [$member['class']], $filters['class'])))) { continue; }
            if (!empty($filters['category']) && !in_array($member['category'], $filters['category'], true)) { continue; }
            if (!empty($filters['armour']) && !in_array($member['armour'], $filters['armour'], true)) { continue; }
            if (($filters['from'] ?? '') !== '' && ($member['min_level'] === null || $member['min_level'] < (int) $filters['from'])) { continue; }
            if (($filters['to'] ?? '') !== '' && ($member['min_level'] === null || $member['min_level'] > (int) $filters['to'])) { continue; }
            return true;
        }
        return false;
    }

    private function query(array $input, array $labels): array
    {
        $out = ['q' => is_string($input['q'] ?? '') ? mb_substr(trim($input['q'] ?? ''), 0, 200) : ''];
        foreach (['class', 'category', 'armour'] as $key) {
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $out[$key] = array_values(array_filter(array_keys($labels[$key]), static fn ($v) => in_array($v, $values, true)));
        }
        foreach (['from', 'to'] as $key) {
            $v = $input[$key] ?? '';
            $out[$key] = is_scalar($v) && preg_match('/^\d{1,3}$/', (string) $v) ? (string) (int) $v : '';
        }
        return $out;
    }

    private function url(array $filters, int $page = 1, ?string $lang = null): string
    {
        $params = array_filter($filters, static fn ($value) => $value !== '' && $value !== []);
        if ($page > 1) { $params['page'] = $page; }
        return $this->catalogue->appRoute($lang ?? $this->lang, 'sets')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $canonical, array $alternates): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'sets');
        return [
            'lang' => $this->lang, 'kind' => 'set', 'w' => $this->shell->words(), 'sw' => $words,
            'page_seo' => ['title' => $name, 'description' => $words['details_description']],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates, 'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu('set'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => link_tag($base, $words['title']),
            'languages' => implode(' · ', array_map(static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $base,
        ];
    }

    public function listing(array $input): ?string
    {
        $index = $this->data->setIndex($this->lang);
        if (!$index) { return null; }
        $sets = $index['sets'];
        $labels = $index['labels'];
        $filters = $this->query($input, $labels);
        $selected = array_values(array_filter($sets, static fn ($s) => self::matches($s, $filters)));
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page = is_scalar($input['page'] ?? 1) ? filter_var($input['page'] ?? 1, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) { return null; }
        $facets = [];
        foreach (['class', 'category', 'armour'] as $key) {
            $options = [];
            foreach ($labels[$key] as $value => $label) {
                $candidate = $filters;
                $candidate[$key] = [$value];
                $count = count(array_filter($sets, static fn ($s) => self::matches($s, $candidate)));
                $checked = in_array($value, $filters[$key], true);
                if ($count || $checked) { $options[] = compact('value', 'label', 'count', 'checked'); }
            }
            usort($options, static fn ($a, $b) => strnatcasecmp($a['label'], $b['label']));
            $facets[$key] = $options;
        }
        // A translated search term may have fewer hits; never link to a page
        // number that does not exist after changing the language.
        $alternates = array_map(fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)], Catalogue::LANGS);
        $rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        foreach ($rows as &$row) {
            $row['url'] = $this->catalogue->route($this->lang, 'set', $row['id']);
            $classes = [];
            $armour = [];
            foreach ($row['members'] as $member) {
                if (!$member['available']) { continue; }
                foreach ($member['classes'] ?? [] as $code) {
                    if (isset($labels['class'][$code])) { $classes[$code] = $labels['class'][$code]; }
                }
                if (isset($labels['armour'][$member['armour'] ?? ''])) {
                    $armour[$member['armour']] = $labels['armour'][$member['armour']];
                }
            }
            $row['meta'] = implode(' · ', array_merge(array_values($classes), array_values($armour)));
        }
        unset($row);
        return $this->view->render('sets/list.twig', $this->context(self::words($this->lang)['title'], $this->url($filters, $page), $alternates) + [
            'filters' => $filters, 'facets' => $facets, 'sets' => $rows, 'count' => count($selected),
            'page_label' => sprintf(self::words($this->lang)['page'], $page, $pages),
            'noindex' => (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== []),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }

    public function detail(string $id): ?string
    {
        $set = $this->data->page($this->lang, 'set', $id);
        if (!$set) { return null; }
        $alternates = array_map(fn ($lang) => ['lang' => $lang, 'url' => $this->catalogue->route($lang, 'set', $id)], Catalogue::LANGS);
        return $this->view->render('sets/detail.twig', $this->context($set['name'], $this->catalogue->route($this->lang, 'set', $id), $alternates) + ['set' => $set]);
    }
}
