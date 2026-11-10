#!/usr/bin/env python3
"""Landmark records: name, place on the map and the quests that lead there.

The DAT export knows the names; the position export knows where a landmark
stands (region, longitude, latitude); the location export knows which quests and
deeds target it. The map is the most detailed one of the same game region whose
bounds hold the point - the same rule the map application uses for quest pins.

Output is `daten/landmarken.json`; `tools/build_php_data.py` turns it into
shards and page models. A landmark without a position keeps its page but gets no
pin, instead of an invented one.

    python3 tools/build_landmarken.py [--ziel daten/landmarken.json]
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter')
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')


def texte(wert) -> dict:
    if not isinstance(wert, dict):
        return {sprache: '' for sprache in SPRACHEN}
    texts = wert.get('texts') or {}
    return {sprache: str(texts.get(sprache) or '') for sprache in SPRACHEN}


def lade_positionen(pfad: Path) -> dict[str, dict]:
    """One place per landmark: the world layer, not an instance copy."""
    orte: dict[str, dict] = {}
    with pfad.open(encoding='utf-8') as strom:
        for zeile in strom:
            eintrag = json.loads(zeile)
            if eintrag.get('layer') not in (0, None) or eintrag.get('instance') not in (0, None):
                continue
            orte.setdefault(eintrag['did'], eintrag)
    return orte


def karten_je_region(karten: list[dict]) -> dict:
    """Maps grouped by game region: regions share the coordinate space, so a
    point must never be pinned on a map of another region."""
    gruppen: dict = defaultdict(list)
    for karte in karten:
        if karte.get('bounds'):
            gruppen[karte.get('region')].append(karte)
    return gruppen


def passende_karte(gruppen: dict, region, lat: float, lon: float):
    """The most detailed map of this game region that holds the point."""
    karten = gruppen.get(region) or [k for teil in gruppen.values() for k in teil]
    treffer = [k for k in karten
               if k['south'] <= lat <= k['north'] and k['west'] <= lon <= k['east']]
    if not treffer:
        return None
    return max(treffer, key=lambda k: (k.get('tier') or 0, k['north'] - k['south']))


def baue(export: Path) -> dict:
    quellen = export / 'full-dat-en-de-fr-2026-11-03'
    landmarken = json.loads((quellen / 'landmarks.json').read_text(encoding='utf-8'))
    orte = lade_positionen(export / 'did-positions-2026-11-03' / 'positions.jsonl')
    gruppen = karten_je_region(json.loads((DATEN / 'karten.json').read_text(encoding='utf-8')))

    ziele: dict[str, list[str]] = defaultdict(list)
    for eintrag in json.loads((quellen / 'locations.json').read_text(encoding='utf-8')):
        ziel = eintrag.get('target_id')
        if ziel:
            ziele[ziel].append(eintrag['id'])

    seiten = {}
    ohne_ort = 0
    for eintrag in landmarken:
        ident = eintrag['id']
        name = texte(eintrag.get('title'))
        if not name['de'] and not name['en']:
            continue
        ort = orte.get(ident)
        seite = {'name': name, 'targets': sorted(set(ziele.get(ident, [])))}
        if ort:
            region = ort.get('region')
            lat, lon = float(ort['latitude']), float(ort['longitude'])
            karte = passende_karte(gruppen, region, lat, lon)
            seite['lat'], seite['lon'], seite['region'] = lat, lon, region
            if karte:
                breite = karte['east'] - karte['west']
                hoehe = karte['north'] - karte['south']
                seite['map'] = int(karte['idx'])
                seite['x'] = round((lon - karte['west']) / breite * 100, 2)
                seite['y'] = round((karte['north'] - lat) / hoehe * 100, 2)
        else:
            ohne_ort += 1
        seiten[ident] = seite

    return {'schema': 1, 'landmarken': seiten,
            'zaehler': {'gesamt': len(seiten), 'ohne_ort': ohne_ort,
                        'mit_ziel': sum(1 for s in seiten.values() if s['targets']),
                        'mit_karte': sum(1 for s in seiten.values() if s.get('map'))}}


def main() -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('--ziel', type=Path, default=DATEN / 'landmarken.json')
    optionen = zerleger.parse_args()
    payload = baue(EXPORT)
    optionen.ziel.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                             encoding='utf-8')
    z = payload['zaehler']
    print('landmarken: %d, mit Karte %d, mit Ziel %d, ohne Ort %d'
          % (z['gesamt'], z['mit_karte'], z['mit_ziel'], z['ohne_ort']))
    print('geschrieben: %s' % optionen.ziel)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
