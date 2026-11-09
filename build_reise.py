#!/usr/bin/env python3
"""Wrap the exported travel data as browser globals: daten/reise-<lang>.json ->
web/reise-<lang>.js. Run after travel_export.py in the source exporter.
"""
import json
from pathlib import Path

HIER = Path(__file__).resolve().parent
SPRACHEN = ('de', 'en', 'fr')


def baue(ziel=HIER):
    for sprache in SPRACHEN:
        quelle = HIER / 'daten' / ('reise-%s.json' % sprache)
        if not quelle.is_file():
            raise SystemExit('MISSING: %s (run travel_export.py)' % quelle)
        daten = json.loads(quelle.read_text(encoding='utf-8'))
        if not daten['knoten'] or not daten['strecken']:
            raise SystemExit('EMPTY travel data: %s' % quelle)
        ziel_datei = Path(ziel) / 'web' / ('reise-%s.js' % sprache)
        ziel_datei.write_text(
            '/* Written by build_reise.py from daten/reise-%s.json. Do not edit. */\n'
            'window.MQL_REISE = %s;\n' % (sprache, json.dumps(daten, ensure_ascii=False, separators=(',', ':'))),
            encoding='utf-8')
        print(sprache, len(daten['knoten']), 'Knoten,', len(daten['strecken']), 'Strecken,',
              len(daten['skills']), 'Skills ->', ziel_datei.name)


if __name__ == '__main__':
    baue()
