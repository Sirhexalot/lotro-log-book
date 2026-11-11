#!/usr/bin/env python3
"""Instance finder entries selected explicitly by the client DAT.

The instance definitions are the client's private encounter templates (DAT
classes 1368 and 2651). They carry the name in three languages, how many
players may enter. Selection, clusters, levels and group sizes come from the
direct finder audit (tools/export_instance_finder.py). Quest geography remains
optional ancillary data, never the source of the playable level range.

The DAT step is separate and read-only. Its JSONL is kept in
`daten/instanzen-roh.jsonl`:

    javac -cp <dat libs> DatSourceReader.java
    java -cp <dat libs>:. DatSourceReader "<client dir>" de,en,fr ids.txt > instanzen-roh.jsonl

`ids.txt` holds the ids of the classes 1368 and 2651 from the archive
inventory. Output is `daten/instanzen.json`.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(HIER))
from itemnamen import sauberer_name  # noqa: E402
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')

# The name carries the kind in front of a colon. Same kinds in every language,
# so one key can be labelled per language later.
VORSILBEN = {
    'instanz': {'de': ('Instanz',), 'en': ('Instance',), 'fr': ('Instance',)},
    'mission': {'de': ('Mission',), 'en': ('Mission',), 'fr': ('Mission',)},
    'oeffentlich': {'de': ('Öffentliche Instanz',), 'en': ('Public Instance',),
                    'fr': ('Instance publique',)},
    'offen': {'de': ('Offene Instanz',), 'en': ('Open Instance',), 'fr': ('Instance ouverte',)},
    'privat': {'de': ('Privat-Instanz', 'Privatinstanz'), 'en': ('Private Instance',),
               'fr': ('Instance privée',)},
    'zwischenspiel': {'de': ('Zwischenspiel',), 'en': ('Interlude',), 'fr': ('Interlude',)},
    'schlachtzug': {'de': ('Schlachtzug',), 'en': ('Raid',), 'fr': ('Raid',)},
    'solo': {'de': ('Solo-Instanz',), 'en': ('Solo Instance',), 'fr': ('Instance solo',)},
}


def texte(wert) -> dict:
    if not isinstance(wert, dict):
        return {sprache: '' for sprache in SPRACHEN}
    texts = wert.get('texts') or {}
    return {sprache: str(texts.get(sprache) or '') for sprache in SPRACHEN}


def zerlege(name: str, sprache: str) -> tuple[str, str]:
    """Kind and name without its prefix, e.g. "Instanz: X" -> ("instanz", "X")."""
    if ':' in name:
        vorsilbe = name.split(':', 1)[0].strip()
        for art, sprachen in VORSILBEN.items():
            if vorsilbe in sprachen.get(sprache, ()):
                return art, name.split(':', 1)[1].strip()
    return 'sonst', name.strip()


def hex_id(wert) -> str | None:
    return '%08X' % int(wert) if wert else None


def lade_katalog() -> dict:
    """Level, map path and area names are equal in every language, so German is
    enough for the join."""
    quelle = DATEN / 'quests-de.json'
    if not quelle.is_file():
        raise SystemExit('MISSING: %s (build_daten.py)' % quelle)
    daten = json.loads(quelle.read_text(encoding='utf-8'))
    return {eintrag['i']: eintrag for eintrag in (daten.get('quests') or daten)}


def baue(quelle: Path, finder: Path | None = None) -> dict:
    katalog = lade_katalog()
    finder = finder or DATEN / 'instanzen-finder.json'
    if not finder.is_file():
        raise SystemExit('MISSING: %s (tools/export_instance_finder.py)' % finder)
    auswahl = json.loads(finder.read_text(encoding='utf-8'))['instances']
    auswahl = {row['id']: row for row in auswahl}
    seiten = {}
    for zeile in quelle.open(encoding='utf-8'):
        eintrag = json.loads(zeile)
        if eintrag['id'] not in auswahl:
            continue
        definition = auswahl[eintrag['id']]
        eigenschaften = eintrag.get('properties') or {}
        voll = texte(eigenschaften.get('PrivateEncounterTemplate_Name'))
        if not voll['de'] and not voll['en']:
            continue
        # The German name decides the kind; the other languages only lose their
        # own prefix.
        art = ('schlacht' if definition['picker'] == 'epic_battle' else
               {3: 'scharmuetzel', 4: 'instanz', 6: 'team'}.get(definition['type'], 'sonst'))
        if art == 'instanz' and definition['group_sizes'] and min(definition['group_sizes']) >= 12:
            art = 'schlachtzug'
        namen = {}
        for sprache in SPRACHEN:
            namen[sprache] = sauberer_name(definition['name'][sprache], sprache)
        quest = hex_id(eigenschaften.get('PrivateEncounterTemplate_InstanceQuest'))
        record = katalog.get(quest) if quest else None
        fk = (record or {}).get('fk') or []
        seiten[eintrag['id']] = {
            'id': eintrag['id'],
            'name': namen,
            'type': art,
            'players': definition['max_players'],
            'group_sizes': definition['group_sizes'],
            'difficulties': definition['difficulties'],
            'cluster_id': definition['category'],
            'cluster': definition['cluster'],
            'group_id': definition['group'],
            'group': definition['group_label'],
            'quest': quest,
            'level': definition['level_min'],
            'level_max': definition['level_max'],
            'region': int(fk[0]) if fk else None,
            'area': int(fk[1]) if len(fk) > 1 else (int(fk[0]) if fk else None),
            'path': [str(teil) for teil in (record or {}).get('f') or []],
            'description': texte(eigenschaften.get('PrivateEncounterTemplate_Description')),
        }
    if set(seiten) != set(auswahl):
        raise ValueError('Missing selected templates: %s' % sorted(set(auswahl) - set(seiten)))
    return {'schema': 2, 'instanzen': seiten,
            'zaehler': {'gesamt': len(seiten),
                        'mit_stufe': sum(1 for s in seiten.values() if s['level']),
                        'mit_gebiet': sum(1 for s in seiten.values() if s['area']),
                        'mit_spielerzahl': sum(1 for s in seiten.values() if s['players']) }}


def main() -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('--quelle', type=Path, default=DATEN / 'instanzen-roh.jsonl')
    zerleger.add_argument('--ziel', type=Path, default=DATEN / 'instanzen.json')
    optionen = zerleger.parse_args()
    payload = baue(optionen.quelle)
    optionen.ziel.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                             encoding='utf-8')
    z = payload['zaehler']
    print('instanzen: %d, mit Stufe %d, mit Gebiet %d, mit Spielerzahl %d'
          % (z['gesamt'], z['mit_stufe'], z['mit_gebiet'], z['mit_spielerzahl']))
    print('geschrieben: %s' % optionen.ziel)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
