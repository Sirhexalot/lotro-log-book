# Common building blocks

Recurring building blocks lie in one place so that the same thing does not look different per page. The folder `php/templates/components/` contains the markup, a CSS file of the same name in `web/` the look, JavaScript only where behaviour is needed.

Something only becomes a building block if it has **the same meaning** in at least three places and can be brought into **one markup**. Mere similarity in appearance is not enough: otherwise a universal file with switches for every special case arises.

## Naming rules

- Folders and files: `components/<baustein>.twig`, `web/<baustein>.css`, `web/<baustein>.js` (only when needed).
- CSS classes: `llb-<baustein>`; variants via attributes (`data-dichte="kompakt"`, `data-ton="…"`), not via new class names.
- Colours, spacings and radii exclusively from the tokens in `web/gemeinsam.css`.
- The heading level belongs to the context, not to the building block: h2 on a catalogue page, h3 in the map panel that already carries an entity title.

## Surface (section with heading)

`php/templates/components/flaeche.twig`, `web/flaeche.css`, loaded via `Shell::styles()` and in the map app via `karte.twig`. Catalogue pages and the map detail column carry the same surface, the same heading and the same rhythm.

- Macro: `flaeche(titel, inhalt, ebene = 2, klasse = '', kennung = '')`. Twig has no `{% call %}` tag, so the content is built with `{% set inhalt %}…{% endset %}` and passed as one argument; the block stays markup and is not escaped.
- The heading belongs to the building block: h2/h3/h4 uniformly `--text-abschnitt` (20 px), weight 500, `0 0 8px`; no spacing to the top. The level follows only the document hierarchy (h2 in the catalogue, h3 in the panel).
- An inner padding via `--llb-flaechen-innen`; the spacing between surfaces is `--llb-flaechen-abstand` (12 px) for the catalogue column as for the panel column.
- `data-ton="hell"` is the lighter ground for rewards and values; border, rounding and spacings remain the same.
- `<details>` sections also carry `llb-flaeche`; their summary reads like the section heading and keeps the fold-out triangle, gold only on hover/focus.
- The body text remains a matter of the surroundings: 16 px on detail pages, 14 px in the map detail column.
- There are no structure aliases any more; every section carries `llb-flaeche` itself. The panel surface of the reference tabs stays with the tab component (`reiter.css`).

## Facts (label and value)

`php/templates/components/fakten.twig`, `web/fakten.css`. Since 23.11.2026 the
grid also has a macro, because quest, deed, recipe and quest-giver pages wrote
the same `<dl>` four times:

- Macro: `liste(rows)`, rows `{label, text, url}`; `items` carries a composite
  value (an area path, a group of giver names) as `{text, url}` entries.
- `app.js` keeps writing the same markup itself for the map detail column; the
  classes are the same, so both cannot drift apart.
- `.llb-fakten` – two columns, label weak, value breakable, links in gold.
- `data-dichte="kompakt"` – smaller font, tighter spacing, two columns on mobile as well (map detail column, where the labels are short).
- On mobile without `kompakt` the label stands above the value.
- `.katalog-werte-raster` (item values) remains separate: it is a value table with dividing lines, not a label-value list. The instance page moved its geography facts to `llb-fakten` on 23.11.2026 and keeps only level, group size and difficulty as chips.

## Place (one rule, two forms)

`php/templates/components/ort.twig`, `web/ort.css`, `web/ort.js`. One component
for every place on every entity page; before 23.11.2026 four markups existed
side by side.

**The form follows the number of places, never the page:**

- `block(lang, place, labels, titel, map_link)` — **exactly one place**: map
  cut, area and chain, coordinates, the map action, and the quiet second row
  with route and resource occurrences.
- `wahl(lang, orte, labels)` — **two or more places**: one map, one row per
  place, a row switches the map. The active row carries the gold bar. Without
  JavaScript the first map stays and every row is readable.
- `quellen(lang, orte, labels)` — the collapsed "Wo" of a short source list:
  name, chain, coordinates and both actions, **without a map**. The map belongs
  to the detail pages, where the place is the subject; inside a source row it
  would take over the page.

A filtered source list never carries the "Wo", because every row would repeat
it. The map cut itself stays `components/karte.twig`; `ort` composes it and
never redraws it. The switching lives in `web/ort.js` and binds every
`[data-ort-karte]`, so several pickers on one page (an item with several
sources) work without ids.

## Rewards

`php/templates/components/belohnungen.twig`. Quest and deed wrote two different
reward rows before; now both call the same one.

- `gruppen(groups, sicher)` — groups `{label, items}`. A deed passes its fixed
  and selectable rewards as two groups; the fixed group's heading is dropped
  when it is the only group.
- `gabe(item)` — the 48 px tile, the rarity colour of the name and the
  suitability chip of the imported character.

## Objectives

`php/templates/components/ziele.twig`. `ziele(titel, steps)` renders the closed
`<details data-nosnippet>` with the steps and their objectives. The text spoils
the quest, so it never stands open and never enters a search snippet.

## Tabs

`php/templates/components/reiter.twig`, `web/reiter.css`, `web/reiter.js`, loaded via `Shell::styles()` and both layouts.

- Macro: `reiter(kennung, titel, eintraege, aktiv, versteckt)`; each entry is `{key, label, panel, zahl}`.
- The active tab merges into the panel below (golden top edge, `margin-bottom:-1px`); colours only from tokens.
- Behaviour comes from `MQL_REITER.mount`: one visible panel, `aria-selected`/`tabindex`, arrow keys/Home/End, optional hash together with back button, `onShow` for reloaded content.
- Counters are optional and appear only for values greater than zero; the page delivers the number.
- No page brings its own `role="tablist"` markup or its own tab colours. Guards: `tests/test_reiter.py`, `tests/browser_reiter.js`.
- Contract, page list and procedure for new tabs: [`reiter.md`](reiter.md).

## Note line

`web/hinweis.css` – the quiet line for classifications, coordinates, notes and intros.

- `.llb-hinweis` colours only with `--schwach` and follows the surrounding font size.
- `data-groesse="bedienung"` (14 px) and `data-groesse="klein"` (12 px) choose a level from the common scale; the map detail column uses `klein`.
- Replaces the earlier page classes `katalog-hinweis`, `katalog-marken` and `detail-lage`. The static catalogue generators also write `llb-hinweis`.
- No note building block: `.mql-row-help` (help line with import link in result lists) and the note surfaces of the adventure overview.

## Fold-out (flyout)

`web/klappe.css` and `web/klappe.js` – a button with a panel next to it.

- Markup: `button[aria-expanded][aria-controls]` plus panel with `.llb-klappe-feld` and `hidden`. The panel brings surface, border, shadow, a maximum height of 60 vh and scrolling; opening direction, width and content belong to the page.
- Behaviour via `MQL_KLAPPE.bind(knopf, feld, {vorOeffnen, rahmen})`: click toggles, click outside closes (capture phase, so that marker clicks are not swallowed), Escape closes and returns the focus, `aria-expanded` is maintained. `vorOeffnen` fills lists only on opening.
- Used by the note filter, resource occurrences and the complete legend on the map. `rahmen` is by default the parent element of the button; the legend passes its row because button and panel are siblings there.
- Deliberately separate: the filter of the map list is a `dialog` (modal on mobile), the chapter goals are native `<details>`, and the family menus belong to the header.

## Map image with pin

`php/templates/components/karte.twig`, `web/karte.css` – the map excerpt from the client with a marked spot.

- Macro `karte(lang, bild, link, pin_x, pin_y, klasse, gross, label, alt, bild_id, pin_id, bild_attr, pin_attr, form, breite, hoehe)`: image name under `/karten/<sprache>/` (a path starting with `/` is used as it stands, as interior maps live outside it), optional link into the map view, optional pin coordinates, `gross` for the map at the top of an area page (640 px).
- `.llb-karte` is 4:3 with a dark ground behind transparent image edges; `.llb-karte-pin` sits proportionally in the image.
- `form="bild"` is an illustration, not a place cut: the whole picture in its own aspect ratio, `breite`/`hoehe` carry its pixel size. The instance page uses it for the interior map.
- The width is determined by the surroundings: 320 px standard, 240 px in the row next to text (`.katalog-ort-flex`), full column in the place area, 640 px as area map.
- The row `.katalog-ort-flex` (image next to notes and actions) remains a page rule for now; it is layout, not the image.

## Button and action row

`web/knopf.css` – a button in three kinds and three sizes, plus the row for actions.

- **Kinds:** without attribute the quiet surface button (surface tone, border, golden label); `data-art="haupt"` filled gold for the main action of a page; `data-art="rand"` golden outline on dark ground (import, plugin, feedback). In the light theme the outline variant becomes the filled gold button.
- **Sizes:** standard 8/14 px; `data-groesse="gross"` 9/18 px, bold, at least 44 px high; `data-groesse="klein"` 6/10 px with compact font.
- Focus ring, hover colour and text colour (`var(--grund)` on gold, thus legible in both themes) stand here once.
- `.llb-aktionen` keeps placeholders in one row, wraps when space is tight; `data-dichte="kompakt"` is the level of the detail column.
- `.katalog-link` is no button, but a text link in an action row and remains unchanged.

## Goals fold-out (native `<details>`)

`details.katalog-ziele.llb-flaeche` – the quest goals on a surface, separate from the flyout fold-out above.

- The marker belongs in the text flow: `summary { list-style-position: inside; }`. Otherwise the arrow stands at the surface edge and the summary does not appear indented.
- Check: the indent measurement in `tests/browser_entity_headers.js`.

## Symbol tile

`web/kachel.css` – a square tile for entity symbols and item images.

- `.llb-kachel` with `data-art="gegenstand"` for images; the previous classes `.mql-row-icon`, `.detail-symbol` and `.detail-reward-symbol` run on the same declaration.
- Size via `--llb-kachel`: 64 px in lists and catalogue headers, 54 px on the phone and in the map detail column (`--llb-kachel: 54px`).
- The tile owns border, rounding, centring and image fit; list and panel keep grid, flex and spacings.
- **Loading:** catalogue pages via `Shell::styles()`, app pages via `php/templates/app/layout.twig`. Result rows arise in shared scripts (`treffer-zeile.js`), therefore `kachel.css` belongs in the common layout of a shell, never in a single page.
- **Rewards** (`web/belohnungen.js`) set the same tile: `.bl-symbol.mql-row-icon`, row 64/54 px, the reward kind colours only the symbol.
- Not the tile: `.gegenstand-symbol` (20 px, inline in the reward text) and `.related-symbol` (narrow symbol column without border).

## Existing building blocks

- **Tabs:** `components/reiter.twig`, `web/reiter.css`, `web/reiter.js` — contract in [`reiter.md`](reiter.md).
- **Filter:** `web/filter-ui.js`, `filter-ui.css`, `filterzustand.js`, `filteradapter.js` with page configurations (`aufgaben-filter.js`, `gegenstaende-filter.js`, `handwerk-filter.js`, `karten-aufgabenfilter.js`).
- **Result row:** `php/templates/entity/_result_row.twig` (server-side) and `web/treffer-zeile.js` (in the browser); both map the same contract.
- **Status choice:** `web/status.js` (`MQL_STATUS_UI`).
- **Symbol tile:** `.mql-row-icon` in `web/filter-ui.css`, sizes 64/54 px.

## Checking

- A building block is checked in DE/EN/FR on desktop and phone, in dark and light.
- `tests/test_darstellung_iststand.py` fixes surface, grid, rows and map panel; new building blocks get a check there.
- Tabs are checked by `tests/test_reiter.py` and `tests/browser_reiter.js`; the Python test also fixes the documentation and its references.
- After removing old rules, a `grep` proves that the old class names no longer occur anywhere.
