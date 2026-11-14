"""Titel und Description: eine Regel, messbar.

Der Umbau hat einen einzigen Zweck: jede Seite bekommt einen Titel, der sagt,
was sie ist, und eine Description mit einem belegten Fakt. Diese Prüfung hält
die Grenzen fest, die dafür gelten — Länge, Name im Titel, kein leerer Text,
keine doppelte Marke, keine zwei gleichen Texte.
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import seo  # noqa: E402

SPRACHEN = ('de', 'en', 'fr')
ARTEN = ('q', 'd', 'i', 'recipe', 'title', 'virtue', 'f', 'l', 'area', 'region',
         'set', 'giver', 'p')


def beispiele(kind: str, lang: str) -> dict:
    """Ein typischer Eintrag je Art, aus den Feldern, die die Seite zeigt."""
    t = seo.TYPE[lang]
    if kind == 'q':
        return seo.quest(lang, name='Prolog: Die Weisheit der Drosseln',
                         area='Weitere Inhalte › Epische Geschichte', level=8,
                         giver='Dwalin', steps=4, rewards=2)
    if kind == 'd':
        return seo.deed(lang, name='Wurm-Bezwinger', area='Eriador › Angmar',
                        kind=t['d'], level=43, steps=1)
    if kind == 'i':
        return seo.item(lang, name='Veredelte Athelas-Essenz', quality='Ungewöhnlich',
                        category='Handgelenk · Armschiene', level=35,
                        source='Der Rätselfinder, Eriador › Die Trollhöhen')
    if kind == 'recipe':
        return seo.recipe(lang, name='Solide Eschen-Armbrust', profession='Schreiner',
                          tier='Westfold', level=50, ingredients=4)
    if kind in ('title', 'virtue'):
        return seo.honor(lang, name='der Herold', art=kind,
                         sources=[{'text': 'Eine kleine Bitte'}, {'text': 'Der Ruf des Landes'}])
    if kind == 'f':
        return seo.faction(lang, name='Umbar-Schmiedegilde', tiers=5, sources=3)
    if kind == 'l':
        return seo.landmark(lang, name='Das Gebrochene Herz', area='Der Alte Wald',
                            region='Breeland', quests=2)
    if kind == 'area':
        return seo.area(lang, name='Lossarnach', parent='Gondor', quests=42,
                        deeds=12, items=88)
    if kind == 'region':
        return seo.region(lang, name='Eriador', areas=14, quests=3200, deeds=480)
    if kind == 'set':
        return seo.set_(lang, name='Hlifworth-Rüstung', parts=6, first='Hlifworth-Helm')
    if kind == 'giver':
        return seo.giver(lang, name='Gerstenmann Butterblume', place='Breeland',
                         quests=6, low=1, high=65)
    return seo.profession(lang, name='Gelehrter', recipes=512, low=1, high=100)


class RegelTest(unittest.TestCase):
    def test_fit_kuerzt_an_der_wortgrenze(self):
        text = 'Ein Satz mit mehreren Wörtern, der zu lang ist.'
        kurz = seo.fit(text, 20)
        self.assertLessEqual(len(kurz), 21)
        self.assertTrue(kurz.endswith('…'))
        self.assertFalse(kurz.rstrip('…').endswith(' '))
        # Kein halbes Wort am Ende.
        self.assertIn(kurz.rstrip('…').rsplit(' ', 1)[-1], text)

    def test_fit_laesst_kurzes_stehen(self):
        self.assertEqual(seo.fit('Kurz.', 20), 'Kurz.')

    def test_titel_behaelt_den_namen(self):
        name = 'Bilwiss-Bezwinger / Bilwiss-Bezwingerin'
        self.assertEqual(seo.title(name, 'Tat'), name)

    def test_titel_nimmt_die_einordnung_wenn_sie_passt(self):
        self.assertEqual(seo.title('Der Herold', 'Titel'), 'Der Herold – Titel')

    def test_titel_ohne_namen_faellt_auf_die_art_zurueck(self):
        self.assertEqual(seo.title('', 'Titel'), 'Titel')

    def test_titelkern_bleibt_im_budget(self):
        for lang in SPRACHEN:
            for kind in ARTEN:
                block = beispiele(kind, lang)
                kern = block['title']
                if len(kern) <= seo.CORE_MAX:
                    continue
                # Zu lang ist nur erlaubt, wenn schon der Name allein zu lang ist.
                self.assertNotIn(' – ', kern, (lang, kind, kern))

    def test_description_bleibt_im_budget(self):
        for lang in SPRACHEN:
            for kind in ARTEN:
                block = beispiele(kind, lang)
                self.assertTrue(block['description'], (lang, kind))
                self.assertLessEqual(len(block['description']), seo.DESC_MAX, (lang, kind))
                self.assertTrue(block['description'].endswith('.'), (lang, kind))

    def test_description_traegt_den_namen(self):
        for lang in SPRACHEN:
            for kind in ARTEN:
                block = beispiele(kind, lang)
                self.assertIn(beispiele(kind, lang)['title'].split(' – ')[0][:12],
                              block['description'], (lang, kind))

    def test_description_wiederholt_die_marke_nicht(self):
        for lang in SPRACHEN:
            for kind in ARTEN:
                self.assertNotIn('LOTRO Log Book', beispiele(kind, lang)['description'])

    def test_jede_art_hat_einen_eigenen_typ(self):
        for lang in SPRACHEN:
            for kind in ARTEN:
                self.assertIn(seo.TYPE[lang][kind], beispiele(kind, lang)['description'][:40],
                              (lang, kind))

    def test_zahlen_mit_sprachtrennzeichen(self):
        self.assertEqual(seo.num(3200, 'de'), '3.200')
        self.assertEqual(seo.num(3200, 'en'), '3,200')

    def test_listenseite_der_ersten_seite_ohne_seitenzahl(self):
        eins = seo.listpage('de', label='Aufgaben', page=1, pages=76, entries=200, kind='q')
        zwei = seo.listpage('de', label='Aufgaben', page=2, pages=76, entries=200, kind='q')
        self.assertNotIn('Seite 1', eins['description'])
        self.assertIn('Seite 2 von 76', zwei['description'])
        self.assertNotEqual(eins['description'], zwei['description'])


class EindeutigTest(unittest.TestCase):
    def test_gleicher_text_bleibt_ohne_sinnvollen_zusatz_stehen(self):
        seiten = {
            'A': {'seo': {'title': 'X', 'description': 'Tat: Gleich. Eriador.'}},
            'B': {'seo': {'title': 'X', 'description': 'Tat: Gleich. Eriador.'}},
        }
        seo.dedupe('de', 'd', seiten)
        self.assertEqual(seiten['A']['seo']['description'],
                            seiten['B']['seo']['description'])
        self.assertLessEqual(len(seiten['B']['seo']['description']), seo.DESC_MAX)

    def test_verschiedene_texte_bleiben_unberuehrt(self):
        seiten = {
            'A': {'seo': {'description': 'Tat: Eins.'}},
            'B': {'seo': {'description': 'Tat: Zwei.'}},
        }
        self.assertEqual(seo.dedupe('de', 'd', seiten), 0)
        self.assertEqual(seiten['A']['seo']['description'], 'Tat: Eins.')


if __name__ == '__main__':
    unittest.main()
