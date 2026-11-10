#!/usr/bin/env python3
"""Faction records for the catalogue pages.

Three sources, each for the part it knows best:

* the DAT export (`reputation-crafting-2026-11-03`) for names and the
  descriptions the game shows,
* `web/referenz.js` for the tier names and the starting tier (it is built from
  the same export, but resolves the progression tables),
* `web/ruf-quellen-<language>.js` for the quests and titles that award reputation.

Output is `daten/fraktionen.json`; `tools/build_php_data.py` turns it into shards
and page models. Nothing is estimated: a faction without sources keeps an empty
list.

    python3 tools/build_fraktionen.py [--ziel daten/fraktionen.json]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
              '/reputation-crafting-2026-11-03/raw.jsonl')
SPRACHEN = ('de', 'en', 'fr')
FRAKTION = 1889


def js_datei(pfad: Path, name: str) -> dict:
    text = pfad.read_text(encoding='utf-8')
    marker = 'window.%s = ' % name
    start = text.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(text[start:])[0]


def texte(wert) -> dict:
    """Localized property as {de, en, fr}, empty strings where it is missing."""
    if not isinstance(wert, dict):
        return {sprache: '' for sprache in SPRACHEN}
    texts = wert.get('texts') or {}
    return {sprache: str(texts.get(sprache) or '') for sprache in SPRACHEN}


def baue(export: Path) -> dict:
    fraktionen: dict[str, dict] = {}
    with export.open(encoding='utf-8') as strom:
        for zeile in strom:
            eintrag = json.loads(zeile)
            if eintrag.get('class_index') != FRAKTION:
                continue
            properties = eintrag.get('properties') or {}
            name = texte(properties.get('Reputation_Faction_Name'))
            if not name['de'] and not name['en']:
                continue
            fraktionen[eintrag['id']] = {
                'name': name,
                'desc': texte(properties.get('Reputation_Faction_Description')),
                'min': properties.get('Reputation_LowestTier') or 1,
                'max': properties.get('Reputation_HighestTier') or 7,
                'start': properties.get('Reputation_Faction_DefaultTier'),
                'tiers': {},
                'sources': {},
            }

    # Tier names and the exact starting tier come from the resolved tables.
    referenz = js_datei(WEB / 'referenz.js', 'MQL_REFERENZ').get('fraktionen') or {}
    for ident, eintrag in fraktionen.items():
        ref = referenz.get(ident) or {}
        if ref.get('s'):
            eintrag['tiers'] = ref['s']
        for feld in ('min', 'max', 'start'):
            if ref.get(feld) is not None:
                eintrag[feld] = ref[feld]

    for sprache in SPRACHEN:
        datei = WEB / ('ruf-quellen-%s.js' % sprache)
        if not datei.is_file():
            continue
        quellen = js_datei(datei, 'MQL_RUF_QUELLEN')
        for ident, zeilen in quellen.items():
            eintrag = fraktionen.get(ident)
            if eintrag is None:
                continue
            eintrag['sources'][sprache] = [
                {'id': z[0], 'name': z[1], 'kind': z[3], 'place': z[5] if len(z) > 5 else ''}
                for z in zeilen]

    return {'schema': 1, 'fraktionen': fraktionen}


def main() -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('--ziel', type=Path, default=HIER / 'daten' / 'fraktionen.json')
    optionen = zerleger.parse_args()
    payload = baue(EXPORT)
    optionen.ziel.parent.mkdir(parents=True, exist_ok=True)
    optionen.ziel.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                             encoding='utf-8')
    fraktionen = payload['fraktionen']
    mit_quellen = sum(1 for e in fraktionen.values() if e['sources'].get('de'))
    print('fraktionen: %d, davon mit Rufquellen: %d' % (len(fraktionen), mit_quellen))
    print('geschrieben: %s' % optionen.ziel)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
