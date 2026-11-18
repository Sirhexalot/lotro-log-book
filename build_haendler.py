#!/usr/bin/env python3
"""Build concrete vendor entities with names, positions and item relations."""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter')
VENDORS = EXPORT / 'vendor-items-2026-11-08/vendor-items.json'
POSITIONS = EXPORT / 'did-positions-2026-11-03/positions.jsonl'
NPCS = EXPORT / 'npcs-2026-11-03/raw.jsonl'
BARTERS = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore/barters.xml')
ITEMS = ROOT / 'daten/items.json'
MAPS = ROOT / 'daten/karten.json'
LANGS = ('de', 'en', 'fr')


def places(ids: set[str], maps) -> dict[str, list[dict]]:
    result: dict[str, set[tuple]] = defaultdict(set)
    if POSITIONS.is_file():
        with POSITIONS.open(encoding='utf-8') as handle:
            for line in handle:
                row = json.loads(line)
                if row.get('did') in ids and row.get('instance') == 0:
                    if row.get('latitude') is not None and row.get('longitude') is not None:
                        lat, lon = float(row['latitude']), float(row['longitude'])
                        result[row['did']].add((int(row.get('region') or 0), lat, lon))
    out = {}
    for ident in ids:
        rows = []
        for region, lat, lon in sorted(result.get(ident, ())):
            rows.append({'region': region, 'lat': round(lat, 5), 'lon': round(lon, 5),
                         'map': maps.attribute(lat, lon, region)})
        out[ident] = rows
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--still', action='store_true')
    args = parser.parse_args()
    vendor_data = json.loads(VENDORS.read_text(encoding='utf-8'))
    public_items = set(json.loads(ITEMS.read_text(encoding='utf-8'))['items'])
    vendors = vendor_data['vendors']
    barterers = set()
    if BARTERS.is_file():
        text = BARTERS.read_text(encoding='utf-8', errors='ignore')
        for raw in re.findall(r'<barterer\b([^>]*)>', text):
            attrs = dict(re.findall(r'(\w+)="([^"]*)"', raw))
            if attrs.get('id'):
                barterers.add('%08X' % (int(attrs['id']) & 0xffffffff))
    item_rows = {
        ident: sorted(set(str(item).upper() for item in item_ids) & public_items)
        for ident, item_ids in vendor_data['vendors'].items()
    }
    # The export's item relation is keyed by item, not by vendor.
    item_rows = {ident: [] for ident in vendors}
    for item, vendor_ids in vendor_data['items'].items():
        if str(item).upper() not in public_items:
            continue
        for vendor in vendor_ids:
            vendor = str(vendor).upper()
            if vendor in item_rows:
                item_rows[vendor].append(str(item).upper())

    raw = {}
    if NPCS.is_file():
        with NPCS.open(encoding='utf-8') as handle:
            for line in handle:
                row = json.loads(line)
                if row.get('id') in vendors:
                    raw[row['id']] = row
    sys.path.insert(0, str(ROOT.parent / 'MagicQuestLog' / 'tools'))
    from game_maps import GameMaps
    maps = GameMaps(Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')
    spots = places(set(vendors), maps)
    known = {str(row['idx']) for row in json.loads(MAPS.read_text(encoding='utf-8'))}
    output = {}
    for ident, vendor in vendors.items():
        props = (raw.get(ident) or {}).get('properties') or {}
        title = props.get('OccupationTitle') or {}
        title_texts = title.get('texts') if isinstance(title, dict) else {}
        output[ident] = {
            'id': ident,
            'name': vendor.get('n') or {},
            'type': 'both' if ident in barterers else 'vendor',
            'title': {lang: (title_texts or {}).get(lang, '') for lang in LANGS},
            'places': [{**spot, 'map': spot['map'] if spot['map'] is not None
                        and str(spot['map']) in known else None}
                       for spot in spots[ident]],
            'items': sorted(set(item_rows[ident])),
        }
    payload = {'schema': 1, 'vendors': output}
    (ROOT / 'daten/haendler.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':'), sort_keys=True),
        encoding='utf-8')
    if not args.still:
        print('Händler:', len(output),
              'mit Standort:', sum(bool(row['places']) for row in output.values()),
              'mit Karte:', sum(any(place['map'] is not None for place in row['places'])
                                for row in output.values()),
              'mit Web-Items:', sum(bool(row['items']) for row in output.values()))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
