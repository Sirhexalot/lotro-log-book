"""The advisor page: route in three languages, menu entry, and a local import.

Gear, bags and the vault exist only in the browser. This test fixes the names
the import reads and the places the page is wired into, so a later rename in one
file cannot silently empty the page.
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding='utf-8')


class RatgeberRouteTests(unittest.TestCase):
    def test_route_in_all_three_languages(self):
        catalogue = read('php/src/Catalogue.php')
        for segment in ("'ratgeber' => 'ratgeber'", "'ratgeber' => 'advisor'", "'ratgeber' => 'conseiller'"):
            with self.subTest(segment=segment):
                self.assertIn(segment, catalogue)

    def test_page_maps_template_file_and_seo(self):
        page = read('php/src/Page.php')
        self.assertIn("'ratgeber' => 'ratgeber',", page)
        self.assertIn("'ratgeber' => 'ratgeber.html',", page)
        self.assertIn("if ($page === 'ratgeber')", page)

    def test_template_exists_and_extends_the_app_layout(self):
        template = read('php/templates/app/ratgeber.twig')
        self.assertIn("{% extends 'app/layout.twig' %}", template)
        self.assertIn('data-seite="ratgeber"', template)
        # The page-specific text file must load before sprache.js merges it.
        self.assertLess(template.index('texte-ratgeber.js'), template.index('sprache.js'))
        self.assertIn('/sprache.js', template)
        self.assertIn('/speicher.js', template)
        self.assertIn('/menue.js', template)


class RatgeberMenuTests(unittest.TestCase):
    """The advisor page exists but is not in the navigation (23.11.2026).

    It is not finished, so the character family names only classes and the
    character progress. The page keeps its family mark and stays reachable at
    its own address until it is released; the menu words stay for that day.
    """

    def test_menu_does_not_offer_the_advisor(self):
        shell = read('php/src/Shell.php')
        self.assertNotIn("['ratgeber', $app('ratgeber')", shell)
        menue = read('web/menue.js')
        self.assertNotIn("{ seite: 'ratgeber', href: app('ratgeber')", menue)

    def test_page_keeps_its_family_and_address(self):
        shell = read('php/src/Shell.php')
        self.assertIn("'ratgeber', 'spielstand' => 'charakter'", shell)
        self.assertIn("'ratgeber' => ['charakter', $w['menue_ratgeber']", shell)
        menue = read('web/menue.js')
        self.assertIn("ratgeber: 'charakter'", menue)
        self.assertIn("ratgeber: 'advisor'", menue)

    def test_menu_words_exist_in_three_languages(self):
        words = read('build_katalogseiten.py')
        for name in ("menue_ratgeber='Ratgeber'", "menue_ratgeber='Advisor'", "menue_ratgeber='Conseiller'"):
            with self.subTest(name=name):
                self.assertIn(name, words)


class RatgeberImportTests(unittest.TestCase):
    def test_companion_reads_gear_bags_and_vault(self):
        companion = read('web/companion.js')
        for pair in ("'current.xml': 'gear'", "'inventory.xml': 'bags'", "'characterVault.xml': 'bank'"):
            with self.subTest(pair=pair):
                self.assertIn(pair, companion)
        self.assertIn("'gear', 'bags', 'bank'", companion)

    def test_storage_keeps_them_bounded(self):
        speicher = read('web/speicher.js')
        self.assertIn('gear: ausruestung(eintrag.gear)', speicher)
        self.assertIn('bags: taschen(eintrag.bags)', speicher)
        self.assertIn('bank: bank(eintrag.bank)', speicher)
        # A cap keeps one import from filling localStorage with bag contents.
        self.assertIn('slice(0, 240)', speicher)

    def test_page_shows_the_three_sets_and_the_search(self):
        seite = read('web/ratgeber.js')
        for schluessel in ("'Taschen'", "'Bank'", "'Gemeinsam'", 'rat-suche-feld'):
            with self.subTest(schluessel=schluessel):
                self.assertIn(schluessel, seite)
        for schluessel in ("KATALOG_PLATZ", "MQL_EIGNUNG", "gegenstaende-' + sprache"):
            with self.subTest(schluessel=schluessel):
                self.assertIn(schluessel, seite)

    def test_page_texts_exist_in_three_languages(self):
        texte = read('web/texte-ratgeber.js')
        for sprache in ("de: {", "en: {", "fr: {"):
            with self.subTest(sprache=sprache):
                self.assertIn(sprache, texte)
        self.assertEqual(texte.count('rat_einleitung:'), 3)
        for schluessel in ('rat_kandidaten_knopf', 'rat_kandidaten_titel',
                           'rat_kandidaten_titel_platz', 'rat_kandidaten_hinweis',
                           'rat_kandidaten_ohne', 'rat_kandidaten_ohne_stand'):
            with self.subTest(schluessel=schluessel):
                self.assertEqual(texte.count(schluessel + ':'), 3)


if __name__ == '__main__':
    unittest.main()
