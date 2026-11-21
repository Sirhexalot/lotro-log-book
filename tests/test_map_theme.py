"""The map toolbar and icon tiles adapt consistently to the selected theme."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


class MapThemeTest(unittest.TestCase):
    def test_light_status_colors_are_fresh_and_have_contrast_coverage(self):
        css = read('web/gemeinsam.css')
        self.assertIn('--offen: var(--llb-palette-b9380a);', css)
        self.assertIn('--laufend: var(--llb-palette-1d4ed8);', css)
        self.assertIn('--llb-palette-b9380a: #b9380a;', css)
        self.assertIn('--llb-palette-1d4ed8: #1d4ed8;', css)
        # The existing contrast regression checks all semantic statuses against
        # both theme surfaces.
        self.assertIn('contrast(resolve(block, status), surface)', read('tests/test_theme.py'))

    def test_icon_tiles_use_theme_aware_shared_tokens(self):
        shared = read('web/gemeinsam.css')
        self.assertIn('--llb-icon-tile-bg: var(--llb-palette-362f26);', shared)
        light = shared.split('html[data-theme="light"] {', 1)[1].split('\n}', 1)[0]
        self.assertIn('--llb-icon-tile-bg: var(--llb-palette-fffdf8);', light)
        self.assertIn('--llb-icon-item-filter: none;', light)
        self.assertIn('background: var(--llb-icon-dat-bg);', shared)
        style = read('web/style.css')
        self.assertIn('background: var(--llb-icon-tile-bg); color: var(--gold);', style)
        self.assertIn('filter: var(--llb-icon-item-filter);', style)
        filters = read('web/filter-ui.css')
        self.assertIn('background:var(--llb-icon-tile-bg)', filters)
        self.assertIn('filter:var(--llb-icon-item-filter)', filters)

    def test_map_toolbar_groups_filters_and_view_controls(self):
        for path in ('php/templates/app/karte.twig', 'web/index.html'):
            source = read(path)
            left = source.split('<div class="kartenkopf-links">', 1)[1].split(
                '<div class="kartenkopf-rechts">', 1
            )[0]
            right = source.split('<div class="kartenkopf-rechts">', 1)[1].split(
                '</div>\n\t\t\t</div>\n\t\t</div>', 1
            )[0]
            self.assertLess(left.index('id="notizen"'), left.index('id="vorkommen"'))
            self.assertLess(left.index('id="vorkommen"'), left.index('id="geber-schalter"'))
            self.assertIn('id="geber-schalter" aria-pressed="true"', left)
            self.assertNotIn('id="kartenansicht"', left)
            self.assertLess(right.index('id="kartenansicht"'), right.index('id="gelaende-zoom"'))
            self.assertNotIn('id="notizen"', right)
            self.assertNotIn('id="vorkommen"', right)
            header = source.split('<div class="kartenkopf">', 1)[1].split('</div>\n\t\t</div>', 1)[0]
            self.assertNotIn('id="karte-stufe"', header)
            bar = source.split('<div class="kartenleiste">', 1)[1].split('</div>', 1)[0]
            self.assertIn('id="karte-stufe"', bar)
            actions = source.split('<div class="leiste-aktionen">', 1)[1].split('</div>', 1)[0]
            self.assertNotIn('id="notizen"', actions)
            self.assertNotIn('id="vorkommen"', actions)
            self.assertNotIn('id="geber-schalter"', actions)
            self.assertNotIn('type="checkbox" id="geber-schalter"', source)
        css = read('web/style.css')
        bar = css.split('/* Map column:', 1)[1].split('/* Map controls', 1)[0]
        self.assertIn('display: flex;', bar)
        self.assertIn('height: 34px;', bar)
        self.assertIn('backdrop-filter: blur(4px);', css)
        self.assertIn('background: var(--llb-palette-rgba-13-11-9-p82);', css)
        self.assertIn('font-size: inherit;', css.split('.kartenleiste .legende {', 1)[1].split('}', 1)[0])
        self.assertIn('.kartenkopf .notizen-feld { top: calc(100% + 6px)', css)
        self.assertIn('padding: 0; border: 0; border-radius: 0;', css.split('.karte-stufe {', 1)[1].split('}', 1)[0])
        self.assertIn('body[data-seite="karte"] > .seitenfuss { display: none; }', css)
        self.assertIn('.kartenkopf .geber-schalter { pointer-events: auto; }', css)
        self.assertIn('.kartenkopf .notizen { position: static; }', css)
        self.assertIn('.kartenkopf .notizen-feld { top: calc(100% + 6px); right: auto; bottom: auto; left: 0; width: min(300px, calc(100cqw - 12px)); }', css)
        self.assertIn('.marker.ohne-geber .punkt.questgeber { display: none; }', css)
        self.assertIn('var nurQuestgeber = stelle.quests.every(function (quest)', read('web/app.js'))
        self.assertIn('geberSchalter.hidden = true;', read('web/app.js'))
        target_marker = css.split('.punkt.zielort {', 1)[1].split('}', 1)[0]
        self.assertIn('width: 22px; height: 22px; margin: -11px 0 0 -11px;', target_marker)
        self.assertIn('--llb-palette-rgba-13-11-9-p9', target_marker)
        self.assertIn('body[data-seite]:not([data-seite="karte"]) main,\nbody.seite-start main { flex: 1; }', read('web/gemeinsam.css'))
        switch = read('web/app.js').split('// "Questgeber anzeigen"', 1)[1].split('function koordinatenText', 1)[0]
        self.assertIn("geberSchalter.setAttribute('aria-pressed', sichtbar ? 'true' : 'false');", switch)
        self.assertIn("marker.classList.toggle('ohne-geber', !sichtbar);", switch)


if __name__ == '__main__':
    unittest.main()
