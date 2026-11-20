"""Every catalogue entity has a list and a detail surface in the UI matrix.

The browser script `tests/browser_entitaeten_matrix.js` walks the matrix; this
guard keeps the matrix in step with the data-room contract so a new entity
cannot be added without a list/detail check.
"""
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
MATRIX = json.loads((ROOT / 'tests/entitaeten_matrix.json').read_text(encoding='utf-8'))
CONTRACT = json.loads((ROOT / 'docs/datenraum/lotro-datenraum-entitaeten.json').read_text(encoding='utf-8'))['entitaeten']


class EntitaetenMatrixTest(unittest.TestCase):
    def test_contract_entities_are_covered(self):
        covered = {row['kind'] for row in MATRIX['entities']}
        self.assertEqual(set(CONTRACT), covered & set(CONTRACT))
        for kind in CONTRACT:
            row = next(item for item in MATRIX['entities'] if item['kind'] == kind)
            self.assertTrue(row['detail'].startswith('/de/'), kind)
            self.assertIn('row', row, kind)

    def test_matrix_rows_are_distinct_and_absolute(self):
        details = [row['detail'] for row in MATRIX['entities'] if row['detail']]
        self.assertEqual(len(details), len(set(details)), 'Detailadresse doppelt')
        for row in MATRIX['entities']:
            if row['list']:
                self.assertTrue(row['list'].startswith('/de/'))
                self.assertTrue(row['row'])


if __name__ == '__main__':
    unittest.main()
