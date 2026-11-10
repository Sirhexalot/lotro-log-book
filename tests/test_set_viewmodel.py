"""Set cards share item models; missing pieces never become broken links."""
import unittest
from tools.set_viewmodel import link_items, set_pages


class SetViewModelTest(unittest.TestCase):
    def source(self):
        return {'sets': {'70000001': {
            'listable': True, 'name': {l: 'Set' for l in ('de', 'en', 'fr')},
            'members': [
                {'id': '70000002', 'available': True, 'name': {'de': 'Helm'}, 'class_labels': {'de': 'Jäger'}},
                {'id': '70000003', 'available': False, 'name': {'de': ''}, 'class_labels': {}},
            ],
            'bonuses': [{'pieces': 2, 'valid_threshold': True, 'entries': [
                {'display_ready': True, 'display': {'de': 'Ein belegter Effekt.'}},
                {'display_ready': False, 'mode': 'scaling', 'labels': {'de': 'Vitalität'}},
            ]}],
        }}}

    def test_cards_reuse_values_without_recursive_set_data(self):
        items = {'70000002': {'symbol': 1090000001, 'armour': 1234, 'bonuses': [{'display': '+5', 'label': 'Macht'}],
                              'set': {'head': 'Old · Level 515–154'}, 'required_class': 'Hunter'}}
        source = self.source()
        link_items(items, source, 'de')
        self.assertIsNone(items['70000002']['set'])
        self.assertEqual(items['70000002']['set_links'][0]['url'], '/de/set/70000001/')
        page = set_pages(source, 'de', items)['70000001']
        self.assertEqual(page['members'][0]['card']['armour'], 1234)
        self.assertEqual(page['members'][0]['card']['required_class'], 'Jäger')
        self.assertNotIn('set', page['members'][0]['card'])
        self.assertIsNone(page['members'][1]['url'])
        self.assertIsNone(page['members'][1]['card'])
        self.assertEqual(page['bonuses'][0]['texts'], ['Ein belegter Effekt.'])
        self.assertEqual(page['bonuses'][0]['pending'], [{'label': 'Vitalität', 'scaling': True}])
        self.assertEqual(page['available_parts'], 1)


if __name__ == '__main__':
    unittest.main()
