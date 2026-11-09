#!/usr/bin/env python3
"""Finish an interrupted iCloud copy: only copy what is missing or wrong.

Existing files are kept. A file is copied again when it is missing, has a
different size, or is empty in the target while the source has content (an
interrupted copy leaves such stumps behind).

    python3 tools/repair_copy.py SRC DST [--threads 6] [--geduld 45]

No checksums here on purpose: sizes and paths only. Blocked iCloud files are
reported instead of waited for forever.
"""
from __future__ import annotations

import argparse
import shutil
import sys
import time
from concurrent.futures import ThreadPoolExecutor, wait
from pathlib import Path

AUS = ('phpdata', 'phptmp', 'dist-web', 'vendor')
DATEI_AUS = ('__pycache__', '.DS_Store', '.pytest_cache')


def sammeln(source: Path) -> list[Path]:
    files = []
    for path in source.rglob('*'):
        if not path.is_file():
            continue
        teile = path.relative_to(source).parts
        if any(teil in AUS for teil in teile):
            continue
        if path.name in DATEI_AUS:
            continue
        files.append(path)
    return files


def kopieren(source: Path, target: Path) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    with source.open('rb') as src, target.open('wb') as dst:
        shutil.copyfileobj(src, dst, 1 << 20)
    size = source.stat().st_size
    if target.stat().st_size != size:
        return 'GROESSE'
    shutil.copystat(source, target)
    return 'ok'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('target', type=Path)
    parser.add_argument('--threads', type=int, default=6)
    parser.add_argument('--geduld', type=float, default=45.0)
    options = parser.parse_args()

    source = options.source.resolve()
    target = options.target.resolve()
    files = sammeln(source)
    print('%d Dateien in der Quelle zu pruefen' % len(files), flush=True)

    offen: list[tuple[Path, Path, str]] = []
    gleich = 0
    for path in files:
        ziel = target / path.relative_to(source)
        try:
            quell_groesse = path.stat().st_size
        except OSError as error:
            print('QUELLE-FEHLER %s (%s)' % (path, error), flush=True)
            continue
        if not ziel.exists():
            offen.append((path, ziel, 'fehlt'))
            continue
        if ziel.stat().st_size != quell_groesse:
            offen.append((path, ziel, 'groesse %d statt %d' % (ziel.stat().st_size, quell_groesse)))
            continue
        if quell_groesse == 0 and ziel.stat().st_size == 0:
            gleich += 1
            continue
        gleich += 1

    print('%d unveraendert, %d nachzuholen' % (gleich, len(offen)), flush=True)
    for path, _ziel, grund in offen[:15]:
        print('  %-14s %s' % (grund, path.relative_to(source)), flush=True)
    if len(offen) > 15:
        print('  ... und %d weitere' % (len(offen) - 15), flush=True)

    blockiert: list[Path] = []
    if offen:
        started = time.time()
        erledigt = 0
        with ThreadPoolExecutor(max_workers=options.threads) as pool:
            futures = {pool.submit(kopieren, path, ziel): path for path, ziel, _ in offen}
            for future, path in futures.items():
                done, _ = wait([future], timeout=options.geduld)
                if not done:
                    blockiert.append(path)
                    print('BLOCKIERT %s' % path.relative_to(source), flush=True)
                    continue
                erledigt += 1
                try:
                    status = future.result()
                except OSError as error:
                    blockiert.append(path)
                    print('FEHLER %s: %s' % (path.relative_to(source), error), flush=True)
                    continue
                if status != 'ok':
                    print('%s %s' % (status, path.relative_to(source)), flush=True)
                if erledigt % 200 == 0:
                    rate = erledigt / max(0.001, time.time() - started)
                    print('%5d/%d  %.1f Dateien/s  noch ca. %.0f s' %
                          (erledigt, len(offen), rate, (len(offen) - erledigt) / rate), flush=True)
        print('Nachholen fertig in %.1f min, %d blockiert' %
              ((time.time() - started) / 60, len(blockiert)), flush=True)

    if blockiert:
        print('--- zweiter Versuch nach brctl download ---', flush=True)
        import subprocess
        ordner = sorted({str(path.parent) for path in blockiert})
        subprocess.run(['brctl', 'download', *ordner], capture_output=True)
        time.sleep(20)
        noch_offen = []
        for path in blockiert:
            ziel = target / path.relative_to(source)
            try:
                status = kopieren(path, ziel)
                print('%s %s' % (status, path.relative_to(source)), flush=True)
            except OSError as error:
                noch_offen.append(path)
                print('BLOCKIERT %s (%s)' % (path.relative_to(source), error), flush=True)
        blockiert = noch_offen

    print('=== Ergebnis ===', flush=True)
    print('ungefaehr gleich: %d, nachgeholt: %d, weiter blockiert: %d' %
          (gleich, erledigt if offen else 0, len(blockiert)), flush=True)
    for path in blockiert:
        print('  blockiert: %s' % path.relative_to(source), flush=True)
    return 1 if blockiert else 0


if __name__ == '__main__':
    raise SystemExit(main())
