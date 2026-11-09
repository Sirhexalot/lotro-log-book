"""Item names from the client export must read like the game shows them.

The DAT renderer leaves `${PLAYERNAME:…|…}` choices, `\\q` quote markers and
`[n]` tags in the strings. These checks pin the cases that were visible on the
site – a search list showing "\Essenz des lebhaften Erkunders"-Kiste and
"${PLAYERNAME:Erkunder|Erkunderin} von Ghân-gharâf".
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from itemnamen import sauberer_name


class ItemNamenTests(unittest.TestCase):
    def test_quote_marker_becomes_the_languages_quotes(self):
        self.assertEqual(sauberer_name('\\qFlackernde Essenz\\q-Kiste', 'de'),
                         '\u201eFlackernde Essenz\u201c-Kiste')
        # A marker that lost its q in the export is still a quote.
        self.assertEqual(sauberer_name('\\Essenz des lebhaften Erkunders\\q-Kiste', 'de'),
                         '\u201eEssenz des lebhaften Erkunders\u201c-Kiste')
        self.assertEqual(
            sauberer_name('Schaden bei \\Stechen\\q', 'de'),
            'Schaden bei \u201eStechen\u201c')

    def test_player_name_choice_takes_one_variant(self):
        self.assertEqual(
            sauberer_name('${PLAYERNAME:Erkunder[m]|Erkunderin[f]} von Ghân-gharâf', 'de'),
            'Erkunder von Ghân-gharâf')
        self.assertEqual(
            sauberer_name('Rahmen ${PLAYERNAME:des Turniergladiators[m]|'
                          'der Turniergladiatorin[f]}', 'de'),
            'Rahmen des Turniergladiators')

    def test_missing_space_around_a_choice_is_added(self):
        # The export really contains both of these, without a space at the join.
        self.assertEqual(
            sauberer_name('Gantelets de ${PLAYERNAME:tueur[m]|tueuse[f]}de trolls[mp]', 'fr'),
            'Gantelets de tueur de trolls')
        self.assertEqual(
            sauberer_name('Grèves${PLAYERNAME:du Tueur de dragon[m]|'
                          'de la Tueuse de dragon[f]}[fp]', 'fr'),
            'Grèves du Tueur de dragon')

    def test_export_tags_and_broken_brackets_disappear(self):
        for roh, erwartet in [
                ('Hat of the Cross-roads[s]', 'Hat of the Cross-roads'),
                ("Narg-and-Mauz's Mighty 'Greaves'[n=ps]",
                 "Narg-and-Mauz's Mighty 'Greaves'"),
                ('Chapeau du savoir profond[]', 'Chapeau du savoir profond'),
                ('[Vergoldete Armschiene des Abgrund[f]', 'Vergoldete Armschiene des Abgrund'),
                ('Broshs Bestickter Umhang[m', 'Broshs Bestickter Umhang'),
                ('Kühnes Stilett des Eroberers[m[]', 'Kühnes Stilett des Eroberers'),
                ('Handschuhe der Präzision[[p]', 'Handschuhe der Präzision'),
                ('Abgrund-Fäuste des Unnachgiebigen[p][', 'Abgrund-Fäuste des Unnachgiebigen')]:
            self.assertEqual(sauberer_name(roh, 'fr'), erwartet, roh)

    def test_no_markup_survives_and_the_result_is_stable(self):
        proben = ['${PLAYERNAME:X[m]|Y[f]} \\qTitel\\q [n]', '\\qA\\q-\\qB\\q', 'Name[m[]']
        for roh in proben:
            einmal = sauberer_name(roh, 'de')
            for zeichen in ('\\', '$', '[', ']'):
                self.assertNotIn(zeichen, einmal, (roh, einmal))
            self.assertEqual(einmal, sauberer_name(einmal, 'de'))
        self.assertEqual(sauberer_name('', 'de'), '')
        self.assertEqual(sauberer_name(None, 'de'), '')


if __name__ == '__main__':
    unittest.main()
