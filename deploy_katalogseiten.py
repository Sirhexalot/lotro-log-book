"""Prepare from live inputs; upload only catalogue files, with resumable FTPS workers.

The map application and its datasets are never uploaded here. Public indexes and
sitemaps are published only after every flat detail file is present.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import io
import json
from pathlib import Path
from queue import Queue, Empty
import re
import threading

import upload
from build_katalogseiten import build, LANGS, output_path
from build_seo import PAGES
from build_sitemaps import write
from verify_katalogseiten import verify

CONTROL = ('start.html', 'start-en.html', 'start-fr.html', 'sitemap.xml', '.htaccess')


def read_remote(ftp, name):
    data = io.BytesIO()
    ftp.retrbinary('RETR ' + name, data.write)
    return data.getvalue()


def prepare(target):
    if (target / 'katalog-manifest.json').exists():
        raise SystemExit('Prepared release exists; use --upload to resume or a new directory.')
    target.mkdir(parents=True, exist_ok=True)
    originals = target / 'live-originals'
    originals.mkdir(exist_ok=True)
    config = upload.lies_konfig()
    ftp = upload.verbinde(config)
    ftp.cwd(config['path'])
    names = set(PAGES) | {'style.css', 'gemeinsam.css', 'speicher.js', 'favicon.svg', 'sitemap.xml', '.htaccess', '404.html', 'kennung.php'}
    names.update(prefix + lang + '.js' for prefix in ('daten-', 'daten-taten-', 'belohnungen-', 'rezepte-') for lang in LANGS)
    names.add('referenz.js')
    for name in sorted(names):
        data = read_remote(ftp, name)
        (target / name).write_bytes(data)
        if name in CONTROL:
            (originals / name).write_bytes(data)
    ftp.quit()
    write(target, 'sitemap-seiten.xml', ['/' + name for name in PAGES if name not in ('gegenstand.html', 'suche.html')])
    write(target, 'sitemap.xml', ['/sitemap-seiten.xml'], index=True)
    build(target)
    verify(target)
    print('Prepared release:', target, flush=True)


def publish(target, workers):
    manifest = json.loads((target / 'katalog-manifest.json').read_text())
    paths = manifest['pages']
    details, indexes = [], []
    for url in paths:
        name = str(output_path(target, url).relative_to(target))
        (indexes if name.endswith('/index.html') else details).append(name)
    xmls = sorted(str(file.relative_to(target)) for file in target.glob('*/*/sitemap.xml'))
    digest = hashlib.sha256()
    for name in sorted(details + indexes + xmls + ['katalog.css', 'katalog.js', 'sitemap.xml', 'sitemap-seiten.xml']):
        digest.update(name.encode())
        digest.update((target / name).read_bytes())
    fingerprint = digest.hexdigest()
    marker = target / 'deploy-fingerprint.txt'
    if marker.exists() and marker.read_text() != fingerprint:
        raise SystemExit('Release changed; refusing to reuse upload checkpoints.')
    marker.write_text(fingerprint)
    donefile = target / 'deploy-completed.txt'
    done = set(donefile.read_text().splitlines()) if donefile.exists() else set()
    config = upload.lies_konfig()
    ftp = upload.verbinde(config)
    ftp.cwd(config['path'])

    def guard():
        ftp.cwd(config['path'])
        for name in CONTROL:
            if read_remote(ftp, name) != (target / 'live-originals' / name).read_bytes():
                raise RuntimeError('Concurrent live change; activation refused: ' + name)

    guard()
    # Make only the small set of type/locale folders, never a folder per ID.
    folders = sorted({str(Path(name).parent) for name in details + indexes + xmls})
    for folder in folders:
        ftp.cwd(config['path'])
        upload.stelle_sicher(ftp, folder)
    ftp.cwd(config['path'])
    for name in ('katalog.css', 'katalog.js', 'kennung.php'):
        with (target / name).open('rb') as stream:
            ftp.storbinary('STOR ' + name, stream)
    ftp.quit()
    jobs = Queue()
    for name in sorted(details):
        if name not in done:
            jobs.put(name)
    total = len(details)
    print('Detail files: %d, already uploaded: %d, workers: %d' % (total, len(done), workers), flush=True)
    lock = threading.Lock()
    stopped = threading.Event()
    completed = len(done)

    with donefile.open('a', buffering=1) as checkpoint:
        def worker():
            nonlocal completed
            connection = None
            current = None
            try:
                connection = upload.verbinde(config)
                while not stopped.is_set():
                    try:
                        name = jobs.get_nowait()
                    except Empty:
                        break
                    for attempt in range(3):
                        try:
                            parent = str(Path(name).parent)
                            if current != parent:
                                connection.cwd(config['path'])
                                connection.cwd(parent)
                                current = parent
                            with (target / name).open('rb') as stream:
                                connection.storbinary('STOR ' + Path(name).name, stream)
                            break
                        except Exception:
                            try: connection.close()
                            except Exception: pass
                            if attempt == 2:
                                raise
                            connection = upload.verbinde(config)
                            current = None
                    with lock:
                        checkpoint.write(name + '\n')
                        completed += 1
                        if completed % 5000 == 0 or completed == total:
                            print('Uploaded %d/%d detail files' % (completed, total), flush=True)
            except Exception:
                stopped.set()
                raise
            finally:
                if connection:
                    try: connection.quit()
                    except Exception: connection.close()
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = [pool.submit(worker) for _ in range(workers)]
            for future in futures:
                future.result()
    if completed != total:
        raise RuntimeError('Upload incomplete; indexes and rewrites remain unchanged.')
    ftp = upload.verbinde(config)
    guard()
    original = (target / 'live-originals/.htaccess').read_text()
    source = (Path(__file__).parent / 'redirect-mm/.htaccess').read_text()
    match = re.search(r'# BEGIN LLB ENTITY URLS\n(.*?)\n# END LLB ENTITY URLS', source, re.S)
    if not match:
        raise RuntimeError('Entity URL block missing in redirect-mm/.htaccess')
    block = '# BEGIN LLB ENTITY URLS\n' + match.group(1) + '\n# END LLB ENTITY URLS'
    if '# BEGIN LLB ENTITY URLS' in original:
        htaccess = re.sub(r'# BEGIN LLB ENTITY URLS.*?# END LLB ENTITY URLS', lambda _: block, original, flags=re.S)
    else:
        htaccess = original.rstrip() + '\n\n' + block + '\n'
    ftp.cwd(config['path'])
    ftp.storbinary('STOR .htaccess', io.BytesIO(htaccess.encode()))
    for name in sorted(indexes) + xmls + ['sitemap-seiten.xml', 'sitemap.xml', 'start.html', 'start-en.html', 'start-fr.html']:
        ftp.cwd(config['path'])
        parent = str(Path(name).parent)
        if parent != '.':
            ftp.cwd(parent)
        with (target / name).open('rb') as stream:
            ftp.storbinary('STOR ' + Path(name).name, stream)
    ftp.quit()
    (target / 'deploy-published.txt').write_text(fingerprint)
    print('PUBLISHED: %d entity pages; application, data and 404 unchanged.' % len(paths), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ziel', type=Path, required=True)
    parser.add_argument('--prepare', action='store_true')
    parser.add_argument('--upload', action='store_true')
    parser.add_argument('--workers', type=int, choices=range(1, 9), default=6)
    args = parser.parse_args()
    if args.prepare:
        prepare(args.ziel)
    if args.upload:
        publish(args.ziel, args.workers)
