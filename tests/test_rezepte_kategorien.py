#!/usr/bin/env python3
"""Recipe categories: the bucket → base type → category tree of the filter.

The client knows 513 flat recipe categories ("Light Armour (Level 40)",
"Light Armour (Guild)", …). `tools/rezeptkategorien.py` groups them; this test
guards the decisions that are easy to break:

* every category the built data uses has a bucket, a base key and a label;
* a base key means one bucket and one label in each language;
* the leaf labels inside one base type stay distinguishable;
* every bucket carries a name in DE, EN and FR.

It reads the built `web/rezepte-<sprache>.js`, so run `build_rezepte.py` first.
"""
import collections
import json
import sys
import unittest
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HIER))
from tools.rezeptkategorien import (BUENDEL, REST, SPRACHEN, baum, basis,  # noqa: E402
                                    buendel, kennung, teile, unbekannt)


def lies(sprache):
    datei = HIER / 'web' / ('rezepte-%s.js' % sprache)
    if not datei.is_file():
        raise unittest.SkipTest('%s fehlt – build_rezepte.py zuerst' % datei.name)
    text = datei.read_text(encoding='utf-8')
    return json.loads(text.split('=', 1)[1].strip().rstrip(';'))


class TeileTest(unittest.TestCase):
    def test_qualifier_and_base_type(self):
        self.assertEqual(teile('Leichte Rüstung (Stufe 40)'), ('Leichte Rüstung', 'Stufe 40'))
        self.assertEqual(teile('Leichte Rüstung - (Stufe 50)'), ('Leichte Rüstung', 'Stufe 50'))
        self.assertEqual(teile('Legendäres Zaumzeug - Stufe 100'), ('Legendäres Zaumzeug', 'Stufe 100'))
        self.assertEqual(teile('Heavy Armour (item level 323 / crit 326)'),
                         ('Heavy Armour', 'item level 323 / crit 326'))
        self.assertEqual(teile('Melee Weapons(item level 388 / crit 392)'),
                         ('Melee Weapons', 'item level 388 / crit 392'))
        self.assertEqual(teile('Bearbeiten'), ('Bearbeiten', ''))

    def test_entities_are_decoded(self):
        self.assertEqual(teile('Crafted Traceries &amp; Relics'),
                         ('Crafted Traceries & Relics', ''))

    def test_unknown_base_type_is_reported(self):
        self.assertEqual(unbekannt(['Light Armour', 'A Brand New Thing']),
                         ['A Brand New Thing'])
        self.assertEqual(buendel('A Brand New Thing'), REST)

    def test_keys_stay_url_safe(self):
        self.assertEqual(kennung('Leichte Rüstung'), 'leichte-ruestung')
        self.assertEqual(kennung('Madáshi Leichte Rüstung'), 'madashi-leichte-ruestung')
        self.assertEqual(kennung('Crafted Traceries & Relics'), 'crafted-traceries-relics')


class GebauteDatenTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.daten = {sprache: lies(sprache) for sprache in SPRACHEN}

    def test_every_used_category_has_a_tree_entry(self):
        for sprache, daten in self.daten.items():
            karte = daten.get('k') or {}
            self.assertTrue(karte, '%s: k fehlt' % sprache)
            for zeile in daten['r']:
                name = zeile[5]
                self.assertIn(name, karte, '%s: Kategorie ohne Eintrag: %s' % (sprache, name))
                eintrag = karte[name]
                self.assertEqual(len(eintrag), 4, '%s: %s' % (sprache, name))
                self.assertTrue(eintrag[0], '%s: %s ohne Bereich' % (sprache, name))
                self.assertTrue(eintrag[1], '%s: %s ohne Grundart' % (sprache, name))
                self.assertTrue(eintrag[2], '%s: %s ohne Beschriftung' % (sprache, name))

    def test_base_key_means_one_bucket_and_one_label(self):
        for sprache, daten in self.daten.items():
            pro_grund = collections.defaultdict(set)
            for bereich, grund, label, _blatt in daten['k'].values():
                pro_grund[grund].add((bereich, label))
            for grund, werte in pro_grund.items():
                self.assertEqual(len(werte), 1,
                                 '%s: Grundart %s ist nicht eindeutig: %s' % (sprache, grund, werte))

    def test_leaf_labels_are_distinguishable(self):
        for sprache, daten in self.daten.items():
            pro_grund = collections.defaultdict(list)
            for name, (bereich, grund, _label, blatt) in daten['k'].items():
                pro_grund[grund].append(blatt or name)
            for grund, blaetter in pro_grund.items():
                doppelt = [b for b, n in collections.Counter(blaetter).items() if n > 1]
                self.assertEqual(doppelt, [], '%s: %s doppelt: %s' % (sprache, grund, doppelt))

    def test_every_bucket_has_three_names_and_an_order(self):
        reihenfolge = [schluessel for schluessel, _namen, _basen in BUENDEL]
        for sprache, daten in self.daten.items():
            liste = daten.get('b') or []
            self.assertEqual([eintrag[0] for eintrag in liste], reihenfolge,
                             '%s: Bereichsreihenfolge weicht ab' % sprache)
            for schluessel, label in liste:
                self.assertTrue(label, '%s: Bereich %s ohne Namen' % (sprache, schluessel))
            benutzt = {eintrag[0] for eintrag in daten['k'].values()}
            self.assertTrue(benutzt <= set(reihenfolge))

    def test_tree_is_the_same_in_every_language(self):
        grundarten = {sprache: {eintrag[1] for eintrag in daten['k'].values()}
                      for sprache, daten in self.daten.items()}
        self.assertEqual(grundarten['de'], grundarten['en'])
        self.assertEqual(grundarten['de'], grundarten['fr'])

    def test_baum_builds_the_same_keys_from_the_export(self):
        # The generated file and the module must agree: a rebuild cannot
        # silently produce another tree than the one that was tested.
        quelle = Path('/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test'
                      '/source-exporter/rezepte-2026-11-06/recipes.json')
        if not quelle.is_file():
            self.skipTest('Rezeptexport fehlt')
        roh = json.loads(quelle.read_text(encoding='utf-8'))
        kategorien = roh.get('categories') or {}
        # A client update that adds a base type must not land in the remainder
        # without anyone noticing.
        self.assertEqual(unbekannt(basis(eintrag.get('en') or '')
                                   for eintrag in kategorien.values()), [])
        for sprache, daten in self.daten.items():
            _buendel, eintraege, _hinweise = baum(kategorien, sprache)
            for name, eintrag in daten['k'].items():
                self.assertEqual(eintraege.get(name), eintrag, '%s: %s' % (sprache, name))


if __name__ == '__main__':
    unittest.main()
