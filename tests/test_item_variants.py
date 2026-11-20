"""Item variants and basic values must be grounded in the exact item ID."""
import unittest
import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from php_viewmodel import ItemContext


class ItemVariantsTest(unittest.TestCase):
    def context(self, full):
        items = {key: {'n': {'de': 'Bogen', 'en': 'Bow', 'fr': 'Arc'}}
                 for key in full}
        builder = SimpleNamespace(items=items, lang='de',
                                  w={'min_level': 'Benötigt Stufe',
                                     'item_level': 'Gegenstandsstufe'})
        return ItemContext(builder, {}, {}, {}, {}, {}, {}, {}, {}, full,
                           {'COMMON': 'Allgemein'})

    def test_variants_distinguish_requirement_and_item_level(self):
        ctx = self.context({'700302C5': {'ml': 85, 'l': 121},
                            '70038376': {'ml': 95, 'l': 173},
                            '7004056C': {'ml': 95, 'l': 196},
                            '7004056D': {}})
        result = ctx.variant_choices('700302C5', ctx.builder.items['700302C5'])
        self.assertEqual([row['label'] for row in result],
                         ['Benötigt Stufe 85', 'Benötigt Stufe 95 · Gegenstandsstufe 173',
                          'Benötigt Stufe 95 · Gegenstandsstufe 196'])
        self.assertEqual([row['active'] for row in result], [True, False, False])
        self.assertTrue(result[0]['url'].endswith('/700302C5/'))

    def test_identical_names_without_distinguishing_values_do_not_show_links(self):
        ctx = self.context({'700302C5': {'ml': 85}, '70038376': {'ml': 85}})
        self.assertEqual(ctx.variant_choices('700302C5', ctx.builder.items['700302C5']), [])

    def test_raw_values_are_fallback_by_id_and_do_not_replace_detail_values(self):
        ctx = self.context({'700302C5': {'dps': 81.9419, 'dmg': 94.0, 'dt': 'COMMON'},
                            '70038376': {'dps': 109.8982, 'dt': 'NOT_A_LABEL'}})
        values = ctx.item_values('700302C5', {}, {'dps': 82})
        self.assertEqual((values['dps'], values['damage'], values['damageType']),
                         (82, 94.0, 'Allgemein'))
        self.assertIsNone(ctx.item_values('70038376', {}, {})['damage'])
        self.assertIsNone(ctx.item_values('70038376', {}, {})['damageType'])
