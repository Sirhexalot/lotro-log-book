"""The recognition base: every item we show can be identified.

The finder holds what a player can get on purpose; the recognition base holds
every item the client knows. A worn item must never be unknown, and the base
must never carry anything beyond item facts.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
DATEN = ROOT / 'daten'
SCHARDEN = WEB / 'erkennung'
SPRACHEN = ('de', 'en', 'fr')
# Erlaubte Felder je Eintrag: Spielangaben, sonst nichts.
FELDER = {'n', 'name', 'ic', 'besch', 'kat', 'slot', 'q', 'l', 'ml', 'dt', 'sc', 'rk', 'rr', 'at', 'wt'}


def finder_ids() -> set:
    text = (WEB / 'gegenstaende-de.js').read_text(encoding='utf-8')
    daten = json.loads(text[text.index('=') + 1:text.rindex(';')])
    return {zeile[0] for zeile in daten['e']} | set(daten.get('instanceChest') or [])


class ErkennungTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pfad = DATEN / 'gegenstand-erkennung.json'
        if not pfad.is_file():
            raise unittest.SkipTest('Erkennungsbasis nicht gebaut')
        cls.daten = json.loads(pfad.read_text(encoding='utf-8'))['items']

    def test_every_item_the_finder_shows_is_identifiable(self):
        fehlend = sorted(finder_ids() - set(self.daten))
        self.assertEqual(fehlend, [], 'Finder-IDs ohne Erkennung: %s' % fehlend[:10])

    def test_base_is_complete_not_a_subset(self):
        # Die Erkennung ist größer als der Finder: sie deckt auch getragene
        # Stücke ohne Quelle ab.
        self.assertGreater(len(self.daten), len(finder_ids()))

    def test_entries_carry_item_facts_only(self):
        erlaubt = FELDER
        fremd = set()
        for eintrag in self.daten.values():
            fremd |= set(eintrag) - erlaubt
        self.assertEqual(fremd, set(), 'unerwartete Felder: %s' % sorted(fremd))
        for ident, eintrag in list(self.daten.items())[:2000]:
            self.assertRegex(ident, r'^[0-9A-F]{8}$')
            self.assertTrue(eintrag.get('n'), ident)

    def test_names_exist_in_all_three_languages(self):
        for sprache in SPRACHEN:
            mit = sum(1 for eintrag in self.daten.values()
                      if (eintrag.get('n') or {}).get(sprache))
            self.assertGreater(mit, len(self.daten) * 0.95,
                               '%s: zu wenige Namen (%d von %d)'
                               % (sprache, mit, len(self.daten)))

    def test_shards_are_small_and_reach_a_known_item(self):
        for sprache in SPRACHEN:
            ordner = SCHARDEN / sprache
            self.assertTrue(ordner.is_dir(), sprache)
            dateien = sorted(ordner.glob('*.js'))
            # Feine Teile: der Ratgeber braucht nur die getragenen Stücke.
            self.assertEqual(len(dateien), 4096, sprache)
            groesste = max(datei.stat().st_size for datei in dateien)
            self.assertLess(groesste, 20_000, '%s: Teilladung zu groß' % sprache)
        # Ein getragenes Stück aus dem Beispielimport liegt in seiner Teilladung.
        ident = '70055500'
        datei = SCHARDEN / 'de' / ('%s.js' % ident[5:8])
        self.assertTrue(datei.is_file())
        self.assertIn(ident, datei.read_text(encoding='utf-8'))


class SeltenheitTests(unittest.TestCase):
    def test_quality_is_a_name_not_an_ordinal(self):
        import build_items
        self.assertEqual(build_items.seltenheit(3), 'INCOMPARABLE')
        self.assertEqual(build_items.seltenheit(1), 'LEGENDARY')
        self.assertEqual(build_items.seltenheit('RARE'), 'RARE')
        self.assertIsNone(build_items.seltenheit(None))
        self.assertIsNone(build_items.seltenheit('unbekannt'))


if __name__ == '__main__':
    unittest.main()
