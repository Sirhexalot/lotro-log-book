#!/usr/bin/env python3
"""Start the one local preview server for this checkout.

There is exactly one PHP preview: 127.0.0.1:8817 with eight workers. A second
process on another port hides stale Twig templates and outdated shards, so this
script refuses to start when the port is already in use.

    python3 tools/lokalserver.py
    python3 tools/lokalserver.py --cache-leeren

`--cache-leeren` removes the compiled Twig cache before starting. Templates
reload by mtime in the checkout anyway; the option is for a fresh diagnosis.
"""
from __future__ import annotations

import argparse
import os
import shutil
import socket
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = 8817
CACHE = Path.home() / '.cache' / 'llb-php' / 'twig'
DATA = Path.home() / '.cache' / 'llb-php' / 'phpdata'
VENDOR = Path.home() / '.cache' / 'llb-php' / 'vendor'


def port_belegt() -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.3)
        return sock.connect_ex(('127.0.0.1', PORT)) == 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--cache-leeren', action='store_true',
                        help='kompilierten Twig-Cache vor dem Start löschen')
    args = parser.parse_args()
    if port_belegt():
        print('Lokale Vorschau läuft bereits: http://127.0.0.1:%d/de/karte/' % PORT)
        print('Kein zweiter Server. Für einen Neustart den laufenden Prozess beenden.')
        return 0
    if not DATA.is_dir():
        print('MISSING: %s (tools/build_php_data.py ausführen)' % DATA, file=sys.stderr)
        return 2
    if not VENDOR.is_dir():
        print('MISSING: %s' % VENDOR, file=sys.stderr)
        return 2
    if args.cache_leeren and CACHE.exists():
        shutil.rmtree(CACHE)
    CACHE.mkdir(parents=True, exist_ok=True)
    os.chdir(ROOT)
    env = dict(os.environ)
    env.update({
        'LLB_ROOT': str(ROOT),
        'LLB_DATA': str(DATA),
        'LLB_VENDOR': str(VENDOR),
        'LLB_CACHE': str(CACHE),
        'LLB_WEB': str(ROOT / 'web'),
        'PHP_CLI_SERVER_WORKERS': '8',
    })
    print('Lokale Vorschau: http://127.0.0.1:%d/de/karte/' % PORT)
    os.execvpe('php', ['php', '-S', '127.0.0.1:%d' % PORT,
                       '-t', str(ROOT / 'web'), 'php/public/router.php'], env)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
