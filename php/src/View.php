<?php

declare(strict_types=1);

namespace Llb;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFilter;

/** Twig environment for the site. Templates are shared by every page. */
final class View
{
    public readonly Environment $twig;

    public function __construct(string $templateDir, ?string $cacheDir = null)
    {
        $loader = new FilesystemLoader($templateDir);
        $this->twig = new Environment($loader, [
            'cache' => $cacheDir,
            'autoescape' => 'html',
            'strict_variables' => true,
            'debug' => false,
            // Twig keeps compiled templates until told otherwise. During the
            // migration a stale template looks like a code bug, so reload
            // unless the deployment sets LLB_PRODUCTION=1.
            'auto_reload' => getenv('LLB_PRODUCTION') !== '1',
        ]);
        // The generator compares px values with one decimal; keep that format.
        $this->twig->addFilter(new TwigFilter('pin', static function ($value): string {
            return number_format((float) $value, 1, '.', '');
        }));
        // Entity icons are inline SVG paths shared by all pages.
        $symbols = [];
        $dataDir = getenv('LLB_DATA') ?: dirname($templateDir, 2) . '/phpdata';
        $labelFile = rtrim($dataDir, '/') . '/labels.json';
        if (is_file($labelFile)) {
            $labels = json_decode((string) file_get_contents($labelFile), true, 64, JSON_THROW_ON_ERROR);
            $symbols = $labels['symbols'] ?? [];
        }
        $this->twig->addFunction(new \Twig\TwigFunction(
            'symbol',
            static function (?string $art) use ($symbols): string {
                $path = $art !== null ? ($symbols[$art] ?? null) : null;
                if (!$path) {
                    return '';
                }
                return '<svg class="symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
                    . 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                    . $path . '</svg>';
            },
            ['is_safe' => ['html']]
        ));
    }

    public function render(string $template, array $context): string
    {
        return $this->twig->render($template, $context);
    }
}
