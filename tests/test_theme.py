"""Regression checks for the shared light/dark appearance controls."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
COLOR_RE = re.compile(
    r'#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)|'
    r'(?<![\w-])(?:black|white|transparent)(?![\w-])',
    re.I,
)


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


class ThemeTest(unittest.TestCase):
    def test_dark_is_default_and_light_has_complete_palette(self):
        css = read('web/gemeinsam.css')
        self.assertIn('--grund: var(--llb-palette-14110e)', css)
        self.assertIn('html { color-scheme: dark; }', css)
        light = css[css.index('html[data-theme="light"] {'):css.index('.llb-raster {')]
        for token in ('--grund:', '--fläche:', '--fläche-hell:', '--rand:',
                      '--text:', '--schwach:', '--gold:', '--offen:',
                      '--fertig:', '--laufend:', '--auswahl:'):
            self.assertIn(token, light)
        self.assertIn('--offen: var(--llb-palette-b9380a)', light)
        self.assertIn('--laufend: var(--llb-palette-1d4ed8)', light)

    def test_css_colours_are_centralized(self):
        central = read('web/gemeinsam.css')
        names = re.findall(r'^\s*(--llb-palette-[\w-]+)\s*:', central, re.M)
        self.assertEqual(len(names), len(set(names)), 'palette tokens must be unique')
        for path in sorted((ROOT / 'web').glob('*.css')):
            source = re.sub(r'/\*.*?\*/', '', path.read_text(encoding='utf-8'), flags=re.S)
            if path.name == 'gemeinsam.css':
                source = re.sub(
                    r'^\s*--llb-palette-[\w-]+\s*:[^;]+;',
                    '',
                    source,
                    flags=re.M,
                )
            self.assertIsNone(COLOR_RE.search(source), f'direct colour in {path.name}')

    def test_status_text_and_control_boundaries_meet_contrast_targets(self):
        css = read('web/gemeinsam.css')
        raw = dict(re.findall(
            r'(--llb-palette-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;',
            css,
        ))

        def resolve(block, token):
            match = re.search(r'--' + re.escape(token) + r':\s*var\((--llb-palette-[\w-]+)\)', block)
            self.assertIsNotNone(match, token)
            return raw[match.group(1)]

        def luminance(color):
            values = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
            values = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
            return .2126 * values[0] + .7152 * values[1] + .0722 * values[2]

        def contrast(a, b):
            high, low = sorted((luminance(a), luminance(b)), reverse=True)
            return (high + .05) / (low + .05)

        dark = css[:css.index('html { color-scheme: dark; }')]
        light = re.search(r'html\[data-theme="light"\]\s*\{(.*?)\n\}', css, re.S).group(1)
        for block, surface_token in ((dark, 'fläche-hell'), (light, 'fläche-hell')):
            surface = resolve(block, surface_token)
            for status in ('offen', 'fertig', 'laufend'):
                self.assertGreaterEqual(contrast(resolve(block, status), surface), 4.5,
                                        f'{status} contrast on {surface_token}')
        for block in (dark, light):
            self.assertGreaterEqual(contrast(resolve(block, 'schwach'), resolve(block, 'grund')), 4.5,
                                    'secondary text contrast on page background')
        boundary = resolve(dark, 'rand-bedienung')
        for surface in ('#1e1a16', '#2a251f', '#fffdf8', '#eee9dd'):
            self.assertGreaterEqual(contrast(boundary, surface), 3.0,
                                    f'control border contrast on {surface}')

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
        self.assertIn("'lotro-log-book-mark.svg'", build)
        renderer = read('build_katalogseiten.py')
        self.assertIn("'theme-light.css'", renderer)
        self.assertIn("'theme.js'", renderer)

    def test_book_and_quill_mark_is_shared_by_headers_and_favicon_only(self):
        mark = read('web/lotro-log-book-mark.svg')
        self.assertIn('id="marke"', mark)
        self.assertIn('stroke="currentColor"', mark)
        expected = '/lotro-log-book-mark.svg#marke'
        for path in (
            'web/menue.js',
            'php/templates/app/layout.twig',
            'php/templates/layout.twig',
            'web/404.html',
        ):
            with self.subTest(path=path):
                source = read(path)
                self.assertIn(expected, source)
                self.assertIn('viewBox="0 0 100 100"', source)
                self.assertNotIn('footer-marke', source)
        favicon = read('web/favicon.svg')
        self.assertIn('viewBox="0 0 100 100"', favicon)
        self.assertIn('stroke="#d6b35a"', favicon)

    def test_header_search_and_secondary_controls_use_navigation_row(self):
        menu = read('web/menue.js')
        self.assertIn("suchformular.className = 'kopf-suche'", menu)
        self.assertIn("suchformular.action = app('suche')", menu)
        self.assertIn("recht.appendChild(feedbackLink)", menu)
        self.assertNotIn("ziel.appendChild(feedbackLink)", menu)
        self.assertIn("document.querySelector('.kopf .menue')", read('web/theme.js'))
        shared = read('web/gemeinsam.css')
        self.assertIn('.kopf .kopf-suche', shared)
        self.assertIn('.kopf .menue .theme-toggle', shared)
        self.assertIn('<form class="kopf-suche" action="{{ suche_pfad }}"', read('php/templates/layout.twig'))
        for path in ('php/templates/layout.twig', 'php/templates/app/layout.twig'):
            self.assertIn("'_feedback_footer.twig'", read(path).split('<footer', 1)[1])
        for path in ('php/templates/app/layout.twig', 'php/templates/layout.twig', 'web/404.html'):
            with self.subTest(path=path):
                self.assertNotIn('footer-marke', read(path))

    def test_header_groups_equal_controls_and_uses_surfaces_instead_of_dividers(self):
        css = read('web/gemeinsam.css')
        controls = css.split('.kopf :is(.kopf-suche input, .globalsuche input, .charakterwahl select) {', 1)[1].split('}', 1)[0]
        active = css.split('.menue .familie-feld.aktiv > .familie-knopf {', 1)[1].split('}', 1)[0]
        self.assertIn('height: var(--kopf-control)', controls)
        self.assertIn('.kopf, .seitenfuss { background: var(--kopf-flaeche); }', css)
        self.assertIn('font-weight:', active)
        self.assertNotIn('background:', active)
        self.assertNotRegex(read('web/style.css'), r'\.karten-pfad\s*\{[^}]*border')

    def test_native_filter_controls_follow_selected_scheme(self):
        css = read('web/filter-ui.css')
        self.assertIn('color-scheme: inherit', css)
        self.assertNotIn('color-scheme: dark', css)

    def test_inactive_tabs_use_readable_secondary_text(self):
        css = read('web/reiter.css')
        tabs = css.split('.llb-reiter button {', 1)[1].split('}', 1)[0]
        self.assertIn('color: var(--schwach)', tabs)
        self.assertIn('border: 1px solid var(--llb-flaechen-rand)', tabs)
        aktiv = css.split('.llb-reiter button[aria-selected="true"] {', 1)[1].split('}', 1)[0]
        self.assertIn('color: var(--gold)', aktiv)

    def test_light_theme_gold_buttons_have_contrasting_text(self):
        css = read('web/theme-light.css')
        button = css.split('html[data-theme="light"] .knopf-gold {', 1)[1].split('}', 1)[0]
        hover = css.split('html[data-theme="light"] .knopf-gold:hover,', 1)[1].split('}', 1)[0]
        self.assertIn('background: var(--gold)', button)
        self.assertIn('color: var(--fläche)', button)
        self.assertIn('background: var(--gold-knopf-hover)', hover)
        self.assertIn('color: var(--text)', hover)

    def test_entity_tabs_use_shared_surface_border(self):
        css = read('web/reiter.css')
        tablist = css.split('.llb-reiter {', 1)[1].split('}', 1)[0]
        tabs = css.split('.llb-reiter button {', 1)[1].split('}', 1)[0]
        self.assertIn('margin-bottom: -1px', tablist)
        self.assertIn('border: 1px solid var(--llb-flaechen-rand)', tabs)


if __name__ == '__main__':
    unittest.main()
