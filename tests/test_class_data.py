from __future__ import annotations

import unittest
from pathlib import Path

from tools import build_class_data


@unittest.skipUnless(build_class_data.LORE.is_dir(), 'LOTRO client lore is not installed')
class ClassDataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = build_class_data.build()

    def test_localized_class_race_combinations(self):
        self.assertEqual(len(self.data['classes']), 12)
        self.assertEqual(len(self.data['races']), 8)
        self.assertEqual(sum(len(row['races']) for row in self.data['classes'].values()), 69)
        self.assertEqual(self.data['classes']['Hunter']['names']['de'], 'Jäger')
        self.assertEqual(self.data['races']['hobbit']['names']['de'], 'Hobbit')

    def test_hunter_equipment_knowledge_and_unlock_levels(self):
        hunter = self.data['classes']['Hunter']
        self.assertIn('hobbit', hunter['races'])
        self.assertNotIn('HEAVY', [item['type'] for item in hunter['armour']])
        crossbow = next(item for item in hunter['weapons'] if item['type'] == 'CROSSBOW')
        self.assertEqual(crossbow['level'], 7)

    def test_profile_catalogues_only_include_matching_explicit_restrictions(self):
        rows = build_class_data.catalogue_data('de')
        self.assertTrue(rows['quests'])
        self.assertTrue(rows['deeds'])
        self.assertTrue(all(len(row) == 10 for row in rows['quests'] + rows['deeds']))
        self.assertTrue(all(row[0] and row[1] for row in rows['quests'] + rows['deeds']))
        self.assertTrue(any(row[3] == 'Hunter' for row in rows['quests']))
        self.assertTrue(any(row[4] == 'hobbit' for row in rows['deeds']))
        self.assertTrue(any(row[5] and row[6] for row in rows['quests']))
        self.assertTrue(any(row[7] for row in rows['quests']))
        self.assertTrue(any(row[8] for row in rows['deeds']))

    def test_profile_items_share_one_filterable_list(self):
        template = Path('php/templates/app/klassen.twig').read_text()
        script = Path('web/klassen.js').read_text()
        self.assertEqual(template.count('id="filter-gegenstaende"'), 1)
        self.assertNotIn('gruppe-exklusiv', template)
        self.assertNotIn('gruppe-geteilt', template)
        self.assertNotIn('gruppe-ausrustung', template)
        # One helper builds the rows so the tab count and the list never drift.
        self.assertIn('rows: classItems.concat(gear)', script)
        self.assertIn('itemRowsFor(classKey, raceKey, level)', script)
        self.assertIn("mountFilter('items', filterRoots.items", script)


if __name__ == '__main__':
    unittest.main()
