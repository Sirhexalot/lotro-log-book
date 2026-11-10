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
from collections import defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
WEB = HIER / 'web'
sys.path.insert(0, str(HIER))
from itemnamen import sauberer_name  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')
SCHEMA = 1

# Every kind the catalogue exposes; the shard names are part of the public
# router contract, so they are fixed here and checked in the tests.
ARTEN = ('q', 'd', 'i', 'recipe', 'title', 'virtue', 'area', 'region', 'p')
# Catalogues that get sitemap entries. 'p' (professions) stays out on purpose:
# every profession address answers 301 to the crafting page, and a sitemap must
# only list pages that answer 200. The router keeps the redirects for old links.
SITEMAP_KINDS = ('q', 'd', 'i', 'area', 'region', 'recipe', 'title', 'virtue', 'set', 'giver')

# Quest-giver source, read once in main() and used by every language.
GIVER_SOURCE: dict | None = None
QUEST_GIVERS: dict = {}


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


def load_language(lang: str) -> dict:
    quests = read_assignment(WEB / ('daten-%s.js' % lang), 'MQL_QUESTS')
    deeds = read_assignment(WEB / ('daten-taten-%s.js' % lang), 'MQL_QUESTS')
    maps = read_assignment(WEB / ('daten-%s.js' % lang), 'MQL_KARTEN')
    recipes = read_assignment(WEB / ('rezepte-%s.js' % lang), 'MQL_REZEPTE')['r']
    referenz = read_assignment(WEB / 'referenz.js', 'MQL_REFERENZ')
    items = json.loads((DATEN / 'items.json').read_text(encoding='utf-8'))['items']
    titles = json.loads((DATEN / 'titel.json').read_text(encoding='utf-8'))['eintraege']
    virtues = json.loads((DATEN / 'tugenden.json').read_text(encoding='utf-8'))['eintraege']
    return dict(quests=quests, deeds=deeds, maps=maps, recipes=recipes,
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


def write_pages(target: Path, lang: str, kind: str, pages: dict) -> int:
    """Render-ready view models, one shard per hash bucket.

    These are what PHP hands to Twig. Keeping them apart from the raw records
    means a request reads only what it prints.
    """
    return write_shards(target, lang, 'page-' + kind, pages)


def language_data(model: dict, lang: str) -> dict:
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


def load_item_context(builder, model, lang):
    """Details, set tables, labels and resource places for the item pages."""
    global ITEM_SETS, ITEM_DETAILS, ITEM_LABELS, ITEM_TYPEN, ITEM_BONI
    from php_viewmodel import ItemContext
    if ITEM_DETAILS is None:
        ITEM_DETAILS = json.loads((DATEN / 'gegenstand-details.json').read_text(encoding='utf-8')).get('items') or {}
        # Die Ausrüstungsdatei trägt den Namen nur für einen Teil der
        # Gegenstände und mit Export-Markup; der volle Export ist die Quelle.
        voll = (json.loads(VOLL_DATEI.read_text(encoding='utf-8')).get('items') or {}
                if VOLL_DATEI.is_file() else {})
        for ident, eintrag in ITEM_DETAILS.items():
            namen = eintrag.get('name')
            if not isinstance(namen, dict):
                namen = eintrag['name'] = {}
            quelle = (voll.get(str(ident).upper()) or {}).get('n') or {}
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
                       vorkommen, boni, boni_labels, referenz)


DEED_CATEGORIES: dict | None = None


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
    from set_viewmodel import set_pages, link_items

    global GIVER_SOURCE, QUEST_GIVERS
    if not (DATEN / 'auftraggeber.json').is_file():
        raise SystemExit('MISSING: daten/auftraggeber.json (run python3 build_auftraggeber.py first)')
    GIVER_SOURCE = json.loads((DATEN / 'auftraggeber.json').read_text(encoding='utf-8'))
    from giver_viewmodel import giver_index, giver_pages, quest_givers
    QUEST_GIVERS = quest_givers(GIVER_SOURCE)

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
        model = load_language(lang)
        data = language_data(model, lang)
        maps = {str(m['idx']): m for m in model['maps']}
        folder = target / lang
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'maps.json').write_text(
            json.dumps({'maps': maps}, ensure_ascii=False, separators=(',', ':')),
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
                                   deed_index, deed_view, honor_view, item_view, list_pages,
                                   members_index, profession_view, quest_view, recipe_view)
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

        for art in ('title', 'virtue'):
            pages = {ident: honor_view(builder, art, entry)
                     for ident, entry in data[art].items()}
            counts['page-' + art] = len(pages)
            write_pages(target, lang, art, pages)

        recipe_pages = {ident: recipe_view(builder, row) for ident, row in data['recipe'].items()}
        counts['page-recipe'] = len(recipe_pages)
        write_pages(target, lang, 'recipe', recipe_pages)

        item_ctx = load_item_context(builder, model, lang)
        item_pages = {ident: item_view(builder, item_ctx, ident, item)
                       for ident, item in data['i'].items()}
        link_items(item_pages, set_source, lang)
        counts['page-i'] = len(item_pages)
        write_pages(target, lang, 'i', item_pages)
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
        for kind in SITEMAP_KINDS:
            ids = data[kind].keys()
            if kind == 'set':
                from set_viewmodel import SEGMENT
                segment = SEGMENT[lang]
                detail_routes[lang][segment] = ['/%s/%s/' % (lang, segment)] + [
                    '/%s/%s/%s/' % (lang, segment, ident) for ident in sorted(ids)]
            elif kind == 'giver':
                from giver_viewmodel import SEGMENT
                segment = SEGMENT[lang]
                detail_routes[lang][segment] = ['/%s/%s/' % (lang, segment)] + [
                    '/%s/%s/%s/' % (lang, segment, ident) for ident in sorted(ids)]
            else:
                segment = _route(lang, kind).strip('/').split('/')[1]
                detail_routes[lang][segment] = sorted(_route(lang, kind, ident) for ident in ids)

        manifest['languages'][lang] = counts
        for kind in ('set', 'giver'):
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

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True),
                             encoding='utf-8')
    if not options.still:
        total = sum(f.stat().st_size for f in target.rglob('*') if f.is_file())
        files = sum(1 for f in target.rglob('*') if f.is_file())
        print('phpdata: %d Dateien, %.1f MB' % (files, total / 1048576))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
