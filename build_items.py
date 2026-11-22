#!/usr/bin/env python3
"""One item namespace for the whole site.

Merges the three sources that describe items today into `daten/items.json`:

* `daten/gegenstand-details.json` – equipment with quality, level, slot, stats
* `web/belohnungen-<sprache>.js`   – items that quests and deeds hand out
* the recipe export                – results and ingredients, with item IDs
* `web/vorkommen-<sprache>.js`     – where crafting resources spawn

Everything is keyed by the item ID (8 hex digits). Names are never used as a key:
520 item names exist two or three times. Names are only used where the game
itself has no ID (the resource spawn table), and then only as a hint.

    python3 build_items.py            # writes daten/items.json
"""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from itemnamen import sauberer_name
from build_rezepte import result_variants
from tools.gegenstand_anforderungen import lade

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')
REZEPTE = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
               '/rezepte-2026-11-06/recipes.json')
VENDOR_ITEMS = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
                    '/vendor-items-2026-11-08/vendor-items.json')
# Full item export: supplies the client icon ID (`ic`) for every item.
VOLL = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
            '/items-2026-11-08/items.json')
ITEM_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion'
                 '/app/data/lore/items.xml')
# Was man an einem Tauschhändler bekommt. Die Liste steht im Companion-Repo und
# ist der einzige Beleg dafür, dass ein Gegenstand gezielt erreichbar ist.
BARTERS = Path('/Users/adrian/Developer/Lotro/companion/lotro-data/lore/barters.xml')


def tausch_quellen() -> dict:
    """Gegenstand → Tauschhändler, aus `barters.xml`.

    Das Empfangene ist der Gegenstand, das Gegebene die Währung. Ein Profil
    sammelt mehrere Einträge und wird von mehreren Händlern genutzt; deshalb
    zwei Durchgänge. Ohne Profilnamen bleibt der Händler allein stehen.
    """
    if not BARTERS.is_file():
        return {}
    profile, haendler = {}, {}
    for _, knoten in ET.iterparse(BARTERS):
        if knoten.tag == 'barterProfile':
            # Ein Profil kommt zweimal vor: als leere Referenz im Händler und
            # als Definition mit Namen und Einträgen. Nur die Definition zählt;
            # die Referenz bleibt im Baum, damit der Händler sie noch nennt.
            if not knoten.get('name'):
                continue
            empfangen = []
            for eintrag in knoten.iter('receive'):
                ident = str(eintrag.get('id') or '')
                if ident.isdigit():
                    empfangen.append('%08X' % (int(ident) & 0xffffffff))
            profile[knoten.get('profileId')] = {'name': knoten.get('name'),
                                                'empfangen': empfangen}
            knoten.clear()
        elif knoten.tag == 'barterer' and knoten.get('id'):
            haendler['%08X' % (int(knoten.get('id')) & 0xffffffff)] = {
                'name': knoten.get('name') or '',
                'title': knoten.get('title') or '',
                'profile': [p.get('profileId') for p in knoten.iter('barterProfile')
                            if p.get('profileId')],
            }
            knoten.clear()
    quellen = {}
    for händler_id, daten in haendler.items():
        for profil_id in daten['profile']:
            profil = profile.get(profil_id) or {}
            for iid in profil.get('empfangen') or []:
                # Ein Profil hängt oft an vielen Händlern desselben Berufs (alle
                # Jägertrainer führen dieselbe Tauschliste). Für die Seite zählt
                # die Tauschliste und ein belegter Händler, nicht 20 gleiche
                # Zeilen; die Anzahl bleibt als Hinweis erhalten.
                schluessel = (daten['title'], profil.get('name') or '')
                eintrag = quellen.setdefault(iid, {})
                if schluessel in eintrag:
                    eintrag[schluessel]['weitere'] = eintrag[schluessel].get('weitere', 1) + 1
                    continue
                eintrag[schluessel] = {
                    # Die Kennung bleibt dezimal, wie in barters.xml: der
                    # Händlerbau erwartet sie so, die Seiten rechnen sie um.
                    'id': str(int(händler_id, 16)),
                    'name': daten['name'] or händler_id,
                    'title': daten['title'],
                    'area': profil.get('name') or '',
                }
    return {iid: list(rows.values()) for iid, rows in quellen.items()}


def js_datei(pfad, variable):
    text = Path(pfad).read_text(encoding='utf-8')
    treffer = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not treffer:
        raise SystemExit('MISSING %s in %s' % (variable, pfad))
    return json.JSONDecoder().raw_decode(text[treffer.end():])[0]


# Seltenheit: der Client-Enum zählt 1 = legendär … 5 = gewöhnlich, die
# Ausrüstungsdatei hat daraus Zahlen gemacht. Gelesen wird überall der Name.
QUALITAET_TEXT = {1: 'LEGENDARY', 2: 'RARE', 3: 'INCOMPARABLE', 4: 'UNCOMMON', 5: 'COMMON'}
QUALITAET_NAMEN = set(QUALITAET_TEXT.values())


def seltenheit(wert):
    """Immer der Client-Name, nie eine Zahl: Seiten, Suche und Finder erwarten Text."""
    if isinstance(wert, int) and not isinstance(wert, bool):
        return QUALITAET_TEXT.get(wert)
    text = str(wert or '').strip().upper()
    return text if text in QUALITAET_NAMEN else None


def leeres_item():
    return {'n': {}, 'q': None, 'l': None, 'b': None, 'bm': None, 'kat': None, 'slot': None,
            'sub': None, 'ic': None, 'w': {}, 'quellen': [], 'rezepte': [], 'herstellung': [],
            'zutat': [], 'verwendung': [], 'vor': [], 'haendler': [], 'tausch': []}


def binding_modes():
    """Read the client's explicit binding enum without changing legacy `b`."""
    if not ITEM_LORE.is_file():
        return {}
    modes = {}
    for entry in ET.parse(ITEM_LORE).getroot().iter('item'):
        key, mode = entry.get('key'), entry.get('binding')
        if key and mode:
            modes['%08X' % (int(key) & 0xffffffff)] = mode
    return modes


def rohstoff_schluessel(text):
    """Case/ß-insensitive key for a resource or item name."""
    text = re.sub(r'\[[^\]]*\]', '', text or '')
    return re.sub(r'\s+', ' ', text.casefold().replace('ß', 'ss')).strip()


def rohstoff_kandidaten(name):
    """Possible node stems behind a crafted material, and its material kind."""
    key = rohstoff_schluessel(name)
    if not key.startswith(('stück ', 'klumpen ')):
        return [], ''
    rest = key.split(' ', 1)[1]
    material = ''
    for suffix, kind in (('-holz', 'holz'), ('holz', 'holz'), ('-erz', 'erz'), ('erz', 'erz'),
                         ('metall', 'erz'), ('rinde', 'holz'), ('wachs', ''), ('torf', ''), ('kohle', '')):
        if rest.endswith(suffix):
            rest = rest[:-len(suffix)].strip(' -')
            material = kind
            break
    if not material:
        return [], ''
    rest = re.sub(r'\b(reines|reiner|reine|hochwertiges|hochwertige|uraltes|uralte|mit|durchsetztes|durchsetzte)\b',
                  ' ', rest)
    return [token for token in re.split(r'[\s\-]+', rest) if len(token) >= 4], material


def ressourcen_schluessel(text):
    """Strip rarity words so "Schwere Eichenzweige" becomes "eichenzweige"."""
    key = rohstoff_schluessel(text)
    prefixe = ('schwere ', 'schwerer ', 'reiches ', 'reicher ', 'reichhaltige ', 'reichhaltiger ',
               'ader: ', 'stapel ', 'haufen ', 'zurückgelassene ', 'zurückgelassenes ',
               'reifbedeckte ', 'reifbedeckter ', 'schneebedeckte ', 'schneebedeckter ',
               'windgepeitschte ', 'windgepeitschter ', 'kräftige ', 'kräftiger ',
               'abgebrochene ', 'abgebrochener ', 'ungebrannte ', 'ungebrannte ', 'makelloser ', 'makellose ')
    changed = True
    while changed:
        changed = False
        for prefix in prefixe:
            if key.startswith(prefix):
                key = key[len(prefix):]
                changed = True
    return key.strip()


def baue():
    items = {}
    modes = binding_modes()

    def eintrag(iid):
        return items.setdefault(str(iid).upper(), leeres_item())

    # 1. Ausrüstung mit Werten
    details = json.loads((DATEN / 'gegenstand-details.json').read_text(encoding='utf-8'))
    for iid, row in details['items'].items():
        e = eintrag(iid)
        e['n'] = row.get('name') or {}
        e['q'] = seltenheit(row.get('quality'))
        e['l'] = row.get('level') or None
        e['b'] = row.get('binding')
        e['bm'] = modes.get(str(iid).upper())
        e['kat'] = row.get('category')
        e['slot'] = row.get('slot')
        e['sub'] = row.get('subtype')
        for feld in ('armour', 'dps', 'damage', 'speed', 'damageType'):
            if row.get(feld):
                e['w'][feld] = row[feld]

    # 2. Belohnungen aus Aufgaben und Taten
    for sprache in SPRACHEN:
        pfad = WEB / ('belohnungen-%s.js' % sprache)
        if not pfad.is_file():
            raise SystemExit('MISSING %s (build_belohnungen.py)' % pfad)
        daten = js_datei(pfad, 'MQL_BELOHNUNGEN')
        for row in daten.get('g', []):
            iid, name = str(row[0]).upper(), row[1]
            e = eintrag(iid)
            if not e['n'].get(sprache):
                e['n'][sprache] = name
            if row[2] and not e['q']:
                e['q'] = seltenheit(row[2])
            if row[3] and not e['l']:
                e['l'] = row[3]
            for quelle in row[5] or []:
                art, qid, qname = quelle[0], quelle[1], quelle[2]
                if (art, qid) not in [(q[0], q[1]) for q in e['quellen']]:
                    e['quellen'].append([art, qid, qname, quelle[3] or '', quelle[4] or ''])

    # 3. Rezepte: Ergebnis und Zutaten, mit IDs
    item_stufen = {}
    if REZEPTE.is_file():
        rezepte = json.loads(REZEPTE.read_text(encoding='utf-8'))
        variants = result_variants(ITEM_LORE.parent)
        for rezept_id, zeile in rezepte['items'].items():
            e = eintrag(rezept_id)
            namen = zeile.get('n') if isinstance(zeile, dict) else None
            if isinstance(namen, dict):
                for sprache in SPRACHEN:
                    if namen.get(sprache):
                        e['n'].setdefault(sprache, namen[sprache])
        for rezept in rezepte['recipes']:
            recipe_id = str(rezept['id']).upper()
            stufe = int(rezept.get('t') or 0)
            variant_rows = variants.get(recipe_id) or []
            if not variant_rows:
                variant_rows = []
                if rezept.get('r') and rezept['r'][0]:
                    variant_rows.append({'id': rezept['r'][0], 'normal': True, 'critical': False})
                if rezept.get('cr') and rezept['cr'][0]:
                    variant_rows.append({'id': rezept['cr'][0], 'normal': False, 'critical': True})
            seen = set()
            for variant in variant_rows:
                result_id = str(variant.get('id') or '').upper()
                if not result_id or result_id in seen or result_id not in items:
                    continue
                seen.add(result_id)
                result = eintrag(result_id)
                if recipe_id not in result['rezepte']:
                    result['rezepte'].append(recipe_id)
                for role, flag in (('regular_result', 'normal'), ('critical_result', 'critical')):
                    if not variant.get(flag):
                        continue
                    entry = {'recipe': recipe_id, 'role': role,
                             'quantity': 1, 'result': result_id}
                    if entry not in result['herstellung']:
                        result['herstellung'].append(entry)

            for teil in rezept.get('i') or []:
                if teil and teil[0]:
                    ingredient = eintrag(teil[0])
                    ingredient['zutat'].append(recipe_id)
                    ingredient['verwendung'].append({
                        'recipe': recipe_id, 'role': 'ingredient',
                        'quantity': teil[1] if len(teil) > 1 else None,
                    })
                    item_stufen.setdefault(str(teil[0]).upper(), set()).add(stufe)
            for teil in rezept.get('o') or []:
                if teil and teil[0]:
                    ingredient = eintrag(teil[0])
                    ingredient['zutat'].append(recipe_id)
                    ingredient['verwendung'].append({
                        'recipe': recipe_id, 'role': 'optional_ingredient',
                        'quantity': teil[1] if len(teil) > 1 else None,
                        'criticalBonus': teil[2] if len(teil) > 2 else None,
                    })
                    item_stufen.setdefault(str(teil[0]).upper(), set()).add(stufe)

    # 3b. Concrete vendor sources from the Companion exports.
    if VENDOR_ITEMS.is_file():
        vendor_data = json.loads(VENDOR_ITEMS.read_text(encoding='utf-8'))
        vendors = vendor_data.get('vendors') or {}
        for iid, vendor_ids in (vendor_data.get('items') or {}).items():
            if str(iid).upper() not in items:
                continue
            item = eintrag(iid)
            for vendor_id in vendor_ids:
                vendor = vendors.get(str(vendor_id).upper())
                if not vendor:
                    continue
                item['haendler'].append({
                    'id': str(vendor_id).upper(),
                    'name': vendor.get('n') or {},
                })

    # 3c. Tausch: was ein Spieler an einem Tauschhändler gezielt bekommt.
    # Das ist die einzige Quelle, die solche Gegenstände bisher nicht kannte.
    for iid, quellen in tausch_quellen().items():
        if iid not in items:
            eintrag(iid)
        items[iid]['tausch'].extend(quellen)

    # 4. Ressourcen: Spawn-Tabelle nennt keine Item-IDs, nur Namen und Beruf.
    # Direct names cover the few exact matches. Wood logs and ore are named
    # after their node ("Stück Eichenholz" -> "Eichenzweige"), so the node is
    # matched by its stem; no match is invented when the name is ambiguous.
    vor = js_datei(WEB / 'vorkommen-de.js', 'MQL_VORKOMMEN')
    nach_name = {}
    for spalte in vor.get('k', []):
        art_id, name, beruf, stufe = (list(spalte) + [None, None, None, None])[:4]
        if name:
            nach_name.setdefault(rohstoff_schluessel(name), []).append((str(art_id), name, beruf, stufe))
    for iid, e in items.items():
        gefunden = {}
        for name in e['n'].values():
            # exact resource name
            for spalte in nach_name.get(rohstoff_schluessel(name), []):
                gefunden[spalte[0]] = spalte
            # crafted material -> node name
            tokens, material = rohstoff_kandidaten(name)
            if not tokens or not material:
                continue
            erlaubt = ('zweig', 'holz', 'äst', 'stapel', 'haufen', 'brett') if material == 'holz' else (
                'ader', 'erz', 'skarn', 'vorkommen', 'metall')
            for schluessel, spalten in nach_name.items():
                if not any(word in schluessel for word in erlaubt):
                    continue
                sauber = ressourcen_schluessel(schluessel)
                if any(sauber.startswith(token) for token in tokens):
                    for spalte in spalten:
                        gefunden[spalte[0]] = spalte
        # A wood/ore family exists at several tiers; keep the tier the item is
        # actually used at, not every later node of the same family.
        stufen = item_stufen.get(iid, set())
        for spalte in gefunden.values():
            if stufen and spalte[3] not in stufen:
                continue
            e['vor'].append(list(spalte))

    # 5. Icon and name: the full item export knows every item, the equipment
    # file only a part of them and with the export's markup still in the name.
    voll = json.loads(VOLL.read_text(encoding='utf-8')).get('items', {}) if VOLL.is_file() else {}
    for iid, e in items.items():
        eintrag = voll.get(iid) or {}
        e['bm'] = modes.get(iid)
        symbol = eintrag.get('ic')
        if symbol:
            e['ic'] = int(symbol)
        # Items that only a barter source knows have no equipment record: the
        # page and the search still need their category, slot, quality and level.
        if not e.get('kat'):
            e['kat'] = eintrag.get('c') or None
        if not e.get('slot'):
            e['slot'] = eintrag.get('s') or None
        if not e.get('q'):
            e['q'] = seltenheit(eintrag.get('q'))
        if not e.get('l'):
            e['l'] = eintrag.get('l') or None
        # The client catalogue leaves the minimum level of ~7.600 items empty;
        # the full export carries it as `ml`. Same fallback as the item index,
        # so the eignung check is not blind for a seventh of the catalogue.
        if not e.get('ml'):
            try:
                ersatz = int(eintrag.get('ml') or 0)
            except (TypeError, ValueError):
                ersatz = 0
            if ersatz > 0:
                e['ml'] = ersatz
        namen = eintrag.get('n') or {}
        for sprache in SPRACHEN:
            sauber = sauberer_name(namen.get(sprache), sprache)
            if sauber:
                e['n'][sprache] = sauber
        # Eine Trophäe ohne Beschreibung wäre eine leere Seite. Der Export
        # liefert sie in allen drei Sprachen; nur ergänzen, nie überschreiben.
        if 'besch' not in e:
            beschreibung = {}
            for sprache in SPRACHEN:
                text = sauberer_name((eintrag.get('d') or {}).get(sprache) or '', sprache)
                if text:
                    beschreibung[sprache] = text
            if beschreibung:
                e['besch'] = beschreibung

    # 6. Trage-Voraussetzungen. Die Eignungsfarbe im Browser hängt an der
    # Mindeststufe, nicht an der Gegenstandsstufe: ein Stufe-123-Charakter trägt
    # einen Gegenstand mit Mindeststufe 120 und Gegenstandsstufe 388.
    for iid, req in lade(ITEM_LORE).items():
        if iid in items and req:
            items[iid].update(req)

    for e in items.values():
        # Eine einzige Schreibweise für die Seltenheit, egal aus welcher Quelle.
        e['q'] = seltenheit(e.get('q'))
        e['zutat'] = sorted(set(e['zutat']))
        e['rezepte'] = sorted(set(e['rezepte']))
        e['herstellung'] = sorted(e['herstellung'], key=lambda row: (
            row['recipe'], row['role'], row.get('quantity') or 0))
        e['verwendung'] = sorted(e['verwendung'], key=lambda row: (
            row['recipe'], row['role'], row.get('quantity') or 0))
        e['haendler'] = sorted(
            {json.dumps(row, ensure_ascii=False, sort_keys=True): row
             for row in e['haendler']}.values(),
            key=lambda row: (row.get('name', {}).get('de', ''), row['id']))
        e['tausch'] = sorted(
            {json.dumps(row, ensure_ascii=False, sort_keys=True): row
             for row in e['tausch']}.values(),
            key=lambda row: (row.get('name', ''), row['id']))

    # Ohne Namen ist ein Gegenstand nirgends zeigbar: keine Seite, keine Suche,
    # kein Finder-Eintrag. Solche Kennungen (etwa Tauschware, die weder Client
    # noch Export benennen) fallen hier heraus, statt leere Zeilen zu erzeugen.
    namenlos = [iid for iid, e in items.items() if not any(e.get('n', {}).values())]
    for iid in namenlos:
        del items[iid]
    if namenlos:
        print('  ohne Namen verworfen: %d' % len(namenlos))

    return items


def main():
    items = baue()
    ziel = DATEN / 'items.json'
    ziel.write_text(json.dumps({'schema': 1, 'items': items}, ensure_ascii=False,
                               separators=(',', ':')), encoding='utf-8')
    mit_quelle = sum(1 for e in items.values() if e['quellen'])
    mit_rezept = sum(1 for e in items.values() if e['rezepte'])
    als_zutat = sum(1 for e in items.values() if e['zutat'])
    mit_vor = sum(1 for e in items.values() if e['vor'])
    mit_symbol = sum(1 for e in items.values() if e['ic'])
    mit_stufe = sum(1 for e in items.values() if e.get('ml'))
    mit_klasse = sum(1 for e in items.values() if e.get('rk'))
    print('Gegenstände: %d (%.1f MB)' % (len(items), ziel.stat().st_size / 1048576))
    print('  mit Quelle (Aufgabe/Tat): %d' % mit_quelle)
    print('  herstellbar: %d' % mit_rezept)
    print('  als Zutat gebraucht: %d' % als_zutat)
    print('  mit Vorkommen auf der Karte: %d' % mit_vor)
    print('  mit Symbol: %d' % mit_symbol)
    print('  mit Mindeststufe: %d' % mit_stufe)
    print('  mit Klassenbindung: %d' % mit_klasse)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
