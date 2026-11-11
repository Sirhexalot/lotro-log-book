"""Instance templates: the index and its filter logic.

The instances come from the client's private encounter templates; level and
place come from the opening quest. These checks keep the join honest and the
filters working.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import unittest
from pathlib import Path

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
