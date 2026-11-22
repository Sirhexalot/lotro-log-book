# LOTRO game data: data space, properties and relations

**Audit assignment:** 17.11.2026. **Status:** ongoing, source-based audit.

### Executed run

The structure auditor ran through successfully: 1,141 XML files,
2,785 file-related XML element paths and 84,761 DAT raw records from five
sources. The separate reference check examined 210,908 reference occurrences across
25 rules; 991 occurrences (613 different quest giver IDs) are missing in the
checked `NPCs.xml` target set. They are **not automatically invalid**:
further object types and the specialised NPC/placement exports must be
checked as possible target sets.

A prerequisite reference first checked only against quests or only against deeds
produced apparent gaps. The renewed check against
the shared quest/deed ID space resolves all 13,129 checked
prerequisite references. That proves the target resolution, not the complete
semantics of every prerequisite.

This documentation distinguishes explicitly between fully captured
field occurrences of a concrete data set and fully decrypted
game semantics. The latter is not proven for all
DAT classes with the existing exports. This document therefore claims no complete
decryption of the entire game.

## Reading and scope

- [All Companion XML properties per entity and substructure](lotro-datenraum-xml-properties.md)
- [All observed DAT property paths per class and export](lotro-datenraum-dat-properties.md)
- [Reference checks and resolvable targets](lotro-datenraum-relationen.md)
- [Deepening: 61 further reference checks and quest givers](lotro-datenraum-vertiefung.md)
- [Deepening evidence with open IDs and source hashes](lotro-datenraum-vertiefung.json)
- [Compacted exports: all field paths and comparisons](lotro-datenraum-exportvergleich.md)
- [Field deviations and open export references, machine-readable](lotro-datenraum-exportvergleich.json)
- [Character references, decoder classes and open map links](lotro-datenraum-charakterreferenz.md)
- [Individual evidence on character references and map links](lotro-datenraum-charakterreferenz.json)
- [Semantic data contract: meaning, units, logic and losses](lotro-datenraum-semantik.md)
- [Barter, containers, disenchanting and a slim item set: model for three open references](tausch-behaelter-zerlegung.md)
- [Concrete property reads in 27 extractor files](lotro-datenraum-semantik-leseindex.md)
- [Semantics evidence: source hashes and complete finding lists](lotro-datenraum-semantik-pruefung.json)
- [Unresolved references, machine-readable](lotro-datenraum-relationen.json)
- [Actually read sources with SHA-256](lotro-datenraum-quellen.md)
- [Run scope and counters](lotro-datenraum-lauf.json)
- [Reproducible read-only auditor](lotro_datenraum_audit.py)

The appendices belong to the documentation. Tables with all attributes are
available not only for selected samples but for every actually observed
element path in the read state. Nested structures
are not output as separate game objects just because they have XML tags.
Language labels and enums are separate reference sets.

## 1. Validation rules

1. **Structure proof:** field name, container, type and occurrence in the complete
   read set. No meaning derived from a field name alone.
2. **Meaning proof:** explicit evaluation in the exporter/decoder, linked with
   source data. A website fallback is not an additional game rule.
3. **Reference proof:** named source field, explicit target type and exact
   ID match. An identical display name is not enough.
4. **Limits:** A value that is not present means neither 0 nor false.
   A missing target ID initially means only "not found in this target set".
5. **Cardinality:** Observed multiple occurrences are no guarantee of
   general minimum/maximum cardinality.
6. **Currency:** A read client/lore state does not prove today's
   server availability or a character's unlock.
7. **Rights:** Source access and library permission are no blanket
   permission to pass on game texts, images or third-party code.

Unexplained DAT fields stay visible in the structure inventory with their unchanged
technical name. Their meaning is not output as valid domain information.
That way unknown properties do not silently disappear from "all properties".

## 2. Sources and their limits

### DAT raw data

Root: `~/Documents/07_Hobbys/Lotro/Companion-Test/source-exporter/`.
The folder named `full-dat-en-de-fr-2026-11-03` comprises selected
quest/deed/geography/control classes, not all classes of the game.

**Important origin correction:** `NOTE-2026-11-03.md` confirms that only
`quests.json` and `deeds.json` were read again on 03.11. Positions,
areas and further files were taken over from the state of 01.11. The
folder date is therefore not a uniform export time. The existing
manifest still carries a creation time of 01.11. The raw appendix
marks its actual source file; `raw.jsonl` must not automatically be called
the newest text state.

Additional sets: NPCs, placed entities, DID positions, reputation/crafting,
rewards, recipes, items, sets and specialised instance exports.
Missing raw data of a class is not replaced by a compact website export
as an allegedly complete raw definition.

### Companion

Active lore:
`~/Applications/LOTRO-Companion-Test/LotRO Companion/app/data/lore/`.
The earlier Compendium tools copy under `Companion-Test` is an additional
historical comparison state, not automatically the complete current set.
In particular `items.xml` lies in the active lore.

The XML attributes are stored Companion fields. They are not one to
one identical with DAT property names. An XML evaluation proves no
independent second data origin if it uses the same DAT decoder.

### Website and plugin

Generators and view models document transformations, filters and losses.
They are no complete substitute for raw data. Plugin and website remain
separate; character progress is not read or published.

In particular `Data/Progress.lua`, PluginData, accounts and character exports are
not part of this audit.

### LOTROInterface: Compendium and Item Scanner

- Compendium: <https://www.lotrointerface.com/downloads/info526-LOTROCompendium.html>
- Item Scanner: <https://www.lotrointerface.com/downloads/info699.html>
- Scanner archive: <https://www.lotrointerface.com/downloads/download.php?id=699>

The scanner source code of **version 1.2** was checked, in particular
`Compendium/Extensions/ItemBrowseControl.lua`, functions
`BuildDiscoveryDatabase`, `ImportScanData`, `persist`, `LoadItems`.
No plugin was installed or run in the game.

## 3. Identities and ID spaces

- DAT source objects: eight-digit hex ID in the exports; referencing
  properties can contain the same number in decimal.
- Companion: many object IDs in decimal. A conversion must preserve the 32-bit
  value; language is not part of the game identity.
- Map ID, map image ID, world region code, geographical area ID,
  marker ID and placed object DID are separate identities.
- Profession/enum keys are not blanket DAT object IDs.
- Localisation: object ID plus property path or label key
  and language. An equal number of language keys proves no complete translation.
- An object can have several placements and several roles.
  Quest giver, vendor and barter vendor are roles, not necessarily
  different NPC identities.

## 4. Domain entities and proven relations

For **all** properties of the sets named here, the complete
path tables in the XML/DAT appendix apply. This section explains exclusively the
source-based connections and transformation limits.

### Quest and deed

DAT class 1398 contains both. `Quest_IsAccomplishment` is evaluated for the separation;
do not derive it from the name. Name, description, objective structure,
prerequisites, rewards and flags are separate fields.

Proven reference paths:

- `Quest_QuestTreasureDID` → reward table.
- `Quest_NextQuest` → further quest; do not understand as a linear chain unchecked.
- `Quest_PrecludedQuest` → excluding quest reference.
- `Quest_BestowalRoles` → bestowal role structure, not merely a giver name.
- `Quest_ObjectiveArray` → objectives and conditions with their own indices.
- `Quest_PositiveFaction` / `Quest_NegativeFaction` → faction reference.
- `QuestArc_Quest_Array` → members of a quest series (class 2119).

Prerequisites must be preserved with their logic (AND/OR, status, negation).
A flat ID list does not replace a condition structure.
`Quest_IsHidden`, missing LOTRO points or a missing journal entry
prove no general unplayability.

Companion stores under `quests.xml`/`deeds.xml` among other things prerequisites,
objective conditions, rewards and map references. The complete
sub-elements are in the appendix, path by path. The website additionally uses
shortened keys (`i`, `v`, `vo`, `vl`, `vb`, `rw`, `fk` etc.); these
are output format, not original DAT properties.

### Objective, condition and objective position

Objectives and conditions are embedded structures with their own order.
Objective/condition index belong to the identity of a progress counter.
Reference types distinguish among others NPC, object, item, landmark,
skill, faction and other quests/deeds.

`locations.json` contains assignment to the quest/deed, objective ID,
objective/condition indices and spatial context. Positions do not consist only
of longitude/latitude: region, instance/layer, cell/block and local XYZ must
not be lost through a mere coordinate comparison.
Finite coordinates are no proof of a correct map.

### Reward table

`export_rewards.py`, function `export`, proves:

- `QuestTreasure_FixedItemArray` and `SelectableItemArray` →
  items with `QuestTreasure_Item` and `ItemQuantity`.
- `FixedTitleArray` / `SelectableTitleArray` → titles.
- `FixedTraitArray` → traits.
- `FixedEmoteArray` / `SelectableEmoteArray` → emotes.
- `FixedVirtueArray` → virtue reference and original increment field.

**Loss in the compact export:** fixed and selectable titles are merged
in `titles`; this separation is lost for emotes as well. The compact
reward export is therefore not sufficient for a complete relation typing. The IDs are present in the specialised export, even if
later web/plugin reward rows partly do not pass them on.

An unchecked virtue increment/XP tier number is not reinterpreted as virtue XP.
Billing tokens remain content/billing references, not an equivalent
item reward.

### Item

Complete stored Companion structure: `items.xml`; additionally
enums, `stats.xml`, `progressions.xml`, `sets.xml`, container, loot and
recipe sets.

`export_items.py` uses:

- DAT: `Name`, `Description`, `Item_Level`, `Usage_MinLevel`, `Usage_MaxLevel`,
  `ItemMunging_MinMungeLevel`, `ItemMunging_MaxMungeLevel`, `Item_Quality`,
  icon layers, `Mod_Array`, `Item_Armor_Value`, `Combat_WeaponSpeed`,
  `Inventory_BindOnAcquire`, `Inventory_BindOnEquip`, `Inventory_Unique`.
- Companion metadata: category, slot, armour/weapon/damage type,
  class/profession prerequisite, level, scaling, DPS and damage.

**Important boundary:** The export actually selects its IDs via
`sorted(items_meta)` from `items.xml` and checks their existence in the DAT
inventory. Its title "every item" proves no completeness of all item DAT classes.
That is precisely the area where scanner IDs can show additional gaps.

Further transformation losses:

- Binding is reduced to 0/1/2; full account binding does not follow from it.
- `sets_by_item[item] = set_id` holds only the last assigned set value;
  a possible multiple membership is lost.
- Non-present numeric values become 0 in places. That 0 is then
  an export fallback, not a secured original game value.
- Minimum level can be supplemented from other fields; original
  `Usage_MinLevel` and derived `ml` must stay documented separately.
- Stats are derived via progression curves and rounding. Not every
  item class/scaling is thereby fully explained.
- `ITEM` is a broad category. Client `class`/`equipmentCategory`
  remain separate axes; do not automatically call it "other".

### Item Scanner: exact stored model

A scanner record can contain `id`, `name`, `cat`, `qual`, `level`.
`id` is stored numerically and converted to hex for the shortcut display.
Automatically read are optionally `GetName()`, `GetCategory()`, `GetQuality()`
via `GetShortcut():GetItem():GetItemInfo()`.

`level` is taken over manually from a text field in `LoadItems`.
Name, category and quality are editable as well. A stored file
does not mark their automatic/manual origin per field.
It must therefore not be taken as an unchanged client statement across the board.

Scan configuration: `min`, `max`, `itemid`, `discovereddb`, `loaddetails`,
`skipknownitems`. Account-wide storage under `CompendiumItemScanner`.
That is scanner state, not an item property set.

The scan tries shortcut types `Hobby`, `Skill`, `Item` and records a
successfully recognised item shortcut. It is neither an inventory scan of the
character nor an availability/ownership proof. The fixed historical
default ID range guarantees no complete coverage today.

No equipment properties, recipe, vendor, loot, quest or
set relations are thereby fully exported. The website description
contains older sections and newer 1.2 changes; the checked code proves
the automatic name/category/quality function.

### Recipe, profession, tier and ingredient

DAT class 1024; `export_recipes.py` proves:

- `CraftRecipe_ResultItem` and `ResultItemQuantity` → regular result.
- `CraftRecipe_CriticalResultItem` and quantity → critical result.
- `CraftRecipe_Profession` → profession.
- `CraftRecipe_Tier` → tier code, `CraftRecipe_UICategory` → category.
- `IngredientList` / `OptionalIngredientList` → ingredients with quantities;
  optional ingredients additionally `IngredientCritBonus`.
- `CriticalSuccessChance`, `ExecutionTime` remain separate measurements.

A recipe is not the same record as a learnable recipe item.
`scrollItem`/recipe ID and produced item type must not coincide.
The compact export discards recipes without a resolved result or without
resolved ingredients. Quantity default 1 is generator logic in several places.

`crafting.xml` contains profession, profession tier, mastery/skill and
historical profession guilds. That guilds are stored does not prove their
unchanged current game mechanics.

### NPC, creature, quest giver, vendor and barter vendor

Sets: `NPCs.xml`, `mobs.xml`, `vendors.xml`, `barters.xml`,
placed DAT entities and DID positions.

NPC ID and placement ID are different. An NPC can have many locations.
A vendor references sale lists; barter vendors carry profiles and
barter entries with cost/receipt/quantity as well as possible prerequisites.
Loot and reputation references of creatures are separate relations, not positions.

Quest giver names without a unique ID create no certain NPC link.
The grouping of identical names is no identity merge.
Hunting hints from creature placements are no exact deed objective positions.

### Map, map image and map link

**A map is a separate entity.** It is not the same as a
geographical area or a website navigation node.

- `parchmentMaps.xml`: map ID, name, region code, parent map,
  quest guide information and assigned area references.
- `maps/maps/maps.xml`: map ID, `imageId`, geographical factor,
  min/max limits and further substructures captured in the appendix.
- `maps/links.xml`: source ID, target ID, link position and
  actually present additional attributes.

**Re-check of the complete link set:** 2,557 links. The 2,557
`parentId` occurrences distribute over 1,152 map references resolvable in `maps.xml`
and 1,405 references to 266 geographical areas.
All source IDs resolve in this union. Of 2,557 target references
two are missing in the checked map set: `268448107` and `268449764`.
They are therefore unexplained, not invalid across the board. The `parentId` of any
link is in particular no proof of a map parent relation.
- `maps/labels/<Sprache>/basemaps.xml`: language-dependent map name.
- Markers have their own IDs and category/DID/position references.

Two maps can use the same image and have different frames.
A navigation link is not automatically a geographical containment relation.
Region codes are not map IDs.

### Map name, map assignment and website navigation

A map name is display text, not an identity. `kartenname()` derives it in a
fixed order: language label of the map, common prefix of the child maps,
English name via map labels and area names, finally a technical
substitute name. If a caption is missing in the client, the map has
assigned areas in `parchmentMaps.xml` nonetheless. Their names are the reliable
naming source (`gebietsnamen()` from the own DAT export). They need
the same cleanup as item names, because individual area names carry
client escapes such as `\q` (8 of 1,610).

On 20.11.2026, 17 maps carry no name. They produce per language 193
quest and 52 deed labels as well as 17 of the 216 entries of the map navigation,
all in the form `Karte <ID>`. A technical substitute name is a
data deficiency, not a game label. The number is measured via
`daten/quests-<sprache>.json`, `daten/taten-<sprache>.json` and
`web/gebiete-<sprache>.js`.

The website navigation (region → landscape → sub-map) is a projection
from the labels `f` and the map IDs `fk`. It is not a geography tree:
`geoAreas.xml` leads region → territory → area, `parchmentMaps.xml` assigns
maps to areas. Comparison on 21.11.2026: 6 regions, 64 landscapes and
152 sub-maps on our side against 7 regions, 86 territories and 679 areas in
`geoAreas.xml`. 30 landscapes carry exactly one territory name, 6 form
an area, 34 carry their own map names; 19 territories distribute over
several landscapes.

The region assignment comes from `f[0]`, not from the map region code.
Therefore a map can sit in a different website region than its code
suggests (Morannon: code 3, content Das Ödland). The region level of
`geoAreas.xml` is not suitable as a display structure: Rohan, Gondor and Mordor
hang under Rhovanion there, two regions remain empty. The reliable
comparison level is the territory.

The same area values also feed the filter "region and area" for quests
and deeds. A map renaming can therefore rename or merge filter options below the
region level. As long as `f[0]` and the
region assignment are not changed, the six region groups and
their totals stay stable; area counters can distribute over new options through the
consolidation. The counters are to be checked per quest/deed index from the
built records, not derived from the map navigation.
On 21.11.2026 the six Helm's Deep variants for quests were merged under
„Helms Klamm“ (43 quest option hits); the deed filter has
85 hits for the region Rohan and no deeds on these maps. The
region totals and separate area options are in the
acceptance note `docs/archiv/kartenbenennung-hierarchie.md`.

**Correction against simplified earlier statements:** `GameMaps.attribute`
assigns positions by frame, depth and distance to the centre; with
overlapping maps that is a selection rule. `_fit_overviews` computes
overview frames by linear fitting. Such derived values are
not output as original, exactly validated DAT limits.
MoorMap is used only for optional plugin map numbers, not as an
authoritative geometry source.

### Geographical region, territory, area and dungeon

In the baseline DAT, classes 180, 692, 690 and 691 are separate.
`Area_RegionID`, `Area_Region`, `Area_Territory`, `Dungeon_ParentDungeon`
are different properties. `geoAreas.xml` maps geographical
hierarchies; `dungeons.xml` can contain positions and basemap references.

An area needs no map of its own; a map can have several
navigation paths. A map ID does not imply a unique
position of an area node in the website tree.

For the comparison of the website hierarchy the following applies: territory is the
comparison level, not the region. A landscape without a territory reference and
a name of the form `Karte <ID>` are check findings, not game labels.

### Landmark and resource occurrence

Landmarks: DAT class 1210 and `landmarks.xml`; positions separately via DID.
Quest/deed conditions can reference landmarks by ID.

Crafting resource occurrences: `resources.xml` and map markers; profession/tier/item and
possible find spots are separate references. A possible placement is
no assurance of the currently present resource, its quantity or
regrowth time.

### Instance template and instance finder

Templates: classes 1368/2651, `privateEncounters.xml`.
Finder selection: `WorldJoinControl` class 2606 (`7001B7CE`),
`WorldJoin_AvailablePETemplates_Array` and `WorldJoinControl_InstanceGroups`.
`Skirmish_Template_GroupSizeArray`, min/max LevelScale and
DifficultyTierArray are the sources for configured sizes/levels/
difficulties, not quest level or name prefix.

Template, selectable finder entry, encounter group, content layer and
opening quest are separate terms. Template membership alone
proves no active finder availability.

### Faction, title, virtue, trait, skill and emote

Each has its own sets with own IDs/keys; all properties in
`factions.xml`, `titles.xml`, `virtues.xml`, `traits.xml`, `skills.xml`,
`emotes.xml` including substructures captured.

Faction levels are not to be equated with exactly known personal reputation points.
Traits can reference effects/skills; virtues
use stats/scalings. A reward name without an ID is no reliable join.

### Travel

`travelNPCs.xml`: NPC, node reference, discovery condition and position.
`travels.xml`: nodes, destinations, routes, route actions, prices, minimum level,
quest/faction conditions, mode and swift flag.
`skills.xml` contains travel skills as their own substructure.

A route is a directed connection; price 0 can be proven. Route
actions and delay are not automatically the entire riding duration. The
merging of equally positioned nodes is a project transformation.
Invent no duration, kilometres or character unlocks from it.

### Further fully structurally captured Companion sets

The inventory also comprises effects and effect subtypes, action tables,
loot tables and subtables, containers, stats, progressions,
value tables, classes, races, origin, collections, allegiances,
world events, housing, hobbies, legendary systems, traceries, relics,
disenchantment, reward tracks and technical reference lists.

For these sets, field paths and stored nestings are
fully listed. The complete semantics of all effect operators,
loot codes and dynamic prerequisites is thereby **not** confirmed.
In particular `dropFrequency`, weight, selection count and probability
are not interchangeable terms.

## 5. Existing TODOs and contradictions

- `docs/todos/entitaeten-verlinkung.md`: The earlier URL audit checks the
  reachability of built URLs. It does not prove all raw data relations.
  "No IDs" there refers to certain compacted output rows,
  not generally to title/trait/emote source records.
- `docs/todos/kartenreiter-aufgaben.md`: Several navigation nodes with
  the same map ID are concrete proof that map and tree node
  need separate identities.
- `docs/todos/aufgaben-navigation.md`: topic/class/origin and geographical
  navigation are different selection axes; do not declare UI groups as new
  game objects.
- `docs/todos/SEO.md`: covers loading behaviour, no additional
  game relations. Shortened initial data is not the complete catalogue.
- `docs/archiv/dat-auswertung-2026-11-06.md`: dated investigation state,
  including then open points. Do not adopt unchecked as current
  field/availability proof.
- `docs/fachbereiche/instanzenfinder-dat.md` replaces the older name prefix/quest level
  derivation for the finder presentation.

## 6. Completeness proofs not yet concluded

### Derived quality priorities

The audit-based consequences and concrete acceptance criteria are in
[`todo-qualitaetsverbesserung.md`](todo-qualitaetsverbesserung.md). In short:

1. Preserve account/character binding and recipe variants losslessly.
2. Treat missing, explicit null, failed resolution and computed values
   separately.
3. Evaluate relations and quest conditions only in the proven structure.
4. Safeguard source → export → page model with regressions.

That is a prioritised working basis, not an approval already granted
for implementation, data rebuild or publication.

### Fifth review step: actual meaning and information losses

The separate [semantic data contract](lotro-datenraum-semantik.md) explains
on concrete code paths:

- AND/OR joining, comparison operators and status coding of
  quest/deed prerequisites; removal of unresolved prerequisites
  and the hiding content special case in the extractor.
- Binding decision, stack limits, item/usage/scaling levels,
  durability, granted skills/traits and context-dependent XP.
- Recipe variants, critical chance as a fraction versus percentage integer,
  XP/cooldown keys instead of direct quantities and seconds values.
- Item/loot profile union, filters, quantity defaults and separate weights/
  DropFrequency codes; decoder fallback 0 on missing lookup.
- Barter direction based on the array order, quantity-determining
  lookup curves and explicitly incomplete extractor conditions.

Concrete losses: 38,514 account bindings are not distinguished in the compact field `b`;
2,480 recipes have several result versions;
756 recipes contain variants in which normal/critical results
only become distinguishable via their level. 4,557 base chances were
compared unit-correctly without deviation.

The 314 captured property accesses from 27 targeted source files are
no blanket semantics proof for all 285 property names occurring there.
The wider source index was interrupted by an iCloud read timeout
and does not count as a successful complete run.

Review conclusion of this partial step: eleven audit regression tests passed;
all 17 relative documentation links in the main document point to existing
files. No website, plugin, client or character file changed.

### Fourth review step: classes, character references and map gaps

23 further rules, 5,411 reference occurrences: after correcting the concrete
target spaces all values are resolvable. The checks covered race/origin,
allowed classes, race/class traits, class skills and trait trees,
origin titles, virtue curves/effects, allegiances, collection titles,
crafting titles/recipes/guilds and faction tier deeds.

Two relevant schema properties:

- `allegiance/@advancementProgressionID` references in the checked XML
  `allegiances.xml/curve/@id`, not `progressions.xml`.
  All seven references resolve there. The same technical
  naming "progression" does not mean the same table set.
- `faction/level/@deedKey` contains both symbolic deed keys and
  decimal deed IDs. The original pure key join left 162 values
  open; the union of deed key and deed ID resolves all 358 values.
  The source field must not be converted into a single numeric or
  symbolic representation across the board.

The meaning of the previously only numerically handled quest giver classes was
checked against the decoder library in use:
`classes.xml` inside `delta-lotro-dat-utils-11.13.jar` names
796 = `IItem`, 1723 = `MonsterTemplate`, 1724 = `NPCTemplate`.
`javap -constants` additionally confirms MOB=1723 and NPC=1724.
The NPC extractor accepts only `WStateClass.NPC`. Its limited
target set thus does not explain the entire role spectrum of quest givers.
A MonsterTemplate is not a hostile opponent by class membership alone;
an IItem is not a carryable inventory item either.

The two open map link targets `268448107` and `268449764` also have
no hits in the checked map labels DE/EN/FR. Both incoming links
have `parentId=268451272` and `contentLayerId=0`, but different
`from` positions. Without target geometry and identity proof no
map entities or limits are added. The link records are preserved.

### Third review step: compacted exports

The successful comparison captured the complete stored
item, set, recipe, recipe source and reward structures. The extended
repetition run is also concluded: 24 coverage/reference rules
with 466,178 reference occurrences and 666,741 field comparisons across nine field pairs.
The rules also cover opposite directions, so they are not a count
of different game relations. Reproduction:
`python3 lotro_datenraum_exportvergleich.py`.

Proven in the first successful run:

- 152,088 item export IDs exist in the Companion set of 152,100 items.
  The twelve not exported IDs all have an empty name there.
  From that it does not automatically follow at which point of the historical
  DAT processing they dropped out.
- Nine explicitly compared item field pairs agree for all values present on
  both sides in each case: quality, level, category,
  slot, armour type, weapon type, damage type, class and profession prerequisite.
  The differing denominators are preserved in the appendix. This is no
  confirmation of the uncompared defaults, stats or minimum levels.
- All 2,223 set export IDs, 11,159 set member references and output
  item set references are resolvable. In the checked Companion set
  **no actual multiple set memberships** and no contradicting
  item set assignments were found. The scalar export would be structurally
  lossy for that, but this concrete state shows no such loss.
- Regular and critical recipe results as well as regular and optional
  recipe ingredients are resolvable in the complete item export.
- 44 different stat references in the reward rows compacted as `virtues`
  are missing in the virtue name catalogue there. **All 44**
  carry the stats labels "Skirmish Test Rank" (EN/FR) and "Testrang für
  Scharmützel" (DE). They must not be treated as regular virtues on the basis of the
  export field name alone. Evidence for each ID in the JSON appendix.
- Six recipe source keys are missing in the recipe export. `700777B8` exists
  in the Companion recipe set; `70076B49`, `70076B4A`, `70076B3C`,
  `7007764C` and `70076B52` are missing there as well. This set deviation
  does not yet explain their historical cause.

A missing compact reward key is no proof of a missing
DAT table: the exporter filters tables by its supported
reward types. In the checked set that affects 3,812 quest and
1,082 deed reference occurrences. Without the associated raw tables a
conclusive classification of each case is not proven.

### Second review run

Reproduction: `python3 lotro_datenraum_vertiefung.py`. Five automatic
regression tests for JSON/XML path building, reference counters, nested
relic targets and the separation of inventory/decoding proof passed:
`python3 test_lotro_datenraum_audit.py`. These are audit tool tests,
not complete domain game tests.

61 additional rules capture 416,636 reference occurrences. Of those,
415,366 are resolvable against the explicitly named target sets;
1,270 occurrences remain open in these target sets:

- `npcTalk`: 1,222 occurrences in quests (507 different IDs) and
  31 in deeds (eight different IDs). All of these different IDs
  belong to class 1723 according to the DAT inventory. The field `npcId` therefore
  proves no membership in `NPCs.xml` on its own.
- Two instance templates reference quest IDs that are missing in the checked
  Companion quest/deed lists but have class 1398 in the DAT inventory:
  `1879443606` and `1879407580`.
- 13 deed objective conditions reference the same ID `1879049597` missing in the Companion target set;
  it also exists in the DAT inventory class 1398.
- Two map link targets are missing in the checked map set (see above).

**Re-check against the normalised DAT export:** All three quest IDs mentioned last
are actually present in
`full-dat-en-de-fr-2026-11-03/quests.json`, class 1398:
`1879443606` = `70060896`, `1879407580` = `70057BDC`,
`1879049597` = `7000057D`. Thus the two instance references and
13 deed objective references resolve against this DAT set. The numbers in the
Companion reference report remain correctly preserved as the check of exactly that target set;
they must not be read as unresolved references across all sources. Individual evidence and hashes:
`lotro-datenraum-aufgabenluecken.json`; reproducible with
`python3 lotro_datenraum_aufgabenluecken.py`.

For the originally 613 open quest giver IDs, 519 decoded
records were found: 323 class 796 and 196 class 1723. The remaining 94
are proven in the inventory as class 796 but not present in the checked specialised
raw files. The complete class semantics is not guessed from that.
The 613 IDs are not 613 proven broken game objects.

Additionally corrected target selection:

- Relics lie in `relics.xml` under categories; a join limited to root children
  was wrong. With `.//relic` all 469, 250
  respectively 391 checked reference occurrences from relic lists,
  relic groups and containers resolve.
- `treasureGroupProfileId` in trophy lists does not exclusively
  reference `itemsTable`. 7,503 occurrences initially not found there resolve
  against 103 `treasureList` IDs. Both target types remain separate.
- Vendor lists, barter costs/receipts, direct loot items,
  container lists, the checked skill/trait/effect/progression references
  and the 232 parchment map references are resolvable in the concretely checked
  target sets without open values.

The structure inventories apply only to actually read sources.
For the claim **all game entities, every property and every domain-valid
relation**, the following are still missing:

- Complete decoding of all DAT inventory classes, not only the
  previously supported/exported selection.
- Complete semantic proof of every nested property and
  every referencing field; names alone are not enough.
- Complete typed reference check across all loot/effect/skill/
  world event/condition subtypes and all ID spaces.
- Field-by-field comparison matrix DAT ↔ Companion ↔ normalised exports for
  all sets, including default/filter/rounding/localisation losses.
- Independent current client comparison of spatial projection and
  dynamic availability; no game test was carried out in this audit.
- Proof of translation meaning, not merely equal language keys.

These points are not marked as done. The present document is
a verifiable basis with complete observed structure paths,
but not yet a concluded semantic overall model of all LOTRO data.
