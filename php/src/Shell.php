<?php

declare(strict_types=1);

namespace Llb;

/**
 * The shared page chrome: head, family menu, breadcrumbs, footer.
 *
 * The markup is the one `build_katalogseiten.Renderer.write()` produces, so a
 * migrated page and its static predecessor stay indistinguishable.
 */
final class Shell
{
    private array $words;

    public function __construct(
        private Catalogue $catalogue,
        private Data $data,
        private string $webRoot,
        private string $lang,
    ) {
        $this->words = $catalogue->words($lang);
    }

    public function webRoot(): string
    {
        return $this->webRoot;
    }

    public function words(): array
    {
        return $this->words;
    }

    /** Tracking snippets, taken from the built index page, never from a visitor. */
    public function tracking(): string
    {
        $file = $this->webRoot . '/index.html';
        $html = is_file($file) ? (string) file_get_contents($file) : '';
        preg_match_all('/<script\b[^>]*>.*?<\/script>/s', $html, $matches);
        $keep = [];
        foreach ($matches[0] as $script) {
            if (str_contains($script, 'gtm.start') || str_contains($script, 'data-goatcounter=')) {
                $keep[] = $script;
            }
        }
        return implode("\n", $keep);
    }

    private function assetTag(string $asset): string
    {
        $file = $this->webRoot . '/' . $asset;
        $digest = is_file($file) ? substr(hash_file('sha256', $file), 0, 10) : '0';
        return '<link rel="stylesheet" href="/' . $asset . '?v=' . $digest . '">';
    }

    private function scriptTag(string $asset): string
    {
        $file = $this->webRoot . '/' . $asset;
        $digest = is_file($file) ? substr(hash_file('sha256', $file), 0, 10) : '0';
        return '<script src="/' . $asset . '?v=' . $digest . '" defer></script>';
    }

    public function styles(): string
    {
        return implode('', [
            $this->assetTag('style.css'),
            $this->assetTag('gemeinsam.css'),
            $this->assetTag('katalog.css'),
        ]);
    }

    public function scripts(): string
    {
        return implode("\n", [$this->scriptTag('speicher.js'), $this->scriptTag('katalog.js')]);
    }

    public function startPage(): string
    {
        return '/start' . ($this->lang !== 'de' ? '-' . $this->lang : '') . '.html';
    }

    /** The four families with their flyout, exactly as menue.js builds it. */
    public function menu(string $kind): string
    {
        $w = $this->words;
        $lang = $this->lang;
        $app = fn (string $page): string => $this->catalogue->appRoute($lang, $page);
        $families = [
            ['welt', $app('karte'), $w['familie_welt'], [
                ['q', $app('karte'), $w['menue_karte'], $w['d_karte']],
                ['d', $app('taten'), $w['menue_taten'], $w['d_taten']],
                ['reise', $app('reise'), $w['menue_reise'], $w['d_reise']],
            ]],
            ['gegenstaende', $app('gegenstandssuche'), $w['familie_gegenstaende'], [
                ['i', $app('gegenstandssuche'), $w['menue_gegenstaende'], $w['d_gegenstand']],
                ['craft', $app('handwerk'), $w['menue_handwerk'], $w['d_handwerk']],
                ['p', $this->catalogue->route($lang, 'p'), $w['menue_berufe'], $w['d_beruf']],
            ]],
            ['erfolge', $app('belohnungen'), $w['familie_erfolge'], [
                ['title', $this->catalogue->route($lang, 'title'), $w['menue_titel'], $w['d_titel']],
                ['virtue', $this->catalogue->route($lang, 'virtue'), $w['menue_tugenden'], $w['d_tugend']],
                ['ruf', $app('ruf'), $w['menue_ruf'], $w['d_ruf']],
            ]],
            ['charakter', $app('spielstand'), $w['familie_charakter'], [
                ['spielstand', $app('spielstand'), $w['menue_fortschritt'], $w['d_fortschritt']],
                ['p', $this->catalogue->route($lang, 'p'), $w['menue_meine_berufe'], $w['d_meine_berufe']],
                ['ruf', $app('ruf'), $w['menue_mein_ruf'], $w['d_mein_ruf']],
            ]],
        ];

        // The generator only marks a family that is really mapped to the type;
        // 'craft' has none, so no family link is current there.
        $current = $this->catalogue->famille()[$kind] ?? null;
        $out = '';
        foreach ($families as [$key, $target, $text, $tabs]) {
            $flyout = '';
            foreach ($tabs as [$tabKind, $href, $title, $description]) {
                $flyout .= '<a href="' . esc($href) . '"'
                    . ($href === $target ? ' class="selbst"' : '')
                    . ($tabKind === $kind ? ' aria-current="page"' : '')
                    . '><strong>' . esc($title) . '</strong><span>' . esc($description) . '</span></a>';
            }
            $out .= '<span class="familie-feld"><a href="' . esc($target) . '"'
                . ($current === $key ? ' aria-current="page"' : '') . '>' . esc($text) . '</a>'
                . '<span class="familie-flieger">' . $flyout . '</span></span>';
        }
        return $out;
    }

    public function familyTarget(string $family): string
    {
        return match ($family) {
            'gegenstaende' => $this->catalogue->route($this->lang, 'i'),
            'erfolge' => $this->catalogue->appRoute($this->lang, 'belohnungen'),
            'charakter' => $this->catalogue->appRoute($this->lang, 'spielstand'),
            default => $this->catalogue->appRoute($this->lang, 'karte'),
        };
    }

    /** Family → type → place → entry. */
    public function crumbs(string $kind, ?array $page = null): array
    {
        $w = $this->words;
        $family = $this->catalogue->famille()[$kind] ?? 'welt';
        $parts = [
            ['text' => $w['home'], 'url' => $this->startPage()],
            ['text' => $w['familie_' . $family], 'url' => $this->familyTarget($family)],
        ];
        if ($kind !== 'catalog' && $w[$kind . 'list'] !== $w['familie_' . $family]) {
            // Items have no list page; their breadcrumb leads to the search.
            $parts[] = ['text' => $w[$kind . 'list'],
                        'url' => $kind === 'i'
                            ? $this->catalogue->appRoute($this->lang, 'gegenstandssuche')
                            : $this->catalogue->route($this->lang, $kind)];
        }
        foreach ($page['crumb_maps'] ?? [] as $map) {
            $parts[] = ['text' => $map['text'], 'url' => $map['url']];
        }
        if (!empty($page['crumb_profession'])) {
            $parts[] = $page['crumb_profession'];
        }
        return $parts;
    }

    /** Language switch: only languages that really have this entity. */
    public function languages(string $kind, ?string $identifier = null, int $page = 1): array
    {
        $out = [];
        foreach (Catalogue::LANGS as $other) {
            if ($identifier !== null && !$this->data->has($other, $kind, $identifier)) {
                continue;
            }
            $out[] = [
                'lang' => $other,
                'label' => strtoupper($other),
                'url' => $identifier === null
                    ? $this->catalogue->pageRoute($other, $kind, $page)
                    : $this->catalogue->route($other, $kind, $identifier),
            ];
        }
        return $out;
    }

    /** hreflang entries for the head, in the same order as the generator. */
    public function alternates(string $kind, ?string $identifier = null, int $page = 1): array
    {
        return array_map(static fn (array $entry): array => [
            'lang' => $entry['lang'], 'url' => $entry['url'],
        ], $this->languages($kind, $identifier, $page));
    }

    public function entitySymbol(?string $art): string
    {
        $path = $art !== null ? ($this->catalogue->symbols()[$art] ?? null) : null;
        if (!$path) {
            return '';
        }
        return '<svg class="symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            . 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            . $path . '</svg>';
    }

    public function icon(string $icon): string
    {
        return $this->entitySymbol($icon);
    }
}
