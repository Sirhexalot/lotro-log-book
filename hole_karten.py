#!/usr/bin/env python3
"""Fetches the map images for the maps the catalogue uses.

Default source: the DAT archives of your own client (`client_map_*.dat`) via
`MapExport.java`. This yields the maps in the client language — German labels
with a German client. Read-only.

Fallback source: `--quelle github` downloads the same maps as PNG from
LotroCompanion/lotro-maps-db. Only needed when no client is installed; there
the labels are English.

Usage:

    python3 hole_karten.py                      # all maps from the DAT
    python3 hole_karten.py --sprache en         # English labels
    python3 hole_karten.py --nur 3              # small test run first

Result: `Karten/<map-ID>.png` and `daten/karten.json` with name, frame
(N/W/S/E in game coordinates) and file name per map.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
BASIS_URL = ('https://raw.githubusercontent.com/LotroCompanion/lotro-maps-db/'
             'master/maps/%s.png')

STANDARD_KATALOG = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data/Quests_de.lua'
STANDARD_MOORMAP = Path('/Users/adrian/Documents/The Lord of the Rings Online'
                        '/Plugins/GaranStuff/MoorMap/Defaults.lua')
STANDARD_MAPSXML = Path('/Users/adrian/Applications/LOTRO-Companion-Test'
                        '/LotRO Companion/app/data/lore/maps/maps/maps.xml')
STANDARD_LIB = Path('/Users/adrian/Applications/LOTRO-Companion-Test'
                    '/LotRO Companion/app/lib')
STANDARD_CLIENT = Path('/Users/adrian/Applications/The Lord of the Rings Online.app'
                       '/Contents/SharedSupport/prefix/drive_c/Program Files (x86)'
                       '/StandingStoneGames/Der Herr der Ringe Online')


def moor_map(path):
    """MoorMap map index -> image ID, frame and fallback name."""
    index = {}
    text = Path(path).read_text(encoding='utf-8', errors='replace')
    for match in re.finditer(r'tmpMapInfo\[(\d+)\]=\{(.*?)\};\s*(?:--\s*(.*))?', text):
        fields = [part.strip() for part in match.group(2).split(',')]
        if len(fields) < 17:
            continue
        try:
            index[int(fields[0])] = {
                'bild_id': int(fields[2], 0),
                'north': float(fields[12]), 'west': float(fields[13]),
                'south': float(fields[14]), 'east': float(fields[15]),
                'tier': int(fields[16]),
                'name': (match.group(3) or '').strip(),
            }
        except ValueError:
            continue
    return index


def maps_xml(path):
    """Image ID -> map ID, name and frame.

    The frame comes from the same source as the image, so it fits exactly.
    The four overview maps (Eriador, Rhovanion, Mordor, Haradwaith) use an
    abstract 0..1024 space there; for those the MoorMap values remain.
    """
    index = {}
    for map_record in ET.parse(path).getroot():
        image_id = map_record.get('imageId')
        if image_id is None:
            continue
        unten, oben = map_record.find('min'), map_record.find('max')
        rahmen = None
        if unten is not None and oben is not None:
            rahmen = (float(unten.get('longitude')), float(unten.get('latitude')),
                      float(oben.get('longitude')), float(oben.get('latitude')))
        index[int(image_id)] = {'id': map_record.get('id'),
                                'name': map_record.get('name') or '',
                                'rahmen': rahmen}
    return index


def benutzte_karten(katalog):
    text = Path(katalog).read_text(encoding='utf-8', errors='replace')
    return sorted({int(value) for value in re.findall(r'\["map"\]=(\d+)', text)})


def hole_github(karten_id, ziel):
    datei = ziel / (karten_id + '.png')
    if datei.is_file() and datei.stat().st_size > 1000:
        return datei, False
    anfrage = urllib.request.Request(BASIS_URL % karten_id,
                                     headers={'User-Agent': 'mql-karten/1.0'})
    with urllib.request.urlopen(anfrage, timeout=120) as antwort:
        daten = antwort.read()
    if not daten.startswith(b'\x89PNG'):
        raise ValueError('not a PNG file: ' + karten_id)
    datei.write_bytes(daten)
    return datei, True


def klassenpfad(lib):
    namen = ('delta-lotro-dat-utils', 'delta-lotro-core', 'delta-common',
             'delta-json', 'slf4j-api')
    teile = []
    for name in namen:
        treffer = sorted(Path(lib).glob(name + '-[0-9]*.jar'))
        if not treffer:
            raise FileNotFoundError('missing JAR: %s in %s' % (name, lib))
        teile.append(str(treffer[0]))
    return ':'.join(teile)


def hole_dat(aufgeloest, ziel, client, lib, sprache):
    """Pull maps from the client's DAT archives (read-only)."""
    werkzeug = HIER / 'dat'
    klasse = werkzeug / 'MapExport.class'
    quelle = werkzeug / 'MapExport.java'
    pfad = klassenpfad(lib)

    if not klasse.is_file():
        if not quelle.is_file():
            raise FileNotFoundError('MapExport.java missing in %s' % werkzeug)
        print('  compiling MapExport.java …')
        subprocess.run(['javac', '--release', '8', '-cp', pfad, '-d', str(werkzeug),
                        str(quelle)], check=True)

    zwischen = ziel / '.dat'
    if zwischen.is_dir():
        shutil.rmtree(zwischen)
    zwischen.mkdir(parents=True)

    bilder = sorted({str(eintrag['bild_id']) for eintrag in aufgeloest})
    befehl = ['java', '-cp', str(werkzeug) + ':' + pfad, 'MapExport',
              str(client), sprache, str(zwischen)] + bilder
    print('  %d images from the DAT (%s) …' % (len(bilder), sprache))
    ergebnis = subprocess.run(befehl, capture_output=True, text=True)
    for zeile in ergebnis.stdout.splitlines():
        if zeile.startswith(('FEHLER', 'LEER', 'SKIP', 'fertig')):
            print('   ', zeile)
    if ergebnis.returncode != 0:
        print(ergebnis.stderr[-800:], file=sys.stderr)
        raise RuntimeError('MapExport failed')

    fehler = []
    for eintrag in aufgeloest:
        quelle_datei = zwischen / (str(eintrag['bild_id']) + '.png')
        if not quelle_datei.is_file():
            fehler.append((eintrag['name'], eintrag['bild_id']))
            continue
        # Copy, do not move: two maps can share the same image ID
        # (e.g. Glittering Caves before/after dusk).
        shutil.copyfile(str(quelle_datei), str(ziel / (eintrag['id'] + '.png')))
    shutil.rmtree(zwischen)
    for name, bild in fehler:
        print('  FEHLER %s (image %s)' % (name, bild))
    return len(aufgeloest) - len(fehler), 0, fehler


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path, default=HIER / 'Karten',
                        help='folder for the PNG files')
    parser.add_argument('--nur', type=int, default=0,
                        help='fetch only the first N images (for testing)')
    parser.add_argument('--quelle', choices=('dat', 'github'), default='dat',
                        help='dat = own game (correct language), github = fallback')
    parser.add_argument('--sprache', default='de', choices=('de', 'en', 'fr'))
    parser.add_argument('--client', type=Path, default=STANDARD_CLIENT)
    parser.add_argument('--lib', type=Path, default=STANDARD_LIB)
    parser.add_argument('--katalog', type=Path, default=STANDARD_KATALOG)
    parser.add_argument('--moormap', type=Path, default=STANDARD_MOORMAP)
    parser.add_argument('--mapsxml', type=Path, default=STANDARD_MAPSXML)
    options = parser.parse_args()

    for name, path in (('Katalog', options.katalog), ('MoorMap', options.moormap),
                       ('maps.xml', options.mapsxml)):
        if not path.is_file():
            print('MISSING: %s -> %s' % (name, path), file=sys.stderr)
            print('Pass the path with --%s.' % name.lower(), file=sys.stderr)
            return 2

    moor = moor_map(options.moormap)
    bilder = maps_xml(options.mapsxml)
    benutzt = benutzte_karten(options.katalog)
    print('%d maps used in the catalogue, %d of them known in MoorMap' %
          (len(benutzt), sum(1 for index in benutzt if index in moor)))

    aufgeloest, offen = [], []
    for index in benutzt:
        eintrag = moor.get(index)
        treffer = bilder.get(eintrag['bild_id']) if eintrag else None
        if treffer is None or not treffer['id']:
            offen.append(index)
            continue
        west, south, east, north = (eintrag['west'], eintrag['south'],
                                    eintrag['east'], eintrag['north'])
        rahmen = treffer.get('rahmen')
        if rahmen is not None and rahmen[2] != 1024.0:
            west, south, east, north = rahmen
        # Two sources: maps.xml describes the image, MoorMap the crop
        # calibrated in the game. For some maps (Minas Tirith, Pelargir)
        # the maps.xml frame has a different sign than the positions.
        # Which one fits is decided by build_daten.py on the real positions.
        aufgeloest.append({'idx': index, 'id': treffer['id'],
                           'bild_id': eintrag['bild_id'],
                           'name': treffer['name'] or eintrag.get('name') or ('Karte %d' % index),
                           'north': north, 'west': west, 'south': south, 'east': east,
                           'tier': eintrag.get('tier', 0),
                           'ersatz': {'north': eintrag['north'], 'west': eintrag['west'],
                                      'south': eintrag['south'], 'east': eintrag['east']}})
    print('%d maps resolved, %d without a match' % (len(aufgeloest), len(offen)))
    if offen:
        print('  without a match: %s' % offen)

    options.ziel.mkdir(parents=True, exist_ok=True)
    for eintrag in aufgeloest:
        eintrag['bild'] = eintrag['id'] + '.png'

    # --nur limits only the download, not the directory: otherwise a truncated
    # karten.json would be left behind.
    zu_holen = aufgeloest
    if options.nur:
        zu_holen = sorted(aufgeloest, key=lambda e: e['name'])[:options.nur]

    fehler = []
    if options.quelle == 'dat':
        if not Path(options.client).is_dir():
            print('No client found: %s' % options.client, file=sys.stderr)
            print('Pass it with --client or use --quelle github.', file=sys.stderr)
            return 2
        try:
            gut, _, fehler = hole_dat(zu_holen, options.ziel, options.client,
                                      options.lib, options.sprache)
            print('%d images written from the DAT' % gut)
        except (FileNotFoundError, RuntimeError) as fehlschlag:
            print('DAT export not possible: %s' % fehlschlag, file=sys.stderr)
            print('Fallback: --quelle github', file=sys.stderr)
            return 1
    else:
        for nummer, eintrag in enumerate(sorted(zu_holen, key=lambda e: e['name']), 1):
            try:
                hole_github(eintrag['id'], options.ziel)
            except (urllib.error.URLError, ValueError) as fehlerfall:
                fehler.append((eintrag['name'], eintrag['id'], str(fehlerfall)))
            if nummer % 20 == 0:
                print('  %d/%d' % (nummer, len(zu_holen)))

    zieldatei = HIER / 'daten/karten.json'
    zieldatei.parent.mkdir(parents=True, exist_ok=True)
    zieldatei.write_text(json.dumps(aufgeloest, ensure_ascii=False, indent=1),
                         encoding='utf-8')
    print('\nDone. Images: %s' % options.ziel)
    print('Map index: %s (%d entries)' % (zieldatei, len(aufgeloest)))
    return 0 if not fehler else 1


if __name__ == '__main__':
    sys.exit(main())
