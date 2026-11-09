"""Reisedaten: exported from the game files, checked against known examples."""
import json
from pathlib import Path
import unittest

DATEN = Path(__file__).resolve().parents[1] / 'daten'
SPRACHEN = ('de', 'en', 'fr')


def lade(sprache):
    return json.loads((DATEN / ('reise-%s.json' % sprache)).read_text(encoding='utf-8'))


class ReiseDatenTest(unittest.TestCase):
    def test_every_language_has_the_same_network(self):
        daten = {sprache: lade(sprache) for sprache in SPRACHEN}
        for sprache, inhalt in daten.items():
            self.assertEqual(inhalt['sprache'], sprache)
            self.assertGreater(len(inhalt['knoten']), 300, sprache)
            self.assertGreater(len(inhalt['strecken']), 4000, sprache)
            self.assertGreater(len(inhalt['skills']), 250, sprache)
        anzahl = {(len(i['knoten']), len(i['strecken']), len(i['skills'])) for i in daten.values()}
        self.assertEqual(len(anzahl), 1)
        knotenmengen = [frozenset(k['id'] for k in i['knoten']) for i in daten.values()]
        self.assertEqual(len(set(knotenmengen)), 1)

    def test_route_ends_exist_and_are_plausible(self):
        for sprache in SPRACHEN:
            inhalt = lade(sprache)
            knoten = {k['id'] for k in inhalt['knoten']}
            for strecke in inhalt['strecken']:
                self.assertIn(strecke['von'], knoten)
                self.assertIn(strecke['nach'], knoten, 'Ziel muss eine Station sein')
                self.assertNotEqual(strecke['von'], strecke['nach'])
                if strecke['kosten'] is not None:
                    self.assertGreaterEqual(strecke['kosten'], 0)
                    self.assertLess(strecke['kosten'], 100000)
                if strecke['stufe'] is not None:
                    self.assertGreater(strecke['stufe'], 0)
                    self.assertLessEqual(strecke['stufe'], 160)

    def test_known_stables_and_prices(self):
        inhalt = lade('de')
        nach_name = {k['n']: k for k in inhalt['knoten']}
        for name in ('Michelbinge', 'Südbree', 'Westbree', 'Udûn-Brückenkopf'):
            self.assertIn(name, nach_name)
        ziele = {(s['von'], s['nach']) for s in inhalt['strecken']}
        michel = nach_name['Michelbinge']['id']
        celondim = nach_name['Celondim']['id']
        bockland = nach_name['Bockland']['id']
        westbree = nach_name['Westbree']['id']
        self.assertIn((michel, bockland), ziele)
        self.assertIn((celondim, westbree), ziele)

    def test_swift_and_slow_are_separate_routes(self):
        inhalt = lade('de')
        udun = next(k for k in inhalt['knoten'] if k['n'] == 'Udûn-Brückenkopf')
        strecken = [s for s in inhalt['strecken'] if s['von'] == udun['id']]
        self.assertTrue(any(s['schnell'] for s in strecken))
        self.assertTrue(any(not s['schnell'] for s in strecken))
        schnell = next(s for s in strecken if s['schnell'])
        langsam = next(s for s in strecken if not s['schnell'])
        self.assertGreater(schnell['kosten'], langsam['kosten'])

    def test_names_are_translated(self):
        de, en, fr = lade('de'), lade('en'), lade('fr')
        ids = {k['id']: k['n'] for k in de['knoten']}
        englisch = {k['id']: k['n'] for k in en['knoten']}
        franzoesisch = {k['id']: k['n'] for k in fr['knoten']}
        self.assertGreater(len([i for i in ids if ids[i] != englisch[i]]), 100)
        self.assertGreater(len([i for i in ids if ids[i] != franzoesisch[i]]), 100)
        self.assertTrue(any(ids[i] == 'Michelbinge' and englisch[i] == 'Michel Delving' for i in ids))

    def test_travel_skills_cover_classes_and_kinds(self):
        inhalt = lade('de')
        arten = {s['art'] for s in inhalt['skills']}
        self.assertLessEqual({'guide', 'muster', 'return'}, arten)
        namen = {s['n'] for s in inhalt['skills']}
        self.assertIn('Führer nach Bree', namen)
        # Warden ports are called "Appell" in the German client.
        self.assertTrue(any('Appell' in n for n in namen), 'Wächter-Ports fehlen')

    def test_the_network_connects_distant_regions(self):
        """A route the player would actually ask for: Shire to Mordor."""
        inhalt = lade('de')
        nach_name = {k['n']: k['id'] for k in inhalt['knoten']}
        kanten = {}
        for strecke in inhalt['strecken']:
            kanten.setdefault(strecke['von'], []).append(strecke['nach'])

        def weg(von, nach, grenze=12):
            gesehen = {von: None}
            rand = [von]
            for _ in range(grenze):
                naechste = []
                for knoten in rand:
                    for ziel in kanten.get(knoten, []):
                        if ziel in gesehen:
                            continue
                        gesehen[ziel] = knoten
                        if ziel == nach:
                            schritte, lauf = 0, ziel
                            while gesehen[lauf] is not None:
                                schritte += 1
                                lauf = gesehen[lauf]
                            return schritte
                        naechste.append(ziel)
                rand = naechste
            return None

        self.assertIsNotNone(weg(nach_name['Michelbinge'], nach_name['Udûn-Brückenkopf']))
        self.assertIsNotNone(weg(nach_name['Celondim'], nach_name['Edoras']))

        # The game's network really has separate clusters: King's Gondor, boats and
        # a few instance-locked stables do not connect to the mainland. The planner
        # says so instead of inventing a route, so the test only guards the main net.
        alle = {k['id'] for k in inhalt['knoten']}
        erreicht, rand = {nach_name['Südbree']}, [nach_name['Südbree']]
        while rand:
            neu = [z for k in rand for z in kanten.get(k, []) if z not in erreicht]
            erreicht.update(neu)
            rand = neu
        self.assertGreater(len(erreicht), 300)
        self.assertGreater(len((alle - erreicht)), 20, 'Cluster sollten bestehen bleiben, nicht verschwinden')

    def test_class_ports_point_at_real_stations(self):
        inhalt = lade('de')
        knoten = {k['id'] for k in inhalt['knoten']}
        ports = [s for s in inhalt['skills'] if s['art'] in ('guide', 'muster') and s.get('knoten')]
        self.assertGreater(len(ports), 20)
        for port in ports:
            self.assertIn(port['knoten'], knoten)


if __name__ == '__main__':
    unittest.main()
