"""The gap report between the client's item list and our item finder.

The tool is read-only; these checks pin the two facts a later decision needs:
every id we show exists in the client, and a missing id is only ever named with
a source that really evidences it.
"""
import json
import unittest
from pathlib import Path

from tools.gegenstand_luecken import CLIENT_ITEMS, bericht, kennung

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'web'


def finder_ids() -> set:
    text = (WEB / 'gegenstaende-de.js').read_text(encoding='utf-8')
    daten = json.loads(text[text.index('=') + 1:text.rindex(';')])
    return {zeile[0] for zeile in daten['e']} | set(daten['instanceChest'])


class LueckenTests(unittest.TestCase):
    def test_id_helper_matches_the_website_spelling(self):
        self.assertEqual(kennung(1879453983), '7006311F')
        self.assertEqual(kennung('1879453983'), '7006311F')
        self.assertEqual(kennung(None), '')

    def test_every_shown_item_exists_in_the_client(self):
        """The finder may not invent an id the game does not know."""
        if not CLIENT_ITEMS.is_file():
            self.skipTest('Client-Katalog nicht vorhanden')
        from tools.gegenstand_luecken import client_daten
        client = set(client_daten())
        fehlend = sorted(finder_ids() - client)
        self.assertEqual(fehlend, [], 'Finder-IDs ohne Client-Eintrag: %s' % fehlend[:10])

    def test_report_names_only_evidenced_sources_and_writes_both_files(self):
        import tempfile
        daten = {
            'schema': 1, 'katalog': 3, 'client': 4, 'voll_export': 4,
            'fehlend': 1, 'fehlend_mit_beleg': 1,
            'beleg_arten': {'tausch': 1},
            'katalog_nicht_im_client': [],
            'eintraege': [
                {'id': '70000F2C', 'name': 'Unyielding Drake Scale', 'name_en': 'Unyielding Drake Scale',
                 'kategorie': 'ITEM', 'platz': '', 'mindeststufe': 0, 'qualitaet': 'COMMON',
                 'belege': {'tausch': []}},
                {'id': '70055500', 'name': "Helm des Helden", 'name_en': "Hero's Helm",
                 'kategorie': 'ARMOUR', 'platz': 'HEAD', 'mindeststufe': 120,
                 'qualitaet': 'UNCOMMON', 'belege': {}},
            ],
        }
        with tempfile.TemporaryDirectory() as ordner:
            bericht(daten, Path(ordner))
            markdown = (Path(ordner) / 'luecken.md').read_text(encoding='utf-8')
            geschrieben = json.loads((Path(ordner) / 'luecken.json').read_text(encoding='utf-8'))
        self.assertEqual(geschrieben['fehlend'], 1)
        self.assertIn('70000F2C', markdown)
        # An item without any evidence is reported as missing, but never
        # presented as if a source justified a page.
        self.assertNotIn("Helm des Helden | ARMOUR", markdown)


if __name__ == '__main__':
    unittest.main()
