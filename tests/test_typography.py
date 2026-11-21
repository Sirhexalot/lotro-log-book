"""The site's typeface and type scale are self-hosted and shared."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TypographyTest(unittest.TestCase):
    def test_roboto_is_self_hosted_with_its_license(self):
        css = (ROOT / 'web/gemeinsam.css').read_text(encoding='utf-8')
        self.assertIn('--schrift: "Roboto", Arial, sans-serif;', css)
        self.assertIn('src: url("/fonts/roboto-latin.woff2")', css)
        self.assertIn('src: url("/fonts/roboto-latin-ext.woff2")', css)
        self.assertTrue((ROOT / 'web/fonts/roboto-latin.woff2').is_file())
        self.assertTrue((ROOT / 'web/fonts/roboto-latin-ext.woff2').is_file())
        self.assertIn('SIL OPEN FONT LICENSE Version 1.1',
                      (ROOT / 'web/fonts/OFL.txt').read_text(encoding='utf-8'))
        for path in (ROOT / 'web').glob('*.css'):
            text = path.read_text(encoding='utf-8')
            self.assertNotRegex(text, r'https?://fonts\.(?:googleapis|gstatic)\.com')

    def test_site_type_rules_use_central_tokens(self):
        shared = (ROOT / 'web/gemeinsam.css').read_text(encoding='utf-8')
        self.assertIn('font-family: var(--schrift);', shared)
        self.assertIn('font-size: var(--text-normal);', shared)
        self.assertIn('--gewicht-semibold:', shared)
        self.assertIn('--zeile-lesetext:', shared)
        for path in (ROOT / 'web').glob('*.css'):
            source = re.sub(r'/\*.*?\*/', '', path.read_text(encoding='utf-8'), flags=re.S)
            # Font-face descriptors and the root's 100% base size are intentional.
            source = re.sub(r'@font-face\s*\{.*?\}', '', source, flags=re.S)
            for prop in ('font-size', 'font-family', 'font-weight'):
                for value in re.findall(r'\b' + prop + r'\s*:\s*([^;}]+)', source):
                    if prop == 'font-size' and value.strip() in ('100%', 'inherit'):
                        continue
                    self.assertTrue(value.strip().startswith('var('),
                                    f'{path.name}: non-tokenized {prop}: {value.strip()}')

    def test_static_build_copies_and_versions_font_assets(self):
        builder = (ROOT / 'baue_website.py').read_text(encoding='utf-8')
        self.assertIn("shutil.copytree(schriftordner, ziel / 'fonts'", builder)
        self.assertIn("schrift.read_bytes()", builder)
        release_builder = (ROOT / 'tools/build_release.py').read_text(encoding='utf-8')
        self.assertIn('shutil.copytree(eintrag, ziel_pfad', release_builder)


if __name__ == '__main__':
    unittest.main()
