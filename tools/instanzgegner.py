"""Join localized enemy names, enemy groups and boss chests to encounters.

The client has no boss flag. What it does have is a chest marker placed on the
boss's position; 86 of those even carry the boss name ("Dolguzigir's Chest").
Bosses are therefore only named where a chest proves the position, never by
guessing from a name or a species.
"""
from __future__ import annotations

import json
import math
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

if __package__:
    from .build_instanz_beute import block_referenzen
else:
    from build_instanz_beute import block_referenzen

LORE = Path.home() / 'Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore'
QUESTS = (Path.home() / 'Documents/07_Hobbys/Lotro/Companion-Test/source-exporter'
          / 'full-dat-en-de-fr-2026-11-03/raw.jsonl')
# A chest and the enemy that drops it share one position in the map data.
BOSS_DISTANZ = 0.05
SPRACHEN = ('de', 'en', 'fr')


def kampfziele(value):
    if isinstance(value, list):
        for child in value:
            yield from kampfziele(child)
    elif isinstance(value, dict):
        if value.get('QuestEvent_ID') == 22 and not value.get('QuestEvent_RoleConstraint'):
            did = value.get('QuestEvent_MonsterDID')
            if isinstance(did, int) and did:
                yield str(did & 0xffffffff)
        for child in value.values():
            yield from kampfziele(child)


def eindeutige_dungeons(bloecke, landblocks):
    je_instanz = {ident: {landblocks[block] for block in blocks if block in landblocks}
                  for ident, blocks in bloecke.items()}
    besitzer = defaultdict(set)
    for ident, dungeons in je_instanz.items():
        for dungeon in dungeons:
            besitzer[dungeon].add(ident)
    return {dungeon: ident for dungeon, owners in besitzer.items()
            if len(owners) == 1 for ident in owners if je_instanz[ident] == {dungeon}}


def _position(marker):
    try:
        return float(marker.get('longitude')), float(marker.get('latitude'))
    except (TypeError, ValueError):
        return None


def marker_daten(instanzen, roh: Path, lore: Path = LORE):
    """Enemy and chest markers per instance, joined over unique dungeon blocks."""
    feinde = defaultdict(list)
    kisten = defaultdict(list)
    land = lore / 'landblocks.xml'
    if not (roh.is_file() and land.is_file()):
        return feinde, kisten
    landblocks = {(x.get('region'), int(x.get('blockX')), int(x.get('blockY'))): x.get('dungeonId')
                  for x in ET.parse(land).getroot() if x.get('dungeonId') not in (None, '0')}
    dungeon_instanz = eindeutige_dungeons(block_referenzen(roh, set(instanzen)), landblocks)
    zone = re.compile(r'\bparentZoneId="(\d+)"')
    for datei in (lore / 'maps' / 'markers').glob('markers-*.xml'):
        with datei.open(encoding='utf-8') as stream:
            for line in stream:
                zeile = line.lstrip()
                if not zeile.startswith('<marker '):
                    continue
                if 'category="71"' in line:
                    art = 'gegner'
                elif 'category="72"' in line:
                    art = 'truhe'
                else:
                    continue
                match = zone.search(line)
                ident = dungeon_instanz.get(match[1]) if match else None
                if not ident:
                    continue
                marker = ET.fromstring(zeile.strip())
                position = _position(marker)
                if position is None:
                    continue
                if art == 'truhe':
                    kisten[ident].append((marker.get('label') or '', position))
                elif marker.get('did'):
                    feinde[ident].append((marker.get('did'), position))
    return feinde, kisten


def boss_dids(feinde, kisten, namen):
    """Chest position plus one matching enemy is the only boss evidence we accept."""
    je_instanz = defaultdict(list)
    for ident, rows in feinde.items():
        for did, position in rows:
            name = namen.get(did)
            if name:
                je_instanz[ident].append((did, position, name))
    platzierung = Counter((ident, name) for ident, rows in je_instanz.items()
                          for _, _, name in rows)
    name_instanz = defaultdict(set)
    for ident, rows in je_instanz.items():
        for _, _, name in rows:
            name_instanz[name].add(ident)
    ergebnis = {}
    for ident, truhen in kisten.items():
        gefunden = set()
        for label, position in truhen:
            nah = [(did, name) for did, pos, name in je_instanz.get(ident, [])
                   if math.dist(position, pos) < BOSS_DISTANZ]
            if not nah:
                continue
            kandidaten = sorted({name for _, name in nah})
            ziel = None
            match = re.match(r"^(.*?)'s ", label)
            if match:
                # "Dolguzigir's Chest" names its boss; no further proof needed.
                treffer = [name for name in kandidaten
                           if name.casefold().startswith(match[1].casefold())]
                if len(treffer) == 1:
                    ziel = treffer[0]
            if ziel is None:
                # Otherwise only an enemy placed once in this instance and in no
                # other one is distinctive enough; anything else stays unknown.
                einzeln = [name for name in kandidaten
                           if platzierung[(ident, name)] == 1 and len(name_instanz[name]) == 1]
                if len(einzeln) == 1:
                    ziel = einzeln[0]
            if ziel is not None:
                gefunden.add(next(did for did, name in nah if name == ziel))
        if gefunden:
            ergebnis[ident] = sorted(gefunden)
    return ergebnis


def _labels(datei: Path, schluessel):
    werte = {}
    if not datei.is_file() or not schluessel:
        return werte
    for _, row in ET.iterparse(datei, events=('end',)):
        if row.tag == 'label' and row.get('key') in schluessel and row.get('value'):
            werte[row.get('key')] = row.get('value').strip()
        row.clear()
    return werte


def _enum(datei: Path):
    return {entry.get('code'): entry.get('name')
            for entry in ET.parse(datei).getroot()} if datei.is_file() else {}


def _enum_namen(lore: Path, lang: str, name: str):
    """Enum code to localized label, reading each label file once."""
    codes = _enum(lore / 'enums' / (name + '.xml'))
    labels = _labels(lore / 'labels' / lang / ('enum-%s.xml' % name), set(codes.values()))
    return {code: labels.get(key) or key for code, key in codes.items()}


def _quest_ziele(instanzen, quests: Path):
    """Direct combat targets of quests that belong to exactly one encounter."""
    quest_instanz = defaultdict(set)
    for ident, row in instanzen.items():
        for qid in set(row.get('quests') or ([row['quest']] if row.get('quest') else [])):
            quest_instanz[qid].add(ident)
    ziele = defaultdict(set)
    # A quest reused by several encounters does not prove where its target is.
    if not (quests.is_file() and quest_instanz):
        return ziele
    quer = re.compile(r'^\s*\{\s*"id"\s*:\s*"([0-9A-F]{8})"')
    with quests.open(encoding='utf-8') as stream:
        for line in stream:
            match = quer.match(line)
            if not match or len(owners := quest_instanz.get(match[1], ())) != 1:
                continue
            row = json.loads(line)
            for objective in row['properties'].get('Quest_ObjectiveArray') or []:
                ziele[next(iter(owners))].update(
                    kampfziele(objective.get('Quest_CompletionConditionArray') or []))
    return ziele


def _gruppen(dids, mobs, genus_namen, species_namen, namen):
    """Group one instance's enemies by genus and species, counting unique names."""
    gruppen = defaultdict(lambda: defaultdict(set))
    for did in dids:
        name = namen.get(did)
        if not name:
            continue
        eintrag = mobs.get(did) or {}
        gattung = genus_namen.get(eintrag.get('genus')) or ''
        art = species_namen.get(eintrag.get('species')) or ''
        gruppen[gattung][art].add(name)
    ergebnis = []
    for gattung in sorted(gruppen, key=lambda key: (-sum(len(v) for v in gruppen[key].values()),
                                                    key.casefold())):
        arten = [{'art': art, 'namen': sorted(gruppen[gattung][art], key=str.casefold)}
                 for art in sorted(gruppen[gattung],
                                   key=lambda key: (-len(gruppen[gattung][key]), key.casefold()))]
        ergebnis.append({'gattung': gattung, 'arten': arten})
    return ergebnis


def instanzdaten(instanzen, roh: Path, lore: Path = LORE, quests: Path = QUESTS):
    """Enemies, their genus/species groups and proven bosses, per language."""
    feinde, kisten = marker_daten(instanzen, roh, lore)
    for ident, dids in _quest_ziele(instanzen, quests).items():
        bekannt = {did for did, _ in feinde[ident]}
        feinde[ident].extend((did, None) for did in dids if did not in bekannt)

    mobs_datei = lore / 'mobs.xml'
    mobs = ({mob.get('id'): mob.attrib for mob in ET.parse(mobs_datei).getroot()}
            if mobs_datei.is_file() else {})

    namen = {lang: _labels(lore / 'labels' / lang / 'mobs.xml',
                           {did for rows in feinde.values() for did, _ in rows})
             for lang in SPRACHEN}
    namen_en = namen['en']
    boss_ids = boss_dids({ident: [(did, pos) for did, pos in rows if pos is not None]
                          for ident, rows in feinde.items()}, kisten, namen_en)

    ergebnis = {'gegner': {}, 'gruppen': {}, 'bosse': {}}
    for lang in SPRACHEN:
        genus_namen = _enum_namen(lore, lang, 'Genus')
        species_namen = _enum_namen(lore, lang, 'Species')
        je_sprache = namen[lang]
        ergebnis['gegner'][lang] = {
            ident: sorted({je_sprache[did] for did, _ in rows if je_sprache.get(did)},
                          key=str.casefold)
            for ident, rows in feinde.items()}
        ergebnis['gruppen'][lang] = {
            ident: _gruppen({did for did, _ in rows}, mobs, genus_namen, species_namen, je_sprache)
            for ident, rows in feinde.items()}
        ergebnis['bosse'][lang] = {
            ident: list(dict.fromkeys(je_sprache[did] for did in dids if je_sprache.get(did)))
            for ident, dids in boss_ids.items()}
    return ergebnis


def instanzgegner(instanzen, roh: Path, lore: Path = LORE, quests: Path = QUESTS):
    """Localized enemy names only; kept for callers that need nothing else."""
    return instanzdaten(instanzen, roh, lore, quests)['gegner']
