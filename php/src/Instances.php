<?php

declare(strict_types=1);

namespace Llb;

require_once __DIR__ . '/FilterModel.php';
require_once __DIR__ . '/Sortierung.php';

/**
 * Instance finder: explicit client picker membership, clusters and settings.
 * Character unlocks and current server availability are not inferred.
 */
final class Instances
{
    private const PAGE_SIZE = 200;

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
                'title' => 'Instanzenfinder', 'name' => 'Name', 'intro' => 'Finde Instanzen, Schlachtzüge, Scharmützel und epische Schlachten für deine Stufe und Gruppengröße.',
                'cluster' => 'Instanzgruppe', 'no_cluster' => 'Ohne Gruppe',
                'difficulty' => 'Schwierigkeit', 'tier' => 'T%s',
                'type_scharmuetzel' => 'Scharmützel', 'type_schlacht' => 'Epische Schlacht', 'type_team' => 'Team',
                'search' => 'Instanz suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                'wo' => 'Region und Landschaft',
                'count' => '%s Instanzen', 'count_one' => '1 Instanz',
                'empty' => 'Keine passende Instanz gefunden.', 'previous' => 'Zurück', 'next' => 'Weiter',
                'page' => 'Seite %s von %s',
                'level' => 'Stufe', 'from' => 'Von', 'to' => 'Bis',
                'players' => 'Spieler', 'players_n' => '%s Spieler', 'players_one' => '1 Spieler',
                'art' => 'Instanzart', 'mit_level' => 'Nur mit Stufenangabe',
                'type_instanz' => 'Instanz', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Öffentliche Instanz', 'type_offen' => 'Offene Instanz',
                'type_privat' => 'Privat-Instanz', 'type_zwischenspiel' => 'Zwischenspiel',
                'type_schlachtzug' => 'Schlachtzug', 'type_solo' => 'Solo-Instanz',
                'type_sonst' => 'Ohne Artangabe',
                'detail_type' => 'Instanz', 'cluster_label' => 'Instanzgruppe',
                'description_label' => 'Beschreibung', 'tasks' => 'Aufgaben in dieser Instanz',
                'loot' => 'Beute aus Truhen', 'map' => 'Innenkarte', 'no_tasks' => '',
                'enemies' => 'Gegner einblenden', 'bosses' => 'Bosse einblenden',
                'boss_chest' => 'Boss-Truhe',
                'enemies_count' => '%s Gegner',
                'species_count' => '%s Arten', 'quest_rewards' => 'Belohnungen aus Aufgaben',
                'loot_item' => 'Gegenstand', 'loot_chance' => 'Chance je Truhe',
                'tabs' => 'Inhalte der Instanz', 'task_tab' => 'Aufgaben',
                'reward_tab' => 'Belohnungen', 'loot_tab' => 'Beute', 'reward_quest' => 'Aufgabe',
                'level_range' => 'Stufe %s–%s', 'tier_range' => 'T%s–T%s',
                'group_range' => '%s Spieler',
                'condition_level' => 'Stufe %s', 'condition_tier' => 'T%s',
            ],
            'en' => [
                'title' => 'Instance Finder', 'name' => 'Name', 'intro' => 'Find instances, raids, skirmishes and epic battles for your level and group size.',
                'cluster' => 'Instance group', 'no_cluster' => 'No group',
                'difficulty' => 'Difficulty', 'tier' => 'T%s',
                'type_scharmuetzel' => 'Skirmish', 'type_schlacht' => 'Epic battle', 'type_team' => 'Team',
                'search' => 'Search for an instance', 'filter' => 'Filters', 'apply' => 'Apply',
                'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                'wo' => 'Region and landscape',
                'count' => '%s instances', 'count_one' => '1 instance',
                'empty' => 'No matching instance found.', 'previous' => 'Previous', 'next' => 'Next',
                'page' => 'Page %s of %s',
                'level' => 'Level', 'from' => 'From', 'to' => 'To',
                'players' => 'Players', 'players_n' => '%s players', 'players_one' => '1 player',
                'art' => 'Instance type', 'mit_level' => 'Only with a level',
                'type_instanz' => 'Instance', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Public instance', 'type_offen' => 'Open instance',
                'type_privat' => 'Private instance', 'type_zwischenspiel' => 'Interlude',
                'type_schlachtzug' => 'Raid', 'type_solo' => 'Solo instance',
                'type_sonst' => 'No type',
                'detail_type' => 'Instance', 'cluster_label' => 'Instance group',
                'description_label' => 'Description', 'tasks' => 'Quests in this instance',
                'loot' => 'Chest loot', 'map' => 'Interior map', 'no_tasks' => '',
                'enemies' => 'Show enemies', 'bosses' => 'Show bosses',
                'boss_chest' => 'Boss chest',
                'enemies_count' => '%s enemies',
                'species_count' => '%s species', 'quest_rewards' => 'Quest rewards',
                'loot_item' => 'Item', 'loot_chance' => 'Chance per chest',
                'tabs' => 'Instance contents', 'task_tab' => 'Quests',
                'reward_tab' => 'Rewards', 'loot_tab' => 'Loot', 'reward_quest' => 'Quest',
                'level_range' => 'Level %s–%s', 'tier_range' => 'T%s–T%s',
                'group_range' => '%s players',
                'condition_level' => 'Level %s', 'condition_tier' => 'T%s',
            ],
            'fr' => [
                'title' => 'Recherche d’instances', 'name' => 'Nom', 'intro' => 'Trouvez des instances, raids, escarmouches et batailles épiques selon votre niveau et la taille de votre groupe.',
                'cluster' => 'Groupe d’instances', 'no_cluster' => 'Sans groupe',
                'difficulty' => 'Difficulté', 'tier' => 'T%s',
                'type_scharmuetzel' => 'Escarmouche', 'type_schlacht' => 'Bataille épique', 'type_team' => 'Équipe',
                'search' => 'Chercher une instance', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Zone',
                'wo' => 'Région et zone',
                'count' => '%s instances', 'count_one' => '1 instance',
                'empty' => 'Aucune instance correspondante.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'level' => 'Niveau', 'from' => 'De', 'to' => 'À',
                'players' => 'Joueurs', 'players_n' => '%s joueurs', 'players_one' => '1 joueur',
                'art' => 'Type d’instance', 'mit_level' => 'Avec un niveau uniquement',
                'type_instanz' => 'Instance', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Instance publique', 'type_offen' => 'Instance ouverte',
                'type_privat' => 'Instance privée', 'type_zwischenspiel' => 'Interlude',
                'type_schlachtzug' => 'Raid', 'type_solo' => 'Instance solo',
                'type_sonst' => 'Sans type',
                'detail_type' => 'Instance', 'cluster_label' => 'Groupe d’instances',
                'description_label' => 'Description', 'tasks' => 'Quêtes de cette instance',
                'loot' => 'Butin des coffres', 'map' => 'Carte intérieure', 'no_tasks' => '',
                'enemies' => 'Afficher les ennemis', 'bosses' => 'Afficher les boss',
                'boss_chest' => 'Coffre de boss',
                'enemies_count' => '%s ennemis',
                'species_count' => '%s espèces', 'quest_rewards' => 'Récompenses de quête',
                'loot_item' => 'Objet', 'loot_chance' => 'Chance par coffre',
                'tabs' => 'Contenu de l’instance', 'task_tab' => 'Quêtes',
                'reward_tab' => 'Récompenses', 'loot_tab' => 'Butin', 'reward_quest' => 'Quête',
                'level_range' => 'Niveau %s–%s', 'tier_range' => 'T%s–T%s',
                'group_range' => '%s joueurs',
                'condition_level' => 'Niveau %s', 'condition_tier' => 'T%s',
            ],
        ][$lang];
    }

    /** Search, place, level range, group size and kind. */
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
        if (($f['cluster'] ?? []) && !in_array($row['cluster_id'], $f['cluster'], true)) {
            return false;
        }
        if (($f['art'] ?? []) && !in_array($row['type'], $f['art'], true)) {
            return false;
        }
        if (($f['spieler'] ?? []) && !array_intersect($row['group_sizes'], $f['spieler'])) {
            return false;
        }
        if (($f['tier'] ?? []) && !array_intersect($row['difficulties'], $f['tier'])) {
            return false;
        }
        $von = ($f['von'] ?? '') === '' ? null : (int) $f['von'];
        $bis = ($f['bis'] ?? '') === '' ? null : (int) $f['bis'];
        if ($von === null && $bis === null) {
            return true;
        }
        if ($row['level'] === null) {
            return false;
        }
        // Match overlapping playable ranges, not only the minimum level.
        if ($von !== null && ($row['level_max'] ?? $row['level']) < $von) {
            return false;
        }
        if ($bis !== null && $row['level'] > $bis) {
            return false;
        }
        return true;
    }

    /** Flat alphabetical list; cluster is already an explicit filter. */
    public static function sorted(array $rows, string $dir = 'asc'): array
    {
        usort($rows, static function (array $a, array $b) use ($dir): int {
            $name = Sortierung::name($a['name'], $b['name']);
            if ($name !== 0) {
                return $dir === 'desc' ? -$name : $name;
            }
            return strcmp($a['id'], $b['id']);
        });
        return $rows;
    }

    private function query(array $input, array $labels, array $rows): array
    {
        $out = ['q' => is_string($input['q'] ?? '') ? mb_substr(trim($input['q'] ?? ''), 0, 200) : ''];
        foreach (['cluster'] as $key) {
            // Only values that really occur: a stale link with an id no row
            // carries must not turn the page into an empty dead end.
            $allowed = array_values(array_unique(array_column($rows, $key === 'cluster' ? 'cluster_id' : $key)));
            $allowed = array_values(array_filter($allowed, static fn ($v) => $v !== null));
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $werte = array_map('intval', array_filter($values, 'is_scalar'));
            $out[$key] = array_values(array_filter($allowed, static fn ($v) => in_array($v, $werte, true)));
        }
        $arten = array_values(array_unique(array_column($rows, 'type')));
        $werte = $input['art'] ?? [];
        $werte = is_array($werte) ? $werte : [$werte];
        $out['art'] = array_values(array_filter($arten, static fn ($v) => in_array($v, $werte, true)));
        foreach (['spieler' => 'group_sizes', 'tier' => 'difficulties'] as $key => $column) {
            $allowed = self::arrayValues($rows, $column);
            $values = $input[$key] ?? [];
            $values = is_array($values) ? $values : [$values];
            $values = array_map('intval', array_filter($values, 'is_scalar'));
            $out[$key] = array_values(array_intersect($allowed, $values));
        }
        foreach (['von', 'bis'] as $key) {
            $wert = $input[$key] ?? '';
            $out[$key] = is_scalar($wert) && preg_match('/^\d{1,3}$/', (string) $wert)
                ? (string) (int) $wert : '';
        }
        return $out;
    }

    private static function arrayValues(array $rows, string $column): array
    {
        $values = array_values(array_unique(array_merge([], ...array_column($rows, $column))));
        sort($values);
        return $values;
    }

    private function params(array $f, int $page = 1, string $sort = 'name', string $dir = 'asc'): array
    {
        $params = array_filter($f, static fn ($value) => $value !== '' && $value !== []);
        if ($page > 1) {
            $params['page'] = $page;
        }
        if ($sort !== 'name' || $dir === 'desc') {
            $params['sort'] = ($dir === 'desc' ? '-' : '') . $sort;
        }
        return $params;
    }

    private function url(array $filters, int $page = 1, ?string $lang = null,
                         string $sort = 'name', string $dir = 'asc'): string
    {
        $params = $this->params($filters, $page, $sort, $dir);
        return $this->catalogue->appRoute($lang ?? $this->lang, 'instances')
            . ($params ? '?' . http_build_query($params) : '');
    }

    private function context(string $name, string $description, string $canonical,
                             array $alternates, bool $noindex = false): array
    {
        $words = self::words($this->lang);
        $base = $this->catalogue->appRoute($this->lang, 'instances');
        return [
            'lang' => $this->lang, 'kind' => '', 'w' => $this->shell->words(), 'iw' => $words,
            'page_seo' => ['title' => $name, 'description' => $description],
            'base' => $this->catalogue->base, 'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book', 'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(), 'scripts' => $this->shell->scripts(),
            'asset_stand' => $this->shell->assetStand(),
            'menu' => $this->shell->menu('instances'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => $this->shell->crumbHtml($this->shell->appCrumbs('instances')),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $base, 'noindex' => $noindex,
        ];
    }

    public function listing(array $input): ?string
    {
        $index = $this->data->instanceIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['instances'];
        $filters = $this->query($input, $labels, $rows);
        $sort_dir = 'asc';
        $raw_sort = is_string($input['sort'] ?? '') ? trim($input['sort'] ?? '') : '';
        if ($raw_sort === '-name') {
            $sort_dir = 'desc';
        } elseif ($raw_sort !== '' && $raw_sort !== 'name') {
            return null;
        }
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected, $sort_dir);
        $pages = max(1, (int) ceil(count($selected) / self::PAGE_SIZE));
        $page = is_scalar($input['page'] ?? 1) ? filter_var($input['page'] ?? 1, FILTER_VALIDATE_INT) : false;
        if ($page === false || $page < 1 || $page > $pages) {
            return null;
        }

        $facets = [];
        foreach (['cluster', 'art', 'spieler', 'tier'] as $key) {
            $options = [];
            $werte = match ($key) {
                'cluster' => array_values(array_unique(array_column($rows, 'cluster_id'))),
                'art' => array_values(array_unique(array_column($rows, 'type'))),
                'tier' => self::arrayValues($rows, 'difficulties'),
                default => self::arrayValues($rows, 'group_sizes'),
            };
            foreach ($werte as $value) {
                $candidate = $filters;
                $candidate[$key] = [$key !== 'art'
                    ? (int) $value : (string) $value];
                $count = count(array_filter($rows, fn ($row) => self::matches($row, $candidate)));
                $checked = in_array($candidate[$key][0], $filters[$key], true);
                if ($count || $checked) {
                    $label = match ($key) {
                        'cluster' => $labels['cluster'][$value] ?? $words['no_cluster'],
                        'tier' => str_replace('%s', (string) $value, $words['tier']),
                        'art' => $words['type_' . $value] ?? $value,
                        default => $value === 1 ? $words['players_one']
                            : str_replace('%s', (string) $value, $words['players_n']),
                    };
                    $options[] = ['value' => $value, 'label' => $label,
                                  'count' => $count, 'checked' => $checked];
                }
            }
            if ($key === 'cluster' || $key === 'art') {
                usort($options, static fn ($a, $b) => Sortierung::name($a['label'], $b['label']));
            }
            $facets[$key] = $options;
        }
        $page_rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        foreach ($page_rows as &$row) {
            $row['url'] = $this->catalogue->route($this->lang, 'instance', $row['id']);
            $row['icon'] = 'instance';
            $row['cluster_url'] = $row['cluster_id']
                ? $this->url(array_merge($filters, ['cluster' => [$row['cluster_id']]])) : null;
            $teile = $row['type'] === 'sonst' ? [] : [$words['type_' . $row['type']] ?? $row['type']];
            $range = (string) $row['level'];
            if ($row['level_max'] !== null && $row['level_max'] !== $row['level']) {
                $range .= '–' . $row['level_max'];
            }
            if ($row['level'] !== null) { $teile[] = $words['level'] . ' ' . $range; }
            if ($row['group_sizes']) {
                $teile[] = str_replace('%s', implode(' / ', $row['group_sizes']), $words['players_n']);
            }
            if ($row['difficulties']) {
                $teile[] = implode(' / ', array_map(
                    static fn ($tier) => str_replace('%s', (string) $tier, $words['tier']), $row['difficulties']));
            }
            $row['meta'] = implode(' · ', $teile);
        }
        unset($row);

        $toOption = static fn (array $option): array => [
            'value' => (string) $option['value'],
            'label' => $option['label'],
            'count' => (int) $option['count'],
            'checked' => (bool) $option['checked'],
        ];
        $definition = [
            'area' => 'instanzen',
            'lang' => $this->lang,
            'groups' => [
                ['id' => 'cluster', 'kind' => 'multi', 'label' => $words['cluster'],
                 'options' => array_map($toOption, $facets['cluster'])],
                ['id' => 'art', 'kind' => 'multi', 'label' => $words['art'],
                 'options' => array_map($toOption, $facets['art'])],
                ['id' => 'level', 'kind' => 'range', 'label' => $words['level'],
                 'paramMin' => 'von', 'paramMax' => 'bis', 'min' => 0, 'max' => 999],
                ['id' => 'spieler', 'kind' => 'multi', 'label' => $words['players'],
                 'options' => array_map($toOption, $facets['spieler'])],
                ['id' => 'tier', 'kind' => 'multi', 'label' => $words['difficulty'],
                 'options' => array_map($toOption, $facets['tier'])],
            ],
            'sort' => ['standard' => 'name', 'keys' => ['name'],
                       'ersteRichtung' => ['name' => 'asc'], 'options' => []],
            'columns' => [['label' => $words['name'], 'sortierung' => 'name']],
            'pagination' => ['kind' => 'page', 'size' => self::PAGE_SIZE],
            'countLabel' => $words['count'],
        ];
        $model_facets = [];
        foreach (['cluster', 'art', 'spieler', 'tier'] as $id) {
            $model_facets[$id] = array_map(
                static fn (array $option): array =>
                    ['value' => (string) $option['value'], 'count' => (int) $option['count']],
                $facets[$id] ?? []
            );
        }
        $model = FilterModel::response(
            $definition,
            [
                'q' => $filters['q'],
                'filters' => [
                    'cluster' => array_map('strval', $filters['cluster']),
                    'art' => array_values($filters['art']),
                    'spieler' => array_map('strval', $filters['spieler']),
                    'tier' => array_map('strval', $filters['tier']),
                    'level' => [
                        'min' => $filters['von'] === '' ? null : (int) $filters['von'],
                        'max' => $filters['bis'] === '' ? null : (int) $filters['bis'],
                    ],
                ],
                'sort' => 'name',
                'sortDir' => $sort_dir,
                'pagination' => ['kind' => 'page', 'page' => $page],
            ],
            $model_facets,
            count($selected),
            ['kind' => 'page', 'page' => $page, 'pages' => $pages, 'hasMore' => $page < $pages],
        );

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang, 'name', $sort_dir)],
            Catalogue::LANGS);
        return $this->view->render('instances/list.twig', $this->context(
            // Folgeseiten nennen ihre Seite, sonst tragen sie den Text der ersten.
            $page > 1 ? $words['title'] . ' – ' . sprintf($words['page'], $page, $pages) : $words['title'],
            $page > 1 ? $words['intro'] . ' ' . sprintf($words['page'], $page, $pages) . '.' : $words['intro'],
            $this->url($filters, $page, null, 'name', $sort_dir), $alternates,
            $sort_dir === 'desc' || (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'instances' => $page_rows,
            'instance_groups' => [['name' => '', 'rows' => $page_rows]],
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1, null, 'name', $sort_dir) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1, null, 'name', $sort_dir) : null,
            'filter_model_json' => FilterModel::json($model),
            'sort_url' => $this->url($filters, 1, null, 'name', $sort_dir === 'asc' ? 'desc' : 'asc'),
            'sort_aria' => $sort_dir === 'asc' ? 'ascending' : 'descending',
            'sort_arrow' => $sort_dir === 'asc' ? '↑' : '↓',
        ]);
    }

    public function detail(string $identifier): ?string
    {
        $page = $this->data->instanceDetail($this->lang, $identifier);
        if ($page === null) {
            return null;
        }
        $words = self::words($this->lang);
        $alternates = array_map(fn ($lang) => [
            'lang' => $lang, 'url' => $this->catalogue->route($lang, 'instance', $identifier),
        ], Catalogue::LANGS);
        $base = $this->catalogue->appRoute($this->lang, 'instances');
        $related = (new RelatedLists($this->data, $this->lang, $this->catalogue))
            ->forPage('instance', [
                'related_quests' => array_column($page['tasks'], 'id'),
                'related_label' => $words['tasks'],
            ]);
        $baseContext = $this->context(
            $page['name'], $page['description_seo'] ?: $words['intro'],
            $this->catalogue->route($this->lang, 'instance', $identifier), $alternates
        );
        $lists = [
            'aufgaben' => $related['q']['rows'] ?? [],
            'aufgabenbelohnungen' => $page['quest_rewards'],
            'truhenbeute' => $page['chest_loot'],
        ];
        return $this->view->render('instances/detail.twig', $baseContext + [
            'iw' => $words, 'page' => $page, 'icon' => 'instance',
            'canonical_url' => $this->catalogue->route($this->lang, 'instance', $identifier),
            'crumbs' => $this->shell->crumbHtml($this->shell->appCrumbs('instances')),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'instance_list_url' => $base,
            'task_fallback' => $related['q']['fallback'] ?? [],
            'related_direct_list_max' => FilterRegeln::MAX_DIREKTLISTE,
            'instance_list_data' => json_encode($lists, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR),
        ]);
    }
}
