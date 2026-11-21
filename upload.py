#!/usr/bin/env python3
"""Uploads a built website to the web server via FTP/FTPS.

Credentials are **not** in the project, but in a separate file:

    ~/.config/mql-upload.conf   (chmod 600)

Structure:

    [upload]
    host = www2.your-server.de
    user = ftp-benutzer
    password = …
    path = /public_html/mm
    tls = yes

Usage:

    python3 upload.py --probe              # only connect and show the directory
    python3 upload.py --dry-run            # show what would be uploaded
    python3 upload.py                      # upload, skip files whose content is there
    python3 upload.py --verwaiste          # list server files the build no longer has
    python3 upload.py --verwaiste --loeschen   # delete exactly those (see below)

How the comparison works: one `LIST` per directory gives the remote file sizes,
and the local file's `sha256` is compared with the hash stored after the last
upload. Content decides, not the modification time — the build rewrites the
whole catalogue with fresh timestamps, and without hashes every upload would
send all ~110.000 files again. A state entry is `[size, mtime, sha256]`; when
size and time are unchanged the hash is reused without reading the file.

`--verwaiste` only reports. `--loeschen` needs that report in the same call,
never deletes `.htaccess` or the keep list below, and refuses more than
`GRENZE` deletions unless `--force` is given.

`--aufraeumen` DELETES iCloud conflict copies ("app 2.js") on the server. It is
not a test mode.
"""
import argparse
import configparser
import ftplib
import hashlib
import json
import re
import os
import sys
import threading
import uuid

# Release logs are followed with `tail -f`; Python buffers redirected stdout by
# default, so the uploader would appear stalled for long stretches. Line
# buffering makes every file report visible immediately.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)
from datetime import datetime, timezone
from collections import deque
from pathlib import Path

HIER = Path(__file__).resolve().parent
sys.path.insert(0, str(HIER / 'tools'))
from release_components import (COMPONENTS, MANIFEST_NAME, ReleaseError,
                                load_manifest, verify_manifest_files)
QUELLE = HIER / 'dist-web'
KONFIG = Path.home() / '.config/mql-upload.conf'
STAND = Path.home() / '.config/mql-upload-state.json'
DEPLOYMENT_NAME = '.llb-deployment.json'
JOURNAL_NAME = '.llb-upload-journal.json'
LOCK_NAME = '.llb-upload.lock'

# Files and folders that are not part of the build but must stay on the server.
SCHONEN = ('.htaccess', '.user.ini', '.well-known', 'cgi-bin', 'error_log', 'logs')
# Deleting more than this many files at once needs --force.
GRENZE = 2000

# iCloud Drive recreates conflict copies of files it is syncing; they are no
# part of the site and must not reach the server ("app 2.js", "123 2.webp").
DUBLETTE = re.compile(r' \d+\.[a-z]+$')


def lies_konfig():
    if not KONFIG.is_file():
        raise SystemExit('MISSING: %s' % KONFIG)
    rechte = KONFIG.stat().st_mode & 0o777
    if rechte & 0o077:
        print('WARNING: %s is readable by others (chmod 600 recommended).' % KONFIG,
              file=sys.stderr)
    teil = configparser.ConfigParser()
    teil.read(KONFIG, encoding='utf-8')
    if 'upload' not in teil:
        raise SystemExit('Section [upload] is missing in %s.' % KONFIG)
    daten = teil['upload']
    for feld in ('host', 'user', 'password', 'path'):
        if not daten.get(feld):
            raise SystemExit('"%s" is missing in %s.' % (feld, KONFIG))
    return daten


def verbinde(daten):
    art = ftplib.FTP_TLS if daten.getboolean('tls', True) else ftplib.FTP
    ftp = art(daten['host'], timeout=60)
    ftp.login(daten['user'], daten['password'])
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    # Binary mode: otherwise some servers refuse SIZE.
    ftp.voidcmd('TYPE I')
    return ftp


def fernverzeichnis(ftp, pfad):
    ftp.cwd(pfad)


def vorhandene_groesse(ftp, name):
    try:
        return ftp.size(name)
    except ftplib.error_perm:
        return None


def fern_index(ftp, ziel):
    """Remote files under the target as {relative path: size}, one LIST per folder.

    A listing is far cheaper than one SIZE per file: the catalogue alone is
    110.000 files. Returns None when the server cannot list, so the caller can
    fall back to asking file by file.
    """
    index = {}
    stapel = ['']
    while stapel:
        ordner = stapel.pop()
        pfad = ziel if not ordner else ziel + '/' + ordner
        zeilen = []
        try:
            ftp.cwd(pfad)
            ftp.retrlines('LIST', zeilen.append)
        except ftplib.all_errors as fehler:
            print('  LIST failed in %s: %s' % (pfad, fehler), file=sys.stderr)
            return None
        for zeile in zeilen:
            teile = zeile.split(None, 8)
            if len(teile) < 9:
                continue
            name = teile[8]
            if name in ('.', '..'):
                continue
            relativ = name if not ordner else ordner + '/' + name
            if zeile.startswith('d'):
                stapel.append(relativ)
                continue
            try:
                index[relativ] = int(teile[4])
            except (ValueError, IndexError):
                index[relativ] = None
    return index


def lade_stand():
    """Last uploaded version: relative path -> [size, mtime, sha256]."""
    if not STAND.is_file():
        return {}
    try:
        return json.loads(STAND.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def sichere_stand(stand):
    STAND.write_text(json.dumps(stand, indent=0, sort_keys=True), encoding='utf-8')


def stelle_sicher(ftp, ordner):
    """Create missing directories without failing when they exist."""
    teile = [teil for teil in ordner.split('/') if teil]
    for teil in teile:
        try:
            ftp.cwd(teil)
        except ftplib.error_perm:
            ftp.mkd(teil)
            ftp.cwd(teil)


def hashe(datei):
    summe = hashlib.sha256()
    with datei.open('rb') as quelle:
        for block in iter(lambda: quelle.read(1 << 20), b''):
            summe.update(block)
    return summe.hexdigest()


def fern_json(ftp, ziel, name):
    """Read a small JSON control file without listing the remote tree."""
    daten = bytearray()
    try:
        ftp.cwd(ziel)
        ftp.retrbinary('RETR ' + name, daten.extend)
    except ftplib.all_errors:
        return None
    try:
        return json.loads(bytes(daten).decode('utf-8'))
    except (UnicodeDecodeError, ValueError):
        raise RuntimeError('Ungültige Remote-Metadaten: ' + name)


def fern_hash(ftp, ziel, relative):
    """Hash one remote file when resuming a journal; never trust size alone."""
    digest = hashlib.sha256()
    ordner, _, name = relative.rpartition('/')
    ftp.cwd(ziel)
    if ordner:
        ftp.cwd(ordner)
    ftp.retrbinary('RETR ' + name, digest.update)
    return digest.hexdigest()


def deployment_plan(manifest, deployed, components):
    """Return manifest files that differ from the confirmed server state."""
    if not deployed or deployed.get('schema') != 1:
        raise RuntimeError(
            'Kein gültiger Serverstand vorhanden; zuerst Migration/Audit ausführen')
    confirmed = deployed.get('components', {})
    plan = []
    unchanged = []
    for component in COMPONENTS:
        entries = [
            (path, entry) for path, entry in manifest['files'].items()
            if entry['component'] == component
        ]
        if component not in components:
            unchanged.append(component)
            continue
        if confirmed.get(component, {}).get('version') == manifest['components'][component]['version']:
            unchanged.append(component)
            continue
        old_files = confirmed.get(component, {}).get('files', {})
        for path, entry in entries:
            if old_files.get(path, {}).get('sha256') != entry['sha256']:
                plan.append((path, component, entry))
    return plan, unchanged


def pruefe_abhaengigkeiten(manifest, deployed, selected):
    """Check explicitly declared paths before publishing their consumers."""
    confirmed = (deployed or {}).get('components', {})
    for relative in manifest.get('required_paths', []):
        entry = manifest.get('files', {}).get(relative)
        if entry is None:
            raise RuntimeError('Deklarierte Abhängigkeit fehlt im Manifest: ' + relative)
        component = entry['component']
        if component in selected:
            continue
        if confirmed.get(component, {}).get('files', {}).get(relative, {}).get('sha256') != entry['sha256']:
            raise RuntimeError(
                'Abhängigkeit nicht veröffentlicht: %s (%s)' % (relative, component))


def neue_deploymentdaten(manifest, deployed, selected):
    """Merge successfully published components into the confirmed server state."""
    result = dict(deployed or {})
    result.update({'schema': 1, 'manifest_schema': manifest['schema']})
    result['components'] = dict(result.get('components', {}))
    for component in selected:
        files = {
            path: dict(entry)
            for path, entry in manifest['files'].items()
            if entry['component'] == component
        }
        result['components'][component] = {
            'version': manifest['components'][component]['version'],
            'files': files,
            'build': manifest['build'],
        }
    return result


def sperre_erwerben(ftp, ziel, komponenten, trocken=False):
    if trocken:
        return
    ftp.cwd(ziel)
    try:
        ftp.mkd(LOCK_NAME)
    except ftplib.error_perm as error:
        raise RuntimeError('Server-Upload ist bereits gesperrt') from error
    payload = json.dumps({
        'schema': 1,
        'components': sorted(komponenten),
    }, separators=(',', ':')).encode('utf-8')
    try:
        from io import BytesIO
        ftp.cwd(ziel)
        ftp.storbinary('STOR ' + LOCK_NAME + '/owner.json', BytesIO(payload))
    except Exception:
        try:
            ftp.cwd(ziel)
            ftp.rmd(LOCK_NAME)
        except ftplib.all_errors:
            pass
        raise


def sperre_freigeben(ftp, ziel, trocken=False):
    if trocken:
        return
    try:
        ftp.cwd(ziel)
        ftp.delete(LOCK_NAME + '/owner.json')
        ftp.rmd(LOCK_NAME)
    except ftplib.all_errors as error:
        print('WARNING: Upload-Lock konnte nicht entfernt werden: %s' % error,
              file=sys.stderr)


def deployment_schreiben(ftp, ziel, data):
    from io import BytesIO
    payload = (json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True)
               + '\n').encode('utf-8')
    temp = DEPLOYMENT_NAME + '.part'
    ftp.cwd(ziel)
    ftp.storbinary('STOR ' + temp, BytesIO(payload))
    ftp.rename(temp, DEPLOYMENT_NAME)


def remote_json_schreiben(ftp, ziel, name, data):
    from io import BytesIO
    payload = (json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True)
               + '\n').encode('utf-8')
    ftp.cwd(ziel)
    ftp.storbinary('STOR ' + name + '.part', BytesIO(payload))
    ftp.rename(name + '.part', name)


def journal_schreiben(ftp, ziel, data):
    remote_json_schreiben(ftp, ziel, JOURNAL_NAME, data)


def serverstand_uebernehmen(daten, basis, manifest, trocken=False):
    """Write the deployment manifest for an already identical server tree.

    This is the first step for a site that was published without a confirmed
    component state. Existence and size of every manifest file are checked
    against one listing per folder; content is not downloaded. Any missing
    file or size difference aborts, so the written state cannot describe a
    server that differs from the build.
    """
    ftp = verbinde(daten)
    try:
        ziel = daten['path']
        vorhanden = fern_json(ftp, ziel, DEPLOYMENT_NAME)
        if vorhanden is not None:
            raise RuntimeError('Serverstand ist bereits vorhanden; nichts zu übernehmen')
        print('Serververzeichnisse werden gelistet ...', flush=True)
        fern = fern_index(ftp, ziel)
        if fern is None:
            raise RuntimeError('Der Server konnte nicht gelistet werden')
        fehlt, abweichend = [], []
        for path, entry in manifest['files'].items():
            if path not in fern:
                fehlt.append(path)
                continue
            groesse = fern[path]
            if groesse is None or int(groesse) != int(entry['size']):
                abweichend.append('%s (lokal %s, Server %s)'
                                  % (path, entry['size'], groesse))
        print('%d Dateien geprüft, %d fehlen, %d mit abweichender Größe'
              % (len(manifest['files']), len(fehlt), len(abweichend)), flush=True)
        for path in fehlt[:10]:
            print('  fehlt:', path)
        for zeile in abweichend[:10]:
            print('  Größe:', zeile)
        if fehlt or abweichend:
            raise RuntimeError('Serverstand weicht ab; --migration verwenden')
        if trocken:
            print('Trockenlauf: Manifest nicht geschrieben', flush=True)
            return
        sperre_erwerben(ftp, ziel, COMPONENTS)
        try:
            deployment_schreiben(
                ftp, ziel, neue_deploymentdaten(manifest, None, COMPONENTS))
        finally:
            sperre_freigeben(ftp, ziel)
        print('Serverstand übernommen: %d Dateien in %d Komponenten'
              % (len(manifest['files']), len(COMPONENTS)), flush=True)
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()


def hochladen_manifest(daten, basis, manifest, komponenten, workers=1,
                       trocken=False, migration=False):
    """Upload selected manifest components without a remote tree inventory."""
    del workers  # The manifest path is intentionally serialized around one lock.
    verify_manifest_files(basis, manifest, komponenten)
    ziel = daten['path']
    ftp = verbinde(daten)
    lock = False
    try:
        deployed = fern_json(ftp, ziel, DEPLOYMENT_NAME)
        if deployed is None and not migration:
            raise RuntimeError(
                'Servermanifest fehlt; mit --migration zuerst einen vollständigen '
                'Komponentenstand herstellen')
        if deployed is None:
            plan = [
                (path, entry['component'], entry)
                for path, entry in manifest['files'].items()
                if entry['component'] in komponenten
            ]
            unchanged = [component for component in COMPONENTS
                         if component not in komponenten]
        else:
            plan, unchanged = deployment_plan(manifest, deployed, komponenten)
        pruefe_abhaengigkeiten(manifest, deployed, komponenten)
        previous_journal = fern_json(ftp, ziel, JOURNAL_NAME)
        resumable = set()
        if (previous_journal
                and set(previous_journal.get('components', [])) == komponenten
                and set(previous_journal.get('files', [])) == {item[0] for item in plan}):
            resumable = set(previous_journal.get('completed', []))
        order = {'assets': 0, 'daten': 1, 'programm': 2}
        plan.sort(key=lambda item: (order[item[1]], item[0]))
        print('Komponenten: ausgewählt %s; unverändert %s' % (
            ','.join(sorted(komponenten)),
            ','.join(unchanged) if unchanged else 'keine'))
        print('Dateien: %d, %.1f MB' % (
            len(plan), sum(int(entry['size']) for _, _, entry in plan) / 1048576.0))
        for path, component, _ in plan:
            print('  %s [%s]' % (path, component))
        if trocken:
            return len(plan), 0, 0

        sperre_erwerben(ftp, ziel, komponenten)
        lock = True
        if deployed is not None and fern_json(ftp, ziel, DEPLOYMENT_NAME) != deployed:
            raise RuntimeError('Serverstand hat sich während der Planung verändert')
        journal = {
            'schema': 1,
            'transaction': uuid.uuid4().hex,
            'started': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'components': sorted(komponenten),
            'files': [relative for relative, _, _ in plan],
            'completed': [],
        }
        journal_schreiben(ftp, ziel, journal)
        print('Upload läuft: %d Dateien; Fortschritt alle 25 Dateien.' %
              len(plan), flush=True)
        for nummer, (relative, _, entry) in enumerate(plan, start=1):
            verify_manifest_files(basis, {
                'files': {relative: entry},
            }, komponenten)
            if relative in resumable:
                try:
                    if fern_hash(ftp, ziel, relative) == entry['sha256']:
                        print('  wiederaufgenommen: %s' % relative)
                        journal['completed'].append(relative)
                        journal_schreiben(ftp, ziel, journal)
                        continue
                except ftplib.all_errors:
                    pass
            local = basis / relative
            ftp.cwd(ziel)
            ordner, _, name = relative.rpartition('/')
            if ordner:
                stelle_sicher(ftp, ordner)
            with local.open('rb') as stream:
                ftp.storbinary('STOR ' + name, stream)
            remote_size = vorhandene_groesse(ftp, name)
            if remote_size is not None and remote_size != entry['size']:
                raise RuntimeError('Falsche Remotegröße nach Upload: ' + relative)
            journal['completed'].append(relative)
            journal_schreiben(ftp, ziel, journal)
            if nummer % 25 == 0 or nummer == len(plan):
                print('  Fortschritt: %d/%d Dateien (%s)' %
                      (nummer, len(plan), relative), flush=True)

        verify_manifest_files(basis, manifest, komponenten)
        deployment_schreiben(
            ftp, ziel, neue_deploymentdaten(manifest, deployed, komponenten))
        ftp.cwd(ziel)
        ftp.delete(JOURNAL_NAME)
        print('Deploymentstand bestätigt für: %s' % ', '.join(sorted(komponenten)))
        return len(plan), 0, sum(int(entry['size']) for _, _, entry in plan)
    finally:
        if lock:
            sperre_freigeben(ftp, ziel)
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()


def eintrag(datei, alt):
    """[size, mtime, sha256]; the hash is reused when the file did not change."""
    groesse = datei.stat().st_size
    zeit = int(datei.stat().st_mtime)
    if (isinstance(alt, list) and len(alt) == 3 and alt[0] == groesse
            and alt[1] == zeit and isinstance(alt[2], str) and alt[2]):
        return [groesse, zeit, alt[2]]
    return [groesse, zeit, hashe(datei)]


def hochladen_noetig(alt, neu, ferngroesse):
    """Content decides. An unknown remote size means: send it."""
    if not isinstance(alt, list) or len(alt) != 3 or alt[2] != neu[2]:
        return True
    return ferngroesse != neu[0]


def verwaiste_dateien(fern, lokal):
    """Remote paths that the build no longer contains, minus the keep list."""
    aus = []
    for pfad in sorted(fern):
        if pfad in lokal:
            continue
        if pfad.split('/', 1)[0] in SCHONEN:
            continue
        aus.append(pfad)
    return aus


def dateien_sammeln(basis, nur=None, ohne=None):
    """Files to send, ordered so a half-finished run never shows a broken page.

    Order: entity detail files first, then the prepared data, then code and
    assets, then the list pages and last the sitemaps — an index must not promise
    pages that are not there, and a template must not meet a missing data file.
    The filters only look at the top-level folder, so --nur de,en,fr and
    --ohne de,en,fr split one release into two runs.
    """
    def erlaubt(rel):
        oben = rel.split('/', 1)[0]
        if nur and oben not in nur:
            return False
        if ohne and oben in ohne:
            return False
        return True

    def rang(rel):
        if rel.endswith('.xml'):
            return 3
        if rel.endswith('/index.html'):
            return 2
        if rel.count('/') == 2 and rel.endswith('.html'):
            return 0
        # Prepared data before code: a new template must never meet a missing
        # or half-written index file.
        if rel.startswith('phpdata/'):
            return 1
        return 1.5

    aus = []
    for pfad in basis.rglob('*'):
        if not pfad.is_file() or DUBLETTE.search(pfad.name):
            continue
        if pfad.name in ('.DS_Store', 'Thumbs.db'):
            continue
        rel = str(pfad.relative_to(basis)).replace(os.sep, '/')
        if erlaubt(rel):
            aus.append((pfad, rel))
    aus.sort(key=lambda paar: (rang(paar[1]), paar[1]))
    return aus


def hochladen(daten, basis, dateien, workers=1, trocken=False, filtern=False):
    """Compare by content and send what is missing; returns (new, same, bytes).

    Each worker keeps its own FTPS connection and its own working directory, so
    the login and the CWD chatter stay out of the way. The state file is written
    every 2.000 files: an interrupted run continues where it stopped instead of
    hashing a quarter of a million files again.
    """
    gesamt = len(dateien)
    alle = {rel for _, rel in dateien}
    ziel = daten['path']
    stand = lade_stand()
    ftp = verbinde(daten)
    try:
        ftp.cwd(ziel)
        fern = fern_index(ftp, ziel)
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()
    if fern is None:
        print('  remote sizes unknown, no sizes to compare', file=sys.stderr)

    auftraege = deque(dateien)
    zaehler = {'neu': 0, 'gleich': 0, 'bytes': 0, 'geprueft': 0}
    sperre = threading.Lock()
    fehler = []

    def sichern():
        sichere_stand({k: v for k, v in list(stand.items()) if v is not None})

    def arbeit():
        verbindung = verbinde(daten)
        aktuell = None       # cached working directory of this connection
        try:
            while True:
                with sperre:
                    if not auftraege:
                        return
                    datei, rel = auftraege.popleft()
                ordner, _, name = rel.rpartition('/')
                eintrag_neu = eintrag(datei, stand.get(rel))
                ferngroesse = fern.get(rel) if fern is not None else None
                noetig = hochladen_noetig(stand.get(rel), eintrag_neu, ferngroesse)
                if noetig and not trocken:
                    for versuch in range(3):
                        try:
                            if aktuell != ordner:
                                verbindung.cwd(ziel)
                                if ordner:
                                    stelle_sicher(verbindung, ordner)
                                aktuell = ordner
                            with datei.open('rb') as quelle:
                                verbindung.storbinary('STOR ' + name, quelle)
                            break
                        except ftplib.all_errors:
                            if versuch == 2:
                                raise
                            try:
                                verbindung.close()
                            except ftplib.all_errors:
                                pass
                            verbindung = verbinde(daten)
                            aktuell = None
                with sperre:
                    zaehler['neu' if noetig else 'gleich'] += 1
                    if noetig:
                        zaehler['bytes'] += datei.stat().st_size
                    zaehler['geprueft'] += 1
                    if not noetig or not trocken:
                        stand[rel] = eintrag_neu
                    geprueft = zaehler['geprueft']
                    if geprueft % 5000 == 0 or geprueft == gesamt:
                        print('  %d/%d geprüft, %d neu' % (geprueft, gesamt, zaehler['neu']),
                              flush=True)
                    if geprueft % 2000 == 0:
                        sichern()
        except BaseException as error:
            with sperre:
                fehler.append(error)
        finally:
            try:
                verbindung.quit()
            except ftplib.all_errors:
                verbindung.close()

    if workers > 1 and not trocken:
        faeden = [threading.Thread(target=arbeit) for _ in range(workers)]
        for faden in faeden:
            faden.start()
        for faden in faeden:
            faden.join()
    else:
        arbeit()

    if fehler:
        raise RuntimeError('Upload-Worker fehlgeschlagen: %s' % fehler[0]) from fehler[0]

    if not trocken:
        if filtern:
            # A filtered run knows only half the release: keep the other entries.
            sichern()
        else:
            # Only what the build still has; a renamed file starts fresh next time.
            sichere_stand({k: v for k, v in list(stand.items())
                           if v is not None and k in alle})
    return zaehler['neu'], zaehler['gleich'], zaehler['bytes']


def aufraeumen(ftp, ziel):
    """Delete conflict copies that earlier uploads left in the target tree."""
    entfernt = 0
    stapel = ['']
    while stapel:
        ordner = stapel.pop()
        ftp.cwd(ziel if not ordner else ziel + '/' + ordner)
        eintraege = []
        ftp.retrlines('LIST', eintraege.append)
        for zeile in eintraege:
            teile = zeile.split(None, 8)
            if len(teile) < 9:
                continue
            name = teile[8]
            if name in ('.', '..'):
                continue
            if zeile.startswith('d'):
                stapel.append(name if not ordner else ordner + '/' + name)
            elif DUBLETTE.search(name):
                try:
                    ftp.delete(name)
                    entfernt += 1
                except ftplib.error_perm as fehler:
                    print('  could not delete %s: %s' % (name, fehler))
    return entfernt


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--quelle', type=Path, default=QUELLE,
                        help='build folder to upload (default: dist-web)')
    parser.add_argument('--dry-run', action='store_true',
                        help='only show what would be uploaded, change nothing')
    parser.add_argument('--aufraeumen', action='store_true',
                        help='DELETE iCloud conflict copies on the server')
    parser.add_argument('--verwaiste', action='store_true',
                        help='list server files the build no longer contains')
    parser.add_argument('--loeschen', action='store_true',
                        help='with --verwaiste: delete those files')
    parser.add_argument('--force', action='store_true',
                        help='with --verwaiste --loeschen: allow more than %d deletions' % GRENZE)
    parser.add_argument('--workers', type=int, choices=range(1, 9), default=4,
                        help='parallel FTPS connections (default 4); 1 keeps one connection')
    parser.add_argument('--nur', default='',
                        help='only these top-level folders, comma separated (e.g. de,en,fr)')
    parser.add_argument('--ohne', default='',
                        help='skip these top-level folders, comma separated')
    parser.add_argument('--gruppe', default='',
                        help='Komponenten: programm,daten,assets oder alle')
    parser.add_argument('--migration', action='store_true',
                        help='fehlenden Serverstand durch vollständigen Gruppenupload anlegen')
    parser.add_argument('--adopt', action='store_true',
                        help='Serverstand aus dem Manifest übernehmen, wenn Inhalt und Größen bereits übereinstimmen')
    optionen = parser.parse_args()
    if optionen.loeschen and not optionen.verwaiste:
        raise SystemExit('--loeschen only works together with --verwaiste')
    if not optionen.quelle.is_dir():
        raise SystemExit('MISSING: %s' % optionen.quelle)

    daten = lies_konfig()
    manifest_mode = (optionen.quelle / MANIFEST_NAME).is_file()
    if manifest_mode and (optionen.nur or optionen.ohne):
        raise SystemExit('--nur/--ohne sind mit einem Manifestrelease nicht zulässig; '
                         'verwende --gruppe')
    if optionen.adopt:
        if not manifest_mode:
            raise SystemExit('--adopt braucht ein Release mit Manifest')
        try:
            manifest = load_manifest(optionen.quelle)
            serverstand_uebernehmen(daten, optionen.quelle, manifest,
                                    trocken=optionen.dry_run)
            return 0
        except (ReleaseError, RuntimeError) as error:
            print('FEHLER:', error, file=sys.stderr)
            return 1
    if optionen.gruppe or (manifest_mode and not optionen.verwaiste
                           and not optionen.aufraeumen):
        if optionen.nur or optionen.ohne:
            raise SystemExit('--gruppe kann nicht mit --nur oder --ohne kombiniert werden')
        if optionen.verwaiste or optionen.aufraeumen or optionen.loeschen:
            raise SystemExit('--gruppe kann nicht mit Wartungsoptionen kombiniert werden')
        try:
            manifest = load_manifest(optionen.quelle)
            gruppen_argument = optionen.gruppe or 'alle'
            teile = {teil.strip() for teil in gruppen_argument.split(',') if teil.strip()}
            if 'alle' in teile:
                if teile != {'alle'}:
                    raise SystemExit('--gruppe alle darf nicht mit anderen Gruppen kombiniert werden')
                teile = set(COMPONENTS)
            unbekannt = teile - set(COMPONENTS)
            if not teile or unbekannt:
                raise SystemExit('Unbekannte Gruppe: ' + ','.join(sorted(unbekannt or teile)))
            hochladen_manifest(
                daten, optionen.quelle, manifest, teile,
                workers=optionen.workers, trocken=optionen.dry_run,
                migration=optionen.migration)
            return 0
        except (ReleaseError, RuntimeError) as error:
            print('FEHLER:', error, file=sys.stderr)
            return 1

    ftp = verbinde(daten)
    try:
        if optionen.verwaiste:
            fern = fern_index(ftp, daten['path'])
            if fern is None:
                raise SystemExit('the server did not list its files; nothing done')
            lokal = {str(p.relative_to(optionen.quelle)).replace(os.sep, '/')
                     for p in optionen.quelle.rglob('*') if p.is_file()}
            ueberzaehlig = verwaiste_dateien(fern, lokal)
            print('%d files on the server, %d in the build, %d no longer in the build'
                  % (len(fern), len(lokal), len(ueberzaehlig)))
            for pfad in ueberzaehlig[:40]:
                print('  %s' % pfad)
            if len(ueberzaehlig) > 40:
                print('  … and %d more' % (len(ueberzaehlig) - 40))
            if not optionen.loeschen:
                print('Nothing deleted. Add --loeschen to remove exactly these files.')
                return 0
            if len(ueberzaehlig) > GRENZE and not optionen.force:
                print('Refusing to delete %d files without --force.' % len(ueberzaehlig))
                return 1
            entfernt = 0
            for pfad in ueberzaehlig:
                try:
                    ftp.cwd(daten['path'])
                    ftp.delete(pfad)
                    entfernt += 1
                except ftplib.error_perm as fehler:
                    print('  could not delete %s: %s' % (pfad, fehler))
            print('%d files deleted' % entfernt)
            return 0

        if optionen.aufraeumen:
            print('%d conflict copies removed on the server' % aufraeumen(ftp, daten['path']))
        nur = {teil.strip().strip('/') for teil in optionen.nur.split(',') if teil.strip()}
        ohne = {teil.strip().strip('/') for teil in optionen.ohne.split(',') if teil.strip()}
        if nur and ohne:
            raise SystemExit('Use either --nur or --ohne, not both')
        dateien = dateien_sammeln(optionen.quelle, nur or None, ohne or None)
        print('%d files selected%s' % (len(dateien),
              ' (%s)' % ('nur ' + ','.join(sorted(nur)) if nur else 'ohne ' + ','.join(sorted(ohne)))
              if (nur or ohne) else ''))
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()
        ftp = None
        neu, gleich, menge = hochladen(daten, optionen.quelle, dateien,
                                       workers=optionen.workers, trocken=optionen.dry_run,
                                       filtern=bool(nur or ohne))
        print('%d to upload, %d already there, %.1f MB'
              % (neu, gleich, menge / 1048576.0))
        return 0
    finally:
        if ftp is not None:
            try:
                ftp.quit()
            except ftplib.all_errors:
                ftp.close()


if __name__ == '__main__':
    sys.exit(main())
