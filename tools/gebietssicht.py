#!/usr/bin/env python3
"""Presentation-only geographic grouping keyed by game map IDs.

The game map tree and every catalogue relation remain canonical. This module
only produces readable labels/paths and optional group headings for views.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / 'referenz' / 'gebietsansicht.json'
MAP_PATH = ROOT / 'daten' / 'karten.json'


def configuration() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding='utf-8'))


def map_tree() -> dict[int, dict]:
    return {int(row['idx']): row for row in json.loads(MAP_PATH.read_text(encoding='utf-8'))}


def chain(ident: int, tree: dict[int, dict] | None = None) -> list[int]:
    """Return map IDs from the root down to ident; break on malformed cycles."""
    tree = tree or map_tree()
    result, seen = [], set()
    cursor = int(ident)
    while cursor in tree and cursor not in seen:
        seen.add(cursor)
        result.append(cursor)
        parent = tree[cursor].get('eltern')
        if parent is None:
            break
        cursor = int(parent)
    return list(reversed(result))


def group_for(ident: int, tree: dict[int, dict] | None = None) -> dict | None:
    tree = tree or map_tree()
    ancestry = set(chain(int(ident), tree))
    for group in configuration().get('groups', []):
        if int(group['region']) in ancestry and ancestry.intersection(
                {int(value) for value in group['maps']}):
            return group
    return None


def map_group_data(lang: str) -> dict:
    """Language-ready view metadata; IDs, not names, define membership."""
    config = configuration()
    return {
        'schema': config['schema'],
        'promote': [
            {'from': int(row['from']), 'maps': [int(value) for value in row['maps']],
             'group': row.get('group'), 'label': row.get('label', {}).get(lang, '')}
            for row in config.get('promote', [])
        ],
        'groups': [
            {'id': row['id'], 'region': int(row['region']),
             'label': row['label'][lang],
             'maps': [int(value) for value in row['maps']]}
            for row in config.get('groups', [])
        ],
    }


def validate_configuration() -> None:
    """Fail the data build if an approved grouping drifts from the game map tree."""
    tree = map_tree()
    config = configuration()
    promoted: set[int] = set()
    for rule in config.get('promote', []):
        parent = int(rule['from'])
        if parent not in tree:
            raise ValueError(f'unknown overview map ID: {parent}')
        for raw_id in rule['maps']:
            ident = int(raw_id)
            if ident not in tree or int(tree[ident].get('eltern') or -1) != parent:
                raise ValueError(f'map {ident} is not a direct child of {parent}')
            if ident in promoted:
                raise ValueError(f'map {ident} is promoted more than once')
            promoted.add(ident)
    assigned: set[int] = set()
    for group in config.get('groups', []):
        region = int(group['region'])
        if region not in tree:
            raise ValueError(f'unknown region map ID: {region}')
        for raw_id in group['maps']:
            ident = int(raw_id)
            if ident not in tree or region not in chain(ident, tree):
                raise ValueError(f'map {ident} is not below region {region}')
            if ident in assigned:
                raise ValueError(f'map {ident} occurs in multiple display groups')
            assigned.add(ident)
    for raw_id, override in config.get('map_overrides', {}).items():
        ident = int(raw_id)
        if ident not in tree:
            raise ValueError(f'unknown map override ID: {ident}')
        target = override.get('merge_into')
        if target is not None:
            target = int(target)
            if target not in tree:
                raise ValueError(f'unknown map merge target ID: {target}')
            if int(tree[ident].get('eltern') or -1) != int(tree[target].get('eltern') or -1):
                raise ValueError(f'map {ident} and merge target {target} are not siblings')


def display_name(ident: int, name: str, lang: str) -> str:
    """Remove a redundant East/West Rohan prefix from grouped card labels."""
    group = group_for(int(ident))
    if not group:
        return name
    prefixes = {
        'de': (r'Ost-Rohan\s*:\s*', r'West-Rohan\s*:\s*'),
        'en': (r'East Rohan\s*:\s*', r'West Rohan\s*:\s*'),
        'fr': (r'Rohan\s+Est\s*:\s*', r'Ouest\s+du\s+Rohan\s*:\s*'),
    }.get(lang, ())
    for prefix in prefixes:
        name = re.sub(r'^' + prefix, '', name, count=1, flags=re.IGNORECASE)
    return name


def display_path(ident: int, names: dict[int, str], lang: str,
                 tree: dict[int, dict] | None = None) -> list[str]:
    """Localized map path with approved display grouping, retaining map IDs."""
    tree = tree or map_tree()
    path_ids = chain(int(ident), tree)
    promote = {
        int(row['from']): {int(value) for value in row['maps']}
        for row in configuration().get('promote', [])
    }
    # Hide a presentation-only overview layer when the next real map has its
    # own card. The overview remains addressable by its original ID.
    visible_ids = []
    for index, map_id in enumerate(path_ids):
        next_id = path_ids[index + 1] if index + 1 < len(path_ids) else None
        if next_id is not None and next_id in promote.get(map_id, set()):
            continue
        visible_ids.append(map_id)

    labels = []
    previous_group = None
    for map_id in visible_ids:
        group = group_for(map_id, tree)
        if group and group['id'] != previous_group:
            group_label = group['label'][lang]
            parent_name = names.get(int(group['region']), '')
            if labels and labels[-1] != group_label:
                labels.append(group_label)
            elif not labels and parent_name:
                labels.extend([parent_name, group_label])
            previous_group = group['id']
        name = names.get(map_id, '')
        if name:
            name = display_name(map_id, name, lang)
            if not labels or labels[-1] != name:
                labels.append(name)
    # A localized group heading replaces the prefixed map name, not the map
    # itself. Keep the remainder of the chain for descendants.
    return labels
