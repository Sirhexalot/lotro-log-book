# Semantisches Datenmodell – belegte Auswertungsregeln

Stand 17.11.2026. Ergänzung zu [Datenraum und Feldinventar](lotro-datenraum.md).

## Beweisstufe und Geltungsbereich

Die folgenden Aussagen beschreiben **tatsächlich implementierte Auswertungen im
gelesenen Companion-Extractor-Quellstand**, kombiniert mit den vorhandenen
XML-/JSON-Werten. Sie sind kein Nachweis einer identischen Implementierung im
Spielserver und keine allgemeine Verfügbarkeitszusage.

Quellwurzel:
`~/Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation/src/main/java/delta/games/lotro/tools/extraction/`.
Dateinamen und Zeilenangaben unten sind relativ dazu.
Hashes der gezielt geprüften Quellen und quantitative Gegenprüfungen:
`lotro-datenraum-semantik-pruefung.json`. Reproduktion:
`python3 lotro_datenraum_semantik_pruefen.py`.

**Wichtig:** Struktur vollständig erfasst ≠ Bedeutung vollständig geklärt.
Ein Getter-/Setter-Fund allein bestätigt weder Einheit noch Default.
Nicht erläuterte Properties im Inventar behalten den Status „Bedeutung nicht
abschließend geprüft“. Sie sind keine stillschweigend freigegebenen Fakten.

## 1. Aufgabe/Tat: Voraussetzungen als Ausdrucksbaum

Beleg: `achievables/QuestRequirementsLoader.java:84–138,224–296`,
`utils/OperatorUtils.java:16–24`.

### Boolesche Struktur

- `Usage_QuestRequirements_OrList`: Bedingungen werden zu **ODER** verbunden.
- `Usage_QuestRequirements`: Bedingungen werden zu **UND** verbunden.
- Sind beide vorhanden, ist das Ergebnis **UND(AND-Gruppe, OR-Gruppe)**.
  Nicht `ODER(AND-Gruppe, OR-Gruppe)` und nicht einfach eine gemeinsame Liste.
- Gruppen mit einem Kind werden auf dieses Kind reduziert; leere Gruppen
  werden im Extractor zu `null`. Das ist Bereinigung der Ausgabe.
- `deepRequirementCleanup` kann nicht auflösbare Achievable-Proxies entfernen.
  Eine danach fehlende Voraussetzung ist deshalb kein Beweis, dass im
  Rohdatensatz keine vorhanden war.

### Einzelbedingung

| Property | Bedeutung in diesem Loader | Typ/Bezug | Grenze |
| --- | --- | --- | --- |
| `Usage_QuestID` | geprüfte Aufgabe/Tat | Integer → Achievable-ID | gemeinsamer ID-Raum, nicht nur Quest-Katalog |
| `Usage_QuestStatus` | geforderter Zustands-Code | Integer | nicht automatisch „erledigt“ |
| `Usage_Operator` | Vergleich zwischen Zustand und Anforderung | Integer-Code | unbekannte Codes werden verworfen, nicht geraten |

Operatoren: 1 = ≥, 2 = ≠, 3 = =, 4 = <, 5 = ≤, 6 = >.
Andere Codes liefern im gelesenen Helper `null`.

Statusbehandlung:

| Code | Behandlung im Loader |
| --- | --- |
| `0x10000000` | UNDERWAY |
| `0x20000000` | FAILED |
| `0x30000000` | COMPLETED |
| `0x40000000`, `0x50000000` | Kommentare nennen ABANDONED/TAPPED, aber keine eigenständige vollständige Behandlung |
| weitere Codes mit gesetztem `0x10000000`-Bit | laufendes Ziel; Index aus `status & 0x0FFFFFFF` |

Die Reihenfolge dieser Prüfungen ist maßgeblich. Insbesondere die kommentierte
TAPPED-Bezeichnung ist **keine vollständig unterstützte Statussemantik**.
Die Fallback-Bitprüfung folgt nach den exakten drei ersten Vergleichen.

### Spezielles Verbergen

`HIDING_CONTENT_QUEST_ID=1879049597` (`7000057D`). Der Loader erkennt eine
Voraussetzung mit diesem ID-Ziel und Status COMPLETED als Verbergungsmarker,
setzt `achievable.hidden=true` und nimmt die Voraussetzung nicht in die
normale ausgegebene Liste auf. Das ist konkretes Extractor-Verhalten, keine
pauschale Regel „hidden bedeutet unspielbar“.

## 2. Gegenstand: Werte, Voraussetzungen und Bindung

Beleg: `items/MainDatItemsLoader.java:198–297,878–892`.

| Property | Ausgewertete Bedeutung | Einheit/Ziel | Fehlend/Transformation |
| --- | --- | --- | --- |
| `Icon_Layer_ImageDID` | Vordergrund des Icons | Bild-DID | zusammengesetztes Icon, keine Item-ID |
| `Icon_Layer_BackgroundDID` | Hintergrund | Bild-DID | getrennte Ebene |
| `Icon_Layer_ShadowDID` | Schatten | Bild-DID | getrennte Ebene |
| `Icon_Layer_UnderlayDID` | Unterlage | Bild-DID | getrennte Ebene |
| `Inventory_Unique` | Unique-Flag | Integer, Vergleich exakt mit 1 | fehlend wird im Loader false |
| `Inventory_MaxQuantity` | maximale Stapelgröße | Stückzahl | nur Werte >1 werden explizit gesetzt |
| `Item_Level` | Gegenstandsstufe | Stufenzahl | nicht Mindest-Charakterstufe |
| `Usage_MinLevel` | untere Nutzungsstufe | Charakterstufe | nullable |
| `Usage_MaxLevel` | obere Nutzungsstufe | Charakterstufe | nullable |
| `Item_MaxStructurePoints` | maximale Haltbarkeit | Strukturpunkte | kein Sturdiness-Enum |
| `Item_DurabilityEnum` | Robustheits-/Sturdiness-Kategorie | Enum | keine Haltbarkeitszahl |
| `Item_Quality` | Qualitätscode | Enum via `DatEnumsUtils.getQuality` | nicht Compendium-`q` ungeprüft gleichsetzen |
| `Description` | Beschreibung | lokalisierter String | Markup wird entfernt |
| `ItemMunging_MinMungeLevel` | Skalierungsgrenze im Munging-Kontext | Stufe | kann die ausgegebene Itemstufe verändern |

### Bindung ist eine Auswertung mehrerer Flags

Die tatsächliche Priorität im Companion-Loader lautet:

1. `Inventory_BindOnAcquire == 1`:
   - zusätzlich `Inventory_BindToAccount == 1` → Accountbindung beim Aufnehmen;
   - sonst Bindung beim Aufnehmen.
2. Sonst `Inventory_BindOnEquip == 1` → Bindung beim Ausrüsten.
3. Sonst `null`.

`null` ist die Extractor-Ausgabe ohne eine dieser erkannten Regeln, nicht der
Nachweis sämtlicher denkbarer Bindungsmechanismen.

**Quantitativ bestätigter Verlust im kompakten Itemexport:**

| Companion-Bindung | Kompaktes `b` | Items |
| --- | --- | ---: |
| Bind on Acquire | 1 | 32.847 |
| Bound to Account on Acquire | 1 | 38.514 |
| Bind on Equip | 2 | 46.610 |
| Attribut fehlt | 0 | 34.117 |

Die Summe ist 152.088 exportierte Items. Accountbindung und Charakterbindung
werden bei `b=1` tatsächlich zusammengeführt. Ein Renderer kann diesen
Unterschied aus `b` allein nicht rekonstruieren.

### Skalierung

Bei vorhandenem `Item_Level` und niedrigerer Itemstufe als
`ItemMunging_MinMungeLevel` kann der Loader für nichtlegendäre Items
`munging.getItemLevel(minScaledLevel)` setzen. Die ausgegebene Stufe kann
somit berechnet sein. Ein direkter Vergleich gegen nur `Item_Level` wäre
für alle Itemtypen kein vollständiger Semantiktest.

## 3. Gegenstand: gewährte Inhalte und Ruf

Beleg: `items/ItemDetailsLoader.java:86–231,234–300`.

| Property/Struktur | Belegte Auswertung | Relation/Bedingen |
| --- | --- | --- |
| `Item_GrantedSkill` | gewährte Fertigkeit | Skill-ID; Ausgabe nur bei auflösbarem Skill |
| `Mount_SkillToGrantShort` | gewährte Reitfertigkeit für kleine Figur | Skill-ID, eigener GrantType |
| `Mount_SkillToGrantTall` | gewährte Reitfertigkeit für große Figur | Skill-ID, eigener GrantType |
| `Mount_SkillToGrantRaceArray` | mehrere rassenabhängige Freigaben | nicht skalar zusammenfassen |
| `Mount_SkillToGrant` | Skill des Arrayeintrags | Skill-ID |
| `Usage_RequiredRaceEntry` | Rasse des Eintrags | Rassen-Code, nicht Rassen-DAT-ID |
| `Item_GrantedTrait` | gewährter Trait | Trait-ID |
| `RewardTrack_XPToAdd` | XP-Menge | in diesem Handler nur bei ExperienceType=1 als ItemXP |
| `RewardTrack_ExperienceType` | Art der XP | kein Betrag |
| `Reputation_IsReputationItem` | Rufitem-Kennzeichnung | Verarbeitung nur bei exakt 1 |
| `Reputation_Faction` | Fraktion des Rufitems | nicht 0 und im Registry auflösbar |
| `Reputation_ReputationGain` | Rufmenge, bevorzugt verwendet | Long → Integer-Ausgabe |
| `Reputation_ReputationLoss` | alternativ verwendete Rufmenge | Code übernimmt Wert, negiert nicht selbst |
| `EffectGenerator_UsageEffectList` | Nutzungseffekte | Liste von Effektstrukturen |
| `EffectGenerator_EffectID` | referenzierter Effekt | gleiche Effekt-ID im Handler nur einmal verarbeitet |
| `EffectGenerator_EffectDataList` | zusätzliche Effekt-Daten | Propertytypen entscheidend |

Bei Rufmenge fehlt Gain, fehlt aber Loss nicht, verwendet der Handler Loss.
Fehlen beide, initialisiert er 0. Das ist kein Nachweis eines originalen
expliziten Nullwerts. Auch die Vorzeichenkonvention von Loss folgt nicht
allein aus dem Feldnamen.

Der Quellcode enthält bei einigen Effekt-Datentypen ausdrücklich nur
Kommentare wie „Skill Data ID?“ oder „Array of recipe IDs?“. Diese werden
**nicht** als validierte Relationen übernommen.

## 4. Rezept: Version, Resultat, Zutaten und Skalierung

Beleg: `crafting/MainDatRecipesLoader.java:64–159,162–227,230–341`.

| Property | Bedeutung im Loader | Einheit/Ziel | Transformation |
| --- | --- | --- | --- |
| `CraftRecipe_UICategory` | UI-Kategorie | CraftingUICategory-Enum | nicht Berufs-ID |
| `CraftRecipe_XPReward` | Schlüssel in XP-Mapping | Lookup-Schlüssel | kein direkt auszugebender XP-Betrag |
| `CraftRecipe_CooldownDuration` | Schlüssel im Cooldown-Mapping | Dauer-Typ-Code | kein direkter Sekundenwert |
| `CraftRecipe_OneTimeRecipe` | Einmalrezept | Integer=1 | andere/fehlende Werte setzen Flag nicht |
| `CraftRecipe_Profession` | Beruf | Berufs-ID | `getProfessionById` |
| `CraftRecipe_Tier` | Handwerksstufe | Code/Zahl | sonst erster Wert aus TierArray |
| `CraftRecipe_TierArray` | alternative Stufenquelle | Array | Loader verwendet Index 0 |
| `CraftRecipe_RequiredCraftGuild` | benötigte Gilde | fachlich Fraktions-ID laut Quellkommentar | ausgegeben wird hier nur guildRequired=true bei ≠0 |
| `CraftRecipe_ResultItem` | normales Ergebnis | Item-ID | eigenes Ergebnisobjekt |
| `CraftRecipe_ResultItemQuantity` | normale Ergebnismenge | Stück | nur bei vorhandenem Feld gesetzt |
| `CraftRecipe_CriticalResultItem` | kritisches Ergebnis | Item-ID >0 | eigenes Ergebnisobjekt |
| `CraftRecipe_CriticalResultItemQuantity` | kritische Menge | Stück | getrennt von normaler Menge |
| `CraftRecipe_CriticalSuccessChance` | Basischance | Bruchteil im DAT/Pythonexport | Java-Ausgabe `int(value*100)` |
| `CraftRecipe_IngredientList` | normale Zutaten | Liste | eigene Positionen |
| `CraftRecipe_OptionalIngredientList` | optionale Zutaten | Liste | optional=true |
| `CraftRecipe_Ingredient` | Zutat-ID | Item-ID | nicht Rezept-ID |
| `CraftRecipe_IngredientQuantity` | Zutatenmenge | Stück | nicht automatisch ein universeller DAT-Default |
| `CraftRecipe_IngredientCritBonus` | Bonus einer optionalen Zutat | Bruchteil | Java-Ausgabe `int(value*100)` |
| `CraftRecipe_IngredientPack` | alternatives Zutatenpaket | Item-ID | eigenes IngredientPack |
| `CraftRecipe_IngredientPackQuantity` | Paketmenge | Stück | hier ausdrücklich Default 1 |
| `CraftRecipe_MultiOutputArray` | zusätzliche Rezeptversionen | Array | normale Version wird geklont und überschrieben |

### Kritische Chance

4.557 konkrete Vergleiche zwischen kompaktem `ch` und dem ersten
Companion-`recipeResult/@baseCriticalChance`: alle stimmen unter
`int(ch*100)` überein. Beispiel: 0,05 im kompakten Export entspricht
5 in der Companion-XML. Das ist keine Garantie für jede andere
Chance-/Gewichts-Property des Spiels.

### Mehrfachausgaben sind keine einzelne Ergebnisliste

`handleRecipeOutput` klont die erste Version und kann normales Ergebnis,
kritisches Ergebnis und erste Zutat ersetzen.
**2.480 Companion-Rezepte besitzen mehr als ein `recipeResult`.**
Ein kompaktes Schema mit nur einem `r`, `cr`, `i`, `o` je Rezept kann
diese Varianten nicht allgemein verlustfrei darstellen.

### Gleiches Item und gleiche Menge heißt nicht gleiches Ergebnis

Falls normale und kritische Ausgabe dieselbe Item-ID und Menge haben,
prüft Companion zusätzlich `Item_iLevel_Crafting_Offset`:
normale Itemstufe = `Item_Level`,
kritische Itemstufe = `Item_Level + Offset`.
Item-ID und Menge allein reichen semantisch nicht für Ergebnisgleichheit.
Die Zahl tatsächlich solcher Resultate wird gesondert aus den XML-Werten
geprüft, nicht aus dem Code geraten.

## 5. Cooldown

Beleg: `common/CooldownLoader.java:14–37`.

`CooldownControl_DurationMapList` enthält Einträge aus
`CooldownControl_DurationType` → `CooldownControl_DurationValue`.
Der Loader dokumentiert die Wert-Einheit als **Sekunden**.
Eine Recipe-Cooldown-ID muss erst gegen diese Tabelle aufgelöst werden.
Der Rezeptloader überträgt den Floatwert per `intValue()`, wodurch
Nachkommastellen verloren gehen können.

## 6. Beute: Typunion, Gewicht und Wahrscheinlichkeit

Beleg: `loot/LootLoader.java:86–108,130–160,183–253,282–293`,
`loot/LootProbabilities.java:31–113`.

| Struktur/Property | Belegte Bedeutung |
| --- | --- |
| `LootGen_WeightedTreasureTable` | Liste gewichteter Trophäenlisten |
| `LootGen_WeightedTreasureTable_TrophyList_Weight` | Integer-Gewicht des Eintrags, kein direktes Prozent |
| `LootGen_WeightedTreasureTable_TrophyList` | Referenz auf Trophäenliste |
| `LootGen_FilteredTreasureListArray` | gefilterte Einträge |
| `LootGen_FilteredTrophyTable_EntryDID` | Ziel wird als TrophyList, sonst WeightedTreasureTable geladen |
| `EntityFilter_Array` | Filter der betreffenden Beuteauswahl |
| `LootGen_TrophyList_ItemOrProfile` | Item oder Gruppenprofil |
| `LootGen_TrophyList_ItemQuantity` | Menge des direkten Items; hier Default 1 |
| `LootGen_TrophyList_GroupDrop` | Gruppenbeute-Flag, exakt Integer=1 |
| `LootGen_TrophyList_DropFrequency` | Häufigkeits-Code, wird auf Wahrscheinlichkeit abgebildet |

Für Gruppenprofile versucht `loadTreasureGroupProfile` zuerst ItemsTable,
dann TreasureList. Damit ist die zuvor beobachtete Zielunion auch im
Loader-Code belegt.

### Häufigkeits-Code → Wahrscheinlichkeit

**Korrektur eines zu pauschalen früheren offenen Punkts:** Companion hat
einen Decoderpfad für die Häufigkeitscodes:

`LootGenControl` →
`LootGenControl_DropFrequencyTable` →
`LootGenControl_DropFrequency_Label` und
`LootGenControl_DropFrequency_Percentage`.

Live-Modus liest diese Zuordnung aus den Daten; die Debugdarstellung
multipliziert den Wert mit 100. Der Code selbst ist weiterhin kein Prozent.
Die konkrete aktuelle Control-Tabelle wurde in diesem Audit noch nicht
gegen einen frischen Rohdatensatz geprüft, daher werden hier keine aktuellen
Drop-Prozente behauptet.

Für einen anderen Modus enthält der Code feste historische SoA-Werte.
Diese dürfen **nicht** als allgemeine aktuelle LOTRO-Dropraten übernommen
werden. Außerdem gibt `getProbability` für unbekannte Codes nach Warnung
0,0 zurück: Ein exportierter Nullwert kann Decoderfallback statt bewiesener
Unmöglichkeit sein.

Eine Einzelwahrscheinlichkeit einer Tabellenebene ist nicht automatisch
die gesamte Item-Dropchance eines Gegners; Verschachtelung, Filter,
Mengen und Auswahlverfahren sind zusätzlich erforderlich.

## 7. Händler und Tauscher

Beleg: `trade/MainDatTradeLoader.java:107–217,219–350,353–404`.

### Rollen und Voraussetzungen

- `Barter_ProfileArray` enthält Tauschprofil-IDs.
- `Barter_Profile_UseTabs` wird gelesen, aber hier nicht weiter verwendet.
  Daraus keine fachliche Regel ableiten.
- Profilanforderungen können unter `DefaultPermissionBlobStruct` liegen.
- `Usage_RequiredClassList` enthält Klassen-Codes, nicht Klassen-DAT-IDs.
- `Usage_RequiredFaction` enthält `Usage_RequiredFaction_DataID` plus
  `Usage_RequiredFaction_Tier`. Das sind Fraktion und Rufstufe, keine
  Rufpunktmenge.
- Der vereinfachte Handels-Questloader unterstützt hier nur COMPLETED
  mit Operator 3 oder fehlendem Operator. Bei mehreren Bedingungen
  überschreibt er `ret`; die Ausgabe bildet nicht alle Bedingungen ab.
  Diese Einschränkung darf nicht auf den allgemeinen Aufgabenloader
  übertragen werden.

### Tauschpositionen

`Barter_ItemListArray` enthält Einträge, deren letztes Element als
**Erhalt** und deren vorherige Elemente als **Abgabe** ausgewertet werden.
Die Reihenfolge ist semantisch relevant.

| Property | Auswertung |
| --- | --- |
| `Barter_Item` | Item-ID |
| `Barter_ItemQuantity` | direkte Menge |
| `Barter_ItemQuantity_LookupTable` | Progressions-ID für berechnete Menge |
| `Barter_ItemUsesMinUsageLevelForCost` | bestimmt Verwendung der Mindest- statt Itemstufe |
| `Barter_ReputationFaction` | Rufziel-Fraktion bei Ruf-Erhalt |
| `Barter_ReputationRewardTier` | Ruf-Belohnungstier, kein direkter Betrag |

Bei fehlender direkter Menge kann der Loader eine Progression bei der
Stufe des erhaltenen Items auswerten. Er übernimmt den Wert per `intValue()`.
Eine Tauschmenge kann also berechnet sein.

`getAmountForTier` kennt im gelesenen Code nur Tier 5 → 1200; alle anderen
liefern 0. Das ist **keine vollständig validierte allgemeine Ruf-Tierformel**.
Ein solcher Nullwert ist kein Nachweis einer absichtlich ruflosen Belohnung.

### Verkauf

- `Vendor_InventoryList` referenziert Verkaufslisten.
- `Vendor_BuysItems == 1` wird zum Ankauf-Flag; fehlend wird false.
- `Vendor_DiscountList` enthält separate Rabatt-Referenzen.
- Gegenstandsgrundwert, Preisfaktor, Rabatt und tatsächlich zu zahlender
  Preis sind unterschiedliche Größen. Ein Item-Verkaufsverweis liefert
  allein keinen endgültigen Kaufpreis.

## 8. Karten, Geografie und Rollen

Die vollständigen ID- und Geometrieunterschiede stehen im Hauptdokument.
Hier gelten folgende bereits quellengestützt belegte semantische Grenzen:

- Originaler Kartenrahmen und nachträglich gefitteter Übersichtsrahmen
  sind verschiedene Herkunftsklassen.
- Link-`parentId` kann Karte oder geografisches Gebiet sein.
- Kartenbild-ID ist keine Kartenidentität.
- NPC-/Monster-/IItem-Identität ist nicht dasselbe wie Auftraggeberrolle.
- MonsterTemplate allein belegt kein feindliches Verhalten.
- Region, Layer und Instanz gehören zum Positionskontext; gleiches
  Koordinatenpaar beweist keinen gleichen Weltort.
- Ein Marker einer möglichen Rohstoffplatzierung beweist kein aktuell
  vorhandenes Objekt.

## 9. Semantischer Restumfang – nicht als erledigt ausgeben

Noch nicht vollständig entschlüsselt oder unabhängig gegengeprüft:

- Sämtliche Effekt-Untertypen mit Operatoren, Modifikatoren, Triggern,
  Zielauswahl und Skalierung.
- Vollständige Skill-Kosten-/Schaden-/Heilungsberechnung einschließlich
  Kontext, aktiver Effekte, Caps und Charakterzustand.
- Alle Quest-/Tat-Zielereignisse, Fehlerbedingungen, Rollen- und
  Permissionstrukturen einschließlich unbekannter Operatoren.
- Aktuelle LootGenControl-Tabelle und Gesamtwahrscheinlichkeiten über
  verschachtelte Filter-/Auswahltabellen.
- Alle Grenzen des Munging-/Legendär-/Tracery-/Set-Stat-Systems.
- Vollständige aktuelle Preis-, Ruf-, Zugangs- und Welt-Ereignislogik.
- Clientverifikation aller Raum-/Layer-/Projektionsannahmen.
- Nicht exportierte oder im Quellbaum nicht implementierte DAT-Klassen.

Der automatische Codeindex ist ein Suchwerkzeug für diesen Restumfang,
nicht dessen semantische Abnahme. Eine echte Vollständigkeitsfreigabe ist
erst vertretbar, wenn jede einzelne Property und Relation entweder einen
passenden Beleg oder einen ausdrücklich dokumentierten ungeklärten Status
hat und alle behaupteten Auswertungen gegen reale Daten geprüft wurden.
