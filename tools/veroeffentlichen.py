#!/usr/bin/env python3
"""Publish a PHP release and run the complete live acceptance gate.

The upload is intentionally opt-in:

    python3 tools/veroeffentlichen.py --ziel "$HOME/.cache/llb-release/current" \
        --daten "$HOME/.cache/llb-php/phpdata" --upload

Sequence: build, entity status run, upload, clear Twig cache, then the
complete live gate.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    print('▶ ' + ' '.join(command), flush=True)
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--ziel', required=True, type=Path,
                        help='dedizierter Release-Ordner außerhalb des Repos')
    parser.add_argument('--daten', required=True, type=Path,
                        help='PHP-Datenordner für den Release')
    parser.add_argument('--workers', type=int, default=8)
    parser.add_argument('--gruppe', default='alle',
                        help='Komponenten für den Upload (Standard: alle)')
    parser.add_argument('--migration', action='store_true',
                        help='fehlenden Serverstand initial durch vollständigen Upload anlegen')
    parser.add_argument('--browser', choices=('chromium', 'webkit'), default='chromium')
    parser.add_argument('--basis', default='http://127.0.0.1:8817',
                        help='Basis der Entitätenprüfung (Standard: lokale Vorschau)')
    parser.add_argument('--stichprobe', type=int, default=0,
                        help='nur so viele Adressen der Entitätenprüfung prüfen')
    parser.add_argument('--upload', action='store_true',
                        help='tatsächlich veröffentlichen; ohne Option wird abgebrochen')
    args = parser.parse_args()
    if not args.upload:
        parser.error('--upload ist erforderlich, damit eine Veröffentlichung startet')
    if not args.daten.is_dir():
        parser.error(f'Datenordner fehlt: {args.daten}')

    python = sys.executable
    run([python, 'tools/build_release.py', '--ziel', str(args.ziel),
         '--daten', str(args.daten)])
    # Every published address must answer 200 before anything goes up: a page
    # that fails here would fail on the host too, only later and in public.
    pruefung = [python, 'tools/pruefe_entitaeten.py',
                '--basis', args.basis, '--daten', str(args.daten)]
    if args.stichprobe:
        pruefung += ['--stichprobe', str(args.stichprobe)]
    run(pruefung)
    upload = [python, 'upload.py', '--quelle', str(args.ziel),
              '--workers', str(args.workers), '--gruppe', args.gruppe]
    if args.migration:
        upload.append('--migration')
    run(upload)
    # FTP servers can reject removal of a cache directory when PHP recreates a
    # Twig file between LIST and RMD. A second pass is safe and clears the
    # entries created during the first pass.
    for attempt in range(2):
        try:
            run([python, 'tools/cache_leeren.py'])
            break
        except subprocess.CalledProcessError:
            if attempt == 1:
                raise
    env = {**os.environ, 'LLB_BROWSER': args.browser}
    run(['node', 'tests/live_release.js'], env=env)
    print('✓ Veröffentlichung und Live-Abnahme vollständig bestanden')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
