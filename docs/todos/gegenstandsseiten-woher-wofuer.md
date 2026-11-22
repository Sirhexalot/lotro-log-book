# Concept: item pages with „Woher“ and „Wofür“

Status as of 20.11.2026
Project: LOTRO Log Book
Status: item pages implemented; barter vendors, containers and disenchanting
are modelled and wait for display (data model:
[tausch-behaelter-zerlegung.md](../datenraum/tausch-behaelter-zerlegung.md))

## 1. Background

On item pages, very many quests can appear under „Woher“.
The item search already has filters, the source list on the
item page does not. In addition, an item can have
sources and be used in recipes at the same time.

Examples:

- `7005FD7A` – „Essenz des lebhaften Erkunders“ chest: three quest sources.
- `7001C51E` – „Armbrust der Kraft des Goldenen Heeres“: use in a
  recipe as a critical success; this relation is currently not shown completely
  as crafting.

## 2. Goal

An item page should answer at a glance:

1. **Where do I get the item from?**
2. **What do I need the item for?**
3. **Which properties and connections does it have?**

The page should stay calm with few entries and become
searchable and filterable with many entries. Sources and uses must not be mixed
in one shared, misleading list.

## 3. Quantitative basis

Three data sets must be distinguished for the tabs:

- **152.088** named items in the complete DAT export
- **52.798** items in the current web item search
- **40.755** items with detailed equipment data

The tab logic follows the **52.798 items of the web search**.

### „Woher“

**16.032 items** have at least one verified source:

- **6.564** as quest/deed reward
  - 6.269 with quest sources
  - 442 with deed sources
  - 147 with quests and deeds
- **8.410** as recipe result
  - 6.707 normal result
  - 4.084 critical result
  - 2.381 in both forms
- **2.693** with a vendor assignment in the web state
  - The complete vendor export covers 10.805 items.

The relations overlap:

- 216 items are reward and recipe result.
- 1.208 items are recipe result and vendor stock.
- 310 items are reward and vendor stock.
- 99 items belong to all three groups.

### „Wofür“

**1.509 items** are used as recipe ingredient:

- **1.370** normal ingredients
- **149** optional ingredients
- 10 items in both roles

The number of uses is strongly spread:

- Median: 3 recipes
- 90 percent of the items: at most 41 recipes
- 95 percent: at most 76 recipes
- Maximum: 4.095 recipes

For „Wofür“, filters are therefore necessary not only for individual cases but
for the large outlier group.

### Overlap

**1.271 items** have at least one „Woher“ source and one
„Wofür“ use at the same time. For these items, separate tabs are especially
sensible.

The remaining items must not automatically receive empty or meaningless tabs.

## 4. Data-dependent tab model

The detail page receives a local section navigation:

```text
[Übersicht] [Woher · n] [Wofür · n]
```

The tabs are only shown when the respective area actually has
data:

- no source: no „Woher“
- no use: no „Wofür“
- source and use: both tabs
- no relation: only „Übersicht“

The number on the tab always counts **all actual entries of this area**,
not just the number of source groups.

Example:

```text
Woher · 3
  Aufgaben · 2
  Herstellung · 1
```

„Woher · 2“ would be wrong here, even if there are only two quest entries.

The tabs are jump targets or a visible section choice,
not a one-page application driven exclusively by JavaScript. All contents
remain reachable in the HTML. Without JavaScript, links, headings
and lists continue to work.

### Übersicht

Contains:

- item name, icon, quality and level
- description
- stats and combat stats
- binding, unique, scaling
- class/profession and essence slots
- set and set bonuses
- forms/variants

Sets, variants and stats receive **no main tabs of their own**. They belong
to the Übersicht and are only shown as sections when data is present.
In the web state, sets concern about 10.661 items and identical names with
several forms about 19.370 items; that does not, however, result in an
additional search direction as with source and use.

### Woher – only with verified sources

Contains only ways in which the item can be obtained:

- quests
- deeds
- fixed rewards
- selectable rewards
- vendors
- barter vendors
- crafting
- later possibly instances or loot tables, if unambiguously verified

### Wofür – only with verified uses

Contains only uses:

- normal recipe ingredient
- optional recipe ingredient
- item as normal recipe result
- item as critical recipe result
- possibly set or system use, if it follows reliably from the
  game data

A global filter must never filter quest sources and recipe uses
at the same time.

## 5. „Woher“ in detail

### Grouping

The sources are grouped by kind:

```text
Woher · 8 Quellen

Aufgaben · 5
  Aufgabe …
  Aufgabe …

Taten · 1
  Tat …

Händler · 1
  Händler … · Gebiet …

Herstellung · 1
  Rezept …
```

A group is only shown when it contains at least one verified entry. Do not
create artificial statements such as „keine Quelle bekannt“.

### Quest filter

Beyond a sensible number of quests, a compact filter appears directly in the
group:

- search in the quest name
- region
- area
- quest level
- quest kind/topic
- progress, if character progress is imported
- sorting by name or level

The filters apply exclusively to the quest subgroup. Initially, for
example, 20 entries are shown; further entries appear via
„Weitere anzeigen“ or on reload.

Every quest row shows as far as possible:

- quest title
- area or region
- status icon and status, if character progress is present
- marking as fixed or selectable reward

The quest list must not claim that a selectable reward is certainly
obtained.

### Deeds

Deeds receive the same list logic as quests but remain their own
group. The existing deed source and the existing deed catalogue are
reused.

### Vendors and barter vendors

Do not just output „Beim Händler erhältlich“, but:

- localised vendor name
- vendor kind or activity, if available
- area/region, if the location is unambiguously verified
- link „Auf der Karte öffnen“ as soon as a reliable position is present

Several vendors are summarised, not output as identical repetitions.

## 6. „Wofür“ in detail

### Recipe list

Every recipe row contains:

- recipe name
- profession
- level
- crafting category
- normal or optional ingredient
- required quantity
- crafting knowledge, if imported

Example:

```text
Armbrust der Schlagkraft
Drechsler · Stufe 6 · Fernkampfwaffen
```

### Result kinds

Normal and critical result must be distinguished:

```text
Normales Ergebnis: …
Kritischer Erfolg: Armbrust der Kraft des Goldenen Heeres
```

That way `7001C51E` is correctly connected with the recipe `7001C164`, although the
item stands only in the field `CraftRecipe_CriticalResultItem`.

### Recipe filter

For many uses the following filters are sensible:

- profession
- level
- category
- normal ingredient
- optional ingredient
- gelernt / nicht gelernt / fremder Beruf

The existing query logic such as `recipe.eigene=0` is retained and
shown visibly as a toggle:

```text
[Alle Rezepte] [Meine Berufe] [Nicht gelernt]
```

## 7. Data model and sources

### Already present in the own DAT export

The complete item export covers around 152.000 named items and
delivers among other things:

- name and description in DE/EN/FR
- category, slot, weapon/armour type
- quality, level and minimum level
- stats, armour, DPS, damage and speed
- binding, unique, scaling
- required class and essence slots
- set membership
- normal and critical recipe results
- ingredients and optional ingredients
- icons

### Source exports

Existing data states:

- 1.469 vendors
- 10.805 items with vendor assignment
- 820 items in the current equipment stock with vendor IDs
- 7.924 recipes
- 4.230 recipes with vendor/barter sources
- quest/deed reward tables with fixed and selectable items

These data should be merged in one shared viewmodel layer separated by
source kind. The item page must not
interpret different raw data sources itself.

### Use still outstanding

1. Use vendor data with names and locations on the item page.
2. Add barter vendors from `Barter_ItemListArray`.
3. Connect recipe sources on recipe and item pages.
4. Distinguish fixed and selectable quest/deed rewards.
5. Output critical recipe results as „hergestellt durch“.
6. Link vendor positions from the DAT position export only with reliable
   assignment.

## 8. Role of the LOTRO interface plugins

Item Treasury or the maintained Item Treasury database can
serve for comparison and gap checking. It contains above all:

- item ID
- name and description
- category and quality
- durability
- magical/unique
- icon and background ID

It is not a suitable primary source for quest, recipe, vendor or
barter relations. The own DAT evaluation remains the authoritative source.

Item Scanner and item link decoding are useful for:

- newly discovered or unknown item IDs
- current patch/Bullroarer items
- matching item ID, name and tooltip

They do not, however, deliver a complete replacement for the server/DAT-side
relation tables. Foreign plugin data is not taken into the website
unchecked.

## 9. Implementation phases

### Phase 1: Data-dependent tabs and source filters

- [x] local tabs/anchors „Übersicht“, „Woher“, „Wofür“
- [x] show tabs only with existing data
- [x] compute the counter per tab from the existing entries
- [x] grouping of „Woher“ by quests, deeds, resource occurrences, vendors and crafting
- [x] simple name filter for quest sources as well as name/result filter
  for crafting relations
- quest filters for region, area, level and progress
- limitation of long lists with „Weitere anzeigen“
- [x] DE/EN/FR texts and basic mobile presentation

The local navigation is implemented as HTML anchors. The first filters run
without a JavaScript dependency for the list; finer quest facets follow
with the structured source fields.

### Phase 2: Data corrections

- [x] connect normal and critical recipe result in the item model
- [x] mark normal and optional ingredients in the item model
- [x] distinguish account binding from normal acquisition binding in the item model
- distinguish fixed and selectable rewards
- retain existing filter states and back links

The new reverse relations lie in `daten/items.json` initially in parallel
to the legacy fields: `herstellung` contains `regular_result` and
`critical_result`, `verwendung` contains `ingredient` and
`optional_ingredient`. The old `b` binding and the fields `rezepte`/`zutat`
are retained for the transition period.

### Phase 3: Vendors and barter

- [x] concrete vendor names from the Companion export
- [x] limit vendor relations to the existing 52.798 web item IDs
- [x] vendors as their own map-capable entity with item links
- [ ] barter vendors and barter sources for directly visible item pages
- [ ] containers as source (fields, chests, relic containers)
- [ ] disenchanting result on the item
- area/region
- map link only with an unambiguous location
- possibly filters by area and source kind

The vendor export verifies 2.693 existing web items with at least one
concrete vendor. The existing barter sources concern none of these public
item pages in the current export; therefore they are not shown as
apparent sources.

Vendor pages use the NPC ID of the game as a stable ID. The current
export delivers 1.469 vendors, of them 1.466 with a location and 1.092 with an
assignable web map. Vendors therefore appear on item pages as links and
show in turn the map location as well as the verified goods on offer.

### Phase 4: additional game content

- checking chest/selection items
- investigation of loot tables
- new DAT samples after game updates
- matching unknown items with Item Treasury/Item Scanner

## 10. Not part of the first implementation

- ownership filter for items: the character import contains no complete
  bag/bank stock.
- claimed drop probabilities or quantities
- invented vendor locations
- automatic statement that a selectable reward is certain
- complete opening of the contents of chests without a verified DAT relation
- adoption of foreign wiki/plugin lists as website primary data

## 11. Acceptance criteria

- An item with only few sources stays clear.
- An item with many quests has a working
  quest filter.
- An item with „Woher“ and „Wofür“ is clearly navigable via both tabs.
- An item without sources receives no empty „Woher“ tab.
- An item without recipe use receives no empty „Wofür“ tab.
- The tab number counts all entries, not only groups.
- Quests and recipes are never mixed in one shared list.
- `7005FD7A` shows its three quests under „Woher“.
- `7001C51E` shows `7001C164` as critical recipe result.
- Fixed and selectable rewards are distinguishable.
- Vendors and barter vendors are shown only with verified data.
- Pages work without JavaScript and in DE/EN/FR.
- Filters, back links and URL states are retained.
- No change to existing map, quest or item search filters
  without its own acceptance test.

## 12. Data status 20.11.2026: three sources and supplementary client items

Model, schemas and limits are in
[`docs/datenraum/tausch-behaelter-zerlegung.md`](../datenraum/tausch-behaelter-zerlegung.md);
the entity contract already lists the groups as `open`.

### Barter (`barters.xml`)

- 1.096 barter vendors, 3.469 offer profiles (12.360 references), 42.594
  offers with 58.933 costs and 42.590 grants.
- 36.096 different grants; **11.586** of them have a catalogue page. The
  remaining 24.510 stay names without a link.
- 1.095 vendors have a world position; 159 are class-restricted, 565
  profiles require a faction (`"<id>;<stufe>"`), 505 a quest.
- The previous `tausch` entries in `daten/items.json` come from the
  recipe source export and are merged additively, not replaced.

### Containers (`containers.xml`)

- 6.262 containers, of them 5.735 ordinary and 527 relic containers.
- 4.626 with a trophy list, 926 with a treasure list, 494 with both, 1.204 without a
  list (remain without a pool).
- Resolution via the same loot graph as the instance chests
  (`tools/build_instanz_beute.py`, in future `tools/lootgraph.py`).

### Disenchanting (`disenchantments.xml`)

- 27.333 rows, 10.315 sources with a catalogue page.
- 26.341 with a result, 992 without; only **45 different** results, all of them
  exchange vouchers („Receipt of …“), 22 of them in the catalogue.
- Disenchanting is therefore no replacement for loot and is kept as its own group.

### Supplementary items from the own client export

- `items-2026-11-08/items.json` contains 152.088 items. All checked
  barter, disenchanting and instance loot IDs are present in it.
- 27.652 of these IDs are missing from the curated web catalogue. A planned lean
  supplementary stock delivers name, quality, level and icon, without creating search hits or
  catalogue pages for them.
- The catalogue entry always wins. Companion labels are not needed for that.

### Supplementary acceptance criteria

- Barter offers show costs with quantity and grants with quantity; a missing quantity
  counts as 1.
- An item without a catalogue page is named but not linked.
- Containers and disenchanting appear only as source or result, never as
  their own entity.
- Containers without a loot list and disenchantments without a result create no
  row.
- The vendor page separates „Warenangebot“ (silver) and „Tauschware“
  (items).
