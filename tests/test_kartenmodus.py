"""The map has two modes, and the address says which one.

Quests live at /de/karte/, deeds at /de/karte/taten/. The menu mark, the page
title and the data file all hang on MQL_ART, which once came from "?art=taten"
alone: the deed page therefore showed the quest menu and loaded quest data.

These checks tie the client's segment lists to the routes the router serves, so
renaming a path segment cannot silently bring the bug back.
"""
from __future__ import annotations

import re
import sys
import unittest
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER / 'tools'))

from alte_adressen import APP  # noqa: E402

SPRACHE = (HIER / 'web' / 'sprache.js').read_text(encoding='utf-8')
MENUE = (HIER / 'web' / 'menue.js').read_text(encoding='utf-8')
SEITE = (HIER / 'php' / 'src' / 'Page.php').read_text(encoding='utf-8')


def js_objekt(name: str) -> dict[str, str]:
    """Read a flat `{ de: 'x', en: 'y', fr: 'z' }` literal from sprache.js."""
    treffer = re.search(r'var ' + name + r' = \{([^}]*)\};', SPRACHE)
    if not treffer:
        raise AssertionError('nicht gefunden: ' + name)
    return dict(re.findall(r"(\w+):\s*'([^']*)'", treffer.group(1)))


class WegeTest(unittest.TestCase):
    def test_client_segments_match_the_routes(self):
        karte = js_objekt('KARTEN_SEGMENT')
        taten = js_objekt('TATEN_SEGMENT')
        for sprache in ('de', 'en', 'fr'):
            self.assertEqual(karte[sprache], APP[sprache]['karte'], sprache)
            self.assertEqual(taten[sprache], APP[sprache]['taten'].split('/')[-1], sprache)

    def test_every_deed_route_ends_in_a_known_slug(self):
        taten = set(js_objekt('TATEN_SEGMENT').values())
        for sprache, seiten in APP.items():
            letzter = seiten['taten'].split('/')[-1]
            self.assertIn(letzter, taten, sprache)
            # The quest route must not look like a deed route.
            self.assertNotEqual(seiten['karte'].split('/')[-1], letzter, sprache)


class ErkennungTest(unittest.TestCase):
    def test_mode_comes_from_the_path(self):
        self.assertIn("window.location.pathname", SPRACHE)
        self.assertIn('TATEN.indexOf(letzter) >= 0', SPRACHE)

    def test_old_parameter_still_opens_deeds(self):
        # Bookmarked "index.html?art=taten&id=…" links keep working.
        self.assertIn("get('art') === 'taten'", SPRACHE)

    def test_menu_follows_the_mode(self):
        self.assertIn("seite === 'karte' && window.MQL_ART === 'taten'", MENUE)

    def test_canonical_map_links_carry_the_mode(self):
        for datei in ('app.js', 'belohnungen.js', 'gegenstand.js'):
            text = (HIER / 'web' / datei).read_text(encoding='utf-8')
            self.assertNotIn('index.html?art=taten', text, datei)
            self.assertIn('MQL_KARTE_LINK', text, datei)


class SeitentitelTest(unittest.TestCase):
    def test_deed_page_uses_the_map_template_with_its_own_title(self):
        self.assertIn("'taten' => 'karte'", SEITE)
        self.assertIn("if ($page === 'taten')", SEITE)
        for titel in ("'de' => 'Taten'", "'en' => 'Deeds'", "'fr' => 'Prouesses'"):
            self.assertIn(titel, SEITE)


if __name__ == '__main__':
    unittest.main()
