"""Start page: catalogue numbers keep their labels apart; the hero shows the map.

Old Safari ignored `gap` in flex rows, so "15.118Aufgaben" ran together; the
spacing must survive without flex gap. The hero uses the game's whole
Middle-earth map, faded so every line stays readable, and only where it can be
seen (not on phones).
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'web' / 'start.css').read_text()


class ZahlenTest(unittest.TestCase):
    def test_labels_are_separated_without_flex_gap(self):
        self.assertIn('margin-right: 7px', CSS)
        self.assertNotIn('gap: 7px', CSS)

    def test_numbers_stay_left_aligned_in_the_hero_column(self):
        # The figures are not centred; they use the same left edge as the text.
        self.assertNotIn('body.landing .zahlen { justify-content: center', CSS)


class HeroTest(unittest.TestCase):
    def test_each_language_points_at_its_own_map(self):
        for lang in ('de', 'en', 'fr'):
            with self.subTest(lang=lang):
                seite = (ROOT / 'php' / 'templates' / 'app' / ('start-%s.twig' % lang)).read_text()
                self.assertIn("--hero-bild: url('/karten/%s/268437554.webp')" % lang, seite)
                self.assertTrue((ROOT / 'webp' / lang / '268437554.webp').is_file(), lang)

    def test_map_is_only_shown_where_it_helps(self):
        self.assertIn('@media (min-width: 1100px)', CSS)
        self.assertIn('@media (min-width: 641px) and (max-width: 1099px)', CSS)
        self.assertIn('body.landing .hero::before', CSS)
        # A readable page needs an overlay over the picture.
        self.assertIn('body.landing .hero::after', CSS)
        self.assertIn('linear-gradient(90deg, #14110e 0%', CSS)


if __name__ == '__main__':
    unittest.main()
