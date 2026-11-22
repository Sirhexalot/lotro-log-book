"""Vendor locations retain a useful regional link when no map frame fits."""
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from vendor_viewmodel import vendor_index, vendor_pages


MAPS = {
    '268437554': {'idx': 268437554, 'name': 'Mittelerde', 'tier': 0, 'region': 0},
    '268437557': {'idx': 268437557, 'name': 'Eriador', 'tier': 1, 'region': 1},
}
SOURCE = {'vendors': {
    '70000059': {
        'id': '70000059',
        'name': {'de': 'Anlaf der Einsame', 'en': 'Anlaf the Forlorn',
                 'fr': 'Anlaf le Mélancolique'},
        'type': 'vendor',
        'places': [{'region': 1, 'lat': -4.43573, 'lon': 50.66154, 'map': None}],
        'items': [],
    },
}}


def app_url(lang, page, **params):
    from urllib.parse import urlencode
    segments = {'de': {'karte': 'karte', 'reise': 'reise', 'vendors': 'haendler'},
                'en': {'karte': 'map', 'reise': 'travel', 'vendors': 'vendor'},
                'fr': {'karte': 'carte', 'reise': 'voyage', 'vendors': 'marchand'}}
    return '/%s/%s/%s' % (lang, segments[lang][page],
                           ('?' + urlencode(params)) if params else '')


def coords(lat, lon):
    return '%.1f, %.1f' % (lat, lon)


class VendorRegionFallbackTest(unittest.TestCase):
    def test_unknown_map_links_to_known_region_in_all_languages(self):
        for lang, expected_name, expected_route, expected_map in (
                ('de', 'Eriador', '/de/region/268437557/',
                 '/de/karte/?vorkarte=268437557'),
                ('en', 'Eriador', '/en/region/268437557/',
                 '/en/map/?vorkarte=268437557'),
                ('fr', 'Eriador', '/fr/region/268437557/',
                 '/fr/carte/?vorkarte=268437557')):
            with self.subTest(lang=lang):
                page = vendor_pages(SOURCE, lang, {}, MAPS, app_url, coords, {})[
                    '70000059']
                place = page['places'][0]
                self.assertEqual(place['chain'], [{
                    'id': 268437557, 'name': expected_name, 'tier': 1,
                    'url': expected_route,
                }])
                self.assertEqual(place['map_url'], expected_map)
                self.assertIsNone(place['image'])
                self.assertEqual(place['coords'], '-4.4, 50.7')

    def test_no_region_does_not_invent_a_link(self):
        source = {'vendors': {'70000060': {
            'id': '70000060', 'name': {'de': 'Unbekannt'},
            'places': [{'region': 99, 'lat': -1, 'lon': 2, 'map': None}],
            'items': [],
        }}}
        place = vendor_pages(source, 'de', {}, MAPS, app_url, coords, {})[
            '70000060']['places'][0]
        self.assertEqual(place['chain'], [])
        self.assertIsNone(place['map_url'])

    def test_php_map_names_resolve_numeric_vendor_region(self):
        php_maps = {
            '268437557': {'idx': 268437557, 'name': 'Eriador', 'tier': 1,
                          'region': 'Eriador'},
        }
        page = vendor_pages(SOURCE, 'de', {}, php_maps, app_url, coords, {},
                            {1: 268437557})['70000059']
        self.assertEqual(page['places'][0]['chain'][0]['name'], 'Eriador')


ITEMS = {
    '70000F2C': {'name': 'Starre Drachenschuppe', 'l': 45},
    '70000F2D': {'name': 'Gleißende Höhlenklauen-Haut', 'l': 45},
    '7000A6C7': {'name': 'Relikt der Elben', 'l': 1},
}
TAUSCH = {
    'vendors': {
        '7001F02F': {
            'id': '7001F02F',
            'name': {'de': 'Celeblas', 'en': 'Celeblas', 'fr': 'Celeblas'},
            'type': 'barter',
            'places': [],
            'items': ['70000F2C', '70000F2D'],
            'offers': [
                {'profile': '7001F113',
                 'give': [['7002B017', 400]], 'receive': [['70000F2C', 5]]},
                {'profile': '7001F114',
                 'give': [['7002B017', 250], ['7002B018', 10]],
                 'receive': [['70000F2D', 1]]},
                {'profile': '7001F114',
                 'give': [['7002B017', 1000]], 'receive': [['7000A6C7', 1]]},
            ],
        },
        '70000001': {
            'id': '70000001',
            'name': {'de': 'Händler und Tauschhändler', 'en': 'Both', 'fr': 'Les deux'},
            'type': 'both',
            'places': [],
            'items': ['70000F2C', '70000F2D'],
            'sold': ['70000F2C'],
            'offers': [{'profile': '7001F113', 'give': [['7002B017', 400]],
                        'receive': [['70000F2D', 5]]}],
        },
    },
    'barterProfiles': {
        '7001F113': {'de': 'Ruf', 'en': 'Reputation', 'fr': 'Réputation'},
        '7001F114': {'de': '', 'en': 'Minor Class Items', 'fr': ''},
    },
    'barterNames': {'7002B017': {'de': 'Zeichen', 'en': 'Mark', 'fr': 'Marque'},
              '7002B018': {'de': 'Medaillon', 'en': 'Medallion', 'fr': 'Médaillon'}},
}


class VendorBarterOfferTest(unittest.TestCase):
    def test_offers_group_by_profile_and_name_the_price(self):
        page = vendor_pages(TAUSCH, 'de', ITEMS, MAPS, app_url, coords, {})['7001F02F']
        self.assertEqual([group['profile'] for group in page['offers']],
                         ['Ruf', ''])
        self.assertEqual(page['offer_total'], 3)
        ruf = page['offers'][0]['rows'][0]
        self.assertEqual(ruf['give'], [{'text': 'Zeichen', 'qty': 400, 'url': None}])
        self.assertEqual(ruf['receive'][0]['name'], 'Starre Drachenschuppe')
        self.assertEqual(ruf['receive'][0]['url'], '/de/gegenstand/70000F2C/')
        self.assertEqual(ruf['receive'][0]['qty'], 5)

    def test_second_price_row_is_kept(self):
        page = vendor_pages(TAUSCH, 'de', ITEMS, MAPS, app_url, coords, {})['7001F02F']
        zweite = page['offers'][1]['rows'][0]
        self.assertEqual([(part['text'], part['qty']) for part in zweite['give']],
                         [('Zeichen', 250), ('Medaillon', 10)])

    def test_pure_barterer_lists_no_sold_goods(self):
        page = vendor_pages(TAUSCH, 'de', ITEMS, MAPS, app_url, coords, {})['7001F02F']
        self.assertEqual(page['items'], [])
        self.assertEqual(page['total'], 0)

    def test_mixed_vendor_keeps_sold_goods_and_offers(self):
        page = vendor_pages(TAUSCH, 'de', ITEMS, MAPS, app_url, coords, {})['70000001']
        self.assertEqual([row['id'] for row in page['items']], ['70000F2C'])
        self.assertEqual(page['total'], 1)
        self.assertEqual(page['offer_total'], 1)

    def test_price_and_profile_names_follow_the_page_language(self):
        page = vendor_pages(TAUSCH, 'fr', ITEMS, MAPS, app_url, coords, {})['7001F02F']
        self.assertEqual(page['offers'][0]['rows'][0]['give'][0]['text'], 'Marque')
        # Profile names never fall back to English.
        self.assertEqual([group['profile'] for group in page['offers']], ['Réputation', ''])

    def test_compact_barter_rows_carry_price_and_list(self):
        page = vendor_pages(TAUSCH, 'de', ITEMS, MAPS, app_url, coords, {})['7001F02F']
        tausch = page['tausch']
        self.assertEqual(tausch['listen'], ['Ruf', ''])
        self.assertEqual(tausch['waren'][0], ['70000F2C', 0, '400 Zeichen', 5])
        self.assertIn(['70000F2D', 1, '250 Zeichen + 10 Medaillon', 1], tausch['waren'])

    def test_both_vendor_counts_in_both_filter_groups(self):
        index = vendor_index(TAUSCH, 'de', MAPS)
        rows = {row['id']: row for row in index['vendors']}
        self.assertEqual(sorted(rows['70000001']['types']), ['barter', 'vendor'])
        self.assertEqual(rows['7001F02F']['types'], ['barter'])
        self.assertEqual(set(index['labels']['type']), {'vendor', 'barter'})

    def test_old_vendor_file_without_offers_keeps_its_goods(self):
        """Barter pages from a file built before the offers must not be empty."""
        alt = {'vendors': {'7001F07E': {
            'id': '7001F07E', 'name': {'de': 'Heilziest Gruber'}, 'type': 'barter',
            'places': [], 'items': ['70000F2C']}}}
        page = vendor_pages(alt, 'de', ITEMS, MAPS, app_url, coords, {})['7001F07E']
        self.assertEqual([row['id'] for row in page['items']], ['70000F2C'])
        self.assertEqual(page['offer_total'], 0)


if __name__ == '__main__':
    unittest.main()
