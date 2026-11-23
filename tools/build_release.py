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
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
WEBP = HIER / 'webp'
SPRACHEN = ('de', 'en', 'fr')
sys.path.insert(0, str(HIER / 'tools'))
from release_components import ReleaseError, build_manifest, write_manifest

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


def baue_klassen() -> None:
    subprocess.run([sys.executable, str(HIER / 'tools' / 'build_class_data.py')],
                   cwd=str(HIER), check=True)


def baue_gegenstandssuche() -> None:
    subprocess.run([sys.executable, str(HIER / 'build_gegenstandssuche.py')],
                   cwd=str(HIER), check=True)


def baue_erkennung() -> None:
    """Die Erkennungsbasis und ihre Teilladungen gehören in jeden Bau.

    Ohne sie könnte der Ratgeber ein getragenes Stück nicht nachschlagen; die
    Dateien sind erzeugt und stehen deshalb nicht im Repo."""
    subprocess.run([sys.executable, str(HIER / 'tools' / 'build_gegenstand_erkennung.py')],
                   cwd=str(HIER), check=True)


def baue_karten_kurz(ziel: Path) -> None:
    """Generate compact first-paint data without changing the source catalogues."""
    script = HIER / 'tools' / 'build_karten_kurz.py'
    subprocess.run([sys.executable, str(script)], cwd=str(HIER), check=True)
    for sprache in SPRACHEN:
        shutil.copy2(WEB / ('karten-kurz-%s.js' % sprache),
                     ziel / ('karten-kurz-%s.js' % sprache))
        shutil.copy2(WEB / ('karten-kurz-taten-%s.js' % sprache),
                     ziel / ('karten-kurz-taten-%s.js' % sprache))


def baue_epik() -> None:
    """Generate the epic story's own view; it is not part of the map data."""
    subprocess.run([sys.executable, str(HIER / 'tools' / 'build_epik.py')],
                   cwd=str(HIER), check=True)


def baue_sets_client() -> None:
    """Browser data of the set list; the suitability filter lives in the browser."""
    subprocess.run([sys.executable, str(HIER / 'tools' / 'build_sets_client.py')],
                   cwd=str(HIER), check=True)


def baue_haendler_karte() -> None:
    """Where the vendors stand, for the map layer the vendor pages link to."""
    subprocess.run([sys.executable, str(HIER / 'tools' / 'build_haendler_karte.py'), '--still'],
                   cwd=str(HIER), check=True)


def baue_stand(ziel: Path) -> None:
    """Give cached map scripts and lazy shards a content-based version stamp."""
    dateien = list(ziel.glob('*.js')) + list(ziel.glob('*.css'))
    dateien += list((ziel / 'karten-daten').rglob('*.js'))
    digest = hashlib.sha256()
    for datei in sorted(dateien):
        if datei.name == 'stand.js':
            continue
        digest.update(datei.relative_to(ziel).as_posix().encode('utf-8'))
        digest.update(datei.read_bytes())
    (ziel / 'stand.js').write_text(
        '/* Generated by tools/build_release.py. */\nwindow.MQL_STAND = %s;\n' %
        json.dumps(digest.hexdigest()[:10]),
        encoding='utf-8')


def seo_dateien(ziel: Path) -> None:
    """robots.txt and the social preview images, from build_seo."""
    import sys
    sys.path.insert(0, str(HIER))
    import build_seo
    build_seo.preview_images(ziel)
    # One source for the bot rules; build_seo.build() writes the same text for
    # the static pages.
    (ziel / 'robots.txt').write_text(build_seo.robots_text(), encoding='utf-8')


def kopiere_karten(ziel: Path) -> None:
    for sprache in SPRACHEN:
        quelle = WEBP / sprache
        if not quelle.is_dir():
            raise SystemExit('MISSING: %s (run baue_webp.py)' % quelle)
        shutil.copytree(quelle, ziel / 'karten' / sprache)


def kopiere_instanzkarten(ziel: Path) -> None:
    """Ship only the client-exported interiors referenced by the loot audit."""
    from instanzkarten import instanzkarten
    audit = HIER / 'daten' / 'instanz-beute.json'
    if not audit.is_file():
        return
    instanzkarten(json.loads(audit.read_text(encoding='utf-8')).get('instanzen') or {},
                  ziel=ziel / 'karten' / 'instanzen')


def baue_karten_vorschauen(ziel: Path) -> None:
    """Create card-sized fallbacks before the terrain manifest is ready."""
    from PIL import Image
    for sprache in SPRACHEN:
        quelle = ziel / 'karten' / sprache
        vorschauen = quelle / 'thumb'
        vorschauen.mkdir()
        for bild in quelle.glob('*.webp'):
            with Image.open(bild) as original:
                original.convert('RGB').resize((320, 240), Image.Resampling.LANCZOS).save(
                    vorschauen / bild.name, 'WEBP', quality=80, method=4)


def kopiere_gelaende(ziel: Path, quelle: Path) -> None:
    """Only ship the manifest's current client version, never research assets."""
    import json
    manifest = quelle / 'manifest.json'
    if not manifest.is_file():
        print('Hinweis: kein Gelände-Bau vorhanden; Spielkarten bleiben verfügbar.')
        return
    data = json.loads(manifest.read_text())
    version = data['version']
    if not re.fullmatch(r'[a-f0-9]{12}', version) or not (quelle / version).is_dir():
        raise SystemExit('Ungültiger Gelände-Bau: ' + str(quelle))
    (ziel / 'gelaende').mkdir()
    shutil.copy2(manifest, ziel / 'gelaende/manifest.json')
    shutil.copytree(quelle / version, ziel / 'gelaende' / version)


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
    shutil.copytree(
        daten, ziel / 'phpdata',
        ignore=shutil.ignore_patterns('.DS_Store', '*.icloud', 'cache', 'tests'))
    shutil.copy2(HIER / 'deploy' / 'index.php', ziel / 'index.php')
    # Twig writes its compiled templates here; the folder must exist and be
    # writable, and .htaccess keeps it out of the web.
    (ziel / 'phptmp' / 'twig').mkdir(parents=True, exist_ok=True)


def pruefen(ziel: Path) -> list[str]:
    fehler = []
    # Interior pictures used on vendor, quest-giver and landmark pages live in
    # karten/<language>/; a missing one would only show up as a broken image.
    bilddateien = (
        ('haendler.json', 'vendors', True),
        ('auftraggeber.json', 'givers', True),
        ('landmarken.json', 'landmarken', False),
    )
    bilder = set()
    for datei, schluessel, hat_orte in bilddateien:
        pfad = HIER / 'daten' / datei
        if not pfad.is_file():
            continue
        daten = json.loads(pfad.read_text(encoding='utf-8'))
        for entity in (daten.get(schluessel) or {}).values():
            rows = (place for row in entity.get('places') or []
                    for place in [row]) if hat_orte else [entity]
            bilder.update(place['bild'] for place in rows if place.get('bild'))
    if bilder:
        bilder = sorted(bilder)
        for sprache in SPRACHEN:
            fehlend = [bild for bild in bilder
                       if not (ziel / ('karten/%s/%s.webp'
                                       % (sprache, bild.rsplit('.', 1)[0]))).is_file()]
            for bild in fehlend[:3]:
                fehler.append('fehlt: karten/%s/%s.webp' % (sprache, bild.rsplit('.', 1)[0]))
            if len(fehlend) > 3:
                fehler.append('fehlt: %d weitere Innenraumkarten in karten/%s'
                              % (len(fehlend) - 3, sprache))
    for name in ('index.php', 'tracking.html', 'style.css', 'gemeinsam.css',
                 '404.html', 'robots.txt', 'vendor/autoload.php',
                 'php/public/index.php', 'phpdata/labels.json',
                  'php/src/Feedback.php', 'php/templates/app/feedback.twig',
                  'feedback.js', 'feedback.css',
                  'instanzen.css', 'php/templates/instances/detail.twig',
                  'php/templates/instances/list.twig',
                  'klassen.css', 'klassen.js', 'php/templates/app/klassen.twig',
                 'skalierung.js', 'umschmieden.js', 'ratgeber.js', 'ratgeber.css',
                 'texte-ratgeber.js', 'eignung.js', 'klassen-proficiency.js',
                 'php/templates/app/ratgeber.twig', 'erkennung/de/000.js',
                 'flaeche.css', 'php/templates/components/flaeche.twig', 'fakten.css', 'kachel.css', 'hinweis.css', 'knopf.css', 'karte.css',
                 'php/templates/components/karte.twig',
                 'klappe.css', 'klappe.js',
                  'phpdata/manifest.json', 'sets.css', 'sets.js', 'php/src/Sets.php',
                 'php/templates/sets/list.twig', 'php/templates/sets/detail.twig',
                 'auftraggeber.css', 'auftraggeber.js', 'php/src/Givers.php',
                 'php/templates/givers/list.twig', 'php/templates/givers/detail.twig',
                 'abenteuer.css', 'abenteuer.js', 'abenteuer-logik.js', 'texte-abenteuer.js',
                 'epik.js', 'epik.css',
                 'php/src/Adventures.php', 'php/templates/app/abenteuer.twig'):
        if not (ziel / name).is_file():
            fehler.append('fehlt: ' + name)
    for sprache in SPRACHEN:
        # The epic data is generated by tools/build_epik.py and never versioned;
        # a missing file means the generator ran before the copy or failed silently.
        if not (ziel / ('epik-%s.js' % sprache)).is_file():
            fehler.append('fehlt: epik-%s.js' % sprache)
        if not (ziel / ('klassen-%s.js' % sprache)).is_file():
            fehler.append('fehlt: klassen-%s.js' % sprache)
        if not (ziel / ('klassen-katalog-%s.js' % sprache)).is_file():
            fehler.append('fehlt: klassen-katalog-%s.js' % sprache)
        if not (ziel / ('gegenstaende-%s.js' % sprache)).is_file():
            fehler.append('fehlt: gegenstaende-%s.js' % sprache)
        # Browser data of the set list (tools/build_sets_client.py); the
        # suitability filter needs the piece requirements in the browser.
        if not (ziel / ('sets-%s.js' % sprache)).is_file():
            fehler.append('fehlt: sets-%s.js' % sprache)
        # Where the vendors stand (tools/build_haendler_karte.py); the map layer
        # loads it on demand, so a missing file would only show up on a click.
        if not (ziel / ('haendler-karte-%s.js' % sprache)).is_file():
            fehler.append('fehlt: haendler-karte-%s.js' % sprache)
        if not (ziel / 'phpdata' / sprache / 'sets-index.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/sets-index.json')
        if not (ziel / 'phpdata' / sprache / 'givers-index.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/givers-index.json')
        if not (ziel / 'phpdata' / sprache / 'abenteuer.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/abenteuer.json')
        if not (ziel / 'phpdata' / sprache / 'instance-details.json').is_file():
            fehler.append('fehlt: phpdata/' + sprache + '/instance-details.json')
        if not (ziel / ('abenteuer-%s.js' % sprache)).is_file():
            fehler.append('fehlt: abenteuer-%s.js' % sprache)
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
    parser.add_argument('--gelaende', type=Path,
                        default=Path.home() / '.cache' / 'llb-terrain' / 'public')
    optionen = parser.parse_args()
    ziel = optionen.ziel
    if ziel.exists():
        shutil.rmtree(ziel)
    ziel.mkdir(parents=True)

    baue_karten_kurz(ziel)
    baue_epik()
    baue_sets_client()
    baue_haendler_karte()
    # Generate the start files and both shard trees before copying web/.
    # Otherwise a release could contain stale shards from the previous build.
    baue_gegenstandssuche()
    baue_erkennung()
    baue_klassen()
    kopiere_web(ziel)
    if (HIER / 'daten' / 'instanz-beute.json').is_file():
        subprocess.run([sys.executable, str(HIER / 'build_icons.py'), '--nur-instanzbeute',
                        '--ziel', str(ziel / 'bild' / 'items')], cwd=str(HIER), check=True)
    tracking_schreiben(ziel)
    # A visitor-imported progress file never ships; the app writes it locally.
    (ziel / 'fortschritt.js').write_text(
        '/* Written by build_daten.py. Do not edit. */\nwindow.MQL_FORTSCHRITT = { ids: [] };\n',
        encoding='utf-8')
    seo_dateien(ziel)
    kopiere_karten(ziel)
    kopiere_instanzkarten(ziel)
    baue_karten_vorschauen(ziel)
    kopiere_gelaende(ziel, optionen.gelaende)
    kopiere_app(ziel, optionen.daten)
    baue_stand(ziel)

    fehler = pruefen(ziel)
    if fehler:
        for eintrag in fehler:
            print('FEHLER:', eintrag, file=sys.stderr)
        return 1
    try:
        write_manifest(ziel, build_manifest(ziel))
    except ReleaseError as error:
        print('FEHLER:', error, file=sys.stderr)
        return 1
    dateien, groesse = zaehle(ziel)
    print('Release: %s' % ziel)
    print('  %d Dateien, %.1f MB' % (dateien, groesse / (1024 * 1024)))
    print('  Ohne .htaccess – die Umschaltung lädt sie getrennt hoch.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
