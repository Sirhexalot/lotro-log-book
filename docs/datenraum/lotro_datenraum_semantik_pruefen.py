"""Quantify documented semantic transformations without touching project/game files."""
import collections
import hashlib
import json
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, EXPORT

proofs = {}


def read(path):
    data = path.read_bytes()
    proofs[str(path)] = hashlib.sha256(data).hexdigest()
    return data


items = json.loads(read(EXPORT / 'items-2026-11-08/items.json'))['items']
recipes = json.loads(read(EXPORT / 'rezepte-2026-11-06/recipes.json'))['recipes']
meta = ET.fromstring(read(LORE / 'items.xml'))
matrix = collections.Counter()
for e in meta:
    ident = f'{int(e.get("key")):08X}'
    if ident in items:
        matrix[(e.get('binding', '<absent>'), str(items[ident].get('b', '<absent>')))] += 1
rx = ET.fromstring(read(LORE / 'recipes.xml'))
multi = [{'id': f'{int(e.get("id")):08X}', 'versions': len(e.findall('./recipeResult'))}
         for e in rx if len(e.findall('./recipeResult')) > 1]
compact_recipe_ids = {r['id'] for r in recipes}
chances = []
level_only_critical = []
byid = {f'{int(e.get("id")):08X}': e for e in rx}
for ident, e in byid.items():
    for version in e.findall('./recipeResult'):
        outputs = version.findall('./result')
        regular = next((o for o in outputs if o.get('critical') != 'true'), None)
        critical = next((o for o in outputs if o.get('critical') == 'true'), None)
        if regular is None or critical is None:
            continue
        a, b = regular.find('resultItem'), critical.find('resultItem')
        if a is None or b is None:
            continue
        if (a.get('itemId') == b.get('itemId')
                and regular.get('quantity', '1') == critical.get('quantity', '1')
                and regular.get('itemLevel') != critical.get('itemLevel')):
            level_only_critical.append({'recipe_id': ident, 'regular': regular.attrib,
                                        'critical': critical.attrib, 'item_id': a.get('itemId')})
for r in recipes:
    if 'ch' not in r:
        continue
    first = byid.get(r['id'])
    versions = first.findall('./recipeResult') if first is not None else []
    if versions and versions[0].get('baseCriticalChance') is not None:
        target = int(versions[0].get('baseCriticalChance'))
        transformed = int(r['ch'] * 100)
        chances.append({'id': r['id'], 'compact_fraction': r['ch'],
                        'companion_percent_integer': target, 'expected_from_compact': transformed,
                        'equal': target == transformed})
srcroot = (OUT.home() / 'Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation'
           '/src/main/java/delta/games/lotro/tools/extraction')
reviewed = [
    'achievables/QuestRequirementsLoader.java', 'utils/OperatorUtils.java',
    'items/MainDatItemsLoader.java', 'items/ItemDetailsLoader.java',
    'crafting/MainDatRecipesLoader.java', 'loot/LootLoader.java',
    'loot/LootProbabilities.java', 'common/CooldownLoader.java',
    'trade/MainDatTradeLoader.java',
]
for name in reviewed:
    read(srcroot / name)
result = {
    'binding_matrix': [{'companion_binding': a, 'compact_b': b, 'count': count}
                       for (a, b), count in sorted(matrix.items())],
    'multiple_recipe_versions': multi,
    'multiple_recipe_versions_present_in_compact': sum(r['id'] in compact_recipe_ids for r in multi),
    'critical_chance_comparison': chances,
    'same_item_same_quantity_different_result_item_level': level_only_critical,
    'reviewed_code_root': str(srcroot), 'source_sha256': proofs,
}
(OUT / 'lotro-datenraum-semantik-pruefung.json').write_text(json.dumps(result, indent=2))
print('binding combinations', len(matrix), 'multi-version recipes', len(multi),
      'chance comparisons', len(chances), 'chance differences', sum(not c['equal'] for c in chances))
print('binding', dict(matrix))
