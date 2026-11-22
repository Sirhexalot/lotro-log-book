# Sets: data basis and next integration

Status as of 09.11.2026. **The set list, detail pages and navigation are published.**
The evaluation stays with proven data;
missing values, effects and items are visibly treated as incomplete.

## Generator

```bash
python3 build_sets.py
python3 tools/build_sets_client.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata" --sprache alle
python3 -m unittest tests.test_sets tests.test_sets_php tests.test_set_viewmodel tests.test_sets_seite tests.test_sets_client -v
```

`build_sets.py` reads `sets.xml`, `stats.xml`, `classes.xml` and the
DE/EN/FR labels of the local Companion client export. Items are assigned via
`daten/items.json` and `daten/gegenstand-details.json` by their IDs.
The dependencies are only read.

Output (generated game material, excluded from Git):

- `daten/sets.json`: complete set models together with source metadata,
  part references and typed bonus definitions.
- `daten/sets-suche-de.json`, `…-en.json`, `…-fr.json`: language-correct
  list indices with filter features per part.
- `daten/sets-pruefung.json`: machine-readable test report.
- `web/sets-de.js`, `…-en.js`, `…-fr.js` (from `tools/build_sets_client.py`):
  browser data of the list — the index rows plus the grouped wear requirements
  of the pieces (`[min, klasse, volk, armour, waffe, extra, scalable, anzahl]`
  per distinct requirement, from `tools/eignung_teile.py`). ~1.1 MB per
  language, ~107 KB gzipped.

Source and target paths can be overridden with `--quelle`, `--items`, `--details` and
`--ziel`. A dedicated target folder is created, but not
emptied. Mandatory sources do not go missing silently: the build then aborts.

## Data contract

- New public set IDs: eight-character upper-case hex of the game ID.
  The decimal source ID remains additionally. Names are no identity;
  sets with the same name are not merged.
- Set names use the language-correct labels. The additional line with the
  maximum level does not become part of the name. Technical names like `DNT` are
  not adopted as player texts.
- `level` and `maxLevel` remain as separate, raw source metadata.
  They are **no** confirmed minimum/maximum and no set filter.
- Missing items remain as a reference with `available: false` in the set.
  Missing item data, translations and contradictory back references
  are reported separately. A part without catalogue data keeps its item link
  when an item page exists (chest loot, barter or another evidenced source),
  but shows neither rarity colour nor values: the card stays empty, the row is
  the linked name only. A part without any item page stays plain text and
  counts repeated names in one row.
- Filter features remain per part. A class value of part A may
  not produce a false hit with the armour type or level of part B.
- **Suitability of a set (22.11.2026):** the pieces' wear requirements are
  grouped per set (`tools/eignung_teile.py`) and judge the set as a whole:
  „Passt · 3 von 6“, „Zu hoch“, „Nicht für dich“. A piece without a minimum
  level is not counted, and without an imported character there is no chip.
  Rules: `docs/oberflaeche/eignung.md`.
- Empty/unnamable sets remain in the complete model and test report,
  but are missing from the list index. A missing class resolution is not output as
  reliably known or as „alle Klassen“.
- Bonus groups receive their part count and all original definitions.
  Constants, scaling references, operators, descriptions and effects are
  not offset against each other or silently removed.
- `display_ready` applies to complete, translated effect/override descriptions
  and typed constants (`INTEGER` or explicitly `isPercentage`).
  `SUBSTRACT` flips the sign; `SET` is not shown as an addition.
  Percentages are shown as stored percentage points, not multiplied
  by 100. Other operators and non-finite values remain locked.
- A translated stat name alone proves no unit. Scaling curves are
  not evaluated with the unclear set level or an arbitrary item level.
  Such values receive an explicit note.
- Multiple classes from the source (e.g. `Burglar;Corsair`) are individual filter values.
  Jewellery is recognised via ItemClass 49 of the client; enum labels come
  from the source, not from set names.

## Test record of the integrated build

2.223 set definitions, 2.218 list entries, 11.159 part references and 4.479
bonus groups. Four sets are empty, one set has only a technical name.
498 part references from 46 sets are missing in the current item catalogue.
672 part references have no detail data. 52 bonus groups have a
conspicuous part count. 1.997 stat definitions remain without a safe complete
rendering; for 885 bonus components usable labels are missing in at least
one language. These numbers are test records, no permanent catalogue numbers.

## Interface and integration

- List: `/de/set/`, `/en/set/`, `/fr/ensemble/`; detail with stable hex ID,
  e.g. `/de/set/70069B64/` for the Umbar set with the eight parts.
- GET filter: `q`, `class[]`, `category[]`, `armour[]`, `from`, `to`, `page`,
  and `eig` (suitability states as `eig=passt,zu-hoch`).
  Multiple values of one group count as OR, different groups as AND.
  All criteria must be met by the same available part. Missing
  data do not count as matching values. Class-specific filters include
  demonstrably unrestricted parts, but not unknown class data.
- Facets count sets without their own filter selection, with all other
  criteria. Selected zero hits remain visible. 30 results per page.
- **Filtering happens in the browser** (`web/sets-filter.js`, data
  `web/sets-<sprache>.js`): suitability depends on the imported character, which
  never leaves the browser. The same GET form with the same parameters is the
  answer without JavaScript and for search engines; it stays as the fallback and
  the browser takes over on load (`filter-ui`). The old server filter
  (`filter-server.js`) no longer mounts on this page. Language links,
  canonical and `noindex` still come from the server; the server keeps `eig`
  for them but does not judge it. Filter memory (`mql.filter.sets.<sprache>`)
  and the address carry search, class, equipment type, armour type, level range,
  suitability and page number; outdated requests are aborted, back/forward
  restores the filters.
- Details use existing item viewmodel values. No second stats calculator,
  no ownership/completeness claim about imported characters.
- `Sets.php` provides the common PHP/Twig shell and DE/EN/FR texts.
  `tools/set_viewmodel.py` creates set shards and replaces the old set mini-view
  on the item with linked set names, without the wrong level range.
- Menu entry in `Shell.php` and `menue.js`, central search with type `s` in
  `build_suche.py`/`suche.js`. Refresh search data after the set build for all languages.
- Set lists and details stand in the language sitemaps. Filtered lists carry
  `noindex,follow` and a normalised own canonical URL. Language switching
  keeps the filters, but starts on page 1, since search terms are language-dependent.
- The release checks set assets, templates and all three filter indices. Tracking
  comes unchanged from the common shell; no character progress in the release.

## Check and remaining limits

Generator, PHP filter/routing and viewmodel tests check signs, unsafe
scaling, text templates, the same filter witnesses, multiple classes, real 404,
name equality and missing parts. `tests/test_sets_seite.py` renders a set page
with all three member shapes (full card, item page without data, unresolved
name) in DE/EN/FR, so a part without a card can no longer break the page, and
holds the browser markers of list and set head. `tests/test_sets_client.py`
checks the browser data (row shape, part count, grouped requirements), and
`tests/browser_sets.js` checks chips, the share of a half-wearable set, the
suitability filter in the address and panel, the set head and the phone dialog
in DE/EN/FR.

On 22.11.2026 the complete Python suite runs green (527 tests, including
`tests/test_katalogseiten.py`, whose earlier note about the Apache block
`LLB ENTITY URLS` no longer applies to the PHP block). Do not carry that old
warning forward.

Not yet resolved stat/effect data are data gaps, no silent zeros.
A further number calculation needs proven units and the correct
reference level.

## Publication 09.11.2026

Release from `~/.cache/llb-release`: first 2.309 data files (191,6 MB), then
18 application/asset files (15,4 MB) transferred via the existing FTPS uploader.
Affected compiled Twig templates were cleared deliberately; `.htaccess` stayed
unchanged. No character data published.

Live checked: lists and immediate filter in DE/EN/FR, desktop/mobile, Umbar with eight
parts and three bonus levels, central set search hits and item reference.
All three set sitemaps return 2.219 URLs each. Lower case and `.html` are
canonicalised via 301; unknown sets return 404, the private set index 403.
The general live URL checks pass as well. The visitor counters were
blocked in the isolated browser test; their actual transmission was
therefore not tested. An additional home page announcement was not part of
this release.
