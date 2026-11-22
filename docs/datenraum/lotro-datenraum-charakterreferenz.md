# Character reference entities and decoder classes

## Class evidence from the DAT decoder in use

Source: `delta-lotro-dat-utils-11.13.jar`, internal resource `delta/games/lotro/dat/wlib/classes/io/classes.xml`. JAR SHA-256 in the JSON evidence. `javap -constants ... delta.games.lotro.dat.WStateClass` additionally confirms the constants MOB=1723 and NPC=1724.

| Class index | Decoder class name |
| --- | --- |
| 1723 | MonsterTemplate |
| 1724 | NPCTemplate |
| 796 | IItem |

This documents the quest giver targets that were previously described only by number more precisely: class 796 is called IItem in the decoder, class 1723 MonsterTemplate. A quest giver is therefore a role across several source object classes. That does not justify classifying every IItem as a wearable item or every MonsterTemplate as a hostile mob.

The NPC extractor `MainDatNPCsLoader.useId` accepts exclusively `WStateClass.NPC`. Its `load` reads name, OccupationTitle and effects; gender is derived from markup in the name. That is not an independent gender property from this exporter.

## Typed reference checks

Non-numeric IDs (class key, origin code, deed key) are explicitly checked against the correct target column. Zero hits mean no evidence; open values are not automatically invalid.

| Source | Target | Occurrences | Resolved | Open |
| --- | --- | --- | --- | --- |
| races.xml `.//nationality/@id` | ('nationalities.xml', './nationality', 'code') | 28 | 28 | 0 |
| races.xml `.//allowedClass/@id` | ('classes.xml', './class', 'key') | 69 | 69 | 0 |
| races.xml `.//raceTrait/@traitId` | ('traits.xml', './trait', 'identifier') | 74 | 74 | 0 |
| races.xml `.//earnableTrait/@traitId` | ('traits.xml', './trait', 'identifier') | 72 | 72 | 0 |
| classes.xml `.//classTrait/@traitId` | ('traits.xml', './trait', 'identifier') | 295 | 295 | 0 |
| classes.xml `.//classSkill/@skillId` | ('skills.xml', './*', 'identifier') | 551 | 551 | 0 |
| classes.xml `./class/@traitTreeID` | ('traitTrees.xml', './traitTree', 'id') | 12 | 12 | 0 |
| nationalities.xml `./nationality/@titleID` | ('titles.xml', './title', 'id') | 28 | 28 | 0 |
| virtues.xml `./virtue/@maxRankProgression` | ('progressions.xml', './*', 'identifier') | 21 | 21 | 0 |
| virtues.xml `./virtue/@passivesEffect` | ('effects.xml', './*', 'id') | 21 | 21 | 0 |
| virtues.xml `.//stat/@scaling` | ('progressions.xml', './*', 'identifier') | 64 | 64 | 0 |
| allegiances.xml `./allegiance/@advancementProgressionID` | ('allegiances.xml', './curve', 'id') | 7 | 7 | 0 |
| allegiances.xml `./allegiance/@travelSkillId` | ('skills.xml', './*', 'identifier') | 7 | 7 | 0 |
| allegiances.xml `.//deed/@id` | ('deeds.xml', './deed', 'id') | 210 | 210 | 0 |
| collections.xml `.//title/@id` | ('titles.xml', './title', 'id') | 27 | 27 | 0 |
| crafting.xml `.//mastery/@titleId` | ('titles.xml', './title', 'id') | 160 | 160 | 0 |
| crafting.xml `.//proficiency/@titleId` | ('titles.xml', './title', 'id') | 160 | 160 | 0 |
| crafting.xml `.//recipe/@id` | ('recipes.xml', './recipe', 'id') | 1733 | 1733 | 0 |
| crafting.xml `./profession/@guildFaction` | ('factions.xml', './*', 'id') | 7 | 7 | 0 |
| factions.xml `.//level/@deedKey` | Union of deed/@key and deed/@id | 358 | 358 | 0 |
| traitTrees.xml `.//cell/@traitId` | ('traits.xml', './trait', 'identifier') | 1201 | 1201 | 0 |
| traitTrees.xml `.//step/@traitId` | ('traits.xml', './trait', 'identifier') | 270 | 270 | 0 |
| traitTrees.xml `.//*[@mainTraitId]/@mainTraitId` | ('traits.xml', './trait', 'identifier') | 36 | 36 | 0 |

## Open map link targets

The two target IDs not found in the geometry set were additionally checked against the DE/EN/FR map labels. The actual hits and incoming link attributes are listed unchanged in the JSON. Missing geometry is not reconstructed from a name or a link position.

## Reproduction

`python3 lotro_datenraum_charakterreferenz.py`. All results and input hashes: `lotro-datenraum-charakterreferenz.json`.
