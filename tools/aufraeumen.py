#!/usr/bin/env python3
"""Remove what the PHP site no longer needs from the live server.

After the switch the catalogue is rendered from data shards. The old static
files stay on disk as a rollback until this script runs:

* every file under `/de`, `/en` and `/fr` (the flat HTML pages),
* the static sitemap files in the root,
* the old application pages (`start.html`, `index.html`, `reise.html` …),
* `kennung.php`, which only existed for the Apache redirect block.

Everything else stays: images, maps, scripts, styles, legal pages, 404, robots.

    python3 tools/aufraeumen.py              # list only, nothing is deleted
    python3 tools/aufraeumen.py --loeschen   # delete (asks once)

Deletion runs with several FTPS connections, files first, then empty folders.
"""
import argparse
import sys
import threading
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))
import upload  # noqa: E402

# Folders whose whole content belongs to the old static catalogue.
ALTE_ORDNER = ('de', 'en', 'fr')
# Single files the PHP site replaces or never used.
ALTE_DATEIEN = (
    'index.html', 'start.html', 'start-en.html', 'start-fr.html',
    'gegenstaende.html', 'handwerk.html', 'reise.html', 'ruf.html',
    'belohnungen.html', 'spielstand.html', 'companion.html', 'plugin.html',
    'suche.html', 'gegenstand.html', 'kennung.php',
    'sitemap.xml', 'sitemap-seiten.xml',
)


def sammle(ftp, ordner, ziel, sperre):
    """Every file below one folder, as paths relative to the FTP root."""
    stapel = deque([ordner])
    while stapel:
        jetzt = stapel.popleft()
        try:
            eintraege = list(ftp.mlsd(jetzt))
        except Exception:  # noqa: BLE001 – LIST fallback below
            namen = []
            try:
                ftp.retrlines('LIST ' + jetzt, namen.append)
            except Exception:  # noqa: BLE001
                continue
            for zeile in namen:
                teile = zeile.split()
                if not teile:
                    continue
                name = teile[-1]
                pfad = jetzt + '/' + name
                if zeile.startswith('d'):
                    stapel.append(pfad)
                else:
                    with sperre:
                        ziel.append(pfad)
            continue
        for name, fakten in eintraege:
            if name in ('.', '..'):
                continue
            pfad = jetzt + '/' + name
            if fakten.get('type') == 'dir':
                stapel.append(pfad)
            else:
                with sperre:
                    ziel.append(pfad)


def loesche(dateien, ordner, workers):
    """Delete files with several connections, then the empty folders."""
    aufgabe = deque(dateien)
    gesperrt = threading.Lock()
    fehler = []

    def arbeiter():
        ftp = upload.verbinde(upload.lies_konfig())
        try:
            ftp.cwd(upload.lies_konfig()['path'])
            while True:
                with gesperrt:
                    if not aufgabe:
                        return
                    pfad = aufgabe.popleft()
                try:
                    ftp.delete(pfad)
                except Exception as ausnahme:  # noqa: BLE001
                    with gesperrt:
                        fehler.append('%s: %s' % (pfad, ausnahme))
        finally:
            try:
                ftp.quit()
            except Exception:  # noqa: BLE001
                ftp.close()

    with ThreadPoolExecutor(max_workers=workers) as pool:
        for _ in range(workers):
            pool.submit(arbeiter)

    # Folders bottom-up: the deepest first, so parents become empty in time.
    ordner = sorted(set(ordner), key=lambda p: p.count('/'), reverse=True)
    ftp = upload.verbinde(upload.lies_konfig())
    try:
        ftp.cwd(upload.lies_konfig()['path'])
        for pfad in ordner:
            try:
                ftp.rmd(pfad)
            except Exception:  # noqa: BLE001 – not empty or already gone
                pass
    finally:
        try:
            ftp.quit()
        except Exception:  # noqa: BLE001
            ftp.close()
    return fehler


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--loeschen', action='store_true',
                        help='wirklich löschen (ohne: nur zählen)')
    parser.add_argument('--ja', action='store_true', help='ohne Rückfrage')
    parser.add_argument('--workers', type=int, choices=range(1, 9), default=8)
    optionen = parser.parse_args()

    daten = upload.lies_konfig()
    ftp = upload.verbinde(daten)
    ftp.cwd(daten['path'])
    dateien, ordner = [], []
    sperre = threading.Lock()
    try:
        for name in ALTE_ORDNER:
            try:
                ftp.cwd(name)
                ftp.cwd('..')
            except Exception:  # noqa: BLE001
                print('übersprungen, nicht vorhanden:', name)
                continue
            vorher = len(dateien)
            sammle(ftp, name, dateien, sperre)
            print('%-3s %6d Dateien' % (name, len(dateien) - vorher))
        vorhanden = set()
        for eintrag in ftp.nlst():
            vorhanden.add(eintrag.rsplit('/', 1)[-1])
        for name in ALTE_DATEIEN:
            if name in vorhanden:
                dateien.append(name)
    finally:
        try:
            ftp.quit()
        except Exception:  # noqa: BLE001
            ftp.close()

    # Folders of the old catalogue plus their subfolders.
    for pfad in dateien:
        teile = pfad.split('/')[:-1]
        for i in range(1, len(teile) + 1):
            ordner.append('/'.join(teile[:i]))

    print('\n%d Dateien, %d Ordner' % (len(dateien), len(set(ordner))))
    if not optionen.loeschen:
        print('Nur gezählt. Mit --loeschen wird entfernt.')
        return 0
    if not optionen.ja:
        antwort = input('Wirklich löschen? [ja/nein] ').strip().lower()
        if antwort not in ('ja', 'j', 'yes', 'y'):
            print('Abgebrochen.')
            return 1

    fehler = loesche(dateien, ordner, optionen.workers)
    print('Fertig. %d Fehler' % len(fehler))
    for eintrag in fehler[:20]:
        print('  ', eintrag)
    return 1 if fehler else 0


if __name__ == '__main__':
    sys.exit(main())
