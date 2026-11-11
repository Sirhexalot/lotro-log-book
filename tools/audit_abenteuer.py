#!/usr/bin/env python3
"""Audit candidate content assignments without pretending they prove access.

Usage: python3 tools/audit_abenteuer.py --ziel ~/.cache/llb-abenteuer-audit.json
No generated data is written into the checkout.
"""
import argparse
from collections import Counter
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def map_candidates(packs, maps):
    by_id = {int(row['idx']): row for row in maps}
    assignments = {}
    for pack in packs:
        roots = set(pack['candidate_map_roots'])
        excluded = set(pack.get('excluded_map_roots', []))
        missing = (roots | excluded) - by_id.keys()
        if missing:
            raise ValueError(f"{pack['id']}: unknown map ids {sorted(missing)}")
        for ident in by_id:
            chain, seen = [], set()
            cursor = ident
            while cursor in by_id:
                if cursor in seen:
                    raise ValueError(f'Map parent cycle at {cursor}')
                seen.add(cursor)
                chain.append(cursor)
                parent = by_id[cursor].get('eltern')
                if parent is None:
                    break
                cursor = int(parent)
            if roots.intersection(chain) and not excluded.intersection(chain):
                assignments.setdefault(ident, []).append(pack['id'])
    return assignments


def audit(reference, maps, quests):
    assignments = map_candidates(reference['packs'], maps)
    counts = Counter()
    ambiguous, unassigned = [], []
    for quest in quests:
        path = quest.get('fk') or []
        # Deepest attributed map, not an arbitrary named landscape match.
        candidates = next((assignments[int(i)] for i in reversed(path) if int(i) in assignments), [])
        if len(candidates) == 1:
            counts[candidates[0]] += 1
        elif candidates:
            ambiguous.append(quest['i'])
        else:
            unassigned.append(quest['i'])
    return {'schema': 1, 'reviewed': False,
            'warning': 'Candidate assignments only. Not a playable quest denominator or an access decision.',
            'candidate_quest_counts': dict(counts),
            'ambiguous_quests': ambiguous, 'unassigned_quests': unassigned,
            'overlapping_maps': {str(i): p for i, p in assignments.items() if len(p) > 1},
            'total_quests': len(quests)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path, required=True)
    args = parser.parse_args()
    reference = json.loads((ROOT / 'referenz/inhaltspakete.json').read_text())
    maps = json.loads((ROOT / 'daten/karten.json').read_text())
    quests = json.loads((ROOT / 'daten/quests-de.json').read_text())
    if isinstance(quests, dict):
        quests = quests['quests']
    result = audit(reference, maps, quests)
    args.ziel.parent.mkdir(parents=True, exist_ok=True)
    args.ziel.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k not in
                      ('ambiguous_quests', 'unassigned_quests', 'overlapping_maps')}, ensure_ascii=False, indent=2))
    print(f"Unassigned: {len(result['unassigned_quests'])}; ambiguous: {len(result['ambiguous_quests'])}; overlapping maps: {len(result['overlapping_maps'])}")


if __name__ == '__main__':
    main()
