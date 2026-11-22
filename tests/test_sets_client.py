"""Browser data of the set list: compact rows and the grouped wear requirements.

`tools/build_sets_client.py` joins the list index with `daten/items.json`. The
row shape is a contract for `web/sets-filter.js`; this test pins it for one
language and checks the grouping of `tools/eignung_teile.py`.
"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEN = ROOT / 'daten'
sys.path.insert(0, str(ROOT / 'tools'))
from eignung_teile import anforderungen, gruppiere  # noqa: E402


class RequirementsTest(unittest.TestCase):
    def test_piece_without_level_is_not_counted(self):
        self.assertIsNone(anforderungen({'n': {'de': 'x'}}))
        self.assertIsNone(anforderungen(None))

    def test_requirements_use_the_short_keys(self):
        self.assertEqual(anforderungen({'ml': 120, 'rk': 'Hunter', 'at': 'LIGHT'}),
                         {'min': 120, 'klasse': 'Hunter', 'volk': '', 'armour': 'LIGHT',
                          'waffe': '', 'extra': 0, 'scalable': 0})

    def test_identical_requirements_collapse(self):
        gruppe = gruppiere([{'min': 120, 'klasse': '', 'volk': '', 'armour': '',
                             'waffe': '', 'extra': 0, 'scalable': 0},
                            {'min': 120, 'klasse': '', 'volk': '', 'armour': '',
                             'waffe': '', 'extra': 0, 'scalable': 0},
                            None,
                            {'min': 135, 'klasse': '', 'volk': '', 'armour': '',
                             'waffe': '', 'extra': 0, 'scalable': 0}])
        self.assertEqual(gruppe, [[120, '', '', '', '', 0, 0, 2],
                                  [135, '', '', '', '', 0, 0, 1]])


@unittest.skipUnless((DATEN / 'sets-suche-de.json').is_file()
                     and (DATEN / 'items.json').is_file(),
                     'Run build_sets.py and build_items.py first')
class BrowserDataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ziel = Path(tempfile.mkdtemp(prefix='llb-sets-client-'))
        subprocess.run([sys.executable, 'tools/build_sets_client.py',
                        '--daten', str(DATEN), '--ziel', str(cls.ziel)],
                       cwd=ROOT, check=True, capture_output=True)

    @classmethod
    def tearDownClass(cls):
        import shutil
        shutil.rmtree(cls.ziel, ignore_errors=True)

    def datei(self, lang):
        text = (self.ziel / ('sets-%s.js' % lang)).read_text(encoding='utf-8')
        self.assertTrue(text.startswith('window.MQL_SETS = '))
        return json.loads(text[len('window.MQL_SETS = '):].strip().rstrip(';'))

    def test_rows_follow_the_browser_contract(self):
        for lang in ('de', 'en', 'fr'):
            with self.subTest(lang=lang):
                index = json.loads((DATEN / ('sets-suche-%s.json' % lang)).read_text(encoding='utf-8'))
                daten = self.datei(lang)
                self.assertEqual(daten['schema'], 1)
                self.assertEqual(daten['lang'], lang)
                self.assertEqual(set(daten['labels']), {'class', 'armour', 'category'})
                self.assertEqual([row[0] for row in daten['sets']],
                                 [row['id'] for row in index['sets']])
                for zeile in daten['sets']:
                    self.assertEqual(len(zeile), 7, '%s: Zeile ohne Wahlpflichtfelder' % zeile[0])
                    self.assertIsInstance(zeile[5], list)
                    self.assertIsInstance(zeile[6], list)
                    for member in zeile[5]:
                        self.assertEqual(len(member), 7, '%s: Teilform' % zeile[0])
                        self.assertIsInstance(member[3], str, 'Klassen als ";"-String')
                    for eintrag in zeile[6]:
                        self.assertEqual(len(eintrag), 8, '%s: Anforderungsform' % zeile[0])
                        self.assertGreater(eintrag[0], 0, 'nur Teile mit Mindeststufe zählen')
                        self.assertGreaterEqual(eintrag[7], 1)

    def test_every_list_entry_keeps_its_parts(self):
        daten = self.datei('de')
        index = json.loads((DATEN / 'sets-suche-de.json').read_text(encoding='utf-8'))
        by_id = {row[0]: row for row in daten['sets']}
        for eintrag in index['sets']:
            zeile = by_id[eintrag['id']]
            self.assertEqual(zeile[2], eintrag['parts'])
            self.assertEqual(len(zeile[5]), len(eintrag['members']))
            # Grouped requirements never exceed the piece count.
            self.assertLessEqual(sum(teil[7] for teil in zeile[6]), zeile[2])


if __name__ == '__main__':
    unittest.main()
