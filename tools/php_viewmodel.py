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

from build_katalogseiten import WORDS, route, escape  # noqa: E402
from giver_viewmodel import giver_url  # noqa: E402
from vendor_viewmodel import vendor_url  # noqa: E402
import seo  # noqa: E402


def klarer_name(text) -> str:
    text = str(text or '').replace('\\q', '"')
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


# Application pages: language in the path, same segments as Catalogue.php.
APP_SEGMENTS = {
    'de': {'start': '', 'karte': 'karte', 'taten': 'karte/taten',
           'gegenstandssuche': 'gegenstandssuche', 'handwerk': 'handwerk/rezepte',
           'reise': 'reise', 'ruf': 'ruf', 'belohnungen': 'belohnungen',
           'spielstand': 'spielstand', 'companion': 'companion', 'plugin': 'plugin',
            'suche': 'suche', 'givers': 'auftraggeber', 'vendors': 'haendler', 'landmarks': 'landmarke', 'factions': 'fraktion', 'instances': 'instanz'},
    'en': {'start': '', 'karte': 'map', 'taten': 'map/deeds',
           'gegenstandssuche': 'item-search', 'handwerk': 'crafting/recipes',
           'reise': 'travel', 'ruf': 'reputation', 'belohnungen': 'rewards',
           'spielstand': 'progress', 'companion': 'companion', 'plugin': 'plugin',
            'suche': 'search', 'givers': 'quest-giver', 'vendors': 'vendor', 'landmarks': 'landmark', 'factions': 'faction', 'instances': 'instance'},
    'fr': {'start': '', 'karte': 'carte', 'taten': 'carte/prouesses',
           'gegenstandssuche': 'recherche-objets', 'handwerk': 'artisanat/recettes',
           'reise': 'voyage', 'ruf': 'reputation', 'belohnungen': 'recompenses',
           'spielstand': 'progression', 'companion': 'companion', 'plugin': 'plugin',
            'suche': 'recherche', 'givers': 'donneur-de-quete', 'vendors': 'marchand', 'landmarks': 'site', 'factions': 'faction', 'instances': 'instance'},
}


def app_url(lang: str, page: str, **params) -> str:
    """Public address of an application page, with optional parameters."""
    segment = APP_SEGMENTS[lang][page]
    url = '/' + lang + '/' + (segment + '/' if segment else '')
    return url + ('?' + urlencode(params) if params else '')


def beruf_url(lang: str, key: str | None = None) -> str:
    """Profession addresses are 301s to the crafting page: link that directly.

    `/de/beruf/COOK/` answers 301 to `/de/handwerk/rezepte/?beruf=COOK`, and
    the recipe page reads that parameter, so the canonical address is the
    filtered crafting page.
    """
    return app_url(lang, 'handwerk', **({'beruf': key} if key else {}))


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
        if kind in ('area', 'region', 'f', 'l'):
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
        if (not entry or
                re.fullmatch(r'(?:Karte|Map|Carte)\s+\d+', entry.get('name') or '', re.IGNORECASE)):
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
        if index < len(fk):
            link = builder.map_link(fk[index], name)
        area_trail.append({'text': name, 'url': link['url'] if link else None})

    place = None
    spot = quest.get('gt')
    goals = quest.get('t') or []
    if spot or goals:
        travel_point = spot or (goals[0] if goals else None)
        travel = ''
        if travel_point:
            travel = app_url(lang, 'reise', nach='%.1f%s %.1f%s' % (
                abs(travel_point[1]), 'S' if travel_point[1] < 0 else 'N',
                abs(travel_point[2]), 'W' if travel_point[2] < 0 else 'E'))
        place = {
            'image': None, 'pin_x': None, 'pin_y': None,
            'coords': None, 'points': len(goals) if len(goals) > 1 else 0,
            'map_name': None, 'map_url': None,
            'area_url': None,
            'occurrences_url': None,
            'map_link': app_url(lang, 'karte', id=quest['i']),
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
                place['map_url'] = app_url(lang, 'karte', id=quest['i'])
                place['area_url'] = route(lang, 'area', spot[0])
                place['occurrences_url'] = app_url(lang, 'karte', vorkarte=spot[0])

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

    # Ein Text für alle Seiten dieser Art, gebaut aus den Werten, die die
    # Seite ohnehin zeigt (tools/seo.py).
    seo_block = seo.quest(
        lang, name=quest['n'], area=' › '.join(quest.get('f') or []),
        level=quest.get('l') or '', giver=quest.get('g') or '',
        steps=len(quest.get('s') or []), rewards=len(quest.get('rw') or []))

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
        'giver': ({'url': giver_url(lang, quest['gi']) if quest.get('gi')
                   else app_url(lang, 'suche', q=quest['g']),
                   'text': quest['g']} if quest.get('g') else None),
        'area_trail': area_trail,
        'requirements': requirements,
        'reward_groups': groups,
        # The relation "Wird vorausgesetzt von" is a list in the context
        # section, never part of the rewards. Only IDs travel; the renderer
        # resolves names from the relation shards.
        'related_quests': [entry['url'].strip('/').split('/')[-1] for entry in required_by],
        'related_label': w['required_by'],
        'context_columns': context_columns,
        'steps': steps,
        'crumb_maps': crumb_maps,
        'seo': seo_block,
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

    # Dieselbe Regel wie bei den Aufgaben: Name, Fakten, Nutzen.
    seo_block = seo.deed(
        lang, name=deed['n'], area=' › '.join(area), kind=kind,
        level=deed.get('l') or '', steps=len(deed.get('s') or []))

    crumb_maps = []
    for map_id in deed.get('fk') or []:
        entry = builder.maps.get(str(map_id))
        name = (entry or {}).get('name') or ''
        if not name or re.fullmatch(r'Karte \d+', name):
            continue
        link = builder.map_link(map_id, name)
        if link:
            crumb_maps.append(link)

    # Context deeds of the same area and of the same kind, deduplicated and
    # complete. The relation component renders and filters them; a capped
    # eight-entry excerpt hid up to 633 related deeds.
    # Only IDs travel in the page model; the renderer resolves names from the
    # relation shards. Full text here would add hundreds of megabytes.
    context_deeds = {}
    for entry in more_area + more_kind:
        context_deeds[entry['i']] = entry
    context_ids = [entry['i'] for entry in
                   sorted(context_deeds.values(), key=lambda e: e['n'].lower())]

    return {
        'kind': 'd',
        'id': deed['i'],
        'name': deed['n'],
        'icon': 'tat',
        'chips': chips,
        'description': deed.get('d') or '',
        'map_link': app_url(lang, 'taten', id=deed['i']),
        'place': place,
        'facts': facts,
        'rewards_fixed': fixed,
        'rewards_choice': choice,
        'related_deeds': context_ids,
        'related_label': {'de': 'Zusammenhang', 'en': 'Context', 'fr': 'Contexte'}[lang],
        'steps': steps,
        'crumb_maps': crumb_maps,
        'seo': seo_block,
    }


# --- titles and virtues ------------------------------------------------

def honor_view(builder: ViewBuilder, art: str, entry: dict) -> dict:
    """Title or virtue page: what it is and which deeds award it."""
    w, lang = builder.w, builder.lang
    name = entry.get('name') or ''
    rows = (entry.get('q') or {}).get(lang) or []
    sources = []
    for row in rows:
        kind, qid, qname = row[0], row[1], row[2]
        zone = row[3] if len(row) > 3 else ''
        region = row[4] if len(row) > 4 else ''
        sort = row[5] if len(row) > 5 else ''
        extra = ' · '.join(part for part in (sort, region, zone) if part)
        reference = None
        if kind == 'q':
            reference = route(lang, 'q', qid) if qid in builder.quests else app_url(lang, 'karte', id=qid)
        elif kind == 'd':
            reference = route(lang, 'd', qid) if qid in builder.deeds else app_url(lang, 'taten', id=qid)
        sources.append({'url': reference, 'text': qname, 'extra': extra})
    return {
        'kind': art,
        'id': entry.get('i') or entry.get('id') or '',
        'name': name,
        'icon': 'titel' if art == 'title' else 'tugend',
        'sources': sources,
        'ranked': bool(re.search(r'\bRANK\b|\bNAME\b|\bSURNAME\b', name)),
        'seo': seo.honor(lang, name=name, art=art, sources=sources),
    }


# --- Fraktionen und Landmarken -----------------------------------------

def faction_view(builder: ViewBuilder, entry: dict) -> dict:
    """Faction page: description, tier ladder and what earns reputation.

    The import already knows each character's standing; the page itself stays
    static and names only the sources, so it reads the same with and without a
    game state.
    """
    w, lang = builder.w, builder.lang
    name = entry.get('name') or ''
    unten = int(entry.get('min') or 1)
    oben = int(entry.get('max') or unten)
    stufen = []
    for nummer in range(unten, oben + 1):
        label = ((entry.get('tiers') or {}).get(str(nummer)) or {}).get(lang) or ''
        stufen.append({'nr': nummer, 'name': label})

    gruppen: dict[str, dict] = {}
    for quelle in entry.get('sources') or []:
        art, ident = quelle.get('kind'), quelle.get('id')
        # In ruf-quellen-<sprache>.js is q a quest and t a DEED, not a title.
        if art in ('q', 't') and ident in builder.quests:
            ziel = route(lang, 'q', ident)
        elif art in ('t', 'd') and ident in builder.deeds:
            ziel = route(lang, 'd', ident)
        elif art == 'i' and ident in builder.items:
            ziel = route(lang, 'i', ident)
        else:
            ziel = None
        gruppe = gruppen.setdefault('q' if art == 'q' else 't', {'kind': art, 'entries': []})
        stufe = quelle.get('level') or 0
        staerke = quelle.get('strength') or 0
        gruppe['entries'].append({
            'url': ziel, 'text': quelle.get('name') or '',
            'extra': quelle.get('place') or '',
            'level': stufe if 0 < stufe < 1000 else None,
            'strength': staerke if 1 <= staerke <= 6 else None,
            'bar': '▮' * staerke if 1 <= staerke <= 6 else '',
        })

    return {
        'kind': 'f',
        'id': entry.get('id') or '',
        'name': name,
        'icon': 'fraktion',
        'description': entry.get('desc') or '',
        'paragraphs': [absatz.strip() for absatz in (entry.get('desc') or '').split('\n\n')
                       if absatz.strip()],
        'tiers': stufen,
        'start': entry.get('start'),
        'groups': [gruppen[key] for key in ('q', 't') if key in gruppen],
        'total': sum(len(gruppe['entries']) for gruppe in gruppen.values()),
        'stand_url': app_url(lang, 'ruf'),
        'seo': seo.faction(lang, name=name, tiers=len(stufen),
                           sources=sum(len(gruppe['entries']) for gruppe in gruppen.values())),
    }


def landmark_view(builder: ViewBuilder, entry: dict) -> dict:
    """Landmark page: the spot on its map and the quests that lead there."""
    w, lang = builder.w, builder.lang
    name = entry.get('name') or ''
    karte = builder.maps.get(str(entry.get('map')))
    ort = {'image': None, 'pin_x': None, 'pin_y': None,
           'map_name': None, 'map_url': None, 'region': None, 'coords': None}
    if karte:
        ort['map_name'] = karte.get('name')
        ort['image'] = karte.get('bild')
        map_page = builder.map_link(entry.get('map'), karte.get('name') or '')
        ort['map_url'] = map_page['url'] if map_page else None
        eltern = builder.maps.get(str(karte.get('eltern')))
        if eltern:
            ort['region'] = builder.map_link(eltern.get('idx'), eltern.get('name') or '')
        if entry.get('lat') is not None and entry.get('lon') is not None:
            breite = karte['east'] - karte['west']
            hoehe = karte['north'] - karte['south']
            if breite > 0 and hoehe > 0:
                ort['pin_x'] = round(min(100.0, max(0.0, (entry['lon'] - karte['west']) / breite * 100)), 1)
                ort['pin_y'] = round(min(100.0, max(0.0, (karte['north'] - entry['lat']) / hoehe * 100)), 1)
                ort['coords'] = coords(entry['lat'], entry['lon'])

    ziele = []
    for ident in entry.get('targets') or []:
        if ident in builder.quests:
            ziele.append({'url': route(lang, 'q', ident), 'text': builder.quests[ident]['n'], 'art': 'q'})
        elif ident in builder.deeds:
            ziele.append({'url': route(lang, 'd', ident), 'text': builder.deeds[ident]['n'], 'art': 'd'})

    return {
        'kind': 'l',
        'id': entry.get('id') or '',
        'name': name,
        'icon': 'landmarke',
        'place': ort,
        'quests': ziele,
        # Open the map at this area, not at the overview: `vorkarte` is the
        # map id the app already understands (it preselects the area).
        'map_link': app_url(lang, 'karte', vorkarte=entry['map'])
            if entry.get('map') else app_url(lang, 'karte'),
        'seo': seo.landmark(lang, name=name, area=ort.get('map_name') or '',
                            region=(ort.get('region') or {}).get('text') or '',
                            quests=len(ziele)),
    }


# --- recipes -----------------------------------------------------------

def recipe_view(builder: ViewBuilder, row: list, ohne_herkunft=None) -> dict:
    """One recipe page. `ohne_herkunft` names item ids whose page answers
    neither "Vorkommen" nor "Woher"; their ingredient link carries no toggle."""
    w, lang = builder.w, builder.lang
    profession = row[9]
    entry = builder.professions.get(profession) or {}
    profession_name = ((entry.get('n') or {}).get(lang)
                       or (entry.get('n') or {}).get('en') or profession)
    leer = ohne_herkunft or set()

    def part(item_part, optional=False):
        name = item_part[0]
        amount = item_part[1]
        icon_index, id_index = (3, 4) if optional else (2, 3)
        icon = item_part[icon_index] if len(item_part) > icon_index else None
        identifier = item_part[id_index] if len(item_part) > id_index else None
        link = builder.item_link(name)
        return {'icon': icon, 'amount': amount, 'text': name,
                'herkunft': str(identifier) not in leer if identifier else True,
                'url': route(lang, 'i', identifier) if identifier and identifier in builder.items
                else (link['url'] if link else None)}

    ingredients = [part(entry) for entry in row[6]]
    optional = []
    for entry in row[7]:
        item = part(entry, optional=True)
        if len(entry) > 2 and entry[2]:
            item['chance'] = round(entry[2] * 100, 2)
        optional.append(item)

    return {
        'kind': 'recipe',
        'id': row[10],
        'name': row[0],
        'icon': 'rezept',
        'symbol': row[16] if len(row) > 16 else None,
        'profession': {'url': beruf_url(lang, profession), 'text': profession_name},
        'profession_key': profession,
        'tier': row[4],
        'category': row[5],
        'level': row[2] or None,
        'ingredients': ingredients,
        'optional': optional,
        'critical': row[8] or '',
        'critical_id': row[19] if len(row) > 19 and row[19] else None,
        'critical_symbol': row[17] if len(row) > 17 else None,
        'chance': row[12] if len(row) > 12 and row[12] else None,
        # The generator prints the stored float as-is ("7.0 s").
        'time': str(row[13]) if len(row) > 13 and row[13] else None,
        'craft_url': app_url(lang, 'handwerk'),
        'crumb_profession': {'text': profession_name, 'url': beruf_url(lang, profession)},
        'seo': seo.recipe(lang, name=row[0], profession=profession_name,
                          tier=row[4] or '', level=row[2] or '',
                          ingredients=len(ingredients)),
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
        parent_link = builder.map_link(parent.get('idx'), parent.get('name') or '')

    sections = []
    # Full member lists for the interactive tabs; the page carries them once so
    # the browser filters the whole area, not only the rendered excerpt.
    komplett = {}
    for member_kind in ('q', 'd', 'i'):
        rows = members[member_kind].get(entry.get('idx')) or members[member_kind].get(ident) or []
        rows = sorted(rows, key=lambda row: builder.name_of(member_kind, row[1]).casefold())
        komplett[member_kind] = [[str(row[0]), builder.name_of(member_kind, row[1]),
                                  row[1].get('ic') if member_kind == 'i' else None]
                                 for row in rows]
        if not rows:
            continue
        sections.append({
            'kind': member_kind,
            'title': w[member_kind + 'list'],
            'count': len(rows),
            'entries': [{'url': route(lang, member_kind, row[0]),
                         'text': builder.name_of(member_kind, row[1]),
                         # Item rows carry the client symbol, like every list.
                         'icon': row[1].get('ic') if member_kind == 'i' else None}
                        for row in rows[:PAGE_SIZE]],
            'excerpt': len(rows) > PAGE_SIZE,
        })

    counts = {row['kind']: row['count'] for row in sections}
    if kind == 'region':
        # Eine Region trägt keine eigenen Listen; die Gebiete darunter tun es.
        for member_kind in ('q', 'd', 'i'):
            if member_kind in counts:
                continue
            counts[member_kind] = sum(
                len(members[member_kind].get(child.get('idx'))
                    or members[member_kind].get(str(child.get('idx'))) or [])
                for _child_id, child in body_children)
    seo_block = (seo.region(lang, name=entry.get('name') or '',
                            areas=len(body_children), quests=counts.get('q', 0),
                            deeds=counts.get('d', 0))
                 if kind == 'region' else
                 seo.area(lang, name=entry.get('name') or '',
                          parent=(parent_link or {}).get('text') or '',
                          quests=counts.get('q', 0), deeds=counts.get('d', 0),
                          items=counts.get('i', 0)))

    return {
        'kind': kind,
        'id': ident,
        'name': entry.get('name') or '',
        'icon': 'region' if kind == 'region' else 'gebiet',
        # The map of this area at the top of the page, and the button below it
        # opens the map app with this area preselected.
        'image': entry.get('bild') or None,
        'map_url': app_url(lang, 'karte', vorkarte=ident),
        'parent': parent_link,
        'children': [{'url': route(lang, 'area', key), 'text': value.get('name') or ''}
                     for key, value in sorted(body_children, key=lambda row: (row[1].get('name') or '').casefold())],
        'children_title': w['arealist'],
        'sections': sections,
        'members': komplett,
        'seo': seo_block,
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
    levels = [row[2] for _ident, row in recipes if row[2]]
    seo_block = seo.profession(lang, name=entry.get('name') or key, recipes=len(recipes),
                               low=min(levels) if levels else '',
                               high=max(levels) if levels else '')
    return {
        'kind': 'p',
        'id': key,
        'name': entry.get('name') or key,
        'icon': 'beruf',
        'craft_url': beruf_url(lang, key),
        'groups': groups,
        'seo': seo_block,
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
        # The place table keys its pairs by the position in 'k', zero-based.
        # Numbering from one shifted every item's places to the next family.
        index = {str(row[0]): number for number, row in enumerate(self.vorkommen.get('k') or [])}
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
    binding_mode = item.get('bm')
    if binding_mode == 'BOUND_TO_ACCOUNT_ON_ACQUIRE':
        chips.append({'cls': '', 'text': w['bound_account']})
    elif binding_mode == 'BIND_ON_ACQUIRE' or (binding_mode is None and binding == 1):
        chips.append({'cls': '', 'text': w['bound_acquire']})
    elif binding_mode == 'BIND_ON_EQUIP' or (binding_mode is None and binding == 2):
        chips.append({'cls': '', 'text': w['bound_equip']})
    elif binding_mode and binding_mode not in ('NONE',):
        chips.append({'cls': '', 'text': w['binding_unknown']})
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
        if not places:
            # "Vorkommen" answers where a resource can be gathered. Without a
            # recorded spot the row answers nothing, so the section stays away
            # instead of listing a resource with an empty place line.
            continue
        resources.append({
            'key': list(key),
            'name': res_name,
            'meta': ' · '.join(part for part in parts if part),
            'places': [{'url': app_url(lang, 'karte', vorkommen=art_id, vorkarte=place[1]),
                        'name': place[0], 'count': place[2]} for place in places[:6]],
        })

    sources = []
    for row in item.get('quellen') or []:
        kind, qid, qname = row[0], row[1], row[2]
        zone = row[3] if len(row) > 3 else ''
        region = row[4] if len(row) > 4 else ''
        if (kind == 'q' and qid in builder.quests) or (kind == 'd' and qid in builder.deeds) \
                or (kind == 'i' and qid in builder.items):
            reference = route(lang, kind, qid)
        elif kind == 'd':
            reference = app_url(lang, 'taten', id=qid)
        else:
            reference = app_url(lang, 'karte', id=qid)
        sources.append({'url': reference, 'text': qname,
                        'extra': ' › '.join(part for part in (region, zone) if part),
                        'kind': kind})

    result_links = item.get('herstellung') or []
    if not result_links:
        result_links = [{'recipe': rid, 'role': 'regular_result'}
                        for rid in item.get('rezepte') or []]
    result_links = [entry for entry in result_links if entry.get('recipe') in builder.recipes]
    rezept_ids = [entry['recipe'] for entry in result_links]
    rezept_zeilen = [builder.recipes[rid] for rid in rezept_ids]
    crafted_by = []
    for relation, row in zip(result_links, rezept_zeilen):
        rid = relation['recipe']
        # Identity and classification only. Ingredients and the exact variant
        # belong to the recipe page, never to the list row.
        teile = [row[3], row[5]]
        if row[2]:
            teile.append('%s %s' % (w['level'], row[2]))
        label = ' · '.join(str(teil) for teil in teile if teil)
        role_label = w['critical_result'] if relation.get('role') == 'critical_result' else w['regular_result']
        normal_id = row[18] if len(row) > 18 and row[18] else None
        critical_id = row[19] if len(row) > 19 and row[19] else None

        def result_info(result_id):
            result_item = builder.items.get(result_id) if result_id else None
            if not result_item:
                return None
            result_name = builder_name(builder, result_item)
            result_quality = ctx.quality(result_item, ctx.details.get(result_id) or {})
            return {
                'id': result_id,
                'name': result_name,
                'url': route(lang, 'i', result_id),
                'quality': ctx.label('quality', result_quality) if result_quality else None,
                'level': result_item.get('l') or None,
            }

        normal_info = result_info(normal_id)
        critical_info = result_info(critical_id)
        crafted_by.append({'url': route(lang, 'recipe', rid),
                           'text': label, 'role': role_label,
                           'quantity': relation.get('quantity'),
                           'recipe_level': row[2] or None,
                           'profession': row[3] or None,
                           'tier': row[4] or None,
                           'category': row[5] or None,
                           'result': critical_info if relation.get('role') == 'critical_result'
                           else normal_info,
                           'other_result': normal_info if relation.get('role') == 'critical_result'
                           else critical_info})
    use_links = item.get('verwendung') or []
    if not use_links:
        use_links = [{'recipe': rid, 'role': 'ingredient'}
                     for rid in item.get('zutat') or []]
    use_links = [entry for entry in use_links if entry.get('recipe') in builder.recipes]
    used_in = []
    for relation in use_links:
        rid = relation['recipe']
        used_in.append({
            'url': route(lang, 'recipe', rid),
            'text': builder.recipes[rid][0],
            'role': (w['optional_ingredient']
                     if relation.get('role') == 'optional_ingredient'
                     else w['normal_ingredient']),
            'quantity': relation.get('quantity'),
        })

    variants = []
    for other_id, other_item in ctx.variants(item, ident):
        other_details = ctx.details.get(other_id) or {}
        variants.append({
            'url': route(lang, 'i', other_id),
            'text': builder_name(builder, other_item),
            'level': other_item.get('l') or other_details.get('level') or None,
            'quality': ctx.label('quality', ctx.quality(other_item, other_details))
                       if ctx.quality(other_item, other_details) else None,
            'active': False,
        })
    if variants:
        variants.sort(key=lambda entry: (entry['level'] or 0, entry['text'].casefold()))

    where_groups = []
    for kind, label in (('q', w['source_quests']), ('d', w['source_deeds'])):
        entries = [entry for entry in sources if entry.get('kind') == kind]
        if entries:
            where_groups.append({'label': label, 'entries': entries, 'filter': 'tasks',
                                 'source_kind': kind})
    if resources:
        where_groups.append({
            'label': w['source_resources'], 'filter': None,
            'entries': [{'text': entry['name'], 'extra': entry.get('meta'),
                         'places': entry['places']} for entry in resources],
        })
    if crafted_by:
        where_groups.append({'label': w['source_crafting'], 'entries': crafted_by,
                             'filter': 'recipes'})
    vendor_entries = []
    for vendor in item.get('haendler') or []:
        names = vendor.get('name') or {}
        vendor_entries.append({'text': names.get(lang) or names.get('en')
                               or names.get('de') or vendor.get('id'),
                               'url': vendor_url(lang, vendor.get('id'))})
    if vendor_entries:
        where_groups.append({'label': w['source_vendors'], 'filter': None,
                             'vendor_filter': True, 'entries': vendor_entries})
    barter_entries = []
    for source in item.get('tausch') or []:
        extra = ' · '.join(part for part in (source.get('title'), source.get('area')) if part)
        barter_entries.append({
            'id': source.get('id'),
            'name': source.get('name') or source.get('id'),
            'title': source.get('title'),
            'area': source.get('area'),
            'text': source.get('name') or source.get('id'),
            'extra': extra,
        })
    if barter_entries:
        where_groups.append({'label': w['source_barters'], 'filter': None,
                             'vendor_filter': True, 'barter_filter': True,
                             'entries': barter_entries})

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
        # Stable item IDs let set members link directly to their item pages.
        members = []
        for iid in set_data.get('items') or []:
            if iid in builder.items:
                members.append({'url': route(lang, 'i', iid), 'text': builder_name(builder, builder.items[iid])})
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
        browse = {'url': app_url(lang, 'gegenstandssuche', kat=category, platz=slot),
                  'text': w['browse_link'], 'note': w['browse_text']}

    quality_text = ctx.label('quality', quality) if quality else ''
    seo_block = seo.item(
        lang, name=name, quality=quality_text, category=eyebrow,
        level=min_level or item.get('l') or '',
        source=('%s, %s' % (sources[0]['text'], sources[0]['extra'])
                if sources and sources[0].get('extra') else
                (sources[0]['text'] if sources else '')))

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
        'vendor': bool(vendor_entries),
        'barter_sources': [
            {'id': entry.get('id'), 'name': entry.get('name'),
             'title': entry.get('title'), 'area': entry.get('area')}
            for entry in barter_entries
        ],
        'crafted_by': crafted_by,
        'used_in': used_in,
        # Two directions, two relation types: recipes that produce this item
        # and recipes that consume it. Merging them told the wrong story.
        'related_crafted_by': [entry['url'].strip('/').split('/')[-1] for entry in crafted_by],
        'related_used_in': [entry['url'].strip('/').split('/')[-1] for entry in used_in],
        'where_from_count': len(resources) + len(sources) + len(crafted_by) +
                            len(vendor_entries) + len(barter_entries),
        'used_for_count': len(used_in),
        'has_where_from': bool(resources or sources or crafted_by or vendor_entries or barter_entries),
        'has_used_for': bool(used_in),
        'where_groups': where_groups,
        'task_filter': {},
        'variants': variants,
        'has_overview': bool(description or armour or basic or bonuses or scale or
                             variants or set_block or (details or {}).get('requiredClass')),
        'set': set_block,
        'required_class': (details or {}).get('requiredClass'),
        'browse': browse,
        'seo': seo_block,
    }


# --- lists and overview pages ------------------------------------------

PAGE_SIZE = 200


def page_route(lang: str, kind: str, number: int = 1) -> str:
    base = route(lang, kind)
    return base if number == 1 else base + 'seite/%d/' % number


def _katalog():
    """Constants of the static generator, imported once."""
    global _KATALOG
    if _KATALOG is None:
        import build_katalogseiten
        _KATALOG = build_katalogseiten
    return _KATALOG


_KATALOG = None


def _entries(builder: ViewBuilder, kind: str, rows: list) -> list:
    out = []
    for ident, value in rows:
        ziel = beruf_url(builder.lang, ident) if kind == 'p' else route(builder.lang, kind, ident)
        out.append({'url': ziel,
                    'text': builder.name_of(kind, value),
                    'icon': value.get('ic') if kind == 'i' else None})
    return out


def _sorted(builder: ViewBuilder, kind: str, rows) -> list:
    return sorted(rows, key=lambda row: builder.name_of(kind, row[1]).casefold())


def _nav(w, lang: str, kind: str, number: int, seiten: int, base: dict | None = None) -> dict:
    """Pagination line, exactly as the generator writes it."""
    ziel = (lambda n: base[lang] if n == 1 else base[lang] + 'seite/%d/' % n) if base \
        else (lambda n: page_route(lang, kind, n))
    return {
        'prev': ziel(number - 1) if number > 1 else None,
        'next': ziel(number + 1) if number < seiten else None,
        'label': '%s %d / %d' % (w['page'], number, seiten),
    }


def list_pages(builder: ViewBuilder, model: dict, data: dict) -> dict:
    """Every overview page of one language, keyed by its path without language.

    Keys are relative to the language folder, e.g. "aufgabe/",
    "aufgabe/seite/2/", "gegenstand/ruestung/selten/". The router only looks
    the request path up; it does not rebuild the catalogue structure.
    """
    w, lang = builder.w, builder.lang
    katalog = _katalog()
    pilot = bool(model.get('pilot'))
    intro = w['pilot'] if pilot else w['overview']
    # A type index says what it lists; the catalogue-wide blurb stays the fallback.
    intros = {kind: w.get('list_intro_' + kind, intro) for kind in ('q', 'd', 'area', 'region', 'recipe', 'virtue')}
    pages = {}

    # Plain type indexes, 200 entries per page. Items have no list any more:
    # the search page with its filters is the only way in.
    # 'p' (professions) has no list: every profession address is a 301 to
    # the crafting page, so no page, no navigation and no sitemap entry.
    # 'l' (landmarks) has its own filter browser as an application page, the
    # same split as the quest givers.
    # 'title' has its own filter browser under the same segment; its pages
    # would shadow it, so only the detail pages stay catalogue pages.
    for kind in ('q', 'd', 'area', 'region', 'recipe', 'virtue'):
        source = {'q': builder.quests, 'd': builder.deeds, 'i': builder.items,
                  'area': data['area'], 'region': data['region'], 'p': data['p'],

                  'recipe': {ident: row for ident, row in data['recipe'].items()},
                  'title': data['title'], 'virtue': data['virtue']}[kind]
        rows = _sorted(builder, kind, list(source.items()))
        seiten = max(1, (len(rows) + PAGE_SIZE - 1) // PAGE_SIZE)
        for number in range(1, seiten + 1):
            teil = rows[(number - 1) * PAGE_SIZE:number * PAGE_SIZE]
            titel = w[kind + 'list'] + (' – %s %d' % (w['page'], number) if number > 1 else '')
            payload = {
                'kind': kind,
                'page': number,
                'title': titel,
                'canonical': page_route(lang, kind, number),
                'intro': intros[kind],
                'seo': seo.listpage(lang, label=w[kind + 'list'], page=number,
                                    pages=seiten, entries=len(teil), kind=kind),
                'alternates': {o: page_route(o, kind, number) for o in ('de', 'en', 'fr')},
                'language_urls': {o: page_route(o, kind, number) for o in ('de', 'en', 'fr')},
                'entries': _entries(builder, kind, teil),
                'nav': _nav(w, lang, kind, number, seiten),
                'symbol': None,
            }
            if kind == 'i' and number == 1:
                payload['search_hint'] = {'url': app_url(lang, 'gegenstandssuche'),
                                          'text': w['item_search']}
            key = w[kind] + '/' + ('' if number == 1 else 'seite/%d/' % number)
            pages[key] = payload

    # Item list pages are gone on purpose: the search page with its filters
    # is the only way into the item catalogue.

    # Craft overview and the catalogue hub.
    pages[w['craft'] + '/'] = {
        'kind': 'craft', 'page': 1, 'title': w['craftlist'],
        'seo': seo.listpage(lang, label=w['craftlist'], page=1, pages=1,
                            entries=0, kind='craft'),
        'canonical': route(lang, 'craft'),
        'alternates': {o: route(o, 'craft') for o in ('de', 'en', 'fr')},
        'language_urls': {o: route(o, 'craft') for o in ('de', 'en', 'fr')},
        'entries': [], 'nav': None, 'symbol': None, 'intro': intro,
        'sections': [{'title': w['plist'],
                      'entries': _entries(builder, 'p', _sorted(builder, 'p', list(data['p'].items())))}],
        'links': [], 'foot_link': {'url': route(lang, 'recipe'), 'text': w['recipelist']},
    }
    hub = []
    for kind in ('q', 'd', 'i', 'area', 'region', 'p', 'recipe', 'craft', 'f', 'l'):
        label = w['craftlist'] if kind == 'craft' else w[kind + 'list']
        url = (app_url(lang, 'gegenstandssuche') if kind == 'i'
               else beruf_url(lang) if kind == 'p' else route(lang, kind))
        hub.append({'url': url, 'text': label})
    pages[w['catalog'] + '/'] = {
        'kind': 'catalog', 'page': 1, 'title': w['cataloglabel'],
        'seo': seo.listpage(lang, label=w['cataloglabel'], page=1, pages=1,
                            entries=len(hub), kind='catalog'),
        'canonical': route(lang, 'catalog'),
        'alternates': {o: route(o, 'catalog') for o in ('de', 'en', 'fr')},
        'language_urls': {o: route(o, 'catalog') for o in ('de', 'en', 'fr')},
        'entries': [], 'nav': None, 'symbol': None, 'intro': intro,
        'sections': [], 'links': hub,
    }
    return pages
