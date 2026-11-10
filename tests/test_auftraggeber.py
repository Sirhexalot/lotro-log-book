"""Generator rules for quest givers: sources, names, places, no inventions."""
import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

import build_auftraggeber as giver


class FakeMaps:
    """Only what build() needs: a point → map id lookup and a map catalogue."""

    def __init__(self, mapping):
        self.mapping = list(mapping.items())

    def attribute(self, lat, lon, region):
        for (area, mlat, mlon), ident in self.mapping:
            if area == region and abs(mlat - lat) < 0.05 and abs(mlon - lon) < 0.05:
                return ident
        return None


class GiverBuildTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.lore = self.root / 'lore'
        for lang in giver.LANGS:
            (self.lore / 'labels' / lang).mkdir(parents=True)
        self.raw = self.root / 'raw.jsonl'
        self.positions = self.root / 'positions.jsonl'
        self.full = self.root / 'quests.json'
        self.old = (giver.LORE, giver.NPC_RAW, giver.POSITIONS, giver.FULL_QUESTS)
        giver.LORE, giver.NPC_RAW = self.lore, self.raw
        giver.POSITIONS, giver.FULL_QUESTS = self.positions, self.full

    def tearDown(self):
        giver.LORE, giver.NPC_RAW, giver.POSITIONS, giver.FULL_QUESTS = self.old
        self.tmp.cleanup()

    def write(self, quests, npcs, names, raw=(), positions=(), full=()):
        (self.lore / 'quests.xml').write_text(
            '<quests>' + ''.join(quests) + '</quests>', encoding='utf-8')
        (self.lore / 'NPCs.xml').write_text(
            '<NPCs>' + ''.join(npcs) + '</NPCs>', encoding='utf-8')
        for lang in giver.LANGS:
            rows = ''.join('<row key="%s" value="%s"/>' % (key, value)
                           for key, value in names[lang].items())
            (self.lore / 'labels' / lang / 'npc.xml').write_text(
                '<labels>%s</labels>' % rows, encoding='utf-8')
        self.raw.write_text(''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in raw),
                            encoding='utf-8')
        self.positions.write_text(
            ''.join(json.dumps(row) + '\n' for row in positions), encoding='utf-8')
        self.full.write_text(json.dumps(list(full)), encoding='utf-8')

    def quest(self, decimal, bestowers, text='key:1:9'):
        rows = ''.join('<bestower npcId="%s" text="%s"/>' % (npc, text) for npc in bestowers)
        return '<quest id="%d" name="Q"><map mapId="1"/>%s</quest>' % (decimal, rows)

    def names(self, **extra):
        base = {'de': {}, 'en': {}, 'fr': {}}
        for lang, rows in extra.items():
            base[lang].update({str(key): value for key, value in rows.items()})
        return base

    def test_names_must_exist_in_all_three_languages(self):
        self.write([self.quest(1879048195, [1879048194])],
                   ['<NPC id="1879048194" name="Carlo" gender="MALE"/>'],
                   self.names(de={1879048194: 'Karlo'}, en={1879048194: 'Carlo'}))
        source, audit = giver.build({'70000003'}, FakeMaps({}), set(), {})
        self.assertEqual(source['givers'], {})
        self.assertEqual(audit['counts']['without_name'], 1)
        self.assertEqual(audit['problems'][0]['kind'], 'missing_name')

    def test_raw_name_is_the_fallback_for_unlabelled_entities(self):
        relative = [{'did': '70000002', 'layer': 0, 'region': 1, 'instance': 0,
                     'latitude': -34.26664, 'longitude': -75.14015}]
        self.write([self.quest(1879048195, [1879048194])],
                   ['<NPC id="1879048194" name="Carlo" gender="MALE"/>'],
                   self.names(),
                   raw=[{'id': '70000002', 'class_index': 796, 'properties': {
                       'Name': {'texts': {'de': 'Alter Brief', 'en': 'Old Letter', 'fr': 'Vieille lettre'}},
                       'Description': {'texts': {'de': 'Ein Brief.', 'en': 'A letter.', 'fr': 'Une lettre.'}}}}],
                   positions=relative)
        source, _ = giver.build({'70000003'}, FakeMaps({(1, -34.27, -75.14): 268437678}),
                                {268437678}, {})
        row = source['givers']['70000002']
        self.assertEqual(row['name']['de'], 'Alter Brief')
        self.assertEqual(row['kind'], 'object')
        self.assertEqual(row['description']['en'], 'A letter.')
        self.assertEqual(row['places'][0]['map'], 268437678)

    def test_every_bestower_is_kept_and_the_first_one_owns_the_quest_point(self):
        self.write([self.quest(1879048195, [1879048194, 1879048197])],
                   ['<NPC id="1879048194" name="Carlo" gender="MALE"/>',
                    '<NPC id="1879048197" name="Robin" gender="MALE"/>'],
                   self.names(de={1879048194: 'Karlo', 1879048197: 'Rudolf'},
                              en={1879048194: 'Carlo', 1879048197: 'Robin'},
                              fr={1879048194: 'Carlo', 1879048197: 'Robin'}),
                   positions=[{'did': '70000002', 'region': 1, 'instance': 0,
                               'latitude': -34.26664, 'longitude': -75.14015}])
        source, _ = giver.build({'70000003'}, FakeMaps({(1, -34.27, -75.14): 268437678}),
                                {268437678}, {'70000003': [268437678, -34.26664, -75.14015]})
        self.assertEqual(source['givers']['70000002']['quests'], ['70000003'])
        self.assertEqual(source['givers']['70000005']['quests'], ['70000003'])
        self.assertEqual(source['quest_giver'], {'70000003': '70000002'})
        self.assertEqual(source['givers']['70000002']['places'][0]['quest'], '70000003')
        self.assertIsNone(source['givers']['70000005']['places'][0]['quest']
                          if source['givers']['70000005']['places'] else None)

    def test_level_range_names_are_technical_and_stay_out(self):
        self.write([self.quest(1879048195, [1879048194])],
                   ['<NPC id="1879048194" name="Board" gender="MALE"/>'],
                   self.names(de={1879048194: '21-30 Aufgabenbrett'},
                              en={1879048194: '21-30 Board'},
                              fr={1879048194: '21-30 Tableau'}))
        source, audit = giver.build({'70000003'}, FakeMaps({}), set(), {})
        self.assertEqual(source['givers'], {})
        self.assertEqual(audit['counts']['level_range_bestower'], 1)

    def test_positions_are_clustered_and_unknown_maps_dropped(self):
        self.write([self.quest(1879048195, [1879048194])],
                   ['<NPC id="1879048194" name="Carlo" gender="MALE"/>'],
                   self.names(de={1879048194: 'Karlo'}, en={1879048194: 'Carlo'},
                              fr={1879048194: 'Carlo'}),
                   positions=[{'did': '70000002', 'region': 1, 'instance': 0,
                               'latitude': -34.20, 'longitude': -75.10},
                              {'did': '70000002', 'region': 1, 'instance': 0,
                               'latitude': -34.21, 'longitude': -75.11},
                              {'did': '70000002', 'region': 2, 'instance': 0,
                               'latitude': 10.0, 'longitude': 20.0}])
        fake = FakeMaps({(1, -34.2, -75.1): 268437678})
        source, audit = giver.build({'70000003'}, fake, {268437678}, {})
        places = source['givers']['70000002']['places']
        self.assertEqual(len(places), 2, 'nearby points are one place')
        self.assertEqual(places[0]['map'], 268437678)
        self.assertIsNone(places[1]['map'])
        self.assertEqual(audit['counts']['positions_without_map'], 1)

    def test_search_rows_use_the_quest_zone_and_no_invented_context(self):
        self.write([self.quest(1879048195, [1879048194])],
                   ['<NPC id="1879048194" name="Carlo" gender="MALE"/>'],
                   self.names(de={1879048194: 'Karlo'}, en={1879048194: 'Carlo'},
                              fr={1879048194: 'Carlo'}))
        source, _ = giver.build({'70000003'}, FakeMaps({}), set(), {})
        rows = giver.search_rows(source['givers'], {'70000003': {'z': 'Das Auenland', 'l': '7'}}, 'de')
        self.assertEqual(rows['rows'], [['70000002', 'Karlo', '', 'Das Auenland', 7]])

    def test_kind_comes_from_the_entity_class_and_inanimate_flag(self):
        self.assertEqual(giver.kind_of({'class_index': 1724}), 'person')
        self.assertEqual(giver.kind_of({'class_index': 1724, 'properties': {'NPC_IsInanimate': 1}}), 'object')
        self.assertEqual(giver.kind_of({'class_index': 796}), 'object')
        self.assertEqual(giver.kind_of({}), 'unknown')

    def test_clean_rejects_export_templates(self):
        self.assertEqual(giver.clean('Grüße \\qWanderer\\q', 'de'), 'Grüße „Wanderer“')
        self.assertEqual(giver.clean('Effect %s', 'de'), '')
        self.assertEqual(giver.clean('${PLAYERNAME:x}', 'de'), '')


class IdentifierTest(unittest.TestCase):
    def test_invalid_ids_fail(self):
        for value in (0, -1, 0x1_0000_0000):
            with self.assertRaises(ValueError):
                giver.identifier(value)
        self.assertEqual(giver.identifier(1879048194), '70000002')


if __name__ == '__main__':
    unittest.main()
