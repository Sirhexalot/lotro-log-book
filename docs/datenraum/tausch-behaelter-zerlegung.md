# Tausch, Behälter, Zerlegung und schlanker Gegenstandsbestand

**Stand:** 20.11.2026. **Status:** Datenmodell entworfen, noch keine Pipeline und
keine Seite. Die Zahlen sind am Client-Dump vom 01.11.2026 gemessen
(`lore/` der Companion-Installation, gleicher Stand wie
`LotroCompanion/lotro-data`) sowie am eigenen Item-Voll-Export vom 08.11.2026.
Sie beschreiben den Bestand, nicht die heutige Serververfügbarkeit.

Dieses Dokument ergänzt den [Entitätenvertrag](lotro-datenraum-entitaeten.json)
und die [Gegenstands-Pipeline](gegenstaende-iststand.md). Es beschreibt drei
Datensätze, die bestehende Seiten vervollständigen, ohne eine neue Entität zu
erfinden: Tauschhändler, Behälter und Zerlegung. Dazu kommt ein schlanker
Gegenstandsbestand aus dem **eigenen Client-Export**, damit auch Items ohne
eigene Katalogseite mit Name und Icon angezeigt werden können.

## 1. Warum diese drei

Die Gegenstandsseite beantwortet heute „woher“ über Aufgaben, Taten, Rezepte,
Händler und einen schmalen Tauschbestand aus dem Rezeptquellen-Export. Drei
Fragen bleiben offen und sind im Client belegt:

- **Wofür kann ich das eintauschen, und was kostet es?** (`barters.xml`)
- **Wo kommt das her?** Für Feldfrüchte, Kisten und Relikte fehlt jeder Bezug
  (`containers.xml`).
- **Was wird beim Zerlegen daraus?** (`disenchantments.xml`)

Alle drei sind reine Gegenstandsbeziehungen. Sie brauchen keine neue Seite,
sondern je eine Gruppe in der bestehenden „Woher/Wofür“-Fläche und eine
Ergänzung der Händlerseite.

## 2. Mengen und Abdeckung

| Quelle | Einträge | Beziehung zum Katalog |
|---|---:|---|
| `items-2026-11-08/items.json` (eigener Client) | 152.088 Gegenstände | 45.897 von Tausch, Zerlegung und Instanzbeute referenzierte IDs, davon 18.245 im Katalog; **27.652 nur hier** |
| `barters.xml` | 1.096 Händler, 3.469 Profile (12.360 Verweise), 42.594 Angebote, 58.933 Abgaben, 42.590 Gaben | 36.096 verschiedene Gaben, davon 11.586 im Katalog; 3.063 Abgaben, davon 2.557 im Katalog |
| `containers.xml` | 6.262 (5.735 Behälter, 527 Reliktbehälter) | 4.626 mit Trophy-Liste, 926 mit Treasure-Liste, 494 mit beiden, 1.204 ohne Liste |
| `disenchantments.xml` | 27.333 Zeilen | 10.315 Quellen im Katalog; 26.341 mit Ergebnis, 992 ohne; 45 verschiedene Ergebnisse, davon 22 im Katalog |

Bemerkenswert: Die 45 Zerlegungsergebnisse sind ausschließlich
Umtauschgutscheine („Receipt of …“). Zerlegen liefert also keine Ausrüstung,
sondern ein Tauschpapier. Das ist kein Fehler der Daten und darf nicht als
„Beute“ dargestellt werden.

**Alle referenzierten IDs stehen im eigenen Voll-Export**, mit Namen in DE, EN
und FR, Qualität, Stufe und Icon-ID. Geprüft am 20.11.2026: 36.827
Tausch-IDs, 27.378 Zerlegungs-IDs und 44.639 Behälter-IDs, keine einzige Lücke.
Ein Rückgriff auf Companion-Namenslabels ist damit überflüssig.

## 3. ID-Format

Alle Spiel-IDs sind 32-Bit-Zahlen. Der Datenraum und die Website führen sie als
achtstelliges Großbuchstaben-Hex (`70000821`), die Companion-XML-Dateien und der
Voll-Export als Dezimalzahl (`1879050273`). Die Umrechnung passiert einmal beim
Bau (`'%08X' % int(wert)`); im Datenmodell steht ausschließlich das Hexformat.

## 4. Datenmodell

### 4.1 Schlanker Gegenstandsbestand `daten/item-kurz.json`

Der eigene Katalog (`daten/items.json`, 52.802 Einträge) ist eine
Zusammenführung aus Ausrüstungsdetails, Belohnungen, Rezepten und Vorkommen –
kein vollständiger Gegenstandskatalog. Die 27.652 referenzierten Gegenstände,
die dort fehlen, sind überwiegend Kategorie `ITEM` (Sonstiges), dazu
Ausrüstung ohne Detaildatensatz. Sie sind im Client vollständig beschrieben;
es fehlt nur die Aufnahme in den Katalog.

```json
{"schema": 1, "quelle": "items-2026-11-08/items.json", "stand": "2026-11-08",
 "items": {
   "7005DEB4": {"n": {"de": "Wappen des Sperlings", "en": "…", "fr": "…"},
                "q": "RARE", "l": 1, "ic": 1092686755}
 }}
```

- **Nur ergänzend.** Ein Eintrag aus `daten/items.json` gewinnt immer; die Datei
  füllt ausschließlich Lücken und erzeugt **keine** Katalogseite.
- **Aufnahme-Regel:** alle IDs, die Tausch, Zerlegung oder Instanzbeute
  referenzieren und im Katalog fehlen (27.652). Behälter-Pools bleiben draußen,
  weil sie nie als Zeile erscheinen – der Behälter steht als Quelle am
  Gegenstand, nicht umgekehrt.
- **Icons:** `ic` ist die Symbol-ID des Clients. 5.344 Symbole werden gebraucht;
  950 liegen schon in `web/bild/items/`, die übrigen 4.394 in `itemIcons.zip`.
- **Nicht in die Suche.** `build_gegenstandssuche.py` bleibt beim kuratierten
  Katalog, sonst wüchse die Trefferliste um 27.652 Junk-Einträge.
- Zwei Gruppen brauchen vorher eine Entscheidung: 1.336 Rezept-Objekte
  („Rezept: …“) und 1.984 Einträge mit `x`-Flag. Bis dahin werden sie nicht als
  normale Tauschwaren aufgenommen.
- Ein Eintrag aus dieser Datei erzeugt **keine** Katalogseite. Ein Gegenstand
  ohne Seite wird mit Clientnamen und Icon genannt, aber nicht verlinkt.

### 4.2 Tausch `daten/tausch.json`

Ein Profil ist das Angebot eines Händlers: eine Liste von Abgaben und eine
Liste von Gaben. Dasselbe Profil kann von mehreren Händlern verwendet werden
(3.469 Profile gegenüber 12.360 Verweisen), deshalb steht der Händlerbezug am
Angebot, nicht am Profil.

```json
{"schema": 1,
 "quelle": {"datei": "lore/barters.xml", "stand": "2026-11-01"},
 "haendler": {
   "70000AAE": {"name": "Jolfur", "titel": "Hunter Trainer",
                "klasse": "Hunter",
                "ort": {"karte": 268437557, "x": 41.2, "y": 63.8,
                        "gebiet": "Eriador"}}
 },
 "angebote": [
   {"profil": "7000B0C8",
    "haendler": ["70000AAE"],
    "geben": [["7000A2C1", 100], ["7000A2C2", 16]],
    "erhalten": [["7000B7D1", 1]],
    "bedingung": {"klasse": "Hunter", "fraktion": ["7000BEEF", 4],
                  "aufgabe": null}}
 ]}
```

Regeln:

- **Mengen.** Fehlt `quantity` in der Quelle, gilt 1 (44.161 von 58.933 Abgaben
  tragen eine Menge, 14.772 nicht; bei den Gaben 783 von 42.590). Die 1 ist
  damit belegt und keine Annahme.
- **Bedingungen** bleiben getrennt und werden nicht zu einem „ab Stufe X“
  verrechnet. `requiredClass` steht am Händler (159 von 1.096) oder am Profil
  (12), `requiredFaction` an 565 Profilen im Format `"<fraktion>;<stufe>"`,
  `requiredQuest` an 505. Die Bedeutung der Stufenzahl ist noch zu belegen und
  wird bis dahin nur als Rohwert geführt.
- **Ort** kommt aus `did-positions-2026-11-03/positions.jsonl` (Weltlage
  `instance` 0); 1.095 der 1.096 Händler haben eine Position. Karte und
  Koordinaten entstehen mit derselben Regel wie bei Auftraggebern und
  Landmarken, kein erfundener Punkt.
- **Zusammenführen mit dem Bestand.** `daten/items.json` trägt bereits ein Feld
  `tausch` aus dem Rezeptquellen-Export (nur Rezepte, Art `tausch`). Die neue
  Quelle wird additiv zusammengeführt und nach `(händler, abgaben, gabe)`
  dedupliziert; der alte Bestand wird nicht still ersetzt.
- **Kein Silberpreis.** Tausch kostet Gegenstände, keine Münzen. Händlerpreise
  in Silber stehen in `vendors.xml` und bleiben eine eigene Angabe.

### 4.3 Behälter `daten/behaelter.json`

Ein Behälter ist ein Weltobjekt (Feld, Kiste, Knoten), kein Gegenstand. Er
verweist auf Loot-Tabellen; die Auflösung nutzt denselben Graphen wie die
Instanz-Truhen.

```json
{"schema": 1,
 "behaelter": {
   "70000D11": {"name": "Southlinch Field", "art": "container",
                "pool": [{"i": "7001A2B3", "p": 0.25},
                         {"i": "7001A2B4", "p": 0.25}]}
 }}
```

- `art` ist `container` oder `relics`. Reliktbehälter (527) verweisen auf
  `relicsListId` und liefern Relikte, keine Gegenstände; sie bekommen einen
  eigenen Zweig, statt Relikte als Gegenstände auszugeben.
- 1.204 Behälter haben weder Trophy- noch Treasure-Liste. Sie bleiben mit Namen
  im Bestand, aber ohne Pool – keine erfundene Beute.
- Wahrscheinlichkeiten sind Chancen je Öffnung, keine Summe über 100 %. Bei
  mehreren unabhängigen Würfen steht jede Chance einzeln, wie bei den
  Instanz-Truhen.
- Auf der Website erscheint der Behälter nur als **Quelle** eines Gegenstands
  („Woher: Behälter“), nicht als eigene Entität.

### 4.4 Zerlegung `daten/zerlegung.json`

```json
{"schema": 1,
 "zerlegung": {
   "7000C1D2": [{"i": "7001F0A1", "menge": 1}]
 },
 "ohne_ergebnis": ["7000C1D3"]}
```

- 992 Quellen haben kein `resultItemId`. Sie stehen in `ohne_ergebnis` und
  erzeugen keine Zeile „Zerlegen ergibt“.
- Ergebnisnamen kommen aus dem Katalog oder dem schlanken Gegenstandsbestand; die 45
  Gutscheine sind überwiegend nicht im Katalog und bleiben ohne Link.
- Die Beziehung ist gerichtet und nicht symmetrisch: „wird zerlegt zu“ ist
  keine Verwendung des Ergebnisses.

### 4.5 Gemeinsamer Loot-Graph `tools/lootgraph.py`

Die Auflösung von Trophy-, Treasure-, gewichteten und gefilterten Tabellen
steckt heute in `tools/build_instanz_beute.py` (fachlich beschrieben in
[`docs/fachbereiche/instanzenfinder-dat.md`](../fachbereiche/instanzenfinder-dat.md)).
Sie wird als eigenes Modul herausgezogen, damit Instanz-Truhen und Behälter
dieselbe Logik nutzen:

- `lade_graph(pfad)` → `{(tag, id): element}`
- `loese(graph, "trophyList", id)` → `{item_id: chance}`
- `chance()` und `gewicht()` kapseln die Regel „`dropFrequency` ist eine Chance,
  `weight` ist relativ zu seinem Pool“.

Kein zweiter Resolver, keine abweichende Wahrscheinlichkeitsrechnung.

## 5. Einbindung in Seiten und Vertrag

| Ort | Gruppe | Inhalt | Ab sechs Einträgen |
|---|---|---|---|
| Gegenstand | **Woher: Tausch** | Händler, Ort, Abgaben | Filterkomponente |
| Gegenstand | **Woher: Behälter** | Behältername, Chance | Filterkomponente |
| Gegenstand | **Zerlegen ergibt** | Ergebnis, Menge | direkt |
| Händler | **Tauschware** | Gabe, Abgaben, Bedingung | Filterkomponente |

Der Entitätenvertrag ist entsprechend ergänzt (`i`: `where_barter`,
`where_containers`, `disenchants_into`; `vendor`: `barter`), jeweils mit Status
`open` und Grund: Quelle und Modell stehen, die Seite baut die Gruppe noch
nicht. Die Zeilenfelder bleiben bei Identität und Einordnung; Mengen und Preise
gehören auf die Detailseite, nicht in die Liste.

Regeln, die auch hier gelten:

- Kein Link ohne Katalogseite. Bei 24.510 der 36.096 Tauschgaben gibt es keine
  Seite; sie werden mit Namen genannt, nicht verlinkt.
- Keine erfundenen Preise, Stufen oder Rufschwellen.
- Fehlende Angaben führen zum Weglassen der Zeile oder der Überschrift, nicht zu
  „nicht geprüft“.

## 6. Geplante Pipeline

1. Ein Generator für den schlanken Gegenstandsbestand liest den eigenen
   Voll-Export und schreibt nur fehlende, referenzierte IDs.
2. `tools/build_tausch.py` → `daten/tausch.json`; Positionen aus dem
   did-positions-Export, Karte über `game_maps` wie bei Auftraggebern.
3. `tools/build_behaelter.py` → `daten/behaelter.json` über `lootgraph`.
4. `tools/build_zerlegung.py` → `daten/zerlegung.json`.
5. `tools/php_viewmodel.py` ergänzt die Gruppen; `build_php_data.py` schreibt
   sie in die Seitenmodelle. Danach Vertragsstatus von `open` auf `component`.
6. `tools/build_release.py` und `.gitignore` um die neuen `daten/*.json`
   ergänzen (die Dateien bleiben lokal, wie alle Daten).

## 7. Prüfungen

- Abgaben und Gaben lösen sich gegen Katalog oder Voll-Export auf; keine leeren
  Namen in der Ausgabe.
- Jedes Angebot hat mindestens eine Abgabe und eine Gabe.
- Summen: 42.594 Angebote, 6.262 Behälter, 27.333 Zerlegungen; Abweichungen
  werden gemeldet, nicht still geschluckt.
- Stichprobe Glinghant/„Gloves of the Seven Stars“: Profil vorhanden, Abgaben
  Mark 100 + Medaillon 16, Händler an einer Position.
- Zerlegung: 992 ohne Ergebnis bleiben ohne Zeile.
- Entitätenvertrag und `php_viewmodel` nennen dieselben Gruppennamen.

## 8. Offene Punkte

- Bedeutung der Zahl in `requiredFaction="<id>;<n>"` (Rufstufe?) ist nicht
  belegt; bis dahin nur Rohwert.
- Ob Tauschware ohne Katalogseite eine eigene, schlanke Seite bekommen soll
  (Name, Icon, Tauschorte) oder namenlos bleibt.
- Ob Reliktbehälter und Relikte überhaupt angezeigt werden; Relikte sind keine
  Gegenstände im Katalog.
- Ob der Behälterbezug auch auf der Kartenansicht erscheint (Vorkommen zeigt
  heute Fundstellen, keine Behälter).
