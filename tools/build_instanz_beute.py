#!/usr/bin/env python3
"""Chest loot and interior map per instance, from the client-derived lore dump.

Source is the LotroCompanion data dump (`lore/instanceLoots.xml`, `loots.xml`,
`lore/labels/<sprache>/items.xml`, `dungeons.xml`, `landblocks.xml`). It is a
direct dump of the client DAT; the trophy graph itself is also readable from our
own client (see docs/fachbereiche/instanzenfinder-dat.md). The dump is cached
outside the repository; nothing of it is copied into the site.

What is resolved:

- `instanceLoots.xml`: one row per instance, difficulty tier, group size and
  level band, each naming a trophy list.
- `loots.xml`: the trophy graph - trophy list, weighted table, filtered table,
  treasure list, item table. Weights become probabilities inside their pool,
  `dropFrequency` stays a chance per chest.
- `labels/<sprache>/items.xml`: names for items our own catalogue filters out
  (bounties, stat tomes). Our catalogue keeps only four of the chest items.
- `landblocks.xml` + `dungeons.xml`: the instance's land blocks name a dungeon;
  its basemap id is the interior map image, exported like any other map.

Output `daten/instanz-beute.json` (local only, `daten/*.json` is ignored):

    {"schema": 1, "pools": [...], "instanzen": {"<id>": {"karte": ..., "beute": [...]}}}

Run:

    python3 tools/build_instanz_beute.py
    python3 tools/build_instanz_beute.py --quelle "/path/to/lore"
"""
from __future__ import annotations

import argparse
import json
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
DATEN = HIER / 'daten'
CACHE = Path.home() / '.cache' / 'llb-instanz-beute'
BASIS = 'https://raw.githubusercontent.com/LotroCompanion/lotro-data/master/lore/'
SPRACHEN = ('de', 'en', 'fr')
QUELLEN = (('instanceLoots.xml', 'instanceLoots.xml'),
           ('loots.xml', 'loots.xml'),
           ('dungeons.xml', 'dungeons.xml'),
           ('landblocks.xml', 'landblocks.xml'),
           *(('labels/%s/items.xml' % s, 'items-%s.xml' % s) for s in SPRACHEN))


def hole(relativ: str, name: str, verzeichnis: Path | None) -> Path:
    """Local dump if given, otherwise a cached download."""
    if verzeichnis is not None:
        pfad = Path(verzeichnis) / relativ
        if not pfad.is_file():
            raise SystemExit('MISSING: %s' % pfad)
        return pfad
    CACHE.mkdir(parents=True, exist_ok=True)
    ziel = CACHE / name
    if ziel.is_file() and ziel.stat().st_size > 0:
        return ziel
    print('  lade %s …' % relativ)
    with urllib.request.urlopen(BASIS + relativ) as antwort, ziel.open('wb') as strom:
        while True:
            block = antwort.read(1 << 20)
            if not block:
                break
            strom.write(block)
    return ziel


def lade_namen(pfad: Path, sprache: str) -> dict:
    """Item id -> name in one language, from the label files."""
    namen = {}
    for _, element in ET.iterparse(pfad, events=('end',)):
        if element.tag != 'label':
            continue
        wert = (element.get('value') or '').strip()
        if wert:
            namen[element.get('key')] = wert
        element.clear()
    return namen


def lade_graph(pfad: Path) -> dict:
    """Every loot element by (kind, id)."""
    graph = {}
    for _, element in ET.iterparse(pfad, events=('end',)):
        if element.tag in ('itemsTable', 'trophyList', 'treasureList',
                            'weightedTreasureTable', 'filteredTrophyTable',
                            'relicsList', 'relicsTreasureGroup'):
            graph[(element.tag, element.get('id'))] = element
    return graph


def gewicht(eintrag) -> float:
    if eintrag.get('weight') is not None:
        return float(eintrag.get('weight') or 0)
    if eintrag.get('dropFrequency') is not None:
        return float(eintrag.get('dropFrequency') or 0)
    return 1.0


def chance(eintrag, gesamt: float) -> float:
    """dropFrequency is a chance per chest; weight is relative to its pool."""
    if eintrag.get('dropFrequency') is not None:
        return float(eintrag.get('dropFrequency') or 0)
    return (float(eintrag.get('weight') or 0) / gesamt) if gesamt else 0.0


def loese(graph: dict, kind: str, kennung: str, faktor: float = 1.0,
          tiefe: int = 0, pfad: frozenset = frozenset()) -> dict:
    """Item id -> probability for one table."""
    knoten = graph.get((kind, kennung))
    if knoten is None or tiefe > 8 or (kind, kennung) in pfad:
        return {}
    pfad = pfad | {(kind, kennung)}
    ergebnis: dict = {}

    def dazu(item_id, chance_wert):
        if not item_id or chance_wert <= 0:
            return
        ergebnis[item_id] = ergebnis.get(item_id, 0.0) + chance_wert

    if knoten.tag == 'itemsTable':
        gesamt = sum(gewicht(e) for e in knoten) or 1.0
        for e in knoten:
            dazu(e.get('itemId'), faktor * chance(e, gesamt))
        return ergebnis

    if knoten.tag in ('trophyList', 'treasureList', 'weightedTreasureTable',
                      'filteredTrophyTable'):
        gesamt = sum(gewicht(e) for e in knoten) or 1.0
        for e in knoten:
            if e.get('itemId'):
                dazu(e.get('itemId'), faktor * chance(e, gesamt))
                continue
            # A trophy or treasure entry names a profile; a weighted or filtered
            # table names another trophy list.
            unter_kind = ('itemsTable' if e.get('treasureGroupProfileId')
                          else 'trophyList')
            unter_id = e.get('treasureGroupProfileId') or e.get('trophyListId')
            if not unter_id:
                continue
            for item_id, wert in loese(graph, unter_kind, unter_id,
                                       faktor * chance(e, gesamt),
                                       tiefe + 1, pfad).items():
                dazu(item_id, wert)
        return ergebnis

    # relicsList / relicsTreasureGroup: relics, not items.
    return ergebnis


def block_referenzen(roh: Path, ids: set) -> dict:
    """(region, blockX, blockY) of every encounter, from the raw template dump."""
    bloecke = defaultdict(list)
    with roh.open(encoding='utf-8') as strom:
        for zeile in strom:
            eintrag = json.loads(zeile)
            if eintrag['id'] not in ids:
                continue
            for vektor in (eintrag.get('properties') or {}).get(
                    'PrivateEncounterTemplate_ContainedLandBlockArray') or []:
                try:
                    teile = dict(stueck.split('=')
                                 for stueck in vektor['display'].split(','))
                except (KeyError, ValueError):
                    continue
                try:
                    region = int(float(teile['x']))
                    block_x = int(float(teile['y'])) // 8
                    block_y = int(float(teile['z'])) // 8
                except (KeyError, ValueError):
                    continue
                bloecke[eintrag['id']].append((str(region), block_x, block_y))
    return bloecke


def baue(verzeichnis: Path | None) -> dict:
    instanzen = json.loads((DATEN / 'instanzen.json').read_text(encoding='utf-8'))['instanzen']
    roh = DATEN / 'instanzen-roh.jsonl'
    if not roh.is_file():
        raise SystemExit('MISSING: %s (DatSourceReader export of the templates)' % roh)

    namen = {}
    for sprache in SPRACHEN:
        namen[sprache] = lade_namen(
            hole('labels/%s/items.xml' % sprache, 'items-%s.xml' % sprache, verzeichnis),
            sprache)
    graph = lade_graph(hole('loots.xml', 'loots.xml', verzeichnis))

    dungeon = {}
    for eintrag in ET.parse(hole('dungeons.xml', 'dungeons.xml', verzeichnis)).getroot():
        dungeon[int(eintrag.get('id'))] = {
            'name': eintrag.get('name') or '',
            'bild': int(eintrag.get('basemapId') or 0) or None,
        }
    landblock = {}
    for eintrag in ET.parse(hole('landblocks.xml', 'landblocks.xml', verzeichnis)).getroot():
        schluessel = (eintrag.get('region'), int(eintrag.get('blockX')),
                      int(eintrag.get('blockY')))
        wert = eintrag.get('dungeonId')
        if wert and wert != '0':
            landblock[schluessel] = int(wert)

    bloecke = block_referenzen(roh, set(instanzen))

    def item_eintrag(kennung: str) -> dict:
        texte = {sprache: namen[sprache].get(kennung, '') for sprache in SPRACHEN}
        eintrag = {'i': '%08X' % int(kennung)}
        if texte['de']:
            eintrag['n'] = texte['de']
        if texte['en'] and texte['en'] != texte['de']:
            eintrag.setdefault('n2', texte['en'])
        if texte['fr'] and texte['fr'] not in (texte['de'], texte.get('n2')):
            eintrag.setdefault('n3', texte['fr'])
        return eintrag

    def pool(kennung: str) -> list:
        gefunden = loese(graph, 'trophyList', kennung)
        liste = []
        for item, wert in sorted(gefunden.items(), key=lambda x: -x[1]):
            eintrag = item_eintrag(item)
            # Independent rolls may add up past 1 (a chest always holds the
            # bounty and may hold a tome); each single chance stays as is.
            eintrag['p'] = round(min(1.0, wert), 5)
            liste.append(eintrag)
        return liste

    gesehen: dict = {}
    # Every finder entry gets a page: the loot rows when the client has chest
    # tables, the interior map whenever its blocks name a dungeon.
    seiten = {kennung: {'beute': []} for kennung in instanzen}
    for eintrag in ET.parse(hole('instanceLoots.xml', 'instanceLoots.xml',
                                verzeichnis)).getroot().iter('instance'):
        kennung = '%08X' % int(eintrag.get('id'))
        if kennung not in instanzen:
            continue
        seite = seiten[kennung]
        for zeile in eintrag.findall('lootEntry'):
            schluessel = (int(zeile.get('minDifficulty')), int(zeile.get('maxDifficulty')),
                          int(zeile.get('minGroupSize')), int(zeile.get('maxGroupSize')),
                          int(zeile.get('minLevel')), int(zeile.get('maxLevel')))
            liste = pool(zeile.get('trophyListId'))
            if not liste:
                continue
            gesehen.setdefault(json.dumps(liste, sort_keys=True), len(gesehen))
            pos = gesehen[json.dumps(liste, sort_keys=True)]
            seite['beute'].append({'tier': [schluessel[0], schluessel[1]],
                                   'gruppe': [schluessel[2], schluessel[3]],
                                   'stufe': [schluessel[4], schluessel[5]],
                                   'pool': pos})

    # Interior map: the encounter's blocks name a dungeon, the dungeon names the
    # basemap image. Encounter copies of a landscape area resolve to that area.
    for kennung, seite in seiten.items():
        zaehler = Counter()
        for block in bloecke.get(kennung, []):
            gefunden = landblock.get(block)
            if gefunden:
                zaehler[gefunden] += 1
        if zaehler:
            dungeon_id = zaehler.most_common(1)[0][0]
            eintrag = dungeon.get(dungeon_id) or {}
            seite['karte'] = {'dungeon': str(dungeon_id),
                              'name': eintrag.get('name') or '',
                              'bild': eintrag.get('bild')}
        else:
            seite['karte'] = None

    return {
        'schema': 1,
        'quelle': {'dump': 'LotroCompanion/lotro-data master',
                   'dateien': [relativ for relativ, _ in QUELLEN]},
        'pools': [json.loads(text) for text, _ in
                  sorted(gesehen.items(), key=lambda x: x[1])],
        'instanzen': seiten,
    }


def main() -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('--quelle', type=Path, default=None,
                          help='directory holding the lore XML files; default: download')
    zerleger.add_argument('--ziel', type=Path, default=DATEN / 'instanz-beute.json')
    optionen = zerleger.parse_args()
    daten = baue(optionen.quelle)
    optionen.ziel.write_text(json.dumps(daten, ensure_ascii=False, separators=(',', ':')),
                             encoding='utf-8')
    eintraege = sum(len(s['beute']) for s in daten['instanzen'].values())
    mit_karte = sum(1 for s in daten['instanzen'].values() if s.get('karte'))
    gegenstaende = {(p['i']) for pool in daten['pools'] for p in pool}
    print('instanzen: %d, Beutezeilen: %d, Pools: %d, Gegenstände: %d, mit Karte: %d'
          % (len(daten['instanzen']), eintraege, len(daten['pools']),
             len(gegenstaende), mit_karte))
    print('geschrieben: %s' % optionen.ziel)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
