#!/usr/bin/env python3
"""Build the website's deed catalogue from the game data.

The plugin's `build_deed_catalog.py` is the shared generator: it reads the DAT
export and writes the Deeds_*.lua files. This script calls it into a cache
directory and then feeds the same files to the website's own `build_daten.py`.
No iCloud copy and no second deed mapping.

    python3 tools/build_taten_daten.py
    python3 tools/build_taten_daten.py --export /path/to/export
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent.parent
HAUS = Path.home()
PLUGIN = HAUS / 'Developer/Lotro/MagicQuestLog'
WRAPPER = PLUGIN / 'tools/build_deed_catalog.py'
CACHE = HAUS / '.cache/llb-php/deed-catalog'
SPRACHEN = ('de', 'en', 'fr')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--export', type=Path, default=None,
                        help='DAT export directory (default: the wrapper\'s)')
    parser.add_argument('--cache', type=Path, default=CACHE)
    args = parser.parse_args()
    if not WRAPPER.is_file():
        raise SystemExit('shared deed generator missing: %s' % WRAPPER)
    python = PLUGIN / '.venv/bin/python'
    if not python.is_file():
        python = Path(sys.executable)
    command = [str(python), str(WRAPPER), '--output', str(args.cache)]
    if args.export is not None:
        command += ['--export', str(args.export)]
    print('shared generator:', ' '.join(command))
    subprocess.run(command, check=True)
    for sprache in SPRACHEN:
        katalog = args.cache / ('Deeds_%s.lua' % sprache)
        if not katalog.is_file():
            raise SystemExit('missing generated catalogue: %s' % katalog)
        subprocess.run([str(python), str(HIER / 'build_daten.py'),
                        '--art', 'taten', '--sprache', sprache,
                        '--katalog', str(katalog)], check=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
