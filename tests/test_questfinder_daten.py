"""The quest finder's class and origin values come from the theme path.

`build_daten.py` writes two paths per quest: `f`/`fk` is the map path used for
placement, `tp` the theme path as [key, label] pairs. The finder reads the class
and the race from `tp[1]`; the client key travels in the address, the label is
shown. This test holds the built data to that shape, so the values cannot
silently disappear again.
"""
from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
SPRACHEN = ('de', 'en', 'fr')


def quests(lang: str) -> list[dict]:
    text = (WEB / ('daten-%s.js' % lang)).read_text(encoding='utf-8')
    marker = 'MQL_QUESTS'
    start = text.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(text[start:].lstrip().lstrip('=').lstrip())[0]


class ThemenpfadTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.daten = {lang: quests(lang) for lang in SPRACHEN}

    def test_class_quests_carry_their_class_as_key_and_label(self):
        for lang in SPRACHEN:
            klassen = {}
            for quest in self.daten[lang]:
                if quest.get('th') != 'class':
                    continue
                pfad = quest.get('tp') or []
                self.assertGreaterEqual(len(pfad), 2, '%s: %s ohne Themenpfad' % (lang, quest['i']))
                self.assertEqual(pfad[0][0], 'theme:class', '%s: %s' % (lang, quest['i']))
                key, label = pfad[1]
                self.assertTrue(key.startswith('category:'), '%s: %s' % (lang, key))
                self.assertTrue(label.strip(), '%s: %s ohne Klassennamen' % (lang, quest['i']))
                klassen[key] = label
            self.assertGreaterEqual(len(klassen), 10, '%s: zu wenige Klassen (%d)' % (lang, len(klassen)))

    def test_origin_quests_carry_their_race(self):
        for lang in SPRACHEN:
            voelker = {}
            for quest in self.daten[lang]:
                if quest.get('th') != 'origin':
                    continue
                pfad = quest.get('tp') or []
                self.assertGreaterEqual(len(pfad), 2, '%s: %s ohne Themenpfad' % (lang, quest['i']))
                self.assertEqual(pfad[0][0], 'theme:origin', '%s: %s' % (lang, quest['i']))
                key, label = pfad[1]
                self.assertTrue(key.startswith('category:'), '%s: %s' % (lang, key))
                self.assertTrue(label.strip(), '%s: %s ohne Volksnamen' % (lang, quest['i']))
                voelker[key] = label
            self.assertGreaterEqual(len(voelker), 6, '%s: zu wenige Völker (%d)' % (lang, len(voelker)))

    def test_the_map_path_stays_separate(self):
        """`f` keeps the place, `tp` the theme; neither replaces the other."""
        for lang in SPRACHEN:
            for quest in self.daten[lang]:
                if quest.get('th') not in ('class', 'origin'):
                    continue
                self.assertNotEqual((quest.get('f') or [''])[0], 'themeClass', '%s: %s' % (lang, quest['i']))
                self.assertTrue(quest.get('f'), '%s: %s ohne Kartenpfad' % (lang, quest['i']))

    def test_the_finder_reads_the_theme_path(self):
        quelle = (WEB / 'karten-aufgabenfilter.js').read_text(encoding='utf-8')
        self.assertIn('row.tp', quelle)
        self.assertNotIn("row.f[0] === 'themeClass'", quelle)
        self.assertNotIn("row.f[0] === 'themeOrigin'", quelle)


if __name__ == '__main__':
    unittest.main()
