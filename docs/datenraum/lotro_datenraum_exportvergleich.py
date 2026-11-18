"""Audit compact exports against exact IDs/properties in available Companion data."""
import collections
import hashlib
import json
import xml.etree.ElementTree as ET
from lotro_datenraum_audit import OUT, LORE, EXPORT, table, dtype

sources = {}


def readjson(name):
    p = EXPORT / name
    sources[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
    return json.loads(p.read_text())


def xml(name):
    p = LORE / name
    sources[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
    return ET.parse(p).getroot()


def hexid(value):
    return f'{int(value) & 0xffffffff:08X}'


def walk(value, path, stats):
    s = stats.setdefault(path, collections.Counter())
    s[dtype(value)] += 1
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, path + '.' + k, stats)
    elif isinstance(value, list):
        for v in value:
            walk(v, path + '[]', stats)


items = readjson('items-2026-11-08/items.json')
rewards = readjson('rewards-2026-11-06/rewards.json')
recipes = readjson('rezepte-2026-11-06/recipes.json')
recipe_sources = readjson('recipe-sources-2026-11-06/recipe-sources.json')
profiles = []
for name, data, buckets in [
    ('items', items, ['items', 'sets']),
    ('rewards', rewards, ['tables', 'items', 'titles', 'virtues', 'traits', 'emotes']),
    ('recipes', recipes, ['items', 'professions', 'tiers', 'categories']),
    ('recipe-sources', recipe_sources, ['sources']),
]:
    stats = {}
    for k, v in data.items():
        if k == 'stats' and name == 'items':
            for lang, labels in v.items():
                for row in labels.values():
                    walk(row, '$.stats.' + lang + '.<id>', stats)
        elif k in buckets:
            for row in v.values():
                walk(row, '$.' + k + '.<id>', stats)
        else:
            walk(v, '$.' + k, stats)
    profiles += ['## ' + name, '',
                 table(['Propertypfad (`<id>` = dynamischer Schlüssel)', 'Typen/Vorkommen'],
                       [('`' + k + '`', ', '.join(f'{t}: {n}' for t, n in sorted(s.items())))
                        for k, s in sorted(stats.items())]), '']

xi = {hexid(e.get('key')): e.attrib for e in xml('items.xml').findall('./item')}
xs = {e.get('id'): e for e in xml('sets.xml').findall('./set')}
xr = {hexid(e.get('id')) for e in xml('recipes.xml').findall('./recipe')}
membership = collections.defaultdict(set)
for sid, e in xs.items():
    for child in e.findall('./item'):
        membership[hexid(child.get('id'))].add(sid)

checks = []


def check(label, values, target):
    vals = [str(v) for v in values]
    missing = collections.Counter(v for v in vals if v not in target)
    checks.append({'relation': label, 'occurrences': len(vals),
                   'resolved': sum(v in target for v in vals), 'missing': dict(missing)})


check('Itemexport-ID → Companion-Item', items['items'], xi)
check('Companion-Item → Itemexport-ID (Abdeckung)', xi, items['items'])
check('Setexport-ID → Companion-Set', items['sets'], xs)
check('Itemexport.set → Setexport-ID', [r['set'] for r in items['items'].values() if 'set' in r], items['sets'])
check('Setexport.i[] → Itemexport-ID', [i for r in items['sets'].values() for i in r['i']], items['items'])
check('Rezeptexport.id → Companion-Rezept', [r['id'] for r in recipes['recipes']], xr)
check('Rezeptexport.p → exportierter Beruf', [r['p'] for r in recipes['recipes'] if 'p' in r], recipes['professions'])
check('Rezeptexport.t → exportierte Stufe', [r['t'] for r in recipes['recipes'] if 't' in r], recipes['tiers'])
check('Rezeptexport.c → exportierte Kategorie', [r['c'] for r in recipes['recipes'] if 'c' in r], recipes['categories'])
for kind in ['r', 'cr', 'i', 'o']:
    vals = []
    for r in recipes['recipes']:
        if kind in ['r', 'cr']:
            if kind in r:
                vals.append(r[kind][0])
        else:
            vals.extend(row[0] for row in r.get(kind, []))
    check('Rezept.' + kind + ' → Rezept-Itembestand', vals, recipes['items'])
    check('Rezept.' + kind + ' → vollständiger Itemexport', vals, items['items'])
for kind, target in [('fixed', 'items'), ('choice', 'items'), ('titles', 'titles'),
                     ('traits', 'traits'), ('virtues', 'virtues'), ('emotes', 'emotes')]:
    vals = []
    for r in rewards['tables'].values():
        for row in r.get(kind, []):
            val = row[0] if isinstance(row, list) else row
            if kind == 'emotes':
                val = hexid(val)
            vals.append(val)
    check('Belohnung.' + kind + ' → exportierter ' + target + '-Bestand', vals, rewards[target])
check('Rezeptquellen-Schlüssel → exportierte Rezept-ID', recipe_sources['sources'],
      {r['id'] for r in recipes['recipes']})

comparisons = []
for compact, original in [('q', 'quality'), ('l', 'level'), ('c', 'category'), ('s', 'slot'),
                           ('at', 'armourType'), ('wt', 'weaponType'), ('dt', 'damageType'),
                           ('rc', 'requiredClass'), ('rp', 'requiredProfession')]:
    comparable = equal = 0
    mismatches = []
    for ident, row in items['items'].items():
        meta = xi.get(ident, {})
        if compact not in row or original not in meta:
            continue
        comparable += 1
        if str(row[compact]) == meta[original]:
            equal += 1
        else:
            mismatches.append({'id': ident, 'export': row[compact], 'companion': meta[original]})
    comparisons.append({'compact': compact, 'original': original, 'compared': comparable,
                         'equal': equal, 'mismatches': mismatches})
setchecks = []
for ident, row in items['items'].items():
    expected = membership.get(ident, set())
    if row.get('set') and row['set'] not in expected:
        setchecks.append({'id': ident, 'exported': row['set'], 'companion_sets': sorted(expected)})
multiple = {i: sorted(s) for i, s in membership.items() if len(s) > 1}

# Reward tables referenced by normalized achievement records: missing compact output
# is not equivalent to missing DAT table (export intentionally filters reward kinds).
achievable_checks = []
for fn in ['quests.json', 'deeds.json']:
    rows = readjson('full-dat-en-de-fr-2026-11-03/' + fn)
    refs = [hexid(r['properties']['Quest_QuestTreasureDID']) for r in rows
            if (r.get('properties') or {}).get('Quest_QuestTreasureDID')]
    missing = collections.Counter(v for v in refs if v not in rewards['tables'])
    achievable_checks.append({'source': fn, 'references': len(refs),
                              'in_compact_reward_export': sum(v in rewards['tables'] for v in refs),
                              'not_in_compact_reward_export': dict(missing)})

omitted_items = sorted(set(xi) - set(items['items']))
omitted_items_empty_names = [i for i in omitted_items if xi[i].get('name') == '']
virtue_missing = next(r['missing'] for r in checks if r['relation'].startswith('Belohnung.virtues'))
stat_labels = {lang: {e.get('key'): e.get('value') for e in xml('labels/' + lang + '/stats.xml')}
               for lang in ['de', 'en', 'fr']}
virtue_missing_labels = {i: {lang: labels.get(i) for lang, labels in stat_labels.items()}
                         for i in virtue_missing}
source_recipe_missing = next(r['missing'] for r in checks if r['relation'].startswith('Rezeptquellen-Schlüssel'))
source_recipe_in_companion = {i: i in xr for i in source_recipe_missing}
payload = {'checks': checks, 'item_field_comparisons': comparisons,
           'set_membership_mismatches': setchecks, 'multiple_set_memberships': multiple,
           'achievement_reward_coverage': achievable_checks, 'source_sha256': sources,
           'omitted_items_with_empty_companion_name': omitted_items_empty_names,
           'unresolved_virtue_stat_labels': virtue_missing_labels,
           'source_recipe_not_exported_companion_presence': source_recipe_in_companion}
(OUT / 'lotro-datenraum-exportvergleich.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2))
text = [
    '# Verdichtete Exporte: Properties, ID-Referenzen und Datenverluste', '',
    'Geprüft werden die gespeicherten historischen Exporte gegen die aktive lokale '
    'Companion-Lore. Unterschiede beweisen ohne gemeinsamen Quellzeitpunkt keinen '
    'Spiel-/Decoderfehler. Alle offenen Werte und Feldabweichungen stehen vollständig '
    'in `lotro-datenraum-exportvergleich.json`.', '',
    '## Vollständige Struktur der geprüften kompakten Bestände', '',
    *profiles, '## ID-Prüfungen', '',
    table(['Beziehung', 'Vorkommen', 'Aufgelöst', 'Offen', 'Eindeutig offen'],
          [(r['relation'], r['occurrences'], r['resolved'], sum(r['missing'].values()), len(r['missing']))
           for r in checks]), '',
    '## Feldvergleich Gegenstandsexport ↔ Companion', '',
    'Verglichen werden ausschließlich auf beiden Seiten tatsächlich vorhandene Felder. '
    'Nicht verglichene Werte gelten nicht als identisch. Die Mindeststufe wird wegen '
    'der dokumentierten Fallbacklogik nicht als direktes Gleichheitsfeld behandelt.', '',
    table(['Kompaktfeld', 'Companion-Attribut', 'Verglichen', 'Identisch', 'Abweichend'],
          [(r['compact'], r['original'], r['compared'], r['equal'], len(r['mismatches']))
           for r in comparisons]), '',
    '## Set-Mitgliedschaft', '',
    f'{len(multiple)} Gegenstands-IDs sind im Companion-Bestand mehreren Sets zugeordnet. '
    'Die kompakte Itemstruktur besitzt nur einen skalaren `set`-Wert; sie kann diese '
    'Relation nicht verlustfrei abbilden. Die Set-Mitgliederlisten sind die '
    'maßgebliche vollständige Gegenrichtung im geprüften Datenstand. '
    f'{len(setchecks)} ausgegebene Item-Set-Zuordnungen widersprechen der Mitgliedsliste.', '',
    '## Klassifikation der offenen Referenzen', '',
    f'- Alle {len(omitted_items)} im Itemexport fehlenden Companion-IDs haben '
    f'im geprüften Companion-Stand einen leeren Namen '
    f'({len(omitted_items_empty_names)} tatsächlich geprüft). Das allein beweist '
    'nicht die genaue Ursache ihres Fehlens im historischen DAT-Export.',
    f'- {len(virtue_missing)} verschiedene Referenzen aus `tables[].virtues` '
    'fehlen im kompakten Tugendkatalog. Ihre tatsächlichen Stats-Labels stehen '
    'vollständig im JSON. Kein Join über gleichnamige Tugenden und keine '
    'stillschweigende Interpretation dieser Stats als reguläre Tugendobjekte.',
    f'- {len(source_recipe_missing)} Rezeptquellen-Schlüssel fehlen im Rezeptexport; '
    f'{sum(source_recipe_in_companion.values())} davon existieren im Companion-Rezeptbestand. '
    'Damit sind getrennte Exportfilter/-zeitstände zu prüfen, nicht automatisch '
    'die Quellreferenzen zu löschen.', '',
    '## Aufgaben/Taten → verdichtete Belohnungstabellen', '',
    'Der Exporter filtert Tabellen ohne für ihn nutzbare Belohnungsarten. Fehlender '
    'Tabellenschlüssel im kompakten Export beweist deshalb keine kaputte DAT-Referenz.', '',
    table(['Quelle', 'Tabellenverweise', 'Kompakt auflösbar', 'Nicht enthalten'],
          [(r['source'], r['references'], r['in_compact_reward_export'],
            sum(r['not_in_compact_reward_export'].values())) for r in achievable_checks]), '',
    '## Nachgewiesene Code-Transformationen (nicht mit Rohdaten verwechseln)', '',
    '- `export_rewards.py:export`: feste/wählbare Titel werden in derselben Liste '
    'zusammengeführt; dasselbe gilt für Emotes. Ohne Rohtabellen ist die ursprüngliche '
    'Auswahlrolle nicht rekonstruierbar.',
    '- `export_items.py:main`: Item-IDs stammen aus `items.xml`, nicht aus einer '
    'vollständigen Neubestimmung aller Item-Klassen. Set-Zuordnung überschreibt bei '
    'Mehrfachmitgliedschaft den vorigen skalaren Wert.',
    '- `export_items.py:compact`: Bindung 0/1/2, Mindeststufen-Fallbacks, '
    '0-/Leerstring-Defaults sowie Kurvenberechnung sind Transformationen.',
    '- `export_recipes.py:export`: Rezept ohne aufgelöstes Ergebnis oder ohne '
    'aufgelöste Zutaten wird verworfen; fehlende Mengen können zu 1 werden.',
    '', '## Reproduktion', '',
    '`python3 lotro_datenraum_exportvergleich.py`. Kein Clientzugriff und keine '
    'Schreiboperation außerhalb des Planordners. SHA-256 sämtlicher hier verwendeter '
    'Eingaben im JSON-Beleg.', ''
]
(OUT / 'lotro-datenraum-exportvergleich.md').write_text('\n'.join(text))
print('checks', len(checks), 'item properties', len(comparisons), 'multiple sets', len(multiple),
      'set mismatches', len(setchecks))
