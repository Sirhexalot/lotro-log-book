"""Landing-page build checks without game assets or upload credentials."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('website_build', ROOT / 'baue_website.py')
BUILD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILD)


class WebsiteBuildTests(unittest.TestCase):
    def test_catalogue_counts_use_shipped_js_and_language_formatting(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder)
            for language, page, formatted in (
                    ('de', 'start.html', '1.234'),
                    ('en', 'start-en.html', '1,234'),
                    ('fr', 'start-fr.html', '1 234')):
                quests = [{'n': 'Text containing ]; is valid', 'gt': [1, 2, 3], 't': []}]
                quests += [{'t': [[1, 2, 3]]}] * 1233
                for name, entries in (('daten-' + language, quests),
                                      ('daten-taten-' + language, [{'t': []}])):
                    (target / (name + '.js')).write_text(
                        'window.MQL_QUESTS = ' + json.dumps(entries) + ';\n', encoding='utf-8')
                (target / page).write_text(' '.join(
                    '<span data-katalogzahl="%s">old</span>' % key
                    for key in ('aufgaben', 'taten', 'auftraggeber', 'ziele')), encoding='utf-8')
            BUILD.katalogzahlen_einbauen(target)
            for page, formatted in (('start.html', '1.234'), ('start-en.html', '1,234'),
                                     ('start-fr.html', '1 234')):
                text = (target / page).read_text(encoding='utf-8')
                self.assertIn('data-katalogzahl="aufgaben">' + formatted, text)
                self.assertIn('data-katalogzahl="taten">1<', text)
                self.assertIn('data-katalogzahl="auftraggeber">1<', text)
                self.assertNotIn('>old<', text)

    def test_analytics_is_injected_once_on_each_published_page(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder)
            pages = ('index.html', 'start.html', 'start-en.html', 'start-fr.html',
                     'spielstand.html', 'plugin.html', 'companion.html', 'ruf.html', 'handwerk.html',
                     'impressum.html', 'datenschutz.html',
                     # These three were skipped until 08.11.2026 and had no counter.
                     'belohnungen.html', 'gegenstand.html', 'suche.html', 'reise.html')
            for page in pages:
                (target / page).write_text('<body>Test</body>', encoding='utf-8')
            BUILD.zaehler_einbauen(target)
            BUILD.zaehler_einbauen(target)
            for page in pages:
                text = (target / page).read_text(encoding='utf-8')
                self.assertEqual(text.count('data-goatcounter='), 1)
                self.assertIn('https://sirhexalot.goatcounter.com/count', text)
                self.assertIn('//gc.zgo.at/count.js', text)

    def test_error_page_carries_both_counters(self):
        text = (Path(__file__).resolve().parents[1] / 'web' / '404.html').read_text(encoding='utf-8')
        self.assertEqual(text.count('GTM-TRC8BF95'), 1)
        self.assertEqual(text.count('data-goatcounter='), 1)
        self.assertIn('content="noindex"', text)


if __name__ == '__main__':
    unittest.main()
