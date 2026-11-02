#!/usr/bin/env python3
"""Macht aus den Karten-PNGs WebP-Dateien fürs Web.

PNG ist für eine Website zu groß: die 160 Karten eines Gebietssatzes liegen bei
rund 290 MB. WebP mit Qualität 85 ist erfahrungsgemäß 60–70 % kleiner, bei
Kartengrafik ohne sichtbaren Verlust.

Aufruf:

    python3 baue_webp.py --sprache de
    python3 baue_webp.py --sprache en

Ergebnis: `webp/<sprache>/<Karten-ID>.webp`, dieselben Dateinamen wie die PNGs.
Vorhandene WebP-Dateien werden nur ersetzt, wenn sie älter sind als das PNG.
"""
import argparse
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
QUELLEN = {'de': 'Karten', 'en': 'Karten_en'}


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sprache', choices=tuple(QUELLEN), default='de')
    parser.add_argument('--guete', type=int, default=85)
    parser.add_argument('--ziel', type=Path, default=None,
                        help='Standard: webp/<sprache>/')
    optionen = parser.parse_args()

    try:
        from PIL import Image
    except ImportError:
        print('Pillow fehlt: python3 -m pip install pillow', file=sys.stderr)
        return 2

    quelle = HIER / QUELLEN[optionen.sprache]
    ziel = optionen.ziel or (HIER / 'webp' / optionen.sprache)
    if not quelle.is_dir():
        print('FEHLT: %s' % quelle, file=sys.stderr)
        return 2
    ziel.mkdir(parents=True, exist_ok=True)

    pngs = sorted(quelle.glob('*.png'))
    if not pngs:
        print('Keine PNG-Dateien in %s' % quelle, file=sys.stderr)
        return 1

    gesamt_png = gesamt_webp = 0
    neu = 0
    for nummer, datei in enumerate(pngs, 1):
        ausgabe = ziel / (datei.stem + '.webp')
        gesamt_png += datei.stat().st_size
        if ausgabe.is_file() and ausgabe.stat().st_mtime >= datei.stat().st_mtime:
            gesamt_webp += ausgabe.stat().st_size
            continue
        with Image.open(datei) as bild:
            if bild.mode not in ('RGB', 'RGBA'):
                bild = bild.convert('RGBA' if 'A' in bild.mode else 'RGB')
            bild.save(ausgabe, 'WEBP', quality=optionen.guete, method=6)
        gesamt_webp += ausgabe.stat().st_size
        neu += 1
        if nummer % 40 == 0:
            print('  %d/%d' % (nummer, len(pngs)))

    png_mb = gesamt_png / (1024 * 1024)
    webp_mb = gesamt_webp / (1024 * 1024)
    print('%d Karten (%s), %d neu geschrieben' %
          (len(pngs), optionen.sprache, neu))
    print('  PNG:  %6.1f MB' % png_mb)
    print('  WebP: %6.1f MB  (%.0f %% kleiner, Güte %d)' %
          (webp_mb, (1 - webp_mb / png_mb) * 100 if png_mb else 0,
           optionen.guete))
    print('  Ziel: %s' % ziel.relative_to(HIER))
    return 0


if __name__ == '__main__':
    sys.exit(main())
