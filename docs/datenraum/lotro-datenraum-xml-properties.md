# Vollständiges XML-Feldinventar des verfügbaren Companion-Lore-Stands

Erfasst: 2026-11-17T09:39:02.221362+00:00

Alle vorhandenen XML-Dateien der aktiven lokalen Lore einschließlich Items, Enums, Karten, Marker und Sprachlabels. Jede Zeile nennt den vollständigen Elementpfad; Attribute werden nicht zwischen verschiedenen Pfaden vermischt. Belegt wird die gespeicherte Struktur, nicht automatisch ihre Spielsemantik. Attributzähler sind Vorkommen; fehlendes Attribut bedeutet keinen bewiesenen Default.

## NPCs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `NPCs` | 1 | — | `NPC` |
| `NPCs/NPC` | 16912 | `gender` (16168/16912); `id` (16912/16912); `name` (16912/16912); `title` (4113/16912) | `startupEffect` |
| `NPCs/NPC/startupEffect` | 314 | `id` (314/314); `name` (314/314); `spellcraft` (1/314) | — |

## actionTables.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `actionTables` | 1 | — | `actionTable` |
| `actionTables/actionTable` | 3096 | `id` (3096/3096) | `actionTableEntry` |
| `actionTables/actionTable/actionTableEntry` | 14611 | `cooldown` (12885/14611); `cooldownChannel` (1287/14611); `disallowedHints` (4561/14611); `probability` (14611/14611); `requiredHints` (3540/14611); `targetCooldown` (2105/14611); `targetDisallowedHints` (1986/14611); `targetRequiredHints` (2164/14611) | `action` |
| `actionTables/actionTable/actionTableEntry/action` | 15344 | `name` (15344/15344); `recovery` (206/15344); `skillId` (15344/15344) | — |

## allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `allegiances` | 1 | — | `allegiance`, `curve` |
| `allegiances/allegiance` | 7 | `advancementProgressionID` (7/7); `description` (7/7); `group` (7/7); `icon` (7/7); `id` (7/7); `minLevel` (7/7); `name` (7/7); `travelSkillId` (7/7) | `deed` |
| `allegiances/allegiance/deed` | 210 | `id` (210/210); `name` (210/210) | — |
| `allegiances/curve` | 5 | `id` (5/5) | `level` |
| `allegiances/curve/level` | 155 | `level` (155/155); `points` (155/155) | — |

## barters.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `barterers` | 1 | — | `barterProfile`, `barterer` |
| `barterers/barterProfile` | 3469 | `name` (3469/3469); `profileId` (3469/3469); `requiredClass` (12/3469); `requiredFaction` (565/3469); `requiredQuest` (505/3469) | `barterEntry` |
| `barterers/barterProfile/barterEntry` | 42594 | — | `give`, `receive`, `receiveReputation` |
| `barterers/barterProfile/barterEntry/give` | 58933 | `id` (58933/58933); `name` (58933/58933); `quantity` (44161/58933) | — |
| `barterers/barterProfile/barterEntry/receive` | 42590 | `id` (42590/42590); `name` (42590/42590); `quantity` (783/42590) | — |
| `barterers/barterProfile/barterEntry/receiveReputation` | 4 | `factionId` (4/4); `factionName` (4/4); `quantity` (4/4) | — |
| `barterers/barterer` | 1096 | `id` (1096/1096); `name` (1096/1096); `requiredClass` (159/1096); `requiredFaction` (17/1096); `requiredQuest` (1/1096); `title` (917/1096) | `barterProfile` |
| `barterers/barterer/barterProfile` | 8891 | `profileId` (8891/8891) | — |

## baubles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `baubles` | 1 | — | `bauble` |
| `baubles/bauble` | 98 | `identifier` (98/98); `name` (98/98) | — |

## billingGroups.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `billingGroups` | 1 | — | `billingGroup` |
| `billingGroups/billingGroup` | 898 | `id` (898/898); `name` (898/898) | `title` |
| `billingGroups/billingGroup/title` | 341 | `id` (341/341); `name` (341/341) | — |

## birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `birds` | 1 | — | `bird` |
| `birds/bird` | 470 | `callSoundID` (470/470); `elvishName` (470/470); `iconID` (470/470); `identifier` (470/470); `largeIconID` (470/470); `name` (470/470); `typeCode` (470/470) | — |

## buffs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `buffs` | 1 | — | `buff` |
| `buffs/buff` | 20 | `effectId` (20/20); `effectName` (20/20); `key` (2/20) | — |

## classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `classes` | 1 | — | `class` |
| `classes/class` | 12 | `abbreviation` (12/12); `code` (12/12); `description` (12/12); `iconId` (12/12); `id` (12/12); `key` (12/12); `name` (12/12); `smallIconId` (12/12); `tacticalDpsStatName` (12/12); `tag` (12/12); `traitTreeID` (12/12) | `classSkill`, `classTrait`, `proficiencies` |
| `classes/class/classSkill` | 551 | `minLevel` (551/551); `skillId` (551/551); `skillName` (551/551) | — |
| `classes/class/classTrait` | 295 | `minLevel` (295/295); `traitId` (295/295); `traitName` (295/295) | — |
| `classes/class/proficiencies` | 12 | `armourTypeForMitigations` (12/12); `minLevelForDualWield` (6/12) | `armour`, `weapon` |
| `classes/class/proficiencies/armour` | 32 | `level` (32/32); `type` (32/32) | — |
| `classes/class/proficiencies/weapon` | 79 | `level` (79/79); `type` (79/79) | — |

## collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `collections` | 1 | — | `collection` |
| `collections/collection` | 29 | `category` (29/29); `identifier` (29/29); `name` (29/29); `requiredRace` (22/29) | `element`, `rewards` |
| `collections/collection/element` | 131 | `id` (131/131); `name` (131/131) | — |
| `collections/collection/rewards` | 29 | — | `title` |
| `collections/collection/rewards/title` | 27 | `id` (27/27); `name` (27/27) | — |

## colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `colors` | 1 | — | `color` |
| `colors/color` | 54 | `code` (54/54); `floatCode` (54/54); `name` (53/54) | — |

## combat.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `combat` | 1 | — | `curve`, `weaponStrikeModifiers` |
| `combat/curve` | 15 | `curveId` (15/15); `hardCapId` (15/15); `ratingId` (15/15); `targetCapId` (15/15) | — |
| `combat/weaponStrikeModifiers` | 14 | `criticalMultiplierAddMod` (1/14); `superCriticalMultiplierAddMod` (1/14); `weaponDamageMultiplier` (14/14); `weaponType` (14/14) | — |

## consumables.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `consumables` | 1 | — | `consumable` |
| `consumables/consumable` | 2030 | `identifier` (2030/2030); `name` (2030/2030) | `stat` |
| `consumables/consumable/stat` | 4140 | `constant` (3756/4140); `descriptionOverride` (1301/4140); `modifiers` (179/4140); `name` (4140/4140); `operator` (632/4140); `scaling` (73/4140); `value` (311/4140) | — |

## containers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `containers` | 1 | — | `container`, `relicsContainer` |
| `containers/container` | 5735 | `barterTrophyListId` (106/5735); `bindingPolicy` (2203/5735); `customSkirmishLootTableId` (85/5735); `filteredTrophyTableId` (1213/5735); `filteredTrophyTableId2` (981/5735); `filteredTrophyTableId3` (295/5735); `id` (5735/5735); `name` (5735/5735); `openPolicy` (654/5735); `treasureListId` (926/5735); `trophyListId` (4626/5735); `useCharacterForScaling` (412/5735); `weightedTreasureTableId` (52/5735) | — |
| `containers/relicsContainer` | 527 | `id` (527/527); `name` (527/527); `relicId` (391/527); `relicsListId` (136/527) | — |

## cosmetics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `cosmetics` | 1 | — | `cosmetic` |
| `cosmetics/cosmetic` | 7035 | `itemIDs` (7035/7035) | — |

## crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `crafting` | 1 | — | `profession`, `vocation` |
| `crafting/profession` | 10 | `description` (10/10); `enabledProperty` (10/10); `extraRecipesProperty` (10/10); `guildFaction` (7/10); `identifier` (10/10); `key` (10/10); `masteryLevelProperty` (10/10); `masteryXpProperty` (10/10); `name` (10/10); `proficiencyLevelProperty` (10/10); `proficiencyXpProperty` (10/10) | `professionTier` |
| `crafting/profession/professionTier` | 170 | `icon` (170/170); `identifier` (170/170); `name` (170/170) | `mastery`, `proficiency`, `recipe` |
| `crafting/profession/professionTier/mastery` | 170 | `titleId` (160/170); `xp` (170/170) | — |
| `crafting/profession/professionTier/proficiency` | 170 | `titleId` (160/170); `xp` (170/170) | — |
| `crafting/profession/professionTier/recipe` | 1733 | `id` (1733/1733) | — |
| `crafting/vocation` | 7 | `description` (7/7); `identifier` (7/7); `key` (7/7); `name` (7/7) | `profession` |
| `crafting/vocation/profession` | 21 | `identifier` (21/21) | — |

## deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `deeds` | 1 | — | `deed` |
| `deeds/deed` | 5534 | `category` (5534/5534); `description` (5285/5534); `hidden` (31/5534); `id` (5534/5534); `key` (2763/5534); `level` (5534/5534); `maxLevel` (26/5534); `minLevel` (5534/5534); `monsterPlay` (391/5534); `name` (5534/5534); `rawName` (5534/5534); `requiredClass` (670/5534); `requiredRace` (61/5534); `type` (5534/5534); `uiFilter` (4892/5534); `webStoreItemID` (1576/5534) | `compoundPrerequisite`, `compoundWorldEventCondition`, `loot`, `map`, `objectives`, `prerequisite`, `rewards`, `worldEventCondition` |
| `deeds/deed/compoundPrerequisite` | 9 | `operator` (1/9) | `compoundPrerequisite`, `prerequisite` |
| `deeds/deed/compoundPrerequisite/compoundPrerequisite` | 6 | `operator` (6/6) | `prerequisite` |
| `deeds/deed/compoundPrerequisite/compoundPrerequisite/prerequisite` | 18 | `id` (18/18); `name` (18/18); `status` (18/18) | — |
| `deeds/deed/compoundPrerequisite/prerequisite` | 18 | `id` (18/18); `name` (18/18); `status` (10/18) | — |
| `deeds/deed/compoundWorldEventCondition` | 54 | `operator` (54/54) | `worldEventCondition` |
| `deeds/deed/compoundWorldEventCondition/worldEventCondition` | 108 | `operator` (108/108); `value` (108/108); `worldEventID` (108/108); `worldEventName` (108/108) | — |
| `deeds/deed/loot` | 343 | `id` (343/343); `name` (343/343); `probabilities` (343/343) | `mob`, `mobSpec` |
| `deeds/deed/loot/mob` | 9 | `id` (9/9); `name` (9/9) | — |
| `deeds/deed/loot/mobSpec` | 5182 | `genus` (4035/5182); `landId` (4619/5182); `landName` (4619/5182); `mobDivision` (563/5182); `species` (619/5182); `subSpecies` (5/5182) | — |
| `deeds/deed/map` | 1473 | `mapId` (1333/1473); `maxLat` (140/1473); `maxLon` (140/1473); `minLat` (140/1473); `minLon` (140/1473); `region` (965/1473) | — |
| `deeds/deed/objectives` | 5534 | — | `failureConditions`, `objective` |
| `deeds/deed/objectives/failureConditions` | 85 | — | `condition`, `questComplete` |
| `deeds/deed/objectives/failureConditions/condition` | 32 | `showBillboardText` (27/32); `showProgressText` (27/32); `type` (32/32) | — |
| `deeds/deed/objectives/failureConditions/questComplete` | 101 | `achievableId` (101/101); `showBillboardText` (5/101); `showProgressText` (101/101) | — |
| `deeds/deed/objectives/objective` | 7649 | `billboardOverride` (8/7649); `completionsCount` (48/7649); `index` (7649/7649); `loreOverride` (37/7649); `progressOverride` (30/7649); `text` (4041/7649) | `condition`, `emote`, `enterDetection`, `externalInventoryItem`, `factionLevel`, `hobby`, `inventoryItem`, `itemTalk`, `itemUsed`, `landmarkDetection`, `level`, `monsterDied`, `npcTalk`, `questBestowed`, `questComplete`, `skillUsed` |
| `deeds/deed/objectives/objective/condition` | 339 | `count` (198/339); `eventID` (33/339); `loreInfo` (230/339); `progressOverride` (319/339); `showBillboardText` (244/339); `showProgressText` (20/339); `type` (339/339) | `point` |
| `deeds/deed/objectives/objective/condition/point` | 3 | `key` (3/3); `latitude` (3/3); `longitude` (3/3) | — |
| `deeds/deed/objectives/objective/emote` | 23 | `command` (23/23); `count` (16/23); `emoteId` (23/23); `loreInfo` (17/23); `maxDaily` (16/23); `npcId` (7/23); `npcName` (7/23); `progressOverride` (22/23); `showBillboardText` (22/23); `showProgressText` (1/23) | `point` |
| `deeds/deed/objectives/objective/emote/point` | 1 | `did` (1/1); `latitude` (1/1); `longitude` (1/1) | — |
| `deeds/deed/objectives/objective/enterDetection` | 1438 | `count` (5/1438); `eventID` (137/1438); `loreInfo` (836/1438); `npcId` (19/1438); `npcName` (19/1438); `progressOverride` (905/1438); `showBillboardText` (1022/1438); `showProgressText` (528/1438) | `point` |
| `deeds/deed/objectives/objective/enterDetection/point` | 1376 | `did` (19/1376); `key` (1357/1376); `latitude` (1376/1376); `longitude` (1376/1376); `mapIndex` (345/1376) | — |
| `deeds/deed/objectives/objective/externalInventoryItem` | 2 | `count` (2/2); `itemId` (2/2); `itemName` (2/2); `loreInfo` (2/2); `progressOverride` (2/2) | `point` |
| `deeds/deed/objectives/objective/externalInventoryItem/point` | 20 | `did` (20/20); `key` (20/20); `latitude` (20/20); `longitude` (20/20) | — |
| `deeds/deed/objectives/objective/factionLevel` | 687 | `eventID` (16/687); `factionId` (680/687); `factionName` (680/687); `loreInfo` (391/687); `progressOverride` (405/687); `showBillboardText` (677/687); `showProgressText` (278/687); `tier` (687/687) | — |
| `deeds/deed/objectives/objective/hobby` | 51 | `count` (4/51); `itemId` (51/51); `itemName` (51/51); `loreInfo` (47/51); `progressOverride` (51/51); `showBillboardText` (4/51) | — |
| `deeds/deed/objectives/objective/inventoryItem` | 1117 | `count` (2/1117); `eventID` (1/1117); `itemId` (1117/1117); `itemName` (1117/1117); `loreInfo` (437/1117); `progressOverride` (428/1117); `showBillboardText` (146/1117); `showProgressText` (105/1117) | — |
| `deeds/deed/objectives/objective/itemTalk` | 20 | `eventID` (5/20); `itemId` (20/20); `itemName` (20/20); `loreInfo` (20/20); `progressOverride` (20/20) | `point` |
| `deeds/deed/objectives/objective/itemTalk/point` | 20 | `did` (20/20); `latitude` (20/20); `longitude` (20/20); `mapIndex` (2/20) | — |
| `deeds/deed/objectives/objective/itemUsed` | 467 | `count` (166/467); `eventID` (9/467); `itemId` (423/467); `itemName` (423/467); `loreInfo` (400/467); `progressOverride` (440/467); `showBillboardText` (196/467); `showProgressText` (7/467) | `point` |
| `deeds/deed/objectives/objective/itemUsed/point` | 1112 | `did` (1102/1112); `key` (809/1112); `latitude` (1112/1112); `longitude` (1112/1112); `mapIndex` (272/1112) | — |
| `deeds/deed/objectives/objective/landmarkDetection` | 1696 | `landmarkId` (1696/1696); `landmarkName` (1696/1696); `loreInfo` (1678/1696); `progressOverride` (1363/1696); `showBillboardText` (492/1696) | `point` |
| `deeds/deed/objectives/objective/landmarkDetection/point` | 5233 | `did` (5233/5233); `latitude` (5233/5233); `longitude` (5233/5233); `mapIndex` (1196/5233) | — |
| `deeds/deed/objectives/objective/level` | 102 | `level` (102/102); `loreInfo` (90/102); `progressOverride` (94/102); `showBillboardText` (102/102); `showProgressText` (10/102) | — |
| `deeds/deed/objectives/objective/monsterDied` | 1778 | `count` (1211/1778); `eventID` (303/1778); `loreInfo` (1687/1778); `mobId` (350/1778); `mobName` (350/1778); `progressOverride` (1702/1778); `showBillboardText` (1648/1778); `showProgressText` (15/1778) | `monsterSelection` |
| `deeds/deed/objectives/objective/monsterDied/monsterSelection` | 1892 | `alignment` (4/1892); `class` (12/1892); `genus` (217/1892); `landId` (514/1892); `landName` (514/1892); `landmarkId` (24/1892); `landmarkName` (24/1892); `mobDivision` (1013/1892); `species` (1094/1892); `subSpecies` (480/1892) | — |
| `deeds/deed/objectives/objective/npcTalk` | 89 | `loreInfo` (50/89); `npcId` (83/89); `npcName` (83/89); `progressOverride` (86/89); `showBillboardText` (89/89) | `point` |
| `deeds/deed/objectives/objective/npcTalk/point` | 89 | `did` (83/89); `key` (6/89); `latitude` (89/89); `longitude` (89/89); `mapIndex` (4/89) | — |
| `deeds/deed/objectives/objective/questBestowed` | 19 | `achievableId` (19/19); `eventID` (18/19); `showBillboardText` (19/19); `showProgressText` (19/19) | — |
| `deeds/deed/objectives/objective/questComplete` | 6426 | `achievableId` (6132/6426); `count` (596/6426); `eventID` (410/6426); `loreInfo` (3885/6426); `progressOverride` (4925/6426); `questCategory` (290/6426); `questScope` (55/6426); `showBillboardText` (5424/6426); `showProgressText` (910/6426) | — |
| `deeds/deed/objectives/objective/skillUsed` | 661 | `count` (452/661); `loreInfo` (641/661); `maxPerDay` (443/661); `progressOverride` (661/661); `showBillboardText` (656/661); `skillId` (314/661); `skillName` (314/661) | — |
| `deeds/deed/prerequisite` | 26 | `id` (26/26); `name` (26/26) | — |
| `deeds/deed/rewards` | 5534 | — | `XP`, `billingToken`, `emote`, `glory`, `lotroPoints`, `mountXP`, `object`, `reputationItem`, `title`, `trait`, `virtue`, `virtueXP` |
| `deeds/deed/rewards/XP` | 349 | `quantity` (349/349) | — |
| `deeds/deed/rewards/billingToken` | 123 | `id` (123/123); `name` (123/123) | — |
| `deeds/deed/rewards/emote` | 9 | `id` (9/9); `name` (9/9) | — |
| `deeds/deed/rewards/glory` | 1 | `quantity` (1/1) | — |
| `deeds/deed/rewards/lotroPoints` | 2606 | `quantity` (2606/2606) | — |
| `deeds/deed/rewards/mountXP` | 5 | `quantity` (5/5) | — |
| `deeds/deed/rewards/object` | 4174 | `id` (4174/4174); `name` (4174/4174); `quantity` (3231/4174) | — |
| `deeds/deed/rewards/reputationItem` | 1597 | `amount` (1597/1597); `faction` (1597/1597); `factionId` (1597/1597) | — |
| `deeds/deed/rewards/title` | 2377 | `id` (2377/2377); `name` (2377/2377) | — |
| `deeds/deed/rewards/trait` | 177 | `id` (177/177); `name` (177/177) | — |
| `deeds/deed/rewards/virtue` | 591 | `count` (39/591); `id` (591/591) | — |
| `deeds/deed/rewards/virtueXP` | 1745 | `quantity` (1745/1745) | — |
| `deeds/deed/worldEventCondition` | 82 | `operator` (82/82); `value` (82/82); `worldEventID` (82/82); `worldEventName` (82/82) | — |

## disenchantments.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `disenchantments` | 1 | — | `disenchantment` |
| `disenchantments/disenchantment` | 27333 | `name` (26341/27333); `quantity` (26341/27333); `resultItemId` (26341/27333); `sourceItemId` (27333/27333); `sourceItemName` (27333/27333); `trophyListId` (992/27333) | — |

## dpsTables.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `valueTables` | 1 | — | `valueTable` |
| `valueTables/valueTable` | 6 | `id` (6/6) | `baseValue`, `quality` |
| `valueTables/valueTable/baseValue` | 4206 | `level` (4206/4206); `value` (4206/4206) | — |
| `valueTables/valueTable/quality` | 30 | `factor` (30/30); `key` (30/30) | — |

## dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `dungeons` | 1 | — | `dungeon` |
| `dungeons/dungeon` | 1324 | `basemapId` (1324/1324); `id` (1324/1324); `name` (1324/1324) | `position` |
| `dungeons/dungeon/position` | 1015 | `latitude` (1015/1015); `longitude` (1015/1015); `region` (1015/1015); `zoneID` (1015/1015) | — |

## effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `effects` | 1 | — | `aiPetEffect`, `applyOverTimeEffect`, `areaEffect`, `auraEffect`, `bubbleEffect`, `comboEffect`, `cooldownEffect`, `countdownEffect`, `dispelByResist`, `dispelEffect`, `effect`, `fellowshipEffect`, `flagEffect`, `genesis`, `induceCombatState`, `instantVitalEffect`, `killProcEffect`, `persistentComboEffect`, `pipEffect`, `procEffect`, `propertyModEffect`, `randomEffect`, `reactiveVitalEffect`, `recallEffect`, `reviveEffect`, `tieredEffect`, `travelEffect`, `vitalOverTimeEffect` |
| `effects/aiPetEffect` | 738 | `appliedDescription` (1/738); `baseFlags` (738/738); `description` (206/738); `id` (738/738); `name` (696/738); `probability` (10/738); `probabilityModProperty` (1/738) | `applyToMasterEffect`, `effect`, `summoned` |
| `effects/aiPetEffect/applyToMasterEffect` | 215 | `id` (215/215); `name` (215/215) | — |
| `effects/aiPetEffect/effect` | 294 | `id` (294/294); `name` (294/294) | — |
| `effects/aiPetEffect/summoned` | 738 | `id` (738/738); `name` (738/738) | — |
| `effects/applyOverTimeEffect` | 1108 | `appliedDescription` (580/1108); `baseFlags` (1108/1108); `description` (38/1108); `duration` (1108/1108); `iconId` (1108/1108); `id` (1108/1108); `name` (1084/1108); `probability` (33/1108); `probabilityModProperty` (29/1108); `pulseCount` (455/1108); `pulseCountMods` (14/1108) | `applied`, `initiallyApplied` |
| `effects/applyOverTimeEffect/applied` | 1201 | `id` (1201/1201); `name` (1201/1201); `spellcraft` (474/1201) | — |
| `effects/applyOverTimeEffect/initiallyApplied` | 954 | `id` (954/954); `name` (954/954); `spellcraft` (395/954) | — |
| `effects/areaEffect` | 337 | `appliedDescription` (3/337); `baseFlags` (337/337); `description` (5/337); `flags` (337/337); `id` (337/337); `maxTargets` (337/337); `maxTargetsMods` (86/337); `name` (335/337); `probability` (4/337); `probabilityModProperty` (3/337); `range` (337/337) | `effect` |
| `effects/areaEffect/effect` | 432 | `id` (432/432); `name` (432/432); `spellcraft` (109/432) | — |
| `effects/auraEffect` | 483 | `appliedDescription` (290/483); `baseFlags` (483/483); `description` (4/483); `duration` (45/483); `iconId` (483/483); `id` (483/483); `name` (479/483); `pulseCount` (1/483); `shouldAffectCaster` (380/483); `type` (483/483) | `effect` |
| `effects/auraEffect/effect` | 557 | `id` (557/557); `name` (557/557); `spellcraft` (2/557) | — |
| `effects/bubbleEffect` | 82 | `appliedDescription` (28/82); `baseFlags` (82/82); `description` (4/82); `duration` (65/82); `durationMods` (1/82); `iconId` (82/82); `id` (82/82); `modifiers` (14/82); `name` (82/82); `percentage` (34/82); `probability` (4/82); `probabilityModProperty` (5/82); `progression` (7/82); `pulseCount` (7/82); `value` (41/82); `vital` (82/82) | `onExpire`, `onRemoval`, `stat` |
| `effects/bubbleEffect/onExpire` | 43 | `id` (43/43); `name` (43/43); `spellcraft` (15/43) | — |
| `effects/bubbleEffect/onRemoval` | 14 | `id` (14/14); `name` (14/14) | — |
| `effects/bubbleEffect/stat` | 125 | `constant` (106/125); `descriptionOverride` (38/125); `modifiers` (27/125); `name` (125/125); `operator` (91/125); `value` (19/125) | — |
| `effects/comboEffect` | 1065 | `appliedDescription` (123/1065); `baseFlags` (1065/1065); `description` (14/1065); `id` (1065/1065); `name` (1065/1065); `probability` (44/1065); `probabilityModProperty` (32/1065) | `present`, `toAddIfNotPresent`, `toAddIfPresent`, `toExamine`, `toGiveBackIfNotPresent`, `toGiveBackIfPresent` |
| `effects/comboEffect/present` | 834 | `id` (834/834); `name` (834/834) | — |
| `effects/comboEffect/toAddIfNotPresent` | 630 | `id` (630/630); `name` (630/630) | — |
| `effects/comboEffect/toAddIfPresent` | 858 | `id` (858/858); `name` (858/858) | — |
| `effects/comboEffect/toExamine` | 183 | `id` (183/183); `name` (183/183) | — |
| `effects/comboEffect/toGiveBackIfNotPresent` | 72 | `id` (72/72); `name` (72/72) | — |
| `effects/comboEffect/toGiveBackIfPresent` | 158 | `id` (158/158); `name` (158/158) | — |
| `effects/cooldownEffect` | 82 | `appliedDescription` (8/82); `baseFlags` (82/82); `baseModifier` (82/82); `description` (61/82); `durationModifiers` (5/82); `id` (82/82); `name` (81/82); `probability` (4/82); `probabilityModProperty` (4/82) | `cooldownChannel`, `skill` |
| `effects/cooldownEffect/cooldownChannel` | 110 | `code` (110/110); `name` (110/110) | — |
| `effects/cooldownEffect/skill` | 138 | `id` (138/138) | — |
| `effects/countdownEffect` | 567 | `appliedDescription` (297/567); `baseFlags` (567/567); `description` (97/567); `duration` (567/567); `durationMods` (10/567); `iconId` (567/567); `id` (567/567); `name` (565/567); `probability` (3/567); `pulseCount` (533/567) | `onExpire`, `onRemoval`, `stat` |
| `effects/countdownEffect/onExpire` | 818 | `id` (818/818); `name` (818/818); `spellcraft` (98/818) | — |
| `effects/countdownEffect/onRemoval` | 50 | `id` (50/50); `name` (50/50); `spellcraft` (3/50) | — |
| `effects/countdownEffect/stat` | 364 | `constant` (282/364); `descriptionOverride` (184/364); `modifiers` (2/364); `name` (364/364); `operator` (204/364); `scaling` (26/364); `value` (56/364) | — |
| `effects/dispelByResist` | 80 | `baseFlags` (80/80); `description` (9/80); `id` (80/80); `maxDispelCount` (80/80); `name` (80/80); `probability` (5/80); `probabilityModProperty` (2/80); `resistCategories` (80/80); `strengthOffset` (41/80); `useStrengthRestriction` (61/80) | — |
| `effects/dispelEffect` | 455 | `appliedDescription` (12/455); `baseFlags` (455/455); `description` (17/455); `dispelCasters` (112/455); `id` (455/455); `name` (455/455); `probability` (3/455); `probabilityModProperty` (7/455) | `effect` |
| `effects/dispelEffect/effect` | 966 | `id` (966/966); `name` (966/966) | — |
| `effects/effect` | 2063 | `appliedDescription` (1046/2063); `baseFlags` (2063/2063); `description` (124/2063); `duration` (88/2063); `durationMods` (4/2063); `iconId` (266/2063); `id` (2063/2063); `name` (1377/2063); `probability` (29/2063); `probabilityModProperty` (16/2063); `pulseCount` (31/2063); `pulseCountMods` (1/2063) | — |
| `effects/fellowshipEffect` | 395 | `appliedDescription` (24/395); `applyToPets` (248/395); `applyToRaidGroups` (132/395); `applyToTarget` (286/395); `baseFlags` (395/395); `description` (70/395); `id` (395/395); `name` (391/395); `probability` (16/395); `probabilityModProperty` (15/395); `range` (395/395); `stringOverride` (74/395) | `effect` |
| `effects/fellowshipEffect/effect` | 449 | `id` (449/449); `name` (449/449); `spellcraft` (21/449) | — |
| `effects/flagEffect` | 922 | `appliedDescription` (524/922); `baseFlags` (922/922); `description` (34/922); `duration` (360/922); `durationMods` (10/922); `iconId` (922/922); `id` (922/922); `name` (918/922); `probability` (3/922); `probabilityModProperty` (3/922); `pulseCount` (38/922) | — |
| `effects/genesis` | 1285 | `appliedDescription` (968/1285); `baseFlags` (1285/1285); `description` (34/1285); `id` (1285/1285); `name` (1260/1285); `permanent` (176/1285); `probability` (10/1285); `summonDuration` (1109/1285) | `hotspot`, `summoned` |
| `effects/genesis/hotspot` | 776 | `id` (776/776); `name` (776/776) | `effect` |
| `effects/genesis/hotspot/effect` | 1043 | `id` (1043/1043); `name` (1043/1043); `spellcraft` (150/1043) | — |
| `effects/genesis/summoned` | 484 | `id` (484/484); `name` (484/484) | — |
| `effects/induceCombatState` | 233 | `appliedDescription` (14/233); `baseFlags` (233/233); `breakOnHarmfullSkill` (7/233); `breakOnVitalLoss` (22/233); `breakOnVitalLossMods` (2/233); `description` (3/233); `gracePeriod` (46/233); `gracePeriodMods` (20/233); `id` (233/233); `name` (233/233); `probability` (30/233); `probabilityModProperty` (14/233); `state` (233/233); `stateDuration` (230/233); `stateDurationMods` (70/233) | `function` |
| `effects/induceCombatState/function` | 3 | `maxX` (3/3); `maxY` (3/3); `minX` (3/3); `minY` (3/3) | — |
| `effects/instantVitalEffect` | 982 | `appliedDescription` (10/982); `baseFlags` (982/982); `damageType` (374/982); `description` (24/982); `id` (982/982); `multiplicative` (215/982); `multiplier` (720/982); `name` (982/982); `probability` (25/982); `probabilityModProperty` (24/982); `stat` (982/982) | `vitalChange` |
| `effects/instantVitalEffect/vitalChange` | 931 | `constant` (202/931); `modifiers` (485/931); `progressionID` (729/931); `variance` (243/931); `vpsMultiplier` (258/931) | — |
| `effects/killProcEffect` | 99 | `appliedDescription` (40/99); `baseFlags` (99/99); `description` (14/99); `descriptionOverride` (2/99); `duration` (11/99); `durationMods` (1/99); `iconId` (99/99); `id` (99/99); `name` (99/99) | `casterEffect`, `stat`, `userEffect` |
| `effects/killProcEffect/casterEffect` | 22 | `id` (22/22); `name` (22/22); `spellcraft` (1/22) | — |
| `effects/killProcEffect/stat` | 5 | `descriptionOverride` (5/5); `name` (5/5); `value` (5/5) | — |
| `effects/killProcEffect/userEffect` | 88 | `id` (88/88); `name` (88/88); `spellcraft` (4/88) | — |
| `effects/persistentComboEffect` | 14 | `baseFlags` (14/14); `duration` (14/14); `iconId` (14/14); `id` (14/14); `name` (14/14); `pulseCount` (1/14) | `present`, `toAddIfNotPresent`, `toAddIfPresent`, `toExamine` |
| `effects/persistentComboEffect/present` | 15 | `id` (15/15); `name` (15/15) | — |
| `effects/persistentComboEffect/toAddIfNotPresent` | 10 | `id` (10/10); `name` (10/10) | — |
| `effects/persistentComboEffect/toAddIfPresent` | 10 | `id` (10/10); `name` (10/10) | — |
| `effects/persistentComboEffect/toExamine` | 1 | `id` (1/1); `name` (1/1) | — |
| `effects/pipEffect` | 81 | `adjustmentType` (79/81); `amount` (79/81); `amountMods` (3/81); `appliedDescription` (8/81); `baseFlags` (81/81); `description` (20/81); `id` (81/81); `name` (81/81); `probability` (10/81); `probabilityModProperty` (10/81); `reset` (2/81); `type` (81/81) | — |
| `effects/procEffect` | 479 | `appliedDescription` (278/479); `baseFlags` (479/479); `cooldown` (292/479); `description` (42/479); `descriptionOverride` (158/479); `duration` (81/479); `durationMods` (3/479); `iconId` (479/479); `id` (479/479); `name` (446/479); `procProbability` (276/479); `pulseCount` (1/479); `skillTypes` (479/479) | `effect`, `specialEffect`, `stat` |
| `effects/procEffect/effect` | 570 | `id` (570/570); `name` (570/570); `spellcraft` (39/570); `target` (124/570) | — |
| `effects/procEffect/specialEffect` | 2 | `label` (2/2) | — |
| `effects/procEffect/stat` | 133 | `constant` (130/133); `descriptionOverride` (71/133); `modifiers` (13/133); `name` (133/133); `operator` (58/133); `value` (3/133) | — |
| `effects/propertyModEffect` | 10681 | `appliedDescription` (3771/10681); `baseFlags` (10681/10681); `description` (360/10681); `duration` (4665/10681); `durationMods` (409/10681); `iconId` (10681/10681); `id` (10681/10681); `name` (10221/10681); `probability` (75/10681); `probabilityModProperty` (78/10681); `probabilityVariance` (1/10681); `pulseCount` (251/10681); `pulseCountMods` (12/10681) | `specialEffect`, `stat` |
| `effects/propertyModEffect/specialEffect` | 44 | `label` (44/44) | — |
| `effects/propertyModEffect/stat` | 25925 | `constant` (18771/25925); `descriptionOverride` (14327/25925); `modifiers` (1832/25925); `name` (25925/25925); `operator` (15793/25925); `scaling` (1669/25925); `value` (5485/25925) | — |
| `effects/randomEffect` | 142 | `appliedDescription` (2/142); `baseFlags` (142/142); `description` (9/142); `id` (142/142); `name` (142/142); `probability` (10/142); `probabilityModProperty` (2/142) | `effect` |
| `effects/randomEffect/effect` | 589 | `doCaster` (165/589); `id` (589/589); `name` (589/589); `weight` (589/589) | — |
| `effects/reactiveVitalEffect` | 292 | `appliedDescription` (209/292); `baseFlags` (292/292); `damageQualifiers` (55/292); `damageTypeOverride` (67/292); `damageTypes` (292/292); `description` (48/292); `duration` (152/292); `durationMods` (15/292); `iconId` (292/292); `id` (292/292); `name` (291/292); `probability` (1/292); `probabilityModProperty` (3/292); `pulseCount` (8/292); `removeOnProc` (26/292); `vitalTypes` (292/292) | `attacker`, `defender`, `specialEffect`, `stat` |
| `effects/reactiveVitalEffect/attacker` | 173 | — | `effect`, `reactiveVital` |
| `effects/reactiveVitalEffect/attacker/effect` | 69 | `id` (69/69); `name` (69/69); `probability` (69/69) | — |
| `effects/reactiveVitalEffect/attacker/reactiveVital` | 118 | `constant` (100/118); `multiplicative` (99/118); `probability` (118/118); `progressionID` (18/118); `variance` (2/118) | — |
| `effects/reactiveVitalEffect/defender` | 143 | — | `effect`, `reactiveVital` |
| `effects/reactiveVitalEffect/defender/effect` | 83 | `id` (83/83); `name` (83/83); `probability` (83/83) | — |
| `effects/reactiveVitalEffect/defender/reactiveVital` | 75 | `constant` (60/75); `multiplicative` (60/75); `probability` (75/75); `progressionID` (15/75) | — |
| `effects/reactiveVitalEffect/specialEffect` | 6 | `label` (6/6) | — |
| `effects/reactiveVitalEffect/stat` | 126 | `constant` (76/126); `descriptionOverride` (54/126); `modifiers` (11/126); `name` (126/126); `operator` (72/126); `scaling` (3/126); `value` (47/126) | — |
| `effects/recallEffect` | 331 | `appliedDescription` (21/331); `baseFlags` (331/331); `description` (31/331); `id` (331/331); `name` (331/331) | `position` |
| `effects/recallEffect/position` | 308 | `latitude` (308/308); `longitude` (308/308); `region` (308/308) | — |
| `effects/reviveEffect` | 15 | `baseFlags` (15/15); `id` (15/15); `name` (15/15) | `effect`, `reviveVital` |
| `effects/reviveEffect/effect` | 15 | `id` (15/15); `name` (15/15) | — |
| `effects/reviveEffect/reviveVital` | 30 | `modifiers` (22/30); `percentage` (30/30); `vital` (30/30) | — |
| `effects/tieredEffect` | 512 | `appliedDescription` (11/512); `baseFlags` (512/512); `description` (11/512); `id` (512/512); `name` (512/512); `probability` (10/512); `probabilityModProperty` (8/512); `showInExamination` (418/512) | `finalTier`, `tierUp` |
| `effects/tieredEffect/finalTier` | 442 | `id` (442/442); `name` (442/442) | — |
| `effects/tieredEffect/tierUp` | 3020 | `id` (3020/3020); `name` (3020/3020) | — |
| `effects/travelEffect` | 602 | `appliedDescription` (113/602); `baseFlags` (602/602); `id` (602/602); `name` (602/602); `privateEncounterID` (275/602); `removeFromInstance` (272/602); `sceneID` (379/602) | `position` |
| `effects/travelEffect/position` | 595 | `latitude` (595/595); `longitude` (595/595); `region` (595/595) | — |
| `effects/vitalOverTimeEffect` | 2417 | `appliedDescription` (939/2417); `baseFlags` (2417/2417); `damageType` (1883/2417); `description` (16/2417); `duration` (2417/2417); `iconId` (2417/2417); `id` (2417/2417); `name` (2416/2417); `probability` (21/2417); `probabilityModProperty` (17/2417); `pulseCount` (1699/2417); `pulseCountMods` (246/2417); `stat` (2417/2417) | `initialChange`, `overTimeChange` |
| `effects/vitalOverTimeEffect/initialChange` | 1709 | `constant` (26/1709); `modifiers` (999/1709); `progressionID` (1683/1709); `variance` (111/1709); `vpsMultiplier` (112/1709) | — |
| `effects/vitalOverTimeEffect/overTimeChange` | 2417 | `constant` (62/2417); `modifiers` (2135/2417); `progressionID` (2355/2417); `variance` (276/2417); `vpsMultiplier` (289/2417) | — |

## emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `emotes` | 1 | — | `emote` |
| `emotes/emote` | 273 | `auto` (129/273); `command` (273/273); `description` (273/273); `icon` (273/273); `id` (273/273) | — |

## enhancementRunes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enhancementRunes` | 1 | — | `enhancementRune` |
| `enhancementRunes/enhancementRune` | 40 | `itemId` (40/40); `levelIncrement` (31/40); `maxItemLevel` (40/40); `minItemLevel` (40/40); `name` (40/40) | — |

## factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `factions` | 1 | — | `deed`, `faction` |
| `factions/deed` | 2 | `lotroPoints` (2/2); `name` (2/2) | `deedFaction` |
| `factions/deed/deedFaction` | 14 | `id` (14/14) | — |
| `factions/faction` | 108 | `category` (108/108); `currentReputationProperty` (108/108); `currentTierProperty` (108/108); `description` (108/108); `guild` (7/108); `highestTier` (108/108); `id` (108/108); `initialTier` (108/108); `key` (65/108); `lowestTier` (108/108); `name` (108/108) | `level` |
| `factions/faction/level` | 767 | `deedKey` (358/767); `key` (460/767); `lotroPoints` (767/767); `name` (767/767); `requiredReputation` (767/767); `tier` (767/767) | — |

## game.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `game` | 1 | — | `gameParameters` |
| `game/gameParameters` | 1 | `maxCharLevel` (1/1); `maxLegendaryItemLevel` (1/1); `maxVirtueRank` (1/1) | — |

## genericItemEffects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `genericItemEffects` | 1 | — | `category` |
| `genericItemEffects/category` | 13 | `code` (13/13); `label` (13/13) | `effect` |
| `genericItemEffects/category/effect` | 15 | `id` (15/15); `name` (15/15) | — |

## geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `geoAreas` | 1 | — | `area`, `region`, `territory` |
| `geoAreas/area` | 679 | `iconId` (668/679); `id` (679/679); `name` (679/679); `parentId` (679/679) | — |
| `geoAreas/region` | 7 | `code` (7/7); `id` (7/7); `name` (7/7) | — |
| `geoAreas/territory` | 86 | `id` (86/86); `name` (86/86); `parentId` (86/86) | — |

## hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `hobbies` | 1 | — | `hobby` |
| `hobbies/hobby` | 2 | `dailyProficiencyGainLimit` (2/2); `description` (2/2); `iconId` (2/2); `identifier` (2/2); `minLevel` (2/2); `name` (2/2); `proficiencyModifierPropertyName` (2/2); `proficiencyPropertyName` (2/2); `trainerInfo` (2/2); `treasureProfileOverridePropertyName` (2/2); `type` (2/2) | `item`, `profile`, `territory`, `title` |
| `hobbies/hobby/item` | 4 | `id` (4/4); `name` (4/4) | — |
| `hobbies/hobby/profile` | 75 | `id` (75/75) | `entry` |
| `hobbies/hobby/profile/entry` | 2562 | `itemID` (2562/2562); `itemName` (2562/2562); `maxProficiency` (2562/2562); `minProficiency` (2562/2562); `weight` (2562/2562) | — |
| `hobbies/hobby/territory` | 122 | `id` (122/122); `name` (122/122); `profileID` (120/122) | — |
| `hobbies/hobby/title` | 10 | `id` (10/10); `name` (10/10); `proficiency` (10/10) | — |

## housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `housing` | 1 | — | `house`, `houseInfo`, `neighborhood`, `neighborhoodTemplate` |
| `housing/house` | 211 | `address` (211/211); `description` (211/211); `id` (211/211); `kinship` (24/211); `premium` (88/211); `price` (211/211); `templateID` (211/211); `type` (211/211); `upkeep` (211/211) | `position`, `trait` |
| `housing/house/position` | 211 | `latitude` (211/211); `longitude` (211/211); `region` (211/211) | — |
| `housing/house/trait` | 439 | `id` (439/439); `name` (439/439) | — |
| `housing/houseInfo` | 37 | `icon16ID` (37/37); `icon32ID` (37/37); `iconID` (37/37); `largeIconID` (37/37); `panoramaIconID` (37/37); `price` (37/37); `type` (37/37); `upkeep` (37/37) | — |
| `housing/neighborhood` | 3248 | `id` (3248/3248); `name` (3248/3248); `templateID` (3248/3248) | — |
| `housing/neighborhoodTemplate` | 14 | `id` (14/14); `name` (14/14) | `boot`, `entrance`, `houseReference`, `landblock` |
| `housing/neighborhoodTemplate/boot` | 14 | `latitude` (14/14); `longitude` (14/14); `region` (14/14) | — |
| `housing/neighborhoodTemplate/entrance` | 14 | `latitude` (14/14); `longitude` (14/14); `region` (14/14) | — |
| `housing/neighborhoodTemplate/houseReference` | 211 | `address` (211/211); `id` (211/211); `type` (211/211) | — |
| `housing/neighborhoodTemplate/landblock` | 461 | `blockX` (461/461); `blockY` (461/461); `region` (461/461) | — |

## inductions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `inductions` | 1 | — | `induction` |
| `inductions/induction` | 944 | `addMods` (45/944); `duration` (944/944); `id` (944/944); `multiplyMods` (495/944) | — |

## initialGear.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `initialGear` | 1 | — | `class` |
| `initialGear/class` | 12 | `key` (12/12) | `item` |
| `initialGear/class/item` | 85 | `id` (85/85); `name` (85/85); `race` (18/85) | — |

## instanceLoots.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `instanceLoots` | 1 | — | `table` |
| `instanceLoots/table` | 5 | `id` (5/5) | `instance` |
| `instanceLoots/table/instance` | 192 | `id` (192/192); `name` (192/192) | `lootEntry` |
| `instanceLoots/table/instance/lootEntry` | 5099 | `maxDifficulty` (5099/5099); `maxGroupSize` (5099/5099); `maxLevel` (5099/5099); `minDifficulty` (5099/5099); `minGroupSize` (5099/5099); `minLevel` (5099/5099); `trophyListId` (5099/5099) | — |

## instancesTree.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `instancesTree` | 1 | — | `category` |
| `instancesTree/category` | 5 | `name` (5/5) | `instance` |
| `instancesTree/category/instance` | 166 | `id` (166/166); `name` (166/166) | — |

## items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `items` | 1 | — | `item` |
| `items/item` | 152100 | `armourType` (41194/152100); `binding` (117971/152100); `category` (152100/152100); `class` (152100/152100); `combatDPSLevel` (3733/152100); `combatPropertyModLevel` (1104/152100); `damageType` (22918/152100); `description` (62507/152100); `dps` (22918/152100); `dpsTableId` (22918/152100); `durability` (86666/152100); `equipmentCategory` (90792/152100); `icon` (150521/152100); `itemStackMax` (36/152100); `key` (152100/152100); `level` (149603/152100); `mainLegacyId` (4837/152100); `maxDamage` (22918/152100); `maxItems` (36/152100); `maxLevel` (15112/152100); `minDamage` (22918/152100); `minLevel` (100806/152100); `name` (152100/152100); `pluralName` (42646/152100); `precludedSlots` (6869/152100); `quality` (149274/152100); `requiredClass` (31345/152100); `requiredEffect` (239/152100); `requiredFaction` (4411/152100); `requiredGloryRank` (1083/152100); `requiredProfession` (6630/152100); `requiredRace` (57/152100); `requiredTrait` (2586/152100); `scaling` (30128/152100); `slot` (90792/152100); `slots` (9889/152100); `spellcraft` (56/152100); `stackMax` (31606/152100); `sturdiness` (86666/152100); `tier` (15460/152100); `type` (1783/152100); `unique` (4975/152100); `valueTableId` (146025/152100); `weaponType` (22918/152100) | `allegiancePoints`, `cooldown`, `decay`, `effect`, `grants`, `housingHooks`, `itemXP`, `providesPortraitFrame`, `reputation`, `skill`, `slayer`, `stats`, `virtueXP` |
| `items/item/allegiancePoints` | 17 | `group` (17/17); `name` (17/17); `points` (17/17) | — |
| `items/item/cooldown` | 7260 | `channelID` (5472/7260); `duration` (7260/7260) | — |
| `items/item/decay` | 158 | `duration` (158/158) | — |
| `items/item/effect` | 23764 | `id` (23764/23764); `name` (22867/23764); `spellcraft` (785/23764); `type` (23764/23764) | — |
| `items/item/grants` | 3763 | `id` (3763/3763); `type` (3763/3763) | — |
| `items/item/housingHooks` | 5381 | `categories` (5381/5381) | — |
| `items/item/itemXP` | 80 | `amount` (80/80) | — |
| `items/item/providesPortraitFrame` | 111 | `code` (111/111) | — |
| `items/item/reputation` | 265 | `amount` (265/265); `factionID` (265/265); `factionName` (265/265) | — |
| `items/item/skill` | 1180 | `id` (1180/1180); `level` (1084/1180); `name` (1180/1180) | — |
| `items/item/slayer` | 3009 | `genus` (3009/3009); `value` (3009/3009) | — |
| `items/item/stats` | 152100 | — | `specialEffect`, `stat` |
| `items/item/stats/specialEffect` | 36 | `label` (36/36) | — |
| `items/item/stats/stat` | 345817 | `constant` (20439/345817); `descriptionOverride` (3583/345817); `name` (345817/345817); `operator` (1439/345817); `ranged` (14793/345817); `scaling` (309929/345817); `value` (656/345817) | — |
| `items/item/virtueXP` | 410 | `amount` (410/410); `bonus` (1/410) | — |

## landblocks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `landblocks` | 1 | — | `landblock` |
| `landblocks/landblock` | 51018 | `areaId` (51018/51018); `blockX` (51018/51018); `blockY` (51018/51018); `dungeonId` (1256/51018); `height` (51018/51018); `region` (51018/51018) | `cell` |
| `landblocks/landblock/cell` | 107372 | `dungeonId` (15782/107372); `index` (107372/107372); `x` (107372/107372); `y` (107372/107372); `z` (107372/107372) | — |

## landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `landmarks` | 1 | — | `landmark` |
| `landmarks/landmark` | 2810 | `id` (2810/2810); `name` (2810/2810) | — |

## legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `legacies` | 1 | — | `legacy` |
| `legacies/legacy` | 344 | `effectId` (342/344); `iconId` (344/344); `identifier` (344/344); `maxInitialLevel` (344/344); `maxLevel` (344/344); `type` (344/344) | `allowedWeaponType`, `filter`, `stat` |
| `legacies/legacy/allowedWeaponType` | 19 | `type` (19/19) | — |
| `legacies/legacy/filter` | 487 | `characterClass` (485/487); `slot` (486/487) | — |
| `legacies/legacy/stat` | 408 | `constant` (6/408); `descriptionOverride` (13/408); `name` (408/408); `operator` (1/408); `scaling` (402/408) | — |

## legendaryAttributes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `legendaryData` | 1 | — | `socketsSetup` |
| `legendaryData/socketsSetup` | 219 | `itemId` (219/219) | `socketSetup` |
| `legendaryData/socketsSetup/socketSetup` | 2365 | `type` (2365/2365); `unlockLevel` (2365/2365) | — |

## legendarySystem.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `legendary` | 1 | `maxMainLegacyRank` (1/1); `maxUiRank` (1/1) | `quality` |
| `legendary/quality` | 3 | `id` (3/3) | `points`, `startProgression`, `xp` |
| `legendary/quality/points` | 12 | `slot` (12/12) | `points` |
| `legendary/quality/points/points` | 840 | `level` (840/840); `value` (840/840) | — |
| `legendary/quality/startProgression` | 453 | `itemLevel` (453/453); `startLevel` (453/453) | — |
| `legendary/quality/xp` | 210 | `level` (210/210); `value` (210/210) | — |

## legendarySystem2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `legendary2` | 1 | `characterLevel2ItemLevelProgressionID` (1/1) | — |

## legendary_titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `titles` | 1 | — | `title` |
| `titles/title` | 421 | `category` (421/421); `damageType` (421/421); `id` (421/421); `name` (421/421); `slayer` (166/421); `tier` (421/421) | `stats` |
| `titles/title/stats` | 356 | — | `stat` |
| `titles/title/stats/stat` | 553 | `name` (553/553); `value` (553/553) | — |

## loots.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `loots` | 1 | — | `filteredTrophyTable`, `itemsTable`, `relicsList`, `relicsTreasureGroup`, `treasureList`, `trophyList`, `weightedTreasureTable` |
| `loots/filteredTrophyTable` | 807 | `id` (807/807) | `filteredTrophyTableEntry` |
| `loots/filteredTrophyTable/filteredTrophyTableEntry` | 9832 | `maxLevel` (5892/9832); `minLevel` (5892/9832); `requiredClass` (9175/9832); `requiredDifficulty` (104/9832); `requiredLevelCap` (108/9832); `requiredRace` (8/9832); `requiredWorldEvent` (116/9832); `trophyListId` (8809/9832); `weightedTreasureTableId` (1023/9832) | — |
| `loots/itemsTable` | 5094 | `id` (5094/5094) | `itemsTableEntry` |
| `loots/itemsTable/itemsTableEntry` | 91695 | `itemId` (91695/91695); `name` (91695/91695); `quantity` (3122/91695); `weight` (91695/91695) | — |
| `loots/relicsList` | 115 | `id` (115/115) | `relicsListEntry` |
| `loots/relicsList/relicsListEntry` | 523 | `dropFrequency` (523/523); `relicId` (469/523); `relicsTreasureGroupId` (54/523) | — |
| `loots/relicsTreasureGroup` | 14 | `id` (14/14) | `pull`, `relicsTreasureGroupEntry` |
| `loots/relicsTreasureGroup/pull` | 38 | `count` (38/38); `weight` (38/38) | — |
| `loots/relicsTreasureGroup/relicsTreasureGroupEntry` | 250 | `relicId` (250/250); `weight` (250/250) | — |
| `loots/treasureList` | 779 | `id` (779/779) | `treasureListEntry` |
| `loots/treasureList/treasureListEntry` | 1669 | `treasureGroupProfileId` (1669/1669); `weight` (1669/1669) | — |
| `loots/trophyList` | 14268 | `description` (26/14268); `id` (14268/14268); `imageId` (26/14268) | `trophyListEntry` |
| `loots/trophyList/trophyListEntry` | 75681 | `dropFrequency` (75681/75681); `groupDrop` (243/75681); `itemId` (54853/75681); `name` (54853/75681); `quantity` (2671/75681); `treasureGroupProfileId` (20828/75681) | — |
| `loots/weightedTreasureTable` | 739 | `id` (739/739) | `weightedTreasureTableEntry` |
| `loots/weightedTreasureTable/weightedTreasureTableEntry` | 2992 | `trophyListId` (2992/2992); `weight` (2992/2992) | — |

## meldingRecipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `meldingRecipes` | 1 | — | `recipe` |
| `meldingRecipes/recipe` | 506 | `category` (506/506); `cost` (506/506); `iconOverride` (12/506); `id` (506/506); `nameOverride` (12/506); `tooltipOverride` (12/506) | `input`, `output` |
| `meldingRecipes/recipe/input` | 463 | `count` (39/463); `name` (324/463); `relicId` (324/463); `tier` (139/463) | — |
| `meldingRecipes/recipe/output` | 602 | `itemId` (259/602); `name` (602/602); `relicId` (343/602) | — |

## mobLoots.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `genericMobLoot` | 1 | — | `species` |
| `genericMobLoot/species` | 73 | `code` (73/73); `name` (73/73) | `subSpecies` |
| `genericMobLoot/species/subSpecies` | 76 | `code` (3/76); `name` (3/76) | `mobType` |
| `genericMobLoot/species/subSpecies/mobType` | 135 | `code` (59/135); `name` (59/135) | `lootEntry` |
| `genericMobLoot/species/subSpecies/mobType/lootEntry` | 21600 | `level` (21600/21600); `treasureListId` (9600/21600); `trophyListId` (21517/21600) | — |

## mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `mobs` | 1 | — | `mob` |
| `mobs/mob` | 20835 | `alignment` (20835/20835); `barterTrophyListId` (323/20835); `class` (20835/20835); `classFilter` (20835/20835); `division` (20835/20835); `generatesTrophy` (156/20835); `genus` (20835/20835); `id` (20835/20835); `name` (20835/20835); `remoteLootable` (196/20835); `reputationTrophyListId` (1088/20835); `species` (20835/20835); `subSpecies` (4314/20835); `treasureListId` (42/20835); `trophyListId` (2347/20835) | `actionTable`, `initEffect`, `startupEffect` |
| `mobs/mob/actionTable` | 52838 | `id` (52838/52838); `maxLevel` (123/52838); `minLevel` (8257/52838) | — |
| `mobs/mob/initEffect` | 897 | `id` (897/897); `name` (897/897); `spellcraft` (1/897) | — |
| `mobs/mob/startupEffect` | 11080 | `id` (11080/11080); `name` (11080/11080); `spellcraft` (349/11080) | — |

## monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `classes` | 1 | — | `monsterClass` |
| `classes/monsterClass` | 7 | `abbreviation` (7/7); `code` (7/7); `description` (7/7); `iconId` (7/7); `id` (7/7); `key` (7/7); `name` (7/7); `tag` (7/7) | `classSkill`, `classTrait`, `classVirtue` |
| `classes/monsterClass/classSkill` | 223 | `minLevel` (223/223); `skillId` (223/223); `skillName` (223/223) | — |
| `classes/monsterClass/classTrait` | 687 | `minLevel` (687/687); `traitId` (687/687); `traitName` (687/687) | — |
| `classes/monsterClass/classVirtue` | 84 | `id` (84/84); `maxRank` (84/84); `name` (84/84); `startRank` (84/84) | — |

## mood.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `moods` | 1 | — | `mood` |
| `moods/mood` | 31 | `level` (31/31); `moraleModifier` (31/31) | — |

## nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `nationalities` | 1 | — | `nationality` |
| `nationalities/nationality` | 29 | `code` (29/29); `description` (29/29); `femaleGuideline` (23/29); `iconID` (29/29); `maleGuideline` (29/29); `name` (29/29); `titleID` (28/29) | `alias` |
| `nationalities/nationality/alias` | 5 | `name` (5/5) | — |

## non_imbued_legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `legacies` | 1 | — | `defaultNonImbuedLegacy`, `tieredNonImbuedLegacy` |
| `legacies/defaultNonImbuedLegacy` | 631 | `effectId` (631/631); `iconId` (631/631); `imbuedLegacyId` (631/631); `type` (631/631) | `filter`, `stat` |
| `legacies/defaultNonImbuedLegacy/filter` | 1225 | `characterClass` (1224/1225); `slot` (1225/1225) | — |
| `legacies/defaultNonImbuedLegacy/stat` | 631 | `descriptionOverride` (3/631); `name` (631/631); `scaling` (631/631) | — |
| `legacies/tieredNonImbuedLegacy` | 398 | `imbuedLegacyId` (328/398); `major` (178/398); `stat` (398/398); `type` (398/398) | `filter`, `legacyTier` |
| `legacies/tieredNonImbuedLegacy/filter` | 873 | `characterClass` (873/873); `slot` (873/873) | — |
| `legacies/tieredNonImbuedLegacy/legacyTier` | 2388 | `effectId` (2388/2388); `startRank` (2058/2388); `tier` (2388/2388) | `stat` |
| `legacies/tieredNonImbuedLegacy/legacyTier/stat` | 2388 | `descriptionOverride` (30/2388); `name` (2388/2388); `scaling` (2388/2388) | — |

## paperItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `paperItems` | 1 | — | `paperItem` |
| `paperItems/paperItem` | 615 | `cap` (51/615); `category` (615/615); `free` (167/615); `iconId` (582/615); `identifier` (615/615); `itemClass` (615/615); `name` (615/615); `old` (84/615); `shared` (190/615) | — |

## parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `parchmentMaps` | 1 | — | `parchmentMap` |
| `parchmentMaps/parchmentMap` | 232 | `id` (232/232); `name` (232/232); `parentMapId` (231/232); `questGuideDisabled` (7/232); `region` (232/232) | `area` |
| `parchmentMaps/parchmentMap/area` | 548 | `id` (548/548); `name` (548/548) | — |

## passives.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `passives` | 1 | — | `passive` |
| `passives/passive` | 109 | `id` (109/109) | `stat` |
| `passives/passive/stat` | 109 | `name` (109/109); `scaling` (109/109) | — |

## passivesUsage.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `passivesUsage` | 1 | — | `passivesGroup` |
| `passivesUsage/passivesGroup` | 33 | — | `item`, `passive` |
| `passivesUsage/passivesGroup/item` | 1474 | `id` (1474/1474) | — |
| `passivesUsage/passivesGroup/passive` | 151 | `id` (151/151) | — |

## perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `perks` | 1 | — | `perk` |
| `perks/perk` | 45 | `description` (45/45); `effectId` (45/45); `iconId` (45/45); `identifier` (45/45); `minLevel` (45/45); `name` (45/45); `pointsCost` (45/45); `uiCategory` (45/45) | — |

## pips.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `pips` | 1 | — | `pip` |
| `pips/pip` | 25 | `home` (25/25); `homeIconId` (2/25); `max` (25/25); `maxIconId` (2/25); `min` (25/25); `minIconId` (2/25); `name` (25/25); `type` (25/25) | — |

## portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `portraitFrames` | 1 | — | `portraitFrame` |
| `portraitFrames/portraitFrame` | 113 | `code` (113/113); `icon` (113/113); `id` (113/113); `isForCreeps` (40/113); `isForFreeps` (28/113); `name` (113/113) | — |

## privateEncounters.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `privateEncounters` | 1 | — | `privateEncounter`, `skirmishPrivateEncounter` |
| `privateEncounters/privateEncounter` | 989 | `contentLayerId` (989/989); `description` (985/989); `id` (989/989); `maxPlayers` (951/989); `name` (989/989); `questId` (834/989); `randomQuestsCount` (4/989) | `contentLayer`, `instanceMap`, `questToBestow`, `randomQuest` |
| `privateEncounters/privateEncounter/contentLayer` | 2 | `contentLayerId` (2/2) | — |
| `privateEncounters/privateEncounter/instanceMap` | 1241 | — | `map`, `zone` |
| `privateEncounters/privateEncounter/instanceMap/map` | 1241 | `mapId` (1204/1241); `maxLat` (739/1241); `maxLon` (739/1241); `minLat` (739/1241); `minLon` (739/1241); `region` (739/1241) | — |
| `privateEncounters/privateEncounter/instanceMap/zone` | 1266 | `zoneId` (1266/1266) | — |
| `privateEncounters/privateEncounter/questToBestow` | 69 | `questId` (69/69); `questName` (69/69) | — |
| `privateEncounters/privateEncounter/randomQuest` | 20 | `questId` (20/20); `questName` (20/20) | — |
| `privateEncounters/skirmishPrivateEncounter` | 583 | `category` (583/583); `contentLayerId` (583/583); `description` (583/583); `id` (583/583); `levelScaling` (14/583); `maxLevel` (583/583); `maxPlayers` (582/583); `minLevel` (583/583); `name` (583/583); `questId` (439/583); `randomQuestsCount` (15/583); `type` (169/583) | `contentLayer`, `difficultyTier`, `groupSize`, `instanceMap`, `questToBestow`, `randomQuest` |
| `privateEncounters/skirmishPrivateEncounter/contentLayer` | 4 | `contentLayerId` (4/4) | — |
| `privateEncounters/skirmishPrivateEncounter/difficultyTier` | 842 | `code` (842/842); `name` (842/842) | — |
| `privateEncounters/skirmishPrivateEncounter/groupSize` | 1167 | `key` (1167/1167) | — |
| `privateEncounters/skirmishPrivateEncounter/instanceMap` | 714 | — | `map`, `zone` |
| `privateEncounters/skirmishPrivateEncounter/instanceMap/map` | 714 | `mapId` (682/714); `maxLat` (405/714); `maxLon` (405/714); `minLat` (405/714); `minLon` (405/714); `region` (405/714) | — |
| `privateEncounters/skirmishPrivateEncounter/instanceMap/zone` | 736 | `zoneId` (736/736) | — |
| `privateEncounters/skirmishPrivateEncounter/questToBestow` | 558 | `questId` (558/558); `questName` (558/558) | — |
| `privateEncounters/skirmishPrivateEncounter/randomQuest` | 53 | `questId` (53/53); `questName` (53/53) | — |

## progressions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `progressions` | 1 | — | `arrayProgression`, `linearInterpolationProgression` |
| `progressions/arrayProgression` | 4697 | `identifier` (4697/4697); `minX` (1/4697); `nbPoints` (4697/4697); `type` (279/4697) | `point` |
| `progressions/arrayProgression/point` | 118862 | `count` (9210/118862); `y` (118862/118862) | — |
| `progressions/linearInterpolationProgression` | 1590 | `identifier` (1590/1590); `nbPoints` (1590/1590) | `point` |
| `progressions/linearInterpolationProgression/point` | 28311 | `x` (28311/28311); `y` (28311/28311) | — |

## pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `pvp` | 1 | — | `scale` |
| `pvp/scale` | 3 | `key` (3/3) | `entry` |
| `pvp/scale/entry` | 43 | `code` (43/43); `label` (43/43); `min` (43/43) | — |

## quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `quests` | 1 | — | `quest` |
| `quests/quest` | 15489 | `autoBestowed` (1574/15489); `category` (15489/15489); `description` (15154/15489); `hidden` (421/15489); `id` (15489/15489); `instanced` (1277/15489); `level` (15489/15489); `lockType` (2129/15489); `maxLevel` (53/15489); `minLevel` (3452/15489); `monsterPlay` (247/15489); `name` (15489/15489); `questArc` (1580/15489); `rawName` (15489/15489); `repeatable` (4434/15489); `requiredClass` (265/15489); `requiredFaction` (383/15489); `requiredProfession` (149/15489); `requiredRace` (142/15489); `scope` (3119/15489); `sessionPlay` (78/15489); `shareable` (7213/15489); `size` (1463/15489); `webStoreItemID` (5566/15489) | `bestower`, `completionComment`, `compoundPrerequisite`, `compoundWorldEventCondition`, `endDialog`, `loot`, `map`, `nextQuest`, `objectives`, `prerequisite`, `rewards`, `worldEventCondition` |
| `quests/quest/bestower` | 14948 | `npcId` (13380/14948); `npcName` (13380/14948); `text` (14948/14948) | — |
| `quests/quest/completionComment` | 973 | — | `npc`, `text` |
| `quests/quest/completionComment/npc` | 997 | `npcId` (997/997); `npcName` (997/997) | — |
| `quests/quest/completionComment/text` | 1718 | `text` (1718/1718) | — |
| `quests/quest/compoundPrerequisite` | 1497 | `operator` (159/1497) | `compoundPrerequisite`, `prerequisite` |
| `quests/quest/compoundPrerequisite/compoundPrerequisite` | 39 | `operator` (39/39) | `prerequisite` |
| `quests/quest/compoundPrerequisite/compoundPrerequisite/prerequisite` | 113 | `id` (113/113); `name` (113/113); `status` (46/113) | — |
| `quests/quest/compoundPrerequisite/prerequisite` | 5461 | `id` (5461/5461); `name` (5461/5461); `operator` (2993/5461); `status` (2726/5461) | — |
| `quests/quest/compoundWorldEventCondition` | 1195 | `operator` (1195/1195) | `compoundWorldEventCondition`, `worldEventCondition` |
| `quests/quest/compoundWorldEventCondition/compoundWorldEventCondition` | 49 | `operator` (49/49) | `worldEventCondition` |
| `quests/quest/compoundWorldEventCondition/compoundWorldEventCondition/worldEventCondition` | 99 | `operator` (99/99); `value` (99/99); `worldEventID` (99/99); `worldEventName` (99/99) | — |
| `quests/quest/compoundWorldEventCondition/worldEventCondition` | 2708 | `compareToWorldEventID` (85/2708); `compareToWorldEventName` (85/2708); `operator` (2708/2708); `value` (2623/2708); `worldEventID` (2708/2708); `worldEventName` (2708/2708) | — |
| `quests/quest/endDialog` | 998 | `npcId` (579/998); `npcName` (579/998); `text` (998/998) | — |
| `quests/quest/loot` | 1726 | `id` (1726/1726); `name` (1726/1726); `probabilities` (1726/1726) | `excludedMobSpec`, `mob`, `mobSpec` |
| `quests/quest/loot/excludedMobSpec` | 20 | `class` (1/20); `landmarkId` (1/20); `landmarkName` (1/20); `mobDivision` (14/20); `species` (9/20); `subSpecies` (7/20) | — |
| `quests/quest/loot/mob` | 926 | `id` (926/926); `name` (926/926) | — |
| `quests/quest/loot/mobSpec` | 1136 | `alignment` (2/1136); `class` (21/1136); `genus` (36/1136); `landId` (65/1136); `landName` (65/1136); `landmarkId` (151/1136); `landmarkName` (151/1136); `mobDivision` (964/1136); `species` (918/1136); `subSpecies` (65/1136) | — |
| `quests/quest/map` | 23199 | `mapId` (22566/23199); `maxLat` (633/23199); `maxLon` (633/23199); `minLat` (633/23199); `minLon` (633/23199); `region` (16046/23199) | — |
| `quests/quest/nextQuest` | 3419 | `id` (3419/3419); `name` (3419/3419) | — |
| `quests/quest/objectives` | 15489 | — | `failureConditions`, `objective` |
| `quests/quest/objectives/failureConditions` | 1452 | — | `condition`, `enterDetection`, `hobby`, `itemUsed`, `monsterDied`, `questComplete`, `skillUsed`, `timeExpired` |
| `quests/quest/objectives/failureConditions/condition` | 1072 | `count` (6/1072); `progressOverride` (178/1072); `showBillboardText` (861/1072); `showProgressText` (878/1072); `type` (1072/1072) | — |
| `quests/quest/objectives/failureConditions/enterDetection` | 117 | `count` (2/117); `npcId` (1/117); `npcName` (1/117); `progressOverride` (19/117); `showBillboardText` (71/117); `showProgressText` (98/117) | — |
| `quests/quest/objectives/failureConditions/hobby` | 1 | `itemId` (1/1); `itemName` (1/1); `progressOverride` (1/1) | — |
| `quests/quest/objectives/failureConditions/itemUsed` | 1 | `count` (1/1); `itemId` (1/1); `itemName` (1/1); `progressOverride` (1/1); `showBillboardText` (1/1) | — |
| `quests/quest/objectives/failureConditions/monsterDied` | 232 | `count` (10/232); `mobId` (229/232); `mobName` (229/232); `progressOverride` (137/232); `showBillboardText` (48/232); `showProgressText` (97/232) | `monsterSelection` |
| `quests/quest/objectives/failureConditions/monsterDied/monsterSelection` | 3 | `landmarkId` (1/3); `landmarkName` (1/3); `mobDivision` (2/3); `species` (3/3); `subSpecies` (2/3) | — |
| `quests/quest/objectives/failureConditions/questComplete` | 291 | `achievableId` (291/291); `progressOverride` (121/291); `showBillboardText` (271/291); `showProgressText` (179/291) | — |
| `quests/quest/objectives/failureConditions/skillUsed` | 3 | `progressOverride` (2/3); `showBillboardText` (1/3); `showProgressText` (1/3); `skillId` (2/3); `skillName` (2/3) | — |
| `quests/quest/objectives/failureConditions/timeExpired` | 126 | `progressOverride` (65/126); `showBillboardText` (15/126); `showProgressText` (87/126) | — |
| `quests/quest/objectives/objective` | 44035 | `billboardOverride` (650/44035); `completionsCount` (109/44035); `index` (44035/44035); `progressOverride` (2052/44035); `text` (43668/44035) | `compoundEvent`, `condition`, `detecting`, `dialog`, `emote`, `enterDetection`, `externalInventoryItem`, `factionLevel`, `failureConditions`, `hobby`, `inventoryItem`, `itemTalk`, `itemUsed`, `landmarkDetection`, `level`, `monsterDied`, `npcTalk`, `npcUsed`, `questBestowed`, `questComplete`, `skillUsed`, `timeExpired` |
| `quests/quest/objectives/objective/compoundEvent` | 6166 | `progressOverride` (3190/6166) | `detecting`, `emote`, `externalInventoryItem`, `inventoryItem`, `itemTalk`, `itemUsed`, `monsterDied`, `npcTalk`, `npcUsed` |
| `quests/quest/objectives/objective/compoundEvent/detecting` | 787 | `eventID` (148/787); `mobId` (10/787); `mobName` (10/787); `npcId` (30/787); `npcName` (30/787); `progressOverride` (262/787); `showBillboardText` (283/787); `showProgressText` (494/787) | `point` |
| `quests/quest/objectives/objective/compoundEvent/detecting/point` | 1311 | `did` (73/1311); `key` (1238/1311); `latitude` (1311/1311); `longitude` (1311/1311); `mapIndex` (285/1311) | — |
| `quests/quest/objectives/objective/compoundEvent/emote` | 499 | `command` (499/499); `count` (7/499); `emoteId` (499/499); `eventID` (122/499); `mobId` (16/499); `mobName` (16/499); `npcId` (63/499); `npcName` (63/499); `progressOverride` (171/499); `showBillboardText` (142/499); `showProgressText` (301/499) | `point` |
| `quests/quest/objectives/objective/compoundEvent/emote/point` | 189 | `did` (189/189); `latitude` (189/189); `longitude` (189/189); `mapIndex` (12/189) | — |
| `quests/quest/objectives/objective/compoundEvent/externalInventoryItem` | 316 | `count` (187/316); `eventID` (13/316); `itemId` (316/316); `itemName` (316/316); `progressOverride` (80/316); `showBillboardText` (212/316); `showProgressText` (180/316) | `point` |
| `quests/quest/objectives/objective/compoundEvent/externalInventoryItem/point` | 2322 | `did` (2322/2322); `key` (2240/2322); `latitude` (2322/2322); `longitude` (2322/2322); `mapIndex` (287/2322) | — |
| `quests/quest/objectives/objective/compoundEvent/inventoryItem` | 6177 | `count` (2913/6177); `eventID` (783/6177); `itemId` (6177/6177); `itemName` (6177/6177); `progressOverride` (1454/6177); `showBillboardText` (4768/6177); `showProgressText` (3805/6177) | — |
| `quests/quest/objectives/objective/compoundEvent/itemTalk` | 4 | `itemId` (4/4); `itemName` (4/4); `progressOverride` (1/4); `showBillboardText` (3/4); `showProgressText` (1/4) | `point` |
| `quests/quest/objectives/objective/compoundEvent/itemTalk/point` | 3 | `did` (3/3); `latitude` (3/3); `longitude` (3/3); `mapIndex` (1/3) | — |
| `quests/quest/objectives/objective/compoundEvent/itemUsed` | 702 | `count` (120/702); `eventID` (122/702); `itemId` (689/702); `itemName` (689/702); `progressOverride` (204/702); `showBillboardText` (195/702); `showProgressText` (416/702) | `point` |
| `quests/quest/objectives/objective/compoundEvent/itemUsed/point` | 1678 | `did` (1655/1678); `key` (932/1678); `latitude` (1678/1678); `longitude` (1678/1678); `mapIndex` (414/1678) | — |
| `quests/quest/objectives/objective/compoundEvent/monsterDied` | 17 | `count` (10/17); `eventID` (7/17); `mobId` (13/17); `mobName` (13/17); `progressOverride` (7/17); `showBillboardText` (5/17); `showProgressText` (10/17) | `monsterSelection` |
| `quests/quest/objectives/objective/compoundEvent/monsterDied/monsterSelection` | 4 | `landId` (1/4); `landName` (1/4); `mobDivision` (4/4); `species` (3/4); `subSpecies` (1/4) | — |
| `quests/quest/objectives/objective/compoundEvent/npcTalk` | 4724 | `eventID` (452/4724); `npcId` (4599/4724); `npcName` (4599/4724); `progressOverride` (1583/4724); `showBillboardText` (3850/4724); `showProgressText` (2441/4724) | `point` |
| `quests/quest/objectives/objective/compoundEvent/npcTalk/point` | 6985 | `did` (6799/6985); `key` (186/6985); `latitude` (6985/6985); `longitude` (6985/6985); `mapIndex` (3767/6985) | — |
| `quests/quest/objectives/objective/compoundEvent/npcUsed` | 220 | `count` (2/220); `eventID` (67/220); `npcId` (163/220); `npcName` (163/220); `progressOverride` (4/220); `showBillboardText` (202/220); `showProgressText` (212/220) | `point` |
| `quests/quest/objectives/objective/compoundEvent/npcUsed/point` | 284 | `did` (210/284); `key` (74/284); `latitude` (284/284); `longitude` (284/284); `mapIndex` (70/284) | — |
| `quests/quest/objectives/objective/condition` | 4776 | `count` (143/4776); `eventID` (843/4776); `progressOverride` (4385/4776); `showBillboardText` (2113/4776); `showProgressText` (386/4776); `type` (4776/4776) | `point` |
| `quests/quest/objectives/objective/condition/point` | 3548 | `did` (1927/3548); `key` (1625/3548); `latitude` (3548/3548); `longitude` (3548/3548); `mapIndex` (403/3548) | — |
| `quests/quest/objectives/objective/detecting` | 1 | `progressOverride` (1/1) | `point` |
| `quests/quest/objectives/objective/detecting/point` | 6 | `key` (6/6); `latitude` (6/6); `longitude` (6/6); `mapIndex` (3/6) | — |
| `quests/quest/objectives/objective/dialog` | 36400 | `npcId` (31877/36400); `npcName` (31877/36400); `text` (36400/36400) | — |
| `quests/quest/objectives/objective/emote` | 616 | `command` (616/616); `count` (19/616); `emoteId` (616/616); `eventID` (133/616); `mobId` (56/616); `mobName` (56/616); `npcId` (425/616); `npcName` (425/616); `progressOverride` (425/616); `showBillboardText` (228/616); `showProgressText` (159/616) | `point` |
| `quests/quest/objectives/objective/emote/point` | 2373 | `did` (2373/2373); `latitude` (2373/2373); `longitude` (2373/2373); `mapIndex` (1541/2373) | — |
| `quests/quest/objectives/objective/enterDetection` | 5544 | `count` (17/5544); `eventID` (1584/5544); `mobId` (9/5544); `mobName` (9/5544); `npcId` (58/5544); `npcName` (58/5544); `progressOverride` (4803/5544); `showBillboardText` (1571/5544); `showProgressText` (701/5544) | `point` |
| `quests/quest/objectives/objective/enterDetection/point` | 16794 | `did` (120/16794); `key` (16674/16794); `latitude` (16794/16794); `longitude` (16794/16794); `mapIndex` (11824/16794) | — |
| `quests/quest/objectives/objective/externalInventoryItem` | 2241 | `count` (1167/2241); `eventID` (690/2241); `itemId` (2241/2241); `itemName` (2241/2241); `progressOverride` (2091/2241); `showBillboardText` (452/2241); `showProgressText` (138/2241) | `point` |
| `quests/quest/objectives/objective/externalInventoryItem/point` | 15619 | `did` (15615/15619); `key` (14346/15619); `latitude` (15619/15619); `longitude` (15619/15619); `mapIndex` (2712/15619) | — |
| `quests/quest/objectives/objective/factionLevel` | 36 | `eventID` (5/36); `factionId` (36/36); `factionName` (36/36); `progressOverride` (35/36); `showBillboardText` (36/36); `showProgressText` (1/36); `tier` (36/36) | — |
| `quests/quest/objectives/objective/failureConditions` | 1001 | — | `condition`, `enterDetection`, `hobby`, `itemUsed`, `monsterDied`, `npcUsed`, `skillUsed`, `timeExpired` |
| `quests/quest/objectives/objective/failureConditions/condition` | 626 | `progressOverride` (300/626); `showBillboardText` (91/626); `showProgressText` (303/626); `type` (626/626) | — |
| `quests/quest/objectives/objective/failureConditions/enterDetection` | 108 | `count` (2/108); `mobId` (8/108); `mobName` (8/108); `progressOverride` (65/108); `showBillboardText` (11/108); `showProgressText` (36/108) | — |
| `quests/quest/objectives/objective/failureConditions/hobby` | 1 | `count` (1/1); `itemId` (1/1); `itemName` (1/1); `progressOverride` (1/1); `showBillboardText` (1/1) | — |
| `quests/quest/objectives/objective/failureConditions/itemUsed` | 121 | `count` (1/121); `itemId` (121/121); `itemName` (121/121); `showBillboardText` (21/121); `showProgressText` (109/121) | — |
| `quests/quest/objectives/objective/failureConditions/monsterDied` | 168 | `count` (11/168); `mobId` (166/168); `mobName` (166/168); `progressOverride` (120/168); `showBillboardText` (17/168); `showProgressText` (46/168) | `monsterSelection` |
| `quests/quest/objectives/objective/failureConditions/monsterDied/monsterSelection` | 3 | `mobDivision` (1/3); `species` (3/3) | — |
| `quests/quest/objectives/objective/failureConditions/npcUsed` | 16 | `count` (16/16); `progressOverride` (16/16) | — |
| `quests/quest/objectives/objective/failureConditions/skillUsed` | 1 | `progressOverride` (1/1); `skillId` (1/1); `skillName` (1/1) | — |
| `quests/quest/objectives/objective/failureConditions/timeExpired` | 221 | `duration` (220/221); `progressOverride` (106/221); `showBillboardText` (87/221); `showProgressText` (79/221) | — |
| `quests/quest/objectives/objective/hobby` | 32 | `count` (19/32); `eventID` (6/32); `itemId` (32/32); `itemName` (32/32); `progressOverride` (29/32); `showBillboardText` (5/32); `showProgressText` (3/32) | — |
| `quests/quest/objectives/objective/inventoryItem` | 1457 | `count` (930/1457); `eventID` (210/1457); `itemId` (1457/1457); `itemName` (1457/1457); `progressOverride` (1324/1457); `showBillboardText` (86/1457); `showProgressText` (101/1457) | — |
| `quests/quest/objectives/objective/itemTalk` | 202 | `eventID` (21/202); `itemId` (202/202); `itemName` (202/202); `progressOverride` (90/202); `showBillboardText` (108/202); `showProgressText` (63/202) | `point` |
| `quests/quest/objectives/objective/itemTalk/point` | 416 | `did` (416/416); `key` (3/416); `latitude` (416/416); `longitude` (416/416); `mapIndex` (227/416) | — |
| `quests/quest/objectives/objective/itemUsed` | 6164 | `count` (1719/6164); `eventID` (1409/6164); `itemId` (5916/6164); `itemName` (5916/6164); `progressOverride` (3617/6164); `showBillboardText` (1771/6164); `showProgressText` (2199/6164) | `point` |
| `quests/quest/objectives/objective/itemUsed/point` | 38122 | `did` (37251/38122); `key` (18825/38122); `latitude` (38122/38122); `longitude` (38122/38122); `mapIndex` (14383/38122) | — |
| `quests/quest/objectives/objective/landmarkDetection` | 766 | `eventID` (228/766); `landmarkId` (747/766); `landmarkName` (747/766); `progressOverride` (734/766); `showBillboardText` (324/766); `showProgressText` (31/766) | `point` |
| `quests/quest/objectives/objective/landmarkDetection/point` | 2849 | `did` (2849/2849); `latitude` (2849/2849); `longitude` (2849/2849); `mapIndex` (508/2849) | — |
| `quests/quest/objectives/objective/level` | 53 | `eventID` (25/53); `level` (53/53); `progressOverride` (40/53); `showBillboardText` (42/53); `showProgressText` (13/53) | — |
| `quests/quest/objectives/objective/monsterDied` | 4855 | `count` (2869/4855); `eventID` (775/4855); `mobId` (3000/4855); `mobName` (3000/4855); `progressOverride` (4386/4855); `showBillboardText` (372/4855); `showProgressText` (304/4855) | `monsterSelection` |
| `quests/quest/objectives/objective/monsterDied/monsterSelection` | 2325 | `alignment` (1/2325); `class` (41/2325); `genus` (104/2325); `landId` (144/2325); `landName` (144/2325); `landmarkId` (525/2325); `landmarkName` (525/2325); `mobDivision` (1810/2325); `species` (1793/2325); `subSpecies` (302/2325) | — |
| `quests/quest/objectives/objective/npcTalk` | 19123 | `count` (6/19123); `eventID` (2912/19123); `npcId` (15976/19123); `npcName` (15976/19123); `progressOverride` (16564/19123); `showBillboardText` (14563/19123); `showProgressText` (966/19123) | `point` |
| `quests/quest/objectives/objective/npcTalk/point` | 22137 | `did` (17770/22137); `key` (4367/22137); `latitude` (22137/22137); `longitude` (22137/22137); `mapIndex` (6450/22137) | — |
| `quests/quest/objectives/objective/npcUsed` | 1511 | `count` (135/1511); `eventID` (376/1511); `npcId` (806/1511); `npcName` (806/1511); `progressOverride` (502/1511); `showBillboardText` (944/1511); `showProgressText` (988/1511) | `point` |
| `quests/quest/objectives/objective/npcUsed/point` | 5204 | `did` (2115/5204); `key` (3089/5204); `latitude` (5204/5204); `longitude` (5204/5204); `mapIndex` (2075/5204) | — |
| `quests/quest/objectives/objective/questBestowed` | 143 | `achievableId` (143/143); `eventID` (126/143); `progressOverride` (29/143); `showBillboardText` (67/143); `showProgressText` (90/143) | — |
| `quests/quest/objectives/objective/questComplete` | 3703 | `achievableId` (3515/3703); `count` (351/3703); `eventID` (514/3703); `progressOverride` (2820/3703); `questCategory` (177/3703); `questScope` (324/3703); `showBillboardText` (2932/3703); `showProgressText` (824/3703) | — |
| `quests/quest/objectives/objective/skillUsed` | 121 | `count` (24/121); `eventID` (39/121); `progressOverride` (113/121); `showBillboardText` (7/121); `showProgressText` (8/121); `skillId` (75/121); `skillName` (75/121) | — |
| `quests/quest/objectives/objective/timeExpired` | 268 | `duration` (268/268); `eventID` (45/268); `progressOverride` (250/268); `showBillboardText` (73/268); `showProgressText` (18/268) | — |
| `quests/quest/prerequisite` | 7493 | `id` (7493/7493); `name` (7493/7493); `operator` (1232/7493); `status` (2092/7493) | — |
| `quests/quest/rewards` | 15489 | — | `XP`, `billingToken`, `craftingXp`, `emote`, `glory`, `itemXP`, `lotroPoints`, `money`, `mountXP`, `object`, `questComplete`, `reputationItem`, `selectOneOf`, `title`, `trait`, `virtue`, `virtueXP` |
| `quests/quest/rewards/XP` | 12337 | `quantity` (12337/12337) | — |
| `quests/quest/rewards/billingToken` | 1 | `id` (1/1); `name` (1/1) | — |
| `quests/quest/rewards/craftingXp` | 15 | `XP` (15/15); `profession` (15/15); `tier` (15/15) | — |
| `quests/quest/rewards/emote` | 1 | `id` (1/1); `name` (1/1) | — |
| `quests/quest/rewards/glory` | 335 | `quantity` (335/335) | — |
| `quests/quest/rewards/itemXP` | 9806 | `quantity` (9806/9806) | — |
| `quests/quest/rewards/lotroPoints` | 16 | `quantity` (16/16) | — |
| `quests/quest/rewards/money` | 11444 | `copper` (11444/11444); `gold` (11444/11444); `silver` (11444/11444) | — |
| `quests/quest/rewards/mountXP` | 3064 | `quantity` (3064/3064) | — |
| `quests/quest/rewards/object` | 13665 | `id` (13665/13665); `name` (13665/13665); `quantity` (8335/13665) | — |
| `quests/quest/rewards/questComplete` | 1358 | `id` (1358/1358); `name` (1358/1358) | — |
| `quests/quest/rewards/reputationItem` | 8632 | `amount` (8632/8632); `faction` (8632/8632); `factionId` (8632/8632) | — |
| `quests/quest/rewards/selectOneOf` | 1802 | — | `emote`, `object`, `title` |
| `quests/quest/rewards/selectOneOf/emote` | 8 | `id` (8/8); `name` (8/8) | — |
| `quests/quest/rewards/selectOneOf/object` | 6061 | `id` (6061/6061); `name` (6061/6061); `quantity` (572/6061) | — |
| `quests/quest/rewards/selectOneOf/title` | 38 | `id` (38/38); `name` (38/38) | — |
| `quests/quest/rewards/title` | 193 | `id` (193/193); `name` (193/193) | — |
| `quests/quest/rewards/trait` | 129 | `id` (129/129); `name` (129/129) | — |
| `quests/quest/rewards/virtue` | 1 | `count` (1/1); `id` (1/1) | — |
| `quests/quest/rewards/virtueXP` | 717 | `quantity` (717/717) | — |
| `quests/quest/worldEventCondition` | 1276 | `compareToWorldEventID` (49/1276); `compareToWorldEventName` (49/1276); `operator` (1276/1276); `value` (1227/1276); `worldEventID` (1276/1276); `worldEventName` (1276/1276) | — |

## races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `races` | 1 | — | `race` |
| `races/race` | 8 | `code` (8/8); `description` (8/8); `id` (8/8); `key` (8/8); `legacyLabel` (8/8); `name` (8/8); `tag` (8/8); `tall` (8/8) | `allowedClass`, `earnableTrait`, `gender`, `nationality`, `raceTrait` |
| `races/race/allowedClass` | 69 | `id` (69/69) | — |
| `races/race/earnableTrait` | 72 | `traitId` (72/72); `traitName` (72/72) | — |
| `races/race/gender` | 15 | `avatarId` (15/15); `iconId` (15/15); `largeIconId` (15/15); `name` (15/15); `smallIconId` (15/15) | — |
| `races/race/nationality` | 28 | `id` (28/28); `name` (28/28) | — |
| `races/race/raceTrait` | 74 | `minLevel` (74/74); `traitId` (74/74); `traitName` (74/74) | — |

## recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `recipes` | 1 | — | `recipe` |
| `recipes/recipe` | 7925 | `category` (7925/7925); `cooldown` (2262/7925); `guild` (2184/7925); `id` (7925/7925); `name` (7925/7925); `profession` (7925/7925); `singleUse` (1342/7925); `tier` (7925/7925); `xp` (7925/7925) | `ingredientPack`, `recipeResult`, `scrollItem` |
| `recipes/recipe/ingredientPack` | 4558 | `count` (3894/4558); `itemId` (4558/4558); `name` (4558/4558) | — |
| `recipes/recipe/recipeResult` | 12835 | `baseCriticalChance` (8493/12835) | `ingredient`, `result` |
| `recipes/recipe/recipeResult/ingredient` | 48847 | `criticalChanceBonus` (15871/48847); `optional` (15871/48847); `quantity` (17937/48847) | `ingredientItem` |
| `recipes/recipe/recipeResult/ingredient/ingredientItem` | 48844 | `icon` (48844/48844); `itemId` (48844/48844); `name` (48844/48844) | — |
| `recipes/recipe/recipeResult/result` | 21328 | `critical` (8493/21328); `itemLevel` (4702/21328); `quantity` (2700/21328) | `resultItem` |
| `recipes/recipe/recipeResult/result/resultItem` | 21328 | `icon` (21310/21328); `itemId` (21328/21328); `name` (21328/21328) | — |
| `recipes/recipe/scrollItem` | 6189 | `icon` (6189/6189); `itemId` (6189/6189); `name` (6189/6189) | — |

## relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `relics` | 1 | — | `category` |
| `relics/category` | 31 | `code` (31/31); `name` (31/31) | `relic` |
| `relics/category/relic` | 706 | `icon` (706/706); `id` (706/706); `minLevel` (423/706); `name` (706/706); `requiredClass` (69/706); `slots` (706/706); `types` (706/706) | `stats` |
| `relics/category/relic/stats` | 706 | — | `stat` |
| `relics/category/relic/stats/stat` | 1773 | `descriptionOverride` (307/1773); `name` (1773/1773); `operator` (20/1773); `value` (1773/1773) | — |

## resources.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `resourcesMaps` | 1 | — | `resourcesMap` |
| `resourcesMaps/resourcesMap` | 57 | `profession` (57/57); `tier` (57/57) | `item`, `map` |
| `resourcesMaps/resourcesMap/item` | 180 | `id` (180/180); `name` (180/180) | — |
| `resourcesMaps/resourcesMap/map` | 844 | `id` (844/844) | — |

## rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `rewardsTracks` | 1 | — | `rewardsTrack` |
| `rewardsTracks/rewardsTrack` | 28 | `activeProperty` (28/28); `claimedMilestonesProperty` (28/28); `currentExperienceProperty` (28/28); `currentMilestoneProperty` (28/28); `description` (28/28); `id` (28/28); `lastExperienceGoalProperty` (28/28); `monsterPlay` (8/28); `name` (28/28); `nextExperienceGoalProperty` (28/28); `progressionID` (28/28) | `step` |
| `rewardsTracks/rewardsTrack/step` | 2567 | `largeIconID` (2567/2567); `uiElementID` (2567/2567); `xpCostMultiplier` (2567/2567) | `reward` |
| `rewardsTracks/rewardsTrack/step/reward` | 2567 | `id` (2567/2567); `name` (2567/2567) | — |

## sets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `sets` | 1 | — | `set` |
| `sets/set` | 2223 | `description` (2223/2223); `id` (2223/2223); `level` (2123/2223); `maxLevel` (2160/2223); `name` (2223/2223); `type` (22/2223); `useAverageItemLevel` (100/2223) | `bonus`, `item` |
| `sets/set/bonus` | 4479 | `nbItems` (4479/4479) | `effect`, `specialEffect`, `stat` |
| `sets/set/bonus/effect` | 1460 | `id` (1460/1460); `name` (1456/1460) | — |
| `sets/set/bonus/specialEffect` | 715 | `label` (715/715) | — |
| `sets/set/bonus/stat` | 3776 | `constant` (1993/3776); `descriptionOverride` (504/3776); `name` (3776/3776); `operator` (221/3776); `scaling` (1747/3776); `value` (36/3776) | — |
| `sets/set/item` | 11159 | `id` (11159/11159); `name` (11159/11159) | — |

## skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `skills` | 1 | — | `mount`, `pet`, `skill`, `travelSkill` |
| `skills/mount` | 693 | `category` (693/693); `description` (311/693); `iconId` (693/693); `identifier` (693/693); `initialName` (693/693); `morale` (693/693); `mountCategory` (693/693); `mountType` (693/693); `name` (693/693); `peerId` (665/693); `sourceDescription` (665/693); `speed` (693/693); `tall` (351/693) | `combos`, `details`, `requiredEffect`, `requiredTrait` |
| `skills/mount/combos` | 4 | `propertyID` (4/4) | `combo` |
| `skills/mount/combos/combo` | 8 | `skillID` (8/8); `skillName` (8/8); `value` (8/8) | — |
| `skills/mount/details` | 693 | `actionDurationContribution` (693/693); `flags` (693/693); `inductionId` (693/693) | `attack`, `effectsMgr` |
| `skills/mount/details/attack` | 693 | `damageContributionMultiplier` (693/693); `implementContributionMultiplier` (693/693) | — |
| `skills/mount/details/effectsMgr` | 721 | `type` (721/721) | `effect` |
| `skills/mount/details/effectsMgr/effect` | 807 | `id` (807/807); `name` (807/807) | — |
| `skills/mount/requiredEffect` | 679 | `id` (679/679); `name` (679/679) | — |
| `skills/mount/requiredTrait` | 673 | `id` (673/673); `name` (673/673) | — |
| `skills/pet` | 620 | `category` (620/620); `description` (620/620); `genus` (620/620); `hidden` (107/620); `iconId` (620/620); `identifier` (620/620); `initialName` (620/620); `name` (620/620); `sourceDescription` (620/620); `species` (620/620); `subSpecies` (620/620) | `details` |
| `skills/pet/details` | 620 | `actionDurationContribution` (620/620); `cooldown` (620/620); `flags` (620/620) | `attack`, `effectsMgr` |
| `skills/pet/details/attack` | 620 | `damageContributionMultiplier` (620/620); `implementContributionMultiplier` (620/620) | — |
| `skills/pet/details/effectsMgr` | 620 | `type` (620/620) | `effect` |
| `skills/pet/details/effectsMgr/effect` | 659 | `id` (659/659); `name` (236/659) | — |
| `skills/skill` | 12019 | `category` (3146/12019); `description` (3323/12019); `iconId` (12019/12019); `identifier` (12019/12019); `name` (12019/12019) | `combos`, `details`, `requiredEffect`, `requiredTrait` |
| `skills/skill/combos` | 505 | `propertyID` (505/505) | `combo` |
| `skills/skill/combos/combo` | 1179 | `skillID` (1179/1179); `skillName` (1179/1179); `value` (1179/1179) | — |
| `skills/skill/details` | 12019 | `actionDurationContribution` (12019/12019); `channelingDuration` (177/12019); `cooldown` (2728/12019); `cooldownMods` (1053/12019); `displayTypes` (1141/12019); `flags` (11305/12019); `inductionId` (2650/12019); `maxTargets` (1000/12019); `maxTargetsMods` (287/12019); `resistCategory` (359/12019) | `attack`, `effectsMgr`, `gambit`, `geometry`, `moraleCost`, `moraleCostPerSecond`, `pip`, `powerCost`, `powerCostPerSecond` |
| `skills/skill/details/attack` | 12513 | `damageContributionMultiplier` (3346/12513); `damageModifier` (1858/12513); `damageModifierMods` (1548/12513); `damageQualifier` (11069/12513); `damageType` (8637/12513); `dpsModProgression` (47/12513); `dpsMods` (16/12513); `flags` (1062/12513); `implementContributionMultiplier` (3346/12513); `maxDamage` (12/12513); `maxDamageMods` (30/12513); `maxDamageProgression` (6574/12513); `maxDamageVariance` (2283/12513) | `effectsMgr` |
| `skills/skill/details/attack/effectsMgr` | 9858 | `modifiers` (1347/9858); `override` (249/9858); `type` (1042/9858) | `effect` |
| `skills/skill/details/attack/effectsMgr/effect` | 10849 | `duration` (33/10849); `id` (10849/10849); `implement` (527/10849); `name` (10679/10849); `spellcraft` (227/10849) | — |
| `skills/skill/details/effectsMgr` | 3648 | `modifiers` (1187/3648); `override` (86/3648); `type` (3648/3648) | `effect` |
| `skills/skill/details/effectsMgr/effect` | 4825 | `duration` (9/4825); `id` (4825/4825); `implement` (145/4825); `name` (4651/4825); `spellcraft` (108/4825) | — |
| `skills/skill/details/gambit` | 142 | `required` (90/142); `toAdd` (50/142); `toRemove` (92/142) | — |
| `skills/skill/details/geometry` | 9606 | `degrees` (1147/9606); `detectionAnchor` (3424/9606); `headingOffset` (57/9606); `length` (146/9606); `maxRange` (6796/9606); `maxRangeMods` (922/9606); `minRange` (206/9606); `positionalHeading` (407/9606); `positionalSpread` (436/9606); `radius` (3081/9606); `shape` (3227/9606); `width` (146/9606) | — |
| `skills/skill/details/moraleCost` | 104 | `mods` (1/104); `percentage` (101/104); `pointsProgression` (2/104) | — |
| `skills/skill/details/moraleCostPerSecond` | 2 | `pointsProgression` (2/2) | — |
| `skills/skill/details/pip` | 710 | `change` (466/710); `changeMods` (212/710); `changePerInterval` (16/710); `requiredMaxValue` (9/710); `requiredMaxValueMods` (4/710); `requiredMinValue` (221/710); `requiredMinValueMods` (131/710); `secondsPerPipChange` (67/710); `towardHome` (710/710); `type` (710/710) | — |
| `skills/skill/details/powerCost` | 4528 | `consumesAll` (132/4528); `mods` (2159/4528); `percentage` (65/4528); `points` (6/4528); `pointsProgression` (4069/4528) | — |
| `skills/skill/details/powerCostPerSecond` | 47 | `mods` (11/47); `points` (14/47); `pointsProgression` (29/47) | — |
| `skills/skill/requiredEffect` | 876 | `id` (876/876); `name` (876/876) | — |
| `skills/skill/requiredTrait` | 114 | `id` (114/114); `name` (114/114) | — |
| `skills/travelSkill` | 289 | `category` (289/289); `description` (289/289); `iconId` (289/289); `identifier` (289/289); `name` (289/289); `travelType` (17/289) | `details`, `requiredTrait` |
| `skills/travelSkill/details` | 289 | `actionDurationContribution` (289/289); `cooldown` (140/289); `cooldownMods` (98/289); `flags` (33/289); `inductionId` (288/289) | `attack`, `effectsMgr`, `powerCost` |
| `skills/travelSkill/details/attack` | 289 | `damageContributionMultiplier` (289/289); `damageModifier` (77/289); `implementContributionMultiplier` (289/289) | `effectsMgr` |
| `skills/travelSkill/details/attack/effectsMgr` | 288 | — | `effect` |
| `skills/travelSkill/details/attack/effectsMgr/effect` | 288 | `id` (288/288); `name` (288/288) | — |
| `skills/travelSkill/details/effectsMgr` | 1 | `type` (1/1) | `effect` |
| `skills/travelSkill/details/effectsMgr/effect` | 1 | `id` (1/1); `name` (1/1) | — |
| `skills/travelSkill/details/powerCost` | 181 | `mods` (181/181); `pointsProgression` (181/181) | — |
| `skills/travelSkill/requiredTrait` | 34 | `id` (34/34); `name` (34/34) | — |

## skirmishTraits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `skirmishTraits` | 1 | — | `trait` |
| `skirmishTraits/trait` | 236 | `identifier` (236/236); `name` (236/236) | — |

## startStats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `startStats` | 1 | — | `stats` |
| `startStats/stats` | 1920 | `class` (1920/1920); `level` (1920/1920) | `stat` |
| `startStats/stats/stat` | 20800 | `name` (20800/20800); `value` (20800/20800) | — |

## statContribs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `derivatedStatsContributions` | 1 | — | `classContribs` |
| `derivatedStatsContributions/classContribs` | 12 | `class` (12/12) | `statContribs` |
| `derivatedStatsContributions/classContribs/statContribs` | 144 | `sourceStat` (144/144) | `statContrib` |
| `derivatedStatsContributions/classContribs/statContribs/statContrib` | 456 | `factor` (456/456); `targetStat` (456/456) | — |

## statTomes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `statTomes` | 1 | — | `stat` |
| `statTomes/stat` | 5 | `id` (5/5) | `tome` |
| `statTomes/stat/tome` | 100 | `rank` (100/100); `traitId` (100/100) | `stats` |
| `statTomes/stat/tome/stats` | 100 | — | `stat` |
| `statTomes/stat/tome/stats/stat` | 100 | `name` (100/100); `value` (100/100) | — |

## stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `stats` | 1 | — | `stat` |
| `stats/stat` | 5302 | `id` (5302/5302); `index` (104/5302); `isPercentage` (2156/5302); `key` (5302/5302); `legacyKey` (106/5302); `legacyName` (41/5302); `maxDigitsAbove1` (10/5302); `maxDigitsBelow1` (2/5302); `name` (5301/5302); `type` (2065/5302) | — |

## tasks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `tasks` | 1 | — | `task` |
| `tasks/task` | 540 | `itemCount` (540/540); `itemId` (540/540); `itemName` (540/540); `name` (540/540); `questId` (540/540) | — |

## titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `titles` | 1 | — | `title` |
| `titles/title` | 3146 | `category` (3146/3146); `description` (3146/3146); `exclusionGroup` (344/3146); `icon` (3146/3146); `id` (3146/3146); `name` (3145/3146); `priority` (344/3146); `rawName` (3146/3146) | — |

## traceries.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `traceries` | 1 | — | `tracery` |
| `traceries/tracery` | 13666 | `itemId` (13666/13666); `maxItemLevel` (13666/13666); `minItemLevel` (13666/13666); `name` (13666/13666); `setId` (516/13666); `type` (13666/13666); `uniquenessChannel` (12538/13666) | — |

## traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `traitTrees` | 1 | — | `traitTree` |
| `traitTrees/traitTree` | 17 | `code` (17/17); `id` (17/17); `key` (17/17) | `traitTreeBranch` |
| `traitTrees/traitTree/traitTreeBranch` | 123 | `code` (123/123); `description` (39/123); `enabled` (4/123); `mainTraitId` (36/123); `name` (123/123) | `cells`, `progression` |
| `traitTrees/traitTree/traitTreeBranch/cells` | 123 | — | `cell` |
| `traitTrees/traitTree/traitTreeBranch/cells/cell` | 1201 | `id` (1201/1201); `traitId` (1201/1201); `traitName` (1201/1201) | `cellDependency` |
| `traitTrees/traitTree/traitTreeBranch/cells/cell/cellDependency` | 511 | `cellId` (511/511); `rank` (511/511) | — |
| `traitTrees/traitTree/traitTreeBranch/progression` | 123 | — | `step` |
| `traitTrees/traitTree/traitTreeBranch/progression/step` | 270 | `nbPoints` (270/270); `traitId` (270/270); `traitName` (270/270) | — |

## traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `traits` | 1 | — | `trait` |
| `traits/trait` | 3929 | `category` (2503/3929); `cosmetic` (156/3929); `description` (3242/3929); `iconId` (3929/3929); `identifier` (3929/3929); `key` (28/3929); `minLevel` (22/3929); `name` (3929/3929); `nature` (3929/3929); `pointCostProgression` (946/3929); `rankOverlayProgression` (1044/3929); `staticIconOverlayId` (1212/3929); `subCategory` (199/3929); `tierProperty` (1186/3929); `tiers` (723/3929); `tooltip` (1911/3929) | `compoundPrerequisite`, `effect`, `effectGenerator`, `group`, `simplePrerequisite`, `skill`, `specialEffect`, `stat` |
| `traits/trait/compoundPrerequisite` | 14 | `operator` (14/14) | `simplePrerequisite` |
| `traits/trait/compoundPrerequisite/simplePrerequisite` | 32 | `id` (32/32); `name` (32/32) | — |
| `traits/trait/effect` | 409 | `id` (409/409); `name` (409/409); `rank` (170/409) | — |
| `traits/trait/effectGenerator` | 703 | `id` (703/703); `name` (703/703); `spellcraft` (582/703) | — |
| `traits/trait/group` | 1282 | `code` (1282/1282); `name` (1282/1282) | — |
| `traits/trait/simplePrerequisite` | 192 | `id` (192/192); `name` (192/192) | — |
| `traits/trait/skill` | 442 | `id` (442/442); `name` (442/442); `rank` (307/442) | — |
| `traits/trait/specialEffect` | 129 | `label` (129/129) | — |
| `traits/trait/stat` | 3115 | `constant` (1691/3115); `descriptionOverride` (1226/3115); `name` (3115/3115); `operator` (1292/3115); `scaling` (1116/3115); `tieredScaling` (50/3115); `value` (258/3115) | — |

## travelNPCs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `travelNPCs` | 1 | — | `travelNPC` |
| `travelNPCs/travelNPC` | 449 | `id` (449/449); `mustBeDiscovered` (409/449); `name` (449/449); `nodeId` (449/449); `sellFactor` (449/449) | `discount`, `position` |
| `travelNPCs/travelNPC/discount` | 828 | `id` (828/828) | — |
| `travelNPCs/travelNPC/position` | 431 | `latitude` (431/431); `longitude` (431/431); `region` (431/431); `zoneID` (431/431) | — |

## travels.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `travelsWeb` | 1 | — | `destination`, `node`, `route` |
| `travelsWeb/destination` | 790 | `id` (790/790); `name` (790/790); `swift` (406/790) | — |
| `travelsWeb/node` | 433 | `id` (433/433) | `location`, `mainLocation`, `route` |
| `travelsWeb/node/location` | 787 | `id` (787/787); `name` (787/787) | — |
| `travelsWeb/node/mainLocation` | 433 | `id` (433/433); `name` (433/433) | — |
| `travelsWeb/node/route` | 5513 | `cost` (5513/5513); `id` (5513/5513); `name` (5513/5513) | — |
| `travelsWeb/route` | 5319 | `destinationID` (5319/5319); `id` (5319/5319); `minLevel` (4824/5319); `mode` (5319/5319); `name` (5319/5319); `requiredFaction` (41/5319); `requiredQuest` (178/5319) | `routeAction` |
| `travelsWeb/route/routeAction` | 23789 | `delay` (3240/23789); `headName` (19918/23789); `id` (23789/23789); `location` (234/23789); `sceneID` (50/23789) | — |

## travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `travelsMap` | 1 | — | `label`, `node` |
| `travelsMap/label` | 45 | `text` (45/45) | `uiPosition` |
| `travelsMap/label/uiPosition` | 45 | `height` (45/45); `width` (45/45); `x` (45/45); `y` (45/45) | — |
| `travelsMap/node` | 351 | `capital` (21/351); `npcId` (351/351); `tooltip` (351/351) | `uiPosition` |
| `travelsMap/node/uiPosition` | 351 | `x` (351/351); `y` (351/351) | — |

## valueTables.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `valueTables` | 1 | — | `valueTable` |
| `valueTables/valueTable` | 99 | `id` (99/99) | `baseValue`, `quality` |
| `valueTables/valueTable/baseValue` | 59499 | `level` (59499/59499); `value` (59499/59499) | — |
| `valueTables/valueTable/quality` | 495 | `factor` (495/495); `key` (495/495) | — |

## vendors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `vendors` | 1 | — | `sellList`, `vendor` |
| `vendors/sellList` | 404 | `sellListId` (404/404) | `sellEntry` |
| `vendors/sellList/sellEntry` | 14271 | `id` (14271/14271); `name` (14271/14271) | — |
| `vendors/vendor` | 1469 | `buys` (1337/1469); `id` (1469/1469); `name` (1469/1469); `sellFactor` (1469/1469); `sellsWearableItems` (730/1469); `title` (983/1469) | `discount`, `sellList` |
| `vendors/vendor/discount` | 2299 | `id` (2299/2299) | — |
| `vendors/vendor/sellList` | 1798 | `sellListId` (1798/1798) | — |

## virtues.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `virtues` | 1 | — | `virtue` |
| `virtues/virtue` | 21 | `identifier` (21/21); `key` (21/21); `maxRankProgression` (21/21); `name` (21/21); `passivesEffect` (21/21); `rankStatKey` (21/21); `xpProperty` (21/21) | `activeStats`, `xp` |
| `virtues/virtue/activeStats` | 21 | — | `stat` |
| `virtues/virtue/activeStats/stat` | 64 | `name` (64/64); `scaling` (64/64) | — |
| `virtues/virtue/xp` | 2751 | `tier` (2751/2751); `value` (2751/2751) | — |

## warbands.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `warbands` | 1 | — | `warband` |
| `warbands/warband` | 17 | `description` (17/17); `iconName` (17/17); `level` (17/17); `morale` (17/17); `name` (17/17); `region` (17/17); `shortName` (2/17); `size` (17/17) | — |

## weaponDamage.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `weaponDamage` | 1 | — | `weapon` |
| `weaponDamage/weapon` | 19 | `type` (19/19); `variance` (19/19) | — |

## webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `webStoreItems` | 1 | — | `webStoreItem` |
| `webStoreItems/webStoreItem` | 1269 | `billingGroup` (477/1269); `freeForSubscribers` (106/1269); `id` (1269/1269); `itemID` (842/1269); `name` (1269/1269); `shortName` (792/1269); `sku` (1269/1269) | — |

## worldEvents.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `worldEvents` | 1 | — | `booleanWorldEvent`, `conditionWorldEvent`, `integerWorldEvent` |
| `worldEvents/booleanWorldEvent` | 185 | `default` (185/185); `description` (63/185); `id` (185/185); `progress` (9/185); `propertyId` (185/185); `propertyName` (185/185) | — |
| `worldEvents/conditionWorldEvent` | 28 | `description` (15/28); `id` (28/28); `propertyId` (28/28); `propertyName` (28/28) | `compoundWorldEventCondition`, `worldEventCondition` |
| `worldEvents/conditionWorldEvent/compoundWorldEventCondition` | 13 | `operator` (13/13) | `worldEventCondition` |
| `worldEvents/conditionWorldEvent/compoundWorldEventCondition/worldEventCondition` | 35 | `operator` (35/35); `value` (35/35); `worldEventID` (35/35); `worldEventName` (35/35) | — |
| `worldEvents/conditionWorldEvent/worldEventCondition` | 15 | `operator` (15/15); `value` (15/15); `worldEventID` (15/15); `worldEventName` (15/15) | — |
| `worldEvents/integerWorldEvent` | 139 | `default` (137/139); `description` (92/139); `id` (139/139); `max` (139/139); `min` (137/139); `progress` (31/139); `propertyId` (139/139); `propertyName` (139/139) | — |

## xp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `xpTable` | 1 | — | `entry` |
| `xpTable/entry` | 200 | `level` (200/200); `value` (200/200) | — |

## enums/AICooldownChannel.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 324 | `code` (324/324); `name` (324/324) | — |

## enums/AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 175 | `code` (175/175); `name` (175/175) | — |

## enums/AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 211 | `code` (211/211); `name` (211/211) | — |

## enums/Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 5 | `code` (5/5); `name` (5/5) | — |

## enums/AllegianceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 3 | `code` (3/3); `name` (3/3) | — |

## enums/AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 4 | `code` (4/4); `name` (4/4) | — |

## enums/ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 6 | `code` (6/6); `key` (6/6); `name` (6/6) | — |

## enums/BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 898 | `code` (898/898); `name` (898/898) | — |

## enums/CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 2 | `code` (2/2); `key` (2/2); `name` (2/2) | — |

## enums/ClassificationFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 6 | `code` (6/6); `name` (6/6) | — |

## enums/CollectionCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 2 | `code` (2/2); `name` (2/2) | — |

## enums/CombatState.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 24 | `code` (24/24); `name` (24/24) | — |

## enums/CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 18 | `code` (18/18); `name` (18/18) | — |

## enums/CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 516 | `code` (516/516); `name` (516/516) | — |

## enums/DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 3 | `code` (3/3); `name` (3/3) | — |

## enums/DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 18 | `code` (18/18); `key` (9/18); `name` (18/18) | — |

## enums/DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 85 | `code` (85/85); `name` (85/85) | — |

## enums/DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 7 | `code` (7/7); `key` (7/7); `name` (7/7) | — |

## enums/DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 4 | `code` (4/4); `name` (4/4) | — |

## enums/Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 10 | `code` (10/10); `name` (10/10) | — |

## enums/EffectAuraType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 2 | `code` (2/2); `name` (2/2) | — |

## enums/EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 41 | `code` (41/41); `name` (41/41) | — |

## enums/EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 27 | `code` (27/27); `key` (27/27); `name` (27/27) | — |

## enums/GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 8 | `code` (8/8); `name` (8/8) | — |

## enums/GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 24 | `code` (24/24); `key` (24/24); `name` (24/24) | — |

## enums/Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 17 | `code` (17/17); `name` (17/17) | — |

## enums/GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 6 | `code` (6/6); `key` (6/6); `name` (6/6) | — |

## enums/HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 40 | `code` (40/40); `name` (40/40) | — |

## enums/HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 37 | `code` (37/37); `name` (37/37) | — |

## enums/HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 936 | `code` (936/936); `name` (936/936) | — |

## enums/ImplementUsageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 6 | `code` (6/6); `name` (6/6) | — |

## enums/ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 4 | `code` (4/4); `key` (4/4); `name` (4/4) | — |

## enums/ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 285 | `code` (285/285); `name` (285/285) | — |

## enums/ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 5 | `code` (5/5); `key` (5/5); `name` (5/5) | — |

## enums/ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 7 | `code` (7/7); `key` (6/7); `name` (7/7) | — |

## enums/ItemUniquenessChannel.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 375 | `code` (375/375); `name` (375/375) | — |

## enums/LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 128 | `code` (128/128); `name` (128/128) | — |

## enums/LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 3 | `code` (3/3); `name` (3/3) | — |

## enums/MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 59 | `code` (59/59); `name` (59/59) | — |

## enums/MobDivision.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 591 | `code` (591/591); `name` (591/591) | — |

## enums/MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 34 | `code` (34/34); `name` (34/34) | — |

## enums/MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 18 | `code` (18/18); `name` (18/18) | — |

## enums/PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 15 | `code` (15/15); `name` (15/15) | — |

## enums/PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 28 | `code` (28/28); `name` (28/28) | — |

## enums/PipAdjustmentType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 2 | `code` (2/2); `name` (2/2) | — |

## enums/PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 25 | `code` (25/25); `name` (25/25) | — |

## enums/QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 478 | `code` (478/478); `name` (478/478) | — |

## enums/QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 7 | `code` (7/7); `name` (7/7) | — |

## enums/RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 4 | `code` (4/4); `key` (4/4); `name` (4/4) | — |

## enums/ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 15 | `code` (15/15); `name` (15/15) | — |

## enums/RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 32 | `code` (32/32); `name` (32/32) | — |

## enums/Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 4 | `code` (4/4); `key` (4/4); `name` (4/4) | — |

## enums/SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 132 | `code` (132/132); `name` (132/132) | — |

## enums/SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 9 | `code` (9/9); `name` (9/9) | — |

## enums/SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 41 | `code` (41/41); `name` (41/41) | — |

## enums/SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 64 | `code` (64/64); `name` (64/64) | — |

## enums/SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 25 | `code` (25/25); `key` (8/25); `name` (25/25) | — |

## enums/Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 123 | `code` (123/123); `name` (123/123) | — |

## enums/SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 769 | `code` (769/769); `name` (769/769) | — |

## enums/TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 19 | `code` (19/19); `name` (19/19) | — |

## enums/TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 33 | `code` (33/33); `name` (33/33) | — |

## enums/TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 22 | `code` (22/22); `name` (22/22) | — |

## enums/TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 56 | `code` (56/56); `name` (56/56) | — |

## enums/TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 17 | `code` (17/17); `name` (17/17) | — |

## enums/TravelLink.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 24 | `code` (24/24); `name` (24/24) | — |

## enums/VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 5 | `code` (5/5); `name` (5/5) | — |

## enums/WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 38 | `code` (38/38); `name` (38/38) | — |

## enums/WJEncounterType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 3 | `code` (3/3); `name` (3/3) | — |

## enums/WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 8 | `code` (8/8); `name` (8/8) | — |

## enums/WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | `id` (1/1); `name` (1/1) | `entry` |
| `enum/entry` | 19 | `code` (19/19); `key` (19/19); `name` (19/19) | — |

## enums/directory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `enum` | 1 | — | `enum` |
| `enum/enum` | 68 | `className` (68/68); `id` (68/68); `name` (68/68) | — |

## maps/categories/categories.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `categories` | 1 | — | `category` |
| `categories/category` | 39 | `code` (39/39); `icon` (39/39); `name` (39/39) | — |

## maps/labels/de/basemaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1533 | `key` (1533/1533); `value` (1533/1533) | — |

## maps/labels/de/markers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51626 | `key` (51626/51626); `value` (51626/51626) | — |

## maps/labels/en/basemaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1533 | `key` (1533/1533); `value` (1533/1533) | — |

## maps/labels/en/markers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51626 | `key` (51626/51626); `value` (51626/51626) | — |

## maps/labels/es/basemaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1533 | `key` (1533/1533); `value` (1533/1533) | — |

## maps/labels/es/markers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51626 | `key` (51626/51626); `value` (51626/51626) | — |

## maps/labels/fr/basemaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1533 | `key` (1533/1533); `value` (1533/1533) | — |

## maps/labels/fr/markers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51626 | `key` (51626/51626); `value` (51626/51626) | — |

## maps/labels/ru/basemaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1533 | `key` (1533/1533); `value` (1533/1533) | — |

## maps/labels/ru/markers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51626 | `key` (51626/51626); `value` (51626/51626) | — |

## maps/links.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `links` | 1 | — | `link` |
| `links/link` | 2557 | `contentLayerId` (2557/2557); `from` (2557/2557); `label` (2555/2557); `parentId` (2557/2557); `target` (2557/2557); `to` (1773/2557); `type` (1770/2557) | — |

## maps/maps/maps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `maps` | 1 | — | `map` |
| `maps/map` | 1556 | `id` (1556/1556); `imageId` (1556/1556); `name` (1556/1556) | `geo`, `max`, `min` |
| `maps/map/geo` | 1556 | `factor` (1556/1556) | `point` |
| `maps/map/geo/point` | 1556 | `latitude` (1556/1556); `longitude` (1556/1556) | — |
| `maps/map/max` | 1556 | `latitude` (1556/1556); `longitude` (1556/1556) | — |
| `maps/map/min` | 1556 | `latitude` (1556/1556); `longitude` (1556/1556) | — |

## maps/markers/markers-1-0-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 491 | `category` (491/491); `did` (491/491); `id` (491/491); `label` (491/491); `latitude` (491/491); `longitude` (491/491); `parentZoneId` (491/491) | — |

## maps/markers/markers-1-0-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 150 | `category` (150/150); `did` (150/150); `id` (150/150); `label` (150/150); `latitude` (150/150); `longitude` (150/150); `parentZoneId` (150/150) | — |

## maps/markers/markers-1-0-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1842 | `category` (1842/1842); `did` (1842/1842); `id` (1842/1842); `label` (1842/1842); `latitude` (1842/1842); `longitude` (1842/1842); `parentZoneId` (1842/1842) | — |

## maps/markers/markers-1-0-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2987 | `category` (2987/2987); `did` (2987/2987); `id` (2987/2987); `label` (2987/2987); `latitude` (2987/2987); `longitude` (2987/2987); `parentZoneId` (2987/2987) | — |

## maps/markers/markers-1-0-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1591 | `category` (1591/1591); `did` (1591/1591); `id` (1591/1591); `label` (1591/1591); `latitude` (1591/1591); `longitude` (1591/1591); `parentZoneId` (1591/1591) | — |

## maps/markers/markers-1-0-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 42 | `category` (42/42); `did` (42/42); `id` (42/42); `label` (42/42); `latitude` (42/42); `longitude` (42/42); `parentZoneId` (42/42) | — |

## maps/markers/markers-1-1-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 466 | `category` (466/466); `did` (466/466); `id` (466/466); `label` (466/466); `latitude` (466/466); `longitude` (466/466); `parentZoneId` (466/466) | — |

## maps/markers/markers-1-1-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1157 | `category` (1157/1157); `did` (1157/1157); `id` (1157/1157); `label` (1157/1157); `latitude` (1157/1157); `longitude` (1157/1157); `parentZoneId` (1157/1157) | — |

## maps/markers/markers-1-1-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 140 | `category` (140/140); `did` (140/140); `id` (140/140); `label` (140/140); `latitude` (140/140); `longitude` (140/140); `parentZoneId` (140/140) | — |

## maps/markers/markers-1-1-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1 | `category` (1/1); `did` (1/1); `id` (1/1); `label` (1/1); `latitude` (1/1); `longitude` (1/1); `parentZoneId` (1/1) | — |

## maps/markers/markers-1-1-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 344 | `category` (344/344); `did` (344/344); `id` (344/344); `label` (344/344); `latitude` (344/344); `longitude` (344/344); `parentZoneId` (344/344) | — |

## maps/markers/markers-1-10-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2762 | `category` (2762/2762); `did` (2762/2762); `id` (2762/2762); `label` (2762/2762); `latitude` (2762/2762); `longitude` (2762/2762); `parentZoneId` (2762/2762) | — |

## maps/markers/markers-1-10-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9 | `category` (9/9); `did` (9/9); `id` (9/9); `label` (9/9); `latitude` (9/9); `longitude` (9/9); `parentZoneId` (9/9) | — |

## maps/markers/markers-1-10-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4825 | `category` (4825/4825); `did` (4825/4825); `id` (4825/4825); `label` (4825/4825); `latitude` (4825/4825); `longitude` (4825/4825); `parentZoneId` (4825/4825) | — |

## maps/markers/markers-1-10-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17813 | `category` (17813/17813); `did` (17813/17813); `id` (17813/17813); `label` (17813/17813); `latitude` (17813/17813); `longitude` (17813/17813); `parentZoneId` (17813/17813) | — |

## maps/markers/markers-1-10-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10669 | `category` (10669/10669); `did` (10669/10669); `id` (10669/10669); `label` (10669/10669); `latitude` (10669/10669); `longitude` (10669/10669); `parentZoneId` (10669/10669) | — |

## maps/markers/markers-1-10-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 26086 | `category` (26086/26086); `did` (26086/26086); `id` (26086/26086); `label` (26086/26086); `latitude` (26086/26086); `longitude` (26086/26086); `parentZoneId` (26086/26086) | — |

## maps/markers/markers-1-10-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 37199 | `category` (37199/37199); `did` (37199/37199); `id` (37199/37199); `label` (37199/37199); `latitude` (37199/37199); `longitude` (37199/37199); `parentZoneId` (37199/37199) | — |

## maps/markers/markers-1-10-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 13321 | `category` (13321/13321); `did` (13321/13321); `id` (13321/13321); `label` (13321/13321); `latitude` (13321/13321); `longitude` (13321/13321); `parentZoneId` (13321/13321) | — |

## maps/markers/markers-1-10-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9225 | `category` (9225/9225); `did` (9225/9225); `id` (9225/9225); `label` (9225/9225); `latitude` (9225/9225); `longitude` (9225/9225); `parentZoneId` (9225/9225) | — |

## maps/markers/markers-1-10-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 109382 | `category` (109382/109382); `did` (109382/109382); `id` (109382/109382); `label` (109382/109382); `latitude` (109382/109382); `longitude` (109382/109382); `parentZoneId` (109382/109382) | — |

## maps/markers/markers-1-11-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 79 | `category` (79/79); `did` (79/79); `id` (79/79); `label` (79/79); `latitude` (79/79); `longitude` (79/79); `parentZoneId` (79/79) | — |

## maps/markers/markers-1-11-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1554 | `category` (1554/1554); `did` (1554/1554); `id` (1554/1554); `label` (1554/1554); `latitude` (1554/1554); `longitude` (1554/1554); `parentZoneId` (1554/1554) | — |

## maps/markers/markers-1-11-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5339 | `category` (5339/5339); `did` (5339/5339); `id` (5339/5339); `label` (5339/5339); `latitude` (5339/5339); `longitude` (5339/5339); `parentZoneId` (5339/5339) | — |

## maps/markers/markers-1-11-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 494 | `category` (494/494); `did` (494/494); `id` (494/494); `label` (494/494); `latitude` (494/494); `longitude` (494/494); `parentZoneId` (494/494) | — |

## maps/markers/markers-1-11-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1736 | `category` (1736/1736); `did` (1736/1736); `id` (1736/1736); `label` (1736/1736); `latitude` (1736/1736); `longitude` (1736/1736); `parentZoneId` (1736/1736) | — |

## maps/markers/markers-1-11-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10105 | `category` (10105/10105); `did` (10105/10105); `id` (10105/10105); `label` (10105/10105); `latitude` (10105/10105); `longitude` (10105/10105); `parentZoneId` (10105/10105) | — |

## maps/markers/markers-1-11-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3389 | `category` (3389/3389); `did` (3389/3389); `id` (3389/3389); `label` (3389/3389); `latitude` (3389/3389); `longitude` (3389/3389); `parentZoneId` (3389/3389) | — |

## maps/markers/markers-1-11-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4784 | `category` (4784/4784); `did` (4784/4784); `id` (4784/4784); `label` (4784/4784); `latitude` (4784/4784); `longitude` (4784/4784); `parentZoneId` (4784/4784) | — |

## maps/markers/markers-1-12-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17 | `category` (17/17); `did` (17/17); `id` (17/17); `label` (17/17); `latitude` (17/17); `longitude` (17/17); `parentZoneId` (17/17) | — |

## maps/markers/markers-1-12-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 609 | `category` (609/609); `did` (609/609); `id` (609/609); `label` (609/609); `latitude` (609/609); `longitude` (609/609); `parentZoneId` (609/609) | — |

## maps/markers/markers-1-12-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 249 | `category` (249/249); `did` (249/249); `id` (249/249); `label` (249/249); `latitude` (249/249); `longitude` (249/249); `parentZoneId` (249/249) | — |

## maps/markers/markers-1-12-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 279 | `category` (279/279); `did` (279/279); `id` (279/279); `label` (279/279); `latitude` (279/279); `longitude` (279/279); `parentZoneId` (279/279) | — |

## maps/markers/markers-1-12-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1996 | `category` (1996/1996); `did` (1996/1996); `id` (1996/1996); `label` (1996/1996); `latitude` (1996/1996); `longitude` (1996/1996); `parentZoneId` (1996/1996) | — |

## maps/markers/markers-1-12-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 258 | `category` (258/258); `did` (258/258); `id` (258/258); `label` (258/258); `latitude` (258/258); `longitude` (258/258); `parentZoneId` (258/258) | — |

## maps/markers/markers-1-13-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 72 | `category` (72/72); `did` (72/72); `id` (72/72); `label` (72/72); `latitude` (72/72); `longitude` (72/72); `parentZoneId` (72/72) | — |

## maps/markers/markers-1-13-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 222 | `category` (222/222); `did` (222/222); `id` (222/222); `label` (222/222); `latitude` (222/222); `longitude` (222/222); `parentZoneId` (222/222) | — |

## maps/markers/markers-1-14-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11 | `category` (11/11); `did` (11/11); `id` (11/11); `label` (11/11); `latitude` (11/11); `longitude` (11/11); `parentZoneId` (11/11) | — |

## maps/markers/markers-1-14-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 89 | `category` (89/89); `did` (89/89); `id` (89/89); `label` (89/89); `latitude` (89/89); `longitude` (89/89); `parentZoneId` (89/89) | — |

## maps/markers/markers-1-14-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 97 | `category` (97/97); `did` (97/97); `id` (97/97); `label` (97/97); `latitude` (97/97); `longitude` (97/97); `parentZoneId` (97/97) | — |

## maps/markers/markers-1-14-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 27 | `category` (27/27); `did` (27/27); `id` (27/27); `label` (27/27); `latitude` (27/27); `longitude` (27/27); `parentZoneId` (27/27) | — |

## maps/markers/markers-1-14-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 182 | `category` (182/182); `did` (182/182); `id` (182/182); `label` (182/182); `latitude` (182/182); `longitude` (182/182); `parentZoneId` (182/182) | — |

## maps/markers/markers-1-14-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 68 | `category` (68/68); `did` (68/68); `id` (68/68); `label` (68/68); `latitude` (68/68); `longitude` (68/68); `parentZoneId` (68/68) | — |

## maps/markers/markers-1-14-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 468 | `category` (468/468); `did` (468/468); `id` (468/468); `label` (468/468); `latitude` (468/468); `longitude` (468/468); `parentZoneId` (468/468) | — |

## maps/markers/markers-1-14-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 127 | `category` (127/127); `did` (127/127); `id` (127/127); `label` (127/127); `latitude` (127/127); `longitude` (127/127); `parentZoneId` (127/127) | — |

## maps/markers/markers-1-15-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 378 | `category` (378/378); `did` (378/378); `id` (378/378); `label` (378/378); `latitude` (378/378); `longitude` (378/378); `parentZoneId` (378/378) | — |

## maps/markers/markers-1-15-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 363 | `category` (363/363); `did` (363/363); `id` (363/363); `label` (363/363); `latitude` (363/363); `longitude` (363/363); `parentZoneId` (363/363) | — |

## maps/markers/markers-1-15-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 598 | `category` (598/598); `did` (598/598); `id` (598/598); `label` (598/598); `latitude` (598/598); `longitude` (598/598); `parentZoneId` (598/598) | — |

## maps/markers/markers-1-15-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 482 | `category` (482/482); `did` (482/482); `id` (482/482); `label` (482/482); `latitude` (482/482); `longitude` (482/482); `parentZoneId` (482/482) | — |

## maps/markers/markers-1-15-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 358 | `category` (358/358); `did` (358/358); `id` (358/358); `label` (358/358); `latitude` (358/358); `longitude` (358/358); `parentZoneId` (358/358) | — |

## maps/markers/markers-1-15-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 284 | `category` (284/284); `did` (284/284); `id` (284/284); `label` (284/284); `latitude` (284/284); `longitude` (284/284); `parentZoneId` (284/284) | — |

## maps/markers/markers-1-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2303 | `category` (2303/2303); `did` (2303/2303); `id` (2303/2303); `label` (2303/2303); `latitude` (2303/2303); `longitude` (2303/2303); `parentZoneId` (2303/2303) | — |

## maps/markers/markers-1-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2841 | `category` (2841/2841); `did` (2841/2841); `id` (2841/2841); `label` (2841/2841); `latitude` (2841/2841); `longitude` (2841/2841); `parentZoneId` (2841/2841) | — |

## maps/markers/markers-1-15-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 267 | `category` (267/267); `did` (267/267); `id` (267/267); `label` (267/267); `latitude` (267/267); `longitude` (267/267); `parentZoneId` (267/267) | — |

## maps/markers/markers-1-15-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 340 | `category` (340/340); `did` (340/340); `id` (340/340); `label` (340/340); `latitude` (340/340); `longitude` (340/340); `parentZoneId` (340/340) | — |

## maps/markers/markers-1-15-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2369 | `category` (2369/2369); `did` (2369/2369); `id` (2369/2369); `label` (2369/2369); `latitude` (2369/2369); `longitude` (2369/2369); `parentZoneId` (2369/2369) | — |

## maps/markers/markers-1-15-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 336 | `category` (336/336); `did` (336/336); `id` (336/336); `label` (336/336); `latitude` (336/336); `longitude` (336/336); `parentZoneId` (336/336) | — |

## maps/markers/markers-1-15-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 85 | `category` (85/85); `did` (85/85); `id` (85/85); `label` (85/85); `latitude` (85/85); `longitude` (85/85); `parentZoneId` (85/85) | — |

## maps/markers/markers-1-15-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 931 | `category` (931/931); `did` (931/931); `id` (931/931); `label` (931/931); `latitude` (931/931); `longitude` (931/931); `parentZoneId` (931/931) | — |

## maps/markers/markers-1-15-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1831 | `category` (1831/1831); `did` (1831/1831); `id` (1831/1831); `label` (1831/1831); `latitude` (1831/1831); `longitude` (1831/1831); `parentZoneId` (1831/1831) | — |

## maps/markers/markers-1-15-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1332 | `category` (1332/1332); `did` (1332/1332); `id` (1332/1332); `label` (1332/1332); `latitude` (1332/1332); `longitude` (1332/1332); `parentZoneId` (1332/1332) | — |

## maps/markers/markers-1-2-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15 | `category` (15/15); `did` (15/15); `id` (15/15); `label` (15/15); `latitude` (15/15); `longitude` (15/15); `parentZoneId` (15/15) | — |

## maps/markers/markers-1-2-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 282 | `category` (282/282); `did` (282/282); `id` (282/282); `label` (282/282); `latitude` (282/282); `longitude` (282/282); `parentZoneId` (282/282) | — |

## maps/markers/markers-1-2-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 199 | `category` (199/199); `did` (199/199); `id` (199/199); `label` (199/199); `latitude` (199/199); `longitude` (199/199); `parentZoneId` (199/199) | — |

## maps/markers/markers-1-2-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 104 | `category` (104/104); `did` (104/104); `id` (104/104); `label` (104/104); `latitude` (104/104); `longitude` (104/104); `parentZoneId` (104/104) | — |

## maps/markers/markers-1-3-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 64 | `category` (64/64); `did` (64/64); `id` (64/64); `label` (64/64); `latitude` (64/64); `longitude` (64/64); `parentZoneId` (64/64) | — |

## maps/markers/markers-1-3-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20 | `category` (20/20); `did` (20/20); `id` (20/20); `label` (20/20); `latitude` (20/20); `longitude` (20/20); `parentZoneId` (20/20) | — |

## maps/markers/markers-1-3-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17 | `category` (17/17); `did` (17/17); `id` (17/17); `label` (17/17); `latitude` (17/17); `longitude` (17/17); `parentZoneId` (17/17) | — |

## maps/markers/markers-1-3-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17 | `category` (17/17); `did` (17/17); `id` (17/17); `label` (17/17); `latitude` (17/17); `longitude` (17/17); `parentZoneId` (17/17) | — |

## maps/markers/markers-1-3-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2365 | `category` (2365/2365); `did` (2365/2365); `id` (2365/2365); `label` (2365/2365); `latitude` (2365/2365); `longitude` (2365/2365); `parentZoneId` (2365/2365) | — |

## maps/markers/markers-1-3-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8546 | `category` (8546/8546); `did` (8546/8546); `id` (8546/8546); `label` (8546/8546); `latitude` (8546/8546); `longitude` (8546/8546); `parentZoneId` (8546/8546) | — |

## maps/markers/markers-1-4-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3325 | `category` (3325/3325); `did` (3325/3325); `id` (3325/3325); `label` (3325/3325); `latitude` (3325/3325); `longitude` (3325/3325); `parentZoneId` (3325/3325) | — |

## maps/markers/markers-1-4-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2875 | `category` (2875/2875); `did` (2875/2875); `id` (2875/2875); `label` (2875/2875); `latitude` (2875/2875); `longitude` (2875/2875); `parentZoneId` (2875/2875) | — |

## maps/markers/markers-1-4-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 641 | `category` (641/641); `did` (641/641); `id` (641/641); `label` (641/641); `latitude` (641/641); `longitude` (641/641); `parentZoneId` (641/641) | — |

## maps/markers/markers-1-4-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5 | `category` (5/5); `did` (5/5); `id` (5/5); `label` (5/5); `latitude` (5/5); `longitude` (5/5); `parentZoneId` (5/5) | — |

## maps/markers/markers-1-4-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9 | `category` (9/9); `did` (9/9); `id` (9/9); `label` (9/9); `latitude` (9/9); `longitude` (9/9); `parentZoneId` (9/9) | — |

## maps/markers/markers-1-4-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 21 | `category` (21/21); `did` (21/21); `id` (21/21); `label` (21/21); `latitude` (21/21); `longitude` (21/21); `parentZoneId` (21/21) | — |

## maps/markers/markers-1-4-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 22087 | `category` (22087/22087); `did` (22087/22087); `id` (22087/22087); `label` (22087/22087); `latitude` (22087/22087); `longitude` (22087/22087); `parentZoneId` (22087/22087) | — |

## maps/markers/markers-1-4-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9956 | `category` (9956/9956); `did` (9956/9956); `id` (9956/9956); `label` (9956/9956); `latitude` (9956/9956); `longitude` (9956/9956); `parentZoneId` (9956/9956) | — |

## maps/markers/markers-1-5-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10 | `category` (10/10); `did` (10/10); `id` (10/10); `label` (10/10); `latitude` (10/10); `longitude` (10/10); `parentZoneId` (10/10) | — |

## maps/markers/markers-1-5-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11945 | `category` (11945/11945); `did` (11945/11945); `id` (11945/11945); `label` (11945/11945); `latitude` (11945/11945); `longitude` (11945/11945); `parentZoneId` (11945/11945) | — |

## maps/markers/markers-1-5-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 978 | `category` (978/978); `did` (978/978); `id` (978/978); `label` (978/978); `latitude` (978/978); `longitude` (978/978); `parentZoneId` (978/978) | — |

## maps/markers/markers-1-5-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 97 | `category` (97/97); `did` (97/97); `id` (97/97); `label` (97/97); `latitude` (97/97); `longitude` (97/97); `parentZoneId` (97/97) | — |

## maps/markers/markers-1-5-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 105 | `category` (105/105); `did` (105/105); `id` (105/105); `label` (105/105); `latitude` (105/105); `longitude` (105/105); `parentZoneId` (105/105) | — |

## maps/markers/markers-1-5-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 346 | `category` (346/346); `did` (346/346); `id` (346/346); `label` (346/346); `latitude` (346/346); `longitude` (346/346); `parentZoneId` (346/346) | — |

## maps/markers/markers-1-5-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 455 | `category` (455/455); `did` (455/455); `id` (455/455); `label` (455/455); `latitude` (455/455); `longitude` (455/455); `parentZoneId` (455/455) | — |

## maps/markers/markers-1-5-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 42239 | `category` (42239/42239); `did` (42239/42239); `id` (42239/42239); `label` (42239/42239); `latitude` (42239/42239); `longitude` (42239/42239); `parentZoneId` (42239/42239) | — |

## maps/markers/markers-1-5-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12710 | `category` (12710/12710); `did` (12710/12710); `id` (12710/12710); `label` (12710/12710); `latitude` (12710/12710); `longitude` (12710/12710); `parentZoneId` (12710/12710) | — |

## maps/markers/markers-1-5-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4813 | `category` (4813/4813); `did` (4813/4813); `id` (4813/4813); `label` (4813/4813); `latitude` (4813/4813); `longitude` (4813/4813); `parentZoneId` (4813/4813) | — |

## maps/markers/markers-1-6-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2915 | `category` (2915/2915); `did` (2915/2915); `id` (2915/2915); `label` (2915/2915); `latitude` (2915/2915); `longitude` (2915/2915); `parentZoneId` (2915/2915) | — |

## maps/markers/markers-1-6-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1897 | `category` (1897/1897); `did` (1897/1897); `id` (1897/1897); `label` (1897/1897); `latitude` (1897/1897); `longitude` (1897/1897); `parentZoneId` (1897/1897) | — |

## maps/markers/markers-1-6-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 92 | `category` (92/92); `did` (92/92); `id` (92/92); `label` (92/92); `latitude` (92/92); `longitude` (92/92); `parentZoneId` (92/92) | — |

## maps/markers/markers-1-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 648 | `category` (648/648); `did` (648/648); `id` (648/648); `label` (648/648); `latitude` (648/648); `longitude` (648/648); `parentZoneId` (648/648) | — |

## maps/markers/markers-1-6-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1733 | `category` (1733/1733); `did` (1733/1733); `id` (1733/1733); `label` (1733/1733); `latitude` (1733/1733); `longitude` (1733/1733); `parentZoneId` (1733/1733) | — |

## maps/markers/markers-1-6-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 44722 | `category` (44722/44722); `did` (44722/44722); `id` (44722/44722); `label` (44722/44722); `latitude` (44722/44722); `longitude` (44722/44722); `parentZoneId` (44722/44722) | — |

## maps/markers/markers-1-6-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 34006 | `category` (34006/34006); `did` (34006/34006); `id` (34006/34006); `label` (34006/34006); `latitude` (34006/34006); `longitude` (34006/34006); `parentZoneId` (34006/34006) | — |

## maps/markers/markers-1-6-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11879 | `category` (11879/11879); `did` (11879/11879); `id` (11879/11879); `label` (11879/11879); `latitude` (11879/11879); `longitude` (11879/11879); `parentZoneId` (11879/11879) | — |

## maps/markers/markers-1-7-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 29 | `category` (29/29); `did` (29/29); `id` (29/29); `label` (29/29); `latitude` (29/29); `longitude` (29/29); `parentZoneId` (29/29) | — |

## maps/markers/markers-1-7-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4 | `category` (4/4); `did` (4/4); `id` (4/4); `label` (4/4); `latitude` (4/4); `longitude` (4/4); `parentZoneId` (4/4) | — |

## maps/markers/markers-1-7-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 41165 | `category` (41165/41165); `did` (41165/41165); `id` (41165/41165); `label` (41165/41165); `latitude` (41165/41165); `longitude` (41165/41165); `parentZoneId` (41165/41165) | — |

## maps/markers/markers-1-7-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 47545 | `category` (47545/47545); `did` (47545/47545); `id` (47545/47545); `label` (47545/47545); `latitude` (47545/47545); `longitude` (47545/47545); `parentZoneId` (47545/47545) | — |

## maps/markers/markers-1-7-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 26030 | `category` (26030/26030); `did` (26030/26030); `id` (26030/26030); `label` (26030/26030); `latitude` (26030/26030); `longitude` (26030/26030); `parentZoneId` (26030/26030) | — |

## maps/markers/markers-1-7-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 28124 | `category` (28124/28124); `did` (28124/28124); `id` (28124/28124); `label` (28124/28124); `latitude` (28124/28124); `longitude` (28124/28124); `parentZoneId` (28124/28124) | — |

## maps/markers/markers-1-7-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9526 | `category` (9526/9526); `did` (9526/9526); `id` (9526/9526); `label` (9526/9526); `latitude` (9526/9526); `longitude` (9526/9526); `parentZoneId` (9526/9526) | — |

## maps/markers/markers-1-8-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 22 | `category` (22/22); `did` (22/22); `id` (22/22); `label` (22/22); `latitude` (22/22); `longitude` (22/22); `parentZoneId` (22/22) | — |

## maps/markers/markers-1-8-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5971 | `category` (5971/5971); `did` (5971/5971); `id` (5971/5971); `label` (5971/5971); `latitude` (5971/5971); `longitude` (5971/5971); `parentZoneId` (5971/5971) | — |

## maps/markers/markers-1-8-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 47 | `category` (47/47); `did` (47/47); `id` (47/47); `label` (47/47); `latitude` (47/47); `longitude` (47/47); `parentZoneId` (47/47) | — |

## maps/markers/markers-1-8-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 263 | `category` (263/263); `did` (263/263); `id` (263/263); `label` (263/263); `latitude` (263/263); `longitude` (263/263); `parentZoneId` (263/263) | — |

## maps/markers/markers-1-8-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1515 | `category` (1515/1515); `did` (1515/1515); `id` (1515/1515); `label` (1515/1515); `latitude` (1515/1515); `longitude` (1515/1515); `parentZoneId` (1515/1515) | — |

## maps/markers/markers-1-8-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 50961 | `category` (50961/50961); `did` (50961/50961); `id` (50961/50961); `label` (50961/50961); `latitude` (50961/50961); `longitude` (50961/50961); `parentZoneId` (50961/50961) | — |

## maps/markers/markers-1-8-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 65503 | `category` (65503/65503); `did` (65503/65503); `id` (65503/65503); `label` (65503/65503); `latitude` (65503/65503); `longitude` (65503/65503); `parentZoneId` (65503/65503) | — |

## maps/markers/markers-1-8-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 27071 | `category` (27071/27071); `did` (27071/27071); `id` (27071/27071); `label` (27071/27071); `latitude` (27071/27071); `longitude` (27071/27071); `parentZoneId` (27071/27071) | — |

## maps/markers/markers-1-8-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14211 | `category` (14211/14211); `did` (14211/14211); `id` (14211/14211); `label` (14211/14211); `latitude` (14211/14211); `longitude` (14211/14211); `parentZoneId` (14211/14211) | — |

## maps/markers/markers-1-8-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 18570 | `category` (18570/18570); `did` (18570/18570); `id` (18570/18570); `label` (18570/18570); `latitude` (18570/18570); `longitude` (18570/18570); `parentZoneId` (18570/18570) | — |

## maps/markers/markers-1-9-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 65 | `category` (65/65); `did` (65/65); `id` (65/65); `label` (65/65); `latitude` (65/65); `longitude` (65/65); `parentZoneId` (65/65) | — |

## maps/markers/markers-1-9-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12837 | `category` (12837/12837); `did` (12837/12837); `id` (12837/12837); `label` (12837/12837); `latitude` (12837/12837); `longitude` (12837/12837); `parentZoneId` (12837/12837) | — |

## maps/markers/markers-1-9-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 238 | `category` (238/238); `did` (238/238); `id` (238/238); `label` (238/238); `latitude` (238/238); `longitude` (238/238); `parentZoneId` (238/238) | — |

## maps/markers/markers-1-9-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 133 | `category` (133/133); `did` (133/133); `id` (133/133); `label` (133/133); `latitude` (133/133); `longitude` (133/133); `parentZoneId` (133/133) | — |

## maps/markers/markers-1-9-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3857 | `category` (3857/3857); `did` (3857/3857); `id` (3857/3857); `label` (3857/3857); `latitude` (3857/3857); `longitude` (3857/3857); `parentZoneId` (3857/3857) | — |

## maps/markers/markers-1-9-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8483 | `category` (8483/8483); `did` (8483/8483); `id` (8483/8483); `label` (8483/8483); `latitude` (8483/8483); `longitude` (8483/8483); `parentZoneId` (8483/8483) | — |

## maps/markers/markers-1-9-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23501 | `category` (23501/23501); `did` (23501/23501); `id` (23501/23501); `label` (23501/23501); `latitude` (23501/23501); `longitude` (23501/23501); `parentZoneId` (23501/23501) | — |

## maps/markers/markers-1-9-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 59583 | `category` (59583/59583); `did` (59583/59583); `id` (59583/59583); `label` (59583/59583); `latitude` (59583/59583); `longitude` (59583/59583); `parentZoneId` (59583/59583) | — |

## maps/markers/markers-1-9-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 50746 | `category` (50746/50746); `did` (50746/50746); `id` (50746/50746); `label` (50746/50746); `latitude` (50746/50746); `longitude` (50746/50746); `parentZoneId` (50746/50746) | — |

## maps/markers/markers-1-9-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12856 | `category` (12856/12856); `did` (12856/12856); `id` (12856/12856); `label` (12856/12856); `latitude` (12856/12856); `longitude` (12856/12856); `parentZoneId` (12856/12856) | — |

## maps/markers/markers-1-9-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5923 | `category` (5923/5923); `did` (5923/5923); `id` (5923/5923); `label` (5923/5923); `latitude` (5923/5923); `longitude` (5923/5923); `parentZoneId` (5923/5923) | — |

## maps/markers/markers-1-9-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 49868 | `category` (49868/49868); `did` (49868/49868); `id` (49868/49868); `label` (49868/49868); `latitude` (49868/49868); `longitude` (49868/49868); `parentZoneId` (49868/49868) | — |

## maps/markers/markers-14-0-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 237 | `category` (237/237); `did` (237/237); `id` (237/237); `label` (237/237); `latitude` (237/237); `longitude` (237/237); `parentZoneId` (237/237) | — |

## maps/markers/markers-14-0-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 54 | `category` (54/54); `did` (54/54); `id` (54/54); `label` (54/54); `latitude` (54/54); `longitude` (54/54); `parentZoneId` (54/54) | — |

## maps/markers/markers-14-0-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 92 | `category` (92/92); `did` (92/92); `id` (92/92); `label` (92/92); `latitude` (92/92); `longitude` (92/92); `parentZoneId` (92/92) | — |

## maps/markers/markers-14-0-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8576 | `category` (8576/8576); `did` (8576/8576); `id` (8576/8576); `label` (8576/8576); `latitude` (8576/8576); `longitude` (8576/8576); `parentZoneId` (8576/8576) | — |

## maps/markers/markers-14-0-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5190 | `category` (5190/5190); `did` (5190/5190); `id` (5190/5190); `label` (5190/5190); `latitude` (5190/5190); `longitude` (5190/5190); `parentZoneId` (5190/5190) | — |

## maps/markers/markers-14-1-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 33 | `category` (33/33); `did` (33/33); `id` (33/33); `label` (33/33); `latitude` (33/33); `longitude` (33/33); `parentZoneId` (33/33) | — |

## maps/markers/markers-14-1-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 311 | `category` (311/311); `did` (311/311); `id` (311/311); `label` (311/311); `latitude` (311/311); `longitude` (311/311); `parentZoneId` (311/311) | — |

## maps/markers/markers-14-1-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4625 | `category` (4625/4625); `did` (4625/4625); `id` (4625/4625); `label` (4625/4625); `latitude` (4625/4625); `longitude` (4625/4625); `parentZoneId` (4625/4625) | — |

## maps/markers/markers-14-1-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 956 | `category` (956/956); `did` (956/956); `id` (956/956); `label` (956/956); `latitude` (956/956); `longitude` (956/956); `parentZoneId` (956/956) | — |

## maps/markers/markers-14-2-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15 | `category` (15/15); `did` (15/15); `id` (15/15); `label` (15/15); `latitude` (15/15); `longitude` (15/15); `parentZoneId` (15/15) | — |

## maps/markers/markers-14-2-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6 | `category` (6/6); `did` (6/6); `id` (6/6); `label` (6/6); `latitude` (6/6); `longitude` (6/6); `parentZoneId` (6/6) | — |

## maps/markers/markers-14-3-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 40 | `category` (40/40); `did` (40/40); `id` (40/40); `label` (40/40); `latitude` (40/40); `longitude` (40/40); `parentZoneId` (40/40) | — |

## maps/markers/markers-2-0-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14 | `category` (14/14); `did` (14/14); `id` (14/14); `label` (14/14); `latitude` (14/14); `longitude` (14/14); `parentZoneId` (14/14) | — |

## maps/markers/markers-2-0-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1143 | `category` (1143/1143); `did` (1143/1143); `id` (1143/1143); `label` (1143/1143); `latitude` (1143/1143); `longitude` (1143/1143); `parentZoneId` (1143/1143) | — |

## maps/markers/markers-2-0-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1431 | `category` (1431/1431); `did` (1431/1431); `id` (1431/1431); `label` (1431/1431); `latitude` (1431/1431); `longitude` (1431/1431); `parentZoneId` (1431/1431) | — |

## maps/markers/markers-2-0-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1061 | `category` (1061/1061); `did` (1061/1061); `id` (1061/1061); `label` (1061/1061); `latitude` (1061/1061); `longitude` (1061/1061); `parentZoneId` (1061/1061) | — |

## maps/markers/markers-2-0-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 166 | `category` (166/166); `did` (166/166); `id` (166/166); `label` (166/166); `latitude` (166/166); `longitude` (166/166); `parentZoneId` (166/166) | — |

## maps/markers/markers-2-0-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2851 | `category` (2851/2851); `did` (2851/2851); `id` (2851/2851); `label` (2851/2851); `latitude` (2851/2851); `longitude` (2851/2851); `parentZoneId` (2851/2851) | — |

## maps/markers/markers-2-0-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 108 | `category` (108/108); `did` (108/108); `id` (108/108); `label` (108/108); `latitude` (108/108); `longitude` (108/108); `parentZoneId` (108/108) | — |

## maps/markers/markers-2-0-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 602 | `category` (602/602); `did` (602/602); `id` (602/602); `label` (602/602); `latitude` (602/602); `longitude` (602/602); `parentZoneId` (602/602) | — |

## maps/markers/markers-2-0-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 32 | `category` (32/32); `did` (32/32); `id` (32/32); `label` (32/32); `latitude` (32/32); `longitude` (32/32); `parentZoneId` (32/32) | — |

## maps/markers/markers-2-0-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 32 | `category` (32/32); `did` (32/32); `id` (32/32); `label` (32/32); `latitude` (32/32); `longitude` (32/32); `parentZoneId` (32/32) | — |

## maps/markers/markers-2-0-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 124 | `category` (124/124); `did` (124/124); `id` (124/124); `label` (124/124); `latitude` (124/124); `longitude` (124/124); `parentZoneId` (124/124) | — |

## maps/markers/markers-2-0-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 458 | `category` (458/458); `did` (458/458); `id` (458/458); `label` (458/458); `latitude` (458/458); `longitude` (458/458); `parentZoneId` (458/458) | — |

## maps/markers/markers-2-0-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 39 | `category` (39/39); `did` (39/39); `id` (39/39); `label` (39/39); `latitude` (39/39); `longitude` (39/39); `parentZoneId` (39/39) | — |

## maps/markers/markers-2-1-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 22 | `category` (22/22); `did` (22/22); `id` (22/22); `label` (22/22); `latitude` (22/22); `longitude` (22/22); `parentZoneId` (22/22) | — |

## maps/markers/markers-2-1-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 33 | `category` (33/33); `did` (33/33); `id` (33/33); `label` (33/33); `latitude` (33/33); `longitude` (33/33); `parentZoneId` (33/33) | — |

## maps/markers/markers-2-1-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1108 | `category` (1108/1108); `did` (1108/1108); `id` (1108/1108); `label` (1108/1108); `latitude` (1108/1108); `longitude` (1108/1108); `parentZoneId` (1108/1108) | — |

## maps/markers/markers-2-1-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1019 | `category` (1019/1019); `did` (1019/1019); `id` (1019/1019); `label` (1019/1019); `latitude` (1019/1019); `longitude` (1019/1019); `parentZoneId` (1019/1019) | — |

## maps/markers/markers-2-1-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7643 | `category` (7643/7643); `did` (7643/7643); `id` (7643/7643); `label` (7643/7643); `latitude` (7643/7643); `longitude` (7643/7643); `parentZoneId` (7643/7643) | — |

## maps/markers/markers-2-1-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 645 | `category` (645/645); `did` (645/645); `id` (645/645); `label` (645/645); `latitude` (645/645); `longitude` (645/645); `parentZoneId` (645/645) | — |

## maps/markers/markers-2-10-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 139 | `category` (139/139); `did` (139/139); `id` (139/139); `label` (139/139); `latitude` (139/139); `longitude` (139/139); `parentZoneId` (139/139) | — |

## maps/markers/markers-2-10-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2908 | `category` (2908/2908); `did` (2908/2908); `id` (2908/2908); `label` (2908/2908); `latitude` (2908/2908); `longitude` (2908/2908); `parentZoneId` (2908/2908) | — |

## maps/markers/markers-2-10-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20647 | `category` (20647/20647); `did` (20647/20647); `id` (20647/20647); `label` (20647/20647); `latitude` (20647/20647); `longitude` (20647/20647); `parentZoneId` (20647/20647) | — |

## maps/markers/markers-2-10-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 358 | `category` (358/358); `did` (358/358); `id` (358/358); `label` (358/358); `latitude` (358/358); `longitude` (358/358); `parentZoneId` (358/358) | — |

## maps/markers/markers-2-10-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 373 | `category` (373/373); `did` (373/373); `id` (373/373); `label` (373/373); `latitude` (373/373); `longitude` (373/373); `parentZoneId` (373/373) | — |

## maps/markers/markers-2-10-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2390 | `category` (2390/2390); `did` (2390/2390); `id` (2390/2390); `label` (2390/2390); `latitude` (2390/2390); `longitude` (2390/2390); `parentZoneId` (2390/2390) | — |

## maps/markers/markers-2-10-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 206 | `category` (206/206); `did` (206/206); `id` (206/206); `label` (206/206); `latitude` (206/206); `longitude` (206/206); `parentZoneId` (206/206) | — |

## maps/markers/markers-2-11-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1671 | `category` (1671/1671); `did` (1671/1671); `id` (1671/1671); `label` (1671/1671); `latitude` (1671/1671); `longitude` (1671/1671); `parentZoneId` (1671/1671) | — |

## maps/markers/markers-2-11-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 179 | `category` (179/179); `did` (179/179); `id` (179/179); `label` (179/179); `latitude` (179/179); `longitude` (179/179); `parentZoneId` (179/179) | — |

## maps/markers/markers-2-12-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 221 | `category` (221/221); `did` (221/221); `id` (221/221); `label` (221/221); `latitude` (221/221); `longitude` (221/221); `parentZoneId` (221/221) | — |

## maps/markers/markers-2-12-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 424 | `category` (424/424); `did` (424/424); `id` (424/424); `label` (424/424); `latitude` (424/424); `longitude` (424/424); `parentZoneId` (424/424) | — |

## maps/markers/markers-2-12-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 55 | `category` (55/55); `did` (55/55); `id` (55/55); `label` (55/55); `latitude` (55/55); `longitude` (55/55); `parentZoneId` (55/55) | — |

## maps/markers/markers-2-12-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 34 | `category` (34/34); `did` (34/34); `id` (34/34); `label` (34/34); `latitude` (34/34); `longitude` (34/34); `parentZoneId` (34/34) | — |

## maps/markers/markers-2-13-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3 | `category` (3/3); `did` (3/3); `id` (3/3); `label` (3/3); `latitude` (3/3); `longitude` (3/3); `parentZoneId` (3/3) | — |

## maps/markers/markers-2-14-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10 | `category` (10/10); `did` (10/10); `id` (10/10); `label` (10/10); `latitude` (10/10); `longitude` (10/10); `parentZoneId` (10/10) | — |

## maps/markers/markers-2-14-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 97 | `category` (97/97); `did` (97/97); `id` (97/97); `label` (97/97); `latitude` (97/97); `longitude` (97/97); `parentZoneId` (97/97) | — |

## maps/markers/markers-2-14-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4 | `category` (4/4); `did` (4/4); `id` (4/4); `label` (4/4); `latitude` (4/4); `longitude` (4/4); `parentZoneId` (4/4) | — |

## maps/markers/markers-2-14-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 368 | `category` (368/368); `did` (368/368); `id` (368/368); `label` (368/368); `latitude` (368/368); `longitude` (368/368); `parentZoneId` (368/368) | — |

## maps/markers/markers-2-14-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 295 | `category` (295/295); `did` (295/295); `id` (295/295); `label` (295/295); `latitude` (295/295); `longitude` (295/295); `parentZoneId` (295/295) | — |

## maps/markers/markers-2-14-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 28 | `category` (28/28); `did` (28/28); `id` (28/28); `label` (28/28); `latitude` (28/28); `longitude` (28/28); `parentZoneId` (28/28) | — |

## maps/markers/markers-2-14-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20 | `category` (20/20); `did` (20/20); `id` (20/20); `label` (20/20); `latitude` (20/20); `longitude` (20/20); `parentZoneId` (20/20) | — |

## maps/markers/markers-2-14-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 48 | `category` (48/48); `did` (48/48); `id` (48/48); `label` (48/48); `latitude` (48/48); `longitude` (48/48); `parentZoneId` (48/48) | — |

## maps/markers/markers-2-15-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 87 | `category` (87/87); `did` (87/87); `id` (87/87); `label` (87/87); `latitude` (87/87); `longitude` (87/87); `parentZoneId` (87/87) | — |

## maps/markers/markers-2-15-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 245 | `category` (245/245); `did` (245/245); `id` (245/245); `label` (245/245); `latitude` (245/245); `longitude` (245/245); `parentZoneId` (245/245) | — |

## maps/markers/markers-2-15-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 260 | `category` (260/260); `did` (260/260); `id` (260/260); `label` (260/260); `latitude` (260/260); `longitude` (260/260); `parentZoneId` (260/260) | — |

## maps/markers/markers-2-15-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1012 | `category` (1012/1012); `did` (1012/1012); `id` (1012/1012); `label` (1012/1012); `latitude` (1012/1012); `longitude` (1012/1012); `parentZoneId` (1012/1012) | — |

## maps/markers/markers-2-15-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2575 | `category` (2575/2575); `did` (2575/2575); `id` (2575/2575); `label` (2575/2575); `latitude` (2575/2575); `longitude` (2575/2575); `parentZoneId` (2575/2575) | — |

## maps/markers/markers-2-15-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3874 | `category` (3874/3874); `did` (3874/3874); `id` (3874/3874); `label` (3874/3874); `latitude` (3874/3874); `longitude` (3874/3874); `parentZoneId` (3874/3874) | — |

## maps/markers/markers-2-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7474 | `category` (7474/7474); `did` (7474/7474); `id` (7474/7474); `label` (7474/7474); `latitude` (7474/7474); `longitude` (7474/7474); `parentZoneId` (7474/7474) | — |

## maps/markers/markers-2-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4749 | `category` (4749/4749); `did` (4749/4749); `id` (4749/4749); `label` (4749/4749); `latitude` (4749/4749); `longitude` (4749/4749); `parentZoneId` (4749/4749) | — |

## maps/markers/markers-2-15-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 208 | `category` (208/208); `did` (208/208); `id` (208/208); `label` (208/208); `latitude` (208/208); `longitude` (208/208); `parentZoneId` (208/208) | — |

## maps/markers/markers-2-15-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 30 | `category` (30/30); `did` (30/30); `id` (30/30); `label` (30/30); `latitude` (30/30); `longitude` (30/30); `parentZoneId` (30/30) | — |

## maps/markers/markers-2-15-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 457 | `category` (457/457); `did` (457/457); `id` (457/457); `label` (457/457); `latitude` (457/457); `longitude` (457/457); `parentZoneId` (457/457) | — |

## maps/markers/markers-2-15-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2141 | `category` (2141/2141); `did` (2141/2141); `id` (2141/2141); `label` (2141/2141); `latitude` (2141/2141); `longitude` (2141/2141); `parentZoneId` (2141/2141) | — |

## maps/markers/markers-2-15-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 99 | `category` (99/99); `did` (99/99); `id` (99/99); `label` (99/99); `latitude` (99/99); `longitude` (99/99); `parentZoneId` (99/99) | — |

## maps/markers/markers-2-15-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 619 | `category` (619/619); `did` (619/619); `id` (619/619); `label` (619/619); `latitude` (619/619); `longitude` (619/619); `parentZoneId` (619/619) | — |

## maps/markers/markers-2-15-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 737 | `category` (737/737); `did` (737/737); `id` (737/737); `label` (737/737); `latitude` (737/737); `longitude` (737/737); `parentZoneId` (737/737) | — |

## maps/markers/markers-2-15-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 44 | `category` (44/44); `did` (44/44); `id` (44/44); `label` (44/44); `latitude` (44/44); `longitude` (44/44); `parentZoneId` (44/44) | — |

## maps/markers/markers-2-2-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 355 | `category` (355/355); `did` (355/355); `id` (355/355); `label` (355/355); `latitude` (355/355); `longitude` (355/355); `parentZoneId` (355/355) | — |

## maps/markers/markers-2-2-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 30 | `category` (30/30); `did` (30/30); `id` (30/30); `label` (30/30); `latitude` (30/30); `longitude` (30/30); `parentZoneId` (30/30) | — |

## maps/markers/markers-2-2-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 298 | `category` (298/298); `did` (298/298); `id` (298/298); `label` (298/298); `latitude` (298/298); `longitude` (298/298); `parentZoneId` (298/298) | — |

## maps/markers/markers-2-2-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 27 | `category` (27/27); `did` (27/27); `id` (27/27); `label` (27/27); `latitude` (27/27); `longitude` (27/27); `parentZoneId` (27/27) | — |

## maps/markers/markers-2-2-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17110 | `category` (17110/17110); `did` (17110/17110); `id` (17110/17110); `label` (17110/17110); `latitude` (17110/17110); `longitude` (17110/17110); `parentZoneId` (17110/17110) | — |

## maps/markers/markers-2-2-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12798 | `category` (12798/12798); `did` (12798/12798); `id` (12798/12798); `label` (12798/12798); `latitude` (12798/12798); `longitude` (12798/12798); `parentZoneId` (12798/12798) | — |

## maps/markers/markers-2-2-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6090 | `category` (6090/6090); `did` (6090/6090); `id` (6090/6090); `label` (6090/6090); `latitude` (6090/6090); `longitude` (6090/6090); `parentZoneId` (6090/6090) | — |

## maps/markers/markers-2-2-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3389 | `category` (3389/3389); `did` (3389/3389); `id` (3389/3389); `label` (3389/3389); `latitude` (3389/3389); `longitude` (3389/3389); `parentZoneId` (3389/3389) | — |

## maps/markers/markers-2-3-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5 | `category` (5/5); `did` (5/5); `id` (5/5); `label` (5/5); `latitude` (5/5); `longitude` (5/5); `parentZoneId` (5/5) | — |

## maps/markers/markers-2-3-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 19 | `category` (19/19); `did` (19/19); `id` (19/19); `label` (19/19); `latitude` (19/19); `longitude` (19/19); `parentZoneId` (19/19) | — |

## maps/markers/markers-2-3-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 412 | `category` (412/412); `did` (412/412); `id` (412/412); `label` (412/412); `latitude` (412/412); `longitude` (412/412); `parentZoneId` (412/412) | — |

## maps/markers/markers-2-3-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15 | `category` (15/15); `did` (15/15); `id` (15/15); `label` (15/15); `latitude` (15/15); `longitude` (15/15); `parentZoneId` (15/15) | — |

## maps/markers/markers-2-3-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5767 | `category` (5767/5767); `did` (5767/5767); `id` (5767/5767); `label` (5767/5767); `latitude` (5767/5767); `longitude` (5767/5767); `parentZoneId` (5767/5767) | — |

## maps/markers/markers-2-3-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7476 | `category` (7476/7476); `did` (7476/7476); `id` (7476/7476); `label` (7476/7476); `latitude` (7476/7476); `longitude` (7476/7476); `parentZoneId` (7476/7476) | — |

## maps/markers/markers-2-4-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 64 | `category` (64/64); `did` (64/64); `id` (64/64); `label` (64/64); `latitude` (64/64); `longitude` (64/64); `parentZoneId` (64/64) | — |

## maps/markers/markers-2-4-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 455 | `category` (455/455); `did` (455/455); `id` (455/455); `label` (455/455); `latitude` (455/455); `longitude` (455/455); `parentZoneId` (455/455) | — |

## maps/markers/markers-2-4-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 64 | `category` (64/64); `did` (64/64); `id` (64/64); `label` (64/64); `latitude` (64/64); `longitude` (64/64); `parentZoneId` (64/64) | — |

## maps/markers/markers-2-4-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 742 | `category` (742/742); `did` (742/742); `id` (742/742); `label` (742/742); `latitude` (742/742); `longitude` (742/742); `parentZoneId` (742/742) | — |

## maps/markers/markers-2-4-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11691 | `category` (11691/11691); `did` (11691/11691); `id` (11691/11691); `label` (11691/11691); `latitude` (11691/11691); `longitude` (11691/11691); `parentZoneId` (11691/11691) | — |

## maps/markers/markers-2-4-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 223 | `category` (223/223); `did` (223/223); `id` (223/223); `label` (223/223); `latitude` (223/223); `longitude` (223/223); `parentZoneId` (223/223) | — |

## maps/markers/markers-2-4-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3 | `category` (3/3); `did` (3/3); `id` (3/3); `label` (3/3); `latitude` (3/3); `longitude` (3/3); `parentZoneId` (3/3) | — |

## maps/markers/markers-2-4-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15 | `category` (15/15); `did` (15/15); `id` (15/15); `label` (15/15); `latitude` (15/15); `longitude` (15/15); `parentZoneId` (15/15) | — |

## maps/markers/markers-2-5-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 54 | `category` (54/54); `did` (54/54); `id` (54/54); `label` (54/54); `latitude` (54/54); `longitude` (54/54); `parentZoneId` (54/54) | — |

## maps/markers/markers-2-5-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 176 | `category` (176/176); `did` (176/176); `id` (176/176); `label` (176/176); `latitude` (176/176); `longitude` (176/176); `parentZoneId` (176/176) | — |

## maps/markers/markers-2-5-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 118 | `category` (118/118); `did` (118/118); `id` (118/118); `label` (118/118); `latitude` (118/118); `longitude` (118/118); `parentZoneId` (118/118) | — |

## maps/markers/markers-2-5-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23683 | `category` (23683/23683); `did` (23683/23683); `id` (23683/23683); `label` (23683/23683); `latitude` (23683/23683); `longitude` (23683/23683); `parentZoneId` (23679/23683) | — |

## maps/markers/markers-2-5-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1264 | `category` (1264/1264); `did` (1264/1264); `id` (1264/1264); `label` (1264/1264); `latitude` (1264/1264); `longitude` (1264/1264); `parentZoneId` (1264/1264) | — |

## maps/markers/markers-2-5-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1382 | `category` (1382/1382); `did` (1382/1382); `id` (1382/1382); `label` (1382/1382); `latitude` (1382/1382); `longitude` (1382/1382); `parentZoneId` (1382/1382) | — |

## maps/markers/markers-2-5-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 18 | `category` (18/18); `did` (18/18); `id` (18/18); `label` (18/18); `latitude` (18/18); `longitude` (18/18); `parentZoneId` (18/18) | — |

## maps/markers/markers-2-5-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12817 | `category` (12817/12817); `did` (12817/12817); `id` (12817/12817); `label` (12817/12817); `latitude` (12817/12817); `longitude` (12817/12817); `parentZoneId` (12817/12817) | — |

## maps/markers/markers-2-5-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 29900 | `category` (29900/29900); `did` (29900/29900); `id` (29900/29900); `label` (29900/29900); `latitude` (29900/29900); `longitude` (29900/29900); `parentZoneId` (29900/29900) | — |

## maps/markers/markers-2-5-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14368 | `category` (14368/14368); `did` (14368/14368); `id` (14368/14368); `label` (14368/14368); `latitude` (14368/14368); `longitude` (14368/14368); `parentZoneId` (14368/14368) | — |

## maps/markers/markers-2-5-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3537 | `category` (3537/3537); `did` (3537/3537); `id` (3537/3537); `label` (3537/3537); `latitude` (3537/3537); `longitude` (3537/3537); `parentZoneId` (3537/3537) | — |

## maps/markers/markers-2-5-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11400 | `category` (11400/11400); `did` (11400/11400); `id` (11400/11400); `label` (11400/11400); `latitude` (11400/11400); `longitude` (11400/11400); `parentZoneId` (11400/11400) | — |

## maps/markers/markers-2-5-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 556 | `category` (556/556); `did` (556/556); `id` (556/556); `label` (556/556); `latitude` (556/556); `longitude` (556/556); `parentZoneId` (556/556) | — |

## maps/markers/markers-2-6-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8710 | `category` (8710/8710); `did` (8710/8710); `id` (8710/8710); `label` (8710/8710); `latitude` (8710/8710); `longitude` (8710/8710); `parentZoneId` (8710/8710) | — |

## maps/markers/markers-2-6-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 18269 | `category` (18269/18269); `did` (18269/18269); `id` (18269/18269); `label` (18269/18269); `latitude` (18269/18269); `longitude` (18269/18269); `parentZoneId` (18269/18269) | — |

## maps/markers/markers-2-6-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 21716 | `category` (21716/21716); `did` (21716/21716); `id` (21716/21716); `label` (21716/21716); `latitude` (21716/21716); `longitude` (21716/21716); `parentZoneId` (21716/21716) | — |

## maps/markers/markers-2-6-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20602 | `category` (20602/20602); `did` (20602/20602); `id` (20602/20602); `label` (20602/20602); `latitude` (20602/20602); `longitude` (20602/20602); `parentZoneId` (20602/20602) | — |

## maps/markers/markers-2-6-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 504 | `category` (504/504); `did` (504/504); `id` (504/504); `label` (504/504); `latitude` (504/504); `longitude` (504/504); `parentZoneId` (504/504) | — |

## maps/markers/markers-2-6-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 224 | `category` (224/224); `did` (224/224); `id` (224/224); `label` (224/224); `latitude` (224/224); `longitude` (224/224); `parentZoneId` (224/224) | — |

## maps/markers/markers-2-6-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 16061 | `category` (16061/16061); `did` (16061/16061); `id` (16061/16061); `label` (16061/16061); `latitude` (16061/16061); `longitude` (16061/16061); `parentZoneId` (16061/16061) | — |

## maps/markers/markers-2-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 29396 | `category` (29396/29396); `did` (29396/29396); `id` (29396/29396); `label` (29396/29396); `latitude` (29396/29396); `longitude` (29396/29396); `parentZoneId` (29396/29396) | — |

## maps/markers/markers-2-6-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 26404 | `category` (26404/26404); `did` (26404/26404); `id` (26404/26404); `label` (26404/26404); `latitude` (26404/26404); `longitude` (26404/26404); `parentZoneId` (26404/26404) | — |

## maps/markers/markers-2-6-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15101 | `category` (15101/15101); `did` (15101/15101); `id` (15101/15101); `label` (15101/15101); `latitude` (15101/15101); `longitude` (15101/15101); `parentZoneId` (15101/15101) | — |

## maps/markers/markers-2-6-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 19701 | `category` (19701/19701); `did` (19701/19701); `id` (19701/19701); `label` (19701/19701); `latitude` (19701/19701); `longitude` (19701/19701); `parentZoneId` (19701/19701) | — |

## maps/markers/markers-2-6-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14322 | `category` (14322/14322); `did` (14322/14322); `id` (14322/14322); `label` (14322/14322); `latitude` (14322/14322); `longitude` (14322/14322); `parentZoneId` (14322/14322) | — |

## maps/markers/markers-2-7-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 19575 | `category` (19575/19575); `did` (19575/19575); `id` (19575/19575); `label` (19575/19575); `latitude` (19575/19575); `longitude` (19575/19575); `parentZoneId` (19575/19575) | — |

## maps/markers/markers-2-7-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15963 | `category` (15963/15963); `did` (15963/15963); `id` (15963/15963); `label` (15963/15963); `latitude` (15963/15963); `longitude` (15963/15963); `parentZoneId` (15963/15963) | — |

## maps/markers/markers-2-7-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14788 | `category` (14788/14788); `did` (14788/14788); `id` (14788/14788); `label` (14788/14788); `latitude` (14788/14788); `longitude` (14788/14788); `parentZoneId` (14788/14788) | — |

## maps/markers/markers-2-7-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 43 | `category` (43/43); `did` (43/43); `id` (43/43); `label` (43/43); `latitude` (43/43); `longitude` (43/43); `parentZoneId` (43/43) | — |

## maps/markers/markers-2-7-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 96 | `category` (96/96); `did` (96/96); `id` (96/96); `label` (96/96); `latitude` (96/96); `longitude` (96/96); `parentZoneId` (96/96) | — |

## maps/markers/markers-2-7-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7353 | `category` (7353/7353); `did` (7353/7353); `id` (7353/7353); `label` (7353/7353); `latitude` (7353/7353); `longitude` (7353/7353); `parentZoneId` (7353/7353) | — |

## maps/markers/markers-2-7-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20518 | `category` (20518/20518); `did` (20518/20518); `id` (20518/20518); `label` (20518/20518); `latitude` (20518/20518); `longitude` (20518/20518); `parentZoneId` (20518/20518) | — |

## maps/markers/markers-2-7-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23191 | `category` (23191/23191); `did` (23191/23191); `id` (23191/23191); `label` (23191/23191); `latitude` (23191/23191); `longitude` (23191/23191); `parentZoneId` (23191/23191) | — |

## maps/markers/markers-2-7-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11492 | `category` (11492/11492); `did` (11492/11492); `id` (11492/11492); `label` (11492/11492); `latitude` (11492/11492); `longitude` (11492/11492); `parentZoneId` (11492/11492) | — |

## maps/markers/markers-2-7-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 13402 | `category` (13402/13402); `did` (13402/13402); `id` (13402/13402); `label` (13402/13402); `latitude` (13402/13402); `longitude` (13402/13402); `parentZoneId` (13402/13402) | — |

## maps/markers/markers-2-7-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5757 | `category` (5757/5757); `did` (5757/5757); `id` (5757/5757); `label` (5757/5757); `latitude` (5757/5757); `longitude` (5757/5757); `parentZoneId` (5757/5757) | — |

## maps/markers/markers-2-8-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7088 | `category` (7088/7088); `did` (7088/7088); `id` (7088/7088); `label` (7088/7088); `latitude` (7088/7088); `longitude` (7088/7088); `parentZoneId` (7088/7088) | — |

## maps/markers/markers-2-8-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14793 | `category` (14793/14793); `did` (14793/14793); `id` (14793/14793); `label` (14793/14793); `latitude` (14793/14793); `longitude` (14793/14793); `parentZoneId` (14793/14793) | — |

## maps/markers/markers-2-8-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15410 | `category` (15410/15410); `did` (15410/15410); `id` (15410/15410); `label` (15410/15410); `latitude` (15410/15410); `longitude` (15410/15410); `parentZoneId` (15410/15410) | — |

## maps/markers/markers-2-8-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 800 | `category` (800/800); `did` (800/800); `id` (800/800); `label` (800/800); `latitude` (800/800); `longitude` (800/800); `parentZoneId` (800/800) | — |

## maps/markers/markers-2-8-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 266 | `category` (266/266); `did` (266/266); `id` (266/266); `label` (266/266); `latitude` (266/266); `longitude` (266/266); `parentZoneId` (266/266) | — |

## maps/markers/markers-2-8-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 253 | `category` (253/253); `did` (253/253); `id` (253/253); `label` (253/253); `latitude` (253/253); `longitude` (253/253); `parentZoneId` (253/253) | — |

## maps/markers/markers-2-8-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1159 | `category` (1159/1159); `did` (1159/1159); `id` (1159/1159); `label` (1159/1159); `latitude` (1159/1159); `longitude` (1159/1159); `parentZoneId` (1159/1159) | — |

## maps/markers/markers-2-9-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15 | `category` (15/15); `did` (15/15); `id` (15/15); `label` (15/15); `latitude` (15/15); `longitude` (15/15); `parentZoneId` (15/15) | — |

## maps/markers/markers-2-9-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3148 | `category` (3148/3148); `did` (3148/3148); `id` (3148/3148); `label` (3148/3148); `latitude` (3148/3148); `longitude` (3148/3148); `parentZoneId` (3148/3148) | — |

## maps/markers/markers-2-9-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 33141 | `category` (33141/33141); `did` (33141/33141); `id` (33141/33141); `label` (33141/33141); `latitude` (33141/33141); `longitude` (33141/33141); `parentZoneId` (33141/33141) | — |

## maps/markers/markers-2-9-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 938 | `category` (938/938); `did` (938/938); `id` (938/938); `label` (938/938); `latitude` (938/938); `longitude` (938/938); `parentZoneId` (938/938) | — |

## maps/markers/markers-2-9-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 94 | `category` (94/94); `did` (94/94); `id` (94/94); `label` (94/94); `latitude` (94/94); `longitude` (94/94); `parentZoneId` (94/94) | — |

## maps/markers/markers-2-9-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3678 | `category` (3678/3678); `did` (3678/3678); `id` (3678/3678); `label` (3678/3678); `latitude` (3678/3678); `longitude` (3678/3678); `parentZoneId` (3678/3678) | — |

## maps/markers/markers-3-0-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11 | `category` (11/11); `did` (11/11); `id` (11/11); `label` (11/11); `latitude` (11/11); `longitude` (11/11); `parentZoneId` (11/11) | — |

## maps/markers/markers-3-1-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 628 | `category` (628/628); `did` (628/628); `id` (628/628); `label` (628/628); `latitude` (628/628); `longitude` (628/628); `parentZoneId` (628/628) | — |

## maps/markers/markers-3-1-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 173 | `category` (173/173); `did` (173/173); `id` (173/173); `label` (173/173); `latitude` (173/173); `longitude` (173/173); `parentZoneId` (173/173) | — |

## maps/markers/markers-3-1-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 341 | `category` (341/341); `did` (341/341); `id` (341/341); `label` (341/341); `latitude` (341/341); `longitude` (341/341); `parentZoneId` (341/341) | — |

## maps/markers/markers-3-10-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 30 | `category` (30/30); `did` (30/30); `id` (30/30); `label` (30/30); `latitude` (30/30); `longitude` (30/30); `parentZoneId` (30/30) | — |

## maps/markers/markers-3-10-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 749 | `category` (749/749); `did` (749/749); `id` (749/749); `label` (749/749); `latitude` (749/749); `longitude` (749/749); `parentZoneId` (749/749) | — |

## maps/markers/markers-3-10-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1316 | `category` (1316/1316); `did` (1316/1316); `id` (1316/1316); `label` (1316/1316); `latitude` (1316/1316); `longitude` (1316/1316); `parentZoneId` (1316/1316) | — |

## maps/markers/markers-3-10-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14446 | `category` (14446/14446); `did` (14446/14446); `id` (14446/14446); `label` (14446/14446); `latitude` (14446/14446); `longitude` (14446/14446); `parentZoneId` (14446/14446) | — |

## maps/markers/markers-3-10-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 31706 | `category` (31706/31706); `did` (31706/31706); `id` (31706/31706); `label` (31706/31706); `latitude` (31706/31706); `longitude` (31706/31706); `parentZoneId` (31706/31706) | — |

## maps/markers/markers-3-10-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 28583 | `category` (28583/28583); `did` (28583/28583); `id` (28583/28583); `label` (28583/28583); `latitude` (28583/28583); `longitude` (28583/28583); `parentZoneId` (28583/28583) | — |

## maps/markers/markers-3-10-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1167 | `category` (1167/1167); `did` (1167/1167); `id` (1167/1167); `label` (1167/1167); `latitude` (1167/1167); `longitude` (1167/1167); `parentZoneId` (1167/1167) | — |

## maps/markers/markers-3-10-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3788 | `category` (3788/3788); `did` (3788/3788); `id` (3788/3788); `label` (3788/3788); `latitude` (3788/3788); `longitude` (3788/3788); `parentZoneId` (3788/3788) | — |

## maps/markers/markers-3-11-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4095 | `category` (4095/4095); `did` (4095/4095); `id` (4095/4095); `label` (4095/4095); `latitude` (4095/4095); `longitude` (4095/4095); `parentZoneId` (4095/4095) | — |

## maps/markers/markers-3-11-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 260 | `category` (260/260); `did` (260/260); `id` (260/260); `label` (260/260); `latitude` (260/260); `longitude` (260/260); `parentZoneId` (260/260) | — |

## maps/markers/markers-3-11-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 67 | `category` (67/67); `did` (67/67); `id` (67/67); `label` (67/67); `latitude` (67/67); `longitude` (67/67); `parentZoneId` (67/67) | — |

## maps/markers/markers-3-12-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 210 | `category` (210/210); `did` (210/210); `id` (210/210); `label` (210/210); `latitude` (210/210); `longitude` (210/210); `parentZoneId` (210/210) | — |

## maps/markers/markers-3-13-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 52 | `category` (52/52); `did` (52/52); `id` (52/52); `label` (52/52); `latitude` (52/52); `longitude` (52/52); `parentZoneId` (52/52) | — |

## maps/markers/markers-3-14-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 13 | `category` (13/13); `did` (13/13); `id` (13/13); `label` (13/13); `latitude` (13/13); `longitude` (13/13); `parentZoneId` (13/13) | — |

## maps/markers/markers-3-15-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 72 | `category` (72/72); `did` (72/72); `id` (72/72); `label` (72/72); `latitude` (72/72); `longitude` (72/72); `parentZoneId` (72/72) | — |

## maps/markers/markers-3-15-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 383 | `category` (383/383); `did` (383/383); `id` (383/383); `label` (383/383); `latitude` (383/383); `longitude` (383/383); `parentZoneId` (383/383) | — |

## maps/markers/markers-3-15-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1339 | `category` (1339/1339); `did` (1339/1339); `id` (1339/1339); `label` (1339/1339); `latitude` (1339/1339); `longitude` (1339/1339); `parentZoneId` (1339/1339) | — |

## maps/markers/markers-3-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 186 | `category` (186/186); `did` (186/186); `id` (186/186); `label` (186/186); `latitude` (186/186); `longitude` (186/186); `parentZoneId` (186/186) | — |

## maps/markers/markers-3-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 552 | `category` (552/552); `did` (552/552); `id` (552/552); `label` (552/552); `latitude` (552/552); `longitude` (552/552); `parentZoneId` (552/552) | — |

## maps/markers/markers-3-4-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 258 | `category` (258/258); `did` (258/258); `id` (258/258); `label` (258/258); `latitude` (258/258); `longitude` (258/258); `parentZoneId` (258/258) | — |

## maps/markers/markers-3-4-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 112 | `category` (112/112); `did` (112/112); `id` (112/112); `label` (112/112); `latitude` (112/112); `longitude` (112/112); `parentZoneId` (112/112) | — |

## maps/markers/markers-3-5-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 260 | `category` (260/260); `did` (260/260); `id` (260/260); `label` (260/260); `latitude` (260/260); `longitude` (260/260); `parentZoneId` (260/260) | — |

## maps/markers/markers-3-5-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 167 | `category` (167/167); `did` (167/167); `id` (167/167); `label` (167/167); `latitude` (167/167); `longitude` (167/167); `parentZoneId` (167/167) | — |

## maps/markers/markers-3-5-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7010 | `category` (7010/7010); `did` (7010/7010); `id` (7010/7010); `label` (7010/7010); `latitude` (7010/7010); `longitude` (7010/7010); `parentZoneId` (7010/7010) | — |

## maps/markers/markers-3-5-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1711 | `category` (1711/1711); `did` (1711/1711); `id` (1711/1711); `label` (1711/1711); `latitude` (1711/1711); `longitude` (1711/1711); `parentZoneId` (1711/1711) | — |

## maps/markers/markers-3-5-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 296 | `category` (296/296); `did` (296/296); `id` (296/296); `label` (296/296); `latitude` (296/296); `longitude` (296/296); `parentZoneId` (296/296) | — |

## maps/markers/markers-3-5-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 365 | `category` (365/365); `did` (365/365); `id` (365/365); `label` (365/365); `latitude` (365/365); `longitude` (365/365); `parentZoneId` (365/365) | — |

## maps/markers/markers-3-6-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1567 | `category` (1567/1567); `did` (1567/1567); `id` (1567/1567); `label` (1567/1567); `latitude` (1567/1567); `longitude` (1567/1567); `parentZoneId` (1567/1567) | — |

## maps/markers/markers-3-6-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 13463 | `category` (13463/13463); `did` (13463/13463); `id` (13463/13463); `label` (13463/13463); `latitude` (13463/13463); `longitude` (13463/13463); `parentZoneId` (13463/13463) | — |

## maps/markers/markers-3-6-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 11374 | `category` (11374/11374); `did` (11374/11374); `id` (11374/11374); `label` (11374/11374); `latitude` (11374/11374); `longitude` (11374/11374); `parentZoneId` (11374/11374) | — |

## maps/markers/markers-3-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6164 | `category` (6164/6164); `did` (6164/6164); `id` (6164/6164); `label` (6164/6164); `latitude` (6164/6164); `longitude` (6164/6164); `parentZoneId` (6164/6164) | — |

## maps/markers/markers-3-7-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 725 | `category` (725/725); `did` (725/725); `id` (725/725); `label` (725/725); `latitude` (725/725); `longitude` (725/725); `parentZoneId` (725/725) | — |

## maps/markers/markers-3-7-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 29 | `category` (29/29); `did` (29/29); `id` (29/29); `label` (29/29); `latitude` (29/29); `longitude` (29/29); `parentZoneId` (29/29) | — |

## maps/markers/markers-3-7-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 263 | `category` (263/263); `did` (263/263); `id` (263/263); `label` (263/263); `latitude` (263/263); `longitude` (263/263); `parentZoneId` (263/263) | — |

## maps/markers/markers-3-7-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15044 | `category` (15044/15044); `did` (15044/15044); `id` (15044/15044); `label` (15044/15044); `latitude` (15044/15044); `longitude` (15044/15044); `parentZoneId` (15044/15044) | — |

## maps/markers/markers-3-7-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5499 | `category` (5499/5499); `did` (5499/5499); `id` (5499/5499); `label` (5499/5499); `latitude` (5499/5499); `longitude` (5499/5499); `parentZoneId` (5499/5499) | — |

## maps/markers/markers-3-7-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8826 | `category` (8826/8826); `did` (8826/8826); `id` (8826/8826); `label` (8826/8826); `latitude` (8826/8826); `longitude` (8826/8826); `parentZoneId` (8826/8826) | — |

## maps/markers/markers-3-8-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 37 | `category` (37/37); `did` (37/37); `id` (37/37); `label` (37/37); `latitude` (37/37); `longitude` (37/37); `parentZoneId` (37/37) | — |

## maps/markers/markers-3-8-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 33709 | `category` (33709/33709); `did` (33709/33709); `id` (33709/33709); `label` (33709/33709); `latitude` (33709/33709); `longitude` (33709/33709); `parentZoneId` (33709/33709) | — |

## maps/markers/markers-3-8-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2660 | `category` (2660/2660); `did` (2660/2660); `id` (2660/2660); `label` (2660/2660); `latitude` (2660/2660); `longitude` (2660/2660); `parentZoneId` (2660/2660) | — |

## maps/markers/markers-3-8-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 43844 | `category` (43844/43844); `did` (43844/43844); `id` (43844/43844); `label` (43844/43844); `latitude` (43844/43844); `longitude` (43844/43844); `parentZoneId` (43844/43844) | — |

## maps/markers/markers-3-8-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 915 | `category` (915/915); `did` (915/915); `id` (915/915); `label` (915/915); `latitude` (915/915); `longitude` (915/915); `parentZoneId` (915/915) | — |

## maps/markers/markers-3-9-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 123 | `category` (123/123); `did` (123/123); `id` (123/123); `label` (123/123); `latitude` (123/123); `longitude` (123/123); `parentZoneId` (123/123) | — |

## maps/markers/markers-3-9-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 54 | `category` (54/54); `did` (54/54); `id` (54/54); `label` (54/54); `latitude` (54/54); `longitude` (54/54); `parentZoneId` (54/54) | — |

## maps/markers/markers-3-9-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23841 | `category` (23841/23841); `did` (23841/23841); `id` (23841/23841); `label` (23841/23841); `latitude` (23841/23841); `longitude` (23841/23841); `parentZoneId` (23841/23841) | — |

## maps/markers/markers-3-9-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2866 | `category` (2866/2866); `did` (2866/2866); `id` (2866/2866); `label` (2866/2866); `latitude` (2866/2866); `longitude` (2866/2866); `parentZoneId` (2866/2866) | — |

## maps/markers/markers-3-9-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 26332 | `category` (26332/26332); `did` (26332/26332); `id` (26332/26332); `label` (26332/26332); `latitude` (26332/26332); `longitude` (26332/26332); `parentZoneId` (26332/26332) | — |

## maps/markers/markers-3-9-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15326 | `category` (15326/15326); `did` (15326/15326); `id` (15326/15326); `label` (15326/15326); `latitude` (15326/15326); `longitude` (15326/15326); `parentZoneId` (15326/15326) | — |

## maps/markers/markers-4-0-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 705 | `category` (705/705); `did` (705/705); `id` (705/705); `label` (705/705); `latitude` (705/705); `longitude` (705/705); `parentZoneId` (705/705) | — |

## maps/markers/markers-4-0-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 183 | `category` (183/183); `did` (183/183); `id` (183/183); `label` (183/183); `latitude` (183/183); `longitude` (183/183); `parentZoneId` (183/183) | — |

## maps/markers/markers-4-1-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4369 | `category` (4369/4369); `did` (4369/4369); `id` (4369/4369); `label` (4369/4369); `latitude` (4369/4369); `longitude` (4369/4369); `parentZoneId` (4369/4369) | — |

## maps/markers/markers-4-1-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10851 | `category` (10851/10851); `did` (10851/10851); `id` (10851/10851); `label` (10851/10851); `latitude` (10851/10851); `longitude` (10851/10851); `parentZoneId` (10851/10851) | — |

## maps/markers/markers-4-1-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 434 | `category` (434/434); `did` (434/434); `id` (434/434); `label` (434/434); `latitude` (434/434); `longitude` (434/434); `parentZoneId` (434/434) | — |

## maps/markers/markers-4-10-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 18 | `category` (18/18); `did` (18/18); `id` (18/18); `label` (18/18); `latitude` (18/18); `longitude` (18/18); `parentZoneId` (18/18) | — |

## maps/markers/markers-4-10-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8680 | `category` (8680/8680); `did` (8680/8680); `id` (8680/8680); `label` (8680/8680); `latitude` (8680/8680); `longitude` (8680/8680); `parentZoneId` (8680/8680) | — |

## maps/markers/markers-4-10-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20832 | `category` (20832/20832); `did` (20832/20832); `id` (20832/20832); `label` (20832/20832); `latitude` (20832/20832); `longitude` (20832/20832); `parentZoneId` (20832/20832) | — |

## maps/markers/markers-4-10-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 21042 | `category` (21042/21042); `did` (21042/21042); `id` (21042/21042); `label` (21042/21042); `latitude` (21042/21042); `longitude` (21042/21042); `parentZoneId` (21042/21042) | — |

## maps/markers/markers-4-10-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4544 | `category` (4544/4544); `did` (4544/4544); `id` (4544/4544); `label` (4544/4544); `latitude` (4544/4544); `longitude` (4544/4544); `parentZoneId` (4544/4544) | — |

## maps/markers/markers-4-11-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 295 | `category` (295/295); `did` (295/295); `id` (295/295); `label` (295/295); `latitude` (295/295); `longitude` (295/295); `parentZoneId` (295/295) | — |

## maps/markers/markers-4-11-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1 | `category` (1/1); `did` (1/1); `id` (1/1); `label` (1/1); `latitude` (1/1); `longitude` (1/1); `parentZoneId` (1/1) | — |

## maps/markers/markers-4-11-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 18801 | `category` (18801/18801); `did` (18801/18801); `id` (18801/18801); `label` (18801/18801); `latitude` (18801/18801); `longitude` (18801/18801); `parentZoneId` (18801/18801) | — |

## maps/markers/markers-4-11-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20502 | `category` (20502/20502); `did` (20502/20502); `id` (20502/20502); `label` (20502/20502); `latitude` (20502/20502); `longitude` (20502/20502); `parentZoneId` (20502/20502) | — |

## maps/markers/markers-4-11-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8551 | `category` (8551/8551); `did` (8551/8551); `id` (8551/8551); `label` (8551/8551); `latitude` (8551/8551); `longitude` (8551/8551); `parentZoneId` (8551/8551) | — |

## maps/markers/markers-4-11-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 986 | `category` (986/986); `did` (986/986); `id` (986/986); `label` (986/986); `latitude` (986/986); `longitude` (986/986); `parentZoneId` (986/986) | — |

## maps/markers/markers-4-12-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 83 | `category` (83/83); `did` (83/83); `id` (83/83); `label` (83/83); `latitude` (83/83); `longitude` (83/83); `parentZoneId` (83/83) | — |

## maps/markers/markers-4-12-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 274 | `category` (274/274); `did` (274/274); `id` (274/274); `label` (274/274); `latitude` (274/274); `longitude` (274/274); `parentZoneId` (274/274) | — |

## maps/markers/markers-4-12-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1616 | `category` (1616/1616); `did` (1616/1616); `id` (1616/1616); `label` (1616/1616); `latitude` (1616/1616); `longitude` (1616/1616); `parentZoneId` (1616/1616) | — |

## maps/markers/markers-4-12-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 201 | `category` (201/201); `did` (201/201); `id` (201/201); `label` (201/201); `latitude` (201/201); `longitude` (201/201); `parentZoneId` (201/201) | — |

## maps/markers/markers-4-12-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 16456 | `category` (16456/16456); `did` (16456/16456); `id` (16456/16456); `label` (16456/16456); `latitude` (16456/16456); `longitude` (16456/16456); `parentZoneId` (16456/16456) | — |

## maps/markers/markers-4-12-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 31098 | `category` (31098/31098); `did` (31098/31098); `id` (31098/31098); `label` (31098/31098); `latitude` (31098/31098); `longitude` (31098/31098); `parentZoneId` (31098/31098) | — |

## maps/markers/markers-4-12-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8348 | `category` (8348/8348); `did` (8348/8348); `id` (8348/8348); `label` (8348/8348); `latitude` (8348/8348); `longitude` (8348/8348); `parentZoneId` (8348/8348) | — |

## maps/markers/markers-4-13-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 37 | `category` (37/37); `did` (37/37); `id` (37/37); `label` (37/37); `latitude` (37/37); `longitude` (37/37); `parentZoneId` (37/37) | — |

## maps/markers/markers-4-13-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8 | `category` (8/8); `did` (8/8); `id` (8/8); `label` (8/8); `latitude` (8/8); `longitude` (8/8); `parentZoneId` (8/8) | — |

## maps/markers/markers-4-13-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5 | `category` (5/5); `did` (5/5); `id` (5/5); `label` (5/5); `latitude` (5/5); `longitude` (5/5); `parentZoneId` (5/5) | — |

## maps/markers/markers-4-13-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9067 | `category` (9067/9067); `did` (9067/9067); `id` (9067/9067); `label` (9067/9067); `latitude` (9067/9067); `longitude` (9067/9067); `parentZoneId` (9067/9067) | — |

## maps/markers/markers-4-13-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 17953 | `category` (17953/17953); `did` (17953/17953); `id` (17953/17953); `label` (17953/17953); `latitude` (17953/17953); `longitude` (17953/17953); `parentZoneId` (17953/17953) | — |

## maps/markers/markers-4-13-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4208 | `category` (4208/4208); `did` (4208/4208); `id` (4208/4208); `label` (4208/4208); `latitude` (4208/4208); `longitude` (4208/4208); `parentZoneId` (4208/4208) | — |

## maps/markers/markers-4-14-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 56 | `category` (56/56); `did` (56/56); `id` (56/56); `label` (56/56); `latitude` (56/56); `longitude` (56/56); `parentZoneId` (56/56) | — |

## maps/markers/markers-4-14-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1 | `category` (1/1); `did` (1/1); `id` (1/1); `label` (1/1); `latitude` (1/1); `longitude` (1/1); `parentZoneId` (1/1) | — |

## maps/markers/markers-4-14-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 967 | `category` (967/967); `did` (967/967); `id` (967/967); `label` (967/967); `latitude` (967/967); `longitude` (967/967); `parentZoneId` (967/967) | — |

## maps/markers/markers-4-14-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1913 | `category` (1913/1913); `did` (1913/1913); `id` (1913/1913); `label` (1913/1913); `latitude` (1913/1913); `longitude` (1913/1913); `parentZoneId` (1913/1913) | — |

## maps/markers/markers-4-15-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 775 | `category` (775/775); `did` (775/775); `id` (775/775); `label` (775/775); `latitude` (775/775); `longitude` (775/775); `parentZoneId` (775/775) | — |

## maps/markers/markers-4-15-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1696 | `category` (1696/1696); `did` (1696/1696); `id` (1696/1696); `label` (1696/1696); `latitude` (1696/1696); `longitude` (1696/1696); `parentZoneId` (1696/1696) | — |

## maps/markers/markers-4-15-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 693 | `category` (693/693); `did` (693/693); `id` (693/693); `label` (693/693); `latitude` (693/693); `longitude` (693/693); `parentZoneId` (693/693) | — |

## maps/markers/markers-4-15-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 409 | `category` (409/409); `did` (409/409); `id` (409/409); `label` (409/409); `latitude` (409/409); `longitude` (409/409); `parentZoneId` (409/409) | — |

## maps/markers/markers-4-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1951 | `category` (1951/1951); `did` (1951/1951); `id` (1951/1951); `label` (1951/1951); `latitude` (1951/1951); `longitude` (1951/1951); `parentZoneId` (1951/1951) | — |

## maps/markers/markers-4-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1742 | `category` (1742/1742); `did` (1742/1742); `id` (1742/1742); `label` (1742/1742); `latitude` (1742/1742); `longitude` (1742/1742); `parentZoneId` (1742/1742) | — |

## maps/markers/markers-4-15-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 12 | `category` (12/12); `did` (12/12); `id` (12/12); `label` (12/12); `latitude` (12/12); `longitude` (12/12); `parentZoneId` (12/12) | — |

## maps/markers/markers-4-15-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 454 | `category` (454/454); `did` (454/454); `id` (454/454); `label` (454/454); `latitude` (454/454); `longitude` (454/454); `parentZoneId` (454/454) | — |

## maps/markers/markers-4-15-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 140 | `category` (140/140); `did` (140/140); `id` (140/140); `label` (140/140); `latitude` (140/140); `longitude` (140/140); `parentZoneId` (140/140) | — |

## maps/markers/markers-4-15-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 804 | `category` (804/804); `did` (804/804); `id` (804/804); `label` (804/804); `latitude` (804/804); `longitude` (804/804); `parentZoneId` (804/804) | — |

## maps/markers/markers-4-2-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 46 | `category` (46/46); `did` (46/46); `id` (46/46); `label` (46/46); `latitude` (46/46); `longitude` (46/46); `parentZoneId` (46/46) | — |

## maps/markers/markers-4-2-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7 | `category` (7/7); `did` (7/7); `id` (7/7); `label` (7/7); `latitude` (7/7); `longitude` (7/7); `parentZoneId` (7/7) | — |

## maps/markers/markers-4-2-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8376 | `category` (8376/8376); `did` (8376/8376); `id` (8376/8376); `label` (8376/8376); `latitude` (8376/8376); `longitude` (8376/8376); `parentZoneId` (8376/8376) | — |

## maps/markers/markers-4-2-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5 | `category` (5/5); `did` (5/5); `id` (5/5); `label` (5/5); `latitude` (5/5); `longitude` (5/5); `parentZoneId` (5/5) | — |

## maps/markers/markers-4-3-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5 | `category` (5/5); `did` (5/5); `id` (5/5); `label` (5/5); `latitude` (5/5); `longitude` (5/5); `parentZoneId` (5/5) | — |

## maps/markers/markers-4-3-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2755 | `category` (2755/2755); `did` (2755/2755); `id` (2755/2755); `label` (2755/2755); `latitude` (2755/2755); `longitude` (2755/2755); `parentZoneId` (2755/2755) | — |

## maps/markers/markers-4-3-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6373 | `category` (6373/6373); `did` (6373/6373); `id` (6373/6373); `label` (6373/6373); `latitude` (6373/6373); `longitude` (6373/6373); `parentZoneId` (6373/6373) | — |

## maps/markers/markers-4-4-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 89935 | `category` (89935/89935); `did` (89935/89935); `id` (89935/89935); `label` (89935/89935); `latitude` (89935/89935); `longitude` (89935/89935); `parentZoneId` (89935/89935) | — |

## maps/markers/markers-4-4-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 64958 | `category` (64958/64958); `did` (64958/64958); `id` (64958/64958); `label` (64958/64958); `latitude` (64958/64958); `longitude` (64958/64958); `parentZoneId` (64958/64958) | — |

## maps/markers/markers-4-5-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6418 | `category` (6418/6418); `did` (6418/6418); `id` (6418/6418); `label` (6418/6418); `latitude` (6418/6418); `longitude` (6418/6418); `parentZoneId` (6418/6418) | — |

## maps/markers/markers-4-5-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 79578 | `category` (79578/79578); `did` (79578/79578); `id` (79578/79578); `label` (79578/79578); `latitude` (79578/79578); `longitude` (79578/79578); `parentZoneId` (79578/79578) | — |

## maps/markers/markers-4-5-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 57578 | `category` (57578/57578); `did` (57578/57578); `id` (57578/57578); `label` (57578/57578); `latitude` (57578/57578); `longitude` (57578/57578); `parentZoneId` (57578/57578) | — |

## maps/markers/markers-4-6-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 57 | `category` (57/57); `did` (57/57); `id` (57/57); `label` (57/57); `latitude` (57/57); `longitude` (57/57); `parentZoneId` (57/57) | — |

## maps/markers/markers-4-6-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7 | `category` (7/7); `did` (7/7); `id` (7/7); `label` (7/7); `latitude` (7/7); `longitude` (7/7); `parentZoneId` (7/7) | — |

## maps/markers/markers-4-6-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3145 | `category` (3145/3145); `did` (3145/3145); `id` (3145/3145); `label` (3145/3145); `latitude` (3145/3145); `longitude` (3145/3145); `parentZoneId` (3145/3145) | — |

## maps/markers/markers-4-6-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 47634 | `category` (47634/47634); `did` (47634/47634); `id` (47634/47634); `label` (47634/47634); `latitude` (47634/47634); `longitude` (47634/47634); `parentZoneId` (47634/47634) | — |

## maps/markers/markers-4-6-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23537 | `category` (23537/23537); `did` (23537/23537); `id` (23537/23537); `label` (23537/23537); `latitude` (23537/23537); `longitude` (23537/23537); `parentZoneId` (23537/23537) | — |

## maps/markers/markers-4-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9348 | `category` (9348/9348); `did` (9348/9348); `id` (9348/9348); `label` (9348/9348); `latitude` (9348/9348); `longitude` (9348/9348); `parentZoneId` (9348/9348) | — |

## maps/markers/markers-4-7-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 131 | `category` (131/131); `did` (131/131); `id` (131/131); `label` (131/131); `latitude` (131/131); `longitude` (131/131); `parentZoneId` (131/131) | — |

## maps/markers/markers-4-7-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 238 | `category` (238/238); `did` (238/238); `id` (238/238); `label` (238/238); `latitude` (238/238); `longitude` (238/238); `parentZoneId` (238/238) | — |

## maps/markers/markers-4-7-2.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 273 | `category` (273/273); `did` (273/273); `id` (273/273); `label` (273/273); `latitude` (273/273); `longitude` (273/273); `parentZoneId` (273/273) | — |

## maps/markers/markers-4-7-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 28595 | `category` (28595/28595); `did` (28595/28595); `id` (28595/28595); `label` (28595/28595); `latitude` (28595/28595); `longitude` (28595/28595); `parentZoneId` (28595/28595) | — |

## maps/markers/markers-4-7-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 6479 | `category` (6479/6479); `did` (6479/6479); `id` (6479/6479); `label` (6479/6479); `latitude` (6479/6479); `longitude` (6479/6479); `parentZoneId` (6479/6479) | — |

## maps/markers/markers-4-8-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 342 | `category` (342/342); `did` (342/342); `id` (342/342); `label` (342/342); `latitude` (342/342); `longitude` (342/342); `parentZoneId` (342/342) | — |

## maps/markers/markers-4-8-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 72261 | `category` (72261/72261); `did` (72261/72261); `id` (72261/72261); `label` (72261/72261); `latitude` (72261/72261); `longitude` (72261/72261); `parentZoneId` (72261/72261) | — |

## maps/markers/markers-4-8-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4953 | `category` (4953/4953); `did` (4953/4953); `id` (4953/4953); `label` (4953/4953); `latitude` (4953/4953); `longitude` (4953/4953); `parentZoneId` (4953/4953) | — |

## maps/markers/markers-4-9-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 46649 | `category` (46649/46649); `did` (46649/46649); `id` (46649/46649); `label` (46649/46649); `latitude` (46649/46649); `longitude` (46649/46649); `parentZoneId` (46649/46649) | — |

## maps/markers/markers-4-9-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 5049 | `category` (5049/5049); `did` (5049/5049); `id` (5049/5049); `label` (5049/5049); `latitude` (5049/5049); `longitude` (5049/5049); `parentZoneId` (5049/5049) | — |

## maps/markers/markers-4-9-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 65 | `category` (65/65); `did` (65/65); `id` (65/65); `label` (65/65); `latitude` (65/65); `longitude` (65/65); `parentZoneId` (65/65) | — |

## maps/markers/markers-5-0-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 36317 | `category` (36317/36317); `did` (36317/36317); `id` (36317/36317); `label` (36317/36317); `latitude` (36317/36317); `longitude` (36317/36317); `parentZoneId` (36317/36317) | — |

## maps/markers/markers-5-0-1.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 197 | `category` (197/197); `did` (197/197); `id` (197/197); `label` (197/197); `latitude` (197/197); `longitude` (197/197); `parentZoneId` (197/197) | — |

## maps/markers/markers-5-0-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 395 | `category` (395/395); `did` (395/395); `id` (395/395); `label` (395/395); `latitude` (395/395); `longitude` (395/395); `parentZoneId` (395/395) | — |

## maps/markers/markers-5-0-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2090 | `category` (2090/2090); `did` (2090/2090); `id` (2090/2090); `label` (2090/2090); `latitude` (2090/2090); `longitude` (2090/2090); `parentZoneId` (2090/2090) | — |

## maps/markers/markers-5-0-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 927 | `category` (927/927); `did` (927/927); `id` (927/927); `label` (927/927); `latitude` (927/927); `longitude` (927/927); `parentZoneId` (927/927) | — |

## maps/markers/markers-5-0-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 964 | `category` (964/964); `did` (964/964); `id` (964/964); `label` (964/964); `latitude` (964/964); `longitude` (964/964); `parentZoneId` (964/964) | — |

## maps/markers/markers-5-0-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2625 | `category` (2625/2625); `did` (2625/2625); `id` (2625/2625); `label` (2625/2625); `latitude` (2625/2625); `longitude` (2625/2625); `parentZoneId` (2625/2625) | — |

## maps/markers/markers-5-1-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 44 | `category` (44/44); `did` (44/44); `id` (44/44); `label` (44/44); `latitude` (44/44); `longitude` (44/44); `parentZoneId` (44/44) | — |

## maps/markers/markers-5-1-10.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 23 | `category` (23/23); `did` (23/23); `id` (23/23); `label` (23/23); `latitude` (23/23); `longitude` (23/23); `parentZoneId` (23/23) | — |

## maps/markers/markers-5-1-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 100 | `category` (100/100); `did` (100/100); `id` (100/100); `label` (100/100); `latitude` (100/100); `longitude` (100/100); `parentZoneId` (100/100) | — |

## maps/markers/markers-5-1-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 155 | `category` (155/155); `did` (155/155); `id` (155/155); `label` (155/155); `latitude` (155/155); `longitude` (155/155); `parentZoneId` (155/155) | — |

## maps/markers/markers-5-1-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10877 | `category` (10877/10877); `did` (10877/10877); `id` (10877/10877); `label` (10877/10877); `latitude` (10877/10877); `longitude` (10877/10877); `parentZoneId` (10877/10877) | — |

## maps/markers/markers-5-1-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15177 | `category` (15177/15177); `did` (15177/15177); `id` (15177/15177); `label` (15177/15177); `latitude` (15177/15177); `longitude` (15177/15177); `parentZoneId` (15177/15177) | — |

## maps/markers/markers-5-11-11.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 95 | `category` (95/95); `did` (95/95); `id` (95/95); `label` (95/95); `latitude` (95/95); `longitude` (95/95); `parentZoneId` (95/95) | — |

## maps/markers/markers-5-13-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4 | `category` (4/4); `did` (4/4); `id` (4/4); `label` (4/4); `latitude` (4/4); `longitude` (4/4); `parentZoneId` (4/4) | — |

## maps/markers/markers-5-15-12.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 725 | `category` (725/725); `did` (725/725); `id` (725/725); `label` (725/725); `latitude` (725/725); `longitude` (725/725); `parentZoneId` (725/725) | — |

## maps/markers/markers-5-15-13.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 874 | `category` (874/874); `did` (874/874); `id` (874/874); `label` (874/874); `latitude` (874/874); `longitude` (874/874); `parentZoneId` (874/874) | — |

## maps/markers/markers-5-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 2099 | `category` (2099/2099); `did` (2099/2099); `id` (2099/2099); `label` (2099/2099); `latitude` (2099/2099); `longitude` (2099/2099); `parentZoneId` (2099/2099) | — |

## maps/markers/markers-5-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1055 | `category` (1055/1055); `did` (1055/1055); `id` (1055/1055); `label` (1055/1055); `latitude` (1055/1055); `longitude` (1055/1055); `parentZoneId` (1055/1055) | — |

## maps/markers/markers-5-2-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 3420 | `category` (3420/3420); `did` (3420/3420); `id` (3420/3420); `label` (3420/3420); `latitude` (3420/3420); `longitude` (3420/3420); `parentZoneId` (3420/3420) | — |

## maps/markers/markers-5-2-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8218 | `category` (8218/8218); `did` (8218/8218); `id` (8218/8218); `label` (8218/8218); `latitude` (8218/8218); `longitude` (8218/8218); `parentZoneId` (8218/8218) | — |

## maps/markers/markers-5-2-9.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 109 | `category` (109/109); `did` (109/109); `id` (109/109); `label` (109/109); `latitude` (109/109); `longitude` (109/109); `parentZoneId` (109/109) | — |

## maps/markers/markers-5-3-0.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 138 | `category` (138/138); `did` (138/138); `id` (138/138); `label` (138/138); `latitude` (138/138); `longitude` (138/138); `parentZoneId` (138/138) | — |

## maps/markers/markers-5-3-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1104 | `category` (1104/1104); `did` (1104/1104); `id` (1104/1104); `label` (1104/1104); `latitude` (1104/1104); `longitude` (1104/1104); `parentZoneId` (1104/1104) | — |

## maps/markers/markers-5-3-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 98 | `category` (98/98); `did` (98/98); `id` (98/98); `label` (98/98); `latitude` (98/98); `longitude` (98/98); `parentZoneId` (98/98) | — |

## maps/markers/markers-5-3-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 124 | `category` (124/124); `did` (124/124); `id` (124/124); `label` (124/124); `latitude` (124/124); `longitude` (124/124); `parentZoneId` (124/124) | — |

## maps/markers/markers-5-3-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10732 | `category` (10732/10732); `did` (10732/10732); `id` (10732/10732); `label` (10732/10732); `latitude` (10732/10732); `longitude` (10732/10732); `parentZoneId` (10732/10732) | — |

## maps/markers/markers-5-4-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 35656 | `category` (35656/35656); `did` (35656/35656); `id` (35656/35656); `label` (35656/35656); `latitude` (35656/35656); `longitude` (35656/35656); `parentZoneId` (35656/35656) | — |

## maps/markers/markers-5-4-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 25479 | `category` (25479/25479); `did` (25479/25479); `id` (25479/25479); `label` (25479/25479); `latitude` (25479/25479); `longitude` (25479/25479); `parentZoneId` (25479/25479) | — |

## maps/markers/markers-5-4-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 82609 | `category` (82609/82609); `did` (82609/82609); `id` (82609/82609); `label` (82609/82609); `latitude` (82609/82609); `longitude` (82609/82609); `parentZoneId` (82609/82609) | — |

## maps/markers/markers-5-4-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 61485 | `category` (61485/61485); `did` (61485/61485); `id` (61485/61485); `label` (61485/61485); `latitude` (61485/61485); `longitude` (61485/61485); `parentZoneId` (61485/61485) | — |

## maps/markers/markers-5-4-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 119649 | `category` (119649/119649); `did` (119649/119649); `id` (119649/119649); `label` (119649/119649); `latitude` (119649/119649); `longitude` (119649/119649); `parentZoneId` (119649/119649) | — |

## maps/markers/markers-5-4-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 37906 | `category` (37906/37906); `did` (37906/37906); `id` (37906/37906); `label` (37906/37906); `latitude` (37906/37906); `longitude` (37906/37906); `parentZoneId` (37906/37906) | — |

## maps/markers/markers-5-5-3.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 10156 | `category` (10156/10156); `did` (10156/10156); `id` (10156/10156); `label` (10156/10156); `latitude` (10156/10156); `longitude` (10156/10156); `parentZoneId` (10156/10156) | — |

## maps/markers/markers-5-5-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 9422 | `category` (9422/9422); `did` (9422/9422); `id` (9422/9422); `label` (9422/9422); `latitude` (9422/9422); `longitude` (9422/9422); `parentZoneId` (9422/9422) | — |

## maps/markers/markers-5-5-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 96813 | `category` (96813/96813); `did` (96813/96813); `id` (96813/96813); `label` (96813/96813); `latitude` (96813/96813); `longitude` (96813/96813); `parentZoneId` (96813/96813) | — |

## maps/markers/markers-5-5-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 102941 | `category` (102941/102941); `did` (102941/102941); `id` (102941/102941); `label` (102941/102941); `latitude` (102941/102941); `longitude` (102941/102941); `parentZoneId` (102941/102941) | — |

## maps/markers/markers-5-5-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 103114 | `category` (103114/103114); `did` (103114/103114); `id` (103114/103114); `label` (103114/103114); `latitude` (103114/103114); `longitude` (103114/103114); `parentZoneId` (103114/103114) | — |

## maps/markers/markers-5-5-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 48417 | `category` (48417/48417); `did` (48417/48417); `id` (48417/48417); `label` (48417/48417); `latitude` (48417/48417); `longitude` (48417/48417); `parentZoneId` (48417/48417) | — |

## maps/markers/markers-5-6-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4456 | `category` (4456/4456); `did` (4456/4456); `id` (4456/4456); `label` (4456/4456); `latitude` (4456/4456); `longitude` (4456/4456); `parentZoneId` (4456/4456) | — |

## maps/markers/markers-5-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 103612 | `category` (103612/103612); `did` (103612/103612); `id` (103612/103612); `label` (103612/103612); `latitude` (103612/103612); `longitude` (103612/103612); `parentZoneId` (103612/103612) | — |

## maps/markers/markers-5-6-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 89479 | `category` (89479/89479); `did` (89479/89479); `id` (89479/89479); `label` (89479/89479); `latitude` (89479/89479); `longitude` (89479/89479); `parentZoneId` (89479/89479) | — |

## maps/markers/markers-5-6-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 64505 | `category` (64505/64505); `did` (64505/64505); `id` (64505/64505); `label` (64505/64505); `latitude` (64505/64505); `longitude` (64505/64505); `parentZoneId` (64505/64505) | — |

## maps/markers/markers-5-6-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 32961 | `category` (32961/32961); `did` (32961/32961); `id` (32961/32961); `label` (32961/32961); `latitude` (32961/32961); `longitude` (32961/32961); `parentZoneId` (32961/32961) | — |

## maps/markers/markers-5-7-4.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 15563 | `category` (15563/15563); `did` (15563/15563); `id` (15563/15563); `label` (15563/15563); `latitude` (15563/15563); `longitude` (15563/15563); `parentZoneId` (15563/15563) | — |

## maps/markers/markers-5-7-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 89179 | `category` (89179/89179); `did` (89179/89179); `id` (89179/89179); `label` (89179/89179); `latitude` (89179/89179); `longitude` (89179/89179); `parentZoneId` (89179/89179) | — |

## maps/markers/markers-5-7-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 81132 | `category` (81132/81132); `did` (81132/81132); `id` (81132/81132); `label` (81132/81132); `latitude` (81132/81132); `longitude` (81132/81132); `parentZoneId` (81132/81132) | — |

## maps/markers/markers-5-7-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 14033 | `category` (14033/14033); `did` (14033/14033); `id` (14033/14033); `label` (14033/14033); `latitude` (14033/14033); `longitude` (14033/14033); `parentZoneId` (14033/14033) | — |

## maps/markers/markers-5-7-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 20138 | `category` (20138/20138); `did` (20138/20138); `id` (20138/20138); `label` (20138/20138); `latitude` (20138/20138); `longitude` (20138/20138); `parentZoneId` (20138/20138) | — |

## maps/markers/markers-5-8-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 50053 | `category` (50053/50053); `did` (50053/50053); `id` (50053/50053); `label` (50053/50053); `latitude` (50053/50053); `longitude` (50053/50053); `parentZoneId` (50053/50053) | — |

## maps/markers/markers-5-8-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 90527 | `category` (90527/90527); `did` (90527/90527); `id` (90527/90527); `label` (90527/90527); `latitude` (90527/90527); `longitude` (90527/90527); `parentZoneId` (90527/90527) | — |

## maps/markers/markers-5-8-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 28672 | `category` (28672/28672); `did` (28672/28672); `id` (28672/28672); `label` (28672/28672); `latitude` (28672/28672); `longitude` (28672/28672); `parentZoneId` (28672/28672) | — |

## maps/markers/markers-5-8-8.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 185 | `category` (185/185); `did` (185/185); `id` (185/185); `label` (185/185); `latitude` (185/185); `longitude` (185/185); `parentZoneId` (185/185) | — |

## maps/markers/markers-5-9-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 7 | `category` (7/7); `did` (7/7); `id` (7/7); `label` (7/7); `latitude` (7/7); `longitude` (7/7); `parentZoneId` (7/7) | — |

## maps/markers/markers-5-9-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 50 | `category` (50/50); `did` (50/50); `id` (50/50); `label` (50/50); `latitude` (50/50); `longitude` (50/50); `parentZoneId` (50/50) | — |

## maps/markers/markers-6-0-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 202 | `category` (202/202); `did` (202/202); `id` (202/202); `label` (202/202); `latitude` (202/202); `longitude` (202/202); `parentZoneId` (202/202) | — |

## maps/markers/markers-6-15-14.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1532 | `category` (1532/1532); `did` (1532/1532); `id` (1532/1532); `label` (1532/1532); `latitude` (1532/1532); `longitude` (1532/1532); `parentZoneId` (1532/1532) | — |

## maps/markers/markers-6-15-15.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 1712 | `category` (1712/1712); `did` (1712/1712); `id` (1712/1712); `label` (1712/1712); `latitude` (1712/1712); `longitude` (1712/1712); `parentZoneId` (1712/1712) | — |

## maps/markers/markers-6-3-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 13386 | `category` (13386/13386); `did` (13386/13386); `id` (13386/13386); `label` (13386/13386); `latitude` (13386/13386); `longitude` (13386/13386); `parentZoneId` (13386/13386) | — |

## maps/markers/markers-6-3-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 4341 | `category` (4341/4341); `did` (4341/4341); `id` (4341/4341); `label` (4341/4341); `latitude` (4341/4341); `longitude` (4341/4341); `parentZoneId` (4341/4341) | — |

## maps/markers/markers-6-4-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 35458 | `category` (35458/35458); `did` (35458/35458); `id` (35458/35458); `label` (35458/35458); `latitude` (35458/35458); `longitude` (35458/35458); `parentZoneId` (35458/35458) | — |

## maps/markers/markers-6-4-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 53272 | `category` (53272/53272); `did` (53272/53272); `id` (53272/53272); `label` (53272/53272); `latitude` (53272/53272); `longitude` (53272/53272); `parentZoneId` (53272/53272) | — |

## maps/markers/markers-6-4-7.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 436 | `category` (436/436); `did` (436/436); `id` (436/436); `label` (436/436); `latitude` (436/436); `longitude` (436/436); `parentZoneId` (436/436) | — |

## maps/markers/markers-6-5-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 54372 | `category` (54372/54372); `did` (54372/54372); `id` (54372/54372); `label` (54372/54372); `latitude` (54372/54372); `longitude` (54372/54372); `parentZoneId` (54372/54372) | — |

## maps/markers/markers-6-5-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 56479 | `category` (56479/56479); `did` (56479/56479); `id` (56479/56479); `label` (56479/56479); `latitude` (56479/56479); `longitude` (56479/56479); `parentZoneId` (56479/56479) | — |

## maps/markers/markers-6-6-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 72528 | `category` (72528/72528); `did` (72528/72528); `id` (72528/72528); `label` (72528/72528); `latitude` (72528/72528); `longitude` (72528/72528); `parentZoneId` (72528/72528) | — |

## maps/markers/markers-6-6-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 8086 | `category` (8086/8086); `did` (8086/8086); `id` (8086/8086); `label` (8086/8086); `latitude` (8086/8086); `longitude` (8086/8086); `parentZoneId` (8086/8086) | — |

## maps/markers/markers-6-7-5.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 350 | `category` (350/350); `did` (350/350); `id` (350/350); `label` (350/350); `latitude` (350/350); `longitude` (350/350); `parentZoneId` (350/350) | — |

## maps/markers/markers-6-7-6.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `markers` | 1 | — | `marker` |
| `markers/marker` | 125 | `category` (125/125); `did` (125/125); `id` (125/125); `label` (125/125); `latitude` (125/125); `longitude` (125/125); `parentZoneId` (125/125) | — |

## labels/de/allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/de/barterers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3077 | `key` (3077/3077); `value` (3077/3077) | — |

## labels/de/birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 470 | `key` (470/470); `value` (470/470) | — |

## labels/de/classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 24 | `key` (24/24); `value` (24/24) | — |

## labels/de/collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 29 | `key` (29/29); `value` (29/29) | — |

## labels/de/colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 53 | `key` (53/53); `value` (53/53) | — |

## labels/de/crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 34 | `key` (34/34); `value` (34/34) | — |

## labels/de/deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 45408 | `key` (45408/45408); `value` (45408/45408) | — |

## labels/de/dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1324 | `key` (1324/1324); `value` (1324/1324) | — |

## labels/de/effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42462 | `key` (42462/42462); `value` (42462/42462) | — |

## labels/de/emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 546 | `key` (546/546); `value` (546/546) | — |

## labels/de/enum-AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/de/enum-AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 202 | `key` (202/202); `value` (202/202) | — |

## labels/de/enum-Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/de/enum-BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 124 | `key` (124/124); `value` (124/124) | — |

## labels/de/enum-CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/de/enum-CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/de/enum-CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 512 | `key` (512/512); `value` (512/512) | — |

## labels/de/enum-DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/de/enum-DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/de/enum-DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/de/enum-DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/de/enum-DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 10 | `key` (10/10); `value` (10/10) | — |

## labels/de/enum-EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/de/enum-EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 27 | `key` (27/27); `value` (27/27) | — |

## labels/de/enum-GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/de/enum-GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 21 | `key` (21/21); `value` (21/21) | — |

## labels/de/enum-Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/de/enum-GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/de/enum-HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/de/enum-HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 37 | `key` (37/37); `value` (37/37) | — |

## labels/de/enum-HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 913 | `key` (913/913); `value` (913/913) | — |

## labels/de/enum-ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 279 | `key` (279/279); `value` (279/279) | — |

## labels/de/enum-ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5 | `key` (5/5); `value` (5/5) | — |

## labels/de/enum-ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/de/enum-LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 127 | `key` (127/127); `value` (127/127) | — |

## labels/de/enum-LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/de/enum-MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 59 | `key` (59/59); `value` (59/59) | — |

## labels/de/enum-MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 26 | `key` (26/26); `value` (26/26) | — |

## labels/de/enum-MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 12 | `key` (12/12); `value` (12/12) | — |

## labels/de/enum-PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/de/enum-PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 28 | `key` (28/28); `value` (28/28) | — |

## labels/de/enum-PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/de/enum-QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 472 | `key` (472/472); `value` (472/472) | — |

## labels/de/enum-QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/de/enum-RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/de/enum-RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/de/enum-Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 132 | `key` (132/132); `value` (132/132) | — |

## labels/de/enum-SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/de/enum-SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/de/enum-SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51 | `key` (51/51); `value` (51/51) | — |

## labels/de/enum-SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 13 | `key` (13/13); `value` (13/13) | — |

## labels/de/enum-Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/de/enum-SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 510 | `key` (510/510); `value` (510/510) | — |

## labels/de/enum-TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 18 | `key` (18/18); `value` (18/18) | — |

## labels/de/enum-TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 32 | `key` (32/32); `value` (32/32) | — |

## labels/de/enum-TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 22 | `key` (22/22); `value` (22/22) | — |

## labels/de/enum-TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 54 | `key` (54/54); `value` (54/54) | — |

## labels/de/enum-TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/de/enum-VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/de/enum-WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 38 | `key` (38/38); `value` (38/38) | — |

## labels/de/enum-WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/de/enum-WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 19 | `key` (19/19); `value` (19/19) | — |

## labels/de/factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 281 | `key` (281/281); `value` (281/281) | — |

## labels/de/geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 772 | `key` (772/772); `value` (772/772) | — |

## labels/de/hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/de/housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3716 | `key` (3716/3716); `value` (3716/3716) | — |

## labels/de/instances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3106 | `key` (3106/3106); `value` (3106/3106) | — |

## labels/de/items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 232552 | `key` (232552/232552); `value` (232552/232552) | — |

## labels/de/itemsSets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3513 | `key` (3513/3513); `value` (3513/3513) | — |

## labels/de/landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2810 | `key` (2810/2810); `value` (2810/2810) | — |

## labels/de/legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/de/legendaryTitles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 421 | `key` (421/421); `value` (421/421) | — |

## labels/de/mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20831 | `key` (20831/20831); `value` (20831/20831) | — |

## labels/de/monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/de/nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 110 | `key` (110/110); `value` (110/110) | — |

## labels/de/nonImbuedLegacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 33 | `key` (33/33); `value` (33/33) | — |

## labels/de/npc.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20978 | `key` (20978/20978); `value` (20978/20978) | — |

## labels/de/parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 209 | `key` (209/209); `value` (209/209) | — |

## labels/de/perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 90 | `key` (90/90); `value` (90/90) | — |

## labels/de/pip.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/de/portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/de/pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42 | `key` (42/42); `value` (42/42) | — |

## labels/de/quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 225251 | `key` (225251/225251); `value` (225251/225251) | — |

## labels/de/races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/de/recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3192 | `key` (3192/3192); `value` (3192/3192) | — |

## labels/de/relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 893 | `key` (893/893); `value` (893/893) | — |

## labels/de/rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 56 | `key` (56/56); `value` (56/56) | — |

## labels/de/skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20183 | `key` (20183/20183); `value` (20183/20183) | — |

## labels/de/stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5301 | `key` (5301/5301); `value` (5301/5301) | — |

## labels/de/titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9437 | `key` (9437/9437); `value` (9437/9437) | — |

## labels/de/traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/de/traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9637 | `key` (9637/9637); `value` (9637/9637) | — |

## labels/de/travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 396 | `key` (396/396); `value` (396/396) | — |

## labels/de/travelsWeb.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6109 | `key` (6109/6109); `value` (6109/6109) | — |

## labels/de/webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1269 | `key` (1269/1269); `value` (1269/1269) | — |

## labels/en/allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/en/barterers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3077 | `key` (3077/3077); `value` (3077/3077) | — |

## labels/en/birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 470 | `key` (470/470); `value` (470/470) | — |

## labels/en/classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 24 | `key` (24/24); `value` (24/24) | — |

## labels/en/collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 29 | `key` (29/29); `value` (29/29) | — |

## labels/en/colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 53 | `key` (53/53); `value` (53/53) | — |

## labels/en/crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 34 | `key` (34/34); `value` (34/34) | — |

## labels/en/deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 45408 | `key` (45408/45408); `value` (45408/45408) | — |

## labels/en/dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1324 | `key` (1324/1324); `value` (1324/1324) | — |

## labels/en/effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42462 | `key` (42462/42462); `value` (42462/42462) | — |

## labels/en/emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 546 | `key` (546/546); `value` (546/546) | — |

## labels/en/enum-AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/en/enum-AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 202 | `key` (202/202); `value` (202/202) | — |

## labels/en/enum-Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/en/enum-BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 124 | `key` (124/124); `value` (124/124) | — |

## labels/en/enum-CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/en/enum-CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/en/enum-CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 512 | `key` (512/512); `value` (512/512) | — |

## labels/en/enum-DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/en/enum-DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/en/enum-DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/en/enum-DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/en/enum-DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 10 | `key` (10/10); `value` (10/10) | — |

## labels/en/enum-EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/en/enum-EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 27 | `key` (27/27); `value` (27/27) | — |

## labels/en/enum-GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/en/enum-GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 21 | `key` (21/21); `value` (21/21) | — |

## labels/en/enum-Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/en/enum-GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/en/enum-HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/en/enum-HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 37 | `key` (37/37); `value` (37/37) | — |

## labels/en/enum-HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 913 | `key` (913/913); `value` (913/913) | — |

## labels/en/enum-ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 279 | `key` (279/279); `value` (279/279) | — |

## labels/en/enum-ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5 | `key` (5/5); `value` (5/5) | — |

## labels/en/enum-ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/en/enum-LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 127 | `key` (127/127); `value` (127/127) | — |

## labels/en/enum-LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/en/enum-MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 59 | `key` (59/59); `value` (59/59) | — |

## labels/en/enum-MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 26 | `key` (26/26); `value` (26/26) | — |

## labels/en/enum-MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 12 | `key` (12/12); `value` (12/12) | — |

## labels/en/enum-PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/en/enum-PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 28 | `key` (28/28); `value` (28/28) | — |

## labels/en/enum-PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/en/enum-QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 472 | `key` (472/472); `value` (472/472) | — |

## labels/en/enum-QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/en/enum-RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/en/enum-RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/en/enum-Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 132 | `key` (132/132); `value` (132/132) | — |

## labels/en/enum-SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/en/enum-SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/en/enum-SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51 | `key` (51/51); `value` (51/51) | — |

## labels/en/enum-SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 13 | `key` (13/13); `value` (13/13) | — |

## labels/en/enum-Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/en/enum-SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 510 | `key` (510/510); `value` (510/510) | — |

## labels/en/enum-TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 18 | `key` (18/18); `value` (18/18) | — |

## labels/en/enum-TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 32 | `key` (32/32); `value` (32/32) | — |

## labels/en/enum-TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 22 | `key` (22/22); `value` (22/22) | — |

## labels/en/enum-TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 54 | `key` (54/54); `value` (54/54) | — |

## labels/en/enum-TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/en/enum-VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/en/enum-WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 38 | `key` (38/38); `value` (38/38) | — |

## labels/en/enum-WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/en/enum-WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 19 | `key` (19/19); `value` (19/19) | — |

## labels/en/factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 281 | `key` (281/281); `value` (281/281) | — |

## labels/en/geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 772 | `key` (772/772); `value` (772/772) | — |

## labels/en/hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/en/housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3716 | `key` (3716/3716); `value` (3716/3716) | — |

## labels/en/instances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3106 | `key` (3106/3106); `value` (3106/3106) | — |

## labels/en/items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 232552 | `key` (232552/232552); `value` (232552/232552) | — |

## labels/en/itemsSets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3513 | `key` (3513/3513); `value` (3513/3513) | — |

## labels/en/landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2810 | `key` (2810/2810); `value` (2810/2810) | — |

## labels/en/legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/en/legendaryTitles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 421 | `key` (421/421); `value` (421/421) | — |

## labels/en/mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20831 | `key` (20831/20831); `value` (20831/20831) | — |

## labels/en/monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/en/nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 110 | `key` (110/110); `value` (110/110) | — |

## labels/en/nonImbuedLegacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 33 | `key` (33/33); `value` (33/33) | — |

## labels/en/npc.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20978 | `key` (20978/20978); `value` (20978/20978) | — |

## labels/en/parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 209 | `key` (209/209); `value` (209/209) | — |

## labels/en/perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 90 | `key` (90/90); `value` (90/90) | — |

## labels/en/pip.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/en/portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/en/pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42 | `key` (42/42); `value` (42/42) | — |

## labels/en/quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 225251 | `key` (225251/225251); `value` (225251/225251) | — |

## labels/en/races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/en/recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3192 | `key` (3192/3192); `value` (3192/3192) | — |

## labels/en/relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 893 | `key` (893/893); `value` (893/893) | — |

## labels/en/rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 56 | `key` (56/56); `value` (56/56) | — |

## labels/en/skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20183 | `key` (20183/20183); `value` (20183/20183) | — |

## labels/en/stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5342 | `key` (5342/5342); `value` (5342/5342) | — |

## labels/en/titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9437 | `key` (9437/9437); `value` (9437/9437) | — |

## labels/en/traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/en/traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9637 | `key` (9637/9637); `value` (9637/9637) | — |

## labels/en/travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 396 | `key` (396/396); `value` (396/396) | — |

## labels/en/travelsWeb.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6109 | `key` (6109/6109); `value` (6109/6109) | — |

## labels/en/webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1269 | `key` (1269/1269); `value` (1269/1269) | — |

## labels/es/allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/es/barterers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3077 | `key` (3077/3077); `value` (3077/3077) | — |

## labels/es/birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 470 | `key` (470/470); `value` (470/470) | — |

## labels/es/classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 24 | `key` (24/24); `value` (24/24) | — |

## labels/es/collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 29 | `key` (29/29); `value` (29/29) | — |

## labels/es/colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 53 | `key` (53/53); `value` (53/53) | — |

## labels/es/crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 34 | `key` (34/34); `value` (34/34) | — |

## labels/es/deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 45408 | `key` (45408/45408); `value` (45408/45408) | — |

## labels/es/dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1324 | `key` (1324/1324); `value` (1324/1324) | — |

## labels/es/effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42462 | `key` (42462/42462); `value` (42462/42462) | — |

## labels/es/emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 546 | `key` (546/546); `value` (546/546) | — |

## labels/es/enum-AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/es/enum-AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 202 | `key` (202/202); `value` (202/202) | — |

## labels/es/enum-Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/es/enum-BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 124 | `key` (124/124); `value` (124/124) | — |

## labels/es/enum-CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/es/enum-CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/es/enum-CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 512 | `key` (512/512); `value` (512/512) | — |

## labels/es/enum-DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/es/enum-DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/es/enum-DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/es/enum-DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/es/enum-DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 10 | `key` (10/10); `value` (10/10) | — |

## labels/es/enum-EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/es/enum-EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 27 | `key` (27/27); `value` (27/27) | — |

## labels/es/enum-GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/es/enum-GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 21 | `key` (21/21); `value` (21/21) | — |

## labels/es/enum-Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/es/enum-GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/es/enum-HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/es/enum-HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 37 | `key` (37/37); `value` (37/37) | — |

## labels/es/enum-HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 913 | `key` (913/913); `value` (913/913) | — |

## labels/es/enum-ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 279 | `key` (279/279); `value` (279/279) | — |

## labels/es/enum-ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5 | `key` (5/5); `value` (5/5) | — |

## labels/es/enum-ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/es/enum-LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 127 | `key` (127/127); `value` (127/127) | — |

## labels/es/enum-LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/es/enum-MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 59 | `key` (59/59); `value` (59/59) | — |

## labels/es/enum-MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 26 | `key` (26/26); `value` (26/26) | — |

## labels/es/enum-MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 12 | `key` (12/12); `value` (12/12) | — |

## labels/es/enum-PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/es/enum-PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 28 | `key` (28/28); `value` (28/28) | — |

## labels/es/enum-PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/es/enum-QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 472 | `key` (472/472); `value` (472/472) | — |

## labels/es/enum-QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/es/enum-RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/es/enum-RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/es/enum-Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 132 | `key` (132/132); `value` (132/132) | — |

## labels/es/enum-SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/es/enum-SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/es/enum-SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51 | `key` (51/51); `value` (51/51) | — |

## labels/es/enum-SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 13 | `key` (13/13); `value` (13/13) | — |

## labels/es/enum-Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/es/enum-SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 510 | `key` (510/510); `value` (510/510) | — |

## labels/es/enum-TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 18 | `key` (18/18); `value` (18/18) | — |

## labels/es/enum-TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 32 | `key` (32/32); `value` (32/32) | — |

## labels/es/enum-TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 22 | `key` (22/22); `value` (22/22) | — |

## labels/es/enum-TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 54 | `key` (54/54); `value` (54/54) | — |

## labels/es/enum-TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/es/enum-VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/es/enum-WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 38 | `key` (38/38); `value` (38/38) | — |

## labels/es/enum-WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/es/enum-WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 19 | `key` (19/19); `value` (19/19) | — |

## labels/es/factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 281 | `key` (281/281); `value` (281/281) | — |

## labels/es/geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 772 | `key` (772/772); `value` (772/772) | — |

## labels/es/hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/es/housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3716 | `key` (3716/3716); `value` (3716/3716) | — |

## labels/es/instances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3106 | `key` (3106/3106); `value` (3106/3106) | — |

## labels/es/items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 232552 | `key` (232552/232552); `value` (232552/232552) | — |

## labels/es/itemsSets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3513 | `key` (3513/3513); `value` (3513/3513) | — |

## labels/es/landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2810 | `key` (2810/2810); `value` (2810/2810) | — |

## labels/es/legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/es/legendaryTitles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 421 | `key` (421/421); `value` (421/421) | — |

## labels/es/mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20831 | `key` (20831/20831); `value` (20831/20831) | — |

## labels/es/monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/es/nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 110 | `key` (110/110); `value` (110/110) | — |

## labels/es/nonImbuedLegacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 33 | `key` (33/33); `value` (33/33) | — |

## labels/es/npc.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20978 | `key` (20978/20978); `value` (20978/20978) | — |

## labels/es/parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 209 | `key` (209/209); `value` (209/209) | — |

## labels/es/perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 90 | `key` (90/90); `value` (90/90) | — |

## labels/es/pip.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/es/portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/es/pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42 | `key` (42/42); `value` (42/42) | — |

## labels/es/quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 225251 | `key` (225251/225251); `value` (225251/225251) | — |

## labels/es/races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/es/recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3192 | `key` (3192/3192); `value` (3192/3192) | — |

## labels/es/relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 893 | `key` (893/893); `value` (893/893) | — |

## labels/es/rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 56 | `key` (56/56); `value` (56/56) | — |

## labels/es/skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20183 | `key` (20183/20183); `value` (20183/20183) | — |

## labels/es/stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5290 | `key` (5290/5290); `value` (5290/5290) | — |

## labels/es/titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9437 | `key` (9437/9437); `value` (9437/9437) | — |

## labels/es/traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/es/traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9637 | `key` (9637/9637); `value` (9637/9637) | — |

## labels/es/travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 396 | `key` (396/396); `value` (396/396) | — |

## labels/es/travelsWeb.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6109 | `key` (6109/6109); `value` (6109/6109) | — |

## labels/es/webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1269 | `key` (1269/1269); `value` (1269/1269) | — |

## labels/fr/allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/fr/barterers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3077 | `key` (3077/3077); `value` (3077/3077) | — |

## labels/fr/birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 470 | `key` (470/470); `value` (470/470) | — |

## labels/fr/classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 24 | `key` (24/24); `value` (24/24) | — |

## labels/fr/collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 29 | `key` (29/29); `value` (29/29) | — |

## labels/fr/colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 53 | `key` (53/53); `value` (53/53) | — |

## labels/fr/crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 34 | `key` (34/34); `value` (34/34) | — |

## labels/fr/deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 45408 | `key` (45408/45408); `value` (45408/45408) | — |

## labels/fr/dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1324 | `key` (1324/1324); `value` (1324/1324) | — |

## labels/fr/effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42462 | `key` (42462/42462); `value` (42462/42462) | — |

## labels/fr/emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 546 | `key` (546/546); `value` (546/546) | — |

## labels/fr/enum-AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/fr/enum-AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 202 | `key` (202/202); `value` (202/202) | — |

## labels/fr/enum-Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/fr/enum-BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 124 | `key` (124/124); `value` (124/124) | — |

## labels/fr/enum-CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/fr/enum-CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/fr/enum-CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 512 | `key` (512/512); `value` (512/512) | — |

## labels/fr/enum-DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/fr/enum-DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/fr/enum-DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/fr/enum-DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/fr/enum-DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 10 | `key` (10/10); `value` (10/10) | — |

## labels/fr/enum-EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/fr/enum-EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 27 | `key` (27/27); `value` (27/27) | — |

## labels/fr/enum-GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/fr/enum-GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 21 | `key` (21/21); `value` (21/21) | — |

## labels/fr/enum-Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/fr/enum-GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/fr/enum-HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/fr/enum-HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 37 | `key` (37/37); `value` (37/37) | — |

## labels/fr/enum-HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 913 | `key` (913/913); `value` (913/913) | — |

## labels/fr/enum-ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 279 | `key` (279/279); `value` (279/279) | — |

## labels/fr/enum-ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5 | `key` (5/5); `value` (5/5) | — |

## labels/fr/enum-ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/fr/enum-LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 127 | `key` (127/127); `value` (127/127) | — |

## labels/fr/enum-LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/fr/enum-MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 59 | `key` (59/59); `value` (59/59) | — |

## labels/fr/enum-MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 26 | `key` (26/26); `value` (26/26) | — |

## labels/fr/enum-MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 12 | `key` (12/12); `value` (12/12) | — |

## labels/fr/enum-PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/fr/enum-PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 28 | `key` (28/28); `value` (28/28) | — |

## labels/fr/enum-PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/fr/enum-QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 472 | `key` (472/472); `value` (472/472) | — |

## labels/fr/enum-QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/fr/enum-RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/fr/enum-RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/fr/enum-Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 132 | `key` (132/132); `value` (132/132) | — |

## labels/fr/enum-SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/fr/enum-SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/fr/enum-SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51 | `key` (51/51); `value` (51/51) | — |

## labels/fr/enum-SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 13 | `key` (13/13); `value` (13/13) | — |

## labels/fr/enum-Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/fr/enum-SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 510 | `key` (510/510); `value` (510/510) | — |

## labels/fr/enum-TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 18 | `key` (18/18); `value` (18/18) | — |

## labels/fr/enum-TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 32 | `key` (32/32); `value` (32/32) | — |

## labels/fr/enum-TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 22 | `key` (22/22); `value` (22/22) | — |

## labels/fr/enum-TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 54 | `key` (54/54); `value` (54/54) | — |

## labels/fr/enum-TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/fr/enum-VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/fr/enum-WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 38 | `key` (38/38); `value` (38/38) | — |

## labels/fr/enum-WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/fr/enum-WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 19 | `key` (19/19); `value` (19/19) | — |

## labels/fr/factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 281 | `key` (281/281); `value` (281/281) | — |

## labels/fr/geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 772 | `key` (772/772); `value` (772/772) | — |

## labels/fr/hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/fr/housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3716 | `key` (3716/3716); `value` (3716/3716) | — |

## labels/fr/instances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3106 | `key` (3106/3106); `value` (3106/3106) | — |

## labels/fr/items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 232552 | `key` (232552/232552); `value` (232552/232552) | — |

## labels/fr/itemsSets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3513 | `key` (3513/3513); `value` (3513/3513) | — |

## labels/fr/landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2810 | `key` (2810/2810); `value` (2810/2810) | — |

## labels/fr/legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/fr/legendaryTitles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 421 | `key` (421/421); `value` (421/421) | — |

## labels/fr/mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20831 | `key` (20831/20831); `value` (20831/20831) | — |

## labels/fr/monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/fr/nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 110 | `key` (110/110); `value` (110/110) | — |

## labels/fr/nonImbuedLegacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 33 | `key` (33/33); `value` (33/33) | — |

## labels/fr/npc.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20978 | `key` (20978/20978); `value` (20978/20978) | — |

## labels/fr/parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 209 | `key` (209/209); `value` (209/209) | — |

## labels/fr/perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 90 | `key` (90/90); `value` (90/90) | — |

## labels/fr/pip.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/fr/portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/fr/pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42 | `key` (42/42); `value` (42/42) | — |

## labels/fr/quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 225251 | `key` (225251/225251); `value` (225251/225251) | — |

## labels/fr/races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/fr/recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3192 | `key` (3192/3192); `value` (3192/3192) | — |

## labels/fr/relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 893 | `key` (893/893); `value` (893/893) | — |

## labels/fr/rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 56 | `key` (56/56); `value` (56/56) | — |

## labels/fr/skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20183 | `key` (20183/20183); `value` (20183/20183) | — |

## labels/fr/stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5301 | `key` (5301/5301); `value` (5301/5301) | — |

## labels/fr/titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9437 | `key` (9437/9437); `value` (9437/9437) | — |

## labels/fr/traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/fr/traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9637 | `key` (9637/9637); `value` (9637/9637) | — |

## labels/fr/travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 396 | `key` (396/396); `value` (396/396) | — |

## labels/fr/travelsWeb.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6109 | `key` (6109/6109); `value` (6109/6109) | — |

## labels/fr/webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1269 | `key` (1269/1269); `value` (1269/1269) | — |

## labels/ru/allegiances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/ru/barterers.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3077 | `key` (3077/3077); `value` (3077/3077) | — |

## labels/ru/birds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 470 | `key` (470/470); `value` (470/470) | — |

## labels/ru/classes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 24 | `key` (24/24); `value` (24/24) | — |

## labels/ru/collections.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 29 | `key` (29/29); `value` (29/29) | — |

## labels/ru/colors.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 53 | `key` (53/53); `value` (53/53) | — |

## labels/ru/crafting.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 34 | `key` (34/34); `value` (34/34) | — |

## labels/ru/deeds.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 45408 | `key` (45408/45408); `value` (45408/45408) | — |

## labels/ru/dungeons.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1324 | `key` (1324/1324); `value` (1324/1324) | — |

## labels/ru/effects.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42462 | `key` (42462/42462); `value` (42462/42462) | — |

## labels/ru/emotes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 546 | `key` (546/546); `value` (546/546) | — |

## labels/ru/enum-AIHint.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/ru/enum-AgentClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 202 | `key` (202/202); `value` (202/202) | — |

## labels/ru/enum-Alignment.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-AreaEffectAnchorType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-ArmourType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/ru/enum-BillingGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 124 | `key` (124/124); `value` (124/124) | — |

## labels/ru/enum-CharacterSex.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/ru/enum-CraftTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/ru/enum-CraftingUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 512 | `key` (512/512); `value` (512/512) | — |

## labels/ru/enum-DamageQualifier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/ru/enum-DamageType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/ru/enum-DeedCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 85 | `key` (85/85); `value` (85/85) | — |

## labels/ru/enum-DeedType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/ru/enum-DeedUIFilter.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-Difficulty.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 10 | `key` (10/10); `value` (10/10) | — |

## labels/ru/enum-EquipmentCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/ru/enum-EquipmentLocation.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 27 | `key` (27/27); `value` (27/27) | — |

## labels/ru/enum-GambitIconType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/ru/enum-GearSlot.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 21 | `key` (21/21); `value` (21/21) | — |

## labels/ru/enum-Genus.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/ru/enum-GroupSize.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/ru/enum-HouseType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/ru/enum-HousingHookCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 37 | `key` (37/37); `value` (37/37) | — |

## labels/ru/enum-HousingHookID.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 913 | `key` (913/913); `value` (913/913) | — |

## labels/ru/enum-ItemBinding.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-ItemClass.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 279 | `key` (279/279); `value` (279/279) | — |

## labels/ru/enum-ItemQuality.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5 | `key` (5/5); `value` (5/5) | — |

## labels/ru/enum-ItemSturdiness.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/ru/enum-LegendaryTitleCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 127 | `key` (127/127); `value` (127/127) | — |

## labels/ru/enum-LegendaryTitleTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3 | `key` (3/3); `value` (3/3) | — |

## labels/ru/enum-MapNoteType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 59 | `key` (59/59); `value` (59/59) | — |

## labels/ru/enum-MobType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 26 | `key` (26/26); `value` (26/26) | — |

## labels/ru/enum-MountType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 12 | `key` (12/12); `value` (12/12) | — |

## labels/ru/enum-PaperItemCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/ru/enum-PerkUICategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 28 | `key` (28/28); `value` (28/28) | — |

## labels/ru/enum-PipType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/ru/enum-QuestCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 472 | `key` (472/472); `value` (472/472) | — |

## labels/ru/enum-QuestScope.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 7 | `key` (7/7); `value` (7/7) | — |

## labels/ru/enum-RelicType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-ResistCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 15 | `key` (15/15); `value` (15/15) | — |

## labels/ru/enum-RunicTier.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/ru/enum-Size.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-SkillCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 132 | `key` (132/132); `value` (132/132) | — |

## labels/ru/enum-SkillCharacteristicSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/ru/enum-SkillDisplayType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 41 | `key` (41/41); `value` (41/41) | — |

## labels/ru/enum-SkillType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 51 | `key` (51/51); `value` (51/51) | — |

## labels/ru/enum-SocketType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 13 | `key` (13/13); `value` (13/13) | — |

## labels/ru/enum-Species.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/ru/enum-SubSpecies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 510 | `key` (510/510); `value` (510/510) | — |

## labels/ru/enum-TraitGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 18 | `key` (18/18); `value` (18/18) | — |

## labels/ru/enum-TraitNature.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 32 | `key` (32/32); `value` (32/32) | — |

## labels/ru/enum-TraitSubCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 22 | `key` (22/22); `value` (22/22) | — |

## labels/ru/enum-TraitTreeBranchType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 54 | `key` (54/54); `value` (54/54) | — |

## labels/ru/enum-TraitTreeType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 17 | `key` (17/17); `value` (17/17) | — |

## labels/ru/enum-VitalType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 4 | `key` (4/4); `value` (4/4) | — |

## labels/ru/enum-WJEncounterCategory.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 38 | `key` (38/38); `value` (38/38) | — |

## labels/ru/enum-WJInstanceGroup.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 8 | `key` (8/8); `value` (8/8) | — |

## labels/ru/enum-WeaponType.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 19 | `key` (19/19); `value` (19/19) | — |

## labels/ru/factions.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 281 | `key` (281/281); `value` (281/281) | — |

## labels/ru/geoAreas.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 772 | `key` (772/772); `value` (772/772) | — |

## labels/ru/hobbies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6 | `key` (6/6); `value` (6/6) | — |

## labels/ru/housing.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3716 | `key` (3716/3716); `value` (3716/3716) | — |

## labels/ru/instances.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3106 | `key` (3106/3106); `value` (3106/3106) | — |

## labels/ru/items.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 232552 | `key` (232552/232552); `value` (232552/232552) | — |

## labels/ru/itemsSets.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3513 | `key` (3513/3513); `value` (3513/3513) | — |

## labels/ru/landmarks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2810 | `key` (2810/2810); `value` (2810/2810) | — |

## labels/ru/legacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 2 | `key` (2/2); `value` (2/2) | — |

## labels/ru/legendaryTitles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 421 | `key` (421/421); `value` (421/421) | — |

## labels/ru/mobs.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20831 | `key` (20831/20831); `value` (20831/20831) | — |

## labels/ru/monsterClasses.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 14 | `key` (14/14); `value` (14/14) | — |

## labels/ru/nationalities.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 110 | `key` (110/110); `value` (110/110) | — |

## labels/ru/nonImbuedLegacies.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 33 | `key` (33/33); `value` (33/33) | — |

## labels/ru/npc.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20978 | `key` (20978/20978); `value` (20978/20978) | — |

## labels/ru/parchmentMaps.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 209 | `key` (209/209); `value` (209/209) | — |

## labels/ru/perks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 90 | `key` (90/90); `value` (90/90) | — |

## labels/ru/pip.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 25 | `key` (25/25); `value` (25/25) | — |

## labels/ru/portraitFrames.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 113 | `key` (113/113); `value` (113/113) | — |

## labels/ru/pvp.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 42 | `key` (42/42); `value` (42/42) | — |

## labels/ru/quests.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 225251 | `key` (225251/225251); `value` (225251/225251) | — |

## labels/ru/races.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 31 | `key` (31/31); `value` (31/31) | — |

## labels/ru/recipes.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 3192 | `key` (3192/3192); `value` (3192/3192) | — |

## labels/ru/relics.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 893 | `key` (893/893); `value` (893/893) | — |

## labels/ru/rewardsTracks.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 56 | `key` (56/56); `value` (56/56) | — |

## labels/ru/skills.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 20183 | `key` (20183/20183); `value` (20183/20183) | — |

## labels/ru/stats.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 5301 | `key` (5301/5301); `value` (5301/5301) | — |

## labels/ru/titles.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9437 | `key` (9437/9437); `value` (9437/9437) | — |

## labels/ru/traitTrees.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 39 | `key` (39/39); `value` (39/39) | — |

## labels/ru/traits.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 9637 | `key` (9637/9637); `value` (9637/9637) | — |

## labels/ru/travelsMap.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 396 | `key` (396/396); `value` (396/396) | — |

## labels/ru/travelsWeb.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 6109 | `key` (6109/6109); `value` (6109/6109) | — |

## labels/ru/webStoreItems.xml

| Elementpfad | Vorkommen | Sämtliche Attribute (belegt/Elemente) | Kindelemente |
| --- | --- | --- | --- |
| `labels` | 1 | `locale` (1/1) | `label` |
| `labels/label` | 1269 | `key` (1269/1269); `value` (1269/1269) | — |
