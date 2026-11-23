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
import sys
sys.path.insert(0, str(ROOT / 'tools'))
from gebietssicht import display_name, group_for, map_tree, validate_configuration

PRUEFUNG = '''require 'php/src/Landmarks.php';
$rows = json_decode(stream_get_contents(STDIN), true);
$out = [];
foreach ([[], ['q' => 'süßgras'], ['region' => [268437557]], ['area' => [268437653]],
          ['mit' => '1'], ['q' => 'zzz'], ['area' => [268448407]],
          ['area' => [268449746]]] as $filter) {
    $out[] = count(array_filter($rows, static fn ($r) => \\Llb\\Landmarks::matches($r, $filter)));
}
$sorted = \\Llb\\Landmarks::sorted($rows);
echo json_encode([$out, $sorted[0]['name'] ?? null, $sorted[count($sorted) - 1]['name'] ?? null]);
'''

class LandmarkListPresentationTest(unittest.TestCase):
    def test_rows_show_geographic_context_without_counts_or_generic_heading(self):
        source = (ROOT / 'php' / 'src' / 'Landmarks.php').read_text(encoding='utf-8')
        template = (ROOT / 'php' / 'templates' / 'landmarks' / 'list.twig').read_text(encoding='utf-8')
        self.assertIn("$row['meta'] = implode(' · ', $teile);", source)
        self.assertNotIn("$words['quests_one']", source)
        self.assertNotIn('result.heading(lang)', template)

    def test_boolean_filter_keeps_its_specific_label(self):
        source = (ROOT / 'web' / 'filter-server.js').read_text(encoding='utf-8')
        self.assertNotIn("g.label=({de:'Auswahl'", source)


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

    def test_shared_display_groups_are_additional_to_original_area_ids(self):
        validate_configuration()
        tree = map_tree()
        expected = {
            268447030: 'dunland',
            268447045: 'dunland',
            268447051: 'dunland',
            268448407: 'east-rohan',
            268449746: 'west-rohan',
        }
        for map_id, group_id in expected.items():
            self.assertEqual(group_for(map_id, tree)['id'], group_id)
        self.assertEqual(display_name(268448407, 'Rohan\u00a0Est\u00a0: Le Plateau', 'fr'),
                         'Le Plateau')
        self.assertEqual(display_name(268449746, 'Ouest du Rohan : Terre-du-Roi', 'fr'),
                         'Terre-du-Roi')

    def test_generated_index_keeps_map_ids_under_group_headings(self):
        index = json.loads(
            (DATEN / 'de' / 'landmarks-index.json').read_text(encoding='utf-8'))
        labels = index['labels']
        for map_id, group_id in (
                ('268448407', 'east-rohan'), ('268449746', 'west-rohan'),
                ('268447030', 'dunland'), ('268447045', 'dunland'),
                ('268447051', 'dunland')):
            self.assertEqual(labels['area_group'][map_id]['id'], group_id)
            self.assertIn(map_id, labels['area'])
        self.assertEqual(labels['area']['268448407'], 'Die Steppe')
        self.assertEqual(labels['area']['268449746'], 'Königsstatt')


@unittest.skipUnless(shutil.which('php'), 'PHP required')
@unittest.skipUnless((DATEN / 'de' / 'landmarks-index.json').is_file(),
                     'landmarks-index.json fehlt (tools/build_php_data.py)')
class LandmarkFilterTest(unittest.TestCase):
    def test_filters_and_sorting(self):
        rows = json.loads((DATEN / 'de' / 'landmarks-index.json').read_text(encoding='utf-8'))['landmarks']
        ergebnis = subprocess.run(['php', '-r', PRUEFUNG], cwd=ROOT, input=json.dumps(rows),
                                  capture_output=True, text=True, check=True)
        zahlen, erster, letzter = json.loads(ergebnis.stdout)
        alle, treffer, region, gebiet, mit, nichts, ost_rohan, west_rohan = zahlen
        self.assertEqual(alle, len(rows))
        self.assertEqual(treffer, 1)          # „Alter Süßgrashof“ in Breeland
        # Numbers of the built data. Since 23.11.2026 the landblock resolver
        # names the landscape of a landmark, so an interior no longer borrows a
        # landscape map: Eriador 863 → 829, West Rohan 58 → 56.
        self.assertEqual(region, 829)         # Eriador
        self.assertEqual(gebiet, 51)          # Breeland
        self.assertEqual(mit, 1874)
        self.assertEqual(nichts, 0)
        self.assertEqual(ost_rohan, 17)
        self.assertEqual(west_rohan, 56)
        self.assertLessEqual(erster, letzter)


if __name__ == '__main__':
    unittest.main()
