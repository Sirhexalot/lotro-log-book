"""Canonical map links use the actual map tier and every quest path segment."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

from build_php_data import build_relations, load_language
from php_viewmodel import ViewBuilder, landmark_view, quest_view


class ViewModelLinksTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = load_language('de')
        cls.maps = {str(entry['idx']): entry for entry in cls.model['maps']}
        cls.builder = ViewBuilder('de', cls.model, cls.maps)
        cls.relations = build_relations(cls.model['quests'])

    def test_landmark_parent_map_uses_its_real_entity_type(self):
        page = landmark_view(self.builder, {
            'id': 'TEST0001', 'name': 'Testlandmarke', 'map': 268437713,
            'targets': [],
        })
        self.assertEqual(page['place']['map_url'], '/de/gebiet/268437713/')
        self.assertEqual(page['place']['region'], {
            'url': '/de/gebiet/268437592/', 'text': 'Trollhöhen',
        })

    def test_map_link_does_not_publish_technical_map_names(self):
        builder = ViewBuilder('de', self.model, {
            '123': {'idx': 123, 'name': 'Karte 123', 'tier': 2},
        })
        self.assertIsNone(builder.map_link(123, 'Karte 123'))

    def test_every_named_quest_path_segment_gets_its_map_link(self):
        quest = next(row for row in self.model['quests']
                     if len(row.get('f') or []) == len(row.get('fk') or []) > 2)
        page = quest_view(self.builder, dict(
            quest, rel=self.relations[quest['i']],
        ))
        self.assertEqual(len(page['area_trail']), len(quest['f']))
        for index, crumb in enumerate(page['area_trail']):
            map_entry = self.maps[str(quest['fk'][index])]
            kind = 'region' if map_entry.get('tier') == 1 else 'gebiet'
            self.assertEqual(crumb['url'], '/de/%s/%s/' % (kind, quest['fk'][index]))


if __name__ == '__main__':
    unittest.main()
