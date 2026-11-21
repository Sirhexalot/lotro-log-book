"""Unnamed game maps get DAT area names and reviewed display paths."""
import unittest
from unittest.mock import patch

import build_daten
from tools import gebietssicht


ALIASES = {
    268450268: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268450269: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268450270: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268450272: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268450273: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268450274: ("Helm's Deep", "Helms Klamm", "Helm's Deep", "Gouffre de Helm"),
    268453919: ("The Glittering Caves", "Glitzernde Grotten",
                "The Glittering Caves", "Les Cavernes Etincelantes"),
    268451976: ("Battle of the Morannon", "Die Schlacht am Morannon",
                "Battle of the Morannon", "La bataille du Morannon"),
    268451156: ("Minas Tirith Besieged", "Minas Tirith belagert",
                "Minas Tirith Besieged", "Minas Tirith assiégée"),
    268451023: ("Osgiliath", "Osgiliath", "Osgiliath", "Osgiliath"),
    268451074: ("The Sundering of Osgiliath", "Osgiliaths Spaltung",
                "The Sundering of Osgiliath", "La Dislocation d'Osgiliath"),
    268451575: ("Pelennor", "Pelennor", "Pelennor", "Pelennor"),
    268451286: ("Field of Onslaught", "Feld des Angriffs",
                "Field of Onslaught", "Champ du carnage"),
    268452359: ("Cormallen", "Cormallen", "Cormallen", "Cormallen"),
    268450899: ("Pelargir", "Pelargir", "Pelargir", "Pelargir"),
    268454943: ("The Gnawnshore", "Die Zahnküste",
                "The Gnawnshore", "Le Rivage rongé"),
    268455287: ("Bâr Guruthos", "Bâr Guruthos", "Bâr Guruthos", "Bâr Guruthos"),
}


class MapNameTests(unittest.TestCase):
    def test_all_reviewed_area_names_are_localized_from_the_dat(self):
        gebietssicht.validate_configuration()
        for ident, expected in ALIASES.items():
            for lang, index in (("de", 1), ("en", 2), ("fr", 3)):
                with self.subTest(map=ident, lang=lang):
                    self.assertEqual(build_daten.kartenname(ident, lang), expected[index])

    def test_helms_deep_maps_are_reparented_as_display_paths_not_game_maps(self):
        games = build_daten.spielkarten()
        tree = {ident: {"name": build_daten.kartenname(ident, "de")}
                for ident in games.maps}
        with open(build_daten.HIER / "daten/karten.json", encoding="utf-8") as file:
            map_rows = __import__("json").load(file)
        with_image = {row["idx"] for row in map_rows}
        root, target = 268453621, 268449767
        variants = [268450268, 268450269, 268450270, 268450272, 268450273, 268450274]

        for number, ident in enumerate(variants, 1):
            labels, ids = build_daten.kartenpfad(
                ident, games.chain(ident), tree, with_image, "de")
            with self.subTest(map=ident):
                self.assertEqual(ids, [root, target, ident])
                self.assertEqual(labels[:2], ["Rohan", "West-Rohan: Helms Klamm"])
                self.assertEqual(labels[2], "Helms Klamm · Kartenvariante %d" % number)

        cave = 268453919
        labels, ids = build_daten.kartenpfad(
            cave, games.chain(cave), tree, with_image, "de")
        self.assertEqual(ids, [root, target, cave])
        self.assertEqual(labels, ["Rohan", "West-Rohan: Helms Klamm", "Glitzernde Grotten"])

        self.assertEqual(games.chain(variants[0]), [root, variants[0]],
                         "the underlying game map hierarchy must remain untouched")

    def test_technical_fallback_is_language_specific(self):
        fake_game = type("Game", (), {
            "maps": {999: {"name": "", "parent": None}}
        })()
        with patch.object(build_daten, "spielkarten", return_value=fake_game), \
             patch.object(build_daten, "kartennamen", return_value={}), \
             patch.object(build_daten, "name_ueber_englisch", return_value="Karte 999"), \
             patch.object(build_daten, "karten_ueberschreibungen", return_value={}):
            self.assertEqual(build_daten.kartenname(999, "de"), "Karte 999")
            self.assertEqual(build_daten.kartenname(999, "en"), "Map 999")
            self.assertEqual(build_daten.kartenname(999, "fr"), "Carte 999")


if __name__ == "__main__":
    unittest.main()
