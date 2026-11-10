"""Old flat addresses must not be linked any more; the canonical ones must be.

The PHP switch moved every application page to a language path
(`/start.html` -> `/de/`, `spielstand.html?lang=de` -> `/de/spielstand/`). The
old addresses still answer 301, so a visitor is fine - but every internal link
that points there costs a hop and feeds Search Console's "Seite mit
Weiterleitung". These tests keep the old forms out of templates and scripts.
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))
sys.path.insert(0, str(HIER / 'tools'))

from alte_adressen import APP, MUSTER, ziel  # noqa: E402
import php_viewmodel  # noqa: E402
import build_php_data  # noqa: E402

# Their own files at the site root, no redirect involved.
ERLAUBT = ('/impressum.html', '/datenschutz.html')


class ZielTest(unittest.TestCase):
    def test_application_pages_get_their_language_path(self):
        self.assertEqual(ziel('start', '?lang=de'), '/de/')
        self.assertEqual(ziel('start', '?lang=fr'), '/fr/')
        self.assertEqual(ziel('index', '?lang=de'), '/de/karte/')
        self.assertEqual(ziel('spielstand', '?lang=en'), '/en/progress/')
        self.assertEqual(ziel('ruf', '?lang=fr'), '/fr/reputation/')

    def test_deeds_opened_the_map_with_a_parameter(self):
        self.assertEqual(ziel('index', '?art=taten&lang=de'), '/de/karte/taten/')
        self.assertEqual(ziel('index', '?lang=fr&art=taten'), '/fr/carte/prouesses/')

    def test_query_and_anchor_survive(self):
        self.assertEqual(ziel('handwerk', '?lang=de&q=Eisen#rezepte'),
                         '/de/handwerk/rezepte/?q=Eisen#rezepte')
        self.assertEqual(ziel('belohnungen', '?tab=t&lang=en&q=Titel'),
                         '/en/rewards/?tab=t&q=Titel')

    def test_removed_lists_go_to_their_successor(self):
        # Both old list pages are 301s; link the successor directly.
        self.assertEqual(ziel('beruf', '?lang=de'), None)
        self.assertEqual(ziel('gegenstaende', '?lang=de'), '/de/gegenstandssuche/')
        self.assertEqual(ziel('gegenstand', '?lang=fr'), '/fr/recherche-objets/')

    def test_legal_files_stay_files_but_become_absolute(self):
        # Relative links break on a catalogue page, which has no <base>.
        self.assertEqual(ziel('impressum', '?lang=de'), '/impressum.html?lang=de')
        self.assertEqual(ziel('datenschutz', '?lang=fr'), '/datenschutz.html?lang=fr')

    def test_unknown_names_are_left_alone(self):
        self.assertEqual(ziel('gibtsnicht', '?lang=de'), None)


class UebereinstimmungTest(unittest.TestCase):
    def test_segments_match_the_router_and_the_data_build(self):
        # Same language paths in the tool, the router and the data build; the
        # key names differ ('givers' vs 'auftraggeber'), the addresses do not.
        for sprache, seiten in APP.items():
            # 'gegenstand' is a catalogue type, not an application page; its
            # segment comes from the router's type table instead.
            unsere = {wert for seite, wert in seiten.items() if seite != 'gegenstand'}
            ihre = set(php_viewmodel.APP_SEGMENTS[sprache].values())
            self.assertEqual(unsere, ihre, sprache)

    def test_professions_stay_out_of_the_sitemaps(self):
        # Every profession address is a 301, so it must not be listed.
        self.assertNotIn('p', build_php_data.SITEMAP_KINDS)
        self.assertIn('p', build_php_data.ARTEN)


class VorlagenTest(unittest.TestCase):
    """No file that the site serves may still link an old flat address."""

    def dateien(self):
        yield from sorted((HIER / 'php' / 'templates').rglob('*.twig'))
        yield from sorted((HIER / 'web').glob('*.js'))

    def test_no_old_flat_address_in_templates_or_scripts(self):
        funde = []
        for datei in self.dateien():
            text = datei.read_text(encoding='utf-8')
            for treffer in MUSTER.finditer(text):
                adresse = treffer.group(0)[len('href="'):-1]
                if adresse.startswith(ERLAUBT):
                    continue
                funde.append('%s: %s' % (datei.relative_to(HIER), adresse))
        self.assertEqual(funde, [], 'Alte Adressen verlinkt:\n' + '\n'.join(funde))

    def test_language_switch_builds_canonical_addresses(self):
        text = (HIER / 'web' / 'menue.js').read_text(encoding='utf-8')
        for alt in ("'spielstand.html?lang='", "'suche.html?lang='"):
            self.assertNotIn(alt, text)
        # The four pages with a language path are mapped, not guessed.
        for name in ('spielstand.html', 'companion.html', 'plugin.html', 'suche.html'):
            self.assertIn("'%s':" % name, text)

    def test_search_results_lead_to_canonical_pages(self):
        text = (HIER / 'web' / 'suche.js').read_text(encoding='utf-8')
        for alt in ('index.html?lang=', 'belohnungen.html?lang=', 'handwerk.html?lang='):
            self.assertNotIn(alt, text)

    def test_reputation_sources_link_to_the_catalogue(self):
        # The source rows were built at click time, so the link check above never
        # saw them: they still led through the old flat "index.html?id=…" form.
        text = (HIER / 'web' / 'ruf.js').read_text(encoding='utf-8')
        self.assertNotIn("a.href = 'index.html?", text)
        self.assertIn("a.href = '/' + sprache + '/' + ART[", text)
        for art in ('aufgabe', 'tat', 'quest', 'deed', 'quete', 'prouesse'):
            self.assertIn("'%s'" % art, text)


class SeitenmodellTest(unittest.TestCase):
    """The prepared page models must not fall back to old flat addresses."""

    def test_profession_links_go_to_the_filtered_crafting_page(self):
        self.assertEqual(php_viewmodel.beruf_url('de', 'COOK'),
                         '/de/handwerk/rezepte/?beruf=COOK')
        self.assertEqual(php_viewmodel.beruf_url('fr'),
                         '/fr/artisanat/recettes/')

    def test_no_old_link_fallback_in_the_page_models(self):
        # old_link() writes "/index.html?lang=de&id=…" and "/handwerk.html":
        # both are 301s. The models use the canonical addresses instead.
        text = (HIER / 'tools' / 'php_viewmodel.py').read_text(encoding='utf-8')
        self.assertNotIn('old_link', text)


if __name__ == '__main__':
    unittest.main()
