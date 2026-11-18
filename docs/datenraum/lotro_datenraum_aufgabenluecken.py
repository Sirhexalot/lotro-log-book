"""Resolve the three remaining achievement references against normalized DAT."""
import hashlib
import json
from lotro_datenraum_audit import OUT, EXPORT

ids = ['1879443606', '1879407580', '1879049597']
found = {}
hashes = {}
for fn in ['quests.json', 'deeds.json']:
    path = EXPORT / 'full-dat-en-de-fr-2026-11-03' / fn
    hashes[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    for row in json.loads(path.read_text()):
        if row.get('id') in {f'{int(i):08X}' for i in ids}:
            found[row['id']] = {'source': str(path), 'class_index': row.get('class_index')}
result = {'references': {i: {'hex': f'{int(i):08X}', 'decoded': found.get(f'{int(i):08X}')}
                         for i in ids}, 'source_sha256': hashes}
assert all(r['decoded'] for r in result['references'].values())
(OUT / 'lotro-datenraum-aufgabenluecken.json').write_text(json.dumps(result, indent=2))
print('3/3 normalized DAT achievement IDs resolved')
