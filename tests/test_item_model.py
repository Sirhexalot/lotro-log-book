"""Loss-sensitive checks for the shared item model and item detail relations."""
import json
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ITEMS = json.loads((ROOT / 'daten/items.json').read_text(encoding='utf-8'))['items']
DETAILS = json.loads(
    (ROOT / 'daten/gegenstand-details.json').read_text(encoding='utf-8')
)['items']


def search_data(lang='de'):
    text = (ROOT / ('web/gegenstaende-%s.js' % lang)).read_text(encoding='utf-8')
    return json.loads(text[text.index('{'):text.rindex(';')])


class ItemModelTests(unittest.TestCase):
    def test_binding_mode_preserves_client_distinction(self):
        lore = ROOT / Path(
            '/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/'
            'app/data/lore/items.xml'
        )
        self.assertTrue(lore.is_file())
        source = {}
        for entry in ET.parse(lore).getroot().iter('item'):
            if entry.get('key') and entry.get('binding'):
                source['%08X' % (int(entry.get('key')) & 0xffffffff)] = entry.get('binding')
        detail_ids = set(DETAILS)
        self.assertEqual(len(detail_ids & set(source)), 40498)
        self.assertEqual(
            {mode: sum(ITEMS[i].get('bm') == mode for i in detail_ids)
             for mode in ('BIND_ON_ACQUIRE', 'BOUND_TO_ACCOUNT_ON_ACQUIRE', 'BIND_ON_EQUIP')},
            {'BIND_ON_ACQUIRE': 12987, 'BOUND_TO_ACCOUNT_ON_ACQUIRE': 12822,
             'BIND_ON_EQUIP': 14689},
        )
        self.assertNotEqual(ITEMS['70043B7E']['bm'], ITEMS['7001C51E']['bm'])

    def test_recipe_roles_are_not_mixed(self):
        critical = ITEMS['7001C51E']
        self.assertIn({'recipe': '7001C164', 'role': 'critical_result', 'quantity': 1},
                      critical['herstellung'])
        self.assertNotIn('7001C164', critical['zutat'])
        optional = [
            item for item in ITEMS.values()
            if any(row['role'] == 'optional_ingredient' for row in item['verwendung'])
        ]
        self.assertEqual(len(optional), 149)
        self.assertTrue(all(
            all(row['role'] in ('ingredient', 'optional_ingredient')
                for row in item['verwendung'])
            for item in ITEMS.values()
        ))

    def test_filter_page_keeps_same_ids_and_existing_dimensions(self):
        ids = set(ITEMS)
        for lang in ('de', 'en', 'fr'):
            data = search_data(lang)
            self.assertEqual({row[0] for row in data['e']}, ids)
            self.assertEqual(
                data['katKey'],
                ['ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM',
                 'ESSENCE', 'ITEM', 'JEWELLERY'],
            )
            self.assertEqual(len(data['e'][0]), 10)
            self.assertNotIn('binding', data)

    def test_php_item_page_has_separate_where_and_used_for_models(self):
        shard = __import__('hashlib').md5(b'7001C51E').hexdigest()[:2]
        page_file = ROOT / ('phpdata/de/page-i/%s.json' % shard)
        self.assertTrue(page_file.is_file())
        page = json.loads(page_file.read_text(encoding='utf-8'))['entities']['7001C51E']
        self.assertTrue(page['has_where_from'])
        self.assertFalse(page['has_used_for'])
        critical = [entry for group in page['where_groups']
                    for entry in group['entries']
                    if entry.get('role') == 'Kritischer Erfolg']
        self.assertTrue(critical)
        self.assertTrue(critical[0].get('recipe_level'))
        self.assertTrue(critical[0].get('result'))
        self.assertEqual(critical[0]['result']['id'], '7001C51E')

    def test_large_item_source_gets_task_finder_rows(self):
        shard = __import__('hashlib').md5(b'7002E28D').hexdigest()[:2]
        page_file = ROOT / ('phpdata/de/page-i/%s.json' % shard)
        page = json.loads(page_file.read_text(encoding='utf-8'))['entities']['7002E28D']
        self.assertEqual(len(page['task_filter']['q']), 428)

    def test_vendor_sources_are_concrete_and_keep_item_namespace(self):
        # The item export is allowed to grow when a newly discovered source
        # points at an item that was not present in the previous catalogue.
        # The search-data test above is the loss-sensitive check for parity.
        self.assertEqual(len(ITEMS), len(search_data('de')['e']))
        self.assertEqual(sum(bool(item.get('haendler')) for item in ITEMS.values()), 2693)
        vendor = ITEMS['70000D75']['haendler'][0]
        self.assertEqual(vendor['name']['de'], 'Karlo Schwarzhain')
        shard = __import__('hashlib').md5(b'70000D75').hexdigest()[:2]
        page = json.loads(
            (ROOT / ('phpdata/de/page-i/%s.json' % shard)).read_text(encoding='utf-8')
        )['entities']['70000D75']
        groups = {group['label']: group['entries'] for group in page['where_groups']}
        self.assertIn('Händler', groups)
        self.assertEqual(groups['Händler'][0]['text'], 'Karlo Schwarzhain')

    def test_vendor_entity_has_map_and_item_links_in_all_languages(self):
        for lang, name, path in (
            ('de', 'Karlo Schwarzhain', 'haendler'),
            ('en', 'Carlo Blagrove', 'vendor'),
            ('fr', 'Carlo Noirbosquet', 'marchand'),
        ):
            shard = __import__('hashlib').md5(b'70000002').hexdigest()[:2]
            page = json.loads(
                (ROOT / ('phpdata/%s/page-vendor/%s.json' % (lang, shard))).read_text()
            )['entities']['70000002']
            self.assertEqual(page['name'], name)
            self.assertTrue(page['places'][0]['map_url'])
            self.assertTrue(page['items'][0]['url'].startswith('/%s/gegenstand/' % lang)
                            if lang == 'de' else page['items'][0]['url'].startswith(
                                '/%s/%s/' % (lang, 'item' if lang == 'en' else 'objet')))


if __name__ == '__main__':
    unittest.main()
