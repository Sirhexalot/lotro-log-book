#!/usr/bin/env python3
"""Rufe jede veröffentlichte Adresse auf und verlange HTTP 200.

Die Adressliste ist die, die die Seite selbst veröffentlicht: `sitemaps.json`
enthält jede Entitätsseite in allen drei Sprachen und die Anwendungsseiten,
geschrieben von `tools/build_php_data.py` aus genau den Seiten, die es baut.
Eine Sitemap führt nur Adressen, die 200 antworten müssen.

    python3 tools/pruefe_entitaeten.py                       # alles, Vorschau 8817
    python3 tools/pruefe_entitaeten.py --stichprobe 3000
    python3 tools/pruefe_entitaeten.py --sprache de --art gegenstand
    python3 tools/pruefe_entitaeten.py --url /de/aufgabe/70000003/
    python3 tools/pruefe_entitaeten.py --basis https://llb.sirhexalot.de --stichprobe 1000

Jede Antwort außer 200 ist ein Fehler: 500, 404, eine Weiterleitung, keine
Antwort. Dazu zählt auch ein Rumpf mit dem Fehlertext des Frontcontrollers
oder ohne Überschrift – eine kaputte Seite soll nie wie eine heile aussehen.
Der Aufruf endet mit 1, sobald eine Adresse scheitert, damit ein Release
stehen bleibt.

Einen zweiten Vorschauserver startet das Werkzeug nicht: läuft
`tools/lokalserver.py` nicht, sagt es das und endet mit 2.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SPRACHEN = ('de', 'en', 'fr')
PORT = 8817
VORSCHAU = 'http://127.0.0.1:%d' % PORT
DATEN = Path(os.environ.get('LLB_DATA')
             or (Path.home() / '.cache' / 'llb-php' / 'phpdata'))
BERICHT = Path.home() / '.cache' / 'llb-status-fehler.txt'
FEHLERTEXT = 'Interner Fehler'
RUMPFGRENZE = 1024 * 1024
WEITERLEITUNGEN = (301, 302, 303, 307, 308)


class KeineUmleitung(urllib.request.HTTPRedirectHandler):
    """Eine Weiterleitung ist hier kein Erfolg, sondern ein Befund."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

OEFFNER = urllib.request.build_opener(KeineUmleitung)


def lade_abschnitte(daten: Path) -> dict[str, list[str]]:
    datei = Path(daten) / 'sitemaps.json'
    if not datei.is_file():
        raise SystemExit('MISSING: %s (python3 tools/build_php_data.py ausführen)'
                         % datei)
    return json.loads(datei.read_text(encoding='utf-8'))['sections']


def gruppe(url: str) -> str:
    """'/de/gegenstand/70001B7E/' → '/de/gegenstand', '/de/' → '/de'."""
    pfad = [teil for teil in url.strip('/').split('/') if teil]
    return '/' + '/'.join(pfad[:2]) if pfad else '/'


def sprache_der(url: str) -> str:
    return url.strip('/').split('/')[0] if url.strip('/') else ''


def art_der(url: str) -> str:
    """Die zweite Pfadstufe: die Entitätsart oder der Name einer Anwendungsseite."""
    pfad = url.strip('/').split('/')
    return pfad[1] if len(pfad) > 1 else ''


def auswahl(abschnitte: dict[str, list[str]], *, sprachen=SPRACHEN,
            arten: set[str] | None = None, stichprobe: int = 0,
            seed: int = 0) -> tuple[list[str], int]:
    """Die zu prüfenden Adressen und die Zahl der verfügbaren Adressen.

    Sortiert nach Sprache, Art und Adresse, damit ein Bericht lesbar bleibt und
    zwei Läufe dieselbe Reihenfolge zeigen. Die Stichprobe ist reproduzierbar,
    weil sie aus der sortierten Liste mit festem Startwert zieht.
    """
    alle = sorted({url for urls in abschnitte.values() for url in urls})
    gewaehlt = [
        url for url in alle
        if (not sprachen or sprache_der(url) in sprachen)
        and (not arten or art_der(url) in arten)
    ]
    if stichprobe and stichprobe < len(gewaehlt):
        gewaehlt = sorted(random.Random(seed).sample(gewaehlt, stichprobe))
    return gewaehlt, len(alle)


def bewerte(status: int, rumpf: bytes) -> str | None:
    """None heißt: die Seite ist in Ordnung. Sonst der Grund im Klartext."""
    if not status:
        return 'Keine Antwort'
    if status in WEITERLEITUNGEN:
        return 'Weiterleitung %d' % status
    if status != 200:
        return 'Status %d' % status
    text = rumpf.decode('utf-8', 'replace')
    if FEHLERTEXT in text:
        return 'Fehlertext im Rumpf'
    if '<h1' not in text:
        return 'Ohne Überschrift (h1)'
    return None


def hole(url: str, basis: str, zeitlimit: float) -> tuple[int, bytes]:
    anfrage = urllib.request.Request(basis + url, headers={'User-Agent': 'llb-pruefung'})
    try:
        with OEFFNER.open(anfrage, timeout=zeitlimit) as antwort:
            return int(antwort.status), antwort.read(RUMPFGRENZE)
    except urllib.error.HTTPError as fehler:
        try:
            return int(fehler.code), fehler.read(RUMPFGRENZE) or b''
        finally:
            fehler.close()
    except Exception as fehler:  # URLError, Zeitüberschreitung, abgebrochener Strom
        return 0, str(fehler).encode('utf-8', 'replace')


def erreichbar(basis: str, zeitlimit: float = 5.0) -> bool:
    status, _ = hole('/de/', basis, zeitlimit)
    return status == 200


def fehlerbericht(pfad: Path, basis: str, geprueft: int, fehler: list[tuple[str, str]]) -> None:
    pfad = Path(pfad)
    pfad.parent.mkdir(parents=True, exist_ok=True)
    zeilen = ['# Entitätenprüfung %s' % basis,
              '# %d Adressen geprüft, %d Fehler' % (geprueft, len(fehler)),
              '# Adresse Grund']
    zeilen += ['%s %s' % (url, grund) for url, grund in fehler]
    pfad.write_text('\n'.join(zeilen) + '\n', encoding='utf-8')


def bilanz(urls: list[str], fehler: list[tuple[str, str]]) -> list[tuple[str, int, int]]:
    """Je Gruppe geprüfte Adressen und Fehler, in der Reihenfolge des Laufs."""
    zaehler: dict[str, list[int]] = {}
    for url in urls:
        zaehler.setdefault(gruppe(url), [0, 0])[0] += 1
    for url, _ in fehler:
        zaehler.setdefault(gruppe(url), [0, 0])[1] += 1
    return [(name, werte[0], werte[1]) for name, werte in sorted(zaehler.items())]


def datenstand(daten: Path) -> tuple[int, int]:
    """Kennzeichen des Auslieferungsstands: mtime und Größe der Sitemap-Datei.

    Wird `phpdata` während eines Laufs neu gebaut, prüft der Lauf eine Adressliste
    gegen Seiten aus einem anderen Stand – das Ergebnis ist dann wertlos.
    """
    datei = Path(daten) / 'sitemaps.json'
    stand = datei.stat()
    return stand.st_mtime_ns, stand.st_size


def pruefe(urls: list[str], basis: str, threads: int, zeitlimit: float,
           schritt: int = 5000, wiederholungen: int = 1
           ) -> tuple[list[tuple[str, str]], list[str]]:
    """Prüft jede Adresse; liefert die echten Fehler und die erst im zweiten Versuch
    heilen Adressen. Eine Wiederholung fängt Sekundenschluckauf eines Servers ab,
    eine dauerhaft kaputte Seite bleibt ein Befund."""
    fehler: list[tuple[str, str]] = []
    wiederholt: list[str] = []
    sperre = threading.Lock()
    stand = [0]
    beginn = time.time()

    def eins(url: str) -> None:
        grund = None
        for versuch in range(wiederholungen + 1):
            status, rumpf = hole(url, basis, zeitlimit)
            grund = bewerte(status, rumpf)
            if grund is None:
                if versuch:
                    with sperre:
                        wiederholt.append(url)
                break
        with sperre:
            stand[0] += 1
            if grund:
                fehler.append((url, grund))
            if not stand[0] % schritt or stand[0] == len(urls):
                minuten = (time.time() - beginn) / 60
                print('[%6d/%d] %5.1f min, %d Fehler'
                      % (stand[0], len(urls), minuten, len(fehler)), flush=True)

    with ThreadPoolExecutor(max_workers=max(1, threads)) as pool:
        list(pool.map(eins, urls))
    return fehler, wiederholt


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--basis', default=VORSCHAU,
                        help='Basis-URL (Standard: lokale Vorschau %s)' % VORSCHAU)
    parser.add_argument('--daten', type=Path, default=DATEN,
                        help='Datenordner mit sitemaps.json (Standard: %s)' % DATEN)
    parser.add_argument('--sprache', default=','.join(SPRACHEN),
                        help='Sprachen, kommagetrennt (Standard: de,en,fr)')
    parser.add_argument('--art', default='',
                        help='Adressfilter, kommagetrennt, in der Schreibweise der '
                             'Adresse, z. B. gegenstand oder tat,gebiet')
    parser.add_argument('--stichprobe', type=int, default=0,
                        help='nur so viele Adressen prüfen (reproduzierbar)')
    parser.add_argument('--seed', type=int, default=0,
                        help='Startwert der Stichprobe (Standard: 0)')
    parser.add_argument('--threads', type=int, default=8,
                        help='gleichzeitige Anfragen (Standard: 8, passend zu den '
                             'acht Arbeitern der Vorschau)')
    parser.add_argument('--zeitlimit', type=float, default=30.0,
                        help='Sekunden je Anfrage (Standard: 30)')
    parser.add_argument('--wiederholungen', type=int, default=1,
                        help='Versuche nach einer gescheiterten Anfrage (Standard: 1)')
    parser.add_argument('--bericht', type=Path, default=BERICHT,
                        help='Zieldatei des Fehlerberichts (Standard: %s)' % BERICHT)
    parser.add_argument('--url', action='append', default=[],
                        help='einzelne Adresse prüfen, mehrfach möglich')
    parser.add_argument('--nur-liste', action='store_true',
                        help='nur die ausgewählten Adressen ausgeben, nichts aufrufen')
    optionen = parser.parse_args()

    basis = optionen.basis.rstrip('/')
    sprachen = tuple(s.strip() for s in optionen.sprache.split(',') if s.strip())
    arten = {a.strip() for a in optionen.art.split(',') if a.strip()} or None
    if optionen.url:
        urls, verfuegbar = sorted(set(optionen.url)), len(set(optionen.url))
    else:
        urls, verfuegbar = auswahl(lade_abschnitte(optionen.daten),
                                   sprachen=sprachen, arten=arten,
                                   stichprobe=optionen.stichprobe,
                                   seed=optionen.seed)
    if not urls:
        print('Keine Adresse passt zu dieser Auswahl.', flush=True)
        return 2
    print('Entitätenprüfung %s: %d von %d Adressen'
          % (basis, len(urls), verfuegbar), flush=True)
    if optionen.nur_liste:
        for url in urls:
            print(url)
        return 0
    stand_vorher = None if optionen.url else datenstand(optionen.daten)
    if not erreichbar(basis):
        print('Keine Vorschau unter %s. Erst `python3 tools/lokalserver.py` '
              'starten – ein zweiter Server wird hier nicht gestartet.' % basis,
              file=sys.stderr)
        return 2

    fehler, wiederholt = pruefe(urls, basis, optionen.threads, optionen.zeitlimit,
                                wiederholungen=optionen.wiederholungen)
    for name, geprueft, kaputt in bilanz(urls, fehler):
        if kaputt:
            print('  %-24s %6d geprüft, %d Fehler' % (name, geprueft, kaputt))
    fehlerbericht(optionen.bericht, basis, len(urls), fehler)
    if not optionen.url and datenstand(optionen.daten) != stand_vorher:
        print('Datenstand während des Laufs geändert (%s). Der Durchlauf prüft '
              'Adressen aus zwei Ständen – bitte wiederholen.' % optionen.daten,
              file=sys.stderr)
        return 2
    if fehler:
        for url, grund in fehler[:20]:
            print('  %s %s' % (url, grund))
        print('FAIL: %d von %d Adressen ohne 200. Bericht: %s'
              % (len(fehler), len(urls), optionen.bericht), flush=True)
        return 1
    nachsatz = (', %d erst nach Wiederholung' % len(wiederholt)) if wiederholt else ''
    print('PASS: %d Adressen, alle 200%s' % (len(urls), nachsatz), flush=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
