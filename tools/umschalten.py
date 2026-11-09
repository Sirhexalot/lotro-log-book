#!/usr/bin/env python3
"""Switch the live site from static HTML to the PHP application, or back.

The switch is one file: `.htaccess`. It is read from the server, the block that
maps catalogue URLs to flat HTML is replaced by the block that sends them to the
front controller, and the file is uploaded again. A local copy of the previous
version is kept, so `--zurueck` restores the old site in seconds.

    python3 tools/umschalten.py --pruefen      # show what would change
    python3 tools/umschalten.py                # switch (asks for confirmation)
    python3 tools/umschalten.py --zurueck      # restore the last backup
    python3 tools/umschalten.py --test         # check live URLs

The old catalogue files stay on disk after the switch; they are only no longer
served. That is the rollback path until a rebuild takes their place.
"""
import argparse
import datetime
import io
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))
import upload  # noqa: E402
SICHERUNG = Path.home() / '.cache' / 'llb-php' / 'rollback'
BASIS = 'https://llb.sirhexalot.de'

PHP_BLOCK = '''# Catalog, application pages and sitemaps are rendered by PHP. The old static
# files stay on disk as a rollback and are never served again.
# Code, data and cache live in the document root but are not web content.
RewriteRule ^(phpdata|php|vendor|phptmp)(/|$) - [F]
# The root keeps the map application, as before, one redirect further.
RewriteRule ^$ /index.php [END]
RewriteRule ^(start(-(en|fr))?|index|gegenstaende|handwerk|reise|ruf|belohnungen|spielstand|companion|plugin|suche|gegenstand)\\.html$ /index.php [END]
RewriteRule ^(de|en|fr)(/|$) /index.php [END]
RewriteRule ^sitemap(-[a-z0-9-]+)?\\.xml$ /index.php [END]'''

MARKE_START = '# BEGIN LLB PHP URLS'
MARKE_ENDE = '# END LLB PHP URLS'
ALTE_START = '# BEGIN LLB ENTITY URLS'
ALTE_ENDE = '# END LLB ENTITY URLS'


def neuer_inhalt(alt: str) -> str:
    block = MARKE_START + '\n' + PHP_BLOCK + '\n' + MARKE_ENDE
    if MARKE_START in alt:
        anfang = alt.index(MARKE_START)
        ende = alt.index(MARKE_ENDE, anfang) + len(MARKE_ENDE)
        return alt[:anfang] + block + alt[ende:]
    if ALTE_START in alt:
        anfang = alt.index(ALTE_START)
        ende = alt.index(ALTE_ENDE, anfang) + len(ALTE_ENDE)
        return alt[:anfang] + block + alt[ende:]
    return alt.rstrip() + '\n\n' + block + '\n'


def fern_lesen(ftp, name: str) -> str:
    puffer = io.BytesIO()
    ftp.retrbinary('RETR ' + name, puffer.write)
    return puffer.getvalue().decode('utf-8')


def fern_schreiben(ftp, name: str, text: str) -> None:
    ftp.storbinary('STOR ' + name, io.BytesIO(text.encode('utf-8')))


def sichern(text: str) -> Path:
    SICHERUNG.mkdir(parents=True, exist_ok=True)
    stempel = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    datei = SICHERUNG / ('htaccess-%s' % stempel)
    datei.write_text(text, encoding='utf-8')
    return datei


def pruefen() -> int:
    """Which URLs must answer after the switch, and with what."""
    proben = [
        ('/', {301}),
        ('/de/', {200}),
        ('/de/karte/', {200}),
        ('/de/reise/', {200}),
        ('/de/gegenstandssuche/', {200}),
        ('/de/aufgabe/700005C0/', {200}),
        ('/de/aufgabe/700005C0.html', {301}),
        ('/en/quest/700005C0/', {200}),
        ('/fr/quete/700005C0/', {200}),
        ('/sitemap.xml', {200}),
        ('/de/aufgabe/sitemap.xml', {200}),
        ('/style.css', {200}),
        ('/karten/de/268437554.webp', {200}),
        ('/phpdata/labels.json', {403, 404}),
        ('/de/gibtsnicht/', {404}),
        ('/impressum.html', {200}),
    ]
    class OhneWeiterleitung(urllib.request.HTTPRedirectHandler):
        """A 301 is the answer we are checking, not a step to follow."""

        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    oeffner = urllib.request.build_opener(OhneWeiterleitung)
    fehler = 0
    for pfad, erwartet in proben:
        ziel = BASIS + pfad
        anfrage = urllib.request.Request(ziel, method='GET',
                                         headers={'User-Agent': 'llb-umschaltung/1'})
        try:
            with oeffner.open(anfrage, timeout=20) as antwort:
                code = antwort.status
        except urllib.error.HTTPError as fehler_http:
            code = fehler_http.code
        except Exception as ausnahme:  # noqa: BLE001 – network trouble is a failure too
            print('%-34s FEHLER %s' % (pfad, ausnahme))
            fehler += 1
            continue
        ok = code in erwartet
        if not ok:
            fehler += 1
        print('%-34s %s %s' % (pfad, code, 'ok' if ok else 'ERWARTET %s' % sorted(erwartet)))
    return 1 if fehler else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    gruppe = parser.add_mutually_exclusive_group()
    gruppe.add_argument('--pruefen', action='store_true',
                        help='nur zeigen, was die Umschaltung ändern würde')
    gruppe.add_argument('--zurueck', action='store_true',
                        help='die letzte gesicherte .htaccess wieder hochladen')
    gruppe.add_argument('--test', action='store_true',
                        help='nur die Live-Adressen prüfen')
    gruppe.add_argument('--ja', action='store_true',
                        help='ohne Rückfrage umschalten')
    optionen = parser.parse_args()

    if optionen.test:
        return pruefen()

    daten = upload.lies_konfig()
    ftp = upload.verbinde(daten)
    try:
        ftp.cwd(daten['path'])
        alt = fern_lesen(ftp, '.htaccess')

        if optionen.zurueck:
            sicherungen = sorted(SICHERUNG.glob('htaccess-*.txt')) + sorted(SICHERUNG.glob('htaccess-*'))
            sicherungen = sorted({p for p in sicherungen if p.is_file()})
            if not sicherungen:
                print('Keine Sicherung in %s' % SICHERUNG)
                return 2
            quelle = sicherungen[-1]
            fern_schreiben(ftp, '.htaccess', quelle.read_text(encoding='utf-8'))
            print('Zurück auf %s' % quelle)
            return 0

        neu = neuer_inhalt(alt)
        if neu == alt:
            print('Die .htaccess trägt bereits den PHP-Block – nichts zu tun.')
            return 0
        datei = sichern(alt)
        print('Sicherung: %s' % datei)
        print('--- neu ---')
        print(neu)
        if optionen.pruefen:
            return 0
        if not optionen.ja:
            antwort = input('Jetzt umschalten? [ja/nein] ').strip().lower()
            if antwort not in ('ja', 'j', 'yes', 'y'):
                print('Abgebrochen.')
                return 1
        fern_schreiben(ftp, '.htaccess', neu)
        print('Umgeschaltet. Prüfung: python3 tools/umschalten.py --test')
    finally:
        try:
            ftp.quit()
        except Exception:  # noqa: BLE001
            ftp.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
