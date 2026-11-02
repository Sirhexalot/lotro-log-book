#!/usr/bin/env python3
"""Baut `dist-web/`: die Fassung, die auf sirhexalot.de hochgeladen wird.

Unterschiede zur lokalen Fassung:

- Karten liegen als WebP unter `karten/<sprache>/`, nicht als PNG.
- `fortschritt.js` ist **leer**. Der Besucher lädt seine eigene `Progress.lua`
  im Browser; Feldobars Stand wird nicht veröffentlicht.
- `index.html` bekommt den Bildpfad `karten/<sprache>/` mit.
- Impressum und Datenschutz liegen daneben.

Aufruf:

    python3 baue_website.py            # nach de/en
    python3 baue_website.py --ziel /tmp/web

Es wird nichts hochgeladen und nichts im Netz angefasst.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
WEB = HIER / 'web'
SPRACHEN = ('de', 'en')

DATEIEN = ('app.js', 'start.css', 'style.css', 'texte.js', 'sprache.js',
           'stand.js', 'start.html', 'start-en.html', 'impressum.html',
           'datenschutz.html')
BILDER = ('bild/start.jpg', 'bild/start-en.jpg')


def kopiere(ziel):
    for name in DATEIEN:
        quelle = WEB / name
        if not quelle.is_file():
            raise SystemExit('FEHLT: %s' % quelle)
        shutil.copy2(quelle, ziel / name)
    for name in BILDER:
        quelle = WEB / name
        if not quelle.is_file():
            raise SystemExit('FEHLT: %s' % quelle)
        (ziel / name).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(quelle, ziel / name)


def index_bauen(ziel):
    """index.html übernehmen und den Bildpfad der Website einsetzen."""
    text = (WEB / 'index.html').read_text(encoding='utf-8')
    einschub = ('<script>/* Website: Bilder liegen unter karten/<sprache>/. */\n'
                "window.MQL_BILD_PFAD = 'karten/{sprache}/';</script>\n")
    if '<script src="texte.js"></script>' not in text:
        raise SystemExit('index.html: erwarteter Script-Block fehlt')
    text = text.replace('<script src="texte.js"></script>',
                        einschub + '<script src="texte.js"></script>', 1)
    (ziel / 'index.html').write_text(text, encoding='utf-8')


def startseite_anpassen(ziel, sprache):
    """Der Fortschritt kommt auf der Website aus der Datei des Besuchers."""
    datei = ziel / ('start.html' if sprache == 'de' else 'start-en.html')
    text = datei.read_text(encoding='utf-8')
    if sprache == 'de':
        neu = ('<h3>Dein Fortschritt</h3>\n'
               '\t\t<p>Die Zahlen im Baum und die Farbe der Punkte kommen aus deiner\n'
               '\t\t<code>Progress.lua</code>. Öffne die Karte und wähle dort\n'
               '\t\t„Spielstand laden“ – die Datei wird im Browser gelesen und bleibt dort.\n'
               '\t\tEs gibt keinen Upload, kein Konto und keine Auswertung.</p>\n'
               '\t\t<p>Ohne Datei funktioniert die Karte trotzdem – sie zeigt dann nur keine\n'
               '\t\tZahlen und färbt keine Punkte. Es wird keine Null erfunden.</p>\n'
               '\t</section>')
        text = re.sub(r'<h3>Dein Fortschritt</h3>.*?</section>', neu, text,
                      count=1, flags=re.S)
    else:
        neu = ('<h3>Your progress</h3>\n'
               '\t\t<p>The numbers in the tree and the colour of the dots come from your\n'
               '\t\t<code>Progress.lua</code>. Open the map and choose “Load progress” –\n'
               '\t\tthe file is read in your browser and stays there. No upload, no\n'
               '\t\taccount, no tracking.</p>\n'
               '\t\t<p>Without the file the map still works — it simply shows no numbers\n'
               '\t\tand leaves the dots uncoloured. No zero is invented.</p>\n'
               '\t</section>')
        text = re.sub(r'<h3>Your progress</h3>.*?</section>', neu, text,
                      count=1, flags=re.S)
    datei.write_text(text, encoding='utf-8')


ZAEHLER = ('<script data-goatcounter="https://sirhexalot.goatcounter.com/count"\n'
           '        async src="//gc.zgo.at/count.js"></script>\n')


def zaehler_einbauen(ziel):
    """GoatCounter nur in die veröffentlichte Fassung, nicht lokal."""
    for name in ('index.html', 'start.html', 'start-en.html',
                 'impressum.html', 'datenschutz.html'):
        datei = ziel / name
        text = datei.read_text(encoding='utf-8')
        if 'goatcounter' in text:
            continue
        text = text.replace('</body>', ZAEHLER + '</body>', 1)
        datei.write_text(text, encoding='utf-8')

    # Der lokale Hinweis stimmt auf der Website nicht mehr.
    for name, alt, neu in (
        ('start.html',
         '<p class="leise">Diese Fassung läuft lokal. Es wird nichts hochgeladen und nichts\n\tnachgeladen.</p>',
         '<p class="leise">Diese Seite zählt nur anonyme Seitenaufrufe. Dein Fortschritt\n\tbleibt in deinem Browser.</p>'),
        ('start-en.html',
         '<p class="leise">This copy runs locally. Nothing is uploaded and nothing is\n\tloaded from the network.</p>',
         '<p class="leise">This site only counts anonymous page views. Your progress stays\n\tin your browser.</p>'),
    ):
        datei = ziel / name
        text = datei.read_text(encoding='utf-8')
        text = text.replace(alt, neu)
        datei.write_text(text, encoding='utf-8')


def fortschritt_leeren(ziel):
    """Keine persönlichen Zahlen veröffentlichen."""
    inhalt = ('/* Website: absichtlich leer. Der Besucher lädt seine eigene\n'
              '   Progress.lua; sie bleibt im Browser. */\n'
              'window.MQL_FORTSCHRITT = {"character":"","date":"","ids":[]};\n')
    (ziel / 'fortschritt.js').write_text(inhalt, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ziel', type=Path, default=HIER / 'dist-web')
    optionen = parser.parse_args()
    ziel = optionen.ziel

    # Quellen prüfen, bevor irgendetwas gelöscht wird.
    for sprache in SPRACHEN:
        for name in ('daten-%s.js' % sprache, 'webp/%s' % sprache):
            pfad = WEB / name if name.endswith('.js') else HIER / name
            if not pfad.exists():
                raise SystemExit('FEHLT: %s (build_daten.py bzw. baue_webp.py '
                                 'laufen lassen)' % pfad)

    if ziel.exists():
        shutil.rmtree(ziel)
    ziel.mkdir(parents=True)

    kopiere(ziel)
    index_bauen(ziel)
    fortschritt_leeren(ziel)
    for sprache in SPRACHEN:
        startseite_anpassen(ziel, sprache)
    zaehler_einbauen(ziel)

    download = WEB / 'download/mql-spielstand.zip'
    if not download.is_file():
        raise SystemExit('FEHLT: %s (baue_download.py laufen lassen)' % download)
    (ziel / 'download').mkdir(parents=True, exist_ok=True)
    shutil.copy2(download, ziel / 'download/mql-spielstand.zip')

    for sprache in SPRACHEN:
        shutil.copy2(WEB / ('daten-%s.js' % sprache), ziel / ('daten-%s.js' % sprache))
        shutil.copytree(HIER / 'webp' / sprache, ziel / 'karten' / sprache)

    # Prüfungen
    fehler = []
    for sprache in SPRACHEN:
        bilder = list((ziel / 'karten' / sprache).glob('*.webp'))
        daten = json.loads((HIER / ('daten/quests-%s.json' % sprache))
                           .read_text(encoding='utf-8'))
        erwartet = len({karte['bild'].replace('.png', '.webp')
                        for karte in daten['karten']})
        if len(bilder) != erwartet:
            fehler.append('%s: %d WebP, erwartet %d' %
                          (sprache, len(bilder), erwartet))

    impressum = (ziel / 'impressum.html').read_text(encoding='utf-8')
    if '[Name]' in impressum or '[Adresse]' in impressum:
        print('WARNUNG: impressum.html enthält noch Platzhalter '
              '([Name], [Adresse]) – vor dem Hochladen ausfüllen.')

    groesse = sum(f.stat().st_size for f in ziel.rglob('*') if f.is_file())
    print('geschrieben: %s' % ziel)
    for sprache in SPRACHEN:
        teil = sum(f.stat().st_size for f in (ziel / 'karten' / sprache).glob('*'))
        print('  karten/%-2s %4d Dateien  %5.1f MB' %
              (sprache, len(list((ziel / 'karten' / sprache).glob('*'))),
               teil / (1024 * 1024)))
    print('  gesamt          %5.1f MB' % (groesse / (1024 * 1024)))
    if fehler:
        for text in fehler:
            print('FEHLER: %s' % text, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
