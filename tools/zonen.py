"""Which room a position stands in.

Which place a position stands in.

Every position of the client's geo export carries a landblock (region, block X,
block Y) and a cell. The client's landblock data names the area of every block
and a dungeon for some blocks and cells, so a position resolves to a room
("Thorin's Hall") or to a world area ("Hobbiton-Bywater") without guessing:

- ``landblocks.xml``: area and dungeon per block, dungeon per cell. The newest
  file wins - the repository checkout of LOTRO Companion is ahead of the copy in
  its application folder.
- ``geoAreas.xml`` + ``labels/<language>/geoAreas.xml``: region → territory →
  area, the way the client groups the world.
- ``dungeons.xml`` + ``labels/<language>/dungeons.xml``: interiors with their own
  name and their map picture ("Thorin's Hall", "Die Verlassene Herberge").

Placeholder names such as "Unexplored Territory" are dropped - they name nothing.
"""
from __future__ import annotations

import html
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from itemnamen import sauberer_name

LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')
# Landblocks from the repository checkout of LOTRO Companion: newer than the copy
# in the application folder. The newer of the two files is used, so a refreshed
# checkout wins on its own.
LAND_REPO = Path.home() / 'Developer' / 'Lotro' / 'companion' / 'lotro-data' / 'lore' / 'landblocks.xml'
LANGS = ('de', 'en', 'fr')

# Names the client uses where it has no real place name. They say nothing about
# where a vendor stands, so they behave like a missing name.
PLATZHALTER = {
    'unexplored territory', 'unerforschtes gebiet', 'territoire inexploré',
    'unknown', 'unbekannt', 'inconnu',
}

# The position export writes five decimals and the marker files the same; five
# decimals therefore match exactly, while a coarser key would merge two
# placements of the same NPC in different rooms.
STELLEN = 5


def karten_infos() -> dict[tuple[int, str], tuple[int, int]]:
    """Client area name -> unique catalogue map id and its actual tier.

    The client's areas and the catalogue's maps are two worlds with their own
    ids. Names can differ by a leading article ("The North Downs" / "North
    Downs") or a parent prefix ("Rohan - Westemnet" / "Westemnet"). Try the
    exact name and tier first; relaxed matches are accepted only when unique.
    The returned tier is the map's, not the geo-area's.
    """
    datei = Path(__file__).resolve().parents[1] / 'daten' / 'karten.json'
    if not datei.is_file():
        return {}
    karten = json.loads(datei.read_text(encoding='utf-8'))
    nach_name: dict[str, list[tuple[int, int]]] = {}
    exakt: dict[tuple[int, str], list[tuple[int, int]]] = {}
    artikel = ('the', 'les', 'la', 'le', 'die', 'der', 'das', 'el', 'il', 'lo', 'los', 'las')
    for karte in karten:
        name = falten(karte.get('name') or '')
        tier = int(karte.get('tier') or 0)
        wert = (int(karte['idx']), tier)
        if not name:
            continue
        nach_name.setdefault(name, []).append(wert)
        exakt.setdefault((tier, name), []).append(wert)
    aliases: dict[tuple[int, str], set[tuple[int, int]]] = {}
    for karte in karten:
        name = falten(karte.get('name') or '')
        tier = int(karte.get('tier') or 0)
        wert = (int(karte['idx']), tier)
        variants = {name}
        for art in artikel:
            if name and name.startswith(art) and len(name) > len(art) + 2:
                variants.add(name[len(art):])
            if name:
                variants.add(art + name)
        # The client names some Rohan areas as "Rohan - Westemnet", while
        # the map index uses only the territory name.
        variants.add('rohan' + name)
        variants.add('rohan' + 'the' + name)
        for variant in variants:
            if variant:
                aliases.setdefault((tier, variant), set()).add(wert)
    result = {}
    names = {name for _, name in aliases}
    for name in names:
        all_name = set().union(*(values for (candidate_tier, candidate_name), values in aliases.items()
                                 if candidate_name == name))
        for tier in range(1, 6):
            exact = exakt.get((tier, name), [])
            if len(exact) == 1:
                result[(tier, name)] = exact[0]
            elif not exact and len(all_name) == 1:
                result[(tier, name)] = next(iter(all_name))
    return result


def karten_ids() -> dict[tuple[int, str], int]:
    """Compatibility view of the unique map matches."""
    return {key: value[0] for key, value in karten_infos().items()}


def falten(text: str) -> str:
    """A name without case, accents or punctuation, for matching game and site."""
    text = unicodedata.normalize('NFKD', str(text or ''))
    text = ''.join(zeichen for zeichen in text if not unicodedata.combining(zeichen))
    return re.sub(r'[^a-z0-9]+', '', text.lower())


def zonen(lore: Path = LORE) -> dict[int, dict]:
    """Zone id -> ``{"art": …, "name": {…}, "kette": [{…}]}``.

    Only zones with a usable name are kept. The name is the one the client
    shows, without its second line: dungeon strings carry "Name\\nSubtitle"
    ("Dâr Lajad\\nThe Meeting-hall"), and the room is what a player looks for.

    `kette` names the way down from the region (region, then territory) for
    areas of the world; a dungeon has no ancestors in the client's data, so its
    chain stays empty and the page falls back to the recorded region.
    """
    arten: dict[int, str] = {}
    roh: dict[int, str] = {}
    eltern: dict[int, int | None] = {}
    art_je_id: dict[int, str] = {}
    for treffer in re.finditer(r'<(region|territory|area)\b([^>]*)>',
                               (lore / 'geoAreas.xml').read_text(encoding='utf-8')):
        felder = dict(re.findall(r'(\w+)="([^"]*)"', treffer.group(2)))
        if 'id' not in felder:
            continue
        ident = int(felder['id'])
        art_je_id[ident] = treffer.group(1)
        eltern[ident] = int(felder['parentId']) if felder.get('parentId') else None
        roh.setdefault(ident, felder.get('name', ''))
        if treffer.group(1) != 'area':
            continue
        arten[ident] = 'area'
        roh[ident] = felder.get('name', '')
    for treffer in re.finditer(
            r'<dungeon id="(\d+)" name="([^"]*)"',
            (lore / 'dungeons.xml').read_text(encoding='utf-8')):
        ident = int(treffer.group(1))
        arten.setdefault(ident, 'dungeon')
        roh.setdefault(ident, treffer.group(2))

    # All names, so the ancestors of an area can be named as well.
    alle: dict[int, dict[str, str]] = {}
    for sprache in LANGS:
        for datei in ('geoAreas', 'dungeons'):
            pfad = lore / 'labels' / sprache / (datei + '.xml')
            if not pfad.is_file():
                continue
            for treffer in re.finditer(r'<label key="(\d+)" value="([^"]*)"',
                                       pfad.read_text(encoding='utf-8')):
                ident = int(treffer.group(1))
                if ident in art_je_id or ident in arten:
                    alle.setdefault(ident, {})[sprache] = treffer.group(2)
    namen: dict[int, dict[str, str]] = {}
    for ident in arten:
        eintrag = namen.setdefault(ident, {})
        quellen = (alle.get(ident) or {},)
        for sprache in LANGS:
            eintrag[sprache] = (quellen[0].get(sprache) or roh.get(ident, ''))

    karten = karten_infos()
    ergebnis: dict[int, dict] = {}
    for ident, art in arten.items():
        texte = {sprache: ortsname(namen[ident].get(sprache, ''), sprache) for sprache in LANGS}
        if not any(texte.values()):
            continue
        kette = []
        vater = eltern.get(ident)
        tiefe = 0
        while vater and tiefe < 3:
            vater_texte = {sprache: ortsname((alle.get(vater) or {}).get(sprache, ''), sprache)
                           for sprache in LANGS}
            if any(vater_texte.values()):
                stufe = 2 if tiefe == 0 else 1
                zuordnung = karten.get((stufe, falten(alle.get(vater, {}).get('en')
                                                      or roh.get(vater, ''))))
                kette.insert(0, {'id': vater, 'tier': stufe,
                                 'name': vater_texte,
                                 'map': zuordnung[0] if zuordnung else None,
                                 'maptier': zuordnung[1] if zuordnung else None})
            vater = eltern.get(vater)
            tiefe += 1
        ergebnis[ident] = {'art': art, 'name': texte, 'kette': kette}
    return ergebnis


def ortsname(text: str, sprache: str) -> str:
    """One readable place name: first line, no client markup."""
    zeile = html.unescape(str(text or '')).replace('\r', '\n').split('\n')[0].strip()
    name = sauberer_name(zeile, sprache).strip()
    if name.lower() in PLATZHALTER or name.lower().startswith('tbd'):
        return ''
    return name


def innenkarten(lore: Path = LORE, ohne_zuschnitt: bool = False) -> dict[int, dict]:
    """Zone id -> the room's own picture: ``{"map": id, "bild": file, "west": …}``.

    A dungeon names its basemap (`dungeons.xml`), and `maps/maps/maps.xml` holds
    that basemap's image and frame. The picture is the resource the map macro
    serves (``<map id>.png`` under ``Karten/``). Rooms without a basemap (or
    without a frame) are simply absent - no picture is invented.

    The exported pictures are cropped to their drawn part
    (`tools/hole_innenkarten.py`, recorded in `daten/innenkarten.json`); the frame
    is moved onto that cut-out, so a position still lands on the right spot.
    `ohne_zuschnitt` gives the client's original frame, for the exporter itself.
    """
    basemap: dict[int, int] = {}
    for treffer in re.finditer(r'<dungeon id="(\d+)" name="([^"]*)" basemapId="(\d+)"',
                               (lore / 'dungeons.xml').read_text(encoding='utf-8')):
        basemap[int(treffer.group(1))] = int(treffer.group(3))
    if not basemap:
        return {}
    rahmen: dict[int, dict] = {}
    for treffer in re.finditer(r'<map id="(\d+)" name="([^"]*)" imageId="(\d+)">(.*?)</map>',
                               (lore / 'maps' / 'maps' / 'maps.xml').read_text(encoding='utf-8'),
                               re.S):
        koerper = treffer.group(4)
        tief = re.search(r'<min longitude="([-\d.]+)" latitude="([-\d.]+)"', koerper)
        hoch = re.search(r'<max longitude="([-\d.]+)" latitude="([-\d.]+)"', koerper)
        if not (tief and hoch):
            continue
        ident = int(treffer.group(1))
        rahmen[int(treffer.group(3))] = {
            'map': ident, 'bild': '%d.png' % ident, 'name': treffer.group(2),
            'west': float(tief.group(1)), 'south': float(tief.group(2)),
            'east': float(hoch.group(1)), 'north': float(hoch.group(2))}
    ergebnis: dict[int, dict] = {}
    for zone, bild in basemap.items():
        if bild in rahmen:
            ergebnis[zone] = dict(rahmen[bild], bild_id=bild)

    schnitte = {} if ohne_zuschnitt else zuschnitte()
    for karte in ergebnis.values():
        schnitt = schnitte.get(str(karte['map']))
        if schnitt:
            karte.update(zuschnitt_rahmen(karte, schnitt['original'], schnitt['crop']))
    return ergebnis


def zuschnitte() -> dict[str, dict]:
    """The recorded crop boxes of the exported interior pictures."""
    datei = Path(__file__).resolve().parents[1] / 'daten' / 'innenkarten.json'
    if not datei.is_file():
        return {}
    return json.loads(datei.read_text(encoding='utf-8'))


def zuschnitt_rahmen(karte: dict, original: list[int], box: list[int]) -> dict:
    """The part of the frame that the cropped picture shows."""
    breite, hoehe = original
    links, oben, weite, tiefe = box
    spanne_x = karte['east'] - karte['west']
    spanne_y = karte['north'] - karte['south']
    return {
        'west': karte['west'] + links / breite * spanne_x,
        'east': karte['west'] + (links + weite) / breite * spanne_x,
        'north': karte['north'] - oben / hoehe * spanne_y,
        'south': karte['north'] - (oben + tiefe) / hoehe * spanne_y,
    }


def enthaelt(karte: dict, lat: float, lon: float) -> bool:
    """Does this frame hold the position?"""
    return (karte['south'] <= lat <= karte['north']
            and karte['west'] <= lon <= karte['east'])


def pin(karte: dict, lat: float, lon: float) -> tuple[float, float]:
    """Position inside the picture, in percent from the left and the top."""
    breite = karte['east'] - karte['west']
    hoehe = karte['north'] - karte['south']
    if not (breite > 0 and hoehe > 0):
        return 50.0, 50.0
    x = (lon - karte['west']) / breite * 100
    y = (karte['north'] - lat) / hoehe * 100
    return round(min(100.0, max(0.0, x)), 1), round(min(100.0, max(0.0, y)), 1)


def landdatei(lore: Path = LORE) -> Path | None:
    """The newest landblock file: the Companion checkout beats its app folder."""
    kandidaten = [pfad for pfad in (LAND_REPO, lore / 'landblocks.xml') if pfad.is_file()]
    if not kandidaten:
        return None
    return max(kandidaten, key=lambda pfad: pfad.stat().st_mtime)


_BLOECKE: dict[tuple, dict] = {}


def bloecke(lore: Path = LORE) -> dict[tuple[int, int, int], dict]:
    """(region, blockX, blockY) -> area, dungeon and the dungeons of its cells."""
    datei = landdatei(lore)
    if datei is None:
        return {}
    schluessel = (str(datei), datei.stat().st_mtime)
    if _BLOECKE.get('_key') == schluessel:
        return _BLOECKE['map']
    bloecke_: dict[tuple[int, int, int], dict] = {}
    text = datei.read_text(encoding='utf-8')
    for treffer in re.finditer(r'<landblock ([^>]*?)(?:/>|>(.*?)</landblock>)', text, re.S):
        felder = dict(re.findall(r'(\w+)="([^"]*)"', treffer.group(1)))
        try:
            schluessel_block = (int(felder['region']), int(felder['blockX']),
                                int(felder['blockY']))
        except (KeyError, ValueError):
            continue
        zellen: dict[int, int] = {}
        for zelle in re.finditer(r'<cell ([^>]*)/>', treffer.group(2) or ''):
            werte = dict(re.findall(r'(\w+)="([^"]*)"', zelle.group(1)))
            try:
                zellen[int(werte['index'])] = int(werte.get('dungeonId') or 0)
            except (KeyError, ValueError):
                continue
        bloecke_[schluessel_block] = {
            'area': int(felder.get('areaId') or 0),
            'dungeon': int(felder.get('dungeonId') or 0),
            'zellen': zellen,
        }
    _BLOECKE.clear()
    _BLOECKE.update({'_key': schluessel, 'map': bloecke_})
    return bloecke_


def ort(block: dict | None, cell: int) -> tuple[int, int]:
    """(area id, dungeon id) of a position inside its landblock.

    A cell names its own dungeon where the client knows one; otherwise the block
    does. The area names the piece of world the block belongs to - also for a
    room ("Southern Barrow-downs" for the tombs in it).
    """
    if not block:
        return 0, 0
    return block['area'], block['zellen'].get(int(cell)) or block['dungeon'] or 0


def anreichern(plaetze, lore: Path = LORE) -> None:
    """Write the landblock place onto place dicts that carry a ``block``.

    Used by the vendor, quest giver and landmark builders: the room or area as
    ``ort`` (DE/EN/FR), the chain above it as ``kette`` and, where the room's
    picture frame holds the point, ``bild`` with the pin. Places without a
    landblock stay untouched.
    """
    ziele = [(did, *place['block']) for did, place in plaetze
             if place.get('block') and len(place['block']) == 4]
    if not ziele:
        return
    namen = zonen(lore)
    treffer = orte(ziele, lore=lore)
    bilder = innenkarten(lore)
    for did, place in plaetze:
        block = place.get('block')
        if not block or len(block) != 4:
            continue
        area, dungeon = treffer.get((did, *block), (0, 0))
        if dungeon and dungeon in namen:
            place['ort'] = namen[dungeon]['name']
            # A room is not on a world map, whatever frame its coordinates
            # happen to fall into: the client's landblock says "inside".
            place['map'] = None
            place.pop('quest', None)
            # Some builders had already matched the same coordinates to a
            # broad landscape frame; that assignment is not valid indoors.
            for key in ('region', 'area', 'x', 'y'):
                place.pop(key, None)
        elif area and area in namen:
            place['ort'] = namen[area]['name']
        eintrag = namen.get(area) if area else None
        if eintrag and eintrag.get('kette'):
            place['kette'] = [{'id': teil['id'], 'tier': teil['tier'],
                               'name': teil['name'], 'map': teil.get('map'),
                               'maptier': teil.get('maptier')}
                              for teil in eintrag['kette']]
        karte = bilder.get(dungeon) if dungeon else None
        if karte and enthaelt(karte, place['lat'], place['lon']):
            place['bild'] = karte['bild']
            place['pin_x'], place['pin_y'] = pin(karte, place['lat'], place['lon'])


def orte(ziele, lore: Path = LORE) -> dict[tuple, tuple[int, int]]:
    """Position -> (area id, dungeon id) from the landblocks.

    ``ziele`` holds ``(did, region, blockX, blockY, cell)``. A position whose
    landblock is missing stays out - it has no evidenced place.
    """
    karte = bloecke(lore)
    if not karte:
        return {}
    ergebnis: dict[tuple, tuple[int, int]] = {}
    for ziel in ziele:
        did, region, bx, by, cell = ziel
        block = karte.get((int(region), int(bx), int(by)))
        if block is None:
            continue
        ergebnis[(int(did), int(region), int(bx), int(by), int(cell))] = ort(block, cell)
    return ergebnis
