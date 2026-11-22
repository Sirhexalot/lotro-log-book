#!/usr/bin/env python3
"""Export and compare client data in a cache directory, without applying it."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

CACHE = Path.home() / '.cache'
TOOLS = Path(__file__).resolve().parent
# The historical quest baseline uses English as the decoder's display locale.
LANGS = ('en', 'de', 'fr')
KINDS = ('quests', 'deeds', 'areas', 'landmarks', 'unclassified')


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, value):
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, delete=False) as target:
        temporary = Path(target.name)
        try:
            json.dump(value, target, ensure_ascii=False, indent=2)
            target.write('\n')
            target.close()
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)


def stamp(client):
    return {p.name: [p.stat().st_size, p.stat().st_mtime_ns]
            for p in sorted(client.glob('client_*.dat*')) if p.is_file()}


def index(rows):
    if not isinstance(rows, (dict, list)):
        raise ValueError('Expected a record list or ID map')
    indexed = rows if isinstance(rows, dict) else {str(row['id']): row for row in rows}
    if len(indexed) != len(rows) or not indexed:
        raise ValueError('Empty dataset or duplicate IDs')
    return indexed


def names(row):
    name = row.get('title') or row.get('n') or row.get('name')
    return name.get('texts', name.get('value', name)) if isinstance(name, dict) else name


def comparable(value):
    if isinstance(value, dict):
        # The decoder's display value follows the first requested locale. Compare
        # actual locale texts; retain the display value for untranslated fields.
        texts = value.get('texts')
        display = value.get('value')
        has_display = False
        if isinstance(texts, dict) and isinstance(display, str) and display:
            rendered = re.sub(r'\$\{([A-Z_]+)\}', r'\1', display)
            has_display = any(text in (display, rendered) for text in texts.values())
        return {k: comparable(v) for k, v in value.items() if k != 'value' or not has_display}
    if isinstance(value, list):
        return [comparable(v) for v in value]
    return value


def changed_fields(old, new, prefix=''):
    if isinstance(old, dict) and isinstance(new, dict):
        for key in sorted(old.keys() | new.keys()):
            field = prefix + key
            if key not in old or key not in new:
                yield field
            elif old[key] != new[key]:
                yield from changed_fields(old[key], new[key], field + '.')
    elif isinstance(old, list) and isinstance(new, list) and len(old) == len(new):
        for index, (left, right) in enumerate(zip(old, new)):
            if left != right:
                yield from changed_fields(left, right, f'{prefix}{index}.')
    elif old != new:
        yield prefix.rstrip('.')


def compare(old, new):
    old, new = index(old), index(new)
    changes = []
    for i in sorted(old.keys() & new.keys()):
        if old[i] != new[i]:
            fields = list(changed_fields(comparable(old[i]), comparable(new[i])))
            if fields:
                changes.append({'id': i, 'name': names(new[i]), 'fields': fields})
    return {
        'before': len(old), 'after': len(new),
        'added': [{'id': i, 'name': names(new[i])} for i in sorted(new.keys() - old.keys())],
        'removed': [{'id': i, 'name': names(old[i])} for i in sorted(old.keys() - new.keys())],
        'changed': changes,
    }


def location_diff(before, after):
    def rows(path):
        return Counter(json.dumps(row, sort_keys=True, ensure_ascii=False) for row in read(path))

    old, new = rows(before), rows(after)
    return {'before': sum(old.values()), 'after': sum(new.values()),
            'added_rows': [json.loads(row) for row in sorted((new - old).elements())],
            'removed_rows': [json.loads(row) for row in sorted((old - new).elements())]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for option in ('client', 'exporter', 'libraries', 'lore', 'baseline', 'output'):
        parser.add_argument('--' + option, required=True, type=Path)
    parser.add_argument('--items-before', type=Path)
    parser.add_argument('--recipes-before', type=Path)
    parser.add_argument('--rewards-before', type=Path)
    parser.add_argument('--instances-before', type=Path)
    parser.add_argument('--reuse-catalogue', action='store_true',
                        help='Reuse only a completed catalogue export from the same DAT snapshot')
    parser.add_argument('--compare-only', action='store_true',
                        help='Recompute the report from a previously completed run')
    args = parser.parse_args()
    output = args.output.resolve()
    if not output.is_relative_to(CACHE.resolve()) or output == CACHE.resolve():
        parser.error('output must be a dedicated directory under ~/.cache')
    if not args.compare_only:
        output.mkdir(exist_ok=args.reuse_catalogue)
    if args.reuse_catalogue and not args.compare_only and set(p.name for p in output.iterdir()) != {'catalogue'}:
        parser.error('reuse requires an output directory containing only catalogue/')
    archive_stamp = stamp(args.client)
    if args.compare_only:
        archive_stamp = read(output / 'diff.json')['archives']
    required = {'client_gamelogic.dat', 'client_general.dat', 'client_local_English.dat',
                'client_local_DE.dat', 'client_local_FR.dat'}
    if not required <= archive_stamp.keys():
        parser.error('missing required client or language archives')

    def run(script, *arguments):
        subprocess.run([sys.executable, '-B', str(args.exporter / script),
                        *map(str, arguments)], check=True)
        if stamp(args.client) != archive_stamp:
            raise ValueError('Client DAT files changed during the run; discard the candidate')

    common = ('--client', args.client, '--libraries', args.libraries, '--languages', *LANGS)
    catalogue = output / 'catalogue'
    if not (args.reuse_catalogue or args.compare_only):
        run('export_sources.py', *common, '--discover', '--output', catalogue)
    manifest = read(catalogue / 'manifest.json')
    if (manifest['errors'] or manifest['records_received'] != manifest['requested_ids']
            or set(manifest['languages']) != set(LANGS)
            or not manifest['scope'].startswith('all actual gamelogic WState entries')):
        raise ValueError('Incomplete catalogue export')
    archived = {row['file']: [row['size'], row['mtime_ns']] for row in manifest['source_archives']}
    if not required <= archived.keys() or any(archive_stamp.get(k) != v for k, v in archived.items()):
        raise ValueError('Catalogue manifest does not match the current DAT archives')
    validation = subprocess.check_output(
        [sys.executable, '-B', str(args.exporter / 'validate_export.py'), str(catalogue)], text=True)
    validation = json.loads(validation)
    if not validation['language_keys_match'] or validation['invalid_or_absent_positions']:
        raise ValueError('Catalogue validation found language or coordinate errors')

    entities = {}
    report = {'status': 'comparison in progress; not approved for adoption', 'archives': archive_stamp,
              'baseline': str(args.baseline.resolve()), 'entities': entities, 'validation': validation,
              'locations': location_diff(args.baseline / 'locations.json', catalogue / 'locations.json'),
              'review': {},
              'not_exported': ['instance chest loot', 'NPCs and placements', 'factions',
                               'travel', 'map imagery, resource occurrences and terrain'],
              'limitations': ['Historical catalogue baseline is a mix of export dates.',
                              'Companion lore labels are supplementary, not freshly exported.',
                              'Website build and epic regression checks are separate gates.']}

    def add(kind, old, new):
        entities[kind] = compare(old, new)
        entities[kind]['added_without_all_names'] = [
            row['id'] for row in entities[kind]['added']
            if isinstance(row['name'], dict) and not all(row['name'].get(lang) for lang in LANGS)]
        write(output / 'diff.json', report)
        result = entities[kind]
        print(f"{kind}: +{len(result['added'])} ~{len(result['changed'])} "
              f"-{len(result['removed'])} ({result['before']} -> {result['after']})", flush=True)

    for kind in KINDS:
        add(kind, read(args.baseline / (kind + '.json')), read(catalogue / (kind + '.json')))
    item_ids = None
    for mode, before, extra, keys in (
        ('items', args.items_before, ('--inventory', catalogue / 'inventory.tsv', '--lore', args.lore),
         ('items', 'sets')),
        ('recipes', args.recipes_before, ('--export', catalogue, '--lore', args.lore), ('recipes',)),
        ('rewards', args.rewards_before, ('--export', catalogue, '--labels', args.lore / 'labels'),
         ('tables', 'titles', 'virtues', 'traits', 'emotes')),
    ):
        if before is None:
            report['not_exported'].append(mode)
            continue
        if not args.compare_only:
            run(f'export_{mode}.py', *common, *extra, '--output', output / mode)
        old, new = read(before), read(output / mode / f'{mode}.json')
        if mode == 'items':
            item_ids = set(new['items'])
        for kind in keys:
            if kind == 'recipes':
                def recipe_rows(data):
                    return [dict(row, name=names(data['items'].get(str(row['r'][0]), {})))
                            for row in data['recipes']]
                add(kind, recipe_rows(old), recipe_rows(new))
                if item_ids is not None:
                    added = {row['id'] for row in entities[kind]['added']}
                    report['review']['new_recipe_results_missing_from_item_export'] = [
                        {'id': row['id'], 'result': row['r'][0]}
                        for row in new[kind] if row['id'] in added and row['r'][0] not in item_ids]
            else:
                add('reward_tables' if kind == 'tables' else kind, old[kind], new[kind])
    if args.instances_before:
        finder = output / 'instance-finder.json'
        if not args.compare_only:
            ids = output / 'instance-ids.txt'
            ids.write_text(''.join(f'{i}\n' for i, kind in
                                   (line.split() for line in (catalogue / 'inventory.tsv').read_text().splitlines())
                                   if kind == '2606'), encoding='utf-8')
            run('export_sources.py', *common, '--ids', ids, '--output', output / 'instance-raw')
            raw = output / 'instance-raw' / 'raw.jsonl'
            enum_lines = subprocess.check_output(
                ['java', '--class-path', str(args.libraries / '*'), str(TOOLS / 'InstanceFinderEnums.java'),
                 str(args.client)], text=True)
            if stamp(args.client) != archive_stamp:
                raise ValueError('Client DAT files changed during instance export')
            from export_instance_finder import build, records
            rows = records(raw)
            controls = [row['properties'] for row in rows if row['class_index'] == 2606]
            if len(controls) != 1:
                raise ValueError('Exactly one WorldJoinControl required')
            control = controls[0]
            refs = set(control['WorldJoin_AvailablePETemplates_Array'])
            for group in control.get('WorldJoinControl_InstanceGroups', []):
                refs.update(group['WorldJoinControl_Grouped_Instance_List'])
            missing = {f'{i:08X}' for i in refs} - {row['id'] for row in rows}
            if missing:
                extra_ids = output / 'instance-extra-ids.txt'
                extra_ids.write_text('\n'.join(sorted(missing)) + '\n', encoding='utf-8')
                run('export_sources.py', *common, '--ids', extra_ids, '--output', output / 'instance-extra')
                rows.extend(records(output / 'instance-extra' / 'raw.jsonl'))
            write(finder, build(rows, rows, enum_lines.splitlines()))
        add('instances', read(args.instances_before)['instances'], read(finder)['instances'])
    else:
        report['not_exported'].append('instances')
    if not args.compare_only and stamp(args.client) != archive_stamp:
        raise ValueError('Client DAT files changed before the report was completed')
    report['status'] = 'comparison complete; not approved for adoption'
    write(output / 'diff.json', report)
    print(output / 'diff.json')
    return 2 if any(result['removed'] for result in entities.values()) else 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        sys.exit(f'Data update stopped: {error}')
