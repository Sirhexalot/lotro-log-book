# Gegenstand-Daten für den zentralen Katalog (08.11.2026)

Diese Übergabe hält die gemeinsamen Regeln vom 08.11.2026 ein: **keine zweite
Gegenstandsliste**, keine eigene Seite, kein eigener Generator. Geliefert werden
nur Nachschlagdaten zu IDs, die der zentrale Index bereits führt.

## Typ, Pfad, Quelle

| Punkt | Wert |
|---|---|
| Typbuchstabe | `G` (bestehender Ausrüstungstyp im Index) |
| Pfadsegment | `gegenstand` (bestehend, `/de/gegenstand/<ID>/`) |
| Quelle | bestehender `G`-Bestand aus `rewards-stats`; diese Datei ergänzt ihn |
| Verknüpfung | ausschließlich über die achtstellige Item-ID, nie über den Namen |
| Namenskollisionen | 520 Namen existieren zwei- bis dreimal; die ID entscheidet |

Der zentrale Index behält die Navigation, Reihenfolge, Sitemap und Suche. Die
JSON-Datei ist ein Nachschlagewerk (`items` als Objekt nach ID), keine Liste.

## Dateien

| Datei | Inhalt | Größe |
|---|---|---:|
| `daten/gegenstand-details.json` | 40.755 Ausrüstungsdetails nach Item-ID (genau der bestehende `G`-Index) | 19,0 MB |
| `daten/gegenstand-sets.json` | 2.223 Sets mit Mitgliedern und Bonis | 607 KB |
| `daten/gegenstand-stat-labels.json` | 30 verwendete Stats in DE/EN/FR | 4 KB |
| `daten/gegenstand-typen.json` | Slot-, Rüstungs-, Waffen-, Qualitäts- und Art-Labels | 4 KB |
| `Companion-Test/source-exporter/items-2026-11-08/icons/gegenstaende/` | 3.927 Item-Icons, 32×32 WebP | 15 MB |

Die Icons sind Inventarsymbole, keine 3D-Ansicht. Im Listenbereich werden sie
nicht geladen; nur die Detailansicht braucht eine Datei.

## Felder in `gegenstand-details.json`

```json
{
  "schema": 1,
  "note": "Lookup by item ID; not a second item list.",
  "items": {
    "70043B7E": {
      "name": {"de": "Gepolsterte Überhose des Mathom-Jägers",
               "en": "Mathom-hunter's Padded Leggings",
               "fr": "Jambières matelassées de chasseur de Mathoms"},
      "quality": "INCOMPARABLE",
      "level": 1,
      "minLevel": 1,
      "category": "ARMOUR",
      "kind": "a",
      "slot": "LEGS",
      "subtype": "MEDIUM",
      "icon": 1090526315,
      "armour": 13,
      "dps": 0,
      "damage": 0,
      "speed": 0.0,
      "damageType": "",
      "binding": 1,
      "unique": false,
      "essenceSlots": 0,
      "scalable": true,
      "stats": []
    }
  }
}
```

- `kind`: `a` Rüstung, `w` Waffe, `j` Schmuck.
- `slot`: `HEAD`, `CHEST`, `FINGER`, `MAIN_HAND`, …
- `subtype`: bei Rüstung `LIGHT`/`MEDIUM`/`HEAVY`/`SHIELD`/…, bei Waffen
  `ONE_HANDED_SWORD`/`BOW`/…, bei Schmuck leer.
- `binding`: `1` bei Erhalt gebunden, `2` bei Ausrüsten gebunden, `0` frei.
- `stats`: `[statId, Wert]`; die Labels stehen in
  `gegenstand-stat-labels.json`.
- `sources`: nur `q` (Aufgabe) und `d` (Tat); die Namen löst der zentrale
  Katalog aus seinen eigenen Daten auf.
- `vendors`: Händler-IDs; Namen und Positionen kommen aus dem zentralen
  NPC-Bestand.
- `recipe`: Rezept-ID für „hergestellt durch“.
- `set`: Set-ID; Mitglieder und Bonis stehen in `gegenstand-sets.json`.
- `scalable`: Item skaliert mit der Stufe; `level` ist dann nur ein
  Anzeigewert, kein fester Gegenstandslevel.

## Abschnittsreihenfolge (Regel 4)

| Abschnitt | Datenquelle |
|---|---|
| **Kurz** | `name`, `quality`, `level`, `minLevel`, `slot`, `subtype`, `kind` |
| **Ort oder Vorkommen** | `vendors` (Händler-IDs); Positionen noch nicht verknüpft. Kein einzelner Punkt, also kein „Ort“ ohne Prüfung. |
| **Woher** | `sources` (Aufgabe/Tat), `recipe`, `vendors` |
| **Wofür** | `stats`, `armour`, `dps`, `damage`, `speed`, `damageType`, Set-Bonis |
| **Zusammenhang** | `set`, `recipe`, `essenceSlots`, `requiredClass`, `requiredProfession` |
| **Details** | `icon`, `description`, IDs, `scalable`, `unique`, `binding` |

## Suche

Der Index führt die `G`-Zeilen bereits. Diese Datei liefert nur die Details
dazu. Falls neue `G`-Zeilen nötig sind, lauten die Felder:
**Typ `G`, ID, Name, Kontext (`kind · slot`), Stufe (`minLevel`)**.
Es wird keine zusätzliche Suchliste angelegt.

## Umfang und ehrliche Grenzen

- **40.755** Ausrüstungsgegenstände, exakt die IDs des bestehenden `G`-Index
  (21.257 Rüstung, 6.964 Waffen, 12.534 Schmuck). Die Datei enthält keine
  zusätzlichen IDs und keine Reihenfolge; sie ergänzt nur die bestehenden
  Einträge.
- Der vollständige Export umfasst 79.325 Ausrüstungsteile; für die Webseite
  wurden bewusst nur die 40.755 IDs des zentralen Index übernommen.
- **2.223** Sets, **11.159** Set-Teile; **10.487** davon liegen im `G`-Index.
  Set-Mitglieder außerhalb des Index nur als Text ausgeben, nicht verlinken.
- **3.927** Icons, alle vorhanden. Sie decken die 40.755 `G`-IDs ab.
- **19.246** der 40.755 Gegenstände skalieren. Bei ihnen sind keine festen
  Statwerte angegeben; die Seite muss „skaliert ab …“ zeigen.
- **233 Zutatentypen** (Rezepte) haben keine Quelle in den Spieldaten; das
  betrifft die Rezeptseite, nicht diese Itemdetails.
- **Händlerpositionen** sind noch nicht verknüpft. 820 der 40.755 Gegenstände
  haben Händler-IDs; die Positionen liegen in
  `did-positions-2026-11-03/positions.jsonl` und können daraus ergänzt werden.
- **Belohnungsquellen**: Der `G`-Index ist nicht der Belohnungsindex (`g`).
  Deshalb stehen in dieser Datei keine Aufgabe-/Tat-Quellen; „Woher“ kommt aus
  Händlern, Rezepten und Sets.
- **Statwerte** sind aus den Progressionkurven berechnet und gerundet. Vor
  einer Live-Aussage einmal gegen einen Spiel-Tooltip prüfen.

## Neu erzeugen

Die Detaildatei wird aus dem vollen Export gefiltert. Die ID-Liste ist die
`G`-Menge des zentralen Index (eine ID pro Zeile):

```sh
cd ../Companion-Test/source-exporter
python3 export_item_details.py --ids /pfad/g-ids.txt \
  --output ../../lotro-log-book/daten/gegenstand-details.json
python3 export_item_sets.py --output ../../lotro-log-book/daten/gegenstand-sets.json
```

## Prüfung

- 152.100 Item-IDs aus dem DAT-Inventar, 152.088 mit Namen geschrieben
  (12 ohne verwertbaren Namen).
- Stichprobe 60 Gegenstände: 60/60 Namen, 60/60 Icons, 59/60 Stufe (1
  skalierend), DPS/Haltbarkeit/Qualität 100 % deckungsgleich mit dem DAT.
- 10/10 Rezepte: Ergebnis und Zutaten exakt.
- 2.223 Sets, 0 fehlende Mitglieder.
- Alle 3.927 benötigten Icons vorhanden.
- Keine Seite, kein eigener Generator, keine zweite Liste im Webverzeichnis.
