#!/usr/bin/env python3
"""Prepare the catalogue data that the PHP site reads at request time.

The static catalogue wrote one HTML file per entity. That meant a shared
heading or wording change rebuilt ~250.000 files. This tool writes small,
sharded data files instead; PHP renders the pages from them.

Layout of the output (default `phpdata/`):

    manifest.json                        schema version, shard map, counts
    <sprache>/maps.json                  map table for coordinates and names
    <sprache>/<art>/<shard>.json         {"entities": {id: record}}

`shard` is derived from the identifier, so a request reads exactly one small
file and never the whole catalogue. Records carry their already resolved
relations (previous quest, requirements, reverse links) so a page never needs
a global index.

    python3 tools/build_php_data.py                 # all languages
    python3 tools/build_php_data.py --sprache de    # one language
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
WEB = HIER / 'web'
sys.path.insert(0, str(HIER))
sys.path.insert(0, str(HIER / 'tools'))
from itemnamen import sauberer_name  # noqa: E402
from gebietssicht import display_name, group_for, map_tree  # noqa: E402
from instanzbeute_items import beute_ergaenzen, lade_beute, truhen_ids  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')
SCHEMA = 1

# Every kind the catalogue exposes; the shard names are part of the public
# router contract, so they are fixed here and checked in the tests.
ARTEN = ('q', 'd', 'i', 'recipe', 'title', 'virtue', 'area', 'region', 'p', 'f', 'l')
# Catalogues that get sitemap entries. 'p' (professions) stays out on purpose:
# every profession address answers 301 to the crafting page, and a sitemap must
# only list pages that answer 200. The router keeps the redirects for old links.
SITEMAP_KINDS = ('q', 'd', 'i', 'area', 'region', 'recipe', 'title', 'virtue', 'set', 'giver',
                   'vendor', 'f', 'l')

# Quest-giver source, read once in main() and used by every language.
GIVER_SOURCE: dict | None = None
QUEST_GIVERS: dict = {}
VENDOR_SOURCE: dict | None = None


def read_assignment(path: Path, variable: str):
    """Read `window.<variable> = …` from a generated web data file."""
    text = path.read_text(encoding='utf-8')
    match = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not match:
        raise SystemExit('%s: missing %s' % (path, variable))
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def shard_for(identifier: str) -> str:
    """Stable hash bucket, two hex characters.

    Game ids share a long prefix (all begin with 70), so slicing the id would
    put the whole catalogue into one file. A hash scatters it evenly instead;
    the bucket never changes for a given id.
    """
    return hashlib.md5(str(identifier).encode('utf-8')).hexdigest()[:2]


def klarer_name(text) -> str:
    text = str(text or '').replace('\\q', '"')
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


def load_language(lang: str, chest_items=None) -> dict:
    quests = read_assignment(WEB / ('daten-%s.js' % lang), 'MQL_QUESTS')
    deeds = read_assignment(WEB / ('daten-taten-%s.js' % lang), 'MQL_QUESTS')
    try:
        replaced = read_assignment(WEB / ('daten-taten-%s.js' % lang), 'MQL_REPLACED')
    except SystemExit:
        replaced = {}
    maps = read_assignment(WEB / ('daten-%s.js' % lang), 'MQL_KARTEN')
    recipes = read_assignment(WEB / ('rezepte-%s.js' % lang), 'MQL_REZEPTE')['r']
    referenz = read_assignment(WEB / 'referenz.js', 'MQL_REFERENZ')
    items = json.loads((DATEN / 'items.json').read_text(encoding='utf-8'))['items']
    if chest_items is not None:
        items = items | {ident: row for ident, row in chest_items.items() if ident not in items}
    titles = json.loads((DATEN / 'titel.json').read_text(encoding='utf-8'))['eintraege']
    virtues = json.loads((DATEN / 'tugenden.json').read_text(encoding='utf-8'))['eintraege']
    return dict(quests=quests, deeds=deeds, replaced=replaced, maps=maps, recipes=recipes,
                professions=referenz.get('berufe') or {}, items=items,
                titles=titles, virtues=virtues)


def map_kind(entry: dict) -> str:
    return 'region' if entry.get('tier') == 1 else 'area'


def build_relations(quests: list[dict]) -> dict:
    """Resolve every cross reference a quest page prints, once at build time.

    PHP must not walk the whole catalogue for one page, so the relations carry
    the linked names as well as the ids.
    """
    by_id = {q['i']: q for q in quests}
    required_by = defaultdict(list)
    for quest in quests:
        for ident in quest.get('v') or []:
            required_by[ident].append(quest)
    by_giver = defaultdict(list)
    for quest in quests:
        if quest.get('g'):
            by_giver[quest['g']].append(quest)
    by_place = defaultdict(list)
    for quest in quests:
        spot = quest.get('gt')
        if spot:
            by_place[(spot[0], round(spot[1], 3), round(spot[2], 3))].append(quest)

    relations = {}
    for quest in quests:
        ident = quest['i']
        spot = quest.get('gt')
        relations[ident] = {
            'previous': [{'id': other, 'name': by_id[other]['n']}
                         for other in quest.get('pq') or [] if other in by_id],
            'next': [{'id': other, 'name': by_id[other]['n']}
                     for other in ([quest['nq']] if quest.get('nq') else []) if other in by_id],
            'requires': [{'id': other, 'name': by_id[other]['n']}
                         for other in quest.get('v') or [] if other in by_id],
            'requires_one': [{'id': other, 'name': by_id[other]['n']}
                             for other in quest.get('vo') or [] if other in by_id],
            'excludes': [{'id': other, 'name': by_id[other]['n']}
                         for other in quest.get('e') or [] if other in by_id],
            'required_by': [{'id': other['i'], 'name': other['n']}
                            for other in required_by.get(ident, [])],
            'same_giver': sum(1 for other in by_giver.get(quest.get('g') or '', [])
                              if other['i'] != ident),
            'same_place': sum(1 for other in by_place.get(
                (spot[0], round(spot[1], 3), round(spot[2], 3)), []) if other['i'] != ident) if spot else 0,
        }
    return relations


def write_shards(target: Path, lang: str, kind: str, records: dict) -> int:
    shards = defaultdict(dict)
    for ident, record in records.items():
        shards[shard_for(ident)][ident] = record
    folder = target / lang / kind
    folder.mkdir(parents=True, exist_ok=True)
    for shard, entries in shards.items():
        payload = json.dumps({'entities': entries}, ensure_ascii=False,
                             separators=(',', ':'), sort_keys=True)
        (folder / ('%s.json' % shard)).write_text(payload, encoding='utf-8')
    return len(shards)


def write_sitemaps(target: Path, sections: dict) -> None:
    """The URL set of every sitemap file, ready for PHP to render as XML."""
    # Application pages now live at one address per language; the search pages
    # are query driven and stay out of the sitemap, as before.
    from php_viewmodel import APP_SEGMENTS
    seiten = []
    for lang, seiten_map in APP_SEGMENTS.items():
        for page, segment in seiten_map.items():
            if page in ('suche', 'gegenstandssuche'):
                continue
            seiten.append('/' + lang + '/' + (segment + '/' if segment else ''))
    seiten = sorted(set(seiten))
    sections = dict(sections)
    # One canonical URL appears in exactly one section. List pages are
    # application pages, so they stay in sitemap-seiten.xml even when a list
    # model also names them under its entity section.
    einmalig = set(seiten)
    for name, urls in list(sections.items()):
        sections[name] = [url for url in urls if url not in einmalig]
    sections['/sitemap-seiten.xml'] = seiten
    payload = {'schema': 1, 'sections': {name: urls for name, urls in sorted(sections.items())},
               'index': sorted(sections)}
    (target / 'sitemaps.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def write_list_shards(target: Path, pages: dict) -> int:
    """Overview pages, keyed by full path ("de/aufgabe/seite/2/")."""
    shards = defaultdict(dict)
    for key, record in pages.items():
        shards[shard_for(key)][key] = record
    folder = target / 'page-list'
    folder.mkdir(parents=True, exist_ok=True)
    for shard, entries in shards.items():
        payload = json.dumps({'pages': entries}, ensure_ascii=False,
                             separators=(',', ':'), sort_keys=True)
        (folder / ('%s.json' % shard)).write_text(payload, encoding='utf-8')
    return len(shards)


def write_landmark_index(target: Path, lang: str, landmarks: dict, maps: dict) -> None:
    """The compact index the filter browser reads: one row per landmark.

    Region and area names come from the map table, so a filtered page needs no
    second lookup. The landmarks without a position keep an empty area and are
    collected under "no area" in the browser.
    """
    labels = {'area': {}, 'region': {}, 'area_region': {}, 'area_group': {}}
    tree = map_tree()
    for idx, entry in maps.items():
        name = entry.get('name')
        if not name:
            continue
        if entry.get('tier') == 1:
            labels['region'][str(idx)] = name
        else:
            labels['area'][str(idx)] = display_name(int(idx), name, lang)
            group = group_for(int(idx), tree)
            if group:
                labels['area_group'][str(idx)] = {
                    'id': group['id'], 'label': group['label'][lang]
                }
    for ident, entry in landmarks.items():
        area = entry.get('area')
        # A region map is its own area: the region filter already covers it,
        # so it is no area in the tree and gets no area label.
        if area is not None and str(area) != str(entry.get('region')):
            labels['area_region'][str(area)] = str(entry.get('region'))
    rows = []
    for ident, entry in landmarks.items():
        area = entry.get('area')
        region = entry.get('region')
        teile = [entry['name']]
        if area is not None:
            teile.append(labels['area'].get(str(area), ''))
            group = labels['area_group'].get(str(area))
            if group:
                teile.append(group['label'])
        if region is not None:
            teile.append(labels['region'].get(str(region), ''))
        rows.append({'id': ident, 'name': entry['name'],
                     'area': int(area) if area is not None else None,
                     'region': int(region) if region is not None else None,
                     'quests': entry.get('quests') or 0,
                     # lower(), not casefold(): casefold turns ß into ss and the
                     # PHP side lowercases the query without that change.
                     'search': ' '.join(teil for teil in teile if teil).lower()})
    rows.sort(key=lambda row: row['name'].casefold())
    payload = {'schema': 1, 'lang': lang, 'labels': labels, 'landmarks': rows}
    (target / lang / 'landmarks-index.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def write_faction_index(target: Path, lang: str, factions: dict,
                        quests: dict, deeds: dict, maps: dict) -> None:
    """The filter index for the faction browser.

    A faction has no place of its own, but its reputation sources do: each
    quest or deed carries the map path (fk) of where it plays. The set of those
    regions and areas becomes the faction's place list.
    """
    labels = {'area': {}, 'region': {}, 'area_region': {}}
    for idx, entry in maps.items():
        name = entry.get('name')
        if not name:
            continue
        if entry.get('tier') == 1:
            labels['region'][str(idx)] = name
        else:
            labels['area'][str(idx)] = name

    rows = []
    for ident, eintrag in factions.items():
        paare: set[tuple[int, int]] = set()
        aufgaben = taten = 0
        for quelle in eintrag.get('sources') or []:
            art, qid = quelle.get('kind'), quelle.get('id')
            record = quests.get(qid) if art == 'q' else deeds.get(qid)
            if not record:
                continue
            if art == 'q':
                aufgaben += 1
            else:
                taten += 1
            fk = record.get('fk') or []
            if fk:
                region = int(fk[0])
                gebiet = int(fk[1]) if len(fk) > 1 else region
                paare.add((region, gebiet))
        regionen = {region for region, _ in paare}
        gebiete = {gebiet for _, gebiet in paare}
        for region, gebiet in paare:
            if gebiet != region:
                labels['area_region'][str(gebiet)] = str(region)
        teile = [eintrag['name']]
        for wert in sorted(gebiete):
            teile.append(labels['area'].get(str(wert))
                         or labels['region'].get(str(wert)) or '')
        rows.append({'id': ident, 'name': eintrag['name'],
                     'regions': sorted(regionen), 'areas': sorted(gebiete),
                     'quests': aufgaben, 'deeds': taten,
                     'search': ' '.join(teil for teil in teile if teil).lower()})
    rows.sort(key=lambda row: row['name'].lower())
    payload = {'schema': 1, 'lang': lang, 'labels': labels, 'factions': rows}
    (target / lang / 'factions-index.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def write_title_index(target: Path, lang: str, titles: dict,
                      quests: dict, deeds: dict, maps: dict) -> None:
    """The filter index for the title browser.

    A title has no place of its own; its sources do. Each source carries the map
    path (fk) where it plays, and deeds carry their kind. Both become filters:
    origin (deed or quest), kind and the region/area tree.
    """
    labels = {'area': {}, 'region': {}, 'area_region': {}}
    for idx, entry in maps.items():
        name = entry.get('name')
        if not name:
            continue
        if entry.get('tier') == 1:
            labels['region'][str(idx)] = name
        else:
            labels['area'][str(idx)] = name

    # The deed kind in the title export is not always localised; the deed
    # categories from the page models are, and they match the deed pages.
    from php_viewmodel import DEED_TYPES, OTHER_DEED
    kategorien = deed_categories()
    fremd = set(OTHER_DEED.values())

    def tat_art(ident: str) -> str:
        name = DEED_TYPES.get(kategorien.get(str(ident).upper()), OTHER_DEED)[lang]
        return '' if name in fremd else name

    rows = []
    for ident, eintrag in titles.items():
        quellen = ((eintrag.get('q') or {}).get(lang)
                   or (eintrag.get('q') or {}).get('en') or [])
        paare: set[tuple[int, int]] = set()
        aufgaben = taten = 0
        arten: set[str] = set()
        for quelle in quellen:
            art, qid = quelle[0], quelle[1]
            record = quests.get(qid) if art == 'q' else deeds.get(qid)
            if not record:
                continue
            if art == 'q':
                aufgaben += 1
            else:
                taten += 1
                # "Weitere Tat" is the fallback for an unrecorded kind, not a kind.
                kind = tat_art(qid)
                if kind:
                    arten.add(kind)
            fk = record.get('fk') or []
            if fk:
                region = int(fk[0])
                gebiet = int(fk[1]) if len(fk) > 1 else region
                paare.add((region, gebiet))
        regionen = {region for region, _ in paare}
        gebiete = {gebiet for _, gebiet in paare}
        for region, gebiet in paare:
            if gebiet != region:
                labels['area_region'][str(gebiet)] = str(region)
        teile = [eintrag['name']]
        for quelle in quellen:
            teile.append(quelle[2])
        for wert in sorted(gebiete):
            teile.append(labels['area'].get(str(wert))
                         or labels['region'].get(str(wert)) or '')
        teile.extend(sorted(arten))
        rows.append({'id': ident, 'name': eintrag['name'],
                     'regions': sorted(regionen), 'areas': sorted(gebiete),
                     'quests': aufgaben, 'deeds': taten, 'arten': sorted(arten),
                     'search': ' '.join(teil for teil in teile if teil).lower()})
    rows.sort(key=lambda row: row['name'].lower())
    # Deed kinds arrive already localised from the page models; they are their
    # own labels.
    labels['art'] = {art: art for row in rows for art in row['arten']}
    payload = {'schema': 1, 'lang': lang, 'labels': labels, 'titles': rows}
    (target / lang / 'titles-index.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def write_instance_index(target: Path, lang: str, instanzen: dict, maps: dict) -> None:
    """The compact index for the instance browser.

    One row per client finder selection with translated name/cluster and the
    client's explicit level ranges, group sizes and difficulty tiers.
    """
    labels = {'area': {}, 'region': {}, 'area_region': {}, 'cluster': {}}
    for idx, entry in maps.items():
        name = entry.get('name')
        if not name:
            continue
        if entry.get('tier') == 1:
            labels['region'][str(idx)] = name
        else:
            labels['area'][str(idx)] = name
    rows = []
    for ident, eintrag in instanzen.items():
        name = (eintrag.get('name') or {}).get(lang) or (eintrag.get('name') or {}).get('en') or ''
        if not name:
            continue
        area = eintrag.get('area')
        region = eintrag.get('region')
        if area is not None and region is not None and area != region:
            labels['area_region'][str(area)] = str(region)
        cluster_id = eintrag.get('cluster_id') or 0
        cluster = (eintrag.get('cluster') or {}).get(lang) or ''
        if cluster:
            labels['cluster'][str(cluster_id)] = cluster
        teile = [name, cluster, (eintrag.get('group') or {}).get(lang) or '']
        if area is not None:
            teile.append(labels['area'].get(str(area))
                         or labels['region'].get(str(area)) or '')
        rows.append({'id': ident, 'name': name,
                      'level': eintrag.get('level'),
                      'level_max': eintrag.get('level_max'),
                      'cluster_id': cluster_id, 'cluster': cluster,
                      'group': (eintrag.get('group') or {}).get(lang) or '',
                      'group_sizes': sorted(eintrag.get('group_sizes') or []),
                      'difficulties': sorted(eintrag.get('difficulties') or []),
                     'region': region, 'area': area,
                     'players': eintrag.get('players'),
                     'type': eintrag.get('type') or 'sonst',
                      # Never link a quest absent from the published catalogue.
                      'quest': None,
                     'search': ' '.join(teil for teil in teile if teil).lower()})
    rows.sort(key=lambda row: row['name'].lower())
    payload = {'schema': 2, 'lang': lang, 'labels': labels, 'instances': rows}
    (target / lang / 'instances-index.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def chest_chance(chance, lang):
    value = '%g' % (chance * 100)
    return value + '%' if lang == 'en' else value.replace('.', ',') + '\u00a0%'


def chest_source_rows(sources, lang, item_id):
    """Merge only one condition dimension at a time, keeping valid combinations."""
    by_instance = {}
    for source in sources:
        name, url, conditions = by_instance.setdefault(
            source['instance'], (source['name'], source['url'], defaultdict(set)))
        axes = tuple(tuple(range(span[0], span[-1] + 1)) if span else ()
                     for span in (source['level'], source['tier'], source['group']))
        conditions[axes].add(source['chance'])

    def span_label(values, prefix=''):
        bands = []
        for value in values:
            if bands and bands[-1][-1] + 1 == value:
                bands[-1].append(value)
            else:
                bands.append([value])
        return ' / '.join(f'{prefix}{band[0]}' +
                          (f'–{prefix}{band[-1]}' if len(band) > 1 else '') for band in bands)

    labels = {
        'de': ('Stufe %s', '%s Spieler', '%s Spieler', 'Chance je Truhe'),
        'en': ('Level %s', '%s player', '%s players', 'Chance per chest'),
        'fr': ('Niveau %s', '%s joueur', '%s joueurs', 'Chance par coffre'),
    }[lang]
    result = []
    from urllib.parse import urlencode
    for name, url, conditions in by_instance.values():
        rows = [(*axes, tuple(sorted(chances, reverse=True))) for axes, chances in conditions.items()]
        for axis in (0, 1, 2):
            merged = defaultdict(set)
            for row in rows:
                merged[row[:axis] + row[axis+1:]].update(row[axis])
            rows = [key[:axis] + (tuple(sorted(values)),) + key[axis:] for key, values in merged.items()]
        lines = []
        for level, tier, players, chances in sorted(rows):
            lines.append(' · '.join(filter(None, (
                labels[0] % span_label(level) if level else '',
                span_label(tier, 'T'),
                labels[1 if players == (1,) else 2] % span_label(players) if players else '',
                labels[3] + ': ' + ' / '.join(chest_chance(p, lang).replace('\u00a0', ' ') for p in chances),
            ))))
        href = url + '?' + urlencode({'truhenbeute.q': item_id}) + '#truhenbeute'
        result.append({'text': name, 'url': href, 'conditions': lines})
    return sorted(result, key=lambda row: (row['text'].casefold(), row['url']))


def write_instance_details(target: Path, lang: str, instanzen: dict, quests: dict,
                           maps: dict, items: dict, quest_pages: dict, loot_data: dict,
                           map_previews: dict, instance_data: dict) -> dict:
    """Localized instance pages from the finder, quest catalogue and loot audit."""
    from php_viewmodel import route
    loot_instances = loot_data.get('instanzen') or {}
    pools = loot_data.get('pools') or []
    labels = {
        'de': {'level': 'Stufe', 'players': 'Spieler', 'tiers': 'Schwierigkeit',
               'cluster': 'Instanzgruppe'},
        'en': {'level': 'Level', 'players': 'Players', 'tiers': 'Difficulty',
               'cluster': 'Instance group'},
        'fr': {'level': 'Niveau', 'players': 'Joueurs', 'tiers': 'Difficulté',
               'cluster': 'Groupe d’instances'},
    }[lang]
    quest_segment = {'de': 'aufgabe', 'en': 'quest', 'fr': 'quete'}[lang]
    area_segment = {'de': 'gebiet', 'en': 'area', 'fr': 'zone'}[lang]
    details = {}
    item_sources: dict[str, dict[str, dict]] = {}
    instance_segment = {'de': 'instanz', 'en': 'instance', 'fr': 'instance'}[lang]
    for ident, entry in instanzen.items():
        name = (entry.get('name') or {}).get(lang) or ''
        if not name:
            continue
        desc = (entry.get('description') or {}).get(lang) or ''
        heading = re.match(r'<u>(.*?)</u>', desc, flags=re.S)
        if heading and heading.group(1).strip().casefold() == name.strip().casefold():
            desc = desc[heading.end():]
        desc = re.sub(r'<[^>]*>', '', desc).replace('\\n', '\n').replace('\\q', '').strip()
        import seo
        description_seo = seo.fit(' '.join(desc.split()), seo.DESC_MAX) if desc else ''
        facts = []
        if entry.get('level') is not None:
            end = entry.get('level_max') or entry['level']
            facts.append({'label': labels['level'],
                          'value': str(entry['level']) + ('–' + str(end) if end != entry['level'] else '')})
        if entry.get('group_sizes'):
            facts.append({'label': labels['players'], 'value': ' / '.join(map(str, entry['group_sizes']))})
        if entry.get('difficulties'):
            facts.append({'label': labels['tiers'], 'value': ' / '.join('T' + str(x) for x in entry['difficulties'])})
        if entry.get('cluster', {}).get(lang):
            facts.append({'label': labels['cluster'], 'value': entry['cluster'][lang]})
        for field, label in (('area', {'de': 'Landschaft', 'en': 'Area', 'fr': 'Zone'}[lang]),
                             ('region', {'de': 'Region', 'en': 'Region', 'fr': 'Région'}[lang])):
            place_id = entry.get(field)
            place = maps.get(str(place_id), maps.get(place_id)) if place_id is not None else None
            if place and place.get('name'):
                facts.append({'label': label, 'value': place['name'],
                              'url': '/%s/%s/%s/' % (lang, area_segment, place_id)})
        task_rows = []
        for qid in entry.get('quests') or ([entry['quest']] if entry.get('quest') else []):
            quest = quests.get(str(qid))
            if quest:
                task_rows.append({'id': str(qid), 'name': quest.get('n') or quest.get('name') or str(qid),
                                  'url': '/%s/%s/%s/' % (lang, quest_segment, qid)})
        map_record = loot_instances.get(ident, {}).get('karte') or {}
        image_id = map_record.get('bild')
        preview = map_previews.get(str(image_id))
        map_url = '/karten/instanzen/%s' % preview[0].name if preview else ''
        quest_rewards = []
        for task in task_rows:
            for group in quest_pages.get(task['id'], {}).get('reward_groups') or []:
                for item in group['items']:
                    quest_rewards.append({
                        'id': str(len(quest_rewards)), 'name': item['text'], 'url': item['url'],
                        'image': item['icon'], 'icon': item['symbol'] or 'gegenstand',
                        'meta': ' · '.join(filter(None, (
                            '%s ×' % item['qty'] if item['qty'] > 1 else '', group['label']))),
                        'quest_id': task['id'], 'quest': task['name'], 'quest_url': task['url'],
                    })
        details[ident] = {
            'id': ident, 'name': name, 'description': desc,
            'description_seo': description_seo, 'facts': facts,
            'cluster': entry.get('cluster', {}).get(lang) or '',
            'tasks': task_rows,
            'map': map_url,
            'map_size': list(preview[1:]) if preview else [],
            'enemies': instance_data['gegner'][lang].get(ident, []),
            'enemy_groups': instance_data['gruppen'][lang].get(ident, []),
            'bosses': instance_data['bosse'][lang].get(ident, []),
            'enemy_count': len(instance_data['gegner'][lang].get(ident, [])),
            'species_count': sum(len(group['arten'])
                                 for group in instance_data['gruppen'][lang].get(ident, [])),
            'quest_rewards': quest_rewards,
        }
        loot_items = {}
        for condition in loot_instances.get(ident, {}).get('beute') or []:
            pool_id = condition.get('pool')
            pool = pools[pool_id] if isinstance(pool_id, int) and 0 <= pool_id < len(pools) else []
            band = tuple(condition.get('stufe') or [])
            tier = tuple(condition.get('tier') or [])
            group = tuple(condition.get('gruppe') or [])
            for item in pool:
                iid = str(item.get('i') or '').upper()
                p = float(item.get('p') or 0)
                if p <= 0:
                    continue
                item_name = sauberer_name((item.get('namen') or {}).get(lang) or '', lang)
                if iid and item_name:
                    drop = loot_items.setdefault(iid, {
                        'id': iid, 'name': item_name, 'url': route(lang, 'i', iid) if iid in items else '',
                        'image': (items.get(iid) or {}).get('ic'), 'conditions': {},
                    })
                    drop['conditions'].setdefault((band, tier, group), set()).add(p)
                if iid not in items:
                    continue
                key = (ident, band, tier, group, p)
                item_sources.setdefault(iid, {})[key] = {
                    'instance': ident, 'name': name,
                    'url': '/%s/%s/%s/' % (lang, instance_segment, ident),
                    'level': list(band), 'tier': list(tier), 'group': list(group),
                     'chance': p,
                }
        chest_loot = []
        for drop in sorted(loot_items.values(), key=lambda row: (row['name'].casefold(), row['id'])):
            conditions = drop.pop('conditions')
            chances = sorted(set().union(*conditions.values()), reverse=True)
            chest_loot.append(dict(drop, chance=' / '.join(chest_chance(p, lang) for p in chances),
                                  conditions=[
                                      {'level': band, 'tier': tier, 'players': group,
                                       'chances': sorted(values, reverse=True)}
                                      for (band, tier, group), values in sorted(conditions.items())
                                  ]))
        details[ident]['chest_loot'] = chest_loot
    (target / lang / 'instance-details.json').write_text(
        json.dumps({'instances': details}, ensure_ascii=False, separators=(',', ':')),
        encoding='utf-8')
    return item_sources


def write_pages(target: Path, lang: str, kind: str, pages: dict) -> int:
    """Render-ready view models, one shard per hash bucket.

    These are what PHP hands to Twig. Keeping them apart from the raw records
    means a request reads only what it prints.
    """
    import seo
    # Zwei Einträge mit gleichem Namen und gleichen Fakten bekommen einen
    # unterscheidenden Zusatz, bevor sie geschrieben werden (tools/seo.py).
    seo.dedupe(lang, kind, pages)
    return write_shards(target, lang, 'page-' + kind, pages)


def language_data(model: dict, lang: str, fraktionen: dict, landmarken: dict) -> dict:
    maps = {str(m['idx']): m for m in model['maps']}
    out: dict[str, dict] = {kind: {} for kind in ARTEN}

    quest_relations = build_relations(model['quests'])
    deed_relations = build_relations(model['deeds'])

    for quest in model['quests']:
        record = dict(quest)
        record['rel'] = quest_relations[quest['i']]
        # The quest page links to the giver's own page when one exists. The
        # name still comes from the game data; the id only makes it clickable.
        if QUEST_GIVERS.get(quest['i']):
            record['gi'] = QUEST_GIVERS[quest['i']]
        out['q'][quest['i']] = record
    for deed in model['deeds']:
        record = dict(deed)
        record['rel'] = deed_relations[deed['i']]
        out['d'][deed['i']] = record

    for ident, item in model['items'].items():
        if item.get('instanztruhe_neu'):
            name = sauberer_name((item.get('n') or {}).get(lang), lang)
        else:
            name = klarer_name((item.get('n') or {}).get(lang)
                               or (item.get('n') or {}).get('en') or '')
        if not name:
            continue
        record = dict(item)
        record['name'] = name
        out['i'][ident] = record

    for row in model['recipes']:
        out['recipe'][row[10]] = row

    for ident, title in model['titles'].items():
        name = klarer_name((title.get('n') or {}).get(lang)
                           or (title.get('n') or {}).get('en') or '')
        if not name:
            continue
        record = dict(title)
        record['name'] = name
        out['title'][ident] = record

    for ident, virtue in model['virtues'].items():
        name = klarer_name((virtue.get('n') or {}).get(lang)
                           or (virtue.get('n') or {}).get('en') or '')
        if not name:
            continue
        record = dict(virtue)
        record['name'] = name
        out['virtue'][ident] = record

    used_professions = {row[9] for row in model['recipes']}
    for ident, profession in model['professions'].items():
        if ident not in used_professions:
            continue
        record = dict(profession)
        record['name'] = ((profession.get('n') or {}).get(lang)
                          or (profession.get('n') or {}).get('en') or ident)
        out['p'][ident] = record

    for ident, entry in maps.items():
        record = dict(entry)
        record['name'] = entry.get('name') or ''
        out[map_kind(entry)][ident] = record

    # Factions and landmarks come from their own build steps; the names are
    # already localized there, this picks the language of the page.
    for ident, entry in fraktionen.items():
        name = (entry.get('name') or {}).get(lang) or (entry.get('name') or {}).get('en') or ''
        if not name:
            continue
        out['f'][ident] = {
            'id': ident, 'name': name,
            'desc': (entry.get('desc') or {}).get(lang) or '',
            'min': entry.get('min'), 'max': entry.get('max'), 'start': entry.get('start'),
            'tiers': entry.get('tiers') or {},
            'sources': (entry.get('sources') or {}).get(lang) or [],
        }
    for ident, entry in landmarken.items():
        name = (entry.get('name') or {}).get(lang) or (entry.get('name') or {}).get('en') or ''
        if not name:
            continue
        out['l'][ident] = {
            'id': ident, 'name': name, 'targets': entry.get('targets') or [],
            'map': entry.get('map'), 'lat': entry.get('lat'), 'lon': entry.get('lon'),
            'area': entry.get('area'), 'region': entry.get('region'),
            'quests': len(entry.get('targets') or []),
        }

    return out


ITEM_SETS: dict | None = None
ITEM_DETAILS: dict | None = None
ITEM_LABELS: dict | None = None
ITEM_TYPEN: dict | None = None
ITEM_BONI: dict | None = None


BONI_DATEI = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                  '/items-stats-2026-11-08/items-stats.json')
# Der vollständige Gegenstands-Export: Symbol, Art und ein sauberer Name.
VOLL_DATEI = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                  '/items-2026-11-08/items.json')
ITEM_FULL: dict = {}
DAMAGE_TYPES: dict = {}


def damage_types(lore):
    """Resolve the client enum to the labels actually present in each language."""
    enum = lore / 'enums/DamageType.xml'
    if not enum.is_file():
        return {}
    keys = {e.get('key'): e.get('name') for e in ET.parse(enum).getroot()
            if e.get('key')}
    result = {}
    for lang in SPRACHEN:
        path = lore / 'labels' / lang / 'enum-DamageType.xml'
        if path.is_file():
            labels = {e.get('key'): e.get('value') for e in ET.parse(path).getroot()}
            result[lang] = {key: labels[name] for key, name in keys.items() if labels.get(name)}
    return result


def load_item_context(builder, model, lang):
    """Details, set tables, labels and resource places for the item pages."""
    global ITEM_SETS, ITEM_DETAILS, ITEM_LABELS, ITEM_TYPEN, ITEM_BONI
    global ITEM_FULL, DAMAGE_TYPES
    from php_viewmodel import ItemContext
    if ITEM_DETAILS is None:
        ITEM_DETAILS = json.loads((DATEN / 'gegenstand-details.json').read_text(encoding='utf-8')).get('items') or {}
        # Die Ausrüstungsdatei trägt den Namen nur für einen Teil der
        # Gegenstände und mit Export-Markup; der volle Export ist die Quelle.
        ITEM_FULL = (json.loads(VOLL_DATEI.read_text(encoding='utf-8')).get('items') or {}
                     if VOLL_DATEI.is_file() else {})
        from build_items import ITEM_LORE
        DAMAGE_TYPES = damage_types(ITEM_LORE.parent)
        for ident, eintrag in ITEM_DETAILS.items():
            namen = eintrag.get('name')
            if not isinstance(namen, dict):
                namen = eintrag['name'] = {}
            quelle = (ITEM_FULL.get(str(ident).upper()) or {}).get('n') or {}
            for sprache in SPRACHEN:
                sauber = sauberer_name(quelle.get(sprache), sprache)
                if sauber:
                    namen[sprache] = sauber
                elif namen.get(sprache):
                    namen[sprache] = sauberer_name(namen[sprache], sprache)
        ITEM_SETS = json.loads((DATEN / 'gegenstand-sets.json').read_text(encoding='utf-8')).get('sets') or {}
        ITEM_LABELS = json.loads((DATEN / 'gegenstand-stat-labels.json').read_text(encoding='utf-8'))
        ITEM_TYPEN = json.loads((DATEN / 'gegenstand-typen.json').read_text(encoding='utf-8'))
        ITEM_BONI = json.loads(BONI_DATEI.read_text(encoding='utf-8')) if BONI_DATEI.is_file() else {}
    vorkommen_datei = WEB / ('vorkommen-%s.js' % lang)
    vorkommen = (read_assignment(vorkommen_datei, 'MQL_VORKOMMEN')
                 if vorkommen_datei.is_file() else {'k': [], 'g': [], 'm': []})
    referenz = read_assignment(WEB / 'referenz.js', 'MQL_REFERENZ')
    boni = ITEM_BONI.get('items') or {}
    boni_labels = (ITEM_BONI.get('labels') or {}).get(lang) or {}
    return ItemContext(builder, ITEM_DETAILS, ITEM_SETS, ITEM_LABELS, ITEM_TYPEN,
                       vorkommen, boni, boni_labels, referenz, ITEM_FULL, DAMAGE_TYPES.get(lang, {}))


DEED_CATEGORIES: dict | None = None


def zutaten_ohne_herkunft(recipes: dict, item_pages: dict) -> list:
    """Ingredient ids whose item page answers neither "Vorkommen" nor "Woher".

    The recipe pages and the crafting page hang a "Show sources" toggle
    on every ingredient. Where the item knows no source and no gathering spot,
    the toggle would open empty; these ids leave it away instead.
    """
    ids = set()
    for row in recipes.values():
        for part in row[6] or []:
            if len(part) > 3 and part[3]:
                ids.add(str(part[3]))
        for part in row[7] or []:
            if len(part) > 4 and part[4]:
                ids.add(str(part[4]))
    leer = []
    for ident in ids:
        page = item_pages.get(ident)
        if page is None:
            continue
        if page.get('resources') or page.get('sources') or page.get('crafted_by') \
                or page.get('vendor'):
            continue
        leer.append(ident)
    return sorted(leer)

def deed_categories() -> dict:
    """Deed id -> Accomplishment_Category, read once for all languages."""
    global DEED_CATEGORIES
    if DEED_CATEGORIES is None:
        DEED_CATEGORIES = {}
        export = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                      '/full-dat-en-de-fr-2026-11-03/deeds.json')
        if export.is_file():
            for row in json.loads(export.read_text(encoding='utf-8')):
                DEED_CATEGORIES[str(row.get('id')).upper()] = (
                    row.get('properties') or {}).get('Accomplishment_Category')
    return DEED_CATEGORIES


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path, default=HIER / 'phpdata')
    parser.add_argument('--sprache', choices=(*SPRACHEN, 'alle'), default='alle')
    parser.add_argument('--still', action='store_true', help='keine Fortschrittszeilen')
    options = parser.parse_args()
    languages = SPRACHEN if options.sprache == 'alle' else (options.sprache,)
    target = options.ziel
    target.mkdir(parents=True, exist_ok=True)
    if not (DATEN / 'sets.json').is_file():
        raise SystemExit('MISSING: daten/sets.json (run python3 build_sets.py first)')
    set_source = json.loads((DATEN / 'sets.json').read_text(encoding='utf-8'))
    fraktion_source = json.loads((DATEN / 'fraktionen.json').read_text(encoding='utf-8'))['fraktionen']
    landmark_source = json.loads((DATEN / 'landmarken.json').read_text(encoding='utf-8'))['landmarken']
    instanz_source = json.loads((DATEN / 'instanzen.json').read_text(encoding='utf-8'))['instanzen']
    from instanzgegner import instanzdaten
    from instanzkarten import instanzkarten
    from build_gegenstandssuche import roh_export
    instance_loot = lade_beute()
    chest_ids = truhen_ids(instance_loot)
    chest_items = beute_ergaenzen({}, roh_export(), chest_ids) if chest_ids else {}
    instance_maps = instanzkarten(instance_loot.get('instanzen') or {})
    instance_data = instanzdaten(instanz_source, DATEN / 'instanzen-roh.jsonl')
    from set_viewmodel import set_pages, link_items

    global GIVER_SOURCE, QUEST_GIVERS, VENDOR_SOURCE
    if not (DATEN / 'auftraggeber.json').is_file():
        raise SystemExit('MISSING: daten/auftraggeber.json (run python3 build_auftraggeber.py first)')
    GIVER_SOURCE = json.loads((DATEN / 'auftraggeber.json').read_text(encoding='utf-8'))
    from giver_viewmodel import giver_index, giver_pages, quest_givers
    QUEST_GIVERS = quest_givers(GIVER_SOURCE)
    if not (DATEN / 'haendler.json').is_file():
        raise SystemExit('MISSING: daten/haendler.json (run python3 build_haendler.py first)')
    VENDOR_SOURCE = json.loads((DATEN / 'haendler.json').read_text(encoding='utf-8'))
    region_ids = {
        int(row['region']): int(row['idx'])
        for row in json.loads((DATEN / 'karten.json').read_text(encoding='utf-8'))
        if row.get('tier') == 1 and row.get('region') is not None
    }
    from vendor_viewmodel import vendor_index, vendor_pages

    manifest_path = target / 'manifest.json'
    manifest = {'schema': SCHEMA, 'languages': {}, 'kinds': list(ARTEN)}
    if manifest_path.is_file():
        try:
            old = json.loads(manifest_path.read_text(encoding='utf-8'))
            if old.get('schema') == SCHEMA:
                manifest = old
        except json.JSONDecodeError:
            pass

    # Overview pages of all languages are collected first: their shards are
    # keyed by path, so writing per language would overwrite earlier shards.
    listen: dict = {}
    detail_routes: dict = {}
    for lang in languages:
        model = load_language(lang, chest_items)
        data = language_data(model, lang, fraktion_source, landmark_source)
        maps = {str(m['idx']): m for m in model['maps']}
        folder = target / lang
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'maps.json').write_text(
            json.dumps({'maps': maps}, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        (folder / 'deed-redirects.json').write_text(
            json.dumps({'redirects': model.get('replaced') or {}},
                       ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        counts = {}
        for kind in ARTEN:
            if kind in ('area', 'region'):
                continue
            counts[kind] = len(data[kind])
            write_shards(target, lang, kind, data[kind])
        # Areas and regions share the map table; keep them sharded as well so
        # the router stays uniform.
        for kind in ('area', 'region'):
            counts[kind] = len(data[kind])
            write_shards(target, lang, kind, data[kind])

        # Render-ready pages, built from the same records and the same rules as
        # the static generator (tools/php_viewmodel.py).
        sys.path.insert(0, str(HIER / 'tools'))
        from php_viewmodel import (ItemContext, ViewBuilder, app_url, area_view, coords,
                                   deed_index, deed_view, faction_view, honor_view, item_view,
                                   landmark_view, list_pages, members_index, profession_view,
                                   quest_view, recipe_view)
        builder = ViewBuilder(lang, model, maps)
        quest_pages = {ident: quest_view(builder, quest) for ident, quest in data['q'].items()}
        counts['page-q'] = len(quest_pages)
        write_pages(target, lang, 'q', quest_pages)

        index = deed_index(model)
        categories = deed_categories()
        deed_pages = {ident: deed_view(builder, deed, index, categories)
                      for ident, deed in data['d'].items()}
        counts['page-d'] = len(deed_pages)
        write_pages(target, lang, 'd', deed_pages)

        # Reuse the public list schemas for embedded lists; PHP reads only the
        # requested relation IDs from these shards, not a browser-wide index.
        from related_filter_data import task_rows
        from php_viewmodel import OTHER_DEED
        other_deed = set(OTHER_DEED.values())
        quest_rows = task_rows(data['q'], quest_pages, other_deed)
        deed_rows = task_rows(data['d'], deed_pages, other_deed)
        write_shards(target, lang, 'filter-q', quest_rows)
        write_shards(target, lang, 'filter-d', deed_rows)
        # The deeds index is a list page, not a relation: it needs every deed at
        # once so its search and filters cover the whole catalogue. Same rows as
        # the embedded relation lists, sorted by name.
        index_rows = [deed_rows[ident] for ident in sorted(
            deed_rows, key=lambda key: (deed_rows[key]['name'].casefold(), key))]
        (WEB / ('taten-index-%s.js' % lang)).write_text(
            'window.MQL_INDEX_ROWS=' + json.dumps({'kind': 'd', 'rows': index_rows},
                                                  ensure_ascii=False, separators=(',', ':')) + ';\n',
            encoding='utf-8')
        item_filter = read_assignment(WEB / ('gegenstaende-%s.js' % lang), 'MQL_GEGENSTAENDE')
        write_shards(target, lang, 'filter-i', {row[0]: row for row in item_filter['e']})
        (folder / 'filter-items.json').write_text(json.dumps(
            {key: value for key, value in item_filter.items() if key != 'e'},
            ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

        for art in ('title', 'virtue'):
            pages = {ident: honor_view(builder, art, entry)
                     for ident, entry in data[art].items()}
            counts['page-' + art] = len(pages)
            write_pages(target, lang, art, pages)

        faction_pages = {ident: faction_view(builder, entry)
                         for ident, entry in data['f'].items()}
        counts['page-f'] = len(faction_pages)
        write_pages(target, lang, 'f', faction_pages)

        landmark_pages = {ident: landmark_view(builder, entry)
                          for ident, entry in data['l'].items()}
        counts['page-l'] = len(landmark_pages)
        write_pages(target, lang, 'l', landmark_pages)
        write_landmark_index(target, lang, data['l'], maps)
        write_title_index(target, lang, data['title'], builder.quests, builder.deeds, maps)
        write_faction_index(target, lang, data['f'], builder.quests, builder.deeds, maps)
        write_instance_index(target, lang, instanz_source, maps)
        loot_sources = write_instance_details(
            target, lang, instanz_source, data['q'], maps, data['i'], quest_pages, instance_loot,
            instance_maps, instance_data)

        item_ctx = load_item_context(builder, model, lang)
        item_pages = {ident: item_view(builder, item_ctx, ident, item)
                       for ident, item in data['i'].items()}
        instance_label = {'de': 'Truhenbeute aus Instanzen',
                          'en': 'Instance chest loot',
                          'fr': 'Butin des coffres d’instances'}[lang]
        for item_id, sources in loot_sources.items():
            page = item_pages.get(item_id)
            if page is None:
                continue
            rows = chest_source_rows(sources.values(), lang, item_id)
            page['where_groups'].append({'label': instance_label, 'filter': None,
                                         'entries': rows, 'instance_chests': True})
            page['has_where_from'] = True
            page['where_from_count'] = page.get('where_from_count', 0) + len(rows)
        # Large item source lists reuse the task finder's complete filter
        # schema, but only receive the tasks that award this item.
        for ident, item in data['i'].items():
            by_kind = {}
            for source in item.get('quellen') or []:
                if len(source) > 1 and source[0] in ('q', 'd'):
                    by_kind.setdefault(source[0], []).append(source[1])
            task_filter = {}
            for kind, ids in by_kind.items():
                source = data['q'] if kind == 'q' else data['d']
                selected = []
                fields = ('i', 'n', 'r', 'z', 'u', 'a', 'g', 'l', 'th', 'f',
                          'dy', 'rp', 'gr', 'ix', 'ls', 'v', 'vo', 'vl', 'vb',
                          'e', 'x', 'mp', 'rw')
                for task_id in dict.fromkeys(ids):
                    if task_id in source:
                        selected.append({key: source[task_id].get(key)
                                         for key in fields if key in source[task_id]})
                if len(selected) > 10:
                    task_filter[kind] = selected
            item_pages[ident]['task_filter'] = task_filter
        link_items(item_pages, set_source, lang)
        counts['page-i'] = len(item_pages)
        write_pages(target, lang, 'i', item_pages)

        # Recipe pages link their ingredients; the toggle "Show sources"
        # only makes sense where the item page answers something. Item pages
        # come first for that reason, and the ids without an answer travel to
        # the crafting page as well (it builds the same toggle in the browser).
        ohne_herkunft = zutaten_ohne_herkunft(data['recipe'], item_pages)
        (folder / 'zutaten-ohne.json').write_text(
            json.dumps({'ids': ohne_herkunft}, ensure_ascii=False,
                       separators=(',', ':')), encoding='utf-8')
        recipe_pages = {ident: recipe_view(builder, row, set(ohne_herkunft))
                        for ident, row in data['recipe'].items()}
        counts['page-recipe'] = len(recipe_pages)
        write_pages(target, lang, 'recipe', recipe_pages)

        sets = set_pages(set_source, lang, item_pages)
        data['set'] = {sid: {'id': sid, 'name': row['name']} for sid, row in sets.items()}
        write_shards(target, lang, 'set', data['set'])
        write_pages(target, lang, 'set', sets)
        counts['set'] = counts['page-set'] = len(sets)
        shutil.copy2(DATEN / ('sets-suche-%s.json' % lang), folder / 'sets-index.json')

        # Quest givers: one filter index plus render-ready detail pages. The
        # index is written here because only this step knows the localized map
        # names and the quest records of the same language.
        givers = giver_index(GIVER_SOURCE, lang, data['q'], maps)
        (folder / 'givers-index.json').write_text(
            json.dumps(givers, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        data['giver'] = {row['id']: {'id': row['id'], 'name': row['name']}
                         for row in givers['givers']}
        write_shards(target, lang, 'giver', data['giver'])
        giver_detail = giver_pages(GIVER_SOURCE, lang, data['q'], maps,
                                   app_url, coords, builder.w)
        write_pages(target, lang, 'giver', giver_detail)
        counts['giver'] = counts['page-giver'] = len(giver_detail)

        vendors = vendor_index(VENDOR_SOURCE, lang, maps)
        (folder / 'vendors-index.json').write_text(
            json.dumps(vendors, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        data['vendor'] = {row['id']: {'id': row['id'], 'name': row['name']}
                          for row in vendors['vendors']}
        write_shards(target, lang, 'vendor', data['vendor'])
        vendor_detail = vendor_pages(VENDOR_SOURCE, lang, data['i'], maps,
                                     app_url, coords, builder.w, region_ids)
        write_pages(target, lang, 'vendor', vendor_detail)
        counts['vendor'] = counts['page-vendor'] = len(vendor_detail)

        members = members_index(builder, model)
        for kind in ('area', 'region'):
            pages = {ident: area_view(builder, entry, kind, members)
                     for ident, entry in data[kind].items()}
            counts['page-' + kind] = len(pages)
            write_pages(target, lang, kind, pages)

        by_profession = {}
        for ident, row in data['recipe'].items():
            by_profession.setdefault(row[9], []).append((ident, row))
        profession_pages = {key: profession_view(builder, key, entry,
                                                 by_profession.get(key, []))
                            for key, entry in data['p'].items()}
        counts['page-p'] = len(profession_pages)
        write_pages(target, lang, 'p', profession_pages)

        # Overview pages, addressed by their own path instead of an id.
        lists = {lang + '/' + key: value for key, value in list_pages(builder, model, data).items()}
        counts['page-list'] = len(lists)
        listen.update(lists)
        from php_viewmodel import route as _route
        detail_routes[lang] = {}
        instance_segment = {'de': 'instanz', 'en': 'instance', 'fr': 'instance'}[lang]
        detail_routes[lang][instance_segment] = [
            '/%s/%s/%s/' % (lang, instance_segment, ident)
            for ident, entry in instanz_source.items()
            if (entry.get('name') or {}).get(lang)]
        for kind in SITEMAP_KINDS:
            ids = data[kind].keys()
            if kind == 'set':
                from set_viewmodel import SEGMENT
                segment = SEGMENT[lang]
                detail_routes[lang][segment] = ['/%s/%s/' % (lang, segment)] + [
                    '/%s/%s/%s/' % (lang, segment, ident) for ident in sorted(ids)]
            elif kind == 'vendor':
                # Its segment lives in the vendor view model; the catalogue
                # words hold the display label ("Bei Händlern erhältlich").
                from vendor_viewmodel import SEGMENT, vendor_url
                segment = SEGMENT[lang]
                detail_routes[lang][segment] = [vendor_url(lang, ident)
                                                for ident in sorted(ids)]
            elif kind == 'giver':
                from giver_viewmodel import SEGMENT
                segment = SEGMENT[lang]
                # The list page is already part of sitemap-seiten.xml. Keep
                # the entity sitemap limited to detail pages so one canonical
                # URL is never published in two sitemap sections.
                detail_routes[lang][segment] = [
                    '/%s/%s/%s/' % (lang, segment, ident) for ident in sorted(ids)]
            else:
                segment = _route(lang, kind).strip('/').split('/')[1]
                detail_routes[lang][segment] = sorted(_route(lang, kind, ident) for ident in ids)

        manifest['languages'][lang] = counts
        for kind in ('set', 'giver', 'vendor'):
            if kind not in manifest['kinds']:
                manifest['kinds'].append(kind)
        if not options.still:
            print('%s: %s' % (lang, ', '.join('%s %d' % (k, v) for k, v in counts.items())),
                  flush=True)

    # Sitemaps come from the same page list the router serves, so they cannot
    # drift from the catalogue. 45.000 URLs per file, as the static build.
    if listen:
        write_list_shards(target, listen)

        sections: dict = defaultdict(list)
        for key, page in listen.items():
            lang, segment = page['canonical'].strip('/').split('/')[:2]
            sections['/%s/%s/sitemap.xml' % (lang, segment)].append(page['canonical'])
        for lang, kinds in detail_routes.items():
            for segment, paths in kinds.items():
                sections['/%s/%s/sitemap.xml' % (lang, segment)].extend(paths)

        split: dict = {}
        for name, urls in sections.items():
            if len(urls) <= 45000:
                split[name] = sorted(set(urls))
                continue
            unique = sorted(set(urls))
            for number, start in enumerate(range(0, len(unique), 45000), 1):
                split[name.replace('.xml', '-%d.xml' % number)] = unique[start:start + 45000]
        write_sitemaps(target, split)
        if not options.still:
            print('sitemaps: %d Dateien, %d URLs' % (len(split), sum(len(u) for u in split.values())),
                  flush=True)

        if not options.still:
            print('page-list gesamt: %d Seiten' % len(listen), flush=True)

    # Adventure overview: one catalogue per language, also used by the page.
    sys.path.insert(0, str(HIER / 'tools'))
    from build_abenteuer import catalogues
    for lang, data in catalogues().items():
        folder = target / lang
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'abenteuer.json').write_text(
            json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        # Same catalogue for the browser; progress and ownership stay local.
        (HIER / 'web' / ('abenteuer-%s.js' % lang)).write_text(
            'window.MQL_ABENTEUER_KATALOG = %s;\n'
            % json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        if not options.still:
            print('%s: %d Abenteuer, %d Gebiete, %d Aufgaben'
                  % (lang, len(data['packs']), len(data['areas']), len(data['quests'])), flush=True)

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True),
                             encoding='utf-8')
    if not options.still:
        total = sum(f.stat().st_size for f in target.rglob('*') if f.is_file())
        files = sum(1 for f in target.rglob('*') if f.is_file())
        print('phpdata: %d Dateien, %.1f MB' % (files, total / 1048576))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
