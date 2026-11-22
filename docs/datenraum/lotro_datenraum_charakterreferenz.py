"""Typed joins for character reference entities, plus decoder class evidence."""
import collections
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile
from lotro_datenraum_audit import OUT, LORE, table

trees = {}
hashes = {}


def tree(name):
    if name not in trees:
        p = LORE / name
        hashes[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
        trees[name] = ET.parse(p).getroot()
    return trees[name]


def target(fn, sel, key):
    return {(e.get(key)) for e in tree(fn).findall(sel) if e.get(key) is not None}


T = ('traits.xml', './trait', 'identifier')
S = ('skills.xml', './*', 'identifier')
P = ('progressions.xml', './*', 'identifier')
F = ('factions.xml', './*', 'id')
rules = [
    ('races.xml', './/nationality', 'id', ('nationalities.xml', './nationality', 'code')),
    ('races.xml', './/allowedClass', 'id', ('classes.xml', './class', 'key')),
    ('races.xml', './/raceTrait', 'traitId', T),
    ('races.xml', './/earnableTrait', 'traitId', T),
    ('classes.xml', './/classTrait', 'traitId', T),
    ('classes.xml', './/classSkill', 'skillId', S),
    ('classes.xml', './class', 'traitTreeID', ('traitTrees.xml', './traitTree', 'id')),
    ('nationalities.xml', './nationality', 'titleID', ('titles.xml', './title', 'id')),
    ('virtues.xml', './virtue', 'maxRankProgression', P),
    ('virtues.xml', './virtue', 'passivesEffect', ('effects.xml', './*', 'id')),
    ('virtues.xml', './/stat', 'scaling', P),
    ('allegiances.xml', './allegiance', 'advancementProgressionID', ('allegiances.xml', './curve', 'id')),
    ('allegiances.xml', './allegiance', 'travelSkillId', S),
    ('allegiances.xml', './/deed', 'id', ('deeds.xml', './deed', 'id')),
    ('collections.xml', './/title', 'id', ('titles.xml', './title', 'id')),
    ('crafting.xml', './/mastery', 'titleId', ('titles.xml', './title', 'id')),
    ('crafting.xml', './/proficiency', 'titleId', ('titles.xml', './title', 'id')),
    ('crafting.xml', './/recipe', 'id', ('recipes.xml', './recipe', 'id')),
    ('crafting.xml', './profession', 'guildFaction', F),
    ('factions.xml', './/level', 'deedKey', ('deeds.xml', './deed', 'key')),
    ('traitTrees.xml', './/cell', 'traitId', T),
    ('traitTrees.xml', './/step', 'traitId', T),
    ('traitTrees.xml', './/*[@mainTraitId]', 'mainTraitId', T),
]
results = []
for fn, sel, attr, ts in rules:
    ids = target(*ts)
    if attr == 'deedKey':
        # The field mixes symbolic keys and decimal achievable IDs.
        ids |= target('deeds.xml', './deed', 'id')
    vals = [e.get(attr) for e in tree(fn).findall(sel) if e.get(attr) is not None]
    missing = collections.Counter(v for v in vals if v not in ids)
    results.append({'source': fn, 'selector': sel, 'attribute': attr, 'target': ts,
                    'occurrences': len(vals), 'resolved': sum(v in ids for v in vals),
                    'missing': dict(missing),
                    'target_note': 'Union of deed/@key and deed/@id' if attr == 'deedKey' else None})

jar = Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/lib/delta-lotro-dat-utils-11.13.jar'
hashes[str(jar)] = hashlib.sha256(jar.read_bytes()).hexdigest()
with ZipFile(jar) as z:
    resource = 'delta/games/lotro/dat/wlib/classes/io/classes.xml'
    classes = {e.get('index'): e.get('name') for e in ET.fromstring(z.read(resource))}
class_proof = {i: classes.get(i) for i in ['796', '1723', '1724']}
missing_maps = {}
for mid in ['268448107', '268449764']:
    labels = {}
    for lang in ['de', 'en', 'fr']:
        fn = f'maps/labels/{lang}/basemaps.xml'
        labels[lang] = [e.get('value') for e in tree(fn) if e.get('key') == mid]
    incoming = [e.attrib for e in tree('maps/links.xml') if e.get('target') == mid]
    missing_maps[mid] = {'labels': labels, 'incoming_links': incoming}
payload = {'rules': results, 'decoder_classes': class_proof,
           'decoder_class_resource': resource, 'missing_maps': missing_maps, 'input_sha256': hashes}
(OUT / 'lotro-datenraum-charakterreferenz.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False))
lines = [
    '# Character reference entities and decoder classes', '',
    '## Class evidence from the DAT decoder in use', '',
    'Source: `delta-lotro-dat-utils-11.13.jar`, internal resource '
    '`delta/games/lotro/dat/wlib/classes/io/classes.xml`. JAR SHA-256 in the JSON '
    'evidence. `javap -constants ... delta.games.lotro.dat.WStateClass` additionally '
    'confirms the constants MOB=1723 and NPC=1724.', '',
    table(['Class index', 'Decoder class name'], sorted(class_proof.items())), '',
    'This documents the quest giver targets that were previously described only by '
    'number more precisely: class 796 is called IItem in the decoder, class 1723 '
    'MonsterTemplate. A quest giver is therefore a role across several source object '
    'classes. That does not justify classifying every IItem as a wearable item or '
    'every MonsterTemplate as a hostile mob.', '',
    'The NPC extractor `MainDatNPCsLoader.useId` accepts exclusively '
    '`WStateClass.NPC`. Its `load` reads name, OccupationTitle and effects; '
    'gender is derived from markup in the name. That is not an independent '
    'gender property from this exporter.', '',
    '## Typed reference checks', '',
    'Non-numeric IDs (class key, origin code, deed key) are explicitly checked '
    'against the correct target column. Zero hits mean no evidence; '
    'open values are not automatically invalid.', '',
    table(['Source', 'Target', 'Occurrences', 'Resolved', 'Open'],
          [(f'{r["source"]} `{r["selector"]}/@{r["attribute"]}`', r.get('target_note') or str(r['target']),
            r['occurrences'], r['resolved'], sum(r['missing'].values())) for r in results]), '',
    '## Open map link targets', '',
    'The two target IDs not found in the geometry set were additionally checked '
    'against the DE/EN/FR map labels. The actual hits and '
    'incoming link attributes are listed unchanged in the JSON. Missing geometry '
    'is not reconstructed from a name or a link position.', '',
    '## Reproduction', '', '`python3 lotro_datenraum_charakterreferenz.py`. '
    'All results and input hashes: `lotro-datenraum-charakterreferenz.json`.', ''
]
(OUT / 'lotro-datenraum-charakterreferenz.md').write_text('\n'.join(lines))
print('rules', len(results), 'references', sum(r['occurrences'] for r in results),
      'open', sum(sum(r['missing'].values()) for r in results), 'classes', class_proof)
