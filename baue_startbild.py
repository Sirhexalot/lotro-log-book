#!/usr/bin/env python3
"""Builds the start image: Bree-land with open and completed objectives.

Not a screenshot, but the same calculation as the page: target locations from
`daten/quests.json`, frame from `daten/karten.json`, colour from
`web/fortschritt.js`. This way the image shows exactly what the map shows.

Usage:

    python3 baue_startbild.py
"""
import argparse
import json
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
BREITE = 1200
GOLD = (217, 154, 60)
GRUEN = (111, 156, 106)
RAND = (20, 17, 14)


def fortschritt():
    """Completed quests from web/fortschritt.js, without evaluating JS."""
    datei = HIER / 'web/fortschritt.js'
    if not datei.is_file():
        return set()
    text = datei.read_text(encoding='utf-8')
    marker = '"ids":'
    stelle = text.find(marker)
    if stelle < 0:
        return set()
    anfang = text.find('[', stelle)
    ende = text.find(']', anfang)
    return {teil.strip().strip('"') for teil in text[anfang + 1:ende].split(',')
            if teil.strip()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sprache', choices=('de', 'en'), default='de')
    optionen = parser.parse_args()

    karte_name = 'Bree-land'
    ordner = 'Karten' if optionen.sprache == 'de' else 'Karten_en'
    zieldatei = HIER / ('web/bild/start.jpg' if optionen.sprache == 'de'
                        else 'web/bild/start-en.jpg')
    daten_datei = HIER / ('daten/quests-%s.json' % optionen.sprache)

    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('Pillow missing: python3 -m pip install pillow', file=sys.stderr)
        return 2

    daten = json.loads(daten_datei.read_text(encoding='utf-8'))
    karten = {karte['idx']: karte for karte in daten['karten']}
    karte = next((k for k in daten['karten'] if k['name'] == karte_name), None)
    if karte is None:
        print('Map not found: %s' % karte_name, file=sys.stderr)
        return 1

    bild_datei = HIER / ordner / karte['bild']
    if not bild_datei.is_file():
        print('Image missing: %s' % bild_datei, file=sys.stderr)
        return 1

    fertig = fortschritt()
    breite_spanne = karte['east'] - karte['west']
    hoehe_spanne = karte['north'] - karte['south']

    bild = Image.open(bild_datei).convert('RGB')
    hoehe = round(BREITE * bild.height / bild.width)
    bild = bild.resize((BREITE, hoehe), Image.LANCZOS)
    zeichner = ImageDraw.Draw(bild, 'RGBA')

    punkte = 0
    for quest in daten['quests']:
        for ziel in quest['t']:
            if ziel[0] != karte['idx']:
                continue
            x = (ziel[2] - karte['west']) / breite_spanne * BREITE
            y = (karte['north'] - ziel[1]) / hoehe_spanne * hoehe
            farbe = GRUEN if quest['i'] in fertig else GOLD
            r = 5
            zeichner.ellipse([x - r - 1, y - r - 1, x + r + 1, y + r + 1],
                             fill=RAND + (220,))
            zeichner.ellipse([x - r, y - r, x + r, y + r], fill=farbe + (255,))
            punkte += 1

    zieldatei.parent.mkdir(parents=True, exist_ok=True)
    bild.save(zieldatei, 'JPEG', quality=86, optimize=True)
    print('%s: %d points, %d×%d -> %s' %
          (karte_name, punkte, BREITE, hoehe, zieldatei.relative_to(HIER)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
