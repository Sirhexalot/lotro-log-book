#!/usr/bin/env python3
"""Reference data for the Reputation and Crafting pages: web/referenz.js.

Reads our own DAT export of factions and crafting professions (made with
Companion-Test/source-exporter, see its README) and writes names in German,
English and French:

- factions: name, lowest/highest/default tier and the name of every tier;
- professions: name and, per tier, the proficiency and mastery title plus the
  experience each needs.

Text that the game varies by gender ("Geselle"/"Gesellin") arrives as
${NAME:Gesellin[f]|Geselle[m]}; it is shown as "Geselle / Gesellin". Nothing is
translated by hand; a text the game does not have in a language falls back to
English and is counted.

Usage:
    python3 build_referenz.py --export <reputation-crafting export folder>
"""
import argparse
import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
STANDARD = HIER.parent / 'Companion-Test/source-exporter/reputation-crafting-2026-11-03'
SPRACHEN = ('de', 'en', 'fr')
AUSWAHL = re.compile(r'\$\{[A-Z_]+:([^}]*)\}')
VARIABLE = re.compile(r'\$\{[^}]*\}')


def aufloesen(text):
    """${X:A[f]|B[m]} -> "B / A" (masculine first, as the plugin does), other
    variables dropped, whitespace tidied."""
    def wahl(treffer):
        teile = []
        for teil in treffer.group(1).split('|'):
            name = re.sub(r'\[[^\]]*\]', '', teil).strip()
            if name and name not in teile:
                geschlecht = re.search(r'\[([a-z]+)\]', teil)
                teile.append((0 if geschlecht and geschlecht.group(1) == 'm' else 1, name))
        teile.sort(key=lambda paar: paar[0])
        return ' / '.join(dict.fromkeys(name for _, name in teile))
    text = AUSWAHL.sub(wahl, text or '')
    text = VARIABLE.sub('', text)
    return re.sub(r'\s+', ' ', text).strip()


def titel(text):
    """A title string reads "RANK NAME SURNAME, Journeyman Woodworker": keep the
    part after the name."""
    text = text or ''
    # The name part is "${RANK}… ${SURNAME}" or, already rendered, "RANK NAME SURNAME";
    # only what follows the first comma is the title.
    if ',' in text:
        text = text.split(',', 1)[1]
    return aufloesen(text)


def texte(wert, umwandeln, fehlend):
    if not isinstance(wert, dict):
        return None
    roh = wert.get('texts') or {}
    englisch = umwandeln(roh.get('en') or wert.get('value') or '')
    aus = {}
    for sprache in SPRACHEN:
        text = umwandeln(roh.get(sprache) or '')
        if not text:
            text = englisch
            if sprache != 'en':
                fehlend[sprache] = fehlend.get(sprache, 0) + 1
        aus[sprache] = text
    return aus if englisch else None


def baue(export):
    roh = {}
    for zeile in (export / 'raw.jsonl').read_text(encoding='utf-8').splitlines():
        eintrag = json.loads(zeile)
        roh[eintrag['id']] = eintrag.get('properties') or {}

    def hex_id(zahl):
        return '%08X' % (int(zahl) & 0xFFFFFFFF)

    fehlend = {}
    fraktionen = {}
    for ident, props in roh.items():
        name = texte(props.get('Reputation_Faction_Name'), aufloesen, fehlend)
        if not name:
            continue
        stufen = {}
        folge = roh.get(hex_id(props.get('Reputation_Faction_TierNameProgression') or 0)) or {}
        start = folge.get('Progression_MinimumIndexValue', 1)
        for position, wert in enumerate(folge.get('StringInfoProgression_Array') or []):
            stufen[str(start + position)] = texte(wert, aufloesen, fehlend)
        fraktionen[ident] = {
            'n': name,
            'min': props.get('Reputation_LowestTier'),
            'max': props.get('Reputation_HighestTier'),
            'start': props.get('Reputation_Faction_DefaultTier'),
            's': stufen,
        }

    berufe = {}
    for ident, props in roh.items():
        name = texte(props.get('CraftProfession_Name'), aufloesen, fehlend)
        if not name:
            continue
        stufen = []
        for stufe in props.get('CraftProfession_TierArray') or []:
            koennen = roh.get(hex_id(stufe.get('CraftProfession_ProficiencyTitle') or 0)) or {}
            meister = roh.get(hex_id(stufe.get('CraftProfession_MasteryTitle') or 0)) or {}
            stufen.append({
                't': stufe.get('CraftProfession_Tier'),
                'kxp': stufe.get('CraftProfession_ProficiencyXPCap'),
                'mxp': stufe.get('CraftProfession_MasteryXPCap'),
                'k': texte(koennen.get('Title_String'), titel, fehlend),
                'm': texte(meister.get('Title_String'), titel, fehlend),
            })
        stufen.sort(key=lambda s: s['t'])
        # LOTRO Companion names a profession by its English name in capitals.
        berufe[name['en'].upper()] = {'id': ident, 'n': name, 's': stufen}
    return {'fraktionen': fraktionen, 'berufe': berufe}, fehlend


KATALOG = HIER.parent / 'MagicQuestLog/plugin/MagicQuestLog/Data'


def ruf_quellen(katalog, sprache):
    """Per faction the quests and deeds that give reputation with it, from the
    plugin catalogue (field rf): [id, name, level, 'q' or 't', reward tier, area]."""
    from lupa.lua51 import LuaRuntime
    quellen = {}
    for art, kurz in (('Quests', 'q'), ('Deeds', 't')):
        lua = LuaRuntime()
        lua.execute((katalog / ('%s_%s.lua' % (art, sprache))).read_text(encoding='utf-8'))
        daten = lua.globals().MagicQuestLog.Data['%s_%s' % (art.lower(), sprache)]
        for index in range(1, len(daten) + 1):
            eintrag = daten[index]
            rf = eintrag['rf']
            if rf is None:
                continue
            pfad = eintrag['p']
            namen = [pfad[i]['n'] for i in range(1, len(pfad) + 1)] if pfad else []
            gebiet = ' · '.join(namen[-2:][::-1])
            stufe = eintrag['l']
            quellen.setdefault(rf[1], []).append([
                eintrag['id'], eintrag['name'], int(stufe) if str(stufe).isdigit() else 0,
                kurz, int(rf[2] or 0), gebiet])
    for liste in quellen.values():
        liste.sort(key=lambda zeile: (zeile[2], zeile[1]))
    return quellen


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--export', type=Path, default=STANDARD)
    optionen = parser.parse_args()
    if not (optionen.export / 'raw.jsonl').is_file():
        print('MISSING: %s/raw.jsonl' % optionen.export, file=sys.stderr)
        return 2
    daten, fehlend = baue(optionen.export)
    if len(daten['fraktionen']) < 50 or len(daten['berufe']) < 8:
        print('Implausibly few factions or professions; nothing written', file=sys.stderr)
        return 1
    ziel = HIER / 'web' / 'referenz.js'
    ziel.write_text('/* Generated by build_referenz.py from our own DAT export. Do not edit. */\n'
                    'window.MQL_REFERENZ = %s;\n' % json.dumps(daten, ensure_ascii=False, separators=(',', ':')),
                    encoding='utf-8')
    if (KATALOG / 'Quests_de.lua').is_file():
        for sprache in SPRACHEN:
            quellen = ruf_quellen(KATALOG, sprache)
            datei = HIER / 'web' / ('ruf-quellen-%s.js' % sprache)
            datei.write_text('/* Generated by build_referenz.py from the plugin catalogue. Do not edit. */\n'
                             'window.MQL_RUF_QUELLEN = %s;\n' % json.dumps(quellen, ensure_ascii=False, separators=(',', ':')),
                             encoding='utf-8')
            print('%s: %d factions with reputation sources -> %s'
                  % (sprache, len(quellen), datei.relative_to(HIER)))
    print('%d factions, %d professions -> %s; English fallback: %s'
          % (len(daten['fraktionen']), len(daten['berufe']), ziel.relative_to(HIER), fehlend or 'none'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
