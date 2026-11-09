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
                 'craft' => 'handwerk', 'title' => 'titel', 'virtue' => 'tugend'],
        'en' => ['q' => 'quest', 'd' => 'deed', 'i' => 'item', 'area' => 'area',
                 'region' => 'region', 'catalog' => 'catalogue', 'p' => 'profession', 'recipe' => 'recipe',
                 'craft' => 'crafting', 'title' => 'title', 'virtue' => 'virtue'],
        'fr' => ['q' => 'quete', 'd' => 'prouesse', 'i' => 'objet', 'area' => 'zone',
                 'region' => 'region', 'catalog' => 'catalogue', 'p' => 'metier', 'recipe' => 'recette',
                 'craft' => 'artisanat', 'title' => 'titre', 'virtue' => 'vertu'],
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

    public function symbols(): array
    {
        return $this->labels['symbols'] ?? [];
    }

    public function famille(): array
    {
        return $this->labels['familie'] ?? [];
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
        $pattern = $kind === 'p' ? '/^[A-Z][A-Z_]*$/' : '/^[0-9A-Fa-f]+$/';
        return preg_match($pattern, $identifier) === 1;
    }

    /** Stored ids are uppercase; a hand-typed lowercase id is redirected. */
    public static function canonicalId(string $identifier): string
    {
        return strtoupper($identifier);
    }
}
