<?php

declare(strict_types=1);

namespace Llb;

/**
 * Small anonymous counters for the public "travellers" display.
 *
 * Character data never reaches this class. The file contains only an
 * aggregate import count, expiring presence timestamps and short-lived
 * idempotency keys for import events.
 */
final class Statistics
{
    private const START_IMPORTS = 150;
    private const PRESENCE_TTL = 1080;

    public function __construct(private string $file)
    {
    }

    public function heartbeat(string $visitor): array
    {
        return $this->change(function (array $state) use ($visitor): array {
            $now = time();
            $this->clean($state, $now);
            if (str_starts_with($visitor, 'v3-') && strlen($visitor) <= 100) {
                $state['visitors'][$visitor] = $now;
            }
            return [$state, $this->result($state, $now)];
        });
    }

    public function import(string $event): array
    {
        return $this->change(function (array $state) use ($event): array {
            $now = time();
            $this->clean($state, $now);
            if ($event !== '' && strlen($event) <= 100
                && !isset($state['imports_seen'][$event])) {
                $state['imports']++;
                $state['imports_seen'][$event] = $now;
            }
            return [$state, $this->result($state, $now)];
        });
    }

    public function current(): array
    {
        return $this->change(function (array $state): array {
            $now = time();
            $this->clean($state, $now);
            return [$state, $this->result($state, $now)];
        });
    }

    private function change(callable $callback): array
    {
        $directory = dirname($this->file);
        if (!is_dir($directory)) {
            @mkdir($directory, 0775, true);
        }
        $handle = @fopen($this->file, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            return $this->fallback();
        }
        try {
            rewind($handle);
            $raw = stream_get_contents($handle);
            $state = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
            if (!is_array($state)) {
                $state = $this->initial();
            }
            [$state, $result] = $callback($this->normalise($state));
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, (string) json_encode($state, JSON_UNESCAPED_UNICODE));
            fflush($handle);
            return $result;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    private function initial(): array
    {
        return [
            'imports' => self::START_IMPORTS,
            'visitors' => [],
            'imports_seen' => [],
        ];
    }

    private function normalise(array $state): array
    {
        $state['imports'] = max(self::START_IMPORTS, (int) ($state['imports'] ?? self::START_IMPORTS));
        $state['visitors'] = is_array($state['visitors'] ?? null) ? $state['visitors'] : [];
        $state['imports_seen'] = is_array($state['imports_seen'] ?? null) ? $state['imports_seen'] : [];
        return $state;
    }

    private function clean(array &$state, int $now): void
    {
        foreach ($state['visitors'] as $id => $stamp) {
            if ($now - (int) $stamp > self::PRESENCE_TTL) {
                unset($state['visitors'][$id]);
            }
        }
        foreach ($state['imports_seen'] as $id => $stamp) {
            if ($now - (int) $stamp > 86400) {
                unset($state['imports_seen'][$id]);
            }
        }
    }

    private function result(array $state, int $now): array
    {
        return [
            'active' => count($state['visitors']),
            'imports' => (int) $state['imports'],
        ];
    }

    private function fallback(): array
    {
        return ['active' => 0, 'imports' => self::START_IMPORTS];
    }
}
