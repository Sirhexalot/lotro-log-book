"""Extended typed reference audit. Writes only to ~/.opencode/plan."""
import collections
import hashlib
import json
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, EXPORT, table

trees = {}
inputs = {}


def tree(name):
    if name not in trees:
        path = LORE / name
        inputs[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
        trees[name] = ET.parse(path).getroot()
    return trees[name]


def targets(specs):
    return {e.get(attr) for fn, selector, attr in specs
            for e in tree(fn).findall(selector) if e.get(attr) is not None}


I = [('items.xml', './item', 'key')]
A = [('quests.xml', './quest', 'id'), ('deeds.xml', './deed', 'id')]
M = [('maps/maps/maps.xml', './map', 'id')]
E = [('effects.xml', './*', 'id')]
S = [('skills.xml', './*', 'identifier')]
P = [('progressions.xml', './*', 'identifier')]
T = [('traits.xml', './trait', 'identifier')]
R = [('relics.xml', './/relic', 'id')]
rules = []


def rule(fn, sel, attr, ts, note):
    rules.append((fn, sel, attr, ts, note))


rule('vendors.xml', './/sellList', 'sellListId',
     [('vendors.xml', './sellList', 'sellListId')], 'Vendor → sell list')
rule('vendors.xml', './/sellEntry', 'id', I, 'Sell entry → item')
rule('barters.xml', './barterer/barterProfile', 'profileId',
     [('barters.xml', './barterProfile', 'profileId')], 'Barter vendor → barter profile')
for tag in ['give', 'receive']:
    rule('barters.xml', './/' + tag, 'id', I, 'Barter entry ' + tag + ' → item')
rule('barters.xml', './/receiveReputation', 'factionId',
     [('factions.xml', './faction', 'id')], 'Reputation gain → faction')
for tag in ['itemsTableEntry', 'trophyListEntry']:
    rule('loots.xml', './/' + tag, 'itemId', I, 'Loot entry → item')
for tag in ['treasureListEntry', 'trophyListEntry']:
    rule('loots.xml', './/' + tag, 'treasureGroupProfileId',
         [('loots.xml', './itemsTable', 'id'), ('loots.xml', './treasureList', 'id')],
         'Loot profile ID → itemsTable or treasureList; target types kept separate')
rule('loots.xml', './/weightedTreasureTableEntry', 'trophyListId',
     [('loots.xml', './trophyList', 'id')], 'Weighted table → trophy list')
for attr, target in [('trophyListId', 'trophyList'), ('weightedTreasureTableId', 'weightedTreasureTable')]:
    rule('loots.xml', './/filteredTrophyTableEntry', attr,
         [('loots.xml', './' + target, 'id')], 'Filtered table → ' + target)
for tag in ['relicsListEntry', 'relicsTreasureGroupEntry']:
    rule('loots.xml', './/' + tag, 'relicId', R, 'Relic loot → relic')
rule('loots.xml', './/relicsListEntry', 'relicsTreasureGroupId',
     [('loots.xml', './relicsTreasureGroup', 'id')], 'Relic list → relic group')
for attr, tag in [('treasureListId', 'treasureList'), ('trophyListId', 'trophyList'),
                  ('weightedTreasureTableId', 'weightedTreasureTable'),
                  ('filteredTrophyTableId', 'filteredTrophyTable'),
                  ('filteredTrophyTableId2', 'filteredTrophyTable'),
                  ('filteredTrophyTableId3', 'filteredTrophyTable')]:
    rule('containers.xml', './container', attr, [('loots.xml', './' + tag, 'id')], 'Container → ' + tag)
rule('containers.xml', './relicsContainer', 'relicId', R, 'Relic container → relic')
rule('containers.xml', './relicsContainer', 'relicsListId',
     [('loots.xml', './relicsList', 'id')], 'Relic container → relic list')
for tag, attr, ts in [('skill', 'id', S), ('effect', 'id', E),
                     ('trait', 'pointCostProgression', P), ('trait', 'rankOverlayProgression', P)]:
    rule('traits.xml', './/' + tag, attr, ts, 'Trait substructure → ' + str(ts))
for tag, attr, ts in [('effect', 'id', E), ('requiredEffect', 'id', E),
                     ('requiredTrait', 'id', T), ('combo', 'skillID', S),
                     ('details', 'inductionId', [('inductions.xml', './induction', 'id')]),
                     ('attack', 'maxDamageProgression', P), ('attack', 'dpsModProgression', P)]:
    rule('skills.xml', './/' + tag, attr, ts, 'Skill substructure → ' + str(ts))
for tag in ['powerCost', 'powerCostPerSecond', 'moraleCost', 'moraleCostPerSecond']:
    rule('skills.xml', './/' + tag, 'pointsProgression', P, 'Cost → progression')
rule('parchmentMaps.xml', './parchmentMap', 'id', M, 'Map → geometry of the same map ID')
rule('maps/links.xml', './link', 'parentId',
     M + [('geoAreas.xml', './area', 'id')],
     'Link source ID → map or area ID; mixed ID space, no general map hierarchy')
rule('maps/links.xml', './link', 'target', M, 'Link target ID → map (target hypothesis)')
rule('privateEncounters.xml', './/map', 'mapId', M, 'Instance map entry → map')
for tag in ['privateEncounter', 'skirmishPrivateEncounter', 'questToBestow', 'randomQuest']:
    rule('privateEncounters.xml', './/' + tag, 'questId', A, 'Instance template → quest/deed ID space')
for fn in ['quests.xml', 'deeds.xml']:
    for tag, attr, ts in [('skillUsed', 'skillId', S), ('monsterDied', 'mobId', [('mobs.xml', './mob', 'id')]),
                         ('npcTalk', 'npcId', [('NPCs.xml', './NPC', 'id')]),
                         ('questComplete', 'achievableId', A), ('questBestowed', 'achievableId', A),
                         ('inventoryItem', 'itemId', I), ('itemUsed', 'itemId', I)]:
        rule(fn, './/' + tag, attr, ts, 'Quest/deed condition → typed target')

results = []
for fn, sel, attr, ts, note in rules:
    ids = targets(ts)
    vals = [e.get(attr) for e in tree(fn).findall(sel) if e.get(attr) is not None]
    missing = collections.Counter(v for v in vals if v not in ids)
    results.append({'source': fn, 'selector': sel, 'attribute': attr, 'targets': ts,
                    'meaning': note, 'references': len(vals), 'resolved': sum(v in ids for v in vals),
                    'unresolved': dict(missing), 'zero_sentinels': vals.count('0')})

# Resolve the formerly "missing NPCs" without inventing names or NPC class semantics.
old = json.loads((OUT / 'lotro-datenraum-relationen.json').read_text())
unresolved = next(r['unresolved'] for r in old if r['selector'] == './/bestower')
want = {f'{int(k):08X}': n for k, n in unresolved.items()}
found = {}
for name in ['npcs-2026-11-03', 'placed-2026-11-03']:
    path = EXPORT / name / 'raw.jsonl'
    inputs[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    for line in path.open():
        r = json.loads(line)
        if r.get('id') in want:
            props = r.get('properties') or {}
            found.setdefault(r['id'], {'class_index': r.get('class_index'), 'sources': [],
                                       'property_names': sorted(props)})['sources'].append(name)
inv = EXPORT / 'full-dat-en-de-fr-2026-11-03/inventory.tsv'
inputs[str(inv)] = hashlib.sha256(inv.read_bytes()).hexdigest()
inventory = {parts[0]: parts[1] for line in inv.read_text().splitlines()
             if len(parts := line.split()) == 2}
giver_rows = []
for ident, count in sorted(want.items()):
    giver_rows.append({'id': ident, 'reference_occurrences': count,
                      'inventory_class': inventory.get(ident),
                      'decoded': found.get(ident)})
payload = {'rules': results, 'giver_resolution': giver_rows, 'input_sha256': inputs}
(OUT / 'lotro-datenraum-vertiefung.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False))
rows = [(r['meaning'], f'{r["source"]} `{r["selector"]}/@{r["attribute"]}`',
         r['references'], r['resolved'], sum(r['unresolved'].values()), r['zero_sentinels']) for r in results]
text = [
    '# Deep dive: typed references and quest givers', '',
    'This check extends but does not replace the earlier reference run. '
    'Field paths are concretely evidenced in the XML. The target assignment is an '
    'explicitly named check rule; hits prove ID resolvability, not every runtime '
    'semantic. Rules with zero references have no evidence and must not be read as a '
    'confirmed relation. The value 0 is reported separately and not silently dropped.', '',
    '## Quest giver gaps in the plain NPC catalogue', '',
    f'Of {len(want)} distinct IDs not found there, {len(found)} have a decoded record in '
    'the NPC/placement exports. '
    f'All {sum(i in inventory for i in want)} occur in the DAT inventory. '
    'An inventory entry proves class/ID, but no successfully read properties.', '',
    table(['Finding', 'Distinct IDs'], [
        ('Decoded, class 796', sum(x['class_index'] == 796 for x in found.values())),
        ('Decoded, class 1723', sum(x['class_index'] == 1723 for x in found.values())),
        ('Inventory only, not in the checked raw set', len(want) - len(found))]), '',
    'The numeric classes are deliberately not explained here from their names alone as '
    'NPCs or items. The blanket statement "613 invalid NPCs" '
    'would be wrong. A giver role can point to a different source object type.', '',
    '## Additional reference checks', '',
    table(['Relation/check hypothesis', 'Source path', 'References', 'Resolved', 'Unresolved', 'Of which value 0'], rows), '',
    '## Reproduction and evidence', '',
    '`python3 lotro_datenraum_vertiefung.py`. All open values, '
    'quest giver IDs, classes and the SHA-256 of the inputs: '
    '`lotro-datenraum-vertiefung.json`. No game, plugin or web file changed.', ''
]
(OUT / 'lotro-datenraum-vertiefung.md').write_text('\n'.join(text))
print('rules', len(results), 'references', sum(r['references'] for r in results),
      'unresolved', sum(sum(r['unresolved'].values()) for r in results),
      'givers decoded', len(found), 'inventory only', len(want) - len(found))
