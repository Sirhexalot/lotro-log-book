#!/usr/bin/env python3
"""Build an ID-based set catalogue and audit from the local client export.

Reads dependencies only. Does not alter the old set export or publish anything.
Numeric bonus definitions are preserved, not evaluated without scaling/units.
"""
import argparse
import json
import re
import math
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from itemnamen import sauberer_name

ROOT = Path(__file__).resolve().parent
LORE = Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore'
LANGS = ('de', 'en', 'fr')


def identifier(value):
    number = int(value)
    if not 0 < number <= 0xffffffff:
        raise ValueError('Invalid game ID: %s' % value)
    return '%08X' % number


def labels(lore, lang, filename):
    path = lore / 'labels' / lang / filename
    return {row.get('key'): row.get('value', '') for row in ET.parse(path).getroot()}


def readable(text, lang):
    text = sauberer_name(text or '', lang).strip()
    return text if text and not re.search(r'\bDNT\b|^key:', text, re.I) else ''


def bonus_text(row, translated, definition):
    """Only source-authored prose or typed constants have a safe display.

    isPercentage marks percent units (the constants already carry percent
    points). SET replaces a stat; it is not an additive bonus. A progression
    reference alone does not establish its input level, so never evaluate it
    against set.level/maxLevel or against an arbitrary piece's item level.
    """
    if not all(translated.values()):
        return None
    if row.tag in ('specialEffect', 'effect') or row.get('descriptionOverride'):
        if any(re.search(r'key:|\$\{|%s|<[^>]+>', t) for t in translated.values()):
            return None
        return translated
    if row.tag != 'stat' or row.get('scaling') or row.get('constant') is None:
        return None
    if definition.get('type') != 'INTEGER' and definition.get('isPercentage') != 'true':
        return None
    operator = row.get('operator', 'ADD')
    if operator not in ('ADD', 'SUBSTRACT', 'SET'):
        return None
    try:
        value = float(row.get('constant'))
    except (ValueError, TypeError):
        return None
    if not math.isfinite(value):
        return None
    if operator == 'SUBSTRACT':
        value = -value
    number = format(value, '.6g')  # client floats contain binary noise, e.g. 15.000001
    if operator != 'SET' and value >= 0:
        number = '+' + number
    unit = ' %' if definition.get('isPercentage') == 'true' else ''
    return {lang: label + ': ' + (number.replace('.', ',') if lang != 'en' else number) + unit
            for lang, label in translated.items()}


def filter_labels(lore, words):
    """Armour and equipment labels retain the actual enum keys."""
    result = {lang: {'class': {}, 'armour': {}, 'category': {
        'ARMOUR': {'de': 'Rüstung', 'en': 'Armour', 'fr': 'Armure'}[lang],
        'WEAPON': {'de': 'Waffe', 'en': 'Weapon', 'fr': 'Arme'}[lang],
        'JEWELLERY': {'de': 'Geschmeide', 'en': 'Jewellery', 'fr': 'Bijoux'}[lang],
        'ITEM': {'de': 'Sonstiges', 'en': 'Other', 'fr': 'Divers'}[lang],
    }} for lang in LANGS}
    for row in ET.parse(lore / 'classes.xml').getroot():
        for lang in LANGS:
            label = readable(words[lang]['classes'].get(row.get('id')), lang)
            if label:
                result[lang]['class'][row.get('key')] = label
    enum = lore / 'enums/ArmourType.xml'
    if enum.is_file():
        for lang in LANGS:
            texts = labels(lore, lang, 'enum-ArmourType.xml')
            for row in ET.parse(enum).getroot():
                label = readable(texts.get(row.get('name')), lang)
                if label:
                    result[lang]['armour'][row.get('key')] = label
    return result


def build(lore, items, details):
    """Pure build except for reading the supplied client directory."""
    words = {lang: {kind: labels(lore, lang, filename) for kind, filename in (
        ('sets', 'itemsSets.xml'), ('stats', 'stats.xml'), ('classes', 'classes.xml'),
        ('effects', 'effects.xml'))} for lang in LANGS}
    stat_defs = {}
    for row in ET.parse(lore / 'stats.xml').getroot():
        for key in (row.get('key'), row.get('legacyKey')):
            if key:
                stat_defs[key] = dict(row.attrib)
    class_ids = {row.get('key'): row.get('id') for row in ET.parse(lore / 'classes.xml').getroot()}
    item_names = {lang: labels(lore, lang, 'items.xml')
                  if (lore / 'labels' / lang / 'items.xml').is_file() else {} for lang in LANGS}
    catalogue, problems = {}, []
    facet_labels = filter_labels(lore, words)
    jewellery = set()
    if (lore / 'items.xml').is_file():
        for _event, row in ET.iterparse(lore / 'items.xml', events=('end',)):
            if row.tag == 'item' and row.get('class') == '49' and row.get('key'):
                jewellery.add(identifier(row.get('key')))
            row.clear()

    def problem(kind, sid, **extra):
        problems.append({'kind': kind, 'set': sid, **extra})

    for source in ET.parse(lore / 'sets.xml').getroot():
        sid = identifier(source.attrib['id'])
        if sid in catalogue:
            raise ValueError('Duplicate set ID: ' + sid)
        names = {}
        for lang in LANGS:
            # The second line carries unrelated max-level metadata, not a name.
            name = words[lang]['sets'].get(source.get('id'), '').split('\n')[0]
            names[lang] = readable(name, lang)
            if not names[lang]:
                problem('unusable_set_name' if name else 'missing_set_translation', sid, lang=lang)
        members, seen = [], set()
        for row in source.findall('item'):
            iid = identifier(row.attrib['id'])
            if iid in seen:
                problem('duplicate_member', sid, item=iid)
                continue
            seen.add(iid)
            item, detail = items.get(iid), details.get(iid) or {}
            if item is None:
                problem('missing_item', sid, item=iid)
            if not detail:
                problem('missing_item_details', sid, item=iid)
            reverse = detail.get('set')
            if reverse and identifier(reverse) != sid:
                problem('conflicting_membership', sid, item=iid, reverse=identifier(reverse))
            member_names = {lang: readable(((item or {}).get('n') or {}).get(lang)
                                          or (detail.get('name') or {}).get(lang)
                                          or item_names[lang].get(row.get('id'))
                                          or (row.get('name') if lang == 'en' else ''), lang)
                            for lang in LANGS}
            if not all(member_names.values()):
                problem('missing_item_translation', sid, item=iid)
            required_class = detail.get('requiredClass') or ''
            classes = [value for value in required_class.split(';') if value]
            class_labels = {}
            for lang in LANGS:
                translated_classes = [readable(words[lang]['classes'].get(class_ids.get(value)), lang)
                                      for value in classes]
                class_labels[lang] = ' / '.join(translated_classes) if all(translated_classes) else ''
            if required_class and not all(class_labels.values()):
                problem('unknown_class', sid, item=iid, code=required_class)
            members.append({
                'id': iid, 'available': item is not None, 'name': member_names,
                'icon': (item or {}).get('ic') or detail.get('icon'),
                'category': 'JEWELLERY' if iid in jewellery else (detail.get('category') or (item or {}).get('kat') or None),
                'armour': detail.get('subtype') if detail.get('category') == 'ARMOUR' else None,
                'slot': detail.get('slot') or (item or {}).get('slot') or None,
                'class': required_class or None, 'classes': classes, 'class_labels': class_labels,
                'class_known': bool(detail) and 'requiredClass' in detail
                               and (not required_class or all(class_labels.values())),
                'min_level': detail.get('minLevel') or None,
                'item_level': detail.get('level') or None,
                'quality': detail.get('quality') or None,
            })
        if not members:
            problem('empty_set', sid)
        bonuses = []
        for bonus in source.findall('bonus'):
            count = int(bonus.get('nbItems', '0'))
            if count < 1 or count > len(members):
                problem('invalid_bonus_threshold', sid, count=count)
            entries = []
            for row in bonus:
                raw = dict(row.attrib)
                translated = {}
                for lang in LANGS:
                    if row.tag == 'stat':
                        key = (stat_defs.get(row.get('name')) or {}).get('id')
                        label = words[lang]['stats'].get(key, '')
                        override = row.get('descriptionOverride')
                        if override:
                            label = words[lang]['sets'].get(override, '')
                    elif row.tag == 'specialEffect':
                        label = words[lang]['sets'].get(row.get('label'), '')
                    elif row.tag == 'effect':
                        label = words[lang]['effects'].get(row.get('id'), '')
                    else:
                        label = ''
                    translated[lang] = readable(label, lang)
                mode = ('scaling' if row.get('scaling') else
                        'constant' if row.get('constant') is not None else
                        'value' if row.get('value') is not None else 'description')
                # A stat name is not a complete value/effect description. Keep
                # operators and units untouched until their semantics are known.
                display = bonus_text(row, translated, stat_defs.get(row.get('name')) or {})
                ready = display is not None
                entry = {'kind': row.tag, 'mode': mode, 'source': raw,
                         'labels': translated, 'display_ready': ready, 'display': display}
                entries.append(entry)
                if not all(translated.values()):
                    problem('unresolved_bonus_label', sid, count=count, type=row.tag, source=raw)
                if row.tag == 'stat' and not ready:
                    problem('unevaluated_bonus_stat', sid, count=count, mode=mode, source=raw)
                elif row.tag not in ('stat', 'effect', 'specialEffect'):
                    problem('unknown_bonus_type', sid, count=count, type=row.tag)
            bonuses.append({'pieces': count, 'valid_threshold': 1 <= count <= len(members), 'entries': entries})
        catalogue[sid] = {
            'id': sid, 'source_id': source.get('id'), 'name': names,
            'source_metadata': {key: source.get(key) for key in ('level', 'maxLevel')},
            'listable': bool(members) and all(names.values()),
            'members': members, 'bonuses': bonuses,
        }

    problems.sort(key=lambda row: json.dumps(row, sort_keys=True))
    report = {'schema': 1, 'counts': {
        'sets': len(catalogue), 'listable': sum(s['listable'] for s in catalogue.values()),
        'member_references': sum(len(s['members']) for s in catalogue.values()),
        'missing_item_references': sum(p['kind'] == 'missing_item' for p in problems),
        'missing_unique_items': len({p['item'] for p in problems if p['kind'] == 'missing_item'}),
        'sets_with_missing_items': len({p['set'] for p in problems if p['kind'] == 'missing_item'}),
        'bonus_groups': sum(len(s['bonuses']) for s in catalogue.values()),
        'problems': dict(sorted(Counter(p['kind'] for p in problems).items())),
    }, 'problems': problems}
    indexes = {}
    for lang in LANGS:
        indexes[lang] = {'schema': 1, 'lang': lang, 'labels': facet_labels[lang], 'sets': [{
            'id': s['id'], 'name': s['name'][lang], 'parts': len(s['members']),
            'available_parts': sum(m['available'] for m in s['members']),
            'icons': [m['icon'] for m in s['members'] if m['available'] and m['icon']][:3],
            # Filter witnesses stay per member: never combine class of A with
            # armour/level of B and claim that a matching piece exists.
            'members': [{key: m[key] for key in (
                'id', 'available', 'category', 'armour', 'class', 'classes', 'class_known', 'min_level')}
                        | {'name': m['name'][lang]} for m in s['members']],
        } for s in sorted(catalogue.values(), key=lambda s: (s['name'][lang].casefold(), s['id']))
            if s['listable']]}
    return {'schema': 1, 'sets': catalogue}, report, indexes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--quelle', type=Path, default=LORE)
    parser.add_argument('--items', type=Path, default=ROOT / 'daten/items.json')
    parser.add_argument('--details', type=Path, default=ROOT / 'daten/gegenstand-details.json')
    parser.add_argument('--ziel', type=Path, default=ROOT / 'daten')
    args = parser.parse_args()
    result, report, indexes = build(args.quelle,
        json.loads(args.items.read_text(encoding='utf-8'))['items'],
        json.loads(args.details.read_text(encoding='utf-8'))['items'])
    args.ziel.mkdir(parents=True, exist_ok=True)
    outputs = {'sets.json': result, 'sets-pruefung.json': report,
               **{'sets-suche-%s.json' % lang: index for lang, index in indexes.items()}}
    for filename, value in outputs.items():
        (args.ziel / filename).write_text(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                                    separators=(',', ':')) + '\n', encoding='utf-8')
    print(json.dumps(report['counts'], ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
