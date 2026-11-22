# Common filter component – local implementation status

## Scope

The common building blocks are implemented and checked with isolated synthetic
test pages. **Item search, sets and rewards are now bound locally in the
regular PHP templates, but not yet published.**
Quest givers, landmarks, factions, instances as well as the three crafting tabs
are likewise migrated locally to the component. No
publication has taken place. The detailed implementation plan lies under
`~/.opencode/plan/lotro-filter-navigation-handwerk-2026-11-12.md`.

- `web/filterzustand.js`: pure state normalisation, actions, chips and
  adapter-based URL codecs; directly testable with Node.
- `web/filteradapter.js`: declarative query codecs, client adapter with
  deduplication/pagination and server adapter with validated HTML model.
- `web/filtergedaechtnis.js`: compatible read/write/clear API; new entries
  use `{v:2,q:...}`, `readState` recognises legacy and unknown versions.
- `web/filter-ui.js` and `.css`: one mounted UI per list root, desktop sidebar,
  native mobile dialog, focus management, chips, range validation, history and
  request abort. UI texts come from the configuration.

## Adapter contract

`MQL_FILTER_UI.mount(root, {config, adapter, characterContext})` delivers
`ready`, `dispatch`, `getState`, `setCharacterContext` and asynchronous `destroy`.
The root needs an element with `data-filter-results`. Initial GET markup
can be marked with `data-filter-fallback` and is hidden only in extended
mode. The component is not to be mounted within a competing
form controller. Detach old page listeners when migrating.

`adapter.load(state, {signal, characterContext})` delivers
`{state,total,facets,pagination,capabilities,payload}`.
`adapter.renderResults(result,target)` renders exclusively the results.
Domain filter predicates, sorting and facets remain in the data adapter.
The public server adapter serialises only the configured URL codec,
never the character context.

Page-specific options (class profile, 22.11.2026):

- `MQL_ITEM_FILTER_SETUP(data, {ids, area, levelGroups, defaultSort,
  descendingSort, countLabel, emptyLabel})`; `levelGroups:false` removes the item
  and minimum level ranges together with their URL fields; an explicit empty
  `ids` list renders the empty state instead of the whole index.
- `MQL_TASK_FILTER_SETUP(rows, kind, {level, defaultSort, descendingSort,
  countLabel, emptyLabel})`; `level:false` removes the level range and its
  fields.

The wording and the level behaviour are in
[Class profile](klassenprofil.md).

Tree groups may set `exclusivePaths` (a branch replaces its ancestors and
descendants) or `exclusiveRoot` (a branch in another top-level key replaces the
previous category); the item search uses `exclusiveRoot:'kat'`.

Server response: exactly one root with `data-filter-area="<bereich>"` and
`data-filter-schema="1"`, in it a JSON script
`type="application/json" data-filter-model` and exactly one
`data-filter-results` fragment. Serialise JSON HTML-safe in PHP with JSON_HEX_TAG,
JSON_HEX_AMP, JSON_HEX_APOS and JSON_HEX_QUOT. The existing
GET endpoint must remain fully operable without JavaScript.
Pagination links of extended mode receive `data-filter-page="2"` etc.
A complete executable example is delivered by the isolated test fixtures.

## Reproducible tests

### Entity contract

`docs/datenraum/lotro-datenraum-entitaeten.json` is the one source for the
shape of each entity: row fields, filter groups, permitted relations,
progress and the status of each list.

- `component`: the list uses the common filter component.
- `direct`: at most five entries, direct rendering.
- `open`: known gap with reason; `tests/test_relationen_audit.py` checks that
  it actually lies above the threshold in the real data.

The list row carries only identity and classification (symbol, name, profession/kind,
level or crafting knowledge) and itself leads to the detail. Ingredients, sources, values and
further data belong exclusively on the detail page;
`tests/test_entitaeten_vertrag.py` fixes that.

### Relational lists on detail pages

For every relational list on a detail page the same global threshold applies:

- **0 up to and including 5 entries:** direct list, without filter component.
- **From 6 entries:** common filter component with the same result rendering
  as on the associated standard list; on detail pages it uses the full
  content width.
- The search row uses this full width. The search field grows flexibly, without
  a minimum width, so that the search button does not run off screen. The
  result bar may wrap individual controls; but it may neither
  exceed the filter container nor create a horizontal page overflow.
  On mobile devices wraps within the result bar are allowed.

The relation itself remains fixed context and cannot be removed by „Zurücksetzen“.
The threshold is defined in the PHP page model as
`FilterRegeln::MAX_DIREKTLISTE` and is taken over by the
relation renderer.

Local item search (no build/upload, binds only to loopback):

```bash
python3 tools/filter_vorschau.py --port 8924
```

Address: `http://127.0.0.1:8924/gegenstaende.html?lang=de` (also en/fr).
The preview replaces the old page controller with `gegenstaende-filter.js` exclusively on the local HTTP call.
Game categories, names and search data come from the existing item index,
not from fixtures.
Item links currently open the public detail page.

```bash
node tests/test_filterzustand.js
node tests/test_filteradapter.js
NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_filter_consistency.js
NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_item_filter_preview.js
```

The browser run starts and ends its own HTTP fixture server and
isolated Chromium contexts. It touches neither real character progress nor
hosting or preview processes of other sessions. Playwright is loaded from the
existing installation; no new npm build is needed.

Checked: DE/EN/FR × client/server × ten viewport widths
(360/390/430/768/900/901/1000/1001/1280/1440), checkbox OR, range validation,
chips, reset, reload, explicitly empty search address before memory, separate
area keys, dialog/focus trap/Escape/history, landscape orientation,
ten consecutive updates without double bindings, error responses,
invalid model/wrong area, competing requests, teardown/remount
and server-side search without JavaScript. Screenshots lie by default
under `~/.cache/llb-filter-browser-tests`, configurable via
`LLB_FILTER_ARTIFACTS`; no image artefacts in the repository.

## Remaining acceptance

- Expansion of the acceptance of the real references: complete filter combinations,
  same-member predicate, pagination, origin of the level values and detail back paths.
- Personal availability rules together with import/backup integration.
- Real device check with iOS Safari, on-screen keyboard and safe area.
- Screen reader check, 200 % zoom and complete detail back paths/scroll restore.

Fixture acceptance is explicitly no acceptance of these not yet migrated
production pages and no proof of a physical iOS test.

### Re-check of the real local item search

Corrected after a user screenshot: search field and counter/sorting lie in
separate flexible rows; tree nodes show checkbox and expanding without
double label; empty child lists create no expander.
Result rows again contain symbol, rarity colour and metadata.
Counters are formatted language-appropriately. The new real index browser run checks
DE/EN/FR at 390/768/901/1280/1440 px, sorting field in the visible area,
missing horizontal overflow, row components and mobile selection.
Desktop and mobile screenshots were additionally checked visually.

### Binding content grid, implemented locally

`filter-ui.css` now defines instead of individual marker/margin corrections:

- 280/300 px filter column, 24 px column gutter and a common upper edge of
  filter groups and result list. Result bar/chips/errors lie on the
  result column, search still on the full content width.
- Filter row: 16 px arrow, 16 px checkbox, flexible text, 7ch result number,
  each 8 px spacing. SVG arrows replace text characters/native markers.
  Group headings and flat options use the same axes.
- 16 px indent per sub-level, unchanged right number edge; group headings
  and single-line options are centred in their row. With wrapped
  labels checkbox and expand arrow remain on the **first text line**.
  Desktop at least 32 px, mobile at least 44 px row height. Maps
  12 px inside and between each other.
- Result row: 32 px symbol column, 12 px text spacing, identical edge for
  title/metadata and continuous dividing lines; pagination in the result container.

The real browser run additionally measures checkbox/text/number alignments between
category and rarity, arrow/checkbox centrelines, artificially multi-line
labels, result text axes and common container edges (tolerance 1 CSS px).
This grid meanwhile applies to all migrated pages documented below.

## Regular PHP references

`tests/browser_filter_php.js` checks item search and sets in DE/EN/FR,
390/901/1440 px, set selection/reload, dialog and no-JS search with real data.
The local test run is green; besides, 198 Python tests in the current state.
The sets keep their server-side predicate and the GET forms. The
server adapter reads structured form fields plus `data-filter-total`,
instead of parsing counters from translated texts. On migrated roots
the old sets.js controller ends before binding listeners.

The current local PHP server on port 8927 uses an isolated
Composer autoloader under `~/.cache/llb-php/filter-vendor-r4d4wh8c` and data
under `~/.cache/llb-php/phpdata`; existing shared vendor files remained
unchanged. Local addresses: `/de/gegenstandssuche/` and `/de/set/`.

While preparing the next wave, Factions::query was corrected: the
method now receives the already loaded faction rows for the permitted
geography values. The faction page is meanwhile migrated as well (see below).

## Local rollout: server catalogues and crafting

The reference phase above is meanwhile extended: `filter-server.js` reads
the existing GET forms of sets, quest givers, landmarks, factions
and instances. Geography remains region → landscape; nested options
can refer to the domain-separate landscape group via `groupId`.
Thereby the previous AND/OR predicates remain in the PHP. Sorting,
number ranges, proof checkbox and pagination remain normal GET parameters.
On migrated lists neither sets.js nor auftraggeber.js runs as a second
filter controller. Quest giver details use their previous progress logic.

`handwerk-filter.js` manages exactly one active filter instance for professions,
recipes and resources. Tabs and URL remain on switch/reload;
search texts are separate per tab. Profession/level/scope can be taken over.
The old recipe controller delivers only its result renderer;
old filter/tab listeners are not registered on the migrated page.
The profession overview is a public catalogue without an import; with proven
profession data the scope can be limited to own professions.

Materials come from all mandatory/optional recipe ingredients and are
deduplicated by item ID. Uses keep all profession/level references;
profession and level must be met by the same use. Production links
come from result IDs of the recipes. Explicit resource occurrences are own
resource records with real map references, NOT linked to items by name.
Unknown item origin remains unknown. Geography filter hits
direct resource occurrences, no guessed processing chains.

Positive recipe knowledge from old imports remains visible and filterable.
A negative crafting knowledge filter is available only with explicit complete recipe proof;
this rebuild itself creates no such proof. Importer and
backup format were not silently converted for that.

New acceptance: `tests/browser_filter_rollout.js` checks 21 real language/page
or tab combinations: all five requested areas in DE/EN/FR,
desktop/mobile, selection/reset/reload, server back/forward, geography child selection,
server forms without JS as well as synthetic legacy recipe state without invented
negative states. Additional reference tests and 60 fixture viewport combinations
remain. Currently 198 Python and 13 Node test files green.

Screenshots of the real pages lie under `~/.cache/llb-filter-browser-tests/`.
No upload, no push and no physical iOS/screen reader test takes place.
The complete original crafting data pipeline/importer extension is
a separate expansion, not claimed as done by the filter integration.

## Re-check: empty groups and find areas

Empty option groups are hidden after facet evaluation. Selected
zero hits remain visible/removable. Opening states are held independently
of the DOM so that after the return of a hidden group not
all previously open groups are unintentionally closed.

Find areas in the material tab form region → landscape → named find spot.
Page.php delivers for that exclusively the already existing language-correct
game map hierarchy (ID, parent, tier, name) as safe JSON. Grouping
happens via the map ID and parent chain proven in the resource index; a missing
assignment is explicitly named instead of guessed. Region/landscape/find spot
remain separate filter groups with a common nested UI.

Recipe categories are in the checked `CraftingUICategory.xml` a flat enum
with code/name, without parent field. The existing recipe export carries per recipe
exactly one such category and one profession. Do not output an overarching
category hierarchy as game data. The profession filter already narrows the offered
categories via facets.

`tests/browser_filter_refinements.js` checks DE/EN/FR: vanished empty
armour type for weapon sets, kept active zero selection, nested
find areas, landscape selection, reload and mobile view.
