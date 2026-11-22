# Terrain view from the own client

## Operation

The map application offers **Gelände | Spielkarte** as a toggle above the
map. The game map is the default. A manual switch is stored under
`mql.kartenansicht` for all maps and languages in the same browser.
An exception is the **Epische Geschichte**: it is a special view and
opens in the terrain (`MQL_GELAENDE.setView('gelaende')`). The switch applies only to
this view and does not change the stored choice of the other pages; when
leaving, the map falls back to `mql.kartenansicht`. The toggle remains
operable there too and then affects only the special view.
The toggle also stands in the quest and deed overviews; there the
landscape previews switch together with the map stage between terrain and
game map. It also applies after a reload. A one-time migration sets the previous
view to game map and switches resource occurrences off; it changes neither
filters and notes nor characters and character progress. Afterwards personal
map and resource occurrence selections remain. A link with `?vorkommen=` still
deliberately activates the requested type. No account and no synchronisation
between devices. Blocked browser storage is caught.

Both views allow zoom and panning. Zoom is limited to the native
resolution or at most 4×. Quest, list and selection
remain on view switch. Quest, goal, hint and note symbols
zoom with the map; in the terrain view they remain legible. Resources
are drawn in a suitable canvas resolution. Popups continue to use their
existing selection and detail functions. The game map remains undistorted in
4:3. The terrain view uses the actual geographic frame and
extends it if needed to the aspect ratio of the map stage. The extension
reaches only into additional tiles if mostly terrain from the
client is available there; missing tiles are not added or stretched.
Markers and coordinates use the same extended frame.

Above the map stage lies a transparent control bar: left filter and
resource occurrences and – in the quest view – a quest giver on/off button, right terrain/game map as well as
zoom and fit area. The quest giver button shows its state directly.
It hides only pure quest giver points; places on deed maps remain visible.
Filter menus remain inside the map frame.
The frameless level span stands in the lower bar. Its legend and
status words use the same font level. On mobile devices the
map application stays free of the global footer; on the other pages it sits
at the bottom edge even with short content.

The overview uses terrain preview images when terrain is selected. Without an
available image an empty image place of the same height remains. Map rows align
each to their highest tile, not to the highest tile of the
whole grid. Content groups, filters and navigation are not changed.

## Source and build

```bash
python3 tools/build_gelaende.py
```

Options: `--client`, `--lib`, `--cache`, `--prepare-only`, `--skip-export`.
The default paths point to the locally installed game and Companion
files. The client is opened exclusively via read-only Companion APIs.
`tools/ExportTerrain.java` uses `DatRadarImageProvider`. No
TerrainMap web images, PSB excerpts, foreign pins or height maps are needed.

All outputs lie under `~/.cache/llb-terrain/`:

- `<Quellstand>/source.json`: local source paths and size/timestamps.
- `<Quellstand>/requests.tsv`: unique requests from all map frames.
- `<Quellstand>/raw/`: PNG exports and resumable `tiles.jsonl`.
- `public/manifest.json`: public frames (schema 2: per map
  `[Region, West, Nord, Ost, Süd, Übersicht, Vorschau]`) and tile indices.
  The tiles stand as row runs `[y, x0, x1]` instead of individual names:
  46.850 bytes instead of 678.535, gzip 13,7 instead of 177 KB per map call. Schema 1
  is still read by the browser so that a cached state
  does not break.
- `public/<Quellstand>/r<Region>/<LOD>/<Y>_<X>.webp`: shared tile pyramids.
- `public/<Quellstand>/thumb/<Karte>.webp`: preview images.
- `coverage.json`: detailed local coverage report.

The source state is formed from format version and file statistics of the client DATs.
Missing tiles are logged as missing, not invented.
An aborted complete manifest row is resumable; a damaged
JSONL manifest is not silently ignored. Changes to the tile format or the
encoding need a new format version. The client data state is no
complete content checksum test.

## Coordinates and special maps

Companion's PositionDecoder describes blocks with 160 local units and
0,005 display units per unit. From this follow 0,8 × 0,8 game coordinates per
tile, with origin EW −146,8 / NS −124,4. The loaded images are 200 × 200
pixels. X runs east, Y north; image rows are therefore assembled reversed.
The game region remains part of every key. The same coordinates of different
regions are never the same tile.

For the five drawn overview frames the area of their direct
sub-maps is requested as well. Without this second pass rectangular gaps
would remain there that no sub-map frame had requested
(14.11.2026, 13.761 additional blocks). The client does not have the majority of them:
11.977 remained without image, only 1.784 were added. The remaining
gaps are therefore real, not built areas in the client and not missing
exports. Coverage of the overviews afterwards: Rohan 77 %, Mordor 75 %,
Rhovanion 65 %, Gondor 57 %, Haradwaith 47 %.

The application loads only tiles of the visible excerpt in a suitable LOD.
Individual tiles are shared by different area maps.
No huge overall image per map is loaded. Non-existent partial areas
remain empty; the client also contains unfinished/inaccessible terrain.
No walkable paths or available quests are derived from this.

For previously unusable **drawn overview frames** an own
terrain frame is determined from existing, named direct sub-maps. Only
the same game region counts. Spatially separate groups are not artificially
placed next to each other: the largest contiguous group determines the
region overview, `separateMaps` records detached maps. These maps
remain reachable individually. This is a representation derived from frames,
not a claim of exact area boundary polygons.

The terrain frame changes neither the original game maps nor their
IDs. Projection and coordinate display use it only with active
terrain view. Unchanged, proven resource files are reused;
`resourceMaps` prevents requests for non-existent files.

## Verified status as of 13.11.2026

- 226 maps, 96.351 requested unique blocks.
- 52.974 images exported, 43.377 blocks without image.
- Regions 1, 2, 3, 4, 5, 6 and 14 contain images.
- 224 maps have terrain, including the five new terrain overviews
  Gondor, Rhovanion, Mordor, Rohan and Haradwaith.
- Exceptions: **Kankras Höhle** (`268453438`) and **Umbar-môkh: Die Niederungen**
  (`268454497`). The frames exceed the supported 0–255 block range.
  No automatic wrapping of negative block numbers and no invented position.
- „Hat Gelände“ means existing images in the frame, not gapless coverage
  of the whole rectangle or complete reachability in the game.

## Preview and release

The local PHP router reads the generated files from
`$LLB_TERRAIN` or `~/.cache/llb-terrain/public`.
`tools/build_release.py --gelaende <Ordner>` takes over the manifest and exclusively
the public source state referenced in it. Raw images, local paths,
research scripts and personal data are not copied. Without a terrain
build the application remains usable with game maps.

It was **not published**. Own client export means no new
permission of the rights holder for public image publication.

## Tests

```bash
python3 -m unittest discover -s tests -p 'test_gelaende.py'
node tests/test_gelaende.js
NODE_PATH=/Users/adrian/.nvm/versions/node/v24.16.0/lib/node_modules \
  LLB_TERRAIN_PHP=http://127.0.0.1:8847 node tests/browser_gelaende.js
```

Checked: 213 Python tests, JavaScript preference/frame checks and
DE/EN/FR text keys; all 70.119 delivered tile files and 224
preview images present, frame comparison against DE/EN/FR 224/226 each.

Browser checks: DE/EN/FR at 1440 and 390 px, default view, stored
choice/reload/map change, constant marker size, zoom, drag, game map
fallback with missing images and HTTP errors, twelve maps/overviews from
all existing game regions, terrain previews and tile rows. Clicks
on real resource points still open the source display; a mere
touch is not caught as a drag. DPR=2 loads the matching finer
tiles. Existing area tabs and contextual lists were also checked.
The
mobile check is a browser width, not a physical touch/Safari or
screen reader acceptance.

## Resource occurrence selection and migration

During the one-time conversion `mql.vorkommen` is set to an empty selection.
Future visitors also start without resource points; they can
deliberately switch on professions or individual types. A stored state
„nichts“ does not persist after the reload. The migration marker prevents later
personal changes from being overwritten again.
`tests/browser_gelaende.js` checks defaults, reloading and the targeted
resource occurrence link.

## Shared landscape navigation (13.11.2026)

Quests and deeds now offer the same landscapes and the same map tabs;
`tools/build_gebiete.py` merges the labels and map ids of both catalogues into
`web/gebiete-<sprache>.js`, and `app.js` adds missing landscapes and tabs with
zero entries. Before, the deed overview was missing 28 landscapes (mostly
Rohan, Ithilien, Totensümpfe, Umbar-môkh) and one landscape had a different set
of tabs. Quest groups without a map of their own ("Ithilien", "Fangorn",
"Ackerland", "Rohan - West-Emnet", "Anórien (schlachtgezeichnet)") stay out of
the shared list; they are catalogue groupings, not maps.
`tests/test_gebiete.py` fails when the generated files are stale.
