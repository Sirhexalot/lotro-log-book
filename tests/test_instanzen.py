"""Instance templates: the index and its filter logic.

The instances come from the client's private encounter templates; level and
place come from the opening quest. These checks keep the join honest and the
filters working.
"""
from __future__ import annotations

import json
import hashlib
import os
import shutil
import subprocess
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image

from tools.instanzgegner import LORE, boss_dids, eindeutige_dungeons, kampfziele
from tools.instanzkarten import instanzkarten, zuschnitt

ROOT = Path(__file__).resolve().parents[1]
DATEN = Path(os.environ.get('LLB_DATA') or Path.home() / '.cache' / 'llb-php' / 'phpdata')
SPRACHEN = ('de', 'en', 'fr')
ARTEN = {'instanz', 'scharmuetzel', 'schlachtzug', 'schlacht', 'team', 'sonst'}

PRUEFUNG = '''require 'php/src/Instances.php';
$rows = json_decode(stream_get_contents(STDIN), true);
$out = [];
foreach ([[], ['q' => 'dunhoth'], ['region' => [268437557]], ['art' => ['schlachtzug']],
          ['von' => '100', 'bis' => '160'], ['spieler' => [12]]] as $filter) {
    $out[] = count(array_filter($rows, static fn ($r) => \\Llb\\Instances::matches($r, $filter)));
}
$sorted = \\Llb\\Instances::sorted($rows);
echo json_encode([$out, $sorted[0]['name'] ?? null]);
'''


@unittest.skipUnless((DATEN / 'de' / 'instances-index.json').is_file(),
                     'instances-index.json fehlt (tools/build_php_data.py)')
class InstanceIndexTest(unittest.TestCase):
    def setUp(self):
        self.daten = json.loads(
            (DATEN / 'de' / 'instances-index.json').read_text(encoding='utf-8'))
        self.rows = self.daten['instances']

    def test_one_row_per_instance_with_a_name(self):
        self.assertGreater(len(self.rows), 150)
        self.assertLess(len(self.rows), 300)
        for row in self.rows:
            self.assertTrue(row['name'].strip(), row['id'])
            self.assertIn(row['type'], ARTEN, row['id'])
            self.assertIsNone(row['quest'])

    def test_level_and_players_stay_within_the_export(self):
        for row in self.rows:
            if row['level'] is not None:
                self.assertGreaterEqual(row['level'], 1, row['id'])
                self.assertLessEqual(row['level'], 160, row['id'])
            if row['players'] is not None:
                self.assertGreaterEqual(row['players'], 1, row['id'])
                # 250 is the largest value in the client (open landscape areas).
                self.assertLessEqual(row['players'], 250, row['id'])

    def test_place_labels_exist_for_every_place(self):
        labels = self.daten['labels']
        for row in self.rows:
            if row['area'] is None:
                continue
            self.assertIn(str(row['area']), {**labels['area'], **labels['region']}, row['id'])
            self.assertIn(str(row['region']), labels['region'], row['id'])

    def test_rohdaten_template_count_matches_the_index(self):
        # The index must not silently drop templates.
        quelle = ROOT / 'daten' / 'instanzen.json'
        if not quelle.is_file():
            self.skipTest('daten/instanzen.json fehlt')
        instanzen = json.loads(quelle.read_text(encoding='utf-8'))['instanzen']
        with_name = [e for e in instanzen.values() if (e['name'].get('de') or e['name'].get('en'))]
        self.assertEqual(len(self.rows), len(with_name))

    def test_real_names_clusters_and_ranges(self):
        for lang in SPRACHEN:
            rows = json.loads((DATEN / lang / 'instances-index.json').read_text())['instances']
            self.assertEqual({r['id'] for r in rows}, {r['id'] for r in self.rows})
        elendil = next(r for r in self.rows if r['id'] == '7002148C')
        self.assertEqual(elendil['name'], 'Feste Elendil')
        self.assertEqual(elendil['cluster'], 'Annúminas')
        self.assertEqual(elendil['group_sizes'], [6])
        self.assertEqual(elendil['level'], 40)
        self.assertGreaterEqual(elendil['level_max'], 100)

    def test_detail_data_is_localized_and_only_uses_catalogued_tasks(self):
        for lang in SPRACHEN:
            details = json.loads((DATEN / lang / 'instance-details.json').read_text())['instances']
            self.assertEqual(set(details), {row['id'] for row in self.rows})
            self.assertEqual(sum(len(row['tasks']) for row in details.values()), 553)
            for row in details.values():
                self.assertTrue(row['name'])
                self.assertTrue(all(task['url'].startswith('/%s/' % lang)
                                    for task in row['tasks']))

    def test_interior_preview_and_empty_map_section(self):
        details = json.loads((DATEN / 'de' / 'instance-details.json').read_text())['instances']
        if not (Path.home() / '.cache/llb-instance-map-export/1091572673.png').is_file():
            self.skipTest('Thangúlhad client export not present')
        self.assertEqual(details['7001B630']['map_size'], [192, 184])
        self.assertTrue(details['7001B630']['map'].endswith('1091572673-crop-v1.png'))
        self.assertFalse(details['7001A78B']['map'])

    def test_erebor_shows_chest_loot_separately_from_quest_rewards(self):
        expected = {'de': '17,5\u00a0%', 'en': '17.5%', 'fr': '17,5\u00a0%'}
        for lang, chance in expected.items():
            details = json.loads((DATEN / lang / 'instance-details.json').read_text())['instances']
            row = details['700331AB']
            drops = row['chest_loot']
            self.assertEqual(len(drops), len({d['id'] for d in drops}))
            item = next(d for d in drops if d['url'].endswith('/70034442/'))
            self.assertIn(chance, item['chance'])
            self.assertEqual(item['conditions'], [{
                'level': [85, 85], 'tier': [1, 3], 'players': [12, 12],
                'chances': [0.25, 0.175, 0.0625],
            }])
            self.assertTrue(all(d['url'] and d['image'] for d in drops))
            self.assertTrue(any(d['quest_rewards'] for d in details.values()))
            for entry in details.values():
                self.assertTrue({q['quest_id'] for q in entry['quest_rewards']} <=
                                {q['id'] for q in entry['tasks']})

    @unittest.skipUnless((LORE / 'maps' / 'markers').is_dir(), 'local enemy markers not present')
    def test_glinghant_has_localized_enemies_but_no_doors_or_allies(self):
        expected = {'de': 'Angmarim-Späher', 'en': 'Angmarim Look-out', 'fr': 'Vigie angmarim'}
        for lang, name in expected.items():
            details = json.loads((DATEN / lang / 'instance-details.json').read_text())['instances']
            names = details['7002148D']['enemies']
            self.assertIn('Nengon', names)
            self.assertIn(name, names)
            self.assertNotIn('Theodore Gorse', names)
            self.assertNotIn('Door', names)
            self.assertEqual(len(names), len(set(names)))

    @unittest.skipUnless((LORE / 'maps' / 'markers').is_dir(), 'local enemy markers not present')
    def test_chest_bosses_are_localized_and_part_of_the_enemy_list(self):
        erwartet = {'de': 'Dolguzigir, der Dunkle Archivar',
                    'en': 'Dolguzigir, the Dark Archivist',
                    'fr': "Dolguzigir, l'Archiviste Noir"}
        for lang, name in erwartet.items():
            details = json.loads((DATEN / lang / 'instance-details.json').read_text())['instances']
            bosse = details['70054899']['bosses']
            self.assertEqual(bosse, [name])
            self.assertIn(name, details['70054899']['enemies'])
            self.assertEqual(details['70024280']['bosses'], ['Brogur'])
            for entry in details.values():
                self.assertTrue(set(entry['bosses']) <= set(entry['enemies']))
                self.assertEqual(entry['enemy_count'], len(entry['enemies']))
                self.assertEqual(entry['species_count'],
                                 sum(len(group['arten']) for group in entry['enemy_groups']))

    def test_confirmed_chest_loot_is_an_item_source_with_conditions(self):
        shard = hashlib.md5(b'70034442').hexdigest()[:2]
        page = json.loads((DATEN / 'de' / 'page-i' / (shard + '.json')).read_text())[
            'entities']['70034442']
        groups = [group for group in page['where_groups']
                  if group['label'] == 'Truhenbeute aus Instanzen']
        self.assertEqual(len(groups), 1)
        entries = groups[0]['entries']
        self.assertEqual(len(entries), 3)
        self.assertTrue(all('/de/instanz/' in entry['url'] and entry['url'].endswith('#truhenbeute')
                            and len(entry['conditions']) == 1 for entry in entries))
        self.assertTrue(all('Stufe 85' in entry['conditions'][0] and 'Chance je Truhe' in entry['conditions'][0]
                            and '17,5 %' in entry['conditions'][0] and '25 %' in entry['conditions'][0]
                            and '6,25 %' in entry['conditions'][0] for entry in entries))

    def test_chest_item_page_search_and_instance_share_one_identity(self):
        ident = '70020830'
        shard = hashlib.md5(ident.encode()).hexdigest()[:2]
        segments = {'de': ('gegenstand', 'instanz'), 'en': ('item', 'instance'),
                    'fr': ('objet', 'instance')}
        for lang, (item_segment, instance_segment) in segments.items():
            base = DATEN / lang
            page = json.loads((base / 'page-i' / (shard + '.json')).read_text())['entities'][ident]
            self.assertEqual(page['symbol'], 1090537025)
            self.assertTrue(page['description'])
            groups = [group for group in page['where_groups'] if group.get('instance_chests')]
            self.assertEqual(len(groups), 1)
            self.assertEqual(len(groups[0]['entries']), 51)
            source = next(row for row in groups[0]['entries'] if '7001A78B' in row['url'])
            self.assertTrue(source['url'].startswith(f'/{lang}/{instance_segment}/7001A78B/'))
            self.assertEqual(len(source['conditions']), 1)
            self.assertIn('50–59 · T1–T3 · 1–3 / 6 / 12', source['conditions'][0])
            details = json.loads((base / 'instance-details.json').read_text())['instances']
            drop = next(row for row in details['7001A78B']['chest_loot'] if row['id'] == ident)
            self.assertEqual(drop['url'], f'/{lang}/{item_segment}/{ident}/')
            self.assertEqual(drop['image'], page['symbol'])
            index = json.loads((base / 'filter-items.json').read_text())
            self.assertEqual(len(index['instanceChest']), 82)
            self.assertIn(ident, index['instanceChest'])

    def test_finder_rows_are_flat_and_link_to_instance_details(self):
        template = (ROOT / 'php/templates/instances/list.twig').read_text(encoding='utf-8')
        self.assertNotIn('<h2>{{ group.name }}</h2>', template)
        self.assertIn('href="{{ row.url }}"', template)
        sitemaps = json.loads((DATEN / 'sitemaps.json').read_text(encoding='utf-8'))
        urls = sitemaps['sections']['/de/instanz/sitemap.xml']
        self.assertEqual(len(urls), len(self.rows))
        self.assertTrue(all('/de/instanz/' in url for url in urls))


class InstanceDetailSourcesTest(unittest.TestCase):
    def test_crop_removes_grey_border_only_and_keeps_original(self):
        with TemporaryDirectory() as folder:
            base = Path(folder)
            bild = Image.new('RGB', (40, 30), '#7f7f7f')
            bild.paste((0, 0, 0), (10, 4, 30, 26))
            bild.save(base / '123.png')
            path, width, height = instanzkarten({'a': {'karte': {'bild': 123}},
                                                  'b': {'karte': {'bild': 456}}},
                                                 base, base / 'preview')['123']
            self.assertEqual((width, height), (20, 22))
            with Image.open(path) as cropped, Image.open(base / '123.png') as original:
                self.assertEqual(cropped.getpixel((0, 0)), (0, 0, 0))
                self.assertEqual(original.size, (40, 30))
            schwarz = Image.new('RGB', (30, 40))
            schwarz.putpixel((15, 20), (127, 127, 127))
            self.assertEqual(zuschnitt(schwarz).size, schwarz.size)

    def test_bosses_need_a_chest_at_their_position(self):
        namen = {'1': 'Dolguzigir, the Dark Archivist', '2': 'Bound Protector',
                 '3': 'Brogur'}
        # A named chest proves its boss even among stacked markers.
        self.assertEqual(boss_dids({'a': [('1', (0.0, 0.0)), ('2', (0.01, 0.0))]},
                                   {'a': [("Dolguzigir's Chest", (0.0, 0.0))]}, namen),
                         {'a': ['1']})
        # An unnamed chest with one single-placed enemy is accepted.
        self.assertEqual(boss_dids({'a': [('3', (0.0, 0.0))]},
                                   {'a': [('Fancy Wood Chest', (0.0, 0.0))]}, namen),
                         {'a': ['3']})
        # Two ordinary enemies at one chest prove nothing.
        self.assertEqual(boss_dids({'a': [('2', (0.0, 0.0)), ('3', (0.01, 0.0))]},
                                   {'a': [('Chest', (0.0, 0.0))]}, namen), {})
        # A chest without an enemy at its position stays silent.
        self.assertEqual(boss_dids({'a': [('3', (1.0, 1.0))]},
                                   {'a': [('Chest', (0.0, 0.0))]}, namen), {})

    def test_enemies_require_a_direct_combat_event_or_unshared_dungeon(self):
        self.assertEqual(list(kampfziele([[{'QuestEvent_ID': 22, 'QuestEvent_MonsterDID': 123},
                                           {'QuestEvent_ID': 11, 'QuestEvent_MonsterDID': 234},
                                           {'QuestEvent_ID': 22, 'QuestEvent_MonsterDID': 345,
                                            'QuestEvent_RoleConstraint': 1}]])), ['123'])
        self.assertEqual(eindeutige_dungeons(
            {'a': ['x'], 'b': ['y'], 'c': ['y'], 'd': ['z', 'w'], 'e': ['w']},
            {'x': 1, 'y': 2, 'z': 3, 'w': 4}), {1: 'a'})


@unittest.skipUnless(shutil.which('php'), 'PHP required')
@unittest.skipUnless((DATEN / 'de' / 'instances-index.json').is_file(),
                     'instances-index.json fehlt (tools/build_php_data.py)')
class InstanceFilterTest(unittest.TestCase):
    def test_filters_and_sorting(self):
        rows = json.loads((DATEN / 'de' / 'instances-index.json').read_text(encoding='utf-8'))['instances']
        ergebnis = subprocess.run(['php', '-r', PRUEFUNG], cwd=ROOT, input=json.dumps(rows),
                                  capture_output=True, text=True, check=True)
        zahlen, erster = json.loads(ergebnis.stdout)
        alle, dunhoth, region, schlachtzug, stufe, spieler = zahlen
        self.assertEqual(alle, len(rows))
        self.assertEqual(dunhoth, 3)
        self.assertGreater(schlachtzug, 2)
        self.assertGreater(stufe, 0)
        self.assertGreater(spieler, 0)
        self.assertTrue(erster)

    def test_range_overlap_group_membership_cluster_and_tier(self):
        row = {'name': 'Example', 'id': '1', 'search': 'example', 'type': 'instanz',
               'region': None, 'area': None, 'cluster_id': 6, 'group': '',
               'cluster': 'Annúminas', 'level': 40, 'level_max': 160,
               'group_sizes': [1, 2, 3], 'players': 3, 'difficulties': [1, 2]}
        code = "require 'php/src/Instances.php'; $r=json_decode(stream_get_contents(STDIN),true); echo json_encode(array_map(static fn ($f) => \\Llb\\Instances::matches($r,$f), [ ['von'=>'100','bis'=>'100'], ['bis'=>'39'], ['von'=>'161'], ['spieler'=>[2]], ['spieler'=>[6]], ['cluster'=>[6]], ['cluster'=>[7]], ['tier'=>[2]], ['tier'=>[3]] ]));"
        result = subprocess.run(['php', '-r', code], cwd=ROOT, input=json.dumps(row),
                                text=True, capture_output=True, check=True)
        self.assertEqual(json.loads(result.stdout), [True, False, False, True, False, True, False, True, False])


if __name__ == '__main__':
    unittest.main()
