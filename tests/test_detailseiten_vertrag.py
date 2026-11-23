"""Detail pages: one contract, one skeleton, one width.

`docs/datenraum/lotro-datenraum-entitaeten.json` describes what a detail page
of each entity shows, in which order, with which component. This test keeps
the contract, the templates and the shared width rule together:

- every core entity declares its sections,
- every section names a component that exists,
- a section that is not built says why,
- entity pages use the header's shell width instead of their own column.
"""
from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERTRAG = ROOT / 'docs/datenraum/lotro-datenraum-entitaeten.json'
KERN = ('q', 'd', 'i', 'recipe', 'giver')
STATUS = {'umgesetzt', 'offen', 'bewusst-nicht'}
SEITEN = {
    'q': 'php/templates/entity/quest.twig',
    'd': 'php/templates/entity/deed.twig',
    'i': 'php/templates/entity/item.twig',
    'recipe': 'php/templates/entity/recipe.twig',
    'giver': 'php/templates/givers/detail.twig',
    # The pages built on the same skeleton since 23.11.2026.
    'set': 'php/templates/sets/detail.twig',
    'vendor': 'php/templates/vendors/detail.twig',
    'title': 'php/templates/entity/title.twig',
    'l': 'php/templates/entity/landmarke.twig',
    'area': 'php/templates/entity/area.twig',
    'region': 'php/templates/entity/area.twig',
    'instance': 'php/templates/instances/detail.twig',
    'virtue': 'php/templates/entity/virtue.twig',
    'f': 'php/templates/entity/fraktion.twig',
}


def vertrag() -> dict:
    return json.loads(VERTRAG.read_text(encoding='utf-8'))


def komponenten_datei(name: str) -> Path | None:
    """Resolve the file a section names, or None for a deliberate dash."""
    name = name.strip()
    if name in ('', '—', '-'):
        return None
    # A name may carry a hint in brackets: "php/src/Shell.php (crumbs)".
    name = re.sub(r'\s*\([^)]*\)\s*$', '', name).strip()
    # A full repository path wins; otherwise the template folder is assumed.
    if name.startswith(('web/', 'php/', 'tools/')):
        return ROOT / name
    # A component's look and behaviour live in web/: "components/knopf.css".
    if name.startswith('components/') and name.endswith(('.css', '.js')):
        return ROOT / 'web' / name.split('/', 1)[1]
    # "components/ort.twig", "entity/quest.twig", "givers/detail.twig"
    if name.endswith('.twig'):
        return ROOT / 'php/templates' / name
    return None


class DetailseitenVertragTest(unittest.TestCase):
    def setUp(self):
        self.daten = vertrag()
        self.entitaeten = self.daten['entitaeten']

    def test_the_rules_are_written_down(self):
        regeln = self.daten.get('detailseiten_regeln') or {}
        for key in ('breite', 'zonen', 'tabs', 'keine_stillen_verluste', 'komponenten'):
            self.assertTrue(regeln.get(key), key)
        self.assertEqual(regeln['zonen'],
                         ['kopf', 'lage', 'inhalt', 'beziehungen', 'abschluss'])

    def test_every_core_entity_declares_its_sections(self):
        for kind in KERN:
            eintrag = self.entitaeten[kind]
            abschnitte = (eintrag.get('detailseiten') or {}).get('abschnitte') or []
            self.assertGreaterEqual(len(abschnitte), 5, kind)
            ids = [a['id'] for a in abschnitte]
            self.assertEqual(len(ids), len(set(ids)), '%s: doppelte Abschnitts-ID' % kind)
            self.assertEqual(ids[0], 'kopf', '%s: der Kopf steht zuerst' % kind)

    def test_every_section_names_its_component_and_reason(self):
        for kind in KERN:
            for abschnitt in self.entitaeten[kind]['detailseiten']['abschnitte']:
                for feld in ('id', 'titel', 'komponente', 'quelle', 'status', 'bedingung'):
                    self.assertIn(feld, abschnitt, '%s/%s' % (kind, abschnitt.get('id')))
                self.assertIn(abschnitt['status'], STATUS, '%s/%s' % (kind, abschnitt['id']))
                self.assertTrue(abschnitt['quelle'], '%s/%s' % (kind, abschnitt['id']))
                if abschnitt['status'] in ('offen', 'bewusst-nicht'):
                    self.assertTrue(abschnitt.get('grund', '').strip(),
                                    '%s/%s braucht einen Grund' % (kind, abschnitt['id']))

    def test_named_components_exist(self):
        for kind in KERN:
            for abschnitt in self.entitaeten[kind]['detailseiten']['abschnitte']:
                for teil in re.split(r'\s+\+\s+', abschnitt['komponente']):
                    datei = komponenten_datei(teil)
                    if datei is None:
                        self.assertIn(teil.strip(), ('—', '-', ''), abschnitt['komponente'])
                        continue
                    self.assertTrue(datei.is_file(), '%s/%s: %s fehlt'
                                    % (kind, abschnitt['id'], teil))

    def test_entities_without_a_detail_contract_say_why(self):
        offen = self.daten.get('detailseiten_offen') or {}
        for kind in self.entitaeten:
            hat_vertrag = bool((self.entitaeten[kind].get('detailseiten') or {}).get('abschnitte'))
            if hat_vertrag:
                continue
            self.assertIn(kind, offen, '%s: Detailvertrag fehlt ohne Begründung' % kind)
            self.assertTrue(str(offen[kind]).strip(), kind)

    def test_entity_pages_use_the_header_shell_width(self):
        css = (ROOT / 'web/katalog.css').read_text(encoding='utf-8')
        self.assertIn('.katalog-inhalt article.entity-detail-layout', css)
        self.assertIn('max-width: none', css)
        for kind, datei in SEITEN.items():
            text = (ROOT / datei).read_text(encoding='utf-8')
            self.assertRegex(text, r'class="[^"]*(entity-detail-layout|katalog-detailraster)',
                             '%s nutzt die Hülle nicht' % kind)


if __name__ == '__main__':
    unittest.main()
