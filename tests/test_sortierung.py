"""The shared name order agrees in Python, PHP and JavaScript."""
import json
import subprocess
import unittest
from pathlib import Path

from tools.sortierung import schluessel

ROOT = Path(__file__).resolve().parents[1]
NAMES = [
    'Zebra', '…und der Körper wird sterben', '„Auenländer Süßblatt“-Feld',
    "'Blut für Blut ...'", 'Ältestental', 'Aal', 'Stufe 10', 'Stufe 9',
    '„Kleines“ Waldmenschen-Totem', 'Übermacht', 'Oeuvre', 'Öffnungen schaffen',
]


class SortierungTest(unittest.TestCase):
    def test_expected_behavior_and_ascii_order_key(self):
        rows = sorted(NAMES, key=schluessel)
        self.assertEqual(rows[0], 'Aal')
        self.assertLess(rows.index('Ältestental'), rows.index('Zebra'))
        self.assertLess(rows.index('Stufe 9'), rows.index('Stufe 10'))
        self.assertLess(rows.index("'Blut für Blut ...'"), rows.index('Zebra'))
        self.assertTrue(all(isinstance(schluessel(name), tuple) for name in NAMES))

    def test_php_and_javascript_match_python_order(self):
        expected = sorted(NAMES, key=schluessel)
        payload = json.dumps(NAMES, ensure_ascii=False)
        php = subprocess.run(
            ['php', '-r',
             'require $argv[1]; $a=json_decode(stream_get_contents(STDIN),true); '
             'usort($a, [\"Llb\\\\Sortierung\", \"name\"]); '
             'echo json_encode($a, JSON_UNESCAPED_UNICODE);',
             str(ROOT / 'php/src/Sortierung.php')],
            input=payload, text=True, capture_output=True, check=True,
        )
        js = subprocess.run(
            ['node', '-e',
             'const fs=require(\"fs\"),vm=require(\"vm\");'
             'global.window=global;vm.runInThisContext(fs.readFileSync(process.argv[1],\"utf8\"));'
             'const a=JSON.parse(fs.readFileSync(0,\"utf8\"));'
             'a.sort(MQL_SORT.compare);process.stdout.write(JSON.stringify(a));',
             str(ROOT / 'web/sortierung.js')],
            input=payload, text=True, capture_output=True, check=True,
        )
        self.assertEqual(json.loads(php.stdout), expected)
        self.assertEqual(json.loads(js.stdout), expected)
