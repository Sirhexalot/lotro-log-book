#!/usr/bin/env python3
"""One compact search file per language for the item browser.

The item pages stay as they are; this file only carries what a shop-like list
needs: id, name, symbol, category, quality, slot, type, level, class/race,
minimum level and further conditions for the class profile. Filter values
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
import re
import xml.etree.ElementTree as ElementTree
from pathlib import Path
from tools.sortierung import schluessel

from itemnamen import sauberer_name
from instanzbeute_items import beute_ergaenzen, lade_beute, truhen_ids

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
KLASSENWERKZEUG_KLASSEN = {
    'Weapon Oils', 'Trap', 'Potion', 'Healing Potion', 'Food', 'Thrown',
    'Weapon Auras', 'Instrument', 'Socketed Instrument',
    'Shield-spikes', 'Champion Horns', 'Word of Mastery', 'Mariner Items',
}

# Bündel im „Sonstigen“. Der Client kennt 209 Item-Klassen und keine gröbere
# Ebene; diese zehn Bündel sind unsere Ordnung darüber. Zugeordnet wird über den
# englischen Klassennamen des Clients – der ist sprachunabhängig stabil, die
# deutschen Namen sind Übersetzungen. Die genaue Klasse bleibt darunter sichtbar.
# Reihenfolge = Anzeigereihenfolge.
BUENDEL = (
    ('tracery', {'de': 'Legendäre Schrift', 'en': 'Legendary traceries',
                 'fr': 'Joyaux légendaires'},
     ('word of ', 'tracery')),
    ('crafting', {'de': 'Handwerk', 'en': 'Trade goods', 'fr': 'Artisanat'},
     ('craft:', 'craft ', 'ingredient', 'component', 'resource', 'tool', 'recipe')),
    ('housing', {'de': 'Haus und Einrichtung', 'en': 'Housing', 'fr': 'Logement'},
     ('home:', 'housing', 'furniture', 'wall', 'yard', 'structural', 'paints')),
    ('consume', {'de': 'Verbrauch und Aufwertung',
                 'en': 'Consumables and upgrades', 'fr': 'Consommables et améliorations'},
     ('food', 'potion', 'healing', 'oil', 'scroll', 'torch', 'pipeweed', 'firework',
      'festival', 'consumable')),
    ('cosmetic', {'de': 'Kleidung und Kosmetik', 'en': 'Clothing and cosmetics',
                  'fr': 'Vêtements et cosmétiques'},
     ('outfit:', 'clothing', 'cosmetic', 'dye')),
    ('class_tool', {'de': 'Klassenwerkzeug', 'en': 'Class items',
                    'fr': 'Objets de classe'},
     ('class items', 'instrument', 'banner', 'pennant', 'trap', 'thrown')),
    ('quest', {'de': 'Aufgabe und Zugang', 'en': 'Quest and access',
               'fr': 'Quête et accès'},
     ('quest', 'key')),
    ('currency', {'de': 'Tauschwährung', 'en': 'Barter currency',
                  'fr': 'Monnaie d’échange'},
     ('barter', 'exchange')),
    ('mount', {'de': 'Reittiere', 'en': 'Mounts', 'fr': 'Montures'},
     ('mount', 'bridle')),
    ('trophy', {'de': 'Trophäen und Sammeln', 'en': 'Trophies and collectibles',
                'fr': 'Trophées et collections'},
     ('trophy', 'collect', 'relic', 'treasure')),
    ('rest', {'de': 'Ohne Zuordnung', 'en': 'Unassigned', 'fr': 'Non classé'},
     ()),
)
BUENDEL_REIHENFOLGE = [eintrag[0] for eintrag in BUENDEL]


def buendel_von(klasse_englisch: str) -> str:
    """Bündel eines Gegenstands aus dem englischen Klassennamen des Clients."""
    text = (klasse_englisch or '').strip().lower()
    for schluessel, _namen, muster in BUENDEL:
        if any(m in text for m in muster):
            return schluessel
    return 'rest'


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
            'requiredClass': eintrag.get('requiredClass') or '',
            'requiredRace': eintrag.get('requiredRace') or '',
            'armourType': eintrag.get('armourType') or '',
            'weaponType': eintrag.get('weaponType') or '',
            'minLevel': eintrag.get('minLevel') or '',
            # Die Schadensart steht nur bei Waffen im Client-Katalog. Sie ist ein
            # belegtes Merkmal, kein aus dem Namen geratener Wert.
            'damageType': eintrag.get('damageType') or '',
            'scalable': bool((eintrag.get('scaling') or '').strip()),
            # Die Kurve hinter der Skalierung: Angabe steckt in `scaling`.
            'scaling': eintrag.get('scaling') or '',
            'hasExtraRequirement': any(eintrag.get(name) for name in (
                'requiredEffect', 'requiredFaction', 'requiredGloryRank',
                'requiredProfession', 'requiredTrait')),
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


def schadensarten() -> dict:
    """Schadensart-Schlüssel (z. B. ``WESTERNESSE``) → übersetzter Name.

    Der Client nennt die Schadensart als Schlüssel, die Übersetzung steht in
    ``labels/<sprache>/enum-DamageType.xml``. Nur Arten mit einem Namen werden
    angeboten; eine rohe Kennung ist kein Filterwert für Spieler.
    """
    pfad = CLIENT_LORE / 'enums' / 'DamageType.xml'
    if not pfad.is_file():
        return {}
    namensschluessel = {}
    for eintrag in ElementTree.parse(pfad).getroot().iter('entry'):
        schluessel = eintrag.get('key')
        if schluessel:
            namensschluessel[schluessel] = eintrag.get('name') or ''
    if not namensschluessel:
        return {}
    ergebnis = {}
    for sprache in SPRACHEN:
        label_pfad = CLIENT_LORE / 'labels' / sprache / ('enum-DamageType.xml')
        if not label_pfad.is_file():
            continue
        labels = {k.get('key'): html.unescape(k.get('value') or '')
                  for k in ElementTree.parse(label_pfad).getroot().iter('label')}
        for schluessel, name in namensschluessel.items():
            wert = labels.get(name)
            if wert:
                ergebnis.setdefault(schluessel, {})[sprache] = wert.strip()
    return {k: v for k, v in ergebnis.items() if v.get('de') or v.get('en')}


SKALIERUNG = HIER / 'web' / 'skalierung.js'
PROGRESSIONS = CLIENT_LORE / 'progressions.xml'


def progressions_id(spec: str) -> str:
    """Die Progressions-Kennung aus einer Skalierungsangabe.

    `Advancement_Level#50-:1879381078;1:0.3` → `1879381078`; `Item_Level#120-`
    hat keine Kurve.
    """
    treffer = re.search(r':(\d+)(?:;|$)', spec or '')
    return treffer.group(1) if treffer else ''


def skalierung_kurven(specs) -> dict:
    """Angabe aus `scaling` → Kurve (Stufe → Gegenstandsstufe).

    Der Client schreibt die Kurve als Progression; nur die Stellen, an denen die
    Gegenstandsstufe steigt, werden gebraucht. Ohne Kurve gilt die
    Gegenstandsstufe aus dem Katalog (etwa `Item_Level#120-`).
    """
    benoetigt = {}
    for spec in specs:
        kennung = progressions_id(spec)
        if kennung:
            benoetigt[kennung] = None
    if not benoetigt or not PROGRESSIONS.is_file():
        return {}
    for _, knoten in ElementTree.iterparse(PROGRESSIONS):
        ident = knoten.get('identifier')
        if knoten.tag == 'arrayProgression' and ident in benoetigt and benoetigt[ident] is None:
            startstufe = int(knoten.get('minX') or 1)
            werte = []
            for punkt in knoten.iter('point'):
                wert = int(float(punkt.get('y')))
                werte.extend([wert] * int(punkt.get('count') or 1))
            steigend, letzte = [], None
            for nummer, gegenstand in enumerate(werte):
                if gegenstand != letzte:
                    steigend.append([startstufe + nummer, gegenstand])
                    letzte = gegenstand
            benoetigt[ident] = steigend
        if knoten.tag in ('arrayProgression', 'parameterProgression'):
            knoten.clear()
    ergebnis = {}
    for spec in specs:
        kennung = progressions_id(spec)
        if kennung and benoetigt.get(kennung):
            ergebnis[spec] = benoetigt[kennung]
    return ergebnis


def qualitaet(wert):
    if isinstance(wert, int):
        return wert if 1 <= wert <= 5 else 0
    if wert in (None, ''):
        return 0
    if isinstance(wert, str) and wert.isdigit():
        zahl = int(wert)
        return zahl if 1 <= zahl <= 5 else 0
    return QUALITY.get(str(wert).upper(), 0)


def sprache_datei(sprache, items, typen, roh, klassen, klasse_namen, gattung_namen,
                  schadensart_namen, kurven_index, truhen=()):
    namen = typen['slot'].get(sprache) or {}
    ruestung = typen['armour'].get(sprache) or {}
    waffen = typen['weapon'].get(sprache) or {}

    # Klassen und Gattungen in der Reihenfolge des Client-Enums: derselbe Index
    # bedeutet in jeder Sprache dieselbe Sache, ein Link bleibt also gültig.
    klasse_liste = [klasse_namen[code].get(sprache) or klasse_namen[code].get('en') or ''
                    for code in klasse_namen]
    klasse_index = {code: nummer for nummer, code in enumerate(klasse_namen)}
    klassenwerkzeug_klassen = [
        code for code, names in klasse_namen.items()
        if 'Class Items' in (names.get('en') or '')
        or (names.get('en') or '') in KLASSENWERKZEUG_KLASSEN
    ]
    gattung_liste = [gattung_namen[code].get(sprache) or gattung_namen[code].get('en') or ''
                     for code in gattung_namen]
    gattung_index = {code: nummer for nummer, code in enumerate(gattung_namen)}

    KAT = {name: KATEGORIEN.index(name) for name in KATEGORIEN}
    # Bündel im Sonstigen: Beschriftung je Sprache, Zuordnung über den englischen
    # Klassennamen. Die genaue Klasse bleibt die Ebene darunter.
    buendel_liste = [namen.get(sprache) or namen.get('en')
                     for _schluessel, namen, _muster in BUENDEL]
    buendel_index = {schluessel: nummer
                     for nummer, schluessel in enumerate(BUENDEL_REIHENFOLGE)}
    buendel_je_klasse = {code: buendel_index[buendel_von(namen.get('en') or '')]
                         for code, namen in klasse_namen.items()}
    schmuck = klasse_index.get(SCHMUCK_KLASSE, -1)
    kategorien = []
    for kategorie in KATEGORIEN:
        if kategorie == 'JEWELLERY':
            kategorien.append(klasse_liste[schmuck] if schmuck >= 0 else '')
        else:
            kategorien.append(KATEGORIE_LABEL[sprache].get(kategorie, kategorie))

    plaetze, platz_index = [], {}
    arten, art_index = [], {}
    # Schadensart: nur die Arten, die der Bestand belegt und der Client benennt.
    # Sie ist kein Ersatz für die Kategorie, sondern ein eigener Filter, weil sie
    # quer zu Waffenart und Hand liegt.
    beschriftet = []
    for code in sorted({(klassen.get(ident) or {}).get('damageType') or '' for ident in items} - {''}):
        namen_der_art = schadensart_namen.get(code) or {}
        beschriftung = namen_der_art.get(sprache) or namen_der_art.get('en') or ''
        if beschriftung:
            beschriftet.append((schluessel(beschriftung), code, beschriftung))
    beschriftet.sort()
    schaden_liste = [beschriftung for _, _, beschriftung in beschriftet]
    schaden_index = {code: nummer for nummer, (_, code, _) in enumerate(beschriftet)}
    eintraege = []
    for ident, item in items.items():
        quelle = roh.get(ident) or {}
        klasse_code = (klassen.get(ident) or {}).get('klasse') or ''
        gattung_code = (klassen.get(ident) or {}).get('gattung') or ''

        name = sauberer_name((quelle.get('n') or {}).get(sprache)
                             or (item.get('n') or {}).get(sprache)
                             or (quelle.get('n') or {}).get('en')
                             or (item.get('n') or {}).get('en')
                             or (quelle.get('n') or {}).get('de')
                             or (item.get('n') or {}).get('de') or '', sprache)
        if item.get('instanztruhe_neu'):
            name = sauberer_name((item.get('n') or {}).get(sprache), sprache)
        if not name:
            continue

        # A few valid client items (currently quest-specific frames) have no
        # equipment record at all. Keep them searchable as ordinary items
        # instead of losing them from the catalogue.
        kat = (quelle.get('c') or item.get('kat') or 'ITEM').upper()
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
        if kat == KAT['ITEM'] and klasse_id < 0:
            # The client enum reserves index 0 for an unclassified item.
            klasse_id = 0
        gattung_id = gattung_index.get(gattung_code, -1) if kat == KAT['JEWELLERY'] else -1

        stufe = quelle.get('l')
        if not isinstance(stufe, int):
            stufe = item.get('l')
        if not isinstance(stufe, int) or stufe <= 0:
            stufe = 0

        # Die Mindeststufe fehlt im Client-Katalog bei 7.495 Gegenständen, im
        # vollständigen Export steht sie als "ml". Der Katalog bleibt erste
        # Quelle, weil die Detailseite ihn ebenfalls zeigt; der Export füllt
        # nur die Lücke. 0 heißt danach: keine Mindeststufe belegt.
        min_stufe = klassen.get(ident, {}).get('minLevel') or 0
        try:
            min_stufe = int(min_stufe)
        except (TypeError, ValueError):
            min_stufe = 0
        if min_stufe <= 0:
            ersatz = quelle.get('ml') or item.get('ml') or 0
            try:
                ersatz = int(ersatz)
            except (TypeError, ValueError):
                ersatz = 0
            if ersatz > 0:
                min_stufe = ersatz

        eintraege.append([ident, name, quelle.get('ic') or item.get('ic') or 0, kat,
                          qualitaet(quelle.get('q') or item.get('q')),
                          platz_id, art_id, stufe, klasse_id, gattung_id,
                          klassen.get(ident, {}).get('requiredClass', ''),
                          klassen.get(ident, {}).get('requiredRace', ''),
                          klassen.get(ident, {}).get('armourType', ''),
                          klassen.get(ident, {}).get('weaponType', ''),
                          min_stufe,
                          bool(klassen.get(ident, {}).get('hasExtraRequirement')),
                          bool(klassen.get(ident, {}).get('scalable')),
                          schaden_index.get((klassen.get(ident) or {}).get('damageType') or '', -1),
                          kurven_index.get((klassen.get(ident) or {}).get('scaling') or '', -1),
                          buendel_je_klasse.get(klasse_code, buendel_index['rest'])
                          if kat == KAT['ITEM'] else -1])

    eintraege.sort(key=lambda zeile: (schluessel(zeile[1]), zeile[0]))
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
        'classToolKeys': klassenwerkzeug_klassen,
        'gattung': gattung_liste,
        'gattungKey': list(gattung_index),
        # Mittlere Ebene unter „Sonstiges“; die Client-Klasse bleibt darunter.
        'buendel': buendel_liste,
        'buendelKey': list(BUENDEL_REIHENFOLGE),
        # Filter "Schadensart": Schlüssel für die Adresse, Namen für die Anzeige.
        'schaden': schaden_liste,
        'schadenKey': [code for _, code, _ in beschriftet],
        'instanceChest': sorted(zeile[0] for zeile in eintraege if zeile[0] in truhen),
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
    truhen = truhen_ids(lade_beute())
    items = beute_ergaenzen(items, roh, truhen)
    klassen = roh_klassen()
    klasse_namen = enum_namen('ItemClass')
    gattung_namen = enum_namen('EquipmentCategory')
    schadensart_namen = schadensarten()
    # Ohne die Klassen aus dem Client fiele Schmuck zurück in "Sonstiges" und
    # die Gruppen wären still falsch. Lieber abbrechen als das ausliefern.
    if roh and not (klassen and klasse_namen and gattung_namen):
        raise SystemExit('Client-Katalog unvollständig: items.xml, enums/ItemClass.xml und '
                         'enums/EquipmentCategory.xml unter %s erwartet.' % CLIENT_LORE)

    # Skalierung: je Angabe eine Kurve, jede Kurve nur einmal in der Datei.
    specs = {(klassen.get(i) or {}).get('scaling') or '' for i in items}
    je_spec = skalierung_kurven(specs)
    kurven, kurven_index = [], {}
    for spec in sorted(je_spec):
        schluessel = json.dumps(je_spec[spec], separators=(',', ':'))
        if schluessel not in kurven_index:
            kurven_index[schluessel] = len(kurven)
            kurven.append(je_spec[spec])
    spec_index = {spec: kurven_index[json.dumps(kurve, separators=(',', ':'))]
                  for spec, kurve in je_spec.items()}
    SKALIERUNG.write_text(
        '/* Written by build_gegenstandssuche.py. Do not edit by hand. */\n'
        'window.MQL_SKALIERUNG = %s;\n'
        % json.dumps({'kurven': kurven}, ensure_ascii=False, separators=(',', ':')),
        encoding='utf-8')

    for sprache in SPRACHEN:
        anzahl, groesse = sprache_datei(sprache, items, typen, roh, klassen,
                                        klasse_namen, gattung_namen,
                                        schadensart_namen, spec_index, truhen)
        print('%s: %d Gegenstände, %.1f MB' % (sprache, anzahl, groesse / 1048576.0))
    print('Skalierung: %d Kurven, %.0f kB'
          % (len(kurven), SKALIERUNG.stat().st_size / 1024))


if __name__ == '__main__':
    main()
