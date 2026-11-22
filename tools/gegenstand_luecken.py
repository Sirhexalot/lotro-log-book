#!/usr/bin/env python3
"""Which items exist in the game but not in our catalogue — and what proves them.

The website catalogue (`daten/items.json`) starts from the equipment file and
adds rewards, recipes, vendors and instance loot. The complete client export
holds every item the game knows. This tool does **not** add anything; it reports
the difference and names, per missing item, the evidential source that would
justify a page of its own: a recipe result, a recipe ingredient, a vendor, a
quest or deed reward, or a confirmed instance chest.

Nothing personal is read: item ids and names only, no character files.

    python3 tools/gegenstand_luecken.py
    python3 tools/gegenstand_luecken.py --ziel "$HOME/.cache/llb-luecken"
"""
import argparse
import json
import xml.etree.ElementTree as ElementTree
from collections import Counter
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
WEB = HIER / 'web'
SPRACHEN = ('de', 'en', 'fr')

# Dieselben Quellen, die auch build_items.py liest.
VOLL = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
            '/items-2026-11-08/items.json')
REZEPTE = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
               '/rezepte-2026-11-06/recipes.json')
VENDOR_ITEMS = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                    '/vendor-items-2026-11-08/vendor-items.json')
CLIENT_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion'
                   '/app/data/lore')
BARTERS = Path('/Users/adrian/Developer/Lotro/companion/lotro-data/lore/barters.xml')
# Der vollständige Bestand des Clients, unabhängig vom Website-Katalog.
CLIENT_ITEMS = Path('/Users/adrian/Developer/Lotro/companion/lotro-items-db/items.xml')


def js_datei(pfad: Path, variable: str):
    text = pfad.read_text(encoding='utf-8')
    treffer = text.find('window.' + variable)
    if treffer < 0:
        return None
    return json.JSONDecoder().raw_decode(text[text.index('=', treffer) + 1:].lstrip())[0]


def kennung(wert) -> str:
    """Eine Item-ID als achtstellige Kennung, wie überall auf der Website.

    Der vollständige Export und der Finder führen Kennungen bereits als Hex, der
    Client-Katalog und die Rezeptdaten als Zahl. Beides ergibt denselben Schlüssel.
    """
    if isinstance(wert, str):
        text = wert.strip().upper()
        if len(text) == 8 and all(zeichen in '0123456789ABCDEF' for zeichen in text):
            return text
    try:
        return '%08X' % (int(wert) & 0xffffffff)
    except (TypeError, ValueError):
        return ''


def client_daten() -> dict:
    """Aus dem Client-Katalog: Name (en), Kategorie, Platz, Mindeststufe."""
    if not CLIENT_ITEMS.is_file():
        return {}
    ergebnis = {}
    for _, eintrag in ElementTree.iterparse(CLIENT_ITEMS):
        if eintrag.tag != 'item':
            continue
        schluessel = kennung(eintrag.get('key'))
        if schluessel:
            ergebnis[schluessel] = {
                'name': eintrag.get('name') or '',
                'category': eintrag.get('category') or '',
                'slot': eintrag.get('slot') or '',
                'minLevel': int(eintrag.get('minLevel') or 0),
                'quality': eintrag.get('quality') or '',
            }
        eintrag.clear()
    return ergebnis


def nachweise() -> dict:
    """Pro Item-ID die belegten Bezüge, die eine eigene Seite rechtfertigen."""
    belege = {}

    def merke(ident, art, text):
        eintrag = belege.setdefault(ident, {})
        eintrag.setdefault(art, [])
        if text and text not in eintrag[art]:
            eintrag[art].append(text)

    if REZEPTE.is_file():
        rezepte = json.loads(REZEPTE.read_text(encoding='utf-8'))
        for rezept_id, zeile in (rezepte.get('items') or {}).items():
            merke(kennung(rezept_id), 'rezept', '')
        for rezept in rezepte.get('recipes') or []:
            name = rezept.get('n')
            if isinstance(name, dict):
                name = name.get('de') or name.get('en') or ''
            for feld in ('r', 'cr'):
                if rezept.get(feld) and rezept[feld][0]:
                    merke(kennung(rezept[feld][0]), 'rezept_ergebnis', name or '')
            for teil in (rezept.get('i') or []) + (rezept.get('o') or []):
                if teil and teil[0]:
                    merke(kennung(teil[0]), 'rezept_zutat', name or '')

    if VENDOR_ITEMS.is_file():
        haendler = json.loads(VENDOR_ITEMS.read_text(encoding='utf-8'))
        namen = haendler.get('vendors') or {}
        for iid, ids in (haendler.get('items') or {}).items():
            for vendor_id in ids:
                eintrag = namen.get(str(vendor_id).upper()) or {}
                name = eintrag.get('n')
                if isinstance(name, dict):
                    name = name.get('de') or name.get('en') or ''
                merke(kennung(iid), 'haendler', name or '')

    for sprache in SPRACHEN:
        daten = js_datei(WEB / ('belohnungen-%s.js' % sprache), 'MQL_BELOHNUNGEN')
        if not daten:
            continue
        for zeile in daten.get('g') or []:
            merke(kennung(zeile[0]), 'belohnung', '')

    # Tausch: das Empfangene ist der Gegenstand, das Gegebene die Währung.
    if BARTERS.is_file():
        for _, eintrag in ElementTree.iterparse(BARTERS):
            if eintrag.tag != 'receive':
                continue
            merke(kennung(eintrag.get('id')), 'tausch', eintrag.get('name') or '')
            eintrag.clear()
    return belege


def truhen() -> set:
    try:
        from instanzbeute_items import lade_beute, truhen_ids
    except ImportError:  # aufgerufen aus dem Wurzelverzeichnis
        import sys
        sys.path.insert(0, str(HIER))
        from instanzbeute_items import lade_beute, truhen_ids
    return truhen_ids(lade_beute())


def luecken() -> dict:
    katalog = json.loads((DATEN / 'items.json').read_text(encoding='utf-8'))['items']
    # Der sichtbare Katalog ist der Finder: seine Zeilen plus die Truhenfunde,
    # die er zusätzlich aufnimmt.
    finder = js_datei(WEB / 'gegenstaende-de.js', 'MQL_GEGENSTAENDE') or {}
    katalog_ids = {zeile[0] for zeile in finder.get('e') or []}
    katalog_ids |= set(finder.get('instanceChest') or [])
    if not katalog_ids:
        katalog_ids = set(katalog)
    voll = {}
    if VOLL.is_file():
        voll = {kennung(k): v for k, v in
                (json.loads(VOLL.read_text(encoding='utf-8')).get('items') or {}).items()}
    client = client_daten()
    belege = nachweise()
    kisten = truhen()

    # Wo der Website-Katalog eine ID nicht kennt, obwohl der Client sie hat.
    fehlend = sorted(set(client) - katalog_ids)
    eintraege = []
    for ident in fehlend:
        daten = client[ident]
        beleg = belege.get(ident) or {}
        if ident in kisten:
            beleg.setdefault('instanztruhe', [])
        name_de = ((voll.get(ident) or {}).get('n') or {}).get('de') or daten['name']
        eintraege.append({
            'id': ident,
            'name': name_de,
            'name_en': daten['name'],
            'kategorie': daten['category'],
            'platz': daten['slot'],
            'mindeststufe': daten['minLevel'],
            'qualitaet': daten['quality'],
            'belege': beleg,
        })
    # Nur Einträge mit wenigstens einem Beleg taugen für einen Finder-Eintrag;
    # der Rest bleibt Nachschlagebasis für angelegte Gegenstände.
    mit_beleg = [e for e in eintraege if e['belege']]
    return {
        'schema': 1,
        'katalog': len(katalog_ids),
        'client': len(client),
        'voll_export': len(voll),
        'fehlend': len(eintraege),
        'fehlend_mit_beleg': len(mit_beleg),
        'beleg_arten': dict(Counter(art for e in eintraege for art in e['belege'])),
        'katalog_nicht_im_client': sorted(katalog_ids - set(client))[:50],
        'eintraege': eintraege,
    }


def bericht(daten: dict, ziel: Path) -> None:
    ziel.mkdir(parents=True, exist_ok=True)
    (ziel / 'luecken.json').write_text(
        json.dumps(daten, ensure_ascii=False, indent=1), encoding='utf-8')
    mit_beleg = [e for e in daten['eintraege'] if e['belege']]
    zeilen = [
        '# Gegenstände im Client, aber nicht im Website-Katalog',
        '',
        'Katalog: %d · Client: %d · vollständiger Export: %d'
        % (daten['katalog'], daten['client'], daten['voll_export']),
        'Fehlend: %d · davon mit belegter Quelle: %d'
        % (daten['fehlend'], daten['fehlend_mit_beleg']),
        '',
        '## Belegarten (ein Gegenstand kann mehrere haben)',
        '',
    ]
    for art, anzahl in sorted(daten['beleg_arten'].items(), key=lambda p: -p[1]):
        zeilen.append('- %s: %d' % (art, anzahl))
    zeilen += ['', '## Fehlende Gegenstände mit Beleg (erste 200)', '',
               '| ID | Name | Kategorie | Platz | Mindeststufe | Belege |',
               '| --- | --- | --- | --- | --- | --- |']
    for eintrag in mit_beleg[:200]:
        zeilen.append('| %s | %s | %s | %s | %s | %s |' % (
            eintrag['id'], eintrag['name'], eintrag['kategorie'],
            eintrag['platz'] or '–', eintrag['mindeststufe'] or '–',
            ', '.join(sorted(eintrag['belege']))))
    (ziel / 'luecken.md').write_text('\n'.join(zeilen) + '\n', encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path,
                        default=Path.home() / '.cache' / 'llb-gegenstand-luecken')
    args = parser.parse_args()
    daten = luecken()
    bericht(daten, args.ziel)
    print('Katalog: %d Gegenstände' % daten['katalog'])
    print('Client:  %d Gegenstände' % daten['client'])
    print('Fehlend: %d, davon mit belegter Quelle: %d'
          % (daten['fehlend'], daten['fehlend_mit_beleg']))
    for art, anzahl in sorted(daten['beleg_arten'].items(), key=lambda p: -p[1]):
        print('  %-16s %d' % (art, anzahl))
    if daten['katalog_nicht_im_client']:
        print('Katalog-IDs ohne Client-Eintrag: %d (erste: %s)'
              % (len(daten['katalog_nicht_im_client']),
                 ', '.join(daten['katalog_nicht_im_client'][:5])))
    print('Bericht: %s' % (args.ziel / 'luecken.md'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
