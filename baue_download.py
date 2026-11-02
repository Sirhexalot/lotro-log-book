#!/usr/bin/env python3
"""Packt das Spielstand-Werkzeug als ZIP für die Website.

Inhalt: nur was ein Spieler braucht, um aus dem laufenden Client eine
`Progress.lua` zu erzeugen — Starter, Anleitung, vorgebaute Klasse. Keine
fremden JARs (die liegen in der Companion-Installation), keine technischen
Notizen.

Aufruf:

    python3 baue_download.py
"""
import sys
import zipfile
from pathlib import Path

HIER = Path(__file__).resolve().parent
QUELLE = Path('/Users/adrian/Documents/07_Hobbys/Lotro/MagicQuestLog/tools/journal-reader')
ZIEL = HIER / 'web/download/mql-spielstand.zip'

DATEIEN = (
    'START-HERE.txt',
    'README.md',
    'read-journal.bat',
    'read-journal.command',
    'classes/JournalExport.class',
)


def main():
    if not QUELLE.is_dir():
        print('FEHLT: %s' % QUELLE, file=sys.stderr)
        return 2
    fehlend = [name for name in DATEIEN if not (QUELLE / name).is_file()]
    if fehlend:
        print('FEHLT im Werkzeug: %s' % ', '.join(fehlend), file=sys.stderr)
        return 2

    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIEL, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archiv:
        for name in DATEIEN:
            archiv.write(QUELLE / name, name)

    groesse = ZIEL.stat().st_size / 1024
    print('%d Dateien -> %s (%.0f KB)' % (len(DATEIEN), ZIEL.relative_to(HIER),
                                          groesse))
    return 0


if __name__ == '__main__':
    sys.exit(main())
