#!/usr/bin/env python3
"""Uploads `dist-web/` to the web server via FTP/FTPS.

Credentials are **not** in the project, but in a separate file:

    ~/.config/mql-upload.conf   (chmod 600)

Structure:

    [upload]
    host = www2.your-server.de
    user = ftp-benutzer
    password = …
    path = /public_html/mm
    tls = yes

Usage:

    python3 upload.py --probe     # only connect and show the directory
    python3 upload.py --dry-run   # show what would be uploaded
    python3 upload.py             # upload, skip identical files
"""
import argparse
import configparser
import ftplib
import json
import re
import os
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
QUELLE = HIER / 'dist-web'
KONFIG = Path.home() / '.config/mql-upload.conf'
STAND = Path.home() / '.config/mql-upload-state.json'


def lies_konfig():
    if not KONFIG.is_file():
        raise SystemExit('MISSING: %s' % KONFIG)
    rechte = KONFIG.stat().st_mode & 0o777
    if rechte & 0o077:
        print('WARNING: %s is readable by others (chmod 600 recommended).' % KONFIG,
              file=sys.stderr)
    teil = configparser.ConfigParser()
    teil.read(KONFIG, encoding='utf-8')
    if 'upload' not in teil:
        raise SystemExit('Section [upload] is missing in %s.' % KONFIG)
    daten = teil['upload']
    for feld in ('host', 'user', 'password', 'path'):
        if not daten.get(feld):
            raise SystemExit('"%s" is missing in %s.' % (feld, KONFIG))
    return daten


def verbinde(daten):
    art = ftplib.FTP_TLS if daten.getboolean('tls', True) else ftplib.FTP
    ftp = art(daten['host'], timeout=60)
    ftp.login(daten['user'], daten['password'])
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    # Binary mode: otherwise some servers refuse SIZE.
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
    """Last uploaded version: path -> [size, mtime]."""
    if not STAND.is_file():
        return {}
    try:
        return json.loads(STAND.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def sichere_stand(stand):
    STAND.write_text(json.dumps(stand, indent=0, sort_keys=True), encoding='utf-8')


def stelle_sicher(ftp, ordner):
    """Create missing directories without failing when they exist."""
    teile = [teil for teil in ordner.split('/') if teil]
    for teil in teile:
        try:
            ftp.cwd(teil)
        except ftplib.error_perm:
            ftp.mkd(teil)
            ftp.cwd(teil)


# iCloud Drive recreates conflict copies of files it is syncing; they are no
# part of the site and must not reach the server ("app 2.js", "123 2.webp").
DUBLETTE = re.compile(r' \d+\.[a-z]+$')


def hochladen(ftp, basis, ziel, trocken):
    dateien = []
    for pfad in sorted(basis.rglob('*')):
        if pfad.is_file() and not DUBLETTE.search(pfad.name):
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


def aufraeumen(ftp, ziel):
    """Delete conflict copies that earlier uploads left in the target tree."""
    entfernt = 0
    stapel = ['']
    while stapel:
        ordner = stapel.pop()
        ftp.cwd(ziel if not ordner else ziel + '/' + ordner)
        eintraege = []
        ftp.retrlines('LIST', eintraege.append)
        for zeile in eintraege:
            teile = zeile.split(None, 8)
            if len(teile) < 9:
                continue
            name = teile[8]
            if name in ('.', '..'):
                continue
            if zeile.startswith('d'):
                stapel.append(name if not ordner else ordner + '/' + name)
            elif DUBLETTE.search(name):
                try:
                    ftp.delete(name)
                    entfernt += 1
                except ftplib.error_perm as fehler:
                    print('  could not delete %s: %s' % (name, fehler))
    return entfernt


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--quelle', type=Path, default=QUELLE,
                        help='build directory (default: dist-web)')
    parser.add_argument('--dry-run', action='store_true',
                        help='only show, write nothing')
    parser.add_argument('--probe', action='store_true',
                        help='only connect and open the directory')
    parser.add_argument('--aufraeumen', action='store_true',
                        help='delete conflict copies on the server, then upload')
    optionen = parser.parse_args()

    daten = lies_konfig()
    quelle = optionen.quelle
    if not quelle.is_dir():
        raise SystemExit('MISSING: %s (run baue_website.py)' % quelle)

    ftp = verbinde(daten)
    try:
        fernverzeichnis(ftp, daten['path'])
        print('connected: %s%s' % (daten['host'], daten['path']))
        if optionen.probe:
            return 0
        if optionen.aufraeumen:
            print('%d conflict copies removed on the server' % aufraeumen(ftp, daten['path']))
        neu, gleich, menge = hochladen(ftp, quelle, daten['path'], optionen.dry_run)
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()

    if optionen.dry_run:
        print('%d files would be uploaded (%.1f MB), %d are already identical' %
              (neu, menge / (1024 * 1024), gleich))
    else:
        print('%d files uploaded (%.1f MB), %d unchanged' %
              (neu, menge / (1024 * 1024), gleich))
    return 0


if __name__ == '__main__':
    sys.exit(main())
