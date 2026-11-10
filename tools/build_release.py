#!/usr/bin/env python3
"""Assemble the release folder that is uploaded to the live site.

The released site is a PHP application: one entry point, shared templates and
prepared data shards instead of 255.000 HTML files. This builder copies what a
request needs and leaves out what the old static build produced.

    python3 tools/build_release.py [--ziel DIR] [--daten DIR]

Layout of the release (the FTP folder is the document root):

    index.php            thin entry, names the roots
    .htaccess            added at the switch, not by the bulk upload
    style.css, *.js …    the application's files
    karten/<sprache>/    map images (from webp/)
    bild/                item symbols, start images
    php/                 application code
    phpdata/             shards and labels
    vendor/              Twig
    phptmp/twig/         Twig cache (writable, denied from the web)
    tracking.html        GTM and GoatCounter snippets for the shell

Nothing here invents data: missing sources stop the build with a clear message.
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
WEBP = HIER / 'webp'
SPRACHEN = ('de', 'en', 'fr')

# Old application pages: the front controller answers them with a 301 to the
# language path, so their HTML must not ship again.
# Old application pages: the front controller answers them with a 301 to the
# language path, so their HTML must not ship again.
ALTE_SEITEN = ('index.html', 'start.html', 'start-en.html', 'start-fr.html',
               'gegenstaende.html', 'handwerk.html', 'reise.html', 'ruf.html',
               'belohnungen.html', 'spielstand.html', 'companion.html',
               'plugin.html', 'suche.html', 'gegenstand.html')
# The progress file is the visitor's own; the release carries an empty stub.
NICHT_KOPIEREN = ALTE_SEITEN + ('fortschritt.js',)

# Tracking lives in one small file instead of being scraped from a start page.
ZAEHLER = ('<script data-goatcounter="https://sirhexalot.goatcounter.com/count"\n'
           '        async src="//gc.zgo.at/count.js"></script>')


def script_bloecke(html: str) -> list[str]:
    return re.findall(r'<script\b[^>]*>.*?</script>', html, re.S)


def tracking_schreiben(ziel: Path) -> None:
    quelle = WEB / 'index.html'
    html = quelle.read_text(encoding='utf-8') if quelle.is_file() else ''
    behalten = []
    for block in script_bloecke(html):
        if 'gtm.start' in block or 'data-goatcounter=' in block:
            behalten.append(block)
    if not any('data-goatcounter=' in block for block in behalten):
        behalten.append(ZAEHLER)
    (ziel / 'tracking.html').write_text(
        '<!doctype html>\n<!-- Zähldienste der veröffentlichten Seite. -->\n'
        + '\n'.join(behalten) + '\n', encoding='utf-8')


def kopiere_web(ziel: Path) -> None:
    for eintrag in sorted(WEB.iterdir()):
        if eintrag.name.startswith('.') or eintrag.name in NICHT_KOPIEREN:
            continue
        ziel_pfad = ziel / eintrag.name
        if eintrag.is_dir():
            shutil.copytree(eintrag, ziel_pfad,
                            ignore=shutil.ignore_patterns('.DS_Store', '*.icloud'))
        else:
            shutil.copy2(eintrag, ziel_pfad)


def seo_dateien(ziel: Path) -> None:
    """robots.txt and the social preview images, from build_seo."""
    import sys
    sys.path.insert(0, str(HIER))
    import build_seo
    build_seo.preview_images(ziel)
    (ziel / 'robots.txt').write_text(
        'User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % build_seo.BASE,
        encoding='utf-8')


def kopiere_karten(ziel: Path) -> None:
    for sprache in SPRACHEN:
        quelle = WEBP / sprache
        if not quelle.is_dir():
            raise SystemExit('MISSING: %s (run baue_webp.py)' % quelle)
        shutil.copytree(quelle, ziel / 'karten' / sprache)


def kopiere_app(ziel: Path, daten: Path) -> None:
    if not (daten / 'labels.json').is_file():
        raise SystemExit('MISSING: %s/labels.json (run tools/build_php_data.py)' % daten)
    for name in ('php', 'vendor'):
        quelle = HIER / name
        if not quelle.is_dir():
            raise SystemExit('MISSING: %s' % quelle)
        shutil.copytree(quelle, ziel / name,
                        ignore=shutil.ignore_patterns('.DS_Store', '*.icloud',
                                                      'cache', 'tests'))
    shutil.copytree(daten, ziel / 'phpdata')
    shutil.copy2(HIER / 'deploy' / 'index.php', ziel / 'index.php')
    # Twig writes its compiled templates here; the folder must exist and be
    # writable, and .htaccess keeps it out of the web.
    (ziel / 'phptmp' / 'twig').mkdir(parents=True, exist_ok=True)


def pruefen(ziel: Path) -> list[str]:
    fehler = []
    for name in ('index.php', 'tracking.html', 'style.css', 'gemeinsam.css',
                 '404.html', 'robots.txt', 'vendor/autoload.php',
                 'php/public/index.php', 'phpdata/labels.json',
                 'phpdata/manifest.json', 'sets.css', 'sets.js', 'php/src/Sets.php',
                 'php/templates/sets/list.twig', 'php/templates/sets/detail.twig',
                 'auftraggeber.css', 'auftraggeber.js', 'php/src/Givers.php',
                 'php/templates/givers/list.twig', 'php/templates/givers/detail.twig'):
        if not (ziel / name).is_file():
            fehler.append('fehlt: ' + name)
    for sprache in SPRACHEN:
        if not (ziel / 'phpdata' / sprache / 'sets-index.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/sets-index.json')
        if not (ziel / 'phpdata' / sprache / 'givers-index.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/givers-index.json')
        if not (ziel / 'karten' / sprache).is_dir():
            fehler.append('fehlt: karten/' + sprache)
    app_stand = ziel / 'fortschritt.js'
    if not app_stand.is_file() or 'ids: []' not in app_stand.read_text(encoding='utf-8'):
        fehler.append('fortschritt.js fehlt oder trägt einen Spielstand')
    for alt in ALTE_SEITEN:
        if (ziel / alt).is_file():
            fehler.append('alte Anwendungsseite im Release: ' + alt)
    return fehler


def zaehle(ziel: Path) -> tuple[int, int]:
    dateien = 0
    groesse = 0
    for pfad in ziel.rglob('*'):
        if pfad.is_file():
            dateien += 1
            groesse += pfad.stat().st_size
    return dateien, groesse


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path,
                        default=Path.home() / '.cache' / 'llb-release')
    parser.add_argument('--daten', type=Path,
                        default=Path.home() / '.cache' / 'llb-php' / 'phpdata')
    optionen = parser.parse_args()
    ziel = optionen.ziel
    if ziel.exists():
        shutil.rmtree(ziel)
    ziel.mkdir(parents=True)

    kopiere_web(ziel)
    tracking_schreiben(ziel)
    # A visitor-imported progress file never ships; the app writes it locally.
    (ziel / 'fortschritt.js').write_text(
        '/* Written by build_daten.py. Do not edit. */\nwindow.MQL_FORTSCHRITT = { ids: [] };\n',
        encoding='utf-8')
    seo_dateien(ziel)
    kopiere_karten(ziel)
    kopiere_app(ziel, optionen.daten)

    fehler = pruefen(ziel)
    if fehler:
        for eintrag in fehler:
            print('FEHLER:', eintrag, file=sys.stderr)
        return 1
    dateien, groesse = zaehle(ziel)
    print('Release: %s' % ziel)
    print('  %d Dateien, %.1f MB' % (dateien, groesse / (1024 * 1024)))
    print('  Ohne .htaccess – die Umschaltung lädt sie getrennt hoch.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
