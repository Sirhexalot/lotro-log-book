#!/usr/bin/env python3
"""Prepared adventure catalogue, one file per language.

An adventure is a large content block: the base game, an expansion or a
mini-expansion. Each one owns a set of landscape maps; quests are counted once
by the innermost map that belongs to an adventure.

Two different statements stay apart on purpose:

* the **map assignment** says which landscape belongs to which adventure and is
  maintained in ``referenz/inhaltspakete.json`` at landscape level;
* the **level band** is editorial. It comes from the expansion's level cap and
  the landscapes it introduced, not from a measurement inside the client.

Quest levels are still derived, but only for ordering and for the next step
inside an adventure: a single festival or scaling quest must not stretch a
landscape's range. ``p10``/``p90`` are marked as derived wherever they appear.

    python3 tools/build_abenteuer.py --ziel ~/.cache/llb-php/phpdata
"""
import argparse
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATEN = ROOT / 'daten'
WEB = ROOT / 'web'
REFERENZ = ROOT / 'referenz'
SPRACHEN = ('de', 'en', 'fr')


def maps_for(lang):
    """Localized map names, read from the built map data of one language."""
    text = (WEB / ('daten-%s.js' % lang)).read_text(encoding='utf-8')
    match = re.search(r'MQL_KARTEN\s*=\s*(\[.*?\]);', text, re.S)
    if not match:
        raise SystemExit('MISSING: MQL_KARTEN in daten-%s.js' % lang)
    return {int(row['idx']): row.get('name') or '' for row in json.loads(match.group(1))}


def chains(tree):
    """Map id → its parent chain, nearest first. Cycles are a hard error."""
    out = {}
    for ident in tree:
        chain, seen, cursor = [], set(), ident
        while cursor in tree:
            if cursor in seen:
                raise ValueError('Map parent cycle at %s' % cursor)
            seen.add(cursor)
            chain.append(cursor)
            parent = tree[cursor].get('eltern')
            if parent is None:
                break
            cursor = int(parent)
        out[ident] = chain
    return out


def map_assignment(packs, tree):
    """Exactly one adventure per map, or none.

    A map belongs to an adventure when one of the pack's roots is on its parent
    chain and no exclusion is. An exclusion cuts the whole subtree, which keeps
    later content inside an old landscape out of the old adventure.
    """
    known = set(tree)
    chain_of = chains(tree)
    resolved = {}
    for pack in packs:
        roots = {int(value) for value in pack['candidate_map_roots']}
        excluded = {int(value) for value in pack.get('excluded_map_roots') or []}
        missing = (roots | excluded) - known
        if missing:
            raise ValueError('%s: unknown map ids %s' % (pack['id'], sorted(missing)))
        for ident, chain in chain_of.items():
            if roots.intersection(chain) and not excluded.intersection(chain):
                if ident in resolved and resolved[ident] != pack['id']:
                    raise ValueError('Map %s belongs to %s and %s'
                                     % (ident, resolved[ident], pack['id']))
                resolved[ident] = pack['id']
    return resolved


def one_time(quest):
    """Landscape quests only: no repeatables, sessions, instances or dailies."""
    if quest.get('x') or quest.get('ix') or quest.get('dy') or quest.get('technical') is True:
        return False
    rp = quest.get('rp')
    return not (rp == -1 or (isinstance(rp, int) and rp > 1))


def innermost(quest, assignment, excluded=()):
    """Deepest map on the quest path that belongs to an adventure.

    Exclusions are per adventure: a landscape left out by one adventure may be
    the core of another (Morgul Vale belongs to Minas Morgul, not to Mordor).
    A quest inside such a subtree belongs to no adventure when the map that
    would own it is the one that excludes the subtree.
    """
    path = [int(value) for value in quest.get('fk') or []]
    for ident in reversed(path):
        if ident not in assignment:
            continue
        pack = assignment[ident]
        if any(step in excluded.get(pack, ()) for step in path):
            return None
        return ident
    return None


def excluded_subtrees(packs, tree):
    """Maps each adventure deliberately leaves out, descendants included."""
    chain_of = chains(tree)
    out = {}
    for pack in packs:
        roots = {int(value) for value in pack.get('excluded_map_roots') or []}
        out[pack['id']] = {ident for ident, chain in chain_of.items()
                           if roots.intersection(chain)}
    return out


def quantile(values, fraction):
    """Nearest-rank quantile; small sets keep their own values."""
    if not values:
        return None
    ordered = sorted(values)
    index = max(0, math.ceil(len(ordered) * fraction) - 1)
    return ordered[min(index, len(ordered) - 1)]


def level_range(levels):
    """Derived play range of one area: p10 to p90, outliers left out."""
    return quantile(levels, 0.1), quantile(levels, 0.9)


def pack_name(pack, lang, names):
    """Localized name of an adventure.

    Expansions carry editorial names in all three languages; a quest pack or a
    free update is named after its landscape map, which is the name the client
    itself shows.
    """
    if pack.get('name'):
        return pack['name'][lang]
    if pack.get('name_map'):
        label = (names.get(int(pack['name_map'])) or '').strip()
        if label:
            return label
    raise ValueError('%s: neither name nor a named name_map' % pack['id'])


def name_for(area, tree, names):
    """Named map of an area; walk up when a sub-map carries no name."""
    cursor, seen = area, set()
    while cursor in tree and cursor not in seen:
        seen.add(cursor)
        label = (names.get(cursor) or '').strip()
        if label:
            return label
        parent = tree[cursor].get('eltern')
        if parent is None:
            break
        cursor = int(parent)
    return ''


def build(lang, packs, tree, quests, names):
    assignment = map_assignment(packs, tree)
    excluded = excluded_subtrees(packs, tree)
    by_pack = {pack['id']: pack for pack in packs}
    area_quests, rows = {}, []
    for quest in quests:
        if not one_time(quest):
            continue
        area = innermost(quest, assignment, excluded)
        if area is None:
            continue
        level = str(quest.get('l') or '')
        row = {'i': str(quest['i']).upper(), 'area': str(area), 'l': level if level.isdigit() else ''}
        for key in ('v', 'vo', 'e'):
            values = [str(value).upper() for value in quest.get(key) or []]
            if values:
                row[key] = values
        if str(quest.get('vl') or '').isdigit():
            row['vl'] = str(quest['vl'])
        if quest.get('vb'):
            row['vb'] = 1
        rows.append(row)
        area_quests.setdefault(area, []).append(quest)

    areas = []
    for area, quests_in_area in area_quests.items():
        levels = [int(str(q.get('l') or '')) for q in quests_in_area if str(q.get('l') or '').isdigit()]
        low, high = level_range(levels)
        areas.append({
            'id': str(area),
            'pack': assignment[area],
            'name': name_for(area, tree, names),
            'quests': len(quests_in_area),
            'reviewed': by_pack[assignment[area]].get('review') == 'landscape',
            'level_min': low,
            'level_max': high,
            'level_source': 'quests_p10_p90',
        })

    # Fixed order: adventure order, then fewest quests first, then name and map
    # id. The count is the catalogue size, so the order does not move when a
    # character with progress is imported.
    areas.sort(key=lambda row: (by_pack[row['pack']]['order'], row['quests'],
                                row['name'], int(row['id'])))
    for index, row in enumerate(areas, 1):
        row['order'] = index

    out_packs = []
    for pack in sorted(packs, key=lambda value: (value['levels'][0], value['order'])):
        mine = [row for row in areas if row['pack'] == pack['id']]
        low, high = pack['levels']
        entry = {
            'id': pack['id'],
            'order': pack['order'],
            'type': pack['type'],
            'release': pack['release'],
            'name': pack_name(pack, lang, names),
            'summary': (pack.get('summary') or {}).get(lang, ''),
            'level_min': low,
            'level_max': high,
            'level_source': 'editorial',
            'review': pack.get('review', 'derived'),
            'reviewed': pack.get('review') == 'landscape' and bool(mine),
            'areas': len(mine),
            'quests': sum(row['quests'] for row in mine),
        }
        if pack.get('free') is True:
            entry['free'] = True
        out_packs.append(entry)

    return {
        'schema': 2,
        'lang': lang,
        'assignment': 'landscape',
        'level_source': 'editorial',
        'note': 'Zuordnung je Landschaft geprueft; einzelne spaeter erschienene Aufgaben '
                'innerhalb einer Landschaft sind nicht ausgeschlossen. Stufenbereiche der '
                'Abenteuer sind redaktionell, Gebietsstufen aus Aufgaben abgeleitet.',
        'packs': out_packs,
        'areas': areas,
        'quests': sorted(rows, key=lambda row: row['i']),
    }


def catalogues():
    """All three prepared catalogues, keyed by language."""
    reference = json.loads((REFERENZ / 'inhaltspakete.json').read_text(encoding='utf-8'))
    tree = {int(row['idx']): row for row in json.loads((DATEN / 'karten.json').read_text())}
    quests = json.loads((DATEN / 'quests-de.json').read_text(encoding='utf-8'))
    if isinstance(quests, dict):
        quests = quests['quests']
    return {lang: build(lang, reference['packs'], tree, quests, maps_for(lang))
            for lang in SPRACHEN}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path, required=True, help='phpdata des Releases')
    parser.add_argument('--web', type=Path, default=ROOT / 'web',
                        help='Ordner für das Katalog-Skript der Seite')
    args = parser.parse_args()
    args.ziel.mkdir(parents=True, exist_ok=True)
    args.web.mkdir(parents=True, exist_ok=True)
    for lang, data in catalogues().items():
        target = args.ziel / lang
        target.mkdir(parents=True, exist_ok=True)
        text = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
        (target / 'abenteuer.json').write_text(text, encoding='utf-8')
        # The browser reads the same catalogue; ownership and progress stay local.
        (args.web / ('abenteuer-%s.js' % lang)).write_text(
            'window.MQL_ABENTEUER_KATALOG = %s;\n' % text, encoding='utf-8')
        print('%s: %d Abenteuer (%d geprueft), %d Gebiete, %d Aufgaben' % (
            lang, len(data['packs']), sum(1 for pack in data['packs'] if pack['reviewed']),
            len(data['areas']), len(data['quests'])))


if __name__ == '__main__':
    main()
