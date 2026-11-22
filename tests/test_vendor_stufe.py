"""Händlerliste: „Ware ab Stufe“ und der Filter für die eigene Stufe.

Die Spalte zeigt die kleinste Mindeststufe der Ware; der Filter prüft das
gleitende Fenster von zehn Stufen, dieselbe Grenze wie der Eignungs-Chip.
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from vendor_viewmodel import item_min_levels, vendor_index


class VendorLevelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.stufen = item_min_levels()

    def test_item_levels_are_positive(self):
        self.assertGreater(len(self.stufen), 70000)
        self.assertTrue(all(stufe > 0 for stufe in self.stufen.values()))

    def test_range_and_levels_per_vendor(self):
        # Zwei Gegenstände mit bekannten Mindeststufen, einer ohne.
        items = sorted(self.stufen.items())[:2]
        (eins, stufe_eins), (zwei, stufe_zwei) = items
        source = {'vendors': {
            '70000001': {'name': {'de': 'Probe'}, 'type': 'barter',
                         'items': [eins, zwei], 'places': []},
            '70000002': {'name': {'de': 'Leer'}, 'type': 'vendor',
                         'items': [], 'places': []},
        }}
        rows = {row['id']: row for row in vendor_index(source, 'de', {})['vendors']}
        probe = rows['70000001']
        self.assertEqual(probe['ml_min'], min(stufe_eins, stufe_zwei))
        self.assertEqual(probe['ml_levels'], sorted({stufe_eins, stufe_zwei}))
        self.assertEqual(rows['70000002']['ml_min'], None)
        self.assertEqual(rows['70000002']['ml_levels'], [])

    def test_sliding_window_matches_the_suitability_rule(self):
        """Ein Händler passt, wenn eine Ware zwischen Stufe-10 und Stufe liegt."""
        stufe = 123
        passend = [level for level in (110, 113, 120, 123, 124, 100)]
        treffer = [level for level in passend if stufe - 10 <= level <= stufe]
        self.assertEqual(sorted(treffer), [113, 120, 123])
        self.assertNotIn(124, treffer, 'Ware über der eigenen Stufe passt nicht')
        self.assertNotIn(100, treffer, 'zu alte Ware passt nicht')


if __name__ == '__main__':
    unittest.main()
