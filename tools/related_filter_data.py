"""Bounded list records: the browser receives relations, never a full catalogue."""
import re


def task_rows(records, pages, other_deed=()):
    """One row per quest or deed: what a list needs, nothing localised twice."""
    def belegt(value):
        # "other" is the client's placeholder for "no recorded area", not a name.
        text = str(value or '').strip()
        return '' if text.lower() in ('other', 'none', 'unknown') else text

    result = {}
    for ident, row in records.items():
        facts = pages[ident].get('facts') or []
        level = re.search(r'\d+', str(row.get('l') or ''))
        kind = facts[0]['text'] if facts else ''
        result[ident] = {
            'id': ident, 'name': row['n'],
            # The client's quest category mixes areas, classes and story kinds.
            # It is recorded for the page text, but it is no usable filter.
            # An unrecorded deed kind stays empty instead of "Weitere Tat".
            'type': '' if kind in other_deed else kind,
            'flags': [key for key in ('dy', 'rp', 'gr', 'ix', 'ls') if row.get(key)],
            'region': belegt(row.get('r')), 'area': belegt(row.get('z')),
            'level': int(level.group()) if level else None,
            'rewards': sorted({r[0] for r in row.get('rw') or []}),
            'points': row.get('lp') or 0,
        }
    return result
