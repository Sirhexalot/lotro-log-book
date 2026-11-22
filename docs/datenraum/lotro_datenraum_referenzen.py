"""Repeat reference checks independently; no game/project writes."""
import json
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, table

path = OUT / 'lotro-datenraum-relationen.json'
rules = json.loads(path.read_text())
trees = {}


def root(name):
    if name not in trees:
        trees[name] = ET.parse(LORE / name).getroot()
    return trees[name]


for r in rules:
    if r['source'] == 'quests.xml' and r['selector'] == './/bestower':
        r['attribute'] = 'npcId'
    if r['source'] == 'travels.xml':
        r.update(selector='.//route', target_selector='.//destination')
    targets = {e.get(r['target_attribute']) for e in root(r['target']).findall(r['target_selector'])}
    if r['selector'] == './/prerequisite':
        # Achievable prerequisites can refer to quests OR deeds.
        targets |= {e.get('id') for name in ['quests.xml', 'deeds.xml']
                    for e in root(name) if e.get('id')}
        r['target_note'] = 'Union quests.xml/quest + deeds.xml/deed; shared achievable ID space'
    vals = [e.get(r['attribute']) for e in root(r['source']).findall(r['selector'])
            if e.get(r['attribute']) is not None]
    missing = {}
    for v in vals:
        if v not in targets:
            missing[v] = missing.get(v, 0) + 1
    r.update(rows=len(vals), resolved=sum(v in targets for v in vals), unresolved=missing)
rows = [(f'{r["source"]}: `{r["selector"]}/@{r["attribute"]}`',
         r.get('target_note') or f'{r["target"]}: `{r["target_selector"]}/@{r["target_attribute"]}`',
         r['rows'], r['resolved'], sum(r['unresolved'].values()), len(r['unresolved'])) for r in rules]
path.write_text(json.dumps(rules, ensure_ascii=False, indent=2))
(OUT / 'lotro-datenraum-relationen.md').write_text(
    '# Reference validation against concrete target sets\n\n'
    'Exact ID equality without name resolution. Source attributes were corrected against '
    'the XML structure; prerequisites use the shared quest/deed ID space. '
    'A valid target proves neither character unlock nor current game availability. '
    'The rules are a checked subset, not all relations of the data space.\n\n' +
    table(['Source', 'Checked target', 'References', 'Resolved', 'Unresolved', 'Open distinct values'], rows) +
    '\n\nDetails: `lotro-datenraum-relationen.json`. Reproduction: '
    '`python3 lotro_datenraum_referenzen.py` after the main audit.\n')
print('rules', len(rules), 'references', sum(r['rows'] for r in rules),
      'unresolved', sum(sum(r['unresolved'].values()) for r in rules))
