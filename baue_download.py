#!/usr/bin/env python3
"""Packs the progress tool as a ZIP for the website.

Contents: only what a player needs to create a `Progress.lua` from the running
client — starter, instructions, prebuilt class. No third-party JARs (those live
in the Companion installation), no technical notes.

Usage:

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
        print('MISSING: %s' % QUELLE, file=sys.stderr)
        return 2
    fehlend = [name for name in DATEIEN if not (QUELLE / name).is_file()]
    if fehlend:
        print('MISSING in the tool: %s' % ', '.join(fehlend), file=sys.stderr)
        return 2

    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIEL, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archiv:
        for name in DATEIEN:
            archiv.write(QUELLE / name, name)

    groesse = ZIEL.stat().st_size / 1024
    print('%d files -> %s (%.0f KB)' % (len(DATEIEN), ZIEL.relative_to(HIER),
                                        groesse))
    return 0


if __name__ == '__main__':
    sys.exit(main())
