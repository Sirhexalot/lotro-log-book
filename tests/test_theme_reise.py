"""Light-theme contrast for travel controls and adventure-map labels."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


class TravelThemeTest(unittest.TestCase):
    def test_travel_panel_follows_light_theme_but_map_stage_stays_dark(self):
        light = read('web/theme-light.css')
        self.assertIn(
            'html[data-theme="light"] .reise-panel {\n'
            '\tbackground: linear-gradient(180deg, var(--llb-palette-fffdf8), '
            'var(--llb-palette-f4f0e6));',
            light,
        )
        self.assertIn('html[data-theme="light"] .reise-welt-hinweis', light)
        self.assertIn('--llb-palette-e8e1d5', light)
        self.assertIn('html[data-theme="light"] .reise-karten-leer', light)
        self.assertIn('html[data-theme="light"] .reise-marker[data-art="start"]', light)
        self.assertNotIn('.reise-buehne {', light)

    def test_adventure_labels_keep_contrast_on_dark_map(self):
        light = read('web/theme-light.css')
        for selector in (
            '.welt-marke {',
            '.welt-marke[aria-pressed="true"]',
            '.welt-marke.passt',
            '.welt-marke.drueber',
            '.welt-text small',
        ):
            self.assertIn('html[data-theme="light"] ' + selector, light)
        self.assertIn('.welt-marke .welt-ring circle:first-child', light)
