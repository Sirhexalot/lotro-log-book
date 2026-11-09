"""Real-catalogue pilot: static content, stable IDs and reachable links."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from build_katalogseiten import BASE, LANGS, PILOT, WORDS, Renderer, build, load_model, old_link, route, output_path, page_route
from build_sitemaps import write as write_sitemap


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.canonicals, self.hreflangs = [], [], {}
        self.h1, self.details = 0, []
        self.h1_text = []
        self._in_h1 = False
        self.feed(text)

    def handle_endtag(self, tag):
        if tag == 'h1':
            self._in_h1 = False

    def handle_data(self, data):
        if self._in_h1:
            self.h1_text.append(data)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a':
            self.links.append(attrs['href'])
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs['href'])
        if tag == 'link' and 'hreflang' in attrs:
            self.hreflangs[attrs['hreflang']] = attrs['href']
        if tag == 'h1':
            self.h1 += 1
            self._in_h1 = True
        if tag == 'details':
            self.details.append(attrs)


class CatalogueTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.target = Path(cls.temp.name)
        for name in ('style.css', 'gemeinsam.css', 'start.html', 'start-en.html', 'start-fr.html',
                     'index.html', 'gegenstand.html', 'speicher.js', 'favicon.svg', 'suche.html',
                     'ruf.html', 'handwerk.html', 'belohnungen.html', 'plugin.html', 'spielstand.html',
                     'impressum.html', 'datenschutz.html', '404.html', 'reise.html',
                     'gegenstaende.html'):
            shutil.copy2(ROOT / 'web' / name, cls.target / name)
        write_sitemap(cls.target, 'sitemap.xml', [], index=True)
        cls.original = (cls.target / 'index.html').read_bytes()
        cls.paths = build(cls.target, ROOT / 'web', pilot=True)
        cls.models = {lang: load_model(ROOT / 'web', lang, pilot=True) for lang in LANGS}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_entities_are_static_and_localized(self):
        for lang in LANGS:
            for kind in ('q', 'd', 'i'):
                entries = self.models[lang]['selected'][kind]
                self.assertTrue(entries, (lang, kind))
                for ident, entry in entries.items():
                    url = route(lang, kind, ident)
                    text = output_path(self.target, url).read_text()
                    name = (entry['n'].get(lang) or entry['n'].get('en')) if kind == 'i' else entry['n']
                    from html import escape
                    page = Page(text)
                    self.assertIn(name, ''.join(page.h1_text))
                    self.assertEqual(page.h1, 1)
                    self.assertEqual(page.canonicals, [BASE + url])
                    self.assertEqual(page.hreflangs, {other: BASE + route(other, kind, ident) for other in LANGS})
                    if kind != 'i':
                        # The map keeps working for quests and deeds; items now
                        # live on their own page instead of the reward index.
                        self.assertIn(old_link(lang, kind, ident), page.links)
                    self.assertNotIn('class-=', text)
                    self.assertNotIn('src="/daten-', text)
                    if kind != 'i':
                        self.assertIn('id="katalog-status"', text)
                        self.assertEqual(bool(page.details), bool(entry.get('s')))
                        self.assertTrue(all('open' not in attrs and 'data-nosnippet' in attrs for attrs in page.details))

    def test_all_static_links_resolve_and_sitemap_matches(self):
        for url in self.paths:
            text = output_path(self.target, url).read_text()
            page = Page(text)
            for link in page.links:
                path = urlsplit(link).path
                self.assertTrue(path.startswith('/'), link)
                file = output_path(self.target, path) if path.endswith('/') else self.target / path.lstrip('/')
                self.assertTrue(file.is_file(), (url, link))
        sitemap = ET.parse(self.target / 'sitemap.xml')
        self.assertEqual(sitemap.getroot().tag, '{http://www.sitemaps.org/schemas/sitemap/0.9}sitemapindex')
        sections = [node.text for node in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(len(sections), 33)  # 11 sections × 3 languages
        locations = []
        for section in sections:
            path = self.target / section.removeprefix(BASE).lstrip('/')
            child = ET.parse(path)
            self.assertEqual(child.getroot().tag, '{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
            locations += [node.text for node in child.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(set(locations), {BASE + url for url in self.paths})
        self.assertEqual(len(locations), len(set(locations)))
        self.assertNotIn(BASE + '/404.html', locations)

    def test_old_urls_untouched_and_new_entrypoints_present(self):
        self.assertEqual((self.target / 'index.html').read_bytes(), self.original)
        for lang in LANGS:
            name = 'start.html' if lang == 'de' else 'start-' + lang + '.html'
            self.assertIn(route(lang, 'catalog'), (self.target / name).read_text())
            self.assertIn(route(lang, 'catalog'), self.paths)

    def test_path_safety(self):
        with self.assertRaises(ValueError):
            route('de', 'q', '../../bad')
        self.assertEqual(route('de', 'q', '70005BB7'), '/de/aufgabe/70005BB7/')
        self.assertEqual(route('de', 'p', 'WOODWORKER'), '/de/beruf/WOODWORKER/')
        self.assertEqual(output_path(self.target, '/de/aufgabe/70005BB7/'), self.target / 'de/aufgabe/70005BB7.html')
        self.assertEqual(page_route('de', 'q', 2), '/de/aufgabe/seite/2/')
        self.assertEqual(output_path(self.target, page_route('de', 'q', 2)), self.target / 'de/aufgabe/seite/2.html')
        with self.assertRaises(ValueError):
            route('de', 'p', '../../WOODWORKER')

    def test_recipe_content_and_pagination_are_static(self):
        models = {lang: load_model(ROOT / 'web', lang) for lang in LANGS}
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp)
            for name in ('style.css', 'gemeinsam.css', 'katalog.css', 'speicher.js', 'katalog.js', 'index.html'):
                shutil.copy2(self.target / name, target / name)
            for lang in LANGS:
                renderer = Renderer(target, lang, models)
                row = next(value for value in models[lang]['selected']['recipe'].values() if value[7] and value[8])
                renderer.recipe(row)
                url = route(lang, 'recipe', row[10])
                text = output_path(target, url).read_text()
                from html import escape
                self.assertIn(escape(row[0]), text)
                self.assertIn(escape(row[6][0][0]), text)
                self.assertIn('data-kind="recipe"', text)
                self.assertIn(route(lang, 'p', row[9]), text)
                self.assertEqual(Page(text).canonicals, [BASE + url])
                renderer.write('q', None, 'Page 2', 'Description', '<p>test</p>', page=2)
                page = Page(output_path(target, page_route(lang, 'q', 2)).read_text())
                self.assertEqual(page.canonicals, [BASE + page_route(lang, 'q', 2)])
                self.assertEqual(page.hreflangs, {other: BASE + page_route(other, 'q', 2) for other in LANGS})

    def test_full_model_includes_every_shipped_entity(self):
        from build_katalogseiten import read_assignment
        for lang in LANGS:
            model = load_model(ROOT / 'web', lang)
            for kind, filename, variable in [('q', 'daten-', 'MQL_QUESTS'), ('d', 'daten-taten-', 'MQL_QUESTS'),
                                              ('recipe', 'rezepte-', 'MQL_REZEPTE')]:
                data = read_assignment(ROOT / 'web' / (filename + lang + '.js'), variable)
                if kind == 'recipe': data = data['r']
                self.assertEqual(len(model['selected'][kind]), len(data))
            self.assertEqual(len(model['selected']['p']), 10)
            self.assertEqual(len(model['selected']['area']) + len(model['selected']['region']), len(model['maps']))

    def test_404_is_root_relative_and_not_indexable(self):
        text = (self.target / '404.html').read_text()
        self.assertIn('content="noindex"', text)
        self.assertTrue(all(link.startswith(('/', '#')) for link in Page(text).links))
        for lang in LANGS:
            self.assertIn('id="%s"' % lang, text)
        self.assertIn('Frodo sucht noch den Weg.', text)
        self.assertIn('ErrorDocument 404 /404.html', (ROOT / 'redirect-mm' / '.htaccess').read_text())

    def test_one_public_address_per_entity(self):
        rules = (ROOT / 'redirect-mm/.htaccess').read_text()
        block = rules.split('# BEGIN LLB ENTITY URLS', 1)[1].split('# END LLB ENTITY URLS', 1)[0]
        redirects = [line for line in block.splitlines() if '[R=301' in line]
        internal = [line for line in block.splitlines() if '[END' in line]
        # Three generic rules for every language folder come first (added for the
        # title and virtue pages), then the per-type rules kept for reference.
        self.assertEqual(len(redirects), 6)
        self.assertEqual(len(internal), 4)
        # The flat file and the slash-less form point at the one public address.
        for pattern, target in ((r'/seite/([0-9]+)\.html$', '/$1/$2/seite/$3/'),
                                (r'/([0-9A-Za-z_]+)\.html$', '/$1/$2/$3/'),
                                (r'/seite/([0-9]+)$', '/$1/$2/seite/$3/'),
                                (r'/([0-9A-Z_]+)$', '/$1/$2/$3/')):
            rule = next(line for line in redirects if pattern in line)
            self.assertIn(target, rule)
            self.assertNotIn('NC', rule.split(']')[-1])
        # Lowercase IDs go to the script, uppercase ones straight to the file.
        lowercase = next(line for line in internal if 'kennung.php' in line)
        self.assertIn('[0-9A-Z_]*[a-z]', lowercase)
        self.assertTrue(lowercase.rstrip().endswith('[END]'))
        mapping = next(line for line in internal if line.rstrip().endswith('[END,NC]'))
        self.assertIn('/?$', mapping)
        self.assertNotIn('CheckSpelling', rules)
        self.assertNotIn('IfModule mod_speling', rules)

    def test_lowercase_redirector_is_safe(self):
        php = (ROOT / 'web' / 'kennung.php').read_text()
        self.assertIn('declare(strict_types=1)', php)
        self.assertIn("preg_match('~^([0-9A-F]{8}|[A-Z][A-Z_]{1,20})$~'", php)
        self.assertIn("header('Location: /' . $sprache . '/' . $art . '/' . $gross . '/', true, 301)", php)
        self.assertIn('http_response_code(404)', php)
        self.assertIn('X-Robots-Tag: noindex', php)
        # Only whitelisted type segments per language are accepted.
        self.assertIn("'de' => ['aufgabe'", php)
        self.assertIn("'en' => ['quest'", php)
        self.assertIn("'fr' => ['quete'", php)


if __name__ == '__main__':
    unittest.main()
