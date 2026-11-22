"""Shared display-name sort key for generated lists and browser/server views."""
from __future__ import annotations

import re
import unicodedata

_SPEZIAL = str.maketrans({'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ł': 'l', 'ð': 'd', 'þ': 't'})
_LEADING = re.compile(r'^[^\w]+', re.UNICODE)
_RUNS = re.compile(r'\d+|\D+')


def schluessel(name: str):
    """Ignore leading punctuation, fold accents/case, and compare digit runs by value."""
    written = str(name or '')
    text = _LEADING.sub('', written).lower().translate(_SPEZIAL)
    text = ''.join(c for c in unicodedata.normalize('NFKD', text)
                   if not unicodedata.combining(c))
    return (tuple((0, int(run)) if run.isdigit() else (1, run)
                  for run in _RUNS.findall(text)), written)


def vergleiche(a: str, b: str) -> int:
    """Comparator equivalent to sorting with :func:`schluessel`."""
    ka, kb = schluessel(a), schluessel(b)
    return (ka > kb) - (ka < kb)
