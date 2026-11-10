"""Ingredient links use real IDs; optional chance is not an image identifier."""
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from php_viewmodel import recipe_view


class IngredientTest(unittest.TestCase):
    def test_explicit_ids_and_optional_layout(self):
        for lang in ('de', 'en', 'fr'):
            builder = SimpleNamespace(
                w={'recipelabel': 'Recipe'}, lang=lang, professions={},
                items={'70000001': {}, '70000002': {}},
                item_link=lambda name: None,
            )
            row = ['Result', 1, 1, 'Forester', 'Tier', 'Wood',
                   [['Wood', 2, 1090000001, '70000001']],
                   [['Resin', 1, .35, 1090000002, '70000002']],
                   '', 'FORESTER', '70000003', 1, 5, 7, None, None, None, None]
            page = recipe_view(builder, row)
            self.assertTrue(page['ingredients'][0]['url'].endswith('/70000001/'))
            self.assertTrue(page['optional'][0]['url'].endswith('/70000002/'))
            self.assertEqual(page['optional'][0]['icon'], 1090000002)
            self.assertEqual(page['optional'][0]['chance'], 35)


if __name__ == '__main__':
    unittest.main()
