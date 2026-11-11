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
                'adventures_hint' => 'Ein Eintrag pro großem Inhalt. Gebiete und einzelne Aufgaben erst beim Öffnen.',
                'finish' => 'Altes zu Ende bringen',
                'level' => 'Passt zu deiner Stufe',
                'no_character' => 'Noch kein Charakter gewählt.',
                'import_hint' => 'Lade deinen Spielstand, dann siehst du hier deinen Fortschritt.',
                'import_link' => 'Spielstand importieren',
                'content_link' => 'Meine Inhalte',
                'content_hint' => 'Was du besitzt, bleibt in diesem Browser gespeichert. Unbekannt ist kein „nicht gekauft“.',
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
                'types' => ['base' => 'Grundspiel', 'expansion' => 'Erweiterung', 'mini-expansion' => 'kleine Erweiterung'],
                'footnote' => 'Prozentwerte zählen einmalige Landschaftsaufgaben. Fehlender Abschluss im Import heißt nicht, dass du nie dort warst.',
                'open' => 'Abenteuer ansehen',
                'close' => 'Schließen',
                'quests' => '%s Aufgaben',
                'quests_one' => '1 Aufgabe',
            ],
            'en' => [
                'title' => 'Your adventure overview',
                'intro' => 'Your adventures so far, open stories and new lands – including what you have long outgrown.',
                'adventures' => 'Your adventures at a glance',
                'adventures_hint' => 'One entry per large content block. Areas and single quests only when you open it.',
                'finish' => 'Finish what you started',
                'level' => 'Fits your level',
                'no_character' => 'No character selected yet.',
                'import_hint' => 'Import your progress to see your own state here.',
                'import_link' => 'Import progress',
                'content_link' => 'My content',
                'content_hint' => 'What you own stays in this browser. Unknown does not mean “not bought”.',
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
                'types' => ['base' => 'Base game', 'expansion' => 'Expansion', 'mini-expansion' => 'Mini expansion'],
                'footnote' => 'Percentages count one-time landscape quests. A missing completion in the import does not mean you were never there.',
                'open' => 'Show adventure',
                'close' => 'Close',
                'quests' => '%s quests',
                'quests_one' => '1 quest',
            ],
            'fr' => [
                'title' => 'Votre aperçu des aventures',
                'intro' => 'Vos aventures passées, les histoires ouvertes et les nouvelles contrées – même ce que vous avez depuis longtemps dépassé.',
                'adventures' => 'Vos aventures en un coup d’œil',
                'adventures_hint' => 'Une entrée par grand contenu. Les pays et les quêtes seulement à l’ouverture.',
                'finish' => 'Terminer ce qui est commencé',
                'level' => 'Correspond à votre niveau',
                'no_character' => 'Aucun personnage sélectionné.',
                'import_hint' => 'Importez votre progression pour voir votre état ici.',
                'import_link' => 'Importer la progression',
                'content_link' => 'Mes contenus',
                'content_hint' => 'Ce que vous possédez reste dans ce navigateur. Inconnu ne signifie pas « non acheté ».',
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
                'types' => ['base' => 'Jeu de base', 'expansion' => 'Extension', 'mini-expansion' => 'Petite extension'],
                'footnote' => 'Les pourcentages comptent les quêtes de pays uniques. Une absence dans l’import ne signifie pas que vous n’y êtes jamais allé.',
                'open' => 'Voir l’aventure',
                'close' => 'Fermer',
                'quests' => '%s quêtes',
                'quests_one' => '1 quête',
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

    /** Emblem of one adventure, only when the built image is really there. */
    private function emblem(string $pack): string
    {
        $relative = '/bild/abenteuer/' . $pack . '.webp';
        return is_file($this->shell->webRoot() . $relative) ? $relative : '';
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
            'crumbs' => link_tag($base, $words['title']),
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
            $pack['emblem'] = $this->emblem($pack['id']);
            $pack['areas_list'] = array_values(array_filter(
                $index['areas'],
                static fn (array $area): bool => $area['pack'] === $pack['id'] && ($area['name'] ?? '') !== ''
            ));
        }
        unset($pack);

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
        ]);
    }
}
