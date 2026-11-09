"""SEO foundation without building the complete data/map catalogue."""
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from xml.etree import ElementTree as ET

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build_seo import BASE, PAGES, build
from PIL import Image


class SeoTest(unittest.TestCase):
    def test_static_metadata_and_discovery(self):
        web = Path(__file__).resolve().parents[1] / 'web'
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp)
            # Only the three start images; web/bild/items holds thousands of
            # item symbols and copying them makes this test needlessly slow.
            (target / 'bild').mkdir()
            for name in ('start.jpg', 'start-en.jpg', 'start-fr.jpg'):
                shutil.copy2(web / 'bild' / name, target / 'bild' / name)
            for name in PAGES:
                shutil.copy2(web / name, target / name)
            build(target)
            for name in PAGES:
                text = (target / name).read_text()
                self.assertEqual(text.count('name="description"'), 1, name)
                self.assertIn('property="og:image"', text)
                self.assertIn('content="1200"', text)
                self.assertIn('summary_large_image', text)
                self.assertIn('https://llb.sirhexalot.de/bild/vorschau-', text)
                if name.startswith('start'):
                    self.assertIn('rel="canonical"', text)
                    self.assertEqual(text.count('hreflang='), 4)
                else:
                    self.assertNotIn('hreflang=', text)
                if name == 'gegenstand.html':
                    self.assertNotIn('rel="canonical"', text)
            for lang in ('de', 'en', 'fr'):
                with Image.open(target / 'bild' / ('vorschau-' + lang + '.jpg')) as image:
                    self.assertEqual(image.size, (1200, 630))
            index = ET.parse(target / 'sitemap.xml')
            self.assertEqual(index.getroot().tag, '{http://www.sitemaps.org/schemas/sitemap/0.9}sitemapindex')
            self.assertEqual([e.text for e in index.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')], [BASE + '/sitemap-seiten.xml'])
            locations = [e.text for e in ET.parse(target / 'sitemap-seiten.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
            self.assertEqual(len(locations), len(PAGES) - 2)  # ohne Gegenstand und Suche
            self.assertNotIn(BASE + '/gegenstand.html', locations)
            self.assertTrue(all(url.startswith(BASE + '/') for url in locations))
            self.assertIn('Sitemap: ' + BASE + '/sitemap.xml', (target / 'robots.txt').read_text())


if __name__ == '__main__':
    unittest.main()
