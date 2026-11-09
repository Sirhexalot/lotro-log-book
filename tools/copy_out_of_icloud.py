#!/usr/bin/env python3
"""Copy the repository out of an iCloud folder, reading every byte.

iCloud leaves unused files as placeholders (`compressed,dataless`). A plain
copy tool may then copy the placeholder instead of the content, so this script
reads each file, writes it to the target and verifies size and checksum. The
checksum is computed while copying, so the source is read once.

    python3 tools/copy_out_of_icloud.py SRC DST [--threads 32] [--ohne phpdata ...]

Files that cannot be read are listed at the end; the source is never deleted
by this script.
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Regenerable build output that must not travel with the repository.
STANDARD_AUS = ('__pycache__', '.DS_Store', '.pytest_cache')


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open('rb') as handle:
        for block in iter(lambda: handle.read(1 << 20), b''):
            hasher.update(block)
    return hasher.hexdigest()


def copy_one(args) -> tuple[str, str]:
    source, target, weiter = args
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        if weiter and target.is_file():
            # Resume: a file that already matches is left untouched.
            if target.stat().st_size == source.stat().st_size and digest(target) == digest(source):
                return ('ok', str(source))
        hasher = hashlib.sha256()
        with source.open('rb') as src, target.open('wb') as dst:
            while True:
                block = src.read(1 << 20)
                if not block:
                    break
                hasher.update(block)
                dst.write(block)
        if target.stat().st_size != source.stat().st_size:
            return ('size', str(source))
        if digest(target) != hasher.hexdigest():
            return ('hash', str(source))
        shutil.copystat(source, target)
        return ('ok', str(source))
    except OSError as error:
        return ('error:%s' % error, str(source))


def gesammelt(source: Path, ohne: tuple[str, ...]) -> list[Path]:
    """Files below source, skipping regenerable folders and file names."""
    files = []
    for path in source.rglob('*'):
        if not path.is_file():
            continue
        teile = path.relative_to(source).parts
        if any(teil in ohne for teil in teile):
            continue
        if path.name in STANDARD_AUS:
            continue
        files.append(path)
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('target', type=Path)
    parser.add_argument('--threads', type=int, default=32)
    parser.add_argument('--ohne', action='append', default=[],
                        metavar='ORDNER', help='Ordner nicht mitkopieren (mehrfach möglich)')
    parser.add_argument('--weiter', action='store_true',
                        help='vorhandene, passende Dateien im Ziel überspringen')
    options = parser.parse_args()

    source = options.source.resolve()
    target = options.target.resolve()
    if target.exists() and any(target.iterdir()) and not options.weiter:
        raise SystemExit('Ziel ist nicht leer: %s' % target)

    ohne = tuple(options.ohne)
    files = gesammelt(source, ohne)
    dirs = [path for path in source.rglob('*') if path.is_dir()
            and not any(teil in ohne for teil in path.relative_to(source).parts)]
    print('%d Dateien, %d Ordner von %s nach %s' % (len(files), len(dirs), source, target),
          flush=True)
    if ohne:
        print('ohne: %s' % ', '.join(ohne), flush=True)

    for folder in dirs:
        (target / folder.relative_to(source)).mkdir(parents=True, exist_ok=True)

    started = time.time()
    done = 0
    failures: list[tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=options.threads) as pool:
        tasks = [(path, target / path.relative_to(source), options.weiter) for path in files]
        for status, name in pool.map(copy_one, tasks):
            done += 1
            if status != 'ok':
                failures.append((status, name))
            if done % 500 == 0:
                rate = done / max(0.001, time.time() - started)
                print('%5d/%d  %.1f Dateien/s  noch ca. %.0f min' %
                      (done, len(files), rate, (len(files) - done) / rate / 60), flush=True)

    print('fertig: %d kopiert, %d Fehler, %.1f min' %
          (done - len(failures), len(failures), (time.time() - started) / 60), flush=True)
    for status, name in failures[:50]:
        print('  %s: %s' % (status, name), flush=True)
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
