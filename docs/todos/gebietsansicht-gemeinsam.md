# Gemeinsame Gebietsansicht

## Ziel

Aufgaben, Taten, Abenteuer, Reiseplaner und Landmarkenfilter sollen dieselbe
verständliche Gebietsordnung zeigen. Die Spielkarten-IDs und ihre Elternpfade
bleiben dabei unverändert. Neue DAT-Exporte müssen Abweichungen der
Darstellungsregeln sichtbar melden.

## Bereits umgesetzt

- `referenz/gebietsansicht.json` hält die freigegebenen Gruppen nach stabilen
  Karten-IDs: Dunland-Überblick, Ost-/West-Rohan und die drei aus dem
  Dunland-Überblick einzeln gezeigten Karten.
- `tools/gebietssicht.py` prüft Karten-IDs und direkte bzw. regionale
  Elternbeziehungen gegen `daten/karten.json`; `build_gebiete.py` gibt die
  Metadaten sprachabhängig an Aufgaben und Taten weiter.
- Die gemeinsame Kartenkachelansicht zeigt die freigegebenen Gruppen. Die
  Dunland-Übersichtskarte ist über einen Link in der Gruppenüberschrift
  erreichbar, nicht als leere Aufgabenkachel; die drei benannten Karten bleiben
  eigenständige Karten-IDs.
- Der Abenteuer-Gebietsliste werden Gruppenlabels mitgegeben. Der Reiseplaner
  zeigt die passende Gruppe an den Karten seiner Routen. In DE/EN/FR werden
  redundante Ost-/West-Rohan-Präfixe aus den Kartennamen entfernt, ohne die
  Karten-IDs oder Stationszuordnungen zu ändern.
- Landmarkenfilter und Treffer zeigen die zusätzliche Gruppe Region → Gruppe →
  Landschaft; Filterwerte und Landmarken bleiben an ihren ursprünglichen
  Karten-IDs.
- Kartenübersicht und Landmarkenindex zeigen die Gruppenlabels in DE/EN/FR.

## Noch offen

- [ ] **Gegenstandsquellen:** Die großen Aufgaben-/Taten-Quellenfilter auf
  Item-Detailseiten zeigen derzeit Region → Landschaft, nicht die zusätzliche
  Darstellungsgruppe. In den aktuellen Daten betrifft das 13 große
  Item-Quellenlisten mit Aufgaben/Taten aus den freigegebenen Gruppen; vier
  davon enthalten sowohl Ost- als auch West-Rohan. Gruppenebene nur für diese
  Gruppen ergänzen, Karten-IDs und Landschaftsauswahl als Blattwerte erhalten.
- [ ] **Export-Audit:** `validate_configuration()` prüft aktuell die
  konfigurierten Karten-IDs und deren erwartete Elternbeziehungen und stoppt
  bei einigen Abweichungen. Es protokolliert aber keinen Vergleich der
  Kartenmenge bzw. neu hinzugekommene oder weggefallene Karten im Umfeld der
  Gruppen. Einen ID-/Elternpfad-Diff gegen einen freigegebenen Baseline-Stand
  ergänzen; keine Namensheuristiken verwenden.

## Prüfung bisher

- Browserprüfung der Kartenkachelübersicht, Landmarkenfilter, Abenteuerkarte
  und Reiseplaner in DE/EN/FR, jeweils Desktop und mobil. Landmarkenfilter mit
  Karten-ID `268448407` liefert in allen Sprachen nur Einträge der Steppe /
  The Wold / Le Plateau; die DE-Trefferzahl beträgt 17. Eine Beispielroute
  Flutwend → Aldburg (Floodwend → Aldburg / Coudeflots → Aldburg) zeigt
  Ost-Rohan und West-Rohan an den Stationen.
- Die Abenteuerkarte schaltet nach Auswahl von Rohan auf die Regionsansicht;
  Gebietslabels und -liste zeigen Ost-/West-Rohan. Positionen und Routen wurden
  nicht verändert.
- `python3 tools/build_gebiete.py`, `python3 build_reise.py` und
  `python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata" --sprache alle`
  ausgeführt; generierte PHP-Daten bleiben außerhalb des Repos.
- `python3 -m unittest tests.test_landmarks tests.test_gebiete tests.test_abenteuer tests.test_reisedaten`
  (43 Tests), PHP-Syntax sowie Python-/JavaScript-Syntaxprüfungen bestanden.
- Bei der Sprachprüfung fiel auf, dass der Reiseplaner im HTML-Seitentitel
  bislang in allen Sprachen „Reise“ hieß. Seitdem werden Seitentitel und
  Beschreibung für DE/EN/FR sprachrichtig gesetzt.
