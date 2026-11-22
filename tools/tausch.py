#!/usr/bin/env python3
"""Tauschhändler und ihre Angebote aus `barters.xml`.

Die Datei ist flach: `<barterers>` enthält die Händler mit Verweisen auf
Profil-IDs und daneben die Profildefinitionen mit den eigentlichen Angeboten.
Ein Profil hängt an mehreren Händlern desselben Berufs, die Angebote stehen
deshalb einmal am Profil und nicht an jedem Händler.

Das Empfangene ist der Gegenstand, das Gegebene der Preis. Preise sind
Währungen und Tauschwaren, die im Gegenstandskatalog nicht vorkommen; ihre
Namen in DE/EN/FR stehen in den Client-Labels. Auch die Profilnamen sind dort
übersetzt (`labels/<sprache>/barterers.xml`), sonst stünde „Minor Class Items“
auf einer deutschen Seite.

    python3 tools/tausch.py              # schreibt daten/tausch.json
    python3 tools/tausch.py --still      # nur Bericht, nichts schreiben
"""
from __future__ import annotations

import argparse
import json
import xml.etree.ElementTree as ElementTree
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
QUELLE = Path('/Users/adrian/Developer/Lotro/companion/lotro-data/lore/barters.xml')
LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion'
            '/app/data/lore')
SPRACHEN = ('de', 'en', 'fr')


def kennung(roh) -> str:
    """Eine Spiel-ID als achtstellige Kennung, wie überall auf der Website."""
    try:
        return '%08X' % (int(roh) & 0xffffffff)
    except (TypeError, ValueError):
        return ''


def menge(roh) -> int:
    try:
        wert = int(roh or 1)
    except (TypeError, ValueError):
        return 1
    return wert if wert > 0 else 1


def seite(knoten, tag: str, feld: str = 'id') -> list:
    """Die Gegenstände einer Seite des Angebots als [Kennung, Menge]."""
    rows = []
    for eintrag in knoten.findall(tag):
        ident = kennung(eintrag.get(feld))
        if ident:
            rows.append([ident, menge(eintrag.get('quantity'))])
    return rows


def angebot(knoten) -> dict:
    """Ein `<barterEntry>`: Preis, Ware und – selten – Ruf statt Ware."""
    daten = {'give': seite(knoten, 'give'), 'receive': seite(knoten, 'receive')}
    ruf = seite(knoten, 'receiveReputation', 'factionId')
    if ruf:
        daten['reputation'] = ruf
    return daten


def lies(quelle: Path) -> tuple[dict, dict]:
    """Händler und Profile aus der XML-Datei.

    Ein Profil kommt zweimal vor: als Definition mit Angeboten und als leerer
    Verweis im Händler. Unterschieden wird an den Kindknoten, nicht am Namen –
    392 Profile tragen keinen Namen und sind trotzdem gültig.
    """
    haendler, profile = {}, {}
    for _, knoten in ElementTree.iterparse(quelle):
        if knoten.tag == 'barterProfile':
            if len(knoten):
                ident = kennung(knoten.get('profileId'))
                if ident:
                    profile[ident] = {
                        'name': (knoten.get('name') or '').strip(),
                        'offers': [angebot(eintrag)
                                   for eintrag in knoten.findall('barterEntry')],
                    }
                knoten.clear()
        elif knoten.tag == 'barterer':
            ident = kennung(knoten.get('id'))
            if ident:
                haendler[ident] = {
                    'name': (knoten.get('name') or '').strip(),
                    'title': (knoten.get('title') or '').strip(),
                    'class': (knoten.get('requiredClass') or '').strip(),
                    'profiles': [kennung(p.get('profileId'))
                                 for p in knoten.iter('barterProfile') if p.get('profileId')],
                }
            knoten.clear()
    return haendler, profile


def texte(datei: Path) -> dict:
    """Kennung → Text aus einer Label-Datei des Clients."""
    if not datei.is_file():
        return {}
    ergebnis = {}
    for _, knoten in ElementTree.iterparse(datei):
        if knoten.tag != 'label':
            continue
        ident = kennung(knoten.get('key'))
        if ident and knoten.get('value'):
            ergebnis[ident] = knoten.get('value').strip()
        knoten.clear()
    return ergebnis


def namen(ids: set[str], lore: Path = LORE) -> dict:
    """DE/EN/FR-Namen der Preis-Gegenstände aus den Client-Labels."""
    ergebnis = {ident: {} for ident in ids}
    for sprache in SPRACHEN:
        datei = lore / 'labels' / sprache / 'items.xml'
        if not datei.is_file():
            continue
        for ident, text in texte(datei).items():
            if ident in ergebnis:
                ergebnis[ident][sprache] = text
    return ergebnis


def profilnamen(profile: dict, lore: Path = LORE) -> None:
    """Ersetzt den englischen Profilnamen durch die drei Sprachfassungen.

    Fehlt eine Übersetzung, bleibt die deutsche Seite leer statt englisch: die
    Quelle ist ein englischer Entwicklername, keine Anzeige für Spieler.
    """
    uebersetzt = {}
    for sprache in SPRACHEN:
        for ident, text in texte(lore / 'labels' / sprache / 'barterers.xml').items():
            uebersetzt.setdefault(ident, {})[sprache] = text
    for ident, profil in profile.items():
        roh = profil.get('name') or ''
        texte_ = uebersetzt.get(ident) or {}
        profil['name'] = {sprache: texte_.get(sprache) or (roh if sprache == 'en' else '')
                          for sprache in SPRACHEN}


def baue(quelle: Path = QUELLE, lore: Path = LORE) -> dict:
    """Der Tauschbestand als eine Datei für Händler- und Gegenstandsseiten."""
    haendler, profile = lies(quelle)
    profilnamen(profile, lore)
    preise = {ident for profil in profile.values()
              for angebot_ in profil['offers'] for ident, _ in angebot_['give']}
    return {
        'schema': 1,
        'vendors': haendler,
        'profiles': profile,
        'names': namen(preise, lore),
    }


def bericht(daten: dict) -> str:
    angebote = [a for p in daten['profiles'].values() for a in p['offers']]
    waren = {ident for a in angebote for ident, _ in a['receive']}
    preise = {ident for a in angebote for ident, _ in a['give']}
    offen = [ident for ident, texte in daten['names'].items()
             if not all(texte.get(s) for s in SPRACHEN)]
    ohne_name = [ident for ident, p in daten['profiles'].items() if not p['name']['de']]
    return '\n'.join([
        'Händler: %d · Profile: %d · Angebote: %d'
        % (len(daten['vendors']), len(daten['profiles']), len(angebote)),
        'Waren: %d · Preise: %d · davon ohne vollständigen Namen: %d'
        % (len(waren), len(preise), len(offen)),
        'Profile ohne deutschen Namen: %d' % len(ohne_name),
        'Angebote ohne Ware: %d · mit Ruf statt Ware: %d'
        % (sum(1 for a in angebote if not a['receive']),
           sum(1 for a in angebote if a.get('reputation'))),
    ])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--quelle', type=Path, default=QUELLE)
    parser.add_argument('--lore', type=Path, default=LORE)
    parser.add_argument('--ziel', type=Path, default=DATEN / 'tausch.json')
    parser.add_argument('--still', action='store_true')
    optionen = parser.parse_args()
    if not optionen.quelle.is_file():
        raise SystemExit('MISSING %s' % optionen.quelle)

    daten = baue(optionen.quelle, optionen.lore)
    print(bericht(daten))
    if not optionen.still:
        optionen.ziel.parent.mkdir(parents=True, exist_ok=True)
        optionen.ziel.write_text(
            json.dumps(daten, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8')
        print('Geschrieben: %s (%.1f MiB)' % (
            optionen.ziel, optionen.ziel.stat().st_size / 1048576))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
