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
                    'target_note': 'Union deed/@key und deed/@id' if attr == 'deedKey' else None})

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
    '# Charakterreferenz-Entitäten und Decoder-Klassen', '',
    '## Klassenbelege des verwendeten DAT-Decoders', '',
    'Quelle: `delta-lotro-dat-utils-11.13.jar`, interne Ressource '
    '`delta/games/lotro/dat/wlib/classes/io/classes.xml`. JAR-SHA-256 im JSON-Beleg. '
    'Zusätzlich bestätigt `javap -constants ... delta.games.lotro.dat.WStateClass` '
    'die Konstanten MOB=1723 und NPC=1724.', '',
    table(['Klassenindex', 'Decoder-Klassenname'], sorted(class_proof.items())), '',
    'Damit sind die zuvor numerisch dokumentierten Auftraggeberziele genauer '
    'belegt: Klasse 796 heißt im Decoder IItem, Klasse 1723 MonsterTemplate. '
    'Ein Auftraggeber ist somit eine Rolle über mehreren Quellobjektklassen. '
    'Das rechtfertigt keine Einstufung jedes IItem als tragbarer Gegenstand oder '
    'jedes MonsterTemplate als feindlicher Gegner.', '',
    'Der NPC-Extractor `MainDatNPCsLoader.useId` akzeptiert ausschließlich '
    '`WStateClass.NPC`. Sein `load` liest Name, OccupationTitle und Effekte; '
    'Geschlecht wird aus Markup im Namen abgeleitet. Das ist keine unabhängige '
    'Geschlechts-Property aus diesem Exporter.', '',
    '## Typisierte Referenzprüfungen', '',
    'Nichtnumerische IDs (Klassen-Key, Herkunft-Code, Tat-Key) werden ausdrücklich '
    'gegen die richtige Zielspalte geprüft. Null Treffer heißt keine Evidenz; '
    'offene Werte sind nicht automatisch ungültig.', '',
    table(['Quelle', 'Ziel', 'Vorkommen', 'Aufgelöst', 'Offen'],
          [(f'{r["source"]} `{r["selector"]}/@{r["attribute"]}`', r.get('target_note') or str(r['target']),
            r['occurrences'], r['resolved'], sum(r['missing'].values())) for r in results]), '',
    '## Offene Kartenlink-Ziele', '',
    'Die zwei im Geometriebestand nicht gefundenen Ziel-IDs wurden zusätzlich '
    'gegen die Kartenlabels DE/EN/FR geprüft. Die tatsächlichen Treffer und '
    'eingehenden Linkattribute stehen unverändert im JSON. Fehlende Geometrie '
    'wird nicht aus einem Namen oder einer Linkposition rekonstruiert.', '',
    '## Reproduktion', '', '`python3 lotro_datenraum_charakterreferenz.py`. '
    'Alle Ergebnisse und Eingabehashes: `lotro-datenraum-charakterreferenz.json`.', ''
]
(OUT / 'lotro-datenraum-charakterreferenz.md').write_text('\n'.join(lines))
print('rules', len(results), 'references', sum(r['occurrences'] for r in results),
      'open', sum(sum(r['missing'].values()) for r in results), 'classes', class_proof)
