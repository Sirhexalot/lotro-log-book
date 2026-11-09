#!/usr/bin/env python3
"""One compact search file per language for the item browser.

The item pages stay as they are; this file only carries what a shop-like list
needs: id, name, symbol, category, quality, slot, type and level. Filter values
are numbers into small label arrays so a language file stays small; nothing is
guessed, unknown values stay empty.

Category, slot and type come from the client item export, not from the older
equipment file: the client knows legendary weapons, legendary items and essences
as their own kinds, and it names each item's class and equipment category. Those
two enums are what the game itself calls "Geschmeide" or "Ring", so the browser
groups by the game's words instead of inventing buckets.

    python3 build_gegenstandssuche.py
"""
import html
import json
import xml.etree.ElementTree as ElementTree
from pathlib import Path

from itemnamen import sauberer_name

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')

QUALITY = {'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'INCOMPARABLE': 4, 'LEGENDARY': 5}
# Die Gegenstandsarten des Clients, nicht nur die drei der Ausrüstungsdatei:
# legendäre Waffen und Gegenstände sowie Essenzen sind eigene Arten. Schmuck
# ("Geschmeide") ist keine eigene Art im Export, sondern die ItemClass 49 –
# 14.016 Gegenstände, die sonst unter "Sonstiges" verschwinden.
KATEGORIEN = ('ARMOUR', 'WEAPON', 'LEGENDARY_WEAPON', 'LEGENDARY_ITEM', 'ESSENCE', 'ITEM', 'JEWELLERY')
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
# Die Gegenstandsklassen und Ausrüstungskategorien des Clients, samt ihren
# übersetzten Namen. Dieselbe Quelle wie der Export, nur ungekürzt.
CLIENT_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion'
                   '/app/data/lore')
SCHMUCK_KLASSE = '49'


def roh_export() -> dict:
    if not EXPORT_ITEMS.is_file():
        return {}
    daten = json.loads(EXPORT_ITEMS.read_text(encoding='utf-8')).get('items') or {}
    return {str(ident): eintrag for ident, eintrag in daten.items()}


def roh_klassen() -> dict:
    """id -> ItemClass-Code und EquipmentCategory-Code aus dem Client-Katalog."""
    pfad = CLIENT_LORE / 'items.xml'
    if not pfad.is_file():
        return {}
    ergebnis = {}
    for eintrag in ElementTree.parse(pfad).getroot().iter('item'):
        schluessel = eintrag.get('key')
        if not schluessel:
            continue
        ergebnis['%08X' % (int(schluessel) & 0xffffffff)] = {
            'klasse': eintrag.get('class') or '',
            'gattung': eintrag.get('equipmentCategory') or '',
        }
    return ergebnis


def enum_namen(name: str) -> dict:
    """Code -> {Sprache: Name} aus einem Client-Enum samt seinen Labeldateien."""
    codes = {}
    pfad = CLIENT_LORE / 'enums' / ('%s.xml' % name)
    if not pfad.is_file():
        return codes
    for eintrag in ElementTree.parse(pfad).getroot().iter('entry'):
        code = eintrag.get('code')
        if code is not None:
            codes[code] = {}
    for sprache in SPRACHEN:
        label_pfad = CLIENT_LORE / 'labels' / sprache / ('enum-%s.xml' % name)
        if not label_pfad.is_file():
            continue
        labels = {k.get('key'): html.unescape(k.get('value') or '')
                  for k in ElementTree.parse(label_pfad).getroot().iter('label')}
        for eintrag in ElementTree.parse(pfad).getroot().iter('entry'):
            code = eintrag.get('code')
            if code is None:
                continue
            wert = labels.get(eintrag.get('name') or '')
            if wert:
                codes[code][sprache] = wert.strip()
    return codes


def qualitaet(wert):
    if isinstance(wert, int):
        return wert if 1 <= wert <= 5 else 0
    if wert in (None, ''):
        return 0
    if isinstance(wert, str) and wert.isdigit():
        zahl = int(wert)
        return zahl if 1 <= zahl <= 5 else 0
    return QUALITY.get(str(wert).upper(), 0)


def sprache_datei(sprache, items, typen, roh, klassen, klasse_namen, gattung_namen):
    namen = typen['slot'].get(sprache) or {}
    ruestung = typen['armour'].get(sprache) or {}
    waffen = typen['weapon'].get(sprache) or {}

    # Klassen und Gattungen in der Reihenfolge des Client-Enums: derselbe Index
    # bedeutet in jeder Sprache dieselbe Sache, ein Link bleibt also gültig.
    klasse_liste = [klasse_namen[code].get(sprache) or klasse_namen[code].get('en') or ''
                    for code in klasse_namen]
    klasse_index = {code: nummer for nummer, code in enumerate(klasse_namen)}
    gattung_liste = [gattung_namen[code].get(sprache) or gattung_namen[code].get('en') or ''
                     for code in gattung_namen]
    gattung_index = {code: nummer for nummer, code in enumerate(gattung_namen)}

    KAT = {name: KATEGORIEN.index(name) for name in KATEGORIEN}
    schmuck = klasse_index.get(SCHMUCK_KLASSE, -1)
    kategorien = []
    for schluessel in KATEGORIEN:
        if schluessel == 'JEWELLERY':
            kategorien.append(klasse_liste[schmuck] if schmuck >= 0 else '')
        else:
            kategorien.append(KATEGORIE_LABEL[sprache].get(schluessel, schluessel))

    plaetze, platz_index = [], {}
    arten, art_index = [], {}
    eintraege = []
    for ident, item in items.items():
        quelle = roh.get(ident) or {}
        klasse_code = (klassen.get(ident) or {}).get('klasse') or ''
        gattung_code = (klassen.get(ident) or {}).get('gattung') or ''

        name = sauberer_name((quelle.get('n') or {}).get(sprache)
                             or (item.get('n') or {}).get(sprache)
                             or (quelle.get('n') or {}).get('en')
                             or (item.get('n') or {}).get('en') or '', sprache)
        if not name:
            continue

        kat = (quelle.get('c') or item.get('kat') or '').upper()
        kat = KATEGORIE_ALIAS.get(kat, kat)
        if kat == 'ITEM' and klasse_code == SCHMUCK_KLASSE:
            kat = 'JEWELLERY'
        kat = KATEGORIEN.index(kat) if kat in KATEGORIEN else -1
        if kat < 0:
            continue

        platz = (quelle.get('s') or item.get('slot') or '').strip()
        platz = ' '.join(platz.split())
        # Right-hand and left-hand jewellery share one label; two entries for
        # "Finger" would split the same thing.
        for seite in ('RIGHT_', 'LEFT_'):
            if platz.startswith(seite):
                platz = platz[len(seite):]
        platz_id = -1
        # Every kind carries its slot, not only armour and weapons: jewellery
        # and cosmetic gear are told apart by it.
        if platz:
            if platz not in platz_index:
                platz_index[platz] = len(plaetze)
                plaetze.append(namen.get(platz) or platz.replace('_', ' ').title())
            platz_id = platz_index[platz]

        art = ''
        if kat == KAT['ARMOUR']:
            art = (quelle.get('at') or item.get('sub') or '').strip()
            art_quelle = ruestung
        elif kat in (KAT['WEAPON'], KAT['LEGENDARY_WEAPON']):
            art = (quelle.get('wt') or item.get('sub') or '').strip()
            art_quelle = waffen
        else:
            art_quelle = {}
        art_id = -1
        if art and art_quelle is not None:
            if art not in art_index:
                art_index[art] = len(arten)
                arten.append(art_quelle.get(art) or art.replace('_', ' ').title())
            art_id = art_index[art]

        klasse_id = klasse_index.get(klasse_code, -1) if kat == KAT['ITEM'] else -1
        gattung_id = gattung_index.get(gattung_code, -1) if kat == KAT['JEWELLERY'] else -1

        stufe = quelle.get('l')
        if not isinstance(stufe, int):
            stufe = item.get('l')
        if not isinstance(stufe, int) or stufe <= 0:
            stufe = 0

        eintraege.append([ident, name, quelle.get('ic') or item.get('ic') or 0, kat,
                          qualitaet(quelle.get('q') or item.get('q')),
                          platz_id, art_id, stufe, klasse_id, gattung_id])

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
        'klasse': klasse_liste,
        'klasseKey': list(klasse_index),
        'gattung': gattung_liste,
        'gattungKey': list(gattung_index),
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
    roh = roh_export()
    klassen = roh_klassen()
    klasse_namen = enum_namen('ItemClass')
    gattung_namen = enum_namen('EquipmentCategory')
    # Ohne die Klassen aus dem Client fiele Schmuck zurück in "Sonstiges" und
    # die Gruppen wären still falsch. Lieber abbrechen als das ausliefern.
    if roh and not (klassen and klasse_namen and gattung_namen):
        raise SystemExit('Client-Katalog unvollständig: items.xml, enums/ItemClass.xml und '
                         'enums/EquipmentCategory.xml unter %s erwartet.' % CLIENT_LORE)
    for sprache in SPRACHEN:
        anzahl, groesse = sprache_datei(sprache, items, typen, roh, klassen,
                                        klasse_namen, gattung_namen)
        print('%s: %d Gegenstände, %.1f MB' % (sprache, anzahl, groesse / 1048576.0))


if __name__ == '__main__':
    main()
