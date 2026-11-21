"""Prepare cropped previews without touching the original client map exports."""
from pathlib import Path

from PIL import Image, ImageChops

ORIGINALE = Path.home() / '.cache' / 'llb-instance-map-export'
VORSCHAU = Path.home() / '.cache' / 'llb-instance-map-preview'


def zuschnitt(bild: Image.Image) -> Image.Image:
    rgb = bild.convert('RGB')
    grau = rgb.getpixel((0, 0))
    # Only trim the uniform grey atlas canvas, not black map backgrounds.
    if not (grau[0] == grau[1] == grau[2] and 0 < grau[0] < 255):
        return bild
    rahmen = ImageChops.difference(rgb, Image.new('RGB', rgb.size, grau)).getbbox()
    if rahmen and (rahmen[0] > 0 or rahmen[1] > 0
                   or rahmen[2] < rgb.width or rahmen[3] < rgb.height):
        return bild.crop(rahmen)
    return bild


def instanzkarten(loot_instances: dict, quelle: Path = ORIGINALE,
                  ziel: Path = VORSCHAU) -> dict:
    bilder = {str((row.get('karte') or {}).get('bild') or '')
              for row in loot_instances.values()}
    vorschauen = {}
    for ident in sorted(bilder):
        if not ident.isascii() or not ident.isdigit():
            continue
        original = quelle / (ident + '.png')
        if not original.is_file():
            continue
        with Image.open(original) as bild:
            ausschnitt = zuschnitt(bild)
            datei = ziel / (ident + '-crop-v1.png')
            ziel.mkdir(parents=True, exist_ok=True)
            ausschnitt.save(datei)
            vorschauen[ident] = (datei, ausschnitt.width, ausschnitt.height)
    return vorschauen
