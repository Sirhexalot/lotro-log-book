# Gegenstandsseite: Quellgruppen auf die gemeinsame Komponente

Stand: 17.11.2026  
Status: Herstellung umgesetzt (17.11.2026), Tauschhändler offen

## Ausgangslage

Die Gegenstandsseite zeigt unter „Woher" mehrere Gruppen. Drei davon weichen
heute von den Regeln ab:

| Gruppe | Einträge | Darstellung heute | Regelverstoß |
| --- | --- | --- | --- |
| Aufgaben | bis 753 | gemeinsame Komponente | keiner |
| Herstellung (`filter=recipes`) | bis 77 | gemeinsame Komponente (`recipe_made`) | keiner |
| Händler (`vendor_filter`) | bis 333 | gemeinsame Komponente | keiner |
| Tauschhändler (`filter=None`, ohne URL) | bis 333 | einfache Liste | offen |

Zusätzlich zeigt die Herstellungszeile den vollständigen Rezepttext
(„Koch · Wilde Essenzen · Stufe 1 · 1 × …"), wodurch 77 verschiedene Rezepte
wie eine Wiederholung wirken.

## Ziel

Jede Gruppe ist eine Relation auf **eine** Entität und nutzt deren Ausprägung:

- Aufgaben → `MQL_TASK_FILTER_SETUP(rows, 'q')`
- Herstellung → `MQL_RECIPE_FILTER` mit `MQL_RECIPE_CONTEXT_RESULTS`
- Händler → Händler-Ausprägung (dieselbe Zeile wie die Händlerliste)

Damit gelten überall Schwelle 5/6, Suche, Facetten, Sortierung, Pagination,
Kontext-URL und die gemeinsame Zeilenregel.

## Daten

`where_groups` liefert je Gruppe bereits:

- `label`
- `entries` mit `url`, `text`, `recipe_level`, `result`, `profession`, `role`
- `filter`: `tasks`, `recipes` oder `null`
- `source_kind`: nur bei Aufgaben gesetzt

Für die Herstellung fehlt nur eines: die Rezept-ID als eigenes Feld. Sie steckt
heute in `url` (`/de/rezept/<ID>/`). Sie wird beim Bau zusätzlich als `id`
geschrieben, damit der Adapter ohne URL-Parsing arbeitet.

## Aufbau

1. **Server** rendert je Gruppe eine `section` mit `h3`, Fallback-Liste und
   einem leeren `ul[data-filter-results]`. Ohne JavaScript bleibt die Liste
   vollständig sichtbar.
2. **Client** mountet je Gruppe eine eigene Instanz der Komponente. Der
   Kontext steht als Präfix in der URL (`recipes.q`, `vendors.q`, …), damit
   Gruppen sich nicht gegenseitig überschreiben.
3. **Zeilen**:
   - Aufgabe: Symbol, Name, Stufe, Gebiet, Status
   - Rezept: Symbol, Ergebnisname, Beruf · Stufe, Lernstand
   - Händler: Name, Gebiet, Anzahl
4. **Schwelle**: bis 5 direkt, ab 6 Komponente in voller Breite.
5. **Facetten**:
   - Aufgaben: vorhandene Aufgabenfilter
   - Herstellung: Beruf, Stufe, Kategorie
   - Händler: normaler Händler / Tauschhändler, Gebiet

## Offene Punkte

- Bei 77 Rezepten mit identischem Ergebnis unterscheiden sich die Zeilen nur
  durch Beruf, Stufe und Kategorie. Das ist gewollt; die Zutaten stehen auf
  der Rezeptseite.
- Tauschhändler und normale Händler sind heute eine Gruppe mit
  unterschiedlichem `type`. Die Facette trennt sie, die Zeile nennt die Art.

## Tests

- `tests/test_relationen_audit.py`: keine Gruppe über 5 ohne Komponente; die
  Vertragsliste `where_recipes` und `where_plain` wechselt von `open` auf
  `component`.
- `tests/test_entitaeten_vertrag.py`: Zeilenfelder der drei Gruppen.
- Browsertest auf `/de/gegenstand/70047510/` (77 Rezepte) und
  `/de/gegenstand/700005D1/` (333 Händler): je eine Komponente pro Gruppe,
  kompakte Zeile, Suche, Reset, Mobil.
