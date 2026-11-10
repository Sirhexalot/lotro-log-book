#!/usr/bin/env python3
"""Rewrite the old flat addresses in templates and scripts to canonical ones.

Before the PHP switch every application page was a file at the site root
(`spielstand.html?lang=de`), so templates and scripts still link that way and
every click costs a 301. The canonical addresses are the language paths the
router serves: `/de/spielstand/`, `/en/progress/`, `/fr/progression/`.

    python3 tools/alte_adressen.py --pruefen php/templates web/*.js
    python3 tools/alte_adressen.py --schreiben php/templates web/*.js

Only `href="…"` values are touched; `data-ziel="…"` stays as it is, because
`menue.js` builds the language address from it at runtime.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))

# Same segments as php/src/Catalogue.php and tools/php_viewmodel.py; the test
# in tests/test_alte_adressen.py keeps them in step.
APP = {
    'de': {'start': '', 'karte': 'karte', 'taten': 'karte/taten',
           'gegenstandssuche': 'gegenstandssuche', 'handwerk': 'handwerk/rezepte',
           'reise': 'reise', 'ruf': 'ruf', 'belohnungen': 'belohnungen',
           'spielstand': 'spielstand', 'companion': 'companion', 'plugin': 'plugin',
           'suche': 'suche', 'gegenstand': 'gegenstand', 'auftraggeber': 'auftraggeber',
           'landmarks': 'landmarke', 'factions': 'fraktion', 'instances': 'instanz'},
    'en': {'start': '', 'karte': 'map', 'taten': 'map/deeds',
           'gegenstandssuche': 'item-search', 'handwerk': 'crafting/recipes',
           'reise': 'travel', 'ruf': 'reputation', 'belohnungen': 'rewards',
           'spielstand': 'progress', 'companion': 'companion', 'plugin': 'plugin',
           'suche': 'search', 'gegenstand': 'item', 'auftraggeber': 'quest-giver',
           'landmarks': 'landmark', 'factions': 'faction', 'instances': 'instance'},
    'fr': {'start': '', 'karte': 'carte', 'taten': 'carte/prouesses',
           'gegenstandssuche': 'recherche-objets', 'handwerk': 'artisanat/recettes',
           'reise': 'voyage', 'ruf': 'reputation', 'belohnungen': 'recompenses',
           'spielstand': 'progression', 'companion': 'companion', 'plugin': 'plugin',
           'suche': 'recherche', 'gegenstand': 'objet', 'auftraggeber': 'donneur-de-quete',
           'landmarks': 'site', 'factions': 'faction', 'instances': 'instance'},
}

# Legacy file name without ".html" -> application page.
SEITEN = {
    'start': 'start', 'index': 'karte', 'gegenstaende': 'gegenstandssuche',
    'handwerk': 'handwerk', 'reise': 'reise', 'ruf': 'ruf',
    'belohnungen': 'belohnungen', 'spielstand': 'spielstand',
    'companion': 'companion', 'plugin': 'plugin', 'suche': 'suche',
}

# Still their own files at the site root, no redirect involved.
STATISCH = ('impressum', 'datenschutz')

MUSTER = re.compile(r'href="([a-z-]+)\.html((?:\?[^"]*)?)"')
SPRACHEN = ('de', 'en', 'fr')
KENNUNG = re.compile(r'^(?:[0-9A-F]{8}|[A-Z][A-Z_]{1,20})$')


def ziel(name: str, query: str) -> str | None:
    """Canonical address for a legacy flat address, or None to leave it alone."""
    anker = ''
    if '#' in query:
        query, anker = query.split('#', 1)
        anker = '#' + anker
    teile = parse_qsl(query.lstrip('?'), keep_blank_values=True)
    werte = dict(teile)
    sprache = werte.get('lang', 'de')
    if sprache not in SPRACHEN:
        sprache = 'de'
    rest = [(k, v) for k, v in teile if k not in ('lang', 'art', 'id')]

    if name in STATISCH:
        return '/%s.html?lang=%s%s' % (name, sprache, anker)

    # An item page carried its id as a parameter: /gegenstand.html?id=70043586.
    # The detail page is the canonical address; without an id the list is gone.
    if name == 'gegenstand':
        kennung = str(werte.get('id') or '').upper()
        if kennung and KENNUNG.match(kennung):
            return '/%s/%s/%s/%s' % (sprache, APP[sprache]['gegenstand'], kennung, anker)
        return '/%s/%s/' % (sprache, APP[sprache]['gegenstandssuche'])

    seite = SEITEN.get(name)
    if seite is None:
        return None
    # The map opened deeds on the same file: /index.html?art=taten&lang=de.
    if seite == 'karte' and werte.get('art') == 'taten':
        seite = 'taten'

    segment = APP[sprache][seite]
    adresse = '/%s/%s' % (sprache, segment + '/' if segment else '')
    if rest:
        adresse += '?' + urlencode(rest)
    return adresse + anker


def ersetze(text: str) -> tuple[str, list[tuple[str, str]]]:
    """Rewrite every legacy href in `text`; returns the text and the changes."""
    aenderungen: list[tuple[str, str]] = []

    def treffer(m: re.Match) -> str:
        alt = m.group(1) + '.html' + (m.group(2) or '')
        neu = ziel(m.group(1), m.group(2) or '')
        if neu is None or neu == alt:
            return m.group(0)
        aenderungen.append((alt, neu))
        return 'href="%s"' % neu

    return MUSTER.sub(treffer, text), aenderungen


def main(argv: list[str] | None = None) -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('dateien', nargs='+', type=Path)
    zerleger.add_argument('--pruefen', action='store_true',
                          help='nur zeigen, nichts ändern (Standard)')
    zerleger.add_argument('--schreiben', action='store_true',
                          help='ändern statt nur zeigen')
    optionen = zerleger.parse_args(argv)

    offen = 0
    for datei in optionen.dateien:
        text = datei.read_text(encoding='utf-8')
        neu, aenderungen = ersetze(text)
        for alt, ziel_adresse in aenderungen:
            print('%s: %s -> %s' % (datei, alt, ziel_adresse))
        offen += len(aenderungen)
        if optionen.schreiben and aenderungen:
            datei.write_text(neu, encoding='utf-8')
    print('%d alte Adressen%s' % (offen, ' ersetzt' if optionen.schreiben else ' gefunden'))
    return 0 if optionen.schreiben or offen == 0 else 1


if __name__ == '__main__':
    raise SystemExit(main())
