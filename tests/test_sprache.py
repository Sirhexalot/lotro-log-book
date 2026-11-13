"""Sprachwahl ohne Sprachpfad: Deutsch, Französisch, sonst Englisch.

Die Regel gilt nur für Adressen, die keine Sprache nennen (Wurzel, alte
Dateiadressen). Ein Sprachpfad in der Adresse gewinnt immer, damit geteilte
Links ihre Sprache behalten. Eine bewusste Wahl im Footer liegt in einem
funktionalen Cookie `llb_sprache` und schlägt die Browser-Sprache.

Braucht die vorbereiteten Daten wie `test_router.py`.
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

QUELLE = '''require 'php/src/Catalogue.php'; require 'php/src/Data.php';
require 'php/src/Router.php'; require 'php/src/Sprache.php';
$dir = getenv('LLB_DATA');
$c = new \\Llb\\Catalogue($dir . '/labels.json', 'https://llb.sirhexalot.de');
$d = new \\Llb\\Data($dir);
$fall = json_decode($argv[1], true);
$out = ['accept' => [], 'router' => [], 'legacy' => []];
foreach ($fall['accept'] as $kopf) {
    $out['accept'][$kopf] = \\Llb\\Sprache::ausAcceptLanguage($kopf);
}
foreach ($fall['router'] as $sprache => $pfade) {
    $r = new \\Llb\\Router($c, $d, $sprache);
    foreach ($pfade as $pfad) {
        $a = $r->resolve($pfad);
        $out['router'][$sprache . ' ' . $pfad] = [$a['status'], $a['redirect'] ?? null];
    }
}
foreach ($fall['legacy'] as $sprache => $pfade) {
    $r = new \\Llb\\Router($c, $d, $sprache);
    foreach ($pfade as $pfad => $query) {
        $out['legacy'][$sprache . ' ' . $pfad . '?' . http_build_query($query)] =
            $r->legacyTarget($pfad, $query);
    }
}
echo json_encode($out);
'''


@unittest.skipUnless(shutil.which('php'), 'PHP required')
@unittest.skipUnless((DATEN / 'labels.json').is_file(),
                     'phpdata fehlt (tools/build_php_data.py)')
class SpracheTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        faelle = {
            'accept': ['de-DE,de;q=0.9,en;q=0.8', 'fr-FR,fr;q=0.9', 'en-US,en;q=0.9',
                       'nl-NL,nl;q=0.9,en;q=0.8', 'fr-CA', 'de', 'en-GB,de;q=0.7',
                       'it-IT,fr;q=0.5', '*', '', 'de;q=0.2,fr;q=0.8'],
            'router': {'fr': ['/'], 'de': ['/'], 'en': ['/']},
            'legacy': {'fr': {'/start.html': [], '/gegenstaende.html': []},
                       'en': {'/spielstand.html': []},
                       'de': {'/gegenstaende.html': {'lang': 'de'}}},
        }
        umgebung = dict(os.environ, LLB_DATA=str(DATEN))
        ergebnis = subprocess.run(
            ['php', '-r', QUELLE, json.dumps(faelle)], cwd=ROOT, env=umgebung,
            check=True, text=True, capture_output=True)
        cls.antworten = json.loads(ergebnis.stdout)

    def test_browser_list_in_its_own_order(self):
        erwartet = {
            'de-DE,de;q=0.9,en;q=0.8': 'de',
            'fr-FR,fr;q=0.9': 'fr',
            'en-US,en;q=0.9': 'en',
            # A language we do not serve falls through to English.
            'nl-NL,nl;q=0.9,en;q=0.8': 'en',
            'fr-CA': 'fr',
            'de': 'de',
            # The order of the list decides, not a fixed rank.
            'en-GB,de;q=0.7': 'de',
            'it-IT,fr;q=0.5': 'fr',
            '*': 'en',
            '': 'en',
            'de;q=0.2,fr;q=0.8': 'fr',
        }
        self.assertEqual(self.antworten['accept'], erwartet)

    def test_root_follows_the_visitor(self):
        for sprache in ('de', 'fr', 'en'):
            self.assertEqual(self.antworten['router'][sprache + ' /'],
                             [302, '/' + sprache + '/karte/'])

    def test_old_addresses_follow_the_visitor(self):
        legacy = self.antworten['legacy']
        self.assertEqual(legacy['fr /start.html?'], '/fr/')
        self.assertEqual(legacy['fr /gegenstaende.html?'], '/fr/recherche-objets/')
        self.assertEqual(legacy['en /spielstand.html?'], '/en/progress/')
        # An explicit ?lang= in the link wins over the browser.
        self.assertEqual(legacy['de /gegenstaende.html?lang=de'], '/de/gegenstandssuche/')


if __name__ == '__main__':
    unittest.main()
