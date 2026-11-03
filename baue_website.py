#!/usr/bin/env python3
"""Builds `dist-web/`: the version uploaded to sirhexalot.de.

Differences from the local version:

- Maps are stored as WebP under `karten/<sprache>/`, not as PNG.
- `fortschritt.js` is **empty**. Visitors load their own progress from LOTRO
  Companion on the progress page; it stays in their browser.
- `index.html` gets the image path `karten/<sprache>/`.
- Imprint and privacy notice sit next to it.

Usage:

    python3 baue_website.py            # to de/en
    python3 baue_website.py --ziel /tmp/web

Nothing is uploaded and nothing on the network is touched.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
SPRACHEN = ('de', 'en', 'fr')

DATEIEN = ('app.js', 'start.css', 'style.css', 'texte.js', 'texte-spielstand.js',
           'texte-logbuch.js', 'sprache.js', 'speicher.js', 'menue.js', 'companion.js',
           'spielstand.js', 'referenz.js', 'ruf.js', 'ruf-quellen-de.js',
           'ruf-quellen-en.js', 'ruf-quellen-fr.js', 'handwerk.js', 'stand.js',
           'start.html', 'start-en.html', 'start-fr.html', 'spielstand.html',
           'ruf.html', 'handwerk.html', 'impressum.html', 'datenschutz.html')
BILDER = ('bild/start.jpg', 'bild/start-en.jpg', 'bild/start-fr.jpg')


def kopiere(ziel):
    for name in DATEIEN:
        quelle = WEB / name
        if not quelle.is_file():
            raise SystemExit('MISSING: %s' % quelle)
        shutil.copy2(quelle, ziel / name)
    for name in BILDER:
        quelle = WEB / name
        if not quelle.is_file():
            raise SystemExit('MISSING: %s' % quelle)
        (ziel / name).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(quelle, ziel / name)


def index_bauen(ziel):
    """Take over index.html and insert the website's image path."""
    text = (WEB / 'index.html').read_text(encoding='utf-8')
    einschub = ('<script>/* Website: images live under karten/<sprache>/. */\n'
                "window.MQL_BILD_PFAD = 'karten/{sprache}/';</script>\n")
    if '<script src="texte.js"></script>' not in text:
        raise SystemExit('index.html: expected script block missing')
    text = text.replace('<script src="texte.js"></script>',
                        einschub + '<script src="texte.js"></script>', 1)
    (ziel / 'index.html').write_text(text, encoding='utf-8')


def stempeln(ziel):
    """Version tag on every static script and stylesheet of the HTML pages.

    The map loads its data with the build stamp already; the plain <script> and
    <link> tags did not, so a browser kept an old texte.js or style.css after an
    upload and showed a half-old page. The tag is a hash of the files themselves.
    """
    import hashlib
    summe = hashlib.sha256()
    for name in sorted(DATEIEN):
        if name.endswith(('.js', '.css')):
            summe.update((ziel / name).read_bytes())
    marke = summe.hexdigest()[:10]
    for seite in ('index.html', 'spielstand.html', 'ruf.html', 'handwerk.html', 'start.html',
                  'start-en.html', 'start-fr.html', 'impressum.html', 'datenschutz.html'):
        datei = ziel / seite
        text = datei.read_text(encoding='utf-8')
        text = re.sub(r'(<(?:script|link)[^>]+(?:src|href)=")([\w.-]+\.(?:js|css))(")',
                      lambda m: m.group(1) + m.group(2) + '?v=' + marke + m.group(3), text)
        datei.write_text(text, encoding='utf-8')
    return marke


ZAEHLER = ('<script data-goatcounter="https://sirhexalot.goatcounter.com/count"\n'
           '        async src="//gc.zgo.at/count.js"></script>\n')


def zaehler_einbauen(ziel):
    """GoatCounter only in the published version, not locally."""
    for name in ('index.html', 'start.html', 'start-en.html', 'start-fr.html',
                 'spielstand.html', 'ruf.html', 'handwerk.html', 'impressum.html',
                 'datenschutz.html'):
        datei = ziel / name
        text = datei.read_text(encoding='utf-8')
        if 'goatcounter' in text:
            continue
        text = text.replace('</body>', ZAEHLER + '</body>', 1)
        datei.write_text(text, encoding='utf-8')

    # The local note is no longer true on the website.
    for name, alt, neu in (
        ('start.html',
         '<p class="leise">Diese Fassung läuft lokal. Es wird nichts hochgeladen und nichts\n\tnachgeladen.</p>',
         '<p class="leise">Diese Seite zählt nur anonyme Seitenaufrufe. Dein Fortschritt\n\tbleibt in deinem Browser.</p>'),
        ('start-en.html',
         '<p class="leise">This copy runs locally. Nothing is uploaded and nothing is\n\tloaded from the network.</p>',
         '<p class="leise">This site only counts anonymous page views. Your progress stays\n\tin your browser.</p>'),
        ('start-fr.html',
         '<p class="leise">Cette page ne compte que des visites anonymes. Votre progression\n\treste dans votre navigateur.</p>',
         '<p class="leise">Cette page ne compte que des visites anonymes. Votre progression\n\treste dans votre navigateur.</p>'),
    ):
        datei = ziel / name
        text = datei.read_text(encoding='utf-8')
        text = text.replace(alt, neu)
        datei.write_text(text, encoding='utf-8')


def fortschritt_leeren(ziel):
    """Do not publish personal numbers."""
    inhalt = ('/* Website: deliberately empty. Visitors load their own progress\n'
              '   on the progress page; it stays in their browser. */\n'
              'window.MQL_FORTSCHRITT = {"character":"","date":"","ids":[]};\n')
    (ziel / 'fortschritt.js').write_text(inhalt, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path, default=HIER / 'dist-web')
    optionen = parser.parse_args()
    ziel = optionen.ziel

    # Check the sources before anything is deleted.
    for sprache in SPRACHEN:
        for name in ('daten-%s.js' % sprache, 'daten-taten-%s.js' % sprache, 'webp/%s' % sprache):
            pfad = WEB / name if name.endswith('.js') else HIER / name
            if not pfad.exists():
                raise SystemExit('MISSING: %s (run build_daten.py or '
                                 'baue_webp.py)' % pfad)

    if ziel.exists():
        shutil.rmtree(ziel)
    ziel.mkdir(parents=True)

    kopiere(ziel)
    index_bauen(ziel)
    fortschritt_leeren(ziel)
    zaehler_einbauen(ziel)
    print('version tag on static files: %s' % stempeln(ziel))

    for sprache in SPRACHEN:
        shutil.copy2(WEB / ('daten-%s.js' % sprache), ziel / ('daten-%s.js' % sprache))
        shutil.copy2(WEB / ('daten-taten-%s.js' % sprache), ziel / ('daten-taten-%s.js' % sprache))
        shutil.copytree(HIER / 'webp' / sprache, ziel / 'karten' / sprache)

    # Checks
    fehler = []
    for sprache in SPRACHEN:
        # Every map the quest and deed data names must have its image; extra
        # images (larger maps fetched as fallbacks) do no harm.
        bilder = {datei.name for datei in (ziel / 'karten' / sprache).glob('*.webp')}
        erwartet = set()
        for datei in ('daten/quests-%s.json', 'daten/taten-%s.json'):
            pfad = HIER / (datei % sprache)
            if pfad.is_file():
                erwartet |= {karte['bild'].replace('.png', '.webp')
                             for karte in json.loads(pfad.read_text(encoding='utf-8'))['karten']}
        fehlen = sorted(erwartet - bilder)
        if fehlen:
            fehler.append('%s: %d map images missing, e.g. %s' % (sprache, len(fehlen), fehlen[:3]))

    impressum = (ziel / 'impressum.html').read_text(encoding='utf-8')
    if '[Name]' in impressum or '[Adresse]' in impressum:
        print('WARNING: impressum.html still contains placeholders '
              '([Name], [Adresse]) – fill them in before uploading.')

    groesse = sum(f.stat().st_size for f in ziel.rglob('*') if f.is_file())
    print('written: %s' % ziel)
    for sprache in SPRACHEN:
        teil = sum(f.stat().st_size for f in (ziel / 'karten' / sprache).glob('*'))
        print('  karten/%-2s %4d files  %5.1f MB' %
              (sprache, len(list((ziel / 'karten' / sprache).glob('*'))),
               teil / (1024 * 1024)))
    print('  total           %5.1f MB' % (groesse / (1024 * 1024)))
    if fehler:
        for text in fehler:
            print('ERROR: %s' % text, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
