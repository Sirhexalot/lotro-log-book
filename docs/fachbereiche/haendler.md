# Vendors and barter vendors

A vendor is an NPC where one gets something. Two sources provide the
entries, and both belong in the same catalogue:

| Kind | Source | Count |
|---|---|---|
| Vendor (sells) | `vendor-items-2026-11-08/vendor-items.json` | 1.199 |
| Vendor and barter vendor | the same file, additionally in `barters.xml` | 270 |
| Barter vendor (barter only) | `barters.xml`, no entry in the vendor export | 818 |

Together 2.287 entries in `daten/haendler.json`. Their offers (price → goods)
come from `daten/tausch.json` (`tools/tausch.py`): 42.612 offers at 3.470
profiles, with prices named in DE/EN/FR from the client labels. `build_haendler.py` writes
them, `tools/vendor_viewmodel.py` and `php/src/Vendors.php` make pages out of
them under `/de/haendler/<ID>/`, `/en/vendor/`, `/fr/marchand/`.

## Identifiers

Page addresses require **eight hex characters**; `Catalogue::isValidId` accepts
nothing else for vendors. The item export writes the NPC identifier
decimal (`1879175294`), the labels file keys it the same way. `build_haendler.py`
therefore converts once into `%08X` (`7001F07E`) and remembers the decimal
form only for the label match. `php_viewmodel.py` does the same conversion
before it links a barter row to a vendor page.

## What a page shows

- Name in DE/EN/FR from `lore/labels/<sprache>/npc.xml`.
- Type: „Händler“, „Tauschhändler“ or „Händler und Tauschhändler“.
- **Two tabs** „Wo“ and „Was“ with their counts (places, goods), from the shared
  tab component (`components/reiter.twig`, `reiter.css`, `reiter.js`); the bar
  is labelled „Händlerangaben“ and names the tab group, not the vendor. Bar and
  panels are siblings so that `reiter.css` can frame the panel; no page carries
  tab or panel styling of its own. A vendor with only one of the two sections
  shows no tab bar and frames that section with `llb-flaeche` instead.
- „Wo“ shows **one** map for the picked place and a compact list of every known
  place (region › area, coordinates, map and route links); picking a row swaps
  map and pin. Nine places no longer mean nine stacked map pictures. A row
  without a map image is a statement, not a button: it carries no pointer and no
  hover, because there is nothing to swap. The same holds for a vendor with only
  **one** picture (507 of them): that picture is already on screen, so the row
  stays plain instead of looking clickable (23.11.2026).
- „Was“: the sold goods with the shared item filter, then the barter table.
  Barter rows use the catalogue row (icon, name, price and quality, item level)
  and reuse the filter UI with **level range, quality, barter list** and search.
  The offers arrive as compact rows (goods id, list, price, amount); name,
  level, quality and icon come from the item index the page already loads, so
  1,188 offers stay around 40 KB.
- Without JavaScript the first 50 offers remain readable, with a note that the
  filter needs JavaScript.
- **The list filters goods by level range** (`from`/`to`): a vendor stays when at
  least one of its goods has a minimum level inside the band. The explicit range
  wins over the „Ware für meine Stufe“ shortcut. The list sorts by name or by
  stock level (`sort=stufe`, lowest goods level first, vendors without one last).
- **The list filter has two groups only.** „Normale Händler“ contains every
  vendor that sells (1.469), „Tauschhändler“ every vendor that barters (1.088);
  a vendor that does both is counted in both. There is no third category –
  it said nothing about what the page offers.
- Location and map only if `did-positions` knows a position.
- **Place from the landblocks (23.11.2026).** Every position in the geo export
  carries a landblock (region, block X, block Y) and a cell. `landblocks.xml`
  names the area of every block and a dungeon for some blocks and cells, so a
  position resolves without guessing: 1,645 places have no landscape map and
  1,539 of them get a room ("Gasthaus „Zum Wachsamen Auge“") or an area name from
  the client. The chain above it comes from `geoAreas.xml`
  (`Eriador › Breeland`), so the place is smaller than a region without
  inventing a landscape. A chain part links only when its English client name
  resolves uniquely to a catalogue map; a leading article may differ, and the
  route uses the matched map's own tier. A GeoArea ID is never used as a public
  map URL. 106 positions stay unnamed: the client's placeholder
  "Unexplored Territory" names nothing, and such a place keeps the recorded
  region only.
  Such a place keeps neither a map link nor a travel link: its coordinates are
  interior ones, and the travel planner used to route them to the nearest
  stable-master anywhere (1.2S 50.7E landed at Hrimbarg in the Misty Mountains).
  Where a landscape map exists, its chain stays the place name — the map is what
  a player can open.
- **The room's picture:** a dungeon names its basemap (`dungeons.xml`), and the
  basemap's frame holds the position — then the page shows that interior map with
  the pin, exactly like a landscape (1,271 places). `tools/hole_innenkarten.py`
  exports exactly the needed pictures in DE/EN/FR from the client and crops each
  to its drawn part (the client's interiors are 10–30 % floor plan on a black
  canvas); the crop is recorded in `daten/innenkarten.json`, and
  `tools/zonen.py` moves the frame onto the cut-out, so the pin still lands
  correctly. `baue_webp.py` writes the WebP files, and
  `tools/build_release.py::pruefen()` refuses a release whose `karten/<sprache>/`
  lacks one of them.
- A place with a map frame links `?vorkarte=<map>&haendler=<ID>`: the map opens
  and marks that vendor. The map's own vendor layer (`Händler`, off by default)
  draws every vendor of the shown map from `web/haendler-karte-<sprache>.js`
  (3.012 points over 163 maps, 46 KB gzip, built by
  `tools/build_haendler_karte.py`). The dot is a gold square so it never reads as
  a quest status; hovering names vendor and kind, a click opens the page.
- Arriving from a vendor page, the map opens as a **vendor view**: only that one
  vendor is drawn, the landscape's quest dots and list stay away, the list column
  names the vendor and the detail column offers "Händlerseite öffnen", the route
  and "Alle Aufgaben zeigen". Any area change or that button leaves the view.
  A **region overview** (tier 1, e.g. Eriador) does not count as a landscape: the
  map app cannot open it, and its wide frame catches interior coordinates
  ("DELETE ME!", "TBD - HITHAEGLIR …", Thorin's Hall at 92.7S), which would put a
  pin at the bottom edge of a continent map.
- **No** profession label for pure barter vendors: the client provides it
  only in English („Crafting“), and a German page invents no
  translation. The item entry under „Woher“ shows for the same reason
  only the name.
- **Item pages** put the same price into their „Tauschhändler“ group
  („kostet 500 Zeichen · Geringe Klassen-Gegenstände“) and take the vendor
  name from `daten/haendler.json` instead of the English client row.

## Limits

- Pure barter vendors have **no location** in the exports. The page remains
  without a map section instead of guessing a place.
- A room name comes from a marker with the **same NPC id and the same
  coordinates**. Positions whose markers sit in several zones (the client reuses
  interior blocks) keep no name, and so do placeholder zones such as "Unexplored
  Territory". Neither is guessed.
- The room name says where a vendor stands, not where its entrance is; interiors
  have no landscape map, and their coordinates live in a shared interior space
  (the tavern's coordinates also fall inside the frame of Barad-dûr's dungeons,
  which is why interior maps were rejected as map views).
- There is no description for any vendor in the export.
- Conditions of a barter (class, faction, quest) are not carried yet: the class
  sits on 159 vendors, faction and quest conditions on the profiles. Prices
  and quantities are carried.
- The type „Händler und Tauschhändler“ is a statement about what the page
  shows, not a third filter category.

## Checks

`tests/test_item_model.py` records: a barter vendor page exists in all
three languages, its identifier is eight characters, the item page links every
barter row, and the row does not repeat the English profession label.
The vendor list has two type filters (`type_filter_vendor`,
`type_filter_barter`); `tools/vendor_viewmodel.py` gives a vendor that both
sells and barters the types `vendor` and `barter`, so it appears in both.
`tests/browser_haendler.js` checks the detail page in DE/EN/FR: both tabs and
their counts, the place picker swapping the map, the level and quality filters,
a pure barterer without tabs, 390 px without overflow, and the 50-row fallback
without JavaScript. `tests/test_vendor_viewmodel.py` pins the three location
cases (region without a map, named interior, map frame with the vendor
parameter), `tests/test_haendler_karte.py` the point rows and the room-name
cleanup (subtitle, client quotes, placeholder names),
`tests/browser_haendler_karte.js` the layer and the vendor view: the link from a
vendor page (that vendor only, no quest dots, back via "Alle Aufgaben zeigen"),
the switch, a stack of vendors on one spot, an interior place without map and
route links, the travel planner's answer to interior coordinates, and the
one-row tool bar on a phone.

## Ware ab Stufe (22.11.2026)

- `vendor_index()` schreibt je Händler `ml_min` (kleinste Mindeststufe seiner
  Ware), `ml_max` und `ml_levels` (die belegten Stufen). Grundlage ist
  `daten/items.json`; Händler ohne Ware oder ohne bekannte Stufe bleiben ohne
  Angabe. 1.898 von 2.287 Händlern haben eine Spanne.
- Die Liste zeigt „Ware ab Stufe X“ als eigene Spalte. Der Spaltenkopf ist
  `gw.stufe_heading`; die Zeile nutzt die Wertspalte von `_result_row.twig`.
- Der Von/Bis-Filter der Warenstufe steht im Filterfeld und filtert serverseitig.
- Am 23.11.2026 ist der **Verweis „Ware für meine Stufe“ entfallen** (samt
  `?stufe=`-Parameter und der zehnstufigen Sonderregel): er stand als zweite
  Zeile neben dem Weg zurück und las sich wie ein festgeklemmter Filter. Die
  Eignung eines Stücks beantwortet weiter der Eignungs-Chip, die Ware der
  Von/Bis-Filter und die Spalte „Ware ab Stufe“.
