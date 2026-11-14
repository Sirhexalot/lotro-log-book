"""Start markup must not reveal empty map panes while loading."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class KartenstartTest(unittest.TestCase):
    def test_both_entry_points_start_hidden(self):
        for path in ('php/templates/app/karte.twig', 'web/index.html'):
            self.assertIn('<main class="karte-laedt">', (ROOT / path).read_text())
        self.assertIn('main.karte-laedt { visibility: hidden; }',
                      (ROOT / 'web/landschaft.css').read_text())

    def test_startup_and_missing_data_reveal_the_page(self):
        code = (ROOT / 'web/app.js').read_text()
        self.assertEqual(code.count("haupt.classList.remove('karte-laedt')"), 2)

    def test_other_content_is_last_and_jumps_are_preserved(self):
        code = (ROOT / 'web/app.js').read_text()
        self.assertIn("return a.region === ltexte[7] ? 1 : -1", code)
        self.assertIn('spruenge.appendChild(sprung)', code)
