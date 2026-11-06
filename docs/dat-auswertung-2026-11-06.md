# Was die Spieldaten außer Positionen hergeben – 6. November 2026

Lesende Auswertung des eigenen DAT-Exports
`Companion-Test/source-exporter/full-dat-en-de-fr-2026-11-03` plus gezielte
Nachladungen aus dem Client (nur gelesen, nichts installiert oder verändert).
Keine Wiki-, Kroel- oder Deed-Tracker-Daten.

## 1. Belohnungen: der größte ungenutzte Block

Jede Aufgabe und jede Tat verweist auf eine Belohnungstabelle
(`Quest_QuestTreasureDID`). 9.594 verschiedene Tabellen werden von 14.252
Aufgaben und allen 5.534 Taten verwendet.

| Feld in der Tabelle | Tabellen | Bedeutung |
|---|---:|---|
| `FixedItemArray` | 6.039 | feste Gegenstände mit Anzahl |
| `SelectableItemArray` | 1.660 | Auswahl aus mehreren Gegenständen |
| `FixedTitleArray` | 2.511 | Titel |
| `SelectableTitleArray` | 13 | Titel zur Auswahl |
| `FixedVirtueArray` | 565 | Tugend + Stufe |
| `Virtue_XP_Tier` | 9.544 | Tugend-Erfahrung, Stufe |
| `FixedTraitArray` | 258 | Trait/Fertigkeit |
| `FixedEmoteArray` / `SelectableEmoteArray` | 15 | Emote |
| `FixedBillingTokenArray` | 122 | Store-/Content-Freischaltung, **keine** Spielerbelohnung |

Verteilung auf die Einträge:

- **Aufgaben:** 9.526 mit festen Gegenständen, 1.800 mit Auswahl, 204 mit Titel,
  115 mit Trait, 7 mit Tugend, 721 mit Tugend-Erfahrung.
- **Taten:** 3.224 mit Gegenständen, 570 mit Tugend, 2.377 mit Titel,
  174 mit Trait.

Beispiel „Free the Tree“ (70000008): fester „Gift Mathom“ plus Auswahl aus drei
Gegenständen der Stufe 9. Beispiel „Barghest-slayer (Advanced)“ (70005BD3):
30× Mark und 1× Entschlossenheit.

### Gegenstände in Belohnungen

- **6.905 verschiedene Gegenstände** werden als Belohnung vergeben.
- 9.502 feste Vergaben, 5.631 Auswahloptionen.
- Aufgelöst: Name in DE/EN/FR, Qualität, Gegenstandsstufe, Bindung,
  Grundwert. Stufen von 1 bis 572, Median 50.
- Qualitäten: 2.840 ungewöhnlich, 2.303 selten, 782 besonders, 744 episch,
  228 gewöhnlich, 8 ohne Angabe.
- 6.180 der Belohnungsgegenstände sind beim Aufnehmen gebunden.

### Titel

- **2.545 verschiedene Titel**, davon 61 mit Platzhaltern
  (`${NAME}`, `${RANK}`, `${SURNAME}`), etwa „Warg-hunter“ oder
  „Honorary Shirriff“. Unser Plugin löst diese Platzhalter bereits auf.

### Tugenden

- 20 der 21 Tugenden kommen in Belohnungstabellen vor; die Namen lassen sich
  über die spiel-eigenen Statistikbezeichnungen sauber zuordnen
  (Entschlossenheit, Tapferkeit, Weisheit …).
- Dazu kommen Testränge („Skirmish Test Rank“), die ausgefiltert werden müssen.

## 2. Weitere auswertbare Bereiche

| Bereich | Datensätze | Inhalt |
|---|---:|---|
| Rezepte | 7.925 | Ergebnis, kritischer Erfolg, Zutaten mit Menge, Chance, Dauer |
| Rezept-Gegenstände | 6.189 | die erlernbaren Rezeptgegenstände |
| Verkäufer | ~1.466 | `Vendor_ItemList` mit allen verkauften Gegenständen |
| Barter | 3.479 | Tauschlisten: geforderte Gegenstände und Mengen |
| Reittier-Routen | 5.322 | Start, Ziel, Reisemodus (plus 2.303 Segmente) |
| Gegenstands-Sets | 2.226 | Mitglieder, Set-Stufe, Set-Boni |
| Beute-Tabellen | 15.305 | Gegenstand, Menge, Drop-Frequenz |
| Gruppen-Beute | 6.425 | `TreasureGroupProfile_ItemTable` |
| NPCs | 16.912 | inkl. Vendor-, Barter- und Rufbezug |
| Kreaturen | 20.835 | inkl. Spezies, Stufe, Beute-Verweisen |

Dazu kommen bereits genutzte Felder: Rufbelohnung (`PosRepToGive`,
`PositiveFaction`), LOTRO-Punkte (`TurbinePointTier`), wiederholbar, daily,
Zeitlimit, Gruppe, Instanz, Aufgabe davor/danach.

## 3. Was ausdrücklich nicht sauber geht

- **Gegenstands-Werte:** `Mod_Array` nennt nur die veränderten Statistiken und
  eine Progression-ID. Die Zahlenwerte stecken in Progressions-Tabellen; ohne
  deren Auswertung wäre jede Anzeige geraten. Qualität, Stufe, Bindung und
  Grundwert sind dagegen direkt lesbar.
- **Gegenstands-Kategorien:** Der frühere Trockenlauf ergab nur 54 % Treffer
  gegenüber Compendium; 68 von 77 Regeln widersprüchlich. Kategorien also nicht
  blind übernehmen.
- **Aufgaben-EP und Geld:** Nur 4.437 von 15.692 Aufgaben verweisen auf eine
  konkrete Belohnungstabelle (`Quest_RewardLevelDID`). Dort stehen exakte Werte
  je Tier (Beispiel: Stufe 7 → 98 EP, 290 Geld). Für die übrigen 8.656 mit Tier
  aber ohne Tabelle müsste die Standardberechnung des Clients nachgebildet
  werden – ohne Nachweis nicht anzeigen.
- **Tugend-Mengen:** Die Zuordnung Tugendname ist belegt, die Bedeutung von
  `QuestTreasure_Virtue_Increment` und `Virtue_XP_Tier` ist noch nicht
  gegengeprüft. Bis dahin nur „Tugend: Entschlossenheit“, keine erfundene Zahl.
- **Beute-Chancen:** `LootGen_TrophyList_DropFrequency` ist ein Code, keine
  Prozentangabe. Ohne Bedeutungsnachweis keine Wahrscheinlichkeiten.
- **Billing-Tokens:** Content-/Store-Freischaltungen (z. B. „Legendary Moria“),
  keine Belohnung im Spielersinn.
- **Testinhalte:** Testränge, „DNT“, Hiding-Content und Testgegenstände müssen
  wie bisher ausgefiltert werden.

## 4. Empfohlene Reihenfolge

1. **Belohnungen an Aufgabe und Tat** (Gegenstände inkl. Auswahl, Titel,
   Tugendname). Direkt sichtbar im Detail, klar vom Zielort getrennt.
2. **Gegenstandsseiten für Belohnungsgegenstände** – welche Aufgabe/Tat gibt
   ihn, welcher Verkäufer führt ihn, welches Rezept stellt ihn her.
3. **Handwerk: Rezepte** mit Zutaten und Ergebnis; passt zur bestehenden
   Handwerksseite.
4. **Tugend-Übersicht:** welche Taten welche Tugend geben (Name belegt).
5. Später: Barter und Reittier-Routen. Loot-Chancen und Gegenstandswerte erst
   nach Bedeutungsnachweis.

Aufwand: Punkt 1 ist eine Erweiterung von Export, Kataloggenerator, Plugin-
Detailtext, Webdetail und Tests. Die Datenmengen bleiben klein (Belohnungs-
gegenstände wenige MB), die drei Sprachen sind vollständig vorhanden.

## 5. Umgesetzt am 6. November 2026

- Reproduzierbarer Export `Companion-Test/source-exporter/export_rewards.py`
  (nutzt denselben Java-Leser, schreibt `rewards-2026-11-06/rewards.json`,
  2,1 MB, mit Quellenstempel).
- Katalog: `rw` an jeder Aufgabe (im Detailblock) und jeder Tat (Kerndatei).
  **10.268 Aufgaben mit 19.381 Belohnungseinträgen**, **4.445 Taten mit 7.298
  Einträgen**. Gleiche IDs, gleiche Reihenfolge und gleiche Mengen in DE/EN/FR;
  `verify_catalog.py` prüft das.
- Anzeige: Plugin-Detailtext und Website zeigen die Belohnungen **vor** dem
  Einblenden der Ziele (die Questanzeige des Spiels zeigt sie ebenfalls). Titel
  werden vom Charakternamen befreit; `${...}` und `[e]`-Marken sind entfernt.
- Webdaten: `build_daten.py` führt die Detailblöcke wieder zusammen. Das war
  nötig, weil die Website seit der Katalogteilung sonst Beschreibungen, Schritte,
  Ziele und Belohnungen verloren hätte.
- Qualitätsfarben auf der Website, Item-Stufe und „Zur Auswahl“ getrennt.
- Mengen der Tugenden bleiben bewusst ungenannt (Bedeutung von
  `Virtue_Increment`/`Virtue_XP_Tier` weiterhin ungeprüft).
- Prüfung: `verify_catalog.py`, `test_plugin.py`, `test_features.py`,
  `test_struktur.py`, Website-Unittests, `test_i18n.js` und die Browserprüfung
  über 21 Seitenvarianten plus Kartenansicht bestanden.

## 6. Belohnungsübersicht und Rezepte (6. November 2026)

- **Neue Seite „Belohnungen“** (`belohnungen.html`, DE/EN/FR) mit drei Ansichten:
  Tugenden (20), Titel (2.509 DE / 2.520 EN / 2.494 FR) und Gegenstände (6.564).
  Jeder Eintrag nennt die Aufgaben und Taten, die ihn geben, und verlinkt sie.
  Suche über Namen und Quellen; lange Listen zeigen die ersten 300 Treffer.
- **Filter auf der Taten-Seite:** „Belohnung: alle / Tugend / Titel / LOTRO-Punkte“.
  Er gilt nur dort, wo er Sinn ergibt (Taten), und steht im Listenkopf.
- **Rezepte im Handwerk:** 7.924 Rezepte mit Ergebnis, Zutaten (optional getrennt)
  und kritischem Erfolg, Beruf und Stufe, Suche und Berufsfilter. Quelle:
  `export_recipes.py` (Klasse 1024), 9.198 beteiligte Gegenstände, 11 Berufe.
  Berufs-, Stufen- und Kategorienamen kommen aus den Spiel-Enums und
  Companion-Labels; Gegenstandsnamen sind in DE/EN/FR aufgelöst.
- **Datenmodell:** Belohnungsgegenstände tragen jetzt ihre DID (`rw`-Eintrag,
  letztes Feld), damit die Übersicht gleiche Gegenstände zusammenfassen kann.
  `build_belohnungen.py` und `build_rezepte.py` schreiben je Sprache eine eigene
  Datei; `baue_website.py` kopiert und stempelt sie mit.
- **Titelbereinigung:** doppelte Trennzeichen („, , “) und ein fehlplatzierter
  Bindestrich vor kleingeschriebenen Wörtern werden entfernt; Wörter bleiben
  unverändert.

## 7. Prüfmittel

- Vollständige Belohnungstabellen gelesen: 9.594 Tabellen, 0 Lesefehler.
- 9.693 referenzierte Gegenstands-, Titel-, Trait- und Emote-Datensätze
  aufgelöst, Namen in DE/EN.
- Stichproben gegengeprüft: „Free the Tree“, „Barghest-slayer (Advanced)“,
  Verkäufer Carlo Blagrove (125 Artikel), Rezept 70001A60 (Zutaten und
  kritischer Erfolg), Reittier-Route Esteldín, Barter-Profil 7000AC44.
