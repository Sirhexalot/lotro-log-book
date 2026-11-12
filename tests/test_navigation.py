"""Navigation: a family is a group, not a page; breadcrumbs carry the hierarchy.

The mobile menu used to hide the one entry that shared the family's name, so
"Gegenstände" looked like a page with only two sub-pages. These checks keep the
group/link separation and the breadcrumb contract in both renderers.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
MENUE = (ROOT / 'web' / 'menue.js').read_text()
SHELL = (ROOT / 'php' / 'src' / 'Shell.php').read_text()
CSS = (ROOT / 'web' / 'gemeinsam.css').read_text()


class GruppenTest(unittest.TestCase):
    def test_families_are_buttons_in_both_renderers(self):
        self.assertIn("knopf.className = 'familie-knopf'", MENUE)
        self.assertIn("class=\"familie-knopf\"", SHELL)
        # No family link with a target page any more.
        self.assertNotIn("link.href = gruppe.href", MENUE)
        self.assertNotIn("'href' => $target", SHELL)

    def test_no_entry_is_hidden_because_it_shares_a_name(self):
        self.assertNotIn('selbst', MENUE)
        self.assertNotIn('a.selbst', CSS)
        self.assertNotIn("' class=\"selbst\"'", SHELL)

    def test_every_family_keeps_an_explicit_way_to_its_pages(self):
        # Belohnungen and the item search were reachable through the family
        # heading only; both must now be explicit entries.
        for datei, schluessel in ((MENUE, "seite: 'belohnungen'"),
                                  (SHELL, "['belohnungen'")):
            with self.subTest(datei=datei):
                self.assertIn(schluessel, datei)
        self.assertIn("seite: 'gegenstand'", MENUE)
        self.assertIn("['i',", SHELL)

    def test_mobile_markup_shows_the_whole_group(self):
        # The open group is the accordion; no :focus-within shortcut that opens
        # it visually while screen readers still report it closed.
        self.assertNotIn(':focus-within .familie-flieger', CSS)
        self.assertIn('.familie-feld.offen .familie-flieger', CSS)


class PfadTest(unittest.TestCase):
    def test_open_page_and_family_are_not_links(self):
        # appCrumbs gives the family and the open page url => null.
        abschnitt = SHELL.split('public function appCrumbs', 1)[1]
        self.assertIn("['text' => $w['familie_' . $family], 'url' => null]", abschnitt)
        self.assertIn("['text' => $titel ?? ($seo['title'] ?? ''), 'url' => null]", abschnitt)

    def test_catalogue_breadcrumb_drops_the_family_target(self):
        abschnitt = SHELL.split('public function crumbs', 1)[1].split('public function crumbHtml', 1)[0]
        self.assertIn("['text' => $w['familie_' . $family], 'url' => null]", abschnitt)

    def test_app_pages_render_a_breadcrumb(self):
        layout = (ROOT / 'php' / 'templates' / 'app' / 'layout.twig').read_text()
        self.assertIn('aria-label="Breadcrumb"', layout)
        karte = (ROOT / 'php' / 'templates' / 'app' / 'karte.twig').read_text()
        # The full-height map keeps its own way back; an extra row would shrink it.
        self.assertIn('{% block pfad %}{% endblock %}', karte)


if __name__ == '__main__':
    unittest.main()
