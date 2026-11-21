<?php

declare(strict_types=1);

namespace Llb;

/** Parent pages supply relations; the listed type supplies its list adapter. */
final class RelatedLists
{
    public function __construct(
        private Data $data,
        private string $lang,
        private ?Catalogue $catalogue = null,
    ) {}

    public function forPage(string $kind, array $page): array
    {
        $ids = [];
        // Page models carry only IDs for their own relation lists; names and
        // rows come from the relation shards, never duplicated in the model.
        foreach ($page['related_quests'] ?? [] as $id) {
            $ids['q'][] = (string) $id;
        }
        foreach ($page['related_deeds'] ?? [] as $id) {
            $ids['d'][] = (string) $id;
        }
        foreach ($page['related_used_in'] ?? [] as $id) {
            $ids['recipe'][] = (string) $id;
        }
        foreach ($page['related_crafted_by'] ?? [] as $id) {
            $ids['recipe_made'][] = (string) $id;
        }
        if (in_array($kind, ['area', 'region'], true)) {
            foreach ($page['members'] ?? [] as $type => $members) {
                $ids[$type] = array_column($members, 0);
            }
        } else {
            $entries = $kind === 'i' ? [] : array_merge($page['sources'] ?? [], $page['quests'] ?? []);
        if ($kind === 'i') {
            foreach ($page['where_groups'] ?? [] as $group) {
                foreach ($group['entries'] ?? [] as $entry) {
                        // Recipes are explicitly split into used_in/crafted_by.
                        $this->collect($ids, $entry['url'] ?? '', true);
                    }
                }
            }
            foreach ($page['groups'] ?? [] as $group) {
                $entries = array_merge($entries, $group['entries']);
            }
            foreach ($entries as $entry) {
                // Item pages carry their two recipe directions explicitly;
                // the generic walk must not merge them into one list.
                $this->collect($ids, $entry['url'] ?? '', $kind === 'i');
            }
            if ($kind === 'i') {
                foreach ($page['used_in'] ?? [] as $entry) {
                    $this->collect($ids, $entry['url'] ?? '');
                }
            }
        }
        if ($kind === 'i' && !empty($page['barter_sources'])) {
            $ids['barter'] = array_map(
                static fn (array $entry): string => (string) ($entry['id'] ?? ''),
                $page['barter_sources']
            );
        }
        $lists = [];
        foreach ($ids as $type => $members) {
            if ($type === 'vendor') {
                $index = $this->data->vendorIndex($this->lang);
                $vendorPath = ['de' => 'haendler', 'en' => 'vendor', 'fr' => 'marchand'][$this->lang];
                $wanted = array_fill_keys(array_map('strval', $members), true);
                $rows = [];
                foreach ($index['vendors'] ?? [] as $row) {
                    if (!isset($wanted[(string) ($row['id'] ?? '')])) {
                        continue;
                    }
                    $rows[] = [
                        'id' => (string) $row['id'],
                        'name' => $row['name'] ?? $row['id'],
                        'url' => '/' . $this->lang . '/' . $vendorPath . '/' . $row['id'] . '/',
                        'type' => $row['type'] ?? 'vendor',
                        'regions' => $row['regions'] ?? [],
                        'areas' => $row['areas'] ?? [],
                        'count' => $row['count'] ?? 0,
                    ];
                }
                if ($rows) {
                    $lists[$type] = [
                        'rows' => $rows,
                        'labels' => $index['labels'] ?? [],
                    ];
                }
                continue;
            }
            if ($type === 'barter') {
                $by_id = [];
                foreach ($page['barter_sources'] ?? [] as $entry) {
                    $id = (string) ($entry['id'] ?? '');
                    if ($id !== '') {
                        $by_id[$id] = $entry;
                    }
                }
                $rows = [];
                foreach ($members as $member) {
                    $entry = $by_id[(string) $member] ?? null;
                    if (!$entry) {
                        continue;
                    }
                    // The occupation is English-only in the client; the row names
                    // what the barterer does through its type and area instead.
                    $extra = (string) ($entry['area'] ?? '');
                    $vendorPath = ['de' => 'haendler', 'en' => 'vendor', 'fr' => 'marchand'][$this->lang];
                    $hasPage = $this->data->has($this->lang, 'vendor', (string) $member);
                    $rows[] = [
                        'id' => (string) $member,
                        'name' => (string) ($entry['name'] ?? $member),
                        'url' => $hasPage
                            ? '/' . $this->lang . '/' . $vendorPath . '/' . $member . '/'
                            : '',
                        'type' => 'barter',
                        'extra' => $extra,
                        'regions' => [],
                        'areas' => [],
                        'count' => 0,
                    ];
                }
                if ($rows) {
                    $lists[$type] = ['rows' => $rows, 'labels' => []];
                }
                continue;
            }
            $shard = in_array($type, ['recipe', 'recipe_made'], true) ? 'recipe' : 'filter-' . $type;
            $rows = $this->data->relationRows($this->lang, $shard, $members);
            if (!$rows) { continue; }
            $lists[$type] = ['rows' => $rows];
            // Server-rendered fallback: the same names and addresses, so the
            // page works without JavaScript and Twig need not repeat them.
            if ($this->catalogue !== null && in_array($type, ['q', 'd'], true)) {
                $lists[$type]['fallback'] = array_map(fn (array $row): array => [
                    'url' => $this->catalogue->route($this->lang, $type, (string) $row['id']),
                    'text' => (string) ($row['name'] ?? $row['id']),
                ], $rows);
                $lists[$type]['label'] = (string) ($page['related_label'] ?? '');
            }
            if ($type === 'i') {
                $lists[$type]['index'] = $this->data->itemFilterLabels($this->lang) + ['e' => $rows];
            }
        }
        return $lists;
    }

    private function collect(array &$ids, string $url, bool $skipRecipes = false): void
    {
        $segments = ['aufgabe' => 'q', 'quest' => 'q', 'quete' => 'q',
            'tat' => 'd', 'deed' => 'd', 'prouesse' => 'd',
            'rezept' => 'recipe', 'recipe' => 'recipe', 'recette' => 'recipe',
            'haendler' => 'vendor', 'vendor' => 'vendor', 'marchand' => 'vendor'];
        $parts = explode('/', trim(parse_url($url, PHP_URL_PATH) ?? '', '/'));
        if (count($parts) === 3 && isset($segments[$parts[1]])) {
            $type = $segments[$parts[1]];
            if ($skipRecipes && $type === 'recipe') {
                return;
            }
            $ids[$type][] = $parts[2];
        }
    }
}
