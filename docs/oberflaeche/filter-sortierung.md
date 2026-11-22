# Filter memory and sorting

Status as of 10.11.2026, published. Applies to **items**, **quest givers**
and **recipes**.

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
- Areas: `gegenstaende`, `auftraggeber`, `rezepte`
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

- In the address: `sort=name` (default, may be missing) or `sort=stufe`.
- **Level** is ascending. Entries without proven level stand last, for
  the same level the name decides.
- Items and recipes sort in the browser before „mehr laden“ or the
  100 limit.
- Quest givers are sorted by the server (`Givers::sorted`) before the page split;
  „Stufe“ there is the lowest quest of the quest giver. Works also
  without JavaScript and when paging.
- The sorting is stored like a filter and carried along in language links,
  pagination and canonical. Sorted lists remain `noindex`.

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
