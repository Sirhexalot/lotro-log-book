# Deed positions: renewed check of 06.11.2026

## Implemented extension (06.11.2026)

**Correction of the preliminary check in the chat:** `GameMaps.attribute` expects
`(latitude, longitude, region)`. The 39 rows/22 deeds and
200 hunting deeds named there were determined with swapped axes and are not valid.
Equally unverified was the claim that all remaining deeds had „wirklich keinen
Ort im DAT“. The present export proves no general impossibility.

With the correct axis order, 124 of the 290 cell-zero raw rows of previously
location-less deeds can be related to a map (83 deed IDs); 166 cannot be assigned.
Cell zero and a matching map rectangle do not, however, prove a usable
deed target location. Many rows belong to invisible instance bestowal roles or
entry steps. They are deliberately not published as completion targets.

### Actually recovered

The generator additionally considers the existing
`QuestEvent_BillboardProgressOverride` for deeds. For pure direct enemy DID events
without target text, the real step is retained with a neutral note.
Hidden role conditions, by contrast, receive no invented target text.

That brings **30 additional position rows for six previously location-less deeds**:
Conquest of Dâr-gazag (4), Tyrants of the Enemy (7), Kill the Enemy's Leaders! (6),
Conquest of Ringdyr (4), Conqueror of the Towers (7), A Deep Well (2). All old
English target positions are contained unchanged; the check was made against
the web catalogue published before the extension.

New shared state DE/EN/FR: **5.528 deeds, 644 with exact target positions,
6.922 target position rows**. Catalogue counters and deed IDs stay unchanged.

### Separate hunting ground level

`MagicQuestLog/tools/deed_locations.py` accepts only a single
defeat event (`QuestEvent_ID=22`) with exactly one rule from
`Quest_MonsterRegion` + `Quest_MonsterSpecies`. Unknown semantic fields,
further conditions/groups, exclusions, roles and item events are
rejected. That is deliberately a narrow first extension.

The enemy kind comes from our placed object export (`Agent_Species`), the
required area from landblock and `Area_Territory`. Only `layer=0`, `instance=0`,
`cell=00000000` and positions actually assignable to a map are used.
The separate catalogue key `h` records origin (`dat-enemy-base-world`), enemy DID,
area, species, step and coordinates. No envelope, no invented
centre, no guarantee of enemies present at the same time.

Result: **222 deeds with 14.977 enemy position rows**, of them **221 deeds without
exact targets**. The union therefore amounts to **865 deeds with exact
positions or expressly marked hunting ground notes**. This number
must not be compared with exclusively exact target locations.

Website: only after „Ziele einblenden“, dashed amber symbols instead of
target rings. A 36-pixel grid summarises nearby locations; the anchor remains a
real location, the number counts position rows, no living enemies. The
detail view explains the meaning and offers map buttons. When another deed is selected,
the notes disappear. Plugin: the same note only after showing, optional MoorMap button to the first recorded enemy location.

### Remaining landmarks

Seven still location-less deeds name landmarks: Goblin-town, two
Skoironk/Towers-of-the-Teeth deeds each, Explorer of the Black Pits and Explorer of the
Hiddenhoard. Goblinstadt and Hiddenhoard have interior cell coordinates without a
matching map image; Black Pits has 40 cell-zero rows that cannot be mapped onto the existing maps.
The checked landmark records themselves deliver
no additional coordinate transformation. That remains an open
interior/instance map research, not a proven DAT limit.

Reproducible read-only check:
`MagicQuestLog/tools/audit_deed_locations.py EXPORT_DIR WEB_DATEN_TATEN_EN_JS`.
`test_deed_locations.py` checks axis order, dedup, world layer, interiors and the
rejection of incompletely understood events. The older sections below
document the starting state and are no new extension figures.

Check: `test_deed_locations.py`, `verify_catalog.py`, `test_plugin.py`,
`test_features.py`, `test_struktur.py` and the website unit tests passed.
Browser check DE/EN/FR: notes initially hidden, visible after showing,
disappear on deed change, map button retains the selection, changed
window size retains the complete 4:3 map. The publication build additionally
checked for image loading, hint parity of all languages and an empty personal
progress file. Screenshot: `output/playwright/deed-hunting-en.png`.
Plugin source code and catalogue are prepared and checked headless; game check
and a new plugin release are still outstanding. No installed game or
progress files changed.

Website published and re-checked at `https://llb.sirhexalot.de` with Barghest-slayer:
notes hidden on loading, three grouped symbols after
showing, map image loaded successfully. Upload: 40 files / 10,1 MB.

## Evaluated own data

- DAT export `full-dat-en-de-fr-2026-11-03/deeds.json`, `areas.json` and
  `locations.json`.
- Own `placed-2026-11-03/raw.jsonl` export: properties of placed enemies,
  NPCs and items.
- Own `did-positions-2026-11-03/positions.jsonl` export: locations.
- Landblock area assignment from Companion's game reference `landblocks.xml`.
- Delivered English deed catalogue: 5.528 entries, of them 638 with
  at least one target location and 4.890 without a target location.

Important: these 638 deeds already contain **6.892 target position rows** in the
English web catalogue. The deed count must not be compared with the number of pins of
another website. Among others the eight flowers in the Old
Forest as well as the exploration places of the Old Forest and the Barrow-downs are contained.
Whether the pins are actually all shown on the expected map is a
separate question of map assignment and display.

In the raw target position table there are 8.645 rows for 1.099 deeds. Of the
currently delivered deeds without a target location, 465 already have raw positions
(1.267 rows); these must be checked for map/step assignment and interiors.
A missing display therefore does not automatically mean a missing DAT position.

No positions taken over from the wiki, Deed Tracker or Kroel's website.

## Finding

The previous addition in the catalogue generator follows direct references
(`QuestEvent_MonsterDID`, `LandmarkDID`, `ItemDID`, `NPCTalk`, `Detect`,
`EmoteTargetDID`). Among the previously location-less deeds there are only ten with such
references to outdoor positions in the existing export. Among them are PvMP,
instances and technical content. That is not a list of ten immediately
publishable landscape deeds.

An additional source is `QuestEvent_MonsterGenus_Array`. Example
`70005BD2` (Barghest-slayer): `Quest_MonsterRegion=1879049792` and
`Quest_MonsterSpecies=57`. Placed enemies carry a matching `Agent_Species`.
Via region/BlockX/BlockY their area is determined from `landblocks.xml` and related via
`Area_Territory` to the required area.

**277 previously location-less deeds have at least one such candidate** if
only rules with exactly `Quest_MonsterRegion` and `Quest_MonsterSpecies`
are considered. Examples (unique locations rounded to two places):

- Barghest-slayer and Advanced: 27 locations each.
- Brigand-slayer and Advanced: 422 each.
- Bree-land Woodsman and Advanced: 68 each.
- Neekerbreeker-slayer and Advanced: 54 each.
- Orc-slayer and Advanced: 292 each.

These numbers count candidates, **no checked deed target locations**. Other
conditions of the respective event, content layer, reachability and
enemy exclusions must be checked before an adoption. Some events
link item loot with enemy rules; there an enemy location is no
fixed find location of the item.

## Next sensible extension

1. Evaluate complete events including conditions; initially only
   unambiguous enemy defeat rules.
2. Check outdoor positions plus area and world region; do not interpret instances and technical
   layers as landscape solely by `cell=0`.
3. Store origin and meaning separately: **enemy location**, not
   guaranteed find location, not invented centre of a hunting area.
4. Show dense locations sensibly, without thousands of coincident pins.
5. Cross-check in-game on Barghest in Breeland and further areas.

Until then the published target catalogue stays unchanged. In the web view
existing target coordinates are shown under the respective step;
objectives must be shown for that. Do not feign an assignment to individual conditions
when only the step number is known.

## Comparison with Deed Tracker 3.3.0 (06.11.2026)

Comparison read-only with the current ZIP from LOTROInterface, download ID 1139;
version checked via `CubePlugins/DeedTracker.plugin`. The public
GitHub main is older and must not be counted as a current release.
No foreign positions taken into our catalogue.

- `DeedDataEN.lua`: 4.673 deed IDs.
- `DeedObjectiveInfoEN.lua`: 3.278 LAT/LONG pairs for 600 deed IDs.
- Our English web catalogue: 5.528 deed IDs, 6.892 target position rows for 638 IDs.
- All 4.673 Deed Tracker deed IDs appear in our catalogue; we have 855
  further IDs. That does not prove that these additional entries are all playable.
- 477 deeds have positions in both projects.
- 123 deeds have positions in Deed Tracker, none with us.
- 161 deeds have positions with us, none in Deed Tracker.

Examples of the 123 gaps: Goblin-town, Bilbo's Buttons, Lore of the Forgotten
Library, Treasures of the Silvertine Lodes, Implements of the Forge. Several
concern interiors/instances; their coordinates are not readily pins
on a landscape map.

Position rows are no quality ranking: several possible positions for one
target, repetitions between related deeds and different counting modes
can strongly influence the numbers. The ID comparison shows the real
coverage gaps better than the mere pin sum.
