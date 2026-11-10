#!/usr/bin/env python3
"""Empty the Twig cache on the server.

With `LLB_PRODUCTION=1` (set by `deploy/index.php`) Twig does not reload
templates: `auto_reload` is off, so a changed `.twig` file keeps rendering as
the old compiled version until its cache entry is gone. A release that touches
templates therefore needs this step, and forgetting it looks exactly like a
broken deploy.

    python3 tools/cache_leeren.py            # leeren
    python3 tools/cache_leeren.py --zeigen   # nur zählen

Only the compiled templates under `phptmp/twig` are removed. Twig rebuilds them
on the next request; nothing else on the server is touched.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))
import upload  # noqa: E402


def leeren(ftp, ordner: str, zaehler: dict) -> None:
    ftp.cwd(ordner)
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
            leeren(ftp, ordner + '/' + name, zaehler)
            ftp.cwd(ordner)
            ftp.rmd(name)
            zaehler['ordner'] += 1
        else:
            ftp.delete(name)
            zaehler['dateien'] += 1


def zaehlen(ftp, ordner: str, zaehler: dict) -> None:
    ftp.cwd(ordner)
    eintraege = []
    ftp.retrlines('LIST', eintraege.append)
    for zeile in eintraege:
        teile = zeile.split(None, 8)
        if len(teile) < 9 or teile[8] in ('.', '..'):
            continue
        if zeile.startswith('d'):
            zaehlen(ftp, ordner + '/' + teile[8], zaehler)
            zaehler['ordner'] += 1
            ftp.cwd(ordner)
        else:
            zaehler['dateien'] += 1


def main() -> int:
    zerleger = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    zerleger.add_argument('--zeigen', action='store_true',
                          help='nur zählen, nichts löschen')
    optionen = zerleger.parse_args()

    daten = upload.lies_konfig()
    ftp = upload.verbinde(daten)
    ziel = daten['path'] + '/phptmp/twig'
    zaehler = {'dateien': 0, 'ordner': 0}
    try:
        (zaehlen if optionen.zeigen else leeren)(ftp, ziel, zaehler)
    except Exception as fehler:  # noqa: BLE001 – a missing folder is a real answer
        print('phptmp/twig nicht erreichbar: %s' % fehler)
        ftp.quit()
        return 1
    ftp.quit()
    print('Twig-Cache: %d Dateien, %d Ordner%s'
          % (zaehler['dateien'], zaehler['ordner'],
             ' gezählt' if optionen.zeigen else ' entfernt'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
