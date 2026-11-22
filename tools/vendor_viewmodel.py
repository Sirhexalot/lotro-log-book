"""Render-ready vendor pages."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import seo
try:
    from .sortierung import schluessel
except ImportError:
    from sortierung import schluessel
from build_katalogseiten import route
from giver_viewmodel import _place_view, area_of, place_label, region_of

SEGMENT = {'de': 'haendler', 'en': 'vendor', 'fr': 'marchand'}

# Mindeststufen der Ware: ein Händler hat Ware „ab Stufe X“. Die Zahl steht im
# Gegenstandsbestand; fehlt sie, bleibt der Händler ohne Angabe.
MIT_STUFE = Path(__file__).resolve().parents[1] / 'daten' / 'items.json'
_STUFEN = None


def item_min_levels() -> dict:
    """Gegenstand → Mindeststufe (Tragevoraussetzung), einmal je Lauf gelesen."""
    global _STUFEN
    if _STUFEN is None:
        _STUFEN = {}
        if MIT_STUFE.is_file():
            for ident, eintrag in json.loads(MIT_STUFE.read_text(encoding='utf-8'))['items'].items():
                stufe = int(eintrag.get('ml') or 0)
                if stufe > 0:
                    _STUFEN[str(ident).upper()] = stufe
    return _STUFEN


def vendor_url(lang: str, ident: str) -> str:
    return '/%s/%s/%s/' % (lang, SEGMENT[lang], ident)


def _label(maps, spot):
    area = area_of(maps, spot.get('map'))
    if area:
        return maps.get(str(area), {}).get('name') or ''
    region = region_of(maps, spot.get('map'), spot.get('region'))
    return maps.get(str(region), {}).get('name') if region else ''


def angebote(vendor: dict, lang: str, items: dict, source: dict) -> list:
    """Die Tauschangebote eines Händlers, nach Tauschliste gruppiert.

    Ein Profil ist die Tauschliste (etwa „Ruf“ oder „Essenzen“); sie steht als
    Überschrift über ihren Zeilen. Der Preis sind Währungen, die keine eigene
    Seite haben: sie werden benannt, nicht verlinkt.
    """
    roh = vendor.get('offers') or []
    if not roh:
        return []
    namen = source.get('barterNames') or {}
    profile = source.get('barterProfiles') or {}
    gruppen = {}
    for eintrag in roh:
        ware = []
        for item_id, menge in eintrag.get('receive') or []:
            item = items.get(item_id)
            if not item:
                continue
            ware.append({'id': item_id, 'name': item.get('name') or item_id,
                         'url': route(lang, 'i', item_id), 'qty': menge})
        if not ware:
            continue
        preis = []
        for item_id, menge in eintrag.get('give') or []:
            texte = namen.get(item_id) or {}
            preis.append({'text': texte.get(lang) or texte.get('en') or item_id,
                          'qty': menge,
                          'url': route(lang, 'i', item_id) if item_id in items else None})
        name = (profile.get(eintrag.get('profile')) or {}).get(lang) or ''
        gruppe = gruppen.setdefault(name, {'profile': name, 'rows': []})
        gruppe['rows'].append({'give': preis, 'receive': ware})
    for gruppe in gruppen.values():
        gruppe['rows'].sort(key=lambda row: (schluessel(str(row['receive'][0]['name'])),
                                             row['receive'][0]['id']))
    return sorted(gruppen.values(),
                  key=lambda row: (row['profile'] == '', schluessel(row['profile'])))


def tauschdaten(offers: list) -> dict:
    """Die Angebote als kompakte Zeilen für den Browser-Filter.

    Eine Zeile ist [Ware, Listennummer, Preis, Menge]. Name, Stufe, Qualität
    und Icon holt der Browser aus dem Gegenstandsindex, den die Seite ohnehin
    lädt; damit bleibt die Nutzlast klein (1.188 Angebote ≈ 40 KB).
    """
    listen, waren = [], []
    for gruppe in offers:
        nummer = len(listen)
        listen.append(gruppe['profile'])
        for row in gruppe['rows']:
            preis = ' + '.join('%d %s' % (teil['qty'], teil['text'])
                               for teil in row['give'])
            for ware in row['receive']:
                waren.append([ware['id'], nummer, preis, ware['qty']])
    return {'listen': listen, 'waren': waren}


def vendor_pages(source: dict, lang: str, items: dict, maps: dict,
                 app_url, coords, words: dict,
                 region_ids: dict[int, int] | None = None) -> dict:
    pages = {}
    by_name = defaultdict(list)
    for ident, vendor in source['vendors'].items():
        by_name[(vendor.get('name') or {}).get(lang, '')].append(ident)
    for ident, vendor in source['vendors'].items():
        rows = []
        # `sold` ist die Verkaufsseite. Neue Händlerdateien trennen sie von den
        # Tauschangeboten; alte Dateien ohne `sold` und ohne Angebote zeigen
        # wie bisher alle Waren, damit ein alter Datenstand nicht leer wird.
        if 'sold' in vendor:
            verkauft = vendor.get('sold') or []
        elif vendor.get('offers'):
            verkauft = []
        else:
            verkauft = vendor.get('items') or []
        for item_id in verkauft:
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
        offers = angebote(vendor, lang, items, source)
        tausch = tauschdaten(offers)
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
            'offers': offers,
            'offer_total': sum(len(gruppe['rows']) for gruppe in offers),
            'tausch': tausch,
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
        # Zwei Filterarten, nicht drei: ein Händler, der auch tauscht, gehört zu
        # beiden Gruppen und wird in beiden gezählt.
        typen = (['vendor', 'barter'] if vendor.get('type') == 'both'
                 else [vendor.get('type', 'vendor')])
        stufen = [stufe for stufe in
                  (item_min_levels().get(str(iid).upper())
                   for iid in vendor.get('items') or []) if stufe]
        rows.append({'id': ident, 'name': name, 'title': title,
                     'search': (name + ' ' + title).casefold(),
                     'type': vendor.get('type', 'vendor'), 'types': typen,
                     'regions': regions_for_vendor, 'areas': areas_for_vendor,
                     'places': places, 'count': len(vendor.get('items') or []),
                     # „ab Stufe“ für die Spalte und die belegten Stufen selbst
                     # für den Filter. Eine Spanne allein würde Händler mit
                     # Lücken fälschlich als passend zählen.
                     'ml_min': min(stufen) if stufen else None,
                     'ml_max': max(stufen) if stufen else None,
                     'ml_levels': sorted(set(stufen))})
    rows.sort(key=lambda row: (schluessel(row['name']), row['id']))
    vorhanden = {art for row in rows for art in row['types']}
    types = {art: art for art in ('vendor', 'barter') if art in vorhanden}
    return {'schema': 1, 'lang': lang,
            'labels': {'region': regions, 'area': areas, 'area_region': area_region,
                       'type': types},
            'vendors': rows}
