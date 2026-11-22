#!/usr/bin/env python3
"""Build the compact search index for suche.html.

One row per searchable thing so the search page does not have to load the map
data (21 MB) plus rewards and recipes separately:

    [kind, id, name, context, level]

kind: q quest, d deed, t title, g item, r recipe.
Context is the area for quests and deeds, "profession · tier" for recipes.

    .../.venv/bin/python build_suche.py --sprache de
"""
import argparse
import json
from pathlib import Path
from tools.sortierung import schluessel

HIER = Path(__file__).resolve().parent
BASIS = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
STANDARD_KATALOG = BASIS / 'MagicQuestLog/plugin/MagicQuestLog/Data'


def liste(wert):
    if wert is None:
        return []
    return [wert[i] for i in range(1, len(wert) + 1)]


def katalog(katalog_dir, sprache, art):
    from lupa.lua51 import LuaRuntime
    runtime = LuaRuntime(unpack_returned_tuples=True)
    path = katalog_dir / ('%s_%s.lua' % ('Deeds' if art == 'taten' else 'Quests', sprache))
    runtime.execute(path.read_text(encoding='utf-8'))
    records = runtime.globals().MagicQuestLog.Data[('deeds_%s' if art == 'taten' else 'quests_%s') % sprache]
    out = []
    for index in range(1, len(records) + 1):
        record = records[index]
        if art == 'taten' and record['replaced_by'] is not None:
            continue
        zone = ''
        for part in liste(record['p'] if 'p' in record else None):
            if str(part['k']).startswith('zone:'):
                zone = part['n']
        out.append([record['id'], record['name'], zone,
                    record['l'] if 'l' in record and record['l'] else ''])
    return out


def js_datei(pfad, name):
    text = pfad.read_text(encoding='utf-8')
    marker = 'window.%s = ' % name
    return json.JSONDecoder().raw_decode(text[text.index(marker) + len(marker):])[0]


def taten_json(sprache):
    """The already filtered deed rows; no second read of the Lua source."""
    path = HIER / 'daten' / ('taten-%s.json' % sprache)
    if not path.is_file():
        return None
    data = json.loads(path.read_text(encoding='utf-8'))
    return [[row['i'], row.get('n', ''), row.get('z') or row.get('u') or '',
             str(row.get('l') or '')] for row in data.get('quests', [])]


def baue(katalog_dir, sprache):
    rows = []
    for kind, art in (('q', 'aufgaben'), ('d', 'taten')):
        quelle = taten_json(sprache) if kind == 'd' else None
        if quelle is None:
            quelle = katalog(katalog_dir, sprache, art)
        for ident, name, zone, level in quelle:
            rows.append([kind, ident, name, zone, level])

    belohnungen = js_datei(HIER / 'web' / ('belohnungen-%s.js' % sprache), 'MQL_BELOHNUNGEN')
    # Titles and virtues: build_titel.py matched them to IDs where the join is
    # unambiguous. Entries without an ID stay searchable but lead to the index.
    for art, datei, buchstabe in (('t', 'titel.json', 't'), ('v', 'tugenden.json', 'v')):
        quelle = HIER / 'daten' / datei
        mit_id = {}
        if quelle.is_file():
            for ident, eintrag in json.loads(quelle.read_text(encoding='utf-8'))['eintraege'].items():
                name = (eintrag['n'].get(sprache) or eintrag['n'].get('en') or '').strip()
                if name:
                    mit_id[name] = ident
        gesehen = set()
        for eintrag in belohnungen[art]:
            if len(eintrag) == 3:
                ident, name = eintrag[0], eintrag[1]
            else:
                name = eintrag[0]
                ident = mit_id.get(name, '')
            ident = ident or mit_id.get(name, '')
            gesehen.add(ident)
            rows.append([buchstabe, ident, name, '', ''])
        # Titles that no quest or deed awards (crafting, event, kinship …) are
        # only in the catalogue; they are searchable all the same.
        if art == 't' and quelle.is_file():
            for ident, eintrag in json.loads(quelle.read_text(encoding='utf-8'))['eintraege'].items():
                name = (eintrag['n'].get(sprache) or eintrag['n'].get('en') or '').strip()
                if name and ident not in gesehen:
                    rows.append([buchstabe, ident, name, '', ''])

    # Items come from the merged namespace (build_items.py): equipment, reward
    # items and crafting items in one list with one ID.
    gegenstaende = json.loads((HIER / 'daten' / 'items.json').read_text(encoding='utf-8'))['items']
    for ident, eintrag in gegenstaende.items():
        name = (eintrag['n'].get(sprache) or eintrag['n'].get('en') or '').strip()
        if not name:
            continue
        rows.append(['g', ident, name, (eintrag.get('kat') or '').lower(), eintrag.get('l') or ''])

    rezepte = js_datei(HIER / 'web' / ('rezepte-%s.js' % sprache), 'MQL_REZEPTE')['r']
    seen = set()
    for row in rezepte:
        name = row[0]
        if name in seen:
            continue
        seen.add(name)
        rows.append(['r', row[10], name, '%s · %s' % (row[3], row[4]), row[2]])

    sets = json.loads((HIER / 'daten' / ('sets-suche-%s.json' % sprache)).read_text(encoding='utf-8'))
    for entry in sets['sets']:
        rows.append(['s', entry['id'], entry['name'], '', ''])
    givers = json.loads((HIER / 'daten' / ('auftraggeber-suche-%s.json' % sprache)).read_text(encoding='utf-8'))
    for entry in givers['rows']:
        rows.append(['n', entry[0], entry[1], entry[2] or entry[3], entry[4]])

    # Factions and landmarks: the name, the region as context, no level.
    fraktionen = json.loads((HIER / 'daten' / 'fraktionen.json').read_text(encoding='utf-8'))['fraktionen']
    for ident, eintrag in fraktionen.items():
        name = (eintrag.get('name') or {}).get(sprache) or (eintrag.get('name') or {}).get('en') or ''
        if name.strip():
            rows.append(['f', ident, name.strip(), '', ''])
    landmarken = json.loads((HIER / 'daten' / 'landmarken.json').read_text(encoding='utf-8'))['landmarken']
    for ident, eintrag in landmarken.items():
        name = (eintrag.get('name') or {}).get(sprache) or (eintrag.get('name') or {}).get('en') or ''
        if name.strip():
            rows.append(['l', ident, name.strip(), '', ''])
    rows.sort(key=lambda r: (schluessel(r[2]), r[0]))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sprache', choices=('de', 'en', 'fr'), default='de')
    parser.add_argument('--katalog', type=Path, default=STANDARD_KATALOG)
    args = parser.parse_args()
    rows = baue(args.katalog, args.sprache)
    ziel = HIER / 'web' / ('suche-%s.js' % args.sprache)
    ziel.write_text('/* Written by build_suche.py. */\nwindow.MQL_SUCHE = %s;\n'
                    % json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('%d Einträge -> %s (%.1f MB)' % (len(rows), ziel.name, ziel.stat().st_size / 1048576))


if __name__ == '__main__':
    main()
