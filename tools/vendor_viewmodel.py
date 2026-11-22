"""Render-ready vendor pages."""
from __future__ import annotations

from collections import defaultdict

import seo
try:
    from .sortierung import schluessel
except ImportError:
    from sortierung import schluessel
from build_katalogseiten import route
from giver_viewmodel import _place_view, area_of, place_label, region_of

SEGMENT = {'de': 'haendler', 'en': 'vendor', 'fr': 'marchand'}


def vendor_url(lang: str, ident: str) -> str:
    return '/%s/%s/%s/' % (lang, SEGMENT[lang], ident)


def _label(maps, spot):
    area = area_of(maps, spot.get('map'))
    if area:
        return maps.get(str(area), {}).get('name') or ''
    region = region_of(maps, spot.get('map'), spot.get('region'))
    return maps.get(str(region), {}).get('name') if region else ''


def vendor_pages(source: dict, lang: str, items: dict, maps: dict,
                 app_url, coords, words: dict,
                 region_ids: dict[int, int] | None = None) -> dict:
    pages = {}
    by_name = defaultdict(list)
    for ident, vendor in source['vendors'].items():
        by_name[(vendor.get('name') or {}).get(lang, '')].append(ident)
    for ident, vendor in source['vendors'].items():
        rows = []
        for item_id in vendor.get('items') or []:
            item = items.get(item_id)
            if not item:
                continue
            rows.append({
                'id': item_id,
                'name': item.get('name') or item_id,
                'url': route(lang, 'i', item_id),
                'level': item.get('l') or '',
            })
        rows.sort(key=lambda row: (schluessel(str(row['name'])), row['id']))
        places = []
        for spot in vendor.get('places') or []:
            place = _place_view(spot, lang, maps, app_url, coords)
            # Some NPC positions are known only at region scale: the client
            # coordinates do not fit any of its named map frames. Keep the
            # known region useful without inventing a landscape or a pin.
            if spot.get('map') is None:
                number = spot.get('region')
                region_id = None
                if region_ids and number is not None:
                    try:
                        region_id = region_ids.get(int(number))
                    except (TypeError, ValueError):
                        pass
                if region_id is None:
                    region_id = region_of(maps, None, number)
                region = maps.get(str(region_id)) if region_id is not None else None
                if region and region.get('name'):
                    place['chain'] = [{
                        'id': region_id,
                        'name': region['name'],
                        'tier': 1,
                        'url': route(lang, 'region', str(region_id)),
                    }]
                    place['map_url'] = app_url(
                        lang, 'karte', vorkarte=region_id)
            places.append(place)
        name = (vendor.get('name') or {}).get(lang) or (vendor.get('name') or {}).get('en') or ident
        pages[ident] = {
            'id': ident, 'name': name,
            'type': vendor.get('type', 'vendor'),
            'title': (vendor.get('title') or {}).get(lang) or None,
            'places': places, 'items': rows, 'total': len(rows),
            'seo': {'title': name, 'description': name},
            'same_name': [
                {'id': other, 'url': vendor_url(lang, other),
                 'place': _label(maps, (source['vendors'][other].get('places') or [{}])[0]),
                 'count': len(source['vendors'][other].get('items') or [])}
                for other in by_name[name] if other != ident
            ],
            'same_name_url': app_url(lang, 'vendors', q=name),
        }
    return pages


def vendor_index(source: dict, lang: str, maps: dict) -> dict:
    rows = []
    regions, areas, area_region = {}, {}, {}
    for ident, vendor in source['vendors'].items():
        places = []
        for spot in vendor.get('places') or []:
            pair = [region_of(maps, spot.get('map'), spot.get('region')),
                    area_of(maps, spot.get('map'))]
            if pair not in places:
                places.append(pair)
            if pair[0] is not None:
                regions[pair[0]] = maps.get(str(pair[0]), {}).get('name', '')
            if pair[1] is not None:
                areas[pair[1]] = maps.get(str(pair[1]), {}).get('name', '')
                if pair[0] is not None:
                    area_region[pair[1]] = pair[0]
        regions_for_vendor = sorted({pair[0] for pair in places if pair[0] is not None})
        areas_for_vendor = sorted({pair[1] for pair in places if pair[1] is not None})
        name = (vendor.get('name') or {}).get(lang, ident)
        title = (vendor.get('title') or {}).get(lang) or ''
        rows.append({'id': ident, 'name': name, 'title': title,
                     'search': (name + ' ' + title).casefold(),
                     'type': vendor.get('type', 'vendor'),
                     'regions': regions_for_vendor, 'areas': areas_for_vendor,
                     'places': places, 'count': len(vendor.get('items') or [])})
    rows.sort(key=lambda row: (schluessel(row['name']), row['id']))
    types = {row['type']: row['type'] for row in rows}
    return {'schema': 1, 'lang': lang,
            'labels': {'region': regions, 'area': areas, 'area_region': area_region,
                       'type': types},
            'vendors': rows}
