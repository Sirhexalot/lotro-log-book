"""Wear requirements of set pieces, in the shape `web/eignung.js` reads.

One place for both surfaces: the set page model carries the list for the chip
in the set head, the browser data of the set list carries it for the chip in
every row. A piece without a minimum level is ignored — the same rule as
`eignung_daten()` in `php_viewmodel.py`, so a chip never judges a piece the
catalogue knows nothing about.

A grouped entry is `[min, klasse, volk, armour, waffe, extra, scalable, anzahl]`
(see `SCHLUESSEL`). Identical requirements collapse into one counted entry:
a six-piece set usually shares one requirement, which keeps the browser data
small and the chip's tooltip readable.
"""
from __future__ import annotations

SCHLUESSEL = ('min', 'klasse', 'volk', 'armour', 'waffe', 'extra', 'scalable')


def anforderungen(item: dict | None) -> dict | None:
    """Requirements of one piece, or None when nothing is known to judge."""
    item = item or {}
    try:
        minimum = int(item.get('ml') or 0)
    except (TypeError, ValueError):
        minimum = 0
    if minimum <= 0:
        return None
    return {'min': minimum, 'klasse': item.get('rk') or '',
            'volk': item.get('rr') or '', 'armour': item.get('at') or '',
            'waffe': item.get('wt') or '', 'extra': 1 if item.get('ex') else 0,
            'scalable': 1 if item.get('sc') else 0}


def gruppiere(liste: list) -> list:
    """Requirements with their count; language-independent and JSON-ready."""
    zaehler: dict = {}
    for eintrag in liste:
        if not eintrag:
            continue
        schluessel = tuple(eintrag[key] for key in SCHLUESSEL)
        zaehler[schluessel] = zaehler.get(schluessel, 0) + 1
    geordnet = sorted(zaehler.items(), key=lambda row: row[0])
    return [list(schluessel) + [anzahl] for schluessel, anzahl in geordnet]


def aus_gegenstaenden(kennungen, gegenstaende: dict) -> list:
    """Grouped requirements for the given item ids, read from `daten/items.json`."""
    return gruppiere([anforderungen(gegenstaende.get(kennung)) for kennung in kennungen])
