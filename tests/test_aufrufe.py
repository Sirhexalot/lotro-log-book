"""Monthly page-view counts: who counts, what is stored, what stays silent.

`php/src/Aufrufe.php` counts one row per (month, kind, id). The same entity is
one entry in three languages, so the count is language-independent. The table is
created by hand (`deploy/aufrufe-schema.sql`); the class never runs DDL and no
database failure may reach a page.

The checks run the real class without a database: the counting rules and the SQL
are pure, and an unreachable database must answer 0 instead of throwing.
"""
from __future__ import annotations

import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PRUEFUNG = r'''require 'vendor/autoload.php';
require 'php/src/Feedback.php';
require 'php/src/Aufrufe.php';
$chrome = ['HTTP_USER_AGENT' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'];
$bot = ['HTTP_USER_AGENT' => 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'];
$out = [];
$out['chrome'] = \Llb\Aufrufe::zaehlbar('q', '70000033', $chrome);
$out['bot'] = \Llb\Aufrufe::zaehlbar('q', '70000033', $bot);
$out['prefetch'] = \Llb\Aufrufe::zaehlbar('q', '70000033', $chrome + ['HTTP_SEC_PURPOSE' => 'prefetch;prerender']);
$out['noAgent'] = \Llb\Aufrufe::zaehlbar('q', '70000033', []);
$out['badKind'] = \Llb\Aufrufe::zaehlbar('Quest', '70000033', $chrome);
$out['badId'] = \Llb\Aufrufe::zaehlbar('q', "70000033' OR 1=1", $chrome);
$out['month'] = \Llb\Aufrufe::monat(1764000000);
// A checkout without a database file: counting and reading stay silent.
$leer = new \Llb\Aufrufe('/tmp/llb-aufrufe-gibt-es-nicht.env');
$leer->zaehle('q', '70000033', $chrome);
$out['viewWithoutDb'] = $leer->zahl('q', '70000033');
$out['topWithoutDb'] = $leer->spitze();
echo json_encode($out);
'''


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class AufrufeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        ergebnis = subprocess.run(['php', '-r', PRUEFUNG], cwd=ROOT,
                                  capture_output=True, text=True, check=True)
        import json
        cls.werte = json.loads(ergebnis.stdout)

    def test_a_browser_view_counts_and_a_crawler_does_not(self):
        self.assertTrue(self.werte['chrome'])
        self.assertFalse(self.werte['bot'])
        self.assertFalse(self.werte['prefetch'])
        self.assertFalse(self.werte['noAgent'])

    def test_only_a_stable_entity_key_is_accepted(self):
        self.assertFalse(self.werte['badKind'])
        self.assertFalse(self.werte['badId'])

    def test_the_month_is_a_utc_month(self):
        self.assertRegex(self.werte['month'], r'^\d{4}-(?:0[1-9]|1[0-2])$')

    def test_without_the_bot_list_nothing_counts(self):
        quelle = (ROOT / 'php/src/Aufrufe.php').read_text(encoding='utf-8')
        self.assertIn('if (!class_exists(\\Jaybizzle\\CrawlerDetect\\CrawlerDetect::class))', quelle)

    def test_a_missing_database_stays_silent(self):
        self.assertEqual(self.werte['viewWithoutDb'], 0)
        self.assertEqual(self.werte['topWithoutDb'], [])

    def test_one_upsert_and_no_ddl(self):
        quelle = (ROOT / 'php/src/Aufrufe.php').read_text(encoding='utf-8')
        self.assertIn('INSERT INTO llb_aufrufe', quelle)
        self.assertIn('ON DUPLICATE KEY UPDATE zahl = zahl + 1', quelle)
        self.assertNotIn('CREATE TABLE', quelle)
        self.assertNotIn('ALTER TABLE', quelle)
        schema = (ROOT / 'deploy/aufrufe-schema.sql').read_text(encoding='utf-8')
        self.assertIn('CREATE TABLE IF NOT EXISTS llb_aufrufe', schema)
        self.assertIn('PRIMARY KEY (monat, art, kennung)', schema)
        self.assertIn('KEY idx_monat_zahl (monat, zahl)', schema)

    def test_the_page_counts_after_the_response(self):
        index = (ROOT / 'php/public/index.php').read_text(encoding='utf-8')
        self.assertIn('(new \\Llb\\Aufrufe($envFile))->zaehle(', index)
        self.assertIn("isset($result['kind'], $result['id'])", index)
        # After the output: a database hiccup never costs the page.
        self.assertLess(index.index('echo $html;'), index.index('->zaehle('))


if __name__ == '__main__':
    unittest.main()
