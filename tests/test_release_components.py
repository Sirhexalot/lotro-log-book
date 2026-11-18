import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "release_components", ROOT / "tools" / "release_components.py")
RC = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RC)


class ReleaseComponentTests(unittest.TestCase):
    def make_release(self):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        files = {
            "app.js": "code",
            "abenteuer-karte.js": "code",
            "daten-de.js": "data",
            "phpdata/manifest.json": '{"schema": 4}',
            "bild/item.svg": "asset",
            "karten/de/map.webp": "map",
            "phptmp/twig/cache.php": "runtime",
            "release-2026-11-16/old.js": "old",
        }
        for relative, content in files.items():
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        return temp, root

    def test_classification_and_exclusions(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        manifest = RC.build_manifest(root, build="fixed")
        self.assertEqual(manifest["files"]["app.js"]["component"], "programm")
        self.assertEqual(manifest["files"]["abenteuer-karte.js"]["component"], "programm")
        self.assertEqual(manifest["files"]["daten-de.js"]["component"], "daten")
        self.assertEqual(manifest["files"]["bild/item.svg"]["component"], "assets")
        self.assertNotIn("release-manifest.json", manifest["files"])
        self.assertNotIn("phptmp/twig/cache.php", manifest["files"])
        self.assertNotIn("release-2026-11-16/old.js", manifest["files"])

    def test_unknown_paths_are_rejected(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        (root / "mystery.bin").write_bytes(b"x")
        with self.assertRaises(RC.ReleaseError):
            RC.build_manifest(root)

    def test_private_files_and_symlinks_are_rejected(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        (root / "credentials.json").write_text("secret", encoding="utf-8")
        with self.assertRaises(RC.ReleaseError):
            RC.build_manifest(root)
        (root / "credentials.json").unlink()
        outside = Path(temp.name).parent / "outside-release-secret"
        outside.write_text("secret", encoding="utf-8")
        self.addCleanup(outside.unlink)
        (root / "link.js").symlink_to(outside)
        with self.assertRaises(RC.ReleaseError):
            RC.build_manifest(root)

    def test_versions_ignore_build_time_and_order(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        first = RC.build_manifest(root, build="one")
        second = RC.build_manifest(root, build="two")
        self.assertNotEqual(first["build"], second["build"])
        self.assertEqual(first["components"], second["components"])
        self.assertEqual(list(first["files"]), sorted(first["files"]))
        os.utime(root / "app.js", (1, 1))
        third = RC.build_manifest(root, build="three")
        self.assertEqual(first["components"], third["components"])

    def test_only_changed_component_version_changes(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        first = RC.build_manifest(root, build="fixed")
        (root / "daten-de.js").write_text("changed", encoding="utf-8")
        second = RC.build_manifest(root, build="fixed")
        self.assertNotEqual(first["components"]["daten"], second["components"]["daten"])
        self.assertEqual(first["components"]["programm"], second["components"]["programm"])
        self.assertEqual(first["components"]["assets"], second["components"]["assets"])

    def test_manifest_file_verification_detects_build_changes(self):
        temp, root = self.make_release()
        self.addCleanup(temp.cleanup)
        manifest = RC.build_manifest(root, build="fixed")
        (root / "app.js").write_text("changed", encoding="utf-8")
        with self.assertRaises(RC.ReleaseError):
            RC.verify_manifest_files(root, manifest, {"programm"})


if __name__ == "__main__":
    unittest.main()
