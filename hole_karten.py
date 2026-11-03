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

Which maps: the game maps the catalogue's positions are on and every map above
them (see MagicQuestLog/tools/game_maps.py: parchment maps, bounds and links from
the game data). No MoorMap data is used here.

Result: `Karten/<map-ID>.png` and `daten/karten.json` with name, frame
(N/W/S/E in game coordinates), parent, region and file name per map.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
sys.path.insert(0, str(BASIS / 'MagicQuestLog/tools'))
from game_maps import GameMaps, DEFAULT_LORE  # noqa: E402
BASIS_URL = ('https://raw.githubusercontent.com/LotroCompanion/lotro-maps-db/'
             'master/maps/%s.png')

STANDARD_KATALOG = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data/Quests_de.lua'
STANDARD_LIB = Path('/Users/adrian/Applications/LOTRO-Companion-Test'
                    '/LotRO Companion/app/lib')
STANDARD_CLIENT = Path('/Users/adrian/Applications/The Lord of the Rings Online.app'
                       '/Contents/SharedSupport/prefix/drive_c/Program Files (x86)'
                       '/StandingStoneGames/Der Herr der Ringe Online')


def benutzte_karten(katalog):
    """Game maps used by the quest catalogue and, next to it, the deed catalogue."""
    karten = set()
    dateien = [Path(katalog)]
    taten = Path(katalog).with_name(Path(katalog).name.replace('Quests_', 'Deeds_'))
    if taten != Path(katalog) and taten.is_file():
        dateien.append(taten)
    for datei in dateien:
        text = datei.read_text(encoding='utf-8', errors='replace')
        karten.update(int(value) for value in re.findall(r'\["gm"\]=(\d+)', text))
    return sorted(karten)


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
    parser.add_argument('--lore', type=Path, default=DEFAULT_LORE,
                        help="LOTRO Companion's lore directory: the game's maps")
    parser.add_argument('--alle', action='store_true', help='fetch every image again')
    options = parser.parse_args()

    if not options.katalog.is_file():
        print('MISSING: catalogue -> %s' % options.katalog, file=sys.stderr)
        return 2

    spiel = GameMaps(options.lore)
    benutzt = set()
    for ident in benutzte_karten(options.katalog):
        # The map and every map above it: the tree shows them as its levels.
        benutzt.update(spiel.chain(ident))
    aufgeloest = []
    for ident in sorted(benutzt):
        karte = spiel.maps[ident]
        aufgeloest.append({'idx': ident, 'id': str(ident), 'bild_id': karte['image'],
                           'name': spiel.name(ident, 'en'),
                           'north': karte['north'], 'west': karte['west'],
                           'south': karte['south'], 'east': karte['east'],
                           # bounds false: an overview whose links fit no straight line;
                           # it is shown for navigation, without dots.
                           'bounds': karte['bounds'], 'tier': spiel.depth(ident),
                           'region': karte['region'], 'eltern': karte['parent']})
    print('%d game maps used in the catalogue (with the maps above them)' % len(aufgeloest))

    options.ziel.mkdir(parents=True, exist_ok=True)
    for eintrag in aufgeloest:
        eintrag['bild'] = eintrag['id'] + '.png'

    # --nur limits only the download, not the directory: otherwise a truncated
    # karten.json would be left behind.
    # Images already there (same map id) are kept; only new maps are fetched.
    zu_holen = [eintrag for eintrag in aufgeloest
                if not (options.ziel / eintrag['bild']).is_file() or options.alle]
    print('%d images to fetch' % len(zu_holen))
    if options.nur:
        zu_holen = sorted(aufgeloest, key=lambda e: e['name'])[:options.nur]

    fehler = []
    if not zu_holen:
        pass
    elif options.quelle == 'dat':
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
