"""Track meaningful page-model changes for the PHP sitemap."""
from __future__ import annotations

import gzip
import hashlib
import json
import os
import re
import tempfile
import io
from datetime import date
from pathlib import Path

SCHEMA = 1
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')


def fingerprint(model: object) -> str:
    """Stable digest of a render-ready page model."""
    payload = json.dumps(model, ensure_ascii=False, sort_keys=True,
                         separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(payload).hexdigest()


def load_state(path: Path) -> dict:
    try:
        with gzip.open(path, 'rt', encoding='utf-8') as stream:
            state = json.load(stream)
    except FileNotFoundError:
        return {'schema': SCHEMA, 'initialized': False, 'urls': {}}
    if state.get('schema') != SCHEMA or not isinstance(state.get('urls'), dict):
        raise ValueError('Unsupported sitemap state: %s' % path)
    return state


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    os.close(fd)
    try:
        with open(temporary, 'wb') as raw:
            with gzip.GzipFile(fileobj=raw, mode='wb', mtime=0) as compressed:
                with io.TextIOWrapper(compressed, encoding='utf-8') as stream:
                    json.dump(state, stream, ensure_ascii=False, sort_keys=True,
                              separators=(',', ':'))
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def _valid_date(value: str, label: str) -> str:
    if not isinstance(value, str) or not DATE_RE.fullmatch(value):
        raise ValueError('%s must be YYYY-MM-DD' % label)
    date.fromisoformat(value)
    return value


def apply_lastmod(sections: dict[str, list[str]], fingerprints: dict[str, str],
                  state: dict, anchor: str, today: str,
                  reset_date: str | None = None,
                  previous_lastmod: dict | None = None,
                  previous_sections: dict | None = None) -> tuple[dict, dict]:
    """Return per-section dates and the next URL -> (hash, date) state."""
    anchor = _valid_date(anchor, 'anchor')
    today = _valid_date(today, 'today')
    if reset_date is not None:
        reset_date = _valid_date(reset_date, 'reset date')
    previous_lastmod = previous_lastmod or {}
    previous_sections = previous_sections or {}
    old_urls = state.get('urls', {})
    initialized = bool(state.get('initialized'))
    dates: dict[str, list[str]] = {}
    next_urls: dict[str, list[str]] = {}

    for section, urls in sections.items():
        section_dates = []
        previous_dates = previous_lastmod.get(section, [])
        previous_urls = previous_sections.get(section, [])
        old_dates_by_url = dict(zip(previous_urls, previous_dates))
        for url in urls:
            current_hash = fingerprints.get(url)
            old = old_urls.get(url)
            old_date = old[1] if isinstance(old, list) and len(old) == 2 else None
            if old_date is None:
                # Existing sitemap dates let us recover dates if the compressed
                # hash cache was lost; absent dates use the one-time anchor.
                old_date = old_dates_by_url.get(url)

            if reset_date is not None:
                modified = reset_date
            elif old is not None and old_date:
                old_hash = old[0] if isinstance(old, list) and len(old) == 2 else None
                modified = today if current_hash is not None and old_hash not in (None, current_hash) else old_date
            elif old_date:
                modified = old_date
            else:
                modified = today if initialized else anchor

            section_dates.append(modified)
            if current_hash is not None:
                next_urls[url] = [current_hash, modified]
            elif old is not None:
                next_urls[url] = [old[0], modified]
            else:
                next_urls[url] = ['', modified]
        dates[section] = section_dates

    return dates, {'schema': SCHEMA, 'initialized': True, 'urls': next_urls}
