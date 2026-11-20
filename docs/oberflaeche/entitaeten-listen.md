# Eingebettete Entitätenlisten – lokaler Umsetzungsstand

Entscheidung: **Die Liste unter einer Detailseite ist die bestehende Liste der
dort gezeigten Entität, nur fest auf die Beziehung eingeschränkt.** Keine
eigene Filtererfindung je Elternseite. Das betrifft Suche, Filtergruppen,
Sortierung, Ergebniszeilen, „Weitere anzeigen" und Abschlussmarken.

Beispiel: `Barren: Zwergenstahl` zeigt 95 Rezepte. Das sind alle Rezepte, die
diesen Gegenstand als Zutat verwenden – mit Berufs-, Stufen-, Kategorie-,
Lernstand- und Sortierfilter der Rezeptliste. Die Facettenzahlen beziehen sich
nur auf diese 95.

## Wer liefert was

| Ebene | Datei | Aufgabe |
| --- | --- | --- |
| Daten | `tools/related_filter_data.py` | Zeilen für Aufgaben/Taten (Name, Art, Kategorie, Region, Gebiet, Stufe, Belohnungen) |
| Bau | `tools/build_php_data.py` | Shards `filter-q`, `filter-d`, `filter-i`, `filter-labels` je Sprache |
| Server | `php/src/RelatedLists.php` | liest die Beziehungs-IDs der Seite, holt genau diese Zeilen |
| Seite | `php/templates/layout.twig` | Beziehungen als JSON, Listenassets nur bei Bedarf |
| Browser | `web/entitaeten-listen.js` | Tabs, feste Beziehung, ein Controller je Reiter |
| Adapter | `web/aufgaben-filter.js` | Aufgaben/Taten (neu, herausgelöst) |
| Adapter | `web/handwerk-filter.js` | Rezepte (`MQL_RECIPE_FILTER.create`, dieselbe Konfiguration wie im Handwerk) |
| Adapter | `web/gegenstaende-filter.js` | Gegenstände (`MQL_ITEM_FILTER_SETUP`, derselbe Baum wie die Gegenstandssuche) |

Die Detailseite schickt **nur IDs** mit, nie einen Vollkatalog: bei Nordhöhen
sind das 266 Aufgaben, 23 Taten und 198 Gegenstände; die Zeilen kommen aus den
Shards ihres eigenen Typs. Die frühere Einbettung des kompletten Mitglieder-JSON
in die Seite ist entfallen.

## Feste Beziehung, freie Filter

- Die Beziehung selbst ist **kein** Filter und wird von „Zurücksetzen" nicht
  entfernt.
- Jeder Reiter schreibt nur Parameter mit eigenem Präfix (`q.`, `beruf.` …).
  Der Pfad der Detailseite und der Zustand der anderen Reiter bleiben bei
  Zurücksetzen, Neuladen und Zurück/Vor unverändert.
- Der Reiter steht im Hash (`#q`, `#d`, `#i`, `#recipe`) und überlebt Neuladen.
- Ein Reiter ohne unterscheidungskräftige Filter (weniger als zwei Werte, keine
  zwei Stufen, kein Abschlussbeleg) zeigt die Liste ohne leere Filterspalte.
- Nur was in der Beziehung unterscheidet, wird angeboten und in der
  Ergebniszeile genannt: Region und Gebiet erscheinen als Filter und als
  Zusatz, sobald sie mehrere Werte haben; im Gebiet selbst entfallen sie.
- Ohne JavaScript bleibt die serverseitige Liste vollständig: Gegenstand 95
  Rezeptlinks, Gebiet 266 + 23 + 198 Einträge.

## Welche Filter eine Aufgabe hat

Die Quest-Kategorie des Clients (`Auenland`, `Hauptmann`, `Ruf`, `Barde`)
mischt Landschaften, Klassen und Erzählarten. Sie steht im Seitentext, taugt
aber nicht als Filter. Was Aufgaben wirklich trennt, sind ihre belegten
Merkmale: **täglich, wiederholbar, kleine Gemeinschaft, Gemeinschaft,
Aufgabenbrett, Instanz, skaliert mit Stufe**. Kleine und große Gemeinschaft
sind Alternativen (beide gewählt = jede Gemeinschaft); die übrigen Merkmale
gelten gemeinsam. Aufgabenbrett wird an der Client-Kategorie `Auftrag` /
`Task` / `Tâche` erkannt, nicht am Gebernamen.
Taten haben zusätzlich ihre **Art** (Entdecker, Bezwinger, Kunde …) und ihre
**Belohnung** (LOTRO-Punkte, Tugend, Titel, Gegenstand). Eine Tat ohne belegte
Art bleibt ohne Art statt „Weitere Tat" zu behaupten.

## Abschlussstatus

Marken erscheinen nur für Datenarten, deren Status importiert wurde. „Nicht als
erledigt importiert" ist eine Aussage über den Import, nie über Spielbarkeit
oder Verfügbarkeit. Bei Gegenständen gibt es keinen Besitzstatus: der
Charakterimport enthält keinen Taschenbestand.

## Abnahme

```bash
node tests/browser_related_lists.js      # 7 Typen × DE/EN/FR × 1280/390, Kontext, Reset, Suche über 50, Reiter/History, ohne JS
node tests/browser_area_tabs.js          # Reiter, Suche über den Auszug, Hash, Abschlussfilter
node tests/browser_entity_sources.js     # Quellenlisten als gemeinsame Filter, kritischer Erfolg, Sets
node tests/browser_entity_progress.js    # Datenart, Suche, Rufstand
```

Grenzen: keine echte iOS-/Screenreader-Abnahme; kein Besitzfilter für
Gegenstände; der Abschlussstatus beruht weiterhin auf der Dateipräsenz des
Imports, nicht auf einem geprüften Vollständigkeitsnachweis.
