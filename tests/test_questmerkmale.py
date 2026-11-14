"""Which instance belongs to which chapter, and which completion rules a quest out.

The rules come from the client export only, so the tests use a small synthetic
export instead of the real one (which is not part of the repository).
"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

from build_questmerkmale import lies  # noqa: E402

COMPLETED = 0x30000000
UNDERWAY = 0x10000000


def quest(ident, name, category=32, instance=False, contains_instance=False, requirements=()):
    properties = {'Quest_Name': {'texts': {'de': name}}, 'Quest_Category': category}
    if instance:
        properties['Quest_IsInstanceQuest'] = 1
    if contains_instance:
        properties['Quest_ContainsInstanceQuest'] = 1
    if requirements:
        properties['DefaultPermissionBlobStruct'] = {'Usage_QuestRequirements': [
            {'Usage_QuestID': int(target, 16), 'Usage_Operator': operator, 'Usage_QuestStatus': status}
            for target, operator, status in requirements]}
    return {'id': ident, 'properties': properties}


class InstancePairingTests(unittest.TestCase):
    def setUp(self):
        self.rows = [
            quest('70000001', 'Buch 1, Kapitel 11: Othrongroth', contains_instance=True),
            quest('70000002', 'Instanz: Othrongroth', instance=True),
            quest('70000003', 'Buch 1, Kapitel 12: Pläne des Reiters'),
            quest('70000004', 'Instanz: Pläne des Reiters', instance=True),
        ]

    def write(self, rows):
        folder = tempfile.mkdtemp(prefix='llb-merkmale-')
        path = Path(folder) / 'quests.json'
        path.write_text(json.dumps(rows), encoding='utf-8')
        return path

    def test_instance_is_paired_with_the_same_title_in_the_same_book(self):
        instanzen, _ = lies(self.write(self.rows))
        self.assertEqual(instanzen, {'70000002': '70000001', '70000004': '70000003'})

    def test_a_title_in_another_book_is_no_pair(self):
        rows = [quest('70000001', 'Buch 1, Kapitel 11: Othrongroth', category=32),
                quest('70000002', 'Instanz: Othrongroth', category=56, instance=True)]
        instanzen, _ = lies(self.write(rows))
        self.assertEqual(instanzen, {})

    def test_two_instances_for_one_chapter_stay_rows_of_their_own(self):
        rows = self.rows + [quest('70000005', 'Instanz: Othrongroth', instance=True)]
        instanzen, _ = lies(self.write(rows))
        self.assertNotIn('70000002', instanzen)
        self.assertNotIn('70000005', instanzen)
        self.assertIn('70000004', instanzen)

    def test_unmatched_instance_stays_visible(self):
        rows = self.rows + [quest('70000006', 'Instanz: Etwas ganz anderes', instance=True)]
        instanzen, _ = lies(self.write(rows))
        self.assertNotIn('70000006', instanzen)


class ExclusionTests(unittest.TestCase):
    def rows(self, operator, status):
        return [quest('70000010', '4. Zwischenspiel: Halros Wache',
                      requirements=[('700000AA', operator, status)])]

    def test_completed_target_rules_the_quest_out(self):
        _, ausgeschlossen = lies(self._write(self.rows(2, COMPLETED)))
        self.assertEqual(ausgeschlossen, {'70000010': ['700000AA']})

    def test_underway_target_is_no_permanent_exclusion(self):
        _, ausgeschlossen = lies(self._write(self.rows(2, UNDERWAY)))
        self.assertEqual(ausgeschlossen, {})

    def test_required_target_is_no_exclusion(self):
        _, ausgeschlossen = lies(self._write(self.rows(3, COMPLETED)))
        self.assertEqual(ausgeschlossen, {})

    def _write(self, rows):
        folder = Path(tempfile.mkdtemp(prefix='llb-merkmale-'))
        path = folder / 'quests.json'
        path.write_text(json.dumps(rows), encoding='utf-8')
        return path


class BuiltMerkmaleTests(unittest.TestCase):
    """The generated file stays inside what the client export contains."""

    def test_file_has_a_known_shape(self):
        path = ROOT / 'daten' / 'questmerkmale.json'
        if not path.is_file():
            self.skipTest('daten/questmerkmale.json not built')
        data = json.loads(path.read_text(encoding='utf-8'))
        self.assertEqual(data['schema'], 1)
        self.assertTrue(data['instanzen'])
        for instanz, kapitel in data['instanzen'].items():
            self.assertRegex(instanz, r'^[0-9A-F]{8}$')
            self.assertRegex(kapitel, r'^[0-9A-F]{8}$')
            self.assertNotEqual(instanz, kapitel)
        for quest, targets in data['ausgeschlossen'].items():
            self.assertNotIn(quest, targets)


if __name__ == '__main__':
    unittest.main()
