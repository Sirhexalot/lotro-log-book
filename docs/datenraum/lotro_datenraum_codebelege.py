"""Index literal property access in all available Companion extraction Java sources."""
import collections
import hashlib
import json
import re
from pathlib import Path
from lotro_datenraum_audit import OUT, EXPORT, table

ROOT = (Path.home() / 'Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation'
        '/src/main/java/delta/games/lotro/tools/extraction')
lookup = collections.defaultdict(list)
files = {}
unread = []
for p in sorted(ROOT.rglob('*.java')):
    try:
        text = p.read_text()
    except OSError as exc:
        unread.append({'file': str(p), 'error': str(exc)})
        print('UNREAD', p, str(exc), flush=True)
        continue
    files[str(p)] = hashlib.sha256(text.encode()).hexdigest()
    lines = text.splitlines()
    # Excludes standalone comments; helper calls and dynamic property names require manual tracing.
    in_comment = False
    for i, line in enumerate(lines):
        code = line
        if in_comment:
            if '*/' not in code:
                continue
            code = code.split('*/', 1)[1]
            in_comment = False
        if '/*' in code:
            before, after = code.split('/*', 1)
            if '*/' in after:
                code = before + after.split('*/', 1)[1]
            else:
                code = before
                in_comment = True
        code = code.split('//', 1)[0]
        for match in re.finditer(r'(?:getProperty|getPropertyValueByName)\(\s*"([^"]+)"', code):
            prop = match.group(1)
            lookup[prop].append({
                'file': str(p.relative_to(ROOT)), 'line': i + 1,
                'code': line.strip(),
                'context_start': max(1, i - 3),
                'context': lines[max(0, i - 4):min(len(lines), i + 9)]
            })

observed = collections.defaultdict(set)
for dirname in ['full-dat-en-de-fr-2026-11-03', 'placed-2026-11-03',
                'npcs-2026-11-03', 'reputation-crafting-2026-11-03']:
    p = EXPORT / dirname / 'raw.jsonl'
    h = hashlib.sha256()

    def walk(v, cls):
        if isinstance(v, dict):
            for key, child in v.items():
                if '_' in key:
                    observed[key].add(cls)
                walk(child, cls)
        elif isinstance(v, list):
            for child in v:
                walk(child, cls)

    with p.open('rb') as handle:
        for line in handle:
            h.update(line)
            if line.strip():
                row = json.loads(line)
                walk(row.get('properties', {}), str(row.get('class_index')))
    files[str(p)] = h.hexdigest()

report = {
    'source_root': str(ROOT), 'source_sha256': files,
    'unread_source_files': unread,
    'literal_property_accesses': dict(lookup),
    'observed_property_classes': {k: sorted(v) for k, v in observed.items()},
    'observed_without_literal_accessor': sorted(set(observed) - set(lookup)),
    'observed_with_literal_accessor': sorted(set(observed) & set(lookup)),
}
(OUT / 'lotro-datenraum-codebelege.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
lines = [
    '# Code evidence index for property semantics', '',
    'All readable Java files under the named Companion extraction source tree were '
    'searched for direct literal `getProperty`/`getPropertyValueByName` accesses. '
    'This is a list of occurrences, **not an automatic confirmation of meaning**. '
    'Dynamic property names, helper calls and further libraries need '
    'separate tracing. A missing occurrence proves no fundamentally '
    'unknown meaning. Source tree and installed JARs are separate '
    'version records; identical implementation is not generally proven.', '',
    f'Source root: `{ROOT}`', '',
    f'Unreadable source files: {len(unread)}; concrete paths and errors in the JSON. '
    'Where reads failed, the source inventory is explicitly incomplete.', '',
    f'{len(lookup)} distinct literal property names; '
    f'{sum(len(v) for v in lookup.values())} code occurrences. '
    f'Of {len(observed)} observed property names in the four raw sets, '
    f'{len(set(observed) & set(lookup))} have at least one direct literal '
    'access in this source tree.', '',
    '## Occurrences per property', ''
]
for prop, refs in sorted(lookup.items()):
    lines += ['### `' + prop + '`', '',
              'Observed raw data classes: ' + ', '.join(sorted(observed.get(prop, set()))) + '.', '',
              table(['File relative to the source root', 'Line', 'Exact access'],
                    [(r['file'], r['line'], '`' + r['code'] + '`') for r in refs]), '']
lines += ['## Observed fields without a direct literal access in the checked source tree', '',
          '\n'.join('- `' + k + '`' for k in sorted(set(observed) - set(lookup))), '',
          'Full context, classes and hashes: `lotro-datenraum-codebelege.json`.', '']
(OUT / 'lotro-datenraum-codebelege.md').write_text('\n'.join(lines))
print('literal properties', len(lookup), 'observed', len(observed),
      'intersection', len(set(observed) & set(lookup)))
