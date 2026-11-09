#!/usr/bin/env python3
"""Wrap the exported travel data as browser globals: daten/reise-<lang>.json ->
web/reise-<lang>.js. Run after travel_export.py in the source exporter.

Besides the network this adds two things the page needs to draw the way:

* `region` per stable-master, from the parent zone in the game's map markers –
  the game's regions share one coordinate space, so the region has to be known
  before a position can be put on a map.
* `karten`: the maps with a real frame, their localized names and the id of
  Middle-earth, which is only the background before a route is planned.

The map a station belongs to is chosen here, not in the browser: the deepest
named map of its region whose frame holds it. Nothing is guessed – a station
without such a map stays without one and the page shows only text for it.
"""
import collections
import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
SPRACHEN = ('de', 'en', 'fr')
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')
# Middle-earth itself: the image behind the planner before a route exists.
WELTKARTE = 268437554

sys.path.insert(0, str(BASIS / 'MagicQuestLog/tools'))
sys.path.insert(0, str(HIER))


def kartenname(ident, sprache):
    """Localized map name from the same source the map page uses."""
    from build_daten import kartenname as name
    return name(ident, sprache)


def zone_regionen():
    """Zone id -> region number, read from the game's map markers.

    The marker files are named `markers-<region>-<x>-<y>.xml`; every marker
    carries the zone it belongs to. A zone can appear in several cells, so the
    most frequent region wins.
    """
    zonen = collections.defaultdict(collections.Counter)
    for pfad in (LORE / 'maps' / 'markers').glob('markers-*.xml'):
        teile = pfad.stem.split('-')
        if len(teile) < 2 or not teile[1].isdigit():
            continue
        region = int(teile[1])
        text = pfad.read_text(encoding='utf-8', errors='ignore')
        for zone in set(re.findall(r'parentZoneId="(\d+)"', text)):
            zonen[zone][region] += 1
    return {zone: zaehler.most_common(1)[0][0] for zone, zaehler in zonen.items()
            if zaehler}


def technischer_name(name):
    """Maps the game never named ("Karte 268454943", "Map 268…")."""
    return (not name or name.startswith('Karte ') or name.startswith('Map ')
            or name.startswith('Carte ') or name.startswith('Untitled'))


class Karten:
    """The frame of every map the game itself gives bounds for."""

    def __init__(self):
        self.eintraege = json.loads((HIER / 'daten' / 'karten.json').read_text(encoding='utf-8'))
        self.index = {eintrag['idx']: eintrag for eintrag in self.eintraege}
        self.depth = {eintrag['idx']: self._depth(eintrag) for eintrag in self.eintraege}

    def _depth(self, eintrag):
        tiefe, gesehen, jetzt = 0, set(), eintrag
        while jetzt is not None and jetzt['idx'] not in gesehen:
            gesehen.add(jetzt['idx'])
            tiefe += 1
            jetzt = self.index.get(jetzt.get('eltern'))
        return tiefe

    def mit_rahmen(self, region):
        return [e for e in self.eintraege
                if e.get('bounds') and str(e.get('region')) == str(region)]

    @staticmethod
    def enthaelt(eintrag, lat, lon):
        return (eintrag['south'] <= lat <= eintrag['north']
                and eintrag['west'] <= lon <= eintrag['east'])

    # A marker right on the edge of a map is hard to place: the town map of Bree
    # ends at Südbree. Points this close to the frame move up one map.
    RAND = 0.04

    def _innen(self, eintrag, lat, lon):
        breite = (eintrag['east'] - eintrag['west']) * self.RAND
        hoehe = (eintrag['north'] - eintrag['south']) * self.RAND
        return (eintrag['west'] + breite <= lon <= eintrag['east'] - breite
                and eintrag['south'] + hoehe <= lat <= eintrag['north'] - hoehe)

    def tiefste(self, region, lat, lon):
        treffer = [e for e in self.mit_rahmen(region) if self.enthaelt(e, lat, lon)]
        if not treffer:
            return None
        innen = [e for e in treffer if self._innen(e, lat, lon)]
        if innen:
            treffer = innen

        def abstand(eintrag):
            return (abs(lon - (eintrag['west'] + eintrag['east']) / 2)
                    + abs(lat - (eintrag['south'] + eintrag['north']) / 2))
        treffer.sort(key=lambda e: (-self.depth[e['idx']], abstand(e), e['idx']))
        return treffer[0]

    def anzeigekarte(self, eintrag, sprache, lat, lon):
        """The map to draw on: this one, or the nearest named parent that also
        holds the point. The game's hierarchy is not always nested – a parent
        whose frame misses the place may not carry its marker."""
        jetzt = eintrag
        while jetzt is not None:
            if (not technischer_name(kartenname(jetzt['idx'], sprache))
                    and self.enthaelt(jetzt, lat, lon)):
                return jetzt
            jetzt = self.index.get(jetzt.get('eltern'))
        return None


def karten_liste(karten, sprache):
    liste = []
    for eintrag in karten.eintraege:
        if not eintrag.get('bounds'):
            continue
        liste.append({
            'i': eintrag['idx'],
            'nm': kartenname(eintrag['idx'], sprache),
            'w': round(eintrag['west'], 5),
            'o': round(eintrag['east'], 5),
            's': round(eintrag['south'], 5),
            'no': round(eintrag['north'], 5),
            'r': eintrag.get('region'),
            't': karten.depth[eintrag['idx']],
            'bild': '%s.webp' % eintrag['idx'],
        })
    # Hintergrund vor der ersten Planung: Mittelerde ohne Rahmen, nur als Bild.
    liste.append({'i': WELTKARTE, 'nm': kartenname(WELTKARTE, sprache),
                  'bild': '%s.webp' % WELTKARTE, 'welt': 1})
    return liste


def bereichere(daten, sprache, karten, zonen):
    liste = karten_liste(karten, sprache)
    ohne = 0
    for ort in daten['knoten']:
        region = zonen.get(str(ort.get('zone')))
        ort['region'] = region
        treffer = karten.tiefste(region, ort['lat'], ort['lon']) if region is not None else None
        anzeige = karten.anzeigekarte(treffer, sprache, ort['lat'], ort['lon']) if treffer else None
        ort['karte'] = anzeige['idx'] if anzeige else None
        if anzeige is None:
            ohne += 1
    daten['karten'] = liste
    return ohne


def baue(ziel=HIER):
    karten = Karten()
    zonen = zone_regionen()
    for sprache in SPRACHEN:
        quelle = HIER / 'daten' / ('reise-%s.json' % sprache)
        if not quelle.is_file():
            raise SystemExit('MISSING: %s (run travel_export.py)' % quelle)
        daten = json.loads(quelle.read_text(encoding='utf-8'))
        if not daten['knoten'] or not daten['strecken']:
            raise SystemExit('EMPTY travel data: %s' % quelle)
        ohne = bereichere(daten, sprache, karten, zonen)
        ziel_datei = Path(ziel) / 'web' / ('reise-%s.js' % sprache)
        ziel_datei.write_text(
            '/* Written by build_reise.py from daten/reise-%s.json. Do not edit. */\n'
            'window.MQL_REISE = %s;\n' % (sprache, json.dumps(daten, ensure_ascii=False, separators=(',', ':'))),
            encoding='utf-8')
        print(sprache, len(daten['knoten']), 'Knoten,', len(daten['strecken']), 'Strecken,',
              len(daten['skills']), 'Skills,', len(daten['karten']), 'Karten,',
              ohne, 'ohne Karte ->', ziel_datei.name)


if __name__ == '__main__':
    baue()
