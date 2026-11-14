#!/usr/bin/env python3
"""Two facts about every quest that the plugin catalogue does not carry.

Both come straight from the client export (``Companion-Test/source-exporter``),
not from a wiki or a guess:

* **nicht_erfasst** – ``Quest_IsCompletionTracked = 0``. The game does not record
  this quest as completed. It can never appear in a journal, so a page must not
  count it as an open task. (The return value is binary in the export: either the
  field is absent, which means tracked, or it is 0.)
* **instanzen** – an instance row (``Quest_IsInstanceQuest = 1``) and the chapter
  that opens it. The client stores no direct pointer, but the chapter declares
  ``Quest_ContainsInstanceQuest = 1`` and both carry the same title inside the same
  book category ("Instanz: Othrongroth" → "Buch 1, Kapitel 11: Othrongroth").
  A pair is only accepted when exactly one chapter and exactly one instance match;
  everything ambiguous stays a row of its own.

    python3 tools/build_questmerkmale.py

Writes ``daten/questmerkmale.json``. ``build_daten.py`` adds the result to the
quest rows as ``nt`` (not recorded) and ``ie`` (chapter this instance belongs to).
"""
import argparse
import collections
import json
import re
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
              '/full-dat-en-de-fr-2026-11-03/quests.json')
ZIEL = HIER / 'daten' / 'questmerkmale.json'
INSTANZ_PRAEFIX = re.compile(r'^(?:Instanz|Instance|Instance)\s*:\s*', re.I)
# 0x30000000 = completed. Operator 2 on a completed target means "must not be
# completed", so finishing that target rules this quest out for good. Operator 2
# on any other status only says "not underway at the moment" and is no exclusion.
ABGESCHLOSSEN = 0x30000000


def _text(wert):
    """German quest title without the export's non-breaking spaces."""
    if not isinstance(wert, dict):
        return ''
    return (wert.get('texts', {}).get('de') or wert.get('value') or '').replace('\xa0', ' ').strip()


def ausschluesse(rows):
    """Quest id → the quests whose completion makes it impossible."""
    ergebnis = {}
    for row in rows:
        blob = (row.get('properties') or {}).get('DefaultPermissionBlobStruct') or {}
        ziele = set()
        for requirement in blob.get('Usage_QuestRequirements') or []:
            if requirement.get('Usage_Operator') != 2:
                continue
            if requirement.get('Usage_QuestStatus') != ABGESCHLOSSEN:
                continue
            ziel = '%08X' % (int(requirement.get('Usage_QuestID', 0)) & 0xffffffff)
            if ziel != row['id'].upper():
                ziele.add(ziel)
        if ziele:
            ergebnis[row['id'].upper()] = sorted(ziele)
    return ergebnis


def lies(pfad=EXPORT):
    """(instance id → chapter id, id → completions that rule it out)."""
    rows = json.loads(Path(pfad).read_text(encoding='utf-8'))

    je_kategorie = collections.defaultdict(list)
    for row in rows:
        eigenschaften = row.get('properties') or {}
        je_kategorie[eigenschaften.get('Quest_Category')].append(row)

    kandidaten = {}
    for row in rows:
        eigenschaften = row.get('properties') or {}
        if eigenschaften.get('Quest_IsInstanceQuest') != 1:
            continue
        titel = INSTANZ_PRAEFIX.sub('', _text(eigenschaften.get('Quest_Name'))).strip()
        if not titel:
            continue
        passende = [other for other in je_kategorie[eigenschaften.get('Quest_Category')]
                    if other['id'] != row['id']
                    and (other.get('properties') or {}).get('Quest_IsInstanceQuest') != 1
                    and _text((other.get('properties') or {}).get('Quest_Name')).endswith(titel)]
        if len(passende) == 1:
            kandidaten[row['id'].upper()] = passende[0]['id'].upper()

    # A chapter that would own two instance rows is ambiguous in the other
    # direction: keep both rows visible instead of picking one.
    beansprucht = collections.Counter(kandidaten.values())
    instanzen = {instanz: kapitel for instanz, kapitel in sorted(kandidaten.items())
                 if beansprucht[kapitel] == 1}
    return instanzen, ausschluesse(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--export', type=Path, default=EXPORT)
    parser.add_argument('--ziel', type=Path, default=ZIEL)
    optionen = parser.parse_args()
    if not optionen.export.is_file():
        raise SystemExit('MISSING: %s' % optionen.export)
    instanzen, ausgeschlossen = lies(optionen.export)
    optionen.ziel.parent.mkdir(parents=True, exist_ok=True)
    optionen.ziel.write_text(json.dumps({
        'schema': 1,
        'quelle': optionen.export.parent.name + '/' + optionen.export.name,
        'instanzen': instanzen,
        'ausgeschlossen': ausgeschlossen,
    }, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('Instanz zu Kapitel: %d · durch Abschluss ausgeschlossen: %d → %s'
          % (len(instanzen), len(ausgeschlossen), optionen.ziel))


if __name__ == '__main__':
    main()
