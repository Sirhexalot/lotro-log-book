"""Barter vendors and their offers from `barters.xml`.

The file lists a profile once and lets many vendors reference it, so the parser
must not attribute an offer to a vendor more than once, and must not drop the
392 profiles that carry no name. The checks pin that, the price names, and the
translated profile names.
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from tools.tausch import baue, bericht, kennung, menge

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from php_viewmodel import tausch_index, tausch_preis  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]

QUELLE = """<?xml version="1.0" encoding="UTF-8"?><barterers>
<barterer id="1879048302" name="Jolfur" title="Hunter Trainer" requiredClass="Hunter">
<barterProfile profileId="1879297432"/>
</barterer>
<barterer id="1879048305" name="Reykur" title="Hunter Trainer" requiredClass="Hunter">
<barterProfile profileId="1879297432"/>
</barterer>
<barterer id="1879048365" name="Ivy Spokes" title="">
<barterProfile profileId="1879297433"/>
</barterer>
<barterProfile profileId="1879297432" name="Minor Class Items">
<barterEntry>
<give id="1879224343" name="Mark" quantity="100"/>
<give id="1879224344" name="Medallion" quantity="16"/>
<receive id="1879091488" name="Nenuial's Gauntlets"/>
</barterEntry>
<barterEntry>
<give id="1879224343" name="Mark" quantity="180"/>
<receive id="1879091493" name="Nenuial's Cloak" quantity="2"/>
</barterEntry>
</barterProfile>
<barterProfile profileId="1879297433" name="">
<barterEntry>
<receiveReputation factionId="1879237312" factionName="Men of the Wold" quantity="1200"/>
</barterEntry>
</barterProfile>
</barterers>
"""

LABELS = """<?xml version="1.0" encoding="UTF-8"?><labels>
<label key="1879224343" value="%s"/>
<label key="1879224344" value="%s"/>
</labels>
"""

PROFILE_LABELS = """<?xml version="1.0" encoding="UTF-8"?><labels>
<label key="1879297432" value="%s"/>
</labels>
"""


def kennung_von(wert: int) -> str:
    return '%08X' % (wert & 0xffffffff)


class TauschTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.wurzel = Path(self.tmp.name)
        (self.wurzel / 'barters.xml').write_text(QUELLE, encoding='utf-8')
        self.lore = self.wurzel / 'lore'
        for sprache, (mark, medaille) in {
                'de': ('Zeichen', 'Medaillon'),
                'en': ('Mark', 'Medallion'),
        }.items():
            ordner = self.lore / 'labels' / sprache
            ordner.mkdir(parents=True)
            (ordner / 'items.xml').write_text(LABELS % (mark, medaille), encoding='utf-8')
        for sprache, profil in {'de': 'Kleinere Klassengegenstände',
                                'en': 'Minor Class Items'}.items():
            (self.lore / 'labels' / sprache / 'barterers.xml').write_text(
                PROFILE_LABELS % profil, encoding='utf-8')
        # Französisch fehlt absichtlich: der Bericht muss die Lücke nennen.

    def tearDown(self):
        self.tmp.cleanup()

    def test_id_and_quantity_helpers(self):
        self.assertEqual(kennung(1879224343), '7002B017')
        self.assertEqual(kennung('1879224343'), '7002B017')
        self.assertEqual(kennung(None), '')
        self.assertEqual(menge(None), 1)
        self.assertEqual(menge('0'), 1)
        self.assertEqual(menge('5'), 5)

    def test_shared_profile_counts_once_and_keeps_unnamed_profile(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        profil = daten['profiles'][kennung_von(1879297432)]
        self.assertEqual(profil['name']['en'], 'Minor Class Items')
        self.assertEqual(len(profil['offers']), 2)
        # Two vendors reference the profile; the offer stays one row.
        self.assertEqual(daten['vendors'][kennung_von(1879048302)]['profiles'],
                         [kennung_von(1879297432)])
        self.assertEqual(daten['vendors'][kennung_von(1879048305)]['profiles'],
                         [kennung_von(1879297432)])
        self.assertEqual(len(daten['profiles'][kennung_von(1879297433)]['offers']), 1)

    def test_profile_names_are_translated_and_never_english_on_german(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        self.assertEqual(daten['profiles'][kennung_von(1879297432)]['name'],
                         {'de': 'Kleinere Klassengegenstände',
                          'en': 'Minor Class Items', 'fr': ''})
        # No label and no source name: every language stays empty.
        self.assertEqual(daten['profiles'][kennung_von(1879297433)]['name'],
                         {'de': '', 'en': '', 'fr': ''})
        self.assertIn('Profile ohne deutschen Namen: 1', bericht(daten))

    def test_offer_keeps_both_price_rows_and_quantities(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        erst, zweit = daten['profiles'][kennung_von(1879297432)]['offers']
        self.assertEqual(erst['give'], [[kennung_von(1879224343), 100],
                                        [kennung_von(1879224344), 16]])
        self.assertEqual(erst['receive'], [[kennung_von(1879091488), 1]])
        self.assertEqual(zweit['receive'], [[kennung_von(1879091493), 2]])

    def test_reputation_offer_is_kept_but_not_an_item(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        angebot = daten['profiles'][kennung_von(1879297433)]['offers'][0]
        self.assertEqual(angebot['receive'], [])
        self.assertEqual(angebot['reputation'], [[kennung_von(1879237312), 1200]])

    def test_only_price_ids_get_names_and_a_missing_language_is_reported(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        self.assertEqual(set(daten['names']),
                         {kennung_von(1879224343), kennung_von(1879224344)})
        self.assertEqual(daten['names'][kennung_von(1879224344)],
                         {'de': 'Medaillon', 'en': 'Medallion'})
        self.assertIn('ohne vollständigen Namen: 2', bericht(daten))

    def test_written_file_round_trips(self):
        daten = baue(self.wurzel / 'barters.xml', self.lore)
        ziel = self.wurzel / 'tausch.json'
        ziel.write_text(json.dumps(daten, ensure_ascii=False), encoding='utf-8')
        gelesen = json.loads(ziel.read_text(encoding='utf-8'))
        self.assertEqual(gelesen['vendors'], daten['vendors'])


class TauschPreisTests(unittest.TestCase):
    """Die Gegenstandsseite nennt den Preis in der Seitensprache."""

    DATEN = {
        'vendors': {'7001F02F': {'profiles': ['7001F114']}},
        'profiles': {'7001F114': {
            'name': {'de': 'Kleinere Klassengegenstände', 'en': 'Minor Class Items'},
            'offers': [{'give': [['7002B017', 250], ['7002B018', 10]],
                        'receive': [['70000F2C', 5]]}],
        }},
        'names': {'7002B017': {'de': 'Zeichen', 'en': 'Mark'},
                  '7002B018': {'de': 'Medaillon', 'en': 'Medallion'}},
    }

    def test_index_keeps_vendor_list_and_offer(self):
        index = tausch_index(self.DATEN)
        zeile = index['70000F2C'][0]
        self.assertEqual(zeile['vendor'], '7001F02F')
        self.assertEqual(zeile['profile'], '7001F114')

    def test_price_follows_the_page_language_and_falls_back_to_english(self):
        index = tausch_index(self.DATEN)
        give = index['70000F2C'][0]['give']
        self.assertEqual(tausch_preis(give, self.DATEN['names'], 'de'),
                         '250 Zeichen + 10 Medaillon')
        self.assertEqual(tausch_preis(give, self.DATEN['names'], 'fr'),
                         '250 Mark + 10 Medallion')

    def test_missing_source_returns_an_empty_index(self):
        self.assertEqual(tausch_index(None), {})


if __name__ == '__main__':
    unittest.main()
