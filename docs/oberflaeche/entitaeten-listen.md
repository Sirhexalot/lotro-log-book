# Embedded entity lists – local implementation status

Decision: **The list below a detail page is the existing list of the
entity shown there, only firmly restricted to the relation.** No
own filter invention per parent page. That concerns search, filter groups,
sorting, result rows, „Weitere anzeigen" and completion markers.

Example: `Barren: Zwergenstahl` shows 95 recipes. These are all recipes that
use this item as an ingredient – with the profession, level, category,
crafting knowledge and sorting filter of the recipe list. The facet numbers refer
only to these 95.

## Who delivers what

| Level | File | Task |
| --- | --- | --- |
| Data | `tools/related_filter_data.py` | rows for quests/deeds (name, kind, category, region, area, level, rewards) |
| Build | `tools/build_php_data.py` | shards `filter-q`, `filter-d`, `filter-i`, `filter-labels` per language |
| Server | `php/src/RelatedLists.php` | reads the relation IDs of the page, fetches exactly these rows |
| Page | `php/templates/layout.twig` | relations as JSON, list assets only when needed |
| Browser | `web/entitaeten-listen.js` | tabs, fixed relation, one controller per tab |
| Adapter | `web/aufgaben-filter.js` | quests/deeds (new, extracted) |
| Adapter | `web/handwerk-filter.js` | recipes (`MQL_RECIPE_FILTER.create`, the same configuration as in crafting) |
| Adapter | `web/gegenstaende-filter.js` | items (`MQL_ITEM_FILTER_SETUP`, the same tree as the item search) |

The detail page sends **only IDs** along, never a full catalogue: for Nordhöhen
these are 266 quests, 23 deeds and 198 items; the rows come from the
shards of their own type. The earlier embedding of the complete member JSON
into the page is gone.

## Fixed relation, free filters

- The relation itself is **no** filter and is not removed by
  „Zurücksetzen".
- Each tab writes only parameters with its own prefix (`q.`, `beruf.` …).
  The path of the detail page and the state of the other tabs remain unchanged
  on reset, reload and back/forward.
- The tab stands in the hash (`#q`, `#d`, `#i`, `#recipe`) and survives reload.
- A tab without distinctive filters (fewer than two values, no
  two levels, no completion proof) shows the list without an empty filter column.
- Only what differs within the relation is offered and named in the
  result row: region and area appear as filter and as
  addendum as soon as they have several values; within the area itself they are dropped.
- Without JavaScript the server-side list remains complete: item 95
  recipe links, area 266 + 23 + 198 entries.

## Which filters a quest has

The quest category of the client (`Auenland`, `Hauptmann`, `Ruf`, `Barde`)
mixes landscapes, classes and narrative kinds. It stands in the page text, but is
not usable as a filter. What really separates quests are their proven
features: **daily, repeatable, small fellowship, fellowship,
quest board, instance, scaling with level**. Small and large fellowship
are alternatives (both selected = any fellowship); the other features
apply together. Quest board is recognised at the client category `Auftrag` /
`Task` / `Tâche`, not at the giver name.
Deeds additionally have their **kind** (explorer, slayer, lore …) and their
**reward** (LOTRO points, virtue, title, item). A deed without proven
kind remains without kind instead of claiming „Weitere Tat".

## Completion status

Markers appear only for data kinds whose status was imported. „Nicht als
erledigt importiert" is a statement about the import, never about playability
or availability. For items there is no ownership status: the
character import contains no bag inventory.

## Acceptance

```bash
node tests/browser_related_lists.js      # 7 kinds × DE/EN/FR × 1280/390, context, reset, search over 50, tab/history, without JS
node tests/browser_area_tabs.js          # tabs, search over the excerpt, hash, completion filter
node tests/browser_entity_sources.js     # source lists as common filters, critical success, sets
node tests/browser_entity_progress.js    # data kind, search, reputation status
```

Limits: no real iOS/screen reader acceptance; no ownership filter for
items; the completion status continues to rest on the file presence of the
import, not on a verified completeness proof.
