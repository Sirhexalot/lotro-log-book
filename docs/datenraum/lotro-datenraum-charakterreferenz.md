# Charakterreferenz-Entitäten und Decoder-Klassen

## Klassenbelege des verwendeten DAT-Decoders

Quelle: `delta-lotro-dat-utils-11.13.jar`, interne Ressource `delta/games/lotro/dat/wlib/classes/io/classes.xml`. JAR-SHA-256 im JSON-Beleg. Zusätzlich bestätigt `javap -constants ... delta.games.lotro.dat.WStateClass` die Konstanten MOB=1723 und NPC=1724.

| Klassenindex | Decoder-Klassenname |
| --- | --- |
| 1723 | MonsterTemplate |
| 1724 | NPCTemplate |
| 796 | IItem |

Damit sind die zuvor numerisch dokumentierten Auftraggeberziele genauer belegt: Klasse 796 heißt im Decoder IItem, Klasse 1723 MonsterTemplate. Ein Auftraggeber ist somit eine Rolle über mehreren Quellobjektklassen. Das rechtfertigt keine Einstufung jedes IItem als tragbarer Gegenstand oder jedes MonsterTemplate als feindlicher Gegner.

Der NPC-Extractor `MainDatNPCsLoader.useId` akzeptiert ausschließlich `WStateClass.NPC`. Sein `load` liest Name, OccupationTitle und Effekte; Geschlecht wird aus Markup im Namen abgeleitet. Das ist keine unabhängige Geschlechts-Property aus diesem Exporter.

## Typisierte Referenzprüfungen

Nichtnumerische IDs (Klassen-Key, Herkunft-Code, Tat-Key) werden ausdrücklich gegen die richtige Zielspalte geprüft. Null Treffer heißt keine Evidenz; offene Werte sind nicht automatisch ungültig.

| Quelle | Ziel | Vorkommen | Aufgelöst | Offen |
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
| factions.xml `.//level/@deedKey` | Union deed/@key und deed/@id | 358 | 358 | 0 |
| traitTrees.xml `.//cell/@traitId` | ('traits.xml', './trait', 'identifier') | 1201 | 1201 | 0 |
| traitTrees.xml `.//step/@traitId` | ('traits.xml', './trait', 'identifier') | 270 | 270 | 0 |
| traitTrees.xml `.//*[@mainTraitId]/@mainTraitId` | ('traits.xml', './trait', 'identifier') | 36 | 36 | 0 |

## Offene Kartenlink-Ziele

Die zwei im Geometriebestand nicht gefundenen Ziel-IDs wurden zusätzlich gegen die Kartenlabels DE/EN/FR geprüft. Die tatsächlichen Treffer und eingehenden Linkattribute stehen unverändert im JSON. Fehlende Geometrie wird nicht aus einem Namen oder einer Linkposition rekonstruiert.

## Reproduktion

`python3 lotro_datenraum_charakterreferenz.py`. Alle Ergebnisse und Eingabehashes: `lotro-datenraum-charakterreferenz.json`.
