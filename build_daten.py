#!/usr/bin/env python3
"""Builds the data for the map view from the plugin catalogue.

Reads `Quests_<language>.lua` and `daten/karten.json` and writes:

- `web/daten-<language>.js` – loaded by the page via <script> (no
                    fetch, so the page also works via file://)
- `daten/quests-<language>.json` – the same data as plain JSON, for reading

Only quests with a recorded position are included. No position is invented:
what has no target in the catalogue does not appear on the map.

Usage (needs lupa, like the plugin's check scripts):

    .../.venv/bin/python build_daten.py --sprache de
    .../.venv/bin/python build_daten.py --sprache en
"""
import argparse
import functools
import hashlib
import html
import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
STANDARD_KATALOG = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data/Quests_de.lua'
STANDARD_FORTSCHRITT = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data/Progress.lua'
STANDARD_KARTEN = HIER / 'daten/karten.json'
STANDARD_MOORMAP = Path('/Users/adrian/Documents/The Lord of the Rings Online/Plugins/GaranStuff/MoorMap/Defaults.lua')
# Rhovanion, Mordor, the Shield Isles, Rivendell: sub-map frames do not fit the image.
OHNE_UNTERPUNKTE = {30, 152, 403, 29}
# Rhovanion and Mordor: the world overviews' frames do not fit at all (even
# quests of the Sutcrofts were attributed to Rhovanion). A place on them counts
# as unknown; no dots are drawn there.
UNKLARER_RAHMEN = {30, 152}
STANDARD_KARTENNAMEN = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore/maps/labels')


def moormap_tabelle(pfad):
    """MoorMap's map geometry: index -> region, frame and tier (map entries only)."""
    tabelle = {}
    if not pfad or not Path(pfad).is_file():
        return tabelle
    text = Path(pfad).read_text(encoding='utf-8', errors='replace')
    for treffer in re.finditer(r'tmpMapInfo\[(\d+)\]\s*=\s*\{([^}\n]+)', text):
        felder = [teil.strip() for teil in treffer.group(2).split(',')]
        try:
            if int(felder[10]) != 1:
                continue
            tabelle[int(treffer.group(1))] = {
                'eltern': int(felder[9]), 'region': int(felder[11]), 'north': float(felder[12]), 'west': float(felder[13]),
                'south': float(felder[14]), 'east': float(felder[15]), 'tier': int(felder[16])}
        except (ValueError, IndexError):
            continue
    return tabelle


@functools.lru_cache(maxsize=None)
def kartennamen(sprache):
    """Map id -> map name in this language, from the game's map labels (the same
    source as the English names in karten.json). Empty when the file is missing."""
    datei = STANDARD_KARTENNAMEN / sprache / 'basemaps.xml'
    if not datei.is_file():
        return {}
    namen = {}
    for treffer in re.finditer(r'<label key="(\d+)" value="([^"]*)"', datei.read_text(encoding='utf-8')):
        namen[treffer.group(1)] = kartenname_putzen(html.unescape(treffer.group(2)).replace('\\q', '"'))
    return namen


def kartenname_putzen(name):
    """Game markup ("[fp]") and MoorMap's image ids (",0x4114…") out of a map name."""
    name = re.sub(r'\[[a-z]{1,3}\]', '', name or '')
    name = re.sub(r'\s*,\s*0x[0-9A-Fa-f].*$', '', name)
    return name.strip()


def name_ueber_englisch(name, sprache):
    """A map our labels miss by id: find its English name among the English labels
    and take the same label in this language ("helm's deep" -> "Helms Klamm")."""
    name = kartenname_putzen(name)
    # "Glittering Caves (before dawn)": the base name is translated, the
    # parenthesis has no game label and stays.
    treffer = re.match(r'^(.*?)(\s*\([^)]*\))?$', name)
    grund, zusatz = treffer.group(1), treffer.group(2) or ''

    def gleich(a, b):
        a, b = a.lower().strip(), b.lower().strip()
        return a == b or re.sub(r'^the ', '', a) == re.sub(r'^the ', '', b) or a.endswith(': ' + b)

    for schluessel, wert in kartennamen('en').items():
        if gleich(wert, grund):
            return kartennamen(sprache).get(schluessel, wert) + zusatz
    for englisch, sprachen in gebietsnamen().items():
        if gleich(englisch, grund):
            return sprachen.get(sprache, englisch) + zusatz
    return name[:1].upper() + name[1:]


@functools.lru_cache(maxsize=None)
def gebietsnamen():
    """English area name -> its names in all languages, from our own DAT export."""
    datei = BASIS / 'Companion-Test/source-exporter/full-dat-en-de-fr-2026-11-03/areas.json'
    namen = {}
    if datei.is_file():
        for gebiet in json.loads(datei.read_text(encoding='utf-8')):
            texte = (gebiet.get('title') or {}).get('texts') or {}
            if texte.get('en'):
                namen.setdefault(texte['en'], texte)
    return namen


def kartenbaum(sprache, moormap=STANDARD_MOORMAP):
    """MoorMap's whole map tree (also maps without an image of their own, such as
    Gondor or East Rohan) with each map's name in this language.

    Names come from the game's map labels, matched by image id; a map the labels
    do not know takes the part before ':' its children share ("Ost-Rohan: Die
    Steppe" -> "Ost-Rohan"), and only then MoorMap's English comment."""
    tabelle = {}
    if not Path(moormap).is_file():
        return tabelle
    text = Path(moormap).read_text(encoding='utf-8', errors='replace')
    for treffer in re.finditer(r'tmpMapInfo\[(\d+)\]\s*=\s*\{(.*?)\};?[ \t]*(?:--[ \t]*(.*))?$', text, re.M):
        felder = [teil.strip() for teil in treffer.group(2).split(',')]
        try:
            if len(felder) < 17 or int(felder[10]) != 1:
                continue
            tabelle[int(treffer.group(1))] = {
                'eltern': int(felder[9]), 'tier': int(felder[16]), 'bild_id': str(int(felder[2], 0)),
                'kommentar': (treffer.group(3) or '').split(',')[0].strip()}
        except ValueError:
            continue
    karten_xml = STANDARD_KARTENNAMEN.parent / 'maps' / 'maps.xml'
    karte_je_bild = {}
    if karten_xml.is_file():
        for treffer in re.finditer(r'<map id="(\d+)"[^>]*imageId="(\d+)"', karten_xml.read_text(encoding='utf-8')):
            karte_je_bild.setdefault(treffer.group(2), treffer.group(1))
    namen = kartennamen(sprache)
    for eintrag in tabelle.values():
        eintrag['name'] = namen.get(karte_je_bild.get(eintrag['bild_id'], ''), '')
    for index, eintrag in tabelle.items():
        if eintrag['name']:
            continue
        kinder = [anderer['name'] for anderer in tabelle.values()
                  if anderer['eltern'] == index and ':' in anderer['name']]
        vorsilben = {re.sub(r'\s+', ' ', name.replace('\xa0', ' ').split(':', 1)[0]).strip() for name in kinder}
        eintrag['name'] = (vorsilben.pop() if len(vorsilben) == 1 else
                           name_ueber_englisch(eintrag['kommentar'], sprache) or 'Karte %d' % index)
    return tabelle


# Area names of the catalogue that name a map under another name, the same in all
# languages: Imlad Morgul is the Morgul Vale, Umbar the Cape of Umbar.
NAMENSBEZUG = {'imladmorgul': 202, 'umbar': 404}


def abstand(a, b):
    """Edit distance (insert, delete, replace)."""
    vorher = list(range(len(b) + 1))
    for i, zeichen in enumerate(a, 1):
        jetzt = [i]
        for j, anderes in enumerate(b, 1):
            jetzt.append(min(vorher[j] + 1, jetzt[j - 1] + 1, vorher[j - 1] + (zeichen != anderes)))
        vorher = jetzt
    return vorher[-1]


def kartenpfade(quests, karten, sprache, art):
    """The tree follows the game's maps: Eriador > Breeland > Bree.

    A quest hangs on the map of its quest giver, or of its first objective; a deed
    on the most detailed map that holds three quarters of its objectives (the ruins of Bree-land
    on Bree-land, not on Archet). Each level carries its map index in `fk` (None
    for a map without an image, which only groups). Quests the catalogue files
    under a section (epic story, instances, festivals …) keep that section, and a
    quest without any place goes to the map that bears its area's name."""
    baum = kartenbaum(sprache)
    mit_bild = {karte['idx'] for karte in karten}
    rahmen = {karte['idx']: karte for karte in karten}
    kinder = {}
    for index, eintrag in baum.items():
        if index in mit_bild:
            kinder.setdefault(eintrag['eltern'], []).append(index)

    def genauer(index, lat, lon):
        # A point attributed to an overview whose frame lies inside a more detailed
        # map below it goes down to that map (Rhovanion's frame does not fit, its
        # sub-maps' frames do).
        gesehen = set()
        while index not in gesehen:
            gesehen.add(index)
            passend = [kind for kind in kinder.get(index, [])
                       if rahmen[kind]['south'] <= lat <= rahmen[kind]['north']
                       and rahmen[kind]['west'] <= lon <= rahmen[kind]['east']]
            if not passend:
                return index
            passend.sort(key=lambda kind: (-baum[kind]['tier'],
                                           (rahmen[kind]['north'] - rahmen[kind]['south'])
                                           * (rahmen[kind]['east'] - rahmen[kind]['west'])))
            index = passend[0]
        return index

    def normal(name):
        name = re.sub(r'^.*?:\s*', '', (name or '').replace('\xa0', ' ').lower())
        name = name.split(',')[0]
        name = re.sub(r"^(der|die|das|the|le|la|les|l')\s*", '', name)
        return re.sub(r'[^0-9a-zà-ÿ]', '', name)

    def kette(index):
        glieder, gesehen = [], set()
        while index in baum and index not in gesehen and baum[index]['tier'] > 1:
            gesehen.add(index)
            glieder.append(index)
            index = baum[index]['eltern']
        return list(reversed(glieder))

    def gemeinsam(ketten):
        erste = ketten[0]
        laenge = 0
        while laenge < len(erste) and all(len(k) > laenge and k[laenge] == erste[laenge] for k in ketten):
            laenge += 1
        return erste[:laenge]

    # Every map of the tree can be found by name (also the ones no entry hangs on yet).
    je_name = {}
    for index in sorted(baum, key=lambda i: -baum[i]['tier']):
        glieder = kette(index)
        if glieder:
            je_name.setdefault(normal(baum[index]['name']),
                               ([baum[i]['name'] for i in glieder], [i if i in mit_bild else None for i in glieder]))

    def finde(name):
        schluessel = normal(name)
        if len(schluessel) < 4:
            return je_name.get(schluessel)
        if schluessel in je_name:
            return je_name[schluessel]
        if schluessel in NAMENSBEZUG:
            index = NAMENSBEZUG[schluessel]
            return ([baum[i]['name'] for i in kette(index)], [i if i in mit_bild else None for i in kette(index)])
        # Inflection only ("Einsamen Lande" / "Einsame Lande"): at most two letters
        # apart, same start.
        for anderer, wert in je_name.items():
            if len(anderer) >= 6 and anderer[:4] == schluessel[:4] and abstand(anderer, schluessel) <= 2:
                return wert
        return None
    zaehler = {'karte': 0, 'name': 0, 'sektion': 0, 'ohne': 0}
    ohne_ort = []
    for quest in quests:
        # Every place goes down to the most detailed map whose frame holds it, so
        # the dot, the tree and a click all name the same map.
        if quest.get('gt'):
            quest['gt'][0] = genauer(quest['gt'][0], quest['gt'][1], quest['gt'][2])
        for ziel in quest['t']:
            ziel[0] = genauer(ziel[0], ziel[1], ziel[2])
    for quest in quests:
        if quest.get('_sek'):
            zaehler['sektion'] += 1
            continue
        if art == 'taten' and quest['t']:
            # The most detailed map that holds at least three quarters of the
            # objectives: a few stray ones on the overview must not lift the ruins
            # of Bree-land up to Eriador.
            ketten = [kette(ziel[0]) for ziel in quest['t'] if ziel[0] not in UNKLARER_RAHMEN] or [[]]
            pfad = gemeinsam(ketten)
            for laenge in range(max(len(k) for k in ketten), len(pfad), -1):
                zaehlung = {}
                for k in ketten:
                    if len(k) >= laenge:
                        zaehlung[tuple(k[:laenge])] = zaehlung.get(tuple(k[:laenge]), 0) + 1
                bester = max(zaehlung.items(), key=lambda paar: paar[1]) if zaehlung else None
                if bester and bester[1] >= 0.75 * len(ketten):
                    pfad = list(bester[0])
                    break
        else:
            ort = quest.get('gt') or (quest['t'][0] if quest['t'] else None)
            pfad = kette(ort[0]) if ort and ort[0] not in UNKLARER_RAHMEN else []
        if not pfad:
            ohne_ort.append(quest)
            continue
        quest['f'] = [baum[index]['name'] for index in pfad]
        quest['fk'] = [index if index in mit_bild else None for index in pfad]
        zaehler['karte'] += 1
    for quest in ohne_ort:
        treffer, stelle = None, -1
        for stelle in range(len(quest['f']) - 1, -1, -1):
            treffer = finde(quest['f'][stelle])
            if treffer and (stelle > 0 or len(quest['f']) == 1):
                break
            treffer = None
        if treffer:
            # Found only by a coarser name: the finer old area stays as a section.
            # Drop parts that only repeat the place ("Täler des Anduin: Laerlad"
            # under Täler des Anduin becomes "Laerlad").
            rest = []
            for teil in quest['f'][stelle + 1:]:
                teil = re.sub(r'^' + re.escape(quest['f'][stelle]) + r'\s*:\s*', '', teil)
                if teil and normal(teil) != normal(quest['f'][stelle]) and (not rest or rest[-1] != teil):
                    rest.append(teil)
            if rest:
                quest['a'] = ' › '.join(rest + ([quest['a']] if quest.get('a') else []))
                quest['ak'] = 1
            quest['f'], quest['fk'] = list(treffer[0]), list(treffer[1])
            zaehler['name'] += 1
        else:
            zaehler['ohne'] += 1
    for quest in quests:
        quest.pop('_sek', None)
        if quest.get('a') and quest.get('f') and quest['a'] == quest['f'][-1]:
            # The old area became the node itself; a section of the same name repeats it.
            quest.pop('a', None)
            quest.pop('ak', None)
        if quest.get('fk'):
            # The place names in the details follow the same path as the tree.
            pfad = quest['f']
            quest['r'] = pfad[0]
            quest['z'] = pfad[1] if len(pfad) > 1 else pfad[0]
            quest['u'] = ' › '.join(pfad[2:])
    print('Map tree: %(karte)d on a map, %(name)d by area name, %(sektion)d in sections, '
          '%(ohne)d keep their old place' % zaehler)


def ersatzkarte(tabelle, bekannt, index, lat, lon):
    """A map with an image for a position whose own map has none (MoorMap's
    hand-drawn detail maps such as Dale or Cliving, which the game does not have):
    the most detailed map of the same region with an image that contains the
    point. None when there is no such map."""
    eigene = tabelle.get(index)
    if not eigene:
        return None
    # MoorMap names each map's parent (Cliving -> Norcrofts, Dale -> Northern
    # Mirkwood). Its chain decides first, as long as the point lies in the frame.
    gesehen, nummer = set(), eigene['eltern']
    while nummer in tabelle and nummer not in gesehen:
        gesehen.add(nummer)
        karte = tabelle[nummer]
        if nummer in bekannt and karte['south'] <= lat <= karte['north'] and karte['west'] <= lon <= karte['east']:
            return nummer
        nummer = karte['eltern']
    treffer = [(nummer, karte) for nummer, karte in tabelle.items()
               if nummer in bekannt and karte['region'] == eigene['region']
               and karte['south'] <= lat <= karte['north'] and karte['west'] <= lon <= karte['east']]
    if not treffer:
        return None
    # Most detailed first; between maps of the same detail the smaller one.
    treffer.sort(key=lambda paar: (-paar[1]['tier'],
                                   (paar[1]['north'] - paar[1]['south']) * (paar[1]['east'] - paar[1]['west'])))
    return treffer[0][0]

# Game markup like <rgb=#FF0000>…</rgb>, plus the rare <b>/<i>/<u>/<br>.
# The old patterns contained "%s" placeholders that were never filled in, so
# they matched nothing and the tags ended up in the JSON.
MARKUP = re.compile(r'</?(?:rgb|b|i|u|br)\b[^>]*>', re.IGNORECASE)
COUNTER = re.compile(r'\(\s*\$\{NUMBER\}\s*/\s*\$\{TOTAL\}\s*\)')

SEKTIONEN = {
    'de': {
        'story': 'Epische Geschichte', 'shadow': 'Epische Geschichte',
        'missions': 'Missionen', 'craft': 'Handwerk', 'festivals': 'Feste',
        'instances': 'Instanzen', 'other': 'Ohne Gebiet',
    },
    'en': {
        'story': 'Epic Story', 'shadow': 'Epic Story',
        'missions': 'Missions', 'craft': 'Crafting', 'festivals': 'Festivals',
        'instances': 'Instances', 'other': 'No region',
    },
    'fr': {
        'story': 'Histoire épique', 'shadow': 'Histoire épique',
        'missions': 'Missions', 'craft': 'Artisanat', 'festivals': 'Festivals',
        'instances': 'Instances', 'other': 'Sans région',
    },
}

TOKENS = {
    'de': {'PLAYER': 'Ihr', 'PLAYERNAME': 'Ihr', 'SURNAME': 'Ihr',
           'CLASS': 'Eure Klasse', 'RACE': 'Euer Volk',
           'band': 'Band', 'zaehler': '(Anzahl im Spiel)', 'wert': '[Spielwert]'},
    'en': {'PLAYER': 'you', 'PLAYERNAME': 'you', 'SURNAME': 'you',
           'CLASS': 'your class', 'RACE': 'your race',
           'band': 'Book', 'zaehler': '(count in game)', 'wert': '[game value]'},
    'fr': {'PLAYER': 'vous', 'PLAYERNAME': 'vous', 'SURNAME': 'vous',
           'CLASS': 'votre classe', 'RACE': 'votre race',
           'band': 'Livre', 'zaehler': '(nombre en jeu)', 'wert': '[valeur du jeu]'},
}


def label(schluessel, name, sprache):
    """Display name of a path part. "@volume:I" becomes "Band I" / "Book I"."""
    name = str(name or '')
    if not name.startswith('@'):
        return name
    koerper = name[1:]
    if koerper.startswith('volume:'):
        return '%s %s' % (TOKENS[sprache]['band'], koerper.split(':', 1)[1])
    return SEKTIONEN[sprache].get(koerper.split(':', 1)[0], koerper)


def clean(text, zaehler, sprache):
    """Make game text readable: strip markup, replace placeholders.

    For objectives `zaehler` is passed empty, because the page appends the
    count itself behind the text – otherwise it would appear twice.
    """
    if not text:
        return ''
    text = str(text)
    text = MARKUP.sub('', text)
    text = COUNTER.sub(zaehler, text)
    for key in ('PLAYER', 'PLAYERNAME', 'SURNAME', 'CLASS', 'RACE'):
        text = text.replace('${%s}' % key, TOKENS[sprache][key])
    text = re.sub(r'\$\{[^}]*\}', TOKENS[sprache]['wert'], text)
    return (text.replace('\\n', '\n').replace('\\q', '"').replace('\r\n', '\n')).strip()


def step_list(container):
    """Lua table 1..n as a list, nil-safe."""
    if container is None:
        return []
    return [container[index] for index in range(1, len(container) + 1)]


def field(record, name, default=None):
    value = record[name] if name in record else default
    return default if value is None else value


def ortsgruppen(karten_datei):
    """Codes of the quest groups that are real places (see baue_geografie.py).

    If the file is missing, the set stays empty: then all `category:` levels
    outside the sections disappear. Better no grouping than a wrong geography.
    """
    datei = Path(karten_datei).parent / 'geografie.json'
    if not datei.is_file():
        return set()
    inhalt = json.loads(datei.read_text(encoding='utf-8'))
    return {str(code) for code in inhalt.get('codes', {})}


def baue(katalog, karten_datei, orte=None, sprache='de', art='aufgaben', moormap=STANDARD_MOORMAP):
    orte = orte or set()
    tabelle = moormap_tabelle(moormap)
    bekannt = {karte['idx'] for karte in json.loads(Path(karten_datei).read_text(encoding='utf-8'))}
    umgelegt = verloren = 0
    try:
        from lupa.lua51 import LuaRuntime
    except ImportError:
        print('lupa missing. Run with the plugin venv:\n'
              '  %s/.venv/bin/python %s' % (BASIS / 'MagicQuestLog', __file__),
              file=sys.stderr)
        return 2

    runtime = LuaRuntime(unpack_returned_tuples=True)
    runtime.execute(Path(katalog).read_text(encoding='utf-8'))
    records = runtime.globals().MagicQuestLog.Data[('deeds_' if art == 'taten' else 'quests_') + sprache]

    quests, ohne_ziel, ziele = [], 0, 0

    def geber_ort(ort):
        if ort is None:
            return None
        karte = int(ort['map'])
        lat, lon = round(float(ort['lat']), 5), round(float(ort['lon']), 5)
        if karte not in bekannt:
            karte = ersatzkarte(tabelle, bekannt, karte, lat, lon)
        return [karte, lat, lon] if karte is not None else None
    for index in range(1, len(records) + 1):
        record = records[index]
        targets = step_list(record['t'] if 't' in record else None)
        if not targets:
            # Quest without a recorded target: it belongs in the tree and in the
            # counters (as in the plugin), but gets no dot on the map.
            ohne_ziel += 1
        region, zone, untergebiet, pfad = '', '', '', []
        for part in step_list(record['p'] if 'p' in record else None):
            key, name = part['k'], part['n']
            pfad.append(key)
            if key.startswith('region:'):
                region = name
            elif key.startswith('zone:'):
                zone = name
            elif key.startswith('area:'):
                # Sub-region, e.g. "Fornost" within the North Downs. Not in
                # the path of every quest.
                untergebiet = name
        # All levels as readable names, duplicates merged. For the
        # epic story these are the section, book or "Before the Shadow"
        # and the book group – the children were missing entirely before.
        # `category:` is only a level when it means a real place
        # (Wildwood, Fornost …). Groupings like "Festival" or "Captain"
        # do not belong on a map; in the sections they are book
        # and book group and stay.
        # Two tree levels (region or section, then area or book) and one list
        # section below: the sub-area or the quest group, "" for the area itself.
        # abschnitt_art: 1 = sub-area, 0 = quest group (sub-areas are listed first).
        etiketten, arten = [], []
        for part in step_list(record['p'] if 'p' in record else None):
            schluessel = part['k']
            text = label(schluessel, part['n'], sprache)
            if text and not text.startswith('@'):
                # Category names carry game markup as well ("\\q", "[m]").
                text = re.sub(r'\[[a-z]{1,3}\]', '', clean(text, '', sprache)).strip()
            # The two tree levels stay even when an area has the region's name
            # (Mordor > Mordor); merging them pushed groups up into the tree.
            if text and (len(etiketten) < 2 or etiketten[-1] != text):
                etiketten.append(text)
                arten.append(1 if schluessel.startswith('area:') else 0)
        # A deeper name often repeats what is above it ("Imlad Morgul: Cirith Ungol"
        # under Cirith Ungol): the area prefix goes, and a part that only repeats
        # the previous one is dropped.
        teile = []
        for teil in etiketten[2:]:
            for oben in etiketten[:2] + teile:
                if teil.lower().startswith(oben.lower() + ':'):
                    teil = teil[len(oben) + 1:].strip()
            if teil and not (teile and teil.lower() == teile[-1].lower()):
                teile.append(teil)
        abschnitt = ' › '.join(teile)
        abschnitt_art = arten[2] if len(arten) > 2 else 0
        etiketten = etiketten[:2]
        if not zone:
            for key in pfad:
                if key.startswith('section:'):
                    zone = key.split(':', 1)[1]
        positions = []
        for target in targets:
            karte = int(target['map'])
            lat, lon = round(float(target['lat']), 5), round(float(target['lon']), 5)
            position = [karte, lat, lon, str(target['step'])]
            if karte not in bekannt:
                # Fifth value 1: shown on a larger map, its own detail map has no image.
                ersatz = ersatzkarte(tabelle, bekannt, karte, lat, lon)
                if ersatz is None:
                    verloren += 1
                else:
                    position = [ersatz, lat, lon, str(target['step']), 1]
                    umgelegt += 1
            positions.append(position)
            ziele += 1
        schritte = []
        for step in step_list(record['s'] if 's' in record else None):
            zeilen = [clean(line, TOKENS[sprache]['zaehler'], sprache)
                      for line in step_list(step['n'])]
            ziele_je_schritt = []
            for goal in step_list(step['g']):
                count = goal['c'] if 'c' in goal else None
                # Third value: the condition number ("k") a character's running
                # counter from LOTRO Companion is matched by; -1 when unknown.
                ziele_je_schritt.append([clean(goal['t'], '', sprache),
                                         int(count) if count else 0,
                                         int(goal['k']) if 'k' in goal else -1])
            schritte.append([str(step['i']), zeilen, ziele_je_schritt])
        quests.append({
            'i': record['id'],
            'n': clean(record['name'], TOKENS[sprache]['zaehler'], sprache),
            # Requirements: v all completed, vo one of them completed, vl minimum
            # level, vb something else we cannot check (class, race, faction …).
            **({'v': [str(x) for x in step_list(field(record, 'v'))]} if field(record, 'v') else {}),
            **({'vo': [str(x) for x in step_list(field(record, 'vo'))]} if field(record, 'vo') else {}),
            **({'vl': int(field(record, 'vl'))} if field(record, 'vl') else {}),
            **({'vb': 1} if field(record, 'vb') else {}),
            # ls: the level follows the character; l is only a floor.
            **({'ls': 1} if field(record, 'ls') else {}),
            # gt: where the quest giver stands [map, lat, lon], shown by default
            # instead of the objectives (no spoilers until asked).
            **({'gt': geber_ort(field(record, 'gt'))} if geber_ort(field(record, 'gt')) else {}),
            # Facts from the game: next / previous quests, repeatable, daily, time
            # limit, group, instance, LOTRO points (see the catalogue generator).
            **{key: (str(field(record, key)) if key == 'nq' else
                     [str(x) for x in step_list(field(record, key))] if key == 'pq' else
                     int(field(record, key)))
               for key in ('nq', 'pq', 'rp', 'dy', 'tl', 'gr', 'ix', 'lp') if field(record, key)},
            **({'a': abschnitt, 'ak': abschnitt_art} if abschnitt else {}),
            # g: quest giver (first bestowing NPC), where the game names one.
            **({'g': str(field(record, 'g'))} if field(record, 'g') else {}),
            'l': str(record['l']) if 'l' in record and record['l'] else '',
            'r': region,
            'z': zone,
            'u': untergebiet,
            'f': etiketten,
            # Internal: the catalogue files this under a section of its own (epic
            # story, instances, festivals, crafting, missions), not under a place.
            **({'_sek': 1} if any(key.startswith('section:') and key != 'section:other' for key in pfad) else {}),
            't': positions,
            'd': clean(record['d'] if 'd' in record else '',
                       TOKENS[sprache]['zaehler'], sprache),
            's': schritte,
            # x: session play, e: quests that rule this one out. Passed through as
            # they stand in the catalogue; the page applies the same rule as the
            # plugin, using the progress the visitor loads.
            **({'x': 1} if field(record, 'x', 0) == 1 else {}),
            **({'e': [str(mate) for mate in step_list(field(record, 'ex'))]}
               if field(record, 'ex') else {}),
        })

    karten = json.loads(Path(karten_datei).read_text(encoding='utf-8'))
    benutzte = {position[0] for quest in quests for position in quest['t']}
    karten = [karte for karte in karten if karte['idx'] in benutzte]

    print('%d quests, %d of them without a recorded target (no dot)' %
          (len(quests), ohne_ziel))
    print('%d single objectives, %d maps in the index; %d moved to a larger map, '
          '%d on a map without image' % (ziele, len(karten), umgelegt, verloren))
    return quests, karten


def fortschritt_lesen(pfad):
    """Completed quests from Progress.lua.

    Just a list of IDs, deliberately without evaluation: the file is a
    Lua dump, and a pattern for it is more reliable than an interpreter.
    A foreign character file is not detected – the character name is
    only shown for display next to it.
    """
    if pfad is None or not Path(pfad).is_file():
        return None
    text = Path(pfad).read_text(encoding='utf-8', errors='replace')
    kopf = re.search(r'\["character"\]\s*=\s*"([^"]*)"', text)
    datum = re.search(r'\["date"\]\s*=\s*"([^"]*)"', text)
    block = re.search(r'\["completed"\]\s*=\s*\{(.*?)\n\s*\}', text, re.S)
    ids = re.findall(r'\["([0-9A-F]{8})"\]\s*=\s*true', block.group(1) if block else '')
    return {'character': kopf.group(1) if kopf else '',
            'date': datum.group(1) if datum else '',
            'ids': sorted(set(ids))}


def rahmen_pruefen(karten, positionen):
    """Find maps whose objectives do not lie on the drawing.

    Uses Pillow when available. Without Pillow everything stays as before.
    """
    try:
        from PIL import Image
    except ImportError:
        return []
    unklar = []
    for karte in karten:
        punkte = positionen.get(karte['idx'], [])
        bild = HIER / 'Karten' / karte['bild']
        if len(punkte) < 10 or not bild.is_file():
            continue
        with Image.open(bild) as offen:
            grau = offen.convert('L')
            flaeche = grau.point(lambda wert: 255 if wert > 12 else 0).getbbox()
            breite, hoehe = grau.size
        if not flaeche:
            continue
        x0, y0, x1, y1 = flaeche
        spanne = karte['east'] - karte['west']
        hoehe_spanne = karte['north'] - karte['south']
        if spanne <= 0 or hoehe_spanne <= 0:
            continue
        drin = 0
        for lat, lon in punkte:
            px = (lon - karte['west']) / spanne * breite
            py = (karte['north'] - lat) / hoehe_spanne * hoehe
            if x0 - 8 <= px <= x1 + 8 and y0 - 8 <= py <= y1 + 8:
                drin += 1
        anteil = drin / len(punkte)
        if anteil < 0.75:
            karte['rahmen'] = 'unklar'
            unklar.append((karte['name'], anteil))
    return unklar


def regionen_je_karte(quests):
    """Parent region per map: the most frequent one among quests with their
    first target there."""
    zaehler = {}
    for quest in quests:
        if not quest['t']:
            continue
        index = quest['t'][0][0]
        if quest['r']:
            zaehler.setdefault(index, {})
            zaehler[index][quest['r']] = zaehler[index].get(quest['r'], 0) + 1
    return {index: max(werte, key=werte.get) for index, werte in zaehler.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sprache', choices=('de', 'en', 'fr'), default='de',
                        help='catalogue language; writes web/daten-<language>.js')
    parser.add_argument('--art', choices=('aufgaben', 'taten'), default='aufgaben',
                        help='quests (web/daten-<language>.js) or deeds (web/daten-taten-<language>.js)')
    parser.add_argument('--katalog', type=Path, default=None,
                        help='default: Quests_/Deeds_<language>.lua next to the plugin')
    parser.add_argument('--karten', type=Path, default=STANDARD_KARTEN)
    parser.add_argument('--fortschritt', type=Path, default=STANDARD_FORTSCHRITT,
                        help='character Progress.lua; if missing, nothing is coloured')
    options = parser.parse_args()
    if options.katalog is None:
        options.katalog = (STANDARD_KATALOG.parent /
                           ('%s_%s.lua' % ('Deeds' if options.art == 'taten' else 'Quests',
                                           options.sprache)))

    for name, path in (('catalogue', options.katalog), ('karten.json', options.karten)):
        if not path.is_file():
            print('MISSING: %s -> %s' % (name, path), file=sys.stderr)
            if name == 'karten.json':
                print('Run hole_karten.py first.', file=sys.stderr)
            return 2

    ergebnis = baue(options.katalog, options.karten, ortsgruppen(options.karten),
                    options.sprache, options.art)
    if isinstance(ergebnis, int):
        return ergebnis
    quests, karten = ergebnis

    # Check frames: the maps.xml frame describes the image, the MoorMap frame
    # is calibrated in the game. For individual maps (Minas Tirith, Pelargir)
    # one has a different sign than the positions. The frame in which this
    # map's objectives actually lie wins.
    positionen = {}
    for quest in quests:
        for ziel in quest['t']:
            positionen.setdefault(ziel[0], []).append((ziel[1], ziel[2]))

    def anteil_drin(karte, punkte):
        breite = karte['east'] - karte['west']
        hoehe = karte['north'] - karte['south']
        if breite <= 0 or hoehe <= 0 or not punkte:
            return 0.0
        drin = 0
        for lat, lon in punkte:
            nx = (lon - karte['west']) / breite
            ny = (karte['north'] - lat) / hoehe
            if -0.02 <= nx <= 1.02 and -0.02 <= ny <= 1.02:
                drin += 1
        return drin / len(punkte)

    getauscht = []
    for karte in karten:
        punkte = positionen.get(karte['idx'], [])
        ersatz = karte.get('ersatz')
        if not punkte or not ersatz:
            karte.pop('ersatz', None)
            continue
        jetzt = anteil_drin(karte, punkte)
        anders = anteil_drin(ersatz, punkte)
        if jetzt < 0.9 and anders > jetzt:
            karte['north'] = ersatz['north']
            karte['west'] = ersatz['west']
            karte['south'] = ersatz['south']
            karte['east'] = ersatz['east']
            karte['rahmen'] = 'mormap'
            getauscht.append((karte['name'], jetzt, anders))
        else:
            karte['rahmen'] = 'maps.xml'
        karte.pop('ersatz', None)
    if getauscht:
        print('Frames swapped (maps.xml did not fit):')
        for name, alt_wert, neu_wert in getauscht:
            print('  %-26s %5.1f%% -> %5.1f%% of the objectives in the frame' %
                  (name, alt_wert * 100, neu_wert * 100))

    # Visual check of the frame: many maps have a coloured border, so
    # "objective inside the frame" does not yet mean it lies on the drawing.
    # For each map the painted area is located; if the objectives are mostly
    # beside it, the frame is unusable. Then no dots rather than wrong ones.
    unklar = rahmen_pruefen(karten, positionen)
    if unklar:
        print('Frames unusable (no dots):')
        for name, anteil in unklar:
            print('  %-32s %3.0f%% of the objectives on the drawing' %
                  (name, anteil * 100))

    regionen = regionen_je_karte(quests)
    moor = moormap_tabelle(STANDARD_MOORMAP)
    namen = kartennamen(options.sprache)
    for karte in karten:
        karte['name'] = namen.get(str(karte.get('id'))) or name_ueber_englisch(karte['name'], options.sprache)
    for karte in karten:
        karte['region'] = regionen.get(karte['idx'], '')
        # MoorMap's own region number and parent: the page shows an objective on
        # every map of the same region whose frame contains it.
        # Overview maps whose frame does not match their drawing for the places
        # below them (checked by drawing each sub-map's frame onto the image,
        # 03.11.2026): Rhovanion uses another coordinate system (MoorMap says so),
        # Moria then lands among the Beornings. These show only their own dots.
        if karte['idx'] in OHNE_UNTERPUNKTE:
            karte['eigen'] = 1
        if karte['idx'] in UNKLARER_RAHMEN:
            karte['rahmen'] = 'unklar'
        eintrag = moor.get(karte['idx'])
        if eintrag:
            karte['mr'] = eintrag['region']
            karte['eltern'] = eintrag['eltern']

    kartenpfade(quests, karten, options.sprache, options.art)

    fortschritt = fortschritt_lesen(options.fortschritt)
    if fortschritt is None:
        print('no progress found (%s) – numbers and colours omitted' %
              options.fortschritt)
        fortschritt = {'character': '', 'date': '', 'ids': []}
    else:
        print('Progress: %s, %s, %d completed quests' %
              (fortschritt['character'] or '?', fortschritt['date'] or '?',
               len(fortschritt['ids'])))

    (HIER / 'daten').mkdir(parents=True, exist_ok=True)
    (HIER / 'web').mkdir(parents=True, exist_ok=True)

    als_json = json.dumps({'karten': karten, 'quests': quests},
                          ensure_ascii=False, separators=(',', ':'))
    vorsilbe = 'taten-' if options.art == 'taten' else ''
    (HIER / ('daten/%s%s.json' % ('taten-' if options.art == 'taten' else 'quests-', options.sprache))).write_text(
        als_json, encoding='utf-8')

    # Stamp over the map images: otherwise the browser keeps them under the
    # same file name and shows the old ones after a rebuild.
    bildordner = 'Karten' if options.sprache == 'de' else 'Karten_' + options.sprache
    stempel = hashlib.sha256()
    for datei in sorted((HIER / bildordner).glob('*.png')):
        stempel.update(datei.name.encode())
        stempel.update(str(datei.stat().st_size).encode())
        stempel.update(str(int(datei.stat().st_mtime)).encode())
    for datei in sorted((HIER / 'webp' / options.sprache).glob('*.webp')):
        stempel.update(datei.name.encode())
        stempel.update(str(datei.stat().st_size).encode())
        stempel.update(str(int(datei.stat().st_mtime)).encode())
    # Also the project's own files: otherwise a changed app.js stays cached.
    for name in ('app.js', 'style.css', 'texte.js', 'sprache.js'):
        datei = HIER / 'web' / name
        if datei.is_file():
            stempel.update(name.encode())
            stempel.update(datei.read_bytes())
    stand = stempel.hexdigest()[:10]

    # Separate file for the stamp: sprache.js loads it first and appends it to
    # data, progress and app.js. Otherwise the browser would keep the old
    # daten-<sprache>.js and show old numbers after a rebuild.
    (HIER / 'web/stand.js').write_text(
        '/* Generated by build_daten.py. */\nwindow.MQL_STAND = %s;\n' %
        json.dumps(stand), encoding='utf-8')

    js = ('/* Generated by build_daten.py. Do not edit by hand. */\n'
          'window.MQL_STAND = %s;\n'
          'window.MQL_KARTEN = %s;\n'
          'window.MQL_QUESTS = %s;\n' %
          (json.dumps(stand, ensure_ascii=False),
           json.dumps(karten, ensure_ascii=False, separators=(',', ':')),
           json.dumps(quests, ensure_ascii=False, separators=(',', ':'))))
    datendatei = HIER / ('web/daten-%s%s.js' % (vorsilbe, options.sprache))
    datendatei.write_text(js, encoding='utf-8')

    fs = ('/* Generated by build_daten.py. */\n'
          'window.MQL_FORTSCHRITT = %s;\n' %
          json.dumps(fortschritt, ensure_ascii=False, separators=(',', ':')))
    (HIER / 'web/fortschritt.js').write_text(fs, encoding='utf-8')

    groesse = datendatei.stat().st_size / (1024 * 1024)
    print('written: %s (%.1f MB), web/fortschritt.js' %
          (datendatei.relative_to(HIER), groesse))
    return 0


if __name__ == '__main__':
    sys.exit(main())
