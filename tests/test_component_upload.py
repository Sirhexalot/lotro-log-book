import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UPLOAD_SPEC = importlib.util.spec_from_file_location("upload", ROOT / "upload.py")
UPLOAD = importlib.util.module_from_spec(UPLOAD_SPEC)
UPLOAD_SPEC.loader.exec_module(UPLOAD)
RC_SPEC = importlib.util.spec_from_file_location(
    "release_components", ROOT / "tools" / "release_components.py")
RC = importlib.util.module_from_spec(RC_SPEC)
RC_SPEC.loader.exec_module(RC)


class FakeFTP:
    instances = []

    def __init__(self, fail_on=None, fail_rename_to=None):
        self.files = {}
        self.dirs = {""}
        self.cwd_path = ""
        self.list_calls = 0
        self.stor_calls = []
        self.fail_on = fail_on
        self.fail_rename_to = fail_rename_to
        self.closed = False
        self.__class__.instances.append(self)

    def cwd(self, path):
        if path.startswith("/remote"):
            path = path[len("/remote"):].strip("/")
        elif path == "/":
            path = ""
        elif path.startswith("/"):
            path = path.strip("/")
        else:
            path = "/".join(part for part in (self.cwd_path, path) if part)
        self.cwd_path = path.strip("/")

    def mkd(self, name):
        path = "/".join(part for part in (self.cwd_path, name) if part)
        if path in self.dirs:
            raise UPLOAD.ftplib.error_perm("exists")
        self.dirs.add(path)

    def rmd(self, name):
        path = "/".join(part for part in (self.cwd_path, name) if part)
        self.dirs.discard(path)

    def storbinary(self, command, stream):
        name = command.split(" ", 1)[1]
        relative = "/".join(part for part in (self.cwd_path, name) if part)
        if self.fail_on and relative.endswith(self.fail_on):
            raise UPLOAD.ftplib.error_temp("failure")
        self.files[relative] = stream.read()
        self.stor_calls.append(relative)

    def retrbinary(self, command, callback):
        name = command.split(" ", 1)[1]
        relative = "/".join(part for part in (self.cwd_path, name) if part)
        if relative not in self.files:
            raise UPLOAD.ftplib.error_perm("missing")
        callback(self.files[relative])

    def rename(self, old, new):
        if self.fail_rename_to == new:
            raise UPLOAD.ftplib.error_temp("rename failure")
        old_path = "/".join(part for part in (self.cwd_path, old) if part)
        new_path = "/".join(part for part in (self.cwd_path, new) if part)
        self.files[new_path] = self.files.pop(old_path)

    def size(self, name):
        relative = "/".join(part for part in (self.cwd_path, name) if part)
        if relative not in self.files:
            raise UPLOAD.ftplib.error_perm("missing")
        return len(self.files[relative])

    def delete(self, name):
        relative = "/".join(part for part in (self.cwd_path, name) if part)
        self.files.pop(relative, None)

    def retrlines(self, *_args):
        self.list_calls += 1

    def quit(self):
        self.closed = True

    def close(self):
        self.closed = True


class ComponentUploadTests(unittest.TestCase):
    def setUp(self):
        FakeFTP.instances.clear()
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for relative, content in {
            "app.js": "code",
            "style.css": "style",
            "daten-de.js": "data",
            "bild/item.svg": "asset",
        }.items():
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        self.manifest = RC.build_manifest(self.root, build="fixed")
        self.data = {"path": "/remote"}

    def tearDown(self):
        self.temp.cleanup()

    def fake_connect(self, _data):
        return FakeFTP()

    def test_dry_run_does_not_lock_or_write(self):
        old = UPLOAD.verbinde
        UPLOAD.verbinde = self.fake_connect
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        UPLOAD.hochladen_manifest(
            self.data, self.root, self.manifest, {"programm"},
            trocken=True, migration=True)
        ftp = FakeFTP.instances[-1]
        self.assertEqual(ftp.stor_calls, [])
        self.assertNotIn(".llb-upload.lock", ftp.dirs)

    def test_migration_confirms_only_selected_component(self):
        old = UPLOAD.verbinde
        UPLOAD.verbinde = self.fake_connect
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        UPLOAD.hochladen_manifest(
            self.data, self.root, self.manifest, {"assets"},
            migration=True)
        ftp = FakeFTP.instances[-1]
        state = json.loads(ftp.files[".llb-deployment.json"])
        self.assertIn("assets", state["components"])
        self.assertNotIn("programm", state["components"])
        self.assertEqual(ftp.list_calls, 0)
        self.assertNotIn(".llb-upload.lock/owner.json", ftp.files)
        self.assertNotIn(".llb-upload-journal.json", ftp.files)

    def test_changed_component_uses_metadata_without_remote_inventory(self):
        old = UPLOAD.verbinde
        first = FakeFTP()
        second = FakeFTP()
        calls = iter((first, second))
        UPLOAD.verbinde = lambda _data: next(calls)
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        UPLOAD.hochladen_manifest(
            self.data, self.root, self.manifest, {"assets"}, migration=True)
        second.files.update(first.files)
        second.dirs.update(first.dirs)
        (self.root / "bild/item.svg").write_text("new asset", encoding="utf-8")
        changed = RC.build_manifest(self.root, build="changed")
        UPLOAD.hochladen_manifest(
            self.data, self.root, changed, {"assets"})
        self.assertEqual(second.list_calls, 0)
        self.assertEqual(second.stor_calls.count("bild/item.svg"), 1)

    def test_upload_failure_does_not_confirm_new_state(self):
        old = UPLOAD.verbinde
        UPLOAD.verbinde = lambda _data: FakeFTP(fail_on="app.js")
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        with self.assertRaises(UPLOAD.ftplib.error_temp):
            UPLOAD.hochladen_manifest(
                self.data, self.root, self.manifest, {"programm"},
                migration=True)
        ftp = FakeFTP.instances[-1]
        self.assertNotIn(".llb-deployment.json", ftp.files)
        self.assertNotIn(".llb-upload.lock/owner.json", ftp.files)
        self.assertIn(".llb-upload-journal.json", ftp.files)

    def test_existing_lock_rejects_parallel_upload(self):
        old = UPLOAD.verbinde
        ftp = FakeFTP()
        ftp.dirs.add(".llb-upload.lock")
        UPLOAD.verbinde = lambda _data: ftp
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        with self.assertRaises(RuntimeError):
            UPLOAD.hochladen_manifest(
                self.data, self.root, self.manifest, {"programm"},
                migration=True)

    def test_missing_declared_dependency_blocks_consumer(self):
        old = UPLOAD.verbinde
        UPLOAD.verbinde = self.fake_connect
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        manifest = dict(self.manifest)
        manifest["required_paths"] = ["bild/item.svg"]
        with self.assertRaises(RuntimeError):
            UPLOAD.hochladen_manifest(
                self.data, self.root, manifest, {"programm"},
                migration=True)

    def test_metadata_rename_failure_keeps_previous_state_and_journal(self):
        old = UPLOAD.verbinde
        ftp = FakeFTP(fail_rename_to=".llb-deployment.json")
        UPLOAD.verbinde = lambda _data: ftp
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        with self.assertRaises(UPLOAD.ftplib.error_temp):
            UPLOAD.hochladen_manifest(
                self.data, self.root, self.manifest, {"programm"},
                migration=True)
        self.assertNotIn(".llb-deployment.json", ftp.files)
        self.assertIn(".llb-deployment.json.part", ftp.files)
        self.assertIn(".llb-upload-journal.json", ftp.files)

    def test_failed_upload_resumes_completed_files_after_hash_check(self):
        old = UPLOAD.verbinde
        ftp = FakeFTP(fail_on="style.css")
        UPLOAD.verbinde = lambda _data: ftp
        self.addCleanup(lambda: setattr(UPLOAD, "verbinde", old))
        with self.assertRaises(UPLOAD.ftplib.error_temp):
            UPLOAD.hochladen_manifest(
                self.data, self.root, self.manifest, {"programm"},
                migration=True)
        first_stores = list(ftp.stor_calls)
        ftp.fail_on = None
        UPLOAD.hochladen_manifest(
            self.data, self.root, self.manifest, {"programm"},
            migration=True)
        self.assertIn("app.js", first_stores)
        self.assertNotIn("app.js", ftp.stor_calls[len(first_stores):])
        self.assertNotIn(".llb-upload-journal.json", ftp.files)


if __name__ == "__main__":
    unittest.main()
