# Semantic data model – proven evaluation rules

Status as of 17.11.2026. Supplement to [Data space and field inventory](lotro-datenraum.md).

## Level of proof and scope

The following statements describe **evaluations actually implemented in the
read Companion extractor source state**, combined with the existing
XML/JSON values. They are no proof of an identical implementation in the
game server and no general availability promise.

Source root:
`~/Documents/07_Hobbys/Lotro/Companion-Test/dat-reader-investigation/src/main/java/delta/games/lotro/tools/extraction/`.
File names and line numbers below are relative to it.
Hashes of the specifically checked sources and quantitative cross-checks:
`lotro-datenraum-semantik-pruefung.json`. Reproduction:
`python3 lotro_datenraum_semantik_pruefen.py`.

**Important:** structure fully captured ≠ meaning fully clarified.
A getter/setter finding alone confirms neither unit nor default.
Unexplained properties in the inventory keep the status "meaning not
conclusively checked". They are not silently approved facts.

## 1. Quest/deed: prerequisites as an expression tree

Evidence: `achievables/QuestRequirementsLoader.java:84–138,224–296`,
`utils/OperatorUtils.java:16–24`.

### Boolean structure

- `Usage_QuestRequirements_OrList`: conditions are joined with **OR**.
- `Usage_QuestRequirements`: conditions are joined with **AND**.
- If both are present, the result is **AND(AND group, OR group)**.
  Not `ODER(AND-Gruppe, OR-Gruppe)` and not simply one shared list.
- Groups with one child are reduced to that child; empty groups
  become `null` in the extractor. That is cleanup of the output.
- `deepRequirementCleanup` can remove unresolvable achievable proxies.
  A prerequisite missing afterwards is therefore no proof that none existed in the
  raw record.

### Single condition

| Property | Meaning in this loader | Type/reference | Limit |
| --- | --- | --- | --- |
| `Usage_QuestID` | checked quest/deed | integer → achievable ID | shared ID space, not only quest catalogue |
| `Usage_QuestStatus` | required status code | integer | not automatically "completed" |
| `Usage_Operator` | comparison between status and requirement | integer code | unknown codes are discarded, not guessed |

Operators: 1 = ≥, 2 = ≠, 3 = =, 4 = <, 5 = ≤, 6 = >.
Other codes return `null` in the read helper.

Status handling:

| Code | Handling in the loader |
| --- | --- |
| `0x10000000` | UNDERWAY |
| `0x20000000` | FAILED |
| `0x30000000` | COMPLETED |
| `0x40000000`, `0x50000000` | comments name ABANDONED/TAPPED, but no separate complete handling |
| other codes with the `0x10000000` bit set | running objective; index from `status & 0x0FFFFFFF` |

The order of these checks is decisive. In particular the commented
TAPPED label is **not a fully supported status semantics**.
The fallback bit check follows after the exact first three comparisons.

### Special hiding

`HIDING_CONTENT_QUEST_ID=1879049597` (`7000057D`). The loader recognises a
prerequisite with this ID target and status COMPLETED as a hiding marker,
sets `achievable.hidden=true` and does not include the prerequisite in the
normal output list. That is concrete extractor behaviour, not a blanket rule
"hidden means unplayable".

## 2. Item: values, prerequisites and binding

Evidence: `items/MainDatItemsLoader.java:198–297,878–892`.

| Property | Evaluated meaning | Unit/target | Missing/transformation |
| --- | --- | --- | --- |
| `Icon_Layer_ImageDID` | foreground of the icon | image DID | composite icon, not an item ID |
| `Icon_Layer_BackgroundDID` | background | image DID | separate layer |
| `Icon_Layer_ShadowDID` | shadow | image DID | separate layer |
| `Icon_Layer_UnderlayDID` | underlay | image DID | separate layer |
| `Inventory_Unique` | unique flag | integer, exact comparison with 1 | missing becomes false in the loader |
| `Inventory_MaxQuantity` | maximum stack size | piece count | only values >1 are set explicitly |
| `Item_Level` | item level | level number | not minimum character level |
| `Usage_MinLevel` | lower usage level | character level | nullable |
| `Usage_MaxLevel` | upper usage level | character level | nullable |
| `Item_MaxStructurePoints` | maximum durability | structure points | no sturdiness enum |
| `Item_DurabilityEnum` | robustness/sturdiness category | enum | no durability number |
| `Item_Quality` | quality code | enum via `DatEnumsUtils.getQuality` | do not equate with Compendium `q` unchecked |
| `Description` | description | localised string | markup is removed |
| `ItemMunging_MinMungeLevel` | scaling limit in the munging context | level | can change the output item level |

### Binding is an evaluation of several flags

The actual priority in the Companion loader is:

1. `Inventory_BindOnAcquire == 1`:
   - additionally `Inventory_BindToAccount == 1` → account binding on acquire;
   - otherwise binding on acquire.
2. Otherwise `Inventory_BindOnEquip == 1` → binding on equip.
3. Otherwise `null`.

`null` is the extractor output without any of these recognised rules, not the
proof of all conceivable binding mechanisms.

**Quantitatively confirmed loss in the compact item export:**

| Companion binding | Compact `b` | Items |
| --- | --- | ---: |
| Bind on Acquire | 1 | 32,847 |
| Bound to Account on Acquire | 1 | 38,514 |
| Bind on Equip | 2 | 46,610 |
| Attribute missing | 0 | 34,117 |

The sum is 152,088 exported items. Account binding and character binding
are actually merged at `b=1`. A renderer cannot reconstruct this
difference from `b` alone.

### Scaling

With a present `Item_Level` and a lower item level than
`ItemMunging_MinMungeLevel`, the loader can set
`munging.getItemLevel(minScaledLevel)` for non-legendary items. The output level can
therefore be computed. A direct comparison against only `Item_Level` would not be
a complete semantics test for all item types.

## 3. Item: granted content and reputation

Evidence: `items/ItemDetailsLoader.java:86–231,234–300`.

| Property/structure | Proven evaluation | Relation/conditions |
| --- | --- | --- |
| `Item_GrantedSkill` | granted skill | skill ID; output only for a resolvable skill |
| `Mount_SkillToGrantShort` | granted riding skill for small figure | skill ID, own GrantType |
| `Mount_SkillToGrantTall` | granted riding skill for tall figure | skill ID, own GrantType |
| `Mount_SkillToGrantRaceArray` | several race-dependent grants | do not summarise scalarly |
| `Mount_SkillToGrant` | skill of the array entry | skill ID |
| `Usage_RequiredRaceEntry` | race of the entry | race code, not race DAT ID |
| `Item_GrantedTrait` | granted trait | trait ID |
| `RewardTrack_XPToAdd` | XP amount | in this handler only as item XP with ExperienceType=1 |
| `RewardTrack_ExperienceType` | kind of XP | no amount |
| `Reputation_IsReputationItem` | reputation item marker | processing only with exactly 1 |
| `Reputation_Faction` | faction of the reputation item | not 0 and resolvable in the registry |
| `Reputation_ReputationGain` | reputation amount, preferably used | long → integer output |
| `Reputation_ReputationLoss` | alternatively used reputation amount | code adopts the value, does not negate itself |
| `EffectGenerator_UsageEffectList` | usage effects | list of effect structures |
| `EffectGenerator_EffectID` | referenced effect | same effect ID processed only once in the handler |
| `EffectGenerator_EffectDataList` | additional effect data | property types decisive |

With reputation amount, if gain is missing but loss is not, the handler uses loss.
If both are missing, it initialises 0. That is no proof of an original
explicit null value. The sign convention of loss also does not follow
from the field name alone.

For some effect data types the source code contains explicitly only
comments such as "Skill Data ID?" or "Array of recipe IDs?". These are
**not** adopted as validated relations.

## 4. Recipe: version, result, ingredients and scaling

Evidence: `crafting/MainDatRecipesLoader.java:64–159,162–227,230–341`.

| Property | Meaning in the loader | Unit/target | Transformation |
| --- | --- | --- | --- |
| `CraftRecipe_UICategory` | UI category | CraftingUICategory enum | not a profession ID |
| `CraftRecipe_XPReward` | key in XP mapping | lookup key | no directly outputtable XP amount |
| `CraftRecipe_CooldownDuration` | key in cooldown mapping | duration type code | no direct seconds value |
| `CraftRecipe_OneTimeRecipe` | one-time recipe | integer=1 | other/missing values do not set the flag |
| `CraftRecipe_Profession` | profession | profession ID | `getProfessionById` |
| `CraftRecipe_Tier` | crafting tier | code/number | otherwise first value from TierArray |
| `CraftRecipe_TierArray` | alternative tier source | array | loader uses index 0 |
| `CraftRecipe_RequiredCraftGuild` | required guild | domain-wise faction ID per source comment | only guildRequired=true is output here for ≠0 |
| `CraftRecipe_ResultItem` | normal result | item ID | own result object |
| `CraftRecipe_ResultItemQuantity` | normal result quantity | piece | set only when the field is present |
| `CraftRecipe_CriticalResultItem` | critical result | item ID >0 | own result object |
| `CraftRecipe_CriticalResultItemQuantity` | critical quantity | piece | separate from normal quantity |
| `CraftRecipe_CriticalSuccessChance` | base chance | fraction in DAT/Python export | Java output `int(value*100)` |
| `CraftRecipe_IngredientList` | normal ingredients | list | own positions |
| `CraftRecipe_OptionalIngredientList` | optional ingredients | list | optional=true |
| `CraftRecipe_Ingredient` | ingredient ID | item ID | not recipe ID |
| `CraftRecipe_IngredientQuantity` | ingredient quantity | piece | not automatically a universal DAT default |
| `CraftRecipe_IngredientCritBonus` | bonus of an optional ingredient | fraction | Java output `int(value*100)` |
| `CraftRecipe_IngredientPack` | alternative ingredient pack | item ID | own IngredientPack |
| `CraftRecipe_IngredientPackQuantity` | pack quantity | piece | here explicitly default 1 |
| `CraftRecipe_MultiOutputArray` | additional recipe versions | array | normal version is cloned and overwritten |

### Critical chance

4,557 concrete comparisons between compact `ch` and the first
Companion `recipeResult/@baseCriticalChance`: all agree under
`int(ch*100)`. Example: 0.05 in the compact export corresponds to
5 in the Companion XML. That is no guarantee for every other
chance/weight property of the game.

### Multiple outputs are not a single result list

`handleRecipeOutput` clones the first version and can replace normal result,
critical result and first ingredient.
**2,480 Companion recipes have more than one `recipeResult`.**
A compact schema with only one `r`, `cr`, `i`, `o` per recipe cannot
represent these variants losslessly in general.

### Same item and same quantity does not mean same result

If normal and critical output have the same item ID and quantity,
Companion additionally checks `Item_iLevel_Crafting_Offset`:
normal item level = `Item_Level`,
critical item level = `Item_Level + Offset`.
Item ID and quantity alone are semantically not enough for result equality.
The number of actually such results is checked separately from the XML values,
not guessed from the code.

## 5. Cooldown

Evidence: `common/CooldownLoader.java:14–37`.

`CooldownControl_DurationMapList` contains entries from
`CooldownControl_DurationType` → `CooldownControl_DurationValue`.
The loader documents the value unit as **seconds**.
A recipe cooldown ID must first be resolved against this table.
The recipe loader transfers the float value via `intValue()`, which can lose
decimal places.

## 6. Loot: type union, weight and probability

Evidence: `loot/LootLoader.java:86–108,130–160,183–253,282–293`,
`loot/LootProbabilities.java:31–113`.

| Structure/property | Proven meaning |
| --- | --- |
| `LootGen_WeightedTreasureTable` | list of weighted trophy lists |
| `LootGen_WeightedTreasureTable_TrophyList_Weight` | integer weight of the entry, not a direct percentage |
| `LootGen_WeightedTreasureTable_TrophyList` | reference to trophy list |
| `LootGen_FilteredTreasureListArray` | filtered entries |
| `LootGen_FilteredTrophyTable_EntryDID` | target is loaded as TrophyList, otherwise WeightedTreasureTable |
| `EntityFilter_Array` | filter of the affected loot selection |
| `LootGen_TrophyList_ItemOrProfile` | item or group profile |
| `LootGen_TrophyList_ItemQuantity` | quantity of the direct item; here default 1 |
| `LootGen_TrophyList_GroupDrop` | group loot flag, exactly integer=1 |
| `LootGen_TrophyList_DropFrequency` | frequency code, is mapped to probability |

For group profiles `loadTreasureGroupProfile` first tries ItemsTable,
then TreasureList. The target union observed earlier is thus also proven in the
loader code.

### Frequency code → probability

**Correction of an earlier, too sweeping open point:** Companion has
a decoder path for the frequency codes:

`LootGenControl` →
`LootGenControl_DropFrequencyTable` →
`LootGenControl_DropFrequency_Label` and
`LootGenControl_DropFrequency_Percentage`.

Live mode reads this assignment from the data; the debug display
multiplies the value by 100. The code itself is still not a percentage.
The concrete current control table has not yet been checked against a fresh raw data set
in this audit, therefore no current
drop percentages are claimed here.

For another mode the code contains fixed historical SoA values.
These must **not** be adopted as general current LOTRO drop rates.
In addition, `getProbability` returns 0.0 for unknown codes after a warning:
an exported null value can be a decoder fallback rather than proven
impossibility.

A single probability of one table level is not automatically
the entire item drop chance of a creature; nesting, filters,
quantities and selection procedure are additionally required.

## 7. Vendors and barter vendors

Evidence: `trade/MainDatTradeLoader.java:107–217,219–350,353–404`.

### Roles and prerequisites

- `Barter_ProfileArray` contains barter profile IDs.
- `Barter_Profile_UseTabs` is read but not used further here.
  Derive no domain rule from it.
- Profile requirements can lie under `DefaultPermissionBlobStruct`.
- `Usage_RequiredClassList` contains class codes, not class DAT IDs.
- `Usage_RequiredFaction` contains `Usage_RequiredFaction_DataID` plus
  `Usage_RequiredFaction_Tier`. Those are faction and reputation level, not a
  reputation point amount.
- The simplified trade quest loader supports here only COMPLETED
  with operator 3 or a missing operator. With several conditions
  it overwrites `ret`; the output does not map all conditions.
  This restriction must not be transferred to the general quest loader.

### Barter positions

`Barter_ItemListArray` contains entries whose last element is evaluated as
**receipt** and whose preceding elements are evaluated as **cost**.
The order is semantically relevant.

| Property | Evaluation |
| --- | --- |
| `Barter_Item` | item ID |
| `Barter_ItemQuantity` | direct quantity |
| `Barter_ItemQuantity_LookupTable` | progression ID for computed quantity |
| `Barter_ItemUsesMinUsageLevelForCost` | determines use of minimum instead of item level |
| `Barter_ReputationFaction` | reputation target faction on reputation receipt |
| `Barter_ReputationRewardTier` | reputation reward tier, not a direct amount |

With a missing direct quantity the loader can evaluate a progression at the
level of the received item. It adopts the value via `intValue()`.
A barter quantity can therefore be computed.

`getAmountForTier` knows in the read code only tier 5 → 1200; all others
return 0. That is **not a fully validated general reputation tier formula**.
Such a null value is no proof of a deliberately reputation-less reward.

### Sale

- `Vendor_InventoryList` references sale lists.
- `Vendor_BuysItems == 1` becomes the buying flag; missing becomes false.
- `Vendor_DiscountList` contains separate discount references.
- Item base value, price factor, discount and the price actually to be paid
  are different quantities. An item sale reference alone does not supply
  a final purchase price.

## 8. Maps, geography and roles

The complete ID and geometry differences are in the main document.
Here the following semantic limits, already proven from sources, apply:

- Original map frame and subsequently fitted overview frame
  are different classes of origin.
- Link `parentId` can be map or geographical area.
- Map image ID is not a map identity.
- NPC/monster/IItem identity is not the same as the quest giver role.
- MonsterTemplate alone does not prove hostile behaviour.
- Region, layer and instance belong to the position context; the same
  coordinate pair does not prove the same world place.
- A marker of a possible resource placement does not prove a currently
  present object.

## 9. Remaining semantic scope – do not report as done

Not yet fully decrypted or independently cross-checked:

- All effect subtypes with operators, modifiers, triggers,
  target selection and scaling.
- Complete skill cost/damage/healing calculation including
  context, active effects, caps and character state.
- All quest/deed objective events, failure conditions, role and
  permission structures including unknown operators.
- Current LootGenControl table and total probabilities across
  nested filter/selection tables.
- All limits of the munging/legendary/tracery/set stat system.
- Complete current price, reputation, access and world event logic.
- Client verification of all space/layer/projection assumptions.
- DAT classes not exported or not implemented in the source tree.

The automatic code index is a search tool for this remaining scope,
not its semantic acceptance. A real completeness approval is
only justifiable when every single property and relation has either a
matching proof or an explicitly documented unexplained status and all claimed
evaluations have been checked against real data.
