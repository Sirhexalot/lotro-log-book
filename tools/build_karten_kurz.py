#!/usr/bin/env python3
"""Create compact initial data for the map application."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
DATEN = ROOT / 'daten'
LANGS = ('de', 'en', 'fr')
KEEP = {
    'i', 'n', 'gt', 'a', 'ak', 'g', 'l', 'r', 'z', 'v', 'vo', 'vl', 'vb',
    'fk', 'e', 'x', 'mp', 'ie', 'f', 'th', 't', 'd', 'rw',
    'dy', 'rp', 'gr', 'ix', 'ls',
}
# Descriptions are only needed after selecting an entry. Leaving them out of
# the first-paint payload saves a substantial amount on both map modes; the
# full catalogue is merged by app.js when the detail is opened.
INITIAL_KEEP = KEEP - {'d'}
SUMMARY_KEEP = {'i', 'z', 'ie', 'x', 'mp', 'e', 'l', 'ls', 'vl', 'vb', 'v', 'vo', 'f', 'fk', 'th', 'a'}
# Everything the detail pane needs beyond the compact map entry. The full
# catalogue is never fetched for the map any more: one small file per map (or
# per region for entries without a map) carries exactly these fields.
DETAIL_KEEP = ('d', 's', 't', 'u', 'gi', 'nq', 'pq', 'tl', 'lp')
# Localized root name of the epic story; it is the only topic that opens on the
# map instead of the finder.
THEMA_EPIK = {'de': 'Epische Geschichte', 'en': 'Epic Story', 'fr': 'Histoire épique'}


def assignment(text: str, name: str):
    match = re.search(r'window\.%s\s*=\s*' % re.escape(name), text)
    if not match:
        raise SystemExit('MISSING: %s' % name)
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def giver_spots() -> dict:
    """Quest ID → the quest giver's first recorded place on a game map."""
    pfad = DATEN / 'auftraggeber.json'
    if not pfad.exists():
        return {}
    daten = json.loads(pfad.read_text(encoding='utf-8'))
    givers = daten.get('givers') or {}
    zuordnung = daten.get('quest_giver') or {}
    orte = {}
    for kennung, geber in zuordnung.items():
        for eines in (geber if isinstance(geber, list) else [geber]):
            for platz in (givers.get(str(eines)) or {}).get('places') or []:
                if platz.get('map') is None or platz.get('lat') is None or platz.get('lon') is None:
                    continue
                orte[str(kennung).upper()] = [int(platz['map']),
                                              round(float(platz['lat']), 5),
                                              round(float(platz['lon']), 5)]
                break
            if str(kennung).upper() in orte:
                break
    return orte


def step_targets(quests: list, label: str) -> dict:
    """Chapter ID → objectives of the steps that name it as their predecessor."""
    ziele = {}
    for quest in quests:
        if quest.get('th') != 'epic' or (quest.get('f') or [''])[0] == label:
            continue
        eigene = quest.get('t') or []
        if not eigene:
            continue
        for vorher in quest.get('v') or []:
            ziele.setdefault(str(vorher).upper(), []).extend(eigene)
    return ziele


def epic_places(quests: list, label: str) -> int:
    """Give epic chapters a place where the game data proves one.

    Chapter entries carry no map of their own: the client keeps map and giver
    with the step, not with the chapter. Three proofs are used, never a guess:
    the quest giver's recorded spot, the objectives of the steps that name the
    chapter as their predecessor, and for instance parts the place of the
    chapter they belong to. All of them stay real places on real maps.
    """
    geber = giver_spots()
    ziele = step_targets(quests, label)
    kapitel = [quest for quest in quests if (quest.get('f') or [''])[0] == label]
    nach_id = {str(quest['i']).upper(): quest for quest in quests}

    def mit_ort(quest) -> bool:
        return bool(quest.get('gt') or quest.get('t'))

    def eigene_ziele(quest) -> list:
        eigene, gesehen = [], set()
        for ziel in ziele.get(str(quest['i']).upper(), []):
            schluessel = (int(ziel[0]), round(float(ziel[1]), 5), round(float(ziel[2]), 5))
            if schluessel in gesehen:
                continue
            gesehen.add(schluessel)
            eigene.append([schluessel[0], schluessel[1], schluessel[2],
                           ziel[3] if len(ziel) > 3 else ''])
        return eigene[:12]

    # 1. Own proof: the giver's spot, else the objectives of the linked steps.
    for quest in kapitel:
        if mit_ort(quest):
            continue
        ort = geber.get(str(quest['i']).upper())
        if ort:
            quest['gt'] = ort
            continue
        eigene = eigene_ziele(quest)
        if eigene:
            quest['t'] = eigene

    # 2. An instance part happens where its chapter happens; the chapter's place
    #    is shown as a place marker, not claimed as the part's own giver.
    for quest in kapitel:
        if mit_ort(quest):
            continue
        eltern = nach_id.get(str(quest.get('ie') or '').upper())
        if not eltern:
            continue
        if eltern.get('t'):
            quest['t'] = [list(ziel) for ziel in eltern['t'][:12]]
        elif eltern.get('gt'):
            quest['t'] = [[eltern['gt'][0], eltern['gt'][1], eltern['gt'][2], '']]

    return sum(1 for quest in kapitel if mit_ort(quest))


def build(lang: str, deeds: bool = False) -> None:
    quelle = 'daten-taten-%s.js' if deeds else 'daten-%s.js'
    ziel = 'karten-kurz-taten-%s.js' if deeds else 'karten-kurz-%s.js'
    text = (WEB / (quelle % lang)).read_text(encoding='utf-8')
    quests = assignment(text, 'MQL_QUESTS')
    maps = assignment(text, 'MQL_KARTEN')
    replaced = assignment(text, 'MQL_REPLACED') if deeds else None
    if not deeds:
        epic_places(quests, THEMA_EPIK[lang])
    compact = []
    summary = [
        {key: value for key, value in quest.items() if key in SUMMARY_KEEP}
        for quest in quests
    ]
    map_shards = {}
    region_shards = {}
    detail_map = {}
    detail_region = {}
    for quest in quests:
        eintrag = {key: value for key, value in quest.items()
                   if key in INITIAL_KEEP}
        # The initial map shows the giver by default. Full objective lists are
        # loaded on selection from the detail shard; for entries without a giver
        # the first objective remains as the map fallback. This keeps the
        # initial script small without changing the selected quest's detail
        # view or the explicit "show objectives" mode.
        if 't' in eintrag:
            if quest.get('gt'):
                del eintrag['t']
            else:
                eintrag['t'] = eintrag['t'][:1]
        compact.append(eintrag)
        karten = quest.get('fk') or []
        if karten:
            gruppe_map = str(karten[-1])
            gruppe_region = None
            map_shards.setdefault(gruppe_map, []).append(eintrag)
        else:
            labels = quest.get('f') or []
            gruppe_region = labels[0] if labels else quest.get('r') or 'ohne-zuordnung'
            gruppe_map = None
            region_shards.setdefault(gruppe_region, []).append(eintrag)
        detail = {key: quest[key] for key in DETAIL_KEEP if key in quest}
        if gruppe_map is not None:
            detail_map.setdefault(gruppe_map, {})[quest['i']] = detail
        else:
            detail_region.setdefault(gruppe_region, {})[quest['i']] = detail
    target = WEB / (ziel % lang)
    prefix = 'deed ' if deeds else ''
    replacement = ('window.MQL_REPLACED = %s;\n' %
                   json.dumps(replaced, ensure_ascii=False, separators=(',', ':'))) if deeds else ''
    target.write_text(
        '/* %sInitial map data; descriptions and steps come from the detail shards. */\n'
        '%swindow.MQL_QUESTS = %s;\nwindow.MQL_KARTEN = %s;\n' % (
            prefix, replacement,
            json.dumps(compact, ensure_ascii=False, separators=(',', ':')),
            json.dumps(maps, ensure_ascii=False, separators=(',', ':'))),
        encoding='utf-8')
    art_dir = 'taten' if deeds else 'aufgaben'
    shard_dir = WEB / 'karten-daten' / art_dir / lang
    if shard_dir.exists():
        shutil.rmtree(shard_dir)
    shard_dir.mkdir(parents=True)
    detail_dir = shard_dir
    detail_bytes = 0
    for map_id, rows in map_shards.items():
        (shard_dir / ('map-' + map_id + '.js')).write_text(
            'window.MQL_GEBIETS_DATEN = %s;\n' %
            json.dumps(rows, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        inhalt = json.dumps(detail_map.get(map_id, {}), ensure_ascii=False,
                            separators=(',', ':'))
        (detail_dir / ('detail-map-' + map_id + '.js')).write_text(
            'window.MQL_GEBIETS_DETAILS = %s;\n' % inhalt, encoding='utf-8')
        detail_bytes += len(inhalt.encode('utf-8'))
    region_index = {}
    for number, (region, rows) in enumerate(sorted(region_shards.items())):
        filename = 'region-%d.js' % number
        region_index[region] = filename
        (shard_dir / filename).write_text(
            'window.MQL_GEBIETS_DATEN = %s;\n' %
            json.dumps(rows, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        inhalt = json.dumps(detail_region.get(region, {}), ensure_ascii=False,
                            separators=(',', ':'))
        (detail_dir / ('detail-' + filename)).write_text(
            'window.MQL_GEBIETS_DETAILS = %s;\n' % inhalt, encoding='utf-8')
        detail_bytes += len(inhalt.encode('utf-8'))
    # The map knows from here which shards exist; a landscape overview map has
    # no shard of its own and must not cost a 404 on every visit.
    shard_maps = sorted(map_shards, key=lambda wert: int(wert))
    # The epic story is the one topic that opens on the map instead of the
    # finder. Its chapter entries stay out of the area shards, so they travel in
    # a small file of their own; the tile link loads it before the tree is built.
    thema_epic = [eintrag for eintrag in compact
                  if (eintrag.get('f') or [''])[0] == THEMA_EPIK[lang]]
    if not deeds:
        (WEB / ('thema-epic-%s.js' % lang)).write_text(
            'window.MQL_THEMA_DATEN = %s;\n' %
            json.dumps(thema_epic, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
    start_name = ('karten-start-taten-%s.js' if deeds else 'karten-start-%s.js') % lang
    start_target = WEB / start_name
    start_target.write_text(
        '/* Map structure only; entries load when an area is opened. */\n'
        '%swindow.MQL_QUESTS = [];\nwindow.MQL_KARTEN = %s;\n'
        'window.MQL_SHARD_REGION = %s;\nwindow.MQL_SHARD_MAPS = %s;\n'
        'window.MQL_KARTEN_SUMMARY = %s;\n' % (
            replacement,
            json.dumps(maps, ensure_ascii=False, separators=(',', ':')),
            json.dumps(region_index, ensure_ascii=False, separators=(',', ':')),
            json.dumps(shard_maps, ensure_ascii=False, separators=(',', ':')),
            json.dumps(summary, ensure_ascii=False, separators=(',', ':'))),
        encoding='utf-8')
    print('%s%s: %d entries, %.1f KiB, details %.1f MiB' %
          (prefix, lang, len(compact), target.stat().st_size / 1024,
           detail_bytes / 1048576))


if __name__ == '__main__':
    shard_root = WEB / 'karten-daten'
    if shard_root.exists():
        shutil.rmtree(shard_root)
    for language in LANGS:
        build(language)
        build(language, deeds=True)
