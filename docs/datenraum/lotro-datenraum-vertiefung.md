# Vertiefung: typisierte Referenzen und Auftraggeber

Diese Prüfung erweitert, ersetzt aber nicht den vorherigen Referenzlauf. Feldpfade sind konkret im XML belegt. Die Zielzuordnung ist eine ausdrücklich genannte Prüfregel; Treffer beweisen ID-Auflösbarkeit, nicht jede Laufzeitsemantik. Regeln mit null Referenzen sind ohne Evidenz und nicht als bestätigte Relation zu lesen. Wert 0 wird separat genannt und nicht stillschweigend gelöscht.

## Auftraggeber-Lücken im reinen NPC-Katalog

Von 613 verschiedenen dort nicht gefundenen IDs haben 519 einen dekodierten Datensatz in NPC-/Platzierungsexporten. Alle 613 kommen im DAT-Inventar vor. Ein Inventareintrag belegt Klasse/ID, aber keine erfolgreich gelesenen Properties.

| Befund | Eindeutige IDs |
| --- | --- |
| Dekodiert, Klasse 796 | 323 |
| Dekodiert, Klasse 1723 | 196 |
| Nur Inventar, nicht im geprüften Rohbestand | 94 |

Die numerischen Klassen werden hier bewusst nicht allein anhand ihrer Namen zu NPCs oder Gegenständen erklärt. Die pauschale Aussage „613 ungültige NPCs“ wäre falsch. Eine Geberrolle kann auf einen anderen Quellobjekttyp zeigen.

## Zusätzliche Referenzprüfungen

| Beziehung/Prüfhypothese | Quellpfad | Verweise | Aufgelöst | Nicht aufgelöst | Davon Wert 0 |
| --- | --- | --- | --- | --- | --- |
| Händler → Verkaufsliste | vendors.xml `.//sellList/@sellListId` | 2202 | 2202 | 0 | 0 |
| Verkaufsposition → Gegenstand | vendors.xml `.//sellEntry/@id` | 14271 | 14271 | 0 | 0 |
| Tauscher → Tauschprofil | barters.xml `./barterer/barterProfile/@profileId` | 8891 | 8891 | 0 | 0 |
| Tauschposition give → Gegenstand | barters.xml `.//give/@id` | 58933 | 58933 | 0 | 0 |
| Tauschposition receive → Gegenstand | barters.xml `.//receive/@id` | 42590 | 42590 | 0 | 0 |
| Ruferhalt → Fraktion | barters.xml `.//receiveReputation/@factionId` | 4 | 4 | 0 | 0 |
| Beuteeintrag → Gegenstand | loots.xml `.//itemsTableEntry/@itemId` | 91695 | 91695 | 0 | 0 |
| Beuteeintrag → Gegenstand | loots.xml `.//trophyListEntry/@itemId` | 54853 | 54853 | 0 | 0 |
| Beuteprofil-ID → itemsTable oder treasureList; Zieltypen nicht zusammenführen | loots.xml `.//treasureListEntry/@treasureGroupProfileId` | 1669 | 1669 | 0 | 0 |
| Beuteprofil-ID → itemsTable oder treasureList; Zieltypen nicht zusammenführen | loots.xml `.//trophyListEntry/@treasureGroupProfileId` | 20828 | 20828 | 0 | 0 |
| Gewichtete Tabelle → Trophäenliste | loots.xml `.//weightedTreasureTableEntry/@trophyListId` | 2992 | 2992 | 0 | 0 |
| Gefilterte Tabelle → trophyList | loots.xml `.//filteredTrophyTableEntry/@trophyListId` | 8809 | 8809 | 0 | 0 |
| Gefilterte Tabelle → weightedTreasureTable | loots.xml `.//filteredTrophyTableEntry/@weightedTreasureTableId` | 1023 | 1023 | 0 | 0 |
| Reliktbeute → Relikt | loots.xml `.//relicsListEntry/@relicId` | 469 | 469 | 0 | 0 |
| Reliktbeute → Relikt | loots.xml `.//relicsTreasureGroupEntry/@relicId` | 250 | 250 | 0 | 0 |
| Reliktliste → Reliktgruppe | loots.xml `.//relicsListEntry/@relicsTreasureGroupId` | 54 | 54 | 0 | 0 |
| Container → treasureList | containers.xml `./container/@treasureListId` | 926 | 926 | 0 | 0 |
| Container → trophyList | containers.xml `./container/@trophyListId` | 4626 | 4626 | 0 | 0 |
| Container → weightedTreasureTable | containers.xml `./container/@weightedTreasureTableId` | 52 | 52 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId` | 1213 | 1213 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId2` | 981 | 981 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId3` | 295 | 295 | 0 | 0 |
| Reliktcontainer → Relikt | containers.xml `./relicsContainer/@relicId` | 391 | 391 | 0 | 0 |
| Reliktcontainer → Reliktliste | containers.xml `./relicsContainer/@relicsListId` | 136 | 136 | 0 | 0 |
| Trait-Unterstruktur → [('skills.xml', './*', 'identifier')] | traits.xml `.//skill/@id` | 442 | 442 | 0 | 0 |
| Trait-Unterstruktur → [('effects.xml', './*', 'id')] | traits.xml `.//effect/@id` | 409 | 409 | 0 | 0 |
| Trait-Unterstruktur → [('progressions.xml', './*', 'identifier')] | traits.xml `.//trait/@pointCostProgression` | 946 | 946 | 0 | 0 |
| Trait-Unterstruktur → [('progressions.xml', './*', 'identifier')] | traits.xml `.//trait/@rankOverlayProgression` | 1044 | 1044 | 0 | 0 |
| Skill-Unterstruktur → [('effects.xml', './*', 'id')] | skills.xml `.//effect/@id` | 17429 | 17429 | 0 | 0 |
| Skill-Unterstruktur → [('effects.xml', './*', 'id')] | skills.xml `.//requiredEffect/@id` | 1555 | 1555 | 0 | 0 |
| Skill-Unterstruktur → [('traits.xml', './trait', 'identifier')] | skills.xml `.//requiredTrait/@id` | 821 | 821 | 0 | 0 |
| Skill-Unterstruktur → [('skills.xml', './*', 'identifier')] | skills.xml `.//combo/@skillID` | 1187 | 1187 | 0 | 0 |
| Skill-Unterstruktur → [('inductions.xml', './induction', 'id')] | skills.xml `.//details/@inductionId` | 3631 | 3631 | 0 | 0 |
| Skill-Unterstruktur → [('progressions.xml', './*', 'identifier')] | skills.xml `.//attack/@maxDamageProgression` | 6574 | 6574 | 0 | 0 |
| Skill-Unterstruktur → [('progressions.xml', './*', 'identifier')] | skills.xml `.//attack/@dpsModProgression` | 47 | 47 | 0 | 0 |
| Kosten → Progression | skills.xml `.//powerCost/@pointsProgression` | 4250 | 4250 | 0 | 0 |
| Kosten → Progression | skills.xml `.//powerCostPerSecond/@pointsProgression` | 29 | 29 | 0 | 0 |
| Kosten → Progression | skills.xml `.//moraleCost/@pointsProgression` | 2 | 2 | 0 | 0 |
| Kosten → Progression | skills.xml `.//moraleCostPerSecond/@pointsProgression` | 2 | 2 | 0 | 0 |
| Karte → Geometrie gleicher Karten-ID | parchmentMaps.xml `./parchmentMap/@id` | 232 | 232 | 0 | 0 |
| Link-Quell-ID → Karten- oder Gebiets-ID; gemischter ID-Raum, keine pauschale Kartenhierarchie | maps/links.xml `./link/@parentId` | 2557 | 2557 | 0 | 0 |
| Link-Ziel-ID → Karte (Zielhypothese) | maps/links.xml `./link/@target` | 2557 | 2555 | 2 | 0 |
| Instanzkarteneintrag → Karte | privateEncounters.xml `.//map/@mapId` | 1886 | 1886 | 0 | 0 |
| Instanzvorlage → Aufgabe/Tat-ID-Raum | privateEncounters.xml `.//privateEncounter/@questId` | 834 | 833 | 1 | 0 |
| Instanzvorlage → Aufgabe/Tat-ID-Raum | privateEncounters.xml `.//skirmishPrivateEncounter/@questId` | 439 | 438 | 1 | 0 |
| Instanzvorlage → Aufgabe/Tat-ID-Raum | privateEncounters.xml `.//questToBestow/@questId` | 627 | 627 | 0 | 0 |
| Instanzvorlage → Aufgabe/Tat-ID-Raum | privateEncounters.xml `.//randomQuest/@questId` | 73 | 73 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//skillUsed/@skillId` | 78 | 78 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//monsterDied/@mobId` | 3408 | 3408 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//npcTalk/@npcId` | 20575 | 19353 | 1222 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//questComplete/@achievableId` | 3806 | 3806 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//questBestowed/@achievableId` | 143 | 143 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//inventoryItem/@itemId` | 7634 | 7634 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | quests.xml `.//itemUsed/@itemId` | 6727 | 6727 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//skillUsed/@skillId` | 314 | 314 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//monsterDied/@mobId` | 350 | 350 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//npcTalk/@npcId` | 83 | 52 | 31 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//questComplete/@achievableId` | 6233 | 6220 | 13 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//questBestowed/@achievableId` | 19 | 19 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//inventoryItem/@itemId` | 1117 | 1117 | 0 | 0 |
| Aufgaben-/Tatbedingung → typisiertes Ziel | deeds.xml `.//itemUsed/@itemId` | 423 | 423 | 0 | 0 |

## Reproduktion und Belege

`python3 lotro_datenraum_vertiefung.py`. Sämtliche offenen Werte, Auftraggeber-IDs, Klassen und SHA-256 der Eingaben: `lotro-datenraum-vertiefung.json`. Keine Spiel-/Plugin-/Webdatei verändert.
