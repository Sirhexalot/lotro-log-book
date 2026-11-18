"""Start markup must not reveal empty map panes while loading."""
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class KartenstartTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, 'tools/build_karten_kurz.py'],
                       cwd=ROOT, check=True, stdout=subprocess.DEVNULL)

    def test_both_entry_points_start_hidden(self):
        for path in ('php/templates/app/karte.twig', 'web/index.html'):
            self.assertIn('<main class="karte-laedt">', (ROOT / path).read_text())
        self.assertIn('main.karte-laedt { visibility: hidden; }',
                      (ROOT / 'web/landschaft.css').read_text())

    def test_startup_and_missing_data_reveal_the_page(self):
        code = (ROOT / 'web/app.js').read_text()
        self.assertEqual(code.count("haupt.classList.remove('karte-laedt')"), 2)

    def test_other_content_is_last_and_jumps_are_preserved(self):
        code = (ROOT / 'web/app.js').read_text()
        self.assertIn("return a.region === ltexte[7] ? 1 : -1", code)
        self.assertIn('spruenge.appendChild(sprung)', code)

    def test_map_start_files_contain_structure_but_no_entries(self):
        for name in (
                'karten-start-de.js', 'karten-start-en.js', 'karten-start-fr.js',
                'karten-start-taten-de.js', 'karten-start-taten-en.js',
                'karten-start-taten-fr.js'):
            text = (ROOT / 'web' / name).read_text(encoding='utf-8')
            self.assertIn('window.MQL_QUESTS = [];', text, name)
            self.assertIn('window.MQL_KARTEN = ', text, name)
            self.assertIn('window.MQL_SHARD_REGION = ', text, name)
            self.assertIn('window.MQL_KARTEN_SUMMARY = ', text, name)

    def test_quest_and_deed_shards_are_separate_and_loadable(self):
        for sprache in ('de', 'en', 'fr'):
            for art in ('aufgaben', 'taten'):
                ordner = ROOT / 'web' / 'karten-daten' / art / sprache
                self.assertTrue(ordner.is_dir(), ordner)
                shards = list(ordner.glob('map-*.js')) + list(ordner.glob('region-*.js'))
                self.assertTrue(shards, ordner)
                for shard in shards[:3]:
                    text = shard.read_text(encoding='utf-8')
                    payload = text.split('window.MQL_GEBIETS_DATEN = ', 1)[1]
                    self.assertIsInstance(json.loads(payload.rstrip().rstrip(';')), list)

        quests = (ROOT / 'web' / 'karten-daten' / 'aufgaben' / 'de' /
                  'map-268437678.js').read_text(encoding='utf-8')
        deeds = (ROOT / 'web' / 'karten-daten' / 'taten' / 'de' /
                 'map-268437678.js').read_text(encoding='utf-8')
        self.assertNotEqual(quests, deeds)

    def test_app_loads_only_shards_before_full_catalogue(self):
        code = (ROOT / 'web' / 'app.js').read_text(encoding='utf-8')
        self.assertIn("window.MQL_QUESTS || []", code)
        self.assertIn("'karten-daten/' + artOrdner + '/' + sprache + '/'", code)
        self.assertIn("daten-taten-' : 'daten-'", code)
        self.assertIn('window.MQL_KARTEN_SUMMARY || []', code)

    def test_start_summary_covers_all_quests_without_detail_fields(self):
        for art in ('', '-taten'):
            for lang in ('de', 'en', 'fr'):
                name = 'karten-start%s-%s.js' % (art, lang)
                text = (ROOT / 'web' / name).read_text(encoding='utf-8')
                payload = text.split('window.MQL_KARTEN_SUMMARY = ', 1)[1]
                summary = json.JSONDecoder().raw_decode(payload)[0]
                self.assertTrue(summary, name)
                self.assertTrue(all(row.get('i') and row.get('f') for row in summary), name)
                self.assertTrue(all(not {'n', 'd', 'gt', 't'} & row.keys()
                                    for row in summary), name)

    def test_running_filter_has_dropdown_labels_in_all_languages(self):
        code = (ROOT / 'web' / 'app.js').read_text(encoding='utf-8')
        template = (ROOT / 'php/templates/app/karte.twig').read_text(encoding='utf-8')
        labels = (ROOT / 'web/texte-logbuch.js').read_text(encoding='utf-8')
        self.assertIn("zustand.filter === 'laufend'", code)
        self.assertIn('data-filter="laufend" aria-pressed="false" data-t="filter_laufend"', template)
        for label in ("filter_laufend: 'In Arbeit'", "filter_laufend: 'In progress'",
                      "filter_laufend: 'En cours'"):
            self.assertIn(label, labels)
