"""PHP filter rules and routes for the quest-giver pages; no server needed."""
import hashlib
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRE = ("require 'php/src/Catalogue.php'; require 'php/src/Data.php'; "
           "require 'php/src/Router.php'; require 'php/src/Givers.php';\n")


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class GiversPHPTest(unittest.TestCase):
    def php(self, code):
        result = subprocess.run(['php', '-r', REQUIRE + code], cwd=ROOT,
                                check=True, text=True, capture_output=True)
        return json.loads(result.stdout)

    def test_one_quest_must_carry_level_and_property(self):
        result = self.php(r'''
        $places = [[268437557, 268437678]];
        $a = ['search' => 'karlo gasthaus', 'places' => $places, 'kind' => 'person',
              'quests' => [['70000003', 20, 1], ['70000004', 150, 0]]];
        $test = fn($f) => \Llb\Givers::matches($a, $f);
        echo json_encode([
          $test(['region' => [268437557]]),
          $test(['region' => [268450901]]),
          $test(['area' => [268437678]]),
          $test(['kind' => ['person']]),
          $test(['kind' => ['object']]),
          $test(['from' => '100', 'to' => '160', 'tag' => ['dy']]),
          $test(['from' => '10', 'to' => '30', 'tag' => ['dy']]),
          $test(['from' => '100', 'to' => '160']),
          $test(['q' => 'KARLO']),
          $test(['q' => 'carlo'])
        ]);
        ''')
        self.assertEqual(result, [True, False, True, True, False, False, True, True, True, False])

    def test_sorts_by_name_or_level_with_unknown_level_last(self):
        rows = [
            {'id': '70000003', 'name': 'Zehn', 'low': 10, 'high': 10},
            {'id': '70000002', 'name': 'Ohne', 'low': None, 'high': None},
            {'id': '70000001', 'name': 'Fünf', 'low': 5, 'high': 8},
            {'id': '70000004', 'name': 'Alpha', 'low': 10, 'high': 12},
        ]
        result = self.php(r'''
        $rows = json_decode(%s, true);
        echo json_encode([
          array_column(\Llb\Givers::sorted($rows, ''), 'id'),
          array_column(\Llb\Givers::sorted($rows, 'stufe'), 'id')
        ]);
        ''' % json.dumps(json.dumps(rows)))
        by_name, by_level = result
        self.assertEqual(by_name, ['70000004', '70000001', '70000002', '70000003'])
        self.assertEqual(by_level, ['70000001', '70000004', '70000003', '70000002'])

    def test_unknown_values_never_count_as_a_match(self):
        result = self.php(r'''
        $unknown = ['search' => 'x', 'places' => [], 'kind' => 'unknown',
                    'quests' => [['70000001', 0, 0]]];
        echo json_encode([
          \Llb\Givers::matches($unknown, ['region' => [1]]),
          \Llb\Givers::matches($unknown, ['kind' => ['unknown']]),
          \Llb\Givers::matches($unknown, ['from' => '1']),
          \Llb\Givers::matches($unknown, ['tag' => ['dy']]),
          \Llb\Givers::matches($unknown, [])
        ]);
        ''')
        self.assertEqual(result, [False, True, False, False, True])

    def test_words_are_complete_in_all_three_languages(self):
        words = self.php("echo json_encode(array_map(fn($l)=>\\Llb\\Givers::words($l),['de','en','fr']));")
        for lang in words:
            self.assertEqual(set(lang), set(words[0]))
            self.assertTrue(all(value != '' for value in lang.values()))
            for key, value in lang.items():
                self.assertEqual(value.count('%s'), words[0][key].count('%s'))

    def test_routes_and_real_404(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            (path / 'labels.json').write_text('{}')
            sid = '70000002'
            other = '7000000A'
            for lang in ('de', 'en', 'fr'):
                folder = path / lang / 'giver'
                folder.mkdir(parents=True)
                for ident in (sid, other):
                    bucket = hashlib.md5(ident.encode()).hexdigest()[:2]
                    (folder / (bucket + '.json')).write_text(
                        json.dumps({'entities': {ident: {'id': ident, 'name': 'Karlo'}}}))
            results = self.php('''
            $dir=%s;
            $catalogue=new \\Llb\\Catalogue($dir.'/labels.json','https://example.org');
            $router=new \\Llb\\Router($catalogue,new \\Llb\\Data($dir));
            $paths=['/de/auftraggeber/','/en/quest-giver/','/fr/donneur-de-quete/',
                    '/de/auftraggeber/70000002/','/de/auftraggeber/7000002/',
                    '/de/auftraggeber/7000000a/','/de/auftraggeber/70000002.html',
                    '/de/auftraggeber/70000002','/de/auftraggeber/ffffffff/',
                    '/de/auftraggeber/XYZ/','/fr/donneur-de-quete/ffffffff/'];
            echo json_encode(array_map(fn($p)=>$router->resolve($p),$paths));
            ''' % json.dumps(directory))
            self.assertEqual([r['status'] for r in results],
                             [200, 200, 200, 200, 404, 301, 301, 301, 404, 404, 404])
            self.assertEqual(results[5]['redirect'], '/de/auftraggeber/7000000A/')
            self.assertEqual(results[0]['app'], 'givers')
            self.assertEqual(results[3]['kind'], 'giver')


if __name__ == '__main__':
    unittest.main()
