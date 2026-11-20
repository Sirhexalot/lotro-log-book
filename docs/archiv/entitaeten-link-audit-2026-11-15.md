# Entitäten-Link-Audit

**Stand:** 15. November 2026  
**Geprüfter Bestand:** vorhandene `phpdata`-Shards, Viewmodel, Router,
Katalog-Templates und die aktuell gebauten DE-/EN-/FR-Seiten.

## Folgeprüfung 16.11.2026

Nach den Linkkorrekturen wurde der vollständige PHP-Datenbestand neu gebaut
und mit `tools/audit_php_links.py` geprüft:

- **1.449.979 interne URLs**
- **0 nicht auflösbare Ziele**
- Die zuvor 4.572 falschen Landmarken-Elternlinks (51 Karten-IDs in drei
  Sprachen) verwenden jetzt den tatsächlichen Kartentyp.
- Bei Set-Mitgliedern sind je Sprache **10.654 von 11.152** Links zu
  vorhandenen Item-Seiten belegt. Die übrigen 498 IDs haben keine Item-Seite
  im Katalog und bleiben ohne Link.
- Der Link-Audit ist reproduzierbar: `python3 tools/audit_php_links.py <phpdata>`.
- Die korrigierten Beziehungen sind live unter
  `https://llb.sirhexalot.de/de/aufgabe/700000A4/`,
  `https://llb.sirhexalot.de/de/landmarke/70003BCA/` und
  `https://llb.sirhexalot.de/de/set/7000D487/` geprüft.

## Ergebnis

Der automatische Bestandstest hat **1.310.641 URL-Felder** in Seiten- und
Listenmodellen gefunden:

| Ergebnis | Anzahl | Bewertung |
|---|---:|---|
| Ziel ist eine gebaute Entitätsseite | 1.173.049 | technisch gültig |
| Ziel ist eine Anwendung/Katalogsuche | 133.020 | überwiegend beabsichtigte Fallbacks, fachlich einzeln prüfen |
| nicht auflösbare Entitäts-URL | 4.572 | echter Fehler |
| externe URL | 0 | keine |

Die 4.572 kaputten URLs sind **153 eindeutige URLs**, also 51 Karten-IDs
jeweils in DE, EN und FR. Alle stammen aus `page-l`-Landmarkenseiten und
haben die Form:

```text
/de/region/<Gebiets-oder-Karten-ID>/
/en/region/<Gebiets-oder-Karten-ID>/
/fr/region/<Gebiets-oder-Karten-ID>/
```

Es gibt nur sechs gebaute Top-Level-Regionseiten. Viele der 51 IDs sind
jedoch Gebietskarten oder Unterkarten und dürfen deshalb nicht als `region`
verlinkt werden.

Beispiele:

```text
268437653  Breeland
268442355
268442330
268446977  Dunland-Überblick
268451108
268453364
268453641
268454914
268455271
```

Vollständig betroffen sind diese 51 Karten-IDs; die Abweichung ist nicht
sprachabhängig:

```text
268437576, 268437592, 268437615, 268437653, 268437678, 268437713,
268439511, 268442268, 268442330, 268442355, 268446977, 268447030,
268447045, 268447051, 268447390, 268448407, 268448422, 268449335,
268449746, 268450720, 268450778, 268450882, 268450890, 268450932,
268450944, 268451108, 268451115, 268451272, 268451796, 268452083,
268452166, 268452250, 268452253, 268452631, 268452663, 268453364,
268453454, 268453641, 268453653, 268453997, 268454129, 268454241,
268454323, 268454363, 268454497, 268454617, 268454914, 268454915,
268454945, 268455271, 268455280
```

## Konkrete Lücken

### 1. Landmarke → Region: falscher Entitätstyp

In `tools/php_viewmodel.py:603–606` wird die Elternkarte jeder Landmarke
pauschal als `region` verlinkt:

```python
ort['region'] = {'url': route(lang, 'region', str(eltern.get('idx'))), ...}
```

Die Elternkarte muss anhand des tatsächlichen Kartenbaums als Region oder
Gebiet verlinkt werden. Bei Gebietskarten darf kein Region-Link entstehen.
Das ist die einzige aktuell nachgewiesene Gruppe kaputter URLs.

### 2. Set → Item: vorhandene IDs ohne Link

Die Set-Seiten enthalten **498 Mitglieder pro Sprache**, insgesamt 1.494
Einträge, mit einer vorhandenen Item-ID und einer gebauten Item-Detailseite,
aber `url: null`.

Betroffene Logik: `tools/php_viewmodel.py:1053–1063`. Die Mitglieder werden
dort ausdrücklich als unverbunden übernommen, obwohl `iid in builder.items`
bereits geprüft wird.

Beispielstruktur:

```json
{"id":"7005CC84","name":"Aufsteigendes Licht","url":null}
```

Diese Links können ohne Namensauflösung direkt über die ID auf
`/<sprache>/<item-segment>/<id>/` zeigen.

### 3. Fraktion → Aufgabe/Tat: nicht veröffentlichte Quellen

Die Fraktionsdaten enthalten 10.059 Quellen je Sprache. Davon bleiben 59 je
Sprache ohne Link, weil die IDs zu ausgeblendeten DNT-Aufgaben gehören und
keine Aufgabe-Seite besitzen. Insgesamt sind das 177 `url: null`-Einträge.

Beispiele:

```text
7002451E  DNT HIDING CONTENT - Task: Broken Wooden Maces
70024523  DNT HIDING CONTENT - Task: Blackened Sword Sheaths
70024525  DNT HIDING CONTENT - Task: Blackened Feathers
```

Das ist derzeit kein kaputter Link, sondern eine fachliche Grenze des
veröffentlichten Katalogs. Im Umsetzungst TODO muss aber festgelegt werden,
ob solche Quellen als Text bleiben, aus den Fraktionsseiten herausfallen oder
auf eine Anwendungssuche zeigen.

### 4. Aufgaben → Gebiet/Karte: nicht jeder Pfadteil ist verlinkt

39.694 `area_trail`-Einträge haben keinen URL-Wert. Das betrifft vor allem
weitere Pfadteile nach den ersten beiden Kartenebenen sowie Karten, die im
Viewmodel nicht als veröffentlichte Karte auflösbar sind. Die sichtbare
Karten-/Gebietsbezeichnung bleibt Text.

Das ist nicht automatisch eine Lücke: Kartenvarianten ohne benannte oder
veröffentlichte Entitätsseite sollen nicht als technische „Karte 268…“
verlinkt werden. Die verbleibenden Fälle brauchen jedoch eine gezielte
Paritätsprüfung gegen den Spielkartenbaum.

### 5. Aufgabe/Tat → Belohnung: IDs und Belohnungsarten getrennt prüfen

52.858 `items`-Einträge ohne URL liegen überwiegend in Aufgabenbelohnungen.
Darin enthalten sind:

- Gegenstände ohne stabile Item-ID im importierten Belohnungssatz,
- Titel, Tugenden, Traits und Emotes, die im aktuellen Viewmodel nur als
  Symbol/Text ausgegeben werden,
- auswählbare oder variable Belohnungen ohne eindeutige Zielzuordnung.

Titel- und Tugendseiten existieren grundsätzlich. Der Audit muss deshalb die
Rohdaten prüfen, ob bei diesen Belohnungen eine stabile Titel-/Tugend-ID
vorliegt. Nur dann ist ein fehlender Link eine echte Lücke; eine reine
Namensauflösung wäre wegen Varianten und Übersetzungen nicht zuverlässig.

## Link-Matrix des aktuellen Stands

| Quelle | Ziel | aktueller Stand |
|---|---|---|
| Aufgabe | Aufgabe | kanonische Links für Voraussetzungen, Ketten und Ausschlüsse |
| Aufgabe | Auftraggeber | Detailseite, sonst Such-Fallback bei fehlender ID |
| Aufgabe | Gebiet/Region | Kartenpfad teilweise kanonisch, weitere Teile teils Text |
| Aufgabe | Gegenstand | ID-Link, sonst Name ohne Link |
| Aufgabe | Karte/Reise | Anwendungspfad, fachlich beabsichtigt |
| Tat | Gegenstand | ID-Link, bei fehlender ID Text |
| Tat | Gebiet/Karte | Karten-/Anwendungspfad, Nachbar-Taten kanonisch |
| Tat | Titel/Tugend | derzeit überwiegend Text |
| Gegenstand | Aufgabe/Tat | kanonische Quellenlinks, fehlende Quellen als Anwendung |
| Gegenstand | Rezept | kanonische Rezeptlinks |
| Gegenstand | Fundgebiet | Kartenanwendung mit Vorkommensparametern |
| Gegenstand | Set | Set-Link vorhanden; Set-Mitglieder zurück zum Item fehlen |
| Rezept | Gegenstand | kanonischer Item-Link, namenbasierter Fallback |
| Rezept | Beruf | Handwerks-/Berufsadresse, bewusst keine eigenständige Detailseite |
| Gebiet | Aufgabe/Tat/Gegenstand | kanonische Listenlinks |
| Gebiet | Elterngebiet/Region | kanonisch, muss mit Landmarkenlogik vereinheitlicht werden |
| Landmarke | Aufgabe/Tat | kanonische Links |
| Landmarke | Gebiet | kanonischer Gebiet-Link |
| Landmarke | Region | aktuell für 51 Karten-IDs (153 URLs) falscher Typ |
| Fraktion | Aufgabe/Tat | kanonisch, außer 59 DNT-IDs ohne Zielseite |
| Titel/Tugend | Aufgabe/Tat | kanonisch, fehlende Ziele fallen auf Anwendung zurück |
| Set | Gegenstand | 498 vorhandene Item-IDs bisher ohne Link |
| Instanz | — | Anwendungsliste ohne eigene Detailseiten; keine fehlende Detailroute |

## Router- und Sprachprüfung

- Die geprüften kanonischen Entitäts-URLs entsprechen den Sprachsegmenten in
  `php/src/Catalogue.php`.
- Die gebauten DE-/EN-/FR-Zielseiten sind für die gültigen Entitätslinks
  sprachparallel vorhanden.
- Es wurden in den geprüften Seitenmodellen keine alten `.html`-Links
  gefunden.
- Die 133.020 Anwendungspfade sind keine 404-Ziele. Häufige beabsichtigte
  Ziele sind Gegenstandssuche mit Filtern, Handwerk/Rezeptfilter, Karte,
  Taten, Reise und Ruf.
- `php/src/Catalogue.php::appLink()` enthält weiterhin Legacy-URL-Erzeugung,
  wird für die aktuellen Viewmodel-Entitätslinks aber nicht als kanonische
  Detailroute verwendet. Das muss bei späteren Änderungen separat gegen
  `Router::legacyTarget()` abgesichert werden.

## Prüfgrenzen

Der URL-Bestandstest kann nur URLs prüfen, die im gebauten JSON-Modell
vorhanden sind. Er erkennt nicht allein:

- Beziehungen, deren ID bereits im Rohmodell verloren geht,
- falsche, aber technisch existierende Entitätstypen,
- Links, die nur durch JavaScript ergänzt werden,
- fehlende Links in reinem Fließtext ohne URL-Feld,
- sichtbare Unterschiede zwischen statischem Altbau und PHP-Seite ohne
  zusätzlichen Browservergleich.

Diese Punkte sind als eigene Arbeitsschritte im Umsetzungs-TODO festgehalten.
