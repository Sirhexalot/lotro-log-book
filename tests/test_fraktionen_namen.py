"""Names and running text of the faction records must be clean.

The client export carries the game's gender syntax (`${PLAYERNAME:Feind[m]|Feindin[f]}`)
in three faction names and internal keys (`@other`) among the place labels. Both
reached the page once: the placeholders as literal text in the title, the keys
as a trailing "· @other". These checks keep that from happening again - they are
about the text a reader sees, not about the catalogue being complete.

    python3 -m unittest tests.test_fraktionen_namen
"""
from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEI = ROOT / 'daten' / 'fraktionen.json'
SPRACHEN = ('de', 'en', 'fr')
# The three names the export writes with a gender choice.
BEKANNT = ('700487ED', '700487EE', '700487EF')


class FraktionsnamenTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not DATEI.is_file():
            raise unittest.SkipTest('daten/fraktionen.json fehlt (tools/build_fraktionen.py)')
        cls.fraktionen = json.loads(DATEI.read_text(encoding='utf-8'))['fraktionen']

    def test_names_are_plain_text(self):
        for ident, eintrag in self.fraktionen.items():
            for sprache in SPRACHEN:
                name = (eintrag.get('name') or {}).get(sprache) or ''
                self.assertTrue(name, '%s ohne Namen (%s)' % (ident, sprache))
                self.assertNotIn('${', name, ident)
                self.assertNotIn('_', name, '%s: Unterstrich im Namen' % ident)
                self.assertEqual(name, name.strip(), '%s: Leerraum am Rand' % ident)
                self.assertNotIn('  ', name, '%s: doppelter Leerraum' % ident)

    def test_gendered_names_are_spelled_out(self):
        # Nothing to resolve, but the resolved form must survive the export.
        for ident in BEKANNT:
            eintrag = self.fraktionen.get(ident)
            if eintrag is None:
                continue
            de = eintrag['name']['de']
            self.assertIn('Feind / Feindin', de, de)
            self.assertNotIn('${', eintrag['name']['fr'])

    def test_descriptions_keep_their_paragraphs_but_no_stray_spaces(self):
        for ident, eintrag in self.fraktionen.items():
            for sprache in SPRACHEN:
                text = (eintrag.get('desc') or {}).get(sprache) or ''
                self.assertNotIn('${', text, ident)
                self.assertNotIn('\\n', text, '%s (%s): Absatz als Backslash-Folge' % (ident, sprache))
                self.assertNotIn('  ', text, '%s (%s): doppelter Leerraum' % (ident, sprache))
                self.assertEqual(text, text.strip(), '%s (%s): Leerraum am Rand' % (ident, sprache))
                self.assertNotIn('\n\n\n', text, '%s (%s): zu viele Leerzeilen' % (ident, sprache))

    def test_places_carry_no_internal_keys(self):
        for ident, eintrag in self.fraktionen.items():
            for sprache, quellen in (eintrag.get('sources') or {}).items():
                for quelle in quellen:
                    ort = quelle.get('place') or ''
                    self.assertNotIn('@', ort, '%s (%s): %s' % (ident, sprache, ort))
                    self.assertEqual(ort, ort.strip(), '%s (%s): Leerraum' % (ident, sprache))
                    self.assertNotIn('  ', ort, '%s (%s): doppelter Leerraum' % (ident, sprache))
                    name = quelle.get('name') or ''
                    self.assertNotIn('${', name, '%s (%s)' % (ident, sprache))

    def test_sources_keep_level_and_strength(self):
        # z[2] is the quest level, z[4] the strength 1-6. Dropping them would
        # leave the page unable to say anything about a source but its name.
        gesehen = 0
        for eintrag in self.fraktionen.values():
            for quelle in (eintrag.get('sources') or {}).get('de') or []:
                self.assertIn('level', quelle)
                self.assertIn('strength', quelle)
                if quelle['strength'] is not None:
                    self.assertGreaterEqual(quelle['strength'], 0)
                    gesehen += 1
        self.assertGreater(gesehen, 100, 'die Stärke fehlt in den Rufquellen')

    def test_no_duplicate_names(self):
        namen = [(eintrag.get('name') or {}).get('de') for eintrag in self.fraktionen.values()]
        doppelt = {name for name in namen if namen.count(name) > 1}
        self.assertEqual(doppelt, set())


if __name__ == '__main__':
    unittest.main()
