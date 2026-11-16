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
    'fk', 'e', 'x', 'mp', 'ie', 'f', 'th', 't', 'd', 'rw',
    'dy', 'rp', 'gr', 'ix', 'ls',
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
    compact = []
    for quest in quests:
        eintrag = {key: value for key, value in quest.items() if key in KEEP}
        # The initial map shows the giver by default. Full objective lists are
        # loaded on selection from daten-<lang>.js; for entries without a giver
        # the first objective remains as the map fallback. This keeps the
        # initial script small without changing the selected quest's detail
        # view or the explicit "show objectives" mode.
        if 't' in eintrag:
            if quest.get('gt'):
                del eintrag['t']
            else:
                eintrag['t'] = eintrag['t'][:1]
        if isinstance(eintrag.get('d'), str) and len(eintrag['d']) > 180:
            # The map preview displays at most 150 characters. The complete
            # description is merged from daten-<lang>.js after selection.
            eintrag['d'] = eintrag['d'][:180]
        compact.append(eintrag)
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
