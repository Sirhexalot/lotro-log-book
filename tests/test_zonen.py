"""The client's landblocks resolve a position to its room or world area."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import zonen


def vorhanden() -> bool:
    return zonen.landdatei() is not None and (zonen.LORE / 'geoAreas.xml').is_file()


@unittest.skipUnless(vorhanden(), 'Client-Daten (landblocks.xml) fehlen lokal')
class LandblockTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bloecke = zonen.bloecke()
        cls.zonen = zonen.zonen()

    def test_every_block_has_an_area_or_a_dungeon(self):
        ohne = [k for k, b in self.bloecke.items() if not b['area'] and not b['dungeon']]
        self.assertEqual(ohne, [], 'Blöcke ohne Zone: %d' % len(ohne))

    def test_tavern_block_names_the_room_without_a_dungeon(self):
        block = self.bloecke.get((1, 247, 154))
        self.assertIsNotNone(block)
        area, dungeon = zonen.ort(block, 7)
        self.assertEqual(dungeon, 0)
        eintrag = self.zonen.get(area)
        self.assertIsNotNone(eintrag)
        self.assertEqual(eintrag['name']['de'], 'Gasthaus „Zum Wachsamen Auge“')
        self.assertEqual([teil['name']['de'] for teil in eintrag['kette']],
                         ['Eriador', 'Breeland'])

    def test_cell_dungeon_beats_the_block(self):
        block = {'area': 1, 'dungeon': 2, 'zellen': {7: 3}}
        self.assertEqual(zonen.ort(block, 7), (1, 3))
        self.assertEqual(zonen.ort(block, 8), (1, 2))
        self.assertEqual(zonen.ort(None, 7), (0, 0))

    def test_unknown_position_stays_out(self):
        self.assertEqual(zonen.orte([(1, 999, 999, 999, 0)]), {})

    def test_area_chain_carries_the_catalogue_map(self):
        eintrag = self.zonen[1879140598]
        # Eriador (tier 1) and Breeland (tier 2) are catalogue pages.
        self.assertEqual([teil.get('map') for teil in eintrag['kette']],
                         [268437557, 268437653])


@unittest.skipUnless((ROOT / 'daten' / 'karten.json').is_file(), 'Kartenindex fehlt')
class KartenAbgleichTest(unittest.TestCase):
    def test_english_area_name_maps_to_its_map(self):
        ids = zonen.karten_ids()
        self.assertEqual(ids.get((2, zonen.falten('Bree-land'))), 268437653)
        self.assertEqual(ids.get((1, zonen.falten('Eriador'))), 268437557)

    def test_unknown_name_has_no_map(self):
        self.assertIsNone(zonen.karten_ids().get((2, zonen.falten('Nirgendwo'))))

    def test_names_fold_case_accents_and_punctuation(self):
        self.assertEqual(zonen.falten('Bree-land'), zonen.falten('Bree land'))
        self.assertEqual(zonen.falten('Anórien'), 'anorien')

    def test_area_name_with_article_resolves_to_map_and_real_map_tier(self):
        info = zonen.karten_infos()
        self.assertEqual(info.get((2, zonen.falten('The North Downs'))),
                         (268437634, 2))

    def test_area_name_can_resolve_to_a_map_with_another_tier(self):
        info = zonen.karten_infos()
        self.assertEqual(info.get((2, zonen.falten('Mordor'))),
                         (268453620, 1))


if __name__ == '__main__':
    unittest.main()
