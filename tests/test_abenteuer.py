"""Adventure catalogue: reference data, map assignment and the built output."""
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from tools.build_abenteuer import (build, excluded_subtrees, innermost, map_assignment,
                                   name_for, one_time, quantile, level_range)

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = json.loads((ROOT / 'referenz/inhaltspakete.json').read_text(encoding='utf-8'))
PACKS = [{'id': 'base', 'order': 0, 'type': 'base', 'release': '2007-04-24',
          'name': {'de': 'Grundspiel', 'en': 'Base', 'fr': 'Base'},
          'summary': {'de': 'Anfang', 'en': 'Start', 'fr': 'Début'},
          'levels': [1, 50], 'candidate_map_roots': [1],
          'excluded_map_roots': [3], 'review': 'landscape'},
         {'id': 'moria', 'order': 1, 'type': 'expansion', 'release': '2008-11-18',
          'name': {'de': 'Moria', 'en': 'Moria', 'fr': 'Moria'},
          'summary': {'de': 'Tiefen', 'en': 'Depths', 'fr': 'Profondeurs'},
          'levels': [49, 60], 'candidate_map_roots': [4],
          'excluded_map_roots': [], 'review': 'landscape'}]
TREE = {1: {'eltern': None, 'name': 'Eriador'},
        2: {'eltern': 1, 'name': 'Bree-land'},
        3: {'eltern': 2, 'name': 'Wildwood'},
        4: {'eltern': None, 'name': 'Moria'},
        5: {'eltern': 4, 'name': ''},
        6: {'eltern': None, 'name': 'Elsewhere'}}


class ReferenceTests(unittest.TestCase):
    def test_reference_lists_every_expansion_in_order(self):
        packs = REFERENCE['packs']
        self.assertEqual([p['order'] for p in packs], list(range(len(packs))))
        self.assertEqual(len({p['id'] for p in packs}), len(packs))
        self.assertEqual([p['release'] for p in packs], sorted(p['release'] for p in packs))
        free = {p['id'] for p in packs if p.get('free')}
        self.assertEqual(free, {'base', 'yondershire', 'wildwood', 'angle-mitheithel', 'hatokali'})
        self.assertEqual({p['type'] for p in packs},
                         {'base', 'expansion', 'mini-expansion', 'quest-pack', 'update'})
        self.assertEqual(REFERENCE['artwork']['status'], 'pending')

    def test_every_pack_carries_three_names_and_a_plausible_level_band(self):
        for pack in REFERENCE['packs']:
            if pack.get('name_map'):
                self.assertFalse(pack.get('name'), pack['id'])
            else:
                for lang in ('de', 'en', 'fr'):
                    self.assertTrue(pack['name'][lang].strip(), (pack['id'], lang))
            low, high = pack['levels']
            self.assertLessEqual(low, high, pack['id'])
            self.assertGreater(low, 0)
            self.assertEqual(pack['review'], 'landscape', pack['id'])
            self.assertTrue(pack['candidate_map_roots'], pack['id'])

    def test_exclusions_explain_themselves(self):
        for pack in REFERENCE['packs']:
            if pack['excluded_map_roots']:
                self.assertTrue((pack.get('excluded_note') or pack.get('note') or '').strip(),
                                pack['id'])


class AssignmentTests(unittest.TestCase):
    def test_one_pack_per_map_and_exclusions_cut_the_subtree(self):
        assignment = map_assignment(PACKS, TREE)
        self.assertEqual(assignment, {1: 'base', 2: 'base', 4: 'moria', 5: 'moria'})
        self.assertNotIn(3, assignment)
        self.assertNotIn(6, assignment)

    def test_an_exclusion_of_one_pack_does_not_remove_another_pack(self):
        packs = [{'id': 'old', 'order': 0, 'candidate_map_roots': [1], 'excluded_map_roots': [2]},
                 {'id': 'new', 'order': 1, 'candidate_map_roots': [2], 'excluded_map_roots': []}]
        tree = {1: {'eltern': None}, 2: {'eltern': 1}}
        self.assertEqual(map_assignment(packs, tree), {1: 'old', 2: 'new'})
        excluded = excluded_subtrees(packs, tree)
        self.assertEqual(excluded['old'], {2})
        self.assertEqual(excluded['new'], set())

    def test_unknown_maps_cycles_and_ambiguity_fail(self):
        with self.assertRaisesRegex(ValueError, 'unknown map'):
            map_assignment([{'id': 'a', 'candidate_map_roots': [99]}], TREE)
        with self.assertRaisesRegex(ValueError, 'cycle'):
            map_assignment([{'id': 'a', 'candidate_map_roots': [1]}],
                           {1: {'eltern': 2}, 2: {'eltern': 1}})
        with self.assertRaisesRegex(ValueError, 'belongs to'):
            map_assignment([{'id': 'a', 'candidate_map_roots': [1]},
                            {'id': 'b', 'candidate_map_roots': [1]}], TREE)


class QuestRuleTests(unittest.TestCase):
    def test_only_one_time_quests_count(self):
        for flags in ({'rp': -1}, {'rp': 5}, {'dy': 1}, {'x': 1}, {'ix': 1}):
            self.assertFalse(one_time(flags), flags)
        self.assertTrue(one_time({'rp': 1}))
        self.assertTrue(one_time({}))

    def test_innermost_map_decides_and_exclusion_is_per_pack(self):
        assignment = {1: 'base', 2: 'base', 4: 'moria'}
        excluded = {'base': {3}, 'moria': set()}
        self.assertEqual(innermost({'fk': [1, 2]}, assignment, excluded), 2)
        self.assertIsNone(innermost({'fk': [1, 2, 3]}, assignment, excluded))
        self.assertIsNone(innermost({'fk': [9]}, assignment, excluded))
        self.assertIsNone(innermost({}, assignment, excluded))

    def test_quantiles_ignore_a_single_outlier(self):
        self.assertEqual(quantile([1, 2, 3, 4, 5, 6, 7, 8, 9, 115], 0.9), 9)
        self.assertEqual(level_range([10]), (10, 10))
        self.assertEqual(level_range([]), (None, None))

    def test_unnamed_sub_map_falls_back_to_its_parent_name(self):
        self.assertEqual(name_for(5, TREE, {4: 'Moria'}), 'Moria')
        self.assertEqual(name_for(2, TREE, {2: 'Bree-land'}), 'Bree-land')
        self.assertEqual(name_for(6, TREE, {}), '')


def build_fixture(lang='de'):
    quests = [
        {'i': '00000001', 'l': '5', 'fk': [1, 2]},
        {'i': '00000002', 'l': '7', 'fk': [1, 2], 'vl': '6'},
        {'i': '00000003', 'l': '6', 'fk': [1, 2, 3]},
        {'i': '00000004', 'l': '50', 'fk': [4, 5], 'vb': 1},
        {'i': '00000005', 'l': '6', 'fk': [1, 2], 'x': 1},
        {'i': '00000006', 'l': '6', 'fk': [99]},
    ]
    return build(lang, PACKS, TREE, quests, {1: 'Eriador', 2: 'Bree-land', 3: 'Wildwood',
                                             4: 'Moria', 5: ''})


class CatalogueTests(unittest.TestCase):
    def test_excluded_content_belongs_to_no_pack(self):
        data = build_fixture()
        ids = {q['i'] for q in data['quests']}
        self.assertEqual(ids, {'00000001', '00000002', '00000004'})
        base = [a for a in data['areas'] if a['pack'] == 'base']
        self.assertEqual([a['name'] for a in base], ['Bree-land'])
        self.assertEqual(base[0]['quests'], 2)

    def test_catalogue_is_language_neutral_except_names(self):
        german = build_fixture('de')
        french = build_fixture('fr')
        self.assertEqual([q['i'] for q in german['quests']], [q['i'] for q in french['quests']])
        self.assertEqual(german['packs'][0]['name'], 'Grundspiel')
        self.assertEqual(french['packs'][0]['name'], 'Base')
        self.assertEqual(german['packs'][0]['level_source'], 'editorial')
        self.assertEqual(german['level_source'], 'editorial')
        self.assertEqual(german['schema'], 2)

    def test_derived_area_levels_are_labelled(self):
        data = build_fixture()
        for area in data['areas']:
            self.assertEqual(area['level_source'], 'quests_p10_p90')
            self.assertTrue(area['reviewed'])
            self.assertIsNotNone(area['level_min'])
            self.assertIsNotNone(area['level_max'])
        self.assertEqual(data['packs'][0]['level_min'], 1)
        self.assertEqual(data['packs'][0]['level_max'], 50)

    def test_quest_rows_keep_prerequisites_and_uppercase_ids(self):
        data = build_fixture()
        row = [q for q in data['quests'] if q['i'] == '00000004'][0]
        self.assertEqual(row['vb'], 1)
        self.assertEqual(row['area'], '5')
        self.assertEqual(row['l'], '50')


class BuiltCatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix='llb-abenteuer-'))
        cls.web = cls.tmp / 'web'
        cls.web.mkdir()
        subprocess.run(['python3', 'tools/build_abenteuer.py', '--ziel', str(cls.tmp / 'data'),
                        '--web', str(cls.web)],
                       cwd=ROOT, check=True, capture_output=True)
        cls.files = {lang: json.loads((cls.tmp / 'data' / lang / 'abenteuer.json').read_text())
                     for lang in ('de', 'en', 'fr')}

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_every_adventure_has_content_and_a_clean_denominator(self):
        for lang, data in self.files.items():
            self.assertEqual(len(data['packs']), len(REFERENCE['packs']), lang)
            self.assertTrue(all(pack['reviewed'] for pack in data['packs']), lang)
            self.assertTrue(all(pack['quests'] > 0 for pack in data['packs']), lang)
            ids = {area['id'] for area in data['areas']}
            self.assertTrue(all(quest['area'] in ids for quest in data['quests']), lang)
            self.assertEqual(len(data['quests']), len({q['i'] for q in data['quests']}), lang)
            self.assertEqual(sum(pack['quests'] for pack in data['packs']), len(data['quests']), lang)

    def test_later_content_stays_out_of_older_adventures(self):
        data = self.files['de']
        packs = {pack['id']: pack for pack in data['packs']}
        self.assertTrue([a for a in data['areas'] if a['pack'] == 'minas-morgul'],
                        'Morgul Vale is its own adventure')
        # Wildwood and the Angle were later free updates inside Eriador.
        base_names = {area['name'] for area in data['areas'] if area['pack'] == 'base'}
        self.assertNotIn('Der Wildwald', base_names)
        self.assertNotIn('Der Winkel am Mitheithel', base_names)
        self.assertNotIn('Hatokáli-Hügel', {a['name'] for a in data['areas'] if a['pack'] == 'harad'})
        self.assertEqual(packs['base']['level_min'], 1)

    def test_names_follow_the_language(self):
        german = {area['id']: area['name'] for area in self.files['de']['areas']}
        french = {area['id']: area['name'] for area in self.files['fr']['areas']}
        self.assertTrue(any(german[key] != french[key] for key in german if key in french))
        names = {lang: {pack['id']: pack['name'] for pack in data['packs']}
                 for lang, data in self.files.items()}
        self.assertEqual(names['de']['base'], 'Die Schatten von Angmar')
        self.assertEqual(names['en']['moria'], 'Mines of Moria')
        self.assertEqual(names['fr']['base'], 'Les Ombres d’Angmar')

    def test_browser_catalogue_matches_the_server_file(self):
        for lang in ('de', 'en', 'fr'):
            text = (self.web / ('abenteuer-%s.js' % lang)).read_text(encoding='utf-8')
            self.assertTrue(text.startswith('window.MQL_ABENTEUER_KATALOG = '))
            payload = text[text.index('{'):text.rindex('}') + 1]
            self.assertEqual(json.loads(payload), self.files[lang])


class EngineTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node required')
    def test_browser_engine(self):
        subprocess.run(['node', 'tests/test_abenteuer.js'], cwd=ROOT, check=True,
                       capture_output=True, text=True)
