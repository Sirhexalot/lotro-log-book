# Instance finder: source check on 11.11.2026

The published 1.578 PrivateEncounterTemplates are no player-facing
instance catalogue. The selection of the instance finder is explicitly
defined in the client. For this check no lists, texts or images of foreign
websites were adopted.

## Directly proven sources

- `7001B7CE`, class 2606 `WorldJoinControl`:
  `WorldJoin_AvailablePETemplates_Array` contains 153 unique template IDs.
  `WorldJoinControl_InstanceGroups` additionally contains 14 variants of epic
  battles, grouped into eight named encounters.
- All 167 references are resolvable in the existing DAT template export.
- `WorldJoin_EncounterCategory` in the templates is the cluster key,
  not the landscape. `WorldJoin_EncounterType` is the client kind.
- Enum `WJEncounterCategory` (587203408) provides translated cluster names,
  `WJEncounterType` (587203337) the kinds and `WJInstanceGroup` (587203537)
  the group names of epic battles.
- `Skirmish_Template_GroupSizeArray`, `MinLevelScale`, `MaxLevelScale` and
  `DifficultyTierArray` provide group sizes, configured level range
  and difficulty tiers. Do not derive from quest levels or name prefixes.
- Additionally checked: `7003672A`, class 3787 `BigBattlesControl`, with
  `BigBattleControl_Quest_To_Encounter_Hash` (quests to battles).

## Counter-checks from the own client

- Feste Elendil und Glinghant: Annúminas, level 40–160, six players.
- Drachen-Trakt: Helegrod, level 50–160, 24 players.
- Iorbars Gipfel: Der Weg nach Erebor, level 20–160, three players.

The 153 regular selection references are distributed over 35 categories.
The client kind there is 131 times `Classic`, 21 times `Skirmish`, once `Team`;
these are internal names, not yet finished German UI texts.

## Reproducibility

With the existing `DatSourceReader.java` from the external source exporter
read class 2606 from `inventory.tsv` (DE/EN/FR). A fresh audit run
additionally read classes 2515, 2619 and 2727, altogether 186 records without
decoder errors. The game client and the external exporter were not changed.

`tools/InstanceFinderEnums.java` reads the enum texts directly from the DATs.
The IDs were identified on the basis of existing decoder/lore metadata;
their stored translation texts are **no** input of the export.

```bash
java --class-path "<DAT-decoder-lib>/*" tools/InstanceFinderEnums.java "<client>" > "<cache>/finder-enums.tsv"
python3 tools/export_instance_finder.py --control "<cache>/finder-raw.jsonl" --templates daten/instanzen-roh.jsonl --enums "<cache>/finder-enums.tsv" --output "<cache>/finder.json"
```

Check results lie locally in `~/.cache/llb-instance-research/`, not in the
repository. The JSON export preserves the original names, selection membership,
clusters, groups and settings; missing references/translations abort.

## Limits and integration

The selection reference proves neither the unlocking of a character nor
current server/season availability. Level overrides and access conditions
can influence the stored default values. The client also contains
test categories; do not show all enum values as active clusters.

The website now uses this selection stock: `finder.json` is stored on export
as `daten/instanzen-finder.json`, `tools/build_instanzen.py` connects
it with the raw templates and writes `daten/instanzen.json` (schema 2).
`tools/build_php_data.py` prepares three language-correct indices from it.
The 167 entries are grouped by clusters; epic battle variants and
independent wings remain recognisable. Filters: cluster, kind, level span,
group size, difficulty. The level filters check range overlap,
the player filters the explicit group size list, not only the maximum capacity.

For the UI the internal kind `Classic` is called instance, for
group sizes intended exclusively for at least twelve players raid.
Epic battles follow their explicit picker assignment,
skirmishes client type 3. This derivation is independent of the name prefix.
Missing categories are shown under „Ohne Cluster“ at the end.
No automatic links to possibly unpublished quests.

The build must run after the finder export in this order:
`tools/build_instanzen.py`, `tools/build_php_data.py`, `tools/build_release.py`.

## Texts and interior maps (check on 20.11.2026)

**Texts are completely present, but nowhere visible.** All 167
finder entries carry `PrivateEncounterTemplate_Description` in DE, EN and FR
(each around 50.000 German characters, median 276, longest 769 characters). The
instance finder, however, is a pure list (`php/templates/instances/list.twig`);
a detail page and thus a place for the text does not exist.

Equally unused: `PrivateEncounterTemplate_QuestToBestow_Array` (163 of the 167
entries, 552 quests). **All 552 quests stand in the own catalogue**
(`daten/quests-<sprache>.json`), so they are linkable without foreign data.
`PrivateEncounterTemplate_InstanceQuest` (main quest) have only 25 entries.
Via these quests 46 instances get a map place with coordinates
on a landscape map – the entrance, not the interior.

**Interior maps exist in the client.** Class 691 (Dungeon, 1.324 records) carries
`Dungeon_MapData`/`Dungeon_MiniMapData`; 1.319 different maps. The
resolution path is `Dungeon_MapData` → properties → `UI_Map_GameMap` →
`UI_Map_MapImage`; only this last value is the image ID in the space of the
basemap images (`0x41…`), which `dat/MapExport.java` fetches directly from the client.
A sample with four known IDs yielded real floor plans (Glinghant, Schule und
Bibliothek von Tham Mírdain, Wasserwerke von Nalâ-dûm, Fil Gashan); they lie
not in the 226 landscape maps from `daten/karten.json`.

Open is only the assignment instance → dungeon. The name comparison is not enough:
only 45 of the 167 names match exactly, the dungeon names are besides often
area-deep („The Great Barrow“, „Ost Dunhoth“) instead of wing-exact. Via
`landblocks.xml` (51.018 blocks with `dungeonId`) and the
`ContainedLandBlockArray` of the template **95 of the 167** instances resolve
directly to a dungeon and thereby to a `basemapId`. The 72 remaining have no
interior blocks (copies of a landscape, e.g. skirmishes) and get no
interior map.

Unnamed interiors remained hidden after the trial on 08.11.2026.
Today's detail page uses only assigned interior maps of the finder instances
and shows no interior maps in the landscape tree.

## Chest loot (20.11.2026)

`lore/loots.xml` contains the complete loot graph, not only item tables:
14.268 `trophyList`, 5.094 `itemsTable`, 779 `treasureList`, 739
`weightedTreasureTable`, 807 `filteredTrophyTable`, 115 `relicsList`. All 3.801
trophy IDs from instance and creature loot are resolvable in it.

`tools/build_instanz_beute.py` connects `instanceLoots.xml` (5 tables, 192
rows, 63 instances, 5.099 condition sets, 330 trophy lists) with the graph
and writes `daten/instanz-beute.json` (local, 350 KiB, all 167 find spots):
63 entries have chest loot, 95 an interior map. Per row stand tier,
group size and level band; each pool names item ID, names in DE/EN/FR and the
chance. `dropFrequency` remains a chance per chest, weights become
probability within their pool. Several independent rolls may together
lie above 100 % (chest always contains the loot and additionally possibly a
scroll). `tests/test_instanz_beute.py` checks pools, names, the Glinghant band
50–59 and the map resolution.

Result: **82 different items** across all 63 instances. The content is
meagre – per level band a safe „Beute: …“ (bounty) and stat scrolls with
0,07–0,1 %, for Erebor additionally four legendaries with 17,5–25 %. Armour from
classic instances is not in these tables.

`lore/items.xml` is not in the repository (too large). The own client export
`items-2026-11-08/items.json` contains all 82 items together with localised names and
icon ID, description, rarity and levels. The otherwise filtered
item catalogue takes these items via their proven chest source,
not wholesale all bounties or scrolls. `build_icons.py --nur-instanzbeute`
exports the proven client icons from the existing icon archive for
preview and release.

**Not derivable: boss loot.** The chest tables are skirmish and
scaling loot. Creature pools hang on the species (`mobs.xml` →
`mobLoots.xml`, 73 species, 11.680 level rows); a boss shares his pool with
normal creatures of the same species. Markers (`parentZoneId` = dungeon) name
those of a dungeon. Not all markers are creatures: only hostile
markers count (category 71), and the dungeon must be assigned unambiguously
to exactly one finder instance via the instance blocks. In addition the own
quest DAT export provides direct fight targets (`QuestEvent_ID=22`, `QuestEvent_MonsterDID`,
without role condition) from unambiguously linked quests. The mob labels
provide the names per language. Do not guess names from quest texts.

**Bosses proven only via chests (21.11.2026).** The client knows no boss rank:
`mobs.xml` carries genus, kind, disposition and class, but neither difficulty
nor morale; `lore/` and the repos `LotroCompanion/lotro-data` and
`lotro-data-extractor` provide nothing for that. Reliable is the position:
chest markers (category 72) stand exactly on the creature that drops them,
86 of them carry its name (`Dolguzigir's Chest`). `tools/instanzgegner.py`
therefore accepts a boss only if (a) the chest name matches a creature at
the same position (distance < 0,05) or (b) exactly one creature stands there
that is placed only once in this instance and does not occur in any other
instance. Everything else remains without boss. Result: **52 bosses in 34 of the 67
instances with creature data**, names in DE/EN/FR from the mob labels. Instances
without chest markers (skirmishes like Gondamon) and ambiguous chests get
no boss section; nothing is guessed. Boss loot remains not
derivable.

## Pages and use

The finder is flat and sorted alphabetically. Each row shows the same
Lucide instance symbol, the link to the detail page and a compact fact row;
clusters remain a filter and produce no section headings. The
detail page shows only existing description, facts, quests and interior map.
Quests up to five entries stand directly, from six the existing
quest filter list is used. Interior maps are created in the release from the
client exports under `~/.cache/llb-instance-map-export/` if
the referenced image file is present. Preview and release use the same
crop: remove only the single-colour grey outer border, leave black
backgrounds and the original files unchanged. The preview PNGs
lie under `~/.cache/llb-instance-map-preview/`. The crop is a
static view without coordinates or markers.

The instance page shows proven bosses and the creatures collapsed next to the
interior map: left the two sections, right the map, as on the
quest page. Bosses appear
only if a chest proves their position; the creature list is grouped by genus and
kind and names count and number of kinds in the summary. Below follow
quests, rewards and loot in the standard tabs. Empty sections
are dropped; a single section has only one heading. Quests and
quest rewards stand directly up to five entries, afterwards in the standard filter.
Reward rows link the respective quest and name fixed or
selectable rewards. The loot filter shows every item only once:
name search, level, difficulty and group size check the conditions
of the same chest. Equal matching chances appear only once, different
ones are not added. Item pages name under „Woher?“ one row per
proven instance with the respective chest conditions. Summarised are
only conditions with the same chances where the other conditions
agree. The row jumps to the matching loot on the instance page.
The item search narrows these entries via „Quelle → Instanztruhe“
(`?quelle=instanztruhe`); the reward finder remains separate from it.
Do not derive boss loot.

## Comparison with LotroCompanion

`lore/instancesTree.xml` is a pure list (166 entries in five categories;
166 of the 167 finder IDs match, one is missing). `lore/privateEncounters.xml` (989)
carries map and zone per instance, but the IDs do not match our 167; also
via the instance quests no hit resulted. Companion stores
instance descriptions only as translation keys (`description="key:…"`),
not as plain text – it is no use as a text source.

The loot data are a client dump, no invented list; the loot graph is
also readable from the own client (sample: `LootGen_TrophyList` and
`TreasureGroupProfile_ItemTable` read via `export_sources.py`). For
`landblocks.xml` this path is still missing – the blocks lie in own
DAT files, not in `client_gamelogic.dat`.
