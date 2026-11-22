# Deep dive: typed references and quest givers

This check extends but does not replace the earlier reference run. Field paths are concretely evidenced in the XML. The target assignment is an explicitly named check rule; hits prove ID resolvability, not every runtime semantic. Rules with zero references have no evidence and must not be read as a confirmed relation. The value 0 is reported separately and not silently dropped.

## Quest giver gaps in the plain NPC catalogue

Of 613 distinct IDs not found there, 519 have a decoded record in the NPC/placement exports. All 613 occur in the DAT inventory. An inventory entry proves class/ID, but no successfully read properties.

| Finding | Distinct IDs |
| --- | --- |
| Decoded, class 796 | 323 |
| Decoded, class 1723 | 196 |
| Inventory only, not in the checked raw set | 94 |

The numeric classes are deliberately not explained here from their names alone as NPCs or items. The blanket statement "613 invalid NPCs" would be wrong. A giver role can point to a different source object type.

## Additional reference checks

| Relation/check hypothesis | Source path | References | Resolved | Unresolved | Of which value 0 |
| --- | --- | --- | --- | --- | --- |
| Vendor → sell list | vendors.xml `.//sellList/@sellListId` | 2202 | 2202 | 0 | 0 |
| Sell entry → item | vendors.xml `.//sellEntry/@id` | 14271 | 14271 | 0 | 0 |
| Barter vendor → barter profile | barters.xml `./barterer/barterProfile/@profileId` | 8891 | 8891 | 0 | 0 |
| Barter entry give → item | barters.xml `.//give/@id` | 58933 | 58933 | 0 | 0 |
| Barter entry receive → item | barters.xml `.//receive/@id` | 42590 | 42590 | 0 | 0 |
| Reputation gain → faction | barters.xml `.//receiveReputation/@factionId` | 4 | 4 | 0 | 0 |
| Loot entry → item | loots.xml `.//itemsTableEntry/@itemId` | 91695 | 91695 | 0 | 0 |
| Loot entry → item | loots.xml `.//trophyListEntry/@itemId` | 54853 | 54853 | 0 | 0 |
| Loot profile ID → itemsTable or treasureList; target types kept separate | loots.xml `.//treasureListEntry/@treasureGroupProfileId` | 1669 | 1669 | 0 | 0 |
| Loot profile ID → itemsTable or treasureList; target types kept separate | loots.xml `.//trophyListEntry/@treasureGroupProfileId` | 20828 | 20828 | 0 | 0 |
| Weighted table → trophy list | loots.xml `.//weightedTreasureTableEntry/@trophyListId` | 2992 | 2992 | 0 | 0 |
| Filtered table → trophyList | loots.xml `.//filteredTrophyTableEntry/@trophyListId` | 8809 | 8809 | 0 | 0 |
| Filtered table → weightedTreasureTable | loots.xml `.//filteredTrophyTableEntry/@weightedTreasureTableId` | 1023 | 1023 | 0 | 0 |
| Relic loot → relic | loots.xml `.//relicsListEntry/@relicId` | 469 | 469 | 0 | 0 |
| Relic loot → relic | loots.xml `.//relicsTreasureGroupEntry/@relicId` | 250 | 250 | 0 | 0 |
| Relic list → relic group | loots.xml `.//relicsListEntry/@relicsTreasureGroupId` | 54 | 54 | 0 | 0 |
| Container → treasureList | containers.xml `./container/@treasureListId` | 926 | 926 | 0 | 0 |
| Container → trophyList | containers.xml `./container/@trophyListId` | 4626 | 4626 | 0 | 0 |
| Container → weightedTreasureTable | containers.xml `./container/@weightedTreasureTableId` | 52 | 52 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId` | 1213 | 1213 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId2` | 981 | 981 | 0 | 0 |
| Container → filteredTrophyTable | containers.xml `./container/@filteredTrophyTableId3` | 295 | 295 | 0 | 0 |
| Relic container → relic | containers.xml `./relicsContainer/@relicId` | 391 | 391 | 0 | 0 |
| Relic container → relic list | containers.xml `./relicsContainer/@relicsListId` | 136 | 136 | 0 | 0 |
| Trait substructure → [('skills.xml', './*', 'identifier')] | traits.xml `.//skill/@id` | 442 | 442 | 0 | 0 |
| Trait substructure → [('effects.xml', './*', 'id')] | traits.xml `.//effect/@id` | 409 | 409 | 0 | 0 |
| Trait substructure → [('progressions.xml', './*', 'identifier')] | traits.xml `.//trait/@pointCostProgression` | 946 | 946 | 0 | 0 |
| Trait substructure → [('progressions.xml', './*', 'identifier')] | traits.xml `.//trait/@rankOverlayProgression` | 1044 | 1044 | 0 | 0 |
| Skill substructure → [('effects.xml', './*', 'id')] | skills.xml `.//effect/@id` | 17429 | 17429 | 0 | 0 |
| Skill substructure → [('effects.xml', './*', 'id')] | skills.xml `.//requiredEffect/@id` | 1555 | 1555 | 0 | 0 |
| Skill substructure → [('traits.xml', './trait', 'identifier')] | skills.xml `.//requiredTrait/@id` | 821 | 821 | 0 | 0 |
| Skill substructure → [('skills.xml', './*', 'identifier')] | skills.xml `.//combo/@skillID` | 1187 | 1187 | 0 | 0 |
| Skill substructure → [('inductions.xml', './induction', 'id')] | skills.xml `.//details/@inductionId` | 3631 | 3631 | 0 | 0 |
| Skill substructure → [('progressions.xml', './*', 'identifier')] | skills.xml `.//attack/@maxDamageProgression` | 6574 | 6574 | 0 | 0 |
| Skill substructure → [('progressions.xml', './*', 'identifier')] | skills.xml `.//attack/@dpsModProgression` | 47 | 47 | 0 | 0 |
| Cost → progression | skills.xml `.//powerCost/@pointsProgression` | 4250 | 4250 | 0 | 0 |
| Cost → progression | skills.xml `.//powerCostPerSecond/@pointsProgression` | 29 | 29 | 0 | 0 |
| Cost → progression | skills.xml `.//moraleCost/@pointsProgression` | 2 | 2 | 0 | 0 |
| Cost → progression | skills.xml `.//moraleCostPerSecond/@pointsProgression` | 2 | 2 | 0 | 0 |
| Map → geometry of the same map ID | parchmentMaps.xml `./parchmentMap/@id` | 232 | 232 | 0 | 0 |
| Link source ID → map or area ID; mixed ID space, no general map hierarchy | maps/links.xml `./link/@parentId` | 2557 | 2557 | 0 | 0 |
| Link target ID → map (target hypothesis) | maps/links.xml `./link/@target` | 2557 | 2555 | 2 | 0 |
| Instance map entry → map | privateEncounters.xml `.//map/@mapId` | 1886 | 1886 | 0 | 0 |
| Instance template → quest/deed ID space | privateEncounters.xml `.//privateEncounter/@questId` | 834 | 833 | 1 | 0 |
| Instance template → quest/deed ID space | privateEncounters.xml `.//skirmishPrivateEncounter/@questId` | 439 | 438 | 1 | 0 |
| Instance template → quest/deed ID space | privateEncounters.xml `.//questToBestow/@questId` | 627 | 627 | 0 | 0 |
| Instance template → quest/deed ID space | privateEncounters.xml `.//randomQuest/@questId` | 73 | 73 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//skillUsed/@skillId` | 78 | 78 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//monsterDied/@mobId` | 3408 | 3408 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//npcTalk/@npcId` | 20575 | 19353 | 1222 | 0 |
| Quest/deed condition → typed target | quests.xml `.//questComplete/@achievableId` | 3806 | 3806 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//questBestowed/@achievableId` | 143 | 143 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//inventoryItem/@itemId` | 7634 | 7634 | 0 | 0 |
| Quest/deed condition → typed target | quests.xml `.//itemUsed/@itemId` | 6727 | 6727 | 0 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//skillUsed/@skillId` | 314 | 314 | 0 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//monsterDied/@mobId` | 350 | 350 | 0 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//npcTalk/@npcId` | 83 | 52 | 31 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//questComplete/@achievableId` | 6233 | 6220 | 13 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//questBestowed/@achievableId` | 19 | 19 | 0 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//inventoryItem/@itemId` | 1117 | 1117 | 0 | 0 |
| Quest/deed condition → typed target | deeds.xml `.//itemUsed/@itemId` | 423 | 423 | 0 | 0 |

## Reproduction and evidence

`python3 lotro_datenraum_vertiefung.py`. All open values, quest giver IDs, classes and the SHA-256 of the inputs: `lotro-datenraum-vertiefung.json`. No game, plugin or web file changed.
