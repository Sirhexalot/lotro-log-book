#!/usr/bin/env python3
"""When a legendary item can be reforged — the client's own table.

The client stores the curve "character level → item level" as progression
1879422471 (`legendarySystem2.xml` points at it); the highest legendary item
level stands in `game.xml`. A level-123 hunter at item level 415 cannot reforge
before level 126 (item level 449); that is the answer the advisor needs instead
of a list of unrelated items.

    python3 tools/build_umschmieden.py
"""
import json
import sys
import xml.etree.ElementTree as ElementTree
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
LORE = Path('/Users/adrian/Developer/Lotro/companion/lotro-data/lore')
PROGRESSION = '1879422471'


def stufen() -> dict:
    pfad = LORE / 'progressions.xml'
    if not pfad.is_file():
        raise SystemExit('MISSING %s' % pfad)
    kurve = None
    for _, knoten in ElementTree.iterparse(pfad):
        if knoten.tag == 'arrayProgression' and knoten.get('identifier') == PROGRESSION:
            kurve = knoten
            break
    if kurve is None:
        raise SystemExit('Progression %s fehlt' % PROGRESSION)
    start = int(kurve.get('minX') or 1)
    werte = []
    for punkt in kurve.iter('point'):
        zahl = int(float(punkt.get('y')))
        werte.extend([zahl] * int(punkt.get('count') or 1))
    hoechste_stufe = 570
    spiel = LORE / 'game.xml'
    if spiel.is_file():
        parameter = ElementTree.parse(spiel).getroot()
        wert = parameter.get('maxLegendaryItemLevel') if parameter.tag == 'gameParameters' else None
        if wert:
            hoechste_stufe = int(wert)
    # Nur die Stufen mitnehmen, auf denen die Gegenstandsstufe wirklich steigt.
    steigend, letzte = [], None
    for nummer, gegenstandsstufe in enumerate(werte):
        if gegenstandsstufe != letzte:
            steigend.append([start + nummer, min(gegenstandsstufe, hoechste_stufe)])
            letzte = gegenstandsstufe
    return {'max': hoechste_stufe, 'stufen': steigend}


def main() -> int:
    daten = stufen()
    (WEB / 'umschmieden.js').write_text(
        '/* Written by build_umschmieden.py. Do not edit by hand. */\n'
        'window.MQL_UMSCHMIEDEN = %s;\n'
        % json.dumps(daten, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('Umschmieden: %d Stufen, höchste Gegenstandsstufe %d, %d Bytes'
          % (len(daten['stufen']), daten['max'], (WEB / 'umschmieden.js').stat().st_size))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
