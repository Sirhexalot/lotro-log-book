<?php

declare(strict_types=1);

namespace Llb;

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
                'title' => 'Instanzenfinder', 'intro' => 'Finde Instanzen, Schlachtzüge, Scharmützel und epische Schlachten – nach den Clustern des Instanzenfinders im Spiel.',
                'cluster' => 'Instanzcluster', 'no_cluster' => 'Ohne Cluster',
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
                'art' => 'Art', 'mit_level' => 'Nur mit belegter Stufe',
                'filter_note' => 'Gruppengrößen und Stufenspannen stammen aus dem Spielclient. Serverregeln können abweichen; dein Zugang wird hier nicht geprüft.',
                'no_level' => 'Stufe nicht belegt', 'no_place' => 'Ort nicht belegt',
                'type_instanz' => 'Instanz', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Öffentliche Instanz', 'type_offen' => 'Offene Instanz',
                'type_privat' => 'Privat-Instanz', 'type_zwischenspiel' => 'Zwischenspiel',
                'type_schlachtzug' => 'Schlachtzug', 'type_solo' => 'Solo-Instanz',
                'type_sonst' => 'Ohne Artangabe',
            ],
            'en' => [
                'title' => 'Instance Finder', 'intro' => 'Find instances, raids, skirmishes and epic battles, grouped by the clusters in the in-game Instance Finder.',
                'cluster' => 'Instance cluster', 'no_cluster' => 'No cluster',
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
                'art' => 'Type', 'mit_level' => 'Only with a recorded level',
                'filter_note' => 'Group sizes and level ranges come from the game client. Server rules may differ; your access is not checked here.',
                'no_level' => 'Level not recorded', 'no_place' => 'Place not recorded',
                'type_instanz' => 'Instance', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Public instance', 'type_offen' => 'Open instance',
                'type_privat' => 'Private instance', 'type_zwischenspiel' => 'Interlude',
                'type_schlachtzug' => 'Raid', 'type_solo' => 'Solo instance',
                'type_sonst' => 'Type not recorded',
            ],
            'fr' => [
                'title' => 'Recherche d’instances', 'intro' => 'Trouvez des instances, raids, escarmouches et batailles épiques, regroupés comme dans la recherche d’instances du jeu.',
                'cluster' => 'Groupe d’instances', 'no_cluster' => 'Sans groupe',
                'difficulty' => 'Difficulté', 'tier' => 'T%s',
                'type_scharmuetzel' => 'Escarmouche', 'type_schlacht' => 'Bataille épique', 'type_team' => 'Équipe',
                'search' => 'Chercher une instance', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                'wo' => 'Région et pays',
                'count' => '%s instances', 'count_one' => '1 instance',
                'empty' => 'Aucune instance correspondante.', 'previous' => 'Précédent', 'next' => 'Suivant',
                'page' => 'Page %s sur %s',
                'level' => 'Niveau', 'from' => 'De', 'to' => 'À',
                'players' => 'Joueurs', 'players_n' => '%s joueurs', 'players_one' => '1 joueur',
                'art' => 'Type', 'mit_level' => 'Uniquement avec niveau attesté',
                'filter_note' => 'Les tailles de groupe et niveaux viennent du client du jeu. Les règles du serveur peuvent différer ; votre accès n’est pas vérifié ici.',
                'no_level' => 'Niveau non attesté', 'no_place' => 'Lieu non attesté',
                'type_instanz' => 'Instance', 'type_mission' => 'Mission',
                'type_oeffentlich' => 'Instance publique', 'type_offen' => 'Instance ouverte',
                'type_privat' => 'Instance privée', 'type_zwischenspiel' => 'Interlude',
                'type_schlachtzug' => 'Raid', 'type_solo' => 'Instance solo',
                'type_sonst' => 'Type non attesté',
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

    /** Name, then the id so equal names keep a stable order. */
    public static function sorted(array $rows): array
    {
        usort($rows, static fn (array $a, array $b): int =>
            (($a['cluster_id'] === 0) <=> ($b['cluster_id'] === 0))
            ?: strnatcasecmp($a['cluster'] ?? '', $b['cluster'] ?? '')
            ?: strnatcasecmp($a['group'] ?: $a['name'], $b['group'] ?: $b['name'])
            ?: strnatcasecmp($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']));
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
            'menu' => $this->shell->menu('instances'), 'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
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
        $index = $this->data->instanceIndex($this->lang);
        if (!$index) {
            return null;
        }
        $words = self::words($this->lang);
        $labels = $index['labels'];
        $rows = $index['instances'];
        $filters = $this->query($input, $labels, $rows);
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected);
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
                usort($options, static fn ($a, $b) => strnatcasecmp($a['label'], $b['label']));
            }
            $facets[$key] = $options;
        }
        $page_rows = array_slice($selected, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE);
        foreach ($page_rows as &$row) {
            $row['url'] = $row['quest']
                ? $this->catalogue->route($this->lang, 'q', $row['quest']) : null;
            $teile = [$words['type_' . $row['type']] ?? $row['type']];
            $range = (string) $row['level'];
            if ($row['level_max'] !== null && $row['level_max'] !== $row['level']) {
                $range .= '–' . $row['level_max'];
            }
            $teile[] = $row['level'] !== null ? $words['level'] . ' ' . $range : $words['no_level'];
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
        $groups = [];
        foreach ($page_rows as $row) {
            $cluster = $row['cluster_id'];
            if (!isset($groups[$cluster])) {
                $groups[$cluster] = ['name' => $row['cluster'] ?: $words['no_cluster'], 'rows' => []];
            }
            $groups[$cluster]['rows'][] = $row;
        }

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang)],
            Catalogue::LANGS);
        return $this->view->render('instances/list.twig', $this->context(
            $words['title'], $words['intro'], $this->url($filters, $page), $alternates,
            (bool) array_filter($filters, static fn ($v) => $v !== '' && $v !== [])
        ) + [
            'filters' => $filters, 'facets' => $facets, 'instances' => $page_rows,
            'instance_groups' => array_values($groups),
            'count' => count($selected), 'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1) : null,
        ]);
    }
}
