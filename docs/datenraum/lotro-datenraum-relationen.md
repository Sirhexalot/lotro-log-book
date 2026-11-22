# Reference validation against concrete target sets

Exact ID equality without name resolution. Source attributes were corrected against the XML structure; prerequisites use the shared quest/deed ID space. A valid target proves neither character unlock nor current game availability. The rules are a checked subset, not all relations of the data space.

| Source | Checked target | References | Resolved | Unresolved | Open distinct values |
| --- | --- | --- | --- | --- | --- |
| sets.xml: `.//set/item/@id` | items.xml: `.//item/@key` | 11159 | 11159 | 0 | 0 |
| recipes.xml: `.//*[@itemId]/@itemId` | items.xml: `.//item/@key` | 80919 | 80919 | 0 | 0 |
| tasks.xml: `.//task/@itemId` | items.xml: `.//item/@key` | 540 | 540 | 0 | 0 |
| tasks.xml: `.//task/@questId` | quests.xml: `.//quest/@id` | 540 | 540 | 0 | 0 |
| NPCs.xml: `.//startupEffect/@id` | effects.xml: `./*/@id` | 314 | 314 | 0 | 0 |
| quests.xml: `.//bestower/@npcId` | NPCs.xml: `.//NPC/@id` | 13380 | 12389 | 991 | 613 |
| quests.xml: `.//prerequisite/@id` | Union quests.xml/quest + deeds.xml/deed; shared achievable ID space | 13067 | 13067 | 0 | 0 |
| deeds.xml: `.//prerequisite/@id` | Union quests.xml/quest + deeds.xml/deed; shared achievable ID space | 62 | 62 | 0 | 0 |
| quests.xml: `.//landmarkDetection/@landmarkId` | landmarks.xml: `.//landmark/@id` | 747 | 747 | 0 | 0 |
| deeds.xml: `.//landmarkDetection/@landmarkId` | landmarks.xml: `.//landmark/@id` | 1696 | 1696 | 0 | 0 |
| quests.xml: `.//object/@id` | items.xml: `.//item/@key` | 19726 | 19726 | 0 | 0 |
| deeds.xml: `.//object/@id` | items.xml: `.//item/@key` | 4174 | 4174 | 0 | 0 |
| quests.xml: `.//title/@id` | titles.xml: `.//title/@id` | 231 | 231 | 0 | 0 |
| deeds.xml: `.//title/@id` | titles.xml: `.//title/@id` | 2377 | 2377 | 0 | 0 |
| quests.xml: `.//trait/@id` | traits.xml: `.//trait/@identifier` | 129 | 129 | 0 | 0 |
| deeds.xml: `.//trait/@id` | traits.xml: `.//trait/@identifier` | 177 | 177 | 0 | 0 |
| quests.xml: `.//factionLevel/@factionId` | factions.xml: `.//faction/@id` | 36 | 36 | 0 | 0 |
| deeds.xml: `.//factionLevel/@factionId` | factions.xml: `.//faction/@id` | 680 | 680 | 0 | 0 |
| travelNPCs.xml: `.//travelNPC/@nodeId` | travels.xml: `.//node/@id` | 449 | 449 | 0 | 0 |
| travels.xml: `.//route/@destinationID` | travels.xml: `.//destination/@id` | 5319 | 5319 | 0 | 0 |
| parchmentMaps.xml: `.//parchmentMap/@parentMapId` | parchmentMaps.xml: `.//parchmentMap/@id` | 231 | 231 | 0 | 0 |
| geoAreas.xml: `.//*[@parentId]/@parentId` | geoAreas.xml: `./*/@id` | 765 | 765 | 0 | 0 |
| traceries.xml: `.//tracery/@setId` | sets.xml: `.//set/@id` | 516 | 516 | 0 | 0 |
| disenchantments.xml: `.//disenchantment/@sourceItemId` | items.xml: `.//item/@key` | 27333 | 27333 | 0 | 0 |
| disenchantments.xml: `.//disenchantment/@resultItemId` | items.xml: `.//item/@key` | 26341 | 26341 | 0 | 0 |

Details: `lotro-datenraum-relationen.json`. Reproduction: `python3 lotro_datenraum_referenzen.py` after the main audit.
