#!/usr/bin/env python3
"""Read-only source audit. Outputs only next to this script."""
import collections
import datetime
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parent
HOME = Path.home()
LORE = HOME / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore'
EXPORT = HOME / 'Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
WEB = HOME / 'Developer/Lotro/lotro-log-book'
sources = []


def source(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    sources.append((str(path), path.stat().st_size, h.hexdigest()))


def esc(v):
    return str(v).replace('|', '\\|').replace('\n', ' ')


def table(headers, rows):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |',
                      '| ' + ' | '.join(['---'] * len(headers)) + ' |'] +
                     ['| ' + ' | '.join(esc(v) for v in row) + ' |' for row in rows])


def dtype(v):
    return 'null' if v is None else type(v).__name__


def profile(v, path, stats):
    x = stats.setdefault(path, collections.Counter())
    x[dtype(v)] += 1
    if isinstance(v, dict):
        for k, child in v.items():
            profile(child, path + '.' + k, stats)
    elif isinstance(v, list):
        for child in v:
            profile(child, path + '[]', stats)


def xml_profile(p):
    stats = {}
    stack = []
    for event, el in ET.iterparse(p, events=('start', 'end')):
        if event == 'start':
            stack.append(el.tag)
            continue
        path = '/'.join(stack)
        r = stats.setdefault(path, {'n': 0, 'attrs': collections.Counter(), 'children': collections.Counter()})
        r['n'] += 1
        r['attrs'].update(el.attrib.keys())
        r['children'].update(child.tag for child in el)
        stack.pop()
        # Clear grandchildren only after counting child tags.
        for child in el:
            child.clear()
    return stats


def main():
    stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    xmls = sorted(LORE.glob('*.xml'))
    xmls += sorted((LORE / 'enums').glob('*.xml'))
    xmls += sorted((LORE / 'maps').rglob('*.xml'))
    xmls += sorted((LORE / 'labels').rglob('*.xml'))
    lines = ['# Complete XML field inventory of the available Companion lore state',
             '', f'Recorded: {stamp}', '',
             'Every XML file of the active local lore, including items, enums, maps, '
             'markers and language labels. Each row names the full element path; '
             'attributes are not merged across different paths. The evidence covers the '
             'stored structure, not automatically its game semantics. '
             'Attribute counters are occurrences; a missing attribute does not prove a '
             'default.', '']
    xml_count = 0
    for p in xmls:
        source(p)
        stats = xml_profile(p)
        lines += ['## ' + str(p.relative_to(LORE)), '']
        rows = []
        for path, s in sorted(stats.items()):
            xml_count += 1
            attrs = '; '.join(f'`{k}` ({n}/{s["n"]})' for k, n in sorted(s['attrs'].items())) or '—'
            children = ', '.join('`' + k + '`' for k in sorted(s['children'])) or '—'
            rows.append((f'`{path}`', s['n'], attrs, children))
        lines += [table(['Element path', 'Occurrences', 'All attributes (observed/elements)', 'Child elements'], rows), '']
        print('XML', p.relative_to(LORE), flush=True)
    (OUT / 'lotro-datenraum-xml-properties.md').write_text('\n'.join(lines))

    rawpaths = sorted(EXPORT.glob('*/raw.jsonl'))
    # Include only baseline plus non-test specialized exports, not duplicate snapshots.
    rawpaths = [p for p in rawpaths if p.parent.name in {
        'full-dat-en-de-fr-2026-11-03', 'placed-2026-11-03',
        'npcs-2026-11-03', 'reputation-crafting-2026-11-03'}]
    rawpaths += sorted((WEB / 'daten').glob('*roh.jsonl'))
    rawpaths += sorted((HOME / '.cache/llb-instance-research').glob('*raw*.jsonl'))
    lines = ['# DAT field inventory: all observed paths', '',
             'Classes separated per export; arrays as `[]`. Types and occurrences are '
             'derived across all records, not from one sample. A field name that occurs '
             'proves neither its complete decoding nor a default when absent. '
             'Texts are not copied.', '']
    summaries = []
    for p in dict.fromkeys(rawpaths):
        source(p)
        groups = {}
        n = 0
        for line in p.open():
            if not line.strip():
                continue
            r = json.loads(line)
            c = str(r.get('class_index', 'without class_index'))
            group = groups.setdefault(c, {'n': 0, 'stats': {}})
            group['n'] += 1
            n += 1
            profile(r, '$', group['stats'])
        summaries.append((str(p), n, len(groups)))
        lines += ['## Source `' + str(p) + '`', '']
        for c, g in sorted(groups.items()):
            lines += [f'### Class {c} — {g["n"]} records', '',
                      table(['Property path', 'Type: occurrences'], [
                          ('`' + key + '`', ', '.join(f'{t}: {n}' for t, n in sorted(types.items())))
                          for key, types in sorted(g['stats'].items())]), '']
        print('DAT', p, n, flush=True)
    (OUT / 'lotro-datenraum-dat-properties.md').write_text('\n'.join(lines))

    # Exact XML references: each rule has an explicit typed target, never fuzzy name joins.
    rules = [
        ('sets.xml', './/set/item', 'id', 'items.xml', './/item', 'key'),
        ('recipes.xml', './/*[@itemId]', 'itemId', 'items.xml', './/item', 'key'),
        ('tasks.xml', './/task', 'itemId', 'items.xml', './/item', 'key'),
        ('tasks.xml', './/task', 'questId', 'quests.xml', './/quest', 'id'),
        ('NPCs.xml', './/startupEffect', 'id', 'effects.xml', './*', 'id'),
        ('quests.xml', './/bestower', 'npcId', 'NPCs.xml', './/NPC', 'id'),
        ('quests.xml', './/prerequisite', 'id', 'quests.xml', './/quest', 'id'),
        ('deeds.xml', './/prerequisite', 'id', 'deeds.xml', './/deed', 'id'),
        ('quests.xml', './/landmarkDetection', 'landmarkId', 'landmarks.xml', './/landmark', 'id'),
        ('deeds.xml', './/landmarkDetection', 'landmarkId', 'landmarks.xml', './/landmark', 'id'),
        ('quests.xml', './/object', 'id', 'items.xml', './/item', 'key'),
        ('deeds.xml', './/object', 'id', 'items.xml', './/item', 'key'),
        ('quests.xml', './/title', 'id', 'titles.xml', './/title', 'id'),
        ('deeds.xml', './/title', 'id', 'titles.xml', './/title', 'id'),
        ('quests.xml', './/trait', 'id', 'traits.xml', './/trait', 'identifier'),
        ('deeds.xml', './/trait', 'id', 'traits.xml', './/trait', 'identifier'),
        ('quests.xml', './/factionLevel', 'factionId', 'factions.xml', './/faction', 'id'),
        ('deeds.xml', './/factionLevel', 'factionId', 'factions.xml', './/faction', 'id'),
        ('travelNPCs.xml', './/travelNPC', 'nodeId', 'travels.xml', './/node', 'id'),
        ('travels.xml', './/route', 'destinationID', 'travels.xml', './/destination', 'id'),
        ('parchmentMaps.xml', './/parchmentMap', 'parentMapId', 'parchmentMaps.xml', './/parchmentMap', 'id'),
        ('geoAreas.xml', './/*[@parentId]', 'parentId', 'geoAreas.xml', './*', 'id'),
        ('traceries.xml', './/tracery', 'setId', 'sets.xml', './/set', 'id'),
        ('disenchantments.xml', './/disenchantment', 'sourceItemId', 'items.xml', './/item', 'key'),
        ('disenchantments.xml', './/disenchantment', 'resultItemId', 'items.xml', './/item', 'key'),
    ]
    cache = {}

    def tree(name):
        if name not in cache:
            cache[name] = ET.parse(LORE / name).getroot()
        return cache[name]

    relrows = []
    evidence = []
    for fn, sel, attr, tn, ts, ta in rules:
        ids = {e.get(ta) for e in tree(tn).findall(ts) if e.get(ta)}
        vals = [e.get(attr) for e in tree(fn).findall(sel) if e.get(attr) is not None]
        missing = collections.Counter(v for v in vals if v not in ids)
        ok = sum(v in ids for v in vals)
        relrows.append((f'{fn}: `{sel}/@{attr}`', f'{tn}: `{ts}/@{ta}`',
                        len(vals), ok, len(vals) - ok, len(missing)))
        evidence.append({'source': fn, 'selector': sel, 'attribute': attr, 'target': tn,
                         'target_selector': ts, 'target_attribute': ta,
                         'rows': len(vals), 'resolved': ok, 'unresolved': dict(missing)})
    (OUT / 'lotro-datenraum-relationen.md').write_text(
        '# Reference validation against concrete target sets\n\n'
        'Exact ID equality, no name resolution. These are explicit check hypotheses: '
        'zero hits or gaps can indicate a wrong target schema, different ID spaces or '
        'incomplete sets. A row is not a semantically confirmed relation just because it '
        'appears here. Missing targets are not repaired. '
        'Multiple occurrences are preserved; present-tense counts do not imply schema '
        'cardinality.\n\n' +
        table(['Source', 'Checked target', 'References', 'Resolved', 'Unresolved', 'Open distinct values'], relrows) +
        '\n\nAll unresolved IDs are listed in `lotro-datenraum-relationen.json`.\n')
    (OUT / 'lotro-datenraum-relationen.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2))
    (OUT / 'lotro-datenraum-quellen.md').write_text(
        '# Source files actually read\n\nSHA-256 identifies the local state that was '
        'read, not a guarantee of recency or of rights.\n\n' +
        table(['Absoluter Pfad', 'Bytes', 'SHA-256'], sources))
    (OUT / 'lotro-datenraum-lauf.json').write_text(json.dumps({
        'created_utc': stamp, 'xml_files': len(xmls), 'xml_paths': xml_count,
        'raw_sources': summaries, 'reference_rules': len(rules)}, indent=2))
    print('DONE', len(xmls), xml_count, len(rules), flush=True)


if __name__ == '__main__':
    main()
