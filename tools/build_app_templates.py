#!/usr/bin/env python3
"""Turn the existing application pages into Twig templates, once.

The pages are small shells: head, header, main and a script list. The shared
parts move into `php/templates/app/layout.twig`; each page keeps its own main
markup, script list and body attributes.

This is a migration aid, not a build step: afterwards the templates are hand
edited like any other template.

    python3 tools/build_app_templates.py
"""
from __future__ import annotations

import re
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
ZIEL = HIER / 'php' / 'templates' / 'app'

# page key -> source file, template name
SEITEN = {
    'karte': ('index.html', 'karte'),
    'gegenstandssuche': ('gegenstaende.html', 'gegenstandssuche'),
    'handwerk': ('handwerk.html', 'handwerk'),
    'spielstand': ('spielstand.html', 'spielstand'),
    'reise': ('reise.html', 'reise'),
    'ruf': ('ruf.html', 'ruf'),
    'belohnungen': ('belohnungen.html', 'belohnungen'),
    'companion': ('companion.html', 'companion'),
    'plugin': ('plugin.html', 'plugin'),
    'suche': ('suche.html', 'suche'),
    'start-de': ('start.html', 'start-de'),
    'start-en': ('start-en.html', 'start-en'),
    'start-fr': ('start-fr.html', 'start-fr'),
}


def zerlege(text: str) -> dict:
    titel = re.search(r'<title>(.*?)</title>', text, re.S).group(1).strip()
    koerper = re.search(r'<body([^>]*)>', text).group(1).strip()
    haupt = re.search(r'<main([^>]*)>(.*?)</main>', text, re.S)
    skripte = re.findall(r'<script src="([a-z0-9.\-]+\.js)"></script>', text)
    fuss = re.search(r'<footer.*?</footer>', text, re.S)
    return {'titel': titel, 'koerper': koerper, 'haupt_attr': haupt.group(1).strip(),
            'haupt': haupt.group(2).strip(), 'skripte': skripte,
            'fuss': fuss.group(0) if fuss else ''}


def vorlage(name: str, daten: dict) -> str:
    skripte = '\n'.join('<script src="/%s" defer></script>' % datei for datei in daten['skripte'])
    return """{%% extends 'app/layout.twig' %%}

{%% block koerper_attribute %%}%(koerper)s{%% endblock %%}

{%% block haupt %%}
<main%(attr)s>
%(haupt)s
</main>
{%% endblock %%}

{%% block fuss %%}%(fuss)s{%% endblock %%}

{%% block skripte %%}
%(skripte)s
{%% endblock %%}
""" % {'titel': daten['titel'],
       'koerper': (' ' + daten['koerper']) if daten['koerper'] else '',
       'attr': (' ' + daten['haupt_attr']) if daten['haupt_attr'] else '',
       'haupt': daten['haupt'],
       'skripte': skripte, 'fuss': daten['fuss']}


def main() -> int:
    ZIEL.mkdir(parents=True, exist_ok=True)
    for schluessel, (datei, name) in SEITEN.items():
        daten = zerlege((WEB / datei).read_text(encoding='utf-8'))
        (ZIEL / (name + '.twig')).write_text(vorlage(name, daten), encoding='utf-8')
        print('%-20s %-18s %2d Skripte' % (datei, name, len(daten['skripte'])))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
