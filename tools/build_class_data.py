#!/usr/bin/env python3
"""Build class/race profiles and compact filtered catalogues from client lore."""
from __future__ import annotations

import html
import json
import os
import re
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
LORE = Path(os.environ.get(
    'LLB_LORE',
    str(Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore'),
))
WEB = ROOT / 'web'
LANGS = ('de', 'en', 'fr')


def labels(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise SystemExit(f'Missing client labels: {path}')
    return {node.get('key', ''): html.unescape(node.get('value', '')).strip()
            for node in ElementTree.parse(path).getroot().iter('label')}


def build() -> dict:
    classes_xml = ElementTree.parse(LORE / 'classes.xml').getroot()
    races_xml = ElementTree.parse(LORE / 'races.xml').getroot()
    class_labels = {lang: labels(LORE / 'labels' / lang / 'classes.xml') for lang in LANGS}
    race_labels = {lang: labels(LORE / 'labels' / lang / 'races.xml') for lang in LANGS}
    enum_labels = {}
    for enum in ('ArmourType', 'WeaponType'):
        entries = list(ElementTree.parse(LORE / 'enums' / f'{enum}.xml').getroot().iter('entry'))
        per_language = {
            lang: labels(LORE / 'labels' / lang / f'enum-{enum}.xml') for lang in LANGS
        }
        enum_labels[enum] = {
            lang: {
                row.get('key', ''): per_language[lang].get(row.get('name', ''), row.get('key', ''))
                for row in entries
            } for lang in LANGS
        }
        enum_labels[enum]['codes'] = {row.get('key', ''): row.get('code', '') for row in entries}
    classes = {}
    for node in classes_xml.findall('class'):
        key = node.get('key', '')
        if not key:
            continue
        prof = node.find('proficiencies')
        classes[key] = {
            'names': {lang: class_labels[lang].get(node.get('id', ''), node.get('key', ''))
                      for lang in LANGS},
            'races': [],
            'armour': [{'type': x.get('type', ''), 'level': int(x.get('level', '1'))}
                       for x in (prof.findall('armour') if prof is not None else [])],
            'weapons': [{'type': x.get('type', ''), 'level': int(x.get('level', '1'))}
                        for x in (prof.findall('weapon') if prof is not None else [])],
        }
    races = {}
    for node in races_xml.findall('race'):
        key = node.get('key', '')
        if not key:
            continue
        label_key = node.get('name', '')
        races[key] = {'names': {lang: race_labels[lang].get(label_key, key) for lang in LANGS},
                      'classes': [x.get('id', '') for x in node.findall('allowedClass')]}
        for class_key in races[key]['classes']:
            if class_key in classes:
                classes[class_key]['races'].append(key)
    if not classes or not races:
        raise SystemExit('Client class/race data was empty')
    return {'classes': classes, 'races': races, 'enums': enum_labels}


def catalogue_rows(path: Path, variable: str) -> list:
    """Read an existing generated catalogue without importing its JS."""
    text = path.read_text(encoding='utf-8')
    marker = re.search(rf'window\.{re.escape(variable)}\s*=\s*', text)
    if marker is None:
        raise SystemExit(f'Missing {variable} in {path}')
    return json.JSONDecoder().raw_decode(text[marker.end():])[0]


def catalogue_data(lang: str) -> dict:
    """Build compact, localized catalogues with their explicit class/race rules."""
    lore = ElementTree.parse(LORE / 'quests.xml').getroot()
    deed_lore = ElementTree.parse(LORE / 'deeds.xml').getroot()
    quest_rows = catalogue_rows(WEB / f'daten-{lang}.js', 'MQL_QUESTS')
    deed_rows = catalogue_rows(WEB / f'daten-taten-{lang}.js', 'MQL_QUESTS')
    quests = {format(int(q.get('id', '0')), '08X'): q for q in lore.iter('quest')}
    deeds = {format(int(d.get('id', '0')), '08X'): d for d in deed_lore.iter('deed')}
    def optional_name(value):
        text = str(value or '').strip()
        return '' if text.lower() in ('other', 'none', 'unknown') else text

    def compact(rows, source):
        found = []
        for row in rows:
            raw = source.get(row['i'])
            if raw is None:
                continue
            # The class page promises the level shown in its own column. For
            # quests and deeds that is the catalogue level `l`, not the
            # prerequisite `minLevel` from the client XML: the latter kept
            # level-130 deeds in a level-123 list.
            try:
                level = int(float(row.get('l') or 0))
            except (TypeError, ValueError):
                level = 0
            if level <= 0:
                try:
                    level = int(float(raw.get('minLevel') or raw.get('level') or 0))
                except (TypeError, ValueError):
                    level = 0
            if level < 0:
                level = 0
            rewards = sorted({str(reward[0]) for reward in row.get('rw') or []
                              if reward and reward[0]})
            try:
                points = int(row.get('lp') or 0)
            except (TypeError, ValueError):
                points = 0
            flags = [key for key in ('dy', 'rp', 'ix', 'ls') if row.get(key)]
            if row.get('gr') == 1:
                flags.append('gr1')
            elif row.get('gr') == 2:
                flags.append('gr2')
            found.append([row['i'], row['n'], level,
                          raw.get('requiredClass', ''), raw.get('requiredRace', ''),
                          optional_name(row.get('r')), optional_name(row.get('z')),
                          flags, rewards, points])
        return found
    return {'quests': compact(quest_rows, quests), 'deeds': compact(deed_rows, deeds)}


def write() -> None:
    for lang in LANGS:
        profile = build()
        (WEB / f'klassen-{lang}.js').write_text(
            '/* Generated from the LOTRO client lore. */\n'
            f'window.MQL_KLASSEN={json.dumps(profile, ensure_ascii=False, separators=(",", ":"))};\n',
            encoding='utf-8',
        )
        catalogues = catalogue_data(lang)
        (WEB / f'klassen-katalog-{lang}.js').write_text(
            '/* Generated from the LOTRO client lore and localized web catalogues. */\n'
            f'window.MQL_KLASSEN_KATALOG={json.dumps(catalogues, ensure_ascii=False, separators=(",", ":"))};\n',
            encoding='utf-8',
        )


if __name__ == '__main__':
    write()
