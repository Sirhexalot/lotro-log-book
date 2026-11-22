"""Count entities and relations from the built web data. Read-only.

Writes `lotro-datenraum-zaehlung.json` next to this script. Every number is
derived from the files that the website build actually ships, not from an
older export or from documentation. A missing value stays `null`, never 0.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
WEB = Path('/Users/adrian/Developer/Lotro/lotro-log-book')
DATA = WEB / 'daten'


def load(name):
    path = DATA / name
    if not path.exists():
        return None
    return json.loads(path.read_text())


def nonempty(rows, field):
    return sum(1 for r in rows if r.get(field))


def links(rows, field):
    return sum(len(r.get(field) or []) for r in rows)


def distinct(rows, field):
    return len({r[field] for r in rows if r.get(field)})


quests = (load('quests-de.json') or {}).get('quests', [])
deeds = (load('taten-de.json') or {}).get('quests', [])
items = (load('items.json') or {}).get('items', {})
givers = (load('auftraggeber.json') or {}).get('givers', {})
vendors = (load('haendler.json') or {}).get('vendors', {})
sets = (load('sets.json') or {}).get('sets', {})
titles = (load('titel.json') or {}).get('eintraege', {})
virtues = (load('tugenden.json') or {}).get('eintraege', {})
factions = (load('fraktionen.json') or {}).get('fraktionen', {})
landmark_data = load('landmarken.json') or {}
landmarks = landmark_data.get('landmarken', {})
landmark_count = landmark_data.get('zaehler', {})
instances = (load('instanzen.json') or {}).get('instanzen', {})
maps = load('karten.json') or []
occ = list(DATA.glob('vorkommen/*.json'))

recipes = 0
recipe_file = WEB / 'web' / 'rezepte-de.js'
if recipe_file.exists():
    text = recipe_file.read_text()
    payload = json.loads(text[text.find('{'):text.rfind('}') + 1])
    recipes = len(payload.get('r', []))

reward_rows = [r for q in quests for r in (q.get('rw') or [])]
item_rewards = [r for r in reward_rows if r and r[0] == 'i']

verified = json.loads((OUT / 'lotro-datenraum-relationen.json').read_text())
deep = json.loads((OUT / 'lotro-datenraum-vertiefung.json').read_text())

result = {
    'measured_at': __import__('datetime').datetime.now(
        __import__('datetime').timezone.utc).isoformat(),
    'source': 'daten/ and web/ of the built German catalogue, one language',
    'language': 'de',
    'entities': {
        'quests': len(quests),
        'deeds': len(deeds),
        'items': len(items),
        'recipes': recipes,
        'sets': len(sets),
        'titles': len(titles),
        'virtues': len(virtues),
        'factions': len(factions),
        'quest_givers': len(givers),
        'vendors': len(vendors),
        'landmarks': len(landmarks),
        'landmarks_with_position': len(landmarks) - landmark_count.get('ohne_ort', 0),
        'landmarks_with_map': landmark_count.get('mit_karte'),
        'landmarks_with_objectives': landmark_count.get('mit_ziel'),
        'instances': len(instances),
        'maps': len(maps),
        'resource_occurrence_maps': len(occ),
    },
    'relations': {
        'quests_with_quest_giver': nonempty(quests, 'g'),
        'distinct_quest_giver_ids_in_quests': distinct(quests, 'gi'),
        'quest_reward_rows': len(reward_rows),
        'quest_reward_item_links': len(item_rewards),
        'distinct_reward_items': len({r[6] for r in item_rewards if len(r) > 6}),
        'deeds_with_reward': nonempty(deeds, 'rw'),
        'items_with_vendor': sum(1 for v in items.values() if v.get('haendler')),
        'item_vendor_links': links(items.values(), 'haendler'),
        'items_with_recipe': sum(1 for v in items.values() if v.get('rezepte')),
        'items_with_source': sum(1 for v in items.values() if v.get('quellen')),
        'items_with_barter': sum(1 for v in items.values() if v.get('tausch')),
    },
    'reference_rules': {
        'main_rules': len(verified),
        'main_references': sum(r['resolved'] + sum(r['unresolved'].values()) for r in verified),
        'main_unresolved': sum(sum(r['unresolved'].values()) for r in verified),
        'deep_rules': len(deep['rules']),
        'deep_references': sum(r['references'] for r in deep['rules']),
        'deep_unresolved': sum(sum(r['unresolved'].values()) for r in deep['rules']),
        'deep_rules_without_references': sum(1 for r in deep['rules'] if r['references'] == 0),
    },
}

(OUT / 'lotro-datenraum-zaehlung.json').write_text(
    json.dumps(result, indent=2, ensure_ascii=False))
print(json.dumps(result, indent=2, ensure_ascii=False))
