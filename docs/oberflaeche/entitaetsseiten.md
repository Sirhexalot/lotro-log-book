# Entity detail pages

One skeleton for every entity detail page, one width, one component per
building block. The binding list of sections per entity lives in the
[entity contract](../datenraum/lotro-datenraum-entitaeten.json) under
`detailseiten`; this file explains the rules behind it.

## Rule

**Every entity detail page uses the header's shell width and the same five
zones. Its sections come from shared building blocks; a page never builds its
own place block, reward row, objectives fold or fact grid.**

## Width

- `--huelle` in `web/gemeinsam.css` is the one container width: 100 %, from
  768/992/1200/1400 px 720/960/1140/1320 px. The header uses it on every page.
- Entity pages carry `entity-detail-layout` (or `katalog-detailraster`) and
  therefore run over the full shell width; `.katalog-inhalt article { max-width:
  960px }` applies only to text pages.
- Reading text keeps its measure: `.katalog-detailraster .katalog-text` stops at
  68 characters. Sections, tables and relation lists use the full width.
- No section sets its own page width. A value table may limit its column inside
  the grid, never the page frame.

## Zones

| Zone | Content | Building block |
|---|---|---|
| Kopf | Type, symbol, name, way back to the list | `entity/_header.twig` |
| Lage | Chips, progress, level range | `entity/_progress.twig`, `.katalog-chip` |
| Inhalt | Description, facts, values, rewards, objectives; the place beside it | `flaeche`, `fakten`, `belohnungen`, `ziele`, `ort` |
| Beziehungen | Sources, uses, related entries — as tabs only from two areas | `reiter`, `entitaeten-listen.js` |
| Abschluss | Actions: map, crafting list, back | `.llb-aktionen`, `.llb-knopf` |

A zone without data disappears completely. No empty heading, no placeholder
line, no reserved column.

A section's surface is `components/flaeche.twig`:
`flaeche.flaeche(titel, inhalt, ebene, klasse, kennung)`. Twig has no `{% call %}`
tag, so the content is built with `{% set inhalt %}…{% endset %}` and passed as
one argument. A page that writes `<section class="llb-flaeche">` inline gets the
same look from `flaeche.css`; the macro is the shorter form.

## Page shapes

The contract carries the binding order; this table says in one line what a page
shows. Every page starts with the head and ends with its way back to the list.

| Entity | Page shows |
|---|---|
| Quest (`entity/quest.twig`) | Chips and progress · description · facts (where from) · rewards · objectives fold · place · related lists as tabs |
| Deed (`entity/deed.twig`) | as quest, related lists split by same area / same category |
| Item (`entity/item.twig`) | chips · description · values · variants · set · sources and uses as tabs · item search |
| Recipe (`entity/recipe.twig`) | classification · ingredients · optional ingredients · results · sources |
| Set (`sets/detail.twig`) | piece count and suitability chip · pieces as result rows (rarity and level) · bonuses by threshold |
| Quest giver (`givers/detail.twig`) | description · greeting (folded) · places · quests · same-name entries |
| Vendor (`vendors/detail.twig`) | places and stock as tabs |
| Title (`entity/title.twig`) | title kind as chips · sources as tabs (quests / deeds) · rank note |
| Landmark (`entity/landmarke.twig`) | map, region and quest count as chips · place block · quests here |
| Area, region (`entity/area.twig`) | count chips · map with action · parent and sub-areas · quests / deeds / items as tabs |
| Instance (`instances/detail.twig`) | level, group size and difficulty as chips · geography facts · description · bosses and enemies (folded) beside the interior map · quests / rewards / loot as tabs |

An **instance** page names no type of its own beyond the head: the finder's
entry is an instance, so a "type" chip would repeat the page kind. Its interior
map is an illustration, not a place cut — `karte.twig` gets `form="bild"` and the
picture keeps its own aspect ratio and pixel size instead of the 4:3 frame.

## Places

One component, one rule: **one place is a block, two or more are the picker.**
The form follows the count, never the page — a quest with one place and a
vendor with 61 both use `components/ort.twig`.

A **source list** inside an item or recipe is the exception and stays compact:
it names its places (name, chain, coordinates, both actions) without a map,
because the map would take over the page there. A **vendor** source row names
no place of its own — the vendor page carries its location, and the row would
only repeat it. A filtered source list carries no "Wo" at all.

## Tabs

- A tab bar appears only with **at least two areas**. One area stays a surface
  with a heading; a bar with a single tab is not built.
- The bar and its panels are siblings, so `reiter.css` can frame the panel.
- The bar ships **hidden**: without JavaScript every area stays readable. The
  browser unhides it and hides the inactive panels.
- Relation lists that arrive as IDs let `web/entitaeten-listen.js` build the bar
  itself — same classes, same `MQL_REITER` behaviour. A list names its row
  adapter with `kind` when the tab key differs (the two deed groups `d_area`
  and `d_kind` both render as deeds).
- Only a page that renders the relation list ships the IDs (`#related-lists`):
  quest, deed, item, area and region. A title or landmark page names its quests
  and deeds itself, so it carries none and loads no relation scripts.

## No silent losses

A field of the page model is either shown or named in the contract as
deliberately not shown, with a reason. Today that is:

- recipe: `critical`, `critical_id`, `critical_symbol` — the critical result is
  the second variant in `results`, a separate field would repeat it.
- quest giver: `gender` — the client knows only `MALE`/`FEMALE`, no player text.
- set: `members[].card` values and bonuses — a piece's values belong to its item
  page; the set page names the piece and its classification, nothing else.

Breadcrumbs are built in `php/src/Shell.php::crumbs()` and already include the
evidenced map path (`crumb_maps`) for quests and deeds.

## Checks

- `tests/test_detailseiten_vertrag.py` — contract complete, components exist,
  every unbuilt section names its reason, entity pages use the shell width.
- `tests/browser_entitaeten_matrix.js` — row, icon, divider, head, tabs, no
  overflow on desktop and phone.
- `tests/browser_related_lists.js` — threshold 5/6 and the width of a relation
  list.
