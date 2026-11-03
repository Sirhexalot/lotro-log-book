#!/usr/bin/env python3
"""Map notes for the "Filter/Notizen" layer: vendors, stable-masters, mailboxes …

Reads our own DAT export of placed things (MapNote_Type, Name, Title) and their
outdoor positions, and writes web/notizen-<lang>.js:

    window.MQL_NOTIZEN = {k: [[code, name], …], p: [[map, lat, lon, code, name, title], …]}

MapNote_Type is a 64-bit field; bit b stands for key b+1 of the game's
MapNoteType enum (587202775), whose names are the filter list in the game.
Only the 25 categories the game's map filter offers are kept. Indoor positions
(cell != 0) have their own coordinates and are left out.
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
EXPORT = BASIS / 'Companion-Test/source-exporter'
sys.path.insert(0, str(BASIS / 'MagicQuestLog/tools'))
from build_catalog_from_export import moor_map_table, attribute_closest  # noqa: E402
from build_daten import moormap_tabelle, ersatzkarte, STANDARD_MOORMAP, STANDARD_KARTEN  # noqa: E402

# The game's filter list (world map, "Filter/Notizen"), as MapNoteType keys.
FILTER = (24, 61, 27, 42, 60, 34, 35, 28, 22, 58, 33, 38, 57, 55, 29, 54, 43, 52, 31, 51, 23, 21, 45, 40, 53)
MARKE = re.compile(r'\[[a-z]{1,3}\]')


def text(feld, sprache):
    wert = ((feld or {}).get('texts') or {}).get(sprache) or ''
    return MARKE.sub('', wert).replace('\\q', '"').strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--placed', type=Path, default=EXPORT / 'placed-2026-11-03/raw.jsonl')
    parser.add_argument('--positions', type=Path, default=EXPORT / 'did-positions-2026-11-03/positions.jsonl')
    parser.add_argument('--enums', type=Path, default=EXPORT / 'enums/enum-names.json')
    parser.add_argument('--ziel', type=Path, default=HIER / 'web')
    optionen = parser.parse_args()

    namen = json.loads(optionen.enums.read_text(encoding='utf-8'))['MapNoteType']
    karten = moor_map_table(STANDARD_MOORMAP)
    tabelle = moormap_tabelle(STANDARD_MOORMAP)
    bekannt = {karte['idx'] for karte in json.loads(Path(STANDARD_KARTEN).read_text(encoding='utf-8'))}

    orte = defaultdict(set)
    for zeile in optionen.positions.read_text(encoding='utf-8').splitlines():
        r = json.loads(zeile)
        if r.get('cell') == '00000000':
            orte[r['did']].add((r['region'], round(r['latitude'], 2), round(r['longitude'], 2)))

    dinge = []
    for zeile in optionen.placed.open(encoding='utf-8'):
        r = json.loads(zeile)
        p = r.get('properties') or {}
        typ = p.get('MapNote_Type')
        if not typ or p.get('MapNote_Enabled') == 0 or r['id'] not in orte:
            continue
        codes = [b + 1 for b in range(64) if typ >> b & 1 and b + 1 in FILTER]
        if codes:
            dinge.append((r['id'], codes, p))

    for sprache in ('de', 'en', 'fr'):
        punkte, zahl = [], defaultdict(int)
        for ident, codes, p in dinge:
            name = text(p.get('Name'), sprache)
            titel = text(p.get('OccupationTitle'), sprache)
            for region, lat, lon in sorted(orte[ident]):
                gewaehlt = attribute_closest(karten, lat, lon, region)
                if gewaehlt is None:
                    continue
                karte = int(gewaehlt['map'])
                if karte not in bekannt:
                    karte = ersatzkarte(tabelle, bekannt, karte, lat, lon)
                    if karte is None:
                        continue
                for code in codes:
                    punkte.append([karte, lat, lon, code, name, titel])
                    zahl[code] += 1
        kategorien = sorted(([code, MARKE.sub('', (namen[str(code)] or {}).get(sprache) or '').strip()]
                             for code in FILTER if zahl[code]), key=lambda k: k[1].lower())
        inhalt = 'window.MQL_NOTIZEN = %s;\n' % json.dumps({'k': kategorien, 'p': punkte},
                                                         ensure_ascii=False, separators=(',', ':'))
        (optionen.ziel / ('notizen-%s.js' % sprache)).write_text(inhalt, encoding='utf-8')
        print(sprache, len(punkte), 'Punkte,', len(kategorien), 'Kategorien')


if __name__ == '__main__':
    main()
