"""Checks for the instance chest loot and interior map data.

The data file is built locally (`tools/build_instanz_beute.py`) and ignored by
git; without it these checks are skipped.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEI = ROOT / 'daten' / 'instanz-beute.json'


@unittest.skipUnless(DATEI.is_file(), 'daten/instanz-beute.json not built')
class InstanzBeuteTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.daten = json.loads(DATEI.read_text(encoding='utf-8'))
        cls.instanzen = json.loads(
            (ROOT / 'daten' / 'instanzen.json').read_text(encoding='utf-8'))['instanzen']

    def test_every_row_points_at_a_known_pool(self):
        pools = self.daten['pools']
        self.assertTrue(pools)
        for kennung, seite in self.daten['instanzen'].items():
            self.assertIn(kennung, self.instanzen)
            for zeile in seite['beute']:
                self.assertLess(zeile['pool'], len(pools), kennung)
                self.assertEqual(len(zeile['stufe']), 2)
                self.assertEqual(len(zeile['tier']), 2)
                self.assertEqual(len(zeile['gruppe']), 2)

    def test_pool_items_carry_an_id_and_a_name(self):
        for pool in self.daten['pools']:
            for eintrag in pool:
                self.assertRegex(eintrag['i'], r'^[0-9A-F]{8}$')
                self.assertTrue(eintrag['n'], eintrag)
                self.assertGreaterEqual(eintrag['p'], 0)
                self.assertLessEqual(eintrag['p'], 1)

    def test_skirmish_chest_holds_a_bounty_and_stat_tomes(self):
        # Glinghant, band 50-59: the bounty is certain, the tomes are a roll.
        seite = self.daten['instanzen']['7002148D']
        zeilen = [z for z in seite['beute'] if z['stufe'] == [50, 59]]
        self.assertTrue(zeilen)
        pool = self.daten['pools'][zeilen[0]['pool']]
        namen = {eintrag['n']: eintrag['p'] for eintrag in pool}
        self.assertEqual(namen['Beute: Altgedienter Knappe'], 1.0)
        schriften = [n for n in namen if n.startswith('Schrift der ')]
        self.assertGreaterEqual(len(schriften), 10)

    def test_a_scaled_instance_names_its_interior_map(self):
        seite = self.daten['instanzen']['7002148D']
        self.assertEqual(seite['karte']['name'], 'Glinghant')
        self.assertTrue(seite['karte']['bild'])

    def test_landscape_copies_have_no_interior_map(self):
        # A skirmish copied from the landscape names no dungeon.
        self.assertIsNone(self.daten['instanzen']['7001A78B']['karte'])


if __name__ == '__main__':
    unittest.main()
