# LOTRO-Spieldaten: Datenraum, Properties und Relationen

**Prüfauftrag:** 17.11.2026. **Status:** laufendes, quellengestütztes Audit.

### Ausgeführter Lauf

Der Struktur-Auditor ist erfolgreich durchgelaufen: 1.141 XML-Dateien,
2.785 dateibezogene XML-Elementpfade und 84.761 DAT-Rohdatensätze aus fünf
Quellen. Die separate Referenzprüfung prüfte 210.908 Verweisvorkommen über
25 Regeln; 991 Vorkommen (613 verschiedene Auftraggeber-IDs) fehlen im
geprüften `NPCs.xml`-Zielbestand. Sie sind **nicht automatisch ungültig**:
weitere Objekttypen und die spezialisierten NPC-/Platzierungsexporte müssen
als mögliche Zielbestände geprüft werden.

Ein zunächst nur gegen Aufgaben beziehungsweise nur gegen Taten geprüfter
Voraussetzungsverweis erzeugte scheinbare Lücken. Die erneute Prüfung gegen
den gemeinsamen Aufgaben-/Taten-ID-Raum löst alle 13.129 geprüften
Voraussetzungsverweise auf. Das belegt die Zielauflösung, nicht die vollständige
Semantik jeder Voraussetzung.

Diese Dokumentation unterscheidet ausdrücklich zwischen vollständig erfassten
Feldvorkommen eines konkreten Datenbestands und vollständig entschlüsselter
Spielsemantik. Letztere ist mit den vorhandenen Exporten nicht für sämtliche
DAT-Klassen nachgewiesen. Dieses Dokument behauptet daher keine vollständige
Entschlüsselung des gesamten Spiels.

## Lesen und Umfang

- [Alle Companion-XML-Properties je Entität und Unterstruktur](lotro-datenraum-xml-properties.md)
- [Alle beobachteten DAT-Propertypfade je Klasse und Export](lotro-datenraum-dat-properties.md)
- [Referenzprüfungen und auflösbare Ziele](lotro-datenraum-relationen.md)
- [Vertiefung: 61 weitere Referenzprüfungen und Auftraggeber](lotro-datenraum-vertiefung.md)
- [Vertiefungsbelege mit offenen IDs und Quellhashes](lotro-datenraum-vertiefung.json)
- [Verdichtete Exporte: sämtliche Feldpfade und Vergleiche](lotro-datenraum-exportvergleich.md)
- [Feldabweichungen und offene Exportreferenzen, maschinenlesbar](lotro-datenraum-exportvergleich.json)
- [Charakterreferenzen, Decoder-Klassen und offene Kartenlinks](lotro-datenraum-charakterreferenz.md)
- [Einzelbelege zu Charakterreferenzen und Kartenlinks](lotro-datenraum-charakterreferenz.json)
- [Semantischer Datenvertrag: Bedeutung, Einheiten, Logik und Verluste](lotro-datenraum-semantik.md)
- [Tausch, Behälter, Zerlegung und schlanker Gegenstandsbestand: Modell für drei offene Bezüge](tausch-behaelter-zerlegung.md)
- [Konkrete Property-Lesezugriffe in 27 Extractor-Dateien](lotro-datenraum-semantik-leseindex.md)
- [Semantikbelege: Quellhashes und vollständige Befundlisten](lotro-datenraum-semantik-pruefung.json)
- [Nicht aufgelöste Referenzen, maschinenlesbar](lotro-datenraum-relationen.json)
- [Tatsächlich gelesene Quellen mit SHA-256](lotro-datenraum-quellen.md)
- [Laufumfang und Zähler](lotro-datenraum-lauf.json)
- [Reproduzierbarer lesender Auditor](lotro_datenraum_audit.py)

Die Anhänge gehören zur Dokumentation. Tabellen mit allen Attributen stehen
nicht nur für ausgewählte Muster, sondern für jeden tatsächlich beobachteten
Elementpfad im eingelesenen Stand zur Verfügung. Verschachtelte Strukturen
werden nicht als eigenständige Spielobjekte ausgegeben, nur weil sie XML-Tags
haben. Sprachlabels und Enums sind eigene Referenzbestände.

## 1. Validierungsregeln

1. **Strukturbeleg:** Feldname, Container, Typ und Vorkommen im vollständigen
   eingelesenen Bestand. Keine Bedeutungsableitung allein aus einem Feldnamen.
2. **Bedeutungsbeleg:** explizite Auswertung im Exporter/Decoder, verknüpft mit
   Quelldaten. Ein Website-Fallback ist keine zusätzliche Spielregel.
3. **Referenzbeleg:** benanntes Quellfeld, expliziter Zieltyp und exakter
   ID-Abgleich. Identischer Anzeigename reicht nicht.
4. **Grenzen:** Ein nicht vorhandener Wert bedeutet weder 0 noch false.
   Fehlende Ziel-ID bedeutet zunächst nur „in diesem Zielbestand nicht gefunden“.
5. **Kardinalität:** Beobachtete Mehrfachvorkommen sind keine Garantie für
   allgemeine Mindest-/Höchstkardinalität.
6. **Aktualität:** Ein gelesener Client-/Lore-Stand beweist nicht die heutige
   Serververfügbarkeit oder die Freischaltung eines Charakters.
7. **Rechte:** Quellenzugang und Bibliothekserlaubnis sind keine pauschale
   Weitergabeerlaubnis für Spieltexte, Bilder oder fremden Code.

Ungeklärte DAT-Felder bleiben mit ihrem unveränderten technischen Namen im
Strukturinventar sichtbar. Ihre Bedeutung wird nicht als gültige Fachinformation
ausgegeben. Damit verschwinden unbekannte Properties nicht still aus „alle Properties“.

## 2. Quellen und ihre Grenzen

### DAT-Rohdaten

Wurzel: `~/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter/`.
Der als `full-dat-en-de-fr-2026-11-03` benannte Ordner umfasst ausgewählte
Aufgaben-/Taten-/Geografie-/Kontrollklassen, nicht alle Klassen des Spiels.

**Wichtige Herkunftskorrektur:** `NOTE-2026-11-03.md` bestätigt, dass nur
`quests.json` und `deeds.json` am 03.11. erneut gelesen wurden. Positionen,
Gebiete und weitere Dateien wurden vom Stand 01.11. übernommen. Das
Ordnerdatum ist deshalb kein einheitlicher Exportzeitpunkt. Das vorhandene
Manifest trägt weiterhin einen Erstellungszeitpunkt vom 01.11. Der Roh-Anhang
kennzeichnet seine tatsächliche Quelldatei; `raw.jsonl` darf nicht automatisch
als neuester Textstand bezeichnet werden.

Zusätzliche Bestände: NPCs, platzierte Entitäten, DID-Positionen, Ruf/Handwerk,
Belohnungen, Rezepte, Gegenstände, Sets und spezialisierte Instanzenexporte.
Fehlende Rohdaten einer Klasse werden nicht durch einen kompakten Website-Export
als angeblich vollständige Rohdefinition ersetzt.

### Companion

Aktive Lore:
`~/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore/`.
Die frühere Compendium-Tools-Kopie unter `Companion-Test` ist ein zusätzlicher
historischer Vergleichsstand, nicht automatisch der vollständige aktuelle Bestand.
Insbesondere liegt `items.xml` in der aktiven Lore.

Die XML-Attribute sind gespeicherte Companion-Felder. Sie sind nicht eins zu
eins identisch mit DAT-Propertynamen. Eine XML-Auswertung belegt keine
unabhängige zweite Datenherkunft, wenn sie denselben DAT-Decoder verwendet.

### Website und Plugin

Generatoren und Viewmodels dokumentieren Transformationen, Filter und Verluste.
Sie sind kein vollständiger Ersatz für Rohdaten. Plugin und Website bleiben
getrennt; Charakterfortschritt wird nicht eingelesen oder veröffentlicht.

Insbesondere `Data/Progress.lua`, PluginData, Konten und Charakterexporte sind
kein Bestandteil dieses Audits.

### LOTROInterface: Compendium und Item Scanner

- Compendium: <https://www.lotrointerface.com/downloads/info526-LOTROCompendium.html>
- Item Scanner: <https://www.lotrointerface.com/downloads/info699.html>
- Scanner-Archiv: <https://www.lotrointerface.com/downloads/download.php?id=699>

Geprüft wurde der Scanner-Quellcode von **Version 1.2**, insbesondere
`Compendium/Extensions/ItemBrowseControl.lua`, Funktionen
`BuildDiscoveryDatabase`, `ImportScanData`, `persist`, `LoadItems`.
Kein Plugin wurde installiert oder im Spiel ausgeführt.

## 3. Identitäten und ID-Räume

- DAT-Quellobjekte: achtstellige Hex-ID in den Exporten; referenzierende
  Properties können dieselbe Zahl dezimal enthalten.
- Companion: viele Objekt-IDs dezimal. Eine Umrechnung muss den 32-Bit-Wert
  erhalten; Sprache ist kein Teil der Spielidentität.
- Karten-ID, Kartenbild-ID, Weltregion-Code, geografische Gebiets-ID,
  Marker-ID und platzierte Objekt-DID sind getrennte Identitäten.
- Berufs-/Enum-Schlüssel sind nicht pauschal DAT-Objekt-IDs.
- Lokalisierung: Objekt-ID plus Propertypfad beziehungsweise Labelschlüssel
  und Sprache. Gleiche Anzahl Sprachschlüssel beweist keine vollständige Übersetzung.
- Ein Objekt kann mehrere Platzierungen und mehrere Rollen haben.
  Auftraggeber, Händler und Tauscher sind Rollen, nicht zwingend
  unterschiedliche NPC-Identitäten.

## 4. Fachliche Entitäten und belegte Relationen

Für **alle** Properties der hier genannten Bestände gelten die vollständigen
Pfadtabellen im XML-/DAT-Anhang. Dieser Abschnitt erklärt ausschließlich die
quellengestützten Zusammenhänge und Transformationsgrenzen.

### Aufgabe und Tat

DAT-Klasse 1398 enthält beide. `Quest_IsAccomplishment` wird zur Trennung
ausgewertet; nicht aus dem Namen ableiten. Name, Beschreibung, Zielstruktur,
Voraussetzungen, Belohnungen und Flags sind getrennte Felder.

Belegte Verweiswege:

- `Quest_QuestTreasureDID` → Belohnungstabelle.
- `Quest_NextQuest` → weitere Aufgabe; nicht ungeprüft als lineare Kette verstehen.
- `Quest_PrecludedQuest` → ausschließender Aufgabenverweis.
- `Quest_BestowalRoles` → Bestowal-Rollenstruktur, nicht bloß ein Gebername.
- `Quest_ObjectiveArray` → Ziele und Bedingungen mit eigenen Indizes.
- `Quest_PositiveFaction` / `Quest_NegativeFaction` → Fraktionsbezug.
- `QuestArc_Quest_Array` → Mitglieder einer Aufgabenreihe (Klasse 2119).

Voraussetzungen müssen mit ihrer Logik (UND/ODER, Status, Negation) erhalten
bleiben. Eine flache ID-Liste ersetzt keine Bedingungsstruktur.
`Quest_IsHidden`, fehlende LOTRO-Punkte oder ein fehlender Journaleintrag
beweisen keine generelle Unspielbarkeit.

Companion speichert unter `quests.xml`/`deeds.xml` unter anderem Voraussetzungen,
Zielbedingungen, Belohnungen und Kartenbezüge. Die vollständigen
Unterelemente stehen pfadgenau im Anhang. Die Website verwendet zusätzlich
verkürzte Schlüssel (`i`, `v`, `vo`, `vl`, `vb`, `rw`, `fk` usw.); diese
sind Ausgabeformat, keine originalen DAT-Properties.

### Ziel, Bedingung und Zielposition

Ziele und Bedingungen sind eingebettete Strukturen mit eigener Reihenfolge.
Ziel-/Bedingungsindex gehören zur Identität eines Fortschrittszählers.
Referenztypen unterscheiden unter anderem NPC, Objekt, Item, Landmarke,
Fertigkeit, Fraktion und andere Aufgaben/Taten.

`locations.json` enthält Zuordnung zur Aufgabe/Tat, Ziel-ID,
Ziel-/Bedingungsindizes und räumlichen Kontext. Positionen bestehen nicht nur
aus Länge/Breite: Region, Instanz/Layer, Zelle/Block und lokale XYZ dürfen
nicht durch einen bloßen Koordinatenvergleich verloren gehen.
Endliche Koordinaten sind kein Nachweis einer korrekten Karte.

### Belohnungstabelle

`export_rewards.py`, Funktion `export`, belegt:

- `QuestTreasure_FixedItemArray` und `SelectableItemArray` →
  Gegenstände mit `QuestTreasure_Item` und `ItemQuantity`.
- `FixedTitleArray` / `SelectableTitleArray` → Titel.
- `FixedTraitArray` → Traits.
- `FixedEmoteArray` / `SelectableEmoteArray` → Emotes.
- `FixedVirtueArray` → Tugendreferenz und originales Increment-Feld.

**Verlust im kompakten Export:** feste und wählbare Titel werden in `titles`
zusammengeführt; auch bei Emotes geht diese Trennung verloren. Der kompakte
Belohnungsexport ist damit für eine vollständige Relationstypisierung nicht
ausreichend. Die IDs sind im spezialisierten Export vorhanden, auch wenn
spätere Web-/Plugin-Belohnungszeilen sie teilweise nicht weiterreichen.

Eine ungeprüfte Tugend-Increment-/XP-Tierzahl wird nicht in Tugend-EP umgedeutet.
Billing-Tokens bleiben Content-/Abrechnungsreferenzen, keine gleichartige
Gegenstandsbelohnung.

### Gegenstand

Vollständige gespeicherte Companion-Struktur: `items.xml`; zusätzlich
Enums, `stats.xml`, `progressions.xml`, `sets.xml`, Container-, Beute- und
Rezeptbestände.

`export_items.py` verwendet:

- DAT: `Name`, `Description`, `Item_Level`, `Usage_MinLevel`, `Usage_MaxLevel`,
  `ItemMunging_MinMungeLevel`, `ItemMunging_MaxMungeLevel`, `Item_Quality`,
  Icon-Layer, `Mod_Array`, `Item_Armor_Value`, `Combat_WeaponSpeed`,
  `Inventory_BindOnAcquire`, `Inventory_BindOnEquip`, `Inventory_Unique`.
- Companion-Metadaten: Kategorie, Slot, Rüstungs-/Waffen-/Schadensart,
  Klassen-/Berufsvoraussetzung, Stufe, Skalierung, DPS und Schaden.

**Wichtige Abgrenzung:** Der Export wählt seine IDs tatsächlich über
`sorted(items_meta)` aus `items.xml` und prüft ihre Existenz im DAT-Inventar.
Sein Titel „every item“ beweist keine Vollständigkeit aller Item-DAT-Klassen.
Das ist gerade der Bereich, in dem Scanner-IDs zusätzliche Lücken zeigen können.

Weitere Transformationsverluste:

- Bindung wird auf 0/1/2 reduziert; vollständige Accountbindung folgt daraus nicht.
- `sets_by_item[item] = set_id` hält nur den zuletzt zugewiesenen Setwert;
  eine mögliche Mehrfachzugehörigkeit geht verloren.
- Nicht vorhandene numerische Werte werden teilweise 0. Diese 0 ist dann
  ein Exportfallback, kein gesicherter originaler Spielwert.
- Mindeststufe kann aus anderen Feldern ergänzt werden; ursprüngliche
  `Usage_MinLevel` und abgeleitetes `ml` müssen getrennt dokumentiert bleiben.
- Stats werden über Progressionskurven und Rundung abgeleitet. Nicht jede
  Itemklasse/Skalierung wird dadurch vollständig erklärt.
- `ITEM` ist eine breite Kategorie. Client-`class`/`equipmentCategory`
  bleiben eigenständige Achsen; nicht automatisch „Sonstiges“ nennen.

### Item Scanner: genaues gespeichertes Modell

Ein Scanner-Datensatz kann `id`, `name`, `cat`, `qual`, `level` enthalten.
`id` wird numerisch gespeichert und zur Shortcut-Anzeige in Hex umgerechnet.
Automatisch gelesen werden optional `GetName()`, `GetCategory()`, `GetQuality()`
über `GetShortcut():GetItem():GetItemInfo()`.

`level` wird in `LoadItems` manuell aus einem Textfeld übernommen.
Auch Name, Kategorie und Qualität sind bearbeitbar. Eine gespeicherte Datei
kennzeichnet deren automatische/manuelle Herkunft nicht je Feld.
Sie darf deshalb nicht pauschal als unveränderte Clientauskunft gelten.

Scankonfiguration: `min`, `max`, `itemid`, `discovereddb`, `loaddetails`,
`skipknownitems`. Accountweite Speicherung unter `CompendiumItemScanner`.
Das ist Scannerzustand, kein Item-Propertysatz.

Der Scan versucht Shortcuttypen `Hobby`, `Skill`, `Item` und nimmt einen
erfolgreich erkannten Item-Shortcut auf. Es ist weder ein Inventarscan des
Charakters noch ein Verfügbarkeits-/Besitznachweis. Der feste historische
Standard-ID-Bereich garantiert keine heutige Gesamtdeckung.

Keine Ausrüstungseigenschaften, Rezept-, Händler-, Beute-, Quest- oder
Setrelationen werden dadurch vollständig exportiert. Die Websitebeschreibung
enthält ältere Abschnitte und neuere 1.2-Änderungen; der geprüfte Code belegt
die automatische Name/Kategorie/Qualität-Funktion.

### Rezept, Beruf, Stufe und Zutat

DAT-Klasse 1024; `export_recipes.py` belegt:

- `CraftRecipe_ResultItem` und `ResultItemQuantity` → reguläres Ergebnis.
- `CraftRecipe_CriticalResultItem` und Menge → kritisches Ergebnis.
- `CraftRecipe_Profession` → Beruf.
- `CraftRecipe_Tier` → Stufencode, `CraftRecipe_UICategory` → Kategorie.
- `IngredientList` / `OptionalIngredientList` → Zutaten mit Mengen;
  optionale Zutaten zusätzlich `IngredientCritBonus`.
- `CriticalSuccessChance`, `ExecutionTime` bleiben eigene Messwerte.

Ein Rezept ist nicht derselbe Datensatz wie ein erlernbarer Rezeptgegenstand.
`scrollItem`/Rezept-ID und hergestellter Itemtyp dürfen nicht zusammenfallen.
Der kompakte Export verwirft Rezepte ohne aufgelöstes Ergebnis oder ohne
aufgelöste Zutaten. Mengen-Default 1 ist an mehreren Stellen Generatorlogik.

`crafting.xml` enthält Beruf, Berufsstufe, Beherrschung/Fertigkeit und
historische Berufsverbünde. Dass Verbünde gespeichert sind, beweist nicht ihre
unveränderte aktuelle Spielmechanik.

### NPC, Kreatur, Auftraggeber, Händler und Tauscher

Bestände: `NPCs.xml`, `mobs.xml`, `vendors.xml`, `barters.xml`,
platzierte DAT-Entitäten und DID-Positionen.

NPC-ID und Platzierungs-ID sind verschieden. Ein NPC kann viele Standorte
haben. Ein Händler verweist auf Verkaufslisten; Tauscher führen Profile und
Tauscheinträge mit Abgabe/Erhalt/Menge sowie gegebenenfalls Voraussetzungen.
Beute und Rufbezüge von Kreaturen sind eigene Relationen, keine Positionen.

Auftraggebernamen ohne eindeutige ID erzeugen keine sichere NPC-Verknüpfung.
Die Gruppierung identischer Namen ist keine Identitätszusammenführung.
Jagdhinweise aus Kreaturenplatzierungen sind keine exakten Tat-Zielpositionen.

### Karte, Kartenbild und Kartenlink

**Karte ist eine eigenständige Entität.** Sie ist nicht gleichbedeutend mit
geografischem Gebiet oder Website-Navigationsknoten.

- `parchmentMaps.xml`: Karten-ID, Name, Region-Code, Elternkarte,
  Questguide-Information und zugeordnete Gebietsreferenzen.
- `maps/maps/maps.xml`: Karten-ID, `imageId`, geografischer Faktor,
  Min-/Max-Grenzen und weitere im Anhang erfasste Unterstrukturen.
- `maps/links.xml`: Quell-ID, Ziel-ID, Linkposition und
  tatsächlich vorhandene zusätzliche Attribute.

**Nachprüfung des vollständigen Linkbestands:** 2.557 Links. Die 2.557
`parentId`-Vorkommen verteilen sich auf 1.152 in `maps.xml` auflösbare
Kartenreferenzen und 1.405 Referenzen auf 266 geografische Gebiete.
Alle Quell-IDs lösen sich in dieser Union auf. Von 2.557 Zielreferenzen
fehlen zwei im geprüften Kartenbestand: `268448107` und `268449764`.
Sie sind damit ungeklärt, nicht pauschal ungültig. Die `parentId` eines
beliebigen Links ist insbesondere kein Beweis für eine Karten-Elternrelation.
- `maps/labels/<Sprache>/basemaps.xml`: sprachabhängiger Kartenname.
- Marker besitzen eigene IDs und Kategorie/DID/Positionsbezüge.

Zwei Karten können dasselbe Bild verwenden und unterschiedliche Rahmen haben.
Ein Navigationslink ist nicht automatisch eine geografische Enthaltenseinrelation.
Region-Codes sind keine Karten-IDs.

### Kartenname, Kartenzuordnung und Website-Navigation

Ein Kartenname ist Anzeigetext, keine Identität. `kartenname()` leitet ihn in
fester Reihenfolge ab: Sprachlabel der Karte, gemeinsames Präfix der Kindkarten,
englischer Name über Kartenlabels und Gebietsnamen, zuletzt ein technischer
Ersatzname. Fehlt eine Beschriftung im Client, hat die Karte in
`parchmentMaps.xml` dennoch zugeordnete Gebiete. Deren Namen sind die belastbare
Benennungsquelle (`gebietsnamen()` aus dem eigenen DAT-Export). Sie brauchen
dieselbe Bereinigung wie Gegenstandsnamen, weil einzelne Gebietsnamen
Client-Escapes wie `\q` tragen (8 von 1.610).

Am 20.11.2026 tragen 17 Karten keinen Namen. Sie erzeugen je Sprache 193
Aufgaben- und 52 Tatenlabels sowie 17 der 216 Einträge der Kartennavigation,
sämtlich in der Form `Karte <ID>`. Ein technischer Ersatzname ist ein
Datenmangel, keine Spielbezeichnung. Gemessen ist die Zahl über
`daten/quests-<sprache>.json`, `daten/taten-<sprache>.json` und
`web/gebiete-<sprache>.js`.

Die Website-Navigation (Region → Landschaft → Unterkarte) ist eine Projektion
aus den Labels `f` und den Karten-IDs `fk`. Sie ist kein Geografiebaum:
`geoAreas.xml` führt Region → Territorium → Gebiet, `parchmentMaps.xml` ordnet
Karten Gebieten zu. Vergleich am 21.11.2026: 6 Regionen, 64 Landschaften und
152 Unterkarten bei uns gegen 7 Regionen, 86 Territorien und 679 Gebiete in
`geoAreas.xml`. 30 Landschaften tragen exakt einen Territoriumsnamen, 6 bilden
ein Gebiet ab, 34 führen eigene Kartennamen; 19 Territorien verteilen sich auf
mehrere Landschaften.

Die Regionszuordnung stammt aus `f[0]`, nicht aus dem Karten-Regionscode.
Deshalb kann eine Karte in einer anderen Website-Region stehen als ihr Code
erwarten lässt (Morannon: Code 3, Inhalt Das Ödland). Die Regionsebene von
`geoAreas.xml` taugt nicht als Anzeigegliederung: Rohan, Gondor und Mordor
hängen dort unter Rhovanion, zwei Regionen bleiben leer. Belastbare
Vergleichsebene ist das Territorium.

Dieselben Gebietswerte speisen auch den Filter „Region und Gebiet“ für Aufgaben
und Taten. Eine Kartenumbenennung kann daher Filteroptionen unterhalb der
Regionsebene umbenennen oder zusammenführen. Solange `f[0]` und die
Regionszuordnung nicht geändert werden, bleiben die sechs Regionsgruppen und
ihre Gesamtsummen stabil; Gebietszähler können sich durch die Zusammenfassung
auf neue Optionen verteilen. Die Zähler sind pro Aufgaben-/Tatenindex aus den
gebauten Datensätzen zu prüfen, nicht aus der Kartennavigation abzuleiten.
Am 21.11.2026 wurden die sechs Helm-Klamm-Varianten für Aufgaben unter
„Helms Klamm“ zusammengefasst (43 Aufgabenoption-Treffer); der Tatenfilter hat
85 Treffer für die Region Rohan und keine Taten auf diesen Karten. Die
Regionensummen und getrennten Gebietsoptionen stehen im
Abnahmevermerk `docs/archiv/kartenbenennung-hierarchie.md`.

**Korrektur gegenüber vereinfachten bisherigen Aussagen:** `GameMaps.attribute`
ordnet Positionen anhand Rahmen, Tiefe und Abstand zur Mitte zu; bei
überlappenden Karten ist das eine Auswahlregel. `_fit_overviews` berechnet
Übersichtsrahmen durch lineare Anpassung. Solche abgeleiteten Werte werden
nicht als originale, exakt validierte DAT-Grenzen ausgegeben.
MoorMap wird nur für optionale Plugin-Kartennummern verwendet, nicht als
autoritative Geometriequelle.

### Geografische Region, Territorium, Gebiet und Verlies

Im Baseline-DAT sind Klassen 180, 692, 690 und 691 getrennt.
`Area_RegionID`, `Area_Region`, `Area_Territory`, `Dungeon_ParentDungeon`
sind unterschiedliche Properties. `geoAreas.xml` bildet geografische
Hierarchien ab; `dungeons.xml` kann Positionen und Basemap-Bezüge enthalten.

Ein Gebiet braucht keine eigene Karte; eine Karte kann mehrere
Navigationspfade besitzen. Aus einer Karten-ID folgt keine eindeutige
Position eines Gebietsknotens im Websitebaum.

Für den Abgleich der Website-Hierarchie gilt: Territorium ist die
Vergleichsebene, nicht die Region. Eine Landschaft ohne Territoriumsbezug und
ein Name der Form `Karte <ID>` sind Prüfbefunde, keine Spielbezeichnungen.

### Landmarke und Vorkommen

Landmarken: DAT-Klasse 1210 und `landmarks.xml`; Positionen separat über DID.
Aufgaben-/Tatbedingungen können Landmarken nach ID referenzieren.

Rohstoffvorkommen: `resources.xml` und Kartenmarker; Beruf/Stufe/Item und
mögliche Fundstellen sind getrennte Bezüge. Eine mögliche Platzierung ist
keine Zusicherung des aktuell vorhandenen Rohstoffs, seiner Menge oder
Nachwachszeit.

### Instanzvorlage und Instanzenfinder

Vorlagen: Klassen 1368/2651, `privateEncounters.xml`.
Finder-Auswahl: `WorldJoinControl` Klasse 2606 (`7001B7CE`),
`WorldJoin_AvailablePETemplates_Array` und `WorldJoinControl_InstanceGroups`.
`Skirmish_Template_GroupSizeArray`, Min-/Max-LevelScale und
DifficultyTierArray sind die Quellen für konfigurierte Größen/Stufen/
Schwierigkeiten, nicht Aufgabenstufe oder Namenspräfix.

Vorlage, auswählbarer Findereintrag, Begegnungsgruppe, Contentlayer und
öffnende Aufgabe sind getrennte Begriffe. Vorlagenmitgliedschaft allein
beweist keine aktive Finder-Verfügbarkeit.

### Fraktion, Titel, Tugend, Trait, Fertigkeit und Emote

Jeweils eigene Bestände mit eigenen IDs/Schlüsseln; sämtliche Properties in
`factions.xml`, `titles.xml`, `virtues.xml`, `traits.xml`, `skills.xml`,
`emotes.xml` einschließlich Unterstrukturen erfasst.

Fraktionsstufen sind nicht mit exakt bekannten persönlichen Rufpunkten
gleichzusetzen. Traits können Effekte/Fertigkeiten referenzieren; Tugenden
nutzen Stats/Skalierungen. Ein Belohnungsname ohne ID ist kein belastbarer Join.

### Reise

`travelNPCs.xml`: NPC, Knotenreferenz, Entdeckungsbedingung und Position.
`travels.xml`: Knoten, Ziele, Routen, Routenaktionen, Preise, Mindeststufe,
Quest-/Fraktionsbedingungen, Modus und swift-Flag.
`skills.xml` enthält Reisefertigkeiten als eigene Unterstruktur.

Route ist eine gerichtete Verbindung; Preis 0 kann belegt sein. Routen-
Aktionen und Delay sind nicht automatisch die gesamte Reitdauer. Die
Zusammenlegung gleich positionierter Knoten ist eine Projekttransformation.
Keine Dauer, Kilometer oder Charakterfreischaltungen daraus erfinden.

### Weitere vollständig strukturell erfasste Companion-Bestände

Das Inventar umfasst auch Effekte und Effekt-Untertypen, Aktionstabellen,
Beutetabellen und Untertabellen, Container, Stats, Progressionen,
Wertetabellen, Klassen, Rassen, Herkunft, Sammlungen, Bündnisse,
Welt-Ereignisse, Housing, Hobbys, Legendärsysteme, Traceries, Relikte,
Entzauberung, Belohnungspfade und technische Referenzlisten.

Für diese Bestände sind Feldpfade und gespeicherte Verschachtelungen
vollständig aufgelistet. Die vollständige Semantik aller Effektoperatoren,
Loot-Codes und dynamischen Voraussetzungen ist damit **nicht** bestätigt.
Insbesondere `dropFrequency`, Gewicht, Auswahlzahl und Wahrscheinlichkeit
sind keine austauschbaren Begriffe.

## 5. Bestehende TODOs und Widersprüche

- `docs/todos/entitaeten-verlinkung.md`: Der frühere URL-Audit prüft die
  Erreichbarkeit gebauter URLs. Er beweist nicht sämtliche Rohdatenrelationen.
  „Keine IDs“ trifft dort auf bestimmte verdichtete Ausgabezeilen zu,
  nicht allgemein auf Titel-/Trait-/Emote-Quelldatensätze.
- `docs/todos/kartenreiter-aufgaben.md`: Mehrere Navigationsknoten mit
  derselben Karten-ID sind ein konkreter Beleg, dass Karte und Baumknoten
  getrennte Identitäten benötigen.
- `docs/todos/aufgaben-navigation.md`: Thema/Klasse/Herkunft und geografische
  Navigation sind verschiedene Auswahlachsen; UI-Gruppen nicht zu neuen
  Spielobjekten erklären.
- `docs/todos/SEO.md`: behandelt Ladeverhalten, keine zusätzlichen
  Spielrelationen. Gekürzte Initialdaten sind nicht der vollständige Katalog.
- `docs/archiv/dat-auswertung-2026-11-06.md`: datierter Untersuchungsstand,
  einschließlich damaliger offener Punkte. Nicht ungeprüft als aktueller
  Feld-/Verfügbarkeitsnachweis übernehmen.
- `docs/fachbereiche/instanzenfinder-dat.md` ersetzt die ältere Namenspräfix-/Queststufen-
  Ableitung für die Finder-Darstellung.

## 6. Noch nicht abgeschlossene Vollständigkeitsnachweise

### Abgeleitete Qualitätsprioritäten

Die auditgestützten Konsequenzen und konkreten Abnahmekriterien stehen in
[`todo-qualitaetsverbesserung.md`](todo-qualitaetsverbesserung.md). Kurz:

1. Account-/Charakterbindung und Rezeptvarianten verlustfrei erhalten.
2. Fehlend, explizite Null, fehlgeschlagene Auflösung und berechnete Werte
   getrennt behandeln.
3. Beziehungen und Aufgabenbedingungen nur in der belegten Struktur
   auswerten.
4. Quelle → Export → Seitenmodell mit Regressionen absichern.

Das ist eine priorisierte Arbeitsgrundlage, keine bereits erteilte Freigabe
für Implementierung, Datenneubau oder Veröffentlichung.

### Fünfter Prüfschritt: tatsächliche Bedeutung und Informationsverluste

Der separate [semantische Datenvertrag](lotro-datenraum-semantik.md) erläutert
an konkreten Codepfaden:

- UND-/ODER-Verknüpfung, Vergleichsoperatoren und Statuscodierung von
  Aufgaben-/Tatvoraussetzungen; Entfernen ungelöster Voraussetzungen
  und den Hiding-Content-Sonderfall im Extractor.
- Bindungsentscheidung, Stapelgrenzen, Item-/Nutzungs-/Skalierungsstufen,
  Haltbarkeit, gewährte Fertigkeiten/Traits und kontextabhängige XP.
- Rezeptvarianten, kritische Chance als Bruchzahl versus Prozentinteger,
  XP-/Cooldown-Schlüssel statt direkter Mengen und Sekundenwerte.
- Item-/Beuteprofil-Union, Filter, Mengen-Defaults und getrennte Gewichte/
  DropFrequency-Codes; Decoder-Fallback 0 bei fehlendem Lookup.
- Tauschrichtung anhand der Arrayreihenfolge, mengenbestimmende
  Lookup-Kurven und ausdrücklich unvollständige Extraktorbedingungen.

Konkrete Verluste: 38.514 Accountbindungen werden im kompakten Feld `b`
nicht unterschieden; 2.480 Rezepte haben mehrere Ergebnisversionen;
756 Rezepte enthalten Varianten, in denen normale/kritische Ergebnisse
erst über ihre Stufe unterscheidbar sind. 4.557 Grundchancen wurden
einheitenrichtig ohne Abweichung abgeglichen.

Die 314 erfassten Propertyzugriffe aus 27 gezielten Quelldateien sind
kein pauschaler Semantiknachweis für alle 285 dabei vorkommenden
Propertynamen. Der breitere Quellindex wurde durch einen iCloud-Lesetimeout
unterbrochen und zählt nicht als erfolgreicher vollständiger Lauf.

Prüfabschluss dieses Teilschritts: elf Audit-Regressionstests bestanden;
alle 17 relativen Dokumentationslinks im Hauptdokument zeigen auf vorhandene
Dateien. Keine Website-, Plugin-, Client- oder Charakterdatei geändert.

### Vierter Prüfschritt: Klassen, Charakterreferenzen und Kartenlücken

23 weitere Regeln, 5.411 Referenzvorkommen: nach Korrektur der konkreten
Zielräume sämtliche Werte auflösbar. Geprüft wurden Rasse/Herkunft,
erlaubte Klassen, Rassen-/Klassen-Traits, Klassenfertigkeiten und Traitbäume,
Herkunftstitel, Tugendkurven/-effekte, Bündnisse, Sammlungstitel,
Handwerks-Titel/-Rezepte/-Gilden und Fraktionsstufen-Taten.

Zwei relevante Schemaeigenschaften:

- `allegiance/@advancementProgressionID` verweist im geprüften XML auf
  `allegiances.xml/curve/@id`, nicht auf `progressions.xml`.
  Alle sieben Referenzen lösen sich dort auf. Gleiche technische
  Benennung „Progression“ bedeutet nicht denselben Tabellenbestand.
- `faction/level/@deedKey` enthält sowohl symbolische Tat-Keys als auch
  dezimale Tat-IDs. Der ursprüngliche reine Key-Join ließ 162 Werte
  offen; die Union aus Tat-Key und Tat-ID löst alle 358 Werte auf.
  Das Quellfeld darf nicht pauschal in eine einzige numerische oder
  symbolische Darstellung umgewandelt werden.

Die Bedeutung der zuvor nur numerisch behandelten Auftraggeberklassen wurde
gegen die verwendete Decoder-Bibliothek überprüft:
`classes.xml` innerhalb `delta-lotro-dat-utils-11.13.jar` nennt
796 = `IItem`, 1723 = `MonsterTemplate`, 1724 = `NPCTemplate`.
`javap -constants` bestätigt außerdem MOB=1723 und NPC=1724.
Der NPC-Extractor akzeptiert nur `WStateClass.NPC`. Sein begrenzter
Zielbestand erklärt somit nicht das gesamte Rollenspektrum von Auftraggebern.
Ein MonsterTemplate ist allein durch die Klassenzugehörigkeit noch kein
feindlicher Gegner; ein IItem noch kein tragbarer Inventargegenstand.

Die zwei offenen Kartenlink-Ziele `268448107` und `268449764` besitzen auch
keine Treffer in den geprüften Kartenlabels DE/EN/FR. Beide eingehenden Links
haben `parentId=268451272` und `contentLayerId=0`, aber unterschiedliche
`from`-Positionen. Ohne Zielgeometrie und Identitätsbeleg werden keine
Kartenentitäten oder Grenzen ergänzt. Die Linkdatensätze bleiben erhalten.

### Dritter Prüfschritt: verdichtete Exporte

Der erfolgreiche Vergleich erfasste die vollständigen gespeicherten
Item-, Set-, Rezept-, Rezeptquellen- und Belohnungsstrukturen. Der erweiterte
Wiederholungslauf ist ebenfalls abgeschlossen: 24 Abdeckungs-/Referenzregeln
mit 466.178 Verweisvorkommen und 666.741 Feldvergleiche über neun Feldpaare.
Die Regeln umfassen auch Gegenrichtungen, sind also keine Zählung
verschiedener Spielbeziehungen. Reproduktion:
`python3 lotro_datenraum_exportvergleich.py`.

Belegt im ersten erfolgreichen Lauf:

- 152.088 Itemexport-IDs existieren im Companion-Bestand von 152.100 Items.
  Die zwölf nicht exportierten IDs haben dort sämtlich einen leeren Namen.
  Daraus folgt nicht automatisch, an welcher Stelle der historischen
  DAT-Verarbeitung sie entfallen sind.
- Neun explizit verglichene Item-Feldpaare stimmen für alle jeweils auf
  beiden Seiten vorhandenen Werte überein: Qualität, Stufe, Kategorie,
  Slot, Rüstungsart, Waffenart, Schadensart, Klassen- und Berufsvoraussetzung.
  Die unterschiedlichen Nenner sind im Anhang erhalten. Dies ist keine
  Bestätigung der nicht verglichenen Defaults, Stats oder Mindeststufen.
- Alle 2.223 Setexport-IDs, 11.159 Set-Mitgliederverweise und ausgegebenen
  Item-Set-Verweise sind auflösbar. Im geprüften Companion-Bestand wurden
  **keine tatsächlichen Mehrfach-Setmitgliedschaften** und keine widersprechenden
  Item-Set-Zuordnungen gefunden. Der skalare Export wäre dafür strukturell
  verlustbehaftet, aber dieser konkrete Stand zeigt keinen solchen Verlust.
- Reguläre und kritische Rezeptresultate sowie reguläre und optionale
  Rezeptzutaten sind im vollständigen Itemexport auflösbar.
- 44 unterschiedliche Stat-Referenzen in den als `virtues` verdichteten
  Belohnungszeilen fehlen im dortigen Tugend-Namenskatalog. **Alle 44**
  tragen die Stats-Labels „Skirmish Test Rank“ (EN/FR) und „Testrang für
  Scharmützel“ (DE). Sie dürfen nicht allein aufgrund des Exportfeldnamens
  als reguläre Tugenden behandelt werden. Belege für jede ID im JSON-Anhang.
- Sechs Rezeptquellen-Schlüssel fehlen im Rezeptexport. `700777B8` existiert
  im Companion-Rezeptbestand; `70076B49`, `70076B4A`, `70076B3C`,
  `7007764C` und `70076B52` fehlen auch dort. Diese Bestandsabweichung
  erklärt noch nicht ihre historische Ursache.

Ein fehlender kompakter Belohnungsschlüssel ist kein Nachweis einer fehlenden
DAT-Tabelle: Der Exporter filtert Tabellen nach seinen unterstützten
Belohnungsarten. Das betrifft im geprüften Bestand 3.812 Aufgaben- und
1.082 Taten-Verweisvorkommen. Ohne die zugehörigen Rohtabellen ist eine
abschließende Klassifikation jedes Falls nicht belegt.

### Zweiter Prüflauf

Reproduktion: `python3 lotro_datenraum_vertiefung.py`. Fünf automatische
Regressionstests für JSON-/XML-Pfadbildung, Referenzzähler, verschachtelte
Reliktziele und die Trennung von Inventar-/Dekodierbeleg bestanden:
`python3 test_lotro_datenraum_audit.py`. Dies sind Audit-Werkzeugtests,
keine vollständigen fachlichen Spieltests.

61 zusätzliche Regeln erfassen 416.636 Referenzvorkommen. Davon sind
415.366 gegen die ausdrücklich genannten Zielbestände auflösbar;
1.270 Vorkommen bleiben in diesen Zielbeständen offen:

- `npcTalk`: 1.222 Vorkommen in Aufgaben (507 verschiedene IDs) und
  31 in Taten (acht verschiedene IDs). Sämtliche dieser verschiedenen IDs
  gehören laut DAT-Inventar zur Klasse 1723. Das Feld `npcId` beweist
  also allein keine Mitgliedschaft in `NPCs.xml`.
- Zwei Instanzvorlagen referenzieren Aufgaben-IDs, die in den geprüften
  Companion-Aufgaben-/Tatenlisten fehlen, aber im DAT-Inventar Klasse 1398
  besitzen: `1879443606` und `1879407580`.
- 13 Tat-Zielbedingungen verweisen auf dieselbe im Companion-Zielbestand
  fehlende ID `1879049597`; auch sie existiert im DAT-Inventar Klasse 1398.
- Zwei Kartenlink-Ziele fehlen im geprüften Kartenbestand (siehe oben).

**Nachprüfung gegen den normalisierten DAT-Export:** Alle drei zuletzt
genannten Aufgaben-IDs sind tatsächlich in
`full-dat-en-de-fr-2026-11-03/quests.json` vorhanden, Klasse 1398:
`1879443606` = `70060896`, `1879407580` = `70057BDC`,
`1879049597` = `7000057D`. Damit lösen sich die zwei Instanzverweise und
13 Tat-Zielverweise gegen diesen DAT-Bestand auf. Die Zahlen im
Companion-Referenzbericht bleiben korrekt als Prüfung genau jenes Zielbestands
erhalten; sie dürfen nicht als ungelöste Referenzen über alle Quellen gelesen
werden. Einzelbelege und Hashes:
`lotro-datenraum-aufgabenluecken.json`; reproduzierbar mit
`python3 lotro_datenraum_aufgabenluecken.py`.

Bei den ursprünglich 613 offenen Auftraggeber-IDs wurden 519 dekodierte
Datensätze gefunden: 323 Klasse 796 und 196 Klasse 1723. Die übrigen 94
sind im Inventar Klasse 796 belegt, aber in den geprüften spezialisierten
Rohdateien nicht vorhanden. Die vollständige Klassensemantik wird daraus
nicht geraten. Die 613 IDs sind keine 613 nachgewiesenen kaputten Spielobjekte.

Zusätzlich korrigierte Zielauswahl:

- Relikte liegen in `relics.xml` unter Kategorien; ein nur auf Root-Kinder
  begrenzter Join war falsch. Mit `.//relic` lösen sich alle 469, 250
  beziehungsweise 391 geprüften Referenzvorkommen aus Reliktlisten,
  Reliktgruppen und Containern auf.
- `treasureGroupProfileId` in Trophäenlisten verweist nicht ausschließlich
  auf `itemsTable`. 7.503 zunächst dort nicht gefundene Vorkommen lösen
  sich gegen 103 `treasureList`-IDs auf. Beide Zieltypen bleiben getrennt.
- Händlerlisten, Tauschabgaben/-erhalte, direkte Beutegegenstände,
  Containerlisten, die geprüften Skill-/Trait-/Effekt-/Progressionsverweise
  und die 232 Parchment-Kartenreferenzen sind in den konkret geprüften
  Zielbeständen ohne offene Werte auflösbar.

Die Strukturinventare gelten nur für tatsächlich eingelesene Quellen.
Für den Anspruch **sämtliche Spielentitäten, jede Property und jede fachlich
gültige Relation** fehlen weiterhin:

- Vollständige Dekodierung sämtlicher DAT-Inventarklassen, nicht nur der
  bisher unterstützten/geexportierten Auswahl.
- Vollständiger semantischer Nachweis jeder verschachtelten Property und
  jedes referenzierenden Feldes; Namen allein reichen nicht.
- Vollständige typisierte Referenzprüfung über alle Loot-/Effekt-/Skill-/
  Welt-Ereignis-/Bedingungs-Untertypen und alle ID-Räume.
- Feldweise Vergleichsmatrix DAT ↔ Companion ↔ normalisierte Exporte für
  alle Bestände, einschließlich Default-/Filter-/Rundungs-/Lokalisierungsverluste.
- Unabhängiger aktueller Clientabgleich räumlicher Projektion und
  dynamischer Verfügbarkeit; kein Spieltest wurde in diesem Audit durchgeführt.
- Nachweis der Übersetzungsbedeutung, nicht bloß gleicher Sprachschlüssel.

Diese Punkte werden nicht als erledigt markiert. Das vorliegende Dokument ist
eine überprüfbare Grundlage mit vollständigen beobachteten Strukturpfaden,
aber noch kein abgeschlossenes semantisches Gesamtmodell aller LOTRO-Daten.
