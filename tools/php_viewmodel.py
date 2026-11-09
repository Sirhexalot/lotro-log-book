#!/usr/bin/env python3
"""Build the page view models that Twig renders.

Every decision that needs the whole catalogue — is this target a real page,
which icon belongs to this reward, which map shows that coordinate — is made
here, once. PHP then reads one shard and renders; it never walks the catalogue
for a single page.

The rules are ported from `build_aufgaben.py`; `tests/test_php_parity.py`
compares the rendered result with the static page of the same entity.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlencode

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from build_katalogseiten import WORDS, old_link, route, escape  # noqa: E402


def klarer_name(text) -> str:
    text = str(text or '').replace('\\q', '"')
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


def sauber(text) -> str:
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', str(text or ''))
    return text.strip().casefold()


def symbol(icon, gross=False):
    """Client symbol as an <img>; missing symbols leave nothing behind."""
    if not icon:
        return ''
    size = 32 if gross else 22
    return ('<img class="symbol%s" src="/bild/items/%s.webp" alt="" width="%d" height="%d" '
            'decoding="async">' % (' symbol-gross' if gross else '', icon, size, size))


def coords(lat, lon) -> str:
    return '%.1f°%s, %.1f°%s' % (abs(lat), 'S' if lat < 0 else 'N',
                                 abs(lon), 'W' if lon < 0 else 'E')


class ViewBuilder:
    """Language-wide helpers shared by every entity page type."""

    def __init__(self, lang, model, maps):
        self.lang = lang
        self.w = WORDS[lang]
        self.model = model
        self.maps = {str(key): value for key, value in maps.items()}
        self.quests = {q['i']: q for q in model['quests']}
        self.deeds = {d['i']: d for d in model['deeds']}
        self.items = model['items']
        self.recipes = {row[10]: row for row in model['recipes']}
        self.professions = model['professions']
        self.titles = model['titles']
        self.virtues = model['virtues']
        self.by_name = {}
        for ident, item in self.items.items():
            for name in (item.get('n') or {}).values():
                if name:
                    self.by_name.setdefault(sauber(name), set()).add(ident)

    def name_of(self, kind, value):
        """Display name of a record, the same way the generator picks it."""
        if kind in ('i', 'title', 'virtue'):
            return value.get('name') or klarer_name(
                (value.get('n') or {}).get(self.lang) or (value.get('n') or {}).get('en') or '')
        if kind == 'recipe':
            return value[0]
        if kind == 'p':
            return ((value.get('n') or {}).get(self.lang)
                    or (value.get('n') or {}).get('en') or value.get('id') or '')
        if kind in ('area', 'region'):
            return value.get('name') or ''
        return value.get('n') or ''

    # --- links ---------------------------------------------------------
    def item_link(self, name, label=None):
        ids = self.by_name.get(sauber(name), set())
        if len(ids) != 1:
            return None
        ident = next(iter(ids))
        return {'url': route(self.lang, 'i', ident),
                'text': label if label is not None else name}

    def quest_link(self, ident):
        other = self.quests.get(ident)
        if not other:
            return None
        return {'url': route(self.lang, 'q', ident), 'text': other['n']}

    def map_link(self, map_id, name):
        entry = self.maps.get(str(map_id))
        if not entry:
            return None
        kind = 'region' if entry.get('tier') == 1 else 'area'
        return {'url': route(self.lang, kind, str(map_id)), 'text': name}


def quest_view(builder: ViewBuilder, quest: dict) -> dict:
    """Everything a quest page prints, already resolved."""
    w, lang = builder.w, builder.lang
    rel = quest.get('rel') or {}

    chips = []
    if quest.get('l'):
        chips.append('%s %s%s' % (w['level'], quest['l'], ' *' if quest.get('ls') else ''))
    if quest.get('f'):
        chips.append(' › '.join(quest['f']))
    if quest.get('g'):
        chips.append(quest['g'])
    if quest.get('s'):
        chips.append('%s %s' % (len(quest['s']), w['steps_label']))
    if quest.get('rw'):
        chips.append('%s %s' % (len(quest['rw']), w['rewards']))
    if quest.get('dy'):
        chips.append(w['daily'])
    if quest.get('rp') == -1:
        chips.append(w['repeat'])
    if quest.get('lp'):
        chips.append('%s %s' % (w['points'], quest['lp']))

    area_trail = []
    fk = quest.get('fk') or []
    for index, name in enumerate(quest.get('f') or []):
        link = None
        if index == 0 and fk:
            link = builder.map_link(fk[0], name)
        elif index == 1 and len(fk) > 1:
            link = builder.map_link(fk[1], name)
        area_trail.append({'text': name, 'url': link['url'] if link else None})

    place = None
    spot = quest.get('gt')
    goals = quest.get('t') or []
    if spot or goals:
        travel_point = spot or (goals[0] if goals else None)
        travel = ''
        if travel_point:
            travel = '/reise.html?' + urlencode({
                'lang': lang,
                'nach': '%.1f%s %.1f%s' % (
                    abs(travel_point[1]), 'S' if travel_point[1] < 0 else 'N',
                    abs(travel_point[2]), 'W' if travel_point[2] < 0 else 'E')})
        place = {
            'image': None, 'pin_x': None, 'pin_y': None,
            'coords': None, 'points': len(goals) if len(goals) > 1 else 0,
            'map_name': None, 'map_url': None,
            'occurrences_url': None,
            'map_link': '/index.html?lang=%s&id=%s' % (lang, quest['i']),
            'travel_url': travel,
        }
        if spot:
            map_entry = builder.maps.get(str(spot[0]))
            place['coords'] = coords(spot[1], spot[2])
            if map_entry and all(map_entry.get(k) is not None
                                 for k in ('north', 'south', 'west', 'east')):
                width = map_entry['east'] - map_entry['west']
                height = map_entry['north'] - map_entry['south']
                if width > 0 and height > 0:
                    place['image'] = map_entry.get('bild')
                    place['pin_x'] = round(min(100.0, max(0.0, (spot[2] - map_entry['west']) / width * 100)), 1)
                    place['pin_y'] = round(min(100.0, max(0.0, (map_entry['north'] - spot[1]) / height * 100)), 1)
            if map_entry:
                place['map_name'] = map_entry.get('name')
                place['map_url'] = '/index.html?lang=%s&id=%s' % (lang, quest['i'])
                place['occurrences_url'] = '/index.html?vorkarte=%s&lang=%s' % (spot[0], lang)

    requirements = {'level': quest.get('vl'), 'all': [], 'one': [], 'extra': bool(quest.get('vb'))}
    for entry in rel.get('requires') or []:
        requirements['all'].append({'url': route(lang, 'q', entry['id']), 'text': entry['name']})
    for entry in rel.get('requires_one') or []:
        requirements['one'].append({'url': route(lang, 'q', entry['id']), 'text': entry['name']})

    groups = []
    def gabe(reward):
        art, name = reward[0], reward[1]
        ident = reward[6] if len(reward) > 6 else ''
        amount = reward[4] if len(reward) > 4 else 0
        link = None
        icon = None
        if art in ('i', 'c'):
            entry = builder.items.get(ident) or {}
            icon = entry.get('ic')
            if ident:
                if ident in builder.items:
                    link = {'url': route(lang, 'i', ident), 'text': name}
            else:
                link = builder.item_link(name)
        if link is None:
            link = {'url': None, 'text': name}
        if amount and amount > 1:
            return {'icon': icon,
                    'symbol': None if art in ('i', 'c') else {'t': 'titel', 'v': 'tugend'}.get(art, 'titel'),
                    'url': link['url'], 'text': link['text'], 'qty': int(amount)}
        return {'icon': icon, 'symbol': None if art in ('i', 'c') else
                {'t': 'titel', 'v': 'tugend'}.get(art, 'titel'),
                'url': link['url'], 'text': link['text'], 'qty': 0}

    fixed = [r for r in quest.get('rw', []) if r[0] == 'i']
    choice = [r for r in quest.get('rw', []) if r[0] == 'c']
    marks = [r for r in quest.get('rw', []) if r[0] not in ('i', 'c')]
    if fixed:
        groups.append({'label': w['sure'], 'items': [gabe(r) for r in fixed]})
    if choice:
        groups.append({'label': w['choice'], 'items': [gabe(r) for r in choice]})
    for art, label in (('t', w.get('titlelabel')), ('v', w.get('virtuelabel')),
                       ('tr', w.get('trait')), ('e', w.get('emote'))):
        group = [r for r in marks if r[0] == art]
        if group:
            groups.append({'label': label or w['rewards'], 'items': [gabe(r) for r in group]})

    required_by = [{'url': route(lang, 'q', entry['id']), 'text': entry['name']}
                   for entry in rel.get('required_by') or []]

    context = []
    for entry in rel.get('previous') or []:
        context.append({'label': w['previous'],
                        'items': [{'url': route(lang, 'q', entry['id']), 'text': entry['name']}],
                        'separator': ' · '})
    for entry in rel.get('next') or []:
        context.append({'label': w['next'],
                        'items': [{'url': route(lang, 'q', entry['id']), 'text': entry['name']}],
                        'separator': ' · '})
    if required_by:
        context.append({'label': w['required_by'],
                        'items': [{'url': None, 'text': '%d %s' % (len(required_by), w['qlist'])}],
                        'separator': ' · '})
    excludes = [{'url': route(lang, 'q', entry['id']), 'text': entry['name']}
                for entry in rel.get('excludes') or []]
    if excludes:
        context.append({'label': w['excludes'], 'items': excludes, 'separator': ' · '})
    if quest.get('g') and rel.get('same_giver'):
        context.append({'label': w['same_giver_label'],
                        'items': [{'url': None,
                                   'text': '%d %s %s' % (rel['same_giver'], w['qlist'], quest['g'])}],
                        'separator': ' · '})
    if rel.get('same_place'):
        context.append({'label': w['same_place_label'],
                        'items': [{'url': None, 'text': '%d %s' % (rel['same_place'], w['qlist'])}],
                        'separator': ' · '})
    middle = (len(context) + 1) // 2
    context_columns = [column for column in (context[:middle], context[middle:]) if column]

    steps = []
    for step in quest.get('s') or []:
        steps.append({'paragraphs': [str(par) for par in step[1]],
                      'objectives': [str(goal[0]) for goal in step[2]]})

    description = '%s: %s. %s. %s.' % (w['qlabel'], quest['n'],
                                        ' › '.join(quest.get('f', [])), w['map'])

    crumb_maps = []
    for map_id in fk:
        entry = builder.maps.get(str(map_id))
        name = (entry or {}).get('name') or ''
        # "Karte 268…" is a technical file name, not a place.
        if not name or re.fullmatch(r'Karte \d+', name):
            continue
        link = builder.map_link(map_id, name)
        if link:
            crumb_maps.append(link)

    return {
        'kind': 'q',
        'id': quest['i'],
        'name': quest['n'],
        'icon': 'aufgabe',
        'chips': chips,
        'description': quest.get('d') or '',
        'place': place,
        'giver': ({'url': '/suche.html?lang=%s&q=%s' % (lang, quote_plus(quest['g'])),
                   'text': quest['g']} if quest.get('g') else None),
        'area_trail': area_trail,
        'requirements': requirements,
        'reward_groups': groups,
        'required_by': required_by,
        'context_columns': context_columns,
        'steps': steps,
        'crumb_maps': crumb_maps,
        'seo': {'title': quest['n'], 'description': description},
    }


def quote_plus(text: str) -> str:
    return urlencode({'q': text})[2:]


# --- deeds -------------------------------------------------------------

# Accomplishment_Category from the client export; anything unknown is an
# honest "other deed" instead of a guessed label.
DEED_TYPES = {
    1: {'de': 'Entdecker', 'en': 'Explorer', 'fr': 'Explorateur'},
    11: {'de': 'Aufgabentat', 'en': 'Quest deed', 'fr': 'Prouesse de quête'},
    20: {'de': 'Bezwinger', 'en': 'Slayer', 'fr': 'Vainqueur'},
    33: {'de': 'Kunde', 'en': 'Lore', 'fr': 'Savoir'},
    34: {'de': 'Kunde', 'en': 'Lore', 'fr': 'Savoir'},
}
OTHER_DEED = {'de': 'Weitere Tat', 'en': 'Other deed', 'fr': 'Autre prouesse'}


def clean_area(deed) -> list:
    return [part for part in deed.get('f') or []
            if part and not re.fullmatch(r'Karte \d+', str(part))]


def deed_index(model) -> dict:
    """Area and kind neighbours, resolved once for the whole language."""
    by_area, by_art = {}, {}
    for deed in model['deeds']:
        area = clean_area(deed)
        if area:
            by_area.setdefault(area[-1], []).append(deed)
        if deed.get('a'):
            by_art.setdefault(deed['a'], []).append(deed)
    return {'by_area': by_area, 'by_art': by_art}


def deed_view(builder: ViewBuilder, deed: dict, index: dict, categories: dict) -> dict:
    w, lang = builder.w, builder.lang
    area = clean_area(deed)
    category = categories.get(str(deed.get('i')).upper())
    kind = DEED_TYPES.get(category, OTHER_DEED)[lang]

    chips = []
    if deed.get('l'):
        chips.append('%s %s' % (w['level'], deed['l']))
    if area:
        chips.append(' · '.join(area[-2:]))
    chips.append(kind)
    if deed.get('s'):
        chips.append(w['steps_one'] if len(deed['s']) == 1 else w['steps_count'] % len(deed['s']))
    if deed.get('rw'):
        chips.append(w['rewards_one'] if len(deed['rw']) == 1 else w['rewards_count'] % len(deed['rw']))
    if deed.get('lp'):
        chips.append('%s %s' % (w['points'], deed['lp']))

    def gabe(art, name, amount=0, ident=''):
        if art in ('i', 'c'):
            item_id = str(ident).upper() if ident else None
            if item_id is None:
                link = builder.item_link(name)
                item_id = None
            entry = builder.items.get(item_id) if item_id else None
            return {'kind': 'item', 'icon': (entry or {}).get('ic'),
                    'url': route(lang, 'i', item_id) if entry else None,
                    'text': name, 'qty': int(amount) if amount and amount > 1 else 0}
        if art == 't':
            return {'kind': 'title', 'label': w['titlelabel'], 'text': name}
        if art == 'v':
            return {'kind': 'virtue', 'label': w['virtuelabel'], 'text': name}
        label = {'tr': w['trait'], 'e': w['emote']}.get(art, w['rewards'])
        return {'kind': 'plain', 'label': label, 'text': name}

    fixed, choice = [], []
    for reward in deed.get('rw') or []:
        art, name = reward[0], reward[1]
        amount = reward[4] if len(reward) > 4 else 0
        ident = reward[6] if len(reward) > 6 else ''
        (choice if art == 'c' else fixed).append(gabe(art, name, amount, ident))
    if deed.get('lp'):
        fixed.append({'kind': 'plain', 'label': w['points'], 'text': str(deed['lp'])})

    points = deed.get('t') or []
    maps = sorted({str(point[0]) for point in points})
    place = None
    if points:
        place = {'images': [], 'hint': None}
        if len(maps) == 1:
            map_entry = builder.maps.get(maps[0])
            if len(points) == 1 and map_entry and all(
                    map_entry.get(k) is not None for k in ('north', 'south', 'west', 'east')):
                width = map_entry['east'] - map_entry['west']
                height = map_entry['north'] - map_entry['south']
                if width > 0 and height > 0:
                    lat, lon = points[0][1], points[0][2]
                    place['images'].append({
                        'map': maps[0],
                        'pin_x': round(min(100.0, max(0.0, (lon - map_entry['west']) / width * 100)), 1),
                        'pin_y': round(min(100.0, max(0.0, (map_entry['north'] - lat) / height * 100)), 1),
                    })
            if len(points) == 1:
                place['hint'] = coords(points[0][1], points[0][2])
            else:
                place['hint'] = w['points_count'].replace('%s', str(len(points)))
        else:
            place['hint'] = '%s · %s' % (w['points_count'].replace('%s', str(len(points))),
                                         w['maps_count'].replace('%s', str(len(maps))))

    facts = [{'label': w['deed_type'], 'text': kind}]
    if deed.get('a'):
        facts.append({'label': w['category'], 'text': deed['a']})
    if area:
        facts.append({'label': w['area_label'], 'text': ' › '.join(area)})

    more_area = []
    if area and area[-1] not in ('Ohne Gebiet', 'Weitere Inhalte'):
        more_area = [d for d in index['by_area'].get(area[-1], []) if d['i'] != deed['i']]
    more_kind = []
    if deed.get('a') and deed['a'] != 'Allgemein':
        more_kind = [d for d in index['by_art'].get(deed['a'], []) if d['i'] != deed['i']]

    steps = [{'paragraphs': [str(par) for par in step[1]],
              'objectives': [str(goal[0]) for goal in step[2]]}
             for step in deed.get('s') or []]

    description = '%s: %s. %s. %s.' % (w['dlabel'], deed['n'], ' › '.join(area), w['map'])

    crumb_maps = []
    for map_id in deed.get('fk') or []:
        entry = builder.maps.get(str(map_id))
        name = (entry or {}).get('name') or ''
        if not name or re.fullmatch(r'Karte \d+', name):
            continue
        link = builder.map_link(map_id, name)
        if link:
            crumb_maps.append(link)

    return {
        'kind': 'd',
        'id': deed['i'],
        'name': deed['n'],
        'icon': 'tat',
        'chips': chips,
        'description': deed.get('d') or '',
        'map_link': old_link(lang, 'd', deed['i']),
        'place': place,
        'facts': facts,
        'rewards_fixed': fixed,
        'rewards_choice': choice,
        'more_area': {
            'title': w['more_deeds'] % area[-1] if area else '',
            'count': len(more_area),
            'entries': [{'url': route(lang, 'd', d['i']), 'text': d['n']} for d in more_area[:8]],
            'rest': max(0, len(more_area) - 8),
        } if more_area else None,
        'more_kind': {
            'title': w['same_kind'],
            'count': len(more_kind),
            'entries': [{'url': route(lang, 'd', d['i']), 'text': d['n']} for d in more_kind[:6]],
            'rest': max(0, len(more_kind) - 6),
        } if more_kind else None,
        'steps': steps,
        'crumb_maps': crumb_maps,
        'seo': {'title': deed['n'], 'description': description},
    }


# --- titles and virtues ------------------------------------------------

def honor_view(builder: ViewBuilder, art: str, entry: dict) -> dict:
    """Title or virtue page: what it is and which deeds award it."""
    w, lang = builder.w, builder.lang
    name = entry.get('name') or ''
    rows = (entry.get('q') or {}).get(lang) or (entry.get('q') or {}).get('en') or []
    sources = []
    for row in rows:
        kind, qid, qname = row[0], row[1], row[2]
        zone = row[3] if len(row) > 3 else ''
        region = row[4] if len(row) > 4 else ''
        sort = row[5] if len(row) > 5 else ''
        extra = ' · '.join(part for part in (sort, region, zone) if part)
        reference = None
        if kind == 'q':
            reference = route(lang, 'q', qid) if qid in builder.quests else old_link(lang, 'q', qid)
        elif kind == 'd':
            reference = route(lang, 'd', qid) if qid in builder.deeds else old_link(lang, 'd', qid)
        sources.append({'url': reference, 'text': qname, 'extra': extra})
    return {
        'kind': art,
        'id': entry.get('i') or entry.get('id') or '',
        'name': name,
        'icon': 'titel' if art == 'title' else 'tugend',
        'sources': sources,
        'ranked': bool(re.search(r'\bRANK\b|\bNAME\b|\bSURNAME\b', name)),
        'seo': {'title': name, 'description': '%s: %s' % (w[art + 'label'], name)},
    }


# --- recipes -----------------------------------------------------------

def recipe_view(builder: ViewBuilder, row: list) -> dict:
    w, lang = builder.w, builder.lang
    profession = row[9]
    entry = builder.professions.get(profession) or {}
    profession_name = ((entry.get('n') or {}).get(lang)
                       or (entry.get('n') or {}).get('en') or profession)

    def part(item_part):
        name = item_part[0]
        amount = item_part[1]
        icon = item_part[2] if len(item_part) > 2 else None
        link = builder.item_link(name)
        return {'icon': icon, 'amount': amount, 'text': name,
                'url': link['url'] if link else None}

    ingredients = [part(entry) for entry in row[6]]
    optional = []
    for entry in row[7]:
        item = part(entry)
        if len(entry) > 2 and entry[2]:
            item['chance'] = round(entry[2] * 100, 2)
        optional.append(item)

    return {
        'kind': 'recipe',
        'id': row[10],
        'name': row[0],
        'icon': 'rezept',
        'symbol': row[16] if len(row) > 16 else None,
        'profession': {'url': route(lang, 'p', profession), 'text': profession_name},
        'profession_key': profession,
        'tier': row[4],
        'category': row[5],
        'level': row[2] or None,
        'ingredients': ingredients,
        'optional': optional,
        'critical': row[8] or '',
        'critical_symbol': row[17] if len(row) > 17 else None,
        'chance': row[12] if len(row) > 12 and row[12] else None,
        # The generator prints the stored float as-is ("7.0 s").
        'time': str(row[13]) if len(row) > 13 and row[13] else None,
        'craft_url': old_link(lang, 'recipe', row[10]),
        'crumb_profession': {'text': profession_name, 'url': route(lang, 'p', profession)},
        'seo': {'title': row[0],
                'description': '%s: %s. %s · %s.' % (w['recipelabel'], row[0], row[3], row[4])},
    }


# --- areas, regions and professions ------------------------------------

PAGE_SIZE = 200


def members_index(builder: ViewBuilder, model: dict) -> dict:
    """Entities per map, for the area pages.

    Items belong to a map through the quest or deed that awards them, exactly
    as the static generator derived it.
    """
    members = {kind: {} for kind in ('q', 'd', 'i')}
    for kind, rows in (('q', builder.quests), ('d', builder.deeds)):
        for ident, entry in rows.items():
            for map_id in set(entry.get('fk') or []):
                members[kind].setdefault(map_id, []).append((ident, entry))
    for ident, item in builder.items.items():
        map_ids = set()
        for source in item.get('quellen') or []:
            entry = (builder.quests if source[0] == 'q' else builder.deeds).get(source[1])
            if entry:
                map_ids.update(entry.get('fk') or [])
        for map_id in map_ids:
            members['i'].setdefault(map_id, []).append((ident, item))
    return members


def area_view(builder: ViewBuilder, entry: dict, kind: str, members: dict) -> dict:
    w, lang = builder.w, builder.lang
    ident = str(entry.get('idx'))
    body_children = [(str(m.get('idx')), m) for m in builder.maps.values()
                     if m.get('eltern') == entry.get('idx')]
    parent = builder.maps.get(str(entry.get('eltern'))) if entry.get('eltern') else None

    parent_link = None
    if parent:
        parent_kind = 'region' if parent.get('tier') == 1 else 'area'
        parent_link = {'url': route(lang, parent_kind, str(parent['idx'])),
                       'text': parent.get('name') or ''}

    sections = []
    for member_kind in ('q', 'd', 'i'):
        rows = members[member_kind].get(entry.get('idx')) or members[member_kind].get(ident) or []
        if not rows:
            continue
        rows = sorted(rows, key=lambda row: builder.name_of(member_kind, row[1]).casefold())
        sections.append({
            'title': '%s (%d)' % (w[member_kind + 'list'], len(rows)),
            'entries': [{'url': route(lang, member_kind, row[0]),
                         'text': builder.name_of(member_kind, row[1]),
                         # Item rows carry the client symbol, like every list.
                         'icon': row[1].get('ic') if member_kind == 'i' else None}
                        for row in rows[:PAGE_SIZE]],
            'excerpt': len(rows) > PAGE_SIZE,
        })

    return {
        'kind': kind,
        'id': ident,
        'name': entry.get('name') or '',
        'icon': 'region' if kind == 'region' else 'gebiet',
        'map_url': '/index.html?lang=' + lang + '#map-' + ident,
        'parent': parent_link,
        'children': [{'url': route(lang, 'area', key), 'text': value.get('name') or ''}
                     for key, value in sorted(body_children, key=lambda row: (row[1].get('name') or '').casefold())],
        'children_title': w['arealist'],
        'sections': sections,
        'seo': {'title': entry.get('name') or '',
                'description': '%s: %s – LOTRO Log Book.' % (w['cataloglabel'], entry.get('name') or '')},
    }


def profession_view(builder: ViewBuilder, key: str, entry: dict, recipes: list) -> dict:
    w, lang = builder.w, builder.lang
    tiers = sorted({row[11] for _ident, row in recipes})
    groups = []
    for tier in tiers:
        group = [(ident, row) for ident, row in recipes if row[11] == tier]
        groups.append({
            'title': group[0][1][4],
            'entries': [{'url': route(lang, 'recipe', ident), 'text': row[0]}
                        for ident, row in sorted(group, key=lambda row: row[1][0].casefold())],
        })
    return {
        'kind': 'p',
        'id': key,
        'name': entry.get('name') or key,
        'icon': 'beruf',
        'craft_url': old_link(lang, 'p', key),
        'groups': groups,
        'seo': {'title': entry.get('name') or key, 'description': w['overview']},
    }


# --- items -------------------------------------------------------------

QUALITY_BY_KEY = {1: 'LEGENDARY', 2: 'RARE', 3: 'INCOMPARABLE', 4: 'UNCOMMON', 5: 'COMMON'}
QUALITY_NUMBER = {'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'INCOMPARABLE': 4, 'LEGENDARY': 5}


class ItemContext:
    """Everything the item pages need beyond the item record itself."""

    def __init__(self, builder: ViewBuilder, details: dict, sets: dict, labels: dict,
                 typen: dict, vorkommen: dict, boni: dict, boni_labels: dict,
                 referenz: dict):
        self.builder = builder
        self.details = details
        self.sets = sets
        self.labels = labels
        self.typen = typen
        self.vorkommen = vorkommen
        self.boni = boni
        self.boni_labels = boni_labels
        self.referenz = referenz
        self.by_name = {}
        for ident, item in builder.items.items():
            for name in (item.get('n') or {}).values():
                if name:
                    self.by_name.setdefault(sauber(name), []).append((ident, item))
        self.orte, self.index, self.resource_names = self._resource_places()

    def _resource_places(self):
        areas = {str(row[0]): row for row in self.vorkommen.get('g') or []}
        places = {}
        for area_id, pairs in self.vorkommen.get('m') or []:
            area = areas.get(str(area_id))
            if not area:
                continue
            for pair in pairs:
                if not pair:
                    continue
                places.setdefault(str(pair[0]), []).append(
                    [area[1], area[2], pair[1] if len(pair) > 1 else 0])
        index = {str(row[0]): number for number, row in enumerate(self.vorkommen.get('k') or [], 1)}
        names = {str(row[0]): row[1] for row in self.vorkommen.get('k') or []}
        return places, index, names

    def profession_name(self, key):
        entry = (self.referenz.get('berufe') or {}).get(key) or {}
        names = entry.get('n') or {}
        return names.get(self.builder.lang) or names.get('en') or key or ''

    def label(self, section, key):
        return ((self.typen.get(section) or {}).get(self.builder.lang) or {}).get(key, key or '')

    def stat_name(self, stat_id):
        entry = (self.labels.get(self.builder.lang) or {}).get(str(stat_id))
        if isinstance(entry, list) and entry:
            return str(entry[0]), bool(entry[1])
        return str(stat_id), False

    def quality(self, item, details):
        value = (details or {}).get('quality') or item.get('q')
        if isinstance(value, int):
            value = QUALITY_BY_KEY.get(value)
        return value or ''

    def variants(self, item, ident):
        name = sauber(builder_name(self.builder, item))
        return [(other, entry) for other, entry in self.by_name.get(name, []) if other != ident]


def builder_name(builder: ViewBuilder, item: dict) -> str:
    names = item.get('n') or {}
    return klarer_name(names.get(builder.lang) or names.get('en') or '')


def item_view(builder: ViewBuilder, ctx: ItemContext, ident: str, item: dict) -> dict:
    w, lang = builder.w, builder.lang
    details = ctx.details.get(ident) or {}
    name = builder_name(builder, item)

    eyebrow = ' · '.join(part for part in (
        ctx.label('slot', (details or {}).get('slot') or item.get('slot') or ''),
        ctx.label('armour' if (details or {}).get('kind') == 'a' else 'weapon',
                  (details or {}).get('subtype') or item.get('sub') or '')) if part)

    chips = []
    quality = ctx.quality(item, details)
    if quality:
        chips.append({'cls': 'q%d' % QUALITY_NUMBER.get(quality, 0), 'text': ctx.label('quality', quality)})
    min_level = (details or {}).get('minLevel')
    if min_level:
        chips.append({'cls': '', 'text': '%s %s' % (w['min_level'], min_level)})
    if item.get('l') and item['l'] != min_level:
        chips.append({'cls': '', 'text': '%s %s' % (w['item_level'], item['l'])})
    binding = (details or {}).get('binding')
    if binding == 1:
        chips.append({'cls': '', 'text': w['bound_acquire']})
    elif binding == 2:
        chips.append({'cls': '', 'text': w['bound_equip']})
    if (details or {}).get('scalable'):
        chips.append({'cls': '', 'text': w['scalable']})
    if (details or {}).get('unique'):
        chips.append({'cls': '', 'text': w['unique']})
    if (details or {}).get('essenceSlots'):
        chips.append({'cls': '', 'text': '%s %s' % (w['essence_slots'], details['essenceSlots'])})

    values = item.get('w') or {}
    armour = (details or {}).get('armour') or values.get('armour')
    dps = (details or {}).get('dps') or values.get('dps')
    damage = (details or {}).get('damage') or values.get('damage')
    speed = (details or {}).get('speed') or values.get('speed')
    damage_type = (details or {}).get('damageType') or values.get('damageType')
    def zahl(value):
        return str(value)

    basic, seen = [], set()
    if dps:
        basic.append({'label': 'DPS', 'value': zahl(dps)})
    if damage:
        basic.append({'label': w['damage'], 'value': zahl(damage)})
    if speed:
        basic.append({'label': w['speed'], 'value': zahl(speed)})
    if damage_type:
        basic.append({'label': w['damage_type'], 'value': zahl(damage_type)})
    bonuses = []
    for stat_id, value in (details or {}).get('stats') or []:
        if not value:
            continue
        label, percent = ctx.stat_name(stat_id)
        seen.add(label.casefold())
        # The generator prints a leading sign only for plain numbers.
        text = ('%s %%' % value) if percent else (
            ('+' + str(value)) if isinstance(value, (int, float)) and value
            else ('–' if value is None else str(value)))
        bonuses.append({'label': label, 'display': text})
    for key, value in (ctx.boni.get(ident) or {}).get('s') or []:
        if key == 'ARMOUR':
            continue
        # Stat bonus names come from the bonus export; unknown keys stay raw.
        label = ctx.boni_labels.get(key) or key
        if label.casefold() in seen:
            continue
        seen.add(label.casefold())
        text = ('+' + str(value)) if isinstance(value, (int, float)) and value else (
            '–' if value is None else str(value))
        bonuses.append({'label': label, 'display': text})
    scale = (details or {}).get('scale')

    resources = []
    for entry in item.get('vor') or []:
        art_id, res_name, profession, tier = entry
        res_name = ctx.resource_names.get(str(art_id), res_name)
        key = (str(res_name), str(profession), tier)
        if key in [tuple(row['key']) for row in resources]:
            continue
        parts = [ctx.profession_name(profession), '%s %s' % (w['level'], tier) if tier else '']
        places = sorted(ctx.orte.get(str(ctx.index.get(str(art_id))), []), key=lambda row: -(row[2] or 0))
        resources.append({
            'key': list(key),
            'name': res_name,
            'meta': ' · '.join(part for part in parts if part),
            'places': [{'url': '/index.html?vorkommen=%s&vorkarte=%s' % (art_id, place[1]),
                        'name': place[0], 'count': place[2]} for place in places[:6]],
        })

    sources = []
    for row in item.get('quellen') or []:
        kind, qid, qname = row[0], row[1], row[2]
        zone = row[3] if len(row) > 3 else ''
        region = row[4] if len(row) > 4 else ''
        reference = route(lang, kind, qid) if (
            (kind == 'q' and qid in builder.quests) or (kind == 'd' and qid in builder.deeds)
            or (kind == 'i' and qid in builder.items)) else old_link(lang, kind, qid)
        sources.append({'url': reference, 'text': qname,
                        'extra': ' › '.join(part for part in (region, zone) if part)})

    crafted_by = [{'url': route(lang, 'recipe', rid), 'text': builder.recipes[rid][0]}
                  for rid in item.get('rezepte') or [] if rid in builder.recipes]
    used_in = [{'url': route(lang, 'recipe', rid), 'text': builder.recipes[rid][0]}
               for rid in item.get('zutat') or [] if rid in builder.recipes]

    # Varianten bleiben vorerst aussen vor: der statische Bau rendert sie nie
    # (sein Zugriff auf model['all'] laeuft ins Leere). Sie zu aktivieren ist
    # eine eigene Entscheidung, kein Umbauschritt.

    set_block = None
    set_id = (details or {}).get('set')
    set_data = ctx.sets.get(str(set_id or ''))
    if set_data:
        names = set_data.get('name') or {}
        set_name = names.get(lang) or names.get('en') or names.get('de') or ''
        level = set_data.get('level') or 0
        top = set_data.get('maxLevel') or 0
        head = set_name
        if level:
            head += ' · %s %s%s' % (w['level'], level, ('–%s' % top) if top and top != level else '')
        # The static build lists set members as plain names (its lookup into
        # model['all'] misses), so the migration keeps them unlinked.
        members = []
        for iid in set_data.get('items') or []:
            if iid in builder.items:
                members.append({'url': None, 'text': builder_name(builder, builder.items[iid])})
            elif iid in ctx.details:
                other = ctx.details[iid].get('name') or {}
                text = other.get(lang) or other.get('en') or other.get('de') or ''
                if text:
                    members.append({'url': None, 'text': text})
        set_bonuses = []
        for amount, stats in set_data.get('bonuses') or []:
            values = []
            for stat_id, value in stats:
                label, percent = ctx.stat_name(stat_id)
                values.append('%s %s%s' % (label, value, ' %' if percent else ''))
            set_bonuses.append({'amount': amount, 'text': ', '.join(values)})
        set_block = {'head': head, 'members': members, 'bonuses': set_bonuses}

    description = (details or {}).get('description')
    if isinstance(description, dict):
        description = description.get(lang) or description.get('en') or description.get('de')
    description = (description or '').strip()

    category = ((details or {}).get('category') or item.get('kat') or '').upper()
    slot = (details or {}).get('slot') or item.get('slot') or ''
    browse = None
    if category in ('ARMOUR', 'WEAPON') and slot:
        browse = {'url': '/gegenstaende.html?lang=%s&kat=%s&platz=%s' % (lang, category, slot),
                  'text': w['browse_link'], 'note': w['browse_text']}

    return {
        'kind': 'i',
        'id': ident,
        'name': name,
        'icon': None,
        'symbol': item.get('ic'),
        'eyebrow': eyebrow,
        'head_class': ('q%d' % QUALITY_NUMBER.get(quality, 0)) if quality else '',
        'chips': chips,
        'description': description,
        'armour': armour,
        # The generator emits the values section when it has any value or a
        # raw scale record, even if that record renders no text (10 pages).
        'has_values': bool(armour or basic or bonuses or scale),
        'values': basic,
        'bonuses': bonuses,
        'scale': scale[0] if scale and scale[0] else None,
        'resources': resources,
        'sources': sources,
        'vendor': bool((details or {}).get('vendors')),
        'crafted_by': crafted_by,
        'used_in': used_in,
        'set': set_block,
        'required_class': (details or {}).get('requiredClass'),
        'browse': browse,
        'seo': {'title': name, 'description': '%s: %s. %s' % (w['ilabel'], name, w['item_intro'])},
    }
