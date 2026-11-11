import unittest
from tools.export_instance_finder import build


class InstanceFinderExportTests(unittest.TestCase):
    def fixture(self):
        control = [{'id': '7001B7CE', 'class_index': 2606, 'properties': {
            'WorldJoin_AvailablePETemplates_Array': [1],
            'WorldJoinControl_InstanceGroups': [{
                'WorldJoinControl_Instance_Group_Label': 2,
                'WorldJoinControl_Grouped_Instance_List': [2]}]}}]
        templates = [{'id': f'{i:08X}', 'properties': {
            'PrivateEncounterTemplate_Name': {'texts': dict.fromkeys(('de', 'en', 'fr'), f'Name {i}')},
            'WorldJoin_EncounterCategory': 6, 'WorldJoin_EncounterType': 4,
            'Skirmish_Template_GroupSizeArray': [3, 6],
            'Skirmish_Template_MinLevelScale': 20,
            'Skirmish_Template_MaxLevelScale': 160,
        }} for i in (1, 2, 3)]
        enums = [f'WJEncounterCategory\t6\t{lang}\tCluster' for lang in ('de', 'en', 'fr')]
        return control, templates, enums

    def test_only_explicit_finder_members_not_all_templates(self):
        result = build(*self.fixture())
        self.assertEqual([r['id'] for r in result['instances']], ['00000001', '00000002'])
        self.assertEqual(result['epic_battle_count'], 1)
        self.assertEqual(result['instances'][1]['picker'], 'epic_battle')
        self.assertEqual(result['instances'][0]['group_sizes'], [3, 6])
        self.assertEqual(result['instances'][0]['level_min'], 20)
        self.assertEqual(result['instances'][0]['cluster']['de'], 'Cluster')

    def test_missing_reference_fails_instead_of_silently_dropping(self):
        control, templates, enums = self.fixture()
        with self.assertRaisesRegex(ValueError, 'Missing finder template'):
            build(control, templates[:1], enums)

    def test_missing_translation_fails(self):
        control, templates, enums = self.fixture()
        with self.assertRaisesRegex(ValueError, 'Missing cluster label'):
            build(control, templates, enums[:1])
