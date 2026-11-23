# Filter inventory and cleanup

Status as of 22.11.2026. Companion to [Filterkomponente](filter-komponente.md)
and [Filter memory and sorting](filter-sortierung.md). Source: a review of
`web/*.js`, `php/src/*.php` and `php/templates/**` on 22.11.2026. The entity
contract in `docs/datenraum/lotro-datenraum-entitaeten.json` is the reference
for which filter groups an entity is supposed to have.

The document has two axes. The **filter axis** answers which questions a list
asks and in which order; the **result axis** answers what the result row shows,
which columns sort, in which direction and how the list pages. Both are
decisions about the same list and therefore belong together. The executable
form is `web/listen/<bereich>.js`; it is not maintained here, see
[Where a definition lives](#where-a-definition-lives).

## Purpose

One place that answers for every list: which filters exist, in which order they
appear, where a filter is missing or misnamed, and - since 22.11.2026 - what the
result row shows, which columns sort and how the list pages. The mechanics are
not in question - left column, immediate effect, chips, state in the address,
per-list memory, mobile dialog. The review is about coverage, order and
wording.

## Inventory: lists on the shared filter component

| Surface | Filter order as rendered | Verdict |
| --- | --- | --- |
| Item search (`/de/gegenstandssuche/`) | category (tree) → suitability → item level → minimum level → source → damage type → rarity | sound; "source" is a single checkbox |
| Class profile, items tab | category → suitability → damage type → rarity | sound (level sits above the list on purpose) |
| Quest finder (`/de/aufgabenfinder/`) | progress → level → region and area → theme → class → origin → properties | reference order, keep |
| Quest/deed lists on detail pages | completion → (deed: type, reward - quest: properties) → region and area → level | differs from the finder |
| Deed index (`/de/tat/`) | completion → type → reward → region and area → level | same component as the quest lists; adopts their order in step 1 |
| Map list (left column) | progress → reward (deeds only) + search | deliberately narrow, correct |
| Epic story | progress (narrows the tree) | correct |
| Crafting, recipes | profession → own professions → crafting tier → category → learning state | sound |
| Crafting, raw materials | profession → own professions → crafting tier → find area (region/landscape/spot) | sound; only the three questions the data answers (deliberate, 22.11.2026) |
| Crafting, professions | profession → own professions | sound |
| Rewards | type (= deed type) → region and area | wrong label; no suitability, no level |

## Inventory: server-rendered lists and special surfaces

| Surface | Filter order as rendered | Verdict |
| --- | --- | --- |
| Quest givers | region and landscape → type → quest properties → quest level | sound; level stands last |
| Vendors | region and landscape → type → stock (level) + "Stock for level X" | sound; "stock" is vague |
| Sets | class → equipment category → armour type → required character level | two "type" filters; level not visible in the list |
| Titles | origin → title kind → deed kind → region and landscape | place last; "only with a recorded source" missing |
| Instances | instance group → type → level → players → difficulty | usable; no place, no sorting |
| Factions | region and landscape → with reputation sources | sound |
| Landmarks | region and landscape → with quests | sound |
| Vendor detail (stock/barter) | minimum level → rarity → stock group | sound (22.11.2026) |
| Instance detail, loot | level → difficulty → players | ok; no suitability |
| Item detail "where from" | quest list as above; chests search only | ok |
| Search | no filters, grouped by type | type chips missing |
| Reputation (`/de/ruf/`) | search → only started | thin |

## Result axis: header, sorting, paging

Status 22.11.2026. Three shapes exist side by side: a heading row from
`web/treffer-zeile.js` ("Treffer · Stufen · Dein Fortschritt") that cannot be
clicked, real `<th>` cells in the crafting tables, and a `<select>` or two links
next to the list. None of them is tied to the column it labels, so a head may
name a column the list cannot sort and a list may sort by something the head
does not show. The target is one shape: the heading row **is** the table head,
every sortable column carries its sort key, a click sorts and turns the
direction, `aria-sort` names the state.

| Surface | Header today | Columns (target) | Sort keys | Direction | Default | Paging | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Item search | "Treffer · Gegenstandsstufe", not clickable | Name · Mindeststufe; item level, rarity and suitability stay in the name cell | `name`, `mindeststufe` (item level only as a legacy link) | both, first click ascending | `name` | scroll, 50 | umgesetzt (lokal) |
| Class profile (items, quests, deeds) | same row header, one level column | Name · Stufe · Fortschritt | `name`, `level`, `levelDesc` (quests, deeds); `name`, `mindeststufe` (items) | both | `levelDesc` (quests, deeds) / `mindeststufe` descending (items) | scroll, 50 | umgesetzt (lokal) |
| Quest finder, quest/deed lists, deed index | "Treffer · Stufen" | Name · Stufe · Fortschritt | `name`, `level` | both | `name` | scroll, 50 | umgesetzt (lokal) |
| Crafting (recipes, materials, professions) | real `<th>` (result, profession) | Name/result · Tier · Level or learning state | `name`, `tier`, `stufe` | ascending only today | `name` | scroll, 50 | C |
| Vendor detail (stock, barter) | no head, a select | Name · Mindeststufe | `name`, `mindeststufe` | both | `name` | scroll, 50 | umgesetzt (lokal) |
| Instance detail (loot, rewards) | no head, a "Name" select | Name · Chance (loot) or Aufgabe (rewards) | `name` | ascending | `name` | scroll, 50 (was 30) | umgesetzt (lokal) |
| Rewards | no head, no sort | Name; item level and reward type stay in the name cell | `name` | ascending | `name` | scroll, 50 | umgesetzt (lokal) |
| Map list (left column) | none | Name · Stufe | `name`, `level` | ascending | `name` | scroll, 30 | keep narrow |
| Server lists (quest givers, vendors, sets, titles, instances, factions, landmarks) | no clickable head; sort links or a select | Name · Level | `name`, `stufe` | both | `name` | "Page 1 of N" | D |

- **Item level is strength, minimum level is the wear requirement.** For items
  the result axis sorts by the minimum level; the item level stays visible in
  the name cell. Rarity is name colour plus meta text and never a column.
- **Progress** is a column that shows the state. The select that sets a state
  stays its own control, it is not a header control and progress does not sort
  in the reference. Quest and deed lists carry the control in the progress cell.
- **Unknown levels** stand last in both directions, the name is the tie-breaker.
  The rule is unchanged, see [Filter memory and sorting](filter-sortierung.md).
- **Page links** stay in the no-JS source of catalogue pages. In the browser both
  kinds become scrolling, "Weitere anzeigen" stays as the fallback.
- **The chance of instance loot** depends on level, tier and players of the
  chest; it is a value, not a sort key.
- **Rewards stay a source browser.** Name sorts, rarity and suitability filter.
  No category tree and no level column: only 27 % of the 6.568 rows carry a
  minimum level.
- Relational lists on detail pages follow their standard list's axis; the
  relation itself stays fixed context.

## Findings

- **Suitability is a filter in three places.** Item search, class profile and
  rewards filter by it (`eig`); the vendor barter list and instance loot carry
  the chip but not the filter. The vendor barter level range means the minimum
  level since 22.11.2026, so filter and column agree.
- **Quests have two different orders.** The finder puts level and place before
  theme and properties; the shared quest/deed list puts type and properties
  before place and level.
- **"Type" means four different things.** Rewards use it for the deed type,
  quest givers for person/creature/object, vendors for the vendor kind,
  instances for the instance kind.
- **One place word, three labels.** "Region und Gebiet" (finder, rewards),
  "Region und Landschaft" (quest givers, vendors, factions, landmarks, titles),
  "Fundgebiet" (crafting materials).
- **The item search source group has one option.** It holds "instance chest"
  because the compact item rows carry no other source (`?quelle=instanztruhe`
  was added for instance loot, deliberately). The other sources exist in the
  catalogue but not in that row format - a real source filter needs them in
  the rows.
- **Sets filter by a level the list never shows.**
- **The reward filter excludes everything without a source** (`row.sources`),
  matching the rule that the browser lists only evidenced rewards.

## Canonical order

One rule for all lists:

1. **Me** - progress, suitability, "fits me"
2. **Level** - the level range
3. **Place** - region and landscape
4. **Kind/category** - what it is
5. **Properties** - daily, group, instance ...
6. **Source/reward**
7. **Rarity** (items only, last)

Deliberate exceptions: the item search keeps the category tree first (it is the
navigation through 77k rows) with suitability directly below; the map list
stays at progress and reward; crafting starts with the profession.

## Where a definition lives

Five places, one job each:

| Place | Holds | Changed by |
| --- | --- | --- |
| `docs/datenraum/lotro-datenraum-entitaeten.json` | which filter groups an entity may have (domain) | contract and audit test (E) |
| this document | order, wording, gaps, result axis, decisions | people |
| `web/listen/<bereich>.js` | the executable definition: group order, labels, columns, sort keys, direction, paging | migration |
| the adapter (`web/*-filter.js`, `php/src/*.php`) | predicates, facets, comparators, query | domain work |
| `web/filter-ui.js`, `web/filterzustand.js` | state, address, chips, head behaviour, dialog | only centrally |

The inventory is prose and never read at runtime; that is why it may name the
order without competing with the configuration. The contract answers what is
allowed, not how a list looks. `web/listen/<bereich>.js` is authored for client
lists. A server list carries its definition in PHP (`php/src/FilterModel.php`
and the list class) and writes it as `data-filter-model` next to the no-JS
markup, so order, labels and sort keys exist once per list.

## Roadmap

| Step | Work | Touches | This document |
| --- | --- | --- | --- |
| A Cleanup | order and wording only, scheduled run 22.11.2026 23:00, no commit | `web/aufgaben-filter.js`, `givers/list.twig`, `titles/list.twig`, texts, vendor and instance labels | marked as a transition step |
| B Reference | item search: configuration, table head, sorting, scrolling | `web/listen/gegenstaende.js`, `treffer-tabelle.js`, `filter-ui.js`, `filterzustand.js`, `gegenstaende-filter.js`, CSS | result axis and the reference state |
| C Rollout | quest/deed lists, crafting, class profile; the filter order moves into the configuration | `aufgaben-filter.js`, `handwerk-filter.js`, `klassen.js`, `klassenprofil.md` | quests/deeds, finder and crafting done |
| D Server lists | PHP model as `data-filter-model`, Twig renders from it, scraping goes | `php/src/*`, `php/templates/*`, `filter-server.js` | all six lists done |
| E Contract test | configuration against the entity JSON | `tests/test_listen_config.py` | client configs checked; server definitions via the model test |

B is implemented locally on 22.11.2026: `web/listen/gegenstaende.js`,
`web/treffer-tabelle.js`, the sort direction in `filterzustand.js`, head clicks
and scrolling in `filter-ui.js`. Not published. Step A still changes no
component, no adapter and no state module.

The order of the quest/deed lists and the finder stands in
`web/listen/aufgaben.js` and `web/listen/aufgabenfinder.js`; the modules only
build the groups and listen to the definition.

The crafting lists follow on 23.11.2026. `web/listen/handwerk.js` holds the
group order, the columns and the sort keys of recipes and raw materials.
Recipes show Ergebnis · Beruf · Handwerksstufe · Gegenstandsstufe, plus
"Dein Fortschritt" when the import carries recipe data; materials show Sorte ·
Beruf · Handwerksstufe · Fundstellen. The table head sorts by result name,
crafting tier and result level; the sort select is gone, and `sort=stufe`
keeps its meaning for bookmarks. Ingredients, the critical success and the
category tree stay in the filters and on the recipe page, not in table
columns. The professions entry keeps the retired tab's order; the personal
profession overview is not a filter list.

Step D is implemented on 23.11.2026 for titles, factions, landmarks, vendors,
instances and quest givers. `php/src/FilterModel.php` writes `definition`,
`state`, `facets`, `total` and `pagination`; the definition holds group order,
labels, sort keys, columns and paging, so `filter-server.js` no longer collects
them from the markup. Every result list is the shared table: the head is a link
without JavaScript (`?sort=-name` or `?sort=stufe`, PHP sorts) and sorts in
place with JavaScript. A changed question returns to page 1.

Per list: titles and quest givers show their level as a sortable column;
vendors add „Ware ab Stufe“; factions keep the personal reputation column,
which appears only with an imported reputation; landmarks keep the grouped
area tree (Rohan → area group → area) through non-selectable heading nodes.
Instances keep their 200-entry page; the others use 30.

Step E follows on 23.11.2026. `tests/test_listen_config.py` evaluates every
`web/listen/*.js` definition and maps its filter and column ids to the contract
vocabulary in `docs/datenraum/lotro-datenraum-entitaeten.json`. Unmapped ids,
groups outside the entity's allowed set, unknown sort keys and a missing paging
mode become findings. The contract grew where the lists had answered a real
question the data room had not named yet: `eignung`, `quelle` and `schaden` for
items, `belohnung` for deeds, `eigene` and `geografie` for recipes plus
`fundstellen` as a raw-material row field, `titelart`/`tatart` for titles, and
`stufe` for vendors. Server definitions are covered by
`tests/test_filter_model.py` and the browser runs; they live in PHP, not in
`web/listen/`.

## Step 1 - cleanup (safe, no new data)

Applied in the scheduled run on 22.11.2026, 23:00 (Europe/Berlin):

- **Quest/deed lists** (`web/aufgaben-filter.js`): completion → level → region
  and area → properties (quests) or type and reward (deeds). Aligns the lists
  with the finder. The deed index (`/de/tat/`, `web/taten-index.js`) uses the
  same module and therefore takes the same order; if the catalogue index should
  keep the kind first, it needs its own variant.
- **Quest givers** (`php/templates/givers/list.twig`): quest level before quest
  properties.
- **Titles** (`php/templates/titles/list.twig`): region and landscape first,
  then origin, title kind, deed kind.
- **Reward label** (`web/texte-logbuch.js`, `web/belohnungen.js`): the filter
  legend becomes "Tatart" / "Deed kind" / "Type de prouesse" under a new key;
  `bl_art` stays for the quest detail line that uses it.
- **Vendor label** (`php/src/Vendors.php`, `web/entitaeten-listen.js`): "Art"
  becomes "Händlerart", the level range legend "Gegenstandsstufe der Ware".
- **Instance label** (`php/src/Instances.php`): "Art" becomes "Instanzart".
- **Place label** (`web/aufgaben-filter.js`, `web/karten-aufgabenfilter.js`,
  `web/texte-logbuch.js`): "Region und Gebiet" becomes "Region und Landschaft",
  matching the majority of the lists.

**This is a transition step, not the end state.** Until step C the order stands
in the old places. With the migration it moves into `web/listen/<bereich>.js`
and this list keeps only the reasoning. No further order edit belongs in the old
places after that.

Not part of step 1: no new filter groups, no data pipeline change, no
publication or upload. "Mindeststufe" keeps its name because
`tests/browser_filter_php.js` and the suitability texts depend on the word.

## Step 2 - open additions

| Gap | What exactly | Data | Cost |
| --- | --- | --- | --- |
| Suitability everywhere | rewards and vendor stock done 22.11.2026; instance loot shows the chip only | present | small |
| Vendor stock level | done 22.11.2026: minimum level in the filter, the column and the chip | present in the row (`ml`) | small |
| Rewards | done 22.11.2026: rarity and suitability, no level column | present in the row | small |
| Search | type chips with counts | present in the index | small |
| Titles | "only with a recorded source" (574 of 3,095 have none) | present | small |
| Crafting | "only missing" as a chip (next to the single learning-state group) | character present | small |
| Sets | level in the row and a "fits me" link (same pattern as "Stock for level X") | member minimum levels present | medium |
| Item search source | quest, deed, recipe, vendor, barter, chest in the row | only chest IDs today; the rest needs reverse references | medium |
| Reputation | "only with sources", sorting | present | small |
| Instances | region/landscape as a filter | not in the data; derivable only through quests | medium-large |

## Open decisions

1. Suitability as a filter everywhere, or deliberately chip only?
2. Should the quest/deed lists adopt the finder order (done in step 1 - revert
   if not wanted)?
3. "Region und Landschaft" everywhere (done in step 1) and precise "type"
   labels?
4. Scope: only order and wording, or also the additions in step 2?

### Decided for the item search reference (22.11.2026)

- **Column label "Mindeststufe".** The item level is no longer a sort key and
  moves into the name cell; the game word "Mindeststufe" stays because
  `tests/browser_filter_php.js` and the suitability texts depend on it.
- **Rarity** stays name colour plus meta text, no column.
- **Progress** remains a column that shows the state; the select stays its own
  control. It does not sort in the reference.
- **Sort keys** `name` and `mindeststufe`, both directions, first click
  ascending, unknown levels last. Address `sort=mindeststufe` and
  `sort=-mindeststufe`; `sort=stufe` and `sort=stufe-ab` are read as the minimum
  level for old links.
- **Paging** scrolls in steps of 50, "Weitere anzeigen" stays as the fallback.
- **Instance loot** takes the same step of 50; its chance stays a value.
- **Vendor detail** filters and sorts by the minimum level and shows the
  suitability chip (was the item level).
- **Class profile** starts at the minimum level descending; the item level no
  longer sorts there either.
- **Rewards** get deed kind, region and landscape, rarity and suitability, a
  sortable name, and no level column.
- **Reference** is the item search; the class profile follows it with the same
  columns and the minimum level as its default sort.

Implemented locally on 22.11.2026 with the same table: rewards, instance loot,
instance rewards, the vendor barter list, the quest finder, the deed index and
every quest/deed list on detail pages. Nothing is published.

## Verification

- `node tests/test_filterzustand.js`, `node tests/test_filteradapter.js`
- `python3 -m unittest tests.test_filterbereiche tests.test_questfinder -v`
- browser runs need a local PHP preview: `tests/browser_filter_php.js`,
  `tests/browser_filter_rollout.js`, `tests/browser_filterhierarchie.js`
- The order of filter groups is not asserted by any test today; the wording is
  (item search chips, the "Mindeststufe" label).
- The result axis has no test today. Step B adds
  `tests/browser_item_filter_tabelle.js` (clickable head, `aria-sort`, reversed
  order, stacked mobile, table semantics) and extends
  `tests/test_filterzustand.js` for the sort object and the direction.
- `tests/test_listen_config.py` (step E) checks every configuration against the
  entity contract.
