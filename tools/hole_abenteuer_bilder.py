#!/usr/bin/env python3
"""Expansion emblems for the adventure overview.

Two kinds of image end up in one folder, and the list below says which is which:

* `official` – key art from the official LOTRO shop page. Only the expansions
  still sold there have one; the images are promotional artwork by Standing
  Stone Games / Daybreak and are not relicensed by us.
* `map` – a crop of our own game map, used where no official key art exists.
  It is not a substitute for a missing logo, it is a landscape medallion.

The result is written to `web/bild/abenteuer/` (not in git, like the other
built images). The page only shows an emblem when the file exists.

    python3 tools/hole_abenteuer_bilder.py
"""
import argparse
import json
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ZIEL = ROOT / 'web' / 'bild' / 'abenteuer'
MAPS = ROOT / 'webp' / 'de'

# pack -> (kind, source). Official images are the standard-edition key art of
# the shop page https://www.lotro.com/expansions (August 2026).
QUELLEN = {
    'base': ('map', '268437557'),
    'moria': ('map', '268442355'),
    'mirkwood': ('map', '268443855'),
    'isengard': ('map', '268447030'),
    'rohan': ('map', '268448407'),
    'helms-deep': ('map', '268449767'),
    'mordor': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/215/284.png?v=1.0'),
    'minas-morgul': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/232/767.jpg?v=1.0'),
    'three-peaks': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/232/770.jpg?v=1.0'),
    'gundabad': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/232/743.jpg?v=1.0'),
    'before-shadow': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/271/241.jpg?v=1.0'),
    'umbar': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/290/321.jpg?v=1.0'),
    'morgoth': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/317/241.jpg?v=1.0'),
    'harad': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/347/143.jpg?v=1.0'),
    'wolves': ('official', 'https://assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/347/144.jpg?v=1.0'),
}

SIZE = 160


def square(image):
    """Centre square of the artwork, without the edition banner at the bottom."""
    width, height = image.size
    # The shop key art carries a coloured edition band along the bottom edge.
    art = image.crop((0, 0, width, int(height * 0.78)))
    width, height = art.size
    edge = min(width, height)
    left = (width - edge) // 2
    top = (height - edge) // 2
    return art.crop((left, top, left + edge, top + edge))


def from_official(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'LOTRO Log Book emblem fetch'})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read()
    from io import BytesIO
    return Image.open(BytesIO(raw)).convert('RGB')


def from_map(identifier):
    return Image.open(MAPS / (identifier + '.webp')).convert('RGB')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path, default=ZIEL)
    options = parser.parse_args()
    options.ziel.mkdir(parents=True, exist_ok=True)
    report = {}
    for pack, (kind, source) in QUELLEN.items():
        image = from_official(source) if kind == 'official' else from_map(source)
        image = square(image).resize((SIZE, SIZE), Image.LANCZOS)
        target = options.ziel / (pack + '.webp')
        image.save(target, 'WEBP', quality=88, method=6)
        report[pack] = {'kind': kind, 'source': source, 'file': target.name}
        print('%-14s %-9s %s' % (pack, kind, source))
    (options.ziel / 'quellen.json').write_text(
        json.dumps({'schema': 1, 'size': SIZE, 'emblems': report}, ensure_ascii=False, indent=1),
        encoding='utf-8')
    print('%d Bilder in %s' % (len(report), options.ziel))


if __name__ == '__main__':
    main()
