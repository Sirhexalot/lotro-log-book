"""Scaled item levels: the catalogue's number is not always the real one.

A scalable piece stores its upper bound („Erkunder“ leggings: 474). For a level
123 character the client's curve yields 408 — the advisor must compare with that,
not with 474, or it promises +72 where the gain is +6.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'


def lies(name):
    text = (WEB / name).read_text(encoding='utf-8')
    return json.loads(text[text.index('=') + 1:text.rindex(';')])


class SkalierungTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kurven = lies('skalierung.js')['kurven']
        cls.daten = lies('gegenstaende-de.js')

    def test_curves_are_present_and_plausible(self):
        self.assertGreater(len(self.kurven), 20)
        for kurve in self.kurven:
            self.assertTrue(kurve)
            # Steigende Stufen. Die Gegenstandsstufe steigt fast immer, kann in
            # der Client-Kurve aber einzelne Dellen haben; sie ist keine Zusage.
            for (links, _), (rechts, _) in zip(kurve, kurve[1:]):
                self.assertLess(links, rechts)

    def test_scaled_item_uses_the_curve_not_the_upper_bound(self):
        zeile = next(z for z in self.daten['e'] if z[0] == '7006311F')
        self.assertEqual(len(zeile), 20, 'Zeilenform geändert')
        self.assertEqual(zeile[7], 474)
        self.assertGreaterEqual(zeile[18], 0, 'Skalierung nicht erkannt')
        kurve = dict((stufe, stufe_wert) for stufe, stufe_wert in self.kurven[zeile[18]])
        self.assertEqual(kurve.get(123), 408)

    def test_item_level_scaling_without_curve_keeps_its_level(self):
        # „Item_Level#120-“ hat keine Kurve: die Katalogstufe gilt unverändert.
        zeile = next(z for z in self.daten['e'] if z[0] == '700554E3')
        self.assertEqual(zeile[18], -1)
        self.assertEqual(zeile[7], 402)

    def test_every_curve_index_points_into_the_list(self):
        for sprache in ('de', 'en', 'fr'):
            daten = lies('gegenstaende-%s.js' % sprache)
            for zeile in daten['e']:
                self.assertLess(zeile[18], len(self.kurven), (sprache, zeile[0]))
                self.assertGreaterEqual(zeile[18], -1, (sprache, zeile[0]))


if __name__ == '__main__':
    unittest.main()
