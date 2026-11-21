"""The landmark generator: where a position comes from and when it gets a map.

Caves and interiors live on content layers of the same coordinate space. Their
points are used, but a pin is only placed when one map holds all of them; a
continent overview alone is no answer. These checks use small synthetic maps so
they do not depend on the client export.
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import build_landmarken as generator  # noqa: E402


def karte(idx: int, name: str, tier: int, west: float, south: float,
          east: float, north: float, region: int = 1) -> dict:
    return {'idx': idx, 'name': name, 'tier': tier, 'region': region,
            'west': west, 'south': south, 'east': east, 'north': north,
            'bounds': True}


def punkt(lat: float, lon: float, region: int = 1) -> dict:
    return {'latitude': lat, 'longitude': lon, 'region': region}


class GemeinsameKarteTest(unittest.TestCase):
    def setUp(self):
        self.gruppen = {1: [
            karte(100, 'Eriador', 1, -50, -50, 50, 50),
            karte(200, 'Nord', 2, 0, 0, 50, 50),
            karte(300, 'Süd', 2, -50, -50, 0, 0),
        ]}

    def test_the_shared_deep_map_wins(self):
        karte_ = generator.gemeinsame_karte(
            self.gruppen, [punkt(10, 10), punkt(20, 20)])
        self.assertEqual(karte_['idx'], 200)

    def test_only_the_continent_overview_is_no_map(self):
        self.assertIsNone(generator.gemeinsame_karte(
            self.gruppen, [punkt(10, 10), punkt(-10, -10)]))

    def test_two_equal_deep_maps_stay_open(self):
        # Both children hold this point, so neither is the more detailed one.
        self.assertIsNone(generator.gemeinsame_karte(
            self.gruppen, [punkt(0, 0)]))

    def test_one_point_outside_every_map_blocks_the_pin(self):
        self.assertIsNone(generator.gemeinsame_karte(
            self.gruppen, [punkt(10, 10), punkt(80, 80)]))

    def test_points_of_another_region_are_not_used(self):
        self.assertIsNone(generator.gemeinsame_karte(
            self.gruppen, [punkt(10, 10), punkt(10, 10, region=9)]))


class PositionenTest(unittest.TestCase):
    def lade(self, zeilen: list[dict]):
        with tempfile.TemporaryDirectory() as ordner:
            pfad = Path(ordner) / 'positions.jsonl'
            pfad.write_text('\n'.join(json.dumps(z) for z in zeilen) + '\n',
                            encoding='utf-8')
            return generator.lade_positionen(pfad)

    def test_world_layer_stays_first_choice(self):
        welt, alle = self.lade([
            {'did': 'A', 'layer': 2, 'region': 1, 'latitude': 1, 'longitude': 1},
            {'did': 'A', 'layer': 0, 'region': 1, 'latitude': 2, 'longitude': 2},
        ])
        self.assertEqual(welt['A']['latitude'], 2)
        self.assertEqual(len(alle['A']), 2)

    def test_content_layer_point_survives_when_the_world_layer_has_none(self):
        welt, alle = self.lade([
            {'did': 'B', 'layer': 7, 'region': 1, 'latitude': 3, 'longitude': 4},
        ])
        self.assertNotIn('B', welt)
        self.assertEqual(alle['B'][0]['latitude'], 3)

    def test_instance_copies_are_dropped(self):
        welt, alle = self.lade([
            {'did': 'C', 'layer': 1, 'region': 1, 'instance': 5,
             'latitude': 3, 'longitude': 4},
        ])
        self.assertNotIn('C', welt)
        self.assertNotIn('C', alle)


if __name__ == '__main__':
    unittest.main()
