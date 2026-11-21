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

## Texte und Innenkarten (Prüfung am 20.11.2026)

**Texte sind vollständig vorhanden, aber nirgends sichtbar.** Alle 167
Finder-Einträge tragen `PrivateEncounterTemplate_Description` in DE, EN und FR
(je rund 50.000 Zeichen Deutsch, Median 276, längster 769 Zeichen). Der
Instanzenfinder ist jedoch eine reine Liste (`php/templates/instances/list.twig`);
eine Detailseite und damit eine Stelle für den Text gibt es nicht.

Ebenfalls ungenutzt: `PrivateEncounterTemplate_QuestToBestow_Array` (163 der 167
Einträge, 552 Aufgaben). **Alle 552 Aufgaben stehen im eigenen Katalog**
(`daten/quests-<sprache>.json`), sind also ohne Fremddaten verlinkbar.
`PrivateEncounterTemplate_InstanceQuest` (Hauptaufgabe) haben nur 25 Einträge.
Über diese Aufgaben ergeben sich für 46 Instanzen ein Kartenort mit Koordinaten
auf einer Landschaftskarte – der Einstieg, nicht der Innenraum.

**Innenkarten gibt es im Client.** Klasse 691 (Dungeon, 1.324 Datensätze) trägt
`Dungeon_MapData`/`Dungeon_MiniMapData`; 1.319 verschiedene Karten. Der
Auflösungspfad ist `Dungeon_MapData` → Eigenschaften → `UI_Map_GameMap` →
`UI_Map_MapImage`; erst dieser letzte Wert ist die Bild-ID im Raum der
Basemap-Bilder (`0x41…`), die `dat/MapExport.java` direkt aus dem Client holt.
Probe mit vier bekannten Ids ergab echte Grundrisse (Glinghant, Schule und
Bibliothek von Tham Mírdain, Wasserwerke von Nalâ-dûm, Fil Gashan); sie liegen
nicht in den 226 Landschaftskarten aus `daten/karten.json`.

Offen ist nur die Zuordnung Instanz → Dungeon. Der Namensabgleich reicht nicht:
nur 45 der 167 Namen treffen exakt, die Dungeon-Namen sind außerdem oft
gebietstief („The Great Barrow“, „Ost Dunhoth“) statt flügelgenau. Über
`landblocks.xml` (51.018 Blöcke mit `dungeonId`) und die
`ContainedLandBlockArray` der Vorlage lösen sich **95 der 167** Instanzen direkt
auf einen Dungeon und damit auf eine `basemapId` auf. Die 72 übrigen haben keine
Innenblöcke (Kopien einer Landschaft, etwa Scharmützel) und bekommen keine
Innenkarte.

Hinweis zur Projektentscheidung: Innenkarten wurden am 08.11.2026 erprobt und
**verworfen** („keine Freigabe, namenlose Innenräume wieder einzubauen“). Die
neue Auflösung liefert benannte Dungeons; ob Innenkarten zurückkommen, ist eine
Entscheidung von Adrian, keine stille Folge dieses Datenbaus.

## Truhenbeute (20.11.2026)

`lore/loots.xml` enthält den vollständigen Loot-Graphen, nicht nur Item-Tabellen:
14.268 `trophyList`, 5.094 `itemsTable`, 779 `treasureList`, 739
`weightedTreasureTable`, 807 `filteredTrophyTable`, 115 `relicsList`. Alle 3.801
Trophy-IDs aus Instanz- und Gegnerbeute sind darin auflösbar.

`tools/build_instanz_beute.py` verbindet `instanceLoots.xml` (5 Tabellen, 192
Zeilen, 63 Instanzen, 5.099 Bedingungssätze, 330 Trophy-Listen) mit dem Graphen
und schreibt `daten/instanz-beute.json` (lokal, 350 KiB, alle 167 Fundstellen):
63 Einträge haben Truhenbeute, 95 eine Innenkarte. Je Zeile stehen Tier,
Gruppengröße und Stufenband; jeder Pool nennt Item-ID, Namen in DE/EN/FR und die
Chance. `dropFrequency` bleibt eine Chance je Truhe, Gewichte werden innerhalb
ihres Pools zur Wahrscheinlichkeit. Mehrere unabhängige Würfe dürfen zusammen
über 100 % liegen (Truhe enthält immer die Beute und zusätzlich eventuell eine
Schrift). `tests/test_instanz_beute.py` prüft Pools, Namen, das Glinghant-Band
50–59 und die Kartenauflösung.

Ergebnis: **82 verschiedene Gegenstände** über alle 63 Instanzen. Der Inhalt ist
mager – je Stufenband eine sichere „Beute: …“ (Bounty) und Stat-Schriften mit
0,07–0,1 %, bei Erebor zusätzlich vier Legendaries mit 17,5–25 %. Ausrüstung aus
klassischen Instanzen steht nicht in diesen Tabellen.

`lore/items.xml` ist nicht im Repository (zu groß). Der eigene Client-Export
`items-2026-11-08/items.json` enthält alle 82 Items samt lokalisierten Namen und
Icon-ID. Unser Katalog enthält nur 4 davon (die vier Erebor-Legendaries), weil
er Bounties und Schriften filtert. Die Beute-Anzeige kann die übrigen mit Name
und Icon ohne Kataloglink darstellen; Companion-Labels sind dafür nicht nötig.

**Nicht ableitbar: Boss-Beute.** Die Truhentabellen sind Scharmützel- und
Skalierungsbeute. Gegnerpools hängen an der Spezies (`mobs.xml` →
`mobLoots.xml`, 73 Spezies, 11.680 Stufenzeilen); ein Boss teilt seinen Pool mit
normalen Gegnern derselben Spezies. Marker (`parentZoneId` = Dungeon) nennen die
Gegner einer Instanz, z. B. Glinghant mit 86 Markern und 22 Namen.

## Abgleich mit LotroCompanion

`lore/instancesTree.xml` ist eine reine Liste (166 Einträge in fünf Kategorien;
166 der 167 Finder-IDs stimmen, eine fehlt). `lore/privateEncounters.xml` (989)
führt Karte und Zone je Instanz, aber die IDs passen nicht zu unseren 167; auch
über die Instanz-Aufgaben ergab sich kein Treffer. Companion speichert
Instanz-Beschreibungen nur als Übersetzungsschlüssel (`description="key:…"`),
nicht als Klartext – als Textquelle taugt es nicht.

Die Beutedaten sind ein Client-Dump, keine erfundene Liste; der Loot-Graph ist
auch aus dem eigenen Client lesbar (Probe: `LootGen_TrophyList` und
`TreasureGroupProfile_ItemTable` über `export_sources.py` gelesen). Für
`landblocks.xml` fehlt dieser Weg noch – die Blöcke liegen in eigenen
DAT-Dateien, nicht in `client_gamelogic.dat`.
