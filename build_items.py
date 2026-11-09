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
from pathlib import Path

from itemnamen import sauberer_name

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')
REZEPTE = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
               '/rezepte-2026-11-06/recipes.json')
# Full item export: supplies the client icon ID (`ic`) for every item.
VOLL = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
            '/items-2026-11-08/items.json')


def js_datei(pfad, variable):
    text = Path(pfad).read_text(encoding='utf-8')
    treffer = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not treffer:
        raise SystemExit('MISSING %s in %s' % (variable, pfad))
    return json.JSONDecoder().raw_decode(text[treffer.end():])[0]


def leeres_item():
    return {'n': {}, 'q': None, 'l': None, 'b': None, 'kat': None, 'slot': None,
            'sub': None, 'ic': None, 'w': {}, 'quellen': [], 'rezepte': [], 'zutat': [], 'vor': []}


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

    def eintrag(iid):
        return items.setdefault(str(iid).upper(), leeres_item())

    # 1. Ausrüstung mit Werten
    details = json.loads((DATEN / 'gegenstand-details.json').read_text(encoding='utf-8'))
    for iid, row in details['items'].items():
        e = eintrag(iid)
        e['n'] = row.get('name') or {}
        e['q'] = row.get('quality')
        e['l'] = row.get('level') or None
        e['b'] = row.get('binding')
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
                e['q'] = row[2]
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
        for rezept_id, zeile in rezepte['items'].items():
            e = eintrag(rezept_id)
            namen = zeile.get('n') if isinstance(zeile, dict) else None
            if isinstance(namen, dict):
                for sprache in SPRACHEN:
                    if namen.get(sprache):
                        e['n'].setdefault(sprache, namen[sprache])
        for rezept in rezepte['recipes']:
            rid = rezept['r'][0]
            stufe = int(rezept.get('t') or 0)
            if rid:
                eintrag(rid)['rezepte'].append(str(rezept['id']).upper())
            for teil in rezept.get('i') or []:
                if teil and teil[0]:
                    eintrag(teil[0])['zutat'].append(str(rezept['id']).upper())
                    item_stufen.setdefault(str(teil[0]).upper(), set()).add(stufe)
            if rezept.get('cr') and rezept['cr'][0]:
                eintrag(rezept['cr'][0])['zutat'].append(str(rezept['id']).upper())

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
        symbol = eintrag.get('ic')
        if symbol:
            e['ic'] = int(symbol)
        namen = eintrag.get('n') or {}
        for sprache in SPRACHEN:
            sauber = sauberer_name(namen.get(sprache), sprache)
            if sauber:
                e['n'][sprache] = sauber

    for e in items.values():
        e['zutat'] = sorted(set(e['zutat']))
        e['rezepte'] = sorted(set(e['rezepte']))

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
    print('Gegenstände: %d (%.1f MB)' % (len(items), ziel.stat().st_size / 1048576))
    print('  mit Quelle (Aufgabe/Tat): %d' % mit_quelle)
    print('  herstellbar: %d' % mit_rezept)
    print('  als Zutat gebraucht: %d' % als_zutat)
    print('  mit Vorkommen auf der Karte: %d' % mit_vor)
    print('  mit Symbol: %d' % mit_symbol)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
