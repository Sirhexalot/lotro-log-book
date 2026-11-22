#!/usr/bin/env python3
"""Build concrete vendor entities with names, positions and item relations."""
from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter')
VENDORS = EXPORT / 'vendor-items-2026-11-08/vendor-items.json'
POSITIONS = EXPORT / 'did-positions-2026-11-03/positions.jsonl'
NPCS = EXPORT / 'npcs-2026-11-03/raw.jsonl'
LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')
BARTERS = LORE / 'barters.xml'
ITEMS = ROOT / 'daten/items.json'
# Tauschhändler und ihre Angebote (tools/tausch.py). Fehlt die Datei, gilt der
# alte, schmale Weg über die Rezeptquellen in items.json.
TAUSCH = ROOT / 'daten/tausch.json'
MAPS = ROOT / 'daten/karten.json'
LANGS = ('de', 'en', 'fr')


def kennung(roh) -> str:
    """Eine Spiel-ID als achtstellige Kennung, wie überall auf der Website."""
    try:
        return '%08X' % (int(roh) & 0xffffffff)
    except (TypeError, ValueError):
        return ''


def tausch_bestand() -> dict:
    """Tauschhändler, Profile und Angebote aus daten/tausch.json."""
    if not TAUSCH.is_file():
        return {}
    return json.loads(TAUSCH.read_text(encoding='utf-8'))


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
    parser.add_argument('--ziel', type=Path, default=None,
                        help='Zieldatei (Vorgabe: daten/haendler.json)')
    args = parser.parse_args()
    vendor_data = json.loads(VENDORS.read_text(encoding='utf-8'))
    public_items = set(json.loads(ITEMS.read_text(encoding='utf-8'))['items'])
    vendors = vendor_data['vendors']
    tausch = tausch_bestand()
    barterers = set()
    if tausch:
        # Dieselbe Quelle wie die Angebote: Händler, die tauschen, stehen dort
        # mit ihren Profilen, unabhängig von einem Verkaufseintrag.
        barterers = set(tausch.get('vendors') or {})
    elif BARTERS.is_file():
        text = BARTERS.read_text(encoding='utf-8', errors='ignore')
        for raw in re.findall(r'<barterer\b([^>]*)>', text):
            attrs = dict(re.findall(r'(\w+)="([^"]*)"', raw))
            if attrs.get('id'):
                barterers.add(kennung(attrs['id']))
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

    # A pure barterer has no vendor entry: only the NPC labels carry its
    # localized name. Its goods and prices come from daten/tausch.json; the
    # fallback keeps the old, narrow relation from the recipe sources working.
    items_data = json.loads(ITEMS.read_text(encoding='utf-8'))['items']
    barter_items = defaultdict(set)
    barter_offers = defaultdict(list)
    if tausch:
        profile = tausch.get('profiles') or {}
        for ident, eintrag in (tausch.get('vendors') or {}).items():
            for profil_id in eintrag.get('profiles') or []:
                daten = profile.get(profil_id) or {}
                for angebot in daten.get('offers') or []:
                    ware = [[item, menge] for item, menge in angebot.get('receive') or []
                            if item in public_items]
                    if not ware:
                        continue
                    barter_items[ident].update(item for item, _ in ware)
                    barter_offers[ident].append({
                        'profile': profil_id,
                        'give': angebot.get('give') or [],
                        'receive': ware,
                    })
        barter_profiles = {ident: (profile.get(ident) or {}).get('name') or {}
                           for ident in {offer['profile']
                                         for offers in barter_offers.values()
                                         for offer in offers}}
        nur_barter = set(tausch.get('vendors') or {}) - set(vendors)
    else:
        for item_id, item in items_data.items():
            for source in item.get('tausch') or []:
                raw = str(source.get('id') or '').strip()
                if raw.isdigit():
                    barter_items[kennung(raw)].add(str(item_id).upper())
        barter_profiles = {}
        nur_barter = set(barter_items) - set(vendors)
    nur_barter = {ident for ident in nur_barter if barter_items.get(ident)}
    for offers in barter_offers.values():
        offers.sort(key=lambda row: (row['profile'],
                                     [item for item, _ in row['receive']]))
    # The NPC labels are keyed in decimal, the page in 8-digit hex.
    barter_names = {lang: {} for lang in LANGS}
    for lang in LANGS:
        datei = LORE / 'labels' / lang / 'npc.xml'
        if not datei.is_file() or not nur_barter:
            continue
        for _, row in ET.iterparse(datei, events=('end',)):
            if row.tag == 'label' and row.get('value'):
                ident = kennung(row.get('key'))
                if ident in nur_barter:
                    barter_names[lang][ident] = row.get('value').strip()
            row.clear()

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
    # Auch reine Tauschhändler stehen im Positions-Export: 817 von 818.
    spots = places(set(vendors) | nur_barter, maps)
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
            # Was der Händler verkauft; `items` bleibt die Summe aus Verkauf
            # und Tausch, damit Zähler und Filter unverändert bleiben.
            'sold': sorted(set(item_rows[ident])),
        }
    # Vendors that also barter already have a page; their offer must show the
    # bartered goods too, not only what they sell.
    for ident in sorted(set(barter_items) & set(vendors)):
        if ident in output:
            output[ident]['items'] = sorted(
                set(output[ident]['items']) | {item for item in barter_items[ident]
                                               if item in public_items})
            output[ident]['offers'] = barter_offers.get(ident) or []
            if output[ident]['offers']:
                output[ident]['type'] = 'both'
    for ident in sorted(nur_barter):
        namen = {lang: barter_names[lang].get(ident, '') for lang in LANGS}
        if not any(namen.values()):
            continue
        output[ident] = {
            'id': ident,
            'name': namen,
            'type': 'barter',
            # No localized occupation in the client; empty instead of English.
            'title': {lang: '' for lang in LANGS},
            'places': [{**spot, 'map': spot['map'] if spot['map'] is not None
                        and str(spot['map']) in known else None}
                       for spot in spots.get(ident, [])],
            'items': sorted(item for item in barter_items[ident] if item in public_items),
            'offers': barter_offers.get(ident) or [],
        }
    payload = {'schema': 1, 'vendors': output}
    if tausch:
        payload['barterProfiles'] = barter_profiles
        payload['barterNames'] = tausch.get('names') or {}
    ziel = getattr(args, 'ziel', None) or (ROOT / 'daten/haendler.json')
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':'), sort_keys=True),
        encoding='utf-8')
    if not args.still:
        print('Händler:', len(output),
              'mit Standort:', sum(bool(row['places']) for row in output.values()),
              'mit Karte:', sum(any(place['map'] is not None for place in row['places'])
                                for row in output.values()),
              'mit Web-Items:', sum(bool(row['items']) for row in output.values()),
              'davon Tauschhändler:', sum(row['type'] == 'barter' for row in output.values()),
              'mit Angeboten:', sum(bool(row.get('offers')) for row in output.values()))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
