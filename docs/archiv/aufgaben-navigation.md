# Aufgaben-Navigation für LOTRO Log Book

**Planstand:** 16. November 2026
**Status:** umgesetzt und veröffentlicht; Restabnahme einzelner Randfälle offen.

Dieses Dokument bündelt den vollständigen Plan für Aufgaben im LOTRO Log Book,
die bisherigen UI-Renderings, die verworfenen Zwischenstände und die
verbindlichen Entscheidungen. Es beschreibt ausschließlich die Website. Die
separate Aufgabenansicht im Plugin **Magic Quest Log 0.5.4** ist bereits
umgesetzt und wird hier nur als Referenz erwähnt.

## Ziel

Die Website soll zwei klare Wege anbieten: Gebiete führen über ihre
vollständigen Kacheln und Untergebietslinks in die Kartenansicht; Themen führen
mit passender Vorauswahl in den separaten Aufgabenfinder.

- Die Gebietsübersicht bleibt vollständig; der Finder ist über einen
  prominenten Button erreichbar und kein Hauptmenüpunkt.
- Epische Aufgaben behalten ihre Reihenfolge nach Band, Buch und Kapitel.
- Eine Aufgabe führt von der Katalogseite nachvollziehbar zu Gebiet, Karte,
  Auftraggeber, Ziel und gegebenenfalls Reiseplaner.
- Belegte Daten werden sichtbar gemacht; fehlende Daten werden nicht geraten.
- Die Oberfläche funktioniert ohne Spielstand, mit importiertem Spielstand,
  ohne JavaScript als Grundinhalt sowie in DE, EN und FR.
- Die Navigation bleibt für Aufgaben und Taten gemeinsam verständlich, ohne
  Taten-Navigation oder `/de/abenteuer/` unnötig umzubauen.

## Verbindliche Endentscheidung (16.11.2026)

Die folgenden Regeln ersetzen die früheren Zielbilder eines gemeinsamen
Aufgabenbaums und eines darin eingebetteten Aufgabenbrowsers. Diese älteren
Entwürfe bleiben weiter unten als Historie erhalten, sind aber **keine
Umsetzungsvorgabe**.

### 1. Aufgabenseite: Gebiete bleiben der Hauptinhalt

- Die bestehende Landschafts-/Gebietsübersicht bleibt vollständig erhalten:
  **keine Gebietskachel und kein Untergebietslink darf beim Umbau entfallen**.
- Die bestehenden Gruppierungen und Sprungmarken nach Region bleiben erhalten.
  Eine Gebiets- oder Untergebietsauswahl führt in die passende Kartenansicht.
- Bestehende Reihenfolge, Kartenbilder, Gebietsinformationen und Links werden
  nicht durch Platzhalter, verkürzte Beispielraster oder eine neue
  Baumansicht ersetzt.
- Ein prominenter Button **„Alle Aufgaben im Finder“** steht rechts neben der
  Aufgabenseiten-Überschrift in derselben Zeile und führt zur separaten
  Finder-Anwendung. Der Finder wird **kein Navigationspunkt** im Hauptmenü.
- Der Finder wird nicht in die Kartenübersicht eingebettet. Die Aufgabenseite
  bleibt der Einstieg über Gebiete und Themen; der Finder ist die Suche über
  den vollständigen Aufgabenbestand.

### 2. Themen-Einstiege

Die Seite bietet zusätzlich zu den Gebieten Themen-Einstiege. Ein Themen-Einstieg
öffnet den Finder mit dem jeweiligen Thema vorausgewählt. Die Themen folgen
den belegten Gruppen des Plugin-Aufgabenbaums; keine Kategorien aus
Aufgabennamen erraten.

Verbindliche Seitenstruktur für Mockup und Umsetzung:

```text
Aufgabenseite
├─ Überschrift mit rechtsbündigem Button „Alle Aufgaben im Finder“
├─ Regionssprungmarken
├─ alle vorhandenen Gebietskacheln und Untergebietslinks
├─ eigener Bereich „Alte Geschichten“ mit den drei belegten Karten
└─ Themen-Einstiege
   ├─ Epische Geschichte → Kartenansicht
   └─ alle übrigen Themen → separater Finder mit Themenvorauswahl

Aufgabenfinder (eigene Seite, kein Hauptmenüpunkt)
├─ Suche und Trefferzahl
├─ Filterspalte: Thema / Klasse / Herkunft / Region und Gebiet /
│                 Merkmale / Stufe / Fortschritt
└─ Trefferliste mit Statusfarbe + Symbol/Text und Karten-/Gebietslink
```

Das Diagramm legt die inhaltlichen Bereiche fest, nicht eine Pixelposition.
Die bestehenden Gebietsgruppen, Kacheln und Untergebietslinks sind maßgeblich;
kein Bereich darf sie durch eine reduzierte Beispieldarstellung ersetzen.

- **Epische Geschichte** öffnet die Kartenansicht mit der epischen
  Aufgabenstruktur. Bände/Reihen, Bücher und Kapitel bleiben in ihrer
  erzählerisch/numerisch korrekten Reihenfolge.
- **Klassenaufgaben** öffnet den Finder mit dem Thema „Klassenaufgaben“
  vorausgewählt.
- **Herkunftsaufgaben** öffnet den Finder mit dem Thema „Herkunftsaufgaben“
  vorausgewählt.
- **Feste und Ereignisse**, **Missionen**, **Instanzen und Schlachten**,
  **Handwerk**, **Aufgabenbrett** und **Weitere Aufgaben** öffnen jeweils den
  Finder mit dem passenden Thema vorausgewählt.
- Klassen- und Herkunftsthemen bleiben als Einstieg bestehen, obwohl es im
  Finder zusätzlich eigene Filter für einzelne Klassen und Herkünfte gibt.
- **Aufgabenbrett ist ausschließlich ein Thema.** Es darf keine eigene
  Aufgabenbrett-Filtergruppe und keine doppelte Aufgabenbrett-Auswahl geben.
- Eine Überschrift wie „Weitere Inhalte“ darf Themen auf der Aufgabenseite
  optisch gruppieren. Sie ist kein auswählbares Thema, kein zusätzlicher
  Navigationsknoten und keine künstliche Filterhülle.

### 3. Eigener Aufgabenfinder

Der Finder ist eine separate Anwendungsseite mit Suchfeld, Filterspalte und
Trefferliste. Filtergruppen sind:

1. **Thema** – einschließlich Aufgabenbrett und Klassen-/Herkunftsthemen
2. **Klasse** – eigene Filtergruppe für einzelne Klassen
3. **Herkunft** – eigene Filtergruppe für einzelne Herkünfte/Völker
4. **Region und Gebiet**
5. **Merkmale** – belegte Aufgabenmerkmale, aber kein Aufgabenbrett
6. **Stufe**
7. **Fortschritt**

Die sichtbare Reihenfolge der Filtergruppen beginnt mit **Fortschritt → Stufe
→ Region und Gebiet → Thema**. Danach folgen Klasse, Herkunft und Merkmale.
Thema, Klasse und Herkunft sind getrennte, kombinierbare Filtergruppen.
Auswahloptionen und Bezeichnungen müssen aus belegten Quelldaten stammen;
keine Klasse, Herkunft oder Zuordnung aus einem Aufgabennamen erschließen.
Ein Themen-Einstieg setzt nur seinen Themenfilter voraus, nicht automatisch
Klasse oder Herkunft.
Bei **Region und Gebiet** ersetzt eine engere Gebiets-Auswahl die bereits
gewählte übergeordnete Region. Eine breite Region darf eine Gebiets-Auswahl
nicht per Oder-Verknüpfung wieder auf die ganze Region erweitern.

Der Fortschrittsfilter steht **in der Filterspalte**, nicht als Leiste über
Suche oder Trefferliste. Er bietet „Alle“, „Offen“ und „Erledigt“; „Annehmbar“
gibt es nur, wenn ein Spielstand importiert ist. Für die Machbarkeit gelten
dieselben Regeln wie in `app.js`: laufende Aufgaben zählen als offen,
Voraussetzungen `v`/`vo`, Stufenbegrenzung und Sperre `vb` werden berücksichtigt;
erledigte Ausschlussalternativen sperren die Machbarkeit.

Jeder Treffer macht seinen Fortschritt direkt erkennbar. Verwendet werden die
**bestehenden Statusfarben** aus `web/style.css` und der Kartenlegende:
erledigt `--fertig` (grün), offen `--offen` (orange), laufend `--laufend`
(blau). Farbe ist nie das einzige Signal; Symbol und Statustext benennen den
Zustand zusätzlich. Eine laufende Aufgabe bleibt als „läuft“ gekennzeichnet;
Teilziele dürfen nicht als eigener Gesamtstatus „erledigt“ erscheinen. Ohne
importierten Spielstand bleibt der Status neutral. Fehlender Import darf weder
als „offen“ noch als „nicht erledigt“ dargestellt werden.

Suchbegriff und Filterzustand müssen über URL und Zurücksetzen nachvollziehbar
sein. Treffer öffnen über ihre stabile Aufgaben-ID den belegten Karten-/Gebiets-
Kontext. Ohne belegten Kartenort bleibt eine Aufgabe im Finder auffindbar,
erhält aber keine erfundene Karte oder Position.

### 4. Alte Geschichten

„Alte Geschichten“ bleibt ein eigener Bereich neben den normalen Regionen und
Themen. Dafür gibt es Kartendaten, Kartenbilder und Kartenrahmen; der Bereich
führt deshalb **in die Kartenansicht**, nicht in den Finder.

Belegte Karten und Aufgabenbezüge aus `web/karten-kurz-de.js`:

| Karte | Karten-ID | Aufgaben mit Kartenbezug |
| --- | ---: | ---: |
| Belagertes Mordor | `268453374` | 81 |
| Azanulbizar, 2799 D.Z. | `268453555` | 101 |
| Nud-melek, 1981 D.Z. | `268453582` | 0 |

Die 182 Aufgaben mit Kartenbezug sind die Summe der ersten beiden Karten;
Nud-melek bleibt trotz null zugeordneter Aufgaben als belegte Karte sichtbar.
Diese Zähler sind eine geprüfte Datenaufnahme vom 16.11.2026, keine dauerhaft
festen Werte. Bei einer Umsetzung sind sie aus den aktuellen Quelldaten zu
ermitteln, nicht als Konstanten einzutragen.

### 5. Mockup- und Umsetzungsgrenzen

- Ein Mockup muss die echte Gebietsübersicht vollständig zeigen oder klar
  kenntlich machen, dass es nur ein Ausschnitt ist. „Weitere Gebiete folgen“,
  leere Regionsüberschriften und Beispielkacheln sind kein vollständiges
  Mockup.
- Vor Codeänderungen wird das vollständige Mockup gegen diese Struktur geprüft:
  Regionsnavigation, sämtliche Gebietskacheln/Untergebietslinks, Alte
  Geschichten mit Karten, Themen-Einstiege, Button und separate Finder-Seite.
- Das Mockup muss Aufgabenseite **und** separate Finder-Zielseite zeigen.
- Im Finder-Mockup liegt Fortschritt in der Filterspalte; eine Fortschrittsleiste
  über der Suche/Trefferliste ist falsch.
- Die Trefferliste zeigt Statusfarben gemäß Kartenlegende; bei fehlendem
  Spielstand bleibt der Status neutral.
- Klasse und Herkunft stehen als separate Filtergruppen neben Thema.
- Aufgabenbrett erscheint unter Thema und nirgends als eigene Filtergruppe.
- Layoutdetails, die nicht ausdrücklich beschlossen sind, bleiben Vorschläge
  und dürfen die obigen Regeln nicht verändern.

## Rendering 1: ursprünglicher Entwurf – Umschalter

**Status: verworfen.**

Der erste Entwurf trennte zwei Strukturen:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Aufgaben                                      [Nach Landschaft ▾]    │
├──────────────────────────────────────────────────────────────────────┤
│ Suche …                 [Alle] [Offen] [Erledigt] [Machbar]          │
├──────────────────────┬──────────────────────────┬───────────────────┤
│ Landschaft / Thema   │ Karte                    │ Details           │
│                      │                          │                   │
│ Eriador              │      4:3-Spielkarte      │ Beschreibung       │
│ Rhovanion            │      Auftraggeber         │ Ziele eingeklappt  │
│ Epische Geschichte   │      Ziele / Marker       │ Belohnungen        │
│ Klassenaufgaben      │                          │                   │
└──────────────────────┴──────────────────────────┴───────────────────┘
```

Warum verworfen:

- Ein Umschalter versteckt jeweils die andere sinnvolle Orientierung.
- Filter- und Auswahlzustand mussten für zwei Strukturen synchronisiert
  werden.
- Nutzer erwarten sowohl die Landschaft als auch das Thema in derselben
  Aufgabenübersicht.

## Rendering 2: Zwischenstand – vier thematische Einstiege

**Status: verworfen beziehungsweise nur als historische Skizze erhalten.**

Der Experiment-Worktree enthielt einen Zwischenstand mit Einstiegskacheln
oberhalb des Landschaftsbaums:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Aufgaben                                                            │
│ Finde Aufgaben nach Ort oder Inhalt.                                │
├───────────────────────┬───────────────────────┬──────────────────────┤
│ Epische Geschichte    │ Klassenaufgaben       │ Herkunftsaufgaben    │
│ Bände, Bücher …       │ Aufgaben deiner Klasse│ Aufgaben deiner Rasse│
├───────────────────────┼───────────────────────┼──────────────────────┤
│ Feste und Ereignisse  │                                           │
│ Zeitlich begrenzte …  │                                           │
└───────────────────────┴────────────────────────────────────────────┘
│ Landschaften nach Region                                             │
│ [Eriador] [Rhovanion] [Rohan] …                                     │
```

Die Kacheln waren als schneller Einstieg nützlich. Die damalige Begründung,
Themen deshalb in denselben Baum wie die Gebiete aufzunehmen, wurde am
16.11.2026 verworfen. Die beschlossene Fassung nutzt getrennte Themen-Einstiege
und einen separaten Finder; siehe die verbindliche Endentscheidung oben.

## Rendering 3: früheres Zielbild – gemeinsamer Aufgabenbaum

**Status: überholt am 16.11.2026; nicht umsetzen.** Die Skizze zeigt einen
gemeinsamen Themen-/Gebietsbaum und einen darin eingebetteten Aufgabenbrowser.
Beides widerspricht der jetzt verbindlichen separaten Finder-Seite. Maßgeblich
ist ausschließlich die „Verbindliche Endentscheidung“ oben.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ LOTRO Log Book   Suche …                              Charakter ▾  Sprache │
├────────────────────────────────────────────────────────────────────────────┤
│ Startseite › Aufgaben                                                      │
├────────────────────────────────────────────────────────────────────────────┤
│ Aufgaben                                                                    │
│ Landschaften und Themen                                                     │
│                                                                            │
│ [Eriador]          [Rhovanion]        [Rohan]          [Gondor]             │
│ [Mordor]           [Haradwaith]       [Rhûn]           [Alte Geschichten]   │
│                                                                            │
│ [Epische Geschichte] [Klassenaufgaben] [Herkunftsaufgaben]                 │
│ [Feste und Ereignisse] [Missionen] [Instanzen und Schlachten]              │
│ [Handwerk]                                  [Weitere Aufgaben]             │
│                                                                            │
│ Bereiche sind gleichrangig; jede Kachel nennt Treffer-/Fortschrittszahlen. │
├────────────────────────────────────────────────────────────────────────────┤
│ Suche in Aufgaben …       [Alle] [Offen] [Erledigt] [Machbar]              │
│                                                                            │
│ Eriador                                                                    │
│ ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────────────┐ │
│ │ Auenland           │ │ Breeland           │ │ Ered Luin               │ │
│ │ 128 Aufgaben       │ │ 214 Aufgaben       │ │ 96 Aufgaben              │ │
│ │ Fortschritt …      │ │ Fortschritt …      │ │ Fortschritt …            │ │
│ └────────────────────┘ └────────────────────┘ └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

Die folgenden damaligen Regeln sind ebenfalls überholt und dürfen nicht als
aktuelle Vorgabe verwendet werden:

- Regionen und Landschaften folgen der belegten Spielkartenhierarchie.
- Landschaften werden innerhalb einer Region in der vereinbarten Reihenfolge
  gezeigt; technische oder namenlose Karten werden nicht als Landschaft
  ausgegeben.
- Thematische Knoten führen direkt in ihre vorhandenen Gruppen.
- Epische Geschichte zeigt Band → Buch → Kapitel → Aufgaben.
- Aufgaben ohne sichere Landschaftszuordnung bleiben in „Weitere Aufgaben“
  auffindbar; es werden keine Kartenpositionen erfunden.
- Die Kachelansicht darf auf Desktop mehrspaltig und auf Mobil einspaltig
  werden. Suche und Fortschrittsfilter bleiben sichtbar beziehungsweise
  erreichbar.

## Rendering 4: früheres Zielbild – Aufgabenbrowser in der Kartenansicht

**Status: überholt am 16.11.2026; nicht als Layoutvorgabe verwenden.** Die
Skizze mischt Gebietsbaum, Kartenansicht und Aufgabenliste in einem Browser.
Der jetzt beschlossene Finder ist eine eigene Anwendung mit Filterspalte und
Trefferliste; Gebiets-/Themen-Einstiege bleiben auf der separaten Aufgabenseite.

```text
Desktop
┌──────────────────────┬─────────────────────────────────────────────────────┐
│ Aufgabenbrowser      │ Aufgaben in Eriador › Auenland                      │
│                      │                                                     │
│ Suche …              │ 214 Aufgaben · Stufe 1–15                          │
│ [Alle]               │ [Erledigte ausblenden] [Sortierung ▾]               │
│ [Offen]              │                                                     │
│ [Erledigt]           │ ┌─────────────────────────────────────────────────┐ │
│ [Machbar]            │ │ Eine unerwartete Party       Stufe 5 · Michelbinge│ │
│                      │ │ Auftraggeber: … · 3 Ziele · Belohnungen …       │ │
│ Eriador              │ └─────────────────────────────────────────────────┘ │
│  ├ Auenland          │ ┌─────────────────────────────────────────────────┐ │
│  ├ Breeland          │ │ Ein alter Freund             Stufe 7 · Hobbingen │ │
│  └ Ered Luin         │ │ …                                                │ │
│                      │ └─────────────────────────────────────────────────┘ │
└──────────────────────┴─────────────────────────────────────────────────────┘

Mobil
┌──────────────────────────────┐
│ ‹ Alle Aufgaben              │
│ Aufgaben in Auenland         │
│ [Suche …]                    │
│ [Filter · 4]                 │
│ 214 Aufgaben                 │
│ ┌──────────────────────────┐ │
│ │ Eine unerwartete Party   │ │
│ │ Stufe 5 · Michelbinge   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Ein alter Freund         │ │
│ └──────────────────────────┘ │
│ [Liste] [Karte] [Details]   │
└──────────────────────────────┘
```

Diese damaligen Bedienungsregeln sind nur dort weiter gültig, wo sie nicht der
verbindlichen Endentscheidung widersprechen:

- Suche, Filter und Sortierung stehen in der Adresse beziehungsweise im
  lokalen Filtergedächtnis, sofern die Seite eine Anwendungsliste ist.
- Filter zählen aus den Treffern; gewählte Werte bleiben sichtbar.
- Stufe, Gebiet, Art, Auftraggeber und Fortschritt stammen aus derselben
  Aufgabe und dürfen nicht aus getrennten Datensätzen kombiniert werden.
- Listen laden beim Scrollen nach; kein separater „Mehr“-Knopf.
- Tastaturfokus, Pfeiltasten, Enter, Escape und ausreichende Touch-Ziele
  werden getestet.

## Rendering 5: Karte und Details

**Status: Zielbild; bestehende Kartenregeln gelten weiter.**

```text
┌────────────── Aufgabenliste ─────────────┬──────────── Karte ───────────┬──── Details ────┐
│ ‹ Alle Landschaften                       │ Legende: ● Geber ○ Ziel     │ Eine Aufgabe    │
│ Auenland                                  │ [Filter] [Vorkommen]         │                 │
│  ✓ Eine unerwartete Party                 │ [Questgeber anzeigen]       │ Beschreibung    │
│    Ein alter Freund                       │                              │ Auftraggeber   │
│                                           │         4:3-Karte            │ Voraussetzungen│
│                                           │       ●       ○              │ Belohnungen    │
│                                           │                              │ [Ziele einblenden]│
└───────────────────────────────────────────┴──────────────────────────────┴─────────────────┘
```

Regeln:

- Desktop: Liste, Karte und Details in drei Spalten; die Listenspalte ist
  ziehbar und speichert ihre Breite lokal.
- Die Karte bleibt unverzerrt im Verhältnis 4:3. Kein Zoom, Verschieben oder
  Reset-Knopf.
- Die Karte folgt bei Auswahl dem Auftraggeber auf die kleinste belegte
  passende Karte; eingeblendete Ziele suchen eine gemeinsame belegte Karte.
- Gleiche Orte werden als Sammelmarker mit Anzahl gebündelt. Hover und Auswahl
  verbinden Marker und Listenzeile.
- Questgeber, Ziele, Jagdorte und Orte zugehöriger Aufgaben bleiben in der
  Legende unterscheidbar.
- Beschreibung und Belohnungen sind standardmäßig sichtbar. Schritte und Ziele
  liegen pro Eintrag hinter „Ziele einblenden“.
- Ohne sichere Position gibt es keinen erfundenen Pin; der Eintrag bleibt
  suchbar und erhält höchstens einen Gebietskontext.
- Die Kartenleiste hat zwei feste Zeilen: Legende oben, Aktionen und
  Karteninformationen unten. Vorkommen ist ein Legendeneintrag mit
  Farbverlauf, nicht je Beruf ein eigener Eintrag.

## Daten- und Linkmodell

### Quellen und Generatoren

- Aufgaben: `build_daten.py` inklusive QuestDetails in DE/EN/FR.
- Gemeinsame Landschaftsnavigation: `tools/build_gebiete.py`.
- Kartenbaum, Grenzen und Elternbeziehungen: Spieldefinitionen über
  `MagicQuestLog/tools/game_maps.py`; keine MoorMap-Geometrie.
- Aufgabenpositionen: belegte Auftraggeber-/Zielpositionen und Kartenrahmen.
- Aufgaben-Detailseiten: `build_aufgaben.py`,
  `php/templates/entity/quest.twig` und die zugehörigen Viewmodels.
- Epik: `tools/build_questmerkmale.py`, danach `build_daten.py`.

### Öffentliche Adressen

Die Identität einer Aufgabe ist Sprache, Entität und stabile ID:

```text
/de/aufgabe/700005C0/
/en/quest/700005C0/
/fr/quete/700005C0/
```

Namen und Navigationshierarchie sind keine Identität. Interne Links verwenden
nur kanonische Adressen; alte `.html`- und flache Adressen bleiben höchstens als
301-Weiterleitungen bestehen.

### Aufgaben-Detailseite

Die Detailseite ordnet die belegten Informationen in:

1. Titel und Fakten-Chips
2. Beschreibung
3. Ort: Kartenausschnitt, Koordinaten und Kartenlink, falls belegbar
4. Woher: Auftraggeber, Gebiet, Voraussetzungen und Ketten
5. Wofür: feste und wählbare Belohnungen, Titel, Tugenden und andere belegte
   Belohnungstypen
6. Zusammenhang: Folgeaufgaben, Ausschlüsse, gleicher Auftraggeber und
   verwandte Einträge
7. Ziele und Schritte in geschlossenem `<details data-nosnippet>`

Nicht belegt werden Mengen, Wege, Spielrechte, Belohnungen oder Positionen
durch Schätzung.

## Fortschritt und Datenschutz

- Spielstand ist optional und bleibt lokal im Browser.
- Companion-Dateien werden ausschließlich im Browser verarbeitet.
- „Nicht importiert“ bedeutet nicht „nie gespielt“ und nicht „sicher
  verfügbar“.
- Sitzungsspiele, Monster-Play-Einträge und durch erledigte Alternativen
  ausgeschlossene Aufgaben werden nicht falsch als offene machbare Aufgaben
  gezählt.
- Die veröffentlichte `fortschritt.js` bleibt leer.
- Der Aufgabenplan darf keine Konto-, Server- oder Charakterdaten enthalten.

## Website und Plugin getrennt halten

### Website

Betroffene Website-Dateien und Werkzeuge:

- `web/app.js`
- `web/landschaft.css`
- `php/templates/app/aufgabenfinder.twig`
- `web/aufgabenfinder.css`
- `web/aufgabenfinder.js`
- `web/karten-aufgabenfilter.js`
- `build_aufgaben.py`
- `tools/build_gebiete.py`
- PHP-Routing/Viewmodel für die Finder-Routen in DE/EN/FR
- passende Aufgaben-/Finder-Tests und Browserprüfungen

Der Experiment-Worktree
`/Users/adrian/Developer/Lotro/lotro-log-book-aufgaben-navigation` ist
Referenz und Arbeitsstand, aber nicht automatisch veröffentlichter Code. Vor
Übernahme müssen die Änderungen in das lokale Website-Repository geprüft,
bereinigt und getestet werden.

### Plugin

Das Plugin ist ein separates Projekt unter
`/Users/adrian/Developer/Lotro/MagicQuestLog`. Die gemeinsame Aufgabenansicht
ist dort in 0.5.4 umgesetzt:

- Landschaften und Themen sind gleichrangige Hauptknoten.
- Der Strukturumschalter wurde entfernt.
- Quest- und Deed-IDs sowie importierter Fortschritt bleiben erhalten.

Plugin-Builds, ZIPs, PluginData und Spielinstallation gehören nicht in dieses
Website-Repository.

## Umsetzungsphasen

### Phase 1 – Bestand und Datenvertrag

- [ ] Bestehende Gebietsübersicht inventarisieren und sicherstellen, dass jede
      Gebietskachel und jeder Untergebietslink im Ziel erhalten bleibt.
- [ ] Finder-Routen, Themen-Schlüssel sowie Klasse-/Herkunftsschlüssel in
      DE/EN/FR festlegen und mit stabilen Quelldaten verknüpfen.
- [ ] Tatsächliche Datenquelle und Zählweise für Themen-/Finder-Treffer prüfen;
      keine Mockup-Zähler als Produktionsdaten übernehmen.
- [ ] Kartenbilder, Elternbeziehungen und Aufgabenbezüge für „Alte Geschichten“
      aus den aktuellen Kartendaten ableiten.
- [ ] Keine technischen Kartennamen, Klassen, Herkünfte oder Themen aus
      ungesicherten Namensheuristiken erzeugen.

### Phase 2 – Aufgabenseite und Einstiege

- [ ] Bestehende Gebiets-/Untergebietskacheln und Regionssprungmarken vollständig
      erhalten; Auswahl führt zur passenden Kartenansicht.
- [ ] Prominenten Finder-Button auf der Aufgabenseite ergänzen; keinen
      Finder-Navigationspunkt im Hauptmenü hinzufügen.
- [ ] Themen-Einstiege ergänzen und ihre Ziele exakt abbilden: Epische
      Geschichte → Kartenansicht; übrige Themen → Finder mit Vorauswahl.
- [ ] „Alte Geschichten“ als eigenen Kartenbereich darstellen; Karten und
      Trefferzahlen aus den Daten ableiten.
- [ ] Keine Platzhalter-Regionen oder verkürzten Beispielraster als vollständige
      Gebietsübersicht ausgeben.

### Phase 3 – separater Aufgabenfinder

- [ ] Separate Finder-Anwendungsseite mit Suchfeld, Filterspalte und
      Trefferliste in DE/EN/FR umsetzen.
- [ ] Filtergruppen Thema, Klasse, Herkunft, Region/Gebiet, Merkmale, Stufe und
      Fortschritt getrennt implementieren; Aufgabenbrett nur unter Thema.
- [ ] Themen-Einstiege über URL/Anwendungszustand vorauswählen; Zurücksetzen
      setzt alle Gruppen und den Suchbegriff nachvollziehbar zurück.
- [ ] Fortschrittsfilter ausschließlich in der Filterspalte anzeigen.
- [ ] Trefferstatus mit `--offen`, `--fertig`, `--laufend` und der bestehenden
      Teilfortschrittsdarstellung aus der Kartenlegende kennzeichnen; Status
      zusätzlich mit Symbol oder Text erklären.
- [ ] Ohne importierten Spielstand Status neutral lassen; „annehmbar“ nur bei
      importiertem Spielstand anbieten.
- [ ] Treffer öffnen über stabile Aufgaben-ID den belegten Kartenkontext;
      ohne Kartenbezug keinen Ort oder Pin erfinden.
- [ ] Vorhandene Aufgaben-Detailseite und ihre belegten Links unverändert
      erreichbar halten.

### Phase 4 – Karte und responsive Darstellung

- [ ] Kartenansicht für Gebiets- und Themenziele prüfen; bestehende Regeln zu
      Kartenrahmen, Markern und 4:3-Darstellung erhalten.
- [ ] Finder-Layout separat für Desktop und Mobil prüfen; Mobil müssen Treffer
      und Filter ohne horizontales Überlaufen bedienbar sein.
- [ ] Tastaturbedienung, Fokusführung, Touch-Ziele und Filterzustände prüfen.

### Phase 5 – Qualitätssicherung

- [x] Python-Tests und Katalogprüfung ausführen.
- [ ] Browserprüfung in DE/EN/FR bei Desktop und Mobil ausführen.
- [ ] Mit synthetischem Spielstand erledigte, laufende (auch mit Teilzielen),
      offene und annehmbare Aufgaben prüfen.
- [ ] Ohne Spielstand prüfen: kein Status wird fälschlich als offen oder
      erledigt markiert; „annehmbar“ wird nicht angeboten.
- [ ] Jeden Themen-Einstieg prüfen: genau das passende Thema ist vorausgewählt;
      Klasse/Herkunft bleiben eigene Filtergruppen.
- [ ] Aufgabenbrett prüfen: als Thema vorhanden, als eigene Filtergruppe nicht
      vorhanden.
- [ ] Alle Gebiete und Untergebiete gegen den vorherigen Bestand abgleichen.
- [ ] „Alte Geschichten“ gegen Kartendaten prüfen, einschließlich Nud-melek
      ohne Aufgabenbezug.
- [ ] Ohne JavaScript lesbare Grundinhalte und echte 404/301 prüfen.
- [x] Build außerhalb von iCloud erzeugen und `verify_katalogseiten.py`
      ausführen.
- [x] Erst nach lokaler Abnahme veröffentlichen; Live-Abnahme am 16.11.2026.

## Abnahmekriterien

Die Arbeit ist erst fertig, wenn:

- die Gebietsübersicht gegenüber dem Bestand keine Gebietskachel und keinen
  Untergebietslink verloren hat;
- kein Finder-Hauptmenüpunkt existiert und der prominente Button den separaten
  Finder öffnet;
- jedes Thema sein vereinbartes Ziel und eine korrekte Vorauswahl hat;
- Epische Geschichte und Alte Geschichten die Kartenansicht öffnen;
- Klasse und Herkunft eigenständige Filtergruppen sind und Aufgabenbrett nur
  als Thema erscheint;
- Fortschritt in der Finder-Filterspalte steht und Treffer die Legendenfarben
  samt verständlichem Statussignal nutzen;
- der Status ohne Import neutral ist und „annehmbar“ Import voraussetzt;
- Landschaften/Themen/Filter in DE/EN/FR dieselbe belegte Struktur und stabile
  Schlüssel verwenden;
- keine unbelegte Position, Karte, Klasse, Herkunft oder Kategorie als Tatsache
  erscheint;
- Finder, Kartenansicht, Tastaturbedienung, Mobilansicht und No-JavaScript-
  Grundinhalt funktionieren;
- vorhandener Spielstand weder überschrieben noch veröffentlicht wird;
- Tests, Buildprüfung und Browserprüfung dokumentiert bestanden sind.

## Prüfkommandos

```bash
# Website-Repository
python3 -m unittest discover -s tests -p 'test_*.py'
node tests/test_i18n.js
node tests/test_questfinder.js
python3 baue_website.py --ziel "$HOME/.cache/llb-dist"
python3 verify_katalogseiten.py "$HOME/.cache/llb-dist"

# Browserprüfung bei laufender Vorschau, nur im isolierten Profil
node tests/browser_navigation.js
```

Bei Datenänderungen sind vorher die jeweils passenden Generatoren aus
`AGENTS.md` auszuführen. Eine einzelne grüne Teilprüfung ist kein Grund, die
unfertige Aufgaben-Navigation zu veröffentlichen.

## Historische Referenzen

- Experiment-Worktree:
  `/Users/adrian/Developer/Lotro/lotro-log-book-aufgaben-navigation`
- Ausgangsstand vor dem Experiment: Commit `95fc39c`
- Plugin-Referenz, gemeinsame Aufgabenansicht: Commit `8b67b98`
- Plugin-Release mit Beschreibung: Commit `002f26c`
- Frühere Oberflächenprüfung: `docs/archiv/site-polish-2026-11-06.md`
- Epische Aufgabenlogik: `docs/fachbereiche/epische-geschichte.md`
- Aufgabenseiten: `build_aufgaben.py` und
  `docs/archiv/katalogseite-spec-2026-11-08.md`
