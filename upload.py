#!/usr/bin/env python3
"""Lädt `dist-web/` per FTP/FTPS auf den Webserver.

Zugangsdaten stehen **nicht** im Projekt, sondern in einer eigenen Datei:

    ~/.config/mql-upload.conf   (chmod 600)

Aufbau:

    [upload]
    host = www2.your-server.de
    user = ftp-benutzer
    password = …
    path = /public_html/mm
    tls = yes

Aufruf:

    python3 upload.py --probe     # nur verbinden und Verzeichnis zeigen
    python3 upload.py --dry-run   # zeigen, was hochgeladen würde
    python3 upload.py             # hochladen, gleiche Dateien überspringen
"""
import argparse
import configparser
import ftplib
import json
import os
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
QUELLE = HIER / 'dist-web'
KONFIG = Path.home() / '.config/mql-upload.conf'
STAND = Path.home() / '.config/mql-upload-state.json'


def lies_konfig():
    if not KONFIG.is_file():
        raise SystemExit('FEHLT: %s' % KONFIG)
    rechte = KONFIG.stat().st_mode & 0o777
    if rechte & 0o077:
        print('WARNUNG: %s ist für andere lesbar (chmod 600 empfohlen).' % KONFIG,
              file=sys.stderr)
    teil = configparser.ConfigParser()
    teil.read(KONFIG, encoding='utf-8')
    if 'upload' not in teil:
        raise SystemExit('In %s fehlt der Abschnitt [upload].' % KONFIG)
    daten = teil['upload']
    for feld in ('host', 'user', 'password', 'path'):
        if not daten.get(feld):
            raise SystemExit('In %s fehlt "%s".' % (KONFIG, feld))
    return daten


def verbinde(daten):
    art = ftplib.FTP_TLS if daten.getboolean('tls', True) else ftplib.FTP
    ftp = art(daten['host'], timeout=60)
    ftp.login(daten['user'], daten['password'])
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    # Binärmodus: sonst verweigern manche Server SIZE.
    ftp.voidcmd('TYPE I')
    return ftp


def fernverzeichnis(ftp, pfad):
    ftp.cwd(pfad)


def vorhandene_groesse(ftp, name):
    try:
        return ftp.size(name)
    except ftplib.error_perm:
        return None


def lade_stand():
    """Zuletzt hochgeladene Fassung: Pfad -> [Größe, mtime]."""
    if not STAND.is_file():
        return {}
    try:
        return json.loads(STAND.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def sichere_stand(stand):
    STAND.write_text(json.dumps(stand, indent=0, sort_keys=True), encoding='utf-8')


def stelle_sicher(ftp, ordner):
    """Fehlende Verzeichnisse anlegen, ohne bei Vorhandensein zu scheitern."""
    teile = [teil for teil in ordner.split('/') if teil]
    for teil in teile:
        try:
            ftp.cwd(teil)
        except ftplib.error_perm:
            ftp.mkd(teil)
            ftp.cwd(teil)


def hochladen(ftp, basis, ziel, trocken):
    dateien = []
    for pfad in sorted(basis.rglob('*')):
        if pfad.is_file():
            dateien.append(pfad)
    gesamt = len(dateien)
    stand = lade_stand()
    neu = gleich = 0
    bytes_neu = 0
    for nummer, datei in enumerate(dateien, 1):
        relativ = datei.relative_to(basis)
        ordner = str(relativ.parent).replace(os.sep, '/')
        if ordner == '.':
            ordner = ''
        name = relativ.name
        ftp.cwd(ziel)
        if ordner:
            stelle_sicher(ftp, ordner)
        eintrag = [datei.stat().st_size, int(datei.stat().st_mtime)]
        schluessel = str(relativ).replace(os.sep, '/')
        if stand.get(schluessel) == eintrag and vorhandene_groesse(ftp, name) == eintrag[0]:
            gleich += 1
            continue
        neu += 1
        bytes_neu += datei.stat().st_size
        if not trocken:
            with datei.open('rb') as quelle:
                ftp.storbinary('STOR ' + name, quelle)
            stand[schluessel] = eintrag
        if nummer % 50 == 0:
            print('  %d/%d' % (nummer, gesamt))
    if not trocken:
        sichere_stand(stand)
    return neu, gleich, bytes_neu


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--dry-run', action='store_true',
                        help='nur zeigen, nichts schreiben')
    parser.add_argument('--probe', action='store_true',
                        help='nur verbinden und Verzeichnis öffnen')
    optionen = parser.parse_args()

    daten = lies_konfig()
    if not QUELLE.is_dir():
        raise SystemExit('FEHLT: %s (baue_website.py laufen lassen)' % QUELLE)

    ftp = verbinde(daten)
    try:
        fernverzeichnis(ftp, daten['path'])
        print('verbunden: %s%s' % (daten['host'], daten['path']))
        if optionen.probe:
            return 0
        neu, gleich, menge = hochladen(ftp, QUELLE, daten['path'], optionen.dry_run)
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()

    if optionen.dry_run:
        print('%d Dateien würden geladen (%.1f MB), %d sind schon gleich' %
              (neu, menge / (1024 * 1024), gleich))
    else:
        print('%d Dateien geladen (%.1f MB), %d unverändert' %
              (neu, menge / (1024 * 1024), gleich))
    return 0


if __name__ == '__main__':
    sys.exit(main())
