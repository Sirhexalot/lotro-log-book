#!/usr/bin/env python3
"""Landmark records: name, place on the map and the quests that lead there.

The DAT export knows the names; the position export knows where a landmark
stands (region, longitude, latitude); the location export knows which quests and
deeds target it. The map is the most detailed one of the same game region whose
bounds hold the point - the same rule the map application uses for quest pins.

Not every landmark appears on the world layer: caves and interiors are content
layers of the same coordinate space. Those positions are used as well, but a
map is only assigned when every recorded point fits one map of the landmark's
game region. Several points spread over different maps stay without a pin
instead of choosing one of them.

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


def lade_positionen(pfad: Path) -> tuple[dict[str, dict], dict[str, list[dict]]]:
    """World position first, then every other placement of the same landmark.

    The world layer is the ordinary place and keeps its old behaviour. Caves,
    interiors and similar surfaces live on content layers; their points are kept
    as candidates so a landmark the world layer does not carry still gets its
    place. Copies inside an instance are dropped: they repeat a place that is
    already described in the open world.
    """
    welt: dict[str, dict] = {}
    alle: dict[str, list[dict]] = defaultdict(list)
    with pfad.open(encoding='utf-8') as strom:
        for zeile in strom:
            eintrag = json.loads(zeile)
            if eintrag.get('instance') not in (0, None):
                continue
            alle[eintrag['did']].append(eintrag)
            if eintrag.get('layer') in (0, None):
                welt.setdefault(eintrag['did'], eintrag)
    return welt, alle


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


def karten_um_punkt(gruppen: dict, punkt: dict) -> dict:
    """The maps of the point's game region that hold it, by map id."""
    return {karte['idx']: karte for karte in gruppen.get(punkt.get('region')) or []
            if karte['south'] <= float(punkt['latitude']) <= karte['north']
            and karte['west'] <= float(punkt['longitude']) <= karte['east']}


def tiefste_karten(karten: dict) -> dict:
    """Only the most detailed maps of a candidate set."""
    stufe = max((karte.get('tier') or 0) for karte in karten.values())
    return {idx: karte for idx, karte in karten.items()
            if (karte.get('tier') or 0) == stufe}


def gemeinsame_karte(gruppen: dict, punkte: list[dict]):
    """One map for a landmark that the world layer does not carry.

    A map is only taken when it holds every recorded point: either it is the
    single common map, or every point's most detailed map is the same one. A
    continent overview alone is no answer - it puts the pin nowhere useful.
    Otherwise the landmark keeps its coordinates but gets no pin.
    """
    gemeinsam = None
    tiefste = None
    for punkt in punkte:
        eigene = karten_um_punkt(gruppen, punkt)
        if not eigene:
            return None
        gemeinsam = eigene if gemeinsam is None else {
            idx: karte for idx, karte in eigene.items() if idx in gemeinsam}
        eigen_tief = tiefste_karten(eigene)
        tiefste = eigen_tief if tiefste is None else {
            idx: karte for idx, karte in eigen_tief.items() if idx in tiefste}
        if not gemeinsam or not tiefste:
            return None
    if len(gemeinsam) == 1:
        karte = next(iter(gemeinsam.values()))
        return karte if (karte.get('tier') or 0) > 1 else None
    if len(tiefste) == 1:
        return next(iter(tiefste.values()))
    return None


def region_von(karte: dict, nach_kennung: dict) -> int:
    """Walk up to the region map: parents can be areas as well."""
    aktuell = karte
    for _ in range(12):
        if (aktuell.get('tier') or 0) <= 1:
            break
        eltern = nach_kennung.get(int(aktuell.get('eltern') or 0))
        if not eltern:
            break
        aktuell = eltern
    return int(aktuell['idx'])


def baue(export: Path) -> dict:
    quellen = export / 'full-dat-en-de-fr-2026-11-03'
    landmarken = json.loads((quellen / 'landmarks.json').read_text(encoding='utf-8'))
    orte, plaetze = lade_positionen(export / 'did-positions-2026-11-03' / 'positions.jsonl')
    karten = json.loads((DATEN / 'karten.json').read_text(encoding='utf-8'))
    nach_kennung = {int(karte['idx']): karte for karte in karten}
    gruppen = karten_je_region(karten)

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
        seite = {'name': name, 'targets': sorted(set(ziele.get(ident, [])))}
        ort = orte.get(ident)
        karte = None
        if ort:
            lat, lon = float(ort['latitude']), float(ort['longitude'])
            karte = passende_karte(gruppen, ort.get('region'), lat, lon)
        elif plaetze.get(ident):
            # Caves and interiors: the first recorded point is the position,
            # the map has to hold all of them.
            ort = plaetze[ident][0]
            lat, lon = float(ort['latitude']), float(ort['longitude'])
            karte = gemeinsame_karte(gruppen, plaetze[ident])
        if ort:
            seite['lat'], seite['lon'], seite['game_region'] = lat, lon, ort.get('region')
            seite['block'] = [
                int(ort.get('region') or 0),
                int(ort.get('block_x') or 0),
                int(ort.get('block_y') or 0),
                int(str(ort.get('cell') or '0'), 16),
            ]
            if karte:
                breite = karte['east'] - karte['west']
                hoehe = karte['north'] - karte['south']
                seite['map'] = int(karte['idx'])
                seite['x'] = round((lon - karte['west']) / breite * 100, 2)
                seite['y'] = round((karte['north'] - lat) / hoehe * 100, 2)
                seite['region'] = region_von(karte, nach_kennung)
                seite['area'] = int(karte['idx'])
        else:
            ohne_ort += 1
        seiten[ident] = seite

    # Use the same client landblock resolver as vendors and quest givers.
    import sys
    sys.path.insert(0, str(HIER / 'tools'))
    from zonen import anreichern
    anreichern([(int(ident, 16), seite) for ident, seite in seiten.items()])

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
