"""Regression: resource metadata AND per-map shards must reach the build."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import baue_website as build


class ResourcePackagingTest(unittest.TestCase):
    def test_lazy_files_and_crafting_renderer_are_shipped(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            web, target = root / 'web', root / 'dist'
            web.mkdir()
            target.mkdir()
            (web / 'vorkommen').mkdir()
            for lang in build.SPRACHEN:
                (web / ('vorkommen-%s.js' % lang)).write_text(lang)
            (web / 'vorkommen/268437716.js').write_text('window.MQL_VORK_PUNKTE=[];')
            with patch.object(build, 'WEB', web):
                build.vorkommen_kopieren(target)
            for lang in build.SPRACHEN:
                self.assertEqual((target / ('vorkommen-%s.js' % lang)).read_text(), lang)
            self.assertEqual((target / 'vorkommen/268437716.js').read_bytes(),
                             (web / 'vorkommen/268437716.js').read_bytes())
            self.assertIn('rohstoffe.js', build.DATEIEN)
