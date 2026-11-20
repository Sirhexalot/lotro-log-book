#!/usr/bin/env python3
"""Create compact initial data for the map application."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
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


def build(lang: str, deeds: bool = False) -> None:
    quelle = 'daten-taten-%s.js' if deeds else 'daten-%s.js'
    ziel = 'karten-kurz-taten-%s.js' if deeds else 'karten-kurz-%s.js'
    text = (WEB / (quelle % lang)).read_text(encoding='utf-8')
    quests = assignment(text, 'MQL_QUESTS')
    maps = assignment(text, 'MQL_KARTEN')
    replaced = assignment(text, 'MQL_REPLACED') if deeds else None
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
