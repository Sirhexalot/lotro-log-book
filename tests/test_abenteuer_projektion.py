"""Approximate Mordor landscape markers must never invent cross-world positions."""
import copy
import json
import unittest
from tools.build_abenteuer import DATEN, catalogues, link_positions, map_positions, mordor_projection, name_for


class MordorProjectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tree = {int(r['idx']): r for r in json.loads((DATEN / 'karten.json').read_text())}
        cls.links = link_positions()
        cls.data = catalogues()

    def test_same_positions_in_every_language(self):
        self.assertEqual(self.data['de']['positions'], self.data['en']['positions'])
        self.assertEqual(self.data['de']['positions'], self.data['fr']['positions'])

    def test_technical_map_labels_fall_back_to_named_parent(self):
        tree = {1: {'eltern': 2}, 2: {}}
        for prefix in ('Karte', 'Map', 'Carte'):
            self.assertEqual(name_for(1, tree, {1: prefix + ' 268455287', 2: 'Draugardh'}), 'Draugardh')
        # Unnamed sub-maps do not become their own area at all: they count at
        # the named parent, so neither the technical label nor a duplicate of
        # the parent's name can show up in the list.
        for lang, data in self.data.items():
            ids = {area['id'] for area in data['areas']}
            self.assertNotIn('268455287', ids, lang)
            for area in data['areas']:
                self.assertFalse(area['name'].startswith(('Karte ', 'Map ', 'Carte ')),
                                 (lang, area['id'], area['name']))

    def test_ordinary_gorgoroth_areas_have_in_frame_derived_points(self):
        positions = self.data['de']['positions']
        for ident in ('268452254', '268452250', '268452251', '268452249', '268452253'):
            self.assertIn(ident, positions['derived'])
            self.assertTrue(all(0 <= value <= 100 for value in positions['areas'][ident]))

    def test_direct_links_are_not_moved(self):
        points = self.data['de']['positions']['areas']
        for ident in (268451784, 268451973, 268453364):
            x, y = self.links[268453620][ident]
            self.assertEqual(points[str(ident)], [round(x / 1024 * 100, 2), round(-y / 768 * 100, 2)])

    def test_other_worlds_and_time_variants_are_not_projected(self):
        derived = self.data['de']['positions']['derived']
        for ident in ('268453374', '268452361', '268452343', '268455274', '268455287', '268455280', '268455278'):
            self.assertNotIn(ident, derived)

    def test_bad_or_insufficient_anchors_disable_fallback(self):
        self.assertIsNone(mordor_projection(self.tree, {}))
        links = copy.deepcopy(self.links)
        links[268453620][268451784] = (900, -700)
        self.assertIsNone(mordor_projection(self.tree, links))

    def test_missing_geometry_keeps_only_explicit_links(self):
        data = self.data['de']
        positions = map_positions(data['areas'], self.links)
        self.assertFalse(positions['derived'])
        self.assertNotIn('268452254', positions['areas'])


if __name__ == '__main__':
    unittest.main()
