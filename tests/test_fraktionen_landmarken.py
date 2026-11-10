"""Factions and landmarks: what the build files must contain.

Both lists come from the client export and are the whole basis of their pages,
so the checks are about completeness and about not inventing a place: a landmark
without a position keeps its page, but no pin.
"""
from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEN = ROOT / 'daten'
SPRACHEN = ('de', 'en', 'fr')


def lade(name: str) -> dict:
    pfad = DATEN / name
    if not pfad.is_file():
        raise unittest.SkipTest('%s fehlt (tools/build_%s.py)' % (name, name.split('.')[0]))
    return json.loads(pfad.read_text(encoding='utf-8'))


class FraktionenTest(unittest.TestCase):
    def setUp(self):
        self.fraktionen = lade('fraktionen.json')['fraktionen']

    def test_every_faction_has_a_name_in_all_languages(self):
        ohne = [ident for ident, eintrag in self.fraktionen.items()
                if not all((eintrag.get('name') or {}).get(sprache) for sprache in SPRACHEN)]
        self.assertEqual(ohne, [])

    def test_description_and_tiers_come_from_the_export(self):
        ohne_text = [ident for ident, eintrag in self.fraktionen.items()
                     if not (eintrag.get('desc') or {}).get('de')]
        self.assertEqual(ohne_text, [])
        for ident, eintrag in self.fraktionen.items():
            self.assertLessEqual(eintrag['min'], eintrag['max'], ident)
            for stufe in range(eintrag['min'], eintrag['max'] + 1):
                self.assertIn(str(stufe), eintrag['tiers'], '%s Stufe %d' % (ident, stufe))

    def test_sources_are_only_ids_from_our_catalogue(self):
        # A source without a name would render as an empty list item.
        for ident, eintrag in self.fraktionen.items():
            for sprache, quellen in (eintrag.get('sources') or {}).items():
                for quelle in quellen:
                    self.assertTrue(quelle.get('id'), ident)
                    self.assertTrue(quelle.get('name'), '%s %s' % (ident, sprache))
                    self.assertIn(quelle.get('kind'), ('q', 'd', 't'), ident)


class LandmarkenTest(unittest.TestCase):
    def setUp(self):
        self.daten = lade('landmarken.json')
        self.landmarken = self.daten['landmarken']

    def test_counts_match_the_export(self):
        self.assertGreater(len(self.landmarken), 2000)
        self.assertEqual(self.daten['zaehler']['gesamt'], len(self.landmarken))

    def test_names_exist_in_all_languages(self):
        ohne = [ident for ident, eintrag in self.landmarken.items()
                if not all((eintrag.get('name') or {}).get(sprache) for sprache in SPRACHEN)]
        self.assertEqual(ohne, [])

    def test_pins_lie_within_their_map(self):
        for ident, eintrag in self.landmarken.items():
            if not eintrag.get('map'):
                continue
            self.assertGreaterEqual(eintrag['x'], 0, ident)
            self.assertLessEqual(eintrag['x'], 100, ident)
            self.assertGreaterEqual(eintrag['y'], 0, ident)
            self.assertLessEqual(eintrag['y'], 100, ident)

    def test_a_landmark_without_position_gets_no_pin(self):
        # Nothing is invented: no coordinates, no map, no pin.
        for ident, eintrag in self.landmarken.items():
            if eintrag.get('lat') is None:
                self.assertNotIn('map', eintrag, ident)


if __name__ == '__main__':
    unittest.main()
