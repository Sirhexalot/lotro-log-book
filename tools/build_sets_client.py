#!/usr/bin/env python3
"""Browser data for the set list: catalogue rows plus wear requirements.

The set list filters in the browser like the item search, because the
suitability of a set depends on the imported character and that character never
leaves the browser. This generator only joins what is already there: the list
index per language (`daten/sets-suche-<sprache>.json`) and the item
requirements of `daten/items.json` (grouped by `tools/eignung_teile.py`).

    python3 tools/build_sets_client.py [--daten DIR] [--ziel DIR]

Writes `web/sets-<sprache>.js`:

    window.MQL_SETS = {
      schema, lang, labels: {class, armour, category},
      sets: [[id, name, parts, available_parts, icons,
              members: [[name, category, armour, classes, class_known,
                         min_level, available]],
              teile: [[min, klasse, volk, armour, waffe, extra, scalable,
                       anzahl]]]]
    }

`classes` is the source's `;`-string, `teile` is the grouped requirement list
`web/eignung.js` reads. Nothing is invented: a part without a minimum level
carries no requirement and is not counted by the chip.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from eignung_teile import aus_gegenstaenden  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')


def zeilen(index: dict, gegenstaende: dict) -> list:
    rows = []
    for eintrag in index['sets']:
        members, kennungen = [], []
        for member in eintrag['members']:
            kennungen.append(member['id'])
            members.append([
                member.get('name') or '',
                member.get('category') or '',
                member.get('armour') or '',
                ';'.join(member.get('classes') or []),
                1 if member.get('class_known') else 0,
                int(member.get('min_level') or 0),
                1 if member.get('available') else 0,
            ])
        rows.append([
            eintrag['id'], eintrag['name'], eintrag['parts'],
            eintrag['available_parts'], eintrag.get('icons') or [],
            members, aus_gegenstaenden(kennungen, gegenstaende),
        ])
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--daten', type=Path, default=ROOT / 'daten')
    parser.add_argument('--ziel', type=Path, default=ROOT / 'web')
    args = parser.parse_args()
    items_path = args.daten / 'items.json'
    if not items_path.is_file():
        raise SystemExit('MISSING: %s (run build_items.py first)' % items_path)
    gegenstaende = json.loads(items_path.read_text(encoding='utf-8'))['items']
    args.ziel.mkdir(parents=True, exist_ok=True)
    bericht = {}
    for lang in SPRACHEN:
        quelle = args.daten / ('sets-suche-%s.json' % lang)
        if not quelle.is_file():
            raise SystemExit('MISSING: %s (run build_sets.py first)' % quelle)
        index = json.loads(quelle.read_text(encoding='utf-8'))
        daten = {'schema': 1, 'lang': lang, 'labels': index['labels'],
                 'sets': zeilen(index, gegenstaende)}
        ziel = args.ziel / ('sets-%s.js' % lang)
        ziel.write_text('window.MQL_SETS = '
                        + json.dumps(daten, ensure_ascii=False, separators=(',', ':'))
                        + ';\n', encoding='utf-8')
        bericht[lang] = {'sets': len(daten['sets']), 'bytes': ziel.stat().st_size}
    print(json.dumps(bericht, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
