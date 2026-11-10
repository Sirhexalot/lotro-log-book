"""Optional integration audit of the actually generated PHP set catalogue."""
import json
import os
import unittest
from pathlib import Path

DATA = Path(os.environ.get('LLB_DATA', str(Path.home() / '.cache/llb-php/phpdata')))


def records(folder):
    return {key: value for file in folder.glob('*.json')
            for key, value in json.loads(file.read_text(encoding='utf-8'))['entities'].items()}


@unittest.skipUnless((DATA / 'de/sets-index.json').is_file(), 'Run the PHP set data build first')
class BuiltSetCatalogueTest(unittest.TestCase):
    def test_all_set_pages_and_links(self):
        sitemaps = json.loads((DATA / 'sitemaps.json').read_text(encoding='utf-8'))['sections']
        for lang, segment, item_segment in [('de', 'set', 'gegenstand'), ('en', 'set', 'item'), ('fr', 'ensemble', 'objet')]:
            with self.subTest(lang=lang):
                index = json.loads((DATA / lang / 'sets-index.json').read_text(encoding='utf-8'))
                pages = records(DATA / lang / 'page-set')
                items = set(records(DATA / lang / 'i'))
                self.assertEqual({row['id'] for row in index['sets']}, set(pages))
                urls = set(sitemaps['/%s/%s/sitemap.xml' % (lang, segment)])
                self.assertIn('/%s/%s/' % (lang, segment), urls)
                for sid, page in pages.items():
                    self.assertIn('/%s/%s/%s/' % (lang, segment, sid), urls)
                    self.assertEqual(page['parts'], len(page['members']))
                    self.assertEqual(page['available_parts'], sum(bool(m['card']) for m in page['members']))
                    for member in page['members']:
                        if member['url']:
                            self.assertIn(member['id'], items)
                            self.assertEqual(member['url'], '/%s/%s/%s/' % (lang, item_segment, member['id']))
                            self.assertNotIn('set', member['card'])
                        else:
                            self.assertIsNone(member['card'])
                if '70069B64' in pages:
                    self.assertEqual(len(pages['70069B64']['members']), 8)
                    self.assertEqual([b['pieces'] for b in pages['70069B64']['bonuses']], [2, 4, 6])
                    self.assertNotIn('515–154', json.dumps(pages['70069B64'], ensure_ascii=False))


if __name__ == '__main__':
    unittest.main()
