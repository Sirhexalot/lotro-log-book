#!/usr/bin/env python3
"""Baut die Daten für die Kartenansicht aus dem Plugin-Katalog.

Liest `Quests_<sprache>.lua` und `daten/karten.json` und schreibt:

- `web/daten-<sprache>.js` – wird von der Seite per <script> geladen (kein
                    fetch, damit die Seite auch per file:// funktioniert)
- `daten/quests-<sprache>.json` – dieselben Daten als reines JSON, zum Nachsehen

Nur Aufgaben mit belegter Position werden übernommen. Es wird keine Position
erfunden: was im Katalog kein Ziel hat, erscheint nicht auf der Karte.

Aufruf (braucht lupa, wie die Prüfskripte des Plugins):

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

MARKUP = (r'<%s*/?%s*rgb[^>]*>', r'<%s*/?%s*[bui]%s*>', r'</%s*[a-zA-Z]+%s*>')
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
}

TOKENS = {
    'de': {'PLAYER': 'Ihr', 'PLAYERNAME': 'Ihr', 'SURNAME': 'Ihr',
           'CLASS': 'Eure Klasse', 'RACE': 'Euer Volk',
           'band': 'Band', 'zaehler': '(Anzahl im Spiel)', 'wert': '[Spielwert]'},
    'en': {'PLAYER': 'you', 'PLAYERNAME': 'you', 'SURNAME': 'you',
           'CLASS': 'your class', 'RACE': 'your race',
           'band': 'Book', 'zaehler': '(count in game)', 'wert': '[game value]'},
}


def label(schluessel, name, sprache):
    """Anzeigename eines Pfadteils. "@volume:I" wird zu "Band I" / "Book I"."""
    name = str(name or '')
    if not name.startswith('@'):
        return name
    koerper = name[1:]
    if koerper.startswith('volume:'):
        return '%s %s' % (TOKENS[sprache]['band'], koerper.split(':', 1)[1])
    return SEKTIONEN[sprache].get(koerper.split(':', 1)[0], koerper)


def clean(text, zaehler, sprache):
    """Spieltext lesbar machen: Markup weg, Platzhalter ersetzen.

    Für Ziele wird `zaehler` leer übergeben, weil die Seite die Anzahl selbst
    hinter den Text setzt – sonst steht sie zweimal da.
    """
    if not text:
        return ''
    text = str(text)
    for pattern in MARKUP:
        text = re.sub(pattern, '', text)
    text = COUNTER.sub(zaehler, text)
    for key in ('PLAYER', 'PLAYERNAME', 'SURNAME', 'CLASS', 'RACE'):
        text = text.replace('${%s}' % key, TOKENS[sprache][key])
    text = re.sub(r'\$\{[^}]*\}', TOKENS[sprache]['wert'], text)
    return (text.replace('\\n', '\n').replace('\\q', '"').replace('\r\n', '\n')).strip()


def step_list(container):
    """Lua-Tabelle 1..n als Liste, nil-sicher."""
    if container is None:
        return []
    return [container[index] for index in range(1, len(container) + 1)]


def field(record, name, default=None):
    value = record[name] if name in record else default
    return default if value is None else value


def ortsgruppen(karten_datei):
    """Codes der Aufgabengruppen, die echte Orte sind (siehe baue_geografie.py).

    Fehlt die Datei, bleibt die Menge leer: dann verschwinden alle
    `category:`-Ebenen außerhalb der Abschnitte. Lieber keine Gruppierung als
    eine falsche Geografie.
    """
    datei = Path(karten_datei).parent / 'geografie.json'
    if not datei.is_file():
        return set()
    inhalt = json.loads(datei.read_text(encoding='utf-8'))
    return {str(code) for code in inhalt.get('codes', {})}


def baue(katalog, karten_datei, orte=None, sprache='de'):
    orte = orte or set()
    try:
        from lupa.lua51 import LuaRuntime
    except ImportError:
        print('lupa fehlt. Mit dem venv des Plugins aufrufen:\n'
              '  %s/.venv/bin/python %s' % (BASIS / 'MagicQuestLog', __file__),
              file=sys.stderr)
        return 2

    runtime = LuaRuntime(unpack_returned_tuples=True)
    runtime.execute(Path(katalog).read_text(encoding='utf-8'))
    records = runtime.globals().MagicQuestLog.Data['quests_' + sprache]

    quests, ohne_ziel, ziele = [], 0, 0
    for index in range(1, len(records) + 1):
        record = records[index]
        targets = step_list(record['t'] if 't' in record else None)
        if not targets:
            # Aufgabe ohne belegten Zielort: sie gehört in den Baum und in die
            # Zähler (wie im Plugin), bekommt aber keinen Punkt auf der Karte.
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
                # Untergebiet, z. B. "Fornost" innerhalb der Nordhöhen. Steht
                # nicht bei jeder Aufgabe im Pfad.
                untergebiet = name
        # Alle Ebenen als lesbare Namen, Doppelungen zusammengezogen. Bei der
        # epischen Geschichte sind das Abschnitt, Band bzw. "Vor dem Schatten"
        # und die Buchgruppe – vorher fehlten die Kinder ganz.
        # `category:` ist nur dann eine Ebene, wenn sie einen echten Ort meint
        # (Wildwald, Fornost …). Gruppierungen wie "Fest" oder "Hauptmann"
        # gehören nicht in eine Karte; in den Abschnitten sind sie dagegen Band
        # und Buchgruppe und bleiben.
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
            positions.append([int(target['map']), round(float(target['lat']), 5),
                              round(float(target['lon']), 5), str(target['step'])])
            ziele += 1
        schritte = []
        for step in step_list(record['s'] if 's' in record else None):
            zeilen = [clean(line, TOKENS[sprache]['zaehler'], sprache)
                      for line in step_list(step['n'])]
            ziele_je_schritt = []
            for goal in step_list(step['g']):
                count = goal['c'] if 'c' in goal else None
                ziele_je_schritt.append([clean(goal['t'], '', sprache),
                                         int(count) if count else 0])
            schritte.append([str(step['i']), zeilen, ziele_je_schritt])
        quests.append({
            'i': record['id'],
            'n': clean(record['name'], TOKENS[sprache]['zaehler'], sprache),
            'l': str(record['l']) if 'l' in record and record['l'] else '',
            'r': region,
            'z': zone,
            'u': untergebiet,
            'f': etiketten,
            't': positions,
            'd': clean(record['d'] if 'd' in record else '',
                       TOKENS[sprache]['zaehler'], sprache),
            's': schritte,
        })

    karten = json.loads(Path(karten_datei).read_text(encoding='utf-8'))
    benutzte = {position[0] for quest in quests for position in quest['t']}
    karten = [karte for karte in karten if karte['idx'] in benutzte]

    print('%d Aufgaben, davon %d ohne belegten Zielort (kein Punkt)' %
          (len(quests), ohne_ziel))
    print('%d Einzelziele, %d Karten im Verzeichnis' % (ziele, len(karten)))
    return quests, karten


def fortschritt_lesen(pfad):
    """Abgeschlossene Aufgaben aus Progress.lua.

    Nur eine Liste von IDs, bewusst ohne Auswertung: die Datei ist ein
    Lua-Dump, und ein Muster dafür ist verlässlicher als ein Interpreter.
    Eine fremde Charakterdatei wird nicht erkannt – der Charaktername steht
    nur zur Anzeige daneben.
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
    """Karten finden, deren Ziele nicht auf der Zeichnung liegen.

    Nutzt Pillow, wenn vorhanden. Ohne Pillow bleibt alles wie bisher.
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
    """Obergebiet je Karte: das häufigste der Aufgaben, die dort ihr erstes Ziel haben."""
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
    parser.add_argument('--sprache', choices=('de', 'en'), default='de',
                        help='Katalogsprache; schreibt web/daten-<sprache>.js')
    parser.add_argument('--katalog', type=Path, default=None,
                        help='Standard: Quests_<sprache>.lua neben dem Plugin')
    parser.add_argument('--karten', type=Path, default=STANDARD_KARTEN)
    parser.add_argument('--fortschritt', type=Path, default=STANDARD_FORTSCHRITT,
                        help='Progress.lua des Charakters; fehlt sie, bleibt alles ungefärbt')
    options = parser.parse_args()
    if options.katalog is None:
        options.katalog = (STANDARD_KATALOG.parent /
                           ('Quests_%s.lua' % options.sprache))

    for name, path in (('Katalog', options.katalog), ('karten.json', options.karten)):
        if not path.is_file():
            print('FEHLT: %s -> %s' % (name, path), file=sys.stderr)
            if name == 'karten.json':
                print('Erst hole_karten.py laufen lassen.', file=sys.stderr)
            return 2

    ergebnis = baue(options.katalog, options.karten, ortsgruppen(options.karten),
                    options.sprache)
    if isinstance(ergebnis, int):
        return ergebnis
    quests, karten = ergebnis

    # Rahmen prüfen: der maps.xml-Rahmen beschreibt das Bild, der MoorMap-Rahmen
    # ist im Spiel kalibriert. Bei einzelnen Karten (Minas Tirith, Pelargir) hat
    # der eine ein anderes Vorzeichen als die Positionen. Es gewinnt der Rahmen,
    # in dem die Ziele dieser Karte tatsächlich liegen.
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
        print('Rahmen getauscht (maps.xml passte nicht):')
        for name, alt_wert, neu_wert in getauscht:
            print('  %-26s %5.1f%% -> %5.1f%% der Ziele im Rahmen' %
                  (name, alt_wert * 100, neu_wert * 100))

    # Sichtprüfung des Rahmens: viele Karten haben einen farbigen Rand, deshalb
    # sagt "Ziel im Rahmen" noch nicht, dass es auf der Zeichnung liegt. Für
    # jede Karte wird die bemalte Fläche gesucht; liegen die Ziele überwiegend
    # daneben, ist der Rahmen unbrauchbar. Dann lieber keine Punkte als falsche.
    unklar = rahmen_pruefen(karten, positionen)
    if unklar:
        print('Rahmen unbrauchbar (keine Punkte):')
        for name, anteil in unklar:
            print('  %-32s %3.0f%% der Ziele auf der Zeichnung' % (name, anteil * 100))

    regionen = regionen_je_karte(quests)
    for karte in karten:
        karte['region'] = regionen.get(karte['idx'], '')

    fortschritt = fortschritt_lesen(options.fortschritt)
    if fortschritt is None:
        print('kein Fortschritt gefunden (%s) – Zahlen und Farben entfallen' %
              options.fortschritt)
        fortschritt = {'character': '', 'date': '', 'ids': []}
    else:
        print('Fortschritt: %s, %s, %d abgeschlossene Aufgaben' %
              (fortschritt['character'] or '?', fortschritt['date'] or '?',
               len(fortschritt['ids'])))

    (HIER / 'daten').mkdir(parents=True, exist_ok=True)
    (HIER / 'web').mkdir(parents=True, exist_ok=True)

    als_json = json.dumps({'karten': karten, 'quests': quests},
                          ensure_ascii=False, separators=(',', ':'))
    (HIER / ('daten/quests-%s.json' % options.sprache)).write_text(
        als_json, encoding='utf-8')

    # Kennung über die Kartenbilder: der Browser hält sie sonst unter dem
    # gleichen Dateinamen fest und zeigt nach einem Neuaufbau die alten.
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
    # Auch die eigenen Dateien: sonst bleibt eine geänderte app.js im Cache.
    for name in ('app.js', 'style.css', 'texte.js', 'sprache.js'):
        datei = HIER / 'web' / name
        if datei.is_file():
            stempel.update(name.encode())
            stempel.update(datei.read_bytes())
    stand = stempel.hexdigest()[:10]

    # Eigene Datei für die Kennung: sprache.js lädt sie zuerst und hängt sie an
    # Daten, Fortschritt und app.js. Sonst hielte der Browser die alte
    # daten-<sprache>.js fest und zeigte nach einem Neuaufbau alte Zahlen.
    (HIER / 'web/stand.js').write_text(
        '/* Erzeugt von build_daten.py. */\nwindow.MQL_STAND = %s;\n' %
        json.dumps(stand), encoding='utf-8')

    js = ('/* Erzeugt von build_daten.py. Nicht von Hand ändern. */\n'
          'window.MQL_STAND = %s;\n'
          'window.MQL_KARTEN = %s;\n'
          'window.MQL_QUESTS = %s;\n' %
          (json.dumps(stand, ensure_ascii=False),
           json.dumps(karten, ensure_ascii=False, separators=(',', ':')),
           json.dumps(quests, ensure_ascii=False, separators=(',', ':'))))
    datendatei = HIER / ('web/daten-%s.js' % options.sprache)
    datendatei.write_text(js, encoding='utf-8')

    fs = ('/* Erzeugt von build_daten.py. */\n'
          'window.MQL_FORTSCHRITT = %s;\n' %
          json.dumps(fortschritt, ensure_ascii=False, separators=(',', ':')))
    (HIER / 'web/fortschritt.js').write_text(fs, encoding='utf-8')

    groesse = datendatei.stat().st_size / (1024 * 1024)
    print('geschrieben: %s (%.1f MB), web/fortschritt.js, daten/quests-%s.json' %
          (datendatei.relative_to(HIER), groesse, options.sprache))
    return 0


if __name__ == '__main__':
    sys.exit(main())
