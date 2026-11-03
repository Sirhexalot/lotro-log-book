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
import hashlib
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
        etiketten = []
        ist_abschnitt = bool(pfad) and pfad[0].startswith('section:')
        for part in step_list(record['p'] if 'p' in record else None):
            schluessel = part['k']
            if not ist_abschnitt and schluessel.startswith('category:'):
                if schluessel.split(':', 1)[1] not in orte:
                    continue
            text = label(schluessel, part['n'], sprache)
            if text and (not etiketten or etiketten[-1] != text):
                etiketten.append(text)
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
            # g: quest giver (first bestowing NPC), where the game names one.
            **({'g': str(field(record, 'g'))} if field(record, 'g') else {}),
            'l': str(record['l']) if 'l' in record and record['l'] else '',
            'r': region,
            'z': zone,
            'u': untergebiet,
            'f': etiketten,
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
    for karte in karten:
        karte['region'] = regionen.get(karte['idx'], '')

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
