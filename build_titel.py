#!/usr/bin/env python3
"""Titles and virtues with stable IDs for the catalogue pages.

The reward index (`web/belohnungen-<sprache>.js`) has the rendered names and the
sources but no IDs. The reward export has the IDs, but 1,988 of its 2,545 titles
still carry the client's template (`${RANK}${NAME}${SURNAME}, …`), because the
game fills rank, name and gender at runtime.

This builder renders those templates the same way the reward index did and joins
both by the resulting name. Unmatched entries are reported, never guessed: a
title without a confirmed ID gets no page.

    python3 build_titel.py            # writes daten/titel.json, daten/tugenden.json
"""
import json
import re
from pathlib import Path

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
              '/rewards-2026-11-06/rewards.json')

TAG = re.compile(r'\[[A-Za-z]{1,4}\]')


def js_datei(pfad, variable):
    text = Path(pfad).read_text(encoding='utf-8')
    treffer = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not treffer:
        raise SystemExit('MISSING %s in %s' % (variable, pfad))
    return json.JSONDecoder().raw_decode(text[treffer.end():])[0]


def aus_vorlage(text):
    """Render the client's title into the form the reward index shows.

    Two shapes arrive from the export: a template
    (`${RANK}${NAME}${SURNAME}, ${NAME:der[m]|die[f]} Verlockende`) and, when no
    gendered choice was involved, the same text with the placeholders already
    spelled out (`RANK NAME SURNAME the Alluring`). Both are reduced to what the
    player sees: the epithet, with both gendered forms kept.
    """
    text = text or ''
    text = re.sub(r'^\$\{RANK\}.*?,\s*', '', text)       # template with rank
    text = re.sub(r'^RANK NAME SURNAME[,;]?\s*', '', text)  # already spelled out
    text = re.sub(r'\$\{NAME:([^}|]+)\|([^}]+)\}', lambda m: '%s / %s' % (m.group(1), m.group(2)), text)
    text = re.sub(r'\$\{NAME:([^}]+)\}', lambda m: m.group(1), text)
    text = re.sub(r'\$\{[^}]*\}', '', text)
    return TAG.sub('', text).strip()


def baue(art):
    """art: 't' titles, 'v' virtues. Returns id -> {n, q}."""
    schluessel = 'titles' if art == 't' else 'virtues'
    rohdaten = json.loads(EXPORT.read_text(encoding='utf-8'))[schluessel]
    ids = {}
    for ident, eintrag in rohdaten.items():
        for sprache in SPRACHEN:
            name = aus_vorlage(eintrag['n'].get(sprache, ''))
            if name:
                ids.setdefault(sprache, {}).setdefault(name, []).append(ident)

    gesammelt = {}
    statistik = {'gefunden': 0, 'mehrdeutig': 0, 'ohne_id': 0}
    for sprache in SPRACHEN:
        eintraege = js_datei(WEB / ('belohnungen-%s.js' % sprache), 'MQL_BELOHNUNGEN')[art]
        for name, quellen in eintraege:
            kandidaten = ids.get(sprache, {}).get(name, [])
            if not kandidaten:
                statistik['ohne_id'] += 1
                continue
            if len(kandidaten) > 1:
                statistik['mehrdeutig'] += 1
                continue
            statistik['gefunden'] += 1
            eintrag = gesammelt.setdefault(kandidaten[0], {'n': {}, 'q': {}})
            eintrag['n'][sprache] = name
            # Sources are localized too: keep one list per language.
            liste = eintrag['q'].setdefault(sprache, [])
            for quelle in quellen:
                wert = [quelle[0], quelle[1], quelle[2], quelle[3] or '', quelle[4] or '', quelle[5] or '']
                if wert not in liste:
                    liste.append(wert)
    return gesammelt, statistik


def main():
    for art, datei in (('t', 'titel.json'), ('v', 'tugenden.json')):
        daten, statistik = baue(art)
        (DATEN / datei).write_text(json.dumps({'schema': 1, 'eintraege': daten},
                                             ensure_ascii=False, separators=(',', ':')),
                                   encoding='utf-8')
        print('%s: %d Einträge (neu %d, mehrdeutig %d, ohne ID %d)'
              % (datei, len(daten), statistik['gefunden'], statistik['mehrdeutig'], statistik['ohne_id']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
