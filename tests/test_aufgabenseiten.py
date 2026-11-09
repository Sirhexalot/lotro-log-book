"""Quest pages from build_aufgaben.py: order, links, icons, no details block.

These run against the shipped web catalogue (15,118 quests per language), so
they need `web/daten-<lang>.js`. Three pages are written into a temp folder.
"""
import importlib.util
import re
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'


def lade(name):
    spez = importlib.util.spec_from_file_location(name, ROOT / (name + '.py'))
    modul = importlib.util.module_from_spec(spez)
    spez.loader.exec_module(modul)
    return modul


class QuestPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not (WEB / 'daten-de.js').is_file():
            raise unittest.SkipTest('kein Webkatalog – build_daten.py zuerst')
        cls.katalog = lade('build_katalogseiten')
        cls.aufgaben = lade('build_aufgaben')
        cls.ordner = Path(tempfile.mkdtemp())
        for name in ('index.html', 'style.css', 'gemeinsam.css', 'katalog.css',
                     'speicher.js', 'katalog.js'):
            shutil.copy2(WEB / name, cls.ordner / name)
        # All three up front: every page carries hreflang links to the others.
        cls.models = {lang: cls.katalog.load_model(WEB, lang) for lang in cls.katalog.LANGS}

    def model(self, lang):
        return self.models[lang]

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.ordner, ignore_errors=True)

    def seite(self, ident='7004544F', lang='de', art='q'):
        # Deeds still come from the catalogue renderer, quests from build_aufgaben.
        klasse = self.aufgaben.Renderer if art == 'q' else self.katalog.Renderer
        quest = self.model(lang)['selected'][art].get(ident)
        leser = klasse(self.ordner, lang, self.models)
        self.assertIsNotNone(quest, ident)
        leser.quest(art, quest)
        pfad = self.ordner / (leser.paths[-1].strip('/') + '.html')
        self.assertTrue(pfad.is_file(), pfad)
        return pfad.read_text(encoding='utf-8')

    def test_sections_follow_the_agreed_order(self):
        text = self.seite()
        stellen = [text.index('<h2>%s</h2>' % titel) for titel in
                   ('Beschreibung', 'Ort', 'Woher', 'Belohnungen', 'Zusammenhang')]
        self.assertEqual(stellen, sorted(stellen))
        self.assertNotIn('<h2>Details</h2>', text)

    def test_title_carries_the_entity_icon(self):
        text = self.seite()
        self.assertRegex(text, r'<h1><svg class="symbol"[^>]*>.*?</svg>')

    def test_rewards_link_to_items_and_show_their_symbols(self):
        text = self.seite()
        self.assertIn('href="/de/gegenstand/70044EEE/"', text)
        # The picture file is named after the symbol id, not the item id.
        self.assertIn('src="/bild/items/1091999139.webp"', text)

    def test_objectives_stay_behind_the_closed_details(self):
        text = self.seite()
        self.assertIn('<details class="katalog-ziele" data-nosnippet>', text)

    def test_reverse_link_lists_quests_that_require_this_one(self):
        text = self.seite('7004AC04')
        self.assertIn('Wird vorausgesetzt von', text)
        self.assertRegex(text, r'href="/de/aufgabe/[0-9A-F]{8}/"')

    def test_canonical_and_all_languages_are_declared(self):
        text = self.seite()
        self.assertIn('<link rel="canonical" href="https://llb.sirhexalot.de/de/aufgabe/7004544F/">', text)
        for lang in ('de', 'en', 'fr'):
            self.assertIn('hreflang="%s"' % lang, text)

    def test_every_language_uses_its_own_segment(self):
        for lang, muster in (('de', '/de/aufgabe/7004544F/'), ('en', '/en/quest/7004544F/'),
                             ('fr', '/fr/quete/7004544F/')):
            self.assertIn('hreflang="%s" href="https://llb.sirhexalot.de%s"' % (lang, muster),
                          self.seite(lang=lang))

    def test_deed_pages_keep_their_own_layout(self):
        text = self.seite('700001DA', art='d')
        self.assertIn('<h1><svg class="symbol"', text)
        self.assertNotIn('<h2>Zusammenhang</h2>', text)


if __name__ == '__main__':
    unittest.main()
