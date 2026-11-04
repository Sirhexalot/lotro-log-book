#!/usr/bin/env python3
"""Prepare readable map symbols without changing the original DAT exports."""
from pathlib import Path

from PIL import Image


def baue(ordner):
    ordner = Path(ordner)
    ziel = ordner / 'lesbar'
    ziel.mkdir(exist_ok=True)
    for quelle in sorted(ordner.glob('*.png')):
        with Image.open(quelle) as bild:
            bild = bild.convert('RGBA')
            rand = bild.getchannel('A').getbbox()
            if rand is None:
                raise ValueError('Empty map symbol: %s' % quelle)
            bild = bild.crop(rand)
            # A square canvas preserves the aspect ratio of narrow banners when
            # CSS displays all symbols at 24 x 24. Never stretch the artwork.
            seite = max(bild.size)
            quadrat = Image.new('RGBA', (seite, seite))
            quadrat.paste(bild, ((seite - bild.width) // 2, (seite - bild.height) // 2))
            quadrat.save(ziel / quelle.name)


if __name__ == '__main__':
    baue(Path(__file__).resolve().parent / 'web/notizen')
