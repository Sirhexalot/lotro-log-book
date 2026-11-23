"""The footer counter: presence without a cookie, and no crawlers.

`php/src/Statistics.php` keeps two anonymous counters: how many visitors are
"travelling" right now (five-minute window) and how many progress imports
happened. The endpoint decides who counts: a crawler never does, and a visitor
without a cookie is one visitor, not one per request.

The checks run the real class, so a change in the window or the key format
cannot silently bring back the inflated number.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PRUEFUNG = r'''require 'php/src/Statistics.php';
$file = $argv[1];
$s = new \Llb\Statistics($file);
$out = [];
$out['start'] = $s->current();
$key = \Llb\Statistics::visitorKey(['REMOTE_ADDR' => '192.0.2.7', 'HTTP_USER_AGENT' => 'Chrome/141']);
$out['same'] = $s->heartbeat($key);
$out['sameAgain'] = $s->heartbeat($key);
$other = \Llb\Statistics::visitorKey(['REMOTE_ADDR' => '192.0.2.8', 'HTTP_USER_AGENT' => 'Chrome/141']);
$out['other'] = $s->heartbeat($other);
$out['keyStable'] = \Llb\Statistics::visitorKey(['REMOTE_ADDR' => '192.0.2.7', 'HTTP_USER_AGENT' => 'Chrome/141']) === $key;
$out['keyOtherAgent'] = \Llb\Statistics::visitorKey(['REMOTE_ADDR' => '192.0.2.7', 'HTTP_USER_AGENT' => 'Firefox/144']) !== $key;
$out['keyPrefix'] = str_starts_with($key, 'v4-');
// An entry older than the window disappears on the next call.
$state = json_decode((string) file_get_contents($file), true);
$state['visitors']['v4-old'] = time() - 400;
file_put_contents($file, json_encode($state));
$out['afterOld'] = $s->heartbeat($key);
$out['import'] = $s->import('event-1');
$out['importAgain'] = $s->import('event-1');
echo json_encode($out);
'''


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class StatisticsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix='llb-statistik-'))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.file = self.tmp / 'statistik.json'
        ergebnis = subprocess.run(['php', '-r', PRUEFUNG, str(self.file)], cwd=ROOT,
                                  capture_output=True, text=True, check=True)
        self.werte = json.loads(ergebnis.stdout)

    def test_one_visitor_counts_once_however_often_he_beats(self):
        self.assertEqual(self.werte['same']['active'], 1)
        self.assertEqual(self.werte['sameAgain']['active'], 1)

    def test_another_visitor_adds_one(self):
        self.assertEqual(self.werte['other']['active'], 2)

    def test_the_key_is_a_daily_salted_hash_without_a_cookie(self):
        self.assertTrue(self.werte['keyPrefix'])
        self.assertTrue(self.werte['keyStable'])
        self.assertTrue(self.werte['keyOtherAgent'])

    def test_presence_expires_after_the_short_window(self):
        # The old entry is gone; the beating visitor stays.
        self.assertEqual(self.werte['afterOld']['active'], 2)

    def test_an_import_counts_once_per_event(self):
        self.assertEqual(self.werte['import']['imports'], self.werte['importAgain']['imports'])


if __name__ == '__main__':
    unittest.main()
