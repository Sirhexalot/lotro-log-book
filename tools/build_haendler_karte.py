#!/usr/bin/env python3
"""Where the vendors stand, as points for the map app.

`daten/haendler.json` knows every vendor and its goods; this generator keeps only
what a map dot needs: the place, the name and the kind of vendor. A vendor with
several places appears at each of them - that is where a player meets them.

Writes one file per language:

    web/haendler-karte-<lang>.js   window.MQL_HAENDLER_KARTE = {
                                     "m": {"<map>": [[id, name, lat, lon, art], …], …}}
    daten/haendler-karte-<lang>.json   the same, for checks

The map app loads the file only when the vendor layer is switched on. Points
without a landscape frame (interiors) are not part of it: they cannot be drawn
on a world map, and the vendor page names the room instead.

Usage:
    python3 tools/build_haendler_karte.py            # all three languages
    python3 tools/build_haendler_karte.py --daten daten/haendler.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPRACHEN = ('de', 'en', 'fr')
# One letter per vendor kind, because every row would otherwise repeat the word.
ART = {'vendor': 'v', 'barter': 'b', 'both': 'k'}


def rows(daten: dict, sprache: str) -> dict[str, list]:
    karten: dict[str, list] = {}
    for ident, vendor in daten['vendors'].items():
        art = ART.get(vendor.get('type') or 'vendor', 'v')
        name = (vendor.get('name') or {}).get(sprache) or (vendor.get('name') or {}).get('en') or ident
        gesehen = set()
        for place in vendor.get('places') or []:
            karte = place.get('map')
            if karte is None:
                continue
            schluessel = (str(karte), round(float(place['lat']), 4), round(float(place['lon']), 4))
            if schluessel in gesehen:
                continue
            gesehen.add(schluessel)
            karten.setdefault(str(karte), []).append(
                [ident, name, round(float(place['lat']), 4), round(float(place['lon']), 4), art])
    for liste in karten.values():
        liste.sort(key=lambda row: (row[1].lower(), row[0], row[2], row[3]))
    return karten


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--daten', type=Path, default=ROOT / 'daten/haendler.json')
    parser.add_argument('--ziel', type=Path, default=ROOT / 'web')
    parser.add_argument('--still', action='store_true')
    args = parser.parse_args()

    daten = json.loads(args.daten.read_text(encoding='utf-8'))
    rohdaten = ROOT / 'daten'
    for sprache in SPRACHEN:
        karten = rows(daten, sprache)
        text = json.dumps({'m': karten}, ensure_ascii=False, separators=(',', ':'))
        (args.ziel / ('haendler-karte-%s.js' % sprache)).write_text(
            '/* Written by tools/build_haendler_karte.py. */\n'
            'window.MQL_HAENDLER_KARTE = %s;\n' % text, encoding='utf-8')
        (rohdaten / ('haendler-karte-%s.json' % sprache)).write_text(text, encoding='utf-8')
        if not args.still:
            print('%s: %d Karten, %d Punkte, %d KB' % (
                sprache, len(karten), sum(len(liste) for liste in karten.values()),
                round(len(text.encode('utf-8')) / 1024)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
