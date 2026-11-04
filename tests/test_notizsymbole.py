"""Transparent margins are removed without stretching the game artwork."""
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build_notizsymbole import baue


class NotizsymboleTests(unittest.TestCase):
    def test_trim_square_and_keep_original(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            original = Image.new('RGBA', (30, 30))
            original.paste((255, 180, 0, 255), (10, 7, 20, 24))
            original.save(root / '33.png')
            before = (root / '33.png').read_bytes()
            baue(root)
            with Image.open(root / 'lesbar/33.png') as result:
                self.assertEqual(result.size, (17, 17))
                self.assertEqual(result.getchannel('A').getbbox(), (3, 0, 13, 17))
            self.assertEqual((root / '33.png').read_bytes(), before)
            once = (root / 'lesbar/33.png').read_bytes()
            baue(root)
            self.assertEqual((root / 'lesbar/33.png').read_bytes(), once)


if __name__ == '__main__':
    unittest.main()
