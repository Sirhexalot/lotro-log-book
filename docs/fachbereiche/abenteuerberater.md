# Adventure overview – implementation status

## Goal

A page that answers the question „Wo spiele ich weiter?“ after a game break,
without splitting the world into sub-areas: the large content as maps, with
personal progress, matching level and two hints. Older, over-levelled content
stays equally visible; the page prescribes no route.

Public addresses: `/de/abenteuer/`, `/en/adventure/`, `/fr/aventure/`.
Menu: **Welt → Abenteuerüberblick**.

## Structure

1. **Header** with the selected character and level (from the existing character store).
2. **Two hints**: „Altes zu Ende bringen“ and „Passt zu deiner Stufe“. Without
   a reliable suggestion there is a note, no invented recommendation.
3. **Meine Inhalte** (at the very top, collapsed by default): access only for
   **purchasable** content – expansions and quest packs –, stored locally per
   account (`mql.abenteuer.inhalte.v1`). Base game and free updates
   are not in the list because they are always available. A single list,
   sorted by entry level like the maps, with the kind after the name;
   two buttons set all purchases at once. A change briefly tints row and map
   so the effect is visible.
4. **Adventure maps**: name, kind, editorial level range, short text,
   progress and an expandable area excerpt. 0 % is shown too;
   a missing bar would otherwise mean „unknown“ instead of „nothing achieved“.
5. **Footnote**: percentages count one-time landscape quests; a missing
   completion in the import does not prove a non-visit.

The page is readable without JavaScript: the server renders all adventures with name,
level and areas. Progress, hints and access arise in the browser.

## Map (14.11.2026)

The page has two views: **Karte | Liste**. The map is an addition; without
JavaScript the map list remains the page, toggle and map area are then
hidden.

- **World:** the client's drawn Middle-earth map (`268437554`). The six
  region markers sit on the pixel positions with which the game links the
  regions on this map (`maps/links.xml`), not on an estimated
  layout position.
- **Marker:** ring = catalogue progress of the verified areas, border colour =
  level fit, number = areas with a known next quest. Without an
  import the progress stays unknown („–“), not 0 %.
- **Region:** the drawn region map (e.g. Eriador) with one point per
  area that the game links directly on this region. For each point the
  ring shows the progress in the area (share of completed catalogue quests), the
  core colour the level fit. Without an import the ring stays empty instead of
  claiming 0 %. The remaining areas are in the list below the map; for them
  no point is invented. Below the map stands the selected area with
  progress, level range, level fit, number of next quests and
  access.
- **Terrain preview:** a tile from the own client
  (`/gelaende/<stand>/thumb/<karte>.webp`), otherwise the drawn area map.
  No quest markers: this page knows no quest positions. Buttons lead
  with `?vorkarte=<karte>` into the map view and, if present, to the
  area page.
- **Hints:** „Auf der Karte zeigen“ jumps to the region of the suggested
  area. No route, no assurance that a quest is open in the game.
- **Areas as a list:** expandable below the region map; there all
  areas stand, also those without their own map point.
- The Middle-earth overview is directly the map view. The six regions
  are chosen via the map; an additional global adventure list does
  not exist there. Within a region the area list remains as an alternative
  selection next to the region map.

Data: `tools/build_abenteuer.py` adds `region` per area (the tier-1 map
from `daten/karten.json`) and writes `positions` from `maps/links.xml`:
`world` for the six regions, `areas` for the directly linked areas (52
of the 153). Unnamed sub-maps (two Osgiliath variants, two old Anórien
variants, one Nan-Ogol map) are not kept as separate areas: their
quests count with the named landscape they hang under. `Adventures.php` provides the six regions with translated names from
the map table, their positions and the existing area pages.
Progress, level fit and next quests come from the same
browser logic as the maps.

A **continuous terrain world** deliberately does not exist: the area frames
overlap many times, the terrain overviews are only 41–77 % covered,
and drawn borders are missing in the data. The region map therefore uses
the complete game map drawing.

## Data

- `referenz/inhaltspakete.json` (schema 2): per adventure a stable identifier,
  order (release), kind, publication, names and short text in DE/EN/FR,
  editorial level range (`levels`, `level_source: editorial`), landscape
  roots, explicit exclusions and the review scope (`review: landscape`).
  English names are the official product names; German and French
  titles are editorial translations with the client's landscape names.
  Quest packs and free updates carry a `name_map` instead of `name` and
  are thus called in each language the way the client calls the landscape.
  `free: true` marks always available content (base game, updates); all
  others are purchasable and appear in „Meine Inhalte“.
- `tools/build_abenteuer.py` generates from it per language `abenteuer.json` for the
  page and `web/abenteuer-<sprache>.js` for the browser. Both are identical.
- Quest → adventure: the deepest map in the `fk` path that belongs to exactly one adventure.
  An excluded branch cuts off the whole subtree so that
  content released later is not inherited via an old landscape
  (Wildwald, Winkel am Mitheithel, Carn Dûm danach, Wohngebiete, Frostbluff;
  Morgultal belongs to Minas Morgul, not to Mordor; Ältestental not to Gundabad;
  Hatokáli-Hügel not to Harad).
- Counted are one-time landscape quests; repeatable, daily,
  session play, instances and technical entries are dropped. Excluding
  alternatives with a proven completion remain, otherwise the dead branch falls out of the
  denominator. The overall percentage sums quests, not area percentages.
- Area levels are derived from quests (p10–p90) and meant only for order and
  moving on. The displayed level range of an adventure is
  editorial and no measurement in the client.
- Assignment scope: landscape level verified. Individual quests added later
  within an old landscape are not excluded; that stands as a
  limitation in the generated data.

Local stock on 11.11.2026: 32 adventures (15 expansions including base game, 12 quest packs, 5 free updates), 153 areas, 7.821 one-time quests.

## Logic

`web/abenteuer-logik.js`, testable independently of the interface:

- Progress per adventure and area; without an import it stays unknown (`null`),
  not 0 %.
- State: `started`, `complete`, `unrecorded` (import there, no completion),
  `no_content`, `unknown` (no import).
- Level fit: `below` (content below the character level), `fits`, `above`
  (content for higher levels), `unknown`.
- „Altes zu Ende bringen“: started, incomplete, not too high above the level of the
  character, access not explicitly missing; earliest level range,
  then lowest coverage.
- „Passt zu deiner Stufe“: level range includes the character level, started
  adventures first; never the same adventure as the first hint.
- Next step in the adventure: earliest area with a quest whose known
  prerequisites are met. That is no assurance of current acceptability.
- Access: purchasable content from the stored statement; base game and free
  updates are always available. VIP rules
  are considered only with explicitly verified fields. „Unbekannt“ means
  not „nicht gekauft“; only explicitly missing access removes an adventure from
  the hints, not from the list.

## Limits

- The map is an addition to the map list. It shows no continuous
  terrain world and no drawn borders. Region and area points come
  from the game's map links; unlinked areas stay without a
  point. The terrain preview applies per area, not for the world.
- No purchase advice: the catalogue proves quests, not access rights. Permissions
  for VIP and free content are not yet verified.
- No expansion images: own map excerpts were too small and
  restless as sigils, official motifs are missing for the older expansions. The maps
  carry only text.
- Access settings are not yet contained in the backup of the character store;
  they lie only locally under their own key.
- The order within an adventure is derived from area levels, not
  curated as a story.
- No overall percentage over all of Middle-earth.

## Checks

```bash
python3 -m unittest tests.test_abenteuer tests.test_abenteuer_seite
node tests/test_abenteuer.js
```

The page tests render `/de/abenteuer/`, `/en/adventure/` and `/fr/aventure/` via
the real front controller and check maps, names, levels, region markers and
assets. `test_abenteuer.js` additionally checks the region sums (progress,
level band from the editorial adventure ranges, connections).
