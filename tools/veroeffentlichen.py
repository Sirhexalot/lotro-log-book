#!/usr/bin/env python3
"""Publish a PHP release and run the complete live acceptance gate.

The upload is intentionally opt-in:

    python3 tools/veroeffentlichen.py --ziel "$HOME/.cache/llb-release/current" \
        --daten "$HOME/.cache/llb-php/phpdata" --upload

Sequence: build, upload, clear Twig cache, then the complete live gate.
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
    parser.add_argument('--browser', choices=('chromium', 'webkit'), default='chromium')
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
    run([python, 'upload.py', '--quelle', str(args.ziel),
         '--workers', str(args.workers)])
    run([python, 'tools/cache_leeren.py'])
    env = {**os.environ, 'LLB_BROWSER': args.browser}
    run(['node', 'tests/live_release.js'], env=env)
    print('✓ Veröffentlichung und Live-Abnahme vollständig bestanden')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
