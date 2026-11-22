#!/usr/bin/env python3
"""Trager-Voraussetzungen eines Gegenstands, aus dem Client-Katalog.

Eine Quelle, eine Form: `minLevel`, `requiredClass`, `requiredRace`,
`armourType`, `weaponType`, weitere Voraussetzung und Skalierung stehen in
`items.xml`. Wer sie braucht – Gegenstandssuche, Katalog, Belohnungen, Rezepte,
Sätze, Instanzbeute – holt sie hier, statt `items.xml` erneut zu deuten.

    from tools.gegenstand_anforderungen import lade
    req = lade(ITEM_LORE)['70052A0F']
    # {'ml': 120, 'wt': 'CROSSBOW', 'sc': 1}

Kurze Schlüssel, weil dieselbe Form im Browser an jeder Gegenstandszeile hängt:
`ml` Mindeststufe, `rk` Klassenbindung (mit `;` getrennt), `rr` Volksbindung,
`at` Rüstungsart, `wt` Waffenart, `ex` weitere Voraussetzung, `sc` skalierbar.
Fehlt ein Schlüssel, gilt die Voraussetzung als nicht vorhanden.
"""
from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path

# Diese Felder sperren einen Gegenstand zusätzlich, ohne dass der Client sagt,
# welche Stufe, Fraktion oder Tugend dahintersteht. Mehr als "prüfen" geht
# daraus nicht hervor.
WEITERE = ('requiredEffect', 'requiredFaction', 'requiredGloryRank',
           'requiredProfession', 'requiredTrait')

_ZWISCHENSPEICHER: dict[str, dict[str, dict]] = {}


def lade(pfad: Path) -> dict[str, dict]:
    """id (8 Hexziffern) -> Voraussetzungen. Leer, wenn der Katalog fehlt."""
    schluessel = str(pfad)
    if schluessel in _ZWISCHENSPEICHER:
        return _ZWISCHENSPEICHER[schluessel]
    ergebnis: dict[str, dict] = {}
    if not pfad.is_file():
        _ZWISCHENSPEICHER[schluessel] = ergebnis
        return ergebnis
    for eintrag in ET.parse(pfad).getroot().iter('item'):
        kennung = eintrag.get('key')
        if not kennung:
            continue
        try:
            ident = '%08X' % (int(kennung) & 0xffffffff)
        except ValueError:
            continue
        req: dict = {}
        try:
            stufe = int(eintrag.get('minLevel') or 0)
        except ValueError:
            stufe = 0
        if stufe > 0:
            req['ml'] = stufe
        for feld, kurz in (('requiredClass', 'rk'), ('requiredRace', 'rr'),
                           ('armourType', 'at'), ('weaponType', 'wt')):
            wert = (eintrag.get(feld) or '').strip()
            if wert:
                req[kurz] = wert
        if any((eintrag.get(feld) or '').strip() for feld in WEITERE):
            req['ex'] = 1
        if (eintrag.get('scaling') or '').strip():
            req['sc'] = 1
        ergebnis[ident] = req
    _ZWISCHENSPEICHER[schluessel] = ergebnis
    return ergebnis
