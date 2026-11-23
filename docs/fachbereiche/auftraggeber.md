# Quest giver

Status as of 23.11.2026. **Published.** Overview and detail pages run in
DE/EN/FR, together with menu, central search, map links, tree filter and progress
from the imported character.

## Sources

All data comes from the client export and the game definitions. Nothing is
added from names, wiki or guesses.

| Item | Source |
| --- | --- |
| Who gives a quest | `lore/quests.xml`, `<bestower npcId>`; gap from `Quest_BestowalRoles` of the DAT export |
| Name in DE/EN/FR | `lore/labels/<sprache>/npc.xml`; fallback to `Name.texts` of the NPC raw export |
| Activity | `lore/NPCs.xml` `title` → the same label set |
| Greeting, description | `npcs-*/raw.jsonl` (`NPC_ActionPicker_GreetingString`, `Description`) |
| Kind (person/creature/item) | `class_index` of the raw export; `NPC_IsInanimate` makes an object out of it |
| Location | `did-positions-*/positions.jsonl` (instance-free), map via `game_maps.GameMaps.attribute`, room/area via `tools/zonen.py` and the newest client `landblocks.xml` |
| Quests, level, features | existing web catalogue `daten/quests-<sprache>.json` |

A location gets a map only if the game map lies in the own map stock.
Coordinates remain even without a map; they are neither shifted nor averaged
to „fit the map“.

For places without a landscape map, `zonen.py` adds the client room or area
name and its region/territory chain. A room picture is shown only when the
client has a basemap whose frame contains the position. Such interior places
have no map or travel action; their coordinates are not world-map coordinates.
Places with a landscape map keep the map-derived place chain. An interior
region/territory part links only when its English client name uniquely resolves
to a catalogue map; the public URL uses that map's ID and actual tier, never the
internal GeoArea ID. A leading article may differ between the client and map
name.

## Rules

- **Proven names only.** If the name is missing in one of the three languages,
  the entry is dropped and counted in the test report. 187 such IDs stay out.
- **Several quest givers per quest** remain (802 quests). The
  quest detail page links the first quest giver that the game names.
- **Technical quest boards** with a pure level span as name („21-30“,
  „151-160 Hamât Renewed“) get no page: 22 entries. The name alone
  would be worthless as a heading.
- **Locations are clustered**: points of a region within 0,3
  map units count as one place; at most eight places per quest giver.
  Several far-apart places remain separate.
- **No portraits.** For normal NPCs the verified export contains no
  finished image. The page shows a neutral symbol; no wiki or
  AI image is output as game appearance.
- **No invented biography.** The description appears only if the client
  itself provides one (261 entries, mostly quest items).
  Greetings stand collapsed and with a spoiler note.
- **No progress claim without import.** Without a character it says „Kein
  Charakter importiert – der Abschluss ist nicht bekannt.“ The counter names only
  the quests assigned with us, not all playable ones.

## Addresses and filters

- List: `/de/auftraggeber/`, `/en/quest-giver/`, `/fr/donneur-de-quete/`
- Detail: append ID, e.g. `/de/auftraggeber/70000002/`
- Filter as GET parameter: `q`, `region[]`, `area[]`, `kind[]`, `tag[]`,
  `from`, `to`, `page`
- Region and landscape are map keys (stable game IDs), no names.
  The filter shows the landscapes under their region as a tree, like the
  item search. Unnamed maps („Karte 268450271“) are no landscape;
  such places keep only their region.
- Each result row names first the kind (person, creature, item or
  „Art nicht belegt“), so that entries with the same name and items are recognisable.
- Sorting via `sort=name` (default) or `sort=stufe`; „Stufe“ is the
  lowest quest, unknown levels stand last. The server sorts before
  the page split, so that paging and JavaScript-free use are correct.
- The filter state is remembered locally and restored on the
  parameterless call; back links from detail pages carry it along
  (`docs/oberflaeche/filter-sortierung.md`).
- Detail pages link under „Weitere Einträge mit diesem Namen“ the other
  game IDs of the same name with place and quest count. The entries remain
  separate because the game data proves no identity; from twelve a
  link points to the list filtered by name.
- Level and feature must be met by **the same quest**. A place
  is enough from any location of the quest giver.
- Facets count without their own filter group; selected zero hits remain
  visible. 30 entries per page.
- Checkboxes and level fields filter immediately (`sets.js` serves the common
  filter shell). Without JavaScript „Anwenden“ remains as fallback.
- Filtered lists carry `noindex,follow` and their own canonical URL.
  Language switching keeps the filters and starts on page 1.

## Structure

| File | Task |
| --- | --- |
| `build_auftraggeber.py` | data basis and test report from the game files |
| `tools/giver_viewmodel.py` | list index, detail pages, map traces, quest rows |
| `php/src/Givers.php` | filter logic, facets, pages, DE/EN/FR texts |
| `php/templates/givers/` | list and detail template |
| `web/auftraggeber.css` | header rendering and quest list |
| `web/auftraggeber.js` | progress, counters, „Erledigte ausblenden“ |

The menu entry sits in the family **Welt** (`Shell.php` and `menue.js`), the
central search has type `n` (`build_suche.py`, `suche.js`). The
quest detail page links via `gi` to the quest giver.

## Building

```bash
python3 build_auftraggeber.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
../MagicQuestLog/.venv/bin/python build_suche.py --sprache de
# same for en and fr
```

`tools/build_php_data.py` requires `daten/auftraggeber.json`; if it is missing,
the build aborts with a note.

## Test record (10.11.2026)

- 5.067 quest givers, 11.567 quests with quest giver, 13.076 assignments
- 802 quests with several quest givers
- 4.896 with location, 4.284 of them with map; 920 positions without map
- 5 unnamed maps fly out of the landscape filter (20 entries, e.g. Aragorn);
  they keep their region
- 507 names occur several times (1.892 rows), 405 of them with the same name and
  place; cross-references instead of merging
- 1.335 with activity, 1.297 with greeting, 261 with description
- Kinds: 4.075 persons, 175 creatures, 347 items, 470 without proven kind
- 171 without any location, 187 without a complete name, 22 level boards
- Sitemaps: per language list plus 5.067 detail addresses

## Landblock places (23.11.2026)

The current data has 5,654 positions: 4,442 with a landscape map, 1,184
map-less positions with a client room/area name, and 920 interior pictures with
a pin. Only map-backed places offer map and travel actions. The data builder
retains `block` for the shared resolver; it writes `ort`, `kette`, and, when
the room frame contains the point, `bild`, `pin_x`, and `pin_y`. The same
interior image exporter serves vendors, quest givers and landmarks.

Tests:

```bash
python3 -m unittest tests.test_auftraggeber tests.test_giver_viewmodel \
  tests.test_givers_php tests.test_giver_catalogue -v
node tests/test_giver_controls.js
```

The complete Python suite keeps the known error in
`test_katalogseiten.test_one_public_address_per_entity` (expects the old
Apache block instead of the PHP block). Derive no green overall suite from that.

## Publication 10.11.2026

Release from `~/.cache/llb-release` (19.894 files, 798,4 MB): first 3.077
data files (196,6 MB), then 17 application/asset files (16,1 MB) via the
existing FTPS uploader. The `.htaccess` stayed unchanged; its
language rule also covers the new segments with a hyphen. No
character data in the release.

Live checked:

- Lists and detail pages in DE/EN/FR, tree filter with immediate filtering and
  kept open state, kind in every row, cross-references for the same
  name, map preview and mobile view without overflow.
- Menu entry under **Welt**, central search with its own group and back link
  from the quest detail page.
- Lower case and `.html` are canonicalised via 301; unknown IDs
  return 404, the giver index 403.
- All three sitemaps return 5.068 URLs each; the sitemap index names them.
- 5.067 giver rows in `suche-de.js`.

## Open points

- 470 entries have no proven kind because the raw export does not contain them
  („explicit IDs only“). A more complete NPC export would close that.
- 920 positions lie in interiors or instances without their own map. They
  show coordinates, but no map excerpt.
- Portraits are still missing. Own rendering from the appearance data would be
  a separate project; foreign images remain excluded.
- Section „Auftraggeber in diesem Gebiet“ on the area pages is not yet
  built in.
