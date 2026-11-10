"""The landmark filter index and its filter logic.

The index is one row per landmark; the browser reads it and filters in memory.
The PHP checks run the real class, so a change in the matching rules cannot
silently drift from the page.
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

PRUEFUNG = '''require 'php/src/Landmarks.php';
$rows = json_decode(stream_get_contents(STDIN), true);
$out = [];
foreach ([[], ['q' => 'süßgras'], ['region' => [268437557]], ['area' => [268437653]],
          ['mit' => '1'], ['q' => 'zzz']] as $filter) {
    $out[] = count(array_filter($rows, static fn ($r) => \\Llb\\Landmarks::matches($r, $filter)));
}
$sorted = \\Llb\\Landmarks::sorted($rows);
echo json_encode([$out, $sorted[0]['name'] ?? null, $sorted[count($sorted) - 1]['name'] ?? null]);
'''


@unittest.skipUnless((DATEN / 'de' / 'landmarks-index.json').is_file(),
                     'landmarks-index.json fehlt (tools/build_php_data.py)')
class LandmarkIndexTest(unittest.TestCase):
    def setUp(self):
        self.rows = json.loads(
            (DATEN / 'de' / 'landmarks-index.json').read_text(encoding='utf-8'))['landmarks']

    def test_one_row_per_landmark_with_a_searchable_name(self):
        self.assertGreater(len(self.rows), 2000)
        for row in self.rows:
            self.assertTrue(row['name'].strip(), row['id'])
            self.assertTrue(row['search'].strip(), row['id'])
            self.assertEqual(row['search'], row['search'].lower(), row['id'])

    def test_place_and_quest_count_are_filled(self):
        mit_ort = [row for row in self.rows if row['area'] is not None]
        self.assertGreater(len(mit_ort), 2000)
        for row in mit_ort:
            self.assertIsNotNone(row['region'], row['id'])
        self.assertGreater(sum(1 for row in self.rows if row['quests'] > 0), 1000)

    def test_region_and_area_labels_exist_for_every_place(self):
        labels = json.loads(
            (DATEN / 'de' / 'landmarks-index.json').read_text(encoding='utf-8'))['labels']
        for row in self.rows:
            if row['area'] is None:
                continue
            # A region map is its own area: its label sits in the region list.
            self.assertIn(str(row['area']), {**labels['area'], **labels['region']}, row['id'])
            self.assertIn(str(row['region']), labels['region'], row['id'])
            if row['area'] != row['region']:
                self.assertIn(str(row['area']), labels['area_region'], row['id'])


@unittest.skipUnless(shutil.which('php'), 'PHP required')
@unittest.skipUnless((DATEN / 'de' / 'landmarks-index.json').is_file(),
                     'landmarks-index.json fehlt (tools/build_php_data.py)')
class LandmarkFilterTest(unittest.TestCase):
    def test_filters_and_sorting(self):
        rows = json.loads((DATEN / 'de' / 'landmarks-index.json').read_text(encoding='utf-8'))['landmarks']
        ergebnis = subprocess.run(['php', '-r', PRUEFUNG], cwd=ROOT, input=json.dumps(rows),
                                  capture_output=True, text=True, check=True)
        zahlen, erster, letzter = json.loads(ergebnis.stdout)
        alle, treffer, region, gebiet, mit, nichts = zahlen
        self.assertEqual(alle, len(rows))
        self.assertEqual(treffer, 1)          # „Alter Süßgrashof“ in Breeland
        self.assertEqual(region, 813)         # Eriador
        self.assertEqual(gebiet, 51)          # Breeland
        self.assertEqual(mit, 1874)
        self.assertEqual(nichts, 0)
        self.assertLessEqual(erster, letzter)


if __name__ == '__main__':
    unittest.main()
