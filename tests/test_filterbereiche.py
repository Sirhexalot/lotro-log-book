"""Filter memory: one key per list, not one key for all three.

Quest givers, factions and landmarks share `web/auftraggeber.js` and the same
filter markup. While the memory key was hardcoded to "auftraggeber", the three
lists overwrote each other: a landmark filter (`?area[]=…`) was restored on
/de/fraktion/ and emptied the faction list, so the page looked broken.

The key follows the list's language segment; these checks keep it that way.
"""
from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Language segment -> memory area.
SEGMENTE = {
    'auftraggeber': 'auftraggeber', 'quest-giver': 'auftraggeber',
    'donneur-de-quete': 'auftraggeber',
    'fraktion': 'fraktion', 'faction': 'fraktion',
    'landmarke': 'landmarke', 'landmark': 'landmarke', 'site': 'landmarke',
}


class FilterbereicheTest(unittest.TestCase):
    def test_memory_key_follows_the_list(self):
        text = (ROOT / 'web' / 'auftraggeber.js').read_text(encoding='utf-8')
        for aufruf in ("merker.write('auftraggeber'", "merker.read('auftraggeber'",
                       "merker.clear('auftraggeber'"):
            self.assertNotIn(aufruf, text, 'ein Schlüssel für alle Listen')
        for aufruf in ('merker.write(bereich', 'merker.read(bereich',
                       'merker.clear(bereich'):
            self.assertIn(aufruf, text)
        for segment in SEGMENTE:
            # Keys may be written as `faction:` or `'faction':`.
            self.assertRegex(text, r"['\"]?%s['\"]?\s*:" % re.escape(segment))

    def test_back_links_know_all_three_lists(self):
        text = (ROOT / 'web' / 'katalog.js').read_text(encoding='utf-8')
        for segment, bereich in SEGMENTE.items():
            treffer = re.search(
                r"['\"]?%s['\"]?\s*:\s*['\"]%s['\"]"
                % (re.escape(segment), re.escape(bereich)), text)
            self.assertIsNotNone(treffer, '%s fehlt in der lists-Tabelle' % segment)


if __name__ == '__main__':
    unittest.main()
