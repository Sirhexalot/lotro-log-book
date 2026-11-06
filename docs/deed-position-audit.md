# Tatenpositionen: erneute Prüfung vom 06.11.2026

## Ausgewertete eigene Daten

- DAT-Export `full-dat-en-de-fr-2026-11-03/deeds.json`, `areas.json` und
  `locations.json`.
- Eigener `placed-2026-11-03/raw.jsonl`-Export: Eigenschaften platzierter Gegner,
  NPCs und Gegenstände.
- Eigener `did-positions-2026-11-03/positions.jsonl`-Export: Standorte.
- Landblock-Gebietszuordnung aus Companions Spielreferenz `landblocks.xml`.
- Ausgelieferter englischer Tatenkatalog: 5.528 Einträge, davon 638 mit
  mindestens einem Zielort und 4.890 ohne Zielort.

Wichtig: Diese 638 Taten enthalten bereits **6.892 Zielpositionszeilen** im
englischen Webkatalog. Die Tatanzahl darf nicht mit der Anzahl der Pins einer
anderen Website verglichen werden. Unter anderem sind die acht Blumen im Alten
Wald sowie die Erkundungsorte des Alten Waldes und der Hügelgräberhöhen enthalten.
Ob die Pins tatsächlich alle auf der erwarteten Karte angezeigt werden, ist eine
separate Frage der Kartenzuordnung und Anzeige.

In der rohen Zielpositionstabelle stehen 8.645 Zeilen für 1.099 Taten. Von den
derzeit ausgelieferten Taten ohne Zielort haben 465 bereits Rohpositionen
(1.267 Zeilen); diese müssen auf Karten-/Schrittzuordnung und Innenräume geprüft
werden. Fehlende Anzeige bedeutet also nicht automatisch fehlende DAT-Position.

Keine Positionen aus dem Wiki, Deed Tracker oder Kroels Website übernommen.

## Befund

Die bisherige Ergänzung im Kataloggenerator folgt direkten Verweisen
(`QuestEvent_MonsterDID`, `LandmarkDID`, `ItemDID`, `NPCTalk`, `Detect`,
`EmoteTargetDID`). Unter den bisher ortslosen Taten gibt es nur zehn mit solchen
Verweisen auf Außenpositionen im vorhandenen Export. Darunter sind PvMP,
Instanzen und technische Inhalte. Das ist keine Liste von zehn unmittelbar
veröffentlichbaren Landschaftstaten.

Eine zusätzliche Quelle ist `QuestEvent_MonsterGenus_Array`. Beispiel
`70005BD2` (Barghest-slayer): `Quest_MonsterRegion=1879049792` und
`Quest_MonsterSpecies=57`. Platzierte Gegner führen dazu passend `Agent_Species`.
Über Region/BlockX/BlockY wird ihr Gebiet aus `landblocks.xml` bestimmt und über
`Area_Territory` auf das verlangte Gebiet bezogen.

**277 bisher ortslose Taten haben mindestens einen solchen Kandidaten**, wenn
nur Regeln mit genau `Quest_MonsterRegion` und `Quest_MonsterSpecies`
berücksichtigt werden. Beispiele (einzigartige auf zwei Stellen gerundete Orte):

- Barghest-slayer und Advanced: je 27 Standorte.
- Brigand-slayer und Advanced: je 422.
- Bree-land Woodsman und Advanced: je 68.
- Neekerbreeker-slayer und Advanced: je 54.
- Orc-slayer und Advanced: je 292.

Diese Zahlen zählen Kandidaten, **keine geprüften Tat-Zielorte**. Andere
Bedingungen des jeweiligen Ereignisses, Inhaltslayer, Erreichbarkeit und
Gegnerausschlüsse müssen vor einer Übernahme geprüft werden. Manche Ereignisse
verknüpfen Gegenstandsbeute mit Gegnerregeln; dort ist ein Gegnerstandort kein
fester Fundort des Gegenstands.

## Nächster sinnvoller Ausbau

1. Vollständige Ereignisse samt Bedingungen auswerten; zunächst ausschließlich
   eindeutige Gegnerbesiegen-Regeln.
2. Außenpositionen plus Gebiet und Weltregion prüfen; Instanzen und technische
   Layer nicht allein anhand `cell=0` als Landschaft interpretieren.
3. Herkunft und Bedeutung separat speichern: **Gegnerstandort**, nicht
   garantierter Fundort, nicht erfundener Mittelpunkt eines Jagdgebiets.
4. Dichte Standorte sinnvoll anzeigen, ohne tausende deckungsgleiche Pins.
5. An Barghest im Breeland und weiteren Gebieten im Spiel gegenprüfen.

Bis dahin bleibt der veröffentlichte Zielkatalog unverändert. In der Webansicht
werden vorhandene Zielkoordinaten unter dem jeweiligen Schritt angezeigt;
Ziele müssen dafür eingeblendet sein. Keine Zuordnung zu einzelnen Bedingungen
vortäuschen, wenn nur die Schrittnummer bekannt ist.

## Vergleich mit Deed Tracker 3.3.0 (06.11.2026)

Vergleich nur lesend mit dem aktuellen ZIP von LOTROInterface, Download-ID 1139;
Version anhand `CubePlugins/DeedTracker.plugin` geprüft. Das öffentliche
GitHub-main ist älter und darf nicht als aktuelles Release gezählt werden.
Keine fremden Positionen in unseren Katalog übernommen.

- `DeedDataEN.lua`: 4.673 Tat-IDs.
- `DeedObjectiveInfoEN.lua`: 3.278 LAT/LONG-Paare bei 600 Tat-IDs.
- Unser englischer Webkatalog: 5.528 Tat-IDs, 6.892 Zielpositionszeilen bei 638 IDs.
- Alle 4.673 Deed-Tracker-Tat-IDs kommen in unserem Katalog vor; wir haben 855
  weitere IDs. Das beweist nicht, dass diese zusätzlichen Einträge alle spielbar
  sind.
- 477 Taten haben bei beiden Projekten Positionen.
- 123 Taten haben bei Deed Tracker Positionen, bei uns keine.
- 161 Taten haben bei uns Positionen, bei Deed Tracker keine.

Beispiele der 123 Lücken: Goblin-town, Bilbo's Buttons, Lore of the Forgotten
Library, Treasures of the Silvertine Lodes, Implements of the Forge. Mehrere
betreffen Innenräume/Instanzen; deren Koordinaten sind nicht ohne Weiteres Pins
auf einer Landschaftskarte.

Positionszeilen sind kein Qualitätsranking: mehrere mögliche Positionen für ein
Ziel, Wiederholungen zwischen verwandten Taten und unterschiedliche Zählweisen
können die Zahlen stark beeinflussen. Der ID-Abgleich zeigt die echten
Abdeckungslücken besser als die bloße Pinsumme.
