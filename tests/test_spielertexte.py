"""Player-facing text must not turn missing data into repeated warnings."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import seo


class SpielertexteTest(unittest.TestCase):
    def test_identical_descriptions_do_not_get_ids(self):
        for lang in ('de', 'en', 'fr'):
            pages = {key: {'seo': seo.item(lang, name='Soup')} for key in ('70000001', '70000002')}
            seo.dedupe(lang, 'i', pages)
            self.assertEqual(pages['70000001']['seo'], pages['70000002']['seo'])
            self.assertNotIn('70000002', pages['70000002']['seo']['description'])

    def test_item_without_facts_does_not_promise_sets_and_sources(self):
        for lang in ('de', 'en', 'fr'):
            block = seo.item(lang, name='Soup')
            self.assertEqual(block['description'], seo._head(lang, 'i', 'Soup'))

    def test_title_can_be_earned_from_quest(self):
        for lang in ('de', 'en', 'fr'):
            block = seo.honor(lang, name='Hero', art='title', sources=[{'text': 'A quest'}])
            self.assertIn('A quest', block['description'])
            self.assertNotIn(seo.NOUNS[lang]['deed'][1], block['description'])

    def test_filters_do_not_explain_data_provenance(self):
        for area, prefix in (('sets', 'sw'), ('givers', 'gw'), ('landmarks', 'lw')):
            text = (ROOT / 'php/templates' / area / 'list.twig').read_text()
            self.assertNotIn(prefix + '.filter_note', text)

    def test_set_details_do_not_repeat_data_warnings(self):
        text = (ROOT / 'php/templates/sets/detail.twig').read_text()
        for key in ('sw.scale', 'sw.missing', 'sw.unresolved', 'sw.no_bonuses', 'sw.incomplete'):
            self.assertNotIn('{{ ' + key + ' }}', text)

    def test_adventure_renderers_do_not_explain_missing_data(self):
        script = (ROOT / 'web/abenteuer.js').read_text()
        for key in ('ab_stand_erfasst', 'ab_zaehler_offen', 'ab_gebiet_unbekannt',
                    'ab_hinweis_finish', 'ab_hinweis_level'):
            self.assertNotIn("text('" + key + "')", script)
        script = (ROOT / 'web/abenteuer-karte.js').read_text()
        for key in ('ab_map_ready_text', 'ab_map_no_ready', 'ab_map_no_point', 'ab_fit_unknown'):
            self.assertNotIn("text('" + key + "')", script)
        self.assertIn('body.textContent = ready ? weiter(ready)', script)
        template = (ROOT / 'php/templates/app/abenteuer.twig').read_text()
        self.assertNotIn('lw.content_hint', template)

    def test_map_tooltips_do_not_explain_missing_givers(self):
        script = (ROOT / 'web/app.js').read_text()
        for key in ('zielort_hinweis', 'rahmen_unklar'):
            self.assertNotIn("t('" + key + "')", script)
