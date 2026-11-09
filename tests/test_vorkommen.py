"""Consistency of the crafting-resource layer (build_vorkommen.py output).

The generator needs the game's lore data, so these checks run against the files
it wrote into web/. They fail loudly on a half-written or mismatched export:
a map without its point file, a type without a trade, counts that do not match
the points, or languages that drifted apart.
"""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
SPRACHEN = ('de', 'en', 'fr')
BERUFE = {'PROSPECTOR', 'FORESTER', 'SCHOLAR', 'COOK'}


def lies(sprache):
    datei = WEB / ('vorkommen-%s.js' % sprache)
    if not datei.is_file():
        raise unittest.SkipTest('keine Vorkommendaten – build_vorkommen.py zuerst')
    text = datei.read_text(encoding='utf-8')
    return json.loads(text[text.index('{'):text.rindex(';')])


def karte(kennung):
    text = (WEB / 'vorkommen' / ('%s.js' % kennung)).read_text(encoding='utf-8')
    return json.loads(text[text.index('['):text.rindex(';')])


class VorkommenTests(unittest.TestCase):
    def test_every_kind_has_a_trade_and_a_tier(self):
        daten = lies('de')
        self.assertTrue(daten['k'])
        for kennung, name, beruf, stufe in daten['k']:
            self.assertRegex(kennung, r'^\d+$')
            self.assertTrue(name.strip(), kennung)
            self.assertIn(beruf, BERUFE, kennung)
            self.assertTrue(1 <= int(stufe) <= 16, kennung)
        self.assertEqual(len({e[0] for e in daten['k']}), len(daten['k']),
                         'doppelte Kennung')

    def test_languages_share_ids_and_have_their_own_names(self):
        deutsch = lies('de')
        for sprache in SPRACHEN[1:]:
            andere = lies(sprache)
            self.assertEqual([e[0] for e in andere['k']], [e[0] for e in deutsch['k']], sprache)
            # Areas are sorted by their own language, so only the set must match.
            self.assertEqual(sorted(e[0] for e in andere['g']),
                             sorted(e[0] for e in deutsch['g']), sprache)
            self.assertEqual(sorted(e[0] for e in andere['m']),
                             sorted(e[0] for e in deutsch['m']), sprache)
        self.assertNotEqual([e[1] for e in lies('de')['k']],
                            [e[1] for e in lies('en')['k']],
                            'deutsche und englische Namen sind gleich')
        self.assertNotEqual([e[1] for e in lies('de')['g']],
                            [e[1] for e in lies('en')['g']],
                            'Gebietsnamen sind in beiden Sprachen gleich')

    def test_every_area_has_a_name_and_a_map_with_points(self):
        daten = lies('de')
        karten = {e[0] for e in daten['m']}
        for kennung, name, karte in daten['g']:
            self.assertTrue(name.strip(), kennung)
            self.assertFalse(name.startswith(('TBD', 'NAME_ME')), name)
            self.assertTrue((WEB / 'vorkommen' / ('%s.js' % karte)).is_file(), name)
        self.assertTrue(karten, 'keine Gebiete mit Fundstellen')

    def test_counts_reference_known_kinds(self):
        daten = lies('de')
        typen = len(daten['k'])
        gebiete = {e[0] for e in daten['g']}
        gesehen = set()
        for zone, zaehlungen in daten['m']:
            self.assertIn(zone, gebiete, zone)
            self.assertTrue(zaehlungen, zone)
            for nummer, anzahl in zaehlungen:
                self.assertLess(nummer, typen, zone)
                self.assertGreater(anzahl, 0, zone)
                gesehen.add(nummer)
        # The cook's crops never appear, the rest do.
        berufe = {daten['k'][nummer][2] for nummer in gesehen}
        self.assertNotIn('COOK', berufe)
        self.assertEqual(berufe, {'PROSPECTOR', 'FORESTER', 'SCHOLAR'})

    def test_points_of_a_sample_stay_inside_their_map_frame(self):
        karten = json.loads((ROOT / 'daten' / 'karten.json').read_text(encoding='utf-8'))
        rahmen = {int(e['idx']): e for e in karten}
        daten = lies('de')
        gebiete = {e[0]: e for e in daten['g']}
        typen = len(daten['k'])
        for zone, _zaehlungen in daten['m'][::40]:
            kennung = gebiete[zone][2]
            eintrag = rahmen.get(kennung)
            self.assertIsNotNone(eintrag, zone)
            punkte = karte(kennung)
            self.assertTrue(punkte, zone)
            for lat, lon, arten in punkte[:60]:
                self.assertTrue(arten, zone)
                for nummer in arten:
                    self.assertLess(nummer, typen, zone)
                self.assertGreaterEqual(lat, eintrag['south'] - 1, zone)
                self.assertLessEqual(lat, eintrag['north'] + 1, zone)
                self.assertGreaterEqual(lon, eintrag['west'] - 1, zone)
                self.assertLessEqual(lon, eintrag['east'] + 1, zone)


class MapPageTests(unittest.TestCase):
    """The layer only works when page, texts and loader agree."""

    def test_map_page_has_the_layer_and_all_texts(self):
        seite = (WEB / 'index.html').read_text(encoding='utf-8')
        for kennung in ('vorkommen', 'vorkommen-knopf', 'vorkommen-feld',
                        'vorkommen-liste', 'legende-vorkommen'):
            self.assertIn('id="%s"' % kennung, seite)
        texte = (WEB / 'texte-logbuch.js').read_text(encoding='utf-8')
        for sprache in SPRACHEN:
            self.assertIn('vorkommen_hinweis', texte)
        for schluessel in ('vorkommen_titel', 'vorkommen_leer', 'vorkommen_hinweis',
                           'vorkommen_handwerk', 'vorkommen_erz', 'vorkommen_holz',
                           'vorkommen_gelehrte', 'vorkommen_nichts',
                           'vorkommen_alle_sorten'):
            self.assertEqual(texte.count(schluessel + ':'), 3, schluessel)

    def test_crafting_page_loads_names_and_the_shared_data(self):
        seite = (WEB / 'handwerk.html').read_text(encoding='utf-8')
        self.assertIn('data-hw="rohstoffe"', seite)
        self.assertIn('id="hw-rohstoffe"', seite)
        self.assertIn('src="rohstoffe.js"', seite)
        lader = (WEB / 'sprache.js').read_text(encoding='utf-8')
        self.assertIn("lade('vorkommen-' + sprache", lader)


if __name__ == '__main__':
    unittest.main()
