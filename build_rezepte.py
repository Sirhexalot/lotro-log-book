#!/usr/bin/env python3
"""Build the recipe data for the website from the recipe export.

Reads `recipes.json` (export_recipes.py) and writes `web/rezepte-<language>.js`:

    window.MQL_REZEPTE = {r: [[name, quality, level, profession, tier, category,
                               [[ingredient, quantity, symbol, item ID], …],
                               [[optional, quantity, critical bonus, symbol, item ID], …],
                               critical result name, profession key, recipe ID,
                               tier, crit %, time, crit %, time, result symbol,
                               critical symbol, result item ID, critical item ID,
                               [[result item ID, name, level, symbol], …]], …],
                           b: [[bucket key, bucket label], …],
                           k: {category name: [bucket key, base key, base type,
                                               leaf label], …}}

The category tree in `b`/`k` comes from `tools/rezeptkategorien.py`; it lets the
filter group the flat client categories into bucket → base type → category.

    .../.venv/bin/python build_rezepte.py --sprache de --quelle <rezepte-dir>
"""
import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ElementTree
from pathlib import Path

from tools.rezeptkategorien import REST, anzeigename, baum, basis, unbekannt

HIER = Path(__file__).resolve().parent
STANDARD = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter/rezepte-2026-11-06/recipes.json')
CLIENT_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore')


def result_variants(lore: Path) -> dict:
    """All result item ids per recipe, from the client's recipe list.

    The recipe export carries only the first normal and critical result. The
    client lists every variant of a recipe (the same recipe can yield several
    differently named items); the item page needs all of them to answer
    "where from".
    """
    path = lore / 'recipes.xml'
    if not path.is_file():
        return {}
    variants = {}
    for recipe in ElementTree.parse(path).getroot().iter('recipe'):
        raw_id = recipe.get('id')
        if not raw_id:
            continue
        recipe_id = '%08X' % (int(raw_id) & 0xffffffff)
        found = {}
        for result in recipe.iter('result'):
            critical = (result.get('critical') or '').lower() == 'true'
            level = result.get('itemLevel')
            for item in result.findall('resultItem'):
                raw_item = item.get('itemId')
                if not raw_item:
                    continue
                item_id = '%08X' % (int(raw_item) & 0xffffffff)
                entry = found.setdefault(item_id, {
                    'id': item_id, 'name': item.get('name') or '',
                    'level': 0, 'normal': False, 'critical': False,
                })
                entry['normal'] = entry['normal'] or not critical
                entry['critical'] = entry['critical'] or critical
                if level and not entry['level']:
                    try:
                        entry['level'] = int(level)
                    except (TypeError, ValueError):
                        pass
        if found:
            variants[recipe_id] = list(found.values())
    return variants


def sauber(text):
    """Game names carry plural/quality tags and gendered forms; strip them."""
    text = html.unescape(text or '')
    text = text.replace('\\q', '"').replace('\\n', ' ')
    text = re.sub(r'\$\{[A-Z_]+:([^}]*)\}',
                  lambda m: re.sub(r'\[[A-Za-z]{1,4}\]', '', m.group(1).split('|')[0]).strip(), text)
    text = re.sub(r'\[[A-Za-z]{1,4}\]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


# The export spells the tier 13 "Minis Ithil" in German; the city is Minas
# Ithil, and the English and French exports say so. One correction, in the
# place the name is read, so every recipe and every page carries it.
STUFEN_KORREKTUR = {'de': {'Minis Ithil': 'Minas Ithil'}}


def name(record, sprache):
    if not record:
        return ''
    texte = record.get('n') or {}
    return sauber(texte.get(sprache) or texte.get('en') or '')


def baue(quelle, sprache, variants=None):
    data = json.loads(quelle.read_text(encoding='utf-8'))
    items = data.get('items') or {}
    variants = variants if variants is not None else result_variants(CLIENT_LORE)
    # Symbol per item, from the shared item model. The recipe data then carries
    # the file name directly and no page needs a second lookup.
    seite = json.loads((HIER / 'daten' / 'items.json').read_text(encoding='utf-8')).get('items') or {}

    def anforderungen(item_id):
        eintrag = seite.get(str(item_id).upper()) or {}
        return {key: eintrag[key] for key in ('ml', 'rk', 'rr', 'at', 'wt', 'ex', 'sc')
                if eintrag.get(key)} or None

    def symbol(item_id):
        return (seite.get(str(item_id)) or {}).get('ic') or ''
    professions = data.get('professions') or {}
    tiers = data.get('tiers') or {}
    categories = data.get('categories') or {}
    buendel, kategorie_baum, kategorie_hinweise = baum(categories, sprache)
    # A base type from a client update must not disappear silently.
    fehlend = unbekannt(basis((eintrag.get('en') or '')) for eintrag in categories.values())
    if fehlend:
        kategorie_hinweise.insert(0, 'Ohne Bereich (landet in %s): %s'
                                  % (REST, ', '.join(fehlend)))
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
            zutaten.append([name(items.get(item), sprache), quantity, symbol(item), item])
        optional = []
        for part in recipe.get('o') or []:
            optional.append([name(items.get(part[0]), sprache), part[1],
                             part[2] if len(part) > 2 else 0, symbol(part[0]), part[0]])
        critical = ''
        if recipe.get('cr'):
            critical = name(items.get(recipe['cr'][0]), sprache)
        # The client's profession key ("WOODWORKER") lets the page match the
        # character's professions from Companion, which are stored as keys.
        key = re.sub(r'[^A-Za-z]', '', profession.get('en') or '').upper()
        variant_rows = variants.get(recipe['id']) or []
        if not variant_rows:
            variant_rows = []
            if recipe.get('r') and recipe['r'][0]:
                variant_rows.append({'id': recipe['r'][0], 'name': '',
                                     'level': 0, 'normal': True, 'critical': False})
            if recipe.get('cr') and recipe['cr'][0]:
                variant_rows.append({'id': recipe['cr'][0], 'name': '',
                                     'level': 0, 'normal': False, 'critical': True})
        result_rows = []
        seen = set()
        for variant in variant_rows:
            item_id = str(variant.get('id') or '').upper()
            if not item_id or item_id in seen:
                continue
            seen.add(item_id)
            item = seite.get(item_id) or items.get(item_id) or {}
            item_name = name(item, sprache) or sauber(variant.get('name') or '')
            if not item_name:
                continue
            try:
                item_level = int(item.get('l') or variant.get('level') or 0)
            except (TypeError, ValueError):
                item_level = 0
            result_rows.append([item_id, item_name, item_level, symbol(item_id),
                                anforderungen(item_id)])
        zeilen.append([
            result_name,
            int(result.get('q') or 0),
            int(result.get('l') or 0),
            profession.get(sprache) or profession.get('en') or '',
            STUFEN_KORREKTUR.get(sprache, {}).get(tier.get(sprache) or '', tier.get(sprache) or tier.get('en') or ''),
            anzeigename(category, sprache),
            zutaten,
            optional,
            critical,
            key,
            recipe['id'],
            int(recipe.get('t') or 0),
            round(float(recipe.get('ch') or 0) * 100, 1),
            round(float(recipe.get('ti') or 0), 1),
            round(float(recipe.get('ch') or 0) * 100, 1),
            round(float(recipe.get('ti') or 0), 1),
            # Symbol file names for result and critical result, so the page
            # shows the icon without a second lookup.
            symbol(recipe['r'][0]),
            symbol((recipe.get('cr') or [''])[0]),
            recipe['r'][0],
            (recipe.get('cr') or [''])[0],
            result_rows,
            # Trage-Voraussetzungen des Ergebnisses für die Eignungsfarbe.
            anforderungen(recipe['r'][0]),
        ])
    zeilen.sort(key=lambda row: (row[0].lower(), row[3], row[1]))
    return zeilen, buendel, kategorie_baum, kategorie_hinweise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sprache', choices=('de', 'en', 'fr'), default='de')
    parser.add_argument('--quelle', type=Path, default=STANDARD)
    parser.add_argument('--ziel', type=Path, default=HIER / 'web')
    args = parser.parse_args()
    if not args.quelle.is_file():
        raise SystemExit('Rezeptexport fehlt: %s' % args.quelle)
    zeilen, buendel, kategorie_baum, kategorie_hinweise = baue(
        args.quelle, args.sprache, result_variants(CLIENT_LORE))
    text = json.dumps({'r': zeilen, 'b': buendel, 'k': kategorie_baum},
                      ensure_ascii=False, separators=(',', ':'))
    ziel = args.ziel / ('rezepte-%s.js' % args.sprache)
    ziel.write_text('/* Written by build_rezepte.py. */\nwindow.MQL_REZEPTE = %s;\n' % text,
                    encoding='utf-8')
    print('%d Rezepte -> %s (%.1f MB)' % (len(zeilen), ziel.name, ziel.stat().st_size / 1048576))
    for hinweis in kategorie_hinweise:
        print('Kategorie: %s' % hinweis)


if __name__ == '__main__':
    sys.exit(main())
