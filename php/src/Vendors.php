<?php

declare(strict_types=1);

namespace Llb;

require_once __DIR__ . '/FilterModel.php';
require_once __DIR__ . '/Sortierung.php';

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
            'de' => ['title' => 'Händler', 'name' => 'Name', 'intro' => 'Händler mit Standort und Warenangebot.',
                     'search' => 'Händler suchen', 'filter' => 'Filter', 'apply' => 'Anwenden',
                     'reset' => 'Zurücksetzen', 'region' => 'Region', 'area' => 'Landschaft',
                     'type' => 'Händlerart', 'type_vendor' => 'Normaler Händler',
                     'type_barter' => 'Tauschhändler', 'type_both' => 'Händler und Tauschhändler',
                     'type_filter_vendor' => 'Normale Händler', 'type_filter_barter' => 'Tauschhändler',
                     'level' => 'Gegenstandsstufe', 'from' => 'von', 'to' => 'bis',
                     'stufe_heading' => 'Ware ab Stufe',
                     'stufe_filter' => 'Ware für Stufe %s',
                     'stufe_filter_title' => 'Ware für meine Stufe',
                     'stufe_all' => 'Alle Händler zeigen',
                     'stufe_filter_hint' => 'Zeigt Händler, deren Ware zu deiner Stufe passt.',
                     'stufe_filter_count' => '%s Händler',
                     'sort' => 'Sortierung', 'sort_name' => 'Name', 'sort_level' => 'Ware ab Stufe',
                     'ware' => 'Gegenstandsstufe der Ware',
                     'filter_items' => 'Anwenden', 'reset_items' => 'Alle Gegenstände',
                     'wo' => 'Region und Landschaft', 'empty' => 'Keinen passenden Händler gefunden.',
                     'previous' => 'Zurück', 'next' => 'Weiter', 'page' => 'Seite %s von %s',
                      'items' => 'Warenangebot', 'vendor_items' => 'Warenangebot',
                     'barter_items' => 'Tauschgegenstände',
                     'barter_offers' => 'Tausch: Preis und Ware',
                     'tab_where' => 'Wo', 'tab_goods' => 'Was',
                     'tab_label' => 'Händlerangaben',
                     'barter_noscript' => 'Die vollständige Liste mit Filter braucht JavaScript; hier stehen die ersten 50 Einträge.',
                     'items_count' => '%s Gegenstände', 'items_count_one' => '1 Gegenstand',
                     'places' => 'Standort', 'map' => 'Auf Karte zeigen', 'route' => 'Route planen',
                     'no_place' => 'Kein Standort in den Spieldaten belegt.', 'back' => 'Alle Händler',
                     'count' => '%s Händler', 'count_one' => '1 Händler'],
            'en' => ['title' => 'Vendors', 'name' => 'Name', 'intro' => 'Vendors with their locations and stock.',
                     'search' => 'Search for a vendor', 'filter' => 'Filters', 'apply' => 'Apply',
                     'reset' => 'Reset', 'region' => 'Region', 'area' => 'Landscape',
                      'type' => 'Vendor type', 'type_vendor' => 'Regular vendor',
                      'type_barter' => 'Barterer', 'type_both' => 'Vendor and barterer',
                      'type_filter_vendor' => 'Regular vendors', 'type_filter_barter' => 'Barterers',
                     'level' => 'Item level', 'from' => 'from', 'to' => 'to',
                     'stufe_heading' => 'Stock from level',
                     'stufe_filter' => 'Stock for level %s',
                     'stufe_filter_title' => 'Stock for my level',
                     'stufe_all' => 'Show all vendors',
                     'stufe_filter_hint' => 'Shows vendors whose stock fits your level.',
                     'stufe_filter_count' => '%s vendors',
                     'sort' => 'Sort', 'sort_name' => 'Name', 'sort_level' => 'Stock from level',
                     'ware' => 'Item level of the stock',
                     'filter_items' => 'Apply', 'reset_items' => 'All items',
                     'wo' => 'Region and landscape', 'empty' => 'No matching vendor found.',
                     'previous' => 'Previous', 'next' => 'Next', 'page' => 'Page %s of %s',
                      'items' => 'Stock', 'vendor_items' => 'Stock',
                     'barter_items' => 'Barter goods',
                     'barter_offers' => 'Barter: price and goods',
                     'tab_where' => 'Where', 'tab_goods' => 'What',
                     'tab_label' => 'Vendor details',
                     'barter_noscript' => 'The full list with filters needs JavaScript; the first 50 entries are shown here.',
                     'items_count' => '%s items', 'items_count_one' => '1 item',
                     'places' => 'Location', 'map' => 'Show on map', 'route' => 'Plan a route',
                     'no_place' => 'No location is recorded in the game data.', 'back' => 'All vendors',
                     'count' => '%s vendors', 'count_one' => '1 vendor'],
            'fr' => ['title' => 'Marchands', 'name' => 'Nom', 'intro' => 'Marchands avec leur emplacement et leurs marchandises.',
                     'search' => 'Chercher un marchand', 'filter' => 'Filtres', 'apply' => 'Appliquer',
                     'reset' => 'Réinitialiser', 'region' => 'Région', 'area' => 'Pays',
                      'type' => 'Type de marchand', 'type_vendor' => 'Marchand normal',
                      'type_barter' => 'Marchand troqueur', 'type_both' => 'Marchand et troqueur',
                      'type_filter_vendor' => 'Marchands normaux', 'type_filter_barter' => 'Marchands troqueurs',
                     'level' => 'Niveau des objets', 'from' => 'de', 'to' => 'à',
                     'stufe_heading' => 'Stock dès le niveau',
                     'stufe_filter' => 'Stock pour le niveau %s',
                     'stufe_filter_title' => 'Stock pour mon niveau',
                     'stufe_all' => 'Afficher tous les marchands',
                     'stufe_filter_hint' => 'Montre les marchands dont le stock correspond à votre niveau.',
                     'stufe_filter_count' => '%s marchands',
                     'sort' => 'Tri', 'sort_name' => 'Nom', 'sort_level' => 'Stock dès le niveau',
                     'ware' => 'Niveau d’objet du stock',
                     'filter_items' => 'Appliquer', 'reset_items' => 'Tous les objets',
                     'wo' => 'Région et pays', 'empty' => 'Aucun marchand correspondant.',
                     'previous' => 'Précédent', 'next' => 'Suivant', 'page' => 'Page %s sur %s',
                      'items' => 'Marchandises', 'vendor_items' => 'Marchandises',
                     'barter_items' => 'Objets de troc',
                     'barter_offers' => 'Troc : prix et marchandise',
                     'tab_where' => 'Où', 'tab_goods' => 'Quoi',
                     'tab_label' => 'Informations sur le marchand',
                     'barter_noscript' => 'La liste complète avec filtres nécessite JavaScript ; les 50 premières entrées sont affichées ici.',
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
        if ($filters['type'] && !array_intersect($row['types'], $filters['type'])) {
            return false;
        }
        // Ausdrückliche Spanne: irgendein Stück mit Mindeststufe im Band.
        // Sie gewinnt gegen die Abkürzung „Ware für meine Stufe“.
        $von = (string) ($filters['from'] ?? '');
        $bis = (string) ($filters['to'] ?? '');
        if ($von !== '' || $bis !== '') {
            $passt = false;
            foreach ($row['ml_levels'] ?? [] as $stufe) {
                if (($von === '' || $stufe >= (int) $von) && ($bis === '' || $stufe <= (int) $bis)) {
                    $passt = true;
                    break;
                }
            }
            if (!$passt) {
                return false;
            }
        } elseif (($filters['stufe'] ?? null) !== null) {
            // Dieselben zehn Stufen wie beim Eignungs-Chip: irgendein Stück mit
            // Mindeststufe zwischen Stufe-10 und Stufe.
            $passt = false;
            foreach ($row['ml_levels'] ?? [] as $stufe) {
                if ($stufe >= $filters['stufe'] - 10 && $stufe <= $filters['stufe']) {
                    $passt = true;
                    break;
                }
            }
            if (!$passt) {
                return false;
            }
        }
        return true;
    }

    /**
     * Name oder „Ware ab Stufe“. Händler ohne belegte Stufe stehen am Ende,
     * gleiche Stufen fallen auf den Namen zurück. Sortiert vor der Seitenwahl.
     */
    public static function sorted(array $rows, string $sort, string $dir = 'asc'): array
    {
        usort($rows, static function (array $a, array $b) use ($sort, $dir): int {
            if ($sort === 'stufe') {
                $al = $a['ml_min'] ?? null;
                $bl = $b['ml_min'] ?? null;
                if ($al === null && $bl !== null) {
                    return 1;
                }
                if ($al !== null && $bl === null) {
                    return -1;
                }
                if ($al !== $bl) {
                    return ($al <=> $bl) * ($dir === 'desc' ? -1 : 1);
                }
            }
            return Sortierung::name($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']);
        });
        return $rows;
    }

    private function query(array $input, array $rows): array
    {
        $query = $input['q'] ?? '';
        // Die Spielstufe kommt aus dem importierten Spielstand, nicht vom Server.
        // Sie steht als Zahl in der Adresse, damit Zählung und Seiten stimmen.
        $stufe_raw = $input['stufe'] ?? null;
        $stufe = is_scalar($stufe_raw) && preg_match('/^\d{1,3}$/', (string) $stufe_raw)
            ? (int) $stufe_raw : null;
        if ($stufe !== null && ($stufe < 1 || $stufe > 160)) {
            $stufe = null;
        }
        // Spanne der Warenstufe; eine verdrehte Eingabe wird gedreht.
        $grenze = static function ($value): string {
            return is_scalar($value) && preg_match('/^\d{1,3}$/', (string) $value)
                ? (string) (int) $value : '';
        };
        $von = $grenze($input['from'] ?? '');
        $bis = $grenze($input['to'] ?? '');
        if ($von !== '' && $bis !== '' && (int) $von > (int) $bis) {
            [$von, $bis] = [$bis, $von];
        }
        $filters = ['q' => is_string($query) ? mb_substr(trim($query), 0, 200) : '',
                    'stufe' => $stufe, 'from' => $von, 'to' => $bis,
                    'region' => [], 'area' => [], 'type' => []];
        foreach (['region', 'area', 'type'] as $key) {
            $allowed = [];
            foreach ($rows as $row) {
                $values_for_row = $key === 'type'
                    ? ($row['types'] ?? [$row['type']])
                    : $row[$key . 's'];
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

    private function params(array $filters, int $page = 1, string $sort = 'name', string $dir = 'asc'): array
    {
        $params = array_filter($filters,
            static fn ($value) => $value !== '' && $value !== [] && $value !== null);
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
        $words = self::words($this->lang);
        $vendor['type_label'] = $words['type_' . ($vendor['type'] ?? 'vendor')];
        $vendor['items_label'] = $vendor['type'] === 'barter' ? $words['barter_items'] : $words['items'];
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
        // Name and stock level sort in both directions; anything else is no page.
        $sort = 'name';
        $sort_dir = 'asc';
        $raw_sort = is_string($input['sort'] ?? '') ? trim($input['sort'] ?? '') : '';
        if ($raw_sort !== '') {
            $key = str_starts_with($raw_sort, '-')
                ? substr($raw_sort, 1) : $raw_sort;
            if (!in_array($key, ['name', 'stufe'], true)) {
                return null;
            }
            $sort = $key;
            $sort_dir = str_starts_with($raw_sort, '-') ? 'desc' : 'asc';
        }
        $selected = array_values(array_filter($rows, fn ($row) => self::matches($row, $filters)));
        $selected = self::sorted($selected, $sort, $sort_dir);
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
            usort($options, static fn ($a, $b): int => Sortierung::name($a['label'], $b['label']));
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
            $total = (int) ($row['count'] ?? 0);
            if ($total > 0) {
                $meta[] = str_replace('%s', (string) $total,
                    $total === 1 ? $words['items_count_one'] : $words['items_count']);
            }
            $row['meta'] = implode(' · ', $meta);
            // Rechte Spalte: welche Stufen die Ware abdeckt. Nur die untere
            // Grenze wäre bei einer Bereichsfilterung irreführend (ein Händler
            // mit Ware 1–400 bleibt im Band 100–120 sichtbar).
            $row['level_from'] = isset($row['ml_min']) && $row['ml_min'] !== null
                ? (int) $row['ml_min'] : null;
            $row['level_range'] = $row['level_from'] === null ? null
                : (isset($row['ml_max']) && $row['ml_max'] !== null
                   && (int) $row['ml_max'] > $row['level_from']
                    ? $row['level_from'] . '–' . (int) $row['ml_max']
                    : (string) $row['level_from']);
        }
        unset($row);

        // Zahl neben dem Stufen-Filter: wie viele Händler er übrig lässt.
        $stufe_count = null;
        if (($filters['stufe'] ?? null) !== null) {
            $stufe_count = count(array_filter($rows,
                static fn ($row) => self::matches($row, $filters)));
        }

        $toOption = static fn (array $option): array => [
            'value' => (string) $option['value'],
            'label' => $option['label'],
            'count' => (int) $option['count'],
            'checked' => (bool) $option['checked'],
        ];
        $region_options = [];
        foreach ($facets['region'] as $entry) {
            $children = array_map(
                static fn (array $child): array => $toOption($child) + ['groupId' => 'area'],
                $area_by_region[(string) $entry['value']] ?? []
            );
            $region_options[] = $toOption($entry) + ['children' => $children];
        }
        $definition = [
            'area' => 'haendler',
            'lang' => $this->lang,
            'groups' => [
                ['id' => 'region', 'kind' => 'multi', 'label' => $words['wo'],
                 'options' => $region_options],
                ['id' => 'area', 'kind' => 'multi', 'label' => $words['area'], 'nestedOnly' => true,
                 'options' => array_map($toOption, $area_rest)],
                ['id' => 'type', 'kind' => 'multi', 'label' => $words['type'],
                 'options' => array_map($toOption, $facets['type'] ?? [])],
                ['id' => 'level', 'kind' => 'range', 'label' => $words['ware'],
                 'paramMin' => 'from', 'paramMax' => 'to'],
            ],
            'sort' => ['standard' => 'name', 'keys' => ['name', 'stufe'],
                       'ersteRichtung' => ['name' => 'asc', 'stufe' => 'asc'], 'options' => []],
            'columns' => [
                ['label' => $words['name'], 'sortierung' => 'name'],
                ['label' => $words['stufe_heading'], 'sortierung' => 'stufe', 'zahl' => true],
            ],
            'pagination' => ['kind' => 'page', 'size' => self::PAGE_SIZE],
            'countLabel' => $words['count'],
        ];
        $model_facets = [];
        foreach (['region', 'area', 'type'] as $id) {
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
                    'region' => array_map('strval', $filters['region']),
                    'area' => array_map('strval', $filters['area']),
                    'type' => array_map('strval', $filters['type']),
                    'level' => [
                        'min' => $filters['from'] === '' ? null : (int) $filters['from'],
                        'max' => $filters['to'] === '' ? null : (int) $filters['to'],
                    ],
                    'stufe' => $filters['stufe'],
                ],
                'sort' => $sort,
                'sortDir' => $sort_dir,
                'pagination' => ['kind' => 'page', 'page' => $page],
            ],
            $model_facets,
            count($selected),
            ['kind' => 'page', 'page' => $page, 'pages' => $pages, 'hasMore' => $page < $pages],
        );

        $alternates = array_map(
            fn ($lang) => ['lang' => $lang, 'url' => $this->url($filters, 1, $lang, $sort, $sort_dir)],
            Catalogue::LANGS);
        $context = $this->context(
            $page > 1 ? $words['title'] . ' – ' . sprintf($words['page'], $page, $pages) : $words['title'],
            $words['intro'], $this->url($filters, $page, null, $sort, $sort_dir), $alternates,
            $sort_dir === 'desc' || (bool) array_filter($filters,
                static fn ($value) => $value !== '' && $value !== [] && $value !== null));
        return $this->view->render('vendors/list.twig', $context + [
            'vendors' => $page_rows, 'filters' => $filters, 'facets' => $facets,
            'area_by_region' => $area_by_region, 'area_rest' => $area_rest,
            'count' => count($selected), 'stufe_count' => $stufe_count,
            'page_label' => sprintf($words['page'], $page, $pages),
            'previous_url' => $page > 1 ? $this->url($filters, $page - 1, null, $sort, $sort_dir) : null,
            'next_url' => $page < $pages ? $this->url($filters, $page + 1, null, $sort, $sort_dir) : null,
            'filter_model_json' => FilterModel::json($model),
            'sort_url' => $this->url($filters, 1, null, $sort, $sort_dir === 'asc' ? 'desc' : 'asc'),
            'sort_aria' => $sort_dir === 'asc' ? 'ascending' : 'descending',
            'sort_arrow' => $sort_dir === 'asc' ? '↑' : '↓',
            'sort_key' => $sort,
            'sort_dir' => $sort_dir,
            'sort_name_url' => $this->url($filters, 1, null, 'name',
                $sort === 'name' && $sort_dir === 'asc' ? 'desc' : 'asc'),
            'sort_level_url' => $this->url($filters, 1, null, 'stufe',
                $sort === 'stufe' && $sort_dir === 'asc' ? 'desc' : 'asc'),
            'words' => $words,
        ]);
    }
}
