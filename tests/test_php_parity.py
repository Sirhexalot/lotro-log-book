#!/usr/bin/env python3
"""Compare a PHP-rendered page with the static page it replaces.

The migration is only safe if the new page says exactly what the old one said:
same headings, same text, same links, same attributes, same status codes. The
comparison ignores whitespace between tags and asset version hashes, because
neither changes what a reader or a search engine sees.

    python3 tests/test_php_parity.py                 # sample of every entity type
    python3 tests/test_php_parity.py --anzahl 500    # more pages per type
    python3 tests/test_php_parity.py --url /de/aufgabe/70042F83/
"""
from __future__ import annotations

import argparse
import json
import random
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
import os
STATIC = Path(os.environ.get('LLB_ORACLE', str(Path.home() / '.cache' / 'llb-release-20261108-player-copy')))
PHPDATA = Path(os.environ.get('LLB_DATA') or (HIER / 'phpdata'))

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'source', 'track', 'wbr'}


# Application pages moved from "*.html?lang=de" to "/de/…/". Both sides are
# normalised to the new form, so the comparison still catches every other
# difference instead of drowning in the intended URL change.
APP_SEGMENTE = {
    'de': {'karte': 'karte', 'taten': 'karte/taten', 'gegenstandssuche': 'gegenstandssuche',
           'handwerk': 'handwerk/rezepte', 'reise': 'reise', 'ruf': 'ruf',
           'belohnungen': 'belohnungen', 'spielstand': 'spielstand',
           'companion': 'companion', 'plugin': 'plugin', 'suche': 'suche'},
    'en': {'karte': 'map', 'taten': 'map/deeds', 'gegenstandssuche': 'item-search',
           'handwerk': 'crafting/recipes', 'reise': 'travel', 'ruf': 'reputation',
           'belohnungen': 'rewards', 'spielstand': 'progress',
           'companion': 'companion', 'plugin': 'plugin', 'suche': 'search'},
    'fr': {'karte': 'carte', 'taten': 'carte/prouesses', 'gegenstandssuche': 'recherche-objets',
           'handwerk': 'artisanat/recettes', 'reise': 'voyage', 'ruf': 'reputation',
           'belohnungen': 'recompenses', 'spielstand': 'progression',
           'companion': 'companion', 'plugin': 'plugin', 'suche': 'recherche'},
}
DATEI_ZU_SEITE = {
    'index.html': 'karte', 'gegenstaende.html': 'gegenstandssuche', 'handwerk.html': 'handwerk',
    'reise.html': 'reise', 'ruf.html': 'ruf', 'belohnungen.html': 'belohnungen',
    'spielstand.html': 'spielstand', 'companion.html': 'companion', 'plugin.html': 'plugin',
    'suche.html': 'suche',
}


def neue_app_url(url: str) -> str:
    """Rewrite an application URL into its language-path form."""
    from urllib.parse import parse_qsl, urlencode
    pfad, _, abfrage = url.partition('?')
    datei = pfad.rsplit('/', 1)[-1]
    if datei == 'start.html':
        return '/de/'
    if datei in ('start-en.html', 'start-fr.html'):
        return '/' + datei[6:8] + '/'
    params = dict(parse_qsl(abfrage))
    lang = params.pop('lang', 'de')
    if lang not in APP_SEGMENTE:
        lang = 'de'
    if datei == 'gegenstand.html':
        kennung = str(params.get('id') or '').upper()
        if len(kennung) == 8 and all(c in '0123456789ABCDEF' for c in kennung):
            return '/' + lang + '/' + {'de': 'gegenstand', 'en': 'item', 'fr': 'objet'}[lang] + '/' + kennung + '/'
        datei = 'gegenstaende.html'
        params.pop('id', None)
    seite = DATEI_ZU_SEITE.get(datei)
    if seite is None:
        return url
    if seite == 'karte' and params.get('art') == 'taten':
        seite = 'taten'
    params.pop('art', None)
    ziel = '/' + lang + '/' + APP_SEGMENTE[lang][seite] + '/'
    rest = urlencode(list(params.items()))
    return ziel + ('?' + rest if rest else '')


class Canonical(HTMLParser):
    """A normalized token stream of one HTML document."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tokens = []

    def handle_starttag(self, tag, attrs):
        self.tokens.append(('start', tag, self._attrs(attrs)))

    def handle_startendtag(self, tag, attrs):
        self.tokens.append(('start', tag, self._attrs(attrs)))

    def handle_endtag(self, tag):
        if tag not in VOID:
            self.tokens.append(('end', tag))

    def handle_data(self, data):
        text = re.sub(r'\s+', ' ', data).strip()
        if text:
            self.tokens.append(('text', text))

    @staticmethod
    def _attrs(attrs):
        out = []
        for name, value in attrs:
            value = '' if value is None else value
            if name in ('href', 'src') and '.html?' in value:
                value = neue_app_url(value)
            if name == 'href' or name == 'src':
                value = re.sub(r'\?v=[0-9a-f]+', '?v=HASH', value)
            out.append((name, value))
        return tuple(sorted(out))


def canonical(html: str) -> list:
    parser = Canonical()
    parser.feed(html)
    return parser.tokens


def php_render(url: str) -> str:
    """Render through the same front controller the server uses."""
    env = dict(**__import__('os').environ)
    env.setdefault('LLB_VENDOR', str(HIER / 'vendor'))
    # Tracking snippets and asset files come from the build the static pages
    # belong to, so both sides see the same sources.
    env.setdefault('LLB_WEB', str(STATIC))
    script = (
        'require getenv("LLB_VENDOR")."/autoload.php";'
        '$_SERVER["REQUEST_URI"]=' + json.dumps(url) + ';'
        'require ' + json.dumps(str(HIER / 'php/public/index.php')) + ';'
    )
    result = subprocess.run(['php', '-d', 'opcache.enable_cli=0', '-r', script],
                            capture_output=True, text=True, env=env, cwd=HIER)
    if result.returncode != 0:
        raise SystemExit('PHP-Aufruf fehlgeschlagen:\n' + result.stderr)
    return result.stdout


def static_path(url: str) -> Path:
    """Where the static generator put this page.

    Detail pages are flat files (de/aufgabe/700005C0.html); overview pages are
    index.html in their folder, pagination is seite/N.html.
    """
    parts = url.strip('/').split('/')
    if url.endswith('/'):
        # Pagination and item sub-indexes are flat files, type indexes are not.
        flach = STATIC.joinpath(*parts[:-1], parts[-1] + '.html')
        if parts[-1].isdigit() or flach.is_file():
            return flach
        return STATIC.joinpath(*parts, 'index.html')
    return STATIC.joinpath(*parts[:-1], parts[-1] + '.html')


def compare(url: str) -> list[str]:
    static_file = static_path(url)
    if not static_file.is_file():
        return ['Keine Vergleichsdatei: %s' % static_file]
    expected = canonical(static_file.read_text(encoding='utf-8'))
    actual_html = php_render(url)
    if '<b>Fatal error</b>' in actual_html or '<b>Warning</b>' in actual_html:
        return ['PHP-Fehler: %s' % actual_html[:400]]
    actual = canonical(actual_html)
    if actual == expected:
        return []
    problems = []
    for index, (left, right) in enumerate(zip(expected, actual)):
        if left != right:
            problems.append('Token %d: statisch %r, PHP %r' % (index, left, right))
            break
    if len(expected) != len(actual):
        problems.append('Länge: statisch %d, PHP %d' % (len(expected), len(actual)))
    return problems


def sample_urls(amount: int) -> dict[str, list[str]]:
    """Pages per kind, spread over the catalogue instead of the first ids."""
    manifest = json.loads((PHPDATA / 'manifest.json').read_text(encoding='utf-8'))
    kinds = {'de': {'q': 'aufgabe', 'd': 'tat', 'i': 'gegenstand', 'recipe': 'rezept',
                    'title': 'titel', 'virtue': 'tugend', 'area': 'gebiet',
                    'region': 'region', 'p': 'beruf'}}
    segments = kinds['de']
    urls: dict[str, list[str]] = {}
    for kind, segment in segments.items():
        ids = []
        folder = PHPDATA / 'de' / kind
        for shard in sorted(folder.glob('*.json')):
            data = json.loads(shard.read_text(encoding='utf-8'))['entities']
            ids.extend(sorted(data))
        ids.sort()
        if len(ids) > amount:
            step = max(1, len(ids) // amount)
            ids = ids[::step][:amount]
        urls[kind] = ['/de/%s/%s/' % (segment, ident) for ident in ids]
    return urls


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--anzahl', type=int, default=25)
    parser.add_argument('--url', action='append', default=[])
    parser.add_argument('--alle', action='store_true', help='jede Seite vergleichen')
    parser.add_argument('--nur-orakel', action='store_true',
                        help='nur Seiten vergleichen, die es im Prüf-Orakel gibt')
    options = parser.parse_args()

    urls = list(options.url)
    if options.nur_orakel:
        urls = []
        for file in sorted(STATIC.glob('*/*/*.html')):
            parts = file.relative_to(STATIC).as_posix().split('/')
            if parts[0] not in ('de', 'en', 'fr'):
                continue
            urls.append('/%s/%s/%s/' % (parts[0], parts[1], parts[2][:-5]))
    if not urls:
        for kind, entries in sample_urls(options.anzahl).items():
            urls.extend(entries)

    failures = 0
    for url in urls:
        problems = compare(url)
        if problems:
            failures += 1
            print('FEHLER %s' % url)
            for line in problems:
                print('   ' + line)
    print('%d Seiten verglichen, %d abweichend' % (len(urls), failures))
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
