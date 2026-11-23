"""Every client list configuration against the data-room entity contract.

The configurations in `web/listen/` are executable data: filter order, columns,
sort keys and paging. The contract in
`docs/datenraum/lotro-datenraum-entitaeten.json` says which filter groups and
row fields an entity may have. This test maps the implementation ids to the
contract vocabulary and reports every unmapped id or unallowed group.

A deliberate new group must be added to the contract (or to a mapping here with
a reason), so a list cannot quietly grow a filter the data room never described.
Server lists are checked by `tests/test_filter_model.py` and the browser runs;
their definitions live in PHP, not in `web/listen/`.
"""
import json
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERTRAG = json.loads((ROOT / 'docs/datenraum/lotro-datenraum-entitaeten.json')
                     .read_text(encoding='utf-8'))['entitaeten']

# Implementation id -> contract group / row field. One entry per list and
# sub-list; every implementation id must appear here.
LISTEN = {
    'gegenstaende': {
        'entitaeten': ['i'],
        'filter': {
            # The category tree carries the client's category, type and slot.
            'tree': 'kategorie', 'eignung': 'eignung', 'level': 'stufe',
            'minLevel': 'mindeststufe', 'source': 'quelle',
            'schaden': 'schaden', 'quality': 'seltenheit',
        },
        'spalten': {'name': 'name', 'mindeststufe': 'mindeststufe'},
    },
    'belohnungen': {
        # A reward is an item, its filter asks for the granting deed as well.
        'entitaeten': ['i', 'd'],
        'filter': {
            'art': 'art', 'geo': 'geografie', 'quality': 'seltenheit',
            'eignung': 'eignung',
        },
        'spalten': {'name': 'name'},
    },
    'aufgaben': {
        'entitaeten': ['q', 'd'],
        'quests': {
            'filter': {'status': 'fortschritt', 'level': 'stufe',
                       'geography': 'geografie', 'flag': 'merkmale'},
            'spalten': {'name': 'name', 'level': 'stufe', 'progress': 'status'},
        },
        'deeds': {
            'filter': {'status': 'fortschritt', 'level': 'stufe',
                       'geography': 'geografie', 'type': 'art', 'reward': 'belohnung'},
            'spalten': {'name': 'name', 'level': 'stufe', 'progress': 'status'},
        },
    },
    'aufgabenfinder': {
        'entitaeten': ['q'],
        'filter': {
            'status': 'fortschritt', 'level': 'stufe', 'geography': 'geografie',
            'topic': 'thema', 'class': 'klasse', 'origin': 'herkunft',
            'flag': 'merkmale',
        },
        'spalten': {'name': 'name', 'level': 'stufe', 'progress': 'status'},
    },
    'handwerk': {
        'entitaeten': ['recipe'],
        'rezepte': {
            'filter': {
                'beruf': 'beruf', 'eigene': 'eigene', 'stufe': 'stufe',
                'ziel': 'kategorie', 'grund': 'kategorie', 'kategorie': 'kategorie',
                'lernstand': 'lernstand',
            },
            'spalten': {'name': 'name', 'beruf': 'beruf', 'tier': 'stufe',
                        'stufe': 'stufe'},
        },
        'rohstoffe': {
            'filter': {
                'beruf': 'beruf', 'eigene': 'eigene', 'stufe': 'stufe',
                'region': 'geografie', 'landschaft': 'geografie',
                'gebiet': 'geografie',
            },
            'spalten': {'name': 'name', 'beruf': 'beruf', 'tier': 'stufe',
                        'fundstellen': 'fundstellen'},
        },
        'berufe': {
            'filter': {'beruf': 'beruf', 'eigene': 'eigene'},
            'spalten': {'name': 'beruf'},
        },
    },
}


def konfigurationen():
    script = r"""
const fs=require('fs'),vm=require('vm');const w={};const ctx={window:w};vm.createContext(ctx);
for (const f of fs.readdirSync('web/listen').sort()) {
  if (f.endsWith('.js')) { vm.runInContext(fs.readFileSync('web/listen/'+f,'utf8'), ctx); }
}
process.stdout.write(JSON.stringify(w.MQL_LISTEN));
"""
    result = subprocess.run([shutil.which('node'), '-e', script], cwd=ROOT,
                            check=True, text=True, capture_output=True)
    return json.loads(result.stdout)


def ids(entries):
    return [entry if isinstance(entry, str) else entry.get('id') for entry in entries or []]


@unittest.skipUnless(shutil.which('node'), 'Node required')
class ListenConfigTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.listen = konfigurationen()

    def test_every_configuration_is_mapped(self):
        self.assertEqual(set(self.listen) - set(LISTEN), set(), 'neue Liste ohne Vertrag')
        self.assertEqual(set(LISTEN) - set(self.listen), set(), 'Vertragseintrag ohne Liste')

    def test_filters_columns_sort_and_paging_follow_the_contract(self):
        findings = []
        for bereich, config in self.listen.items():
            mapping = LISTEN[bereich]
            entitaeten = mapping['entitaeten']
            for entity in entitaeten:
                if entity not in VERTRAG:
                    findings.append('%s: Entität %s fehlt im Vertrag' % (bereich, entity))
            allowed_filter, allowed_rows = set(), set()
            for entity in entitaeten:
                allowed_filter.update(VERTRAG[entity]['filter'])
                allowed_rows.update(VERTRAG[entity]['zeilenfelder'])

            declared = config.get('entitaet')
            if declared and declared not in entitaeten:
                findings.append('%s: entitaet=%s, erwartet %s'
                                % (bereich, declared, '/'.join(entitaeten)))

            # Lists with sub-lists (quests/deeds, recipes/materials/professions)
            # carry the shared definition one level down.
            teile = {key: value for key, value in config.items()
                     if isinstance(value, dict) and 'filter' in value}
            if not teile:
                teile = {bereich: config}
            for teil, definition in teile.items():
                teil_mapping = mapping if teil == bereich else mapping[teil]
                if not isinstance(definition, dict) or 'filter' not in definition:
                    findings.append('%s/%s: keine Definition' % (bereich, teil))
                    continue
                for group in ids(definition.get('filter')):
                    contract_group = teil_mapping['filter'].get(group)
                    if contract_group is None:
                        findings.append('%s/%s: Filter %s ohne Vertragsabbildung'
                                        % (bereich, teil, group))
                    elif contract_group not in allowed_filter:
                        findings.append('%s/%s: Filter %s -> %s ist nicht erlaubt'
                                        % (bereich, teil, group, contract_group))
                spalten = ids(definition.get('spalten'))
                for column in spalten:
                    row_field = teil_mapping['spalten'].get(column)
                    if row_field is None:
                        findings.append('%s/%s: Spalte %s ohne Vertragsabbildung'
                                        % (bereich, teil, column))
                    elif row_field not in allowed_rows:
                        findings.append('%s/%s: Spalte %s -> %s steht nicht in zeilenfelder'
                                        % (bereich, teil, column, row_field))
                sortierung = definition.get('sortierung') or {}
                keys = sortierung.get('erlaubt') or []
                if sortierung.get('standard') not in keys:
                    findings.append('%s/%s: Standardsortierung %s nicht in erlaubt'
                                    % (bereich, teil, sortierung.get('standard')))
                for key in keys:
                    if key not in spalten and key not in definition.get('filter', []):
                        findings.append('%s/%s: Sortierschlüssel %s ohne Spalte' % (bereich, teil, key))
                for key, direction in (sortierung.get('ersteRichtung') or {}).items():
                    if key not in keys:
                        findings.append('%s/%s: Richtung für unbekannten Schlüssel %s'
                                        % (bereich, teil, key))
                    if direction not in ('asc', 'desc'):
                        findings.append('%s/%s: Richtung %s für %s' % (bereich, teil, direction, key))
                blaettern = definition.get('blaettern') or {}
                if blaettern.get('art') not in ('scroll', 'page'):
                    findings.append('%s/%s: Paging-Art %s' % (bereich, teil, blaettern.get('art')))
                if not isinstance(blaettern.get('groesse'), int) or blaettern['groesse'] < 1:
                    findings.append('%s/%s: Paging-Größe fehlt' % (bereich, teil))

        self.assertEqual([], findings, 'Vertragsabweichungen:\n- ' + '\n- '.join(findings))


if __name__ == '__main__':
    unittest.main()
