"""Quest-giver view models: localization, pins, quest rows and index facts."""
import unittest

from tools import giver_viewmodel as vm

MAPS = {
    '268437554': {'idx': 268437554, 'name': 'Mittelerde', 'tier': 0, 'eltern': None, 'region': 0},
    '268437557': {'idx': 268437557, 'name': 'Eriador', 'tier': 1, 'eltern': 268437554, 'region': 1},
    '268437678': {'idx': 268437678, 'name': 'Das Auenland', 'tier': 2, 'eltern': 268437557, 'region': 1},
    '268437700': {'idx': 268437700, 'name': 'Michelbinge', 'tier': 3, 'eltern': 268437678, 'region': 1,
                  'north': -33.0, 'south': -35.0, 'west': -76.0, 'east': -74.0, 'bild': '268437700.png'},
    '268450271': {'idx': 268450271, 'name': 'Karte 268450271', 'tier': 2, 'eltern': 268437557,
                  'region': 1},
    '268450272': {'idx': 268450272, 'name': '', 'tier': 2, 'eltern': 268437557, 'region': 1},
}

SOURCE = {'quest_giver': {'70000003': '70000002'}, 'givers': {
    '70000002': {
        'id': '70000002',
        'name': {'de': 'Karlo', 'en': 'Carlo', 'fr': 'Carlo'},
        'title': {'de': 'Gastwirt', 'en': 'Tavern Keep', 'fr': 'Aubergiste'},
        'kind': 'person', 'gender': 'MALE',
        'greeting': {'de': 'Hallo', 'en': 'Hello', 'fr': 'Bonjour'},
        'places': [{'region': 1, 'lat': -34.0, 'lon': -75.0, 'map': 268437700, 'quest': '70000003'}],
        'quests': ['70000003', '70000004'],
    },
    '70000005': {
        'id': '70000005', 'name': {'de': 'Rudolf', 'en': 'Robin', 'fr': 'Robin'},
        'kind': 'unknown', 'places': [], 'quests': ['70000004'],
    },
}}

QUESTS = {
    '70000003': {'i': '70000003', 'n': 'Gasthaus', 'l': '7', 'z': 'Das Auenland', 'dy': 1},
    '70000004': {'i': '70000004', 'n': 'Brief', 'l': '9', 'z': 'Das Auenland', 'gr': 2, 'ls': 1},
}


def app_url(lang, page, **params):
    from urllib.parse import urlencode
    if page == 'givers':
        page = vm.SEGMENT[lang]
    return '/%s/%s/%s' % (lang, page, ('?' + urlencode(params)) if params else '')


def coords(lat, lon):
    return '%.1f°%s, %.1f°%s' % (abs(lat), 'S' if lat < 0 else 'N',
                                 abs(lon), 'W' if lon < 0 else 'E')


WORDS = {'daily': 'Täglich', 'repeat': 'Wiederholbar', 'scalable': 'Skaliert mit der Stufe'}


class MapTrailTest(unittest.TestCase):
    def test_region_and_area_follow_the_map_tree(self):
        self.assertEqual(vm.region_of(MAPS, 268437700, 1), 268437557)
        self.assertEqual(vm.area_of(MAPS, 268437700), 268437678)
        self.assertEqual([part['name'] for part in vm.chain_of(MAPS, 268437700)],
                         ['Mittelerde', 'Eriador', 'Das Auenland', 'Michelbinge'])

    def test_unknown_map_falls_back_to_the_region_number_only(self):
        self.assertEqual(vm.region_of(MAPS, None, 1), 268437557)
        self.assertIsNone(vm.area_of(MAPS, None))

    def test_technical_map_names_are_no_landscape(self):
        # The app fills in "Karte 268450271"; the client has no name at all.
        self.assertIsNone(vm.area_of(MAPS, 268450271))
        self.assertIsNone(vm.area_of(MAPS, 268450272))
        self.assertEqual([part['name'] for part in vm.chain_of(MAPS, 268450271)],
                         ['Mittelerde', 'Eriador'])
        self.assertEqual(vm.region_of(MAPS, 268450271, 1), 268437557)


class IndexTest(unittest.TestCase):
    def test_rows_carry_places_levels_and_flag_bits(self):
        index = vm.giver_index(SOURCE, 'de', QUESTS, MAPS)
        rows = {row['id']: row for row in index['givers']}
        self.assertEqual(rows['70000002']['places'], [[268437557, 268437678]])
        self.assertEqual(rows['70000002']['low'], 7)
        self.assertEqual(rows['70000002']['high'], 9)
        self.assertEqual(rows['70000002']['tags'], 1 | 4 | 16)
        self.assertEqual(rows['70000002']['count'], 2)
        self.assertEqual(index['labels']['region'][268437557], 'Eriador')
        self.assertEqual(index['labels']['area'][268437678], 'Das Auenland')

    def test_search_includes_quest_names_but_not_raw_markup(self):
        index = vm.giver_index(SOURCE, 'de', QUESTS, MAPS)
        row = [row for row in index['givers'] if row['id'] == '70000002'][0]
        self.assertIn('gasthaus', row['search'])
        self.assertIn('karlo', row['search'])
        self.assertIn('gastwirt', row['search'])


class PageTest(unittest.TestCase):
    def test_detail_page_has_pin_chain_and_chips(self):
        pages = vm.giver_pages(SOURCE, 'de', QUESTS, MAPS, app_url, coords, WORDS)
        page = pages['70000002']
        place = page['places'][0]
        self.assertEqual(place['image'], '268437700.png')
        self.assertEqual((place['pin_x'], place['pin_y']), (50.0, 50.0))
        self.assertEqual(place['coords'], '34.0°S, 75.0°W')
        self.assertIn('id=70000003', place['map_url'])
        self.assertEqual([row['id'] for row in page['quests']], ['70000003', '70000004'])
        self.assertIn('Täglich', page['quests'][0]['chips'])
        self.assertIn('Skaliert mit der Stufe', page['quests'][1]['chips'])
        self.assertEqual(page['quests'][1]['url'], '/de/aufgabe/70000004/')

    def test_place_without_map_keeps_coordinates_and_no_map_link(self):
        source = {'givers': {'70000009': {
            'id': '70000009', 'name': {'de': 'X', 'en': 'X', 'fr': 'X'}, 'kind': 'person',
            'places': [{'region': 1, 'lat': -10.0, 'lon': -20.0, 'map': None, 'quest': None}],
            'quests': ['70000003']}}}
        pages = vm.giver_pages(source, 'de', QUESTS, MAPS, app_url, coords, WORDS)
        place = pages['70000009']['places'][0]
        self.assertIsNone(place['map_url'])
        self.assertEqual(place['chain'], [])
        self.assertEqual(place['coords'], '10.0°S, 20.0°W')

    def test_quest_link_uses_the_first_bestower(self):
        self.assertEqual(vm.quest_givers(SOURCE), {'70000003': '70000002'})

    def test_same_name_links_other_entries_with_place_and_count(self):
        source = {'givers': {
            '70000002': dict(SOURCE['givers']['70000002'], name={'de': 'Karlo', 'en': 'Carlo', 'fr': 'Carlo'}),
            '70000009': {'id': '70000009', 'name': {'de': 'Karlo', 'en': 'Karlo', 'fr': 'Karlo'},
                         'kind': 'person', 'places': [], 'quests': ['70000004']},
        }}
        pages = vm.giver_pages(source, 'de', QUESTS, MAPS, app_url, coords, WORDS)
        others = pages['70000002']['same_name']
        self.assertEqual([entry['id'] for entry in others], ['70000009'])
        self.assertEqual(others[0]['count'], 1)
        self.assertEqual(others[0]['url'], '/de/auftraggeber/70000009/')
        self.assertTrue(pages['70000002']['same_name_url'].startswith('/de/auftraggeber/?q='))


if __name__ == '__main__':
    unittest.main()
