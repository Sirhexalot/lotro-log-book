#!/usr/bin/env python3
"""Every item the game knows, as a lookup by id — not as a finder list.

The finder shows what a player can reach on purpose. This file holds the whole
client inventory so that a worn item can always be identified and compared, even
when it has no source of its own: account-bound gear, quest props, generic loot.

It is **not** loaded as a whole. `web/erkennung/` holds 256 shards by id, about
70 kB each; the advisor fetches only the shards it needs.

Sources: the client catalogue (`items.xml`) for category, slot, quality, levels,
damage type and requirements; the full item export for localised names, icons
and descriptions. Nothing personal is read.

    python3 tools/build_gegenstand_erkennung.py
    python3 tools/build_gegenstand_erkennung.py --pruefen
"""
import argparse
import json
import sys
import xml.etree.ElementTree as ElementTree
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))

from itemnamen import sauberer_name  # noqa: E402  (repository root on the path)

WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')

CLIENT_ITEMS = Path('/Users/adrian/Developer/Lotro/companion/lotro-items-db/items.xml')
VOLL = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
            '/items-2026-11-08/items.json')
FINDER = WEB / 'gegenstaende-de.js'
SCHARDEN = WEB / 'erkennung'
ZIEL = DATEN / 'gegenstand-erkennung.json'


def kennung(wert) -> str:
    """Eine Item-ID als achtstellige Kennung.

    Der vollständige Export und der Finder führen Kennungen bereits als Hex,
    der Client-Katalog als Zahl. Beides muss denselben Schlüssel ergeben.
    """
    if isinstance(wert, str):
        text = wert.strip().upper()
        if len(text) == 8 and all(zeichen in '0123456789ABCDEF' for zeichen in text):
            return text
    try:
        return '%08X' % (int(wert) & 0xffffffff)
    except (TypeError, ValueError):
        return ''


def finder_ids() -> set:
    if not FINDER.is_file():
        return set()
    text = FINDER.read_text(encoding='utf-8')
    daten = json.loads(text[text.index('=') + 1:text.rindex(';')])
    return {zeile[0] for zeile in daten['e']} | set(daten.get('instanceChest') or [])


def client_fakten() -> dict:
    """Kategorie, Platz, Qualität, Stufen, Schadensart, Voraussetzungen."""
    if not CLIENT_ITEMS.is_file():
        raise SystemExit('MISSING %s' % CLIENT_ITEMS)
    fakten = {}
    for _, eintrag in ElementTree.iterparse(CLIENT_ITEMS):
        if eintrag.tag != 'item':
            continue
        ident = kennung(eintrag.get('key'))
        if not ident:
            eintrag.clear()
            continue
        fakten[ident] = {
            'name': eintrag.get('name') or '',
            'kat': eintrag.get('category') or '',
            'slot': eintrag.get('slot') or '',
            'q': eintrag.get('quality') or '',
            'l': int(eintrag.get('level') or 0),
            'ml': int(eintrag.get('minLevel') or 0),
            'dt': eintrag.get('damageType') or '',
            'sc': bool((eintrag.get('scaling') or '').strip()),
            'rk': eintrag.get('requiredClass') or '',
            'rr': eintrag.get('requiredRace') or '',
            'at': eintrag.get('armourType') or '',
            'wt': eintrag.get('weaponType') or '',
        }
        eintrag.clear()
    return fakten


def namen() -> dict:
    """Lokalisierte Namen, Symbole und Beschreibungen aus dem vollständigen Export."""
    if not VOLL.is_file():
        return {}
    roh = json.loads(VOLL.read_text(encoding='utf-8')).get('items') or {}
    ergebnis = {}
    for ident, eintrag in roh.items():
        schluessel = kennung(ident)
        if not schluessel:
            continue
        sauber = {}
        for sprache in SPRACHEN:
            name = sauberer_name((eintrag.get('n') or {}).get(sprache)
                                 or (eintrag.get('n') or {}).get('en') or '', sprache)
            if name:
                sauber[sprache] = name
        if not sauber:
            continue
        daten = {'n': sauber}
        if eintrag.get('ic'):
            daten['ic'] = int(eintrag['ic'])
        beschreibung = {}
        for sprache in SPRACHEN:
            text = (eintrag.get('d') or {}).get(sprache)
            if text:
                beschreibung[sprache] = sauberer_name(text, sprache)
        if beschreibung:
            daten['besch'] = beschreibung
        ergebnis[schluessel] = daten
    return ergebnis


def katalog_ergaenzung() -> dict:
    """Kennungen, die nur unser Katalog kennt (etwa neue Truhenfunde).

    Sie gehören ebenfalls in die Erkennung: was der Finder zeigt, muss
    nachschlagbar sein. Quellen sind unsere eigenen Katalogdaten.
    """
    pfad = DATEN / 'items.json'
    if not pfad.is_file():
        return {}
    items = json.loads(pfad.read_text(encoding='utf-8'))['items']
    ergebnis = {}
    for ident, eintrag in items.items():
        namen_des_stuecks = eintrag.get('n') or {}
        if not namen_des_stuecks:
            continue
        ergebnis[kennung(ident)] = {
            'n': {sprache: name for sprache, name in namen_des_stuecks.items() if name},
            'kat': eintrag.get('kat') or '',
            'slot': eintrag.get('slot') or '',
            'q': eintrag.get('q') or '',
            'l': int(eintrag.get('l') or 0),
            'ml': int(eintrag.get('ml') or 0),
            'dt': eintrag.get('dt') or '',
            'sc': False,
            'rk': '', 'rr': '', 'at': '', 'wt': '',
        }
    return ergebnis


def baue() -> dict:
    fakten = client_fakten()
    texte = namen()
    eintraege = {}
    for ident, daten in fakten.items():
        text = texte.get(ident) or {}
        eintrag = dict(daten)
        if text.get('n'):
            eintrag['n'] = text['n']
        if text.get('ic'):
            eintrag['ic'] = text['ic']
        if text.get('besch'):
            eintrag['besch'] = text['besch']
        # Ohne jeden Namen ist ein Eintrag nicht nachschlagbar.
        if not eintrag.get('n'):
            continue
        eintraege[ident] = eintrag
    # Was nur unser Katalog kennt, ergänzt den Bestand.
    for ident, daten in katalog_ergaenzung().items():
        eintraege.setdefault(ident, daten)
    return eintraege


def schreibe_scharden(eintraege: dict, ziel: Path) -> int:
    """Teilladungen je Sprache nach den letzten drei Stellen der Kennung.

    Feine Teile, weil der Ratgeber nur die getragenen Stücke braucht: 4.096
    Gruppen zu rund 5 kB statt 256 zu 77 kB. Eine Seite kennt ihre Sprache; drei
    Namen im Payload wären die doppelte Last. Beschreibungen bleiben in der
    Datei, die Teilladungen tragen nur, was ein Vergleich braucht.
    """
    if ziel.exists():
        for alt in ziel.rglob('*.js'):
            alt.unlink()
    dateien = 0
    for sprache in SPRACHEN:
        ordner = ziel / sprache
        ordner.mkdir(parents=True, exist_ok=True)
        gruppen = {}
        for ident, eintrag in eintraege.items():
            namen_des_stuecks = eintrag.get('n') or {}
            name = namen_des_stuecks.get(sprache) or namen_des_stuecks.get('en')
            if not name:
                continue
            leicht = {'n': name}
            for schluessel in ('kat', 'slot', 'q', 'l', 'ml', 'dt', 'sc', 'rk', 'rr', 'at', 'wt', 'ic'):
                if eintrag.get(schluessel):
                    leicht[schluessel] = eintrag[schluessel]
            gruppen.setdefault(ident[5:8], {})[ident] = leicht
        for praefix, teil in gruppen.items():
            text = ('/* Generated by build_gegenstand_erkennung.py. Do not edit by hand. */\n'
                    'window.MQL_ERKENNUNG = window.MQL_ERKENNUNG || {};\n'
                    'window.MQL_ERKENNUNG["%s"] = %s;\n'
                    % (praefix, json.dumps(teil, ensure_ascii=False, separators=(',', ':'))))
            (ordner / ('%s.js' % praefix)).write_text(text, encoding='utf-8')
            dateien += 1
    return dateien


def main() -> int:
    optionen = argparse.ArgumentParser(description=__doc__,
                                       formatter_class=argparse.RawDescriptionHelpFormatter)
    optionen.add_argument('--pruefen', action='store_true',
                          help='nur prüfen, nichts schreiben')
    args = optionen.parse_args()

    eintraege = baue()
    bekannt = finder_ids()
    fehlend = sorted(bekannt - set(eintraege))
    mit_name = sum(1 for e in eintraege.values() if e.get('n', {}).get('de'))
    mit_symbol = sum(1 for e in eintraege.values() if e.get('ic'))
    print('Erkennung: %d Gegenstände, %d mit deutschem Namen, %d mit Symbol'
          % (len(eintraege), mit_name, mit_symbol))
    print('Finder-IDs im Bestand: %d von %d' % (len(bekannt & set(eintraege)), len(bekannt)))
    if fehlend:
        print('FEHLT im Bestand: %s' % ', '.join(fehlend[:10]))
    if args.pruefen:
        return 1 if fehlend else 0

    DATEN.mkdir(exist_ok=True)
    ZIEL.write_text(json.dumps({'schema': 1, 'items': eintraege},
                               ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    scharden = schreibe_scharden(eintraege, SCHARDEN)
    print('Datei: %s (%.1f MB)' % (ZIEL.relative_to(HIER), ZIEL.stat().st_size / 1048576))
    print('Teilladungen: %d in %s' % (scharden, SCHARDEN.relative_to(HIER)))
    return 1 if fehlend else 0


if __name__ == '__main__':
    raise SystemExit(main())
