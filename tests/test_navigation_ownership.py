"""Menu shortcuts must not promise a separate personal view."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NavigationOwnershipTests(unittest.TestCase):
    def test_no_personal_cross_family_shortcuts(self):
        for filename in ('web/menue.js', 'php/src/Shell.php'):
            source = (ROOT / filename).read_text()
            with self.subTest(filename=filename):
                self.assertNotIn('menue_meine_berufe', source)
                self.assertNotIn('menue_mein_ruf', source)
                self.assertNotIn('menue_berufe', source)
                self.assertIn('menue_handwerk', source)
                self.assertIn('menue_ruf', source)
                self.assertIn('menue_fortschritt', source)
