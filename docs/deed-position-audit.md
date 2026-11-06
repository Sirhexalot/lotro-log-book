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
