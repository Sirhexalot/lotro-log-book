#!/usr/bin/env python3
"""Interior maps for pages that name a room instead of a landscape.

A vendor in a hall, an inn or a cave has no landscape frame. The client still
has a picture of that room: `dungeons.xml` names its basemap, `maps/maps/maps.xml`
holds the image id and the frame, and the position lies inside that frame. This
tool exports exactly those maps - and only those - in every client language.

The client's interior pictures carry wide empty borders: the floor plan often
uses 10-30 % of the canvas. The tool therefore crops every picture to the drawn
part (padded to 4:3) and records the crop in `daten/innenkarten.json`, so
`tools/zonen.py` can still turn a position into the right spot on the picture.

It takes the rooms from `tools/zonen.py` and the used ones from vendor,
quest-giver and landmark data, so it never invents a map: the same evidence
that names the room decides which picture belongs to it.

Usage:
    python3 tools/hole_innenkarten.py                  # all three languages
    python3 tools/hole_innenkarten.py --sprache de
    python3 tools/hole_innenkarten.py --nur 2          # small test run

Result: `Karten[_en|_fr]/<map-ID>.png`; `baue_webp.py` turns them into WebP.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'tools'))
from hole_karten import STANDARD_CLIENT, STANDARD_LIB, hole_dat  # noqa: E402
from zonen import LORE, enthaelt, innenkarten, orte, zonen  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')
ZIEL = {'de': ROOT / 'Karten', 'en': ROOT / 'Karten_en', 'fr': ROOT / 'Karten_fr'}
ROHDATEN = ROOT / 'daten' / 'innenkarten.json'
# Original pictures straight from the client stay here, so a re-run crops the
# same source instead of cropping what was already cropped.
ZWISCHEN = Path.home() / '.cache' / 'llb-innenkarten'


def gebrauchte_karten(lore: Path = LORE) -> dict[int, dict]:
    """Map id -> room picture used by a vendor, giver or landmark."""
    ortsbilder = innenkarten(lore, ohne_zuschnitt=True)
    stellen = {}
    quellen = (
        ('haendler.json', 'vendors', 16),
        ('auftraggeber.json', 'givers', 16),
        ('landmarken.json', 'landmarken', 16),
    )
    for datei, schluessel, basis in quellen:
        pfad = ROOT / 'daten' / datei
        if not pfad.is_file():
            continue
        daten = json.loads(pfad.read_text(encoding='utf-8'))
        for ident, eintrag in daten[schluessel].items():
            for place in (eintrag.get('places') or [eintrag]):
                block = place.get('block')
                if block:
                    stellen[(int(ident, basis), *block)] = place
    gebraucht: dict[int, dict] = {}
    for schluessel, (_area, dungeon) in orte(list(stellen), lore=lore).items():
        karte = ortsbilder.get(dungeon) if dungeon else None
        if not karte:
            continue
        place = stellen[schluessel]
        if enthaelt(karte, place['lat'], place['lon']):
            gebraucht[karte['map']] = karte
    return gebraucht


def zuschnitt(roh: Path, sprache: str, kennung: int) -> list[int] | None:
    """Crop box (left, top, width, height) of the drawn part, or None.

    Takes the union of the three languages' pictures, so a long label in one
    language cannot be cut off. The box is padded to the picture's own aspect
    and stays inside it.
    """
    from PIL import Image, ImageChops

    kasten = None
    groesse = None
    for sprache_ in SPRACHEN:
        datei = roh / sprache_ / ('%d.png' % kennung)
        if not datei.is_file():
            continue
        bild = Image.open(datei).convert('RGB')
        groesse = groesse or bild.size
        if bild.size != groesse:
            continue
        leer = Image.new('RGB', bild.size, (0, 0, 0))
        teil = ImageChops.difference(bild, leer).getbbox()
        if not teil:
            continue
        kasten = teil if kasten is None else (min(kasten[0], teil[0]), min(kasten[1], teil[1]),
                                              max(kasten[2], teil[2]), max(kasten[3], teil[3]))
    if not kasten or not groesse:
        return None
    breite, hoehe = groesse
    rand = 12
    left, top = max(0, kasten[0] - rand), max(0, kasten[1] - rand)
    right, bottom = min(breite, kasten[2] + rand), min(hoehe, kasten[3] + rand)
    # Pad to the picture's aspect so the card does not stretch anything.
    seiten = breite / hoehe
    w, h = right - left, bottom - top
    if w / h > seiten:
        neu = int(round(w / seiten))
        if neu <= hoehe:
            h = neu
        else:
            w, h = breite, hoehe
    else:
        neu = int(round(h * seiten))
        if neu <= breite:
            w = neu
        else:
            w, h = breite, hoehe
    # Keep the box inside the picture, centred on the drawn part.
    cx, cy = (left + right) / 2, (top + bottom) / 2
    left = int(round(min(max(0, cx - w / 2), breite - w)))
    top = int(round(min(max(0, cy - h / 2), hoehe - h)))
    if w >= breite * 0.98 and h >= hoehe * 0.98:
        return None
    return [left, top, w, h]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sprache', choices=SPRACHEN + ('alle',), default='alle')
    parser.add_argument('--nur', type=int, default=0,
                        help='export only the first N pictures (test run)')
    parser.add_argument('--alle', action='store_true', help='fetch every picture again')
    parser.add_argument('--client', type=Path, default=STANDARD_CLIENT)
    parser.add_argument('--lib', type=Path, default=STANDARD_LIB)
    parser.add_argument('--lore', type=Path, default=LORE)
    optionen = parser.parse_args()

    karten = gebrauchte_karten(optionen.lore)
    print('%d Innenraumkarten werden gebraucht' % len(karten))
    sprachen = SPRACHEN if optionen.sprache == 'alle' else (optionen.sprache,)
    fehler = 0
    for sprache in sprachen:
        roh = ZWISCHEN / sprache
        roh.mkdir(parents=True, exist_ok=True)
        zu_holen = [{'id': str(ident), 'bild_id': karte['bild_id'], 'name': karte['name']}
                    for ident, karte in sorted(karten.items())
                    if optionen.alle or not (roh / karte['bild']).is_file()]
        if optionen.nur:
            zu_holen = zu_holen[:optionen.nur]
        if not zu_holen:
            print('%s: nichts zu holen' % sprache)
            continue
        if not Path(optionen.client).is_dir():
            print('Kein Client gefunden: %s' % optionen.client, file=sys.stderr)
            return 2
        gut, _, probleme = hole_dat(zu_holen, roh, optionen.client, optionen.lib, sprache)
        fehler += len(probleme)
        print('%s: %d von %d Bildern aus dem Client' % (sprache, gut, len(zu_holen)))
        for name, bild in probleme:
            print('  FEHLER %s (Bild %s)' % (name, bild))

    from PIL import Image

    schnitte: dict[str, dict] = {}
    for ident, karte in sorted(karten.items()):
        box = zuschnitt(ZWISCHEN, sprache, ident)
        quelle = None
        for sprache_ in SPRACHEN:
            datei = ZWISCHEN / sprache_ / karte['bild']
            if datei.is_file():
                quelle = datei
                break
        if not quelle:
            continue
        if box:
            schnitte[str(ident)] = {'original': list(Image.open(quelle).size), 'crop': box}
        for sprache_ in sprachen:
            roh = ZWISCHEN / sprache_ / karte['bild']
            if not roh.is_file():
                continue
            ziel = ZIEL[sprache_] / karte['bild']
            ziel.parent.mkdir(parents=True, exist_ok=True)
            if ziel.is_file() and ziel.stat().st_mtime >= roh.stat().st_mtime and not box:
                continue
            bild = Image.open(roh).convert('RGB')
            if box:
                bild = bild.crop((box[0], box[1], box[0] + box[2], box[1] + box[3]))
            bild.save(ziel)
    ROHDATEN.parent.mkdir(parents=True, exist_ok=True)
    ROHDATEN.write_text(json.dumps(schnitte, ensure_ascii=False, indent=1, sort_keys=True),
                        encoding='utf-8')
    print('%d Karten geschrieben, %d mit Zuschnitt (%s)' % (
        len(karten), len(schnitte), ROHDATEN))
    if not fehler:
        print('WebP: python3 baue_webp.py --sprache de|en|fr')
    return 0 if not fehler else 1


if __name__ == '__main__':
    raise SystemExit(main())
