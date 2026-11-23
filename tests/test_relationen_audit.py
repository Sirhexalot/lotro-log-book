"""Daten-Audit: Jede offene Lücke im Entitätenvertrag muss real sein.

Der Vertrag markiert Listen als `component` (gemeinsame Filterkomponente),
`direct` (immer höchstens fünf Einträge) oder `open` (bekannte Lücke mit
Grund). Dieser Test prüft die Bezeichnung gegen die gebauten Daten: Eine als
offen markierte Liste muss tatsächlich über die Schwelle laufen, sonst wäre
der Eintrag eine Ausrede statt einer Bestandsaufnahme.

Der Lauf braucht `phpdata` (LLB_DATA, Standard ~/.cache/llb-php/phpdata).
"""
from __future__ import annotations

import glob
import json
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(os.environ.get('LLB_DATA', str(Path.home() / '.cache/llb-php/phpdata')))
SCHWELLE = 5


def pages(kind: str):
    for datei in glob.glob(str(DATA / 'de' / ('page-' + kind) / '*.json')):
        yield from json.loads(Path(datei).read_text(encoding='utf-8'))['entities'].values()


def where_groups(page: dict):
    for group in page.get('where_groups') or []:
        yield group.get('filter'), bool(group.get('source_kind')), len(group.get('entries') or [])


@unittest.skipUnless((DATA / 'de' / 'page-d').is_dir(), 'PHP-Daten zuerst bauen')
class OffeneLueckenTest(unittest.TestCase):
    def test_deed_context_is_a_complete_relation(self):
        # Since 23.11.2026 the context travels as two groups (same area, same
        # category) so the page can offer them as tabs. The union is the
        # complete relation the old single list carried.
        mit_kontext = [p for p in pages('d')
                       if p.get('related_area') or p.get('related_kind')]
        self.assertGreater(len(mit_kontext), 0)
        for page in mit_kontext:
            self.assertNotIn('more_area', page, page.get('id'))
            self.assertNotIn('more_kind', page, page.get('id'))
            self.assertTrue(page.get('related_area_label'), page.get('id'))
            self.assertTrue(page.get('related_kind_label'), page.get('id'))
            # A deed that stands in both lists counts once, under the area.
            self.assertFalse(set(page.get('related_area') or [])
                             & set(page.get('related_kind') or []), page.get('id'))
        over = [p for p in mit_kontext
                if len(p.get('related_area') or []) + len(p.get('related_kind') or []) > SCHWELLE]
        self.assertGreater(len(over), 0, 'Die Schwelle wird von keiner Tat mehr erreicht')

    def test_quest_required_by_is_a_list_not_a_reward(self):
        betroffen = [p for p in pages('q') if p.get('related_quests')]
        self.assertGreater(len(betroffen), 0, 'Aufgaben ohne Relation "Wird vorausgesetzt von"?')
        for page in betroffen:
            self.assertTrue(page.get('related_label'), page.get('id'))
            self.assertEqual(page.get('required_by', []), [],
                             'required_by darf nicht mehr als Belohnungsliste mitlaufen')
            for spalte in page.get('context_columns') or []:
                for row in spalte:
                    self.assertNotEqual(row.get('label'), 'Wird vorausgesetzt von',
                                        '%s: Doppelung im Zusammenhang' % page.get('id'))
        over = [p for p in betroffen if len(p['related_quests']) > SCHWELLE]
        self.assertGreater(len(over), 0)

    def test_set_pieces_without_item_page_appear_once_per_name(self):
        collapsed = 0
        for page in pages('set'):
            namen = [m['name'] for m in page.get('members') or [] if m.get('missing')]
            self.assertEqual(len(namen), len(set(namen)), page.get('id'))
            self.assertEqual(page['parts'],
                             sum(m.get('count', 1) for m in page.get('members') or []))
            collapsed += sum(1 for m in page.get('members') or [] if m.get('missing'))
        self.assertGreater(collapsed, 0, 'keine zusammengefassten Setteile mehr')

    def test_item_recipe_directions_are_separate(self):
        beide = [p for p in pages('i')
                 if p.get('related_crafted_by') and p.get('related_used_in')]
        self.assertGreater(len(beide), 0, 'kein Gegenstand mit beiden Richtungen')
        for page in beide:
            self.assertNotEqual(set(page['related_crafted_by']),
                                set(page['related_used_in']),
                                '%s: Herstellung und Wofuer sind identisch' % page.get('id'))

    def test_item_where_gaps_are_real(self):
        recipe_over = plain_over = 0
        for page in pages('i'):
            for art, source, anzahl in where_groups(page):
                if anzahl <= SCHWELLE:
                    continue
                if art == 'recipes' and not source:
                    recipe_over += 1
                elif not art and not source:
                    plain_over += 1
        self.assertGreater(recipe_over, 0, 'Herstellungsgruppen sind migriert; Vertrag nachziehen')
        self.assertGreater(plain_over, 0, 'Weitere Quellgruppen sind migriert; Vertrag nachziehen')


if __name__ == '__main__':
    unittest.main()
