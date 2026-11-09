"""Upload decisions without a server: hashing, reuse and the orphan report."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('upload', ROOT / 'upload.py')
UPLOAD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(UPLOAD)


class UploadTests(unittest.TestCase):
    def test_hash_follows_content(self):
        with tempfile.TemporaryDirectory() as ordner:
            datei = Path(ordner) / 'a.js'
            datei.write_text('eins', encoding='utf-8')
            erster = UPLOAD.hashe(datei)
            self.assertEqual(len(erster), 64)
            datei.write_text('zwei', encoding='utf-8')
            os.utime(datei, (1, 1))
            self.assertNotEqual(UPLOAD.hashe(datei), erster)

    def test_hash_is_reused_when_size_and_time_match(self):
        with tempfile.TemporaryDirectory() as ordner:
            datei = Path(ordner) / 'a.js'
            datei.write_text('inhalt', encoding='utf-8')
            erst = UPLOAD.eintrag(datei, None)
            self.assertEqual(erst[2], UPLOAD.hashe(datei))
            # A stored entry with the same size and time keeps its hash — no read.
            zweit = UPLOAD.eintrag(datei, [erst[0], erst[1], 'aus-dem-stand'])
            self.assertEqual(zweit[2], 'aus-dem-stand')

    def test_new_time_forces_a_new_hash(self):
        with tempfile.TemporaryDirectory() as ordner:
            datei = Path(ordner) / 'a.js'
            datei.write_text('inhalt', encoding='utf-8')
            alt = [datei.stat().st_size, 1, 'alter-hash']
            self.assertEqual(UPLOAD.eintrag(datei, alt)[2], UPLOAD.hashe(datei))

    def test_old_state_entries_do_not_count_as_uploaded(self):
        alt = [120, 1700000000]          # earlier format: size + mtime only
        neu = [120, 1700000000, 'abc']
        self.assertTrue(UPLOAD.hochladen_noetig(alt, neu, 120))

    def test_skip_only_with_same_content_and_size_on_the_server(self):
        neu = [120, 1700000000, 'abc']
        self.assertFalse(UPLOAD.hochladen_noetig([120, 1, 'abc'], neu, 120))
        self.assertTrue(UPLOAD.hochladen_noetig([120, 1, 'abc'], neu, 999))
        self.assertTrue(UPLOAD.hochladen_noetig([120, 1, 'abc'], neu, None))
        self.assertTrue(UPLOAD.hochladen_noetig(None, neu, 120))

    def test_orphans_skip_the_keep_list(self):
        fern = {'.htaccess': 900, 'cgi-bin/x.php': 10, 'app.js': 5,
                'alt/app.js': 5, 'app 2.js': 5}
        lokal = {'app.js'}
        self.assertEqual(UPLOAD.verwaiste_dateien(fern, lokal),
                         ['alt/app.js', 'app 2.js'])

    def test_conflict_copies_stay_out_of_the_upload(self):
        self.assertTrue(UPLOAD.DUBLETTE.search('app 2.js'))
        self.assertTrue(UPLOAD.DUBLETTE.search('123 2.webp'))
        self.assertFalse(UPLOAD.DUBLETTE.search('app.js'))


if __name__ == '__main__':
    unittest.main()
