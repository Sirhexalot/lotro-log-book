<?php

declare(strict_types=1);

namespace Llb;

use InvalidArgumentException;

/** Language, wording and the public URL shape. */
final class Catalogue
{
    public const LANGS = ['de', 'en', 'fr'];

    /** Public path segment per language and kind; ids never appear as names. */
    private const SEGMENTS = [
        'de' => ['q' => 'aufgabe', 'd' => 'tat', 'i' => 'gegenstand', 'area' => 'gebiet',
                 'region' => 'region', 'catalog' => 'katalog', 'p' => 'beruf', 'recipe' => 'rezept',
                  'craft' => 'handwerk', 'title' => 'titel', 'virtue' => 'tugend', 'set' => 'set',
                   'giver' => 'auftraggeber', 'vendor' => 'haendler', 'f' => 'fraktion', 'l' => 'landmarke',
                   'instance' => 'instanz'],
        'en' => ['q' => 'quest', 'd' => 'deed', 'i' => 'item', 'area' => 'area',
                 'region' => 'region', 'catalog' => 'catalogue', 'p' => 'profession', 'recipe' => 'recipe',
                  'craft' => 'crafting', 'title' => 'title', 'virtue' => 'virtue', 'set' => 'set',
                    'giver' => 'quest-giver', 'vendor' => 'vendor', 'f' => 'faction', 'l' => 'landmark',
                    'instance' => 'instance'],
        'fr' => ['q' => 'quete', 'd' => 'prouesse', 'i' => 'objet', 'area' => 'zone',
                 'region' => 'region', 'catalog' => 'catalogue', 'p' => 'metier', 'recipe' => 'recette',
                  'craft' => 'artisanat', 'title' => 'titre', 'virtue' => 'vertu', 'set' => 'ensemble',
                    'giver' => 'donneur-de-quete', 'vendor' => 'marchand', 'f' => 'faction', 'l' => 'site',
                    'instance' => 'instance'],
    ];

    /**
     * Application pages: same language-in-path shape as the catalogue.
     *
     * `handwerk` is taken by the catalogue overview, so the crafting browser
     * lives one level deeper.
     */
    private const APP = [
        'de' => ['start' => '', 'karte' => 'karte', 'questfinder' => 'aufgabenfinder', 'taten' => 'karte/taten',
                 'gegenstandssuche' => 'gegenstandssuche', 'handwerk' => 'handwerk/rezepte',
                 'reise' => 'reise', 'ruf' => 'ruf', 'belohnungen' => 'belohnungen',
                  'spielstand' => 'spielstand', 'companion' => 'companion', 'plugin' => 'plugin',
                    'klassen' => 'klassen',
                   'suche' => 'suche', 'feedback' => 'feedback', 'sets' => 'set', 'givers' => 'auftraggeber',
                   'landmarks' => 'landmarke', 'vendors' => 'haendler', 'titles' => 'titel', 'factions' => 'fraktion', 'instances' => 'instanz',
                  'adventures' => 'abenteuer', 'ratgeber' => 'ratgeber'],
        'en' => ['start' => '', 'karte' => 'map', 'questfinder' => 'quest-finder', 'taten' => 'map/deeds',
                 'gegenstandssuche' => 'item-search', 'handwerk' => 'crafting/recipes',
                 'reise' => 'travel', 'ruf' => 'reputation', 'belohnungen' => 'rewards',
                   'spielstand' => 'progress', 'companion' => 'companion', 'plugin' => 'plugin',
                    'klassen' => 'classes',
                   'suche' => 'search', 'feedback' => 'feedback', 'sets' => 'set', 'givers' => 'quest-giver',
                   'landmarks' => 'landmark', 'vendors' => 'vendor', 'titles' => 'title', 'factions' => 'faction', 'instances' => 'instance',
                  'adventures' => 'adventure', 'ratgeber' => 'advisor'],
        'fr' => ['start' => '', 'karte' => 'carte', 'questfinder' => 'recherche-quetes', 'taten' => 'carte/prouesses',
                 'gegenstandssuche' => 'recherche-objets', 'handwerk' => 'artisanat/recettes',
                 'reise' => 'voyage', 'ruf' => 'reputation', 'belohnungen' => 'recompenses',
                   'spielstand' => 'progression', 'companion' => 'companion', 'plugin' => 'plugin',
                    'klassen' => 'classes',
                   'suche' => 'recherche', 'feedback' => 'retour', 'sets' => 'ensemble', 'givers' => 'donneur-de-quete',
                   'landmarks' => 'site', 'vendors' => 'marchand', 'titles' => 'titre', 'factions' => 'faction', 'instances' => 'instance',
                  'adventures' => 'aventure', 'ratgeber' => 'conseiller'],
    ];

    private array $labels;

    public function __construct(private string $labelFile, public readonly string $base)
    {
        $raw = file_get_contents($labelFile);
        if ($raw === false) {
            throw new InvalidArgumentException('Etiketten fehlen: ' . $labelFile);
        }
        $this->labels = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
    }

    /** All wording of one language (the ported WORDS/EXTRA tables). */
    public function words(string $lang): array
    {
        $words = $this->labels['words'][$lang] ?? [];
        foreach ($this->labels['sections'][$lang] ?? [] as $key => $value) {
            $words[$key] = $value;
        }
        return $words;
    }

    /** Title and description of an application page ("ruf.html"). */
    public function appSeo(string $datei, string $lang = 'de'): ?array
    {
        $page = $this->labels['app'][$datei] ?? null;
        return $page[$lang] ?? $page;
    }

    public function symbols(): array
    {
        return $this->labels['symbols'] ?? [];
    }

    public function famille(): array
    {
        return $this->labels['familie'] ?? [];
    }

    /** Public address of an application page, e.g. "/de/karte/". */
    public function appRoute(string $lang, string $page): string
    {
        $segment = self::APP[$lang][$page] ?? throw new InvalidArgumentException('Unbekannte Seite: ' . $page);
        return '/' . $lang . '/' . ($segment === '' ? '' : $segment . '/');
    }

    /** Application page that belongs to a path, or null. */
    public function appPage(string $lang, string $rest): ?string
    {
        $rest = trim($rest, '/');
        foreach (self::APP[$lang] ?? [] as $page => $segment) {
            if ($segment === $rest) {
                return $page;
            }
        }
        return null;
    }

    public function segment(string $lang, string $kind): string
    {
        $segment = self::SEGMENTS[$lang][$kind] ?? null;
        if ($segment === null) {
            throw new InvalidArgumentException('Unbekannte Art: ' . $kind);
        }
        return $segment;
    }

    /** Kind for a public segment, or null when the segment is not in use. */
    public function kindOf(string $lang, string $segment): ?string
    {
        $found = array_search($segment, self::SEGMENTS[$lang] ?? [], true);
        return $found === false ? null : $found;
    }

    public function isLang(string $value): bool
    {
        return in_array($value, self::LANGS, true);
    }

    /** `/de/aufgabe/700005C0/`, `/de/aufgabe/` for the type index. */
    public function route(string $lang, string $kind, ?string $identifier = null): string
    {
        if ($identifier !== null && !self::validId($kind, $identifier)) {
            throw new InvalidArgumentException('Ungültige Kennung: ' . $identifier);
        }
        return '/' . $lang . '/' . $this->segment($lang, $kind) . '/'
            . ($identifier !== null ? $identifier . '/' : '');
    }

    /**
     * Target of an old reward-browser tab link.
     *
     * The reward browser lists items only; titles and virtues have their own
     * catalogue pages in the Erfolge menu. Shared links keep working.
     */
    public function rewardTabTarget(string $lang, array $query): ?string
    {
        $tab = (string) ($query['tab'] ?? '');
        if ($tab === 't') {
            $ziel = $this->appRoute($lang, 'titles');
            $q = trim((string) ($query['q'] ?? ''));
            return $q === '' ? $ziel : $ziel . '?q=' . rawurlencode($q);
        }
        if ($tab === 'v') {
            return $this->route($lang, 'virtue');
        }
        return null;
    }

    public function pageRoute(string $lang, string $kind, int $page = 1): string
    {
        $base = $this->route($lang, $kind);
        return $page === 1 ? $base : $base . 'seite/' . $page . '/';
    }

    /** The deep link into the interactive app, kept for existing links. */
    public function appLink(string $lang, string $kind, string $identifier): string
    {
        if (in_array($kind, ['p', 'recipe', 'craft'], true)) {
            return '/handwerk.html?lang=' . $lang;
        }
        $params = ['lang' => $lang, 'id' => $identifier];
        if ($kind === 'd') {
            $params['art'] = 'taten';
        }
        return ($kind === 'i' ? '/gegenstand.html?' : '/index.html?') . http_build_query($params);
    }

    public static function validId(string $kind, string $identifier): bool
    {
        if ($kind === 'set' || $kind === 'giver' || $kind === 'vendor' || $kind === 'instance') {
            return preg_match('/^[0-9A-Fa-f]{8}$/', $identifier) === 1;
        }
        $pattern = $kind === 'p' ? '/^[A-Z][A-Z_]*$/' : '/^[0-9A-Fa-f]+$/';
        return preg_match($pattern, $identifier) === 1;
    }

    /** Stored ids are uppercase; a hand-typed lowercase id is redirected. */
    public static function canonicalId(string $identifier): string
    {
        return strtoupper($identifier);
    }
}
