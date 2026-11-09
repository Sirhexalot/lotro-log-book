"""The item browser's data file must stay consistent with itself.

The page trusts index numbers into three label arrays; a shifted index would
show the wrong category without any error. These checks run against the files
build_gegenstandssuche.py wrote.
"""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
SPRACHEN = ('de', 'en', 'fr')


def lies(sprache):
    datei = WEB / ('gegenstaende-%s.js' % sprache)
    text = datei.read_text(encoding='utf-8')
    return json.loads(text[text.index('{'):text.rindex(';')])


class GegenstandssucheTests(unittest.TestCase):
    def test_every_item_is_present_with_a_name(self):
        items = json.loads((ROOT / 'daten' / 'items.json').read_text(encoding='utf-8'))['items']
        daten = lies('de')
        kennungen = [zeile[0] for zeile in daten['e']]
        self.assertEqual(len(kennungen), len(set(kennungen)), 'doppelte Kennung')
        # Only items without any name may be missing.
        ohne_name = {k for k, v in items.items()
                     if not ((v.get('n') or {}).get('de') or (v.get('n') or {}).get('en'))}
        self.assertEqual(set(kennungen), set(items) - ohne_name)
        for zeile in daten['e'][:200]:
            self.assertRegex(zeile[0], r'^[0-9A-F]{8}$')
            self.assertTrue(zeile[1].strip())

    def test_indices_point_into_the_label_arrays(self):
        for sprache in SPRACHEN:
            daten = lies(sprache)
            self.assertEqual(len(daten['kat']), 3)
            self.assertTrue(all(name.strip() for name in daten['kat']), sprache)
            for zeile in daten['e']:
                _, _, _, kat, qual, platz, art, stufe = zeile
                self.assertIn(kat, (-1, 0, 1, 2), zeile)
                self.assertTrue(0 <= qual <= 5, zeile)
                if platz >= 0:
                    self.assertLess(platz, len(daten['platz']), zeile)
                if art >= 0:
                    self.assertLess(art, len(daten['art']), zeile)
                self.assertTrue(isinstance(stufe, int) and stufe >= 0, zeile)

    def test_languages_share_ids_and_their_names_differ(self):
        deutsch = lies('de')
        for sprache in SPRACHEN[1:]:
            andere = lies(sprache)
            # Each file is sorted by its own names, so only the set must match.
            self.assertEqual(sorted(z[0] for z in andere['e']),
                             sorted(z[0] for z in deutsch['e']), sprache)
        self.assertNotEqual([z[1] for z in deutsch['e'][:400]],
                            [z[1] for z in lies('en')['e'][:400]])

    def test_sorted_by_name(self):
        for sprache in SPRACHEN:
            namen = [z[1].casefold() for z in lies(sprache)['e']]
            self.assertEqual(namen, sorted(namen), sprache)

    def test_catalogue_links_use_stable_keys(self):
        # A catalogue page links "same slot, same type" by key, not by a label:
        # labels differ per language and change over time.
        for sprache in SPRACHEN:
            daten = lies(sprache)
            self.assertEqual(daten['katKey'], ['ARMOUR', 'WEAPON', 'ITEM'], sprache)
            self.assertEqual(len(daten['platzKey']), len(daten['platz']), sprache)
            self.assertEqual(len(daten['artKey']), len(daten['art']), sprache)
            self.assertIn('RANGED_ITEM', daten['platzKey'])
            for zeile in daten['e']:
                if zeile[5] >= 0:
                    self.assertTrue(daten['platzKey'][zeile[5]], zeile)

    def test_page_links_to_the_browser(self):
        texte = (WEB / 'menue.js').read_text(encoding='utf-8')
        self.assertIn("'gegenstaende.html?lang=' + sprache", texte)
        seite = (WEB / 'gegenstaende.html').read_text(encoding='utf-8')
        self.assertIn('data-seite="gegenstaende"', seite)
        self.assertIn('gegenstaende.js', seite)
        lader = (WEB / 'sprache.js').read_text(encoding='utf-8')
        self.assertIn("gegenstaende-' + sprache", lader)
        self.assertIn('gegenstaende', (ROOT / 'baue_website.py').read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
