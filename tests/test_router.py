"""Router behaviour on a real data set: one public address per entity.

The lowercase form used to be a separate Apache-side script (`kennung.php`),
because Apache cannot change case and the host does not load `mod_speling`.
The router answers it now, with the same one-hop 301 - including professions,
which no longer have pages of their own.

The test needs prepared data, so it runs only where `tools/build_php_data.py`
has produced some (default `~/.cache/llb-php/phpdata` or `$LLB_DATA`).
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEN = Path(os.environ.get('LLB_DATA') or Path.home() / '.cache' / 'llb-php' / 'phpdata')

QUELLE = '''require 'php/src/Catalogue.php'; require 'php/src/Data.php'; require 'php/src/Router.php';
$dir = getenv('LLB_DATA');
$c = new \\Llb\\Catalogue($dir . '/labels.json', 'https://llb.sirhexalot.de');
$r = new \\Llb\\Router($c, new \\Llb\\Data($dir));
$out = [];
foreach (json_decode($argv[1], true) as $pfad) {
    $antwort = $r->resolve($pfad);
    $out[$pfad] = [$antwort['status'], $antwort['redirect'] ?? null];
}
echo json_encode($out);
'''


@unittest.skipUnless(shutil.which('php'), 'PHP required')
@unittest.skipUnless((DATEN / 'labels.json').is_file(),
                     'phpdata fehlt (tools/build_php_data.py)')
class RouterTest(unittest.TestCase):
    def aufloesen(self, pfade):
        umgebung = dict(os.environ, LLB_DATA=str(DATEN))
        ergebnis = subprocess.run(
            ['php', '-r', QUELLE, json.dumps(pfade)], cwd=ROOT, env=umgebung,
            check=True, text=True, capture_output=True)
        return json.loads(ergebnis.stdout)

    def test_lowercase_ids_lead_to_the_stored_address(self):
        antworten = self.aufloesen(['/de/aufgabe/700005c0/', '/de/gegenstand/7004358a/'])
        self.assertEqual(antworten['/de/aufgabe/700005c0/'],
                         [301, '/de/aufgabe/700005C0/'])
        self.assertEqual(antworten['/de/gegenstand/7004358a/'],
                         [301, '/de/gegenstand/7004358A/'])

    def test_lowercase_professions_keep_their_redirect(self):
        # The key is uppercase in the data; the page itself is gone.
        for pfad, ziel in (('/de/beruf/cook/', '/de/handwerk/rezepte/?beruf=COOK'),
                           ('/de/beruf/COOK/', '/de/handwerk/rezepte/?beruf=COOK')):
            self.assertEqual(self.aufloesen([pfad])[pfad], [301, ziel])

    def test_one_public_address_per_entity(self):
        antworten = self.aufloesen(['/de/aufgabe/700005C0.html',
                                    '/de/aufgabe/700005C0',
                                    '/de/aufgabe/700005C0/'])
        self.assertEqual(antworten['/de/aufgabe/700005C0.html'],
                         [301, '/de/aufgabe/700005C0/'])
        self.assertEqual(antworten['/de/aufgabe/700005C0'],
                         [301, '/de/aufgabe/700005C0/'])
        self.assertEqual(antworten['/de/aufgabe/700005C0/'][0], 200)

    def test_removed_lists_lead_to_their_successor(self):
        antworten = self.aufloesen(['/de/gegenstand/', '/de/beruf/'])
        self.assertEqual(antworten['/de/gegenstand/'],
                         [301, '/de/gegenstandssuche/'])
        self.assertEqual(antworten['/de/beruf/'],
                         [301, '/de/handwerk/rezepte/'])

    def test_unknown_paths_stay_404(self):
        antworten = self.aufloesen(['/de/gibtsnicht/', '/de/aufgabe/70000000/'])
        self.assertEqual(antworten['/de/gibtsnicht/'][0], 404)
        self.assertEqual(antworten['/de/aufgabe/70000000/'][0], 404)


if __name__ == '__main__':
    unittest.main()
