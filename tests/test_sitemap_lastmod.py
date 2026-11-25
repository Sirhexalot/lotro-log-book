import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from tools.sitemap_lastmod import (
    apply_lastmod,
    fingerprint,
    load_state,
    save_state,
)
from tools.build_php_data import write_sitemaps
from tools.php_viewmodel import APP_SEGMENTS


class SitemapLastmodTest(unittest.TestCase):
    def setUp(self):
        self.sections = {'/de/quest/sitemap.xml': [
            '/de/quest/70000001/', '/de/quest/70000002/']}
        self.fingerprints = {
            url: fingerprint({'name': url.rsplit('/', 2)[-2]})
            for url in self.sections['/de/quest/sitemap.xml']
        }
        self.initial = {'schema': 1, 'initialized': False, 'urls': {}}

    def test_first_build_uses_release_anchor_for_existing_and_new_urls(self):
        dates, state = apply_lastmod(
            self.sections, self.fingerprints, self.initial,
            '2026-11-25', '2026-11-26')
        self.assertEqual(dates['/de/quest/sitemap.xml'],
                         ['2026-11-25', '2026-11-25'])
        self.assertTrue(state['initialized'])

    def test_unchanged_and_changed_pages_keep_or_advance_dates(self):
        _, first = apply_lastmod(
            self.sections, self.fingerprints, self.initial,
            '2026-11-25', '2026-11-26')
        changed_url = self.sections['/de/quest/sitemap.xml'][1]
        updated = dict(self.fingerprints)
        updated[changed_url] = fingerprint({'name': 'changed'})
        dates, state = apply_lastmod(
            self.sections, updated, first, '2026-11-25', '2026-11-27')
        self.assertEqual(dates['/de/quest/sitemap.xml'],
                         ['2026-11-25', '2026-11-27'])
        self.assertEqual(state['urls'][changed_url][0], updated[changed_url])

    def test_new_urls_get_today_and_removed_urls_leave_state(self):
        _, first = apply_lastmod(
            self.sections, self.fingerprints, self.initial,
            '2026-11-25', '2026-11-26')
        new_url = '/de/quest/70000003/'
        urls = self.sections['/de/quest/sitemap.xml'][:1] + [new_url]
        hashes = {urls[0]: self.fingerprints[urls[0]],
                  new_url: fingerprint({'name': 'new'})}
        dates, state = apply_lastmod(
            {'/de/quest/sitemap.xml': urls}, hashes, first,
            '2026-11-25', '2026-11-27')
        self.assertEqual(dates['/de/quest/sitemap.xml'],
                         ['2026-11-25', '2026-11-27'])
        self.assertNotIn(self.sections['/de/quest/sitemap.xml'][1], state['urls'])

    def test_manual_reset_updates_all_dates(self):
        _, first = apply_lastmod(
            self.sections, self.fingerprints, self.initial,
            '2026-11-25', '2026-11-26')
        dates, _ = apply_lastmod(
            self.sections, self.fingerprints, first, '2026-11-25',
            '2026-11-27', reset_date='2026-11-20')
        self.assertEqual(dates['/de/quest/sitemap.xml'],
                         ['2026-11-20', '2026-11-20'])

    def test_previous_sitemap_dates_recover_when_hash_state_is_missing(self):
        previous = {'/de/quest/sitemap.xml': [
            '/de/quest/70000001/', '/de/quest/70000002/']}
        lastmod = {'/de/quest/sitemap.xml': ['2026-11-20', '2026-11-21']}
        dates, _ = apply_lastmod(
            self.sections, self.fingerprints, self.initial,
            '2026-11-25', '2026-11-26',
            previous_lastmod=lastmod, previous_sections=previous)
        self.assertEqual(dates, lastmod)

    def test_compressed_state_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'state.json.gz'
            _, state = apply_lastmod(
                self.sections, self.fingerprints, self.initial,
                '2026-11-25', '2026-11-26')
            save_state(path, state)
            self.assertEqual(load_state(path), state)
            self.assertLess(path.stat().st_size, 1000)

    def test_sitemaps_json_keeps_dates_parallel_including_application_urls(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            application_urls = sorted({
                '/' + lang + '/' + (segment + '/' if segment else '')
                for lang, pages in APP_SEGMENTS.items()
                for page, segment in pages.items()
                if page not in ('suche', 'gegenstandssuche')
            })
            sections = {'/de/quest/sitemap.xml': ['/de/quest/70000001/']}
            sections['/sitemap-seiten.xml'] = application_urls
            dates = {name: ['2026-11-25'] * len(urls)
                     for name, urls in sections.items()}
            write_sitemaps(target, sections, dates)
            payload = json.loads((target / 'sitemaps.json').read_text(encoding='utf-8'))
            self.assertEqual(set(payload['sections']), set(payload['lastmod']))
            for name, urls in payload['sections'].items():
                self.assertEqual(len(urls), len(payload['lastmod'][name]))
            self.assertEqual(payload['sections']['/sitemap-seiten.xml'], application_urls)

    @unittest.skipUnless(shutil.which('php'), 'PHP CLI unavailable')
    def test_php_renderer_emits_url_and_child_sitemap_lastmod(self):
        project = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            section = '/de/quest/sitemap.xml'
            urls = ['/de/quest/70000001/', '/de/quest/70000002/']
            (root / 'sitemaps.json').write_text(json.dumps({
                'index': [section],
                'sections': {section: urls},
                'lastmod': {section: ['2026-11-25', '2026-11-27']},
            }), encoding='utf-8')
            php = (
                "function esc($v){return htmlspecialchars((string)$v, ENT_QUOTES|ENT_XML1, 'UTF-8');}"
                f"require {json.dumps(str(project / 'php/src/Sitemap.php'))};"
                f"$s=new Llb\\Sitemap({json.dumps(str(root))}, 'https://example.test');"
                "echo $s->section('/de/quest/sitemap.xml'), \"\\n\", $s->index();"
            )
            result = subprocess.run(['php', '-r', php], check=True, capture_output=True,
                                    text=True)
            self.assertIn('<lastmod>2026-11-25</lastmod>', result.stdout)
            self.assertIn('<lastmod>2026-11-27</lastmod>', result.stdout)
            self.assertEqual(result.stdout.count('<lastmod>2026-11-27</lastmod>'), 2)


if __name__ == '__main__':
    unittest.main()
