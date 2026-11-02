#!/usr/bin/env python3
"""Writes `daten/geografie.json`: which quest groups are real places?

The catalogue introduces a `category:` level below a region. It contains both:
real sub-regions (Wildwood, Fornost, Far Anórien) and pure groupings (festival,
captain, introduction). Only the places are usable for a map.

The DAT data help with the distinction: `areas.json` contains all named places
of the game, `enum-names.json` the English name of every quest group. A group
counts as a place when its name (or the part before a colon) appears in
`areas.json`. Groups whose name is a region (`zone:`) drop out – the region is
already one level higher.

Usage:

    python3 baue_geografie.py
    # or with other paths:
    python3 baue_geografie.py --export <DAT export> --enums <enum-names.json>

The result is language-independent, because only the codes are stored
(`category:360` is the same group in every language).
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

HIER = Path(__file__).resolve().parent
LOTRO = Path('/Users/adrian/Documents/07_Hobbys/Lotro')
STANDARD_EXPORT = (LOTRO / 'Companion-Test/source-exporter/'
                   'full-dat-en-de-fr-2026-11-01')
STANDARD_ENUMS = LOTRO / 'Companion-Test/source-exporter/enums/enum-names.json'
STANDARD_KATALOG = LOTRO / 'MagicQuestLog/plugin/MagicQuestLog/Data/Quests_de.lua'
STANDARD_AUS = HIER / 'daten/geografie.json'

# Names that appear as a place in the export but are not one.
KEINE_ORTE = {'Test'}


def fold(text):
    """Comparison form: lowercase, without accents, without leading "the"."""
    text = unicodedata.normalize('NFKD', str(text))
    text = text.encode('ascii', 'ignore').decode().lower()
    text = re.sub(r'[^a-z0-9]+', ' ', text).strip()
    return text[4:] if text.startswith('the ') else text


def ortsnamen(export):
    """All English place names from areas.json."""
    datei = Path(export) / 'areas.json'
    if not datei.is_file():
        raise SystemExit('MISSING: %s' % datei)
    namen = set()
    for record in json.loads(datei.read_text(encoding='utf-8')):
        props = record.get('properties') or {}
        quellen = [((record.get('title') or {}).get('texts') or {}),
                   ((props.get('Area_Name') or {}).get('texts') or {})]
        for texte in quellen:
            if texte.get('en'):
                namen.add(texte['en'])
    return namen


def gebietsnamen(katalog):
    """English region names from the `zone:` keys of the catalogue."""
    text = Path(katalog).read_text(encoding='utf-8')
    return {fold(name) for name in re.findall(r'\["k"\]="zone:([^"]+)"', text)}


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--export', type=Path, default=STANDARD_EXPORT)
    parser.add_argument('--enums', type=Path, default=STANDARD_ENUMS)
    parser.add_argument('--katalog', type=Path, default=STANDARD_KATALOG)
    parser.add_argument('--aus', type=Path, default=STANDARD_AUS)
    optionen = parser.parse_args()

    for name, pfad in (('Export', optionen.export), ('enums', optionen.enums),
                       ('catalogue', optionen.katalog)):
        if not pfad.exists():
            print('MISSING: %s -> %s' % (name, pfad), file=sys.stderr)
            return 2

    kategorien = json.loads(optionen.enums.read_text(encoding='utf-8'))['QuestCategory']
    orte = {fold(name) for name in ortsnamen(optionen.export)}
    gebiete = gebietsnamen(optionen.katalog)

    codes = {}
    for code, labels in kategorien.items():
        englisch = (labels or {}).get('en') or ''
        if not englisch or englisch in KEINE_ORTE:
            continue
        kopf = englisch.split(':', 1)[0]
        if fold(englisch) in gebiete or fold(kopf) in gebiete:
            continue          # is a region, already one level higher
        if fold(englisch) in orte or fold(kopf) in orte:
            codes[code] = englisch

    optionen.aus.parent.mkdir(parents=True, exist_ok=True)
    inhalt = {
        'hinweis': ('Erzeugt von baue_geografie.py. Codes von Aufgabengruppen, '
                    'die einem benannten Ort im DAT-Export entsprechen.'),
        'codes': dict(sorted(codes.items(), key=lambda paar: paar[1])),
    }
    optionen.aus.write_text(json.dumps(inhalt, ensure_ascii=False, indent=1) + '\n',
                            encoding='utf-8')
    print('%d place groups out of %d quest groups -> %s' %
          (len(codes), len(kategorien), optionen.aus))
    return 0


if __name__ == '__main__':
    sys.exit(main())
