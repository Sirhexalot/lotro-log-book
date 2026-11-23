"""Vergleich: veröffentlichte Seite gegen lokale Vorschau.

Nimmt je Adresse beide Fassungen, zieht Überschriften, Linkziele und die
sichtbaren Textzeilen heraus und meldet, was live steht und lokal fehlt.
Aufruf: python3 tools/vorschau_abgleich.py <adresse> [...]
"""
from __future__ import annotations

import html
import re
import sys
import urllib.request
from pathlib import Path

LIVE = 'https://llb.sirhexalot.de'
LOKAL = 'http://127.0.0.1:8817'


def hole(basis: str, pfad: str) -> str:
    anfrage = urllib.request.Request(basis + pfad, headers={'User-Agent': 'llb-abgleich'})
    with urllib.request.urlopen(anfrage, timeout=30) as antwort:
        return antwort.read().decode('utf-8', 'replace')


def text(roh: str) -> str:
    ohne = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', roh)
    ohne = re.sub(r'(?s)<[^>]+>', ' ', ohne)
    return re.sub(r'\s+', ' ', html.unescape(ohne)).strip()


def ueberschriften(roh: str) -> list[str]:
    treffer = re.findall(r'(?is)<h[123][^>]*>(.*?)</h[123]>', roh)
    return [text(t) for t in treffer if text(t)]


def links(roh: str) -> set[str]:
    ziele = set()
    for href in re.findall(r'(?is)<a\b[^>]*href="([^"]+)"', roh):
        href = html.unescape(href)
        if href.startswith('#'):
            continue
        # Nur Katalogziele vergleichen: Navigation und Fußzeile sind gleich.
        if re.search(r'^/(de|en|fr)/(aufgabe|quest|quete|tat|deed|prouesse|gegenstand|item|objet|'
                     r'rezept|recipe|recette|auftraggeber|quest-giver|donneur-de-quete|'
                     r'haendler|vendor|marchand|titel|title|titre|tugend|virtue|vertu|'
                     r'fraktion|faction|landmarke|landmark|site|set|ensemble|instanz|instance|'
                     r'gebiet|area|zone|region)/', href):
            ziele.add(href)
    return ziele


def abschnitte(roh: str) -> dict[str, int]:
    """Zählwerte, die sich live und lokal vergleichen lassen."""
    return {
        'links': len(links(roh)),
        'ueberschriften': len(ueberschriften(roh)),
        'zeilen': len(re.findall(r'(?i)<li\b', roh)),
        'karten': len(re.findall(r'class="llb-karte', roh)),
        'fakten': len(re.findall(r'class="llb-fakten"', roh)),
        'gaben': len(re.findall(r'class="katalog-gabe"', roh)),
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2
    fehler = 0
    for pfad in argv[1:]:
        try:
            live = hole(LIVE, pfad)
        except Exception as ausnahme:  # noqa: BLE001
            print('%s\n  live nicht lesbar: %s' % (pfad, ausnahme))
            continue
        try:
            lokal = hole(LOKAL, pfad)
        except Exception as ausnahme:  # noqa: BLE001
            print('%s\n  lokal nicht lesbar: %s' % (pfad, ausnahme))
            fehler += 1
            continue

        live_links, lokal_links = links(live), links(lokal)
        verloren = sorted(live_links - lokal_links)
        neu = sorted(lokal_links - live_links)
        zahlen_live, zahlen_lokal = abschnitte(live), abschnitte(lokal)

        print('\n%s' % pfad)
        print('  Zahlen live → lokal: ' + ', '.join(
            '%s %s→%s' % (k, zahlen_live[k], zahlen_lokal[k])
            for k in zahlen_live if zahlen_live[k] != zahlen_lokal[k]) or '  Zahlen gleich')
        print('  Linkziele: %d live, %d lokal' % (len(live_links), len(lokal_links)))
        if verloren:
            fehler += 1
            print('  FEHLT LOKAL (%d):' % len(verloren))
            for ziel in verloren[:20]:
                print('    - %s' % ziel)
        if neu:
            print('  NEU LOKAL (%d): %s' % (len(neu), ', '.join(neu[:6])))

        live_text, lokal_text = text(live), text(lokal)
        # Jede live sichtbare Zeile muss lokal wieder auftauchen.
        fehlende_zeilen = []
        for zeile in {z.strip() for z in re.split(r'(?<=[.!?])\s+|\s{2,}', live_text) if len(z.strip()) > 25}:
            if zeile not in lokal_text:
                fehlende_zeilen.append(zeile)
        if fehlende_zeilen:
            print('  TEXT LOKAL NICHT GEFUNDEN (%d):' % len(fehlende_zeilen))
            for zeile in fehlende_zeilen[:8]:
                print('    - %s' % zeile[:120])
    return 1 if fehler else 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
