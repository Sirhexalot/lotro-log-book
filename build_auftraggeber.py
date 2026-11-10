#!/usr/bin/env python3
"""Quest givers (Auftraggeber) from the client export, with quests and places.

Reads dependencies only; nothing is written into the game or the plugin.

Sources, all from the client export and the game definitions:

* ``lore/quests.xml`` – every quest's ``<bestower npcId>``; one quest can name
  several, and a quest that names none keeps no giver here.
* ``lore/NPCs.xml`` – id, gender and the title key of each NPC.
* ``lore/labels/<language>/npc.xml`` – names and titles per language.
* the NPC export (``npcs-*/raw.jsonl``) – greeting, description and the entity
  class that tells a person from a creature or a quest item.
* ``did-positions`` – where a placed entity stands in the client's geo state.

Every position keeps its region; a map id is only attached when the game's own
map tree contains the point. No position is moved to make it fit a map, and a
name is never invented: an entity without a name in all three languages is left
out and counted in the audit.

    python3 build_auftraggeber.py
    python3 build_auftraggeber.py --still
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

from itemnamen import sauberer_name

ROOT = Path(__file__).resolve().parent
LORE = Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore'
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter')
NPC_RAW = EXPORT / 'npcs-2026-11-03/raw.jsonl'
POSITIONS = EXPORT / 'did-positions-2026-11-03/positions.jsonl'
FULL_QUESTS = EXPORT / 'full-dat-en-de-fr-2026-11-03/quests.json'
DATEN = ROOT / 'daten'
LANGS = ('de', 'en', 'fr')

# Entity classes in the client export. Anything else stays "unknown" and is
# shown without a type claim.
CLASS_KIND = {1724: 'person', 5785: 'person', 1723: 'creature', 796: 'object'}
SPOT_LIMIT = 0.3          # map units; a larger difference is another place
MAX_PLACES = 8            # a travelling NPC keeps eight clusters at most
LEVEL_RANGE = re.compile(r'^\s*\d{1,3}\s*[-–]\s*\d{1,3}\b')


def identifier(value) -> str:
    number = int(value)
    if not 0 < number <= 0xffffffff:
        raise ValueError('Invalid game ID: %s' % value)
    return '%08X' % number


def labels(lang: str, filename: str) -> dict:
    path = LORE / 'labels' / lang / filename
    return {row.get('key'): row.get('value', '') for row in ET.parse(path).getroot()}


def clean(value, lang: str) -> str:
    """Readable source text; empty when the export left a template behind."""
    raw = str(value or '')
    if '%s' in raw or '${' in raw or 'key:' in raw:
        return ''
    text = sauberer_name(raw, lang)
    if not text or '%s' in text or '${' in text or 'key:' in text:
        return ''
    return text


def kind_of(raw: dict) -> str:
    kind = CLASS_KIND.get(raw.get('class_index'), 'unknown')
    # An inanimate record of the NPC class is a placed object (bulletin
    # boards, for example), not a person.
    if kind == 'person' and (raw.get('properties') or {}).get('NPC_IsInanimate') == 1:
        return 'object'
    return kind


def quest_links(catalogue: set[str]) -> tuple[dict, dict, Counter]:
    """Quest → all bestowing entities, and quest → first one (its map point)."""
    links: dict[str, list[str]] = {}
    stats = Counter()
    for quest in ET.parse(LORE / 'quests.xml').getroot():
        ident = identifier(quest.get('id'))
        if ident not in catalogue:
            stats['quest_not_in_catalogue'] += 1
            continue
        ids = [identifier(row.get('npcId')) for row in quest.findall('bestower')
               if row.get('npcId')]
        if ids:
            links[ident] = list(dict.fromkeys(ids))
        elif quest.find('bestower') is not None:
            stats['bestower_without_id'] += 1
    # A few quests carry the dispenser only in the DAT's bestowal roles.
    if FULL_QUESTS.is_file():
        for quest in json.loads(FULL_QUESTS.read_text(encoding='utf-8')):
            ident = quest.get('id')
            if ident not in catalogue or ident in links:
                continue
            ids = [identifier(role['QuestDispenser_NPC'])
                   for role in (quest.get('properties') or {}).get('Quest_BestowalRoles') or []
                   if isinstance(role, dict) and role.get('QuestDispenser_NPC')]
            if ids:
                links[ident] = list(dict.fromkeys(ids))
                stats['giver_from_roles_only'] += 1
    primary = {quest: ids[0] for quest, ids in links.items()}
    return links, primary, stats


def npc_records() -> tuple[dict, dict]:
    """NPC definitions and the raw export, both keyed by the hex identifier."""
    defined = {identifier(row.get('id')): dict(row.attrib)
               for row in ET.parse(LORE / 'NPCs.xml').getroot()}
    raw = {}
    if NPC_RAW.is_file():
        with NPC_RAW.open(encoding='utf-8') as handle:
            for line in handle:
                row = json.loads(line)
                raw[row['id']] = row
    return defined, raw


def places_of(did: str, points: dict, maps) -> tuple[list[dict], Counter]:
    """Cluster one entity's game positions and attach a map where one exists."""
    stats = Counter()
    groups: list[dict] = []
    for region, lat, lon in sorted(points.get(did, ())):
        for group in groups:
            if group['region'] == region and abs(group['lat'] - lat) <= SPOT_LIMIT \
                    and abs(group['lon'] - lon) <= SPOT_LIMIT:
                count = group['count']
                group['lat'] = (group['lat'] * count + lat) / (count + 1)
                group['lon'] = (group['lon'] * count + lon) / (count + 1)
                group['count'] = count + 1
                break
        else:
            groups.append({'region': region, 'lat': lat, 'lon': lon, 'count': 1})
    spots = []
    for group in groups:
        lat, lon = round(group['lat'], 5), round(group['lon'], 5)
        map_id = maps.attribute(lat, lon, group['region'])
        stats['positions_on_map' if map_id is not None else 'positions_without_map'] += 1
        spots.append({'region': group['region'], 'lat': lat, 'lon': lon, 'map': map_id})
    if not spots:
        stats['without_position'] += 1
    spots.sort(key=lambda spot: (spot['map'] is None, spot['map'] or 0,
                                 spot['region'], spot['lat'], spot['lon']))
    if len(spots) > MAX_PLACES:
        stats['places_cut'] += len(spots) - MAX_PLACES
        spots = spots[:MAX_PLACES]
    return spots, stats


def build(catalogue: set[str], maps, known_maps: set[int],
          quest_points: dict[str, list]) -> tuple[dict, dict]:
    links, primary, count = quest_links(catalogue)
    defined, raw = npc_records()
    names = {lang: labels(lang, 'npc.xml') for lang in LANGS}

    giver_quests: dict[str, list[str]] = defaultdict(list)
    for quest, ids in links.items():
        for entity in ids:
            giver_quests[entity].append(quest)

    points: dict[str, set] = defaultdict(set)
    if POSITIONS.is_file():
        with POSITIONS.open(encoding='utf-8') as handle:
            for line in handle:
                row = json.loads(line)
                if row.get('did') in giver_quests and row.get('instance') == 0 \
                        and row.get('latitude') is not None and row.get('longitude') is not None:
                    points[row['did']].add((int(row.get('region') or 0),
                                            float(row['latitude']), float(row['longitude'])))

    givers: dict[str, dict] = {}
    problems = []
    for entity in sorted(giver_quests):
        decimal = str(int(entity, 16))
        record = raw.get(entity, {})
        props = record.get('properties') or {}
        # The NPC label file carries most names; the raw export is the source
        # for entities the labels do not list (quest objects in particular).
        raw_name = (props.get('Name') or {}).get('texts') or {}
        translated = {lang: clean(names[lang].get(decimal) or raw_name.get(lang), lang)
                      for lang in LANGS}
        missing = [lang for lang, value in translated.items() if not value]
        if missing:
            count['without_name'] += 1
            problems.append({'kind': 'missing_name', 'id': entity, 'detail': ','.join(missing)})
            continue
        if any(LEVEL_RANGE.match(value) for value in translated.values()):
            # Bulletin boards whose only recorded name is a level span. A row
            # with that name helps nobody, and no better name exists.
            count['level_range_bestower'] += 1
            problems.append({'kind': 'level_range_bestower', 'id': entity,
                             'detail': translated['de']})
            continue

        definition = defined.get(entity, {})
        title = {}
        title_key = definition.get('title')
        if title_key:
            title = {lang: clean(names[lang].get(title_key), lang) for lang in LANGS}
            if not all(title.values()):
                count['title_incomplete'] += 1
                title = {}

        greeting, description = {}, {}
        if isinstance(props.get('NPC_ActionPicker_GreetingString'), dict):
            greeting = {lang: clean((props['NPC_ActionPicker_GreetingString'].get('texts') or {}).get(lang), lang)
                        for lang in LANGS}
            if not all(greeting.values()) or len(greeting['de']) > 360:
                greeting = {}
        if isinstance(props.get('Description'), dict):
            description = {lang: clean((props['Description'].get('texts') or {}).get(lang), lang)
                           for lang in LANGS}
            if not all(description.values()) or len(description['de']) > 700:
                description = {}

        spots, spot_stats = places_of(entity, points, maps)
        count.update(spot_stats)
        for spot in spots:
            if spot['map'] is not None and spot['map'] not in known_maps:
                count['unnamed_map'] += 1
                problems.append({'kind': 'map_not_in_catalogue', 'id': entity,
                                 'detail': str(spot['map'])})
                spot['map'] = None

        quests = sorted(set(giver_quests[entity]))
        # A map link can name a quest only when that quest's own giver point is
        # this entity and sits in the same place.
        for spot in spots:
            spot['quest'] = None
            if spot['map'] is None:
                continue
            for quest in quests:
                point = quest_points.get(quest)
                if not point or primary.get(quest) != entity or point[0] != spot['map']:
                    continue
                if abs(point[1] - spot['lat']) <= 0.25 and abs(point[2] - spot['lon']) <= 0.25:
                    spot['quest'] = quest
                    break

        givers[entity] = {
            'id': entity,
            'name': translated,
            **({'title': title} if title else {}),
            'kind': kind_of(record),
            **({'gender': definition['gender']} if definition.get('gender') else {}),
            **({'greeting': greeting} if greeting else {}),
            **({'description': description} if description else {}),
            'places': spots,
            'quests': quests,
        }

    count['quests_with_giver'] = len(links)
    count['quest_links'] = sum(len(ids) for ids in links.values())
    count['givers'] = len(givers)
    count['givers_with_place'] = sum(1 for row in givers.values() if row['places'])
    count['givers_with_map'] = sum(1 for row in givers.values()
                                   if any(spot['map'] is not None for spot in row['places']))
    count['givers_with_title'] = sum(1 for row in givers.values() if row.get('title'))
    count['givers_with_greeting'] = sum(1 for row in givers.values() if row.get('greeting'))
    count['givers_with_description'] = sum(1 for row in givers.values() if row.get('description'))
    count['multiple_givers'] = sum(1 for ids in links.values() if len(ids) > 1)
    count['kinds'] = dict(Counter(row['kind'] for row in givers.values()))
    # A quest page links to the giver the game names first, and only when that
    # entity has a page of its own.
    quest_giver = {quest: ids[0] for quest, ids in links.items() if ids[0] in givers}
    return ({'schema': 1, 'givers': givers, 'quest_giver': quest_giver},
            {'schema': 1, 'counts': dict(count),
             'problems': sorted(problems, key=lambda row: (row['kind'], row['id']))})


def search_rows(givers: dict, quests: dict, lang: str) -> dict:
    """One compact row per giver for the central search."""
    rows = []
    for entity, row in givers.items():
        zones = Counter()
        levels = []
        for ident in row['quests']:
            quest = quests.get(ident)
            if not quest:
                continue
            if quest.get('z'):
                zones[quest['z']] += 1
            try:
                levels.append(int(quest.get('l') or 0))
            except ValueError:
                pass
        context = zones.most_common(1)[0][0] if zones else ''
        level = min(levels) if levels else ''
        title = (row.get('title') or {}).get(lang, '')
        rows.append([entity, row['name'][lang], title, context, level])
    rows.sort(key=lambda entry: (entry[1].casefold(), entry[0]))
    return {'schema': 1, 'lang': lang, 'rows': rows}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--still', action='store_true', help='keine Fortschrittszeilen')
    options = parser.parse_args()

    sys.path.insert(0, str(ROOT.parent / 'MagicQuestLog' / 'tools'))
    from game_maps import GameMaps

    catalogue = {quest['i'] for quest in
                 json.loads((DATEN / 'quests-de.json').read_text(encoding='utf-8'))['quests']}
    karten = json.loads((DATEN / 'karten.json').read_text(encoding='utf-8'))
    known_maps = {int(entry['idx']) for entry in karten}
    quests = {lang: {quest['i']: quest for quest in
                     json.loads((DATEN / ('quests-%s.json' % lang)).read_text(encoding='utf-8'))['quests']}
              for lang in LANGS}
    quest_points = {ident: quest.get('gt') for ident, quest in quests['de'].items()
                    if quest.get('gt')}

    source, audit = build(catalogue, GameMaps(LORE), known_maps, quest_points)
    (DATEN / 'auftraggeber.json').write_text(
        json.dumps(source, ensure_ascii=False, separators=(',', ':'), sort_keys=True),
        encoding='utf-8')
    (DATEN / 'auftraggeber-pruefung.json').write_text(
        json.dumps(audit, ensure_ascii=False, indent=1, sort_keys=True), encoding='utf-8')
    for lang in LANGS:
        payload = search_rows(source['givers'], quests[lang], lang)
        (DATEN / ('auftraggeber-suche-%s.json' % lang)).write_text(
            json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')

    if not options.still:
        counts = audit['counts']
        print(json.dumps({key: counts.get(key) for key in (
            'givers', 'quests_with_giver', 'quest_links', 'multiple_givers',
            'givers_with_place', 'givers_with_map', 'givers_with_title',
            'givers_with_greeting', 'givers_with_description', 'without_name',
            'level_range_bestower', 'positions_without_map', 'kinds')},
            ensure_ascii=False, indent=1))
        print('Probleme:', len(audit['problems']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
