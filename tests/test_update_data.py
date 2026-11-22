import unittest

from tools.update_data import compare


class DataUpdateTest(unittest.TestCase):
    def test_first_language_display_value_does_not_count_as_change(self):
        texts = {'en': 'Book', 'de': 'Buch'}
        old = [{'id': 'A', 'title': {'value': 'Book', 'texts': texts}}]
        new = [{'id': 'A', 'title': {'value': 'Buch', 'texts': texts}}]
        self.assertEqual(compare(old, new)['changed'], [])

    def test_translation_and_geometry_changes_are_separate(self):
        old = [{'id': 'A', 'title': {'texts': {'de': 'Buch'}}, 'points': [1, 2]}]
        new = [{'id': 'A', 'title': {'texts': {'de': 'Heft'}}, 'points': [1, 3]}]
        self.assertEqual(compare(old, new)['changed'][0]['fields'], ['points.1', 'title.texts.de'])

    def test_localized_placeholder_display_does_not_count_as_change(self):
        texts = {'en': 'Found NUMBER', 'de': 'NUMBER gefunden'}
        old = [{'id': 'A', 'title': {'value': 'Found ${NUMBER}', 'texts': texts}}]
        new = [{'id': 'A', 'title': {'value': '${NUMBER} gefunden', 'texts': texts}}]
        self.assertEqual(compare(old, new)['changed'], [])

    def test_additions_and_removals_use_ids(self):
        result = compare({'A': {'n': 'Name'}}, {'B': {'n': 'Name'}})
        self.assertEqual(result['removed'], [{'id': 'A', 'name': 'Name'}])
        self.assertEqual(result['added'], [{'id': 'B', 'name': 'Name'}])

    def test_duplicate_records_fail_closed(self):
        rows = [{'id': 'A'}, {'id': 'A'}]
        with self.assertRaises(ValueError):
            compare(rows, rows)
