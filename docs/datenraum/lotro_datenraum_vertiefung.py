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
     [('vendors.xml', './sellList', 'sellListId')], 'Händler → Verkaufsliste')
rule('vendors.xml', './/sellEntry', 'id', I, 'Verkaufsposition → Gegenstand')
rule('barters.xml', './barterer/barterProfile', 'profileId',
     [('barters.xml', './barterProfile', 'profileId')], 'Tauscher → Tauschprofil')
for tag in ['give', 'receive']:
    rule('barters.xml', './/' + tag, 'id', I, 'Tauschposition ' + tag + ' → Gegenstand')
rule('barters.xml', './/receiveReputation', 'factionId',
     [('factions.xml', './faction', 'id')], 'Ruferhalt → Fraktion')
for tag in ['itemsTableEntry', 'trophyListEntry']:
    rule('loots.xml', './/' + tag, 'itemId', I, 'Beuteeintrag → Gegenstand')
for tag in ['treasureListEntry', 'trophyListEntry']:
    rule('loots.xml', './/' + tag, 'treasureGroupProfileId',
         [('loots.xml', './itemsTable', 'id'), ('loots.xml', './treasureList', 'id')],
         'Beuteprofil-ID → itemsTable oder treasureList; Zieltypen nicht zusammenführen')
rule('loots.xml', './/weightedTreasureTableEntry', 'trophyListId',
     [('loots.xml', './trophyList', 'id')], 'Gewichtete Tabelle → Trophäenliste')
for attr, target in [('trophyListId', 'trophyList'), ('weightedTreasureTableId', 'weightedTreasureTable')]:
    rule('loots.xml', './/filteredTrophyTableEntry', attr,
         [('loots.xml', './' + target, 'id')], 'Gefilterte Tabelle → ' + target)
for tag in ['relicsListEntry', 'relicsTreasureGroupEntry']:
    rule('loots.xml', './/' + tag, 'relicId', R, 'Reliktbeute → Relikt')
rule('loots.xml', './/relicsListEntry', 'relicsTreasureGroupId',
     [('loots.xml', './relicsTreasureGroup', 'id')], 'Reliktliste → Reliktgruppe')
for attr, tag in [('treasureListId', 'treasureList'), ('trophyListId', 'trophyList'),
                  ('weightedTreasureTableId', 'weightedTreasureTable'),
                  ('filteredTrophyTableId', 'filteredTrophyTable'),
                  ('filteredTrophyTableId2', 'filteredTrophyTable'),
                  ('filteredTrophyTableId3', 'filteredTrophyTable')]:
    rule('containers.xml', './container', attr, [('loots.xml', './' + tag, 'id')], 'Container → ' + tag)
rule('containers.xml', './relicsContainer', 'relicId', R, 'Reliktcontainer → Relikt')
rule('containers.xml', './relicsContainer', 'relicsListId',
     [('loots.xml', './relicsList', 'id')], 'Reliktcontainer → Reliktliste')
for tag, attr, ts in [('skill', 'id', S), ('effect', 'id', E),
                     ('trait', 'pointCostProgression', P), ('trait', 'rankOverlayProgression', P)]:
    rule('traits.xml', './/' + tag, attr, ts, 'Trait-Unterstruktur → ' + str(ts))
for tag, attr, ts in [('effect', 'id', E), ('requiredEffect', 'id', E),
                     ('requiredTrait', 'id', T), ('combo', 'skillID', S),
                     ('details', 'inductionId', [('inductions.xml', './induction', 'id')]),
                     ('attack', 'maxDamageProgression', P), ('attack', 'dpsModProgression', P)]:
    rule('skills.xml', './/' + tag, attr, ts, 'Skill-Unterstruktur → ' + str(ts))
for tag in ['powerCost', 'powerCostPerSecond', 'moraleCost', 'moraleCostPerSecond']:
    rule('skills.xml', './/' + tag, 'pointsProgression', P, 'Kosten → Progression')
rule('parchmentMaps.xml', './parchmentMap', 'id', M, 'Karte → Geometrie gleicher Karten-ID')
rule('maps/links.xml', './link', 'parentId',
     M + [('geoAreas.xml', './area', 'id')],
     'Link-Quell-ID → Karten- oder Gebiets-ID; gemischter ID-Raum, keine pauschale Kartenhierarchie')
rule('maps/links.xml', './link', 'target', M, 'Link-Ziel-ID → Karte (Zielhypothese)')
rule('privateEncounters.xml', './/map', 'mapId', M, 'Instanzkarteneintrag → Karte')
for tag in ['privateEncounter', 'skirmishPrivateEncounter', 'questToBestow', 'randomQuest']:
    rule('privateEncounters.xml', './/' + tag, 'questId', A, 'Instanzvorlage → Aufgabe/Tat-ID-Raum')
for fn in ['quests.xml', 'deeds.xml']:
    for tag, attr, ts in [('skillUsed', 'skillId', S), ('monsterDied', 'mobId', [('mobs.xml', './mob', 'id')]),
                         ('npcTalk', 'npcId', [('NPCs.xml', './NPC', 'id')]),
                         ('questComplete', 'achievableId', A), ('questBestowed', 'achievableId', A),
                         ('inventoryItem', 'itemId', I), ('itemUsed', 'itemId', I)]:
        rule(fn, './/' + tag, attr, ts, 'Aufgaben-/Tatbedingung → typisiertes Ziel')

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
    '# Vertiefung: typisierte Referenzen und Auftraggeber', '',
    'Diese Prüfung erweitert, ersetzt aber nicht den vorherigen Referenzlauf. '
    'Feldpfade sind konkret im XML belegt. Die Zielzuordnung ist eine ausdrücklich '
    'genannte Prüfregel; Treffer beweisen ID-Auflösbarkeit, nicht jede Laufzeitsemantik. '
    'Regeln mit null Referenzen sind ohne Evidenz und nicht als bestätigte Relation zu lesen. '
    'Wert 0 wird separat genannt und nicht stillschweigend gelöscht.', '',
    '## Auftraggeber-Lücken im reinen NPC-Katalog', '',
    f'Von {len(want)} verschiedenen dort nicht gefundenen IDs haben {len(found)} '
    'einen dekodierten Datensatz in NPC-/Platzierungsexporten. '
    f'Alle {sum(i in inventory for i in want)} kommen im DAT-Inventar vor. '
    'Ein Inventareintrag belegt Klasse/ID, aber keine erfolgreich gelesenen Properties.', '',
    table(['Befund', 'Eindeutige IDs'], [
        ('Dekodiert, Klasse 796', sum(x['class_index'] == 796 for x in found.values())),
        ('Dekodiert, Klasse 1723', sum(x['class_index'] == 1723 for x in found.values())),
        ('Nur Inventar, nicht im geprüften Rohbestand', len(want) - len(found))]), '',
    'Die numerischen Klassen werden hier bewusst nicht allein anhand ihrer Namen '
    'zu NPCs oder Gegenständen erklärt. Die pauschale Aussage „613 ungültige NPCs“ '
    'wäre falsch. Eine Geberrolle kann auf einen anderen Quellobjekttyp zeigen.', '',
    '## Zusätzliche Referenzprüfungen', '',
    table(['Beziehung/Prüfhypothese', 'Quellpfad', 'Verweise', 'Aufgelöst', 'Nicht aufgelöst', 'Davon Wert 0'], rows), '',
    '## Reproduktion und Belege', '',
    '`python3 lotro_datenraum_vertiefung.py`. Sämtliche offenen Werte, '
    'Auftraggeber-IDs, Klassen und SHA-256 der Eingaben: '
    '`lotro-datenraum-vertiefung.json`. Keine Spiel-/Plugin-/Webdatei verändert.', ''
]
(OUT / 'lotro-datenraum-vertiefung.md').write_text('\n'.join(text))
print('rules', len(results), 'references', sum(r['references'] for r in results),
      'unresolved', sum(sum(r['unresolved'].values()) for r in results),
      'givers decoded', len(found), 'inventory only', len(want) - len(found))
