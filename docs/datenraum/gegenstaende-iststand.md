# Items: current state, filter page and integration path

**Status as of:** 17 November 2026  
**Purpose:** resilient baseline before changes to item data  
**Status:** inventory with a first partial implementation of the detail page

## Short summary

The website uses a shared item namespace with **52,798**
items. Of those, **40,755** have a supplementary detail record.
The same item set feeds both the detail pages and the filter page,
but through two different data models:

1. `daten/items.json`: shared, compact item record for catalogue,
   recipes and item pages.
2. `web/gegenstaende-<sprache>.js`: separate, language-dependent search rows for
   the item search.

The search is already a product area of its own and must be reviewed with every
change to the item model. It currently shows category,
quality, classification and level, but does not filter by binding, stats,
sources or use.

The clearest proven loss is binding: in the 40,755 detail items
25,809 records carry the compact value `binding=1`. The underlying
client set distinguishes 12,987 `BIND_ON_ACQUIRE` and
12,822 `BOUND_TO_ACCOUNT_ON_ACQUIRE` within it. The page cannot distinguish these two cases
today.

A second, independent modelling finding concerns recipe relations:
`build_items.py` currently stores critical results in `zutat`. The
detail view uses `zutat` as "used for/as ingredient". That way a
critical result can appear as an ingredient; at the same time it is not recorded as a
separate crafting of the item. Optional ingredients from
the recipe field `o` are likewise not traversed in this item back-relation. Before a change the relation must therefore be
separated by role.

## 1. Data set at the current local state

The following counts come from the generated files present in the repo,
not from a fresh DAT extraction:

| Data set | Records | Use |
| --- | ---: | --- |
| `daten/items.json` | 52,798 | shared item namespace |
| `daten/gegenstand-details.json` | 40,755 | item details, mainly equipment |
| `web/gegenstaende-de.js` | 52,798 | German search rows |
| `web/gegenstaende-en.js` | 52,798 | English search rows |
| `web/gegenstaende-fr.js` | 52,798 | French search rows |
| Item details with at least one set | 10,487 | sets are linked separately |

In `items.json` the field keys are present in every record; many
values are `null`, empty or an empty list, however. A present
key is not evidence of a present source value.

## 2. Actual pipeline

### 2.1 Shared item namespace

`build_items.py` generates `daten/items.json`. The records are merged via the
eight-digit item ID, never via the name.

| Input | Is used for | Restriction |
| --- | --- | --- |
| `daten/gegenstand-details.json` | names initially as fallback, quality, level, binding, category, slot, subtype, values | only 40,755 items; `binding` already compacted to 0/1/2 |
| `web/belohnungen-<sprache>.js` | names, partly quality/level, quest/deed sources | only relations contained in the reward export |
| `recipes-2026-11-06/recipes.json` | recipe name, normal result, ingredients and critical result | recipe roles are currently mixed in the back-linking; details below |
| `web/vorkommen-de.js` | resource/gathering spot assignment | no item ID key in the spawn source; assignment partly name-based |
| complete item export `items-2026-11-08/items.json` | at the end name per language and icon | overwrites present names if a cleaned DAT name exists |

The resulting item fields:

| Field in `items.json` | Content today | Origin / behaviour |
| --- | --- | --- |
| `n` | localised names | last preferably from the complete item export |
| `q` | quality code | details, otherwise reward data; compact/enum-dependent values |
| `l` | level | details, otherwise reward data; missing is partly `null` |
| `b` | binding 0/1/2 or `null` | details; no account/character distinction |
| `kat`, `slot`, `sub` | category, slot, subtype | details; for the item search partly added from the complete export |
| `ic` | icon ID | complete item export |
| `w` | armour/combat values | only values that count as truthy during the merge; 0 values are not adopted |
| `quellen` | quest/deed/item sources | reward export |
| `rezepte` | recipe IDs that produce the item | currently only normal result `r` |
| `zutat` | recipe IDs in which the item appears | regular ingredients `i`; additionally, wrongly, critical result `cr`; optional `o` are missing |
| `vor` | gathering spot assignment | cross-language name matching, including stem/token heuristic |

### 2.2 Item search and filter page

`build_gegenstandssuche.py` generates `window.MQL_GEGENSTAENDE` in
`web/gegenstaende-<sprache>.js`. It combines:

- the shared set from `daten/items.json`;
- the complete item export as the preferred source for names, category,
  quality, slot, type and level;
- Companion `items.xml` for ItemClass and EquipmentCategory;
- the respective client enums and DE/EN/FR labels.

The filter record is a position-based array:

```text
[ID, Name, Icon, Category, Quality, Slot, Type, Level, ItemClass, EquipmentCategory]
```

The filter page turns the values into search rows; the PHP data build additionally splits
the same rows for relational lists into `filter-i` shards. That does not change the search page set.

#### Filter tree and selection

`web/gegenstaende-filter.js` defines the valid filter axes per category:

| Category | hierarchical selection |
| --- | --- |
| Armour | armour type → slot |
| Weapon / legendary weapon | slot → weapon type |
| Jewellery | EquipmentCategory |
| Other (`ITEM`) | ItemClass |
| Legendary item | slot |
| Essence | category only |

Besides that there are:

- name/ID search, with diacritic-insensitive normalisation;
- multiple selection quality;
- level range;
- sorting by name or item level;
- 50 hits per load section;
- facet counters, each calculated without its own filter group;
- URL state (`q`, `qual`, `von`, `bis`, `sort`, filter branch `k`);
- shared filter memory via the existing filter component.

The search invents no types: unknown category is omitted,
unknown quality gets the value 0. Within the current data there are
165 rows with quality 0 and 157 rows without a positive item level. With an active
level filter, items without a positive level are not considered.

**Not part of the search filters are:** binding, minimum usage level, scaling,
Unique, stats, set, vendor, rewards, recipe roles and resource occurrences.
That is today's functional scope, not a statement that these filters would be
impossible in domain terms.

### 2.3 Item detail page

The active runtime is the PHP application:

```text
items.json + details/relation sources
    → tools/php_viewmodel.py:item_view()
    → tools/build_php_data.py:page-i shards
    → php/src/Data.php:page()
    → php/src/Page.php
    → php/templates/entity/item.twig
```

`tools/build_php_data.py` additionally builds language-dependent
`filter-items.json` label data as well as `filter-i` rows for embedded
relation lists. PHP renders a requested detail page from its
`page-i` record; the complete catalogues are not traversed in the request.

The detail page currently shows:

- name, icon, category/slot/subtype statement;
- quality, minimum usage, item level, binding, scaling, unique,
  essence slots as chips;
- description;
- armour, DPS, damage, speed, damage type and stats;
- gathering spots with known find spots;
- quest/deed sources;
- "crafted by", "used in";
- set links, class and search page entry.

Some fields from `gegenstand-details.json` are not used or only indirectly.
In particular `vendors` is currently output only as a boolean hint, not as a concrete vendor list. `durability`, `maxStack`,
`maxLevel`, `recipe`, `set` and further raw values do not necessarily appear
as separate item facts. Set memberships are now collected from the
set source; not only the single `set` field of the item details is
treated as a complete membership.

The separate `build_gegenstaende.py` is the historical static
page generator and at the same time relevant for comparison/check paths. For the
normal published PHP run, `tools/build_php_data.py` is authoritative.
Both paths must be checked for deviations when shared data changes.

## 3. Most important concrete gaps

### Binding

The client set `items.xml` contains for the 40,755 detail items:

| Client value | Count | current numeric value |
| --- | ---: | ---: |
| `BIND_ON_ACQUIRE` | 12,987 | 1 |
| `BOUND_TO_ACCOUNT_ON_ACQUIRE` | 12,822 | 1 |
| `BIND_ON_EQUIP` | 14,689 | 2 |
| no binding attribute | 257 | 0 |

`tools/php_viewmodel.py:item_view()` maps 1 to a generic
"bound on acquire" display. Account binding is therefore not visible on the
detail pages either. The filter page currently has no
binding filter at all.

### Recipe roles

`build_items.py` reads the flat recipe object as follows:

- `r[0]` → `rezepte` (normal result);
- `i` → `zutat` (regular ingredients);
- `cr[0]` → likewise `zutat` (critical result is misclassified as ingredient);
- `o` → is not read in this back-linking.

`item_view()` reads `rezepte` as `crafted_by` and `zutat` as `used_in`.
As a result, "crafting" and "use as ingredient" are not cleanly kept
apart. The variant data of the recipe export is likewise not written per variant into the item relation
at this point.

### Origin and find spots

- `quellen` covers the quest/deed relations that the
  reward export already supplies.
- Vendor IDs in the detail record are not resolved into a
  list of concrete vendors for the item page.
- `vor` is partly derived from names, because the spawn source contains no
  item IDs. This assignment is not as strong as an
  explicit item ID reference and should stay marked as such.
- The detail page hides a gathering spot row without a known
  map find spot; this is sensible, but does not say "the resource occurs
  nowhere".
- **Barter, containers and disenchanting are entirely missing.** The sources exist
  and are modelled in [Barter, containers, disenchanting and
  a slim item set](tausch-behaelter-zerlegung.md); the item page does not show them yet.
  36,096 barter gifts and 10,315 disenchantable sources thus hang in the data space without
  display.

### Filter page

The filter page already has stable client keys, language labels,
filter URL and dynamic facets. For item quality, additional filter dimensions would be possible in future, among them binding type, Unique,
scaling or individual equipment properties. These would however require
larger filter data, additional URL/memory rules and a clear
domain definition.

## 4. Goal for the next data change

It is not yet decided which properties should additionally become
filters in the search. The first change should therefore **not presuppose a new
filter scope**. It should first make the data model more lossless:

1. Leave the existing `b` unchanged for now as a compatibility field.
2. Additionally add an explicit, stable value, e.g.
   `bindingMode`:
   `NONE`, `BIND_ON_ACQUIRE`, `BOUND_TO_ACCOUNT_ON_ACQUIRE`,
   `BIND_ON_EQUIP`, `UNKNOWN`.
3. Take the value from the proven item definition, not from the name
   and not guessed back from the old `b`.
4. Make the new field available in the item detail model and tests.
5. Only then decide whether the filter page gets a binding filter.

A separate schema applies to the item search. If binding is added there later,
both the search row and URL encoding,
filter memory, facets and DE/EN/FR labels must be extended together.
A detail field alone must not change the filter page unnoticed.

## 5. Proposed work sequence

### Step A – Record input and field paths

- [x] Traced current sources, generators, PHP page model, item detail template and
  item search.
- [x] Recorded the filter page as its own data/presentation track.
- [x] Started with the item binding case. For the website build, the
  active Companion lore `items.xml` supplies the explicit binding mode, as far as an
  item there has a binding attribute; `gegenstand-details.json` remains
  the source for the existing detail set.

### Step B – Adopt binding losslessly

- [x] Compared `items.xml`/DAT binding for the website item IDs with
  `gegenstand-details.json`.
- [x] Added new `bm`/`bindingMode`, preserved `b` during the transition period.
- [x] Checked detail pages DE/EN/FR separately for character binding,
  account binding, equipment binding and unknown/null.
- [x] Regression test with at least one item each from the four cases;
  additionally a count test for the complete detail set.

### Step C – Correct recipe roles

- [x] Modelled the item back-relation as a typed relation:
  `regular_result`, `critical_result`, `ingredient`, `optional_ingredient`.
- [x] Wrote quantities along where the export proves them.
- [ ] Deliver legacy fields in parallel during the switch or
  update consumers in a coordinated way.
- [ ] Add tests for normal result, critical result with a different
  item level, normal ingredient, optional ingredient and multiple version.
- [ ] Check recipe page, item detail page, crafting filter and
  "Where do I get this?" toggle together.

### Step D – Extend the filter page deliberately or deliberately leave it

- [ ] After review, decide whether binding actually becomes a search filter.
- [ ] If yes: test additional axis, counters/facets, URL round trip,
  reset and filter memory.
- [ ] If no: record that binding is only detail information for now.
- [ ] Regression-check the existing hierarchy tree, item set, category/quality filter,
  level range and links in all three languages.

### Step E – Safeguard quality

- [ ] Check: source → `items.json` → PHP detail model → Twig output.
- [ ] Check: source → `items.json` → `gegenstaende-<sprache>.js`
  → filter row/URL → PHP `filter-i` relation row.
- [ ] Browser acceptance of the filter page DE/EN/FR and the changed item details.
- [ ] Build data outside the repository, according to the
  `AGENTS.md` requirement; publish nothing.

## 6. Checked code paths

- `build_items.py` – shared item namespace and backward
  recipe/reward/gathering spot relations.
- `build_gegenstandssuche.py` – search rows, classes, labels and filter fields.
- `web/gegenstaende-filter.js` – filter hierarchy, matching, URL,
  sorting, facets and result links.
- `php/templates/app/gegenstandssuche.twig` – search surface and loaded
  filter components.
- `tools/build_php_data.py` – `filter-i` shards and item detail page models.
- `tools/php_viewmodel.py:item_view()` – facts, relation types and
  item page view model.
- `php/src/Data.php`, `php/src/Page.php` – shard-based page retrieval and
  template assignment.
- `php/templates/entity/item.twig` – actual item detail presentation.
- `build_gegenstaende.py` – static comparison/legacy path; do not confuse with the
  normal PHP page build.

## 7. Scope boundary

The inventory changes neither generator nor page presentation. It
proves no game server availability and no complete semantics of all
item effects. The Item Scanner remains an ID discovery source, not a
property or relation authority.
