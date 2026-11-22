"""Loss-sensitive checks for the shared item model and item detail relations."""
import json
import os
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

from instanzbeute_items import lade_beute, truhen_ids


ROOT = Path(__file__).resolve().parents[1]
# Der gebaute Datenstand, nicht ein alter Ordner im Arbeitsbaum.
DATEN = Path(os.environ.get('LLB_DATA') or Path.home() / '.cache' / 'llb-php' / 'phpdata')
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
        entry = next(row for row in critical['herstellung']
                     if row['recipe'] == '7001C164' and row['role'] == 'critical_result')
        self.assertEqual(entry['quantity'], 1)
        self.assertEqual(entry.get('result'), '7001C51E')
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
        chest_ids = truhen_ids(lade_beute())
        for lang in ('de', 'en', 'fr'):
            data = search_data(lang)
            indexed_ids = {row[0] for row in data['e']}
            self.assertEqual(indexed_ids - ids, chest_ids - ids)
            self.assertEqual(ids - indexed_ids, set())
            self.assertEqual(set(data['instanceChest']), chest_ids)
            self.assertEqual(
                data['katKey'],
                ['ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM',
                 'ESSENCE', 'ITEM', 'JEWELLERY'],
            )
            # id, name, icon, category, quality, slot, type, level, class,
            # genre, required class/race, armour, weapon, min level, extra condition
            self.assertEqual(len(data['e'][0]), 16)
            self.assertNotIn('binding', data)

    def test_php_item_page_has_separate_where_and_used_for_models(self):
        shard = __import__('hashlib').md5(b'7001C51E').hexdigest()[:2]
        page_file = DATEN / ('de/page-i/%s.json' % shard)
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
        page_file = DATEN / ('de/page-i/%s.json' % shard)
        page = json.loads(page_file.read_text(encoding='utf-8'))['entities']['7002E28D']
        self.assertEqual(len(page['task_filter']['q']), 428)

    def test_vendor_sources_are_concrete_and_keep_item_namespace(self):
        # The item export is allowed to grow when a newly discovered source
        # points at an item that was not present in the previous catalogue.
        # The search-data test above is the loss-sensitive check for parity.
        self.assertEqual(len(search_data('de')['e']) - len(ITEMS),
                         len(truhen_ids(lade_beute()) - set(ITEMS)))
        self.assertEqual(sum(bool(item.get('haendler')) for item in ITEMS.values()), 2693)
        vendor = ITEMS['70000D75']['haendler'][0]
        self.assertEqual(vendor['name']['de'], 'Karlo Schwarzhain')
        shard = __import__('hashlib').md5(b'70000D75').hexdigest()[:2]
        page = json.loads(
            (DATEN / ('de/page-i/%s.json' % shard)).read_text(encoding='utf-8')
        )['entities']['70000D75']
        groups = {group['label']: group['entries'] for group in page['where_groups']}
        self.assertIn('Händler', groups)
        self.assertEqual(groups['Händler'][0]['text'], 'Karlo Schwarzhain')


    def test_barterers_have_a_page_and_the_recipe_links_them(self):
        """Pure barterers live in barters.xml, not in the vendor export.

        The barter source belongs to the recipe, not to the crafted item.
        """
        ident = '7001F07E'
        for lang, name in (('de', 'Heilziest Gruber'), ('en', 'Betony Diggins'),
                           ('fr', 'Trèfle Picquet')):
            shard = __import__('hashlib').md5(ident.encode()).hexdigest()[:2]
            page = json.loads((DATEN / ('%s/page-vendor/%s.json'
                                       % (lang, shard))).read_text(encoding='utf-8'))[
                'entities'][ident]
            self.assertEqual(page['type'], 'barter')
            self.assertEqual(page['name'], name)
            self.assertTrue(page['items'])
            self.assertEqual(page['id'], ident)

        item = '70001B7E'
        shard = __import__('hashlib').md5(item.encode()).hexdigest()[:2]
        page = json.loads((DATEN / ('de/page-i/%s.json' % shard)).read_text(
            encoding='utf-8'))['entities'][item]
        self.assertFalse(any(group.get('barter_filter') for group in page['where_groups']))
        self.assertTrue(any(group['label'] == 'Herstellung' for group in page['where_groups']))

        recipe_id = '70021427'
        shard = __import__('hashlib').md5(recipe_id.encode()).hexdigest()[:2]
        recipe = json.loads((DATEN / ('de/page-recipe/%s.json' % shard)).read_text(
            encoding='utf-8'))['entities'][recipe_id]
        sources = {source['id']: source for source in recipe['sources']}
        self.assertIn('7001F07E', sources)
        self.assertEqual(sources['7001F07E']['url'], '/de/haendler/7001F07E/')
        self.assertEqual(sources['7001F07E']['label'], 'Tauschhändler')
        self.assertTrue(all('/de/haendler/' in source['url']
                            for source in recipe['sources'] if source['url']))

    def test_barter_vendor_page_names_its_goods(self):
        source = (ROOT / 'php/src/Vendors.php').read_text(encoding='utf-8')
        for needle in ("'barter_items' => 'Tauschgegenstände'",
                       "'barter_items' => 'Barter goods'",
                       "'barter_items' => 'Objets de troc'",
                       "'type_filter_barter'"):
            self.assertIn(needle, source)
        template = (ROOT / 'php/templates/vendors/detail.twig').read_text(encoding='utf-8')
        self.assertIn('{{ vendor.items_label }}', template)

    def test_recipe_variants_link_to_the_recipe_and_its_sources(self):
        """A recipe can produce several named results; all belong to it.

        The recipe export only carried the first result. The plain
        "Crossbow of the Vales" (`70052A0F`) therefore had no source while its
        sibling `70052A0A` did.
        """
        recipe_id = '700529FC'
        for ident in ('70052A0F', '70052A13'):
            item = ITEMS[ident]
            entries = [entry for entry in item.get('herstellung') or []
                       if entry.get('recipe') == recipe_id]
            self.assertEqual({entry['role'] for entry in entries},
                             {'regular_result', 'critical_result'})
            self.assertTrue(all(entry.get('result') == ident for entry in entries))
        self.assertEqual(ITEMS['70052A0A'].get('tausch'), [])

        import hashlib
        recipe_shard = hashlib.md5(recipe_id.encode()).hexdigest()[:2]
        recipe = json.loads((DATEN / 'de' / 'page-recipe' / (recipe_shard + '.json')).read_text(
            encoding='utf-8'))['entities'][recipe_id]
        result_ids = {entry['id'] for entry in recipe['results']}
        self.assertTrue({'70052A0A', '700529EE', '70052A0F', '70052A13'} <= result_ids)
        sources = {entry['id']: entry for entry in recipe['sources']}
        self.assertEqual(sources['70020870']['url'], '/de/haendler/70020870/')
        self.assertEqual(sources['70020870']['label'], 'Händler')
        self.assertEqual(sources['70053663']['url'], '/de/haendler/70053663/')
        self.assertEqual(sources['70053663']['label'], 'Tauschhändler')

        item_shard = hashlib.md5(b'70052A0F').hexdigest()[:2]
        page = json.loads((DATEN / 'de' / 'page-i' / (item_shard + '.json')).read_text(
            encoding='utf-8'))['entities']['70052A0F']
        groups = {group['label']: group for group in page['where_groups']}
        self.assertIn('Herstellung', groups)
        self.assertEqual(len(groups['Herstellung']['entries']), 2)
        self.assertNotIn('Tauschhändler', groups)

    def test_vendor_entity_has_map_and_item_links_in_all_languages(self):
        for lang, name, path in (
            ('de', 'Karlo Schwarzhain', 'haendler'),
            ('en', 'Carlo Blagrove', 'vendor'),
            ('fr', 'Carlo Noirbosquet', 'marchand'),
        ):
            shard = __import__('hashlib').md5(b'70000002').hexdigest()[:2]
            page = json.loads(
                (DATEN / ('%s/page-vendor/%s.json' % (lang, shard))).read_text()
            )['entities']['70000002']
            self.assertEqual(page['name'], name)
            self.assertTrue(page['places'][0]['map_url'])
            self.assertTrue(page['items'][0]['url'].startswith('/%s/gegenstand/' % lang)
                            if lang == 'de' else page['items'][0]['url'].startswith(
                                '/%s/%s/' % (lang, 'item' if lang == 'en' else 'objet')))


if __name__ == '__main__':
    unittest.main()
