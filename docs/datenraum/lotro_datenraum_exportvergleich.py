"""Audit compact exports against exact IDs/properties in available Companion data."""
import collections
import hashlib
import json
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, EXPORT, table, dtype

sources = {}


def readjson(name):
    p = EXPORT / name
    sources[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
    return json.loads(p.read_text())


def xml(name):
    p = LORE / name
    sources[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
    return ET.parse(p).getroot()


def hexid(value):
    return f'{int(value) & 0xffffffff:08X}'


def walk(value, path, stats):
    s = stats.setdefault(path, collections.Counter())
    s[dtype(value)] += 1
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, path + '.' + k, stats)
    elif isinstance(value, list):
        for v in value:
            walk(v, path + '[]', stats)


items = readjson('items-2026-11-08/items.json')
rewards = readjson('rewards-2026-11-06/rewards.json')
recipes = readjson('rezepte-2026-11-06/recipes.json')
recipe_sources = readjson('recipe-sources-2026-11-06/recipe-sources.json')
profiles = []
for name, data, buckets in [
    ('items', items, ['items', 'sets']),
    ('rewards', rewards, ['tables', 'items', 'titles', 'virtues', 'traits', 'emotes']),
    ('recipes', recipes, ['items', 'professions', 'tiers', 'categories']),
    ('recipe-sources', recipe_sources, ['sources']),
]:
    stats = {}
    for k, v in data.items():
        if k == 'stats' and name == 'items':
            for lang, labels in v.items():
                for row in labels.values():
                    walk(row, '$.stats.' + lang + '.<id>', stats)
        elif k in buckets:
            for row in v.values():
                walk(row, '$.' + k + '.<id>', stats)
        else:
            walk(v, '$.' + k, stats)
    profiles += ['## ' + name, '',
                 table(['Property path (`<id>` = dynamic key)', 'Types/occurrences'],
                       [('`' + k + '`', ', '.join(f'{t}: {n}' for t, n in sorted(s.items())))
                        for k, s in sorted(stats.items())]), '']

xi = {hexid(e.get('key')): e.attrib for e in xml('items.xml').findall('./item')}
xs = {e.get('id'): e for e in xml('sets.xml').findall('./set')}
xr = {hexid(e.get('id')) for e in xml('recipes.xml').findall('./recipe')}
membership = collections.defaultdict(set)
for sid, e in xs.items():
    for child in e.findall('./item'):
        membership[hexid(child.get('id'))].add(sid)

checks = []


def check(label, values, target):
    vals = [str(v) for v in values]
    missing = collections.Counter(v for v in vals if v not in target)
    checks.append({'relation': label, 'occurrences': len(vals),
                   'resolved': sum(v in target for v in vals), 'missing': dict(missing)})


check('Item export ID → Companion item', items['items'], xi)
check('Companion item → item export ID (coverage)', xi, items['items'])
check('Set export ID → Companion set', items['sets'], xs)
check('Item export set → set export ID', [r['set'] for r in items['items'].values() if 'set' in r], items['sets'])
check('Set export i[] → item export ID', [i for r in items['sets'].values() for i in r['i']], items['items'])
check('Recipe export id → Companion recipe', [r['id'] for r in recipes['recipes']], xr)
check('Recipe export p → exported profession', [r['p'] for r in recipes['recipes'] if 'p' in r], recipes['professions'])
check('Recipe export t → exported tier', [r['t'] for r in recipes['recipes'] if 't' in r], recipes['tiers'])
check('Recipe export c → exported category', [r['c'] for r in recipes['recipes'] if 'c' in r], recipes['categories'])
for kind in ['r', 'cr', 'i', 'o']:
    vals = []
    for r in recipes['recipes']:
        if kind in ['r', 'cr']:
            if kind in r:
                vals.append(r[kind][0])
        else:
            vals.extend(row[0] for row in r.get(kind, []))
    check('Recipe ' + kind + ' → recipe item set', vals, recipes['items'])
    check('Recipe ' + kind + ' → complete item export', vals, items['items'])
for kind, target in [('fixed', 'items'), ('choice', 'items'), ('titles', 'titles'),
                     ('traits', 'traits'), ('virtues', 'virtues'), ('emotes', 'emotes')]:
    vals = []
    for r in rewards['tables'].values():
        for row in r.get(kind, []):
            val = row[0] if isinstance(row, list) else row
            if kind == 'emotes':
                val = hexid(val)
            vals.append(val)
    check('Reward ' + kind + ' → exported ' + target + ' set', vals, rewards[target])
check('Recipe source key → exported recipe ID', recipe_sources['sources'],
      {r['id'] for r in recipes['recipes']})

comparisons = []
for compact, original in [('q', 'quality'), ('l', 'level'), ('c', 'category'), ('s', 'slot'),
                           ('at', 'armourType'), ('wt', 'weaponType'), ('dt', 'damageType'),
                           ('rc', 'requiredClass'), ('rp', 'requiredProfession')]:
    comparable = equal = 0
    mismatches = []
    for ident, row in items['items'].items():
        meta = xi.get(ident, {})
        if compact not in row or original not in meta:
            continue
        comparable += 1
        if str(row[compact]) == meta[original]:
            equal += 1
        else:
            mismatches.append({'id': ident, 'export': row[compact], 'companion': meta[original]})
    comparisons.append({'compact': compact, 'original': original, 'compared': comparable,
                         'equal': equal, 'mismatches': mismatches})
setchecks = []
for ident, row in items['items'].items():
    expected = membership.get(ident, set())
    if row.get('set') and row['set'] not in expected:
        setchecks.append({'id': ident, 'exported': row['set'], 'companion_sets': sorted(expected)})
multiple = {i: sorted(s) for i, s in membership.items() if len(s) > 1}

# Reward tables referenced by normalized achievement records: missing compact output
# is not equivalent to missing DAT table (export intentionally filters reward kinds).
achievable_checks = []
for fn in ['quests.json', 'deeds.json']:
    rows = readjson('full-dat-en-de-fr-2026-11-03/' + fn)
    refs = [hexid(r['properties']['Quest_QuestTreasureDID']) for r in rows
            if (r.get('properties') or {}).get('Quest_QuestTreasureDID')]
    missing = collections.Counter(v for v in refs if v not in rewards['tables'])
    achievable_checks.append({'source': fn, 'references': len(refs),
                              'in_compact_reward_export': sum(v in rewards['tables'] for v in refs),
                              'not_in_compact_reward_export': dict(missing)})

omitted_items = sorted(set(xi) - set(items['items']))
omitted_items_empty_names = [i for i in omitted_items if xi[i].get('name') == '']
virtue_missing = next(r['missing'] for r in checks if r['relation'].startswith('Reward virtues'))
stat_labels = {lang: {e.get('key'): e.get('value') for e in xml('labels/' + lang + '/stats.xml')}
               for lang in ['de', 'en', 'fr']}
virtue_missing_labels = {i: {lang: labels.get(i) for lang, labels in stat_labels.items()}
                         for i in virtue_missing}
source_recipe_missing = next(r['missing'] for r in checks if r['relation'].startswith('Recipe source key'))
source_recipe_in_companion = {i: i in xr for i in source_recipe_missing}
payload = {'checks': checks, 'item_field_comparisons': comparisons,
           'set_membership_mismatches': setchecks, 'multiple_set_memberships': multiple,
           'achievement_reward_coverage': achievable_checks, 'source_sha256': sources,
           'omitted_items_with_empty_companion_name': omitted_items_empty_names,
           'unresolved_virtue_stat_labels': virtue_missing_labels,
           'source_recipe_not_exported_companion_presence': source_recipe_in_companion}
(OUT / 'lotro-datenraum-exportvergleich.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2))
text = [
    '# Compacted exports: properties, ID references and data loss', '',
    'The stored historical exports are checked against the active local '
    'Companion lore. Without a shared source timestamp, differences do not prove a '
    'game or decoder error. All open values and field deviations are listed in full '
    'in `lotro-datenraum-exportvergleich.json`.', '',
    '## Complete structure of the checked compact sets', '',
    *profiles, '## ID checks', '',
    table(['Relation', 'Occurrences', 'Resolved', 'Open', 'Distinct open'],
          [(r['relation'], r['occurrences'], r['resolved'], sum(r['missing'].values()), len(r['missing']))
           for r in checks]), '',
    '## Field comparison item export ↔ Companion', '',
    'Only fields actually present on both sides are compared. '
    'Uncompared values do not count as identical. Because of the documented fallback '
    'logic, the minimum level is not treated as a direct equality field.', '',
    table(['Compact field', 'Companion attribute', 'Compared', 'Identical', 'Deviating'],
          [(r['compact'], r['original'], r['compared'], r['equal'], len(r['mismatches']))
           for r in comparisons]), '',
    '## Set membership', '',
    f'{len(multiple)} item IDs are assigned to several sets in the Companion set. '
    'The compact item structure has only one scalar `set` value; it cannot represent '
    'this relation without loss. The set member lists are the '
    'authoritative complete reverse direction in the checked data state. '
    f'{len(setchecks)} emitted item-set assignments contradict the member list.', '',
    '## Classification of the open references', '',
    f'- All {len(omitted_items)} Companion IDs missing from the item export have '
    f'an empty name in the checked Companion state '
    f'({len(omitted_items_empty_names)} actually checked). That alone does not prove '
    'the exact cause of their absence from the historical DAT export.',
    f'- {len(virtue_missing)} distinct references from `tables[].virtues` '
    'are missing from the compact virtue catalogue. Their actual stat labels are '
    'listed in full in the JSON. No join across identically named virtues and no '
    'silent interpretation of these stats as regular virtue objects.',
    f'- {len(source_recipe_missing)} recipe source keys are missing from the recipe export; '
    f'{sum(source_recipe_in_companion.values())} of them exist in the Companion recipe set. '
    'So separate export filters or timestamps must be checked, not automatically '
    'the source references deleted.', '',
    '## Quests/deeds → compacted reward tables', '',
    'The exporter filters tables without reward kinds it can use. A missing '
    'table key in the compact export therefore does not prove a broken DAT reference.', '',
    table(['Source', 'Table references', 'Resolvable in compact set', 'Not included'],
          [(r['source'], r['references'], r['in_compact_reward_export'],
            sum(r['not_in_compact_reward_export'].values())) for r in achievable_checks]), '',
    '## Proven code transformations (not to be confused with raw data)', '',
    '- `export_rewards.py:export`: fixed and selectable titles are merged into one list; '
    'the same applies to emotes. Without the raw tables the original '
    'selection role cannot be reconstructed.',
    '- `export_items.py:main`: item IDs come from `items.xml`, not from a '
    'complete re-determination of all item classes. With multiple memberships, set '
    'assignment overwrites the previous scalar value.',
    '- `export_items.py:compact`: binding 0/1/2, minimum-level fallbacks, '
    '0/empty-string defaults and curve computation are transformations.',
    '- `export_recipes.py:export`: a recipe without a resolved result or without '
    'resolved ingredients is dropped; missing quantities can become 1.',
    '', '## Reproduction', '',
    '`python3 lotro_datenraum_exportvergleich.py`. No client access and no '
    'write operation outside the plan folder. SHA-256 of all inputs used here '
    'is in the JSON evidence.', ''
]
(OUT / 'lotro-datenraum-exportvergleich.md').write_text('\n'.join(text))
print('checks', len(checks), 'item properties', len(comparisons), 'multiple sets', len(multiple),
      'set mismatches', len(setchecks))
