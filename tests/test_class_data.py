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


    def test_profile_items_use_minimum_level_not_item_level(self):
        """The class profile asks "can I wear it", not "is it strong for me"."""
        script = Path('web/klassen.js').read_text()
        self.assertNotIn('row[7] <= level', script)
        self.assertNotIn('row[7] > level', script)
        self.assertIn('row[14] <= level', script)
        self.assertIn('levelGroups: false', script)
        self.assertIn("defaultSort: 'itemLevelDesc'", script)
        self.assertIn("defaultSort: 'levelDesc'", script)
        # Quests and deeds keep their evidenced level ceiling.
        self.assertIn('row[2] <= level', script)


    def test_profile_levels_match_the_displayed_level(self):
        rows = build_class_data.catalogue_data('de')
        deeds = {row[0]: row for row in rows['deeds']}
        # "Die Neun" is a level-130 deed, "Zurück und wieder hin" level 125.
        self.assertEqual(deeds['70054875'][2], 130)
        self.assertEqual(deeds['70066AE3'][2], 125)
        for kind, path in (('deeds', build_class_data.WEB / 'daten-taten-de.js'),
                           ('quests', build_class_data.WEB / 'daten-de.js')):
            real = {row['i']: row
                    for row in build_class_data.catalogue_rows(path, 'MQL_QUESTS')}
            for row in rows[kind]:
                if row[3] and row[3] != 'Hunter':
                    continue
                if row[4] and row[4] != 'hobbit':
                    continue
                actual = int(float((real.get(row[0]) or {}).get('l') or 0))
                if (row[2] or 0) <= 123:
                    self.assertLessEqual(actual, 123,
                                         (kind, row[0], row[1], row[2], actual))


if __name__ == '__main__':
    unittest.main()
