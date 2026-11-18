"""Old reward-browser tab links: items stay, titles and virtues move on."""
import json
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRE = "require 'php/src/Catalogue.php';\n"


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class RewardTabTest(unittest.TestCase):
    def target(self, lang, query):
        code = REQUIRE + (
            "$c = new \\Llb\\Catalogue('phpdata/labels.json', 'https://llb.sirhexalot.de');"
            "echo json_encode($c->rewardTabTarget(%s, json_decode(%s, true)));"
        ) % (json.dumps(lang), json.dumps(json.dumps(query)))
        result = subprocess.run(['php', '-r', code], cwd=ROOT, check=True,
                                text=True, capture_output=True)
        return json.loads(result.stdout)

    def test_titles_keep_their_search(self):
        self.assertEqual(self.target('de', {'tab': 't', 'q': 'Idealismus'}),
                         '/de/titel/?q=Idealismus')
        self.assertEqual(self.target('en', {'tab': 't'}), '/en/title/')
        self.assertEqual(self.target('fr', {'tab': 't', 'q': '  '}), '/fr/titre/')

    def test_virtues_lead_to_their_catalogue_list(self):
        self.assertEqual(self.target('de', {'tab': 'v'}), '/de/tugend/')
        self.assertEqual(self.target('en', {'tab': 'v'}), '/en/virtue/')
        self.assertEqual(self.target('fr', {'tab': 'v'}), '/fr/vertu/')

    def test_items_and_unknown_tabs_stay_on_the_reward_page(self):
        self.assertIsNone(self.target('de', {}))
        self.assertIsNone(self.target('de', {'tab': 'g'}))
        self.assertIsNone(self.target('de', {'tab': 'x'}))


if __name__ == '__main__':
    unittest.main()
