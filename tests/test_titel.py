#!/usr/bin/env python3
"""Titles: the client catalogue, its kinds and stable page IDs.

The title pages come from the client's `titles.xml` plus the reward index.
This test guards the decisions that are easy to break later:

* internal and test titles stay out (Admin, Pedigree, "TBD", "JUBILÄUMS-TITEL");
* every catalogue title has a name and a kind the filter can show;
* every page that already existed keeps its ID (`referenz/titel-ids.json`);
* the title index carries the kind of each row and a label for every kind.

It reads the built files, not the sources, so run `build_titel.py` and
`build_php_data.py` first.
"""
import json
import sys
import unittest
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
sys.path.insert(0, str(HIER / 'tools'))
from titelarten import KINDS, kind_key  # noqa: E402

PHPDATA = Path.home() / '.cache' / 'llb-php' / 'phpdata'


class TitelTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        datei = DATEN / 'titel.json'
        if not datei.is_file():
            raise unittest.SkipTest('daten/titel.json fehlt – build_titel.py zuerst')
        cls.titel = json.loads(datei.read_text(encoding='utf-8'))['eintraege']
        cls.ids = json.loads((HIER / 'referenz' / 'titel-ids.json').read_text(encoding='utf-8'))['ids']

    def test_every_title_has_three_names_and_a_known_kind(self):
        for ident, eintrag in self.titel.items():
            namen = eintrag.get('n') or {}
            self.assertTrue(namen.get('de'), '%s ohne deutschen Namen' % ident)
            self.assertTrue(namen.get('en'), '%s ohne englischen Namen' % ident)
            self.assertTrue(namen.get('fr'), '%s ohne französischen Namen' % ident)
            arten = eintrag.get('k') or []
            self.assertTrue(arten, '%s ohne Titelart' % ident)
            for art in arten:
                self.assertIn(art, KINDS, '%s: unbekannte Art %r' % (ident, art))

    def test_internal_and_test_titles_stay_out(self):
        namen = {(eintrag.get('n') or {}).get('de', '').strip().upper()
                 for eintrag in self.titel.values()}
        for gesperrt in ('TBD', 'JUBILÄUMS-TITEL', '--'):
            self.assertNotIn(gesperrt, namen, 'Platzhalter im Katalog: %s' % gesperrt)
        for ident, eintrag in self.titel.items():
            self.assertNotIn('Admin', eintrag.get('k') or [], '%s: Admin-Titel' % ident)
            self.assertNotIn('Pedigree', eintrag.get('k') or [],
                             '%s: Titel braucht den Spielernamen' % ident)

    def test_existing_pages_keep_their_id(self):
        fehlend = [ident for ident in self.ids if ident.upper() not in self.titel]
        self.assertEqual(fehlend, [], 'bestehende Titel-IDs ohne Seite: %s' % fehlend[:5])

    def test_slayer_variants_share_one_kind(self):
        self.assertEqual(kind_key('Slayer Deed - Beast'), 'Slayer Deed')
        self.assertEqual(kind_key('Slayer Deed'), 'Slayer Deed')
        self.assertEqual(kind_key('Admin'), '')

    def test_index_carries_kind_and_label(self):
        for sprache in ('de', 'en', 'fr'):
            datei = PHPDATA / sprache / 'titles-index.json'
            if not datei.is_file():
                continue
            daten = json.loads(datei.read_text(encoding='utf-8'))
            self.assertEqual(len(daten['titles']), len(self.titel),
                             '%s: Index und Katalog weichen ab' % sprache)
            self.assertIn('cat', daten['labels'], '%s: Titelkategorien fehlen' % sprache)
            for row in daten['titles']:
                self.assertIn('cats', row, '%s: %s ohne Titelkategorie' % (sprache, row['id']))
                for wert in row['cats']:
                    self.assertTrue(daten['labels']['cat'].get(wert),
                                    '%s: %s ohne Label für %r' % (sprache, row['id'], wert))
            for row in daten['titles']:
                if row['quests'] + row['deeds'] == 0:
                    # A title without an award keeps its kind in the row meta.
                    self.assertTrue(row['cats'], '%s: %s ohne Herkunft und ohne Art'
                                    % (sprache, row['id']))


if __name__ == '__main__':
    unittest.main()
