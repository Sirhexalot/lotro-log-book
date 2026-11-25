"""Daily report: the ten most-viewed entities of the month, sent by mail.

`php/cron/report.php` runs from the host's cron manager. It reads the top rows
from `llb_aufrufe`, resolves the names in DE/EN/FR, renders a table and sends it
over the same SMTP account as the feedback form. The checks run the real script
without a database: a missing access file and an unreachable database must end
in a clear message and a non-zero exit code, never in a stack trace.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKRIPT = ROOT / 'php/cron/report.php'


@unittest.skipUnless(shutil.which('php'), 'PHP required')
class TagesberichtTest(unittest.TestCase):
    def lauf(self, *argumente, env=None):
        umgebung = dict(os.environ)
        umgebung.update(env or {})
        return subprocess.run(['php', str(SKRIPT), *argumente], cwd=ROOT,
                              capture_output=True, text=True, env=umgebung, timeout=60)

    def test_the_script_has_valid_syntax(self):
        ergebnis = subprocess.run(['php', '-l', str(SKRIPT)], cwd=ROOT,
                                  capture_output=True, text=True)
        self.assertEqual(ergebnis.returncode, 0, ergebnis.stdout + ergebnis.stderr)

    def test_a_missing_access_file_ends_with_a_clear_message(self):
        with tempfile.TemporaryDirectory() as ordner:
            ergebnis = self.lauf('--trocken', env={
                'LLB_ROOT': str(ROOT),
                'LLB_FEEDBACK_ENV': str(Path(ordner) / 'gibt-es-nicht.env'),
            })
        self.assertEqual(ergebnis.returncode, 1)
        self.assertIn('MISSING', ergebnis.stderr)
        self.assertNotIn('Fatal error', ergebnis.stderr)

    def test_an_unreachable_database_does_not_throw(self):
        with tempfile.TemporaryDirectory() as ordner:
            envDatei = Path(ordner) / 'llb-feedback.env'
            envDatei.write_text(
                'LLB_FEEDBACK_DB_HOST=127.0.0.1\n'
                'LLB_FEEDBACK_DB_PORT=1\n'
                'LLB_FEEDBACK_DB_NAME=llb\n'
                'LLB_FEEDBACK_DB_USER=niemand\n'
                'LLB_FEEDBACK_DB_PASSWORD=\n',
                encoding='utf-8')
            ergebnis = self.lauf('--trocken', env={
                'LLB_ROOT': str(ROOT),
                'LLB_FEEDBACK_ENV': str(envDatei),
            })
        self.assertEqual(ergebnis.returncode, 1)
        self.assertIn('Datenbank nicht erreichbar', ergebnis.stdout)
        self.assertNotIn('Fatal error', ergebnis.stderr)

    def test_only_the_shell_may_run_it(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        self.assertIn("if (PHP_SAPI !== 'cli')", quelle)

    def test_the_report_holds_no_credentials(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        for verboten in ('LLB_FEEDBACK_SMTP_PASSWORD=', 'LLB_FEEDBACK_DB_PASSWORD=',
                         'smtp.example', 'api_key'):
            self.assertNotIn(verboten, quelle)

    def test_the_dry_run_prints_the_mail_instead_of_sending_it(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        self.assertIn("'--trocken'", quelle)
        self.assertIn('BETREFF:', quelle)

    def test_the_table_names_the_requested_columns(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        for spalte in ('<th>Anzahl</th>', '<th>Typ</th>', '<th>Name</th>',
                       '<th>DE</th>', '<th>EN</th>', '<th>FR</th>'):
            self.assertIn(spalte, quelle)

    def test_the_mail_goes_to_the_shared_address_by_default(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        self.assertIn("'llb@sirhexalot.de'", quelle)

    def test_every_run_writes_one_log_line(self):
        quelle = SKRIPT.read_text(encoding='utf-8')
        self.assertIn("/llb-report.log'", quelle)
        self.assertIn('FILE_APPEND | LOCK_EX', quelle)


if __name__ == '__main__':
    unittest.main()
