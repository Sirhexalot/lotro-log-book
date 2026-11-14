# Geländeansicht aus dem eigenen Client

## Bedienung

Die Kartenanwendung bietet **Gelände | Spielkarte** in der bestehenden
Kartenleiste. Gelände ist die Vorgabe. Ein manueller Wechsel wird unter
`mql.kartenansicht` für alle Karten und Sprachen im selben Browser gespeichert.
Er gilt auch nach einem Reload. Fehlende Daten oder ein Ladefehler fallen auf
die Spielkarte zurück, ohne die gespeicherte Wahl zu ändern. Kein Konto und
keine Synchronisierung zwischen Geräten. Gesperrter Browserspeicher wird
abgefangen.

Nur Gelände erlaubt Zoom und Verschieben. Zoom ist auf die native Auflösung
beziehungsweise höchstens 4× begrenzt. Aufgabe, Liste und Auswahl bleiben beim
Ansichtswechsel erhalten. Quest-, Ziel-, Hinweis- und Notizzeichen werden gegen
den Zoom skaliert; Ressourcen werden in passender Canvasauflösung und gleich
großen Zeichen neu gezeichnet. Popups verwenden weiterhin ihre vorhandenen
Auswahl- und Detailfunktionen. Die Spielkarte bleibt unverzerrt in 4:3 und ohne
Zoom. Die Geländeansicht verwendet den tatsächlichen geografischen Rahmen.

Die Übersicht nutzt Gelände-Vorschaubilder, wenn Gelände gewählt wurde. Ohne
verfügbares Bild bleibt ein leerer Bildplatz gleicher Höhe. Kartenzeilen richten
sich jeweils nach ihrer höchsten Kachel, nicht nach der höchsten Kachel des
gesamten Rasters. Inhaltsgruppen, Filter und Navigation sind nicht verändert.

## Quelle und Bau

```bash
python3 tools/build_gelaende.py
```

Optionen: `--client`, `--lib`, `--cache`, `--prepare-only`, `--skip-export`.
Die Standardpfade zeigen auf die lokal installierten Spiel- und Companion-
Dateien. Der Client wird ausschließlich über lesende Companion-APIs geöffnet.
`tools/ExportTerrain.java` nutzt `DatRadarImageProvider`. Es werden keine
TerrainMap-Webbilder, PSB-Ausschnitte, fremden Pins oder Höhenkarten benötigt.

Alle Ausgaben liegen unter `~/.cache/llb-terrain/`:

- `<Quellstand>/source.json`: lokale Quellpfade und Größen-/Zeitstempel.
- `<Quellstand>/requests.tsv`: eindeutige Anforderungen aus allen Kartenrahmen.
- `<Quellstand>/raw/`: PNG-Exporte und fortsetzbares `tiles.jsonl`.
- `public/manifest.json`: öffentliche Rahmen, Abdeckung und Kachelindizes.
- `public/<Quellstand>/r<Region>/<LOD>/<Y>_<X>.webp`: geteilte Kachelpyramiden.
- `public/<Quellstand>/thumb/<Karte>.webp`: Vorschaubilder.
- `coverage.json`: detaillierter lokaler Abdeckungsbericht.

Der Quellstand wird aus Formatversion und Dateistatistik der Client-DATs
gebildet. Fehlende Kacheln werden als fehlend protokolliert, nicht erfunden.
Eine abgebrochene vollständige Manifestzeile ist fortsetzbar; ein beschädigtes
JSONL-Manifest wird nicht still ignoriert. Änderungen am Kachelformat oder der
Encodierung benötigen eine neue Formatversion. Der Client-Datenstand ist kein
vollständiger Inhalts-Checksummentest.

## Koordinaten und Sonderkarten

Companions PositionDecoder beschreibt Blöcke mit 160 lokalen Einheiten und
0,005 Anzeigeeinheiten je Einheit. Daraus folgen 0,8 × 0,8 Spielkoordinaten je
Kachel, mit Ursprung EW −146,8 / NS −124,4. Die geladenen Bilder sind 200 × 200
Pixel. X läuft nach Osten, Y nach Norden; Bildzeilen werden entsprechend
umgekehrt zusammengesetzt. Die Spielregion bleibt Bestandteil jedes Schlüssels.
Gleiche Koordinaten verschiedener Regionen sind niemals dieselbe Kachel.

Für die fünf gezeichneten Übersichtsrahmen wird die Fläche ihrer direkten
Unterkarten mit angefragt. Ohne diesen zweiten Durchgang blieben dort
rechteckige Lücken, die kein Unterkarten-Rahmen angefordert hatte
(14.11.2026, 13.761 zusätzliche Blöcke). Der Client hat den Großteil davon
nicht: 11.977 blieben ohne Bild, nur 1.784 kamen hinzu. Die verbleibenden
Lücken sind also echte, nicht gebaute Flächen im Client und keine fehlenden
Exporte. Abdeckung der Übersichten danach: Rohan 77 %, Mordor 75 %,
Rhovanion 65 %, Gondor 57 %, Haradwaith 47 %.

Die Anwendung lädt nur Kacheln des sichtbaren Ausschnitts in geeigneter LOD.
Einzelne Kacheln werden von verschiedenen Gebietskarten gemeinsam benutzt.
Es wird kein riesiges Gesamtbild je Karte geladen. Nicht vorhandene Teilflächen
bleiben leer; der Client enthält auch unfertiges/unzugängliches Gelände.
Daraus werden keine begehbaren Wege oder verfügbare Aufgaben abgeleitet.

Für bisher unbrauchbare **gezeichnete Übersichtsrahmen** wird ein eigener
Geländerahmen aus vorhandenen, benannten direkten Unterkarten ermittelt. Nur
dieselbe Spielregion zählt. Räumlich getrennte Gruppen werden nicht künstlich
nebeneinander gesetzt: Die größte zusammenhängende Gruppe bestimmt die
Regionsübersicht, `separateMaps` hält abgetrennte Karten fest. Diese Karten
bleiben einzeln erreichbar. Dies ist eine aus Rahmen abgeleitete Darstellung,
keine Behauptung exakter Gebietsgrenzpolygone.

Der Gelände-Rahmen verändert weder die ursprünglichen Spielkarten noch deren
IDs. Projektion und Koordinatenanzeige benutzen ihn nur bei aktiver
Geländeansicht. Unveränderte, belegte Rohstoffdateien werden weiterbenutzt;
`resourceMaps` verhindert Anfragen nach nicht vorhandenen Dateien.

## Geprüfter Stand am 13.11.2026

- 226 Karten, 96.351 angefragte eindeutige Blöcke.
- 52.974 Bilder exportiert, 43.377 Blöcke ohne Bild.
- Regionen 1, 2, 3, 4, 5, 6 und 14 enthalten Bilder.
- 224 Karten haben Gelände, einschließlich der fünf neuen Geländeübersichten
  Gondor, Rhovanion, Mordor, Rohan und Haradwaith.
- Ausnahmen: **Kankras Höhle** (`268453438`) und **Umbar-môkh: Die Niederungen**
  (`268454497`). Die Rahmen überschreiten den unterstützten 0–255-Blockbereich.
  Kein automatisches Umwickeln negativer Blocknummern und keine erfundene Lage.
- „Hat Gelände“ bedeutet vorhandene Bilder im Rahmen, nicht lückenlose Abdeckung
  des gesamten Rechtecks oder vollständige Erreichbarkeit im Spiel.

## Vorschau und Release

Der lokale PHP-Router liest die generierten Dateien aus
`$LLB_TERRAIN` oder `~/.cache/llb-terrain/public`.
`tools/build_release.py --gelaende <Ordner>` übernimmt Manifest und ausschließlich
den darin referenzierten öffentlichen Quellstand. Rohbilder, lokale Pfade,
Forschungsskripte und persönliche Daten werden nicht mitkopiert. Ohne Gelände-
Bau bleibt die Anwendung mit Spielkarten benutzbar.

Es wurde **nicht veröffentlicht**. Eigener Client-Export bedeutet keine neue
Freigabe des Rechteinhabers für öffentliche Bildveröffentlichung.

## Tests

```bash
python3 -m unittest discover -s tests -p 'test_gelaende.py'
node tests/test_gelaende.js
NODE_PATH=/Users/adrian/.nvm/versions/node/v24.16.0/lib/node_modules \
  LLB_TERRAIN_PHP=http://127.0.0.1:8847 node tests/browser_gelaende.js
```

Geprüft: 213 Python-Tests, JavaScript-Präferenz-/Rahmenprüfungen und
DE/EN/FR-Textschlüssel; alle 70.119 ausgelieferten Kacheldateien und 224
Vorschaubilder vorhanden, Rahmenabgleich gegen DE/EN/FR jeweils 224/226.

Browserprüfungen: DE/EN/FR bei 1440 und 390 px, Standardansicht, gespeicherte
Wahl/Reload/Kartenwechsel, gleichbleibende Markergröße, Zoom, Drag, Spielkarten-
Fallback bei fehlenden Bildern und HTTP-Fehlern, zwölf Karten/Übersichten aus
allen vorhandenen Spielregionen, Terrain-Vorschauen und Kachelzeilen. Klicks
auf echte Ressourcenpunkte öffnen weiterhin die Quellenanzeige; eine bloße
Berührung wird nicht als Drag abgefangen. DPR=2 lädt die passenden feineren
Kacheln. Bestehende Gebietsreiter und kontextuelle Listen wurden ebenfalls
nachgeprüft. Die
Handyprüfung ist eine Browserbreite, keine physische Touch-/Safari- oder
Screenreader-Abnahme.

## Resource layer memory (13.11.2026)

The "Vorkommen" layer now stores its choice the way it was meant to: whether
anything was saved decides the start, not the content of the saved object. A
visitor who switched every trade off kept the layer off after a reload; before,
an empty saved choice was read as "nothing stored" and all trades came back.
Browsers without any stored choice still start with all trades on.
`tests/browser_gelaende.js` covers both directions (all off, then all on).

## Shared landscape navigation (13.11.2026)

Quests and deeds now offer the same landscapes and the same map tabs;
`tools/build_gebiete.py` merges the labels and map ids of both catalogues into
`web/gebiete-<sprache>.js`, and `app.js` adds missing landscapes and tabs with
zero entries. Before, the deed overview was missing 28 landscapes (mostly
Rohan, Ithilien, Totensümpfe, Umbar-môkh) and one landscape had a different set
of tabs. Quest groups without a map of their own ("Ithilien", "Fangorn",
"Ackerland", "Rohan - West-Emnet", "Anórien (schlachtgezeichnet)") stay out of
the shared list; they are catalogue groupings, not maps.
`tests/test_gebiete.py` fails when the generated files are stale.
