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
3. **Meine Inhalte** (ganz oben, standardmäßig zugeklappt): Zugang nur für
   **kaufbare** Inhalte – Erweiterungen und Aufgabenpakete –, lokal pro Konto
   gespeichert (`mql.abenteuer.inhalte.v1`). Grundspiel und kostenlose Updates
   stehen nicht in der Liste, weil sie immer verfügbar sind. Eine einzige Liste,
   sortiert nach Einstiegsstufe wie die Karten, mit der Art hinter dem Namen;
   zwei Knöpfe setzen alle Käufe auf einmal. Eine Änderung färbt Zeile und Karte
   kurz ein, damit die Wirkung sichtbar ist.
4. **Abenteuerkarten**: Name, Art, redaktioneller Stufenbereich, Kurztext,
   Fortschritt und ein aufklappbarer Gebietsausschnitt. Auch 0 % wird angezeigt;
   ein fehlender Balken hieße sonst „unbekannt“ statt „nichts geschafft“.
5. **Fußnote**: Prozentwerte zählen einmalige Landschaftsaufgaben; ein fehlender
   Abschluss im Import belegt keinen Nichtbesuch.

Die Seite ist ohne JavaScript lesbar: Der Server rendert alle Abenteuer mit Namen,
Stufe und Gebieten. Fortschritt, Hinweise und Zugang entstehen im Browser.

## Karte (14.11.2026)

Die Seite hat zwei Ansichten: **Karte | Liste**. Die Karte ist eine Zugabe; ohne
JavaScript bleibt die Kartenliste die Seite, Schalter und Kartenbereich sind dann
ausgeblendet.

- **Welt:** die gezeichnete Mittelerde-Karte des Clients (`268437554`). Die sechs
  Regionsmarken sitzen auf den Pixelpositionen, mit denen das Spiel die Regionen
  auf dieser Karte verknüpft (`maps/links.xml`), nicht auf einer geschätzten
  Layoutposition.
- **Marke:** Ring = Katalogfortschritt der geprüften Gebiete, Randfarbe =
  Stufenpassung, Zahl = Gebiete mit einer bekannten nächsten Aufgabe. Ohne
  Import bleibt der Fortschritt unbekannt („–“), nicht 0 %.
- **Region:** die gezeichnete Regionskarte (z. B. Eriador) mit einem Punkt je
  Gebiet, das das Spiel direkt auf dieser Region verlinkt. Je Punkt zeigt der
  Ring den Fortschritt im Gebiet (Anteil erledigter Katalogaufgaben), die
  Kernfarbe die Stufenpassung. Ohne Import bleibt der Ring leer, statt 0 % zu
  behaupten. Die übrigen Gebiete stehen in der Liste unter der Karte; für sie
  wird kein Punkt erfunden. Unter der Karte steht das gewählte Gebiet mit
  Fortschritt, Stufenbereich, Stufenpassung, Anzahl nächster Aufgaben und
  Zugang.
- **Geländevorschau:** eine Kachel aus dem eigenen Client
  (`/gelaende/<stand>/thumb/<karte>.webp`), sonst die gezeichnete Gebietskarte.
  Keine Questmarker: diese Seite kennt keine Aufgabenpositionen. Knöpfe führen
  mit `?vorkarte=<karte>` in die Kartenansicht und, wenn vorhanden, zur
  Gebietsseite.
- **Hinweise:** „Auf der Karte zeigen“ springt in die Region des vorgeschlagenen
  Gebiets. Keine Route, keine Zusicherung, dass eine Aufgabe im Spiel offen ist.
- **Gebiete als Liste:** aufklappbar unter der Regionskarte; dort stehen alle
  Gebiete, auch die ohne eigenen Kartenpunkt.
- Die gewählte Ansicht liegt lokal unter `mql.abenteuer.ansicht`.

Daten: `tools/build_abenteuer.py` ergänzt je Gebiet `region` (die tier-1-Karte
aus `daten/karten.json`) und schreibt `positions` aus `maps/links.xml`:
`world` für die sechs Regionen, `areas` für die direkt verlinkten Gebiete (52
der 153). Unbenannte Unterkarten (zwei Osgiliath-Varianten, zwei Alt-Anórien-
Varianten, eine Nan-Ogol-Karte) werden nicht als eigene Gebiete geführt: ihre
Aufgaben zählen bei der benannten Landschaft, unter der sie hängen. `Adventures.php` liefert die sechs Regionen mit übersetzten Namen aus
der Kartentabelle, ihre Positionen und die vorhandenen Gebietsseiten.
Fortschritt, Stufenpassung und nächste Aufgaben kommen aus derselben
Browserlogik wie die Karten.

Eine **durchgehende Geländewelt** gibt es bewusst nicht: Die Gebietsrahmen
überlappen sich vielfach, die Geländeübersichten sind nur zu 41–77 % belegt,
und gezeichnete Grenzen fehlen in den Daten. Die Regionskarte nutzt deshalb die
vollständige Spielkartenzeichnung.

## Daten

- `referenz/inhaltspakete.json` (Schema 2): je Abenteuer stabile Kennung,
  Reihenfolge (Erscheinen), Art, Veröffentlichung, Namen und Kurztext in DE/EN/FR,
  redaktioneller Stufenbereich (`levels`, `level_source: editorial`), Landschafts-
  Wurzeln, ausdrückliche Ausschlüsse und der Prüfumfang (`review: landscape`).
  Englische Namen sind die offiziellen Produktnamen; deutsche und französische
  Titel sind redaktionelle Übersetzungen mit den Landschaftsnamen des Clients.
  Aufgabenpakete und kostenlose Updates tragen statt `name` ein `name_map` und
  heißen damit in jeder Sprache so, wie der Client die Landschaft nennt.
  `free: true` markiert immer verfügbare Inhalte (Grundspiel, Updates); alle
  anderen sind kaufbar und erscheinen in „Meine Inhalte“.
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

Lokaler Bestand am 11.11.2026: 32 Abenteuer (15 Erweiterungen einschließlich Grundspiel, 12 Aufgabenpakete, 5 kostenlose Updates), 153 Gebiete, 7.821 einmalige Aufgaben.

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
- Zugang: kaufbare Inhalte aus der gespeicherten Angabe; Grundspiel und kostenlose
  Updates sind immer verfügbar. VIP-Regeln
  werden nur mit ausdrücklich geprüften Feldern berücksichtigt. „Unbekannt“ heißt
  nicht „nicht gekauft“; nur ausdrücklich fehlender Zugang nimmt ein Abenteuer aus
  den Hinweisen, nicht aus der Liste.

## Grenzen

- Die Karte ist eine Zugabe zur Kartenliste. Sie zeigt keine durchgehende
  Geländewelt und keine gezeichneten Grenzen. Regions- und Gebietspunkte kommen
  aus den Kartenverknüpfungen des Spiels; nicht verlinkte Gebiete bleiben ohne
  Punkt. Die Geländevorschau gilt je Gebiet, nicht für die Welt.
- Keine Kaufberatung: der Katalog belegt Aufgaben, keine Zugangsrechte. Freigaben
  für VIP und kostenlose Inhalte sind noch nicht geprüft.
- Keine Erweiterungsbilder: eigene Kartenausschnitte waren als Sigel zu klein und
  unruhig, offizielle Motive fehlen für die älteren Erweiterungen. Die Karten
  tragen nur Text.
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
den echten Front-Controller und prüfen Karten, Namen, Stufen, Regionsmarken und
Assets. `test_abenteuer.js` prüft zusätzlich die Regionssummen (Fortschritt,
Stufenband aus den redaktionellen Abenteuerbereichen, Anschlüsse).
