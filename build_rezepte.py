#!/usr/bin/env python3
"""Build the recipe data for the website from the recipe export.

Reads `recipes.json` (export_recipes.py) and writes `web/rezepte-<language>.js`:

    window.MQL_REZEPTE = {r: [[name, quality, level, profession, tier, category,
                               [[ingredient, quantity], …],
                               [[optional, quantity, critical bonus], …],
                               critical result name], …]}

    .../.venv/bin/python build_rezepte.py --sprache de --quelle <rezepte-dir>
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
STANDARD = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter/rezepte-2026-11-06/recipes.json')


def sauber(text):
    """Game names carry plural/quality tags and gendered forms; strip them."""
    text = html.unescape(text or '')
    text = re.sub(r'\$\{[A-Z_]+:([^}]*)\}',
                  lambda m: re.sub(r'\[[A-Za-z]{1,4}\]', '', m.group(1).split('|')[0]).strip(), text)
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def name(record, sprache):
    if not record:
        return ''
    texte = record.get('n') or {}
    return sauber(texte.get(sprache) or texte.get('en') or '')


def baue(quelle, sprache):
    data = json.loads(quelle.read_text(encoding='utf-8'))
    items = data.get('items') or {}
    professions = data.get('professions') or {}
    tiers = data.get('tiers') or {}
    categories = data.get('categories') or {}
    zeilen = []
    for recipe in data.get('recipes') or []:
        result = items.get(recipe['r'][0])
        result_name = name(result, sprache)
        if not result_name:
            continue
        profession = (professions.get(recipe.get('p', '')) or {})
        tier = (tiers.get(str(recipe.get('t', ''))) or {})
        category = (categories.get(str(recipe.get('c', ''))) or {})
        zutaten = []
        for item, quantity in recipe.get('i') or []:
            zutaten.append([name(items.get(item), sprache), quantity])
        optional = []
        for part in recipe.get('o') or []:
            optional.append([name(items.get(part[0]), sprache), part[1], part[2] if len(part) > 2 else 0])
        critical = ''
        if recipe.get('cr'):
            critical = name(items.get(recipe['cr'][0]), sprache)
        # The client's profession key ("WOODWORKER") lets the page match the
        # character's professions from Companion, which are stored as keys.
        key = re.sub(r'[^A-Za-z]', '', profession.get('en') or '').upper()
        zeilen.append([
            result_name,
            int(result.get('q') or 0),
            int(result.get('l') or 0),
            profession.get(sprache) or profession.get('en') or '',
            tier.get(sprache) or tier.get('en') or '',
            category.get(sprache) or category.get('en') or '',
            zutaten,
            optional,
            critical,
            key,
            recipe['id'],
            int(recipe.get('t') or 0),
        ])
    zeilen.sort(key=lambda row: (row[0].lower(), row[3], row[1]))
    return zeilen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sprache', choices=('de', 'en', 'fr'), default='de')
    parser.add_argument('--quelle', type=Path, default=STANDARD)
    parser.add_argument('--ziel', type=Path, default=HIER / 'web')
    args = parser.parse_args()
    if not args.quelle.is_file():
        raise SystemExit('Rezeptexport fehlt: %s' % args.quelle)
    zeilen = baue(args.quelle, args.sprache)
    text = json.dumps({'r': zeilen}, ensure_ascii=False, separators=(',', ':'))
    ziel = args.ziel / ('rezepte-%s.js' % args.sprache)
    ziel.write_text('/* Written by build_rezepte.py. */\nwindow.MQL_REZEPTE = %s;\n' % text,
                    encoding='utf-8')
    print('%d Rezepte -> %s (%.1f MB)' % (len(zeilen), ziel.name, ziel.stat().st_size / 1048576))


if __name__ == '__main__':
    sys.exit(main())
