# Abenteuerüberblick – Umsetzungsstand

## Ziel

Eine Seite, die nach einer Spielpause die Frage „Wo spiele ich weiter?“ beantwortet,
ohne die Welt in Untergebiete zu zerlegen: die großen Inhalte als Karten, mit
persönlichem Stand, passender Stufe und zwei Hinweisen. Ältere, überlevelte Inhalte
bleiben gleichberechtigt sichtbar; die Seite gibt keine Route vor.

Öffentliche Adressen: `/de/abenteuer/`, `/en/adventure/`, `/fr/aventure/`.
Menü: **Welt → Abenteuerüberblick**.

## Aufbau

1. **Kopf** mit gewähltem Charakter und Stufe (aus dem vorhandenen Charakterspeicher).
2. **Zwei Hinweise**: „Altes zu Ende bringen“ und „Passt zu deiner Stufe“. Ohne
   belastbaren Vorschlag steht dort ein Hinweis, keine erfundene Empfehlung.
3. **Meine Inhalte**: Zugang je Abenteuer (vorhanden / nicht vorhanden / unbekannt),
   lokal pro Konto gespeichert (`mql.abenteuer.inhalte.v1`). Jede Zeile zeigt das
   Sigel und den Fortschritt des Abenteuers; zwei Knöpfe setzen alle Erweiterungen
   auf einmal. Eine Änderung färbt Zeile und Karte kurz ein, damit die Wirkung
   sichtbar ist. Das Grundspiel ist frei und wird von „Alles nicht vorhanden“
   ausgelassen.
4. **Abenteuerkarten**: Sigel, Name, Art, redaktioneller Stufenbereich, Kurztext,
   Fortschritt und ein aufklappbarer Gebietsausschnitt. Auch 0 % wird angezeigt;
   ein fehlender Balken hieße sonst „unbekannt“ statt „nichts geschafft“.
5. **Fußnote**: Prozentwerte zählen einmalige Landschaftsaufgaben; ein fehlender
   Abschluss im Import belegt keinen Nichtbesuch.

Die Seite ist ohne JavaScript lesbar: Der Server rendert alle Abenteuer mit Namen,
Stufe und Gebieten. Fortschritt, Hinweise und Zugang entstehen im Browser.

## Sigel

`tools/hole_abenteuer_bilder.py` legt je Abenteuer ein quadratisches Bild in
`web/bild/abenteuer/<id>.webp` ab (160 px, nicht im Git wie die übrigen
gebauten Bilder). Zwei Herkünfte stehen in `web/bild/abenteuer/quellen.json`:

- `official`: Titelbild der offiziellen Shop-Seite https://www.lotro.com/expansions
  (Standard-Edition), ohne Editionsbalken zugeschnitten. Das sind Werbemotive von
  Standing Stone Games/Daybreak; eine Rechtefreigabe leiten wir daraus nicht ab.
- `map`: Ausschnitt unserer eigenen Spielkarte, wo es auf der Shop-Seite kein
  offizielles Motiv mehr gibt (Grundspiel und die älteren Erweiterungen).

Die Seite bindet ein Sigel nur ein, wenn die Datei existiert; fehlt sie, bleibt
die Karte ohne Bild. Ersetzen lässt sich jedes Motiv durch eine gleichnamige Datei.

## Daten

- `referenz/inhaltspakete.json` (Schema 2): je Abenteuer stabile Kennung,
  Reihenfolge (Erscheinen), Art, Veröffentlichung, Namen und Kurztext in DE/EN/FR,
  redaktioneller Stufenbereich (`levels`, `level_source: editorial`), Landschafts-
  Wurzeln, ausdrückliche Ausschlüsse und der Prüfumfang (`review: landscape`).
  Englische Namen sind die offiziellen Produktnamen; deutsche und französische
  Titel sind redaktionelle Übersetzungen mit den Landschaftsnamen des Clients.
- `tools/build_abenteuer.py` erzeugt daraus je Sprache `abenteuer.json` für die
  Seite und `web/abenteuer-<sprache>.js` für den Browser. Beides ist identisch.
- Aufgabe→Abenteuer: die tiefste Karte im `fk`-Pfad, die zu genau einem Abenteuer
  gehört. Ein ausgeschlossener Zweig schneidet den ganzen Teilbaum ab, damit
  später erschienene Inhalte nicht über eine alte Landschaft geerbt werden
  (Wildwald, Winkel am Mitheithel, Carn Dûm danach, Wohngebiete, Frostbluff;
  Morgultal gehört zu Minas Morgul, nicht zu Mordor; Ältestental nicht zu Gundabad;
  Hatokáli-Hügel nicht zu Harad).
- Gezählt werden einmalige Landschaftsaufgaben; Wiederholbares, Tägliches,
  Sitzungsspiele, Instanzen und technische Einträge entfallen. Ausschließende
  Alternativen mit belegtem Abschluss bleiben, sonst fällt der tote Zweig aus dem
  Nenner. Der Gesamtprozentwert summiert Aufgaben, nicht Gebietsprozente.
- Gebietsstufen sind aus Aufgaben abgeleitet (p10–p90) und nur für Reihenfolge und
  Weitergehen gedacht. Der angezeigte Stufenbereich eines Abenteuers ist
  redaktionell und keine Messung im Client.
- Zuordnungsumfang: Landschaftsebene geprüft. Einzelne später ergänzte Aufgaben
  innerhalb einer alten Landschaft sind nicht ausgeschlossen; das steht als
  Einschränkung in den erzeugten Daten.

Lokaler Bestand am 11.11.2026: 15 Abenteuer, 105 Gebiete, 5.493 einmalige Aufgaben.

## Logik

`web/abenteuer-logik.js`, unabhängig von der Oberfläche testbar:

- Fortschritt je Abenteuer und Gebiet; ohne Import bleibt er unbekannt (`null`),
  nicht 0 %.
- Zustand: `started`, `complete`, `unrecorded` (Import da, kein Abschluss),
  `no_content`, `unknown` (kein Import).
- Stufeneignung: `below` (Inhalt unter der Charakterstufe), `fits`, `above`
  (Inhalt für höhere Stufen), `unknown`.
- „Altes zu Ende bringen“: begonnen, unvollständig, nicht unter der Stufe des
  Charakters zu hoch, Zugang nicht ausdrücklich fehlend; frühester Stufenbereich,
  dann geringste Abdeckung.
- „Passt zu deiner Stufe“: Stufenbereich umfasst die Charakterstufe, begonnene
  Abenteuer zuerst; nie dasselbe Abenteuer wie der erste Hinweis.
- Nächster Schritt im Abenteuer: frühestes Gebiet mit einer Aufgabe, deren bekannte
  Voraussetzungen erfüllt sind. Das ist keine Zusicherung aktueller Annehmbarkeit.
- Zugang: Grundspiel frei; sonst gespeicherte Angabe. VIP und kostenlose Regeln
  werden nur mit ausdrücklich geprüften Feldern berücksichtigt. „Unbekannt“ heißt
  nicht „nicht gekauft“; nur ausdrücklich fehlender Zugang nimmt ein Abenteuer aus
  den Hinweisen, nicht aus der Liste.

## Grenzen

- Keine Karten-, Stern- oder Netzansicht: die Kartenübersicht ist die beschlossene
  Hauptansicht. Geometrie und Weltkartenprojektion bleiben unberührt.
- Keine Kaufberatung: der Katalog belegt Aufgaben, keine Zugangsrechte. Freigaben
  für VIP und kostenlose Inhalte sind noch nicht geprüft.
- Offizielle Motive liegen nur für die noch im Shop gelisteten Erweiterungen vor;
  ältere Abenteuer zeigen einen Kartenausschnitt statt eines Logos.
- Zugangseinstellungen sind noch nicht in der Sicherung des Charakterspeichers
  enthalten; sie liegen nur lokal unter ihrem eigenen Schlüssel.
- Die Reihenfolge innerhalb eines Abenteuers ist aus Gebietsstufen abgeleitet, nicht
  als Geschichte kuratiert.
- Kein Gesamt-Prozentwert über ganz Mittelerde.

## Prüfungen

```bash
python3 -m unittest tests.test_abenteuer tests.test_abenteuer_seite
node tests/test_abenteuer.js
```

Die Seitentests rendern `/de/abenteuer/`, `/en/adventure/` und `/fr/aventure/` über
den echten Front-Controller und prüfen Karten, Namen, Stufen und Assets.
