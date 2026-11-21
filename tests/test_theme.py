"""Regression checks for the shared light/dark appearance controls."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


class ThemeTest(unittest.TestCase):
    def test_dark_is_default_and_light_has_complete_palette(self):
        css = read('web/gemeinsam.css')
        self.assertIn('--grund: #14110e', css)
        self.assertIn('html { color-scheme: dark; }', css)
        light = css[css.index('html[data-theme="light"] {'):css.index('.llb-raster {')]
        for token in ('--grund:', '--fläche:', '--fläche-hell:', '--rand:',
                      '--text:', '--schwach:', '--gold:', '--offen:',
                      '--fertig:', '--laufend:', '--auswahl:'):
            self.assertIn(token, light)

    def test_theme_is_applied_before_styles_and_saved_locally(self):
        init = read('web/theme-init.js')
        self.assertIn("getItem('mql.theme')", init)
        self.assertIn("setAttribute('data-theme', theme)", init)
        js = read('web/theme.js')
        self.assertIn("setItem('mql.theme', current)", js)
        self.assertIn("aria-pressed", js)
        self.assertIn("addEventListener('click'", js)
        for label in ('Hell', 'Light', 'Clair', 'Dunkel', 'Dark', 'Sombre'):
            self.assertIn(label, js)

    def test_php_shell_and_static_pages_include_theme_assets(self):
        shell = read('php/src/Shell.php')
        self.assertIn("scriptTag('theme.js')", shell)
        self.assertIn("assetTag('theme-light.css')", shell)
        layout = read('php/templates/layout.twig')
        self.assertIn("localStorage.getItem('mql.theme')", layout)
        app_layout = read('php/templates/app/layout.twig')
        self.assertIn("localStorage.getItem('mql.theme')", app_layout)
        self.assertIn('theme-light.css', app_layout)
        self.assertIn('theme.js', app_layout)
        html_pages = list((ROOT / 'web').glob('*.html'))
        for page in html_pages:
            source = page.read_text(encoding='utf-8')
            if 'gemeinsam.css' in source:
                self.assertIn('theme-init.js', source, page.name)
                self.assertIn('theme-light.css', source, page.name)
                self.assertIn('theme.js', source, page.name)

    def test_theme_assets_are_packaged_and_generated_catalog_pages_load_them(self):
        build = read('baue_website.py')
        for asset in ('theme.js', 'theme-init.js', 'theme-light.css'):
            self.assertIn("'" + asset + "'", build)
        renderer = read('build_katalogseiten.py')
        self.assertIn("'theme-light.css'", renderer)
        self.assertIn("'theme.js'", renderer)

    def test_native_filter_controls_follow_selected_scheme(self):
        css = read('web/filter-ui.css')
        self.assertIn('color-scheme: inherit', css)
        self.assertNotIn('color-scheme: dark', css)


if __name__ == '__main__':
    unittest.main()
