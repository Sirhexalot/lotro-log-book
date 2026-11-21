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
            self.assertIn('window.MQL_SHARD_MAPS = ', text, name)
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

    def test_every_shard_has_a_detail_shard_without_map_fields(self):
        for sprache in ('de', 'en', 'fr'):
            for art in ('aufgaben', 'taten'):
                ordner = ROOT / 'web' / 'karten-daten' / art / sprache
                for shard in list(ordner.glob('map-*.js')) + list(ordner.glob('region-*.js')):
                    detail = ordner / ('detail-' + shard.name)
                    self.assertTrue(detail.is_file(), detail)
                    text = detail.read_text(encoding='utf-8')
                    rows = json.loads(
                        text.split('window.MQL_GEBIETS_DETAILS = ', 1)[1]
                        .rstrip().rstrip(';'))
                    self.assertIsInstance(rows, dict, detail)
                    for kennung, eintrag in list(rows.items())[:5]:
                        self.assertRegex(kennung, r'^[0-9A-F]{8}$', detail)
                        self.assertLessEqual(
                            set(eintrag),
                            {'d', 's', 't', 'u', 'gi', 'nq', 'pq', 'tl', 'lp'},
                            detail)
                        self.assertFalse(
                            {'n', 'gt', 'fw', 'fk', 'rw'} & set(eintrag), detail)

    def test_map_loads_detail_shards_instead_of_the_catalogue(self):
        code = (ROOT / 'web' / 'app.js').read_text(encoding='utf-8')
        self.assertIn("'detail-map-' + karten[karten.length - 1]", code)
        self.assertIn("'detail-' + datei", code)
        self.assertIn('window.MQL_GEBIETS_DETAILS', code)
        # The full catalogue stays a fallback for an old deployment only.
        self.assertEqual(code.count('ladeVollstaendig('), 2, code.count('ladeVollstaendig('))
        self.assertIn('script.onerror = function () {\n\t\t\tvar wartende = detailLader[datei]', code)

    def test_map_start_summary_carries_the_map_ids_for_tabs(self):
        for lang in ('de', 'en', 'fr'):
            text = (ROOT / 'web' / ('karten-start-%s.js' % lang)).read_text(encoding='utf-8')
            summary = json.JSONDecoder().raw_decode(
                text.split('window.MQL_KARTEN_SUMMARY = ', 1)[1])[0]
            self.assertTrue(all(row.get('fk') for row in summary if len(row.get('f') or []) > 2),
                            lang)
            # The overview tiles (Epic story, class, origin, …) are built from
            # the compact metadata before any shard is loaded.
            self.assertTrue(any(row.get('th') == 'epic' for row in summary), lang)

    def test_epic_topic_shard_exists_for_every_language(self):
        for lang in ('de', 'en', 'fr'):
            datei = ROOT / 'web' / ('thema-epic-%s.js' % lang)
            self.assertTrue(datei.is_file(), datei)
            text = datei.read_text(encoding='utf-8')
            rows = json.JSONDecoder().raw_decode(text.split('window.MQL_THEMA_DATEN = ', 1)[1])[0]
            self.assertTrue(rows, datei)
            self.assertTrue(all(row.get('th') == 'epic' for row in rows), datei)

    def test_epic_chapters_only_carry_proven_places(self):
        """Chapter rows get a giver spot or the objectives of their linked step,
        never an estimated position; every place names an existing game map."""
        for lang in ('de', 'en', 'fr'):
            start = (ROOT / 'web' / ('karten-start-%s.js' % lang)).read_text(encoding='utf-8')
            maps = json.JSONDecoder().raw_decode(
                start.split('window.MQL_KARTEN = ', 1)[1])[0]
            bekannt = {int(karte['idx']) for karte in maps}
            text = (ROOT / 'web' / ('thema-epic-%s.js' % lang)).read_text(encoding='utf-8')
            rows = json.JSONDecoder().raw_decode(text.split('window.MQL_THEMA_DATEN = ', 1)[1])[0]
            mit_ort = [row for row in rows if row.get('gt') or row.get('t')]
            self.assertGreater(len(mit_ort), 130, lang)
            for row in rows:
                orte = ([row['gt']] if row.get('gt') else []) + (row.get('t') or [])
                for ort in orte:
                    self.assertIn(int(ort[0]), bekannt, (lang, row['n']))
                    self.assertIsInstance(float(ort[1]), float, (lang, row['n']))
                    self.assertIsInstance(float(ort[2]), float, (lang, row['n']))
            # A chapter without proof keeps no invented dot.
            self.assertTrue(any(not (row.get('gt') or row.get('t')) for row in rows), lang)

    def test_epic_opens_on_the_large_map(self):
        code = (ROOT / 'web/app.js').read_text(encoding='utf-8')
        self.assertIn('var WELTKARTE = 268437557;', code)
        self.assertIn('function karteFuerKnoten(knoten)', code)
        self.assertIn('if (Epik.istWurzel(knoten) && karteNachIndex[Epik.karte()])', code)

    def test_epic_special_case_is_encapsulated(self):
        code = (ROOT / 'web/app.js').read_text(encoding='utf-8')
        self.assertIn('var Epik = (function () {', code)
        self.assertIn('return { istWurzel: istWurzel, karte: karte, basis: basis, zeichneListe: zeichne };', code)
        # Nothing outside the block tests the theme itself.
        self.assertNotIn('istEpikWurzel', code)
        self.assertNotIn('zeichneEpikListe', code)

    def test_map_filter_shows_a_number_per_progress_option(self):
        template = (ROOT / 'php/templates/app/karte.twig').read_text(encoding='utf-8')
        code = (ROOT / 'web/app.js').read_text(encoding='utf-8')
        for wert in ('alle', 'offen', 'laufend', 'erledigt', 'machbar'):
            self.assertIn('data-filterzahl="%s"' % wert, template)
        self.assertIn('function aktualisiereFilterZahlen()', code)
        self.assertIn('aktualisiereFilterZahlen();', code)
        # Counts are facets: the progress filter itself must not narrow them.
        self.assertIn("zustand.filter = 'alle';", code)

    def test_progress_filter_labels_match_the_status_dropdown_in_all_languages(self):
        code = (ROOT / 'web' / 'app.js').read_text(encoding='utf-8')
        template = (ROOT / 'php/templates/app/karte.twig').read_text(encoding='utf-8')
        labels = (ROOT / 'web/texte-logbuch.js').read_text(encoding='utf-8')
        base_labels = (ROOT / 'web/texte.js').read_text(encoding='utf-8')
        dropdown = (ROOT / 'web/status.js').read_text(encoding='utf-8')
        self.assertIn("zustand.filter === 'laufend'", code)
        self.assertIn('name="kartenfortschritt" value="laufend"', template)
        self.assertNotIn('nicht_gesetzt', template)
        for unstarted, running, available in (('Nicht begonnen', 'Begonnen', 'Voraussetzungen erfüllt'),
                                              ('Not started', 'In progress', 'Requirements met'),
                                              ('Non commencée', 'En cours', 'Conditions remplies')):
            self.assertIn(f"filter_offen: '{unstarted}'", base_labels)
            self.assertIn(f"open: '{unstarted}'", dropdown)
            self.assertIn(f"filter_laufend: '{running}'", labels)
            self.assertIn(f"running: '{running}'", dropdown)
            self.assertIn(f"filter_machbar: '{available}'", labels)
            self.assertIn(f"available: '{available}'", dropdown)
