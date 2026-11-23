"""Der Entitätenvertrag im Datenraum und die Listenzeilen-Regel.

Der Vertrag (docs/datenraum/lotro-datenraum-entitaeten.json) ist die eine
Quelle für Zeilenfelder, Filtergruppen, erlaubte Relationen, Fortschritt und
Listenstatus. Diese Prüfung hält ihn mit dem Code zusammen und verhindert die
Rückkehr von Zutaten, Quellenschaltern oder Detail-Links in Listenzeilen.
"""
from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERTRAG = ROOT / 'docs/datenraum/lotro-datenraum-entitaeten.json'
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'tools'))

import build_katalogseiten as katalog  # noqa: E402

KINDS = {'q', 'd', 'i', 'recipe', 'set', 'giver', 'vendor',
         'title', 'virtue', 'f', 'l', 'area', 'region', 'instance'}
STATUS = {'component', 'direct', 'open'}


def vertrag() -> dict:
    return json.loads(VERTRAG.read_text(encoding='utf-8'))


class VertragTest(unittest.TestCase):
    def setUp(self):
        self.daten = vertrag()
        self.entitaeten = self.daten['entitaeten']

    def test_every_entity_is_described_once(self):
        self.assertEqual(set(self.entitaeten), KINDS)

    def test_threshold_matches_php_rule(self):
        self.assertEqual(self.daten['regeln']['schwelle'], 5)
        php = (ROOT / 'php/src/FilterRegeln.php').read_text(encoding='utf-8')
        self.assertRegex(php, r'MAX_DIREKTLISTE\s*=\s*5')

    def test_segments_match_the_router(self):
        eigen = {}
        from giver_viewmodel import SEGMENT as GIVER
        from set_viewmodel import SEGMENT as SET
        from vendor_viewmodel import SEGMENT as VENDOR
        from php_viewmodel import APP_SEGMENTS
        eigen['giver'], eigen['set'], eigen['vendor'] = GIVER, SET, VENDOR
        # The instance finder's address segment is the one its detail pages use.
        eigen['instance'] = {lang: APP_SEGMENTS[lang]['instances'] for lang in ('de', 'en', 'fr')}
        for kind, eintrag in self.entitaeten.items():
            for lang in ('de', 'en', 'fr'):
                if kind in eigen:
                    erwartet = eigen[kind][lang]
                else:
                    erwartet = katalog.WORDS[lang][kind]
                self.assertEqual(eintrag['segmente'][lang], erwartet,
                                 '%s/%s' % (kind, lang))

    def test_relations_point_to_known_entities(self):
        for kind, eintrag in self.entitaeten.items():
            for ziel in eintrag['relationen']:
                self.assertIn(ziel, KINDS, '%s → %s' % (kind, ziel))

    def test_every_list_declares_its_surface_and_status(self):
        for kind, eintrag in self.entitaeten.items():
            self.assertTrue(eintrag['listen'], kind)
            for liste in eintrag['listen']:
                self.assertIn(liste['status'], STATUS, '%s/%s' % (kind, liste['id']))
                self.assertIn(liste['oberflaeche'], {'detail', 'liste'},
                              '%s/%s' % (kind, liste['id']))
                if liste['status'] == 'open':
                    self.assertTrue(liste.get('grund', '').strip(),
                                    '%s/%s braucht einen Grund' % (kind, liste['id']))

    def test_row_fields_are_identity_and_classification_only(self):
        verboten = {'zutaten', 'quellen', 'beschreibung', 'werte', 'herkunft',
                    'verwendung', 'bezugsquellen', 'rezept_oeffnen', 'details'}
        for kind, eintrag in self.entitaeten.items():
            felder = {feld.lower() for feld in eintrag['zeilenfelder']}
            self.assertTrue(felder, kind)
            self.assertFalse(felder & verboten, '%s: %s' % (kind, felder & verboten))


class ListenzeilenRegelTest(unittest.TestCase):
    def test_recipe_list_has_no_ingredients_or_detail_link(self):
        text = (ROOT / 'web/rezepte.js').read_text(encoding='utf-8')
        for marker in ('hw_zutaten', 'hw_rezept_details', 'zutaten-zeile',
                       'rezept-zutaten', 'rezept-detail'):
            self.assertNotIn(marker, text, marker)

    def test_recipe_row_links_to_the_recipe(self):
        text = (ROOT / 'web/rezepte.js').read_text(encoding='utf-8')
        zeile = text.split('function zeile(', 1)[1].split('function tabelle(', 1)[0]
        self.assertIn('recipeUrl(wert[10])', zeile)
        self.assertNotIn('itemUrl(', zeile)

    def test_quest_relation_is_not_part_of_the_rewards(self):
        text = (ROOT / 'php/templates/entity/quest.twig').read_text(encoding='utf-8')
        self.assertNotIn('page.required_by', text)
        self.assertIn('data-filter-results', text)

    def test_item_keeps_recipe_directions_apart(self):
        twig = (ROOT / 'php/templates/entity/_item_group.twig').read_text(encoding='utf-8')
        self.assertIn('data-recipe-filter-group', twig)
        js = (ROOT / 'web/entitaeten-listen.js').read_text(encoding='utf-8')
        self.assertIn('recipe_made', js)
        self.assertIn("lists.recipe_made", js)
        php = (ROOT / 'php/src/RelatedLists.php').read_text(encoding='utf-8')
        self.assertIn("'recipe_made'", php)
        self.assertIn('skipRecipes', php)
        # A page without a relation host must not be treated as one: the
        # article would be moved into the hidden fallback.
        self.assertNotIn("document.querySelector('.item-seite')", js)

    def test_related_vendor_rows_use_the_catalogue_row(self):
        js = (ROOT / 'web/entitaeten-listen.js').read_text(encoding='utf-8')
        self.assertIn("rowUI.row(target,{href:r.url,name:r.name,icon:'haendler'", js)
        twig = (ROOT / 'php/templates/vendors/list.twig').read_text(encoding='utf-8')
        # The vendor list is one of the shared tables since 23.11.2026; its
        # rows keep the same name/meta cells as every other result list.
        self.assertIn('class="llb-tabelle"', twig)
        self.assertIn('class="gs-zeile"', twig)
        self.assertIn('class="gs-name"', twig)
        self.assertNotIn("result.heading(lang, 'Art und Ort')", twig)

    def test_contract_is_referenced_by_the_project_rules(self):
        agents = (ROOT / 'AGENTS.md').read_text(encoding='utf-8')
        self.assertIn('lotro-datenraum-entitaeten.json', agents)
        self.assertTrue('Listenzeile' in agents or 'List row' in agents,
                        'Listenzeilen-Regel fehlt')


if __name__ == '__main__':
    unittest.main()
