#!/usr/bin/env python3
"""Rebuild the local preview folder `~/.cache/llb-vorschau`.

The PHP preview serves its static files (CSS, scripts, images, data) from this
folder, which only carries symlinks into the repository plus the maps:

    ~/.cache/llb-vorschau/<file>   ->  web/<file>
    ~/.cache/llb-vorschau/karten   ->  webp/

The folder is disposable. If it is gone – `rm -rf`, a cache cleaner, a slip –
this script restores it in a second; the data folder `~/.cache/llb-php` is a
separate build (`tools/build_php_data.py`).

    python3 tools/vorschau_ordner.py

Then start the server as usual:

    LLB_DATA="$HOME/.cache/llb-php/phpdata" \\
    LLB_CACHE="$HOME/.cache/llb-php/twig" \\
    php -S 127.0.0.1:8901 -t "$HOME/.cache/llb-vorschau" php/public/router.php
"""
import shutil
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
WEB = HIER / 'web'
WEBP = HIER / 'webp'
ZIEL = Path.home() / '.cache' / 'llb-vorschau'


def main() -> int:
    if not WEB.is_dir() or not WEBP.is_dir():
        print('MISSING: web/ oder webp/ fehlt – falsches Verzeichnis?')
        return 2
    ZIEL.mkdir(parents=True, exist_ok=True)

    erwartet = set()
    for eintrag in sorted(WEB.iterdir()):
        if eintrag.name.startswith('.'):
            continue
        erwartet.add(eintrag.name)
        link = ZIEL / eintrag.name
        if link.is_symlink() or link.is_file():
            link.unlink()
        elif link.is_dir():
            # A real copy from an earlier run; the preview folder is disposable.
            shutil.rmtree(link)
        link.symlink_to(eintrag)

    karten = ZIEL / 'karten'
    if karten.is_symlink() or karten.is_file():
        karten.unlink()
    elif karten.is_dir():
        shutil.rmtree(karten)
    karten.symlink_to(WEBP)
    erwartet.add('karten')

    # Anything else in the folder is left alone, stale links are removed.
    entfernt = 0
    for eintrag in sorted(ZIEL.iterdir()):
        if eintrag.name in erwartet or eintrag.name.startswith('.'):
            continue
        if eintrag.is_symlink() or eintrag.is_file():
            eintrag.unlink()
            entfernt += 1
    print('%s: %d Verweise, %d alte entfernt' % (ZIEL, len(erwartet), entfernt))
    print('Start: LLB_DATA="$HOME/.cache/llb-php/phpdata" '
          'LLB_CACHE="$HOME/.cache/llb-php/twig" '
          'php -S 127.0.0.1:8901 -t "%s" php/public/router.php' % ZIEL)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
