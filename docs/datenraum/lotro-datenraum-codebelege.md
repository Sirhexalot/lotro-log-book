# Code evidence index for property semantics

All readable Java files under the named Companion extraction source tree were searched for direct literal `getProperty`/`getPropertyValueByName` accesses. This is a list of occurrences, **not an automatic confirmation of meaning**. Dynamic property names, helper calls and further libraries need separate tracing. A missing occurrence proves no fundamentally unknown meaning. Source tree and installed JARs are separate version records; identical implementation is not generally proven.

Source root: `/Users/adrian/Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation/src/main/java/delta/games/lotro/tools/extraction`

Unreadable source files: 0; concrete paths and errors in the JSON. Where reads failed, the source inventory is explicitly incomplete.

1100 distinct literal property names; 1257 code occurrences. Of 1458 observed property names in the four raw sets, 243 have at least one direct literal access in this source tree.

## Occurrences per property

### `AIActionProbability_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 278 | `Object[] tableArray=(Object[])properties.getProperty("AIActionProbability_Array");` |

### `AIActionProbability_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 283 | `int code=((Integer)entryProps.getProperty("AIActionProbability_Type")).intValue();` |

### `AIActionProbability_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 282 | `float percentage=((Float)entryProps.getProperty("AIActionProbability_Value")).floatValue();` |

### `AIActionTable_Actions`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 150 | `Object[] actionsArray=(Object[])props.getProperty("AIActionTable_Actions");` |

### `AIAction_Chain`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 222 | `Object[] actionChain=(Object[])entryProps.getProperty("AIAction_Chain");` |

### `AIAction_Cooldown`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 170 | `Float cooldown=(Float)entryProps.getProperty("AIAction_Cooldown");` |

### `AIAction_CooldownChannel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 182 | `Integer cooldownChannelCode=(Integer)entryProps.getProperty("AIAction_CooldownChannel");` |

### `AIAction_Probability`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 166 | `Integer probabilityCode=(Integer)entryProps.getProperty("AIAction_Probability");` |

### `AIAction_Recovery`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 227 | `Float recovery=(Float)actionChainEntryProps.getProperty("AIAction_Recovery");` |

### `AIAction_Skill`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 226 | `int skillID=((Integer)actionChainEntryProps.getProperty("AIAction_Skill")).intValue();` |

### `AIAction_TargetCooldown`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 189 | `Float targetCooldown=(Float)entryProps.getProperty("AIAction_TargetCooldown");` |

### `AI_ActionTable`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 97 | `int tableID=((Integer)entryProps.getProperty("AI_ActionTable")).intValue();` |

### `AI_ActionTable_Array`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 88 | `Object[] actionTableArray=(Object[])props.getProperty("AI_ActionTable_Array");` |

### `AI_ActionTable_MaxLevel`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 107 | `Integer maxLevel=(Integer)entryProps.getProperty("AI_ActionTable_MaxLevel");` |

### `AI_ActionTable_MinLevel`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/actions/ActionTablesLoader.java | 102 | `Integer minLevel=(Integer)entryProps.getProperty("AI_ActionTable_MinLevel");` |

### `Accomplishment_Category`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 187 | `Integer categoryId=((Integer)properties.getProperty("Accomplishment_Category"));` |

### `Accomplishment_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/MainDatAchievablesLoader.java | 148 | `Object[] list=(Object[])deedsDirectory.getProperty("Accomplishment_List");` |
| achievables/deeds/DeedsLoader.java | 326 | `Object[] accomplishmentList=(Object[])accomplishmentDirProps.getProperty("Accomplishment_List");` |
| achievables/deeds/DeedsLoader.java | 372 | `Object[] accomplishmentList=(Object[])accomplishmentDirProps.getProperty("Accomplishment_List");` |

### `Accomplishment_MinLevelToStart`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 136 | `minLevel=((Integer)properties.getProperty("Accomplishment_MinLevelToStart"));` |

### `Accomplishment_UIFilter`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 297 | `Integer uiFilterCode=((Integer)properties.getProperty("Accomplishment_UIFilter"));` |

### `Accomplishment_UITab`

Observed raw data classes: 1398, 1788.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 114 | `Integer uiTab=((Integer)properties.getProperty("Accomplishment_UITab"));` |

### `AdvTable_AccomplishmentDirectory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 370 | `int accomplishmentDirectoryId=((Integer)classProps.getProperty("AdvTable_AccomplishmentDirectory")).intValue();` |

### `AdvTable_ArmorDefense_Points_CalcType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 127 | `Integer calcType=(Integer)properties.getProperty("AdvTable_ArmorDefense_Points_CalcType");` |

### `AdvTable_AvailableSkillEntryList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 422 | `Object[] skillsProperties=(Object[])properties.getProperty("AdvTable_AvailableSkillEntryList");` |

### `AdvTable_BaseVitalEntryList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 193 | `Object[] vitalStats=(Object[])levelProperties.getProperty("AdvTable_BaseVitalEntryList");` |

### `AdvTable_BaseVitalValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 197 | `Integer value=(Integer)statProperties.getProperty("AdvTable_BaseVitalValue");` |

### `AdvTable_Class`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 368 | `int classCode=((Integer)classProps.getProperty("AdvTable_Class")).intValue();` |
| characters/CharacterClassDataLoader.java | 81 | `int classCode=((Integer)properties.getProperty("AdvTable_Class")).intValue();` |

### `AdvTable_ClassCharacteristic_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 389 | `Object[] traitsProperties=(Object[])properties.getProperty("AdvTable_ClassCharacteristic_List");` |

### `AdvTable_ClassIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 103 | `int classIconId=((Integer)classInfo.getProperty("AdvTable_ClassIcon")).intValue();` |

### `AdvTable_ClassInfo`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 79 | `PropertiesSet classInfo=(PropertiesSet)properties.getProperty("AdvTable_ClassInfo");` |

### `AdvTable_ClassSmallIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 108 | `Integer classSmallIconId=(Integer)classInfo.getProperty("AdvTable_ClassSmallIcon");` |

### `AdvTable_DerivedStat`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 345 | `Integer targetStatId=(Integer)derivedStatProperties.getProperty("AdvTable_DerivedStat");` |

### `AdvTable_DerivedStat_Configuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 319 | `Object[] derivedStatsProperties=(Object[])properties.getProperty("AdvTable_DerivedStat_Configuration");` |

### `AdvTable_DerivedStat_Formula_Stat`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 350 | `Integer sourceStatId=(Integer)formulaProperties.getProperty("AdvTable_DerivedStat_Formula_Stat");` |

### `AdvTable_DerivedStat_Formula_StatList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 327 | `Object[] formulasProperties=(Object[])derivedStatProperties.getProperty("AdvTable_DerivedStat_Formula_StatList");` |

### `AdvTable_DerivedStat_Formula_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 342 | `float value=((Float)formulaProperties.getProperty("AdvTable_DerivedStat_Formula_Value")).floatValue();` |

### `AdvTable_EvilMLTList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 216 | `Object[] classIds=(Object[])properties.getProperty("AdvTable_EvilMLTList");` |

### `AdvTable_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 189 | `Integer levelInt=(Integer)levelProperties.getProperty("AdvTable_Level");` |
| characters/CharacterClassDataLoader.java | 426 | `int level=((Integer)skillProperties.getProperty("AdvTable_Level")).intValue();` |

### `AdvTable_LevelEntryList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 179 | `Object[] levelsProperties=(Object[])properties.getProperty("AdvTable_LevelEntryList");` |

### `AdvTable_LevelTableList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 363 | `Object[] classIdsArray=(Object[])properties.getProperty("AdvTable_LevelTableList");` |
| characters/CharacterClassDataLoader.java | 510 | `Object[] classIds=(Object[])properties.getProperty("AdvTable_LevelTableList");` |
| misc/MainPerksLoader.java | 70 | `Object[] idsArray=(Object[])mpProps.getProperty("AdvTable_LevelTableList");` |

### `AdvTable_MaxStatEntryList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 213 | `Object[] otherStats=(Object[])levelProperties.getProperty("AdvTable_MaxStatEntryList");` |

### `AdvTable_PerkInventory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 75 | `Integer perkInventoryId=(Integer)mpClassProps.getProperty("AdvTable_PerkInventory");` |

### `AdvTable_RaceCharacteristic_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 187 | `Object[] traitsProperties=(Object[])properties.getProperty("AdvTable_RaceCharacteristic_List");` |

### `AdvTable_Skill`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 427 | `int skillId=((Integer)skillProperties.getProperty("AdvTable_Skill")).intValue();` |

### `AdvTable_StartingInventory_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/InitialGearLoader.java | 68 | `int itemId=((Integer)inventoryElementProps.getProperty("AdvTable_StartingInventory_Item")).intValue();` |

### `AdvTable_StartingInventory_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/InitialGearLoader.java | 60 | `Object[] inventory=(Object[])properties.getProperty("AdvTable_StartingInventory_List");` |

### `AdvTable_StartingInventory_Quantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/InitialGearLoader.java | 65 | `int quantity=((Integer)inventoryElementProps.getProperty("AdvTable_StartingInventory_Quantity")).intValue();` |

### `AdvTable_StartingInventory_RequiredRace`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/InitialGearLoader.java | 71 | `int raceId=((Integer)inventoryElementProps.getProperty("AdvTable_StartingInventory_RequiredRace")).intValue();` |

### `AdvTable_StartingInventory_StartsEquipped`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/InitialGearLoader.java | 64 | `int startsEquipped=((Integer)inventoryElementProps.getProperty("AdvTable_StartingInventory_StartsEquipped")).intValue();` |

### `AdvTable_StatType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 218 | `Integer type=(Integer)statProperties.getProperty("AdvTable_StatType");` |

### `AdvTable_StatValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 217 | `Integer value=(Integer)statProperties.getProperty("AdvTable_StatValue");` |

### `AdvTable_Trait_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 393 | `Integer level=(Integer)traitProperties.getProperty("AdvTable_Trait_Level");` |
| characters/RaceDataLoader.java | 191 | `Integer level=(Integer)traitProperties.getProperty("AdvTable_Trait_Level");` |

### `AdvTable_Trait_Rank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 394 | `Integer rank=(Integer)traitProperties.getProperty("AdvTable_Trait_Rank");` |
| characters/RaceDataLoader.java | 192 | `Integer rank=(Integer)traitProperties.getProperty("AdvTable_Trait_Rank");` |

### `AdvTable_Trait_TrainingCost`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 395 | `Integer trainingCost=(Integer)traitProperties.getProperty("AdvTable_Trait_TrainingCost");` |

### `AdvTable_Trait_WC`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 396 | `int traitId=((Integer)traitProperties.getProperty("AdvTable_Trait_WC")).intValue();` |
| characters/RaceDataLoader.java | 193 | `int traitId=((Integer)traitProperties.getProperty("AdvTable_Trait_WC")).intValue();` |

### `AdvTable_VitalType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/CharacterClassDataLoader.java | 198 | `Integer type=(Integer)statProperties.getProperty("AdvTable_VitalType");` |

### `Agent_Alignment`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 54 | `int alignmentCode=((Integer)props.getProperty("Agent_Alignment")).intValue();` |

### `Agent_Class`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 58 | `int classCode=((Integer)props.getProperty("Agent_Class")).intValue();` |

### `Agent_ClassificationFilter`

Observed raw data classes: 1723, 1724, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 62 | `int classFilterCode=((Integer)props.getProperty("Agent_ClassificationFilter")).intValue();` |

### `Agent_Genus`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 77 | `int genusCode=((Integer)props.getProperty("Agent_Genus")).intValue();` |

### `Agent_ShowSubspecies`

Observed raw data classes: 1723, 4026.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 86 | `Integer showSubSpecies=(Integer)props.getProperty("Agent_ShowSubspecies");` |

### `Agent_Species`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 82 | `int speciesCode=((Integer)props.getProperty("Agent_Species")).intValue();` |
| agents/mobs/MainDatGenericMobLootLoader.java | 112 | `int speciesCode=((Integer)entryProps.getProperty("Agent_Species")).intValue();` |
| geo/markers/classification/MarkerClassifier.java | 279 | `Integer speciesCode=(Integer)props.getProperty("Agent_Species");` |
| loot/QuestItemDirectoryLoader.java | 80 | `int speciesCode=((Integer)props.getProperty("Agent_Species")).intValue();` |

### `Agent_Subspecies`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/ClassificationLoader.java | 89 | `int subSpeciesCode=((Integer)props.getProperty("Agent_Subspecies")).intValue();` |
| agents/mobs/MainDatGenericMobLootLoader.java | 120 | `int subSpeciesCode=((Integer)entryProps.getProperty("Agent_Subspecies")).intValue();` |
| loot/QuestItemDirectoryLoader.java | 83 | `int subSpeciesCode=((Integer)props.getProperty("Agent_Subspecies")).intValue();` |

### `Allegiance_Advancement_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 65 | `int advancementProgressionID=((Integer)properties.getProperty("Allegiance_Advancement_Progression")).intValue();` |

### `Allegiance_Advancement_Progressions_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 155 | `Object[] curveIDs=(Object[])props.getProperty("Allegiance_Advancement_Progressions_Array");` |

### `Allegiance_DeedList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 93 | `Object[] deedIDs=(Object[])properties.getProperty("Allegiance_DeedList");` |

### `Allegiance_Group`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 406 | `Integer groupCode=(Integer)props.getProperty("Allegiance_Group");` |

### `Allegiance_Groups`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 68 | `int groupID=((Integer)properties.getProperty("Allegiance_Groups")).intValue();` |

### `Allegiance_Image`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 78 | `int iconId=((Integer)properties.getProperty("Allegiance_Image")).intValue();` |

### `Allegiance_MinimumLeveltoStart`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 75 | `Integer minLevel=(Integer)properties.getProperty("Allegiance_MinimumLeveltoStart");` |

### `Allegiance_Points`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 405 | `Integer points=(Integer)props.getProperty("Allegiance_Points");` |

### `Allegiance_TravelSkill`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 86 | `Integer travelSkillID=(Integer)properties.getProperty("Allegiance_TravelSkill");` |

### `Allegiance_Type_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| allegiances/MainDatAllegiancesLoader.java | 129 | `Object[] allegianceIds=(Object[])props.getProperty("Allegiance_Type_Array");` |

### `Ambient_MusicType`

Observed raw data classes: 690.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/GeoMusicLoader.java | 86 | `int musicType=((Integer)areaProps.getProperty("Ambient_MusicType")).intValue();` |

### `Area_DID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/BlockMapLoader.java | 76 | `Integer areaDID=(Integer)props.getProperty("Area_DID");` |
| geo/landblocks/LandblockLoader.java | 53 | `Integer areaId=(Integer)props.getProperty("Area_DID"); // Always set?` |

### `Area_Icon`

Observed raw data classes: 690.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 79 | `Integer imageId=(Integer)areaProps.getProperty("Area_Icon");` |
| sounds/GeoMusicLoader.java | 95 | `Integer imageId=(Integer)areaProps.getProperty("Area_Icon");` |

### `Area_PropertyResponseMapDID`

Observed raw data classes: 690.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPropertyResponseMapsLoader.java | 38 | `Integer propertyResponseMapID=(Integer)props.getProperty("Area_PropertyResponseMapDID");` |

### `Area_Region`

Observed raw data classes: 692.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 126 | `int regionId=((Integer)territoryProps.getProperty("Area_Region")).intValue();` |

### `Area_RegionID`

Observed raw data classes: 180.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 154 | `int regionCode=((Integer)regionProps.getProperty("Area_RegionID")).intValue();` |

### `Area_Territory`

Observed raw data classes: 690.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 91 | `Integer territoryId=(Integer)areaProps.getProperty("Area_Territory");` |

### `Aura_ShouldAffectCaster`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AuraEffectLoader.java | 33 | `Integer shouldAffectCasterInt=(Integer)props.getProperty("Aura_ShouldAffectCaster");` |

### `Barter_IsBarterItem`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 90 | `Integer isBarter=(Integer)itemProps.getProperty("Barter_IsBarterItem");` |

### `Barter_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 287 | `Integer itemId=(Integer)itemProps.getProperty("Barter_Item");` |

### `Barter_ItemListArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 242 | `Object[] barterList=(Object[])properties.getProperty("Barter_ItemListArray");` |

### `Barter_ItemQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 288 | `Integer quantity=(Integer)itemProps.getProperty("Barter_ItemQuantity");` |

### `Barter_ItemQuantity_LookupTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 309 | `Integer lookupTableId=(Integer)itemProps.getProperty("Barter_ItemQuantity_LookupTable");` |

### `Barter_ItemUsesMinUsageLevelForCost`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 254 | `Integer useMinLevelInteger=(Integer)toReceiveProps.getProperty("Barter_ItemUsesMinUsageLevelForCost");` |

### `Barter_ProfileArray`

Observed raw data classes: 1723, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 114 | `Object[] barterProfiles=(Object[])properties.getProperty("Barter_ProfileArray");` |

### `Barter_Profile_UseTabs`

Observed raw data classes: 1723, 1724, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 112 | `Integer useTabs=(Integer)properties.getProperty("Barter_Profile_UseTabs");` |

### `Barter_ReputationFaction`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 289 | `Integer factionId=(Integer)itemProps.getProperty("Barter_ReputationFaction");` |

### `Barter_ReputationRewardTier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 290 | `Integer rewardTier=(Integer)itemProps.getProperty("Barter_ReputationRewardTier");` |

### `Bauble_SkillList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/baubles/MainBaublesLoader.java | 52 | `Object[] idsArray=(Object[])props.getProperty("Bauble_SkillList");` |

### `BoS_Available_MaxDifferentTypesOfItems`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 674 | `int maxItems=((Integer)properties.getProperty("BoS_Available_MaxDifferentTypesOfItems")).intValue();` |

### `BoS_Available_MaxQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 672 | `int stackMax=((Integer)properties.getProperty("BoS_Available_MaxQuantity")).intValue();` |

### `Channeling_Duration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 118 | `ret=(Float)props.getProperty("Channeling_Duration");` |

### `CollectionControl_CollectionList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainDatCollectionsLoader.java | 123 | `Object[] collectionsList=(Object[])collectionDirectoryProps.getProperty("CollectionControl_CollectionList");` |

### `Collection_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainDatCollectionsLoader.java | 66 | `int collectionCategory=((Integer)properties.getProperty("Collection_Category")).intValue();` |

### `Collection_DID_PieceList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainDatCollectionsLoader.java | 71 | `Object[] piecesList=(Object[])properties.getProperty("Collection_DID_PieceList");` |

### `Collection_Hide_Entry`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 68 | `Integer hidden=(Integer)properties.getProperty("Collection_Hide_Entry");` |
| skills/pets/CosmeticPetLoader.java | 40 | `int hidden=((Integer)properties.getProperty("Collection_Hide_Entry")).intValue();` |

### `Collection_TreasureDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainDatCollectionsLoader.java | 82 | `int treasureId=((Integer)properties.getProperty("Collection_TreasureDID")).intValue();` |

### `Combat_BaseDPSArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/DPSValueLoader.java | 91 | `Object[] baseValueArray=(Object[])properties.getProperty("Combat_BaseDPSArray");` |

### `Combat_Control_CalcControlInfoArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 54 | `Object[] calcControlInfoArray=(Object[])props.getProperty("Combat_Control_CalcControlInfoArray");` |

### `Combat_Control_CalculationType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 97 | `int calcType=((Integer)calcControlProps.getProperty("Combat_Control_CalculationType")).intValue();` |

### `Combat_Control_EquipmentCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 81 | `Long code=(Long)entryProps.getProperty("Combat_Control_EquipmentCategory");` |

### `Combat_Control_Hard_Cap`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 102 | `int hardCapId=((Integer)calcControlProps.getProperty("Combat_Control_Hard_Cap")).intValue();` |

### `Combat_Control_Rating`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 105 | `int ratingId=((Integer)calcControlProps.getProperty("Combat_Control_Rating")).intValue();` |

### `Combat_Control_SkillCriticalMult_AddMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 85 | `Integer criticalMod=(Integer)entryProps.getProperty("Combat_Control_SkillCriticalMult_AddMod");` |

### `Combat_Control_SkillSuperCriticalMult_AddMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 87 | `Integer superCriticalMod=(Integer)entryProps.getProperty("Combat_Control_SkillSuperCriticalMult_AddMod");` |

### `Combat_Control_Target_Cap`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 108 | `int targetCapId=((Integer)calcControlProps.getProperty("Combat_Control_Target_Cap")).intValue();` |

### `Combat_Control_WeaponDamageMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 89 | `Integer weaponDamageMultiplier=(Integer)entryProps.getProperty("Combat_Control_WeaponDamageMultiplier");` |

### `Combat_Control_WeaponStrikeModifierList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| combat/MainDatCombatLoader.java | 70 | `Object[] entryArray=(Object[])props.getProperty("Combat_Control_WeaponStrikeModifierList");` |

### `Combat_DPSMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/DPSValueLoader.java | 87 | `float factor=((Float)qualityProps.getProperty("Combat_DPSMod")).floatValue();` |

### `Combat_DPS_LUT`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 514 | `Integer dpsLut=(Integer)properties.getProperty("Combat_DPS_LUT");` |
| items/MainDatItemsLoader.java | 616 | `Integer dpsLut=(Integer)properties.getProperty("Combat_DPS_LUT");` |

### `Combat_DamageType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 609 | `int damageTypeEnum=((Integer)properties.getProperty("Combat_DamageType")).intValue();` |

### `Combat_DamageVariance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 601 | `float variance=((Float)properties.getProperty("Combat_DamageVariance")).floatValue();` |

### `Combat_Quality`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/DPSValueLoader.java | 85 | `int qualityCode=((Integer)qualityProps.getProperty("Combat_Quality")).intValue();` |

### `Combat_QualityModArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/DPSValueLoader.java | 81 | `Object[] qualityArray=(Object[])properties.getProperty("Combat_QualityModArray");` |

### `Combat_WeaponSlayerAddMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 365 | `Float value=(Float)props.getProperty("Combat_WeaponSlayerAddMod");` |

### `Combat_WeaponSlayerGenus`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 368 | `Integer genusFlags=(Integer)props.getProperty("Combat_WeaponSlayerGenus");` |

### `Combat_WeaponSpeed`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 651 | `Integer speedCode=(Integer)properties.getProperty("Combat_WeaponSpeed");` |

### `CooldownControl_DurationMapList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/CooldownLoader.java | 25 | `Object[] list=(Object[])props.getProperty("CooldownControl_DurationMapList");` |

### `CooldownControl_DurationType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/CooldownLoader.java | 33 | `int type=((Integer)entryProps.getProperty("CooldownControl_DurationType")).intValue();` |

### `CooldownControl_DurationValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/CooldownLoader.java | 34 | `float value=((Float)entryProps.getProperty("CooldownControl_DurationValue")).floatValue();` |

### `CooldownEffect_CooldownChannel_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/CooldownEffectLoader.java | 48 | `Object[] cooldownChannels=(Object[])effectProps.getProperty("CooldownEffect_CooldownChannel_List");` |

### `CooldownEffect_CooldownMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/CooldownEffectLoader.java | 32 | `float modifier=((Float)effectProps.getProperty("CooldownEffect_CooldownMod")).floatValue();` |

### `CooldownEffect_Skill_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/CooldownEffectLoader.java | 38 | `Object[] skillsList=(Object[])effectProps.getProperty("CooldownEffect_Skill_List");` |

### `CosmeticEntity_CosmeticEntity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pets/CosmeticPetLoader.java | 94 | `Integer cosmeticEntityId=(Integer)sourceProps.getProperty("CosmeticEntity_CosmeticEntity");` |

### `CosmeticEntity_CosmeticPet_ForwardSource`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pets/CosmeticPetLoader.java | 72 | `Integer sourceId=(Integer)modProps.getProperty("CosmeticEntity_CosmeticPet_ForwardSource");` |

### `CosmeticEntity_SkillList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pets/MainPetsCheck.java | 24 | `Object[] cosmeticEntitySkillsList=(Object[])cosmeticEntitiesDirectoryProps.getProperty("CosmeticEntity_SkillList");` |

### `CraftControl_XPRewardArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 403 | `Object[] array=(Object[])properties.getProperty("CraftControl_XPRewardArray");` |

### `CraftControl_XPRewardEnum`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 407 | `Integer key=(Integer)item.getProperty("CraftControl_XPRewardEnum");` |

### `CraftControl_XPRewardValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 408 | `Integer value=(Integer)item.getProperty("CraftControl_XPRewardValue");` |

### `CraftDirectory_CraftGuildArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 61 | `Object[] guildArray=(Object[])props.getProperty("CraftDirectory_CraftGuildArray");` |

### `CraftDirectory_VocationArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 54 | `Object[] vocationArray=(Object[])props.getProperty("CraftDirectory_VocationArray");` |

### `CraftGuild_Faction`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 276 | `int factionId=((Integer)guildProps.getProperty("CraftGuild_Faction")).intValue();` |

### `CraftGuild_Profession`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 277 | `int professionId=((Integer)guildProps.getProperty("CraftGuild_Profession")).intValue();` |

### `CraftProfession_Enabled_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 142 | `int enabledPropertyId=((Integer)professionProps.getProperty("CraftProfession_Enabled_PropertyName")).intValue();` |

### `CraftProfession_ExtraRecipeArray_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 157 | `int extraRecipesPropertyId=((Integer)professionProps.getProperty("CraftProfession_ExtraRecipeArray_PropertyName")).intValue();` |

### `CraftProfession_MasteryLevel_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 145 | `int masteryLevelPropertyId=((Integer)professionProps.getProperty("CraftProfession_MasteryLevel_PropertyName")).intValue();` |

### `CraftProfession_MasteryTitle`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 243 | `int masteryTitleId=((Integer)tierProps.getProperty("CraftProfession_MasteryTitle")).intValue();` |

### `CraftProfession_MasteryXPCap`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 241 | `int masteryXp=((Integer)tierProps.getProperty("CraftProfession_MasteryXPCap")).intValue();` |

### `CraftProfession_MasteryXP_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 148 | `int masteryXpPropertyId=((Integer)professionProps.getProperty("CraftProfession_MasteryXP_PropertyName")).intValue();` |

### `CraftProfession_ProficiencyLevel_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 151 | `int proficiencyLevelPropertyId=((Integer)professionProps.getProperty("CraftProfession_ProficiencyLevel_PropertyName")).intValue();` |

### `CraftProfession_ProficiencyTitle`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 233 | `int proficiencyTitleId=((Integer)tierProps.getProperty("CraftProfession_ProficiencyTitle")).intValue();` |

### `CraftProfession_ProficiencyXPCap`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 231 | `int proficiencyXp=((Integer)tierProps.getProperty("CraftProfession_ProficiencyXPCap")).intValue();` |

### `CraftProfession_ProficiencyXP_PropertyName`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 154 | `int proficiencyXpPropertyId=((Integer)professionProps.getProperty("CraftProfession_ProficiencyXP_PropertyName")).intValue();` |

### `CraftProfession_RecipeArray`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 250 | `Object[] recipesArray=(Object[])tierProps.getProperty("CraftProfession_RecipeArray");` |

### `CraftProfession_Tier`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 219 | `int tierCode=((Integer)tierProps.getProperty("CraftProfession_Tier")).intValue();` |

### `CraftProfession_TierArray`

Observed raw data classes: 1023.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 128 | `Object[] tiersArray=(Object[])professionProps.getProperty("CraftProfession_TierArray");` |

### `CraftRecipe_CooldownDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 97 | `Integer cooldownId=(Integer)properties.getProperty("CraftRecipe_CooldownDuration");` |

### `CraftRecipe_CriticalResultItem`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 198 | `Integer critResultId=(Integer)outputProps.getProperty("CraftRecipe_CriticalResultItem");` |
| crafting/MainDatRecipesLoader.java | 290 | `Integer criticalResultId=(Integer)properties.getProperty("CraftRecipe_CriticalResultItem");` |
| ui/FieldIconsLoader.java | 64 | `Integer critResultId=(Integer)outputProps.getProperty("CraftRecipe_CriticalResultItem");` |
| ui/FieldIconsLoader.java | 91 | `Integer criticalResultId=(Integer)properties.getProperty("CraftRecipe_CriticalResultItem");` |

### `CraftRecipe_CriticalResultItemQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 299 | `Integer quantity=(Integer)properties.getProperty("CraftRecipe_CriticalResultItemQuantity");` |

### `CraftRecipe_CriticalSuccessChance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 306 | `Float critBonus=(Float)properties.getProperty("CraftRecipe_CriticalSuccessChance");` |

### `CraftRecipe_Field_CritResultIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/FieldIconsLoader.java | 67 | `Integer iconId=(Integer)properties.getProperty("CraftRecipe_Field_CritResultIcon");` |
| ui/FieldIconsLoader.java | 94 | `Integer iconId=(Integer)properties.getProperty("CraftRecipe_Field_CritResultIcon");` |

### `CraftRecipe_Field_ResultIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/FieldIconsLoader.java | 60 | `Integer iconId=(Integer)properties.getProperty("CraftRecipe_Field_ResultIcon");` |
| ui/FieldIconsLoader.java | 86 | `Integer iconId=(Integer)properties.getProperty("CraftRecipe_Field_ResultIcon");` |

### `CraftRecipe_Ingredient`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 207 | `Integer ingredientId=(Integer)outputProps.getProperty("CraftRecipe_Ingredient");` |
| crafting/MainDatRecipesLoader.java | 240 | `Integer ingredientId=(Integer)ingredientProperties.getProperty("CraftRecipe_Ingredient");` |

### `CraftRecipe_IngredientCritBonus`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 255 | `Float critBonus=(Float)ingredientProperties.getProperty("CraftRecipe_IngredientCritBonus");` |

### `CraftRecipe_IngredientPack`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 168 | `Integer ingredientPackID=(Integer)properties.getProperty("CraftRecipe_IngredientPack");` |

### `CraftRecipe_IngredientPackQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 171 | `Integer packQuantity=(Integer)properties.getProperty("CraftRecipe_IngredientPackQuantity");` |

### `CraftRecipe_IngredientQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 242 | `Integer quantity=(Integer)ingredientProperties.getProperty("CraftRecipe_IngredientQuantity");` |

### `CraftRecipe_MultiOutputArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 118 | `Object[] multiOutput=(Object[])properties.getProperty("CraftRecipe_MultiOutputArray");` |
| ui/FieldIconsLoader.java | 48 | `Object[] multiOutput=(Object[])properties.getProperty("CraftRecipe_MultiOutputArray");` |

### `CraftRecipe_OneTimeRecipe`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 107 | `Integer singleUse=(Integer)properties.getProperty("CraftRecipe_OneTimeRecipe");` |

### `CraftRecipe_Profession`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 130 | `Integer professionId=(Integer)properties.getProperty("CraftRecipe_Profession");` |

### `CraftRecipe_RequiredCraftGuild`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 148 | `Integer guild=(Integer)properties.getProperty("CraftRecipe_RequiredCraftGuild");` |

### `CraftRecipe_ResultItem`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 190 | `Integer resultId=(Integer)outputProps.getProperty("CraftRecipe_ResultItem");` |
| crafting/MainDatRecipesLoader.java | 273 | `Integer resultId=(Integer)properties.getProperty("CraftRecipe_ResultItem");` |
| ui/FieldIconsLoader.java | 57 | `Integer resultId=(Integer)outputProps.getProperty("CraftRecipe_ResultItem");` |
| ui/FieldIconsLoader.java | 83 | `Integer resultId=(Integer)properties.getProperty("CraftRecipe_ResultItem");` |

### `CraftRecipe_ResultItemQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 280 | `Integer quantity=(Integer)properties.getProperty("CraftRecipe_ResultItemQuantity");` |

### `CraftRecipe_Tier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 218 | `Integer tier=(Integer)properties.getProperty("CraftRecipe_Tier");` |

### `CraftRecipe_TierArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 221 | `Object[] tierArray=(Object[])properties.getProperty("CraftRecipe_TierArray");` |

### `CraftRecipe_UICategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 80 | `Integer categoryIndex=(Integer)properties.getProperty("CraftRecipe_UICategory");` |

### `CraftRecipe_XPReward`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 87 | `Integer xpId=(Integer)properties.getProperty("CraftRecipe_XPReward");` |

### `CraftTrinket_Profession`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 187 | `Integer professionIdInt=(Integer)props.getProperty("CraftTrinket_Profession");` |

### `CraftTrinket_Tier`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 185 | `Integer craftTierCodeInt=(Integer)props.getProperty("CraftTrinket_Tier");` |

### `CraftVocation_ProfessionArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatCraftingLoader.java | 85 | `Object[] professionsArray=(Object[])vocationProps.getProperty("CraftVocation_ProfessionArray");` |

### `Craft_UsedInCrafting`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 168 | `Integer usedInCrafting=(Integer)props.getProperty("Craft_UsedInCrafting");` |

### `DataIDProgression_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 548 | `Object[] effectArray=(Object[])progProps.getProperty("DataIDProgression_Array");` |
| utils/DatStatUtils.java | 295 | `Object[] progressionIds=(Object[])properties.getProperty("DataIDProgression_Array");` |
| utils/DatStatUtils.java | 361 | `Object[] progressionIds=(Object[])properties.getProperty("DataIDProgression_Array");` |

### `DefaultPermissionBlobStruct`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievablesLoadingUtils.java | 84 | `PropertiesSet permissions=(PropertiesSet)properties.getProperty("DefaultPermissionBlobStruct");` |
| achievables/AchievablesLoadingUtils.java | 110 | `PropertiesSet permissions=(PropertiesSet)properties.getProperty("DefaultPermissionBlobStruct");` |
| rewardsTrack/MainDatRewardsTracksLoader.java | 71 | `PropertiesSet permissions=(PropertiesSet)properties.getProperty("DefaultPermissionBlobStruct");` |
| trade/MainDatTradeLoader.java | 235 | `PropertiesSet permissionsProps=(PropertiesSet)properties.getProperty("DefaultPermissionBlobStruct");` |

### `Dungeon_DID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/LandblockInfoLoader.java | 277 | `dungeonId=(Integer)props.getProperty("Dungeon_DID");` |
| geo/landblocks/LandblockLoader.java | 84 | `Integer dungeonDID=(Integer)lbiProps.getProperty("Dungeon_DID");` |

### `Dungeon_MapData`

Observed raw data classes: 691.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/dungeons/DungeonLoader.java | 97 | `int imagePropsId=((Integer)dungeonProps.getProperty("Dungeon_MapData")).intValue();` |
| geo/maps/DungeonMapsLoader.java | 75 | `int imagePropsId=((Integer)dungeonProps.getProperty("Dungeon_MapData")).intValue();` |

### `Dungeon_Music`

Observed raw data classes: 691.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/GeoMusicLoader.java | 127 | `int musicType=((Integer)dungeonProps.getProperty("Dungeon_Music")).intValue();` |

### `Dungeon_ParentDungeon`

Observed raw data classes: 691.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/dungeons/DungeonLoader.java | 117 | `Integer parentDungeonId=(Integer)dungeonProps.getProperty("Dungeon_ParentDungeon");` |

### `EffectGenerator_CasterEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 41 | `Object[] casterEffectsList=(Object[])effectProps.getProperty("EffectGenerator_CasterEffectList");` |

### `EffectGenerator_Countdown_ExpireEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/CountDownEffectLoader.java | 19 | `Object[] expireEffectsList=(Object[])effectProps.getProperty("EffectGenerator_Countdown_ExpireEffectList");` |

### `EffectGenerator_EffectDataList`

Observed raw data classes: 1170.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/TravelEffectLoader.java | 25 | `ArrayPropertyValue dataList=(ArrayPropertyValue)effectProps.getPropertyValueByName("EffectGenerator_EffectDataList");` |
| items/ItemDetailsLoader.java | 270 | `ArrayPropertyValue dataListValue=(ArrayPropertyValue)effectProps.getPropertyValueByName("EffectGenerator_EffectDataList");` |

### `EffectGenerator_EffectID`

Observed raw data classes: 1170, 1724, 2097, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainStatTomesLoader.java | 86 | `int effectId=((Integer)traitEffectProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| characters/VirtueDataLoader.java | 170 | `int effectId=((Integer)passiveProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| effects/ItemEffectsLoader.java | 80 | `int effectId=((Integer)effectProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| effects/ItemsSetEffectsLoader.java | 67 | `int effectId=((Integer)effectProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| effects/SomeMoreEffectsLoader.java | 136 | `Integer effectID=(Integer)effectProps.getProperty("EffectGenerator_EffectID");` |
| items/GenericItemEffectsLoader.java | 89 | `int effectID=((Integer)effectProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| items/GenericItemEffectsLoader.java | 128 | `int effectID=((Integer)effectProps.getProperty("EffectGenerator_EffectID")).intValue();` |
| items/ItemDetailsLoader.java | 258 | `Integer effectID=(Integer)effectProps.getProperty("EffectGenerator_EffectID");` |
| items/MainDatContainerLoader.java | 269 | `Integer effectId=(Integer)effectItemProps.getProperty("EffectGenerator_EffectID");` |
| items/legendary/MainDatLegendaryTitlesLoader.java | 152 | `int effectId=((Integer)effectProps.getProperty("EffectGenerator_EffectID")).intValue();` |

### `EffectGenerator_EffectSpellcraft`

Observed raw data classes: 1170, 1724, 2097, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainStatTomesLoader.java | 87 | `Float spellcraft=(Float)traitEffectProps.getProperty("EffectGenerator_EffectSpellcraft");` |
| effects/ItemEffectsLoader.java | 82 | `Float spellcraft=(Float)effectProps.getProperty("EffectGenerator_EffectSpellcraft");` |
| effects/ItemsSetEffectsLoader.java | 69 | `Float spellcraft=(Float)effectProps.getProperty("EffectGenerator_EffectSpellcraft");` |
| items/legendary/MainDatLegendaryTitlesLoader.java | 153 | `Float spellCraft=(Float)effectProps.getProperty("EffectGenerator_EffectSpellcraft");` |

### `EffectGenerator_EquipperEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemEffectsLoader.java | 61 | `Object[] effects=(Object[])properties.getProperty("EffectGenerator_EquipperEffectList");` |
| items/GenericItemEffectsLoader.java | 85 | `Object[] effectsList=(Object[])props.getProperty("EffectGenerator_EquipperEffectList");` |

### `EffectGenerator_HotspotEffectList`

Observed raw data classes: 1170, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/HotspotEffectsLoader.java | 55 | `Object[] effectsList=(Object[])properties.getProperty("EffectGenerator_HotspotEffectList");` |
| effects/loaders/GenesisEffectLoader.java | 86 | `Object[] effectsList=(Object[])props.getProperty("EffectGenerator_HotspotEffectList");` |

### `EffectGenerator_InstantFellowship_AppliedEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantFellowshipEffectLoader.java | 17 | `Object[] effectsList=(Object[])effectProps.getProperty("EffectGenerator_InstantFellowship_AppliedEffectList");` |

### `EffectGenerator_OnRemoval_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/CountDownEffectLoader.java | 30 | `PropertiesSet onRemovalProps=(PropertiesSet)effectProps.getProperty("EffectGenerator_OnRemoval_Effect");` |

### `EffectGenerator_RunicEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendaryTitlesLoader.java | 146 | `Object[] effects=(Object[])properties.getProperty("EffectGenerator_RunicEffectList");` |

### `EffectGenerator_SkillProc_TargetEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ProcEffectLoader.java | 26 | `Object[] targetEffectsList=(Object[])effectProps.getProperty("EffectGenerator_SkillProc_TargetEffectList");` |

### `EffectGenerator_SkillProc_UserEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ProcEffectLoader.java | 25 | `Object[] userEffectsList=(Object[])effectProps.getProperty("EffectGenerator_SkillProc_UserEffectList");` |

### `EffectGenerator_TargetEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/GenericItemEffectsLoader.java | 124 | `Object[] effectsList=(Object[])props.getProperty("EffectGenerator_TargetEffectList");` |

### `EffectGenerator_TraitEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainStatTomesLoader.java | 82 | `Object[] traitEffects=(Object[])traitTomeProps.getProperty("EffectGenerator_TraitEffectList");` |
| characters/MainTraitDataLoader.java | 381 | `Object[] effectsArray=(Object[])traitProperties.getProperty("EffectGenerator_TraitEffectList");` |

### `EffectGenerator_UsageEffectList`

Observed raw data classes: 1724, 2097, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemEffectsLoader.java | 67 | `Object[] effects=(Object[])properties.getProperty("EffectGenerator_UsageEffectList");` |
| items/ItemDetailsLoader.java | 250 | `Object[] usageEffectList=(Object[])props.getProperty("EffectGenerator_UsageEffectList");` |
| items/MainDatContainerLoader.java | 263 | `Object[] effects=(Object[])properties.getProperty("EffectGenerator_UsageEffectList");` |

### `EffectGenerator_UserEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 52 | `Object[] userEffectsList=(Object[])effectProps.getProperty("EffectGenerator_UserEffectList");` |

### `EffectGenerator_Virtue_PassiveEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 400 | `Object[] effectsArray=(Object[])traitProperties.getProperty("EffectGenerator_Virtue_PassiveEffectList");` |
| characters/VirtueDataLoader.java | 164 | `Object[] passives=(Object[])virtueProperties.getProperty("EffectGenerator_Virtue_PassiveEffectList");` |

### `Effect_AIPet_SummonObject`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AIPetEffectLoader.java | 20 | `int summonedObjectID=((Integer)effectProps.getProperty("Effect_AIPet_SummonObject")).intValue();` |

### `Effect_ApplicationProbabilityVariance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 343 | `Float varianceFloat=(Float)effectProps.getProperty("Effect_ApplicationProbabilityVariance");` |

### `Effect_ApplicationProbability_AdditiveModProp`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 345 | `Integer modPropertyInt=(Integer)effectProps.getProperty("Effect_ApplicationProbability_AdditiveModProp");` |

### `Effect_ApplyOverTime_Applied_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/PersistentComboEffectLoader.java | 54 | `effectID=(Integer)entryProps.getProperty("Effect_ApplyOverTime_Applied_Effect");` |

### `Effect_ApplyOverTime_Applied_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ApplyOverTimeEffectLoader.java | 28 | `Object[] appliedEffectsList=(Object[])effectProps.getProperty("Effect_ApplyOverTime_Applied_Effect_Array");` |

### `Effect_ApplyOverTime_Initial_Applied_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ApplyOverTimeEffectLoader.java | 17 | `Object[] initiallyAppliedEffectsList=(Object[])effectProps.getProperty("Effect_ApplyOverTime_Initial_Applied_Effect_Array");` |

### `Effect_Area_Applied_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AreaEffectLoader.java | 50 | `Object[] effectsList=(Object[])effectProps.getProperty("Effect_Area_Applied_Effect_Array");` |

### `Effect_Area_DetectionBuffer`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AreaEffectLoader.java | 63 | `Float detectionBuffer=(Float)effectProps.getProperty("Effect_Area_DetectionBuffer");` |

### `Effect_Area_MaxRange`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AreaEffectLoader.java | 60 | `Float maxRange=(Float)effectProps.getProperty("Effect_Area_MaxRange");` |

### `Effect_Area_MaxTargets`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AreaEffectLoader.java | 66 | `Integer maxTargets=(Integer)effectProps.getProperty("Effect_Area_MaxTargets");` |

### `Effect_Aura_Applied_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AuraEffectLoader.java | 37 | `Object[] effectsList=(Object[])props.getProperty("Effect_Aura_Applied_Effect_Array");` |

### `Effect_Aura_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AuraEffectLoader.java | 29 | `int typeCode=((Integer)props.getProperty("Effect_Aura_Type")).intValue();` |

### `Effect_BaseVital_ChangePerIntervalVPSMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/VitalOverTimeEffectLoader.java | 57 | `Float vpsMultiplier=(Float)effectProps.getProperty("Effect_BaseVital_ChangePerIntervalVPSMultiplier");` |

### `Effect_BaseVital_InitialChangeMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantVitalEffectLoader.java | 40 | `Float multiplier=(Float)effectProps.getProperty("Effect_BaseVital_InitialChangeMultiplier");` |

### `Effect_BaseVital_InitialChangeVPSMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantVitalEffectLoader.java | 31 | `Float vpsMultiplier=(Float)effectProps.getProperty("Effect_BaseVital_InitialChangeVPSMultiplier");` |
| effects/loaders/VitalOverTimeEffectLoader.java | 44 | `Float vpsMultiplier=(Float)effectProps.getProperty("Effect_BaseVital_InitialChangeVPSMultiplier");` |

### `Effect_BaseVital_VitalType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantVitalEffectLoader.java | 21 | `Integer vitalType=(Integer)effectProps.getProperty("Effect_BaseVital_VitalType");` |

### `Effect_Bubble_Percentage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/BubbleEffectLoader.java | 32 | `Float percentage=(Float)effectProps.getProperty("Effect_Bubble_Percentage");` |

### `Effect_Bubble_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/BubbleEffectLoader.java | 24 | `Float value=(Float)effectProps.getProperty("Effect_Bubble_Value");` |

### `Effect_Bubble_Value_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/BubbleEffectLoader.java | 26 | `Integer progressionID=(Integer)effectProps.getProperty("Effect_Bubble_Value_Progression");` |

### `Effect_Bubble_VitalType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/BubbleEffectLoader.java | 21 | `Integer vitalType=(Integer)effectProps.getProperty("Effect_Bubble_VitalType");` |

### `Effect_CombatState_Induce_BreakOnHarmfulSkill_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 75 | `Float breakOnHarmfullSkill=(Float)effectProps.getProperty("Effect_CombatState_Induce_BreakOnHarmfulSkill_Override");` |

### `Effect_CombatState_Induce_BreakOnVitalLossProb_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 80 | `Float breakOnVitalLoss=(Float)effectProps.getProperty("Effect_CombatState_Induce_BreakOnVitalLossProb_Override");` |

### `Effect_CombatState_Induce_BreakOutOfState_GracePeriod_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 86 | `Float gracePeriod=(Float)effectProps.getProperty("Effect_CombatState_Induce_BreakOutOfState_GracePeriod_Override");` |

### `Effect_Combo_EffectPresentList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 32 | `Object[] presentArray=(Object[])effectProps.getProperty("Effect_Combo_EffectPresentList");` |

### `Effect_Combo_EffectToAddIfNotPresent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 43 | `Integer toAddIfNotPresent=(Integer)effectProps.getProperty("Effect_Combo_EffectToAddIfNotPresent");` |

### `Effect_Combo_EffectToAddIfPresent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 46 | `Integer toAddIfPresent=(Integer)effectProps.getProperty("Effect_Combo_EffectToAddIfPresent");` |

### `Effect_Combo_EffectToExamine`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 55 | `Integer toExamine=(Integer)effectProps.getProperty("Effect_Combo_EffectToExamine");` |
| effects/loaders/PersistentComboEffectLoader.java | 39 | `Integer toExamine=(Integer)effectProps.getProperty("Effect_Combo_EffectToExamine");` |

### `Effect_Combo_EffectToGiveBackIfNotPresent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 49 | `Integer toGiveBackIfNotPresent=(Integer)effectProps.getProperty("Effect_Combo_EffectToGiveBackIfNotPresent");` |

### `Effect_Combo_EffectToGiveBackIfPresent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ComboEffectLoader.java | 52 | `Integer toGiveBackIfPresent=(Integer)effectProps.getProperty("Effect_Combo_EffectToGiveBackIfPresent");` |

### `Effect_ConstantApplicationProbability`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 341 | `Float probabilityFloat=(Float)effectProps.getProperty("Effect_ConstantApplicationProbability");` |

### `Effect_DamageType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/VitalEffectLoader.java | 29 | `Integer damageTypeCode=(Integer)effectProps.getProperty("Effect_DamageType");` |

### `Effect_DispelByResist_MaximumDispelCount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelByResistEffectLoader.java | 30 | `Integer dispelCountInt=(Integer)effectProps.getProperty("Effect_DispelByResist_MaximumDispelCount");` |

### `Effect_DispelByResist_ResistCategoryFilter`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelByResistEffectLoader.java | 34 | `int categoriesCode=((Integer)effectProps.getProperty("Effect_DispelByResist_ResistCategoryFilter")).intValue();` |

### `Effect_DispelByResist_StrengthRestrictionOffset`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelByResistEffectLoader.java | 49 | `Float strengthOffset=(Float)effectProps.getProperty("Effect_DispelByResist_StrengthRestrictionOffset");` |

### `Effect_DispelByResist_UseStrengthRestriction`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelByResistEffectLoader.java | 43 | `Integer useStrengthResitriction=(Integer)effectProps.getProperty("Effect_DispelByResist_UseStrengthRestriction");` |

### `Effect_Dispel_ByEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelEffectLoader.java | 27 | `Object[] effectsList=(Object[])props.getProperty("Effect_Dispel_ByEffectList");` |

### `Effect_Dispel_DispelCasters`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/DispelEffectLoader.java | 23 | `Integer dispelCastersInt=(Integer)props.getProperty("Effect_Dispel_DispelCasters");` |

### `Effect_Duration_ConstantInterval`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 363 | `Float duration=(Float)effectProps.getProperty("Effect_Duration_ConstantInterval");` |

### `Effect_Duration_ConstantPulseCount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 375 | `Integer pulseCountInt=(Integer)effectProps.getProperty("Effect_Duration_ConstantPulseCount");` |

### `Effect_EmoteToGrant`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 351 | `Integer grantedEmoteID=(Integer)effectProps.getProperty("Effect_EmoteToGrant");` |

### `Effect_Genesis_ConstantSummonDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/GenesisEffectLoader.java | 28 | `Float summonDuration=(Float)effectProps.getProperty("Effect_Genesis_ConstantSummonDuration");` |

### `Effect_Genesis_PermanentSummonDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/GenesisEffectLoader.java | 29 | `Integer permanent=(Integer)effectProps.getProperty("Effect_Genesis_PermanentSummonDuration");` |

### `Effect_Genesis_SummonedObject`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/GenesisEffectLoader.java | 27 | `int summonedObjectID=((Integer)effectProps.getProperty("Effect_Genesis_SummonedObject")).intValue();` |

### `Effect_GrantTraitRank_Grant_N_Ranks`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 327 | `Integer grantNRanks=(Integer)grantNode.getProperty("Effect_GrantTraitRank_Grant_N_Ranks");` |

### `Effect_GrantTraitRank_Grant_Up_To_Rank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 325 | `Integer upToRank=(Integer)grantNode.getProperty("Effect_GrantTraitRank_Grant_Up_To_Rank");` |

### `Effect_GrantTraitRank_Grant_XP`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 324 | `Integer virtueXPAmount=(Integer)grantNode.getProperty("Effect_GrantTraitRank_Grant_XP");` |

### `Effect_GrantTraitRank_Trait_To_Grant`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 326 | `Integer traitToGrant=(Integer)grantNode.getProperty("Effect_GrantTraitRank_Trait_To_Grant");` |

### `Effect_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/EffectLoader.java | 187 | `Integer effectIconId=(Integer)effectProps.getProperty("Effect_Icon");` |

### `Effect_InduceCombatState_ConstantDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 43 | `Float duration=(Float)effectProps.getProperty("Effect_InduceCombatState_ConstantDuration");` |

### `Effect_InduceCombatState_StateToInduce`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 59 | `Integer bitSetValueInt=(Integer)effectProps.getProperty("Effect_InduceCombatState_StateToInduce");` |

### `Effect_InduceCombatState_VariableDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 49 | `PropertiesSet durationProps=(PropertiesSet)effectProps.getProperty("Effect_InduceCombatState_VariableDuration");` |

### `Effect_InstantFellowship_ApplyToPets`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantFellowshipEffectLoader.java | 31 | `Integer pets=(Integer)effectProps.getProperty("Effect_InstantFellowship_ApplyToPets");` |

### `Effect_InstantFellowship_ApplyToRaidGroups`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantFellowshipEffectLoader.java | 26 | `Integer raidGroups=(Integer)effectProps.getProperty("Effect_InstantFellowship_ApplyToRaidGroups");` |

### `Effect_InstantFellowship_ApplyToTarget`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantFellowshipEffectLoader.java | 36 | `Integer target=(Integer)effectProps.getProperty("Effect_InstantFellowship_ApplyToTarget");` |

### `Effect_InstantFellowship_MaxRange`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantFellowshipEffectLoader.java | 49 | `Float range=(Float)effectProps.getProperty("Effect_InstantFellowship_MaxRange");` |

### `Effect_InstantVital_Multiplicative`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InstantVitalEffectLoader.java | 36 | `Integer multiplicativeInt=(Integer)effectProps.getProperty("Effect_InstantVital_Multiplicative");` |

### `Effect_InterestedIncomingDamageTypes`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReactiveVitalEffectLoader.java | 49 | `Object[] damageTypeList=(Object[])effectProps.getProperty("Effect_InterestedIncomingDamageTypes");` |

### `Effect_KillProc_Cooldown`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 64 | `float cooldown=((Float)effectProps.getProperty("Effect_KillProc_Cooldown")).floatValue();` |

### `Effect_KillProc_OnSelfKilled`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 84 | `Integer onSelfKilledInt=(Integer)effectProps.getProperty("Effect_KillProc_OnSelfKilled");` |

### `Effect_KillProc_ProcProbability`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 71 | `Float procProbability=(Float)effectProps.getProperty("Effect_KillProc_ProcProbability");` |

### `Effect_KillProc_RequireKillShot`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 80 | `Integer requireKillShotInt=(Integer)effectProps.getProperty("Effect_KillProc_RequireKillShot");` |

### `Effect_KillProc_TargetRequiredProperties`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/KillProcEffectLoader.java | 88 | `PropertyValue targetProperties=effectProps.getPropertyValueByName("Effect_KillProc_TargetRequiredProperties");` |

### `Effect_Lootgen_DiscoveryTreasureListTemplate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 283 | `Integer treasureListTemplateId=(Integer)effectProps.getProperty("Effect_Lootgen_DiscoveryTreasureListTemplate");` |

### `Effect_MinTimeBetweenProcs`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ProcEffectLoader.java | 65 | `Float cooldown=(Float)effectProps.getProperty("Effect_MinTimeBetweenProcs");` |

### `Effect_MonsterInitEffect_Array`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/AgentLoader.java | 40 | `Object[] initEffectsList=(Object[])props.getProperty("Effect_MonsterInitEffect_Array");` |

### `Effect_MonsterStartupEffect_Array`

Observed raw data classes: 1723, 1724, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/AgentLoader.java | 29 | `Object[] startupEffectsList=(Object[])props.getProperty("Effect_MonsterStartupEffect_Array");` |
| effects/loaders/AIPetEffectLoader.java | 24 | `Object[] startupEffectsList=(Object[])effectProps.getProperty("Effect_MonsterStartupEffect_Array");` |

### `Effect_PetApplyToMasterEffect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AIPetEffectLoader.java | 35 | `Object[] applyToMasterEffectsList=(Object[])effectProps.getProperty("Effect_PetApplyToMasterEffect_Array");` |

### `Effect_Pip_AdjustmentAmount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/PipEffectLoader.java | 49 | `Integer amount=(Integer)props.getProperty("Effect_Pip_AdjustmentAmount");` |

### `Effect_Pip_AdjustmentType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/PipEffectLoader.java | 42 | `Integer adjustmentTypeCode=(Integer)props.getProperty("Effect_Pip_AdjustmentType");` |

### `Effect_Pip_Reset`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/PipEffectLoader.java | 37 | `Integer resetInt=(Integer)props.getProperty("Effect_Pip_Reset");` |

### `Effect_Pip_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/PipEffectLoader.java | 33 | `int typeCode=((Integer)props.getProperty("Effect_Pip_Type")).intValue();` |

### `Effect_RandomEffect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/RandomEffectLoader.java | 24 | `Object[] entries=(Object[])props.getProperty("Effect_RandomEffect_Array");` |

### `Effect_RandomEffect_ToCaster`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/RandomEffectLoader.java | 32 | `Integer toCasterInt=(Integer)entryProps.getProperty("Effect_RandomEffect_ToCaster");` |

### `Effect_RandomEffect_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/RandomEffectLoader.java | 36 | `float weight=((Float)entryProps.getProperty("Effect_RandomEffect_Weight")).floatValue();` |

### `Effect_RandomValueMax`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/VitalEffectLoader.java | 48 | `max=(Float)randomProps.getProperty("Effect_RandomValueMax");` |

### `Effect_RandomValueMin`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/VitalEffectLoader.java | 47 | `min=(Float)randomProps.getProperty("Effect_RandomValueMin");` |

### `Effect_ReactiveVital_AttackerVitalChange_DamageTypeOverride`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReactiveVitalEffectLoader.java | 75 | `Integer damageTypeOverrideCode=(Integer)effectProps.getProperty("Effect_ReactiveVital_AttackerVitalChange_DamageTypeOverride");` |

### `Effect_ReactiveVital_RemoveOnSuccessfulProc`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReactiveVitalEffectLoader.java | 82 | `Integer removeOnProcInt=(Integer)effectProps.getProperty("Effect_ReactiveVital_RemoveOnSuccessfulProc");` |

### `Effect_ReactiveVital_RequiredAttacker_DamageQualifier_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReactiveVitalEffectLoader.java | 61 | `Object[] damageQualifierList=(Object[])effectProps.getProperty("Effect_ReactiveVital_RequiredAttacker_DamageQualifier_Array");` |

### `Effect_Recall_Location_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/RecallEffectLoader.java | 25 | `Integer locationType=(Integer)effectProps.getProperty("Effect_Recall_Location_Type");` |

### `Effect_Recall_Telepad`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/RecallEffectLoader.java | 27 | `String telepad=(String)effectProps.getProperty("Effect_Recall_Telepad");` |

### `Effect_Revive_EffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReviveEffectLoader.java | 43 | `Object[] effectsList=(Object[])props.getProperty("Effect_Revive_EffectList");` |

### `Effect_Revive_VitalDataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReviveEffectLoader.java | 57 | `Object[] vitalEntries=(Object[])props.getProperty("Effect_Revive_VitalDataList");` |

### `Effect_Revive_VitalPercent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReviveEffectLoader.java | 64 | `float percentage=((Float)vitalProps.getProperty("Effect_Revive_VitalPercent")).floatValue();` |

### `Effect_Revive_VitalType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReviveEffectLoader.java | 65 | `int vitalTypeCode=((Integer)vitalProps.getProperty("Effect_Revive_VitalType")).intValue();` |

### `Effect_SkillProc_ProcProbability`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ProcEffectLoader.java | 39 | `Float probability=(Float)effectProps.getProperty("Effect_SkillProc_ProcProbability");` |

### `Effect_SkillProc_SkillTypes`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ProcEffectLoader.java | 30 | `Long skillTypeFlags=(Long)effectProps.getProperty("Effect_SkillProc_SkillTypes");` |

### `Effect_TierUp_EffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/TieredEffectLoader.java | 31 | `Object[] tierUpList=(Object[])effectProps.getProperty("Effect_TierUp_EffectList");` |

### `Effect_TierUp_FinalEffect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/TieredEffectLoader.java | 43 | `Object[] finalEffectList=(Object[])effectProps.getProperty("Effect_TierUp_FinalEffect");` |

### `Effect_TierUp_ShowInExamination`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/TieredEffectLoader.java | 57 | `Integer showInExaminationInt=(Integer)effectProps.getProperty("Effect_TierUp_ShowInExamination");` |

### `Effect_Travel_PrivateEncounter`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/TravelEffectLoader.java | 51 | `Integer privateEncounterID=(Integer)effectProps.getProperty("Effect_Travel_PrivateEncounter");` |

### `Effect_VariableMax`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 97 | `float maxY=((Float)props.getProperty("Effect_VariableMax")).floatValue();` |

### `Effect_VariableMin`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 95 | `float minY=((Float)props.getProperty("Effect_VariableMin")).floatValue();` |

### `Effect_VariableSpellcraftMax`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 96 | `float maxX=((Float)props.getProperty("Effect_VariableSpellcraftMax")).floatValue();` |

### `Effect_VariableSpellcraftMin`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/InduceCombatStateEffectLoader.java | 94 | `float minX=((Float)props.getProperty("Effect_VariableSpellcraftMin")).floatValue();` |

### `Effect_VitalInterested_VitalTypeList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/ReactiveVitalEffectLoader.java | 37 | `Object[] vitalTypeList=(Object[])effectProps.getProperty("Effect_VitalInterested_VitalTypeList");` |

### `Effect_VitalOverTime_VitalType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/VitalOverTimeEffectLoader.java | 33 | `Integer vitalType=(Integer)effectProps.getProperty("Effect_VitalOverTime_VitalType");` |

### `Emote_IconImage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| emotes/MainDatEmotesLoader.java | 86 | `int iconId=((Integer)properties.getProperty("Emote_IconImage")).intValue();` |

### `Emote_MustBeGranted`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| emotes/MainDatEmotesLoader.java | 94 | `int granted=((Integer)properties.getProperty("Emote_MustBeGranted")).intValue();` |

### `EntityFilter_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 151 | `ArrayPropertyValue filter=(ArrayPropertyValue)itemProps.getPropertyValueByName("EntityFilter_Array");` |

### `EntityFilter_PropertyRange_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/LootFilterLoader.java | 167 | `ArrayPropertyValue maxPropValue=(ArrayPropertyValue)props.getPropertyValueByName("EntityFilter_PropertyRange_Max");` |

### `EntityFilter_PropertyRange_Min`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/LootFilterLoader.java | 166 | `ArrayPropertyValue minPropValue=(ArrayPropertyValue)props.getPropertyValueByName("EntityFilter_PropertyRange_Min");` |

### `Entity_ContentLayers`

Observed raw data classes: 1113, 2007.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/LandblockGeneratorsAnalyzer.java | 79 | `Object[] contentLayersArray=(Object[])props.getProperty("Entity_ContentLayers");` |

### `ExternalAppearanceID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 49 | `Integer appearanceID=(Integer)props.getProperty("ExternalAppearanceID");` |

### `ForwardSource_Movement_MountSpeedMultiplier`

Observed raw data classes: 1723, 1724, 1725, 3074, 3075, 4026, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 117 | `speed=(Float)modProps.getProperty("ForwardSource_Movement_MountSpeedMultiplier");` |

### `GeneratorProfile_Entry`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 159 | `PropertiesSet profileEntryProps=(PropertiesSet)entryProps.getProperty("GeneratorProfile_Entry");` |

### `GeneratorProfile_OneOf`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 230 | `Object[] oneOfArray=(Object[])entryProps.getProperty("GeneratorProfile_OneOf");` |

### `GeneratorProfile_PositionSetID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 146 | `Integer id=(Integer)entryProps.getProperty("GeneratorProfile_PositionSetID");` |

### `GeneratorProfile_Probability`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 165 | `Integer probability=(Integer)entryProps.getProperty("GeneratorProfile_Probability");` |

### `GeneratorProfile_Profile`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 107 | `Object[] entryObjs=(Object[])generatorProps.getProperty("GeneratorProfile_Profile");` |

### `GeneratorProfile_ProfileDefinition`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 162 | `Integer profileId=(Integer)profileEntryProps.getProperty("GeneratorProfile_ProfileDefinition");` |
| geo/landblocks/GeneratorLoader.java | 194 | `Integer profileId=(Integer)entryProps.getProperty("GeneratorProfile_ProfileDefinition");` |

### `GeneratorProfile_WSLEntity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 251 | `Integer entityId=(Integer)entryProps.getProperty("GeneratorProfile_WSLEntity");` |

### `Generator_PositionSetID`

Observed raw data classes: 1113.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 67 | `Integer id=(Integer)limitProps.getProperty("Generator_PositionSetID");` |

### `Generator_PositionSetLimitArray`

Observed raw data classes: 1113.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 61 | `Object[] limitsArray=(Object[])props.getProperty("Generator_PositionSetLimitArray");` |

### `Generator_ProfileDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/landblocks/GeneratorLoader.java | 49 | `Integer profileId=(Integer)props.getProperty("Generator_ProfileDID");` |

### `GloryControl_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| pvp/MainDatPVPLoader.java | 88 | `int code=((Integer)entryProps.getProperty("GloryControl_Value")).intValue();` |

### `HobbyRewardProfile_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 175 | `int itemID=((Integer)entryProps.getProperty("HobbyRewardProfile_Item")).intValue();` |

### `HobbyRewardProfile_ItemArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 171 | `Object[] itemsArray=(Object[])props.getProperty("HobbyRewardProfile_ItemArray");` |

### `HobbyRewardProfile_MaxProficiency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 177 | `int maxProficiency=((Integer)entryProps.getProperty("HobbyRewardProfile_MaxProficiency")).intValue();` |

### `HobbyRewardProfile_MinProficiency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 176 | `int minProficiency=((Integer)entryProps.getProperty("HobbyRewardProfile_MinProficiency")).intValue();` |

### `HobbyRewardProfile_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 178 | `int weight=((Integer)entryProps.getProperty("HobbyRewardProfile_Weight")).intValue();` |

### `Hobby_Birding_BirdCall`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainBirdsLoader.java | 69 | `int callSoundID=((Integer)props.getProperty("Hobby_Birding_BirdCall")).intValue();` |

### `Hobby_Birding_BirdItemList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainBirdsLoader.java | 61 | `Object[] idsArray=(Object[])directoryProps.getProperty("Hobby_Birding_BirdItemList");` |

### `Hobby_Birding_BirdType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainBirdsLoader.java | 72 | `int birdType=((Integer)props.getProperty("Hobby_Birding_BirdType")).intValue();` |

### `Hobby_DailyProficiencyGainLimit`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 104 | `int dailyProficiencyGainLimit=((Integer)props.getProperty("Hobby_DailyProficiencyGainLimit")).intValue();` |

### `Hobby_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 90 | `int iconId=((Integer)props.getProperty("Hobby_Icon")).intValue();` |

### `Hobby_ItemList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 107 | `Object[] itemsArray=(Object[])props.getProperty("Hobby_ItemList");` |

### `Hobby_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 56 | `Object[] ids=(Object[])props.getProperty("Hobby_List");` |

### `Hobby_MinLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 115 | `int minLevel=((Integer)props.getProperty("Hobby_MinLevel")).intValue();` |

### `Hobby_Proficiency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 136 | `int proficiency=((Integer)titleProps.getProperty("Hobby_Proficiency")).intValue();` |

### `Hobby_ProficiencyModifier_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 124 | `int proficiencyModifierPropertyID=((Integer)props.getProperty("Hobby_ProficiencyModifier_PropertyName")).intValue();` |

### `Hobby_Proficiency_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 120 | `int proficiencyPropertyID=((Integer)props.getProperty("Hobby_Proficiency_PropertyName")).intValue();` |

### `Hobby_Reward_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainBirdsLoader.java | 78 | `int iconID=((Integer)props.getProperty("Hobby_Reward_Icon")).intValue();` |

### `Hobby_Reward_Icon_Large`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| collections/MainBirdsLoader.java | 86 | `int largeIconID=((Integer)props.getProperty("Hobby_Reward_Icon_Large")).intValue();` |

### `Hobby_Territory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 156 | `int territoryID=((Integer)profileProps.getProperty("Hobby_Territory")).intValue();` |

### `Hobby_Title`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 137 | `int titleID=((Integer)titleProps.getProperty("Hobby_Title")).intValue();` |

### `Hobby_TitleList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 132 | `Object[] titlesArray=(Object[])props.getProperty("Hobby_TitleList");` |

### `Hobby_TreasureProfile`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 157 | `int profileID=((Integer)profileProps.getProperty("Hobby_TreasureProfile")).intValue();` |

### `Hobby_TreasureProfileList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 152 | `Object[] profilesArray=(Object[])props.getProperty("Hobby_TreasureProfileList");` |

### `Hobby_TreasureProfileOverride_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 128 | `int treasureProfileOverridePropertyID=((Integer)props.getProperty("Hobby_TreasureProfileOverride_PropertyName")).intValue();` |

### `Hobby_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainHobbiesLoader.java | 81 | `int type=((Integer)props.getProperty("Hobby_Type")).intValue();` |

### `HouseList_HouseArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 271 | `Object[] houseArray=(Object[])houseListProps.getProperty("HouseList_HouseArray");` |

### `House_CharacteristicArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 331 | `Object[] characteristicsArray=(Object[])props.getProperty("House_CharacteristicArray");` |

### `House_IsKinshipHouse`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 322 | `boolean isKinship=Utils.getBooleanValue((Integer)props.getProperty("House_IsKinshipHouse"),false);` |

### `House_IsPremiumHouse`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 325 | `boolean isPremium=Utils.getBooleanValue((Integer)props.getProperty("House_IsPremiumHouse"),false);` |

### `House_NeighborhoodTemplate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 328 | `int neighborhoodTemplateID=((Integer)props.getProperty("House_NeighborhoodTemplate")).intValue();` |

### `House_Telepad`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 350 | `String telepad=(String)props.getProperty("House_Telepad");` |

### `House_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 357 | `int typeCode=((Integer)props.getProperty("House_Type")).intValue();` |

### `House_ValueTier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 366 | `Integer valueTier=(Integer)props.getProperty("House_ValueTier");` |

### `HousingControl_HousePrice`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 126 | `int price=((Integer)typeInfoProps.getProperty("HousingControl_HousePrice")).intValue();` |

### `HousingControl_HouseType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 123 | `int typeCode=((Integer)typeInfoProps.getProperty("HousingControl_HouseType")).intValue();` |

### `HousingControl_HouseTypeInfoArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 119 | `Object[] typeInfoArray=(Object[])props.getProperty("HousingControl_HouseTypeInfoArray");` |

### `HousingControl_HouseUpkeep`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 130 | `int upkeep=((Integer)typeInfoProps.getProperty("HousingControl_HouseUpkeep")).intValue();` |

### `HousingControl_HouseValueTier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 100 | `int tier=((Integer)modifiersProps.getProperty("HousingControl_HouseValueTier")).intValue();` |

### `HousingControl_HouseValueTierArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 96 | `Object[] modifiersArray=(Object[])props.getProperty("HousingControl_HouseValueTierArray");` |

### `HousingControl_HouseValueTier_PriceModifier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 101 | `Float priceModifier=(Float)modifiersProps.getProperty("HousingControl_HouseValueTier_PriceModifier");` |

### `HousingControl_HouseValueTier_UpkeepPriceModifier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 102 | `Float upkeepModifier=(Float)modifiersProps.getProperty("HousingControl_HouseValueTier_UpkeepPriceModifier");` |

### `HousingControl_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 134 | `int iconID=((Integer)typeInfoProps.getProperty("HousingControl_Icon")).intValue();` |

### `HousingControl_Icon16`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 137 | `Integer icon16ID=(Integer)typeInfoProps.getProperty("HousingControl_Icon16");` |

### `HousingControl_Icon32`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 143 | `int icon32ID=((Integer)typeInfoProps.getProperty("HousingControl_Icon32")).intValue();` |

### `HousingControl_Icon_Large`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 146 | `Integer iconLargeID=(Integer)typeInfoProps.getProperty("HousingControl_Icon_Large");` |

### `HousingControl_Icon_Panorama`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 152 | `Integer iconPanoramaID=(Integer)typeInfoProps.getProperty("HousingControl_Icon_Panorama");` |

### `Icon_Layer_BackgroundDID`

Observed raw data classes: 1722, 2097, 796, 798, 803, 804, 815.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 200 | `Integer backgroundIconId=(Integer)properties.getProperty("Icon_Layer_BackgroundDID");` |
| relics/MainDatRelicsLoader.java | 107 | `Integer backgroundIconId=(Integer)properties.getProperty("Icon_Layer_BackgroundDID");` |
| ui/SocketIconsLoader.java | 67 | `int backgroundDID=((Integer)entryProps.getProperty("Icon_Layer_BackgroundDID")).intValue();` |

### `Icon_Layer_ImageDID`

Observed raw data classes: 2097, 796, 798, 803, 804, 815.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 199 | `Integer iconId=(Integer)properties.getProperty("Icon_Layer_ImageDID");` |
| relics/MainDatRelicsLoader.java | 108 | `Integer imageIconId=(Integer)properties.getProperty("Icon_Layer_ImageDID");` |

### `Icon_Layer_ImageOverrideDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 202 | `Integer imageDid=(Integer)properties.getProperty("Icon_Layer_ImageOverrideDID");` |

### `Icon_Layer_LargeImageDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 139 | `Integer iconID=(Integer)props.getProperty("Icon_Layer_LargeImageDID");` |

### `Icon_Layer_OverlayDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SocketablesManager.java | 187 | `Integer overlay=(Integer)properties.getProperty("Icon_Layer_OverlayDID");` |
| ui/SocketIconsLoader.java | 51 | `int overlayDID=((Integer)entryProps.getProperty("Icon_Layer_OverlayDID")).intValue();` |
| ui/SocketIconsLoader.java | 64 | `int overlayDID=((Integer)entryProps.getProperty("Icon_Layer_OverlayDID")).intValue();` |

### `Icon_Layer_ShadowDID`

Observed raw data classes: 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 201 | `Integer shadowIconId=(Integer)properties.getProperty("Icon_Layer_ShadowDID");` |

### `Icon_Layer_UnderlayDID`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 202 | `Integer underlayIconId=(Integer)properties.getProperty("Icon_Layer_UnderlayDID");` |

### `Induction_Duration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 720 | `float duration=((Float)props.getProperty("Induction_Duration")).floatValue();` |

### `InventoryControl_DefaultEquipperEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/GenericItemEffectsLoader.java | 59 | `Object[] propsArray=(Object[])props.getProperty("InventoryControl_DefaultEquipperEffectList");` |

### `InventoryControl_DefaultTargetEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/GenericItemEffectsLoader.java | 98 | `Object[] propsArray=(Object[])props.getProperty("InventoryControl_DefaultTargetEffectList");` |

### `InventoryControl_DistributionToLevelOffsetList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemLevelOffsetsUtils.java | 25 | `Object[] offsetsList=(Object[])props.getProperty("InventoryControl_DistributionToLevelOffsetList");` |

### `InventoryControl_DistributionType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemLevelOffsetsUtils.java | 29 | `int type=((Integer)entryProps.getProperty("InventoryControl_DistributionType")).intValue();` |

### `InventoryControl_EquipmentCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/GenericItemEffectsLoader.java | 78 | `long categoryBits=((Long)props.getProperty("InventoryControl_EquipmentCategory")).longValue();` |
| items/GenericItemEffectsLoader.java | 117 | `long categoryBits=((Long)props.getProperty("InventoryControl_EquipmentCategory")).longValue();` |

### `InventoryControl_LevelOffset`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemLevelOffsetsUtils.java | 30 | `int offset=((Integer)entryProps.getProperty("InventoryControl_LevelOffset")).intValue();` |

### `InventoryControl_SmartSortInfo_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemSortingDataLoader.java | 43 | `Object[] sortInfoArray=(Object[])props.getProperty("InventoryControl_SmartSortInfo_Array");` |

### `Inventory_AllowedEquipmentCategories`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/ProficienciesLoader.java | 84 | `Long categories=(Long)modEntryProps.getProperty("Inventory_AllowedEquipmentCategories");` |

### `Inventory_BindOnAcquire`

Observed raw data classes: 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 880 | `Integer bindOnAcquire=(Integer)properties.getProperty("Inventory_BindOnAcquire");` |

### `Inventory_BindOnEquip`

Observed raw data classes: 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 890 | `Integer bindOnEquip=(Integer)properties.getProperty("Inventory_BindOnEquip");` |

### `Inventory_BindToAccount`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 883 | `Integer bindToAccount=(Integer)properties.getProperty("Inventory_BindToAccount");` |
| items/MainDatPaperItemsLoader.java | 105 | `Integer boa=(Integer)itemProps.getProperty("Inventory_BindToAccount");` |

### `Inventory_CompatibleSlot`

Observed raw data classes: 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 755 | `Integer compatibleSlot=(Integer)properties.getProperty("Inventory_CompatibleSlot");` |

### `Inventory_MaxQuantity`

Observed raw data classes: 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 214 | `Integer maxStack=(Integer)properties.getProperty("Inventory_MaxQuantity");` |

### `Inventory_PrecludedSlot`

Observed raw data classes: 796, 798.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 765 | `Integer orecludedSlots=(Integer)properties.getProperty("Inventory_PrecludedSlot");` |

### `Inventory_Unique`

Observed raw data classes: 796, 798.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 210 | `Integer unique=(Integer)properties.getProperty("Inventory_Unique");` |

### `ItemAdvancement_AdvanceableWidget_AbsoluteMaxLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 118 | `int maxTier=((Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_AbsoluteMaxLevel")).intValue();` |

### `ItemAdvancement_AdvanceableWidget_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 121 | `Integer categoryCode=(Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_Category");` |

### `ItemAdvancement_AdvanceableWidget_DPSLUT`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 128 | `Integer dpsLut=(Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_DPSLUT");` |

### `ItemAdvancement_AdvanceableWidget_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 149 | `int iconId=((Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_Icon")).intValue();` |

### `ItemAdvancement_AdvanceableWidget_InitialMaxLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 136 | `int initialMaxTier=((Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_InitialMaxLevel")).intValue();` |

### `ItemAdvancement_AdvanceableWidget_LevelTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 155 | `Integer levelTable=(Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_LevelTable");` |

### `ItemAdvancement_AdvanceableWidget_SmallIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 153 | `Integer smallIconId=(Integer)props.getProperty("ItemAdvancement_AdvanceableWidget_SmallIcon");` |

### `ItemAdvancement_Class`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 327 | `int classCode=((Integer)reforgeTableItemProps.getProperty("ItemAdvancement_Class")).intValue();` |

### `ItemAdvancement_CombatDPSLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 535 | `Integer combatDpsLevel=(Integer)properties.getProperty("ItemAdvancement_CombatDPSLevel");` |
| items/MainDatItemsLoader.java | 625 | `Integer dpsLevel=(Integer)properties.getProperty("ItemAdvancement_CombatDPSLevel");` |

### `ItemAdvancement_CombatDPS_MaxRank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 78 | `int maxMainLegacyRank=((Integer)itemAdvancementControlProps.getProperty("ItemAdvancement_CombatDPS_MaxRank")).intValue();` |

### `ItemAdvancement_CombatPropertyModDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 513 | `Integer combatPropertyModDid=(Integer)properties.getProperty("ItemAdvancement_CombatPropertyModDID");` |

### `ItemAdvancement_CombatPropertyModLargeIconDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 550 | `Integer icon=(Integer)properties.getProperty("ItemAdvancement_CombatPropertyModLargeIconDID");` |

### `ItemAdvancement_CombatPropertyModLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 536 | `Integer combatPropertyModLevel=(Integer)properties.getProperty("ItemAdvancement_CombatPropertyModLevel");` |

### `ItemAdvancement_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 366 | `Integer effectId=(Integer)effectEntry.getProperty("ItemAdvancement_Effect");` |
| items/legendary/PassivesLoader.java | 87 | `Integer effectId=(Integer)effectProps.getProperty("ItemAdvancement_Effect");` |

### `ItemAdvancement_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 362 | `Object[] effectArray=(Object[])progressionListProps.getProperty("ItemAdvancement_Effect_Array");` |
| items/legendary/PassivesLoader.java | 83 | `Object[] effectsListArray=(Object[])effectsProps.getProperty("ItemAdvancement_Effect_Array");` |

### `ItemAdvancement_IATitle_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendaryTitlesLoader.java | 114 | `int categoryCode=((Integer)properties.getProperty("ItemAdvancement_IATitle_Category")).intValue();` |

### `ItemAdvancement_IATitle_Tier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendaryTitlesLoader.java | 118 | `int tierCode=((Integer)properties.getProperty("ItemAdvancement_IATitle_Tier")).intValue();` |

### `ItemAdvancement_ImbuedDPSWidget`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 239 | `int legacyId=((Integer)legacyProps.getProperty("ItemAdvancement_ImbuedDPSWidget")).intValue();` |

### `ItemAdvancement_ImbuedDPSWidgetMap_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 234 | `Object[] array=(Object[])props.getProperty("ItemAdvancement_ImbuedDPSWidgetMap_Array");` |

### `ItemAdvancement_ImbuedLegacy_ClassicLegacyTransform`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 157 | `PropertiesSet mutationProps=(PropertiesSet)props.getProperty("ItemAdvancement_ImbuedLegacy_ClassicLegacyTransform");` |

### `ItemAdvancement_ImbuedLegacy_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 139 | `Integer imbuedEffect=(Integer)props.getProperty("ItemAdvancement_ImbuedLegacy_Effect");` |

### `ItemAdvancement_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 685 | `Integer isAdvancementItem=(Integer)properties.getProperty("ItemAdvancement_Item");` |

### `ItemAdvancement_ItemInfoTable_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 82 | `Object[] itemInfoTable=(Object[])itemAdvancementControlProps.getProperty("ItemAdvancement_ItemInfoTable_Array");` |

### `ItemAdvancement_ItemLevelInfo`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 98 | `int itemLevelInfoId=((Integer)itemInfoProps.getProperty("ItemAdvancement_ItemLevelInfo")).intValue();` |

### `ItemAdvancement_ItemLevelInfo_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 117 | `Object[] levelInfoTable=(Object[])itemLevelInfoProps.getProperty("ItemAdvancement_ItemLevelInfo_Array");` |

### `ItemAdvancement_ItemLevelInfo_ItemLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 134 | `Integer itemLevel=(Integer)levelInfoProps.getProperty("ItemAdvancement_ItemLevelInfo_ItemLevel");` |

### `ItemAdvancement_ItemLevelInfo_StartingProgressionLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 135 | `Integer startProgressionLevel=(Integer)levelInfoProps.getProperty("ItemAdvancement_ItemLevelInfo_StartingProgressionLevel");` |

### `ItemAdvancement_LI2ConversionReward_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatConversionDataInspection.java | 63 | `int itemId=((Integer)entryProps.getProperty("ItemAdvancement_LI2ConversionReward_Item")).intValue();` |

### `ItemAdvancement_LI2ConversionReward_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatConversionDataInspection.java | 64 | `int progressionId=((Integer)entryProps.getProperty("ItemAdvancement_LI2ConversionReward_Progression")).intValue();` |

### `ItemAdvancement_LegacyTypeName_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 160 | `Object[] oldLegacies=(Object[])mutationProps.getProperty("ItemAdvancement_LegacyTypeName_Array");` |

### `ItemAdvancement_LegendaryPointInfo`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 101 | `int legendaryPointInfoId=((Integer)itemInfoProps.getProperty("ItemAdvancement_LegendaryPointInfo")).intValue();` |

### `ItemAdvancement_LegendaryPointSlotInfo_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 143 | `Object[] legendaryPointSlotInfoTable=(Object[])legendaryPointInfoProps.getProperty("ItemAdvancement_LegendaryPointSlotInfo_Array");` |

### `ItemAdvancement_LegendaryPointsTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 157 | `int legendaryPointsTableId=((Integer)legendaryPointSlotInfoProps.getProperty("ItemAdvancement_LegendaryPointsTable")).intValue();` |

### `ItemAdvancement_LevelTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 104 | `int levelTableId=((Integer)itemInfoProps.getProperty("ItemAdvancement_LevelTable")).intValue();` |

### `ItemAdvancement_MaxILevelProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatConversionDataInspection.java | 46 | `int progressionId=((Integer)props.getProperty("ItemAdvancement_MaxILevelProgression")).intValue();` |
| items/legendary/MainDatLegendarySystem2Loader.java | 58 | `int progressionID=((Integer)itemAdvancementControlProps.getProperty("ItemAdvancement_MaxILevelProgression")).intValue();` |

### `ItemAdvancement_Mod_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 368 | `int effectWeight=((Integer)effectEntry.getProperty("ItemAdvancement_Mod_Weight")).intValue();` |

### `ItemAdvancement_ProgressionList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 347 | `int progressionListId=((Integer)progressionListSpec.getProperty("ItemAdvancement_ProgressionList")).intValue();` |
| items/legendary/PassivesLoader.java | 72 | `int effectsListId=((Integer)listProps.getProperty("ItemAdvancement_ProgressionList")).intValue();` |

### `ItemAdvancement_ProgressionListArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 342 | `Object[] progressionLists=(Object[])props.getProperty("ItemAdvancement_ProgressionListArray");` |
| items/legendary/PassivesLoader.java | 68 | `Object[] listsArray=(Object[])tableProps.getProperty("ItemAdvancement_ProgressionListArray");` |

### `ItemAdvancement_ProgressionList_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 349 | `int weight=((Integer)progressionListSpec.getProperty("ItemAdvancement_ProgressionList_Weight")).intValue();` |

### `ItemAdvancement_Quality`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendarySystemLoader.java | 93 | `int qualityCode=((Integer)itemInfoProps.getProperty("ItemAdvancement_Quality")).intValue();` |

### `ItemAdvancement_ReforgeGroup_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 329 | `Object[] reforgeGroups=(Object[])reforgeTableItemProps.getProperty("ItemAdvancement_ReforgeGroup_Array");` |

### `ItemAdvancement_ReforgeSlotInfo_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 299 | `Object[] reforgeTables=(Object[])globalReforgeTableProps.getProperty("ItemAdvancement_ReforgeSlotInfo_Array");` |

### `ItemAdvancement_ReforgeTable`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 303 | `int reforgeTableId=((Integer)reforgeTableProps.getProperty("ItemAdvancement_ReforgeTable")).intValue();` |

### `ItemAdvancement_ReforgeTable_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 323 | `Object[] reforgeTableItems=(Object[])reforgeTableProps.getProperty("ItemAdvancement_ReforgeTable_Array");` |

### `ItemAdvancement_RunicLootListOverride`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 310 | `Integer runicLootListId=(Integer)properties.getProperty("ItemAdvancement_RunicLootListOverride");` |

### `ItemAdvancement_RunicToCreate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 294 | `Integer relicId=(Integer)properties.getProperty("ItemAdvancement_RunicToCreate");` |

### `ItemAdvancement_Slot`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 304 | `int slotMask=((Integer)reforgeTableProps.getProperty("ItemAdvancement_Slot")).intValue();` |
| items/legendary/MainDatLegendarySystemLoader.java | 152 | `int slotBits=((Integer)legendaryPointSlotInfoProps.getProperty("ItemAdvancement_Slot")).intValue();` |

### `ItemAdvancement_Title_DamageType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendaryTitlesLoader.java | 122 | `int damageTypeCode=((Integer)properties.getProperty("ItemAdvancement_Title_DamageType")).intValue();` |

### `ItemAdvancement_Title_SlayerGenusType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/MainDatLegendaryTitlesLoader.java | 126 | `Integer slayerGenusType=(Integer)properties.getProperty("ItemAdvancement_Title_SlayerGenusType");` |

### `ItemAdvancement_WidgetDID_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 218 | `Object[] array=(Object[])props.getProperty("ItemAdvancement_WidgetDID_Array");` |

### `ItemDecayControl_DurationMapList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDecayLoader.java | 37 | `Object[] map=(Object[])properties.getProperty("ItemDecayControl_DurationMapList");` |

### `ItemDecayControl_DurationType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDecayLoader.java | 42 | `int type=((Integer)entryProps.getProperty("ItemDecayControl_DurationType")).intValue();` |

### `ItemDecayControl_DurationValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDecayLoader.java | 41 | `float duration=((Float)entryProps.getProperty("ItemDecayControl_DurationValue")).floatValue();` |

### `ItemDecay_Duration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 449 | `Integer durationType=(Integer)props.getProperty("ItemDecay_Duration");` |

### `ItemGameSet_UseAverageItemLevelForSetLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 119 | `Integer useAverageItemLevel=(Integer)properties.getProperty("ItemGameSet_UseAverageItemLevelForSetLevel");` |

### `ItemMunging_Control_Color_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/MainDatColorLoader.java | 51 | `Object[] entries=(Object[])properties.getProperty("ItemMunging_Control_Color_List");` |

### `ItemMunging_ItemLevelOverrideProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 788 | `Integer progressionId=(Integer)properties.getProperty("ItemMunging_ItemLevelOverrideProgression");` |

### `ItemMunging_ItemLevelOverrideProperty`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 789 | `Integer propertyId=(Integer)properties.getProperty("ItemMunging_ItemLevelOverrideProperty");` |

### `ItemMunging_MaxMungeLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 787 | `Integer maxMungingLevel=(Integer)properties.getProperty("ItemMunging_MaxMungeLevel");` |

### `ItemMunging_MinMungeLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 238 | `Integer minScaledLevel=(Integer)properties.getProperty("ItemMunging_MinMungeLevel");` |
| items/MainDatItemsLoader.java | 786 | `Integer minMungingLevel=(Integer)properties.getProperty("ItemMunging_MinMungeLevel");` |

### `ItemMunging_NameLookup_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/MainDatColorLoader.java | 67 | `Float colorValue=(Float)colorProps.getProperty("ItemMunging_NameLookup_Value");` |

### `ItemSocketControl_Image_Bitfield`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/SocketIconsLoader.java | 59 | `Long bitfield=(Long)entryProps.getProperty("ItemSocketControl_Image_Bitfield");` |

### `ItemSocketControl_LevelToEssenceIconOverlay_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/SocketIconsLoader.java | 46 | `Object[] essenceOverlaysArray=(Object[])props.getProperty("ItemSocketControl_LevelToEssenceIconOverlay_Array");` |

### `ItemSocketControl_Socket_Image_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/SocketIconsLoader.java | 54 | `Object[] socketImageArray=(Object[])props.getProperty("ItemSocketControl_Socket_Image_Array");` |

### `Item_AppearanceKey`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 120 | `Integer key=(Integer)entryProps.getProperty("Item_AppearanceKey");` |

### `Item_Armor_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 566 | `Integer armourValue=(Integer)properties.getProperty("Item_Armor_Value");` |

### `Item_Armor_Value_Lookup_Table`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 570 | `Integer armourProgressId=(Integer)properties.getProperty("Item_Armor_Value_Lookup_Table");` |

### `Item_BaseActionDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 649 | `Float duration=(Float)properties.getProperty("Item_BaseActionDuration");` |
| items/SpeedValuesLoader.java | 94 | `float baseDuration=((Float)durationProps.getProperty("Item_BaseActionDuration")).floatValue();` |

### `Item_BaseAnimDurationMultiplierMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 650 | `Float mod=(Float)properties.getProperty("Item_BaseAnimDurationMultiplierMod");` |
| items/SpeedValuesLoader.java | 95 | `float animDurationMod=((Float)durationProps.getProperty("Item_BaseAnimDurationMultiplierMod")).floatValue();` |

### `Item_BaseVal`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemValueLoader.java | 96 | `float baseValue=((Float)baseValueProps.getProperty("Item_BaseVal")).floatValue();` |

### `Item_BaseValArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemValueLoader.java | 91 | `Object[] baseValueArray=(Object[])properties.getProperty("Item_BaseValArray");` |

### `Item_CPM_IAImbuedCombatPropertyMod`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 513 | `int imbuedLegacyId=((Integer)props.getProperty("Item_CPM_IAImbuedCombatPropertyMod")).intValue();` |

### `Item_CPM_LargeIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 527 | `int iconId=((Integer)props.getProperty("Item_CPM_LargeIcon")).intValue();` |

### `Item_Class`

Observed raw data classes: 1113, 1210, 1722, 1724, 1989, 2097, 2516, 794, 796, 798, 803, 804, 815.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 179 | `Integer itemClassCode=(Integer)properties.getProperty("Item_Class");` |
| items/SocketablesManager.java | 74 | `Integer itemClassCode=(Integer)properties.getProperty("Item_Class");` |

### `Item_Client_Sort_PropertyNameArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemSortingDataLoader.java | 60 | `Object[] propertiesArray=(Object[])entryProps.getProperty("Item_Client_Sort_PropertyNameArray");` |

### `Item_Client_Sort_Type`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemSortingDataLoader.java | 59 | `Integer sortType=(Integer)entryProps.getProperty("Item_Client_Sort_Type");` |
| items/ItemSortingDataLoader.java | 87 | `Integer sortType=(Integer)properties.getProperty("Item_Client_Sort_Type");` |

### `Item_CombatPropertyModArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 310 | `Object[] combatPropertyModArray=(Object[])combatPropertyProps.getProperty("Item_CombatPropertyModArray");` |

### `Item_Decoration_Category`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 422 | `Long code=(Long)props.getProperty("Item_Decoration_Category");` |
| sounds/ItemsMusicLoader.java | 136 | `Long category=(Long)itemProps.getProperty("Item_Decoration_Category");` |

### `Item_Decoration_PropertyHook_Name`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/ItemsMusicLoader.java | 131 | `Integer propertyId=(Integer)itemProps.getProperty("Item_Decoration_PropertyHook_Name");` |

### `Item_Decoration_PropertyHook_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/ItemsMusicLoader.java | 132 | `PropertyValue propertyValueValue=itemProps.getPropertyValueByName("Item_Decoration_PropertyHook_Value");` |

### `Item_Disenchant_Component_Result`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatDisenchantmentsLoader.java | 58 | `Integer did=(Integer)properties.getProperty("Item_Disenchant_Component_Result");` |

### `Item_Disenchant_Trophy_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatDisenchantmentsLoader.java | 59 | `Integer trophyListId=(Integer)properties.getProperty("Item_Disenchant_Trophy_List");` |

### `Item_Disenchant_Value`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatDisenchantmentsLoader.java | 57 | `Integer value=(Integer)properties.getProperty("Item_Disenchant_Value");` |

### `Item_DistributionType`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 866 | `Integer distributionType=(Integer)properties.getProperty("Item_DistributionType");` |

### `Item_DurabilityEnum`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 284 | `Integer durabilityEnum=(Integer)properties.getProperty("Item_DurabilityEnum");` |

### `Item_EquipmentCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 680 | `Long equipmentCategoryValue=(Long)properties.getProperty("Item_EquipmentCategory");` |
| items/SpeedValuesLoader.java | 80 | `Long equipmentCategoryValue=(Long)properties.getProperty("Item_EquipmentCategory");` |
| items/legendary/LegaciesLoader.java | 242 | `long equipmentCategory=((Long)legacyProps.getProperty("Item_EquipmentCategory")).longValue();` |

### `Item_Level`

Observed raw data classes: 1210, 1724, 2097, 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 331 | `Integer itemLevel=(Integer)props.getProperty("Item_Level");` |
| items/MainDatItemsLoader.java | 227 | `Integer level=(Integer)properties.getProperty("Item_Level");` |
| items/SocketablesManager.java | 208 | `int itemLevel=((Integer)props.getProperty("Item_Level")).intValue();` |

### `Item_MaxStructurePoints`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 265 | `Integer durability=(Integer)properties.getProperty("Item_MaxStructurePoints");` |

### `Item_Music_Instrument_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/ItemsMusicLoader.java | 157 | `Integer category=(Integer)itemProps.getProperty("Item_Music_Instrument_Type");` |

### `Item_PropertyModProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 546 | `int prog=((Integer)qualityProps.getProperty("Item_PropertyModProgression")).intValue();` |

### `Item_PropertySet`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SocketablesManager.java | 229 | `int setId=((Integer)props.getProperty("Item_PropertySet")).intValue();` |

### `Item_Quality`

Observed raw data classes: 1210, 1724, 2097, 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemValueLoader.java | 85 | `int qualityCode=((Integer)qualityProps.getProperty("Item_Quality")).intValue();` |
| items/MainDatItemsLoader.java | 268 | `Integer quality=(Integer)properties.getProperty("Item_Quality");` |
| items/legendary/LegaciesLoader.java | 537 | `int quality=((Integer)qualityProps.getProperty("Item_Quality")).intValue();` |

### `Item_QualityArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemValueLoader.java | 81 | `Object[] qualityArray=(Object[])properties.getProperty("Item_QualityArray");` |

### `Item_QualityCombatPropertyModArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 531 | `Object[] qualityArray=(Object[])props.getProperty("Item_QualityCombatPropertyModArray");` |

### `Item_QualityModVal`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemValueLoader.java | 87 | `float factor=((Float)qualityProps.getProperty("Item_QualityModVal")).floatValue();` |

### `Item_RequiredCombatPropertyModDid`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 314 | `int effectsTableId=((Integer)combatPropertyModProps.getProperty("Item_RequiredCombatPropertyModDid")).intValue();` |
| items/legendary/LegaciesLoader.java | 535 | `int effectId=((Integer)qualityProps.getProperty("Item_RequiredCombatPropertyModDid")).intValue();` |

### `Item_RequiredCombatPropertyType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 532 | `Integer combatPropertyType=(Integer)properties.getProperty("Item_RequiredCombatPropertyType");` |
| items/legendary/LegaciesLoader.java | 315 | `int combatPropertyType=((Integer)combatPropertyModProps.getProperty("Item_RequiredCombatPropertyType")).intValue();` |

### `Item_SexOfWearer`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 119 | `int sex=((Integer)entryProps.getProperty("Item_SexOfWearer")).intValue();` |

### `Item_Socket_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 387 | `Object[] essenceSlots=(Object[])properties.getProperty("Item_Socket_Array");` |
| items/MainDatItemsLoader.java | 687 | `Object[] essenceSlots=(Object[])properties.getProperty("Item_Socket_Array");` |

### `Item_Socket_LevelupRuneIncrement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SocketablesManager.java | 228 | `int levelupIncrement=((Integer)props.getProperty("Item_Socket_LevelupRuneIncrement")).intValue();` |
| items/SocketablesManager.java | 250 | `int levelupIncrement=((Integer)props.getProperty("Item_Socket_LevelupRuneIncrement")).intValue();` |

### `Item_Socket_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 406 | `int socketTypeCode=((Long)essenceSlotProps.getProperty("Item_Socket_Type")).intValue();` |
| items/MainDatItemsLoader.java | 441 | `int socketType=((Long)essenceSlotProps.getProperty("Item_Socket_Type")).intValue();` |

### `Item_Socket_Unlock_ILevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 408 | `int unlockLevel=((Integer)essenceSlotProps.getProperty("Item_Socket_Unlock_ILevel")).intValue();` |

### `Item_SpeciesOfWearer`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 118 | `int species=((Integer)entryProps.getProperty("Item_SpeciesOfWearer")).intValue();` |

### `Item_UniquenessChannel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SocketablesManager.java | 231 | `Integer uniquenessChannelCode=(Integer)props.getProperty("Item_UniquenessChannel");` |

### `Item_Value`

Observed raw data classes: 2097, 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 481 | `Integer itemValue=(Integer)properties.getProperty("Item_Value");` |

### `Item_ValueLookupTable`

Observed raw data classes: 1210, 1724, 2097, 796, 798, 803.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 453 | `Integer itemValueTableId=(Integer)properties.getProperty("Item_ValueLookupTable");` |

### `Item_WeaponActionDurationDataArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SpeedValuesLoader.java | 89 | `Object[] dataArray=(Object[])properties.getProperty("Item_WeaponActionDurationDataArray");` |

### `Item_WeaponActionDurationTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SpeedValuesLoader.java | 46 | `Object[] idObjs=(Object[])props.getProperty("Item_WeaponActionDurationTable");` |

### `Item_WeaponSpeed`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/SpeedValuesLoader.java | 93 | `int weaponSpeed=((Integer)durationProps.getProperty("Item_WeaponSpeed")).intValue();` |

### `Item_WeaponVarianceEquipmentCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainWeaponDamageLoader.java | 55 | `Long equipmentCategoryValue=(Long)entryProps.getProperty("Item_WeaponVarianceEquipmentCategory");` |

### `Item_WeaponVarianceTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainWeaponDamageLoader.java | 50 | `Object[] entries=(Object[])props.getProperty("Item_WeaponVarianceTable");` |

### `Item_WeaponVarianceValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainWeaponDamageLoader.java | 60 | `Float variance=(Float)entryProps.getProperty("Item_WeaponVarianceValue");` |

### `Item_WornAppearance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 121 | `int wornAppearance=((Integer)entryProps.getProperty("Item_WornAppearance")).intValue();` |

### `Item_WornAppearanceMapList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 50 | `Object[] entryArray=(Object[])props.getProperty("Item_WornAppearanceMapList");` |

### `Item_iLevel_Bonus_Chance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 822 | `Float chance=(Float)properties.getProperty("Item_iLevel_Bonus_Chance");` |

### `Item_iLevel_Bonus_Limit`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 819 | `Integer bonusLimit=(Integer)properties.getProperty("Item_iLevel_Bonus_Limit");` |

### `Item_iLevel_Crafting_Offset`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/MainDatRecipesLoader.java | 332 | `Integer craftingOffset=(Integer)props.getProperty("Item_iLevel_Crafting_Offset");` |

### `LinearInterpolatingProgression_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/progressions/ProgressionFactory.java | 101 | `Object[] progression=(Object[])properties.getProperty("LinearInterpolatingProgression_Array");` |

### `LinearInterpolatingProgression_Key`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/progressions/ProgressionFactory.java | 109 | `Integer key=(Integer)pointProperties.getProperty("LinearInterpolatingProgression_Key");` |

### `LinearInterpolatingProgression_Value`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/progressions/ProgressionFactory.java | 110 | `Float value=(Float)pointProperties.getProperty("LinearInterpolatingProgression_Value");` |

### `LoE_Control_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 72 | `Object[] array=(Object[])props.getProperty("LoE_Control_Array");` |

### `LoE_Control_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 82 | `int effectID=((Integer)entryProps.getProperty("LoE_Control_Effect")).intValue();` |

### `LootGenControl_DropFrequencyTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootProbabilities.java | 59 | `Object[] tableArray=(Object[])properties.getProperty("LootGenControl_DropFrequencyTable");` |

### `LootGenControl_DropFrequency_Label`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootProbabilities.java | 64 | `Integer code=(Integer)entryProps.getProperty("LootGenControl_DropFrequency_Label");` |

### `LootGenControl_DropFrequency_Percentage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootProbabilities.java | 63 | `Float percentage=(Float)entryProps.getProperty("LootGenControl_DropFrequency_Percentage");` |

### `LootGenControl_SpeciesLevelLootTableArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatGenericMobLootLoader.java | 75 | `Object[] array=(Object[])properties.getProperty("LootGenControl_SpeciesLevelLootTableArray");` |

### `LootGen_BarterTrophyList`

Observed raw data classes: 1723, 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 88 | `Integer barterTrophyListId=(Integer)properties.getProperty("LootGen_BarterTrophyList");` |

### `LootGen_CustomSkirmishLootLookupTable`

Observed raw data classes: 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 252 | `Integer customSkirmishLootLookupTableId=(Integer)properties.getProperty("LootGen_CustomSkirmishLootLookupTable");` |

### `LootGen_FilteredTreasureListArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 138 | `Object[] list=(Object[])properties.getProperty("LootGen_FilteredTreasureListArray");` |

### `LootGen_FilteredTrophyTable_EntryDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 142 | `int lootTableId=((Integer)itemProps.getProperty("LootGen_FilteredTrophyTable_EntryDID")).intValue();` |

### `LootGen_GeneratesTrophies`

Observed raw data classes: 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 93 | `boolean generatesTrophy=(((Integer)properties.getProperty("LootGen_GeneratesTrophies")).intValue()!=0);` |

### `LootGen_ReputationTrophyList`

Observed raw data classes: 1723, 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 95 | `Integer reputationTrophyListId=(Integer)properties.getProperty("LootGen_ReputationTrophyList");` |
| items/MainDatContainerLoader.java | 244 | `Integer reputationTrophyList=(Integer)properties.getProperty("LootGen_ReputationTrophyList");` |

### `LootGen_TreasureList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 380 | `Object[] treasureList=(Object[])properties.getProperty("LootGen_TreasureList");` |

### `LootGen_TreasureList_GroupProfile`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 390 | `int profile=((Integer)treasureProps.getProperty("LootGen_TreasureList_GroupProfile")).intValue();` |

### `LootGen_TreasureList_Override`

Observed raw data classes: 1723, 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 101 | `int treasureListOverrideId=((Integer)properties.getProperty("LootGen_TreasureList_Override")).intValue();` |
| items/MainDatContainerLoader.java | 237 | `Integer treasureListOverrideId=(Integer)properties.getProperty("LootGen_TreasureList_Override");` |

### `LootGen_TreasureList_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 389 | `int weight=((Integer)treasureProps.getProperty("LootGen_TreasureList_Weight")).intValue();` |

### `LootGen_TrophyList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 190 | `Object[] trophyList=(Object[])properties.getProperty("LootGen_TrophyList");` |

### `LootGen_TrophyList_DropFrequency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 218 | `int frequencyCode=((Integer)trophyProps.getProperty("LootGen_TrophyList_DropFrequency")).intValue();` |

### `LootGen_TrophyList_GroupDrop`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 248 | `Integer groupDropInt=(Integer)trophyProps.getProperty("LootGen_TrophyList_GroupDrop");` |

### `LootGen_TrophyList_ItemOrProfile`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 221 | `int itemOrProfile=((Integer)trophyProps.getProperty("LootGen_TrophyList_ItemOrProfile")).intValue();` |

### `LootGen_TrophyList_ItemQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 231 | `Integer quantityInt=(Integer)trophyProps.getProperty("LootGen_TrophyList_ItemQuantity");` |

### `LootGen_TrophyList_Override`

Observed raw data classes: 1723, 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 107 | `int trophyListOverrideId=((Integer)properties.getProperty("LootGen_TrophyList_Override")).intValue();` |

### `LootGen_WeightedTreasureTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 93 | `Object[] treasureTable=(Object[])properties.getProperty("LootGen_WeightedTreasureTable");` |

### `LootGen_WeightedTreasureTable_TrophyList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 103 | `int trophyListId=((Integer)treasureTableItemProps.getProperty("LootGen_WeightedTreasureTable_TrophyList")).intValue();` |

### `LootGen_WeightedTreasureTable_TrophyList_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 102 | `int weight=((Integer)treasureTableItemProps.getProperty("LootGen_WeightedTreasureTable_TrophyList_Weight")).intValue();` |

### `Loot_IsRemoteLootable`

Observed raw data classes: 1723, 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 112 | `Integer isRemoteLootableInt=(Integer)properties.getProperty("Loot_IsRemoteLootable");` |

### `Mod_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/ProficienciesLoader.java | 75 | `Object[] modArray=(Object[])props.getProperty("Mod_Array");` |
| effects/loaders/PropertyModificationEffectLoader.java | 30 | `Object modArray=effectProps.getProperty("Mod_Array");` |
| skills/mounts/MountsLoader.java | 113 | `Object[] mods=(Object[])effectProps.getProperty("Mod_Array");` |
| skills/pets/CosmeticPetLoader.java | 64 | `Object[] mods=(Object[])effectProps.getProperty("Mod_Array");` |

### `Mod_Modified`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/ProficienciesLoader.java | 81 | `Integer propertyID=(Integer)modEntryProps.getProperty("Mod_Modified");` |

### `Mod_ModifierOp`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/DatStatUtils.java | 228 | `Integer modifiersOp=(Integer)statProperties.getProperty("Mod_ModifierOp");` |

### `Mod_Op`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/ProficienciesLoader.java | 85 | `Integer op=(Integer)modEntryProps.getProperty("Mod_Op");` |
| utils/DatStatUtils.java | 207 | `Integer modOp=(Integer)statProperties.getProperty("Mod_Op");` |

### `Mod_ProgressionCeiling`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/DatStatUtils.java | 124 | `Integer maxLevel=(Integer)statProperties.getProperty("Mod_ProgressionCeiling");` |

### `Mod_ProgressionFloor`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/DatStatUtils.java | 123 | `Integer minLevel=(Integer)statProperties.getProperty("Mod_ProgressionFloor");` |

### `MonsterLevel_ExaminationModStatType`

Observed raw data classes: 1724, 5785.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatGenericMobLootLoader.java | 126 | `int mobTypeCode=((Integer)entryProps.getProperty("MonsterLevel_ExaminationModStatType")).intValue();` |

### `MonsterPlay_Class`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 63 | `int classCode=((Integer)classInfo.getProperty("MonsterPlay_Class")).intValue();` |

### `MonsterPlay_ClassIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 91 | `int classIconId=((Integer)classInfo.getProperty("MonsterPlay_ClassIcon")).intValue();` |

### `MonsterPlay_MonsterInfo`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 61 | `PropertiesSet classInfo=(PropertiesSet)properties.getProperty("MonsterPlay_MonsterInfo");` |

### `MonsterPlay_PerkInventory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 93 | `Integer perkInventoryId=(Integer)mpClassProps.getProperty("MonsterPlay_PerkInventory");` |

### `MonsterPlay_Skill`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 182 | `int skillId=((Integer)skillProperties.getProperty("MonsterPlay_Skill")).intValue();` |

### `MonsterPlay_SkillList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 177 | `Object[] skillsProperties=(Object[])properties.getProperty("MonsterPlay_SkillList");` |

### `MonsterPlay_SkillMinLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 181 | `int level=((Integer)skillProperties.getProperty("MonsterPlay_SkillMinLevel")).intValue();` |

### `MonsterPlay_Trait`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 125 | `int traitId=((Integer)virtueProperties.getProperty("MonsterPlay_Trait")).intValue();` |
| characters/MonsterClassDataLoader.java | 152 | `int traitId=((Integer)traitProperties.getProperty("MonsterPlay_Trait")).intValue();` |

### `MonsterPlay_TraitList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 144 | `Object[] traitsProperties=(Object[])properties.getProperty("MonsterPlay_TraitList");` |

### `MonsterPlay_TraitMinLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 150 | `int level=((Integer)traitProperties.getProperty("MonsterPlay_TraitMinLevel")).intValue();` |

### `MonsterPlay_TraitMinRank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 151 | `Integer rank=(Integer)traitProperties.getProperty("MonsterPlay_TraitMinRank");` |

### `MonsterPlay_VirtueList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 117 | `Object[] virtuesProperties=(Object[])properties.getProperty("MonsterPlay_VirtueList");` |

### `MonsterPlay_VirtueMaxRank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 124 | `int maxRank=((Integer)virtueProperties.getProperty("MonsterPlay_VirtueMaxRank")).intValue();` |

### `MonsterPlay_VirtueStartRank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MonsterClassDataLoader.java | 123 | `int startRank=((Integer)virtueProperties.getProperty("MonsterPlay_VirtueStartRank")).intValue();` |

### `Mood_Control_Max_Morale_Modifier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 108 | `float moraleModifier=((Float)entryProps.getProperty("Mood_Control_Max_Morale_Modifier")).floatValue();` |

### `Mood_Control_Maximum_Dread_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 103 | `int maxDread=((Integer)props.getProperty("Mood_Control_Maximum_Dread_Level")).intValue();` |

### `Mood_Control_Maximum_Hope_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 101 | `int maxHope=((Integer)props.getProperty("Mood_Control_Maximum_Hope_Level")).intValue();` |

### `Mood_Control_Mood_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 135 | `int effectID=((Integer)entryProps.getProperty("Mood_Control_Mood_Effect")).intValue();` |

### `Mood_Control_Mood_Effects`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 131 | `Object[] array=(Object[])props.getProperty("Mood_Control_Mood_Effects");` |

### `Mood_Control_Mood_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 109 | `int moodLevel=((Integer)entryProps.getProperty("Mood_Control_Mood_Level")).intValue();` |

### `Mood_Control_Moods`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/mood/MainMoodDataLoader.java | 104 | `Object[] array=(Object[])props.getProperty("Mood_Control_Moods");` |

### `Mount_Control_Tree_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 153 | `Object[] array=(Object[])props.getProperty("Mount_Control_Tree_Array");` |

### `Mount_Control_Tree_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 164 | `int effectID=((Integer)entryProps.getProperty("Mount_Control_Tree_Effect")).intValue();` |

### `Mount_Durability_Base_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 109 | `int morale=((Integer)effectProps.getProperty("Mount_Durability_Base_Max")).intValue();` |

### `Mount_SkillList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 150 | `ArrayPropertyValue skillListValue=(ArrayPropertyValue)mountsDirectoryProps.getPropertyValueByName("Mount_SkillList");` |

### `Mount_SkillToGrant`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 147 | `int skillID=((Integer)entryProps.getProperty("Mount_SkillToGrant")).intValue();` |

### `Mount_SkillToGrantRaceArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 139 | `Object[] array=(Object[])props.getProperty("Mount_SkillToGrantRaceArray");` |

### `Mount_Type`

Observed raw data classes: 1723, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 99 | `int mountTypeCode=((Integer)effectProps.getProperty("Mount_Type")).intValue();` |

### `Mounted_Player_Cosmetic_Slot_Scale`

Observed raw data classes: 1723, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 125 | `Object scale=effectProps.getProperty("Mounted_Player_Cosmetic_Slot_Scale");` |

### `NationalityTable_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 77 | `int iconID=((Integer)properties.getProperty("NationalityTable_Icon")).intValue();` |

### `NationalityTable_Naming_Guideline_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 80 | `Object[] guidelinesArray=(Object[])properties.getProperty("NationalityTable_Naming_Guideline_Array");` |

### `NationalityTable_Nationality`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 68 | `int code=((Integer)properties.getProperty("NationalityTable_Nationality")).intValue();` |

### `NationalityTable_NationalityTableList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 45 | `Object[] nationalityIdsArray=(Object[])properties.getProperty("NationalityTable_NationalityTableList");` |

### `NationalityTable_Sex`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 85 | `int sexCode=((Integer)guidelineProps.getProperty("NationalityTable_Sex")).intValue();` |

### `NationalityTable_Title`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/NationalitiesLoader.java | 100 | `Integer titleID=(Integer)properties.getProperty("NationalityTable_Title");` |

### `NeighborhoodDirectory_NeighborhoodArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 187 | `Object[] neighborhoodArray=(Object[])props.getProperty("NeighborhoodDirectory_NeighborhoodArray");` |

### `NeighborhoodTemplate_BootPosition`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 251 | `String bootPositionStr=(String)props.getProperty("NeighborhoodTemplate_BootPosition");` |

### `NeighborhoodTemplate_Boundaries`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 243 | `Object[] boundariesArray=(Object[])props.getProperty("NeighborhoodTemplate_Boundaries");` |

### `NeighborhoodTemplate_HouseList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 265 | `int houseListID=((Integer)props.getProperty("NeighborhoodTemplate_HouseList")).intValue();` |

### `NeighborhoodTemplate_Telepad`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 258 | `String entrancePositionStr=(String)props.getProperty("NeighborhoodTemplate_Telepad");` |

### `Neighborhood_NeighborhoodTemplate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| housing/MainDatHousingLoader.java | 208 | `int templateID=((Integer)props.getProperty("Neighborhood_NeighborhoodTemplate")).intValue();` |

### `PackageItem_BindAllItemsToAccount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 150 | `Integer bind2Acc=(Integer)properties.getProperty("PackageItem_BindAllItemsToAccount");` |

### `PackageItem_BindAllItemsToCharacter`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 155 | `Integer bind2Char=(Integer)properties.getProperty("PackageItem_BindAllItemsToCharacter");` |

### `PackageItem_FilteredTrophyTableTemplate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 78 | `Integer filteredLootTableId=(Integer)properties.getProperty("PackageItem_FilteredTrophyTableTemplate");` |

### `PackageItem_Freep_WeightedTreasureTableID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 85 | `Integer freepWeightedTreasureTableId=(Integer)properties.getProperty("PackageItem_Freep_WeightedTreasureTableID");` |

### `PackageItem_IsPreviewable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 135 | `Integer previewable=(Integer)properties.getProperty("PackageItem_IsPreviewable");` |
| items/MainDatContainerLoader.java | 185 | `Integer preview=(Integer)properties.getProperty("PackageItem_IsPreviewable");` |

### `PackageItem_PreviewList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 138 | `Object[] previewList=(Object[])properties.getProperty("PackageItem_PreviewList");` |
| items/MainDatContainerLoader.java | 189 | `Object[] previewList=(Object[])properties.getProperty("PackageItem_PreviewList");` |

### `PackageItem_TrophyListTemplate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 92 | `Integer trophyTemplateId=(Integer)properties.getProperty("PackageItem_TrophyListTemplate");` |

### `PackageItem_UsePlayerAsContainerForMunging`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 160 | `Integer playerForMunging=(Integer)properties.getProperty("PackageItem_UsePlayerAsContainerForMunging");` |

### `PaperItemControl_BaseCap`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 66 | `PropertiesSet baseCapProps=(PropertiesSet)itemProps.getProperty("PaperItemControl_BaseCap");` |

### `PaperItemControl_CapDefault`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 69 | `Integer capDefault=(Integer)baseCapProps.getProperty("PaperItemControl_CapDefault");` |

### `PaperItemControl_Free_PaperItemArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 145 | `Object[] array=(Object[])props.getProperty("PaperItemControl_Free_PaperItemArray");` |

### `PaperItemControl_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 56 | `Integer itemId=(Integer)itemProps.getProperty("PaperItemControl_Item");` |

### `PaperItemControl_OldItem`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 171 | `Integer oldItemId=(Integer)versionProps.getProperty("PaperItemControl_OldItem");` |

### `PaperItemControl_PaperItemArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 132 | `Object[] array=(Object[])props.getProperty("PaperItemControl_PaperItemArray");` |

### `PaperItemControl_TreatBaseCapAsHardCap`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 74 | `Integer hardCap=(Integer)itemProps.getProperty("PaperItemControl_TreatBaseCapAsHardCap");` |

### `PaperItemControl_VersionArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 167 | `Object[] array=(Object[])props.getProperty("PaperItemControl_VersionArray");` |

### `PaperItem_Category`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 95 | `Integer paperItemCategoryCode=(Integer)itemProps.getProperty("PaperItem_Category");` |

### `PaperItem_SmallIcon`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatPaperItemsLoader.java | 98 | `Integer smallIconId=(Integer)itemProps.getProperty("PaperItem_SmallIcon");` |

### `PerkVendor_InventoryList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 125 | `Object[] idsArray=(Object[])props.getProperty("PerkVendor_InventoryList");` |

### `Perk_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 179 | `Integer effectId=(Integer)props.getProperty("Perk_Effect");` |

### `Perk_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 165 | `int iconId=((Integer)props.getProperty("Perk_Icon")).intValue();` |

### `Perk_MinLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 193 | `int minLevel=((Integer)props.getProperty("Perk_MinLevel")).intValue();` |

### `Perk_SessionPointCost`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 196 | `Integer pointsCost=(Integer)props.getProperty("Perk_SessionPointCost");` |

### `Perk_UICategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPerksLoader.java | 186 | `Integer uiCategoryCode=(Integer)props.getProperty("Perk_UICategory");` |

### `PhysObj`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/CosmeticLoader.java | 44 | `Integer physObj=(Integer)props.getProperty("PhysObj");` |

### `PipControl_Directory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 94 | `Object[] array=(Object[])props.getProperty("PipControl_Directory");` |
| skills/pips/PipsLoader.java | 53 | `Object[] pipArray=(Object[])props.getProperty("PipControl_Directory");` |

### `Pip_Examination_Home_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 81 | `Integer homeIcon=(Integer)pipProps.getProperty("Pip_Examination_Home_Icon");` |

### `Pip_Examination_Max_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 73 | `Integer maxIcon=(Integer)pipProps.getProperty("Pip_Examination_Max_Icon");` |

### `Pip_Examination_Min_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 68 | `Integer minIcon=(Integer)pipProps.getProperty("Pip_Examination_Min_Icon");` |

### `Pip_Home`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 76 | `Integer home=(Integer)pipProps.getProperty("Pip_Home");` |

### `Pip_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 71 | `int max=((Integer)pipProps.getProperty("Pip_Max")).intValue();` |

### `Pip_Min`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 66 | `int min=((Integer)pipProps.getProperty("Pip_Min")).intValue();` |

### `Pip_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/pips/PipsLoader.java | 59 | `int pipTypeCode=((Integer)pipProps.getProperty("Pip_Type")).intValue();` |

### `PrivateEncounterTemplate_ContainedLandBlockArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 101 | `Object[] blocksArray=(Object[])props.getProperty("PrivateEncounterTemplate_ContainedLandBlockArray");` |

### `PrivateEncounterTemplate_ContentLayer`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 93 | `int contentLayerId=((Integer)props.getProperty("PrivateEncounterTemplate_ContentLayer")).intValue();` |

### `PrivateEncounterTemplate_InstanceQuest`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 149 | `Integer questId=(Integer)props.getProperty("PrivateEncounterTemplate_InstanceQuest");` |

### `PrivateEncounterTemplate_MaxPlayers`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 125 | `Integer maxPlayers=(Integer)props.getProperty("PrivateEncounterTemplate_MaxPlayers");` |

### `PrivateEncounterTemplate_NumQuestsToBestow`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 190 | `Integer nbRandomQuests=(Integer)randomProps.getProperty("PrivateEncounterTemplate_NumQuestsToBestow");` |

### `PrivateEncounterTemplate_PropertyResponseMapDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 207 | `Integer mapDID=(Integer)props.getProperty("PrivateEncounterTemplate_PropertyResponseMapDID");` |

### `PrivateEncounterTemplate_PublicInstance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 96 | `Integer isPublicInt=(Integer)props.getProperty("PrivateEncounterTemplate_PublicInstance");` |

### `PrivateEncounterTemplate_QuestToBestow_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 161 | `Object[] questToBestowArray=(Object[])props.getProperty("PrivateEncounterTemplate_QuestToBestow_Array");` |
| instances/MainDatPrivateEncountersLoader.java | 195 | `Object[] questIdsArray=(Object[])randomProps.getProperty("PrivateEncounterTemplate_QuestToBestow_Array");` |

### `PrivateEncounterTemplate_RandomBestowalQuests_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 181 | `Object[] randomQuestsArray=(Object[])props.getProperty("PrivateEncounterTemplate_RandomBestowalQuests_Array");` |

### `ProgressionControl_TypeMultiplierTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 55 | `Object[] multipliersTable=(Object[])progressionControlProps.getProperty("ProgressionControl_TypeMultiplierTable");` |

### `ProgressionControl_TypeMultiplierTable_Multiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 64 | `float multiplier=((Float)multiplierProps.getProperty("ProgressionControl_TypeMultiplierTable_Multiplier")).floatValue();` |

### `ProgressionControl_TypeMultiplierTable_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 63 | `int typeCode=((Integer)multiplierProps.getProperty("ProgressionControl_TypeMultiplierTable_Type")).intValue();` |

### `ProgressionControl_TypeStartingLevelTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 42 | `Object[] startingLevelTable=(Object[])progressionControlProps.getProperty("ProgressionControl_TypeStartingLevelTable");` |

### `ProgressionControl_TypeStartingLevel_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 51 | `int level=((Integer)startingLevelProps.getProperty("ProgressionControl_TypeStartingLevel_Level")).intValue();` |

### `ProgressionControl_TypeStartingLevel_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/ProgressionControlLoader.java | 50 | `int typeCode=((Integer)startingLevelProps.getProperty("ProgressionControl_TypeStartingLevel_Type")).intValue();` |

### `Progression_MinimumIndexValue`

Observed raw data classes: 2402.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/progressions/ProgressionFactory.java | 84 | `Integer minXValue=(Integer)properties.getProperty("Progression_MinimumIndexValue");` |
| factions/MainDatFactionsLoader.java | 255 | `int minIndex=((Integer)tierNamesProps.getProperty("Progression_MinimumIndexValue")).intValue();` |

### `Progression_PointTier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 419 | `int pointTier=((Integer)progressionProps.getProperty("Progression_PointTier")).intValue();` |

### `Progression_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/legendary/LegaciesLoader.java | 423 | `int typeCode=((Integer)progressionProps.getProperty("Progression_Type")).intValue();` |

### `PropertyMetaData_DisplayAsPercentage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/stats/MainStatsLoader.java | 86 | `Integer percentage=(Integer)properties.getProperty("PropertyMetaData_DisplayAsPercentage");` |

### `PropertyMetaData_Property`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/stats/MainStatsLoader.java | 80 | `int propertyId=((Integer)properties.getProperty("PropertyMetaData_Property")).intValue();` |

### `PropertyMetaData_PropertyMetaDataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/stats/MainStatsLoader.java | 119 | `Object[] idsArray=(Object[])indexProperties.getProperty("PropertyMetaData_PropertyMetaDataList");` |

### `PropertyProgression_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 221 | `Object[] iconIDsArray=(Object[])iconProgression.getProperty("PropertyProgression_Array");` |
| common/progressions/ProgressionFactory.java | 55 | `PropertyValue propertyValue=properties.getPropertyValueByName("PropertyProgression_Array");` |

### `PropertyResponseCallback_AppliedEffect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 93 | `Object[] array=(Object[])props.getProperty("PropertyResponseCallback_AppliedEffect_Array");` |

### `PropertyResponseCallback_AppliedEffect_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 99 | `Object[] effectsArray=(Object[])entryProps.getProperty("PropertyResponseCallback_AppliedEffect_List");` |

### `PropertyResponseCallback_Ceiling`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 98 | `Integer ceiling=(Integer)entryProps.getProperty("PropertyResponseCallback_Ceiling");` |

### `PropertyResponseCallback_Floor`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 97 | `Integer floor=(Integer)entryProps.getProperty("PropertyResponseCallback_Floor");` |

### `PropertyResponse_Callback`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 60 | `int callbackID=((Integer)entryProps.getProperty("PropertyResponse_Callback")).intValue();` |

### `PropertyResponse_WorldEvent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 59 | `int worldEventID=((Integer)entryProps.getProperty("PropertyResponse_WorldEvent")).intValue();` |

### `PropertyResponse_WorldEventResponse_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/PropertyResponseMapsLoader.java | 54 | `Object[] array=(Object[])props.getProperty("PropertyResponse_WorldEventResponse_List");` |

### `QuestArcDirectory_QuestArc_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 341 | `Object[] list=(Object[])questArcsDirectory.getProperty("QuestArcDirectory_QuestArc_Array");` |

### `QuestArc_Quest_Array`

Observed raw data classes: 2119.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 353 | `Object[] list=(Object[])arcProps.getProperty("QuestArc_Quest_Array");` |

### `QuestControl_RewardLevelDIDArray`

Observed raw data classes: 1683.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 687 | `Object[] rewardMaps=(Object[])questControlProps.getProperty("QuestControl_RewardLevelDIDArray");` |

### `QuestDispenser_Action`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 80 | `Integer dispenserAction=(Integer)roleProps.getProperty("QuestDispenser_Action");` |
| achievables/DatRolesLoader.java | 115 | `int dispenserAction=((Integer)roleProps.getProperty("QuestDispenser_Action")).intValue();` |

### `QuestDispenser_NPCArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 203 | `Object[] npcArray=(Object[])properties.getProperty("QuestDispenser_NPCArray");` |

### `QuestDispenser_PrivateEncounterTemplate`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 149 | `Integer peId=(Integer)roleProps.getProperty("QuestDispenser_PrivateEncounterTemplate");` |

### `QuestDispenser_RoleConstraint`

Observed raw data classes: 1170, 1210, 1398, 1723, 1724, 5785, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 98 | `String dispenserRoleConstraint=(String)roleProps.getProperty("QuestDispenser_RoleConstraint");` |

### `QuestDispenser_RoleName`

Observed raw data classes: 1398, 1723, 1724, 5785, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 93 | `String dispenserRoleName=(String)roleProps.getProperty("QuestDispenser_RoleName");` |
| achievables/DatRolesLoader.java | 118 | `String dispenserRoleName=(String)roleProps.getProperty("QuestDispenser_RoleName");` |

### `QuestDispenser_TextArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 208 | `ArrayPropertyValue textArrayValue=(ArrayPropertyValue)properties.getPropertyValueByName("QuestDispenser_TextArray");` |

### `QuestEffect_ApplyRole`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievablesLoadingUtils.java | 168 | `int roleCode=((Integer)effectProps.getProperty("QuestEffect_ApplyRole")).intValue();` |

### `QuestEvent_BestowedQuestID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 904 | `int questId=((Integer)properties.getProperty("QuestEvent_BestowedQuestID")).intValue();` |

### `QuestEvent_DailyMaximumIncrements`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 713 | `Integer maxTimesPerDay=(Integer)properties.getProperty("QuestEvent_DailyMaximumIncrements");` |
| achievables/DatObjectivesLoader.java | 760 | `Integer dailyMaxIncrement=(Integer)properties.getProperty("QuestEvent_DailyMaximumIncrements");` |

### `QuestEvent_Detect`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 509 | `Integer detect=(Integer)properties.getProperty("QuestEvent_Detect");` |

### `QuestEvent_EmoteDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 694 | `Integer emoteId=(Integer)properties.getProperty("QuestEvent_EmoteDID");` |

### `QuestEvent_EmoteTargetDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 705 | `Integer targetDID=(Integer)properties.getProperty("QuestEvent_EmoteTargetDID");` |

### `QuestEvent_EventOrder`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 372 | `Integer eventOrder=(Integer)properties.getProperty("QuestEvent_EventOrder");` |

### `QuestEvent_FactionDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 891 | `int factionId=((Integer)properties.getProperty("QuestEvent_FactionDID")).intValue();` |

### `QuestEvent_HobbyDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 875 | `int hobbyId=((Integer)properties.getProperty("QuestEvent_HobbyDID")).intValue();` |

### `QuestEvent_ID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 324 | `int questEventId=((Integer)properties.getProperty("QuestEvent_ID")).intValue();` |

### `QuestEvent_LandmarkDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 641 | `Integer landmarkId=(Integer)properties.getProperty("QuestEvent_LandmarkDID");` |
| utils/MobUtils.java | 127 | `Integer landmarkDID=(Integer)mobProps.getProperty("QuestEvent_LandmarkDID");` |

### `QuestEvent_MonsterDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 680 | `Integer mobId=(Integer)properties.getProperty("QuestEvent_MonsterDID");` |

### `QuestEvent_MonsterGenus_Array`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 663 | `Object[] monsterGenusArray=(Object[])properties.getProperty("QuestEvent_MonsterGenus_Array");` |

### `QuestEvent_NPCTalk`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 613 | `Integer npcId=(Integer)properties.getProperty("QuestEvent_NPCTalk");` |

### `QuestEvent_Number`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 350 | `Integer count=(Integer)properties.getProperty("QuestEvent_Number");` |

### `QuestEvent_ObjectiveID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableEventIDLoader.java | 56 | `Integer objectiveID=(Integer)props.getProperty("QuestEvent_ObjectiveID");` |

### `QuestEvent_PlayerLevel`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 626 | `int level=((Integer)properties.getProperty("QuestEvent_PlayerLevel")).intValue();` |

### `QuestEvent_QuestComplete`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 817 | `Integer questId=(Integer)properties.getProperty("QuestEvent_QuestComplete");` |

### `QuestEvent_QuestCompleteCategory`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 832 | `Integer questCategoryCode=(Integer)properties.getProperty("QuestEvent_QuestCompleteCategory");` |

### `QuestEvent_QuestCompleteScope`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 810 | `Integer scopeCode=(Integer)properties.getProperty("QuestEvent_QuestCompleteScope");` |

### `QuestEvent_ReputationTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 892 | `int tier=((Integer)properties.getProperty("QuestEvent_ReputationTier")).intValue();` |

### `QuestEvent_ShowBillboardText`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 327 | `Integer showBillboardTextInt=(Integer)properties.getProperty("QuestEvent_ShowBillboardText");` |

### `QuestEvent_ShowProgressText`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 337 | `Integer showProgressTextInt=(Integer)properties.getProperty("QuestEvent_ShowProgressText");` |

### `QuestEvent_SkillDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 746 | `Integer skillId=(Integer)properties.getProperty("QuestEvent_SkillDID");` |

### `QuestEvent_TimeLimit`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 913 | `Integer timeLimit=(Integer)properties.getProperty("QuestEvent_TimeLimit");` |

### `QuestEvent_WorldEvent`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 857 | `Integer id=(Integer)properties.getProperty("QuestEvent_WorldEvent");` |

### `QuestEvent_WorldEvent_Operator`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 858 | `Integer operator=(Integer)properties.getProperty("QuestEvent_WorldEvent_Operator");` |

### `QuestEvent_WorldEvent_Value`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 856 | `Integer value=(Integer)properties.getProperty("QuestEvent_WorldEvent_Value");` |

### `QuestReward_Tier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/RewardsMapLoader.java | 83 | `Integer tier=(Integer)entryProps.getProperty("QuestReward_Tier");` |

### `QuestTreasure_FixedBillingTokenArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 453 | `Object[] billingTokenArray=(Object[])props.getProperty("QuestTreasure_FixedBillingTokenArray");` |

### `QuestTreasure_FixedTraitArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 274 | `Object[] traitArray=(Object[])props.getProperty("QuestTreasure_FixedTraitArray");` |

### `QuestTreasure_FixedVirtueArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 173 | `Object[] virtueArray=(Object[])props.getProperty("QuestTreasure_FixedVirtueArray");` |

### `QuestTreasure_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 307 | `int itemId=((Integer)itemProps.getProperty("QuestTreasure_Item")).intValue();` |
| achievables/rewards/DatRewardsLoader.java | 344 | `int relicId=((Integer)relicProps.getProperty("QuestTreasure_Item")).intValue();` |

### `QuestTreasure_ItemQuantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 308 | `Integer quantityValue=(Integer)itemProps.getProperty("QuestTreasure_ItemQuantity");` |
| achievables/rewards/DatRewardsLoader.java | 345 | `Integer quantityValue=(Integer)relicProps.getProperty("QuestTreasure_ItemQuantity");` |

### `QuestTreasure_SelectableEmoteArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 235 | `Object hasSelectableEmotes=props.getProperty("QuestTreasure_SelectableEmoteArray");` |

### `QuestTreasure_SelectableRunicArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 327 | `Object hasSelectableEmotes=props.getProperty("QuestTreasure_SelectableRunicArray");` |

### `QuestTreasure_SelectableTitleArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 195 | `Object hasSelectableTitles=props.getProperty("QuestTreasure_SelectableTitleArray");` |

### `QuestTreasure_Virtue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 179 | `int virtueStatId=((Integer)virtueProps.getProperty("QuestTreasure_Virtue")).intValue();` |

### `QuestTreasure_Virtue_Increment`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 180 | `Integer increment=(Integer)virtueProps.getProperty("QuestTreasure_Virtue_Increment");` |

### `QuestTreasure_Virtue_XP_Tier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 139 | `Integer virtueXpTier=((Integer)props.getProperty("QuestTreasure_Virtue_XP_Tier"));` |

### `Quest_Category`

Observed raw data classes: 1398, 1683.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 121 | `Integer categoryId=((Integer)properties.getProperty("Quest_Category"));` |
| achievables/quests/QuestsLoader.java | 304 | `Integer categoryId=((Integer)properties.getProperty("Quest_Category"));` |

### `Quest_ChallengeLevel`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 630 | `Integer challengeLevel=(Integer)properties.getProperty("Quest_ChallengeLevel");` |

### `Quest_ChallengeLevelOverrideProperty`

Observed raw data classes: 1398, 1683.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 631 | `Integer challengeLevelOverrideProperty=(Integer)properties.getProperty("Quest_ChallengeLevelOverrideProperty");` |

### `Quest_ClassTraitPointReward`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 103 | `Integer classPoints=((Integer)properties.getProperty("Quest_ClassTraitPointReward"));` |

### `Quest_CompletionCommentArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 186 | `Object[] commentsArray=(Object[])properties.getProperty("Quest_CompletionCommentArray");` |

### `Quest_CompletionConditionArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 157 | `ArrayPropertyValue completionConditionsArray=(ArrayPropertyValue)objectiveProps.getPropertyValueByName("Quest_CompletionConditionArray");` |

### `Quest_CraftExpTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 565 | `Integer craftXpTier=((Integer)properties.getProperty("Quest_CraftExpTier"));` |

### `Quest_CraftProfessionDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 569 | `Integer professionId=(Integer)properties.getProperty("Quest_CraftProfessionDID");` |

### `Quest_DataID`

Observed raw data classes: 1398, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievablesLoadingUtils.java | 166 | `int effectID=((Integer)effectProps.getProperty("Quest_DataID")).intValue();` |

### `Quest_DropFrequency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 86 | `int frequencyCode=((Integer)props.getProperty("Quest_DropFrequency")).intValue();` |

### `Quest_EffectArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievablesLoadingUtils.java | 153 | `Object[] effectArray=(Object[])properties.getProperty("Quest_EffectArray");` |

### `Quest_ExpTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 535 | `Integer xpTier=((Integer)properties.getProperty("Quest_ExpTier"));` |

### `Quest_ExpToGive`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 614 | `Integer xp=((Integer)properties.getProperty("Quest_ExpToGive"));` |

### `Quest_FactionDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 406 | `Integer factionId=(Integer)factionProps.getProperty("Quest_FactionDID");` |

### `Quest_FailureConditionArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 1066 | `Object[] conditionsArray=(Object[])props.getProperty("Quest_FailureConditionArray");` |

### `Quest_GiveItemArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 166 | `Object givenItems=properties.getProperty("Quest_GiveItemArray");` |

### `Quest_GlobalRoles`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 71 | `Object[] roles=(Object[])properties.getProperty("Quest_GlobalRoles");` |

### `Quest_GloryTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 583 | `Integer gloryTier=((Integer)properties.getProperty("Quest_GloryTier"));` |

### `Quest_GloryToGive`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 620 | `Integer glory=((Integer)properties.getProperty("Quest_GloryToGive"));` |

### `Quest_GoldTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 525 | `Integer goldTier=((Integer)properties.getProperty("Quest_GoldTier"));` |

### `Quest_GoldToGive`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 608 | `Integer gold=((Integer)properties.getProperty("Quest_GoldToGive"));` |

### `Quest_IgnoreDefaultChallengeLevel`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 632 | `Integer ignoreDefaultChallengeLevel=(Integer)properties.getProperty("Quest_IgnoreDefaultChallengeLevel");` |

### `Quest_IsAccomplishment`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatQuestDeedsUtils.java | 38 | `Object isAccomplishment=properties.getProperty("Quest_IsAccomplishment");` |

### `Quest_IsFellowshipRecommended`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 260 | `Integer fellowshipRecommended=((Integer)properties.getProperty("Quest_IsFellowshipRecommended"));` |

### `Quest_IsInstanceQuest`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 272 | `Integer isInstanceQuest=((Integer)properties.getProperty("Quest_IsInstanceQuest"));` |

### `Quest_IsMonsterPlayQuest`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 123 | `Integer isMonsterPlayCode=((Integer)properties.getProperty("Quest_IsMonsterPlayQuest"));` |
| achievables/quests/QuestsLoader.java | 156 | `Integer isMonsterPlayCode=((Integer)properties.getProperty("Quest_IsMonsterPlayQuest"));` |

### `Quest_IsPEBestowedQuest`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 290 | `Integer isPeBestowedQuest=((Integer)properties.getProperty("Quest_IsPEBestowedQuest"));` |

### `Quest_IsSessionQuest`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 284 | `Integer isSessionQuest=((Integer)properties.getProperty("Quest_IsSessionQuest"));` |

### `Quest_IsShareable`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 278 | `Integer isShareable=((Integer)properties.getProperty("Quest_IsShareable"));` |

### `Quest_IsSmallFellowshipRecommended`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 254 | `Integer smallFellowshipRecommended=((Integer)properties.getProperty("Quest_IsSmallFellowshipRecommended"));` |

### `Quest_ItemDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 89 | `int itemID=((Integer)props.getProperty("Quest_ItemDID")).intValue();` |

### `Quest_ItemExpTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 545 | `Integer itemXpTier=((Integer)properties.getProperty("Quest_ItemExpTier"));` |

### `Quest_LockType`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 141 | `Integer lockTypeCode=((Integer)properties.getProperty("Quest_LockType"));` |

### `Quest_LootItemDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 61 | `int itemID=((Integer)lootProps.getProperty("Quest_LootItemDID")).intValue();` |

### `Quest_LootItemProbability`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 69 | `Integer probability=(Integer)lootProps.getProperty("Quest_LootItemProbability");` |

### `Quest_LootItemProbabilityArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 74 | `Object[] probabilities=(Object[])lootProps.getProperty("Quest_LootItemProbabilityArray");` |

### `Quest_LootMonsterDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 91 | `Integer mobDID=(Integer)lootProps.getProperty("Quest_LootMonsterDID");` |

### `Quest_LootMonsterGenus_Array`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 98 | `Object[] monsterSpecsArray=(Object[])lootProps.getProperty("Quest_LootMonsterGenus_Array");` |

### `Quest_LootMonsterGenus_ExclusionArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 108 | `Object[] monsterExcludedSpecsArray=(Object[])lootProps.getProperty("Quest_LootMonsterGenus_ExclusionArray");` |

### `Quest_LootTable`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/AchievableLootLoader.java | 42 | `Object[] lootPropsArray=(Object[])properties.getProperty("Quest_LootTable");` |
| achievables/quests/QuestsLoader.java | 194 | `Object lootTable=properties.getProperty("Quest_LootTable");` |

### `Quest_MaxTimesCompletable`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 128 | `Integer maxTimes=((Integer)properties.getProperty("Quest_MaxTimesCompletable"));` |

### `Quest_MonsterAlignment`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/MobUtils.java | 58 | `Integer alignmentCode=(Integer)mobProps.getProperty("Quest_MonsterAlignment");` |

### `Quest_MonsterClass`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/MobUtils.java | 65 | `Integer classCode=(Integer)mobProps.getProperty("Quest_MonsterClass");` |

### `Quest_MonsterDivision`

Observed raw data classes: 1398, 1723.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatMobsLoader.java | 142 | `Integer mobDivisionCode=(Integer)properties.getProperty("Quest_MonsterDivision");` |
| loot/QuestItemDirectoryLoader.java | 92 | `int mobDivisionID=((Integer)props.getProperty("Quest_MonsterDivision")).intValue();` |
| utils/MobUtils.java | 115 | `Integer mobDivisionCode=(Integer)mobProps.getProperty("Quest_MonsterDivision");` |

### `Quest_MonsterGenus`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/MobUtils.java | 83 | `Integer genusCode=(Integer)mobProps.getProperty("Quest_MonsterGenus");` |

### `Quest_MonsterRegion`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 127 | `int regionID=((Integer)entryProps.getProperty("Quest_MonsterRegion")).intValue();` |
| utils/MobUtils.java | 121 | `Integer regionDID=(Integer)mobProps.getProperty("Quest_MonsterRegion");` |

### `Quest_MonsterSpecies`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/MobUtils.java | 91 | `Integer speciesCode=(Integer)mobProps.getProperty("Quest_MonsterSpecies");` |

### `Quest_MonsterSubspecies`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| utils/MobUtils.java | 98 | `Integer subSpeciesCode=(Integer)mobProps.getProperty("Quest_MonsterSubspecies");` |

### `Quest_MountExpTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 555 | `Integer mountXpTier=((Integer)properties.getProperty("Quest_MountExpTier"));` |

### `Quest_NegRepToGive`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 423 | `Integer negRep=(Integer)props.getProperty("Quest_NegRepToGive");` |

### `Quest_NegativeFaction`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 397 | `PropertiesSet factionProps=(PropertiesSet)props.getProperty("Quest_NegativeFaction");` |

### `Quest_NextQuest`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 174 | `Integer nextQuestId=((Integer)properties.getProperty("Quest_NextQuest"));` |

### `Quest_ObjectiveArray`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 132 | `Object[] objectivesArray=(Object[])properties.getProperty("Quest_ObjectiveArray");` |

### `Quest_ObjectiveIndex`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 142 | `int objectiveIndex=((Integer)objectiveProps.getProperty("Quest_ObjectiveIndex")).intValue();` |
| achievables/DatRolesLoader.java | 117 | `Integer objectiveIndex=(Integer)roleProps.getProperty("Quest_ObjectiveIndex");` |

### `Quest_PosRepToGive`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 418 | `Integer posRep=(Integer)props.getProperty("Quest_PosRepToGive");` |

### `Quest_PositiveFaction`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 392 | `PropertiesSet factionProps=(PropertiesSet)props.getProperty("Quest_PositiveFaction");` |

### `Quest_QuestItemDirectory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 133 | `int directoryID=((Integer)entryProps.getProperty("Quest_QuestItemDirectory")).intValue();` |

### `Quest_QuestItemDirectory_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 58 | `Object[] array=(Object[])props.getProperty("Quest_QuestItemDirectory_Array");` |

### `Quest_QuestItemRegionDirectory_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/QuestItemDirectoryLoader.java | 123 | `Object[] array=(Object[])props.getProperty("Quest_QuestItemRegionDirectory_Array");` |

### `Quest_QuestTreasureDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 110 | `Integer treasureId=((Integer)properties.getProperty("Quest_QuestTreasureDID"));` |

### `Quest_QuestsToComplete`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 160 | `Object questsToComplete=properties.getProperty("Quest_QuestsToComplete");` |
| achievables/rewards/DatRewardsLoader.java | 481 | `Object[] questsToCompleteArray=(Object[])props.getProperty("Quest_QuestsToComplete");` |

### `Quest_RepTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 411 | `Integer repTier=(Integer)factionProps.getProperty("Quest_RepTier");` |

### `Quest_RewardLevelDID`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 503 | `Integer rewardLevelId=((Integer)properties.getProperty("Quest_RewardLevelDID"));` |

### `Quest_RoleArray`

Observed raw data classes: 1398, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatRolesLoader.java | 56 | `Object[] roles=(Object[])properties.getProperty("Quest_RoleArray");` |

### `Quest_Scope`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 242 | `Integer scopeCode=((Integer)properties.getProperty("Quest_Scope"));` |

### `Quest_ShowRaidInJournal`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/quests/QuestsLoader.java | 266 | `Integer isRaidQuest=((Integer)properties.getProperty("Quest_ShowRaidInJournal"));` |

### `Quest_TurbinePointTier`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/rewards/DatRewardsLoader.java | 594 | `Integer tpTier=((Integer)properties.getProperty("Quest_TurbinePointTier"));` |

### `RaceTable_AccomplishmentDirectory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 324 | `int accomplishmentDirectoryId=((Integer)raceProps.getProperty("RaceTable_AccomplishmentDirectory")).intValue();` |

### `RaceTable_ClassList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 203 | `Object[] classCodesArray=(Object[])properties.getProperty("RaceTable_ClassList");` |

### `RaceTable_GenderList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 126 | `Object[] gendersProperties=(Object[])properties.getProperty("RaceTable_GenderList");` |

### `RaceTable_Gender_PlayerAvatar`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 164 | `int avatarId=((Integer)genderProperties.getProperty("RaceTable_Gender_PlayerAvatar")).intValue();` |

### `RaceTable_IsTallRace`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 81 | `Integer isTall=(Integer)properties.getProperty("RaceTable_IsTallRace");` |

### `RaceTable_NationalityList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 85 | `Object[] nationalityCodes=(Object[])properties.getProperty("RaceTable_NationalityList");` |

### `RaceTable_Race`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 322 | `int raceCode=((Integer)raceProps.getProperty("RaceTable_Race")).intValue();` |
| characters/RaceDataLoader.java | 60 | `int raceId=((Integer)properties.getProperty("RaceTable_Race")).intValue();` |

### `RaceTable_RaceSelect_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 145 | `int iconId=((Integer)genderProperties.getProperty("RaceTable_RaceSelect_Icon")).intValue();` |

### `RaceTable_RaceSelect_LargeIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 149 | `Integer largeIconId=(Integer)genderProperties.getProperty("RaceTable_RaceSelect_LargeIcon");` |

### `RaceTable_RaceSelect_SmallIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 156 | `Integer smallIconId=(Integer)genderProperties.getProperty("RaceTable_RaceSelect_SmallIcon");` |

### `RaceTable_RaceTableList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 317 | `Object[] raceIdsArray=(Object[])properties.getProperty("RaceTable_RaceTableList");` |
| characters/RaceDataLoader.java | 249 | `Object[] raceIdsArray=(Object[])properties.getProperty("RaceTable_RaceTableList");` |

### `RecipeItem_Recipe`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| crafting/RecipeItemsLoader.java | 65 | `Integer recipeId=(Integer)props.getProperty("RecipeItem_Recipe");` |

### `Region_ID`

Observed raw data classes: 2395.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 173 | `int regionCode=((Integer)regionProps.getProperty("Region_ID")).intValue();` |

### `Region_Map_List`

Observed raw data classes: 2395.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/areas/GeoAreasLoader.java | 169 | `Object[] regionArray=(Object[])regionControlProps.getProperty("Region_Map_List");` |

### `RelicTransmutationDirectory_RecipeList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 174 | `Object[] ids=(Object[])props.getProperty("RelicTransmutationDirectory_RecipeList");` |

### `Relic_Transmutation_Recipe_Output_Icon_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 69 | `Integer iconId=(Integer)properties.getProperty("Relic_Transmutation_Recipe_Output_Icon_Override");` |

### `Relic_Transmutation_Recipe_Output_Title_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 66 | `String nameOverride=(String)properties.getProperty("Relic_Transmutation_Recipe_Output_Title_Override");` |

### `Relic_Transmutation_Recipe_Output_Tooltip_Override`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 75 | `String tooltipOverride=(String)properties.getProperty("Relic_Transmutation_Recipe_Output_Tooltip_Override");` |

### `Relic_Transmutation_Recipe_RelicCurrencyCost`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 85 | `int cost=((Integer)properties.getProperty("Relic_Transmutation_Recipe_RelicCurrencyCost")).intValue();` |

### `Relic_Transmutation_Recipe_TransmutationCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicMeldingRecipesLoader.java | 78 | `Integer categoryCode=(Integer)properties.getProperty("Relic_Transmutation_Recipe_TransmutationCategory");` |

### `Relic_ValidContainerSlots`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicsLoader.java | 78 | `int slotsCode=((Integer)properties.getProperty("Relic_ValidContainerSlots")).intValue();` |

### `Reputation_Faction`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 202 | `Integer factionID=(Integer)props.getProperty("Reputation_Faction");` |

### `Reputation_FactionTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 304 | `Object[] idsArray=(Object[])indexProperties.getProperty("Reputation_FactionTable");` |

### `Reputation_Faction_AdvancementTable`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 127 | `Integer reputationTableId=(Integer)properties.getProperty("Reputation_Faction_AdvancementTable");` |

### `Reputation_Faction_CurrentTier_PropertyName`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 192 | `int currentTierPropId=((Integer)properties.getProperty("Reputation_Faction_CurrentTier_PropertyName")).intValue();` |

### `Reputation_Faction_DefaultTier`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 145 | `int defaultTier=((Integer)properties.getProperty("Reputation_Faction_DefaultTier")).intValue();` |

### `Reputation_Faction_DisableAcceleration`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 210 | `Integer disableAcc=(Integer)properties.getProperty("Reputation_Faction_DisableAcceleration");` |

### `Reputation_Faction_EarnedReputation_PropertyName`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 195 | `int earnedRepPropId=((Integer)properties.getProperty("Reputation_Faction_EarnedReputation_PropertyName")).intValue();` |

### `Reputation_Faction_GlobalCap_PropertyName`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 202 | `int globalCapPropId=((Integer)properties.getProperty("Reputation_Faction_GlobalCap_PropertyName")).intValue();` |

### `Reputation_Faction_LowestMonetizedTier`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 216 | `Integer lowestMonetizedTier=(Integer)properties.getProperty("Reputation_Faction_LowestMonetizedTier");` |

### `Reputation_Faction_TierNameProgression`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 113 | `Integer tierNamesId=(Integer)properties.getProperty("Reputation_Faction_TierNameProgression");` |

### `Reputation_HighestTier`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 143 | `Integer highestTierInt=(Integer)properties.getProperty("Reputation_HighestTier");` |

### `Reputation_IsReputationItem`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 199 | `Integer isRepItem=(Integer)props.getProperty("Reputation_IsReputationItem");` |

### `Reputation_LowestTier`

Observed raw data classes: 1889.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 141 | `Integer lowestTierInt=(Integer)properties.getProperty("Reputation_LowestTier");` |

### `Reputation_ReputationGain`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 208 | `Long reputationGain=(Long)props.getProperty("Reputation_ReputationGain");` |

### `Reputation_ReputationLoss`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 209 | `Long reputationLoss=(Long)props.getProperty("Reputation_ReputationLoss");` |

### `RewardTrackControl_RewardTrack_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 158 | `Object[] rewardsTracksList=(Object[])rewardTrackControlProps.getProperty("RewardTrackControl_RewardTrack_Array");` |

### `RewardTrack_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 95 | `Object[] stepsList=(Object[])properties.getProperty("RewardTrack_Array");` |

### `RewardTrack_Array_ExperienceCostMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 119 | `float xpCostMultiplier=((Float)stepProps.getProperty("RewardTrack_Array_ExperienceCostMultiplier")).floatValue();` |

### `RewardTrack_Array_PipElement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 121 | `int uiElementID=((Integer)stepProps.getProperty("RewardTrack_Array_PipElement")).intValue();` |

### `RewardTrack_Array_Reward`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 124 | `int rewardID=((Integer)stepProps.getProperty("RewardTrack_Array_Reward")).intValue();` |

### `RewardTrack_ExperienceType`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 181 | `Integer type=(Integer)props.getProperty("RewardTrack_ExperienceType");` |

### `RewardTrack_RewardIntervalProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 85 | `int progressionID=((Integer)properties.getProperty("RewardTrack_RewardIntervalProgression")).intValue();` |

### `RewardTrack_XPToAdd`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 180 | `Integer amount=(Integer)props.getProperty("RewardTrack_XPToAdd");` |

### `RunicList_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 414 | `Object[] entriesArray=(Object[])properties.getProperty("RunicList_Array");` |

### `RunicList_DropFrequency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 418 | `int frequencyCode=((Integer)entryProps.getProperty("RunicList_DropFrequency")).intValue();` |

### `RunicList_RunicOrTreasureGroup`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 421 | `int id=((Integer)entryProps.getProperty("RunicList_RunicOrTreasureGroup")).intValue();` |

### `RunicTreasureGroup_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 449 | `Object[] entriesArray=(Object[])properties.getProperty("RunicTreasureGroup_Array");` |

### `RunicTreasureGroup_PullCount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 477 | `int count=((Integer)entryProps.getProperty("RunicTreasureGroup_PullCount")).intValue();` |

### `RunicTreasureGroup_PullCount_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 471 | `Object[] countsArray=(Object[])properties.getProperty("RunicTreasureGroup_PullCount_Array");` |

### `RunicTreasureGroup_Runic`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 458 | `int relicId=((Integer)entryProps.getProperty("RunicTreasureGroup_Runic")).intValue();` |

### `RunicTreasureGroup_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 459 | `int weight=((Integer)entryProps.getProperty("RunicTreasureGroup_Weight")).intValue();` |
| loot/LootLoader.java | 478 | `int weight=((Integer)entryProps.getProperty("RunicTreasureGroup_Weight")).intValue();` |

### `Runic_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicsLoader.java | 89 | `Integer level=(Integer)properties.getProperty("Runic_Level");` |

### `Runic_RequiredItemLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicsLoader.java | 102 | `Integer requiredLevel=(Integer)properties.getProperty("Runic_RequiredItemLevel");` |

### `Runic_Tier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicsLoader.java | 85 | `int tierCode=((Integer)properties.getProperty("Runic_Tier")).intValue();` |

### `Runic_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| relics/MainDatRelicsLoader.java | 71 | `int relicType=((Integer)properties.getProperty("Runic_Type")).intValue();` |

### `Set_ActiveCount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemsSetEffectsLoader.java | 56 | `int count=((Integer)entryProps.getProperty("Set_ActiveCount")).intValue();` |
| items/MainDatItemsSetsLoader.java | 191 | `int count=((Integer)properties.getProperty("Set_ActiveCount")).intValue();` |

### `Set_ActiveCountDataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemsSetEffectsLoader.java | 43 | `Object[] activeCountDataList=(Object[])properties.getProperty("Set_ActiveCountDataList");` |
| items/MainDatItemsSetsLoader.java | 140 | `Object[] bonusesArray=(Object[])properties.getProperty("Set_ActiveCountDataList");` |

### `Set_Directory_GameSetList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 242 | `Object[] setIdArray=(Object[])props.getProperty("Set_Directory_GameSetList");` |

### `Set_EffectDataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemsSetEffectsLoader.java | 51 | `Object[] effectsList=(Object[])entryProps.getProperty("Set_EffectDataList");` |

### `Set_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 117 | `int level=((Integer)properties.getProperty("Set_Level")).intValue();` |

### `Set_LevelRequired`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 125 | `Integer requiredLevelInt=(Integer)properties.getProperty("Set_LevelRequired");` |

### `Set_MaxPlayerLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 129 | `Integer maxCharacterLevel=(Integer)properties.getProperty("Set_MaxPlayerLevel");` |

### `Set_MemberList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 156 | `Object[] membersArray=(Object[])properties.getProperty("Set_MemberList");` |

### `Set_TraitSet_Class`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsSetsLoader.java | 110 | `Integer classCode=(Integer)properties.getProperty("Set_TraitSet_Class");` |

### `Skill_AEDetectionVolume_ArcDegrees`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 305 | `Float degrees=(Float)props.getProperty("Skill_AEDetectionVolume_ArcDegrees");` |

### `Skill_AEDetectionVolume_ArcRadius`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 297 | `Float arcRadius=(Float)props.getProperty("Skill_AEDetectionVolume_ArcRadius");` |

### `Skill_AEDetectionVolume_BoxLength`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 298 | `Float boxLength=(Float)props.getProperty("Skill_AEDetectionVolume_BoxLength");` |

### `Skill_AEDetectionVolume_BoxWidth`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 319 | `Float width=(Float)props.getProperty("Skill_AEDetectionVolume_BoxWidth");` |

### `Skill_AEDetectionVolume_HeadingOffset`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 310 | `Float heading=(Float)props.getProperty("Skill_AEDetectionVolume_HeadingOffset");` |

### `Skill_AEDetectionVolume_SphereRadius`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 299 | `Float sphereRadius=(Float)props.getProperty("Skill_AEDetectionVolume_SphereRadius");` |

### `Skill_ActionDurationContribution`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 136 | `Float actionDurationContribution=(Float)props.getProperty("Skill_ActionDurationContribution");` |

### `Skill_AppliedGambit`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 512 | `Integer appliedGambitInt=(Integer)props.getProperty("Skill_AppliedGambit");` |

### `Skill_AppliedGambitIconCount`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 514 | `Integer appliedGambitsCountInt=(Integer)props.getProperty("Skill_AppliedGambitIconCount");` |

### `Skill_AreaEffectDetectionAnchor`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 339 | `Integer anchorCode=(Integer)props.getProperty("Skill_AreaEffectDetectionAnchor");` |

### `Skill_AreaEffectMaxTargets`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 196 | `Integer areaEffectMaxTargets=(Integer)props.getProperty("Skill_AreaEffectMaxTargets");` |

### `Skill_AttackHookList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 271 | `Object[] attackHookObjs=(Object[])props.getProperty("Skill_AttackHookList");` |

### `Skill_AttackHook_DPSAddMod_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 429 | `Integer dpsModProgression=(Integer)attackHookProperties.getProperty("Skill_AttackHook_DPSAddMod_Progression");` |

### `Skill_AttackHook_DamageAddContributionMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 427 | `Float damageContributionMultiplier=(Float)attackHookProperties.getProperty("Skill_AttackHook_DamageAddContributionMultiplier");` |

### `Skill_AttackHook_DamageQualifier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 394 | `Integer damageQualifierCode=(Integer)attackHookProperties.getProperty("Skill_AttackHook_DamageQualifier");` |

### `Skill_AttackHook_DamageType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 419 | `Integer damageTypeCode=(Integer)attackHookProperties.getProperty("Skill_AttackHook_DamageType");` |

### `Skill_AttackHook_HookDamageMax`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 436 | `Float maxDamage=(Float)attackHookProperties.getProperty("Skill_AttackHook_HookDamageMax");` |

### `Skill_AttackHook_HookDamageMaxVariance`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 438 | `Float maxDamageVariance=(Float)attackHookProperties.getProperty("Skill_AttackHook_HookDamageMaxVariance");` |

### `Skill_AttackHook_HookDamageMax_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 440 | `Integer maxDamageProgression=(Integer)attackHookProperties.getProperty("Skill_AttackHook_HookDamageMax_Progression");` |

### `Skill_AttackHook_HookDamageModifier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 446 | `Float damageModifier=(Float)attackHookProperties.getProperty("Skill_AttackHook_HookDamageModifier");` |

### `Skill_AttackHook_ImplementContributionMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 448 | `Float implementContributionMultiplier=(Float)attackHookProperties.getProperty("Skill_AttackHook_ImplementContributionMultiplier");` |

### `Skill_AttackHook_UsesNatural`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 451 | `Integer usesNaturalInt=(Integer)attackHookProperties.getProperty("Skill_AttackHook_UsesNatural");` |

### `Skill_AttackHook_UsesPrimaryImplement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 454 | `Integer usesPrimaryImplementInt=(Integer)attackHookProperties.getProperty("Skill_AttackHook_UsesPrimaryImplement");` |

### `Skill_AttackHook_UsesRangedImplement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 457 | `Integer usesRangedImplementInt=(Integer)attackHookProperties.getProperty("Skill_AttackHook_UsesRangedImplement");` |

### `Skill_AttackHook_UsesSecondaryImplement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 460 | `Integer usesSecondaryImplementInt=(Integer)attackHookProperties.getProperty("Skill_AttackHook_UsesSecondaryImplement");` |

### `Skill_AttackHook_UsesTactical`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 463 | `Integer usesTacticalInt=(Integer)attackHookProperties.getProperty("Skill_AttackHook_UsesTactical");` |

### `Skill_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 144 | `Integer categoryId=(Integer)skillProperties.getProperty("Skill_Category");` |
| skills/MainSkillDataLoader.java | 224 | `Integer categoryCode=(Integer)properties.getProperty("Skill_Category");` |

### `Skill_Combo_ComboList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 356 | `Object[] elements=(Object[])props.getProperty("Skill_Combo_ComboList");` |

### `Skill_Combo_ComboMode`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 369 | `value=(Integer)entryProps.getProperty("Skill_Combo_ComboMode");` |

### `Skill_Combo_ComboSkill`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 371 | `int skillID=((Integer)entryProps.getProperty("Skill_Combo_ComboSkill")).intValue();` |

### `Skill_Combo_StateProperty`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 351 | `Integer propertyID=(Integer)props.getProperty("Skill_Combo_StateProperty");` |

### `Skill_DisplaySkillType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 220 | `BitSet displayTypesBitSet=(BitSet)props.getProperty("Skill_DisplaySkillType");` |

### `Skill_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 38 | `Integer effectID=(Integer)effectProps.getProperty("Skill_Effect");` |

### `Skill_EffectDuration`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 45 | `Float duration=(Float)effectProps.getProperty("Skill_EffectDuration");` |

### `Skill_EffectImplementUsage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 52 | `Integer implementUsageCode=(Integer)effectProps.getProperty("Skill_EffectImplementUsage");` |

### `Skill_EffectSpellcraft`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 48 | `Float spellcraft=(Float)effectProps.getProperty("Skill_EffectSpellcraft");` |

### `Skill_Harmful`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 259 | `Integer harmfulInt=(Integer)props.getProperty("Skill_Harmful");` |

### `Skill_IgnoresResetTime`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 173 | `Integer ignoresResetTimeInt=(Integer)props.getProperty("Skill_IgnoresResetTime");` |

### `Skill_Immediate`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 177 | `Integer immediateInt=(Integer)props.getProperty("Skill_Immediate");` |

### `Skill_InductionAction`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 139 | `Integer inductionActionID=(Integer)props.getProperty("Skill_InductionAction");` |

### `Skill_MaxRange`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 351 | `Float maxRange=(Float)props.getProperty("Skill_MaxRange");` |

### `Skill_MinRange`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 346 | `Float minRange=(Float)props.getProperty("Skill_MinRange");` |

### `Skill_MountRacialConversionAnalog`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 78 | `Integer peerMountId=(Integer)properties.getProperty("Skill_MountRacialConversionAnalog");` |

### `Skill_Pip_AffectedType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 471 | `Integer affectedTypeCode=(Integer)props.getProperty("Skill_Pip_AffectedType");` |

### `Skill_Pip_Change`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 482 | `Integer change=(Integer)props.getProperty("Skill_Pip_Change");` |

### `Skill_Pip_RequiredMaxValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 490 | `Integer requiredMaxValue=(Integer)props.getProperty("Skill_Pip_RequiredMaxValue");` |

### `Skill_Pip_RequiredMinValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 486 | `Integer requiredMinValue=(Integer)props.getProperty("Skill_Pip_RequiredMinValue");` |

### `Skill_Pip_Toward_Home`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 494 | `Integer towardHome=(Integer)props.getProperty("Skill_Pip_Toward_Home");` |

### `Skill_PositionalHeading`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 368 | `Integer heading=(Integer)props.getProperty("Skill_PositionalHeading");` |

### `Skill_PositionalSpread`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 374 | `Integer spread=(Integer)props.getProperty("Skill_PositionalSpread");` |

### `Skill_QuestFlags`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 181 | `Long skillQuestFlags=(Long)skillProperties.getProperty("Skill_QuestFlags");` |

### `Skill_RemovedGambits`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 519 | `Integer removedGambitsInt=(Integer)props.getProperty("Skill_RemovedGambits");` |

### `Skill_RequiredEffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 299 | `Object[] requiredEffectsArray=(Object[])props.getProperty("Skill_RequiredEffectList");` |

### `Skill_RequiredGambit`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 523 | `Integer requiredGambit=(Integer)props.getProperty("Skill_RequiredGambit");` |

### `Skill_RequiredTrait`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 281 | `Integer requiredTraitId=(Integer)props.getProperty("Skill_RequiredTrait");` |

### `Skill_RequiresGambits`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 526 | `Integer requiresGambitsInt=(Integer)props.getProperty("Skill_RequiresGambits");` |

### `Skill_Resist_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 207 | `Integer resistCategoryCode=(Integer)props.getProperty("Skill_Resist_Category");` |

### `Skill_SkillRecoveryTime`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 163 | `Float skillRecoveryTime=(Float)props.getProperty("Skill_SkillRecoveryTime");` |

### `Skill_SkillType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 167 | `Long typeFlags=(Long)skillProperties.getProperty("Skill_SkillType");` |

### `Skill_SmallIcon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 138 | `Integer iconId=(Integer)skillProperties.getProperty("Skill_SmallIcon");` |

### `Skill_SubCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 74 | `int subCategoryCode=((Integer)properties.getProperty("Skill_SubCategory")).intValue();` |

### `Skill_Toggle_ChannelingDurationOverride`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 147 | `Float channelingDurationOverride=(Float)props.getProperty("Skill_Toggle_ChannelingDurationOverride");` |

### `Skill_Toggle_ChannelingState`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 150 | `Integer channelingState=(Integer)props.getProperty("Skill_Toggle_ChannelingState");` |

### `Skill_Toggle_Effect`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 70 | `Integer effectID=(Integer)effectProps.getProperty("Skill_Toggle_Effect");` |
| skills/mounts/MountsLoader.java | 90 | `int effectId=((Integer)effectRefProps.getProperty("Skill_Toggle_Effect")).intValue();` |
| skills/pets/CosmeticPetLoader.java | 51 | `int effectId=((Integer)effectRefProps.getProperty("Skill_Toggle_Effect")).intValue();` |

### `Skill_Toggle_Effect_ImplementUsage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 80 | `Integer implementUsageCode=(Integer)effectProps.getProperty("Skill_Toggle_Effect_ImplementUsage");` |

### `Skill_Toggle_Effect_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/mounts/MountsLoader.java | 84 | `Object[] effectsList=(Object[])properties.getProperty("Skill_Toggle_Effect_List");` |
| skills/pets/CosmeticPetLoader.java | 45 | `Object[] effectsList=(Object[])properties.getProperty("Skill_Toggle_Effect_List");` |

### `Skill_Toggle_Effect_Spellcraft`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SkillEffectsLoader.java | 76 | `Float spellcraft=(Float)effectProps.getProperty("Skill_Toggle_Effect_Spellcraft");` |

### `Skill_Toggle_Hook_Number`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 202 | `Integer toggleHookNumber=(Integer)props.getProperty("Skill_Toggle_Hook_Number");` |

### `Skill_Toggle_PipChangePerInterval`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 496 | `Integer changePerInterval=(Integer)props.getProperty("Skill_Toggle_PipChangePerInterval");` |

### `Skill_Toggle_SecondsPerPipChange`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 500 | `Float secondsPerPipChange=(Float)props.getProperty("Skill_Toggle_SecondsPerPipChange");` |

### `Skill_TravelLinkToCheckFor`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 245 | `Integer toCheckFor=(Integer)properties.getProperty("Skill_TravelLinkToCheckFor");` |

### `Skill_TravelLinkToUse`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/MainSkillDataLoader.java | 250 | `Integer toUse=(Integer)properties.getProperty("Skill_TravelLinkToUse");` |

### `Skill_Vital_Consumes_All`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 682 | `Integer consumesAllInt=(Integer)vitalCostProps.getProperty("Skill_Vital_Consumes_All");` |

### `Skill_Vital_Percent`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 685 | `Float percentage=(Float)vitalCostProps.getProperty("Skill_Vital_Percent");` |

### `Skill_Vital_Points`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 690 | `Float points=(Float)vitalCostProps.getProperty("Skill_Vital_Points");` |

### `Skill_Vital_Points_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 696 | `Integer progressionID=(Integer)vitalCostProps.getProperty("Skill_Vital_Points_Progression");` |

### `Skill_Vital_Type`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| skills/SkillDetailsLoader.java | 679 | `int readVitalType=((Integer)vitalCostProps.getProperty("Skill_Vital_Type")).intValue();` |

### `SkirmishCustomLootLookupTable_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 73 | `Object[] tableArray=(Object[])properties.getProperty("SkirmishCustomLootLookupTable_Array");` |

### `SkirmishMatchParams_DifficultyTier_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 173 | `Integer maxDifficultyCode=(Integer)properties.getProperty("SkirmishMatchParams_DifficultyTier_Max");` |

### `SkirmishMatchParams_DifficultyTier_Min`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 172 | `Integer minDifficultyCode=(Integer)properties.getProperty("SkirmishMatchParams_DifficultyTier_Min");` |

### `SkirmishMatchParams_GroupSize_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 170 | `Integer maxSizeCode=(Integer)properties.getProperty("SkirmishMatchParams_GroupSize_Max");` |

### `SkirmishMatchParams_GroupSize_Min`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 169 | `Integer minSizeCode=(Integer)properties.getProperty("SkirmishMatchParams_GroupSize_Min");` |

### `SkirmishMatchParams_Level_Max`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 167 | `Integer maxLevel=(Integer)properties.getProperty("SkirmishMatchParams_Level_Max");` |

### `SkirmishMatchParams_Level_Min`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 166 | `Integer minLevel=(Integer)properties.getProperty("SkirmishMatchParams_Level_Min");` |

### `SkirmishTreasureLookup_BarterTrophyListDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 124 | `Integer barterTrophyListId=(Integer)properties.getProperty("SkirmishTreasureLookup_BarterTrophyListDID");` |

### `SkirmishTreasureLookup_EncounterDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 103 | `int encounterId=((Integer)properties.getProperty("SkirmishTreasureLookup_EncounterDID")).intValue();` |

### `SkirmishTreasureLookup_ReputationTrophyListDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 130 | `Integer reputationTrophyListId=(Integer)properties.getProperty("SkirmishTreasureLookup_ReputationTrophyListDID");` |

### `SkirmishTreasureLookup_SkirmishMatchParametersDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 113 | `int parametersDid=((Integer)properties.getProperty("SkirmishTreasureLookup_SkirmishMatchParametersDID")).intValue();` |

### `SkirmishTreasureLookup_TreasureListTemplateDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 137 | `Integer treasureListTemplateId=(Integer)properties.getProperty("SkirmishTreasureLookup_TreasureListTemplateDID");` |

### `SkirmishTreasureLookup_TrophyListTemplateDID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/CustomInstancesLootLoader.java | 143 | `Integer trophyTemplateId=(Integer)properties.getProperty("SkirmishTreasureLookup_TrophyListTemplateDID");` |

### `Skirmish_Template_DifficultyTierArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 254 | `Object[] difficultyTiersArray=(Object[])props.getProperty("Skirmish_Template_DifficultyTierArray");` |

### `Skirmish_Template_GroupSizeArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 278 | `Object[] groupSizesArray=(Object[])props.getProperty("Skirmish_Template_GroupSizeArray");` |

### `Skirmish_Template_LevelScalingLevel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 318 | `Integer levelScaling=(Integer)props.getProperty("Skirmish_Template_LevelScalingLevel");` |

### `Skirmish_Template_MaxLevelScale`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 301 | `int maxLevelScale=((Integer)props.getProperty("Skirmish_Template_MaxLevelScale")).intValue();` |

### `Skirmish_Template_MinLevelScale`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 300 | `int minLevelScale=((Integer)props.getProperty("Skirmish_Template_MinLevelScale")).intValue();` |

### `SoundScript_Channel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/ScriptsInspectorForSounds.java | 163 | `int soundChannelID=((Integer)props.getProperty("SoundScript_Channel")).intValue();` |

### `SoundScript_SoundID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| sounds/ScriptsInspectorForSounds.java | 162 | `Integer soundID=(Integer)props.getProperty("SoundScript_SoundID");` |

### `SparseDIDProgressionEntry_DID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 160 | `int traitId=((Integer)progressionStepProps.getProperty("SparseDIDProgressionEntry_DID")).intValue();` |

### `SparseDIDProgressionEntry_Key`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 158 | `Number nbPointsValue=(Number)progressionStepProps.getProperty("SparseDIDProgressionEntry_Key");` |

### `SparseDIDProgression_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 154 | `Object[] progressionSteps=(Object[])progressionProperties.getProperty("SparseDIDProgression_Array");` |

### `SpeciesLevelLootTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| agents/mobs/MainDatGenericMobLootLoader.java | 99 | `Object[] array=(Object[])properties.getProperty("SpeciesLevelLootTable");` |

### `SpellcraftCalculator`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 833 | `Integer spellcraftCalculatorId=(Integer)properties.getProperty("SpellcraftCalculator");` |

### `Spellcraft_Driver_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 850 | `int propertyID=((Integer)props.getProperty("Spellcraft_Driver_PropertyName")).intValue();` |

### `Spellcraft_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 854 | `Integer progressionID=(Integer)props.getProperty("Spellcraft_Progression");` |

### `Stat_StatList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainStatTomesLoader.java | 50 | `Object[] subDirectories=(Object[])statDirectoryProps.getProperty("Stat_StatList");` |

### `StringInfoProgression_Array`

Observed raw data classes: 2402.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| factions/MainDatFactionsLoader.java | 256 | `ArrayPropertyValue tierPropsArray=(ArrayPropertyValue)tierNamesProps.getPropertyValueByName("StringInfoProgression_Array");` |

### `Threshold_Pip_IntegerValue_Policy`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 121 | `PropertiesSet policyProps=(PropertiesSet)props.getProperty("Threshold_Pip_IntegerValue_Policy");` |

### `Threshold_Policy_StateList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 126 | `Object[] stateList=(Object[])policyProps.getProperty("Threshold_Policy_StateList");` |

### `Threshold_State_EffectList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/SomeMoreEffectsLoader.java | 130 | `Object[] effectList=(Object[])entryProps.getProperty("Threshold_State_EffectList");` |

### `Title_Category`

Observed raw data classes: 1470.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| titles/MainDatTitlesLoader.java | 83 | `int categoryId=((Integer)properties.getProperty("Title_Category")).intValue();` |

### `Title_Exclusion_Group`

Observed raw data classes: 1470.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| titles/MainDatTitlesLoader.java | 90 | `Integer exclusionGroupId=(Integer)properties.getProperty("Title_Exclusion_Group");` |

### `Title_Icon`

Observed raw data classes: 1470.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| titles/MainDatTitlesLoader.java | 104 | `int iconId=((Integer)properties.getProperty("Title_Icon")).intValue();` |

### `Title_Priority`

Observed raw data classes: 1470.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| titles/MainDatTitlesLoader.java | 96 | `int priority=((Integer)properties.getProperty("Title_Priority")).intValue();` |

### `Trait_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 214 | `Integer categoryCode=(Integer)traitProperties.getProperty("Trait_Category");` |

### `Trait_Control_LevelToTotalClassTraitPointsProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainCharacterDataLoader.java | 55 | `Integer id=(Integer)props.getProperty("Trait_Control_LevelToTotalClassTraitPointsProgression");` |

### `Trait_Control_PointBasedTraitNature_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 175 | `Object[] traitNatures=(Object[])properties.getProperty("Trait_Control_PointBasedTraitNature_Array");` |

### `Trait_Control_PointBasedTrait_TraitTreeArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 184 | `Object[] traitTreeArray=(Object[])traitNatureProps.getProperty("Trait_Control_PointBasedTrait_TraitTreeArray");` |
| characters/TraitTreesDataLoader.java | 218 | `Object[] traitTreeArray=(Object[])traitNatureProps.getProperty("Trait_Control_PointBasedTrait_TraitTreeArray");` |

### `Trait_Control_Race`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 223 | `Integer raceId=(Integer)raceProps.getProperty("Trait_Control_Race");` |

### `Trait_Control_RaceArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 215 | `Object[] raceArrays=(Object[])properties.getProperty("Trait_Control_RaceArray");` |

### `Trait_Control_SkirmishTraits`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/SkirmishTraitsLoader.java | 36 | `Object[] skirmishTraitsArray=(Object[])properties.getProperty("Trait_Control_SkirmishTraits");` |

### `Trait_Control_TraitArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 228 | `Object[] traitsArray=(Object[])raceProps.getProperty("Trait_Control_TraitArray");` |

### `Trait_Control_TraitNature_Key`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 183 | `int traitNatureKey=((Integer)traitNatureProps.getProperty("Trait_Control_TraitNature_Key")).intValue();` |

### `Trait_Control_VirtueTierToExperience_AdvancementTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 67 | `Integer xpTableId=(Integer)properties.getProperty("Trait_Control_VirtueTierToExperience_AdvancementTable");` |

### `Trait_Cosmetic`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 243 | `Integer cosmeticCode=(Integer)traitProperties.getProperty("Trait_Cosmetic");` |

### `Trait_EffectSkill_AtRankEffects_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 427 | `Object[] effectsArray=(Object[])traitProperties.getProperty("Trait_EffectSkill_AtRankEffects_Array");` |

### `Trait_EffectSkill_AtRankEffects_Rank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 435 | `int rank=((Integer)effectSkillStruct.getProperty("Trait_EffectSkill_AtRankEffects_Rank")).intValue();` |

### `Trait_EffectSkill_AtRankSkillsAcquired_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 340 | `Object[] skillArray=(Object[])traitProperties.getProperty("Trait_EffectSkill_AtRankSkillsAcquired_Array");` |

### `Trait_EffectSkill_Effect_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 436 | `Object[] effectIDsArray=(Object[])effectSkillStruct.getProperty("Trait_EffectSkill_Effect_Array");` |

### `Trait_EffectSkill_SkillAcquired_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 347 | `Object[] skillIDsArray=(Object[])effectSkillStruct.getProperty("Trait_EffectSkill_SkillAcquired_Array");` |

### `Trait_EffectSkill_SkillAcquired_Rank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 346 | `int rank=((Integer)effectSkillStruct.getProperty("Trait_EffectSkill_SkillAcquired_Rank")).intValue();` |

### `Trait_Granted_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/ProficienciesLoader.java | 61 | `Long category=(Long)props.getProperty("Trait_Granted_Category");` |

### `Trait_Groups`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 294 | `Object[] traitGroups=(Object[])traitProperties.getProperty("Trait_Groups");` |

### `Trait_Icon`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 178 | `Integer iconId=(Integer)traitProperties.getProperty("Trait_Icon");` |

### `Trait_Icon_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 202 | `Integer progressionID=(Integer)properties.getProperty("Trait_Icon_Progression");` |

### `Trait_Minimum_Level`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 199 | `Integer minLevelInt=(Integer)traitProperties.getProperty("Trait_Minimum_Level");` |

### `Trait_Nature`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 222 | `Integer natureCode=(Integer)traitProperties.getProperty("Trait_Nature");` |
| characters/VirtueDataLoader.java | 115 | `Integer nature=(Integer)virtueProperties.getProperty("Trait_Nature");` |

### `Trait_PointBasedTrait_PointCostProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 283 | `Integer progressionID=(Integer)props.getProperty("Trait_PointBasedTrait_PointCostProgression");` |

### `Trait_Prerequisites_Logic`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 455 | `PropertyValue value=properties.getPropertyValueByName("Trait_Prerequisites_Logic");` |

### `Trait_Rank_Overlay_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 191 | `Integer rankOverlayProgression=(Integer)traitProperties.getProperty("Trait_Rank_Overlay_Progression");` |

### `Trait_Skill_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 313 | `Object[] skillArray=(Object[])traitProperties.getProperty("Trait_Skill_Array");` |

### `Trait_Static_Icon_Overlay`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 184 | `Integer staticIconOverlayId=(Integer)traitProperties.getProperty("Trait_Static_Icon_Overlay");` |

### `Trait_Sub_Category`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 230 | `Integer subCategoryCode=(Integer)traitProperties.getProperty("Trait_Sub_Category");` |

### `Trait_TraitTree_BranchDescriptionArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 61 | `Object[] branchDescriptions=(Object[])properties.getProperty("Trait_TraitTree_BranchDescriptionArray");` |

### `Trait_TraitTree_SpecializationBranch`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 87 | `Integer branchId=(Integer)specializationProps.getProperty("Trait_TraitTree_SpecializationBranch");` |

### `Trait_TraitTree_SpecializationProgression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 100 | `int progressionId=((Integer)specializationProps.getProperty("Trait_TraitTree_SpecializationProgression")).intValue();` |

### `Trait_TraitTree_SpecializationsArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 81 | `Object[] specializations=(Object[])properties.getProperty("Trait_TraitTree_SpecializationsArray");` |

### `Trait_TraitTree_Trait`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 128 | `int traitId=((Integer)traitProps.getProperty("Trait_TraitTree_Trait")).intValue();` |
| characters/TraitTreesDataLoader.java | 230 | `int traitId=((Integer)traitProps.getProperty("Trait_TraitTree_Trait")).intValue();` |

### `Trait_TraitTree_TraitArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 109 | `Object[] traits=(Object[])properties.getProperty("Trait_TraitTree_TraitArray");` |
| characters/TraitTreesDataLoader.java | 224 | `Object[] traits=(Object[])properties.getProperty("Trait_TraitTree_TraitArray");` |

### `Trait_TraitTree_TraitDependency`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 140 | `int depTraitLocation=((Integer)depProps.getProperty("Trait_TraitTree_TraitDependency")).intValue();` |

### `Trait_TraitTree_TraitDependencyArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 134 | `Object[] depArray=(Object[])traitProps.getProperty("Trait_TraitTree_TraitDependencyArray");` |

### `Trait_TraitTree_TraitDependencyRank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 142 | `int depRank=((Integer)depProps.getProperty("Trait_TraitTree_TraitDependencyRank")).intValue();` |

### `Trait_TraitTree_TraitLocation`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 129 | `int traitLocation=((Integer)traitProps.getProperty("Trait_TraitTree_TraitLocation")).intValue();` |

### `Trait_TraitTree_TreeType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/TraitTreesDataLoader.java | 72 | `int traitTreeTypeCode=((Integer)properties.getProperty("Trait_TraitTree_TreeType")).intValue();` |

### `Trait_Virtue_Maximum_Rank`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainTraitDataLoader.java | 204 | `Integer maxTier=(Integer)traitProperties.getProperty("Trait_Virtue_Maximum_Rank");` |

### `Trait_Virtue_Maximum_Rank_PlayerPropertyName_Progression`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 152 | `Integer charLevelToMaxRankProgId=(Integer)virtueProperties.getProperty("Trait_Virtue_Maximum_Rank_PlayerPropertyName_Progression");` |
| characters/VirtueDataLoader.java | 180 | `Integer maxRankProgId=(Integer)virtueProperties.getProperty("Trait_Virtue_Maximum_Rank_PlayerPropertyName_Progression");` |

### `Trait_Virtue_Rank_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 131 | `int rankPropertyId=((Integer)virtueProperties.getProperty("Trait_Virtue_Rank_PropertyName")).intValue();` |

### `Trait_Virtue_XP_Bonus`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 439 | `Integer bonus=(Integer)props.getProperty("Trait_Virtue_XP_Bonus");` |

### `Trait_Virtue_XP_PropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/VirtueDataLoader.java | 135 | `Integer xpPropertyId=(Integer)virtueProperties.getProperty("Trait_Virtue_XP_PropertyName");` |

### `TravelDestinationCost`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 94 | `int routeCost=((Integer)routeProps.getProperty("TravelDestinationCost")).intValue();` |

### `TravelDestinationIsSwiftTravel`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 122 | `Integer swiftTravelInt=(Integer)properties.getProperty("TravelDestinationIsSwiftTravel");` |

### `TravelDestinationRecordArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 90 | `Object[] routesArray=(Object[])properties.getProperty("TravelDestinationRecordArray");` |

### `TravelDestinationRoute`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 95 | `int routeId=((Integer)routeProps.getProperty("TravelDestinationRoute")).intValue();` |

### `TravelHomeLocation`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 71 | `int homeLocationId=((Integer)properties.getProperty("TravelHomeLocation")).intValue();` |

### `TravelHomeLocationsArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 75 | `Object[] otherLocationsArray=(Object[])properties.getProperty("TravelHomeLocationsArray");` |

### `TravelHop_Delay`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 224 | `Float hopDelay=(Float)properties.getProperty("TravelHop_Delay");` |

### `TravelHop_SceneID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 225 | `Integer sceneID=(Integer)properties.getProperty("TravelHop_SceneID");` |

### `TravelPad_Location`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 201 | `String travelPad=(String)props.getProperty("TravelPad_Location");` |
| travels/MainDatTravelsWebLoader.java | 226 | `String padLocation=(String)properties.getProperty("TravelPad_Location");` |

### `TravelRoute_ActionArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 185 | `Object[] routeActionsArray=(Object[])properties.getProperty("TravelRoute_ActionArray");` |

### `TravelRoute_Destination`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 169 | `int destinationId=((Integer)properties.getProperty("TravelRoute_Destination")).intValue();` |

### `TravelRoute_TravelMode`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 172 | `Integer travelModeId=(Integer)properties.getProperty("TravelRoute_TravelMode");` |

### `TravelSegment_HeadName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 223 | `String headname=(String)properties.getProperty("TravelSegment_HeadName");` |

### `TravelWebArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsWebLoader.java | 245 | `Object[] idsArray=(Object[])indexProperties.getProperty("TravelWebArray");` |

### `TravelWebSellMultiplier`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 198 | `float sellFactor=((Float)props.getProperty("TravelWebSellMultiplier")).floatValue();` |

### `TravelWebWC`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 182 | `Integer travelNodeId=(Integer)props.getProperty("TravelWebWC");` |

### `Travel_DiscountArray`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 209 | `Object[] discountArray=(Object[])props.getProperty("Travel_DiscountArray");` |

### `Travel_Stablemaster_MustBeDiscovered`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 205 | `Integer mustBeDiscoveredInt=(Integer)props.getProperty("Travel_Stablemaster_MustBeDiscovered");` |

### `TreasureGroupProfile_ItemTable`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 331 | `Object[] itemTableArray=(Object[])properties.getProperty("TreasureGroupProfile_ItemTable");` |

### `TreasureGroupProfile_ItemTable_Item`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 341 | `int itemId=((Integer)entryProps.getProperty("TreasureGroupProfile_ItemTable_Item")).intValue();` |

### `TreasureGroupProfile_ItemTable_Quantity`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 342 | `Integer quantityInt=(Integer)entryProps.getProperty("TreasureGroupProfile_ItemTable_Quantity");` |

### `TreasureGroupProfile_ItemTable_Weight`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| loot/LootLoader.java | 340 | `int weight=((Integer)entryProps.getProperty("TreasureGroupProfile_ItemTable_Weight")).intValue();` |

### `UISkin_DataID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/BagIconsLoader.java | 39 | `int dataId=((Integer)entryProps.getProperty("UISkin_DataID")).intValue();` |

### `UISkin_MappingArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/BagIconsLoader.java | 35 | `Object[] array=(Object[])props.getProperty("UISkin_MappingArray");` |

### `UISkin_UIArtAssetID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| ui/BagIconsLoader.java | 40 | `int assetID=((Integer)entryProps.getProperty("UISkin_UIArtAssetID")).intValue();` |

### `UI_Map_ActiveElement`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 120 | `int parchmentMapId=((Integer)props.getProperty("UI_Map_ActiveElement")).intValue();` |

### `UI_Map_AreaDIDs_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 218 | `Object[] areas=(Object[])props.getProperty("UI_Map_AreaDIDs_Array");` |

### `UI_Map_AreaData`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 267 | `PropertiesSet areaProps=(PropertiesSet)props.getProperty("UI_Map_AreaData");` |

### `UI_Map_AreaData_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 172 | `Object[] subMaps=(Object[])props.getProperty("UI_Map_AreaData_Array");` |

### `UI_Map_BlockOffsetX`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapUtils.java | 52 | `Integer blockX=(Integer)props.getProperty("UI_Map_BlockOffsetX");` |

### `UI_Map_BlockOffsetY`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapUtils.java | 53 | `Integer blockY=(Integer)props.getProperty("UI_Map_BlockOffsetY");` |

### `UI_Map_Child_Map`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 237 | `Integer childMapUI=(Integer)props.getProperty("UI_Map_Child_Map");` |

### `UI_Map_GameMap`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/dungeons/DungeonLoader.java | 99 | `PropertiesSet mapUiProps=(PropertiesSet)imageProps.getProperty("UI_Map_GameMap");` |
| geo/maps/DungeonMapsLoader.java | 77 | `PropertiesSet mapUiProps=(PropertiesSet)imageProps.getProperty("UI_Map_GameMap");` |

### `UI_Map_MapImage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/dungeons/DungeonLoader.java | 114 | `int basemapId=((Integer)mapUiProps.getProperty("UI_Map_MapImage")).intValue();` |
| geo/maps/MapsSystemLoader.java | 143 | `int imageId=((Integer)props.getProperty("UI_Map_MapImage")).intValue();` |

### `UI_Map_MapNoteImage`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/MapIconsLoader.java | 65 | `imageId=(Integer)imageStruct.getProperty("UI_Map_MapNoteImage");` |
| geo/markers/MapIconsLoader.java | 69 | `imageId=(Integer)mapNoteTypeProps.getProperty("UI_Map_MapNoteImage");` |

### `UI_Map_MapNoteOnscreenImageStruct`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/MapIconsLoader.java | 62 | `PropertiesSet imageStruct=(PropertiesSet)mapNoteTypeProps.getProperty("UI_Map_MapNoteOnscreenImageStruct");` |

### `UI_Map_MapNoteType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/MapIconsLoader.java | 58 | `long mapNoteType=((Long)mapNoteTypeProps.getProperty("UI_Map_MapNoteType")).longValue();` |

### `UI_Map_MapNoteTypeArray`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/MapIconsLoader.java | 54 | `Object[] mapNoteTypePropsArray=(Object[])props.getProperty("UI_Map_MapNoteTypeArray");` |

### `UI_Map_PixelOffsetX`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapUtils.java | 64 | `Integer pixelOffsetX=(Integer)props.getProperty("UI_Map_PixelOffsetX");` |

### `UI_Map_PixelOffsetY`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapUtils.java | 65 | `Integer pixelOffsetY=(Integer)props.getProperty("UI_Map_PixelOffsetY");` |

### `UI_Map_QuestGuideDisabled`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapUtils.java | 46 | `Integer guideDisabled=(Integer)props.getProperty("UI_Map_QuestGuideDisabled");` |
| geo/maps/MapsSystemLoader.java | 133 | `Integer questGuideDisabledInt=(Integer)props.getProperty("UI_Map_QuestGuideDisabled");` |

### `UI_Map_RegionID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/MapsSystemLoader.java | 158 | `Integer regionId=(Integer)props.getProperty("UI_Map_RegionID");` |

### `UI_Map_Scale`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/maps/GeoreferencedBasemapsLoader.java | 76 | `float scale=((Float)mapUiProps.getProperty("UI_Map_Scale")).floatValue();` |

### `UI_StablesCollection_TravelNPC`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| travels/MainDatTravelsMapLoader.java | 121 | `Integer npcID=(Integer)props.getProperty("UI_StablesCollection_TravelNPC");` |

### `Usage_Action`

Observed raw data classes: 1113, 1170, 1210, 1445, 1510, 1722, 1723, 1724, 1725, 1843, 1892, 1989, 1995, 2007, 2097, 2516, 2592, 3074, 3075, 3369, 3725, 3853, 4026, 5785, 663, 794, 796, 798, 803, 804, 815.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatContainerLoader.java | 144 | `int action=((Integer)properties.getProperty("Usage_Action")).intValue();` |

### `Usage_CooldownChannel`

Observed raw data classes: 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 394 | `Integer channel=(Integer)props.getProperty("Usage_CooldownChannel");` |

### `Usage_CooldownDuration`

Observed raw data classes: 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 390 | `Integer durationKey=(Integer)props.getProperty("Usage_CooldownDuration");` |

### `Usage_MaxLevel`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 260 | `Integer maxLevel=(Integer)properties.getProperty("Usage_MaxLevel");` |
| requirements/RequirementsLoadingUtils.java | 57 | `Integer maxLevel=(Integer)properties.getProperty("Usage_MaxLevel");` |

### `Usage_MinGloryRank`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 219 | `Integer minRank=(Integer)properties.getProperty("Usage_MinGloryRank");` |

### `Usage_MinLevel`

Observed raw data classes: 1398, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/MainDatItemsLoader.java | 259 | `Integer minLevel=(Integer)properties.getProperty("Usage_MinLevel");` |
| requirements/RequirementsLoadingUtils.java | 52 | `Integer minLevel=(Integer)properties.getProperty("Usage_MinLevel");` |
| ui/SocketIconsLoader.java | 50 | `int minLevel=((Integer)entryProps.getProperty("Usage_MinLevel")).intValue();` |

### `Usage_MinLevel_FloatToCap`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 62 | `Integer floatToCap=(Integer)properties.getProperty("Usage_MinLevel_FloatToCap");` |

### `Usage_MonsterPlayerCanUse`

Observed raw data classes: 1170, 1723, 1724, 5785, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| rewardsTrack/MainDatRewardsTracksLoader.java | 74 | `Integer monsterPlayCanUse=(Integer)permissions.getProperty("Usage_MonsterPlayerCanUse");` |

### `Usage_Operator`

Observed raw data classes: 1170, 1398, 1724, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/QuestRequirementsLoader.java | 250 | `int operatorCode=((Integer)questRequirementProps.getProperty("Usage_Operator")).intValue();` |
| trade/MainDatTradeLoader.java | 186 | `Integer operator=(Integer)questReqProps.getProperty("Usage_Operator");` |

### `Usage_QuestID`

Observed raw data classes: 1170, 1398, 1724, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/QuestRequirementsLoader.java | 251 | `int questId=((Integer)questRequirementProps.getProperty("Usage_QuestID")).intValue();` |
| trade/MainDatTradeLoader.java | 184 | `Integer questId=(Integer)questReqProps.getProperty("Usage_QuestID");` |

### `Usage_QuestRequirements`

Observed raw data classes: 1170, 1398, 1724, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/QuestRequirementsLoader.java | 96 | `Object[] andRequirement=(Object[])properties.getProperty("Usage_QuestRequirements");` |
| trade/MainDatTradeLoader.java | 173 | `Object[] questRequirements=(Object[])properties.getProperty("Usage_QuestRequirements");` |

### `Usage_QuestRequirements_OrList`

Observed raw data classes: 1398, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/QuestRequirementsLoader.java | 88 | `Object[] orRequirement=(Object[])properties.getProperty("Usage_QuestRequirements_OrList");` |

### `Usage_QuestStatus`

Observed raw data classes: 1170, 1398, 1724, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/QuestRequirementsLoader.java | 252 | `Integer questStatusInt=(Integer)questRequirementProps.getProperty("Usage_QuestStatus");` |
| trade/MainDatTradeLoader.java | 185 | `Integer questStatus=(Integer)questReqProps.getProperty("Usage_QuestStatus");` |

### `Usage_RequiredClassList`

Observed raw data classes: 1170, 1398, 1724, 804.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 86 | `Object[] classReqs=(Object[])properties.getProperty("Usage_RequiredClassList");` |
| trade/MainDatTradeLoader.java | 145 | `Object[] requiredClassArray=(Object[])properties.getProperty("Usage_RequiredClassList");` |

### `Usage_RequiredCraftProfession`

Observed raw data classes: 1398, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 259 | `int professionId=((Integer)props.getProperty("Usage_RequiredCraftProfession")).intValue();` |
| requirements/RequirementsLoadingUtils.java | 180 | `Integer professionId=(Integer)properties.getProperty("Usage_RequiredCraftProfession");` |

### `Usage_RequiredCraftProficiency`

Observed raw data classes: 1398, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 256 | `Integer craftTierCode=(Integer)props.getProperty("Usage_RequiredCraftProficiency");` |
| requirements/RequirementsLoadingUtils.java | 188 | `Integer proficiency=(Integer)properties.getProperty("Usage_RequiredCraftProficiency");` |

### `Usage_RequiredCraftTier`

Observed raw data classes: 794.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| geo/markers/classification/MarkerClassifier.java | 251 | `Integer craftTierCode=(Integer)props.getProperty("Usage_RequiredCraftTier");` |
| requirements/RequirementsLoadingUtils.java | 196 | `proficiency=(Integer)properties.getProperty("Usage_RequiredCraftTier");` |

### `Usage_RequiredEffect`

Observed raw data classes: 1170, 1398, 794, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 236 | `Integer effectId=(Integer)properties.getProperty("Usage_RequiredEffect");` |

### `Usage_RequiredFaction`

Observed raw data classes: 1398, 1724, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 148 | `PropertiesSet factionReqProps=(PropertiesSet)properties.getProperty("Usage_RequiredFaction");` |
| trade/MainDatTradeLoader.java | 203 | `Object requiredFactionObj=properties.getProperty("Usage_RequiredFaction");` |

### `Usage_RequiredFaction_DataID`

Observed raw data classes: 1398, 1724, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 151 | `Integer factionId=(Integer)factionReqProps.getProperty("Usage_RequiredFaction_DataID");` |
| trade/MainDatTradeLoader.java | 208 | `int factionId=((Integer)factionReqProps.getProperty("Usage_RequiredFaction_DataID")).intValue();` |

### `Usage_RequiredFaction_Tier`

Observed raw data classes: 1398, 1724, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 152 | `Integer tier=(Integer)factionReqProps.getProperty("Usage_RequiredFaction_Tier");` |
| trade/MainDatTradeLoader.java | 212 | `int factionTier=((Integer)factionReqProps.getProperty("Usage_RequiredFaction_Tier")).intValue();` |

### `Usage_RequiredRaceEntry`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 151 | `int raceCode=((Integer)entryProps.getProperty("Usage_RequiredRaceEntry")).intValue();` |

### `Usage_RequiredRaces`

Observed raw data classes: 1170, 1398, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 120 | `Object[] raceReqs=(Object[])properties.getProperty("Usage_RequiredRaces");` |

### `Usage_RequiredTrait`

Observed raw data classes: 1398, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/RequirementsLoadingUtils.java | 252 | `Integer traitId=(Integer)properties.getProperty("Usage_RequiredTrait");` |

### `Usage_SetPropertyUsageData_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| items/ItemDetailsLoader.java | 463 | `PropertyValue setPropertyArray=props.getPropertyValueByName("Usage_SetPropertyUsageData_Array");` |

### `Usage_SkillLevel`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemEffectsLoader.java | 101 | `Integer skillLevel=(Integer)properties.getProperty("Usage_SkillLevel");` |

### `Usage_SkillToExecute`

Observed raw data classes: 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/ItemEffectsLoader.java | 96 | `Integer skillID=(Integer)properties.getProperty("Usage_SkillToExecute");` |

### `VendorInventory_Items`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 443 | `Object[] inventoryArray=(Object[])properties.getProperty("VendorInventory_Items");` |

### `Vendor_BuysItems`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 394 | `Integer buysItemsInt=(Integer)properties.getProperty("Vendor_BuysItems");` |

### `Vendor_DiscountList`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 398 | `Object[] discountArray=(Object[])properties.getProperty("Vendor_DiscountList");` |

### `Vendor_InventoryList`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 355 | `boolean hasVendorData=(properties.getProperty("Vendor_InventoryList")!=null);` |
| trade/MainDatTradeLoader.java | 363 | `Object[] inventoryArray=(Object[])properties.getProperty("Vendor_InventoryList");` |

### `Vendor_ItemList`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 421 | `Object[] itemsList=(Object[])properties.getProperty("Vendor_ItemList");` |

### `Vendor_SellModifier`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 412 | `Float sellFactor=(Float)properties.getProperty("Vendor_SellModifier");` |

### `Vendor_SellsWearableItems`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| trade/MainDatTradeLoader.java | 408 | `Integer sellsWearableItemsInt=(Integer)properties.getProperty("Vendor_SellsWearableItems");` |

### `Version_TitleBestow_BillingGroups`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainBillingGroupsLoader.java | 119 | `BitSet billingGroups=(BitSet)entryProps.getProperty("Version_TitleBestow_BillingGroups");` |

### `Version_TitleBestow_CreepTitleList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainBillingGroupsLoader.java | 107 | `Object[] creepTitlesArray=(Object[])entryProps.getProperty("Version_TitleBestow_CreepTitleList");` |

### `Version_TitleBestow_DataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainBillingGroupsLoader.java | 67 | `Object[] entries=(Object[])partnerDataProps.getProperty("Version_TitleBestow_DataList");` |

### `Version_TitleBestow_FreepTitleList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainBillingGroupsLoader.java | 97 | `Object[] freepTitlesArray=(Object[])entryProps.getProperty("Version_TitleBestow_FreepTitleList");` |

### `Version_TitleBestow_PartnerDataList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainBillingGroupsLoader.java | 63 | `Object[] partnerDataList=(Object[])props.getProperty("Version_TitleBestow_PartnerDataList");` |

### `VitalDisplayOverride_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 75 | `Object[] list=(Object[])props.getProperty("VitalDisplayOverride_Array");` |

### `VitalDisplayOverride_IsForFreepCharacters`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 110 | `boolean isForFreeps=Utils.getBooleanValue((Integer)properties.getProperty("VitalDisplayOverride_IsForFreepCharacters"),false);` |

### `VitalDisplayOverride_IsForMonsterCharacters`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 113 | `boolean isForCreeps=Utils.getBooleanValue((Integer)properties.getProperty("VitalDisplayOverride_IsForMonsterCharacters"),false);` |

### `VitalDisplayOverride_IsForPvPCharacters`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 116 | `boolean isForPVPCharacters=Utils.getBooleanValue((Integer)properties.getProperty("VitalDisplayOverride_IsForPvPCharacters"),false);` |

### `VitalDisplayOverride_RequiredEnum`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 103 | `int code=((Integer)properties.getProperty("VitalDisplayOverride_RequiredEnum")).intValue();` |

### `VitalDisplayOverride_UIState`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/MainPortaitFramesLoader.java | 106 | `int uiState=((Integer)properties.getProperty("VitalDisplayOverride_UIState")).intValue();` |

### `Vital_HealthCombatBaseRegen`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 172 | `float icmr=((Float)properties.getProperty("Vital_HealthCombatBaseRegen")).floatValue();` |

### `Vital_HealthPeaceBaseRegen`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 173 | `float ocmr=((Float)properties.getProperty("Vital_HealthPeaceBaseRegen")).floatValue();` |

### `Vital_PowerCombatBaseRegen`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 174 | `float icpr=((Float)properties.getProperty("Vital_PowerCombatBaseRegen")).floatValue();` |

### `Vital_PowerPeaceBaseRegen`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/RaceDataLoader.java | 175 | `float ocpr=((Float)properties.getProperty("Vital_PowerPeaceBaseRegen")).floatValue();` |

### `Wardrobe_ItemClothingColorExt_Bit`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/MainDatColorLoader.java | 57 | `Long colorBitSet=(Long)colorProps.getProperty("Wardrobe_ItemClothingColorExt_Bit");` |

### `WebStoreAccountItem_BillingToken`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/WebStoreItemsLoader.java | 103 | `Integer billingTokenCode=(Integer)props.getProperty("WebStoreAccountItem_BillingToken");` |

### `WebStoreAccountItem_DataID`

Observed raw data classes: 1023, 1398, 1889, 692.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/deeds/DeedsLoader.java | 150 | `Integer webStoreItemID=(Integer)properties.getProperty("WebStoreAccountItem_DataID");` |
| achievables/quests/QuestsLoader.java | 208 | `Integer webStoreItemID=(Integer)properties.getProperty("WebStoreAccountItem_DataID");` |
| factions/MainDatFactionsLoader.java | 222 | `Integer webStoreDataId=(Integer)properties.getProperty("WebStoreAccountItem_DataID");` |

### `WebStoreAccountItem_IsFreeForSubscribers`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/WebStoreItemsLoader.java | 116 | `Integer freeForSubscribersInt=(Integer)props.getProperty("WebStoreAccountItem_IsFreeForSubscribers");` |

### `WebStoreInventoryItem_DataID`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/WebStoreItemsLoader.java | 110 | `Integer itemID=(Integer)props.getProperty("WebStoreInventoryItem_DataID");` |

### `WebStoreItem_SKU`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/WebStoreItemsLoader.java | 97 | `String sku=(String)props.getProperty("WebStoreItem_SKU");` |

### `WebStoreItem_ShortName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| misc/WebStoreItemsLoader.java | 100 | `String shortName=(String)props.getProperty("WebStoreItem_ShortName");` |

### `WebStore_Stat_Trait_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| characters/MainStatTomesLoader.java | 66 | `Object[] tomeTraitIds=(Object[])statProps.getProperty("WebStore_Stat_Trait_List");` |

### `WeenieType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| effects/loaders/AIPetEffectLoader.java | 52 | `int weenieType=((Integer)props.getProperty("WeenieType")).intValue();` |
| effects/loaders/GenesisEffectLoader.java | 46 | `int weenieType=((Integer)props.getProperty("WeenieType")).intValue();` |
| items/MainDatContainerLoader.java | 149 | `Integer weenieType=(Integer)properties.getProperty("WeenieType");` |
| items/MainDatItemsLoader.java | 725 | `Integer weenieType=(Integer)properties.getProperty("WeenieType");` |
| items/legendary/MainDatConversionDataInspection.java | 73 | `Integer weenieType=(Integer)itemProps.getProperty("WeenieType");` |

### `WorldEvent_Condition`

Observed raw data classes: 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| requirements/LootFilterLoader.java | 149 | `PropertiesSet worldEventConditionProps=(PropertiesSet)worldEventProps.getProperty("WorldEvent_Condition");` |

### `WorldEvent_ConditionValue`

Observed raw data classes: 1210, 1398, 1683, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventConditionsLoader.java | 134 | `Integer conditionValue=(Integer)props.getProperty("WorldEvent_ConditionValue");` |

### `WorldEvent_Condition_UsageString`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventConditionsLoader.java | 136 | `String usageString=(String)props.getProperty("WorldEvent_Condition_UsageString");` |

### `WorldEvent_Condition_WorldEventToCompareWith`

Observed raw data classes: 1398.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventConditionsLoader.java | 135 | `Integer idToCompareWith=(Integer)props.getProperty("WorldEvent_Condition_WorldEventToCompareWith");` |

### `WorldEvent_DefaultBoolValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 112 | `Integer defaultValueInt=(Integer)props.getProperty("WorldEvent_DefaultBoolValue");` |

### `WorldEvent_DefaultIntValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 99 | `Integer defaultValue=(Integer)props.getProperty("WorldEvent_DefaultIntValue");` |

### `WorldEvent_DescriptionString`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 145 | `String description=(String)props.getProperty("WorldEvent_DescriptionString");` |

### `WorldEvent_MaxIntValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 98 | `Integer maxValue=(Integer)props.getProperty("WorldEvent_MaxIntValue");` |

### `WorldEvent_MinIntValue`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 97 | `Integer minValue=(Integer)props.getProperty("WorldEvent_MinIntValue");` |

### `WorldEvent_Operator`

Observed raw data classes: 1210, 1398, 1683, 1724.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventConditionsLoader.java | 131 | `int operatorCode=((Integer)props.getProperty("WorldEvent_Operator")).intValue();` |

### `WorldEvent_ProgressString`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventsLoader.java | 151 | `String progress=(String)props.getProperty("WorldEvent_ProgressString");` |

### `WorldEvent_WorldEvent`

Observed raw data classes: 1210, 1398, 1683, 1724, 796.

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/WorldEventConditionsLoader.java | 133 | `Integer worldEventID=(Integer)props.getProperty("WorldEvent_WorldEvent");` |

### `WorldEvent_WorldEventList`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| common/worldEvents/MainWorldEventsLoader.java | 34 | `Object[] ids=(Object[])props.getProperty("WorldEvent_WorldEventList");` |

### `WorldEvent_WorldPropertyName`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| achievables/DatObjectivesLoader.java | 861 | `int propId=((Integer)worldEventProps.getProperty("WorldEvent_WorldPropertyName")).intValue();` |
| common/worldEvents/WorldEventsLoader.java | 87 | `int propertyID=((Integer)props.getProperty("WorldEvent_WorldPropertyName")).intValue();` |

### `WorldJoinControl_FeaturedInstance_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 95 | `Object[] featuredInstancesArray=(Object[])props.getProperty("WorldJoinControl_FeaturedInstance_Array");` |

### `WorldJoinControl_Grouped_Instance_List`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 188 | `Object[] instanceIdsArray=(Object[])instanceGroupProps.getProperty("WorldJoinControl_Grouped_Instance_List");` |

### `WorldJoinControl_InstanceGroups`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 181 | `Object[] instanceGroupsArray=(Object[])props.getProperty("WorldJoinControl_InstanceGroups");` |

### `WorldJoinControl_Instance_Group_Label`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 185 | `int labelCode=((Integer)instanceGroupProps.getProperty("WorldJoinControl_Instance_Group_Label")).intValue();` |

### `WorldJoin_AvailablePETemplates_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 122 | `Object[] availablePEsArray=(Object[])props.getProperty("WorldJoin_AvailablePETemplates_Array");` |

### `WorldJoin_EncounterCategory`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 305 | `Integer categoryCodeValue=(Integer)props.getProperty("WorldJoin_EncounterCategory");` |

### `WorldJoin_EncounterType`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatPrivateEncountersLoader.java | 311 | `Integer typeCode=(Integer)props.getProperty("WorldJoin_EncounterType");` |

### `WorldJoin_Seasonal_EncounterCategory_Array`

Observed raw data classes: .

| File relative to the source root | Line | Exact access |
| --- | --- | --- |
| instances/MainDatInstancesTreeLoader.java | 208 | `Object[] seasonalCategoryArray=(Object[])props.getProperty("WorldJoin_Seasonal_EncounterCategory_Array");` |

## Observed fields without a direct literal access in the checked source tree

- `AC_BoneScale_Test`
- `AC_BoneSlider_Value_Array`
- `AC_Color_Eyes`
- `AC_Color_Hair`
- `AC_Color_Lips`
- `AC_Color_Skin`
- `AC_Color_WarPaint`
- `AC_Texture_Complexion`
- `AC_Texture_Eyebrows`
- `AC_Texture_Eyes`
- `AC_Texture_Eyeshadow`
- `AC_Texture_Mouth`
- `AC_Texture_Scar`
- `AICombat_AI_IgnoreConsideration`
- `AICombat_EnterAntiExploit_OnChooseActionFail`
- `AIPuppet_CombatZone_MaxBox`
- `AIPuppet_CombatZone_MinBox`
- `AIPuppet_TargetEvalPackage`
- `AIPuppet_TargetEvalPackage_Cached`
- `AIPuppet_TargetFlags`
- `AIPuppet_TargetWeight_Modifier`
- `AIPuppet_TargetWeight_Modifier_Cached`
- `AI_AcceptsBroadcasts`
- `AI_CallForHelpFilter`
- `AI_CallForHelp_LinkedCombat_TargetLimit`
- `AI_CallForHelp_Radius`
- `AI_CallForHelp_RespondTypes`
- `AI_CallForHelp_TargetLimit`
- `AI_CallForHelp_Type`
- `AI_ColorEventTable`
- `AI_Flank_MaxDistance`
- `AI_Flank_MaxDistance_ForwardSource`
- `AI_Flank_MinDistance`
- `AI_Flank_MinDistance_ForwardSource`
- `AI_Flank_Position`
- `AI_Flank_Position_ForwardSource`
- `AI_FocusObjects_MoveToBreakAfterTimeElapsed`
- `AI_Hints`
- `AI_IgnoreHealthSpeedModifier`
- `AI_IsPuppetNPC`
- `AI_KungFu_Repeatable`
- `AI_KungFu_StartAsNPC`
- `AI_KungFu_TransitionList`
- `AI_KungFu_Transition_Drama`
- `AI_KungFu_Transition_HealthRatio`
- `AI_LinkedCombat`
- `AI_MovementBehavior`
- `AI_MovementBehavior_ForwardSource`
- `AI_MovementType`
- `AI_NeverHeal`
- `AI_NeverHibernate`
- `AI_PerceptionRadius`
- `AI_PhysicallyWanders`
- `AI_PreventXPReward`
- `AI_RemoteDetector_MaxBox`
- `AI_RemoteDetector_MinBox`
- `AI_Usage_CanUseDoors`
- `AI_Usage_TurnTo`
- `AI_WanderingProb`
- `AI_WanderingRange`
- `Accomplishment_AccelerationCategory`
- `Accomplishment_CanBeAccelerated`
- `Accomplishment_DeedAccelerationPropertyMap_Array`
- `Accomplishment_DeedAcceleration_MithrilPurchase_Effects`
- `Accomplishment_DeedAcceleration_PropertyName`
- `Accomplishment_DeedAcceleration_WebStoreCategory`
- `Accomplishment_DeedUIGroup`
- `Accomplishment_DeedUIGroups_Array`
- `Accomplishment_LoreInfo`
- `Accomplishment_MainTabElementID`
- `Accomplishment_MainTabMPElementID`
- `Accomplishment_MinLevelToStart_FloatToCap`
- `Accomplishment_RequiredTrait`
- `Accomplishment_ShowProgressBar`
- `Accomplishment_Tree_AccomplishmentCategory`
- `Accomplishment_Tree_CompletedImageElement`
- `Accomplishment_Tree_FilterArray`
- `Accomplishment_Tree_FilterHash`
- `Accomplishment_Tree_IconArray`
- `Accomplishment_Tree_UnderwayImageElement`
- `Accomplishment_UITabElementID`
- `Accomplishment_UITabElements_Array`
- `Accomplishment_UITabMPElementID`
- `Accomplishment_UITabWebstoreItems_Array`
- `Accomplishment_UITab_Array`
- `Accomplishment_WebstoreItem`
- `Advancement_Level`
- `Agent_Classification`
- `Agent_NotAlive_Name`
- `AppearanceMod_NPCIsBarber`
- `Appearance_AprFile`
- `Appearance_ClassList`
- `Appearance_InstanceList`
- `Appearance_Key`
- `Appearance_Modifier`
- `Appearance_RandomAppearanceType`
- `Area_AggroPing_BelowAllowedLevel_Radius`
- `Area_AggroPing_MinLevelAllowed`
- `Area_AllowSummoning`
- `Area_AllowWorldJoin`
- `Area_Allow_Duels`
- `Area_Allow_Outfits`
- `Area_Allow_SkirmishSoldiers`
- `Area_Allowed_Mount_Types`
- `Area_AreaInstanceStruct`
- `Area_CanBeUsedForMonsterPlay`
- `Area_DefaultInstanceTemplate`
- `Area_HiddenFromQuestGuide`
- `Area_IsRestricted`
- `Area_MapData`
- `Area_MoodDescriptionOverride`
- `Area_Name`
- `Area_PermittedBilling_PropertyName`
- `Area_PlayerTrackingState`
- `Area_PublicAreaQuestArray`
- `Area_RequiredCharacteristicDID`
- `Area_SceneArray`
- `Area_SkirmishSoldiers_FreeLandscapeTime`
- `Area_VisitedAreaType`
- `Attitude_Table`
- `Auction_CategoryType`
- `BigBattle_Commander_Corruption_Active`
- `BigBattle_Commander_Corruption_Active_Cached`
- `BigBattle_Commander_Stance`
- `BigBattle_Commander_Stance_Cached`
- `BigBattle_Feedback_Objective_SkyRay`
- `BigBattle_Interactive_Aim_Horizontal_Max`
- `BigBattle_Interactive_Aim_Horizontal_Min`
- `BigBattle_Interactive_Aim_Vertical`
- `BigBattle_Interactive_Aim_Vertical_Max`
- `BigBattle_Interactive_Aim_Vertical_Min`
- `BigBattle_Interactive_Ammunition_Shell`
- `BigBattle_Interactive_Built`
- `BigBattle_Interactive_Burning`
- `BigBattle_Interactive_Crank_Max`
- `BigBattle_Interactive_Disable_Mod`
- `BigBattle_Interactive_Disarm_Mod`
- `BigBattle_Interactive_Impulse_Max`
- `BigBattle_Interactive_Impulse_Max_Base`
- `BigBattle_Interactive_Impulse_Min`
- `BigBattle_Interactive_Impulse_Min_Base`
- `BigBattle_Interactive_MaxRange`
- `BigBattle_Interactive_Upgrade_Damage_Modifier`
- `BigBattle_IsSiegeWeapon`
- `BigBattle_OfficerBannerCanHeal`
- `BigBattle_OfficerBannerCanHeal_Cached`
- `Boss_Zone_1`
- `CSM_ActionHandler`
- `CombatStateMod_CC_DurationMultModifier`
- `CombatStateMod_CC_DurationMultModifier_Cached`
- `CombatStateMod_Rooted_DurationMultModifier`
- `CombatStateMod_Rooted_DurationMultModifier_Cached`
- `CombatState_CurrentStateImmunities`
- `Combat_AnimationSet`
- `Combat_ArmorDefense_ClassBased_CalcType`
- `Combat_ArmorDefense_ClassBased_CalcType_Cached`
- `Combat_Attacker_ArmorDefense_Level_Modifier`
- `Combat_Attacker_ArmorDefense_Level_Modifier_Cached`
- `Combat_Attacker_ArmorDefense_Points_Modifier`
- `Combat_Attacker_ArmorDefense_Points_Modifier_Cached`
- `Combat_Attacker_Block_Level_Mod`
- `Combat_Attacker_Block_Level_Mod_Cached`
- `Combat_Attacker_Block_Point_Mod`
- `Combat_Attacker_Block_Point_Mod_Cached`
- `Combat_Attacker_Evade_Level_Mod`
- `Combat_Attacker_Evade_Level_Mod_Cached`
- `Combat_Attacker_Evade_Point_Mod`
- `Combat_Attacker_Evade_Point_Mod_Cached`
- `Combat_Attacker_Parry_Level_Mod`
- `Combat_Attacker_Parry_Level_Mod_Cached`
- `Combat_Attacker_Parry_Point_Mod`
- `Combat_Attacker_Parry_Point_Mod_Cached`
- `Combat_BaseEvadeRate_Magic`
- `Combat_BaseEvadeRate_Magic_Cached`
- `Combat_BaseEvadeRate_Melee`
- `Combat_BaseEvadeRate_Melee_Cached`
- `Combat_BaseEvadeRate_Ranged`
- `Combat_BaseEvadeRate_Ranged_Cached`
- `Combat_BlockPoints_Melee`
- `Combat_BlockPoints_Melee_Cached`
- `Combat_BlockPoints_Ranged`
- `Combat_BlockPoints_Ranged_Cached`
- `Combat_BlockPoints_Tactical`
- `Combat_BlockPoints_Tactical_Cached`
- `Combat_CanBlock`
- `Combat_CanBlock_Cached`
- `Combat_CanEvade`
- `Combat_CanEvade_Cached`
- `Combat_CanParry`
- `Combat_CanParry_Cached`
- `Combat_Class_PhysicalMastery_Unified`
- `Combat_Class_TacticalMastery_Unified`
- `Combat_Defender_Critical_Level_Mod`
- `Combat_Defender_Critical_Level_Mod_Cached`
- `Combat_Defender_SuperCritical_Level_Mod`
- `Combat_Defender_SuperCritical_Level_Mod_Cached`
- `Combat_EvadePoints_Melee`
- `Combat_EvadePoints_Melee_Cached`
- `Combat_EvadePoints_Ranged`
- `Combat_EvadePoints_Ranged_Cached`
- `Combat_EvadePoints_Tactical`
- `Combat_EvadePoints_Tactical_Cached`
- `Combat_FXSet`
- `Combat_Melee_Critical_Defense`
- `Combat_Melee_Critical_Defense_Cached`
- `Combat_MissChanceModifier_Ranged`
- `Combat_MissChanceModifier_Ranged_Cached`
- `Combat_NonCommonArmorDefense_ClassBased_CalcType`
- `Combat_NonCommonArmorDefense_ClassBased_CalcType_Cached`
- `Combat_NotAttackable`
- `Combat_ParryPoints_Melee`
- `Combat_ParryPoints_Melee_Cached`
- `Combat_ParryPoints_Ranged`
- `Combat_ParryPoints_Ranged_Cached`
- `Combat_ParryPoints_Tactical`
- `Combat_ParryPoints_Tactical_Cached`
- `Combat_PartialBlock_Mitigation_Mod`
- `Combat_PartialBlock_Mitigation_Mod_Cached`
- `Combat_PartialBlock_PercentageAddMod`
- `Combat_PartialBlock_PercentageAddMod_Cached`
- `Combat_PartialEvade_Mitigation_Mod`
- `Combat_PartialEvade_Mitigation_Mod_Cached`
- `Combat_PartialEvade_PercentageAddMod`
- `Combat_PartialEvade_PercentageAddMod_Cached`
- `Combat_PartialParry_Mitigation_Mod`
- `Combat_PartialParry_Mitigation_Mod_Cached`
- `Combat_PartialParry_PercentageAddMod`
- `Combat_PartialParry_PercentageAddMod_Cached`
- `Combat_PhysicalMastery_Class_Unified_Cached`
- `Combat_PhysicalMastery_Modifier_Unified`
- `Combat_PhysicalMastery_Modifier_Unified_Cached`
- `Combat_Ranged_Critical_Defense`
- `Combat_Ranged_Critical_Defense_Cached`
- `Combat_SkillDamageMultiplier_Fire`
- `Combat_SuperCritical_PercentAddMod`
- `Combat_SuperCritical_PercentAddMod_Cached`
- `Combat_TacticalArmorDefense_ClassBased_CalcType`
- `Combat_TacticalArmorDefense_ClassBased_CalcType_Cached`
- `Combat_TacticalMastery_Class_Unified_Cached`
- `Combat_TacticalMastery_Modifier_Unified`
- `Combat_TacticalMastery_Modifier_Unified_Cached`
- `Combat_Tactical_Critical_Defense`
- `Combat_Tactical_Critical_Defense_Cached`
- `Combat_Unified_Critical_Defense`
- `Combat_Unified_Critical_Defense_Cached`
- `Combat_Unified_Critical_Defense_Percent_Mod`
- `Combat_Unified_Critical_Defense_Percent_Mod_Cached`
- `Combat_Violent`
- `Conjunction_TableOverride_Cached`
- `Conjunction_TableOverride_Source`
- `Container_DecayPolicy`
- `Container_IsAutoClose`
- `Container_OnOpen_XPAward_Progression`
- `Container_OnOpen_XPAward_Progression_DrivingProperty`
- `CounterBox_Active`
- `CounterBox_Condition1`
- `CounterBox_Condition2`
- `CounterBox_Condition3`
- `CounterBox_Condition4`
- `CounterBox_Condition5`
- `CounterBox_CurrentCount`
- `CounterBox_DeactivateOnMaxCount`
- `CounterBox_DecrementBy`
- `CounterBox_IncrementBy`
- `CounterBox_MaxCount`
- `CounterBox_ResetOnMaxCount`
- `CraftProfession_AllowsXPAcceleration`
- `CraftProfession_AutoCompleteMastery`
- `CraftProfession_AutoCompleteProficiency`
- `CraftProfession_ChangeString`
- `CraftProfession_Characteristic`
- `CraftProfession_CompletedMasteryLevelCharacteristic`
- `CraftProfession_CompletedMasteryLevel_PropertyName`
- `CraftProfession_CompletedProficiencyLevelCharacteristic`
- `CraftProfession_CompletedProficiencyLevel_PropertyName`
- `CraftProfession_CriticalChanceAddModifier_PropertyName`
- `CraftProfession_Description`
- `CraftProfession_Item`
- `CraftProfession_LearnString`
- `CraftProfession_Name`
- `CraftProfession_OpenLevel_PropertyName`
- `CraftProfession_ProficiencyTutorialHint`
- `CraftProfession_RecipeWebStoreCategory`
- `CraftProfession_RequiredTool`
- `CraftProfession_StartTime_PropertyName`
- `CraftProfession_TierLevelCapGate`
- `CraftProfession_TierOpenLevel_PropertyName`
- `CraftProfession_TierOpeningCharacteristic`
- `Craft_OfferedCraftGuildArray`
- `Craft_OfferedProfessionArray`
- `Craft_OfferedVocationArray`
- `Craft_Resource_Type`
- `DBUSpawnEffectArray_Forwarded`
- `Death_CorpseIsUsable`
- `Death_CorpseMobile`
- `Death_MonsterPlayerDefeatArray`
- `Death_NeverSayDie`
- `Death_PlayerDefeatArray`
- `Death_SelfDefeat_AnnounceOverride`
- `DecalScript_LightingBlend`
- `DistantBattleUnit_Activator_Respawn_Time`
- `DistantBattleUnit_Activator_Spawn_Transfer_Properties`
- `DistantBattleUnit_CaptureQualityOverride`
- `DistantBattleUnit_Composition`
- `DistantBattleUnit_CosmeticEntity`
- `DistantBattleUnit_EntityComposition`
- `DistantBattleUnit_Entity_Offset_Array`
- `DistantBattleUnit_FireMissileScript`
- `DistantBattleUnit_Formation`
- `DistantBattleUnit_Formation_Dimensions`
- `DistantBattleUnit_Formation_Jitter`
- `DistantBattleUnit_Formation_LateralDepth`
- `DistantBattleUnit_Formation_LateralWidth_Ratio`
- `DistantBattleUnit_Formation_LayoutCalculator`
- `DistantBattleUnit_Formation_PosteriorDepth`
- `DistantBattleUnit_Formation_Priority`
- `DistantBattleUnit_Formation_Unit`
- `DistantBattleUnit_Formation_Width`
- `DistantBattleUnit_GroundClampEntities`
- `DistantBattleUnit_LaneType`
- `DistantBattleUnit_Max_Activator_Count`
- `DistantBattleUnit_Min_Activator_Count`
- `DistantBattleUnit_Missile_RequiredArcherUnit`
- `DistantBattleUnit_Missile_RequiredArcherUnit_CurrentCount`
- `DistantBattleUnit_SpawnRate`
- `DistantBattleUnit_SpawnRate_Variance`
- `DistantBattleUnit_StartFollowDistance`
- `DistantBattleUnit_StopFollowDistance`
- `DistantBattleUnit_VisualRadius`
- `Door_Animation_Closed_DID`
- `Door_Animation_Closing_DID`
- `Door_Animation_Open_DID`
- `Door_Animation_Opening_DID`
- `Door_DelayedEtherealityChangeClose`
- `Door_DelayedEtherealityChangeOpen`
- `Drama_AIHints`
- `Drama_Action`
- `Drama_ActionSequence`
- `Drama_Action_Instant`
- `Drama_AddEffect`
- `Drama_AddEffectID`
- `Drama_AddEffect_Spellcraft`
- `Drama_BroadcastRadius`
- `Drama_BroadcastRadius_Name`
- `Drama_BroadcastRadius_PropertyToMatch`
- `Drama_BroadcastRadius_Range`
- `Drama_CanInteractDuringDrama`
- `Drama_DestroySelf`
- `Drama_DestroySelf_FadeOut`
- `Drama_Dialog`
- `Drama_Dialog_SayChannel`
- `Drama_Dialog_TextList`
- `Drama_Dialog_Type`
- `Drama_DramaList`
- `Drama_Emote`
- `Drama_HintMask`
- `Drama_KungFu_BecomeMonster`
- `Drama_Name`
- `Drama_PatrolStart`
- `Drama_RemoteDetector_Disable`
- `Drama_RemoteDetector_Enable`
- `Drama_RemoveEffectID`
- `Drama_ScriptLink`
- `Drama_Scriptlet`
- `Drama_SetHints`
- `Drama_Wait_After`
- `Drama_Wait_Before`
- `Drama_Wait_Emote`
- `Dungeon_Allowed_Mount_Types`
- `Dungeon_MiniMapData`
- `Dungeon_Name`
- `EffectMod_ModType_DamageMultModifier_Add`
- `EffectMod_ModType_HealMultModifier_Add`
- `Effect_Additional_Mod_Properties`
- `Effect_ForceHotspotUpdate`
- `Effect_IsEnchantable`
- `Effect_StartupEffectDamageQualifier`
- `Effect_StartupEffectID`
- `Effect_StartupEffectSpellcraft`
- `Emote_MaxDistanceToReceiveEmote`
- `Entity_AdditionalScriptTables`
- `Entity_ClassScriptTable`
- `Entity_CollisionStartScript`
- `Entity_CreationType`
- `Entity_IsGloballyVisible`
- `Entity_Mode`
- `Entity_Monitors`
- `Formation_Group_DataID`
- `Formation_Layout_Type`
- `ForwardSource_Boss_Zone_1`
- `ForwardSource_GameEvent_CombatEventTable`
- `ForwardSource_GameEvent_ConjunctionEventTable`
- `ForwardSource_Movement_AccelerationMultiplier`
- `ForwardSource_Movement_SpeedMultiplier`
- `ForwardSource_Movement_TurnSpeedMultiplier`
- `ForwardSource_ScriptSystem_ActiveMovementBlocked`
- `ForwardSource_ScriptSystem_IsHovering`
- `ForwardSource_Skill_Captain_Herald_DamageMod`
- `ForwardSource_Skill_Captain_Herald_MoraleMod`
- `ForwardSource_Skill_Runekeeper_Healing_HoT`
- `ForwardSource_Skill_Runekeeper_IA_Runestone_Mod`
- `ForwardSource_Skill_Runekeeper_LightningRunestone_SlowMod`
- `ForwardSource_Skill_Runekeeper_RuneRestoration_HealMod`
- `ForwardSource_Skill_TransferReactives_Block`
- `ForwardSource_Skill_TransferReactives_Parry`
- `ForwardSource_Skirmish_RoleCombo`
- `ForwardSource_Trait_Hunter_RefinedBlackPowder_DamageMod`
- `Forward_Cached_Combat_SkillDamageMultiplier_Fire`
- `Forward_Cached_Itemset_Loremaster_FellowshipFriend_Duration`
- `Forward_Cached_Loremaster_Pet_Bubble_Mag`
- `Forward_Cached_MC_Trait_Loremaster_BredForWar_AttackSpeed`
- `Forward_Cached_MC_Trait_Loremaster_BredForWar_BleedDamage`
- `Forward_Cached_MC_Trait_Loremaster_BredForWar_CritChance`
- `Forward_Cached_MC_Trait_Loremaster_BredForWar_FlankChance`
- `Forward_Cached_MC_Trait_Loremaster_BredForWar_Threat`
- `Forward_Cached_Pet_Magic_Defense_DifficultyMod`
- `Forward_Cached_Pet_Magic_Offense_DifficultyMod`
- `Forward_Cached_Pet_Melee_Defense_DifficultyMod`
- `Forward_Cached_Pet_Melee_Offense_DifficultyMod`
- `Forward_Cached_Pet_Ranged_Defense_DifficultyMod`
- `Forward_Cached_Pet_Ranged_Offense_DifficultyMod`
- `Forward_Cached_Skill_Captain_ArmourRend_AppChance`
- `Forward_Cached_Skill_Loremaster_BogLurker_StunChance`
- `Forward_Cached_Skill_Loremaster_Eagle_MoraleTap`
- `Forward_Cached_Skill_Loremaster_PetCrit`
- `Forward_Cached_Skill_Loremaster_Prepare_for_War_pet`
- `Forward_Cached_Skill_Loremaster_Raven_FireMitigation`
- `Forward_Cached_Skill_Loremaster_SignofProtection_IncDamage`
- `Forward_Cached_Skill_Loremaster_SignofProtection_Morale`
- `Forward_Cached_Skill_Loremaster_SignofRage_AttackDuration`
- `Forward_Cached_Skill_Loremaster_SignofRage_Damage`
- `Forward_Cached_Skill_Loremaster_Spirit_MaxMorale_Restore`
- `Forward_Cached_Skill_Loremaster_Spirit_Morale_Return`
- `Forward_Cached_Skill_Loremaster_SynchronizedMovement_AD`
- `Forward_Cached_Skill_Runekeeper_VolcanicRunestone_DamageMod`
- `Forward_Cached_Trait_Loremaster_After_Battle_Treat`
- `Forward_Cached_Trait_Loremaster_Fellowship_Friend`
- `Forward_Cached_Trait_Loremaster_Pet_Loyalty1`
- `Forward_Cached_Trait_Loremaster_Pet_Loyalty2`
- `Forward_Cached_Trait_Loremaster_Pet_Loyalty3`
- `Forward_Cached_Trait_Loremaster_Pet_Loyalty4`
- `Forward_Cached_Trait_Loremaster_Pet_Loyalty5`
- `Forward_Cached_Trait_Loremaster_Protective_Friends`
- `Forward_Source_Trait_Loremaster_BuyingTime_Switch`
- `Forward_Sourced_Skill_Loremaster_AfterBattleTreat_Buff`
- `Forward_Sourced_Skill_Loremaster_AfterBattleTreat_Heal`
- `GameEvent_CombatEventTable`
- `GameEvent_ConjunctionEventTable`
- `GameEvent_StealthEventTable`
- `Generator_DeactivateOnPELock`
- `Generator_IsAGenerator`
- `Generator_IsScaling`
- `Generator_OwnerID`
- `Generator_PositionSetLimit`
- `GoalQueue_PriorityThresholdProperty`
- `GoalQueue_PriorityThresholdValue`
- `GoalQueue_PriorityThreshold_Struct`
- `Health_MaxLevel`
- `Health_MaxLevel_Cached`
- `Health_Starting_Level`
- `Health_UpdateThresholdPercent`
- `Hobby_OfferedHobbiesArray`
- `HotSpot_EffectChannel_Driven_Tier`
- `HotSpot_InteractionPermissions_Enabled`
- `Hotspot_Box_MaxExtent`
- `Hotspot_Box_MinExtent`
- `Hotspot_EnableInactiveVisualization`
- `Hotspot_EnableVisualization`
- `Hotspot_IsHotspot`
- `Hotspot_MustRequireEpicQuest`
- `Hotspot_OverrideMountedCombat_Allow`
- `Hotspot_OverrideMountedCombat_Allow_ForwardSource`
- `Hotspot_OverrideMountedCombat_Disallow`
- `Hotspot_OverrideMountedCombat_Disallow_ForwardSource`
- `HouseKeeper_Internal`
- `HousingHook_HookCategory`
- `HousingHook_ID`
- `HousingHook_IsPropertyHook`
- `HousingSystem_IsEscrowNPC`
- `HousingSystem_PurchaseTemplateDID`
- `Induction_ActionDID`
- `Inscription_MaxLength`
- `Instance_Draigoch_CoinFloor`
- `Instance_Draigoch_CoinFloor_Cached`
- `Instance_Isengard_Raid_Saruman_Ring`
- `Inventory_AcceptsItems`
- `Inventory_AllowSecondaryWeapon`
- `Inventory_CanBeContained`
- `Inventory_Cosmetic_AppliedLoadout`
- `Inventory_Cosmetic_IsSheathed`
- `Inventory_Cosmetic_LoadoutSet`
- `Inventory_Cosmetic_Slot1_Behavior`
- `Inventory_Cosmetic_Slot1_Entity`
- `Inventory_Cosmetic_Slot1_HoldingLocation`
- `Inventory_Cosmetic_Slot1_OffsetRotationPitch`
- `Inventory_Cosmetic_Slot1_OffsetRotationRoll`
- `Inventory_Cosmetic_Slot1_OffsetRotationYaw`
- `Inventory_Cosmetic_Slot1_Scale`
- `Inventory_Cosmetic_Slot2_Behavior`
- `Inventory_Cosmetic_Slot2_Entity`
- `Inventory_Cosmetic_Slot2_HoldingLocation`
- `Inventory_Cosmetic_Slot2_OffsetRotationPitch`
- `Inventory_Cosmetic_Slot2_OffsetRotationRoll`
- `Inventory_Cosmetic_Slot2_OffsetRotationYaw`
- `Inventory_Cosmetic_Slot2_Scale`
- `Inventory_Cosmetic_Slot3_Behavior`
- `Inventory_Cosmetic_Slot3_Entity`
- `Inventory_Cosmetic_Slot3_HoldingLocation`
- `Inventory_DefaultSlot`
- `Inventory_IgnoresTakePermissions`
- `Inventory_Indestructible`
- `Inventory_IsOpen`
- `Inventory_MaxBackpackSlots`
- `Inventory_MaxEquipmentSlots`
- `Inventory_QuestItem`
- `ItemAdvancement_AllowForgingWithoutTrait`
- `ItemAdvancement_AllowRunicCombination`
- `Item_AreaConcerned`
- `Item_ForceNotSellable`
- `Item_MaterialType`
- `Item_NeverHousekeep`
- `Item_Popup_Image`
- `Itemset_Loremaster_FellowshipFriend_Duration`
- `Landmark_Music`
- `Landmark_OverrideMountedCombat_Allow`
- `Landmark_OverrideMountedCombat_Disallow`
- `LootGen_AssignLootRightsOnStartup`
- `LootGen_FilteredTrophyTable`
- `LootGen_FilteredTrophyTable2`
- `LootGen_FilteredTrophyTable3`
- `LootGen_FilteredTrophyTable4`
- `Loot_RemoteAutoLoot`
- `Loremaster_Pet_Bubble_Mag`
- `Loremaster_Pet_IsALoremasterPet`
- `MC_Trait_Loremaster_BredForWar_AttackSpeed`
- `MC_Trait_Loremaster_BredForWar_BleedDamage`
- `MC_Trait_Loremaster_BredForWar_CritChance`
- `MC_Trait_Loremaster_BredForWar_FlankChance`
- `MC_Trait_Loremaster_BredForWar_Threat`
- `MapNote_Discoverable`
- `MapNote_Enabled`
- `MapNote_GameSpecific`
- `MapNote_Level`
- `MapNote_Linkable`
- `MapNote_MaxRange`
- `MapNote_MinRange`
- `MapNote_StringInfo`
- `MapNote_Type`
- `Material_BootMaterial`
- `Material_OffHandMaterial`
- `Material_TorsoMaterial`
- `Material_WeaponMaterial`
- `Milestone_Bind_Confirmation_Text`
- `Milestone_Bind_Success_Text`
- `Milestone_TravelLink`
- `Missile_InitialOffset`
- `Monitor_BoxMax`
- `Monitor_BoxMin`
- `Monitor_ClientOnly`
- `Monitor_DetectionEtherealToTypes`
- `Monitor_DynamicEntitiesOnly`
- `Monitor_IgnoreIndoorVisibility`
- `Monitor_Name`
- `Mood_Intended_Dread_Level`
- `Mood_Intended_Dread_Level_ForwardSource`
- `MountEndurance_MaxLevel`
- `MountEndurance_MaxLevel_Cached`
- `MountPower_MaxLevel`
- `MountPower_MaxLevel_Cached`
- `Mount_Combat_EvadePoints_Modifier`
- `Mount_Combat_EvadePoints_Modifier_Cached`
- `Mount_Control_Turn_Rate_AddMod_Cantor`
- `Mount_Control_Turn_Rate_AddMod_Cantor_ForwardSource`
- `Mount_Control_Turn_Rate_AddMod_Gallop`
- `Mount_Control_Turn_Rate_AddMod_Gallop_ForwardSource`
- `Mount_Control_Turn_Rate_AddMod_Trot`
- `Mount_Control_Turn_Rate_AddMod_Trot_ForwardSource`
- `Mount_Control_Turn_Rate_AddMod_Walk`
- `Mount_Control_Turn_Rate_AddMod_Walk_ForwardSource`
- `Mount_CurrentMountStatus`
- `Mount_CurrentMountType`
- `Mount_Durability_Current_Max`
- `Mount_Durability_Current_Max_Cached`
- `Mount_MeshFX_Appearances`
- `Mount_MountAppearance`
- `Mount_Movement_Acceleration`
- `Mount_Movement_Acceleration_Cached`
- `Mount_Movement_Gear_Change_Rate`
- `Mount_Movement_Gear_Change_Rate_Cached`
- `Mount_Movement_Max_Speed`
- `Mount_Movement_Max_Speed_Cached`
- `Mount_Movement_Turn_Rate`
- `Mount_Movement_Turn_Rate_Cached`
- `Mount_Movement_Use_RampUp_Controller`
- `Mount_RiderType`
- `MountedCombat_CollisionDetectionAllowed`
- `MountedCombat_RiderToMount_DamageEnabled`
- `MountedCombat_RiderToMount_DamageEnabled_ForwardSource`
- `Mounted_Player_Cosmetic_Slot_BoneOffset`
- `Mounted_Player_Cosmetic_Slot_Entity`
- `Mouseover_AllowMouseoverOverride`
- `MoveToController_Gravity`
- `Movement_AccelerationMultiplier`
- `Movement_Effect_MountSpeedMultiplier`
- `Movement_Effect_SpeedMultiplier`
- `Movement_MountAnimationSpeedMultiplier`
- `Movement_RestrictFollow`
- `Movement_TurnSpeedMultiplier`
- `MultiUsage_ActivityCollection`
- `NPCComment_DIDCommentArray`
- `NPC_ActionPicker_AccountBankerScript`
- `NPC_ActionPicker_AuctionScript`
- `NPC_ActionPicker_BankerString`
- `NPC_ActionPicker_GreetingString`
- `NPC_ActionPicker_LevelBestower_LevelArray`
- `NPC_ActionPicker_NeighborGiftScript`
- `NPC_ActionPicker_NeighborGiftString`
- `NPC_ActionPicker_NotaryScript`
- `NPC_ActionPicker_VOScript`
- `NPC_ActionPicker_VendorString`
- `NPC_ActionPicker_VocationTrainerScript`
- `NPC_ActionPicker_WardrobeBankerScript`
- `NPC_ColorTextFile`
- `NPC_Cosmetic_Inventory_HoldingLocation1`
- `NPC_Cosmetic_Inventory_HoldingLocation2`
- `NPC_Cosmetic_Inventory_Item1`
- `NPC_Cosmetic_Inventory_Item2`
- `NPC_Cosmetic_Inventory_Visible`
- `NPC_DistantPEUnit`
- `NPC_HideLevelInDisplay`
- `NPC_IsInanimate`
- `NPC_Is_AccountBanker`
- `NPC_Is_Auctioneer`
- `NPC_Is_Banker`
- `NPC_Is_Neighbor`
- `NPC_Is_Notary`
- `NPC_Is_Trait_Manager`
- `NPC_Is_WardrobeBanker`
- `NPC_LocomotionAnimation`
- `NPC_NeighborCategory`
- `NPC_NeighborQualities`
- `NPC_NeighborQuality`
- `NPC_NeighborQualityWeight`
- `NPC_Neighbor_BespokeQualities`
- `NPC_Neighbor_OutfitType`
- `NPC_Neighbor_Outfits`
- `NPC_Neighbor_QualityBudget`
- `NPC_Neighbor_QualityBudgets`
- `NPC_Neighbor_RandomQualities`
- `NPC_Neighbor_RandomQualityEntries`
- `NPC_PlayingStartingIdle`
- `NPC_PreventRandomEmotes`
- `PEMessageSystem_PointsPerDeath_AddMod`
- `PEMessageSystem_PointsPerDeath_AddMod_Cached`
- `PEMessageSystem_PointsPerKill_AddMod`
- `PEMessageSystem_PointsPerKill_AddMod_Cached`
- `PVPCombat_ArmorPenetration_Physical`
- `PVPCombat_ArmorPenetration_Physical_Cached`
- `PVPCombat_ArmorPenetration_Tactical`
- `PVPCombat_ArmorPenetration_Tactical_Cached`
- `PVPCombat_ArmorRating_Physical`
- `PVPCombat_ArmorRating_Physical_Cached`
- `PVPCombat_ArmorRating_Tactical`
- `PVPCombat_ArmorRating_Tactical_Cached`
- `PVPCombat_AttackSpeedModifier`
- `PVPCombat_AttackSpeedModifier_Cached`
- `PVPCombat_AvoidanceChance_AddMod`
- `PVPCombat_AvoidanceChance_AddMod_Cached`
- `PVPCombat_AvoidanceMitigation_AddMod`
- `PVPCombat_AvoidanceMitigation_AddMod_Cached`
- `PVPCombat_AvoidancePenetration`
- `PVPCombat_AvoidancePenetration_Cached`
- `PVPCombat_AvoidanceRating`
- `PVPCombat_AvoidanceRating_Cached`
- `PVPCombat_CC_Duration_Attacker`
- `PVPCombat_CC_Duration_Attacker_Cashed`
- `PVPCombat_CC_Duration_Defender`
- `PVPCombat_CC_Duration_Defender_Cashed`
- `PVPCombat_CriticalDefense`
- `PVPCombat_CriticalDefense_Cached`
- `PVPCombat_CriticalHitChance_AddMod`
- `PVPCombat_CriticalHitChance_AddMod_Cached`
- `PVPCombat_CriticalHitMagnitude_AddMod`
- `PVPCombat_CriticalHitMagnitude_AddMod_Cached`
- `PVPCombat_CriticalRating`
- `PVPCombat_CriticalRating_Cached`
- `PVPCombat_DamageDealtMultiplier_Melee`
- `PVPCombat_DamageDealtMultiplier_Melee_Cached`
- `PVPCombat_DamageDealtMultiplier_Ranged`
- `PVPCombat_DamageDealtMultiplier_Ranged_Cached`
- `PVPCombat_DamageQualifierImmunity_Melee`
- `PVPCombat_DamageQualifierImmunity_Melee_Cached`
- `PVPCombat_DamageQualifierImmunity_Ranged`
- `PVPCombat_DamageQualifierImmunity_Ranged_Cached`
- `PVPCombat_DamageReceivedMultiplier_Melee`
- `PVPCombat_DamageReceivedMultiplier_Melee_Cached`
- `PVPCombat_DamageReceivedMultiplier_Ranged`
- `PVPCombat_DamageReceivedMultiplier_Ranged_Cached`
- `PVPCombat_DamageTypeImmunity_Physical`
- `PVPCombat_DamageTypeImmunity_Physical_Cached`
- `PVPCombat_DamageTypeImmunity_Tactical`
- `PVPCombat_DamageTypeImmunity_Tactical_Cached`
- `PVPCombat_HealingMultiplier_Incoming`
- `PVPCombat_HealingMultiplier_Incoming_Cached`
- `PVPCombat_HealingMultiplier_Outgoing`
- `PVPCombat_HealingMultiplier_Outgoing_Cached`
- `PVPCombat_IncomingCriticalHitChance_AddMod`
- `PVPCombat_IncomingCriticalHitChance_AddMod_Cached`
- `PVPCombat_MasteryMultiplier_AddMod_Physical`
- `PVPCombat_MasteryMultiplier_AddMod_Physical_Cached`
- `PVPCombat_MasteryMultiplier_AddMod_Tactical`
- `PVPCombat_MasteryMultiplier_AddMod_Tactical_Cached`
- `PVPCombat_MasteryRating_Physical`
- `PVPCombat_MasteryRating_Physical_Cached`
- `PVPCombat_MasteryRating_Tactical`
- `PVPCombat_MasteryRating_Tactical_Cached`
- `PVPCombat_MissChance`
- `PVPCombat_MissChance_Cached`
- `PVP_Hero_ReceivedRankXPMod_Assist`
- `PVP_Hero_ReceivedRankXPMod_Assist_Cached`
- `PVP_Hero_ReceivedRankXPMod_KillingBlow`
- `PVP_Hero_ReceivedRankXPMod_KillingBlow_Cached`
- `PaperItemControl_CurrencyBonusPropertyArray`
- `PatrolBox_Order_Number`
- `PatrolBox_Order_Weight`
- `PatrolBox_Patrol_Name`
- `PatrolBox_Patrol_Selection_Array`
- `PetBestower_Area_1`
- `PetBestower_Area_10`
- `PetBestower_Area_11`
- `PetBestower_Area_12`
- `PetBestower_Area_13`
- `PetBestower_Area_14`
- `PetBestower_Area_15`
- `PetBestower_Area_2`
- `PetBestower_Area_3`
- `PetBestower_Area_4`
- `PetBestower_Area_5`
- `PetBestower_Area_6`
- `PetBestower_Area_7`
- `PetBestower_Area_8`
- `PetBestower_Area_9`
- `Pet_Magic_Defense_DifficultyMod`
- `Pet_Magic_Offense_DifficultyMod`
- `Pet_Melee_Defense_DifficultyMod`
- `Pet_Melee_Offense_DifficultyMod`
- `Pet_Ranged_Defense_DifficultyMod`
- `Pet_Ranged_Offense_DifficultyMod`
- `PhasingBox_UpdateOnlyOnCreation`
- `Phasing_ForcePhasingRefresh_OnEnterWorld`
- `Physics_AdjustableScale`
- `Physics_AlternativeDetectionRep`
- `Physics_AvatarFloatHeight`
- `Physics_CollisionReports`
- `Physics_DetectionType`
- `Physics_EtherealToType`
- `Physics_EtherealityType`
- `Physics_GameRadiusOverride`
- `Physics_MoveTo_GameRadiusOverride`
- `Physics_NoPathmaps`
- `Physics_NoPhysics`
- `Physics_PlacementEtherealToType`
- `PipConfig_Pip_List`
- `Pip_Aim_AdjustmentWhileMovingAlwaysRequeue`
- `Pip_Aim_AdjustmentWhileMovingAlwaysRequeue_Cached`
- `Pip_Aim_AdjustmentWhileMovingEnabled`
- `Pip_Aim_AdjustmentWhileMovingEnabled_Cached`
- `Power_MaxLevel`
- `Power_MaxLevel_Cached`
- `PrivateEncounter_DestroyItemOnExit`
- `PrivateEncounter_LinkedTemplate`
- `PrivateEncounter_RaidChestLock_PullCountBeforeLock`
- `PrivateEncounter_RaidChestLock_PullCountBeforeSoftLock`
- `PrivateEncounter_RaidChestLock_ResetDays`
- `PrivateEncounter_RaidChestLock_SoftLockEnabled`
- `PrivateEncounter_TravelArray`
- `PropertyResponse_EntityPropertyResponseMap`
- `QuestArc_Name`
- `QuestControl_CancelledPendingQuestTimeout`
- `QuestControl_CategoryToChallengeLevelOverrideProperty_Hash`
- `QuestControl_LockingAutoBestowEvents`
- `QuestControl_MaxPendingBestowQuests`
- `QuestControl_MedalThresholds`
- `QuestControl_MedalUIState_Hash`
- `QuestControl_MinLevelToAwardItemXP`
- `QuestControl_PendingQuestTimeout`
- `QuestControl_Points_Start_Mapping`
- `QuestControl_Points_Start_Value`
- `QuestControl_QuestSlotsForMithrilPerPurchase`
- `QuestControl_TeleToObjective_DisabledCategories`
- `QuestDispenser_ActiveQuests`
- `QuestDispenser_DetectRadius`
- `QuestDispenser_IsRemote`
- `QuestDispenser_MissionTwistDescription`
- `QuestDispenser_MissionTwistIcon`
- `QuestDispenser_MissionTwistName`
- `QuestDispenser_NPC`
- `QuestDispenser_OpenInstanceUI_PrivateEncounterTemplate`
- `QuestDispenser_OpenUIMenu_SubPanel_UIElementID`
- `QuestDispenser_OpenUIMenu_UIElementID`
- `QuestDispenser_PortalDestination`
- `QuestDispenser_Quest`
- `QuestDispenser_RoleFailureText`
- `QuestDispenser_RoleSuccessText`
- `QuestDispenser_SendVOToServer`
- `QuestDispenser_SessionDID`
- `QuestDispenser_Species`
- `QuestDispenser_StartScriptID`
- `QuestDispenser_TeleportationSceneID`
- `QuestDispenser_VOScriptID`
- `QuestDispenser_VOSoundID`
- `QuestEffect_Spellcraft`
- `QuestEvent_AccomplishmentCompleteCategory`
- `QuestEvent_AllowQuickslot`
- `QuestEvent_ApplyEffectArray`
- `QuestEvent_BillboardProgressOverride`
- `QuestEvent_CanTeleportToObjective`
- `QuestEvent_ChannelingRoleConstraint`
- `QuestEvent_ChannelingState`
- `QuestEvent_CorpseUsage_MaxUses`
- `QuestEvent_CorpseUsage_OnUseScriptID`
- `QuestEvent_DestroyChannelingItem`
- `QuestEvent_DestroyInventoryItems`
- `QuestEvent_DestroyOnQuestAdvance`
- `QuestEvent_DisableEntityExamination`
- `QuestEvent_DramaName`
- `QuestEvent_DramaProgressOverride`
- `QuestEvent_EscortPatrolName`
- `QuestEvent_EventVolumeString`
- `QuestEvent_FailQuestWhenEventFails`
- `QuestEvent_FailedBillboardText`
- `QuestEvent_ForceCheckContentLayer`
- `QuestEvent_GiveItemsOnAdvance`
- `QuestEvent_HasInventoryItem`
- `QuestEvent_HideRadarIcon`
- `QuestEvent_IA_EventType`
- `QuestEvent_IA_ItemLevel`
- `QuestEvent_IA_RunicType`
- `QuestEvent_InductionActionOverride`
- `QuestEvent_IsFellowUseShared`
- `QuestEvent_IsRemote`
- `QuestEvent_ItemDID`
- `QuestEvent_KungFuDramaName`
- `QuestEvent_LandmarkRegion`
- `QuestEvent_LeaveDetectionOverride`
- `QuestEvent_Location_EntireLandblock`
- `QuestEvent_Location_Position`
- `QuestEvent_Location_Radius`
- `QuestEvent_Location_RoleConstraint`
- `QuestEvent_Locations`
- `QuestEvent_LocationsAreOverrides`
- `QuestEvent_Locations_ForceFullLandblock`
- `QuestEvent_MonsterGenus_ExclusionArray`
- `QuestEvent_Points`
- `QuestEvent_ProgressOverride`
- `QuestEvent_QuestComplete_SuppressQuestCountUpdate`
- `QuestEvent_RecipeDID`
- `QuestEvent_RequireUniqueItems`
- `QuestEvent_ResourceSets`
- `QuestEvent_RoleConstraint`
- `QuestEvent_RunDramaOnAdvance`
- `QuestEvent_RunKungFu`
- `QuestEvent_ScriptCallback_Key`
- `QuestEvent_SelfOnlyChanneling`
- `QuestEvent_Session_DID`
- `QuestEvent_Session_Status`
- `QuestEvent_ShouldShowEscortVitals`
- `QuestEvent_SkillQuestFlags`
- `QuestEvent_Skill_AttackResultArray`
- `QuestEvent_Status`
- `QuestEvent_TappedDramaName`
- `QuestEvent_TappedProgressOverride`
- `QuestEvent_TerritoryDID`
- `QuestEvent_WaitForDrama`
- `QuestState_False_Draw`
- `QuestState_QuestID`
- `QuestState_QuestOperator`
- `QuestState_QuestStatus`
- `QuestState_True_Cosmetic1_HoldingLocation`
- `QuestState_True_Cosmetic1_Item`
- `QuestState_True_Cosmetic2_HoldingLocation`
- `QuestState_True_Cosmetic2_Item`
- `QuestState_True_Draw`
- `QuestSurvey_Frequency`
- `QuestSurvey_IgnoredCategoryArray`
- `QuestSurvey_SurveyID`
- `Quest_AbandonRetryTimer`
- `Quest_AllowsPaperItemResetOnAbandon`
- `Quest_AllowsPaperItemResetOnFailure`
- `Quest_AlwaysShowBestowRings`
- `Quest_AutoAcceptAutoBestow`
- `Quest_AutoShare`
- `Quest_BaseMaxActiveQuests`
- `Quest_BestowalRoles`
- `Quest_BigBattleColor`
- `Quest_CanBeCancelled`
- `Quest_CanBestowInsideInstance`
- `Quest_CategoryWebstoreItems_Array`
- `Quest_Category_Array`
- `Quest_ClosedAccomplishmentsNeededForAdditionalActiveQuest`
- `Quest_CompletionScriptID`
- `Quest_ContainsInstanceQuest`
- `Quest_DailyGlobalResetTime`
- `Quest_DefaultBestowScriptID`
- `Quest_DefaultBestowVOScriptID`
- `Quest_DefaultCommentScriptID`
- `Quest_DefaultCommentVOScriptID`
- `Quest_DefaultItemUsedScriptID`
- `Quest_DefaultLevelDifference`
- `Quest_DefaultNPCTalkScriptID`
- `Quest_DefaultNPCTalkVOScriptID`
- `Quest_Description`
- `Quest_DisplayFirstAvailableQuest`
- `Quest_FailureRetryTimer`
- `Quest_FellowshipShareQuestRange`
- `Quest_ForceMonitorUpdateOnCompletion`
- `Quest_GlobalCooldownTime`
- `Quest_HideChallengeLevel`
- `Quest_IncludesTrackedEvents`
- `Quest_InteractableWhileDead`
- `Quest_InterestedQuests_Array`
- `Quest_IsCompletionTracked`
- `Quest_IsDailyGlobalReset`
- `Quest_IsDelvingEligible`
- `Quest_IsHidden`
- `Quest_IsQuestToken`
- `Quest_IsRaidQuest`
- `Quest_IsSessionAccomplishment`
- `Quest_ItemDisplayFX`
- `Quest_ItemQuantity`
- `Quest_Lock_ResetDays`
- `Quest_MaxActiveQuests`
- `Quest_MaxActiveQuestsFromSubscription`
- `Quest_MaxAdditionalActiveQuestsFromAccomplishments`
- `Quest_MaxChallengeLevel`
- `Quest_Medal`
- `Quest_MedalUIState`
- `Quest_Medal_LootArray`
- `Quest_Medal_LootArray_Medal`
- `Quest_Medal_LootArray_TreasureDID`
- `Quest_MinChallengeLevel`
- `Quest_MinChallengeLevelArray`
- `Quest_MithrilCoinsTier`
- `Quest_MonitorRadius`
- `Quest_MonsterPlay_RecapTextSuccess`
- `Quest_NPCObjRoles`
- `Quest_Name`
- `Quest_NeverAwardsMithril`
- `Quest_NeverGivesItemExp`
- `Quest_NextQuest_AutoBestow`
- `Quest_ObjectiveBillboardOverride`
- `Quest_ObjectiveDescription`
- `Quest_ObjectiveLoreOverride`
- `Quest_ObjectiveProgressOverride`
- `Quest_ObjectiveVolumeString`
- `Quest_PEBestowalLimit`
- `Quest_PaperItemAwards`
- `Quest_PaperItemDID`
- `Quest_PaperItemService_Type`
- `Quest_PaperItemTier`
- `Quest_PayToRepeatNow_Cost`
- `Quest_PlayerLock_ValidateDistance`
- `Quest_PlayerLock_ValidateInterval`
- `Quest_Points`
- `Quest_Points_Start`
- `Quest_PrecludedQuest`
- `Quest_Promo_Reporting_Struct`
- `Quest_RelatedQuest`
- `Quest_RequiresNonTrivialCompletion`
- `Quest_Reward_CraftingMasteryTier`
- `Quest_Reward_CraftingProfession`
- `Quest_Reward_CraftingTier`
- `Quest_Role`
- `Quest_SecondsUntilRetry`
- `Quest_SessionPointsFailureTier`
- `Quest_SessionPointsTier`
- `Quest_StringTokenArray`
- `Quest_TeleToObjective_PaperItemServiceToCategories_Array`
- `Quest_TimeLimit`
- `Quest_TotalWordCount`
- `Quest_TrackedConditionsArray`
- `Quest_WebstoreItem`
- `Region_Name`
- `Render_AdjustableScale`
- `Render_AllowFuzzySelection`
- `Render_AlwaysSelectable`
- `Render_BankSlopeAdjustment`
- `Render_CastBakedStencilShadows`
- `Render_CastBlobShadows`
- `Render_CastDynamicShadows`
- `Render_CastFakeShadows`
- `Render_CastLandscapeShadows`
- `Render_Color`
- `Render_Draw`
- `Render_DrawMeshes`
- `Render_FarViewDistance`
- `Render_LODClass`
- `Render_NeverAddToScene`
- `Render_NeverCullOrOcclude`
- `Render_NeverSelectable`
- `Render_Opacity`
- `Render_PitchSlopeAdjustment`
- `Render_SelectionDecal_Scale`
- `Repair_CostModifier`
- `Reputation_AccountModifier`
- `Reputation_Faction_Description`
- `Reputation_Faction_Name`
- `Reputation_NegativeFaction`
- `Reputation_PositiveFaction`
- `ScriptSystem_ActiveMovementBlocked`
- `ScriptSystem_IsHovering`
- `ScriptTable_DBScriptTable`
- `ScriptTable_StartupScriptNames`
- `Script_Boss_Chain_Target`
- `Script_UseBossHitAnimPriority`
- `Selection_Script`
- `SkillTrainer_Class`
- `SkillTrainer_MPTrainer`
- `Skill_Captain_ArmourRend_AppChance`
- `Skill_Captain_Herald_DamageMod`
- `Skill_Captain_Herald_MoraleMod`
- `Skill_Loremaster_AfterBattleTreat_Buff`
- `Skill_Loremaster_AfterBattleTreat_Heal`
- `Skill_Loremaster_BogLurker_StunChance`
- `Skill_Loremaster_Eagle_MoraleTap`
- `Skill_Loremaster_PetCrit`
- `Skill_Loremaster_Prepare_for_War_pet`
- `Skill_Loremaster_Raven_FireMitigation`
- `Skill_Loremaster_SignofProtection_IncDamage`
- `Skill_Loremaster_SignofProtection_Morale`
- `Skill_Loremaster_SignofRage_AttackDuration`
- `Skill_Loremaster_SignofRage_Damage`
- `Skill_Loremaster_Spirit_MaxMorale_Restore`
- `Skill_Loremaster_Spirit_Morale_Return`
- `Skill_Loremaster_SynchronizedMovement_AD`
- `Skill_Runekeeper_Healing_HoT`
- `Skill_Runekeeper_IA_Runestone_Mod`
- `Skill_Runekeeper_LightningRunestone_SlowMod`
- `Skill_Runekeeper_RuneRestoration_HealMod`
- `Skill_Runekeeper_VolcanicRunestone_DamageMod`
- `Skill_TransferReactives_Block`
- `Skill_TransferReactives_Parry`
- `SkirmishControl_SkirmishBard_RequiredTrait_Override`
- `SkirmishControl_SkirmishTrainer_RequiredTrait_Override`
- `Skirmish_ControlPoint_Banner_EnemyApr`
- `Skirmish_ControlPoint_Banner_FriendlyApr`
- `Skirmish_Defender_ShowGroundVitals`
- `Skirmish_Lieutenant_Announce_Arrival`
- `Skirmish_RoleCombo`
- `Skirmish_SkillTrainer_OverrideDefault_OnlyEarnedSkirmishTraits_ButtonValue`
- `Skirmish_SkillTrainer_Skirmish`
- `Skirmish_SkirmishPointCalculator_Optional_Value`
- `Skirmish_TraitManager_Skirmish`
- `Snd_Monster_Type`
- `SoftLock_LootGen_BarterTrophyList`
- `SoftLock_LootGen_CustomSkirmishLootLookupTable`
- `SoftLock_LootGen_FilteredTrophyTable`
- `SoftLock_LootGen_FilteredTrophyTable2`
- `SoftLock_LootGen_FilteredTrophyTable3`
- `SoftLock_LootGen_ReputationTrophyList`
- `SoftLock_LootGen_TreasureList_Override`
- `SoftLock_LootGen_TrophyList_Override`
- `Sound_MuteWhenInternal`
- `State@Entity.m_bState_1`
- `State@Entity.m_bState_9`
- `State@Entity.m_iCount`
- `Stealth_ResistBreakModifier`
- `Stealth_ResistBreakModifier_Cached`
- `Summon_AttemptingToAnswer_Override`
- `Summon_CallHeard_Override`
- `Summon_ConfirmationMessageWithMaterial_Override`
- `Summon_ConfirmationMessage_Override`
- `Summon_DeclinedResult_Override`
- `Summon_Interrupted_Override`
- `Summon_IsSummoningItem`
- `Summon_Item_InductionAction`
- `Summon_NotAllowedResult_Override`
- `Summon_Summonee_CooldownChannel`
- `Summon_Summonee_CooldownDuration`
- `Summon_Tutorial_HintType`
- `Tapping_OpenTapping`
- `TextItem_AuthorName`
- `TextItem_PrefabContentList`
- `TextItem_Title`
- `ThreatInputModifier_Buff`
- `ThreatInputModifier_Damage`
- `ThreatInputModifier_Healing`
- `ThreatInputModifier_Taunt`
- `TimeOfDay@Entity.m_eTimeOverride`
- `Title_Description`
- `Title_String`
- `TotalThreatModifier_Player`
- `Tracking_ManagerTrackingState`
- `Trait_Hunter_RefinedBlackPowder_DamageMod`
- `Trait_Loremaster_After_Battle_Treat`
- `Trait_Loremaster_BuyingTime_Switch`
- `Trait_Loremaster_Fellowship_Friend`
- `Trait_Loremaster_Pet_Loyalty1`
- `Trait_Loremaster_Pet_Loyalty2`
- `Trait_Loremaster_Pet_Loyalty3`
- `Trait_Loremaster_Pet_Loyalty4`
- `Trait_Loremaster_Pet_Loyalty5`
- `Trait_Loremaster_Protective_Friends`
- `Travel_LeavePrivateInstanceLayerArray`
- `Travel_TravelFlags`
- `UIViewport_Array`
- `UIViewport_EntityArray`
- `UIViewport_EntityPosition`
- `UIViewport_EntityProperties`
- `UIViewport_Image`
- `UIViewport_Type`
- `UI_Examination_Tooltip_0Click_Element`
- `UI_Examination_Tooltip_0Click_Layout`
- `UI_Examination_Tooltip_1Click_Element`
- `UI_Examination_Tooltip_1Click_Layout`
- `UI_Examination_Tooltip_Compare_Element`
- `UI_Examination_Tooltip_Compare_Layout`
- `UI_Examination_Tooltip_Compare_Type`
- `UI_Examination_Tooltip_DisplayString`
- `UI_FloatyText_HideFloatingName`
- `Usage_AICanIgnoreLock`
- `Usage_AICanUseDoors`
- `Usage_Action_Shadow`
- `Usage_AllowedInCombat`
- `Usage_AllowedWhileMounted`
- `Usage_AlwaysAllowQuestItemUsage`
- `Usage_AppliedChannelingState`
- `Usage_BarShapeshiftedCharacters`
- `Usage_BarrAdvancedStartCharacters`
- `Usage_BarredAccountPropertyArray`
- `Usage_BarringAlignment`
- `Usage_BarringEquivalenceClass`
- `Usage_BarringTrait`
- `Usage_BarringTrait_Array`
- `Usage_CancelsSafeMode`
- `Usage_DestroyOnUse`
- `Usage_HousingPermission_OwnerOnlyRequirement`
- `Usage_InventoryRequired`
- `Usage_IsQuestItem`
- `Usage_KeyFitsLock_String_Override`
- `Usage_KeyID`
- `Usage_LayerArray`
- `Usage_LockOnClose`
- `Usage_LockOnUse`
- `Usage_Lockable`
- `Usage_Locked`
- `Usage_MinUsageDist`
- `Usage_MinUsageDist_Shadow`
- `Usage_MoveToTarget`
- `Usage_MustMeetAreaChallengeLevel`
- `Usage_OpenOnUnlock`
- `Usage_Permission`
- `Usage_PlayerCanUse`
- `Usage_PlayersCanClose`
- `Usage_PlayersCanOpen`
- `Usage_RequiredAccountToken`
- `Usage_RequiredChannelingState`
- `Usage_RequiredCraftProficiencyLocked`
- `Usage_RequiredCraftTool`
- `Usage_RequiredGenus`
- `Usage_RequiredHobby`
- `Usage_RequiredNeighborRelationship`
- `Usage_RequiredNeighborRelationship_DataID`
- `Usage_RequiredNeighborRelationship_Relationship`
- `Usage_RequiredQuestStatus_Take`
- `Usage_RequiredQuest_Take`
- `Usage_RequiredTrait_OrList`
- `Usage_RequiresExpansionPack1_Legacy`
- `Usage_RequiresExpansionPack2_Legacy`
- `Usage_RequiresFacing`
- `Usage_RequiresSubscriber`
- `Usage_ReserveUntilUseCompletes`
- `Usage_RestrictedEffect`
- `Usage_SessionPlayerCanUse`
- `Usage_ShouldApplyEffectsToTarget`
- `Usage_Sound`
- `Usage_TakePermission`
- `Usage_TargetType`
- `Usage_UsageAction_OpenWebStore_WebStoreCategory`
- `Usage_UsageAction_OpenWebStore_WebStoreItemDID`
- `Usage_UsageInterval`
- `Usage_UseWhenCollided`
- `Usage_UseWhileMoving`
- `Usage_UserBehaviorName`
- `Usage_ValidTargetTypes`
- `Usage_WorldEvent_AllConditionList`
- `Usage_WorldEvent_AnyConditionList`
- `VO@NPC.m_eDemeanor`
- `VO@NPC.m_eRace`
- `Vital_HealthThresholdPolicySingleton`
- `Vital_HealthThresholdPolicySingleton_Cached`
- `Vital_MountEnduranceThresholdPolicySingleton`
- `Vital_MountEnduranceThresholdPolicySingleton_Cached`
- `Vital_MountPowerThresholdPolicySingleton`
- `Vital_MountPowerThresholdPolicySingleton_Cached`
- `Vital_PowerThresholdPolicySingleton`
- `Vital_PowerThresholdPolicySingleton_Cached`
- `WebStore_FilteringAttribute`
- `WorldEventGenerator_ResponseCallback`
- `WorldEventGenerator_ResponseMap_Array`
- `WorldEventGenerator_WorldEvent`
- `WorldEvent_AllConditionList`
- `WorldEvent_AnyConditionList`
- `WorldEvent_MapNoteStateArray`
- `WorldEvent_WorldEventItem`
- `WorldPropertyBox_WorldEvent`
- `block_x`
- `block_y`
- `condition_index`
- `local_x`
- `local_y`
- `local_z`
- `objective_index`
- `opaque_type`
- `target_id`

Full context, classes and hashes: `lotro-datenraum-codebelege.json`.
