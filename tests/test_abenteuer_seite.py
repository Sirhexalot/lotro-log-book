"""The adventure page renders from prepared data, in all three languages."""
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class AdventurePageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix='llb-abenteuer-seite-'))
        subprocess.run(['python3', 'tools/build_php_labels.py',
                        '--ziel', str(cls.tmp / 'labels.json')],
                       cwd=ROOT, check=True, capture_output=True)
        subprocess.run(['python3', 'tools/build_abenteuer.py', '--ziel', str(cls.tmp),
                        '--web', str(cls.tmp / 'web')],
                       cwd=ROOT, check=True, capture_output=True)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def render(self, url):
        env = dict(os.environ)
        env['LLB_ROOT'] = str(ROOT)
        env['LLB_DATA'] = str(self.tmp)
        env['LLB_WEB'] = str(ROOT / 'web')
        env['LLB_VENDOR'] = str(ROOT / 'vendor')
        env['LLB_CACHE'] = str(self.tmp / 'twig')
        script = ('require getenv("LLB_VENDOR")."/autoload.php";'
                  '$_SERVER["REQUEST_URI"]=' + json.dumps(url) + ';'
                  'require ' + json.dumps(str(ROOT / 'php/public/index.php')) + ';')
        result = subprocess.run(['php', '-d', 'opcache.enable_cli=0', '-r', script],
                                cwd=ROOT, capture_output=True, text=True, env=env)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout

    def test_german_page_lists_every_adventure(self):
        html = self.render('/de/abenteuer/')
        self.assertIn('<title>Dein Abenteuerüberblick', html)
        self.assertEqual(html.count('class="abenteuer-karte"'), 15)
        self.assertIn('Die Schatten von Angmar', html)
        self.assertIn('Grundspiel · Stufe 1–50', html)
        self.assertIn('Altes zu Ende bringen', html)
        self.assertIn('Meine Inhalte', html)
        # Areas are already in the markup, so the page is usable without JS.
        self.assertIn('Enthaltene Gebiete', html)
        self.assertIn('Breeland', html)
        # Personal values stay out of the server response.
        self.assertNotIn('MQL_CHARAKTER', html)

    def test_every_language_has_its_own_page_and_names(self):
        english = self.render('/en/adventure/')
        french = self.render('/fr/aventure/')
        self.assertIn('<title>Your adventure overview', english)
        self.assertIn('<title>Votre aperçu des aventures', french)
        self.assertIn('Mines of Moria', english)
        self.assertIn('Les Mines de la Moria', french)
        self.assertIn('Base game · Level 1–50', english)
        self.assertIn('Jeu de base · Niveau 1–50', french)
        self.assertIn('hreflang="de"', english)
        self.assertIn('/fr/aventure/', english)

    def test_catalogue_script_and_styles_are_referenced(self):
        html = self.render('/de/abenteuer/')
        self.assertIn('abenteuer-de.js', html)
        self.assertIn('abenteuer-logik.js', html)
        self.assertIn('abenteuer.js', html)
        self.assertIn('abenteuer.css', html)
        self.assertIn('data-seite="abenteuer"', html)


if __name__ == '__main__':
    unittest.main()
