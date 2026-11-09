#!/usr/bin/env python3
"""Export the catalogue wording and icons for the PHP site.

The static generator keeps its labels in `build_katalogseiten.py`. While both
renderers exist, they must say exactly the same thing, so the labels are
exported from that one source instead of being typed a second time.

    python3 tools/build_php_labels.py [--ziel phpdata/labels.json]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))

import build_katalogseiten as katalog  # noqa: E402
import build_seo  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path, default=HIER / 'phpdata' / 'labels.json')
    options = parser.parse_args()
    payload = {
        'schema': 1,
        'langs': list(katalog.LANGS),
        'words': katalog.WORDS,
        'familie': katalog.FAMILIE,
        'symbols': katalog.Renderer.SYMBOLE,
        'base': katalog.BASE,
        # Application page titles and descriptions: the same source the static
        # build uses for <title> and the meta description.
        'app': app_seiten(),
        # Section titles that the static generators keep as local literals.
        'sections': {
            'de': {'where_from': 'Woher', 'context': 'Zusammenhang',
                   'occurrences_item': 'Vorkommen', 'used_in': 'Wofür',
                   'no_spots': 'Hier sind noch keine Fundstellen bekannt.'},
            'en': {'where_from': 'Where from', 'context': 'Context',
                   'occurrences_item': 'Resources', 'used_in': 'Used for',
                   'no_spots': 'No gathering spots are known here yet.'},
            'fr': {'where_from': 'Provenance', 'context': 'Contexte',
                   'occurrences_item': 'Ressources', 'used_in': 'Utilisation',
                   'no_spots': 'Aucun lieu de récolte n’est encore connu ici.'},
        },
    }
    options.ziel.parent.mkdir(parents=True, exist_ok=True)
    options.ziel.write_text(json.dumps(payload, ensure_ascii=False, indent=prompt_indent()),
                            encoding='utf-8')
    print('labels: %s (%d Zeichen)' % (options.ziel, options.ziel.stat().st_size))
    return 0


def app_seiten() -> dict:
    """Title and description per application page.

    build_seo.PAGES is the source for the pages it describes; the rest keeps
    the title from its own file, without the site suffix.
    """
    import re
    seiten = {key: {'title': value[0], 'description': value[1]}
              for key, value in build_seo.PAGES.items()}
    for datei in sorted((HIER / 'web').glob('*.html')):
        if datei.name in seiten or datei.name == '404.html':
            continue
        text = datei.read_text(encoding='utf-8')
        treffer = re.search(r'<title>(.*?)</title>', text)
        titel = treffer.group(1) if treffer else ''
        titel = titel.replace(' – LOTRO Log Book', '').strip()
        seiten[datei.name] = {'title': titel, 'description': ''}
    return seiten


def prompt_indent() -> int:
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
