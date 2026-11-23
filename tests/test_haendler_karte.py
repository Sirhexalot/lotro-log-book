"""Vendor map points and the names of the rooms they stand in."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import build_haendler_karte as karte
from zonen import enthaelt, ortsname, pin, zuschnitt_rahmen


class VendorMapRowsTest(unittest.TestCase):
    def test_every_place_becomes_a_point_of_its_map(self):
        daten = {'vendors': {
            '70000001': {
                'name': {'de': 'Händler A', 'en': 'Vendor A', 'fr': 'Marchand A'},
                'type': 'vendor',
                'places': [{'map': 268437653, 'lat': -31.0, 'lon': -52.0}],
            },
            '70000002': {
                'name': {'de': 'Tauschhändler B', 'en': 'Barterer B', 'fr': 'Trogueur B'},
                'type': 'barter',
                'places': [{'map': 268437653, 'lat': -32.0, 'lon': -53.0},
                           {'map': 268437716, 'lat': -30.5, 'lon': -51.5}],
            },
        }}
        karten = karte.rows(daten, 'de')
        self.assertEqual(sorted(karten), ['268437653', '268437716'])
        self.assertEqual(len(karten['268437653']), 2)
        self.assertEqual(karten['268437653'][0][0], '70000001')  # sortiert nach Name
        self.assertEqual([row[4] for row in karten['268437653']], ['v', 'b'])
        self.assertEqual(karten['268437716'][0][2:4], [-30.5, -51.5])

    def test_interior_places_stay_out(self):
        daten = {'vendors': {'7003DFFE': {
            'name': {'de': 'Squidtank'},
            'type': 'both',
            'places': [{'map': None, 'lat': -1.17, 'lon': 50.70,
                        'ort': {'de': 'Gasthaus „Zum Wachsamen Auge“'}}],
        }}}
        self.assertEqual(karte.rows(daten, 'de'), {})

    def test_same_place_twice_is_one_point(self):
        stelle = {'map': 268437653, 'lat': -31.004, 'lon': -52.001}
        daten = {'vendors': {'70000001': {
            'name': {'de': 'Händler A'}, 'type': 'vendor',
            'places': [stelle, dict(stelle)],
        }}}
        self.assertEqual(len(karte.rows(daten, 'de')['268437653']), 1)

    def test_name_follows_the_language_and_falls_back_to_english(self):
        daten = {'vendors': {'70000001': {
            'name': {'de': '', 'en': 'Vendor A'},
            'type': 'vendor', 'places': [{'map': 1, 'lat': 1.0, 'lon': 2.0}],
        }}}
        self.assertEqual(karte.rows(daten, 'de')['1'][0][1], 'Vendor A')


class OrtsnameTest(unittest.TestCase):
    def test_dungeon_subtitle_is_dropped(self):
        self.assertEqual(
            ortsname('Dâr Lajad\n<>The Meeting-hall', 'de').split('\n')[0],
            ortsname('Dâr Lajad', 'de'))
        self.assertIn('Dâr Lajad', ortsname('Dâr Lajad\n<>The Meeting-hall', 'de'))

    def test_client_quotes_become_language_typography(self):
        self.assertEqual(ortsname('Gasthaus \\qZum Wachsamen Auge\\q', 'de'),
                         'Gasthaus „Zum Wachsamen Auge“')

    def test_placeholder_names_name_nothing(self):
        for name in ('Unexplored Territory', 'Unerforschtes Gebiet',
                     'Territoire inexploré', 'TBD - HITHAEGLIR CENTRAL NORTH',
                     'TBD'):
            with self.subTest(name=name):
                self.assertEqual(ortsname(name, 'de'), '')


class InnenkarteTest(unittest.TestCase):
    """Room picture and pin: the crop must move the frame, not the position."""

    RAHMEN = {'map': 1, 'bild': '1.png', 'west': 0.0, 'east': 100.0,
              'south': 0.0, 'north': 100.0}

    def test_pin_uses_the_whole_frame(self):
        self.assertEqual(pin(self.RAHMEN, 50.0, 25.0), (25.0, 50.0))
        self.assertEqual(pin(self.RAHMEN, 100.0, 100.0), (100.0, 0.0))

    def test_pin_of_a_cropped_picture_matches_the_cut_out(self):
        # The left half and the lower quarter of the picture were cut away.
        geschnitten = dict(self.RAHMEN, **zuschnitt_rahmen(
            self.RAHMEN, [200, 200], [0, 0, 100, 150]))
        self.assertEqual(geschnitten['west'], 0.0)
        self.assertEqual(geschnitten['east'], 50.0)
        self.assertEqual(geschnitten['north'], 100.0)
        self.assertEqual(geschnitten['south'], 25.0)
        self.assertEqual(pin(geschnitten, 62.5, 25.0), (50.0, 50.0))

    def test_position_outside_the_room_is_not_inside(self):
        self.assertTrue(enthaelt(self.RAHMEN, 50.0, 50.0))
        self.assertFalse(enthaelt(self.RAHMEN, 101.0, 50.0))


if __name__ == '__main__':
    unittest.main()
