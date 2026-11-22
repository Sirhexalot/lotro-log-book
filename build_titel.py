#!/usr/bin/env python3
"""Titles and virtues with stable IDs for the catalogue pages.

Titles come from two sources that are joined by ID:

* the reward index (`web/belohnungen-<sprache>.js`) names the titles that a
  quest or a deed awards, and the reward export supplies their IDs;
* the client's `titles.xml` and its label files supply every title with its
  German, English and French name and its client category.

The reward export still carries the client's template for 1 988 titles
(`${RANK}${NAME}${SURNAME}, …`), because the game fills rank, name and gender at
runtime. The template is rendered the same way the reward index did.

A title that is only in the client (crafting, event, kinship, hobby …) has no
quest or deed as its source today. It still gets a page: the name in three
languages and the kind are proven, and the missing source section simply stays
away. Titles whose displayed name needs the character's surname (pedigree
titles such as "Vater / Mutter von …"), internal admin titles and test
placeholders are left out.

Two titles may share one displayed name (several kinship ranks, both sides of a
PvMP title). They become one page, because a player looks the title up by its
name; the sources and kinds of all of them are kept.

    python3 build_titel.py            # writes daten/titel.json, daten/tugenden.json
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from html import unescape
from pathlib import Path

import unicodedata

sys.path.insert(0, str(Path(__file__).resolve().parent / 'tools'))
from itemnamen import sauberer_name  # noqa: E402
from titelarten import kind_key  # noqa: E402

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
DATEN = HIER / 'daten'
SPRACHEN = ('de', 'en', 'fr')
EXPORT = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
              '/rewards-2026-11-06/rewards.json')
# The client data of the installed Companion: the same export the item search
# reads for the enum labels.
CLIENT_LORE = Path('/Users/adrian/Applications/LOTRO-Companion-Test/LotRO Companion'
                   '/app/data/lore')
# The pages that already exist. Their IDs stay, so old addresses and search
# entries keep working; new titles join them or bring their own ID.
ID_LISTE = HIER / 'referenz' / 'titel-ids.json'

TAG = re.compile(r'\[[A-Za-z]{1,4}\]')
# Test entries of the client, not titles a player can wear.
AUSGESCHLOSSEN = {'TBD', 'JUBILÄUMS-TITEL', '--'}


def tugendname(text):
    # The client wraps long labels with an encoded line break.
    text = re.sub(r'(?<=\w)-[ \t]*\r?\n[ \t]*(?=\w)', '', unescape(text))
    return ' '.join(text.split())


def js_datei(pfad, variable):
    text = Path(pfad).read_text(encoding='utf-8')
    treffer = re.search(r'window\.' + re.escape(variable) + r'\s*=\s*', text)
    if not treffer:
        raise SystemExit('MISSING %s in %s' % (variable, pfad))
    return json.JSONDecoder().raw_decode(text[treffer.end():])[0]


def aus_vorlage(text):
    """Render the client's title into the form the reward index shows.

    Two shapes arrive from the export: a template
    (`${RANK}${NAME}${SURNAME}, ${NAME:der[m]|die[f]} Verlockende`) and, when no
    gendered choice was involved, the same text with the placeholders already
    spelled out (`RANK NAME SURNAME the Alluring`). Both are reduced to what the
    player sees: the epithet, with both gendered forms kept.
    """
    text = text or ''
    text = re.sub(r'^\$\{RANK\}.*?,\s*', '', text)       # template with rank
    text = re.sub(r'^RANK NAME SURNAME[,;]?\s*', '', text)  # already spelled out
    text = re.sub(r'\$\{NAME:([^}|]+)\|([^}]+)\}', lambda m: '%s / %s' % (m.group(1), m.group(2)), text)
    text = re.sub(r'\$\{NAME:([^}]+)\}', lambda m: m.group(1), text)
    text = re.sub(r'\$\{[^}]*\}', '', text)
    return TAG.sub('', text).strip()


def titelname(text, sprache):
    """A displayed title without export markup or client leftovers.

    The client labels carry the same `\\q` quote marker as item names, plus a few
    broken brackets, a leading dash and repeated gender halves. Quotes follow the
    language's typography; nothing is reworded.
    """
    name = sauberer_name(text, sprache)
    name = re.sub(r'\](?=\s|$| /)', '', name)
    name = name.lstrip('-\u2013\u2014 ').strip()
    halb = [teil.strip() for teil in name.split(' / ')]
    if len(halb) == 2 and halb[0] and halb[0] == halb[1]:
        name = halb[0]
    elif len(halb) == 2 and halb[0] and halb[1].startswith(halb[0] + ' '):
        # "thane / thane d'Hytbold": the label repeats the surname part once.
        name = halb[1]
    return re.sub(r'\s{2,}', ' ', name).strip()


def norm(name):
    """Matching key: case, quotes and spaces must not hide the same title."""
    text = unicodedata.normalize('NFKC', str(name or '')).casefold()
    text = re.sub(r'[\u201e\u201c\u201d\u00ab\u00bb"\'\u2018\u2019\u201a`]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def hex_id(value):
    text = str(value or '').strip()
    if not text:
        return ''
    return text.upper() if re.fullmatch(r'[0-9A-Fa-f]{8}', text) else '%08X' % int(text)


def client_titles():
    """Every title of the client: ID -> names per language and kind key.

    The names come from the localised label files, not from the raw English
    `name` attribute of `titles.xml`; only the category is English by design.
    """
    quelle = CLIENT_LORE / 'titles.xml'
    if not quelle.is_file():
        print('WARNUNG: %s fehlt – Titel nur aus dem Belohnungsexport' % quelle)
        return {}
    labels = {}
    for sprache in SPRACHEN:
        datei = CLIENT_LORE / 'labels' / sprache / 'titles.xml'
        labels[sprache] = (
            {row.get('key'): row.get('value')
             for row in ET.parse(datei).getroot().iter('label')}
            if datei.is_file() else {})
    titel = {}
    for row in ET.parse(quelle).getroot():
        ident = hex_id(row.get('id'))
        if not ident:
            continue
        namen = {}
        for sprache in SPRACHEN:
            name = titelname(labels[sprache].get(row.get('id')) or '', sprache)
            if name:
                namen[sprache] = name
        if not namen:
            continue
        titel[ident] = {'n': namen, 'k': kind_key(row.get('category') or '')}
    return titel


def name_key(eintrag):
    """The displayed name of a title, used to merge equal names."""
    namen = eintrag.get('n') or {}
    return (namen.get('de') or namen.get('en') or namen.get('fr') or '').strip().lower()


def brauchbar(eintrag):
    name = (eintrag.get('n') or {}).get('de') or (eintrag.get('n') or {}).get('en') or ''
    name = name.strip()
    if not name or name.upper() in AUSGESCHLOSSEN or '${' in name:
        return False
    # Without a label the kind is either internal (Admin) or needs the
    # character's surname (Pedigree); neither belongs in the catalogue.
    return bool(eintrag.get('k'))


def quelle_anhaengen(eintrag, sprache, quellen):
    liste = eintrag['q'].setdefault(sprache, [])
    for quelle in quellen:
        wert = [quelle[0], quelle[1], quelle[2], quelle[3] or '', quelle[4] or '', quelle[5] or '']
        if wert not in liste:
            liste.append(wert)


def geschuetzte_ids():
    """IDs of pages that already exist; written after each build."""
    if not ID_LISTE.is_file():
        return set()
    try:
        daten = json.loads(ID_LISTE.read_text(encoding='utf-8'))
    except ValueError:
        return set()
    return {str(ident).upper() for ident in daten.get('ids') or []}


def baue_titel():
    """Every client title, with the award sources of the reward index.

    The build is derived from its sources only: the client's title export and
    label files, the reward export and the reward index. Equal displayed names
    become one page; the page ID follows the ID that the reward export already
    named, otherwise the smallest ID of the group.
    """
    client = client_titles()

    # Rendered reward names per ID and language, for the join with the index.
    rohdaten = json.loads(EXPORT.read_text(encoding='utf-8'))['titles'] if EXPORT.is_file() else {}
    gerendert = {}
    for ident, eintrag in rohdaten.items():
        ident = hex_id(ident)
        if not ident:
            continue
        for sprache in SPRACHEN:
            name = titelname(aus_vorlage((eintrag.get('n') or {}).get(sprache, '')), sprache)
            if name:
                gerendert.setdefault(ident, {}).setdefault(sprache, name)

    eintraege = {}
    for ident, eintrag in client.items():
        eintraege[ident] = {'n': dict(eintrag['n']),
                            'q': {}, 'k': [eintrag['k']] if eintrag['k'] else []}

    # name -> IDs, in both spellings (client label and rendered reward name).
    namen = {}
    for ident in eintraege:
        for sprache, name in eintraege[ident]['n'].items():
            namen.setdefault((sprache, norm(name)), set()).add(ident)
        for sprache, name in (gerendert.get(ident) or {}).items():
            namen.setdefault((sprache, norm(name)), set()).add(ident)

    statistik = {'quellen': 0, 'ohne_treffer': 0}
    for sprache in SPRACHEN:
        for zeile in js_datei(WEB / ('belohnungen-%s.js' % sprache), 'MQL_BELOHNUNGEN')['t']:
            ident = zeile[0] if len(zeile) == 3 else ''
            name, quellen = zeile[-2], (zeile[-1] if isinstance(zeile[-1], list) else [])
            if ident in eintraege:
                kandidaten = [ident]
            else:
                kandidaten = sorted(namen.get((sprache, norm(name)), set()))
            if not kandidaten:
                statistik['ohne_treffer'] += 1
                continue
            statistik['quellen'] += 1
            for ziel in kandidaten:
                quelle_anhaengen(eintraege[ziel], sprache, quellen)
                if name and norm(name) != norm(eintraege[ziel]['n'].get(sprache) or ''):
                    alias = eintraege[ziel].setdefault('a', {}).setdefault(sprache, [])
                    if name not in alias:
                        alias.append(name)

    # Merge equal displayed names: one page per name a player can look up.
    # A page that already exists keeps its ID and is never merged away.
    geschuetzt = geschuetzte_ids()
    gruppen = {}
    for ident, eintrag in eintraege.items():
        if brauchbar(eintrag) or ident in geschuetzt:
            gruppen.setdefault(name_key(eintrag), []).append(ident)

    def zusammenfuehren(ziel, weitere):
        eintrag = eintraege[ziel]
        for sprache, liste in eintraege[weitere]['q'].items():
            quelle_anhaengen(eintrag, sprache, liste)
        for art in eintraege[weitere]['k']:
            if art not in eintrag.setdefault('k', []):
                eintrag['k'].append(art)
        for sprache, liste in (eintraege[weitere].get('a') or {}).items():
            alias = eintrag.setdefault('a', {}).setdefault(sprache, [])
            alias.extend(name for name in liste if name not in alias)

    gesamt = {}
    zusammengefuehrt = 0
    for ids in gruppen.values():
        ids.sort()
        bestehend = [k for k in ids if k in geschuetzt]
        if len(bestehend) > 1:
            # Two pages already share this name. Both keep their own sources;
            # only new titles join one of them.
            ziel = max(bestehend, key=lambda k: (len(eintraege[k]['q']), -int(k, 16)))
            for weitere in ids:
                if weitere in geschuetzt:
                    continue
                zusammenfuehren(ziel, weitere)
                zusammengefuehrt += 1
                del eintraege[weitere]
            for k in bestehend:
                gesamt[k] = eintraege[k]
            continue
        if bestehend:
            ziel = bestehend[0]
        else:
            im_export = [k for k in ids if gerendert.get(k)]
            ziel = im_export[0] if im_export else ids[0]
        for weitere in ids:
            if weitere != ziel:
                zusammenfuehren(ziel, weitere)
                zusammengefuehrt += 1
                del eintraege[weitere]
        gesamt[ziel] = eintraege[ziel]

    verworfen = sum(1 for ident in eintraege if not brauchbar(eintraege[ident]))
    ID_LISTE.parent.mkdir(parents=True, exist_ok=True)
    ID_LISTE.write_text(json.dumps({'ids': sorted(gesamt)}, indent=0) + '\n', encoding='utf-8')
    print('Titel: %d Seiten (neu %d, zusammengeführt %d, verworfen %d, '
          'Quellenzeilen %d, ohne Treffer %d)'
          % (len(gesamt), len(gesamt) - min(len(gesamt), 2500), zusammengefuehrt,
             verworfen, statistik['quellen'], statistik['ohne_treffer']))
    return gesamt


def baue(art):
    """art: 't' titles, 'v' virtues. Returns id -> {n, q}."""
    if art == 't':
        return baue_titel()
    schluessel = 'virtues'
    rohdaten = json.loads(EXPORT.read_text(encoding='utf-8'))[schluessel]
    ids = {}
    for ident, eintrag in rohdaten.items():
        for sprache in SPRACHEN:
            name = tugendname(eintrag['n'].get(sprache, ''))
            if name:
                ids.setdefault(sprache, {}).setdefault(name, []).append(ident)

    gesammelt = {}
    statistik = {'gefunden': 0, 'mehrdeutig': 0, 'ohne_id': 0}
    for sprache in SPRACHEN:
        eintraege = js_datei(WEB / ('belohnungen-%s.js' % sprache), 'MQL_BELOHNUNGEN')[art]
        for zeile in eintraege:
            ident = zeile[0] if len(zeile) == 3 else ''
            name, quellen = zeile[-2:]
            name = tugendname(name)
            kandidaten = [ident] if ident in rohdaten else ids.get(sprache, {}).get(name, [])
            if not kandidaten:
                statistik['ohne_id'] += 1
                continue
            if len(kandidaten) > 1:
                statistik['mehrdeutig'] += 1
                continue
            statistik['gefunden'] += 1
            eintrag = gesammelt.setdefault(kandidaten[0], {'n': {}, 'q': {}})
            eintrag['n'][sprache] = name
            # Sources are localized too: keep one list per language.
            liste = eintrag['q'].setdefault(sprache, [])
            for quelle in quellen:
                wert = [quelle[0], quelle[1], quelle[2], quelle[3] or '', quelle[4] or '', quelle[5] or '']
                if wert not in liste:
                    liste.append(wert)
    for ident, eintrag in gesammelt.items():
        # A virtue can have a client name even if no quest in that
        # language supplies the link to it.
        for sprache, name in rohdaten[ident]['n'].items():
            if sprache in SPRACHEN and name:
                eintrag['n'][sprache] = tugendname(name)
    return gesammelt, statistik


def main():
    titel = baue('t')
    (DATEN / 'titel.json').write_text(json.dumps({'schema': 1, 'eintraege': titel},
                                                ensure_ascii=False, separators=(',', ':')),
                                      encoding='utf-8')
    tugenden, statistik = baue('v')
    (DATEN / 'tugenden.json').write_text(json.dumps({'schema': 1, 'eintraege': tugenden},
                                                   ensure_ascii=False, separators=(',', ':')),
                                         encoding='utf-8')
    print('tugenden.json: %d Einträge (neu %d, mehrdeutig %d, ohne ID %d)'
          % (len(tugenden), statistik['gefunden'], statistik['mehrdeutig'], statistik['ohne_id']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
