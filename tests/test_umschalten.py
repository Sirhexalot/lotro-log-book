"""The switch script must replace the URL block, not append a second one."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from umschalten import ALTE_ENDE, ALTE_START, MARKE_ENDE, MARKE_START, neuer_inhalt


class UmschaltenTest(unittest.TestCase):
    def test_old_entity_block_is_replaced(self):
        alt = '\n'.join([
            'RewriteEngine On',
            '# host redirect',
            ALTE_START,
            'RewriteRule ^(de|en|fr)/.+ /$1.html [END]',
            ALTE_ENDE,
            '# compression',
        ])
        neu = neuer_inhalt(alt)
        self.assertNotIn(ALTE_START, neu)
        self.assertNotIn('.html [END]', neu)
        self.assertIn(MARKE_START, neu)
        self.assertIn('RewriteRule ^(de|en|fr)(/|$) /index.php [END]', neu)
        self.assertIn('RewriteRule ^(phpdata|php|vendor|phptmp)(/|$) - [F]', neu)
        # Everything around the block is left alone.
        self.assertIn('# host redirect', neu)
        self.assertIn('# compression', neu)

    def test_running_twice_changes_nothing_more(self):
        alt = 'RewriteEngine On\n' + ALTE_START + '\nRewriteRule ^x$ /x.html [END]\n' + ALTE_ENDE + '\n'
        einmal = neuer_inhalt(alt)
        zweimal = neuer_inhalt(einmal)
        self.assertEqual(einmal, zweimal)
        self.assertEqual(einmal.count(MARKE_START), 1)

    def test_file_without_a_block_gets_one_appended(self):
        neu = neuer_inhalt('RewriteEngine On\n')
        self.assertIn('RewriteEngine On', neu)
        self.assertTrue(neu.index(MARKE_START) > 0)
        self.assertIn(MARKE_ENDE, neu)


if __name__ == '__main__':
    unittest.main()
