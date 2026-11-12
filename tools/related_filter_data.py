"""Bounded list records: the browser receives relations, never a full catalogue."""
import re


def task_rows(records, pages):
    """One row per quest or deed: what a list needs, nothing localised twice."""
    def belegt(value):
        # "other" is the client's placeholder for "no recorded area", not a name.
        text = str(value or '').strip()
        return '' if text.lower() in ('other', 'none', 'unknown') else text

    result = {}
    for ident, row in records.items():
        facts = pages[ident].get('facts') or []
        level = re.search(r'\d+', str(row.get('l') or ''))
        result[ident] = {
            'id': ident, 'name': row['n'], 'category': belegt(row.get('a')),
            'type': facts[0]['text'] if facts else '',
            'region': belegt(row.get('r')), 'area': belegt(row.get('z')),
            'level': int(level.group()) if level else None,
            'rewards': sorted({r[0] for r in row.get('rw') or []}),
            'points': row.get('lp') or 0,
        }
    return result
