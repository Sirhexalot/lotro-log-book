#!/usr/bin/env python3
"""Join directly decoded finder control, templates and DAT enum labels.

This is a source audit, not a replacement for the published instance browser.
No website lists or Companion label texts are used as input.
"""
import argparse
import json
from pathlib import Path

LANGUAGES = ('de', 'en', 'fr')


def records(path):
    result = []
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.startswith('{'):
            continue  # Java decoder can emit diagnostics before its JSONL.
        row = json.loads(line)
        if 'error' in row:
            raise ValueError(f"Decoder error: {row['id']}: {row['error']}")
        result.append(row)
    return result


def build(control_rows, templates, enum_lines):
    controls = [r for r in control_rows if r.get('class_index') == 2606]
    if len(controls) != 1:
        raise ValueError('Exactly one WorldJoinControl required')
    control = controls[0]['properties']
    labels = {}
    for line in enum_lines:
        parts = line.rstrip('\n').split('\t')
        if len(parts) == 4:
            enum, code, lang, text = parts
            labels.setdefault(enum, {}).setdefault(int(code), {})[lang] = text
    by_id = {int(r['id'], 16): r['properties'] for r in templates}
    # Epic battles are a separate picker group, not in AvailablePETemplates.
    available = control['WorldJoin_AvailablePETemplates_Array']
    groups = control.get('WorldJoinControl_InstanceGroups', [])
    battle_ids = [i for g in groups for i in g['WorldJoinControl_Grouped_Instance_List']]
    battle_groups = {i: g['WorldJoinControl_Instance_Group_Label']
                     for g in groups for i in g['WorldJoinControl_Grouped_Instance_List']}
    result = []
    for ident in dict.fromkeys(available + battle_ids):
        if ident not in by_id:
            raise ValueError(f'Missing finder template: {ident:08X}')
        props = by_id[ident]
        category = props.get('WorldJoin_EncounterCategory')
        kind = props.get('WorldJoin_EncounterType')
        name = props.get('PrivateEncounterTemplate_Name', {}).get('texts', {})
        if not all(name.get(lang) for lang in LANGUAGES):
            raise ValueError(f'Missing translated name: {ident:08X}')
        cluster = labels.get('WJEncounterCategory', {}).get(category, {})
        if category and not all(cluster.get(lang) for lang in LANGUAGES):
            raise ValueError(f'Missing cluster label: {category}')
        result.append({
            'id': f'{ident:08X}', 'name': name,
            'category': category, 'cluster': cluster, 'type': kind,
            'type_label': labels.get('WJEncounterType', {}).get(kind, {}),
            'group': battle_groups.get(ident),
            'group_label': labels.get('WJInstanceGroup', {}).get(battle_groups.get(ident), {}),
            'picker': 'epic_battle' if ident in battle_groups else 'available',
            'group_sizes': props.get('Skirmish_Template_GroupSizeArray', []),
            'max_players': props.get('PrivateEncounterTemplate_MaxPlayers'),
            'level_min': props.get('Skirmish_Template_MinLevelScale'),
            'level_max': props.get('Skirmish_Template_MaxLevelScale'),
            'difficulties': props.get('Skirmish_Template_DifficultyTierArray', []),
        })
    return {'schema': 1, 'source': 'client DAT WorldJoinControl',
            'control_id': controls[0]['id'],
            'available_count': len(set(available)),
            'epic_battle_count': len(set(battle_ids)),
            'instances': result}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--control', type=Path, required=True)
    parser.add_argument('--templates', type=Path, required=True)
    parser.add_argument('--enums', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = build(records(args.control), records(args.templates),
                   args.enums.read_text(encoding='utf-8').splitlines())
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"{len(result['instances'])} finder entries, including {result['epic_battle_count']} epic battle variants")


if __name__ == '__main__':
    main()
