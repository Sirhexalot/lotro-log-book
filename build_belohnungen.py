#!/usr/bin/env python3
"""Build the reward index for the website: virtues, titles and items.

Reads the plugin catalogue (quests with their detail blocks and deeds) and
groups every reward by what it grants, with links back to the entries. Writes
`web/belohnungen-<language>.js` for one language.

    .../.venv/bin/python build_belohnungen.py --sprache de
"""
import argparse
import json
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
STANDARD_KATALOG = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data'
STANDARD_EXPORT = BASIS / 'Companion-Test/source-exporter/full-dat-en-de-fr-2026-11-03'

# The deed's own category, from the export. Codes checked against their names:
# 20 slayer, 1 explorer, 11 quest deeds, 33/34 lore. Everything else (class,
# race, epic, reputation, festivals, instances) stays under "other".
CATEGORY_TYPE = {20: 'slayer', 1: 'explorer', 11: 'questdeed', 33: 'lore', 34: 'lore'}
TYPE_ORDER = ('slayer', 'explorer', 'lore', 'questdeed', 'quest', 'other')
TYPE_LABELS = {
    'de': {'slayer': 'Bezwinger', 'explorer': 'Entdecker', 'lore': 'Kunde',
           'questdeed': 'Aufgaben', 'quest': 'Aufgaben', 'other': 'Weitere Taten'},
    'en': {'slayer': 'Slayer', 'explorer': 'Explorer', 'lore': 'Lore',
           'questdeed': 'Quests', 'quest': 'Quests', 'other': 'Other deeds'},
    'fr': {'slayer': 'Vainqueur', 'explorer': 'Explorateur', 'lore': 'Savoir',
           'questdeed': 'Quêtes', 'quest': 'Quêtes', 'other': 'Autres prouesses'},
}


def liste(wert):
    if wert is None:
        return []
    return [wert[i] for i in range(1, len(wert) + 1)]


def sammle(katalog_dir, sprache, art):
    from lupa.lua51 import LuaRuntime
    runtime = LuaRuntime(unpack_returned_tuples=True)
    path = katalog_dir / ('%s_%s.lua' % ('Deeds' if art == 'taten' else 'Quests', sprache))
    runtime.execute(path.read_text(encoding='utf-8'))
    records = runtime.globals().MagicQuestLog.Data[('deeds_' if art == 'taten' else 'quests_') + sprache]
    details = {}
    if art != 'taten':
        for block in sorted(katalog_dir.glob('QuestDetails_%s_*.lua' % sprache)):
            runtime.execute(block.read_text(encoding='utf-8'))
            number = block.stem.rsplit('_', 1)[1]
            details.update(runtime.globals().MagicQuestLog.Data['questDetails_%s_%s' % (sprache, number)])
    out = []
    for index in range(1, len(records) + 1):
        record = records[index]
        if art != 'taten' and record['id'] in details:
            entry = details[record['id']]
            if 'rw' in entry:
                record['rw'] = entry['rw']
        out.append(record)
    return out


def eintrag(kind, record, kategorien, labels):
    zone, region = '', ''
    for part in liste(record['p'] if 'p' in record else None):
        if str(part['k']).startswith('zone:'):
            zone = part['n']
        elif str(part['k']).startswith('region:'):
            region = part['n']
    if kind == 'd':
        art = CATEGORY_TYPE.get(kategorien.get(record['id']), 'other')
    else:
        art = 'quest'
    level = record['l'] if 'l' in record and record['l'] else ''
    return [kind, record['id'], record['name'], zone, region, labels[art], level]


def baue(katalog_dir, sprache, ziel, export_dir):
    # The deed category lives in the export, not in the catalogue.
    kategorien = {}
    deeds = export_dir / 'deeds.json'
    if deeds.is_file():
        for row in json.loads(deeds.read_text(encoding='utf-8')):
            kategorien[row['id']] = (row.get('properties') or {}).get('Accomplishment_Category')
    labels = TYPE_LABELS[sprache]
    tugenden, titel, gegenstaende = {}, {}, {}
    for art, kind in (('taten', 'd'), ('aufgaben', 'q')):
        for record in sammle(katalog_dir, sprache, art):
            quelle = eintrag(kind, record, kategorien, labels)
            for reward in liste(record['rw'] if 'rw' in record else None):
                art_reward = reward[1]
                name = reward[2]
                if not name:
                    continue
                if art_reward == 'v':
                    tugenden.setdefault(name, []).append(quelle)
                elif art_reward == 't':
                    titel.setdefault(name, []).append(quelle)
                elif art_reward in ('i', 'c'):
                    if art_reward == 'i':
                        ident, bound = reward[7], int(reward[6] or 0)
                    else:
                        ident, bound = reward[6], int(reward[5] or 0)
                    if not ident:
                        continue
                    item = gegenstaende.setdefault(ident, {
                        'n': name, 'q': int(reward[3] or 0), 'l': int(reward[4] or 0),
                        'b': bound, 's': {}})
                    item['s'][tuple(quelle)] = True
    order = []
    for key in TYPE_ORDER:
        label = labels[key]
        if label not in order:
            order.append(label)
    return {
        'v': [[name, sorted({tuple(q) for q in quellen})] for name, quellen in sorted(tugenden.items())],
        't': [[name, sorted({tuple(q) for q in quellen})] for name, quellen in sorted(titel.items())],
        'g': [[ident, item['n'], item['q'], item['l'], item['b'], sorted(item['s'])]
              for ident, item in sorted(gegenstaende.items(), key=lambda pair: (pair[1]['n'].lower(), pair[0]))],
        'o': order,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sprache', choices=('de', 'en', 'fr'), default='de')
    parser.add_argument('--katalog', type=Path, default=STANDARD_KATALOG)
    parser.add_argument('--export', type=Path, default=STANDARD_EXPORT)
    parser.add_argument('--ziel', type=Path, default=HIER / 'web')
    args = parser.parse_args()
    data = baue(args.katalog, args.sprache, args.ziel, args.export)
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    ziel = args.ziel / ('belohnungen-%s.js' % args.sprache)
    ziel.write_text('/* Written by build_belohnungen.py. */\nwindow.MQL_BELOHNUNGEN = %s;\n' % text,
                    encoding='utf-8')
    print('%d Tugenden, %d Titel, %d Gegenstände -> %s (%.1f MB)'
          % (len(data['v']), len(data['t']), len(data['g']), ziel.name, ziel.stat().st_size / 1048576))


if __name__ == '__main__':
    sys.exit(main())
