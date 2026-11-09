#!/usr/bin/env python3
"""Crafting resources (ore, wood, scholar finds) as map points.

Source: the game's own placements, category 50 ("Crafting Resource") in the
DAT-derived lore data from LOTRO Companion — the same door `game_maps.py` and
the travel planner already use. One marker per possible node at one spot; a
spot carries two to six variants (normal/rich, sometimes two professions), so
the same place shows up several times.

Writes one small file per language and one file per map:

    web/vorkommen-<lang>.js   window.MQL_VORKOMMEN = {k: [[key, name], …],
                                                      m: [[map, [[type, count], …]], …]}
    web/vorkommen/<map>.js    window.MQL_VORKOMMEN_KARTE = [[lat, lon, [type, …]], …]

The points are language-neutral; only the names differ, hence one directory for
all languages. Numbers are the possible spots, never a promise that a node is
standing there right now.

Usage:
    python3 build_vorkommen.py                 # all three languages, web/
    python3 build_vorkommen.py --lore /path/to/lore
"""
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
STANDARD_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')
sys.path.insert(0, str(BASIS / 'MagicQuestLog/tools'))
from game_maps import GameMaps  # noqa: E402
from build_daten import STANDARD_KARTEN  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')
# Which map filter the spot belongs to: the profession that gathers it.
BERUFE = {'PROSPECTOR': 'erz', 'FORESTER': 'holz', 'SCHOLAR': 'gelehrte', 'COOK': 'anbau'}
MARKE = re.compile(r'\[[a-z]{1,3}\]')
MARKER = re.compile(r'label="([^"]*)" category="50" did="(\d+)" parentZoneId="(\d+)" '
                    r'longitude="([-\d.]+)" latitude="([-\d.]+)"')


def sauber(text):
    return MARKE.sub('', text or '').replace('\\q', '"').strip()


def berufe(lore):
    """Node id -> profession and tier, from the game's resource table."""
    datei = lore / 'resources.xml'
    aus = {}
    for block in re.finditer(r'<resourcesMap profession="([A-Z_]+)" tier="(\d+)">(.*?)</resourcesMap>',
                             datei.read_text(encoding='utf-8'), re.S):
        beruf, stufe = block.group(1), int(block.group(2))
        for kennung, name in re.findall(r'<item id="(\d+)" name="([^"]*)"', block.group(3)):
            aus[kennung] = (beruf, stufe, sauber(name))
    return aus


def namen(lore, sprache):
    """Node id -> localised name from the game's label table."""
    datei = lore / 'labels' / sprache / 'items.xml'
    if not datei.is_file():
        return {}
    return {k: sauber(v) for k, v in
            re.findall(r'<label key="(\d+)" value="([^"]*)"', datei.read_text(encoding='utf-8'))}


def zonen(lore):
    """Zone id -> its (English) name, from the game's geography table."""
    baum = ET.parse(lore / 'geoAreas.xml').getroot()
    return {element.attrib['id']: element.attrib.get('name', '')
            for element in baum.iter() if 'id' in element.attrib}


def berufsnamen(sprache):
    """Profession names for the search context, from the site's reference file."""
    datei = HIER / 'web' / 'referenz.js'
    if not datei.is_file():
        return {}
    text = datei.read_text(encoding='utf-8')
    marke = 'window.MQL_REFERENZ = '
    daten = json.JSONDecoder().raw_decode(text[text.index(marke) + len(marke):])[0]
    aus = {}
    for schluessel, eintrag in (daten.get('berufe') or {}).items():
        aus[schluessel] = ((eintrag.get('n') or {}).get(sprache)
                           or (eintrag.get('n') or {}).get('en') or schluessel)
    return aus


def zonen_namen(lore, sprache):
    """Zone id -> localised name, from the game's label table."""
    datei = lore / 'labels' / sprache / 'geoAreas.xml'
    if not datei.is_file():
        return {}
    return {k: sauber(v) for k, v in
            re.findall(r'<label key="(\d+)" value="([^"]*)"', datei.read_text(encoding='utf-8'))}


def punkte(lore, spiel, bekannt):
    """Every placement: zone, map, position, node id.

    The region is the first number in the marker file name: the game files its
    placements per region, and two regions share the same coordinates, so the
    region cannot be guessed from the numbers alone. Frames of neighbouring maps
    overlap (Pelennor / South Ithilien), so a zone whose name matches a map wins
    when that map holds the point — that is where the game draws the zone.
    """
    names = zonen(lore)
    gleich = defaultdict(list)
    for kennung, karte in spiel.maps.items():
        name = (karte['name'] or '').strip().lower()
        if karte['bounds'] and name:
            gleich[name].append(kennung)
    aus = []
    verloren = defaultdict(int)
    for datei in sorted((lore / 'maps' / 'markers').glob('markers-*.xml')):
        region = int(datei.name.split('-')[1])
        for zeile in datei.open(encoding='utf-8'):
            treffer = MARKER.search(zeile)
            if not treffer:
                continue
            lat, lon = round(float(treffer.group(5)), 3), round(float(treffer.group(4)), 3)
            karte = spiel.attribute(lat, lon, region)
            eigen = (names.get(treffer.group(3)) or '').strip().lower()
            for kandidat in (gleich.get(eigen, []) if eigen else []):
                if spiel.contains(spiel.maps[kandidat], lat, lon):
                    karte = kandidat
                    break
            if karte is None or karte not in bekannt:
                verloren[region] += 1
                continue
            aus.append((treffer.group(3), karte, lat, lon, treffer.group(2)))
    return aus, verloren


def main():
    optionen = argparse.ArgumentParser(description=__doc__,
                                       formatter_class=argparse.RawDescriptionHelpFormatter)
    optionen.add_argument('--lore', type=Path, default=STANDARD_LORE)
    optionen.add_argument('--ziel', type=Path, default=HIER / 'web')
    optionen.add_argument('--karten', type=Path, default=Path(STANDARD_KARTEN))
    args = optionen.parse_args()

    spiel = GameMaps(args.lore)
    bekannt = {int(karte['idx']) for karte in json.loads(args.karten.read_text(encoding='utf-8'))}

    tabelle = berufe(args.lore)
    orte, verloren = punkte(args.lore, spiel, bekannt)

    # One index per node id, shared by every language and every map file. The
    # game's resource table also lists kinds our placements never show (the
    # cook's field crops, a few scholar plants); they stay in the list and read
    # "no spots recorded" instead of being dropped silently.
    ids = sorted({eintrag[4] for eintrag in orte} | set(tabelle))
    index = {kennung: nummer for nummer, kennung in enumerate(ids)}

    # The map layer works per map; the crafting page lists the game's own areas
    # ("Chetwood", "Imênki Waste"), because a map is not a place a player names.
    karten = defaultdict(lambda: defaultdict(set))   # map -> (lat, lon) -> {type}
    zone_stellen = defaultdict(lambda: defaultdict(set))  # zone -> (lat, lon) -> {type}
    zone_karte = defaultdict(lambda: defaultdict(int))    # zone -> map -> spots
    for zone, karte, lat, lon, kennung in orte:
        nummer = index[kennung]
        karten[karte][(lat, lon)].add(nummer)
        zone_stellen[zone][(lat, lon)].add(nummer)
        zone_karte[zone][karte] += 1
    # Count spots, not variants: one place with "rich" and "normal" is one find.
    pro_zone = defaultdict(lambda: defaultdict(int))
    for zone, stellen in zone_stellen.items():
        for typen in stellen.values():
            for nummer in typen:
                pro_zone[zone][nummer] += 1

    ziel = args.ziel
    # Plain JSON next to the app's script files: the catalogue build reads JSON,
    # the map page loads the same content as window.MQL_*.
    rohdaten = ziel.parent / 'daten' / 'vorkommen'
    rohdaten.mkdir(parents=True, exist_ok=True)
    ordner = ziel / 'vorkommen'
    if ordner.exists():
        for alt in ordner.glob('*.js'):
            alt.unlink()
    ordner.mkdir(exist_ok=True)
    for karte, stellen in karten.items():
        liste = sorted([lat, lon, sorted(typen)] for (lat, lon), typen in stellen.items())
        text = json.dumps(liste, separators=(',', ':'), ensure_ascii=False)
        (ordner / ('%s.js' % karte)).write_text(
            '/* Written by build_vorkommen.py. */\nwindow.MQL_VORKOMMEN_KARTE = %s;\n' % text,
            encoding='utf-8')
        (rohdaten / ('%s.json' % karte)).write_text(text, encoding='utf-8')

    zonen_englisch = zonen(args.lore)
    for sprache in SPRACHEN:
        texte = namen(args.lore, sprache)
        gegenden = zonen_namen(args.lore, sprache)
        kopf = []
        for kennung in ids:
            beruf, stufe, englisch = tabelle.get(kennung, ('', 0, kennung))
            name = texte.get(kennung) or englisch or kennung
            kopf.append([kennung, name, beruf, stufe])
        gebiete = []
        for zone in pro_zone:
            name = gegenden.get(zone) or zonen_englisch.get(zone, '')
            if not name or name.startswith(('TBD', 'NAME_ME', 'Landmark Test')):
                continue
            haupt = max(zone_karte[zone].items(), key=lambda paar: paar[1])[0]
            gebiete.append([zone, name, haupt])
        gebiete.sort(key=lambda eintrag: eintrag[1].lower())
        inhalt = {'k': kopf,
                  'g': gebiete,
                  'm': [[zone, sorted(pro_zone[zone].items())] for zone, _n, _k in gebiete]}
        text = json.dumps(inhalt, separators=(',', ':'), ensure_ascii=False)
        # Ready-to-merge rows for the central search index (build_suche.py):
        # kind, id, name, context, level.
        fach = berufsnamen(sprache)
        suche = [['v', kennung, kopf[nummer][1],
                  '%s · %s' % (fach.get(kopf[nummer][2], kopf[nummer][2]), kopf[nummer][3]),
                  kopf[nummer][3]] for nummer, kennung in enumerate(ids)]
        (rohdaten / ('suche-vorkommen-%s.json' % sprache)).write_text(
            json.dumps(suche, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')
        (ziel / ('vorkommen-%s.js' % sprache)).write_text(
            '/* Written by build_vorkommen.py. */\nwindow.MQL_VORKOMMEN = %s;\n' % text,
            encoding='utf-8')
        (rohdaten / ('vorkommen-%s.json' % sprache)).write_text(text, encoding='utf-8')
        print('%s: %d Sorten, %d Gebiete, %d Karten, %d Stellen'
              % (sprache, len(kopf), len(gebiete), len(karten), len(orte)))
    if verloren:
        print('ohne Karte:', sum(verloren.values()), dict(sorted(verloren.items())))


if __name__ == '__main__':
    main()
