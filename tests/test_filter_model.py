"""The server-list model contract and the title order; no running server."""
import json
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRE = ("require 'php/src/Sortierung.php'; require 'php/src/FilterModel.php'; "
           "require 'php/src/Titles.php';\n")


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class FilterModelTest(unittest.TestCase):
    def php(self, code):
        result = subprocess.run(['php', '-r', REQUIRE + code], cwd=ROOT,
                                check=True, text=True, capture_output=True)
        return json.loads(result.stdout)

    def test_response_carries_definition_and_one_state(self):
        model = self.php(r'''
        $definition = [
          'area' => 'titel', 'lang' => 'de',
          'groups' => [['id' => 'region', 'kind' => 'multi', 'label' => 'Region', 'options' => []]],
          'sort' => ['standard' => 'name', 'keys' => ['name'], 'ersteRichtung' => ['name' => 'asc']],
          'columns' => [['label' => 'Name', 'sortierung' => 'name']],
          'pagination' => ['kind' => 'page', 'size' => 30],
        ];
        $state = ['q' => '', 'filters' => ['region' => []], 'sort' => 'name',
                  'sortDir' => 'desc', 'pagination' => ['kind' => 'page', 'page' => 2]];
        $model = \Llb\FilterModel::response($definition, $state,
          ['region' => [['value' => '268437557', 'count' => 12]]], 3095,
          ['kind' => 'page', 'page' => 2, 'pages' => 104, 'hasMore' => true]);
        echo json_encode([
          'keys' => array_keys($model),
          'sortDir' => $model['state']['sortDir'],
          'total' => $model['total'],
          'hasMore' => $model['pagination']['hasMore'],
          'valueIsString' => is_string($model['facets']['region'][0]['value']),
          'json' => \Llb\FilterModel::json($model),
        ]);
        ''')
        self.assertEqual(model['keys'], ['definition', 'state', 'facets', 'total', 'pagination'])
        self.assertEqual(model['sortDir'], 'desc')
        self.assertEqual(model['total'], 3095)
        self.assertTrue(model['hasMore'])
        self.assertTrue(model['valueIsString'], 'option values stay strings for the URL codec')
        encoded = json.loads(model['json'])
        self.assertEqual(encoded['definition']['columns'][0]['sortierung'], 'name')

    def test_title_order_follows_the_direction_and_keeps_ids_stable(self):
        order = self.php(r'''
        $rows = [
          ['id' => 'B', 'name' => 'Abenteurer'],
          ['id' => 'A', 'name' => 'Zwergentöter'],
          ['id' => 'C', 'name' => 'Abenteurer'],
        ];
        echo json_encode([
          'asc' => array_column(\Llb\Titles::sorted($rows), 'id'),
          'desc' => array_column(\Llb\Titles::sorted($rows, 'desc'), 'id'),
        ]);
        ''')
        self.assertEqual(order['asc'], ['B', 'C', 'A'])
        self.assertEqual(order['desc'], ['A', 'B', 'C'])


if __name__ == '__main__':
    unittest.main()
