"""The set foundation preserves source IDs, missing pieces and bonus semantics."""
import json
import tempfile
import unittest
from pathlib import Path
from xml.sax.saxutils import quoteattr

from build_sets import LANGS, build, identifier, bonus_text


def xml_labels(values):
    return '<labels>' + ''.join('<label key=%s value=%s/>' % (quoteattr(k), quoteattr(v))
                                for k, v in values.items()) + '</labels>'


class SetsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.lore = Path(self.temp.name)
        (self.lore / 'sets.xml').write_text('''<sets>
          <set id="1879481188" name="Technical name" level="515" maxLevel="154">
            <item id="1879480885"/><item id="1879481097"/>
            <bonus nbItems="2">
              <stat name="DURATION" constant="5" operator="SUBSTRACT"/>
              <stat name="VITALITY" scaling="1234"/>
              <specialEffect label="key:description"/>
              <effect id="42" name="DNT - effect"/>
              <unrecognised value="secret-code"/>
            </bonus>
          </set>
          <set id="1879481189"><item id="1879480885"/><item id="1879480885"/></set>
          <set id="1879481190"/>
        </sets>''', encoding='utf-8')
        (self.lore / 'stats.xml').write_text('<stats><stat id="1" key="DURATION"/>'
                                           '<stat id="2" key="Vitality" legacyKey="VITALITY"/></stats>')
        (self.lore / 'classes.xml').write_text('<classes><class id="3" key="Hunter"/></classes>')
        for lang in LANGS:
            folder = self.lore / 'labels' / lang
            folder.mkdir(parents=True)
            for filename, values in {
                'itemsSets.xml': {'1879481188': 'Same name\n(Max Level: 154)',
                                 '1879481189': 'Same name', '1879481190': 'Empty set',
                                 'key:description': 'A recorded effect.'},
                'stats.xml': {'1': 'Duration', '2': 'Vitality'},
                'classes.xml': {'3': 'Hunter'}, 'effects.xml': {'42': 'DNT - effect'},
            }.items():
                (folder / filename).write_text(xml_labels(values), encoding='utf-8')
        self.item = identifier('1879480885')
        self.items = {self.item: {'n': {lang: 'Helm' for lang in LANGS}, 'ic': 123}}
        self.details = {self.item: {'set': '1879481188', 'category': 'ARMOUR',
                                   'subtype': 'MEDIUM', 'minLevel': 150, 'level': 523,
                                   'requiredClass': 'Hunter'}}

    def test_stable_ids_and_missing_members(self):
        catalogue, report, indexes = build(self.lore, self.items, self.details)
        self.assertEqual(len(catalogue['sets']), 3, 'Same names must not merge sets')
        first = catalogue['sets'][identifier('1879481188')]
        self.assertEqual(first['name']['de'], 'Same name')
        self.assertEqual(first['source_metadata'], {'level': '515', 'maxLevel': '154'})
        self.assertNotIn('min_level', first, 'Source metadata is not a level interval')
        self.assertEqual(len(first['members']), 2)
        self.assertFalse(first['members'][1]['available'])
        counts = report['counts']['problems']
        self.assertEqual(counts['missing_item'], 1)
        self.assertEqual(counts['duplicate_member'], 1)
        self.assertEqual(counts['conflicting_membership'], 1)
        self.assertEqual(counts['empty_set'], 1)
        for lang in LANGS:
            self.assertEqual(len(indexes[lang]['sets']), 2)
            witness = indexes[lang]['sets'][0]['members'][0]
            self.assertEqual(witness['class'], 'Hunter')
            self.assertEqual(witness['armour'], 'MEDIUM')
            self.assertEqual(witness['min_level'], 150)

    def test_bonus_definitions_not_guessed(self):
        catalogue, report, _ = build(self.lore, self.items, self.details)
        entries = catalogue['sets'][identifier('1879481188')]['bonuses'][0]['entries']
        self.assertEqual(entries[0]['source']['operator'], 'SUBSTRACT')
        self.assertFalse(entries[0]['display_ready'], 'No invented unit or evaluated value')
        self.assertEqual(entries[1]['mode'], 'scaling')
        self.assertFalse(entries[1]['display_ready'])
        self.assertTrue(entries[2]['display_ready'])
        self.assertFalse(entries[3]['display_ready'], 'DNT must not become player text')
        self.assertEqual(entries[3]['labels']['de'], '')
        self.assertEqual(report['counts']['problems']['unknown_bonus_type'], 1)

    def test_deterministic_and_no_account_data(self):
        a = json.dumps(build(self.lore, self.items, self.details), sort_keys=True)
        self.assertEqual(a, json.dumps(build(self.lore, self.items, self.details), sort_keys=True))
        self.assertNotIn(str(self.lore), a)

    def test_invalid_and_duplicate_ids_fail(self):
        for value in ['0', '-1', '4294967296']:
            with self.assertRaises(ValueError):
                identifier(value)
        (self.lore / 'sets.xml').write_text('<sets><set id="1"/><set id="1"/></sets>')
        with self.assertRaises(ValueError):
            build(self.lore, self.items, self.details)

    def test_typed_constants_and_operators(self):
        translated = {lang: 'Stat' for lang in LANGS}
        pct = {'isPercentage': 'true'}
        integer = {'type': 'INTEGER'}
        row = ET_from('<stat constant="15.000001"/>')
        self.assertEqual(bonus_text(row, translated, pct)['en'], 'Stat: +15 %')
        row = ET_from('<stat constant="2.5" operator="SUBSTRACT"/>')
        self.assertEqual(bonus_text(row, translated, pct)['de'], 'Stat: -2,5 %')
        self.assertEqual(bonus_text(ET_from('<stat constant="5" operator="SET"/>'), translated, integer)['en'], 'Stat: 5')
        self.assertIsNone(bonus_text(ET_from('<stat constant="5" operator="UNKNOWN"/>'), translated, integer))
        self.assertIsNone(bonus_text(ET_from('<stat constant="NaN"/>'), translated, integer))
        self.assertIsNone(bonus_text(ET_from('<stat scaling="1234"/>'), translated, integer))
        self.assertIsNone(bonus_text(ET_from('<stat constant="5"/>'), translated, {}), 'No guessed duration unit')

    def test_authored_override_and_unresolved_templates(self):
        row = ET_from('<stat scaling="1234" descriptionOverride="key:text"/>')
        text = {lang: 'A complete source description.' for lang in LANGS}
        self.assertEqual(bonus_text(row, text, {}), text)
        text['fr'] = 'Effect %s'
        self.assertIsNone(bonus_text(row, text, {}))

    def test_multiple_classes_use_source_keys(self):
        (self.lore / 'classes.xml').write_text('<classes><class id="3" key="Hunter"/><class id="4" key="Burglar"/></classes>')
        for lang in LANGS:
            (self.lore / 'labels' / lang / 'classes.xml').write_text(xml_labels({'3': 'Hunter', '4': 'Burglar'}))
        self.details[self.item]['requiredClass'] = 'Hunter;Burglar'
        catalogue, report, indexes = build(self.lore, self.items, self.details)
        member = catalogue['sets'][identifier('1879481188')]['members'][0]
        self.assertTrue(member['class_known'])
        self.assertEqual(member['classes'], ['Hunter', 'Burglar'])
        self.assertEqual(member['class_labels']['de'], 'Hunter / Burglar')
        self.assertNotIn('unknown_class', report['counts']['problems'])

    def test_missing_piece_can_still_have_a_source_name(self):
        missing = '1879481097'
        for lang in LANGS:
            (self.lore / 'labels' / lang / 'items.xml').write_text(xml_labels({missing: 'Source name'}))
        catalogue, _, _ = build(self.lore, self.items, self.details)
        member = catalogue['sets'][identifier('1879481188')]['members'][1]
        self.assertEqual(member['name']['de'], 'Source name')
        self.assertFalse(member['available'], 'A translated name does not create an item page')


def ET_from(text):
    import xml.etree.ElementTree as ET
    return ET.fromstring(text)


if __name__ == '__main__':
    unittest.main()
