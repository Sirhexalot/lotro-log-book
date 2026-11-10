<?php

declare(strict_types=1);

namespace Llb;

use RuntimeException;

/**
 * Read-only access to the prepared catalogue data.
 *
 * The site is delivered by PHP; it does not write anything. All data files are
 * produced by tools/build_php_data.py and only replaced as a whole release.
 */
final class Data
{
    public function __construct(private string $root)
    {
        if (!is_dir($root)) {
            throw new RuntimeException('Datenverzeichnis fehlt: ' . $root);
        }
    }

    public static function shard(string $identifier): string
    {
        return substr(md5($identifier), 0, 2);
    }

    /** One entity page model, or null when this id has no page. */
    public function page(string $lang, string $kind, string $identifier): ?array
    {
        $file = $this->root . '/' . $lang . '/page-' . $kind . '/'
            . self::shard($identifier) . '.json';
        $entities = $this->read($file)['entities'] ?? [];
        return $entities[$identifier] ?? null;
    }

    /** One raw catalogue record (lists, relations, sitemaps). */
    public function entity(string $lang, string $kind, string $identifier): ?array
    {
        $file = $this->root . '/' . $lang . '/' . $kind . '/'
            . self::shard($identifier) . '.json';
        $entities = $this->read($file)['entities'] ?? [];
        return $entities[$identifier] ?? null;
    }

    /**
     * One overview page model ("de/aufgabe/seite/2/"), or null.
     *
     * List pages are addressed by their own path: the catalogue has too many
     * shapes (type index, pagination, category, quality) for a URI pattern.
     */
    public function listPage(string $key): ?array
    {
        $file = $this->root . '/page-list/' . self::shard($key) . '.json';
        $pages = $this->read($file)['pages'] ?? [];
        return $pages[$key] ?? null;
    }

    public function maps(string $lang): array
    {
        return $this->read($this->root . '/' . $lang . '/maps.json')['maps'] ?? [];
    }

    public function setIndex(string $lang): array
    {
        return $this->read($this->root . '/' . $lang . '/sets-index.json');
    }

    public function giverIndex(string $lang): array
    {
        return $this->read($this->root . '/' . $lang . '/givers-index.json');
    }

    public function landmarkIndex(string $lang): array
    {
        return $this->read($this->root . '/' . $lang . '/landmarks-index.json');
    }

    public function factionIndex(string $lang): array
    {
        return $this->read($this->root . '/' . $lang . '/factions-index.json');
    }

    public function has(string $lang, string $kind, string $identifier): bool
    {
        return $this->entity($lang, $kind, $identifier) !== null;
    }

    private function read(string $file): array
    {
        if (!is_file($file)) {
            return [];
        }
        $handle = fopen($file, 'rb');
        if ($handle === false) {
            return [];
        }
        try {
            $raw = stream_get_contents($handle);
        } finally {
            fclose($handle);
        }
        if ($raw === false || $raw === '') {
            return [];
        }
        $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        return is_array($data) ? $data : [];
    }
}
