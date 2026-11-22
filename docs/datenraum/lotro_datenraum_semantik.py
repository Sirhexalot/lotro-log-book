"""Capture concrete extractor property reads and semantic cross-checks."""
import collections
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, EXPORT, table
from pathlib import Path

ROOT = Path.home() / 'Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation/src/main/java/delta/games/lotro/tools/extraction'
FILES = [
    'achievables/QuestRequirementsLoader.java', 'utils/OperatorUtils.java',
    'achievables/DatRolesLoader.java', 'achievables/DatObjectivesLoader.java',
    'achievables/AchievableEventIDLoader.java', 'achievables/MainDatAchievablesLoader.java',
    'items/MainDatItemsLoader.java', 'items/ItemDetailsLoader.java',
    'items/MainDatItemsSetsLoader.java', 'items/ItemValueLoader.java',
    'crafting/MainDatRecipesLoader.java', 'crafting/RecipeItemsLoader.java',
    'loot/LootLoader.java', 'loot/LootProbabilities.java',
    'trade/MainDatTradeLoader.java', 'common/CooldownLoader.java',
    'requirements/UsageRequirementsLoader.java', 'requirements/RequirementsLoadingUtils.java',
    'requirements/LootFilterLoader.java', 'travels/MainDatTravelsWebLoader.java',
    'factions/MainDatFactionsLoader.java', 'characters/VirtueDataLoader.java',
    'geo/MainGeoDatLoader.java', 'geo/MainDatLandmarksLoader.java',
    'instances/MainDatPrivateEncountersLoader.java', 'titles/MainDatTitlesLoader.java',
    'emotes/MainDatEmotesLoader.java',
]
proofs = []
hashes = {}
for name in FILES:
    path = ROOT / name
    text = path.read_text()
    hashes[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    for n, line in enumerate(text.splitlines(), 1):
        # Only explicit reads, not commented examples or guessed setters.
        if line.lstrip().startswith(('//', '*')):
            continue
        found = re.findall(r'(?:getProperty|getPropertyValueByName)\("([^"]+)"\)', line)
        for prop in found:
            proofs.append({'property': prop, 'source': name, 'line': n, 'code': line.strip()})
lines = [
    '# Semantics: concrete property read index of the extractor', '',
    'This is an evidence index, not an automatic translation of meaning. '
    'It captures explicit property reads in the extractor files named below, which were '
    'actually read. Dynamic property names, indirect helpers and further files are '
    'therefore not completely covered. Comments are not counted as implementation '
    'evidence. The local source state must not be treated as identical to every '
    'installed JAR without a build/commit comparison.', '',
    table(['Property', 'Source evidence', 'Actual access'],
          [(p['property'], f'{p["source"]}:{p["line"]}', '`' + p['code'] + '`')
           for p in sorted(proofs, key=lambda p: (p['property'], p['source'], p['line']))]), ''
]
(OUT / 'lotro-datenraum-semantik-leseindex.md').write_text('\n'.join(lines))


def x(name):
    path = LORE / name
    hashes[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    return ET.parse(path).getroot()


items = x('items.xml')
recipes = x('recipes.xml')
itempath = EXPORT / 'items-2026-11-08/items.json'
hashes[str(itempath)] = hashlib.sha256(itempath.read_bytes()).hexdigest()
compact = json.loads(itempath.read_text())['items']
binding = collections.Counter(e.get('binding', '<absent>') for e in items)
account_collapsed = []
for e in items:
    ident = f'{int(e.get("key")):08X}'
    if e.get('binding') == 'BOUND_TO_ACCOUNT_ON_ACQUIRE' and compact.get(ident, {}).get('b') == 1:
        account_collapsed.append(ident)
versions = collections.Counter(len(e.findall('recipeResult')) for e in recipes)
optional_chance = collections.Counter(e.get('criticalChanceBonus') for e in recipes.iter('ingredient')
                                      if e.get('criticalChanceBonus') is not None)
same_item_quantity_different_level = []
for e in recipes:
    for version in e.findall('recipeResult'):
        outputs = version.findall('result')
        regular = next((r for r in outputs if r.get('critical') != 'true'), None)
        critical = next((r for r in outputs if r.get('critical') == 'true'), None)
        if regular is None or critical is None:
            continue
        a, b = regular.find('resultItem'), critical.find('resultItem')
        if a is not None and b is not None and a.get('itemId') == b.get('itemId'):
            if regular.get('quantity', '1') == critical.get('quantity', '1'):
                if regular.get('itemLevel') != critical.get('itemLevel'):
                    same_item_quantity_different_level.append(e.get('id'))
data = {'property_reads': proofs, 'source_sha256': hashes,
        'item_bindings': dict(binding), 'account_binding_collapsed_to_b1': account_collapsed,
        'recipe_versions_per_recipe': dict(versions), 'optional_critical_bonus_values': dict(optional_chance),
        'same_item_same_quantity_different_result_item_level': same_item_quantity_different_level}
(OUT / 'lotro-datenraum-semantik-belege.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
print('files', len(FILES), 'explicit reads', len(proofs), 'unique properties', len({p['property'] for p in proofs}),
      'account binding collapsed', len(account_collapsed), 'recipe versions', dict(versions),
      'level-only critical distinction', len(same_item_quantity_different_level))
