# Entity contract: UI reconciliation for editing

- **Status:** partly implemented. Since 23.11.2026 the **detail pages** of all
  entities follow one skeleton and are listed per entity under `detailseiten` in
  the contract (rules: [`docs/oberflaeche/entitaetsseiten.md`](../oberflaeche/entitaetsseiten.md),
  check: `tests/test_detailseiten_vertrag.py`). The rows below remain the audit
  of the other appearances (index, finder, map list, embedded relation list) and
  are still open.
- **Binding rules:** [`AGENTS.md`](../../AGENTS.md), section „Navigation, Karte und Darstellung“, and [`lotro-datenraum-entitaeten.json`](../datenraum/lotro-datenraum-entitaeten.json)
- **Current-state overview:** [arc42, section 5.9](../arc42/05-building-block-view.md#59-concrete-presentation-and-filter-matrix-by-entity-and-place-of-occurrence)
- **Work boundary:** the detail pages are built; the rows of this audit that
  describe index, finder, map and relation appearances are unchanged until they
  are worked through one by one.

## How to work through the list

Every entry is sorted by **entity** and below that by concrete **UI appearance**. „Auftritt“ means exactly the visible form: for instance a hit row in the finder, a detail page relation or a list on a map. The file links lead as directly as possible to the responsible template/module. Per appearance the following must be fixed:

1. which fields exactly may be visible;
2. which of them are only filter/search values or counters;
3. which filters, sorting and pagination the UI offers;
4. how missing data and non-linkable targets are handled;
5. which test secures exactly this UI form.

Deviations already confirmed in the code are marked **CORRECT**. Places not yet fully checked against every appearance are marked **RECONCILE** – they are not asserted errors.

## Shared requirements for all appearances

- [ ] The catalogue identity remains a stable ID; names are display/search text, not a substitute key.
- [ ] A relation entry stays in the parent context. Reset must not remove the parent relation.
- [ ] Up to 5 entries directly, from 6 the intended filter component – **except** the concrete list is expressly `direct` in the contract.
- [ ] A missing status stays unknown/neutral, never automatically „erledigt“, „offen“, „verfügbar“ or 0 %.
- [ ] Do not guess a link from an ambiguous name. Entries that cannot be resolved receive the text/omission display determined in the respective contract.
- [ ] Keep visible list row and detail content apart; a contract entry must apply per surface, not blanket for all appearance places.
- [ ] `component` must name the exact component. `direct` means: direct domain list even with more than five elements.

## Quest (`q`)

Contract: [`q` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L14)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Public quest index | [`entity/list.twig`](../../php/templates/entity/list.twig#L14), index model in `tools/build_php_data.py` | Alphabetical, crawlable link list; name and optional icon. No finder with quest facets. | [ ] Keep as its own appearance „Katalogindex“ in the contract; do not equate with the quest finder row. Record visible fields and page scope concretely. |
| Quest finder – hits | [`app/aufgabenfinder.twig`](../../php/templates/app/aufgabenfinder.twig#L1), [`aufgabenfinder.js`](../../web/aufgabenfinder.js#L1), [`aufgaben-filter.js`](../../web/aufgaben-filter.js#L257) | Name, icon, type/feature/level/area meta and progress control. Filters: topic, class, origin, region/area, features, level, status; dynamic groups are dropped when they do not distinguish any selection. Sortable by name/level; 30 initially, then more. | [x] The `flags` in the result row are classification and are now `merkmale` in `q.zeilenfelder` (EAV-03, 25.11.2026). Open: name filter groups, dynamic omission, sorting and the 30 limit in the contract. |
| Map – quest list | [`app.js`](../../web/app.js#L1), [`karten-aufgabenfilter.js`](../../web/karten-aufgabenfilter.js#L1) | Quest rows in the map context with status, compact meta row and selection behaviour; data loaded in stages. | [ ] Document the map row separately from the finder: permitted fields, status display, filter/sorting, reload and missing location. |
| Quest detail | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L6), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L250) | Name, optional chips/description, verified location, quest giver/prerequisite/reward areas, collapsed objectives. `required_by` is resolved as `related_quests`. | [ ] Accept `required_by`, rewards and context each as a separate appearance. „Belohnungen“ is a direct reward display, not the relation filter component. |
| Quests as source/relation list | [`RelatedLists.php`](../../php/src/RelatedLists.php#L16), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Shared quest adapter; the row renderer can output type, level, features, region/area and status. | [ ] Synchronise the feature meta with the decision for the finder row. Test the 5/6 threshold, context reset and sources without a valid URL. |

## Deed (`d`)

Contract: [`d` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L67)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Public deed index | [`entity/list.twig`](../../php/templates/entity/list.twig#L8), [`taten-index.js`](../../web/taten-index.js#L1) | Crawlable alphabetical server list stays hidden in the HTML; the client-side filter is visible. Filter hits contain icon, name, deed kind, level, area, features and status. 50 initially, „Weitere anzeigen“. | [ ] Describe the index appearance separately from the detail context; record concrete result fields/filter/sorting rules in the contract. As with quests, feature meta is not named in `d.zeilenfelder`. |
| Map – deed mode | [`app.js`](../../web/app.js#L1), [`karten-aufgabenfilter.js`](../../web/karten-aufgabenfilter.js#L1) | Map list with deed kind and verified status; shared area/landscape navigation with quests. | [ ] Record deed map row, filter groups and loading behaviour as their own appearance. |
| Deed detail | [`entity/deed.twig`](../../php/templates/entity/deed.twig#L6), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L450) | Kind chips, description, map action/location, facts, fixed and selectable rewards, collapsed objectives; context list. | [ ] Specify „Zusammenhang“ individually: which records go into it, how the context is fixed, which columns the row has. |
| Deeds as relation/source row | [`RelatedLists.php`](../../php/src/RelatedLists.php#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L173) | Shared quest/deed filter with result fields incl. features. | [x] Decision on `flags` as with `q`: `merkmale` is part of `d.zeilenfelder` (EAV-03, 25.11.2026). Open: secure the 5/6 threshold and link resolution. |

## Item (`i`)

Contract: [`i` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L106)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Item search – hits | [`gegenstandssuche.twig`](../../php/templates/app/gegenstandssuche.twig#L1), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Icon, name, category, rarity, category sub-values such as kind/slot/class/genus and a positive item level value. Filters: dynamic category tree, rarity, level range; sortable by name/level; 50 plus more. | [ ] The contract names only `symbol/name/seltenheit/stufe/art`; clarify exactly which sub-values count as `art` and which visible meta is additionally permitted. Do not mistake search and filter values for visible row fields. |
| Public item catalogue | [`entity/list.twig`](../../php/templates/entity/list.twig#L14) | Plain alphabetical link list, optional icon; reference to the item search. | [ ] Document as its own appearance; do not equate with the richer hit of the item search. |
| Item detail – description/stats | [`entity/item.twig`](../../php/templates/entity/item.twig#L4) | Head, quality/kind chips, description, stats, set/variant block, if present. | [ ] Check the boundary to the list row; missing stats/set data stay hidden. |
| Item detail – „Woher“ quests/deeds | [`entity/item.twig`](../../php/templates/entity/item.twig#L23), [`item-task-filter.js`](../../web/item-task-filter.js#L7) | Template switches to a filter container from 6. JS mounts only beyond 10; with 6–10 the fallback stays. | **CORRECT:** keep the shared threshold at 5. Test cases 5, 6, 10, 11 for both source types `q`/`d`; filter status with and without import. |
| Item detail – „Wofür“ (used as ingredient) | [`entity/item.twig`](../../php/templates/entity/item.twig#L30) | Up to 5 direct recipe links. From 6 local search plus role choice normal/optional; no shared filter UI, sort choice or pagination. | **CORRECT:** satisfy the contract `used_in=component` with the intended shared recipe list component. Keep the role filter if possible in the adapter. Test result fields, sorting, pagination, URL prefix and reset like the recipe list. |
| Item detail – „Herstellung“ | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1097), [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L237) | Own relation `recipe_made`; from 6 shared recipe filter, separate from `used_in`. | [ ] Check that the separate direction, normal/critical success and role statement are retained in row/filter. |
| Item detail – vendor/barter sources | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1112), [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L78) | Vendors and barter sources as separate groups; vendors from 6 shared location/type/search component, barter with its own adapter without location facets. Barter rows can stay unlinked. | [ ] Map contract `where_vendors` and `where_plain` onto these exact groups; clarify whether `where_plain` also covers gathering resources. Test text fallback and missing IDs. |
| Item detail – gathering resources, variants, set | [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1083), [`entity/item.twig`](../../php/templates/entity/item.twig#L4) | Variants and set are separate blocks; gathering resources contain kind/ profession/level and find areas with map links. | [ ] These visible relations are missing as their own, clearly named appearances in the contract. Decide whether a separate relation type or a separate data space; fix row, filter and location fallback per group. |
| Vendor detail – item offer | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L15), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Up to 5 direct item rows; from 6 the item search adapter with search/category filters, sorting and page window. | [ ] Document as an item appearance in the vendor context; test that the vendor ID is retained as fixed context. |
| Set detail – item parts | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L6) | Set part cards with item name, possibly icon, chips, required class, armour, stats/bonuses; a missing item page stays unlinked and grouped by name. | [ ] Do not treat as a plain item list row. Specify the visible set detail fields as their own card. |
| Quest/deed reward | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L11), [`entity/deed.twig`](../../php/templates/entity/deed.twig#L13), [`entity/reward.twig`](../../php/templates/entity/reward.twig#L1) | Reward kind, name, quantity insofar as greater than 1, icon; link only with resolved target. | [ ] Secure fixed/selectable reward as its own output form; derive no availability from a reward statement. |

## Recipe (`recipe`)

Contract: [`recipe` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L171)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Crafting – recipe hits | [`app/handwerk.twig`](../../php/templates/app/handwerk.twig#L1), [`handwerk-filter.js`](../../web/handwerk-filter.js#L132), [`rezepte.js`](../../web/rezepte.js#L1) | Table row with recipe name, profession/level/category and crafting knowledge by table/group context; name leads to the detail. Filters profession, tier/level, category, crafting knowledge; possibly own professions; sorting name/tier/item level; 50 plus more. | [ ] Specify row fields and filters concretely per crafting tab. Crafting knowledge only with sufficient import evidence; missing stays unknown. |
| Item detail – `used_in` and `recipe_made` | See [`entity/item.twig`](../../php/templates/entity/item.twig#L30) and [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L180) | Two directions; `recipe_made` uses the shared component, `used_in` currently local search/role choice. | **CORRECT:** the shared adapter must use the same recipe row/sorting/pagination rule in both directions; retain the direction as fixed context. |
| Recipe detail – ingredients | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L5) | Ingredients and optional ingredients as direct lists with quantity, possibly icon/chance; item link only with an existing target page. | [ ] The contract lists `ingredients` expressly as `direct`: keep it that way. Origin toggle only with a verified answer; quantity/role/chance belong here, not in the recipe hit row. |
| Recipe detail – result/profession | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L5), [`entity/profession.twig`](../../php/templates/entity/profession.twig#L5) | Profession, tier, category, possibly item level, critical result and recipe parameters. | [ ] Result link only with a resolved item ID; missing critical ID as text. Profession leads into the crafting application, not to a profession detail page. |

## Profession (`p`)

Contract: [`p`/Beruf in the entity contract](../datenraum/lotro-datenraum-entitaeten.json)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Crafting – profession tab | [`app/handwerk.twig`](../../php/templates/app/handwerk.twig#L1), [`handwerk-filter.js`](../../web/handwerk-filter.js#L132) | Profession name and, depending on local character progress, known level/XP rows. Filters profession and „eigene“ only with a character; sorting name, 50 plus more. | [ ] Show concrete row fields and the personal status basis per tab in the contract. Without import, show no progress values. |
| Recipe detail – profession link | [`entity/recipe.twig`](../../php/templates/entity/recipe.twig#L6) | Profession name links into crafting/recipes, no profession detail page. | [ ] Keep in the contract expressly as a navigation link instead of a profession detail entity; do not document the old profession URL as a list appearance. |

## Set (`set`)

Contract: [`set` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L211)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Set browser – hits | [`sets/list.twig`](../../php/templates/sets/list.twig#L17), [`Sets.php`](../../php/src/Sets.php#L154) | Several item icons, set name, part count, aggregated class/armour type. Filters: search set/item names, class, equipment type, armour, character level from/to. All conditions must be met on the same available part. Sorted by name/ID; 30 per page. | **RECONCILE:** the contract permits `symbol/name/stufe` but does not name part count and class/armour meta. Decide whether the metadata is added as a permitted classification or disappears from the row. |
| Set detail – set parts | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L3), [`set_viewmodel.py`](../../tools/set_viewmodel.py#L8) | Cards with name, icon, chips, class/armour/stats/bonuses; missing item pages stay text, identical unresolved names are grouped with a count. | [ ] `members=direct` is express; do not force a filter switch. Describe card fields and the grouped fallback row individually in the contract as detail display. |
| Set detail – bonuses | [`sets/detail.twig`](../../php/templates/sets/detail.twig#L22) | Threshold and existing bonus rows, unclear/missing data according to the data model. | [ ] Do not pull into hit rows; show only verified thresholds/effects. |
| Item detail – set membership | [`entity/item.twig`](../../php/templates/entity/item.twig#L4), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L1137) | Set head, parts and bonuses as an item detail block, if a set ID is resolvable. | [ ] List as its own item detail appearance; set link only with a resolvable set page. |

## Quest giver (`giver`)

Contract: [`giver` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L242)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Quest giver browser – hits | [`givers/list.twig`](../../php/templates/givers/list.twig#L38), [`Givers.php`](../../php/src/Givers.php#L276) | Name plus meta: kind, title, up to three locations, level range, quest count; 30 per page. Search, region/landscape tree, kind, level range, features; sortable by name/level. | **RECONCILE:** the contract row names icon/name/kind/area/level, the code shows title and quest count but no icon. Fix which fields are permitted, then align both sides. |
| Quest giver detail – location | [`givers/detail.twig`](../../php/templates/givers/detail.twig#L19) | Verified maps/pins, coordinates, area path and route link. Missing image/location data is omitted. | [ ] Specify the location map as a detail block separately from hit meta; add no coordinate or map when not present. |
| Quest giver detail – quests | [`givers/detail.twig`](../../php/templates/givers/detail.twig#L32), [`Givers.php`](../../php/src/Givers.php#L379) | All assigned quests as name, level, area and chips; client-side search, progress display, „Erledigte ausblenden“. | [ ] Make status/import limits, search scope, sorting and missing quest IDs concrete in the contract. The relation is fixed in the detail context. |
| Quest page – quest giver link | [`entity/quest.twig`](../../php/templates/entity/quest.twig#L10), [`php_viewmodel.py`](../../tools/php_viewmodel.py#L250) | Single resolved quest giver link; several source assignments remain in the data model. | [ ] The contract should make clear that the detail page does not necessarily show all quest givers as a list. |

## Vendor (`vendor`)

Contract: [`vendor` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L275)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Vendor browser – hits | [`vendors/list.twig`](../../php/templates/vendors/list.twig#L36), [`Vendors.php`](../../php/src/Vendors.php#L1) | Name plus meta from kind, locations and goods count; filters search, region/landscape, type and level range per browser; name/ID, 30 per page. | [ ] Compare contract fields `symbol/name/art/gebiet/anzahl` with the concrete output; do not declare invisible fields as a visible row. |
| Vendor detail – locations | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L8) | Per place map/pin, location path, coordinates and map/route action, only if available. | [ ] Document the detail appearance; a region text without a matching image frame must not become an invented pin. |
| Vendor detail – goods | [`vendors/detail.twig`](../../php/templates/vendors/detail.twig#L15), [`gegenstaende-filter.js`](../../web/gegenstaende-filter.js#L5) | Up to 5 simple item rows; from 6 item filter, sorting name/level and 50 plus more. | [ ] Compare contract relation `items=component` with the same item row/filter semantics as the item search; the vendor remains fixed context. |
| Item detail – vendor source | [`entity/item.twig`](../../php/templates/entity/item.twig#L24), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L78) | Vendor name with link; from 6 search, location and vendor type in the shared component. | [ ] Relate contract `where_vendors` to this concrete variant; do not output an unknown vendor ID as a URL. |

## Title (`title`)

Contract: [`title` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L306)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Title browser – hits | [`titles/list.twig`](../../php/templates/titles/list.twig#L44), [`Titles.php`](../../php/src/Titles.php#L187) | Title name plus meta from source/origin and derived locations/source count; search, quest/deed origin, deed kind, region/landscape; name/ID, 30 per page. | [ ] Define contract fields `name/quelle` and filters `geografie/art/herkunft` per browser appearance; concretely permit or remove meta and source count. |
| Title detail – sources | [`entity/title.twig`](../../php/templates/entity/title.twig#L5), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Source name plus optional addition; link with valid URL, otherwise text. Large groups can be filtered separately by quests/deeds. | [ ] Test: mixed source types, valid/missing links, 5/6 threshold, addition text, context reset. |
| Reward browser | [`app/belohnungen.twig`](../../php/templates/app/belohnungen.twig#L1), [`belohnungen.js`](../../web/belohnungen.js#L1) | The current browser leads items, not titles; title reward data serve other catalogue/search processes. | [ ] Record in the contract that reward data is not the same as a public title hit list. |

## Virtue (`virtue`)

Contract: [`virtue` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L335)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Virtue detail – sources | [`entity/virtue.twig`](../../php/templates/entity/virtue.twig#L5), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Virtue name and source rows with optional addition; a valid URL becomes a link, otherwise plain text. Large source lists use the quest/deed filter, insofar as a relation model exists. | [ ] Fix source, addition and link fallback per source type; test the 5/6 threshold and render fallback. |
| Quest/deed – virtue reward | [`entity/reward.twig`](../../php/templates/entity/reward.twig#L1), [`entity/quest.twig`](../../php/templates/entity/quest.twig#L11) | A virtue can appear as a reward statement; its own link only with a resolvable target page. | [ ] Separate the reward display from the virtue source list. |
| Reputation/reward application | [`app/belohnungen.twig`](../../php/templates/app/belohnungen.twig#L1), [`belohnungen.js`](../../web/belohnungen.js#L1) | The reward browser currently filters items; virtues are no hits in this browser. | [ ] The contract should explicitly distinguish this non-appearance from the detail/reward data space. |

## Faction (`f`)

Contract: [`f` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L362)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Faction browser – hits | [`factions/list.twig`](../../php/templates/factions/list.twig#L37), [`Factions.php`](../../php/src/Factions.php#L167) | Name plus locations derived from reputation sources; search, region/landscape and „mit Rufquellen“; name/ID, 30 per page. | [ ] Compare contract `symbol/name/gebiet` with the real row; no icon is visible in the template. Filter „Quellen“ is boolean, not a source type facet. |
| Faction detail – rank and sources | [`entity/fraktion.twig`](../../php/templates/entity/fraktion.twig#L7), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Description, rank levels, separate quest/deed source groups with level/strength/location addition; own reputation remains character state. | [ ] Check fields, filter adapter, threshold and fallback per source type; the rank list is a direct detail display. |
| Reputation application – character progress | [`app/ruf.twig`](../../php/templates/app/ruf.twig#L1), [`ruf.js`](../../web/ruf.js#L1) | Local imported reputation; unknown points as „–“, level progress only on verified data. | [ ] Do not mix with static faction list/detail page; name the contract boundary between catalogue and character data. |

## Landmark (`l`)

Contract: [`l` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L392)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Landmark browser – hits | [`landmarks/list.twig`](../../php/templates/landmarks/list.twig#L37), [`Landmarks.php`](../../php/src/Landmarks.php#L1) | Name plus area/region and quest count; filters search, region/landscape, „mit Aufgaben“; name/ID, 30 per page. | [ ] Contract fields `name/gebiet/aufgaben` fit in principle; mark per field visible vs filter/counter. Document „Ohne Landschaft“ separately. |
| Landmark detail – location | [`entity/landmarke.twig`](../../php/templates/entity/landmarke.twig#L5) | Map/pin, coordinates, map/region link and map action only with an existing position. | [ ] If position is missing: location block/pin is dropped; test that as a mandatory fallback. |
| Landmark detail – quests | [`entity/landmarke.twig`](../../php/templates/entity/landmarke.twig#L13), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Assigned quest links; a large list can use the shared quest filter. | [ ] Do not output `targets` as an exact completion location; secure link resolution and the 5/6 threshold. |

## Area (`area`)

Contract: [`area` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L421)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Area detail – geography | [`entity/area.twig`](../../php/templates/entity/area.twig#L7) | Area name/map, map app action, parent region and direct sub-areas. | [ ] Record the child list separately from the entity relation list; only existing map/area links. |
| Area detail – content tabs | [`entity/area.twig`](../../php/templates/entity/area.twig#L14), [`RelatedLists.php`](../../php/src/RelatedLists.php#L33), [`entitaeten-listen.js`](../../web/entitaeten-listen.js#L31) | Tabs Aufgabe → Tat → Gegenstand with counts; up to 5 direct links, from 6 a type-dependent shared filter component. The parent area remains context. | [ ] Document exact row fields, actually active filter groups, sorting and page window per tab. Check whether items are clearly marked by derived source locations. |
| Map/adventure – area | [`abenteuer.twig`](../../php/templates/app/abenteuer.twig#L1), [`abenteuer.js`](../../web/abenteuer.js#L1), [`abenteuer-logik.js`](../../web/abenteuer-logik.js#L1) | Area as map entry/point or regional area list with personal progress/level fit, if a data basis is present. | [ ] Specify this appearance separately from the PHP area detail page; missing position/import values stay empty instead of estimated. |

## Region (`region`)

Contract: [`region` in the entity contract](../datenraum/lotro-datenraum-entitaeten.json#L452)

| UI appearance | Code/element | Current state per code | Target/change |
|---|---|---|---|
| Region detail – sub-areas | [`entity/area.twig`](../../php/templates/entity/area.twig#L7) (template for area and region) | Name/map, parent/child context and direct sub-areas insofar as present. | [ ] Check which fields are actually created for regions and conditionally dropped in the same template; do not adopt area fields wholesale. |
| Region detail – aggregated content | [`entity/area.twig`](../../php/templates/entity/area.twig#L14), [`RelatedLists.php`](../../php/src/RelatedLists.php#L33) | Quests/deeds/items from region members, separate tabs and a separate adapter per type. | [ ] Record the aggregation rule and the region as immutable filter context explicitly; do not confuse area and region as a direct `fk` edge. |
| Adventure – region | [`abenteuer.twig`](../../php/templates/app/abenteuer.twig#L1), [`abenteuer.js`](../../web/abenteuer.js#L1) | Region as map overview with area markers; progress ring only with import, point only with verified map link. | [ ] Keep as its own app appearance; do not transfer a general filter browser rule to map points. |

## Instance (finder appearance, no catalogue detail entity)

Code: [`instances/list.twig`](../../php/templates/instances/list.twig#L1), [`Instances.php`](../../php/src/Instances.php#L90)

| UI appearance | Current state per code | Target/change |
|---|---|---|
| Instance finder – result row | Name, group/cluster and verified metadata; no instance detail page and no automatic quest link. Search, cluster, kind, level range, group size, difficulty; grouped output, 200 per page. | [ ] Keep as an independent browser entity in the contract or expressly mark it outside the 13-entity catalogue. Check visible metadata and cases without level/group per field. |

## Deviations with confirmed need for correction

- [ ] **Item quest/deed sources:** unify the 6/11 threshold (item, EAV-01).
- [ ] **Item „Wofür“:** shared recipe component instead of local search/role filter without sorting/pagination (item/recipe, EAV-02).
- [x] **Quest/deed row:** the muted meta line ("Aufgabe · täglich · Gruppe") is
  classification, not content, so the contract permits it as `merkmale` for
  `q` and `d` instead of removing it from the row. `tests/test_entitaeten_vertrag.py`
  checks the field and the renderer (`web/aufgaben-filter.js`, `row.flags.map`)
  together (quest/deed, EAV-03).
- [ ] **Set browser row:** decide part count and class/armour meta against permitted contract fields (set, EAV-04).
- [ ] **Quest giver browser row:** reconcile title/quest count and missing icon with contract fields (quest giver, EAV-05).

## Cross-cutting check gaps

- [ ] `tests/test_entitaeten_vertrag.py` currently checks entity set, language segments, permitted relation types, list status vocabulary and some forbidden row contents. It does not check whether every concrete UI appearance renders exactly its contract fields.
- [ ] Fix one test per table row above: DOM fields, link targets/fallback, filter state, sorting/pagination and the 5/6 threshold.
- [ ] For the filter state per surface check URL, stored filter memory, reset, back/forward, tabs and fixed parent context.
- [ ] Test with and without character import; character data stays local and must not be treated as a server/catalogue relation.
- [ ] Accept DE/EN/FR, desktop/mobile as well as JavaScript and server fallback for every changed appearance.
- [ ] After implementation, synchronise the current-state matrix in arc42 and the entity contract; only then close this checklist.

## Do not count as deviation

- `recipe.ingredients` and `set.members` expressly carry the status `direct` in the contract. Their direct detail display even with more than five elements is therefore no threshold error.
- An entry without a resolvable target ID may appear as unlinked text if exactly this fallback is fixed in the contract for the appearance.
- A public index list may show fewer fields than a finder. For that, index and finder must be modelled as different UI appearances in the contract.
