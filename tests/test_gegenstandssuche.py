"""The item browser's data file must stay consistent with itself.

The page trusts index numbers into small label arrays; a shifted index would
show the wrong category without any error. These checks run against the files
build_gegenstandssuche.py wrote.

They also guard the grouping the browser draws: every item belongs to a
category, and every category can name its children, so a parent count never
stands above children that do not add up.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
SPRACHEN = ('de', 'en', 'fr')

# Feste Reihenfolge: der Index steht in der Adresse, nicht der Name.
KATEGORIEN = ['ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM', 'ESSENCE', 'ITEM',
              'JEWELLERY']
# Welche Ebene die Kategorie im Baum aufklappt (erste Kindebene).
KINDER = {'ARMOUR': 'art', 'WEAPON': 'art', 'LEGENDARY_WEAPON': 'art',
          'LEGENDARY_ITEM': 'platz', 'JEWELLERY': 'gattung', 'ITEM': 'klasse'}
FELD = {'kat': 3, 'platz': 5, 'art': 6, 'klasse': 8, 'gattung': 9}


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
            self.assertEqual(len(daten['kat']), len(KATEGORIEN), sprache)
            self.assertTrue(all(name.strip() for name in daten['kat']), sprache)
            for zeile in daten['e']:
                kat, qual, platz, art, stufe, klasse, gattung = (
                    zeile[3], zeile[4], zeile[5], zeile[6], zeile[7], zeile[8], zeile[9])
                self.assertIn(kat, range(len(KATEGORIEN)), zeile)
                self.assertTrue(0 <= qual <= 5, zeile)
                for wert, feld in ((platz, 'platz'), (art, 'art'),
                                   (klasse, 'klasse'), (gattung, 'gattung')):
                    if wert >= 0:
                        self.assertLess(wert, len(daten[feld]), (feld, zeile))
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
            self.assertEqual(daten['katKey'], KATEGORIEN, sprache)
            for feld in ('platz', 'art', 'klasse', 'gattung'):
                self.assertEqual(len(daten[feld + 'Key']), len(daten[feld]), (sprache, feld))
                self.assertTrue(all(schluessel == schluessel.strip() and schluessel
                                    for schluessel in daten[feld + 'Key']), (sprache, feld))
            self.assertIn('RANGED_ITEM', daten['platzKey'])
            self.assertIn('LIGHT', daten['artKey'])
            for zeile in daten['e']:
                if zeile[5] >= 0:
                    self.assertTrue(daten['platzKey'][zeile[5]], zeile)

    def test_every_category_names_its_children(self):
        """A category may never show a count its children cannot add up to."""
        for sprache in SPRACHEN:
            daten = lies(sprache)
            for nummer, schluessel in enumerate(KATEGORIEN):
                teil = [z for z in daten['e'] if z[3] == nummer]
                self.assertTrue(teil, (sprache, schluessel))
                if schluessel == 'ESSENCE':
                    continue
                feld = KINDER[schluessel]
                self.assertTrue(all(z[FELD[feld]] >= 0 for z in teil),
                                (sprache, schluessel, 'ohne Einordnung'))
                # Labels come from the client; only its unclassified class has
                # none, and the page shows those as "ohne Angabe".
                beschriftet = [z for z in teil
                               if daten[feld][z[FELD[feld]]].strip()]
                self.assertGreater(len(beschriftet), len(teil) * 0.95,
                                   (sprache, schluessel))

    def test_jewellery_is_its_own_category(self):
        """The client calls it Geschmeide/Jewellery/Bijoux, not "other"."""
        erwartet = {'de': 'Geschmeide', 'en': 'Jewellery', 'fr': 'Bijoux'}
        for sprache in SPRACHEN:
            daten = lies(sprache)
            stelle = daten['katKey'].index('JEWELLERY')
            self.assertEqual(daten['kat'][stelle], erwartet[sprache], sprache)
            schmuck = [z for z in daten['e'] if z[3] == stelle]
            self.assertGreater(len(schmuck), 10000, sprache)
            # Every jewellery item is named by the client's equipment category.
            self.assertTrue(all(z[9] >= 0 for z in schmuck), sprache)
            namen = {daten['gattung'][z[9]] for z in schmuck}
            self.assertTrue({'Ring', 'Ohrring', 'Halskette', 'Armband', 'Talisman'}
                            <= namen if sprache == 'de' else namen, sprache)
            # And no other category keeps a plain "other" bucket of jewellery.
            andere = [z for z in daten['e'] if z[3] != stelle and z[9] >= 0]
            self.assertFalse(andere, sprache)

    def test_page_links_to_the_browser(self):
        # The menu builds one address per language, never an .html form.
        texte = (WEB / 'menue.js').read_text(encoding='utf-8')
        self.assertIn("gegenstandssuche: 'gegenstandssuche'", texte)
        self.assertIn("gegenstandssuche: 'item-search'", texte)
        self.assertIn("gegenstandssuche: 'recherche-objets'", texte)
        seite = (WEB / 'gegenstaende.html').read_text(encoding='utf-8')
        self.assertIn('data-seite="gegenstaende"', seite)
        self.assertIn('gegenstaende.js', seite)
        lader = (WEB / 'sprache.js').read_text(encoding='utf-8')
        self.assertIn("gegenstaende-' + sprache", lader)
        self.assertIn('gegenstaende', (ROOT / 'baue_website.py').read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
