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

DATEIEN = ('app.js', 'start.css', 'style.css', 'gemeinsam.css', 'landschaft.css', 'favicon.svg', 'texte.js', 'texte-spielstand.js',
           'texte-logbuch.js', 'texte-site.js', 'texte-plugin.js', 'texte-companion.js', 'texte-reise.js',
           'sprache.js', 'speicher.js', 'menue.js', 'symbole.js', 'companion.js', 'reise.js', 'reise.css', 'reise.html',
           'spielstand.js', 'plugin.js', 'anleitung.js', 'referenz.js', 'ruf.js', 'belohnungen.js', 'gegenstand.js', 'rezepte.js',
           'gegenstaende.html', 'gegenstaende.js', 'gegenstaende.css',
           'suche.js', 'suche.html', 'ruf-quellen-de.js',
           'ruf-quellen-en.js', 'ruf-quellen-fr.js', 'handwerk.js',
           'stand.js', 'rohstoffe.js',
            'start.html', 'start-en.html', 'start-fr.html', 'spielstand.html', '404.html',
           'plugin.html', 'companion.html', 'ruf.html', 'handwerk.html', 'belohnungen.html', 'gegenstand.html', 'impressum.html', 'datenschutz.html')
BILDER = ('bild/start.jpg', 'bild/start-en.jpg', 'bild/start-fr.jpg',
          'bild/companion-import-knopf.png')


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
        ziel_datei = ziel / name
        # A local build may link bild/ to the source tree; never copy a file
        # onto itself through that link.
        if ziel_datei.exists() and ziel_datei.resolve() == quelle.resolve():
            continue
        ziel_datei.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(quelle, ziel_datei)
    # One client symbol per file, shared by every language (build_icons.py).
    ordner = WEB / 'bild' / 'items'
    if not ordner.is_dir():
        raise SystemExit('MISSING: %s (build_icons.py)' % ordner)
    ziel_ordner = ziel / 'bild' / 'items'
    if not (ziel_ordner.exists() and ziel_ordner.resolve() == ordner.resolve()):
        shutil.copytree(ordner, ziel_ordner, dirs_exist_ok=True)


def index_bauen(ziel):
    """Take over index.html and insert the website's image path.

    The travel page loads map images from the same place and needs the path just
    as much: on the site they live under karten/<sprache>/, in a local checkout
    under webp/<sprache>/.
    """
    einschub = ('<script>/* Website: images live under karten/<sprache>/. */\n'
                "window.MQL_BILD_PFAD = 'karten/{sprache}/';</script>\n")
    for name in ('index.html', 'reise.html'):
        text = (WEB / name).read_text(encoding='utf-8')
        if '<script src="texte.js"></script>' not in text:
            raise SystemExit('%s: expected script block missing' % name)
        text = text.replace('<script src="texte.js"></script>',
                            einschub + '<script src="texte.js"></script>', 1)
        (ziel / name).write_text(text, encoding='utf-8')


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
    # The data files load with window.MQL_STAND from stand.js. build_daten.py writes
    # that per run, so the last language built wins and a change in another one
    # kept its old file in the browser cache. The published stamp covers every
    # data file and the scripts.
    daten = hashlib.sha256(marke.encode())
    for datei in sorted(list(ziel.glob('daten-*.js')) + list(ziel.glob('notizen-*.js'))
                         + list(ziel.glob('belohnungen-*.js')) + list(ziel.glob('rezepte-*.js'))
                         + list(ziel.glob('suche-*.js')) + list(ziel.glob('reise-*.js'))
                         + list(ziel.glob('vorkommen-*.js'))):
        daten.update(datei.name.encode())
        daten.update(datei.read_bytes())
    (ziel / 'stand.js').write_text('/* Written by baue_website.py. */\nwindow.MQL_STAND = "%s";\n'
                                   % daten.hexdigest()[:10], encoding='utf-8')
    for seite in ('index.html', 'spielstand.html', 'plugin.html', 'companion.html', 'ruf.html', 'handwerk.html', 'belohnungen.html', 'reise.html',
                  'start.html', 'start-en.html', 'start-fr.html', 'impressum.html', 'datenschutz.html', 'suche.html',
                  'gegenstaende.html'):
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
                 'spielstand.html', 'plugin.html', 'companion.html', 'ruf.html', 'handwerk.html', 'impressum.html',
                 'datenschutz.html', 'belohnungen.html', 'gegenstand.html', 'suche.html', 'reise.html'):
        datei = ziel / name
        text = datei.read_text(encoding='utf-8')
        if 'goatcounter' in text:
            continue
        text = text.replace('</body>', ZAEHLER + '</body>', 1)
        datei.write_text(text, encoding='utf-8')

def zusatz_zahlen(ziel, sprache, eintraege):
    """The rest of the landing-page counts, from the files that ship.

    Anything unreadable stays out of the dict, and the page keeps the number it
    was written with — a wrong count is worse than an old one.
    """
    aus = {}
    try:
        items = json.loads((HIER / 'daten/items.json').read_text(encoding='utf-8'))['items']
        aus['gegenstaende'] = len(items)
    except (OSError, ValueError, KeyError, TypeError):
        pass
    for schluessel, datei, marker, feld in (('rezepte', 'rezepte-%s.js', 'MQL_REZEPTE', 'r'),
                                            ('stationen', 'reise-%s.js', 'MQL_REISE', 'knoten')):
        try:
            aus[schluessel] = len(eintraege(datei % sprache, marker)[feld])
        except (OSError, ValueError, KeyError, TypeError, SystemExit):
            pass
    for schluessel, datei in (('titel', 'titel.json'), ('tugenden', 'tugenden.json')):
        try:
            eintrag = json.loads((HIER / 'daten' / datei).read_text(encoding='utf-8'))['eintraege']
            # Same fallback as the catalogue pages: own language, else English.
            aus[schluessel] = sum(
                1 for wert in eintrag.values()
                if (wert['n'].get(sprache) or wert['n'].get('en') or '').strip())
        except (OSError, ValueError, KeyError, TypeError):
            pass
    return aus


def katalogzahlen_einbauen(ziel):
    """Keep landing-page counts tied to the catalogue actually being shipped."""
    for sprache, seite, trenner in (('de', 'start.html', '.'),
                                    ('en', 'start-en.html', ','),
                                    ('fr', 'start-fr.html', ' ')):
        # Read the published JS, not an intermediate JSON that might be older.
        def eintraege(name, marker='MQL_QUESTS'):
            # The data files also carry MQL_STAND and MQL_KARTEN; ask for the
            # one array this call is about.
            text = (ziel / name).read_text(encoding='utf-8')
            treffer = re.search(r'window\.%s\s*=\s*' % marker, text)
            if not treffer:
                raise SystemExit('Missing %s in %s' % (marker, name))
            return json.JSONDecoder().raw_decode(text[treffer.end():])[0]

        quests = eintraege('daten-%s.js' % sprache)
        taten = eintraege('daten-taten-%s.js' % sprache)
        zahlen = {'aufgaben': len(quests), 'taten': len(taten),
                  'auftraggeber': sum(bool(q.get('gt')) for q in quests),
                  'ziele': sum(bool(q.get('t')) for q in quests)}
        zahlen.update(zusatz_zahlen(ziel, sprache, eintraege))
        datei = ziel / seite
        text = datei.read_text(encoding='utf-8')
        text = re.sub(r'(<span data-katalogzahl="(\w+)">)[^<]*(</span>)',
                      lambda m: (m.group(1) + format(zahlen[m.group(2)], ',').replace(',', trenner)
                                 + m.group(3)) if m.group(2) in zahlen else m.group(0), text)
        datei.write_text(text, encoding='utf-8')


def fortschritt_leeren(ziel):
    """Do not publish personal numbers."""
    inhalt = ('/* Website: deliberately empty. Visitors load their own progress\n'
              '   on the progress page; it stays in their browser. */\n'
              'window.MQL_FORTSCHRITT = {"character":"","date":"","ids":[]};\n')
    (ziel / 'fortschritt.js').write_text(inhalt, encoding='utf-8')


def vorkommen_kopieren(ziel):
    """Ship the lazy-loaded resource catalogue and every map point file."""
    for sprache in SPRACHEN:
        shutil.copy2(WEB / ('vorkommen-%s.js' % sprache), ziel / ('vorkommen-%s.js' % sprache))
    shutil.copytree(WEB / 'vorkommen', ziel / 'vorkommen')


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path, default=HIER / 'dist-web')
    optionen = parser.parse_args()
    ziel = optionen.ziel

    # Check the sources before anything is deleted.
    if not (WEB / 'vorkommen').is_dir():
        raise SystemExit('MISSING: %s (run build_vorkommen.py)' % (WEB / 'vorkommen'))
    for sprache in SPRACHEN:
        for name in ('daten-%s.js' % sprache, 'daten-taten-%s.js' % sprache, 'notizen-%s.js' % sprache,
                     'belohnungen-%s.js' % sprache, 'rezepte-%s.js' % sprache, 'reise-%s.js' % sprache,
                     'vorkommen-%s.js' % sprache,
                     'webp/%s' % sprache):
            pfad = WEB / name if name.endswith('.js') else HIER / name
            if not pfad.exists():
                raise SystemExit('MISSING: %s (run build_daten.py, build_notizen.py or '
                                 'baue_webp.py)' % pfad)

    if ziel.exists():
        shutil.rmtree(ziel)
    ziel.mkdir(parents=True)

    kopiere(ziel)
    vorkommen_kopieren(ziel)
    index_bauen(ziel)
    fortschritt_leeren(ziel)
    zaehler_einbauen(ziel)
    for sprache in SPRACHEN:
        shutil.copy2(WEB / ('reise-%s.js' % sprache), ziel / ('reise-%s.js' % sprache))
        shutil.copy2(WEB / ('daten-%s.js' % sprache), ziel / ('daten-%s.js' % sprache))
        shutil.copy2(WEB / ('daten-taten-%s.js' % sprache), ziel / ('daten-taten-%s.js' % sprache))
        shutil.copy2(WEB / ('notizen-%s.js' % sprache), ziel / ('notizen-%s.js' % sprache))
        shutil.copy2(WEB / ('belohnungen-%s.js' % sprache), ziel / ('belohnungen-%s.js' % sprache))
        shutil.copy2(WEB / ('rezepte-%s.js' % sprache), ziel / ('rezepte-%s.js' % sprache))
        shutil.copy2(WEB / ('suche-%s.js' % sprache), ziel / ('suche-%s.js' % sprache))
        shutil.copy2(WEB / ('gegenstaende-%s.js' % sprache), ziel / ('gegenstaende-%s.js' % sprache))
        # iCloud can resurrect a folder while the build runs: clear it first.
        kartenziel = ziel / 'karten' / sprache
        if kartenziel.exists():
            shutil.rmtree(kartenziel)
        shutil.copytree(HIER / 'webp' / sprache, kartenziel)
    shutil.copytree(WEB / 'notizen', ziel / 'notizen')
    from build_notizsymbole import baue as baue_notizsymbole
    baue_notizsymbole(ziel / 'notizen')
    katalogzahlen_einbauen(ziel)
    from build_seo import build as build_seo
    build_seo(ziel)
    from build_katalogseiten import build as build_katalogseiten
    build_katalogseiten(ziel)
    # Stamp after the data is in place: it covers the data files as well.
    print('version tag on static files: %s' % stempeln(ziel))

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
        # The travel page needs Middle-earth as its background; the root map is
        # not part of the quest data, so it is named here.
        erwartet.add('268437554.webp')
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
