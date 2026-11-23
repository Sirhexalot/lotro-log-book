# Filter memory and sorting

Status as of 10.11.2026, published. Applies to **items**, **quest givers**
and **recipes**; since 22.11.2026 also to the **sets** (their list filters in
the browser like the item search).

## Behaviour

| Situation | Result |
| --- | --- |
| Change filter or sorting | The state is stored locally |
| Detail page → back link to the list | Link carries the stored state |
| Open list without parameters | Stored state is restored |
| Address already contains filters | Address wins, nothing is overwritten |
| „Zurücksetzen“ | Deletes the stored state |
| Other language | Own store per language |

The browser back button already worked before, because the filters stand in the
address. They were lost via the own back paths („Alle
Auftraggeber“, breadcrumb „Gegenstände“, „Handwerk“) – these carry the state
along now.

## Store

- Key: `mql.filter.<bereich>.<sprache>`, content `{"q": "<query>"}`
- Areas: `gegenstaende`, `auftraggeber`, `rezepte`, `sets`
- Only the query string is stored (search, filter, level,
  sorting). No character data, no identifiers.
- Private mode or full store: reading/writing fails silently, the
  list keeps working without memory.
- A defective entry is treated like „nothing stored“.

## Back links

`web/katalog.js` adds the links to the lists on detail pages, provided the
link has no own filter query:

- `/de/gegenstandssuche/`, `/en/item-search/`, `/fr/recherche-objets/`
- `/de/auftraggeber/`, `/en/quest-giver/`, `/fr/donneur-de-quete/`
- `/de/handwerk/rezepte/` and the old address `/handwerk.html?lang=…`

A `?lang=de` does not count as a filter and is replaced.

## Sorting

Two kinds exist: the older lists sort through a select, item lists sort by
clicking a column head (22.11.2026).

- In the address: `sort=name` (default, may be missing), `sort=level` for the
  quest lists, and for item lists `sort=mindeststufe` ascending or
  `sort=-mindeststufe` descending. The old `sort=stufe` and `sort=stufe-ab` are
  read as the minimum level, so bookmarks keep working.
- **Level** in item lists is the wear requirement. The item level is strength,
  stays in the name cell and does not sort. Entries without a level stand last
  in both directions, for the same level the name decides.
- **The table head** carries the key and `aria-sort`. A click sorts, a second
  click turns the direction; a new column starts in its first direction (name
  and minimum level ascending, the class profile descending).
- Crafting recipes and raw materials sort under the same head since
  23.11.2026: recipes by result name (`name`), crafting tier (`tier`) and
  result item level (`stufe`), materials by name and crafting tier. The old
  selects are gone; `sort=stufe` keeps its meaning.
- Items and recipes sort in the browser before "mehr laden" or the 50 limit.
- Quest givers are sorted by the server (`Givers::sorted`) before the page split;
  „Stufe“ there is the lowest quest of the quest giver. Works also
  without JavaScript and when paging.
- A filter or sort change resets the loaded rows to the first block; scrolling
  loads the next 50 instead of a page control.
- The sorting is stored like a filter and carried along in language links,
  pagination and canonical. Sorted lists remain `noindex`.

## Recipe categories (22.11.2026)

The client's recipe categories are flat names with a qualifier
(„Leichte Rüstung (Stufe 40)“, „… (Gilde)“, „… (Lossoth)“), 491 of them.
The filter groups them into three levels:

| Level | Parameter | Example | Values |
| --- | --- | --- | --- |
| Bucket | `ziel` | Rüstung | 14, fixed order |
| Base type | `grund` | Leichte Rüstung | English key, label per language |
| Category | `kategorie` | Gilde | the exact client name |

Every level is a checkbox with its own counter; a bucket or base type selects
all categories below it. The three levels are separate filter groups, so they
combine with AND like any other pair of groups; the deeper level narrows.
Buckets start collapsed, a fresh link opens the way to its selection.
`kategorie` keeps the full category name, so older links and the stored filter
state keep working. Data: `b` and `k` in `web/rezepte-<sprache>.js`, written by
`build_rezepte.py` from `tools/rezeptkategorien.py`.

## Class profile (22.11.2026)

The class profile has no level range in its filter panels: the level above the
lists is the only level control. Its sort values are page-scoped in `kf-…sort`:

- `levelDesc` for quests and deeds (highest level first, name as tie-breaker).
- `itemLevelDesc` for items (item level descending, then minimum level
  descending, then name).

The default value is not written to the address. A level change clears all
`kf-` parameters and rebuilds the lists. The tab badges and result counts name
the level.

## Tests

```bash
node tests/test_filtergedaechtnis.js
python3 -m unittest tests.test_givers_php -v
```

Additionally in the browser check: set filters, open detail page, return via the
back link, check state; sorting by level in DE/EN/FR;
a fresh list without parameters restores the state.

The known limit: another browser or a deleted store does not know the
state. That is intended – there is no account and no server storage.
