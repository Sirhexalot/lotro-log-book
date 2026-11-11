# Instanzenfinder: Quellenprüfung am 11.11.2026

Die veröffentlichten 1.578 PrivateEncounterTemplates sind kein spielernaher
Instanzenkatalog. Die Auswahl des Instanzenfinders ist ausdrücklich im Client
definiert. Für diese Prüfung wurden keine Listen, Texte oder Bilder fremder
Websites übernommen.

## Direkt belegte Quellen

- `7001B7CE`, Klasse 2606 `WorldJoinControl`:
  `WorldJoin_AvailablePETemplates_Array` enthält 153 eindeutige Vorlagen-IDs.
  `WorldJoinControl_InstanceGroups` enthält zusätzlich 14 Varianten epischer
  Schlachten, gruppiert in acht benannte Begegnungen.
- Alle 167 Referenzen sind im vorhandenen DAT-Vorlagenexport auflösbar.
- `WorldJoin_EncounterCategory` in den Vorlagen ist der Cluster-Schlüssel,
  nicht die Landschaft. `WorldJoin_EncounterType` ist die Client-Art.
- Enum `WJEncounterCategory` (587203408) liefert übersetzte Cluster-Namen,
  `WJEncounterType` (587203337) die Arten und `WJInstanceGroup` (587203537)
  die Gruppenbezeichnungen epischer Schlachten.
- `Skirmish_Template_GroupSizeArray`, `MinLevelScale`, `MaxLevelScale` und
  `DifficultyTierArray` liefern Gruppengrößen, konfigurierten Stufenbereich
  und Schwierigkeitsgrade. Nicht aus Queststufen oder Namenspräfixen ableiten.
- Zusätzlich geprüft: `7003672A`, Klasse 3787 `BigBattlesControl`, mit
  `BigBattleControl_Quest_To_Encounter_Hash` (Aufgaben zu Schlachten).

## Gegenproben aus dem eigenen Client

- Feste Elendil und Glinghant: Annúminas, Stufe 40–160, sechs Spieler.
- Drachen-Trakt: Helegrod, Stufe 50–160, 24 Spieler.
- Iorbars Gipfel: Der Weg nach Erebor, Stufe 20–160, drei Spieler.

Die 153 regulären Auswahlreferenzen verteilen sich auf 35 Kategorien.
Die Client-Art ist dort 131-mal `Classic`, 21-mal `Skirmish`, einmal `Team`;
das sind interne Bezeichnungen, noch keine fertigen deutschen UI-Texte.

## Reproduzierbarkeit

Mit dem bestehenden `DatSourceReader.java` aus dem externen Source-Exporter
die Klasse 2606 aus `inventory.tsv` lesen (DE/EN/FR). Ein frischer Auditlauf
las zusätzlich Klassen 2515, 2619 und 2727, insgesamt 186 Datensätze ohne
Decoderfehler. Der Spielclient und der externe Exporter wurden nicht verändert.

`tools/InstanceFinderEnums.java` liest die Enum-Texte direkt aus den DATs.
Die IDs wurden anhand vorhandener Decoder-/Lore-Metadaten identifiziert;
deren gespeicherte Übersetzungstexte sind **keine** Eingabe des Exports.

```bash
java --class-path "<DAT-decoder-lib>/*" tools/InstanceFinderEnums.java "<client>" > "<cache>/finder-enums.tsv"
python3 tools/export_instance_finder.py --control "<cache>/finder-raw.jsonl" --templates daten/instanzen-roh.jsonl --enums "<cache>/finder-enums.tsv" --output "<cache>/finder.json"
```

Prüfergebnisse liegen lokal in `~/.cache/llb-instance-research/`, nicht im
Repository. Der JSON-Export bewahrt die Originalnamen, Auswahlzugehörigkeit,
Cluster, Gruppen und Einstellungen; fehlende Referenzen/Übersetzungen brechen ab.

## Grenzen und Integration

Die Auswahlreferenz beweist weder die Freischaltung eines Charakters noch
aktuelle Server-/Saisonverfügbarkeit. Level-Overrides und Zugangsbedingungen
können die gespeicherten Standardwerte beeinflussen. Der Client enthält auch
Test-Kategorien; nicht alle Enum-Werte als aktive Cluster anzeigen.

Die Website nutzt jetzt diesen Auswahlbestand: `finder.json` wird beim Export
als `daten/instanzen-finder.json` gespeichert, `tools/build_instanzen.py` verbindet
ihn mit den Rohvorlagen und schreibt `daten/instanzen.json` (Schema 2).
`tools/build_php_data.py` bereitet daraus drei sprachrichtige Indizes vor.
Die 167 Einträge werden nach Clustern gruppiert; epische Schlachtvarianten und
eigenständige Flügel bleiben erkennbar. Filter: Cluster, Art, Stufenspanne,
Gruppengröße, Schwierigkeit. Die Stufenfilter prüfen Bereichsüberschneidung,
Spielerfilter die explizite Gruppengrößenliste, nicht nur die Maximalkapazität.

Für die UI wird die interne Art `Classic` als Instanz bezeichnet, bei
ausschließlich für mindestens zwölf Spieler vorgesehenen Gruppengrößen als
Schlachtzug. Epische Schlachten folgen ihrer expliziten Picker-Zuordnung,
Scharmützel dem Client-Typ 3. Diese Ableitung ist unabhängig vom Namenspräfix.
Fehlende Kategorien werden unter „Ohne Cluster“ am Ende angezeigt.
Keine automatischen Links auf möglicherweise nicht veröffentlichte Aufgaben.

Der Build muss nach dem Finder-Export in dieser Reihenfolge laufen:
`tools/build_instanzen.py`, `tools/build_php_data.py`, `tools/build_release.py`.
