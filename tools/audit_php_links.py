#!/usr/bin/env python3
"""Check every internal URL in generated PHP page models resolves to a page.

Usage: python3 tools/audit_php_links.py ~/.cache/llb-php/phpdata
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from build_katalogseiten import WORDS
from php_viewmodel import APP_SEGMENTS
from giver_viewmodel import SEGMENT as GIVER_SEGMENT

LANGUAGES = ('de', 'en', 'fr')
PAGE_KINDS = ('q', 'd', 'i', 'recipe', 'title', 'virtue', 'f', 'l',
              'area', 'region', 'set', 'giver')
CUSTOM_SEGMENTS = {
    'set': {'de': 'set', 'en': 'set', 'fr': 'ensemble'},
    'giver': GIVER_SEGMENT,
}


def segment(lang: str, kind: str) -> str:
    if kind in CUSTOM_SEGMENTS:
        return CUSTOM_SEGMENTS[kind][lang]
    return WORDS[lang][kind]


def page_paths(root: Path) -> set[str]:
    paths = set()
    for lang in LANGUAGES:
        for kind in PAGE_KINDS:
            folder = root / lang / ('page-' + kind)
            if not folder.is_dir():
                continue
            for shard in folder.glob('*.json'):
                records = json.loads(shard.read_text(encoding='utf-8'))['entities']
                base = '/%s/%s/' % (lang, segment(lang, kind))
                paths.update(base + ident + '/' for ident in records)
        for app_segment in APP_SEGMENTS[lang].values():
            paths.add('/%s/%s' % (lang, app_segment.strip('/') + '/')
                      if app_segment else '/%s/' % lang)
        paths.add('/%s/' % lang)
    return paths


def internal_urls(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if (key == 'url' or key.endswith('_url')) and isinstance(child, str) and child.startswith('/'):
                yield child
            yield from internal_urls(child)
    elif isinstance(value, list):
        for child in value:
            yield from internal_urls(child)


def audit(root: Path) -> tuple[int, list[tuple[str, str]]]:
    known = page_paths(root)
    checked = 0
    broken = []
    for lang in LANGUAGES:
        for folder in (root / lang).glob('page-*'):
            for shard in folder.glob('*.json'):
                entities = json.loads(shard.read_text(encoding='utf-8'))['entities']
                for ident, page in entities.items():
                    for url in internal_urls(page):
                        checked += 1
                        if urlsplit(url).path not in known:
                            broken.append(('%s:%s' % (folder.name, ident), url))
    return checked, broken


def main() -> int:
    root = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path('phpdata')
    if not (root / 'manifest.json').is_file():
        raise SystemExit('Kein PHP-Datenmanifest unter %s' % root)
    checked, broken = audit(root)
    print('%s: %s interne URLs, %s nicht auflösbar' % (root, checked, len(broken)))
    for source, url in broken[:100]:
        print('  %s -> %s' % (source, url))
    if len(broken) > 100:
        print('  … und %s weitere' % (len(broken) - 100))
    return 1 if broken else 0


if __name__ == '__main__':
    raise SystemExit(main())
