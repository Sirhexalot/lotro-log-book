"""The quest and deed map views must offer the same landscapes and map tabs."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_gebiete', ROOT / 'tools/build_gebiete.py')
gebiete = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gebiete)


class SharedLandscapeTests(unittest.TestCase):
    def test_union_contains_every_landscape_of_both_catalogues(self):
        for sprache in gebiete.SPRACHEN:
            liste = gebiete.sammle(sprache)
            namen = {(region['name'], gebiet['name']) for region in liste for gebiet in region['gebiete']}
            for art in ('quests', 'taten'):
                daten = json.loads((ROOT / 'daten' / ('%s-%s.json' % (art, sprache))).read_text())
                for eintrag in daten.get('quests', []):
                    labels = eintrag.get('f') or []
                    karten = eintrag.get('fk') or []
                    if len(labels) < 2 or len(karten) < 2 or not karten[1]:
                        continue
                    self.assertIn((labels[0], labels[1]), namen,
                                  '%s fehlt in %s: %s' % (art, sprache, labels[1]))

    def test_number_of_map_tabs_is_the_same_for_breeland(self):
        liste = gebiete.sammle('de')
        breeland = next(gebiet for region in liste for gebiet in region['gebiete']
                        if gebiet['name'] == 'Breeland')
        self.assertEqual(breeland['karte'], 268437653)
        self.assertEqual(len(breeland['unter']), 8)

    def test_ered_mithrin_keeps_every_known_map(self):
        liste = gebiete.sammle('de')
        mithrin = next(gebiet for region in liste for gebiet in region['gebiete']
                       if gebiet['name'] == 'Ered Mithrin')
        # Four tabs: "Ganz Ered Mithrin" plus the three sub-maps both
        # catalogues know (Der Amboss der Winterschmiede, Funkenfeste,
        # Stahlfestung). Before the union one view had a different set.
        namen = {name for _, name in mithrin['unter']}
        self.assertEqual(namen, {'Der Amboss der Winterschmiede', 'Funkenfeste', 'Stahlfestung'})

    def test_generated_files_are_current(self):
        for sprache in gebiete.SPRACHEN:
            ziel = ROOT / 'web' / ('gebiete-%s.js' % sprache)
            self.assertTrue(ziel.is_file(), ziel)
            text = ziel.read_text(encoding='utf-8')
            gespeichert = json.loads(text.split('window.MQL_GEBIETE = ', 1)[1].rstrip().rstrip(';'))
            self.assertEqual(gespeichert['regionen'], gebiete.sammle(sprache),
                             'web/%s ist veraltet: python3 tools/build_gebiete.py' % ziel.name)


if __name__ == '__main__':
    unittest.main()