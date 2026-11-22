# Item page: source groups on the shared component

Status as of 18.11.2026
Status: implemented

## Starting point

The item page shows several groups under „Woher". Three of them deviate
today from the rules:

| Group | Entries | Presentation today | Rule violation |
| --- | --- | --- | --- |
| Quests | up to 753 | shared component | none |
| Crafting (`filter=recipes`) | up to 77 | shared component (`recipe_made`) | none |
| Vendor (`vendor_filter`) | up to 333 | shared component | none |
| Barter vendor (`barter`) | up to 333 | shared component | none |

In addition, the crafting row shows the complete recipe text
(„Koch · Wilde Essenzen · Stufe 1 · 1 × …"), which makes 77 different recipes
look like a repetition.

## Goal

Each group is a relation to **one** entity and uses its form:

- Quests → `MQL_TASK_FILTER_SETUP(rows, 'q')`
- Crafting → `MQL_RECIPE_FILTER` with `MQL_RECIPE_CONTEXT_RESULTS`
- Vendor → vendor form (the same row as the vendor list)
- Barter vendor → own `barter` relation with the same vendor component

That way the 5/6 threshold, search, facets, sorting, pagination,
context URL and the shared row rule apply everywhere.

## Data

`where_groups` already delivers per group:

- `label`
- `entries` with `url`, `text`, `recipe_level`, `result`, `profession`, `role`
- `filter`: `tasks`, `recipes` or `null`
- `source_kind`: set only for quests

For crafting only one thing is missing: the recipe ID as its own field. It sits
today in `url` (`/de/rezept/<ID>/`). It is additionally written as `id` during
the build, so that the adapter works without URL parsing.

## Structure

1. **Server** renders a `section` per group with `h3`, fallback list and
   an empty `ul[data-filter-results]`. Without JavaScript the list remains
   completely visible.
2. **Client** mounts its own instance of the component per group. The
   context stands as a prefix in the URL (`recipes.q`, `vendors.q`, …), so that
   groups do not overwrite each other.
3. **Rows**:
   - Quest: icon, name, level, area, status
   - Recipe: icon, result name, profession · level, crafting knowledge
   - Vendor: name, area, count
4. **Threshold**: up to 5 directly, from 6 the component in full width.
5. **Facets**:
   - Quests: existing quest filters
   - Crafting: profession, level, category
   - Vendor: normal vendor / barter vendor, area

## Open points

- With 77 recipes with an identical result, the rows differ only
  by profession, level and category. That is intended; the ingredients stand on
  the recipe page.
- Barter vendors and normal vendors remain separate source groups. The
  vendor group can still distinguish by vendor kind; the
  barter vendor group shows exclusively barter vendors.

## Tests

- `tests/test_relationen_audit.py`: no group over 5 without a component.
- `tests/test_entitaeten_vertrag.py`: row fields of the three groups.
- Browser test on `/de/gegenstand/70047510/` (77 recipes) and
  `/de/gegenstand/700005D1/` (333 vendors): one component per group each,
  compact row, search, reset, mobile.
