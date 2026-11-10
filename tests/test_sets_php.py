"""Test PHP filters/routes against small fixtures; no running server required."""
import hashlib
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class SetsPHPTest(unittest.TestCase):
    def php(self, code):
        source = "require 'php/src/Sets.php'; require 'php/src/Catalogue.php'; require 'php/src/Data.php'; require 'php/src/Router.php';\n"
        result = subprocess.run(['php', '-r', source + code], cwd=ROOT,
                                check=True, text=True, capture_output=True)
        return json.loads(result.stdout)

    def test_same_piece_witness_and_unknowns(self):
        result = self.php(r'''
        $a = ['available'=>true,'name'=>'Helm','class'=>'Hunter','classes'=>['Hunter'],
              'class_known'=>true,'category'=>'ARMOUR','armour'=>'MEDIUM','min_level'=>150];
        $b = array_replace($a,['class'=>'Captain','classes'=>['Captain'],'armour'=>'HEAVY','min_level'=>100]);
        $s = ['name'=>'Set','members'=>[$a,$b]];
        $test = fn($f) => \Llb\Sets::matches($s,$f);
        $multi = ['name'=>'Multi','members'=>[array_replace($a,['classes'=>['Burglar','Corsair']])]];
        echo json_encode([
          $test(['class'=>['Hunter'],'armour'=>['MEDIUM']]),
          $test(['class'=>['Hunter'],'armour'=>['HEAVY']]),
          $test(['class'=>['Hunter'],'to'=>'120']),
          $test(['class'=>['Captain','Hunter'],'armour'=>['HEAVY']]),
          $test(['q'=>'helm']), $test(['q'=>'nonexistent']),
          \Llb\Sets::matches($multi,['class'=>['Corsair']]),
          \Llb\Sets::matches(['name'=>'Unknown','members'=>[array_replace($a,['class_known'=>false])]],['class'=>['Hunter']]),
          \Llb\Sets::matches(['name'=>'Unknown','members'=>[array_replace($a,['min_level'=>null])]],['from'=>'1']),
          \Llb\Sets::matches(['name'=>'Missing','members'=>[array_replace($a,['available'=>false])]],['class'=>['Hunter']])
        ]);
        ''')
        self.assertEqual(result, [True, False, False, True, True, False, True, False, False, False])

    def test_localized_words_have_matching_keys(self):
        words = self.php("echo json_encode(array_map(fn($l)=>\\Llb\\Sets::words($l),['de','en','fr']));")
        for lang in words:
            self.assertEqual(set(lang), set(words[0]))
            self.assertTrue(all(lang.values()))
            for key, value in lang.items():
                self.assertEqual(value.count('%s'), words[0][key].count('%s'))

    def test_routes_and_real_404(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            (path / 'labels.json').write_text('{}')
            folder = path / 'de/set'
            folder.mkdir(parents=True)
            sid = '70069B64'
            bucket = hashlib.md5(sid.encode()).hexdigest()[:2]
            (folder / (bucket + '.json')).write_text(json.dumps({'entities': {sid: {'id': sid}}}))
            results = self.php('''
            $dir=%s;
            $catalogue=new \\Llb\\Catalogue($dir.'/labels.json','https://example.org');
            $router=new \\Llb\\Router($catalogue,new \\Llb\\Data($dir));
            $paths=['/de/set/','/en/set/','/fr/ensemble/','/de/set/70069B64/',
                    '/de/set/70069b64/','/de/set/70069B64.html','/de/set/ffffffff/',
                    '/de/set/XYZ/','/de/set/123456789/'];
            echo json_encode(array_map(fn($p)=>$router->resolve($p),$paths));
            ''' % json.dumps(directory))
            self.assertEqual([r['status'] for r in results], [200, 200, 200, 200, 301, 301, 404, 404, 404])
            self.assertEqual(results[4]['redirect'], '/de/set/70069B64/')


if __name__ == '__main__':
    unittest.main()
