"""The epic story is its own view: data tree, cleaned names, proven places.

It must not depend on the map's catalogue path, and the app must not know its
internals (checked in test_kartenstart).
"""
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('de', 'en', 'fr')
MARKER = re.compile(r'^(?:Epos|Episch|Epic|Épique|Epique)\s*[-–—:]', re.I)
VOLUME = re.compile(r'^(?:Band|Vol\.?|Volume)\s+[IVXLCDM0-9]+\s*[,:]', re.I)


def daten(lang: str) -> dict:
    text = (ROOT / 'web' / ('epik-%s.js' % lang)).read_text(encoding='utf-8')
    return json.JSONDecoder().raw_decode(
        text.split('window.MQL_EPIK_DATEN = ', 1)[1])[0]


def karten(lang: str) -> set:
    text = (ROOT / 'web' / ('karten-start-%s.js' % lang)).read_text(encoding='utf-8')
    return {int(karte['idx']) for karte in json.JSONDecoder().raw_decode(
        text.split('window.MQL_KARTEN = ', 1)[1])[0]}


class EpikTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, 'tools/build_epik.py'],
                       cwd=ROOT, check=True, stdout=subprocess.DEVNULL)

    def test_tree_has_ten_groups_and_all_quests(self):
        for lang in LANGS:
            inhalt = daten(lang)
            self.assertEqual(inhalt['karte'], 268437557, lang)
            self.assertEqual(len(inhalt['gruppen']), 10, lang)
            ids = []
            for gruppe in inhalt['gruppen']:
                for buch in gruppe['buecher']:
                    ids.extend(buch['ids'])
                ids.extend(gruppe['ids'])
            self.assertEqual(len(ids), len(set(ids)), lang)
            self.assertEqual(len(ids), 1551, lang)
            self.assertEqual(len(inhalt['quests']), 1551, lang)
            self.assertEqual(set(ids), set(inhalt['quests']), lang)

    def test_group_order_and_book_order(self):
        for lang in LANGS:
            gruppen = [gruppe['name'] for gruppe in daten(lang)['gruppen']]
            self.assertEqual(gruppen[:5], ['Band I', 'Band II', 'Band III', 'Band IV', 'Band V']
                             if lang == 'de' else
                             ['Book I', 'Book II', 'Book III', 'Book IV', 'Book V']
                             if lang == 'en' else
                             ['Livre I', 'Livre II', 'Livre III', 'Livre IV', 'Livre V'],
                             lang)
            self.assertEqual(gruppen[5], {'de': 'Vor dem Schatten',
                                          'en': 'Before the Shadow',
                                          'fr': "Avant l'Ombre"}[lang], lang)
            self.assertRegex(gruppen[6],
                             {'de': 'Schwarze Buch', 'en': 'Black Book',
                              'fr': 'livre noir'}[lang])

    def test_names_are_clean(self):
        for lang in LANGS:
            for gruppe in daten(lang)['gruppen']:
                for name in [gruppe['name']] + [buch['name'] for buch in gruppe['buecher']]:
                    self.assertIsNone(MARKER.match(name), (lang, name))
                    self.assertIsNone(VOLUME.match(name), (lang, name))
                    self.assertNotIn('  ', name, (lang, name))

    def test_prologue_books_come_first(self):
        for lang in LANGS:
            for gruppe in daten(lang)['gruppen']:
                if not gruppe['buecher']:
                    continue
                if any(re.match(r'^(?:Prolog|Prologue)', buch['name'], re.I)
                       for buch in gruppe['buecher']):
                    self.assertRegex(gruppe['buecher'][0]['name'],
                                     r'^(?:Prolog|Prologue)', lang)

    def test_places_only_name_real_maps(self):
        for lang in LANGS:
            bekannt = karten(lang)
            mit_ort = 0
            for quest in daten(lang)['quests'].values():
                orte = ([quest['gt']] if quest.get('gt') else []) + (quest.get('t') or [])
                if orte:
                    mit_ort += 1
                for ort in orte:
                    self.assertIn(int(ort[0]), bekannt, (lang, quest.get('n')))
                    self.assertIsInstance(float(ort[1]), float, (lang, quest.get('n')))
                    self.assertIsInstance(float(ort[2]), float, (lang, quest.get('n')))
            self.assertGreater(mit_ort, 500, lang)

    def test_every_part_knows_a_chapter_or_stays_a_row(self):
        for lang in LANGS:
            inhalt = daten(lang)
            ids = set(inhalt['quests'])
            for quest in inhalt['quests'].values():
                if quest.get('ie'):
                    self.assertRegex(quest['ie'], r'^[0-9A-F]{8}$', lang)
                    self.assertIn(quest['ie'], ids, (lang, quest.get('n')))

    def test_release_refuses_a_build_without_the_epic_data(self):
        """The data is generated and never versioned, so the builder must demand it.

        Without this guard a failed or reordered generator step would ship a
        release whose epic view loads a missing script.
        """
        release = (ROOT / 'tools' / 'build_release.py').read_text(encoding='utf-8')
        guard = release.split('def pruefen(', 1)[1].split('\ndef ', 1)[0]
        self.assertIn("'epik.js'", guard)
        self.assertIn("'epik.css'", guard)
        self.assertIn("('epik-%s.js' % sprache)", guard)
        for lang in LANGS:
            self.assertTrue((ROOT / 'web' / ('epik-%s.js' % lang)).is_file(), lang)


if __name__ == '__main__':
    unittest.main()
