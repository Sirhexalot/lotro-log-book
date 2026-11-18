#!/usr/bin/env python3
"""Shared release classification and deterministic manifest generation."""
from __future__ import annotations

import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

COMPONENTS = ("programm", "daten", "assets")
MANIFEST_NAME = "release-manifest.json"
MANIFEST_SCHEMA = 1

_DATA_FILE = re.compile(
    r"^(?:abenteuer|belohnungen|daten|daten-taten|gebiete|gegenstaende|"
    r"karten-kurz|notizen|reise|rezepte|ruf-quellen|suche|vorkommen|ersetzt)"
    r"-(?:de|en|fr)\.js$")
_ASSET_EXTENSIONS = {".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
_PROGRAM_EXTENSIONS = {
    ".css", ".html", ".htaccess", ".js", ".json", ".php", ".txt", ".xml",
}
_KNOWN_DIRS = {
    "bild", "gelaende", "karten", "notizen", "php", "phpdata", "vendor",
    "vorkommen",
}
_EXCLUDED_DIRS = {"phptmp", ".git", "__pycache__", "tests"}
_CONFLICT_COPY = re.compile(r" \d+\.[^/]+$")


class ReleaseError(ValueError):
    """Raised when a release contains an unsafe or ambiguous path."""


def _normalise(path: str | Path) -> str:
    value = str(path).replace(os.sep, "/")
    if value.startswith("/") or value == ".." or value.startswith("../"):
        raise ReleaseError(f"Ungültiger absoluter oder übergeordneter Pfad: {path}")
    if "\\" in value or any(part in ("", ".") for part in value.split("/")):
        raise ReleaseError(f"Nicht normalisierter Releasepfad: {path}")
    return value


def _excluded(relative: str) -> bool:
    parts = relative.split("/")
    if any(part in _EXCLUDED_DIRS for part in parts):
        return True
    if any(part.startswith("release-") for part in parts):
        return True
    if any(part in {".DS_Store", "Thumbs.db"} for part in parts):
        return True
    if _CONFLICT_COPY.search(parts[-1]):
        return True
    if parts[-1].startswith(("upload-", ".llb-")):
        return True
    if (parts[-1].lower() in {"credentials.json", "secrets.json"}
            or parts[-1].lower().startswith(".env")
            or parts[-1].lower().endswith((".key", ".pem"))):
        raise ReleaseError(f"Private Datei im Release: {relative}")
    return False


def classify(relative: str | Path) -> str | None:
    """Return the component for a release path, or ``None`` for exclusions."""
    path = _normalise(relative)
    if path == MANIFEST_NAME or _excluded(path):
        return None
    parts = path.split("/")
    top = parts[0]
    if top not in _KNOWN_DIRS and len(parts) > 1:
        raise ReleaseError(f"Unbekannter Releaseordner: {path}")
    if top in {"bild", "gelaende", "karten"}:
        return "assets"
    if top in {"phpdata", "notizen", "vorkommen"}:
        return "daten"
    if top in {"php", "vendor"}:
        return "programm"

    suffix = Path(path).suffix.lower()
    if suffix in _ASSET_EXTENSIONS:
        return "assets"
    if suffix not in _PROGRAM_EXTENSIONS:
        raise ReleaseError(f"Unbekannter Releasepfad: {path}")
    name = parts[-1]
    if _DATA_FILE.fullmatch(name):
        return "daten"
    return "programm"


def iter_files(root: Path) -> Iterable[tuple[str, Path, str]]:
    root = Path(root)
    if root.is_symlink():
        raise ReleaseError(f"Releaseordner darf kein Symlink sein: {root}")
    root = root.resolve()
    if not root.is_dir():
        raise ReleaseError(f"Releaseordner fehlt: {root}")
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.is_symlink():
            raise ReleaseError(f"Symlink im Release: {path.relative_to(root)}")
        relative = _normalise(path.relative_to(root))
        component = classify(relative)
        if component:
            yield relative, path, component


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def _canonical(entries: list[dict[str, object]]) -> bytes:
    values = [[entry["path"], entry["size"], entry["sha256"]] for entry in entries]
    return json.dumps(values, ensure_ascii=False, separators=(",", ":"), sort_keys=False).encode()


def build_manifest(root: Path, *, build: str | None = None) -> dict:
    files: dict[str, dict[str, object]] = {}
    grouped = {component: [] for component in COMPONENTS}
    for relative, path, component in iter_files(root):
        entry = {
            "component": component,
            "size": path.stat().st_size,
            "sha256": sha256(path),
        }
        files[relative] = {"component": component, "size": entry["size"], "sha256": entry["sha256"]}
        grouped[component].append({"path": relative, **entry})

    versions = {}
    for component in COMPONENTS:
        entries = sorted(grouped[component], key=lambda item: item["path"])
        versions[component] = {
            "version": hashlib.sha256(_canonical(entries)).hexdigest(),
            "files": len(entries),
            "bytes": sum(int(item["size"]) for item in entries),
        }

    compatibility = {}
    data_manifest = root / "phpdata" / "manifest.json"
    if data_manifest.is_file():
        try:
            compatibility["phpdata_schema"] = json.loads(
                data_manifest.read_text(encoding="utf-8")
            ).get("schema")
        except (OSError, ValueError):
            raise ReleaseError("phpdata/manifest.json ist kein gültiges JSON")

    return {
        "schema": MANIFEST_SCHEMA,
        "build": build or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ"),
        "components": versions,
        "files": {key: files[key] for key in sorted(files)},
        "compatibility": compatibility,
        "required_paths": [],
    }


def write_manifest(root: Path, manifest: dict) -> Path:
    target = root / MANIFEST_NAME
    target.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return target


def load_manifest(root: Path) -> dict:
    path = root / MANIFEST_NAME
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ReleaseError(f"Manifest fehlt: {path}")
    except (OSError, ValueError) as error:
        raise ReleaseError(f"Manifest ungültig: {path}: {error}")
    if manifest.get("schema") != MANIFEST_SCHEMA:
        raise ReleaseError(f"Unbekannte Manifestversion: {manifest.get('schema')!r}")
    if set(manifest.get("components", {})) != set(COMPONENTS):
        raise ReleaseError("Manifest enthält nicht genau die drei Komponenten")
    for relative, entry in manifest.get("files", {}).items():
        if _normalise(relative) != relative or relative == MANIFEST_NAME:
            raise ReleaseError("Ungültiger Manifestpfad: " + str(relative))
        if classify(relative) != entry.get("component"):
            raise ReleaseError("Falsche Manifestkomponente: " + relative)
        if not isinstance(entry.get("size"), int) or entry["size"] < 0:
            raise ReleaseError("Ungültige Manifestgröße: " + relative)
        if not isinstance(entry.get("sha256"), str) or not re.fullmatch(r"[a-f0-9]{64}", entry["sha256"]):
            raise ReleaseError("Ungültiger Manifesthash: " + relative)
    for relative in manifest.get("required_paths", []):
        if _normalise(relative) != relative:
            raise ReleaseError("Ungültige deklarierte Abhängigkeit: " + str(relative))
    return manifest


def verify_manifest_files(root: Path, manifest: dict, components: set[str] | None = None) -> None:
    wanted = components or set(COMPONENTS)
    for relative, entry in manifest.get("files", {}).items():
        if entry.get("component") not in wanted:
            continue
        path = root / relative
        if not path.is_file():
            raise ReleaseError(f"Manifestdatei fehlt: {relative}")
        actual_size = path.stat().st_size
        actual_hash = sha256(path)
        if actual_size != entry.get("size") or actual_hash != entry.get("sha256"):
            raise ReleaseError(f"Release während der Prüfung verändert: {relative}")
