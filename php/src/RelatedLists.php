<?php

declare(strict_types=1);

namespace Llb;

/** Parent pages supply relations; the listed type supplies its list adapter. */
final class RelatedLists
{
    public function __construct(private Data $data, private string $lang) {}

    public function forPage(string $kind, array $page): array
    {
        $ids = [];
        if (in_array($kind, ['area', 'region'], true)) {
            foreach ($page['members'] ?? [] as $type => $members) {
                $ids[$type] = array_column($members, 0);
            }
        } else {
            $entries = $kind === 'i' ? [] : array_merge($page['sources'] ?? [], $page['quests'] ?? []);
            foreach ($page['groups'] ?? [] as $group) {
                $entries = array_merge($entries, $group['entries']);
            }
            foreach ($entries as $entry) {
                $this->collect($ids, $entry['url'] ?? '');
            }
            if ($kind === 'i') {
                foreach ($page['used_in'] ?? [] as $entry) {
                    $this->collect($ids, $entry['url'] ?? '');
                }
            }
        }
        $lists = [];
        foreach ($ids as $type => $members) {
            $rows = $this->data->relationRows($this->lang, $type === 'recipe' ? 'recipe' : 'filter-' . $type, $members);
            if (!$rows) { continue; }
            $lists[$type] = ['rows' => $rows];
            if ($type === 'i') {
                $lists[$type]['index'] = $this->data->itemFilterLabels($this->lang) + ['e' => $rows];
            }
        }
        return $lists;
    }

    private function collect(array &$ids, string $url): void
    {
        $segments = ['aufgabe' => 'q', 'quest' => 'q', 'quete' => 'q',
            'tat' => 'd', 'deed' => 'd', 'prouesse' => 'd',
            'rezept' => 'recipe', 'recipe' => 'recipe', 'recette' => 'recipe'];
        $parts = explode('/', trim(parse_url($url, PHP_URL_PATH) ?? '', '/'));
        if (count($parts) === 3 && isset($segments[$parts[1]])) {
            $ids[$segments[$parts[1]]][] = $parts[2];
        }
    }
}
