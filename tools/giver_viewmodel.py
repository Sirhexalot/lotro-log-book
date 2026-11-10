"""Render-ready quest-giver records.

The generator (`build_auftraggeber.py`) keeps names, places and quest links
language neutral. This module adds what only the language knows: map names,
quest names and the wording of a row. Nothing is recalculated twice.
"""
from __future__ import annotations

import re
from collections import defaultdict

SEGMENT = {'de': 'auftraggeber', 'en': 'quest-giver', 'fr': 'donneur-de-quete'}
QUEST = {'de': 'aufgabe', 'en': 'quest', 'fr': 'quete'}
KINDS = ('person', 'creature', 'object')
# The app fills in "Karte 268450271" for maps the client has no name for. Such
# a label is not a landscape and must never reach a filter or a breadcrumb.
TECHNICAL_NAME = re.compile(r'^(?:Karte|Map|Carte)\s+\d+$')
# Quest facts a giver can be filtered by. The bit keeps the index small and the
# "same quest" rule exact: level and tag are read from one quest row.
FLAGS = (('dy', 1), ('rp', 2), ('gr', 4), ('ix', 8), ('ls', 16))


def _map(maps: dict, ident):
    return maps.get(str(ident)) if ident is not None else None


def real_name(entry) -> str:
    """A map name only when the client really records one."""
    name = str((entry or {}).get('name') or '').strip()
    return '' if not name or TECHNICAL_NAME.match(name) else name


def region_of(maps: dict, map_id, region_number) -> int | None:
    """Region map (tier 1) a place belongs to, even when it has no map."""
    entry = _map(maps, map_id)
    for _ in range(10):
        if not entry:
            break
        if entry.get('tier') == 1:
            return int(entry['idx'])
        entry = _map(maps, entry.get('eltern'))
    for entry in maps.values():
        if entry.get('tier') == 1 and entry.get('region') == region_number:
            return int(entry['idx'])
    return None


def area_of(maps: dict, map_id) -> int | None:
    """Landscape (tier 2) a place belongs to, when the client names one.

    An unnamed map contributes no landscape: the nearest named tier-2 ancestor
    counts, and when there is none the place keeps only its region. A
    technical "Karte 268450271" is no name at all.
    """
    entry = _map(maps, map_id)
    if not entry:
        return None
    current = entry
    for _ in range(6):
        if not current:
            break
        if current.get('tier') == 2:
            return int(current['idx']) if real_name(current) else None
        current = _map(maps, current.get('eltern'))
    return int(entry['idx']) if entry.get('tier', 0) >= 2 and real_name(entry) else None


def chain_of(maps: dict, map_id) -> list[dict]:
    """Region → … → place, the way the catalogue writes map paths."""
    out, entry, seen = [], _map(maps, map_id), set()
    while entry and entry.get('idx') not in seen:
        seen.add(entry.get('idx'))
        name = real_name(entry)
        if name:
            out.append({'id': int(entry['idx']), 'name': name, 'tier': entry.get('tier')})
        entry = _map(maps, entry.get('eltern'))
    return list(reversed(out))


def _levels(rows) -> tuple[int | None, int | None]:
    values = [row[1] for row in rows if row[1]]
    return (min(values), max(values)) if values else (None, None)


def giver_index(source: dict, lang: str, quests: dict, maps: dict) -> dict:
    """Filter index: one row per giver, small enough to hold in one request."""
    rows = []
    regions, areas, area_region = {}, {}, {}
    for entity, giver in source['givers'].items():
        quest_rows, tags = [], 0
        for ident in giver['quests']:
            quest = quests.get(ident)
            if not quest:
                continue
            try:
                level = int(quest.get('l') or 0)
            except (TypeError, ValueError):
                level = 0
            mask = sum(bit for key, bit in FLAGS if quest.get(key))
            tags |= mask
            quest_rows.append([ident, level, mask])
        if not quest_rows:
            continue
        places = []
        for spot in giver['places']:
            region = region_of(maps, spot.get('map'), spot.get('region'))
            area = area_of(maps, spot.get('map'))
            pair = [region, area]
            if pair not in places:
                places.append(pair)
            if region is not None:
                regions[region] = real_name(maps.get(str(region)))
            if area is not None:
                areas[area] = real_name(maps.get(str(area)))
                if region is not None:
                    area_region[area] = region
        low, high = _levels(quest_rows)
        rows.append({
            'id': entity,
            'name': giver['name'][lang],
            'title': (giver.get('title') or {}).get(lang) or None,
            'kind': giver['kind'],
            'places': places,
            'quests': quest_rows,
            'count': len(quest_rows),
            'low': low,
            'high': high,
            'tags': tags,
            'search': ' '.join([giver['name'][lang], (giver.get('title') or {}).get(lang) or '']
                               + [quests[ident]['n'] for ident in giver['quests']
                                  if ident in quests]).casefold(),
        })
    rows.sort(key=lambda row: (row['name'].casefold(), row['id']))
    return {
        'schema': 1, 'lang': lang,
        'labels': {'kind': {key: key for key in KINDS},
                   'region': dict(sorted(regions.items())),
                   'area': dict(sorted(areas.items())),
                   'area_region': dict(sorted(area_region.items()))},
        'givers': rows,
    }


def _chips(quest: dict, words: dict, lang: str) -> list[str]:
    chips = []
    for key, label in (('dy', 'daily'), ('rp', 'repeat')):
        if quest.get(key) and words.get(label):
            chips.append(words[label])
    if quest.get('gr'):
        chips.append({'de': 'Gruppe', 'en': 'Group', 'fr': 'Groupe'}[lang])
    if quest.get('ix'):
        chips.append({'de': 'Instanz', 'en': 'Instance', 'fr': 'Instance'}[lang])
    if quest.get('ls') and words.get('scalable'):
        chips.append(words['scalable'])
    return chips


def _place_view(spot: dict, lang: str, maps: dict, app_url, coords) -> dict:
    entry = _map(maps, spot.get('map'))
    chain = chain_of(maps, spot.get('map'))
    image = pin_x = pin_y = None
    if entry and all(entry.get(key) is not None for key in ('north', 'south', 'west', 'east')):
        width = entry['east'] - entry['west']
        height = entry['north'] - entry['south']
        if width > 0 and height > 0:
            image = entry.get('bild')
            pin_x = round(min(100.0, max(0.0, (spot['lon'] - entry['west']) / width * 100)), 1)
            pin_y = round(min(100.0, max(0.0, (entry['north'] - spot['lat']) / height * 100)), 1)
    if spot.get('map') is None:
        map_url = None
    elif spot.get('quest'):
        map_url = app_url(lang, 'karte', id=spot['quest'])
    else:
        map_url = app_url(lang, 'karte', vorkarte=spot['map'])
    return {
        'chain': chain,
        'map_name': real_name(entry) or None,
        'image': image, 'pin_x': pin_x, 'pin_y': pin_y,
        'coords': coords(spot['lat'], spot['lon']),
        'map_url': map_url,
        'travel_url': app_url(lang, 'reise', nach='%.1f%s %.1f%s' % (
            abs(spot['lat']), 'S' if spot['lat'] < 0 else 'N',
            abs(spot['lon']), 'W' if spot['lon'] < 0 else 'E')),
    }


def giver_url(lang: str, ident: str) -> str:
    return '/%s/%s/%s/' % (lang, SEGMENT[lang], ident)


def quest_url(lang: str, ident: str) -> str:
    return '/%s/%s/%s/' % (lang, QUEST[lang], ident)


def place_label(maps: dict, giver: dict) -> str:
    """Landscape of the first recorded place, else its region."""
    for spot in giver['places']:
        area = area_of(maps, spot.get('map'))
        if area:
            return real_name(maps.get(str(area)))
        region = region_of(maps, spot.get('map'), spot.get('region'))
        if region:
            return real_name(maps.get(str(region)))
    return ''


def giver_pages(source: dict, lang: str, quests: dict, maps: dict,
                app_url, coords, words: dict) -> dict:
    """Detail page model per giver: places with pins, quests, source texts."""
    pages = {}
    by_name = defaultdict(list)
    for entity, giver in source['givers'].items():
        by_name[giver['name'][lang]].append(entity)
    for entity, giver in source['givers'].items():
        rows = []
        for ident in giver['quests']:
            quest = quests.get(ident)
            if not quest:
                continue
            rows.append({
                'id': ident,
                'name': quest['n'],
                'url': quest_url(lang, ident),
                'level': quest.get('l') or '',
                'scaled': bool(quest.get('ls')),
                'zone': quest.get('z') or '',
                'chips': _chips(quest, words, lang),
            })
        if not rows:
            continue
        rows.sort(key=lambda row: (int(row['level']) if str(row['level']).isdigit() else 0,
                                   row['name'].casefold()))
        places = [_place_view(spot, lang, maps, app_url, coords)
                  for spot in giver['places']]
        pages[entity] = {
            'id': entity,
            'name': giver['name'][lang],
            'title': (giver.get('title') or {}).get(lang) or None,
            'kind': giver['kind'],
            'gender': giver.get('gender'),
            'greeting': (giver.get('greeting') or {}).get(lang) or None,
            'description': (giver.get('description') or {}).get(lang) or None,
            'places': places,
            'quests': rows,
            'total': len(rows),
            'same_name': sorted((
                {'id': other, 'url': giver_url(lang, other),
                 'place': place_label(maps, source['givers'][other]),
                 'count': len(source['givers'][other]['quests'])}
                for other in by_name[giver['name'][lang]] if other != entity),
                key=lambda entry: (entry['place'].casefold(), entry['count'], entry['id'])),
            'same_name_url': app_url(lang, 'givers', q=giver['name'][lang]),
            'levels': _levels([[row['id'], int(row['level']) if str(row['level']).isdigit() else 0]
                               for row in rows]),
        }
    return pages


def quest_givers(source: dict) -> dict:
    """Quest id → the first bestower, as written into the entity data."""
    return source.get('quest_giver') or {}
