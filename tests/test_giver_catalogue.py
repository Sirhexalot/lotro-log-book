"""Optional audit of the built quest-giver catalogue (needs the PHP data build)."""
import json
import os
import unittest
from pathlib import Path

DATA = Path(os.environ.get('LLB_DATA', str(Path.home() / '.cache/llb-php/phpdata')))
LANGS = [('de', 'auftraggeber', 'aufgabe'), ('en', 'quest-giver', 'quest'),
         ('fr', 'donneur-de-quete', 'quete')]


def records(folder):
    rows = {}
    for file in folder.glob('*.json'):
        rows.update(json.loads(file.read_text(encoding='utf-8'))['entities'])
    return rows


@unittest.skipUnless((DATA / 'de/givers-index.json').is_file(), 'Run the PHP data build first')
class BuiltGiverCatalogueTest(unittest.TestCase):
    def test_index_pages_and_links_agree(self):
        sitemaps = json.loads((DATA / 'sitemaps.json').read_text(encoding='utf-8'))['sections']
        for lang, segment, quest_segment in LANGS:
            with self.subTest(lang=lang):
                index = json.loads((DATA / lang / 'givers-index.json').read_text(encoding='utf-8'))
                pages = records(DATA / lang / 'page-giver')
                quests = set(records(DATA / lang / 'q'))
                self.assertEqual({row['id'] for row in index['givers']}, set(pages))
                urls = set(sitemaps['/%s/%s/sitemap.xml' % (lang, segment)])
                self.assertIn('/%s/%s/' % (lang, segment), urls)
                for row in index['givers']:
                    self.assertTrue(row['name'].strip())
                    for marker in ('key:', '${', '%s'):
                        self.assertNotIn(marker, row['name'])
                    self.assertEqual(row['count'], len(row['quests']))
                    for ident, level, mask in row['quests']:
                        self.assertIn(ident, quests)
                    self.assertIn('/%s/%s/%s/' % (lang, segment, row['id']), urls)
                for entity, page in pages.items():
                    self.assertEqual(page['total'], len(page['quests']))
                    for quest in page['quests']:
                        self.assertEqual(quest['url'], '/%s/%s/%s/' % (lang, quest_segment, quest['id']))
                        self.assertIn(quest['id'], quests)
                        for marker in ('key:', '${'):
                            self.assertNotIn(marker, quest['name'])
                    for place in page['places']:
                        self.assertTrue(place['coords'])
                        if place['map_url']:
                            self.assertTrue(place['map_url'].startswith('/%s/' % lang))

    def test_quest_page_links_to_a_giver_that_lists_it(self):
        for lang, segment, _ in LANGS:
            with self.subTest(lang=lang):
                pages = records(DATA / lang / 'page-giver')
                listed = {q['id'] for page in pages.values() for q in page['quests']}
                quests = records(DATA / lang / 'q')
                linked = [row for row in quests.values() if row.get('gi')]
                self.assertTrue(linked, 'no quest page links to a giver')
                for row in linked:
                    self.assertIn(row['gi'], pages)
                    self.assertIn(row['i'], listed)
                    self.assertIn(row['i'], [quest['id'] for quest in pages[row['gi']]['quests']],
                                  'quest links to a giver that does not list it')

    def test_givers_have_places_or_say_nothing_about_them(self):
        pages = records(DATA / 'de/page-giver')
        without = [page for page in pages.values() if not page['places']]
        self.assertLess(len(without), len(pages) * 0.1,
                        'most givers should have a recorded place')
        for page in pages.values():
            for place in page['places']:
                self.assertTrue(place['coords'])
                self.assertTrue(place['travel_url'].startswith('/de/'))
                if place['image']:
                    self.assertIsNotNone(place['map_url'],
                                         'a map preview without a way to the map')


if __name__ == '__main__':
    unittest.main()
