<?php

declare(strict_types=1);

namespace Llb;

/**
 * Adventure overview: the large content blocks of the game, at a glance.
 *
 * The server renders every adventure with its name, type and level band, so the
 * page is readable without JavaScript. Progress, the two suggestions and the
 * ownership settings are computed in the browser from the visitor's own
 * character data; nothing personal is sent to the server.
 */
final class Adventures
{
    /** The six drawn regions, in the order the world map presents them. */
    private const REGIONS = [
        '268437557', // Eriador
        '268453619', // Rhovanion
        '268453621', // Rohan
        '268450901', // Gondor
        '268453620', // Mordor
        '268454369', // Haradwaith
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
                'title' => 'Dein Abenteuerüberblick',
                'intro' => 'Deine bisherigen Abenteuer, offene Geschichten und neue Gegenden – auch das, was du längst überlevelt hast.',
                'adventures' => 'Deine Abenteuer im Überblick',
                'finish' => 'Altes zu Ende bringen',
                'level' => 'Passt zu deiner Stufe',
                'no_character' => 'Noch kein Charakter gewählt.',
                'import_hint' => 'Lade deinen Spielstand, dann siehst du hier deinen Fortschritt.',
                'import_link' => 'Spielstand importieren',
                'content_link' => 'Meine Inhalte',
                'content_hint' => '',
                'all_owned' => 'Alles vorhanden',
                'all_missing' => 'Alles nicht vorhanden',
                'owned' => 'vorhanden',
                'missing' => 'nicht vorhanden',
                'unknown' => 'unbekannt',
                'areas' => 'Enthaltene Gebiete',
                'no_areas' => 'Für dieses Abenteuer sind noch keine Gebiete zugeordnet.',
                'level_band' => 'Stufe %s–%s',
                'level_single' => 'Stufe %s',
                'level_unknown' => 'Stufenbereich unklar',
                'types' => ['base' => 'Grundspiel', 'expansion' => 'Erweiterung',
                            'mini-expansion' => 'kleine Erweiterung', 'quest-pack' => 'Aufgabenpaket',
                            'update' => 'Kostenloses Update'],
                'open' => 'Abenteuer ansehen',
                'close' => 'Schließen',
                'quests' => '%s Aufgaben',
                'quests_one' => '1 Aufgabe',
                'view_label' => 'Ansicht', 'view_map' => 'Karte', 'view_list' => 'Liste',
                'map_title' => 'Mittelerde', 'map_regions' => 'Alle Regionen',
                'map_areas_list' => 'Gebiete als Liste',
                'map_hint' => 'Region wählen, dann ein Gebiet.',
                'map_show' => 'Auf der Karte zeigen',
                'map_open' => 'Auf der Karte öffnen',
                'map_area' => 'Gebiet ansehen',
                'map_legend' => 'Ring = Katalogfortschritt · Zahl = Gebiete mit nächster Aufgabe · Rand = Stufenpassung',
                'map_region_legend' => 'Prozent = Fortschritt im Gebiet · Rand = Stufenpassung · Zahl = Gebiete einer Unterkarte',
                'map_tip' => 'Tipp: „Auf der Karte öffnen“ zeigt Auftraggeber und Ziele.',
                'map_no_import' => '',
                'map_preview' => 'Geländevorschau',
            ],
            'en' => [
                'title' => 'Your adventure overview',
                'intro' => 'Your adventures so far, open stories and new lands – including what you have long outgrown.',
                'adventures' => 'Your adventures at a glance',
                'finish' => 'Finish what you started',
                'level' => 'Fits your level',
                'no_character' => 'No character selected yet.',
                'import_hint' => 'Import your progress to see your own state here.',
                'import_link' => 'Import progress',
                'content_link' => 'My content',
                'content_hint' => '',
                'all_owned' => 'All owned',
                'all_missing' => 'None owned',
                'owned' => 'owned',
                'missing' => 'not owned',
                'unknown' => 'unknown',
                'areas' => 'Areas included',
                'no_areas' => 'No areas are assigned to this adventure yet.',
                'level_band' => 'Level %s–%s',
                'level_single' => 'Level %s',
                'level_unknown' => 'level range unclear',
                'types' => ['base' => 'Base game', 'expansion' => 'Expansion',
                            'mini-expansion' => 'Mini expansion', 'quest-pack' => 'Quest pack',
                            'update' => 'Free update'],
                'open' => 'Show adventure',
                'close' => 'Close',
                'quests' => '%s quests',
                'quests_one' => '1 quest',
                'view_label' => 'View', 'view_map' => 'Map', 'view_list' => 'List',
                'map_title' => 'Middle-earth', 'map_regions' => 'All regions',
                'map_areas_list' => 'Areas as a list',
                'map_hint' => 'Choose a region, then an area.',
                'map_show' => 'Show on map',
                'map_open' => 'Open on the map',
                'map_area' => 'View area',
                'map_legend' => 'Ring = catalogue progress · number = areas with a next quest · edge = level fit',
                'map_region_legend' => 'Percentage = progress in the area · border = level fit · number = areas in a sub-map',
                'map_tip' => 'Tip: “Open on the map” shows quest givers and objectives.',
                'map_no_import' => '',
                'map_preview' => 'Terrain preview',
            ],
            'fr' => [
                'title' => 'Votre aperçu des aventures',
                'intro' => 'Vos aventures passées, les histoires ouvertes et les nouvelles contrées – même ce que vous avez depuis longtemps dépassé.',
                'adventures' => 'Vos aventures en un coup d’œil',
                'finish' => 'Terminer ce qui est commencé',
                'level' => 'Correspond à votre niveau',
                'no_character' => 'Aucun personnage sélectionné.',
                'import_hint' => 'Importez votre progression pour voir votre état ici.',
                'import_link' => 'Importer la progression',
                'content_link' => 'Mes contenus',
                'content_hint' => '',
                'all_owned' => 'Tout possédé',
                'all_missing' => 'Rien possédé',
                'owned' => 'possédé',
                'missing' => 'non possédé',
                'unknown' => 'inconnu',
                'areas' => 'Pays inclus',
                'no_areas' => 'Aucun pays n’est encore attribué à cette aventure.',
                'level_band' => 'Niveau %s–%s',
                'level_single' => 'Niveau %s',
                'level_unknown' => 'plage de niveau inconnue',
                'types' => ['base' => 'Jeu de base', 'expansion' => 'Extension',
                            'mini-expansion' => 'Petite extension', 'quest-pack' => 'Pack de quêtes',
                            'update' => 'Mise à jour gratuite'],
                'open' => 'Voir l’aventure',
                'close' => 'Fermer',
                'quests' => '%s quêtes',
                'quests_one' => '1 quête',
                'view_label' => 'Affichage', 'view_map' => 'Carte', 'view_list' => 'Liste',
                'map_title' => 'Terre du Milieu', 'map_regions' => 'Toutes les régions',
                'map_areas_list' => 'Pays sous forme de liste',
                'map_hint' => 'Choisissez une région, puis un pays.',
                'map_show' => 'Afficher sur la carte',
                'map_open' => 'Ouvrir sur la carte',
                'map_area' => 'Voir le pays',
                'map_legend' => 'Anneau = progression du catalogue · nombre = pays avec une prochaine quête · bord = niveau',
                'map_region_legend' => 'Pourcentage = progression dans le pays · bordure = niveau · nombre = pays d’une sous-carte',
                'map_tip' => 'Astuce : « Ouvrir sur la carte » montre les donneurs et les objectifs.',
                'map_no_import' => '',
                'map_preview' => 'Aperçu du terrain',
            ],
        ][$lang];
    }

    /** Level band as one line: one number when both ends are equal. */
    public static function levelLabel(array $pack, array $words): string
    {
        $low = $pack['level_min'] ?? null;
        $high = $pack['level_max'] ?? null;
        if ($low === null || $high === null) {
            return $words['level_unknown'];
        }
        return $low === $high
            ? sprintf($words['level_single'], $low)
            : sprintf($words['level_band'], $low, $high);
    }

    private function context(array $words, array $alternates, string $canonical): array
    {
        $base = $this->catalogue->appRoute($this->lang, 'adventures');
        return [
            'lang' => $this->lang,
            'kind' => 'adventures',
            'w' => $this->shell->words(),
            'lw' => $words,
            'page_seo' => ['title' => $words['title'], 'description' => $words['intro']],
            'base' => $this->catalogue->base,
            'canonical_url' => $canonical,
            'alternates' => $alternates,
            'og_locale' => ['de' => 'de_DE', 'en' => 'en_US', 'fr' => 'fr_FR'][$this->lang],
            'og_image_alt' => 'LOTRO Log Book',
            'tracking' => $this->shell->tracking(),
            'styles' => $this->shell->styles(),
            'scripts' => $this->shell->scripts(),
            'asset_stand' => $this->shell->assetStand(),
            'menu' => $this->shell->menu(''),
            'start_page' => $this->catalogue->appRoute($this->lang, 'start'),
            'suche_pfad' => $this->shell->appRoute('suche'),
            'spielstand_pfad' => $this->shell->appRoute('spielstand'),
            'katalog_texte' => json_encode(['none' => $this->shell->words()['none']], JSON_UNESCAPED_UNICODE),
            'crumbs' => $this->shell->crumbHtml($this->shell->appCrumbs('adventures')),
            'languages' => implode(' · ', array_map(
                static fn ($row) => link_tag($row['url'], strtoupper($row['lang'])), $alternates)),
            'legal' => link_tag('/impressum.html?lang=' . $this->lang, $this->shell->words()['legal']),
            'privacy' => link_tag('/datenschutz.html?lang=' . $this->lang, $this->shell->words()['privacy']),
            'list_url' => $base,
        ];
    }

    public function page(): ?string
    {
        $index = $this->data->adventureIndex($this->lang);
        if (!$index || empty($index['packs'])) {
            return null;
        }
        $words = self::words($this->lang);
        $packs = $index['packs'];
        foreach ($packs as &$pack) {
            $pack['level_label'] = self::levelLabel($pack, $words);
            $pack['type_label'] = $words['types'][$pack['type']] ?? $pack['type'];
            $pack['areas_list'] = array_values(array_map(
                function (array $area): array {
                    // Link only where a catalogue page really exists.
                    $area['url'] = $this->data->has($this->lang, 'area', (string) $area['id'])
                        ? $this->catalogue->route($this->lang, 'area', (string) $area['id']) : '';
                    return $area;
                },
                array_filter(
                    $index['areas'],
                    static fn (array $area): bool => $area['pack'] === $pack['id'] && ($area['name'] ?? '') !== ''
                )
            ));
        }
        unset($pack);

        // Map: six named regions and the area pages that really exist. The
        // percentages and progress stay in the browser; only names and links
        // come from the server.
        $maps = $this->data->maps($this->lang);
        $world = $index['positions']['world'] ?? [];
        $regions = [];
        foreach (self::REGIONS as $id) {
            $name = $maps[$id]['name'] ?? '';
            $point = $world[$id] ?? null;
            if ($name !== '' && is_array($point)) {
                $regions[] = ['id' => $id, 'name' => $name, 'x' => $point[0], 'y' => $point[1]];
            }
        }
        $areaPages = [];
        foreach ($index['areas'] as $area) {
            $id = (string) $area['id'];
            if ($this->data->has($this->lang, 'area', $id)) {
                $areaPages[$id] = $this->catalogue->route($this->lang, 'area', $id);
            }
        }

        // Names of the sub-maps that carry a marker on a region drawing. A
        // nested area has no own spot; its name then comes from the linked map.
        $mapNames = [];
        foreach ($index['positions']['maps'] ?? [] as $points) {
            foreach (array_keys($points) as $id) {
                $id = (string) $id;
                $name = $maps[$id]['name'] ?? '';
                if ($name !== '') { $mapNames[$id] = $name; }
            }
        }

        $alternates = [];
        foreach (Catalogue::LANGS as $other) {
            $alternates[] = ['lang' => $other, 'url' => $this->catalogue->appRoute($other, 'adventures')];
        }
        $sprachen = array_map(
            fn (array $row): array => [
                'lang' => $row['lang'], 'label' => strtoupper($row['lang']),
                'url' => $row['url'], 'aktiv' => $row['lang'] === $this->lang,
            ],
            $alternates
        );

        return $this->view->render('app/abenteuer.twig', $this->context(
            $words,
            $alternates,
            $this->catalogue->appRoute($this->lang, 'adventures')
        ) + [
            'packs' => $packs,
            'sprachen' => $sprachen,
            'catalogue_url' => '/abenteuer-' . $this->lang . '.js',
            'regions' => $regions,
            'area_pages' => $areaPages,
            'map_names' => $mapNames,
            'weltkarte' => '/karten/' . $this->lang . '/268437554.webp',
            'karte_pfad' => $this->catalogue->appRoute($this->lang, 'karte'),
        ]);
    }
}
