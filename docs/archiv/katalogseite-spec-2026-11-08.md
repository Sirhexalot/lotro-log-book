# Detailseite: Aufbau und Verlinkung (Spec für `build_katalogseiten.py`)

Stand 08.11.2026. Diese Datei beschreibt, wie eine Entitätsseite aussehen soll und
welche Daten daraus welche Links machen. Sie ist **Auftrag an den zentralen
Katalogbau**: `build_katalogseiten.py` steht auf der Sperrliste und wird hier nicht
angefasst.

## Abschnittsfolge

`Kurz · Ort oder Vorkommen · Woher · Wofür · Zusammenhang`

Kein Abschnitt „Details“ (ID, Karten-IDs, Quelle, Stand) — der entfällt.

| Abschnitt | Inhalt | Woher |
|---|---|---|
| **Kurz** | Symbol, Name, eine Zeile Stufe/Gebiet, Marken (Sitzungsspiel, Alternative, wiederholbar), **Beschreibung** | `n`, `l`, `z`/`u`, `x`, `e`, `rp`, `d` |
| **Ort** | bei genau **einem** Punkt: Kartenausschnitt + Koordinaten; bei **vielen** Punkten: Karte und Punktzahl, keine Route | `gt`, `t`, `fk` |
| **Woher** | Auftraggeber, Gebiet/Region, Voraussetzungen, Stufenbedingung | `g`, `z`, `r`, `fk`, `v`, `vo`, `vl`, `vb` |
| **Wofür** | Belohnungen mit Bild und Link, Titel, Tugend, Trait, Emote; darunter „Wird vorausgesetzt von“ | `rw`, Rückverweis |
| **Zusammenhang** | Aufgabenfolge (`pq`/`nq`), ausschließende Alternativen, gleicher Auftraggeber, Vorkommen im Gebiet | `pq`, `nq`, `e`, `g`, `fk` |

Die Beschreibung steht **oben**, nicht am Ende. Klammerzusätze hinter Werten
entfallen („Auftraggeber: Ghân-buri-Ghân“, nicht „(noch ohne eigene Seite)“).

## Symbole

- Ein Lucide-Symbol je Entität, **inline** vor dem `<h1>` in `.katalog-inhalt`:
  `scroll-text` Aufgabe, `trophy` Tat, `package` Gegenstand, `book-open` Rezept,
  `map` Gebiet, `globe` Region, `briefcase` Beruf, `award` Titel, `shield` Tugend,
  `gem` Vorkommen. Katalog `library`, Handwerk `hammer`.
- Markup: `<svg class="symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">…</svg>`
- Farbe über `currentColor`; die Seiten setzen `color: var(--gold)` am `<h1>`.
- Keine Sprite-Datei: der Build kopiert keine neuen Assets, und inline funktioniert
  auch bei `file://`.

## Belohnungen

`rw` trägt je Eintrag sieben Felder: Art, Name, Qualität, Gegenstandsstufe, Anzahl,
Bindung, **ID**. Die ID ist seit dem 08.11.2026 gefüllt (19.039 von 19.385
Einträgen), aufgelöst über den Belohnungsindex (`build_belohnungen.py`) mit dem
Schlüssel (Quell-ID, Name) — Namen allein sind nicht eindeutig.

- Zeile: Bild `bild/items/<ID>.webp` (20 px, rund, dunkler Grund), dann der Name als
  Link `/<sprache>/<segment>/<ID>/` (`gegenstand`, `item`, `objet`).
- Fehlt das Bild, verschwindet der Platz (`onerror`), es bleibt kein leerer Rahmen.
- „Zur Auswahl“ bleibt eine Zeile: `zur Auswahl: A · B · C`, je Eintrag mit Bild.
- Titel, Tugenden, Traits und Emotes bleiben Text (keine ID im Belohnungsindex).

## Rückverweis „Wird vorausgesetzt von“

Aus den `v`-Listen aller Aufgaben: Aufgabe → Aufgaben, die sie verlangen. Als Index
einmal je Sprache ableiten (6.533 Aufgaben mit Voraussetzungen), nicht pro Seite
suchen. Bei Taten entfällt der Abschnitt (keine belegte Verknüpfung).

## Links, die es schon gibt

Gebiet `/de/gebiet/<id>/`, Region `/de/region/<id>/`, Voraussetzung und Folge
`/de/aufgabe/<id>/`, Karte `index.html?id=<id>`, Reise `reise.html?nach=<lat>+<lon>`.

## Was nicht auf die Seite kommt

Erfahrung und Geld (nicht in den entpackbaren Daten), Mengen bei Tugenden
(unbekannt), eine Tat-Verknüpfung über `hz` (das sind nur Positionen).

## Taten

Gleiche Folge, mit drei Abweichungen: Symbol `trophy`, „Woher“ nennt die Tat-Art und
die Kategorie statt Auftraggeber, und „Wofür“ zeigt Tugend, LOTRO-Punkte und Titel.
Ein Rückverweis auf Aufgaben fehlt, solange die Tat ihre Aufgaben nicht mit IDs
nennt.
