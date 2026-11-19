"""Vendor locations retain a useful regional link when no map frame fits."""
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from vendor_viewmodel import vendor_pages


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


if __name__ == '__main__':
    unittest.main()
