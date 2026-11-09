#!/usr/bin/env python3
"""Uploads a built website to the web server via FTP/FTPS.

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

    python3 upload.py --probe              # only connect and show the directory
    python3 upload.py --dry-run            # show what would be uploaded
    python3 upload.py                      # upload, skip files whose content is there
    python3 upload.py --verwaiste          # list server files the build no longer has
    python3 upload.py --verwaiste --loeschen   # delete exactly those (see below)

How the comparison works: one `LIST` per directory gives the remote file sizes,
and the local file's `sha256` is compared with the hash stored after the last
upload. Content decides, not the modification time — the build rewrites the
whole catalogue with fresh timestamps, and without hashes every upload would
send all ~110.000 files again. A state entry is `[size, mtime, sha256]`; when
size and time are unchanged the hash is reused without reading the file.

`--verwaiste` only reports. `--loeschen` needs that report in the same call,
never deletes `.htaccess` or the keep list below, and refuses more than
`GRENZE` deletions unless `--force` is given.

`--aufraeumen` DELETES iCloud conflict copies ("app 2.js") on the server. It is
not a test mode.
"""
import argparse
import configparser
import ftplib
import hashlib
import json
import re
import os
import sys
import threading
from collections import deque
from pathlib import Path

HIER = Path(__file__).resolve().parent
QUELLE = HIER / 'dist-web'
KONFIG = Path.home() / '.config/mql-upload.conf'
STAND = Path.home() / '.config/mql-upload-state.json'

# Files and folders that are not part of the build but must stay on the server.
SCHONEN = ('.htaccess', '.user.ini', '.well-known', 'cgi-bin', 'error_log', 'logs')
# Deleting more than this many files at once needs --force.
GRENZE = 2000

# iCloud Drive recreates conflict copies of files it is syncing; they are no
# part of the site and must not reach the server ("app 2.js", "123 2.webp").
DUBLETTE = re.compile(r' \d+\.[a-z]+$')


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


def fern_index(ftp, ziel):
    """Remote files under the target as {relative path: size}, one LIST per folder.

    A listing is far cheaper than one SIZE per file: the catalogue alone is
    110.000 files. Returns None when the server cannot list, so the caller can
    fall back to asking file by file.
    """
    index = {}
    stapel = ['']
    while stapel:
        ordner = stapel.pop()
        pfad = ziel if not ordner else ziel + '/' + ordner
        zeilen = []
        try:
            ftp.cwd(pfad)
            ftp.retrlines('LIST', zeilen.append)
        except ftplib.all_errors as fehler:
            print('  LIST failed in %s: %s' % (pfad, fehler), file=sys.stderr)
            return None
        for zeile in zeilen:
            teile = zeile.split(None, 8)
            if len(teile) < 9:
                continue
            name = teile[8]
            if name in ('.', '..'):
                continue
            relativ = name if not ordner else ordner + '/' + name
            if zeile.startswith('d'):
                stapel.append(relativ)
                continue
            try:
                index[relativ] = int(teile[4])
            except (ValueError, IndexError):
                index[relativ] = None
    return index


def lade_stand():
    """Last uploaded version: relative path -> [size, mtime, sha256]."""
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


def hashe(datei):
    summe = hashlib.sha256()
    with datei.open('rb') as quelle:
        for block in iter(lambda: quelle.read(1 << 20), b''):
            summe.update(block)
    return summe.hexdigest()


def eintrag(datei, alt):
    """[size, mtime, sha256]; the hash is reused when the file did not change."""
    groesse = datei.stat().st_size
    zeit = int(datei.stat().st_mtime)
    if (isinstance(alt, list) and len(alt) == 3 and alt[0] == groesse
            and alt[1] == zeit and isinstance(alt[2], str) and alt[2]):
        return [groesse, zeit, alt[2]]
    return [groesse, zeit, hashe(datei)]


def hochladen_noetig(alt, neu, ferngroesse):
    """Content decides. An unknown remote size means: send it."""
    if not isinstance(alt, list) or len(alt) != 3 or alt[2] != neu[2]:
        return True
    return ferngroesse != neu[0]


def verwaiste_dateien(fern, lokal):
    """Remote paths that the build no longer contains, minus the keep list."""
    aus = []
    for pfad in sorted(fern):
        if pfad in lokal:
            continue
        if pfad.split('/', 1)[0] in SCHONEN:
            continue
        aus.append(pfad)
    return aus


def dateien_sammeln(basis, nur=None, ohne=None):
    """Files to send, ordered so a half-finished run never shows a broken page.

    Order: entity detail files first, then everything else, then the list pages
    and last the sitemaps — an index must not promise pages that are not there.
    The filters only look at the top-level folder, so --nur de,en,fr and
    --ohne de,en,fr split one release into two runs.
    """
    def erlaubt(rel):
        oben = rel.split('/', 1)[0]
        if nur and oben not in nur:
            return False
        if ohne and oben in ohne:
            return False
        return True

    def rang(rel):
        if rel.endswith('.xml'):
            return 3
        if rel.endswith('/index.html'):
            return 2
        if rel.count('/') == 2 and rel.endswith('.html'):
            return 0
        return 1

    aus = []
    for pfad in basis.rglob('*'):
        if not pfad.is_file() or DUBLETTE.search(pfad.name):
            continue
        if pfad.name in ('.DS_Store', 'Thumbs.db'):
            continue
        rel = str(pfad.relative_to(basis)).replace(os.sep, '/')
        if erlaubt(rel):
            aus.append((pfad, rel))
    aus.sort(key=lambda paar: (rang(paar[1]), paar[1]))
    return aus


def hochladen(daten, basis, dateien, workers=1, trocken=False, filtern=False):
    """Compare by content and send what is missing; returns (new, same, bytes).

    Each worker keeps its own FTPS connection and its own working directory, so
    the login and the CWD chatter stay out of the way. The state file is written
    every 2.000 files: an interrupted run continues where it stopped instead of
    hashing a quarter of a million files again.
    """
    gesamt = len(dateien)
    alle = {rel for _, rel in dateien}
    ziel = daten['path']
    stand = lade_stand()
    ftp = verbinde(daten)
    try:
        ftp.cwd(ziel)
        fern = fern_index(ftp, ziel)
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()
    if fern is None:
        print('  remote sizes unknown, no sizes to compare', file=sys.stderr)

    auftraege = deque(dateien)
    zaehler = {'neu': 0, 'gleich': 0, 'bytes': 0, 'geprueft': 0}
    sperre = threading.Lock()

    def sichern():
        sichere_stand({k: v for k, v in list(stand.items()) if v is not None})

    def arbeit():
        verbindung = verbinde(daten)
        aktuell = None       # cached working directory of this connection
        try:
            while True:
                with sperre:
                    if not auftraege:
                        return
                    datei, rel = auftraege.popleft()
                ordner, _, name = rel.rpartition('/')
                eintrag_neu = eintrag(datei, stand.get(rel))
                ferngroesse = fern.get(rel) if fern is not None else None
                noetig = hochladen_noetig(stand.get(rel), eintrag_neu, ferngroesse)
                if noetig and not trocken:
                    for versuch in range(3):
                        try:
                            if aktuell != ordner:
                                verbindung.cwd(ziel)
                                if ordner:
                                    stelle_sicher(verbindung, ordner)
                                aktuell = ordner
                            with datei.open('rb') as quelle:
                                verbindung.storbinary('STOR ' + name, quelle)
                            break
                        except ftplib.all_errors:
                            if versuch == 2:
                                raise
                            try:
                                verbindung.close()
                            except ftplib.all_errors:
                                pass
                            verbindung = verbinde(daten)
                            aktuell = None
                with sperre:
                    zaehler['neu' if noetig else 'gleich'] += 1
                    if noetig:
                        zaehler['bytes'] += datei.stat().st_size
                    zaehler['geprueft'] += 1
                    if not noetig or not trocken:
                        stand[rel] = eintrag_neu
                    geprueft = zaehler['geprueft']
                    if geprueft % 5000 == 0 or geprueft == gesamt:
                        print('  %d/%d geprüft, %d neu' % (geprueft, gesamt, zaehler['neu']),
                              flush=True)
                    if geprueft % 2000 == 0:
                        sichern()
        finally:
            try:
                verbindung.quit()
            except ftplib.all_errors:
                verbindung.close()

    if workers > 1 and not trocken:
        faeden = [threading.Thread(target=arbeit) for _ in range(workers)]
        for faden in faeden:
            faden.start()
        for faden in faeden:
            faden.join()
    else:
        arbeit()

    if not trocken:
        if filtern:
            # A filtered run knows only half the release: keep the other entries.
            sichern()
        else:
            # Only what the build still has; a renamed file starts fresh next time.
            sichere_stand({k: v for k, v in list(stand.items())
                           if v is not None and k in alle})
    return zaehler['neu'], zaehler['gleich'], zaehler['bytes']


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
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--quelle', type=Path, default=QUELLE,
                        help='build folder to upload (default: dist-web)')
    parser.add_argument('--dry-run', action='store_true',
                        help='only show what would be uploaded, change nothing')
    parser.add_argument('--aufraeumen', action='store_true',
                        help='DELETE iCloud conflict copies on the server')
    parser.add_argument('--verwaiste', action='store_true',
                        help='list server files the build no longer contains')
    parser.add_argument('--loeschen', action='store_true',
                        help='with --verwaiste: delete those files')
    parser.add_argument('--force', action='store_true',
                        help='with --verwaiste --loeschen: allow more than %d deletions' % GRENZE)
    parser.add_argument('--workers', type=int, choices=range(1, 9), default=4,
                        help='parallel FTPS connections (default 4); 1 keeps one connection')
    parser.add_argument('--nur', default='',
                        help='only these top-level folders, comma separated (e.g. de,en,fr)')
    parser.add_argument('--ohne', default='',
                        help='skip these top-level folders, comma separated')
    optionen = parser.parse_args()
    if optionen.loeschen and not optionen.verwaiste:
        raise SystemExit('--loeschen only works together with --verwaiste')
    if not optionen.quelle.is_dir():
        raise SystemExit('MISSING: %s' % optionen.quelle)

    daten = lies_konfig()
    ftp = verbinde(daten)
    try:
        if optionen.verwaiste:
            fern = fern_index(ftp, daten['path'])
            if fern is None:
                raise SystemExit('the server did not list its files; nothing done')
            lokal = {str(p.relative_to(optionen.quelle)).replace(os.sep, '/')
                     for p in optionen.quelle.rglob('*') if p.is_file()}
            ueberzaehlig = verwaiste_dateien(fern, lokal)
            print('%d files on the server, %d in the build, %d no longer in the build'
                  % (len(fern), len(lokal), len(ueberzaehlig)))
            for pfad in ueberzaehlig[:40]:
                print('  %s' % pfad)
            if len(ueberzaehlig) > 40:
                print('  … and %d more' % (len(ueberzaehlig) - 40))
            if not optionen.loeschen:
                print('Nothing deleted. Add --loeschen to remove exactly these files.')
                return 0
            if len(ueberzaehlig) > GRENZE and not optionen.force:
                print('Refusing to delete %d files without --force.' % len(ueberzaehlig))
                return 1
            entfernt = 0
            for pfad in ueberzaehlig:
                try:
                    ftp.cwd(daten['path'])
                    ftp.delete(pfad)
                    entfernt += 1
                except ftplib.error_perm as fehler:
                    print('  could not delete %s: %s' % (pfad, fehler))
            print('%d files deleted' % entfernt)
            return 0

        if optionen.aufraeumen:
            print('%d conflict copies removed on the server' % aufraeumen(ftp, daten['path']))
        nur = {teil.strip().strip('/') for teil in optionen.nur.split(',') if teil.strip()}
        ohne = {teil.strip().strip('/') for teil in optionen.ohne.split(',') if teil.strip()}
        if nur and ohne:
            raise SystemExit('Use either --nur or --ohne, not both')
        dateien = dateien_sammeln(optionen.quelle, nur or None, ohne or None)
        print('%d files selected%s' % (len(dateien),
              ' (%s)' % ('nur ' + ','.join(sorted(nur)) if nur else 'ohne ' + ','.join(sorted(ohne)))
              if (nur or ohne) else ''))
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()
        ftp = None
        neu, gleich, menge = hochladen(daten, optionen.quelle, dateien,
                                       workers=optionen.workers, trocken=optionen.dry_run,
                                       filtern=bool(nur or ohne))
        print('%d to upload, %d already there, %.1f MB'
              % (neu, gleich, menge / 1048576.0))
        return 0
    finally:
        if ftp is not None:
            try:
                ftp.quit()
            except ftplib.all_errors:
                ftp.close()


if __name__ == '__main__':
    sys.exit(main())
