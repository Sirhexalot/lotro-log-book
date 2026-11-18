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
SUMMARY_KEEP = {'i', 'z', 'ie', 'x', 'mp', 'e', 'l', 'ls', 'vl', 'vb', 'v', 'vo', 'f'}


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
    for quest in quests:
        eintrag = {key: value for key, value in quest.items()
                   if key in INITIAL_KEEP}
        # The initial map shows the giver by default. Full objective lists are
        # loaded on selection from the full catalogue; for entries without a giver
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
            map_shards.setdefault(str(karten[-1]), []).append(eintrag)
        else:
            labels = quest.get('f') or []
            region = labels[0] if labels else quest.get('r') or 'ohne-zuordnung'
            region_shards.setdefault(region, []).append(eintrag)
    target = WEB / (ziel % lang)
    prefix = 'deed ' if deeds else ''
    replacement = ('window.MQL_REPLACED = %s;\n' %
                   json.dumps(replaced, ensure_ascii=False, separators=(',', ':'))) if deeds else ''
    target.write_text(
        '/* Initial map data; full %sdetails stay in the catalogue data file. */\n'
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
    for map_id, rows in map_shards.items():
        (shard_dir / ('map-' + map_id + '.js')).write_text(
            'window.MQL_GEBIETS_DATEN = %s;\n' %
            json.dumps(rows, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
    region_index = {}
    for number, (region, rows) in enumerate(sorted(region_shards.items())):
        filename = 'region-%d.js' % number
        region_index[region] = filename
        (shard_dir / filename).write_text(
            'window.MQL_GEBIETS_DATEN = %s;\n' %
            json.dumps(rows, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
    start_name = ('karten-start-taten-%s.js' if deeds else 'karten-start-%s.js') % lang
    start_target = WEB / start_name
    start_target.write_text(
        '/* Map structure only; entries load when an area is opened. */\n'
        '%swindow.MQL_QUESTS = [];\nwindow.MQL_KARTEN = %s;\n'
        'window.MQL_SHARD_REGION = %s;\nwindow.MQL_KARTEN_SUMMARY = %s;\n' % (
            replacement,
            json.dumps(maps, ensure_ascii=False, separators=(',', ':')),
            json.dumps(region_index, ensure_ascii=False, separators=(',', ':')),
            json.dumps(summary, ensure_ascii=False, separators=(',', ':'))),
        encoding='utf-8')
    print('%s%s: %d entries, %.1f KiB' %
          (prefix, lang, len(compact), target.stat().st_size / 1024))


if __name__ == '__main__':
    shard_root = WEB / 'karten-daten'
    if shard_root.exists():
        shutil.rmtree(shard_root)
    for language in LANGS:
        build(language)
        build(language, deeds=True)
