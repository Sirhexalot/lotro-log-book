#!/usr/bin/env python3
"""Create compact initial data for the map application."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'
LANGS = ('de', 'en', 'fr')
KEEP = {
    'i', 'n', 'gt', 'a', 'ak', 'g', 'l', 'r', 'z', 'v', 'vo', 'vl', 'vb',
    'fk', 'e', 'x', 'mp', 'ie', 'f', 't', 'd', 'rw',
}


def assignment(text: str, name: str):
    match = re.search(r'window\.%s\s*=\s*' % re.escape(name), text)
    if not match:
        raise SystemExit('MISSING: %s' % name)
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def build(lang: str) -> None:
    text = (WEB / ('daten-%s.js' % lang)).read_text(encoding='utf-8')
    quests = assignment(text, 'MQL_QUESTS')
    maps = assignment(text, 'MQL_KARTEN')
    compact = [{key: value for key, value in quest.items() if key in KEEP}
               for quest in quests]
    target = WEB / ('karten-kurz-%s.js' % lang)
    target.write_text(
        '/* Initial map data; quest details stay in daten-%s.js. */\n'
        'window.MQL_QUESTS = %s;\nwindow.MQL_KARTEN = %s;\n' % (
            lang, json.dumps(compact, ensure_ascii=False, separators=(',', ':')),
            json.dumps(maps, ensure_ascii=False, separators=(',', ':'))),
        encoding='utf-8')
    print('%s: %d quests, %.1f KiB' %
          (lang, len(compact), target.stat().st_size / 1024))


if __name__ == '__main__':
    for language in LANGS:
        build(language)
