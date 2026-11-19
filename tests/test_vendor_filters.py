"""Vendor filters distinguish regular vendors from barterers."""
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class VendorFilterLabelsTest(unittest.TestCase):
    def test_php_filter_labels_are_separate_from_detail_labels(self):
        code = (ROOT / 'php/src/Vendors.php').read_text(encoding='utf-8')
        self.assertIn("'type_filter_vendor' => 'Normaler Händler'", code)
        self.assertIn("'type_filter_both' => 'Tauschhändler'", code)
        self.assertIn("$words['type_filter_' . $value]", code)
        self.assertIn("'type_both' => 'Händler und Tauschhändler'", code)

    def test_related_vendor_filter_uses_barterer_label(self):
        code = (ROOT / 'web/entitaeten-listen.js').read_text(encoding='utf-8')
        self.assertIn("barter:lang==='de'?'Tauschhändler'", code)
        self.assertIn("lang==='fr'?'Marchand troqueur':'Barterer'", code)

    def test_vendor_list_does_not_append_unlabelled_stock_count(self):
        code = (ROOT / 'php/src/Vendors.php').read_text(encoding='utf-8')
        self.assertNotIn("$words['items_count_one']", code)
        self.assertNotIn("$words['items_count']", code)


if __name__ == '__main__':
    unittest.main()
