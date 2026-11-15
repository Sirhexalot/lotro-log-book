# Aufgaben-Navigation für LOTRO Log Book

**Planstand:** 15. November 2026
**Status:** Konzept und Rendering-Dokumentation; die neue Website-Navigation ist
noch nicht zur Veröffentlichung freigegeben.

Dieses Dokument bündelt den vollständigen Plan für Aufgaben im LOTRO Log Book,
die bisherigen UI-Renderings, die verworfenen Zwischenstände und die
verbindlichen Entscheidungen. Es beschreibt ausschließlich die Website. Die
separate Aufgabenansicht im Plugin **Magic Quest Log 0.5.4** ist bereits
umgesetzt und wird hier nur als Referenz erwähnt.

## Ziel

Die Website soll Aufgaben nicht nur als lange Trefferliste, sondern als
verständlichen Weg durch Mittelerde zeigen:

- Landschaften und thematische Aufgabenbereiche sind gleichrangig erreichbar.
- Epische Aufgaben behalten ihre Reihenfolge nach Band, Buch und Kapitel.
- Eine Aufgabe führt von der Katalogseite nachvollziehbar zu Gebiet, Karte,
  Auftraggeber, Ziel und gegebenenfalls Reiseplaner.
- Belegte Daten werden sichtbar gemacht; fehlende Daten werden nicht geraten.
- Die Oberfläche funktioniert ohne Spielstand, mit importiertem Spielstand,
  ohne JavaScript als Grundinhalt sowie in DE, EN und FR.
- Die Navigation bleibt für Aufgaben und Taten gemeinsam verständlich, ohne
  Taten-Navigation oder `/de/abenteuer/` unnötig umzubauen.

## Verbindliche Endentscheidung

Die Aufgaben-Navigation ist **eine gemeinsame Baumansicht**. Es gibt keinen
Umschalter „Nach Landschaft / Nach Thema“ und keinen künstlichen Knoten
„Weitere Inhalte“.

Auf der obersten Ebene stehen gleichrangig:

1. Landschaften beziehungsweise Regionen und ihre Landschaften
2. Epische Geschichte
3. Klassenaufgaben
4. Herkunftsaufgaben
5. Feste und Ereignisse
6. Missionen
7. Instanzen und Schlachten
8. Handwerk
9. Weitere Aufgaben

„Weitere Aufgaben“ ist eine fachliche Restgruppe für belegte, nicht anders
zuordenbare Aufgaben. Sie ist eine normale breite Kachel beziehungsweise ein
normaler Baumknoten, keine zusätzliche Aufklapphülle.

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

Die Kacheln waren als schneller Einstieg nützlich, erzeugten aber erneut zwei
parallel gedachte Navigationssysteme. In der Endfassung werden die Themen
deshalb direkt als gleichrangige Hauptknoten in denselben Baum aufgenommen.

## Rendering 3: beschlossene Startansicht – gemeinsamer Aufgabenbaum

**Status: Zielbild.**

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

Regeln für dieses Rendering:

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

## Rendering 4: Aufgabenbrowser

**Status: Zielbild; Umsetzung im Experiment begonnen, noch nicht übernehmen.**

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

Verbindliche Bedienung:

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
- `web/aufgaben-filter.js`
- `build_aufgaben.py`
- `tools/build_gebiete.py`
- `php/src/` und `php/templates/entity/quest.twig`
- `tests/browser_navigation.js` sowie ergänzende Aufgaben-/Katalogtests

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

- [ ] Experiment-Änderungen gegen den aktuellen `main`-Stand prüfen.
- [ ] Gemeinsamen Pfadvertrag für Landschaften, Themen, Epik und Restgruppe
      festlegen.
- [ ] DE/EN/FR-Schlüssel und stabile IDs testen.
- [ ] Keine technischen Kartennamen als sichtbare Landschaft ausgeben.

### Phase 2 – gemeinsame Startansicht

- [ ] Landschafts- und Themenknoten in einer Ansicht darstellen.
- [ ] Umschalter, gespeicherte Strukturwahl und zusätzliche „Weitere
      Inhalte“-Hülle entfernen.
- [ ] Fortschrittszahlen nur aus tatsächlich zählbaren Aufgaben ableiten.
- [ ] Suche, Filter, Breadcrumb und Zurückweg festlegen.

### Phase 3 – Aufgabenbrowser und Detailseiten

- [ ] Browserliste mit Suche, Filter, Sortierung und lokalem Zustand bauen.
- [ ] Karten-/Gebietsweg Gebiet → Karte → Aufgabe vervollständigen.
- [ ] Detailseite nach dem Abschnittsmodell oben prüfen.
- [ ] Auftraggeber-, Belohnungs-, Ketten- und Reiseplanerlinks verknüpfen.

### Phase 4 – Karte und responsive Darstellung

- [ ] Drei-Spalten-Desktop umsetzen und Breite lokal speichern.
- [ ] Feste zweizeilige Kartenleiste und stabile 4:3-Karte prüfen.
- [ ] Sammelmarker, Legende und Hover-/Auswahlverbindung prüfen.
- [ ] Mobilansicht mit Liste/Karte/Details und sichtbarer Suche prüfen.

### Phase 5 – Qualitätssicherung

- [ ] Python-Tests und Katalogprüfung ausführen.
- [ ] Browserprüfung in DE/EN/FR bei Desktop und Mobil ausführen.
- [ ] Mit und ohne synthetischen Spielstand prüfen.
- [ ] Ohne JavaScript lesbare Grundinhalte und echte 404/301 prüfen.
- [ ] Build außerhalb von iCloud erzeugen und `verify_katalogseiten.py`
      ausführen.
- [ ] Erst nach vollständiger Abnahme veröffentlichen.

## Abnahmekriterien

Die Aufgaben-Navigation ist erst fertig, wenn:

- alle oben genannten Hauptknoten ohne Umschalter erreichbar sind;
- Landschaften und Themen in DE/EN/FR dieselbe Struktur und dieselben IDs
  verwenden;
- Epik numerisch und erzählerisch korrekt sortiert ist;
- keine unbelegte Position oder Karte als Tatsache erscheint;
- Aufgabe, Gebiet, Karte und Detailseite über kanonische Links verbunden sind;
- Desktop, Mobil, Tastatur und No-JavaScript-Grundinhalt funktionieren;
- vorhandener Spielstand weder überschrieben noch veröffentlicht wird;
- Tests, Buildprüfung und Browserprüfung dokumentiert bestanden sind.

## Prüfkommandos

```bash
# Website-Repository
python3 -m unittest discover -s tests -p 'test_*.py'
node tests/test_i18n.js
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
- Frühere Oberflächenprüfung: `docs/site-polish-2026-11-06.md`
- Epische Aufgabenlogik: `docs/epische-geschichte.md`
- Aufgabenseiten: `build_aufgaben.py` und
  `docs/katalogseite-spec-2026-11-08.md`
