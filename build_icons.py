#!/usr/bin/env python3
"""Collect the item symbols the site needs, one WebP file per symbol ID.

The client stores an item's artwork as a 32×32 symbol. LOTRO Companion keeps
the symbols it has already decoded in `itemIcons.zip`; this script takes the
IDs from our own item export, so only symbols the site actually shows are
copied. One file serves every item with that symbol and all three languages.

    python3 build_icons.py             # writes web/bild/items/
    python3 build_icons.py --pruefen   # only report missing symbols

Output: `web/bild/items/<symbol>.webp` (lossless, 32×32) and
`daten/icons.json` with the source, counts and every missing ID.
Missing symbols are reported, never replaced by a made-up picture. The script
is read-only towards the client, Companion and the other data files.
"""
import argparse
import hashlib
import json
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

HIER = Path(__file__).resolve().parent
DATEN = HIER / 'daten'
ZIEL = HIER / 'web' / 'bild' / 'items'
QUELLE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/lib/itemIcons.zip')


def symbole():
    """Symbol ID -> one example item ID, from every item the site knows."""
    items = json.loads((DATEN / 'items.json').read_text(encoding='utf-8'))['items']
    gefunden = {}
    for iid, eintrag in items.items():
        symbol = eintrag.get('ic')
        if symbol:
            gefunden.setdefault(str(symbol), iid)
    return gefunden, items


def main():
    optionen = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    optionen.add_argument('--quelle', type=Path, default=QUELLE)
    optionen.add_argument('--ziel', type=Path, default=ZIEL)
    optionen.add_argument('--pruefen', action='store_true',
                          help='write nothing, only compare the needed IDs with the source')
    args = optionen.parse_args()

    try:
        from PIL import Image
    except ImportError:
        print('Pillow missing: python3 -m pip install pillow', file=sys.stderr)
        return 2
    if not args.quelle.is_file():
        print('MISSING: %s' % args.quelle, file=sys.stderr)
        return 2

    benoetigt, items = symbole()
    args.ziel.mkdir(parents=True, exist_ok=True)

    vorhanden, geschrieben, fehlend = set(), 0, []
    gesamt = 0
    with zipfile.ZipFile(args.quelle) as archiv:
        namen = {Path(name).stem for name in archiv.namelist()
                 if name.startswith('items/') and name.lower().endswith('.png')}
        for nummer, (symbol, beispiel) in enumerate(sorted(benoetigt.items()), 1):
            datei = args.ziel / (symbol + '.webp')
            if datei.is_file() and datei.stat().st_size:
                vorhanden.add(symbol)
                gesamt += datei.stat().st_size
                continue
            if symbol not in namen:
                fehlend.append({'symbol': symbol, 'item': beispiel})
                continue
            if args.pruefen:
                vorhanden.add(symbol)
                continue
            with archiv.open('items/%s.png' % symbol) as roh:
                with Image.open(roh) as bild:
                    bild = bild.convert('RGBA')
                    if bild.size != (32, 32):
                        print('  %s: unexpected size %s' % (symbol, bild.size), file=sys.stderr)
                    bild.save(datei, 'WEBP', lossless=True, method=6)
            vorhanden.add(symbol)
            geschrieben += 1
            gesamt += datei.stat().st_size
            if nummer % 500 == 0:
                print('  %d/%d' % (nummer, len(benoetigt)))

    if fehlend:
        print('MISSING SYMBOLS: %d (first: %s)' % (len(fehlend), fehlend[:3]), file=sys.stderr)
    if args.pruefen:
        print('Symbols needed: %d, available: %d, missing: %d' %
              (len(benoetigt), len(vorhanden), len(fehlend)))
        return 1 if fehlend else 0

    manifest = {
        'created_utc': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'source': str(args.quelle),
        'source_sha256': hashlib.sha256(args.quelle.read_bytes()).hexdigest(),
        'items': len(items),
        'symbols': len(benoetigt),
        'written': len(vorhanden),
        'new': geschrieben,
        'bytes': gesamt,
        'missing': fehlend,
    }
    (DATEN / 'icons.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n',
                                      encoding='utf-8')
    print('Symbols: %d needed, %d present, %d new, %d missing' %
          (len(benoetigt), len(vorhanden), geschrieben, len(fehlend)))
    print('  %.1f MB in %s' % (gesamt / 1048576, args.ziel))
    return 1 if fehlend else 0


if __name__ == '__main__':
    raise SystemExit(main())
