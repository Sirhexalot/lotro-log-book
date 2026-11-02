#!/usr/bin/env python3
"""Schreibt `daten/geografie.json`: welche Aufgabengruppen sind echte Orte?

Der Katalog führt unter einem Gebiet eine Ebene `category:` ein. Darin steckt
beides: echte Untergebiete (Wildwald, Fornost, Ferne Auen) und reine
Gruppierungen (Fest, Hauptmann, Einleitung). Für eine Karte sind nur die Orte
brauchbar.

Die DAT-Daten helfen bei der Unterscheidung: `areas.json` enthält alle
benannten Orte des Spiels, `enum-names.json` den englischen Namen jeder
Aufgabengruppe. Eine Gruppe gilt als Ort, wenn ihr Name (oder der Teil vor
einem Doppelpunkt) in `areas.json` steht. Gruppen, deren Name ein Gebiet
(`zone:`) ist, fallen heraus – das Gebiet steht schon eine Ebene höher.

Aufruf:

    python3 baue_geografie.py
    # oder mit anderen Pfaden:
    python3 baue_geografie.py --export <DAT-Export> --enums <enum-names.json>

Das Ergebnis ist sprachunabhängig, weil nur die Codes gespeichert werden
(`category:360` bleibt in jeder Sprache dieselbe Gruppe).
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

# Namen, die zwar als Ort im Export stehen, aber keine sind.
KEINE_ORTE = {'Test'}


def fold(text):
    """Vergleichsform: Kleinschreibung, ohne Akzente, ohne führendes "the"."""
    text = unicodedata.normalize('NFKD', str(text))
    text = text.encode('ascii', 'ignore').decode().lower()
    text = re.sub(r'[^a-z0-9]+', ' ', text).strip()
    return text[4:] if text.startswith('the ') else text


def ortsnamen(export):
    """Alle englischen Ortsnamen aus areas.json."""
    datei = Path(export) / 'areas.json'
    if not datei.is_file():
        raise SystemExit('FEHLT: %s' % datei)
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
    """Englische Gebietsnamen aus den `zone:`-Schlüsseln des Katalogs."""
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
                       ('Katalog', optionen.katalog)):
        if not pfad.exists():
            print('FEHLT: %s -> %s' % (name, pfad), file=sys.stderr)
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
            continue          # ist ein Gebiet, steht schon eine Ebene höher
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
    print('%d Ortsgruppen von %d Aufgabengruppen -> %s' %
          (len(codes), len(kategorien), optionen.aus))
    return 0


if __name__ == '__main__':
    sys.exit(main())
