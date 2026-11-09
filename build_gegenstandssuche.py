#!/usr/bin/env python3
"""One compact search file per language for the item browser.

The item pages stay as they are; this file only carries what a shop-like list
needs: id, name, symbol, category, quality, slot, armour/weapon type and level.
Filter values are numbers into small label arrays so a language file stays
small; nothing is guessed, unknown values stay empty.

    python3 build_gegenstandssuche.py
"""
import json
import re
from pathlib import Path

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')

QUALITY = {'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'INCOMPARABLE': 4, 'LEGENDARY': 5}
# Die Gegenstandsarten des Clients, nicht nur die drei der Ausrüstungsdatei:
# legendäre Waffen und Gegenstände sowie Essenzen sind eigene Arten.
KATEGORIEN = ('ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM', 'ESSENCE', 'ITEM')
KATEGORIE_LABEL = {
    'de': {'ARMOUR': 'Rüstung', 'WEAPON': 'Waffe', 'LEGENDARY_WEAPON': 'Legendäre Waffe',
           'LEGENDARY_ITEM': 'Legendärer Gegenstand', 'ESSENCE': 'Essenz', 'ITEM': 'Sonstiges'},
    'en': {'ARMOUR': 'Armour', 'WEAPON': 'Weapon', 'LEGENDARY_WEAPON': 'Legendary weapon',
           'LEGENDARY_ITEM': 'Legendary item', 'ESSENCE': 'Essence', 'ITEM': 'Other'},
    'fr': {'ARMOUR': 'Armure', 'WEAPON': 'Arme', 'LEGENDARY_WEAPON': 'Arme légendaire',
           'LEGENDARY_ITEM': 'Objet légendaire', 'ESSENCE': 'Essence', 'ITEM': 'Divers'},
}
# Zwei Schreibweisen derselben Art (Stufe 100 aufwärts) gehören zusammen.
KATEGORIE_ALIAS = {'LEGENDARY_WEAPON2': 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM2': 'LEGENDARY_ITEM',
                   'CARRY_ALL': 'ITEM'}

# Der Client-Export kennt die Art jedes Gegenstands; die Ausrüstungsdatei nur
# Rüstung, Waffe und den Rest.
EXPORT_ITEMS = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                    '/items-2026-11-08/items.json')


def roh_arten() -> dict:
    if not EXPORT_ITEMS.is_file():
        return {}
    daten = json.loads(EXPORT_ITEMS.read_text(encoding='utf-8')).get('items') or {}
    return {str(ident): (eintrag.get('c') or '') for ident, eintrag in daten.items()}


def klare_name(text):
    """Item names still carry export markers: \\q for quotes, [n]/[i] tags."""
    text = str(text or '').replace('\\q', '"')
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


def qualitaet(wert):
    if isinstance(wert, int):
        return wert if 1 <= wert <= 5 else 0
    if wert in (None, ''):
        return 0
    if isinstance(wert, str) and wert.isdigit():
        zahl = int(wert)
        return zahl if 1 <= zahl <= 5 else 0
    return QUALITY.get(str(wert).upper(), 0)


def sprache_datei(sprache, items, typen):
    namen = typen['slot'].get(sprache) or {}
    kategorien = [KATEGORIE_LABEL[sprache].get(k, k) for k in KATEGORIEN]
    arten_roh = roh_arten()
    ruestung = typen['armour'].get(sprache) or {}
    waffen = typen['weapon'].get(sprache) or {}

    plaetze, platz_index = [], {}
    arten, art_index = [], {}
    eintraege = []
    for ident, item in items.items():
        name = klare_name((item.get('n') or {}).get(sprache)
                          or (item.get('n') or {}).get('en') or '')
        if not name:
            continue
        kat = (arten_roh.get(ident) or item.get('kat') or '').upper()
        kat = KATEGORIE_ALIAS.get(kat, kat)
        kat = KATEGORIEN.index(kat) if kat in KATEGORIEN else -1
        platz = (item.get('slot') or '').strip()
        platz = ' '.join(platz.split())
        # Right-hand and left-hand jewellery share one label; two entries for
        # "Finger" would split the same thing.
        for seite in ('RIGHT_', 'LEFT_'):
            if platz.startswith(seite):
                platz = platz[len(seite):]
        platz_id = -1
        # Also for plain items: jewellery and the like are only told apart by
        # their slot, and that is what people filter for.
        if platz and kat >= 0:
            if platz not in platz_index:
                platz_index[platz] = len(plaetze)
                plaetze.append(namen.get(platz) or platz.replace('_', ' ').title())
            platz_id = platz_index[platz]
        art = (item.get('sub') or '').strip()
        art_id = -1
        if art and kat in (0, 1):
            quelle = ruestung if kat == 0 else waffen
            if art not in art_index:
                art_index[art] = len(arten)
                arten.append(quelle.get(art) or art.replace('_', ' ').title())
            art_id = art_index[art]
        stufe = item.get('l')
        if not isinstance(stufe, int) or stufe <= 0:
            stufe = 0
        eintraege.append([ident, name, item.get('ic') or 0, kat, qualitaet(item.get('q')),
                          platz_id, art_id, stufe])

    eintraege.sort(key=lambda zeile: (zeile[1].casefold(), zeile[0]))
    daten = {
        'sprache': sprache,
        'kat': kategorien,
        'katKey': list(KATEGORIEN),
        'platz': plaetze,
        'art': arten,
        # Keys let a catalogue page link straight to "Alle Helme" without
        # depending on the label text of a language.
        'platzKey': list(platz_index),
        'artKey': list(art_index),
        'e': eintraege,
    }
    text = ('/* Generated by build_gegenstandssuche.py. Do not edit by hand. */\n'
            'window.MQL_GEGENSTAENDE = %s;\n' % json.dumps(daten, ensure_ascii=False,
                                                           separators=(',', ':')))
    (WEB / ('gegenstaende-%s.js' % sprache)).write_text(text, encoding='utf-8')
    return len(eintraege), (WEB / ('gegenstaende-%s.js' % sprache)).stat().st_size


def main():
    items = json.loads((DATEN / 'items.json').read_text(encoding='utf-8'))['items']
    typen = json.loads((DATEN / 'gegenstand-typen.json').read_text(encoding='utf-8'))
    for sprache in SPRACHEN:
        anzahl, groesse = sprache_datei(sprache, items, typen)
        print('%s: %d Gegenstände, %.1f MB' % (sprache, anzahl, groesse / 1048576.0))


if __name__ == '__main__':
    main()
