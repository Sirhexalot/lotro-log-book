# Gegenstände: Ist-Stand, Filterseite und Einbaupfad

**Stand:** 17. November 2026  
**Zweck:** belastbare Ausgangskarte vor Änderungen an Gegenstandsdaten  
**Status:** Bestandsaufnahme mit erster Teilumsetzung der Detailseite

## Kurzfazit

Die Website verwendet einen gemeinsamen Item-Namensraum mit **52.798**
Gegenständen. Davon besitzen **40.755** einen ergänzenden Detailsatz.
Dieselbe Itemmenge speist sowohl die Detailseiten als auch die Filterseite,
aber über zwei verschiedene Datenmodelle:

1. `daten/items.json`: gemeinsamer, kompakter Item-Datensatz für Katalog,
   Rezepte und Itemseiten.
2. `web/gegenstaende-<sprache>.js`: eigene, sprachabhängige Suchzeilen für
   die Gegenstandssuche.

Die Suche ist bereits ein eigenständiger Produktbereich und muss bei jeder
Änderung des Itemmodells mitgeprüft werden. Sie zeigt derzeit Kategorie,
Qualität, Klassifikation und Stufe, filtert aber nicht nach Bindung, Stats,
Quellen oder Verwendung.

Der deutlichste belegte Verlust ist die Bindung: In den 40.755 Detailitems
stehen 25.809 Einträge mit dem kompakten Wert `binding=1`. Der zugrunde
liegende Clientbestand unterscheidet darin 12.987 `BIND_ON_ACQUIRE` und
12.822 `BOUND_TO_ACCOUNT_ON_ACQUIRE`. Die Seite kann diese beiden Fälle
heute nicht unterscheiden.

Ein zweiter, unabhängiger Modellierungsbefund betrifft Rezeptbeziehungen:
`build_items.py` legt kritische Ergebnisse derzeit in `zutat` ab. Die
Detailansicht verwendet `zutat` als „Wofür/als Zutat verwendet“. Damit kann
ein kritisches Ergebnis als Zutat erscheinen; zugleich wird es nicht als
eigenständige Herstellung des Gegenstands erfasst. Optionale Zutaten aus
dem Rezeptfeld `o` werden in dieser Item-Rückwärtsbeziehung ebenfalls nicht
durchlaufen. Vor einer Änderung muss die Beziehung daher rollengetrennt
werden.

## 1. Datenbestand am aktuellen lokalen Stand

Die folgenden Zähler stammen aus den im Repo vorhandenen erzeugten Dateien,
nicht aus einer erneuten DAT-Extraktion:

| Datenbestand | Einträge | Verwendung |
| --- | ---: | --- |
| `daten/items.json` | 52.798 | gemeinsamer Item-Namensraum |
| `daten/gegenstand-details.json` | 40.755 | Itemdetails, vorwiegend Ausrüstung |
| `web/gegenstaende-de.js` | 52.798 | deutsche Suchzeilen |
| `web/gegenstaende-en.js` | 52.798 | englische Suchzeilen |
| `web/gegenstaende-fr.js` | 52.798 | französische Suchzeilen |
| Itemdetails mit mindestens einem Set | 10.487 | Sets sind separat verlinkt |

In `items.json` sind die Feldschlüssel in jedem Datensatz vorhanden; viele
Werte sind allerdings `null`, leer oder eine leere Liste. Ein vorhandener
Schlüssel ist kein Beleg für einen vorhandenen Quellwert.

## 2. Tatsächliche Pipeline

### 2.1 Gemeinsamer Item-Namensraum

`build_items.py` erzeugt `daten/items.json`. Die Datensätze werden über die
achtstellige Item-ID zusammengeführt, nie über den Namen.

| Eingang | Wird verwendet für | Einschränkung |
| --- | --- | --- |
| `daten/gegenstand-details.json` | Namen zunächst als Fallback, Qualität, Level, Bindung, Kategorie, Slot, Untertyp, Werte | nur 40.755 Items; `binding` bereits auf 0/1/2 verdichtet |
| `web/belohnungen-<sprache>.js` | Namen, teilweise Qualität/Level, Aufgaben-/Tatquellen | nur Beziehungen, die im Belohnungsexport enthalten sind |
| `recipes-2026-11-06/recipes.json` | Rezeptname, normales Ergebnis, Zutaten und kritisches Ergebnis | aktuell werden Rezeptrollen bei der Rückwärtsverknüpfung vermischt; Details unten |
| `web/vorkommen-de.js` | Rohstoff-/Sammelstellenzuordnung | kein Item-ID-Schlüssel in der Spawnquelle; Zuordnung teilweise namensbasiert |
| vollständiger Item-Export `items-2026-11-08/items.json` | am Ende Name je Sprache und Icon | überschreibt vorhandene Namen, sofern ein bereinigter DAT-Name vorhanden ist |

Die resultierenden Itemfelder:

| Feld in `items.json` | Inhalt heute | Woher / Verhalten |
| --- | --- | --- |
| `n` | lokalisierte Namen | zuletzt bevorzugt aus dem vollständigen Itemexport |
| `q` | Qualitätscode | Details, sonst Belohnungsdaten; kompakte/enumabhängige Werte |
| `l` | Level | Details, sonst Belohnungsdaten; fehlend wird teils `null` |
| `b` | Bindung 0/1/2 oder `null` | Details; keine Account-/Charakterunterscheidung |
| `kat`, `slot`, `sub` | Kategorie, Platz, Untertyp | Details; für die Item-Suche teils aus dem vollständigen Export ergänzt |
| `ic` | Icon-ID | vollständiger Itemexport |
| `w` | Rüstungs-/Kampfwerte | nur Werte, die beim Merge als truthy gelten; 0-Werte werden nicht übernommen |
| `quellen` | Aufgaben-/Tat-/Item-Quellen | Belohnungsexport |
| `rezepte` | Rezept-IDs, die das Item herstellen | derzeit nur normales Ergebnis `r` |
| `zutat` | Rezept-IDs, in denen das Item auftaucht | reguläre Zutaten `i`; zusätzlich fälschlich kritisches Ergebnis `cr`; optionale `o` fehlen |
| `vor` | Sammelstellen-Zuordnung | sprachübergreifender Namensabgleich, inklusive Stamm-/Tokenheuristik |

### 2.2 Gegenstandssuche und Filterseite

`build_gegenstandssuche.py` erzeugt `window.MQL_GEGENSTAENDE` in
`web/gegenstaende-<sprache>.js`. Es kombiniert:

- den gemeinsamen Bestand aus `daten/items.json`;
- den vollständigen Itemexport als bevorzugte Quelle für Namen, Kategorie,
  Qualität, Slot, Typ und Level;
- Companion-`items.xml` für ItemClass und EquipmentCategory;
- die jeweiligen Client-Enums und DE/EN/FR-Labels.

Der Filterdatensatz ist ein positionsbasiertes Array:

```text
[ID, Name, Icon, Kategorie, Qualität, Platz, Typ, Stufe, ItemClass, EquipmentCategory]
```

Die Filterseite setzt die Werte in Suchzeilen um; der PHP-Datenbau teilt
dieselben Zeilen für relationale Listen zusätzlich auf `filter-i`-Shards
auf. Das ändert nicht den Suchseitenbestand.

#### Filterbaum und Auswahl

`web/gegenstaende-filter.js` legt je Kategorie die gültigen Filterachsen fest:

| Kategorie | hierarchische Auswahl |
| --- | --- |
| Rüstung | Rüstungsart → Platz |
| Waffe / legendäre Waffe | Platz → Waffentyp |
| Geschmeide | EquipmentCategory |
| Sonstiges (`ITEM`) | ItemClass |
| Legendärer Gegenstand | Platz |
| Essenz | nur Kategorie |

Daneben gibt es:

- Namens-/ID-Suche, mit diakritik-insensitiver Normalisierung;
- Mehrfachauswahl Qualität;
- Stufenbereich;
- Sortierung nach Name oder Itemstufe;
- 50 Treffer pro Ladeabschnitt;
- Facettenzähler, die jeweils ohne die eigene Filtergruppe berechnet werden;
- URL-Zustand (`q`, `qual`, `von`, `bis`, `sort`, Filterzweig `k`);
- gemeinsames Filtergedächtnis über die vorhandene Filterkomponente.

Die Suche erfindet keine Typen: unbekannte Kategorie wird ausgelassen,
unbekannte Qualität erhält den Wert 0. Innerhalb der aktuellen Daten gibt es
165 Zeilen mit Qualität 0 und 157 Zeilen ohne positive Itemstufe. Bei aktivem
Stufenfilter werden Items ohne positive Stufe nicht berücksichtigt.

**Nicht Teil der Suchfilter sind:** Bindung, Mindestnutzungsstufe, skalierend,
Unique, Stats, Set, Händler, Belohnungen, Rezeptrollen und Vorkommen.
Das ist der heutige Funktionsumfang, keine Aussage, dass diese Filter fachlich
unmöglich wären.

### 2.3 Itemdetailseite

Aktive Laufzeit ist die PHP-Anwendung:

```text
items.json + Details/Beziehungsquellen
    → tools/php_viewmodel.py:item_view()
    → tools/build_php_data.py:page-i Shards
    → php/src/Data.php:page()
    → php/src/Page.php
    → php/templates/entity/item.twig
```

`tools/build_php_data.py` baut zusätzlich sprachabhängige
`filter-items.json`-Labeldaten sowie `filter-i`-Zeilen für eingebettete
Beziehungslisten. PHP rendert eine angeforderte Detailseite aus ihrem
`page-i`-Datensatz; die vollständigen Kataloge werden nicht im Request
durchlaufen.

Die Detailseite zeigt derzeit:

- Name, Icon, Kategorie-/Platz-/Untertyp-Angabe;
- Qualität, Nutzungsminimum, Itemlevel, Bindung, Skalierung, Unique,
  Essenzplätze als Chips;
- Beschreibung;
- Rüstung, DPS, Schaden, Geschwindigkeit, Schadenstyp und Stats;
- Sammelstellen mit bekannten Fundorten;
- Aufgaben-/Tatquellen;
- „hergestellt durch“, „verwendet in“;
- Setverknüpfungen, Klasse und Suchseiten-Einstieg.

Einige Felder aus `gegenstand-details.json` werden nicht oder nur indirekt
verwendet. Insbesondere wird `vendors` derzeit nur als boolescher Hinweis
ausgegeben, nicht als konkrete Händlerliste. `durability`, `maxStack`,
`maxLevel`, `recipe`, `set` und weitere Rohwerte erscheinen nicht zwingend
als eigenständige Itemfakten. Set-Mitgliedschaften werden inzwischen aus der
Setquelle gesammelt; nicht nur das einzelne `set`-Feld der Itemdetails wird
als vollständige Mitgliedschaft behandelt.

Der separate `build_gegenstaende.py` ist der historische statische
Seitengenerator und zugleich für Vergleichs-/Prüfpfade relevant. Für den
normalen veröffentlichten PHP-Lauf ist `tools/build_php_data.py` maßgeblich.
Beide Pfade müssen bei gemeinsam genutzten Datenänderungen auf Abweichungen
geprüft werden.

## 3. Wichtigste konkrete Lücken

### Bindung

Der Clientbestand `items.xml` enthält für die 40.755 Detailitems:

| Clientwert | Anzahl | heutiger Zahlenwert |
| --- | ---: | ---: |
| `BIND_ON_ACQUIRE` | 12.987 | 1 |
| `BOUND_TO_ACCOUNT_ON_ACQUIRE` | 12.822 | 1 |
| `BIND_ON_EQUIP` | 14.689 | 2 |
| kein Bindungsattribut | 257 | 0 |

`tools/php_viewmodel.py:item_view()` mappt 1 auf eine generische
„gebunden beim Aufnehmen“-Anzeige. Accountbindung ist damit auch auf den
Detailseiten nicht sichtbar. Die Filterseite hat aktuell gar keinen
Bindungsfilter.

### Rezeptrollen

`build_items.py` liest das flache Rezeptobjekt wie folgt:

- `r[0]` → `rezepte` (normales Ergebnis);
- `i` → `zutat` (reguläre Zutaten);
- `cr[0]` → ebenfalls `zutat` (kritisches Ergebnis wird als Zutat fehlklassifiziert);
- `o` → wird in dieser Rückwärtsverknüpfung nicht eingelesen.

`item_view()` liest `rezepte` als `crafted_by` und `zutat` als `used_in`.
Dadurch sind „Herstellung“ und „Verwendung als Zutat“ nicht sauber
auseinandergehalten. Die Variantendaten des Rezeptexports werden an dieser
Stelle ebenfalls nicht pro Variante in die Itemrelation geschrieben.

### Herkunft und Fundorte

- `quellen` deckt die Aufgaben-/Tatbeziehungen ab, die der
  Belohnungsexport bereits liefert.
- Händler-IDs im Detaildatensatz werden für die Itemseite nicht zu einer
  Liste konkreter Händler aufgelöst.
- `vor` wird zum Teil aus Namen abgeleitet, weil die Spawnquelle keine
  Item-IDs enthält. Diese Zuordnung ist nicht gleich stark wie eine
  explizite Item-ID-Referenz und sollte als solche kenntlich bleiben.
- Die Detailseite verbirgt eine Sammelstellenzeile ohne bekannte
  Kartenfundstelle; dies ist sinnvoll, sagt aber nicht „Rohstoff kommt
  nirgends vor“.

### Filterseite

Die Filterseite hat bereits stabile Client-Schlüssel, Sprachlabels,
Filter-URL und dynamische Facetten. Für Gegenstandsqualität wären künftig
zusätzliche Filterdimensionen möglich, darunter Bindungsart, Unique,
Skalierung oder einzelne Ausrüstungseigenschaften. Diese würden jedoch
größere Filterdaten, zusätzliche URL-/Gedächtnisregeln und eine klare
fachliche Definition erfordern.

## 4. Ziel für die nächste Datenänderung

Noch nicht festgelegt ist, welche Eigenschaften zusätzlich in der Suche
Filter werden sollen. Die erste Änderung sollte daher **keinen neuen
Filterumfang voraussetzen**. Sie sollte erst das Datenmodell verlustfreier
machen:

1. Bestehendes `b` als Kompatibilitätsfeld zunächst unverändert lassen.
2. Zusätzlich einen expliziten, stabilen Wert ergänzen, z. B.
   `bindingMode`:
   `NONE`, `BIND_ON_ACQUIRE`, `BOUND_TO_ACCOUNT_ON_ACQUIRE`,
   `BIND_ON_EQUIP`, `UNKNOWN`.
3. Den Wert aus der belegten Itemdefinition übernehmen, nicht aus dem Namen
   und nicht aus dem alten `b` zurückerraten.
4. Das neue Feld in Itemdetailmodell und -tests verfügbar machen.
5. Erst danach entscheiden, ob die Filterseite einen Bindungsfilter erhält.

Für die Itemsuche gilt ein separates Schema. Wird Bindung dort später
aufgenommen, müssen sowohl die Suchzeile als auch URL-Codierung,
Filtergedächtnis, Facetten und DE/EN/FR-Labels gemeinsam erweitert werden.
Ein Detailfeld allein darf die Filterseite nicht unbemerkt verändern.

## 5. Vorgeschlagene Arbeitsfolge

### Schritt A – Eingang und Feldpfade festhalten

- [x] Aktuelle Quellen, Generatoren, PHP-Seitenmodell, Itemdetailtemplate und
  Gegenstandssuche nachverfolgt.
- [x] Filterseite als eigene Daten-/Darstellungsspur aufgenommen.
- [x] Mit dem Item-Binding-Fall starten. Für den Websitebau liefert die
  aktive Companion-Lore `items.xml` den expliziten Bindungsmodus, soweit ein
  Item dort ein Binding-Attribut besitzt; `gegenstand-details.json` bleibt
  die Quelle für den bestehenden Detailbestand.

### Schritt B – Binding verlustfrei übernehmen

- [x] `items.xml`/DAT-Binding für die Website-Item-IDs mit
  `gegenstand-details.json` abgleichen.
- [x] Neues `bm`/`bindingMode` ergänzen, `b` während der Übergangszeit bewahren.
- [x] Detailseiten DE/EN/FR getrennt für Charakterbindung,
  Accountbindung, Ausrüstungsbindung und unbekannt/null prüfen.
- [x] Regressionstest mit mindestens je einem Item aus den vier Fällen;
  zusätzlich Zähltest für den vollständigen Detailbestand.

### Schritt C – Rezeptrollen korrigieren

- [x] Item-Rückwärtsrelation als typisierte Beziehung modellieren:
  `regular_result`, `critical_result`, `ingredient`, `optional_ingredient`.
- [x] Mengen mitschreiben, wo der Export sie belegt.
- [ ] Legacy-Felder während der Umstellung parallel liefern oder
  Verbraucher koordiniert aktualisieren.
- [ ] Tests für normales Ergebnis, kritisches Ergebnis mit anderer
  Itemstufe, normale Zutat, optionale Zutat und Mehrfachversion ergänzen.
- [ ] Rezeptseite, Itemdetailseite, Handwerksfilter und
  „Wo bekomme ich das?“-Umschalter gemeinsam prüfen.

### Schritt D – Filterseite bewusst erweitern oder bewusst lassen

- [ ] Nach Review entscheiden, ob Bindung tatsächlich ein Suchfilter wird.
- [ ] Falls ja: zusätzliche Achse, Zähler/Fazetten, URL-Rundreise,
  Zurücksetzen und Filtergedächtnis testen.
- [ ] Falls nein: festhalten, dass Bindung vorerst nur Detailinformation ist.
- [ ] Bestehenden Hierarchiebaum, Itemmenge, Kategorie-/Qualitätsfilter,
  Stufenbereich und Links in allen drei Sprachen regressionsprüfen.

### Schritt E – Qualität absichern

- [ ] Prüfen: Quelle → `items.json` → PHP-Detailmodell → Twig-Ausgabe.
- [ ] Prüfen: Quelle → `items.json` → `gegenstaende-<sprache>.js`
  → Filterzeile/URL → PHP-`filter-i`-Beziehungszeile.
- [ ] Browserabnahme der Filterseite DE/EN/FR und der geänderten Itemdetails.
- [ ] Daten außerhalb des Repositories bauen, nach
  `AGENTS.md`-Vorgabe; nichts veröffentlichen.

## 6. Geprüfte Codepfade

- `build_items.py` – gemeinsamer Item-Namensraum und rückwärts gerichtete
  Rezept-/Belohnungs-/Sammelstellenbeziehungen.
- `build_gegenstandssuche.py` – Suchzeilen, Klassen, Labels und Filterfelder.
- `web/gegenstaende-filter.js` – Filterhierarchie, Matching, URL,
  Sortierung, Facetten und Ergebnislinks.
- `php/templates/app/gegenstandssuche.twig` – Suchoberfläche und geladene
  Filterkomponenten.
- `tools/build_php_data.py` – `filter-i`-Shards und Itemdetail-Page-Modelle.
- `tools/php_viewmodel.py:item_view()` – Fakten, Beziehungstypen und
  Itemseiten-Viewmodel.
- `php/src/Data.php`, `php/src/Page.php` – shardbasierter Seitenabruf und
  Templatezuordnung.
- `php/templates/entity/item.twig` – tatsächliche Itemdetaildarstellung.
- `build_gegenstaende.py` – statischer Vergleichs-/Altpfad; nicht mit dem
  normalen PHP-Seitenbau verwechseln.

## 7. Abgrenzung

Die Bestandsaufnahme ändert weder Generator noch Seitendarstellung. Sie
beweist keine Spielserververfügbarkeit und keine vollständige Semantik aller
Itemeffekte. Der Item Scanner bleibt eine ID-Entdeckungsquelle, keine
Eigenschafts- oder Beziehungsautorität.
