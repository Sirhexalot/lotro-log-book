<?php

declare(strict_types=1);

namespace Llb;

/**
 * Server-rendered quest givers: a small filter index, shards for the details.
 *
 * The index holds one row per giver with the compact quest facts the filters
 * need, so a request reads one file. A filter on level and a filter on a quest
 * fact must be met by the same quest; a place filter is met by any place of
 * the giver.
 */
final class Givers
{
    private const PAGE_SIZE = 30;

    /** Quest facts as bits, in the same order as the generator's index. */
    private const FLAGS = [
        'dy' => 1, 'rp' => 2, 'gr' => 4, 'ix' => 8, 'ls' => 16,
    ];

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
                'title' => 'Auftraggeber', 'intro' => 'Wer welche Aufgaben vergibt – mit Standort, Karte und allen zugehörigen Aufgaben.',
                'search' => 'Auftraggeber oder Aufgabe suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                'kind' => 'Art', 'level' => 'Aufgabenstufe', 'from' => 'Von', 'to' => 'Bis',
                'tag' => 'Aufgabenmerkmale', 'count' => '%s Auftraggeber', 'count_one' => '1 Auftraggeber',
                'quests' => '%s Aufgaben', 'quests_one' => '1 Aufgabe',
                'empty' => 'Keine passenden Auftraggeber gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s',
                'kind_person' => 'Person', 'kind_creature' => 'Kreatur', 'kind_object' => 'Gegenstand',
                'kind_unknown' => 'Art nicht belegt',
                'tag_dy' => 'täglich', 'tag_rp' => 'wiederholbar', 'tag_gr' => 'Gruppe',
                'tag_ix' => 'Instanz', 'tag_ls' => 'skaliert mit der Stufe',
                'filter_note' => 'Die Filter beziehen sich auf die belegten Aufgaben und Standorte.',
                'sort' => 'Sortierung', 'sort_name' => 'Name', 'sort_level' => 'Stufe',
                'wo' => 'Region und Landschaft',
                'same_name' => 'Weitere Einträge mit diesem Namen',
                'same_name_all' => 'Alle Einträge mit diesem Namen',
                'unknown_place' => 'Ort nicht belegt',
                'occupation' => 'Tätigkeit', 'places' => 'Standort', 'no_place' => 'Kein Standort in den Spieldaten belegt.',
                'no_map' => 'Keine Karte zugeordnet', 'map' => 'Auf Karte zeigen', 'route' => 'Route planen',
                'greeting' => 'Begrüßung', 'greeting_hint' => 'Text aus dem Spiel, kann Handlung verraten.',
                'background' => 'Hintergrund', 'quests_heading' => 'Aufgaben dieses Auftraggebers',
                'level_short' => 'Stufe', 'done' => 'Erledigt', 'open' => 'Nicht als erledigt importiert',
                'hide_done' => 'Erledigte ausblenden', 'progress' => '%s von %s als erledigt importiert',
                'progress_unknown' => 'Kein Charakter importiert – der Abschluss ist nicht bekannt.',
                'seo_detail' => 'Standort, Karte und alle Aufgaben von %s.',
                'game_text' => 'Text aus dem Spiel.', 'one_place' => 'Standort', 'more_places' => 'Weitere Standorte',
                'back' => 'Alle Auftraggeber', 'unnamed' => 'Name nicht belegt',
            ],
            'en' => [
                'title' => 'Quest givers', 'intro' => 'Who gives which quests – with location, map and every related quest.',
                'search' => 'Search for a quest giver or quest', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                'kind' => 'Type', 'level' => 'Quest level', 'from' => 'From', 'to' => 'To',
                'tag' => 'Quest properties', 'count' => '%s quest givers', 'count_one' => '1 quest giver',
                'quests' => '%s quests', 'quests_one' => '1 quest',
                'empty' => 'No matching quest givers found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s',
                'kind_person' => 'Person', 'kind_creature' => 'Creature', 'kind_object' => 'Object',
                'kind_unknown' => 'Type not recorded',
                'tag_dy' => 'daily', 'tag_rp' => 'repeatable', 'tag_gr' => 'group',
                'tag_ix' => 'instance', 'tag_ls' => 'scales with level',
                'filter_note' => 'Filters use the recorded quests and locations.',
                'sort' => 'Sort', 'sort_name' => 'Name', 'sort_level' => 'Level',
                'wo' => 'Region and landscape',
                'same_name' => 'Further entries with this name',
                'same_name_all' => 'All entries with this name',
                'unknown_place' => 'Place not recorded',
                'occupation' => 'Occupation', 'places' => 'Location', 'no_place' => 'No location is recorded in the game data.',
                'no_map' => 'No map assigned', 'map' => 'Show on map', 'route' => 'Plan a route',
                'greeting' => 'Greeting', 'greeting_hint' => 'Text from the game; it may reveal the story.',
                'background' => 'Background', 'quests_heading' => 'Quests from this giver',
                'level_short' => 'Level', 'done' => 'Completed', 'open' => 'Not imported as completed',
                'hide_done' => 'Hide completed', 'progress' => '%s of %s imported as completed',
                'progress_unknown' => 'No character imported – completion is unknown.',
                'seo_detail' => 'Location, map and every quest from %s.',
                'game_text' => 'Text from the game.', 'one_place' => 'Location', 'more_places' => 'Further locations',
                'back' => 'All quest givers', 'unnamed' => 'Name not recorded',
            ],
            'fr' => [
                'title' => 'Donneurs de quête', 'intro' => 'Qui donne quelles quêtes – avec lieu, carte et toutes les quêtes associées.',
                'search' => 'Chercher un donneur de quête ou une quête', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                'kind' => 'Type', 'level' => 'Niveau de quête', 'from' => 'De', 'to' => 'À',
                'tag' => 'Caractéristiques', 'count' => '%s donneurs de quête', 'count_one' => '1 donneur de quête',
                'quests' => '%s quêtes', 'quests_one' => '1 quête',
                'empty' => 'Aucun donneur de quête correspondant.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'kind_person' => 'Personne', 'kind_creature' => 'Créature', 'kind_object' => 'Objet',
                'kind_unknown' => 'Type non attesté',
                'tag_dy' => 'quotidienne', 'tag_rp' => 'répétable', 'tag_gr' => 'groupe',
                'tag_ix' => 'instance', 'tag_ls' => 'évolue avec le niveau',
                'filter_note' => 'Les filtres reposent sur les quêtes et lieux attestés.',
                'sort' => 'Tri', 'sort_name' => 'Nom', 'sort_level' => 'Niveau',
                'wo' => 'Région et pays',
                'same_name' => 'Autres entrées portant ce nom',
                'same_name_all' => 'Toutes les entrées portant ce nom',
                'unknown_place' => 'Lieu non attesté',
                'occupation' => 'Profession', 'places' => 'Lieu', 'no_place' => 'Aucun lieu n’est attesté dans les données du jeu.',
                'no_map' => 'Aucune carte associée', 'map' => 'Voir sur la carte', 'route' => 'Planifier un trajet',
                'greeting' => 'Salutation', 'greeting_hint' => 'Texte du jeu, peut dévoiler l’intrigue.',
                'background' => 'Contexte', 'quests_heading' => 'Quêtes de ce donneur',
                'level_short' => 'Niveau', 'done' => 'Terminée', 'open' => 'Non importée comme terminée',
                'hide_done' => 'Masquer les quêtes terminées', 'progress' => '%s sur %s importées comme terminées',
                'progress_unknown' => 'Aucun personnage importé – l’achèvement n’est pas connu.',
                'seo_detail' => 'Lieu, carte et toutes les quêtes de %s.',
                'game_text' => 'Texte du jeu.', 'one_place' => 'Lieu', 'more_places' => 'Autres lieux',
                'back' => 'Tous les donneurs de quête', 'unnamed' => 'Nom non attesté',
            ],
        ][$lang];
    }

    /** Localized label of a giver kind or a quest fact. */
    private static function label(array $words, string $key): string
    {
        return $words['kind_' . $key] ?? $words['tag_' . $key] ?? $key;
    }

    /**
     * Level and quest facts must be met by the SAME quest; a place filter by
     * any place of the giver. Unknown values never count as a match.
     */
    public static function matches(array $row, array $f): bool
    {
        $q = mb_strtolower($f['q'] ?? '');
        if ($q !== '' && !str_contains($row['search'], $q)) {
            return false;
        }
        if (($f['region'] ?? []) && !array_intersect(array_column($row['places'], 0), $f['region'])) {
            return false;
        }
        if (($f['area'] ?? []) && !array_intersect(array_column($row['places'], 1), $f['area'])) {
            return false;
        }
        if (($f['kind'] ?? []) && !in_array($row['kind'], $f['kind'], true)) {
            return false;
        }
        $from = ($f['from'] ?? '') === '' ? null : (int) $f['from'];
        $to = ($f['to'] ?? '') === '' ? null : (int) $f['to'];
        $bits = 0;
        foreach (self::FLAGS as $key => $bit) {
            if (in_array($key, $f['tag'] ?? [], true)) {
                $bits |= $bit;
            }
        }
        if ($from === null && $to === null && $bits === 0) {
            return true;
        }
        foreach ($row['quests'] as [$id, $level, $mask]) {
            if ($from !== null && ($level === 0 || $level < $from)) {
                continue;
            }
            if ($to !== null && ($level === 0 || $level > $to)) {
                continue;
            }
            if (($mask & $bits) === $bits) {
                return true;
            }
        }
        return false;
    }

    /**
     * Name or quest level. A giver without a recorded level sorts last; equal
     * levels fall back to the name. Sorting happens before pagination.
     */
    public static function sorted(array $rows, string $sort): array
    {
        usort($rows, static function (array $a, array $b) use ($sort): int {
            if ($sort === 'stufe') {
                $al = $a['low'];
                $bl = $b['low'];
                if ($al === null && $bl !== null) {
                    return 1;
                }
                if ($al !== null && $bl === null) {
                    return -1;
                }
                if ($al !== $bl) {
                    return $al <=> $bl;
                }
            }
            return strnatcasecmp($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']);
        });
        return $rows;
    }

    private function query(array $input, array $labels): array
    {
        $out = ['q' => is_string($input['q'] ?? '') ? mb_substr(trim($input['q'] ?? ''), 0, 200) : ''];
        $known = [
            'region' => array_map('strval', array_keys($labels['region'])),
            'area' => array_map('strval', array_keys($labels['area'])),
            'kind' => array_keys($labels['kind']),
            'tag' => array_keys(self::FLAGS),
        ];
        foreach ($known as $key => $allowed) {
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $values = array_map('strval', $values);
            $out[$key] = array_values(array_filter($allowed, static fn ($v) => in_array((string) $v, $values, true)));
        }
        foreach (['from', 'to'] as $key) {
            $value = $input[$key] ?? '';
            $out[$key] = is_scalar($value) && preg_match('/^\d{1,3}$/', (string) $value)
                ? (string) (int) $value : '';
        }
        $sort = $input['sort'] ?? '';
        $out['sort'] = $sort === 'stufe' ? 'stufe' : '';
        // A region id is an integer in the index; keep the query strings equal.
        $out['region'] = array_map('intval', $out['region']);
        $out['area'] = array_map('intval', array_filter($out['area']));
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
        return $this->catalogue->appRoute($lang ?? $this->lang, 'givers')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'givers');
        return [
            'lang' => $this->lang, 'kind' => 'giver', 'w' => $this->shell->words(), 'gw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'menu' => $this->shell->menu('giver'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
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
        $index = $this->data->giverIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['givers'];
        $filters = $this->query($input, $labels);
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected, $filters['sort']);
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page = is_scalar($input['page'] ?? 1) ? filter_var($input['page'] ?? 1, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) {
            return null;
        }
        $facets = [];
        foreach (['region', 'area', 'kind', 'tag'] as $key) {
            $options = [];
            $values = match ($key) {
                'region' => array_map('strval', array_keys($labels['region'])),
                'area' => array_map('strval', array_keys($labels['area'])),
                'kind' => array_keys($labels['kind']),
                default => array_keys(self::FLAGS),
            };
            foreach ($values as $value) {
                $candidate = $filters;
                $candidate[$key] = in_array($key, ['region', 'area'], true) ? [(int) $value] : [$value];
                $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
                $checked = in_array($key, ['region', 'area'], true)
                    ? in_array((int) $value, $filters[$key], true)
                    : in_array($value, $filters[$key], true);
                if ($count || $checked) {
                    $label = $key === 'region' || $key === 'area'
                        ? ($labels[$key][$value] ?? $value) : self::label($words, $value);
                    $options[] = compact('value', 'label', 'count', 'checked');
                }
            }
            usort($options, static fn ($a, $b) => strnatcasecmp($a['label'], $b['label']));
            $facets[$key] = $options;
        }
        $page_rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        // Areas are shown under their region, like the item search tree.
        $area_by_region = [];
        $area_rest = [];
        foreach ($facets['area'] as $option) {
            $region = $labels['area_region'][(string) $option['value']] ?? null;
            if ($region === null) {
                $area_rest[] = $option;
            } else {
                $area_by_region[(string) $region][] = $option;
            }
        }
        foreach ($page_rows as &$row) {
            $row['url'] = $this->catalogue->route($this->lang, 'giver', $row['id']);
            $names = [];
            foreach ($row['places'] as $pair) {
                $name = $labels['area'][(string) $pair[1]] ?? $labels['region'][(string) $pair[0]] ?? null;
                if ($name && !in_array($name, $names, true)) {
                    $names[] = $name;
                }
            }
            $row['places_text'] = implode(' · ', array_slice($names, 0, 3))
                . (count($names) > 3 ? ' …' : '');
            $parts = [$row['kind_text'] = self::label($words, $row['kind'])];
            if ($row['title']) {
                $parts[] = $row['title'];
            }
            if ($row['places_text'] !== '') {
                $parts[] = $row['places_text'];
            }
            if ($row['low'] !== null) {
                $parts[] = $words['level_short'] . ' ' . $row['low']
                    . ($row['high'] > $row['low'] ? '–' . $row['high'] : '');
            }
            $parts[] = str_replace('%s', (string) $row['count'],
                $row['count'] === 1 ? $words['quests_one'] : $words['quests']);
            $row['meta'] = implode(' · ', $parts);
        }
        unset($row);
        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        return $this->view->render('givers/list.twig', $this->context(
            $words['title'], $words['intro'], $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'givers' => $page_rows,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'sort_name_url' => $this->url(array_merge($filters, ['sort' => '']), 1),
            'sort_level_url' => $this->url(array_merge($filters, ['sort' => 'stufe']), 1),
            'sort_active' => $filters['sort'],
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }

    public function detail(string $id): ?string
    {
        $giver = $this->data->page($this->lang, 'giver', $id);
        if (!$giver) {
            return null;
        }
        $words = self::words($this->lang);
        foreach ($giver['places'] as &$place) {
            foreach ($place['chain'] as &$part) {
                $kind = $part['tier'] === 1 ? 'region' : 'area';
                $part['url'] = $this->catalogue->route($this->lang, $kind, (string) $part['id']);
            }
            unset($part);
        }
        unset($place);
        $alternates = [];
        foreach (Catalogue::LANGS as $lang) {
            if ($this->data->has($lang, 'giver', $id)) {
                $alternates[] = ['lang' => $lang, 'url' => $this->catalogue->route($lang, 'giver', $id)];
            }
        }
        return $this->view->render('givers/detail.twig', $this->context(
            $giver['name'], sprintf($words['seo_detail'], $giver['name']),
            $this->catalogue->route($this->lang, 'giver', $id), $alternates
        ) + ['giver' => $giver, 'kind_words' => $words]);
    }
}
