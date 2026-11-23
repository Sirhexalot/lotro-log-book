# Rules for links and type

Status as of 15.11.2026. These rules apply to all website pages and supplement the
common design rules in `AGENTS.md`.

## Links by function

- **Content links** must be recognisable as links even without hover. They use
  the existing accent colour gold and a visible underline.
- **Visited content links** remain gold. There is no own visited colour.
- **Breadcrumbs and footer links** are subordinate: muted text colour, no
  permanent underline; on hover and keyboard focus they are
  highlighted.
- **Buttons and button-like links** keep a surface and receive an
  explicit text colour. For catalogue buttons (`.katalog-knopf`) that is gold.
  An exception to the content link rule must never lead to the
  browser default colour blue becoming visible.
- **Navigation, tiles, result surfaces and map links** keep their respective
  own component rendering. Not every clickable surface is additionally
  underlined like a text link.
- Keyboard focus must be clearly visible (`:focus-visible`).

## Colours and information roles

- Introduce no new colour. Existing gold accents remain.
- Semantic colours, especially item rarities, must not be
  overwritten by a general link rule.
- No broad rule like `.katalog-seite a { color: ... }`: it overrides
  breadcrumbs, footer links, buttons and semantically coloured content.
- Define link states deliberately via role and component. With exceptions from
  general rules always check colour and decoration together.

## Type

- The website font is locally delivered Roboto from `web/fonts/`; do not include a
  Google Fonts URL. Monospace remains a separate special case for code
  (`--mono`).
- Use font family (`--schrift`), weights (`--gewicht-*`), line heights
  (`--zeile-*`) and font sizes (`--text-*`) centrally in `gemeinsam.css`.
  The base levels are body text `--text-normal`, operation
  `--text-bedienung`, section `--text-abschnitt` and title `--text-titel`;
  compact levels only for dense metadata and map labels.
- Do not arbitrarily shrink metadata and operating notes. Mobile tabs
  remain at least at the operation level; dense map controls
  may be compact only if legibility and operability are preserved.
- The hierarchy and the line flow must work on desktop, tablet and mobile;
  cause no additional horizontal page overflow on narrow
  displays.

## Check on changes

Check representative application and catalogue pages, among them content links,
breadcrumbs, buttons, tiles and semantically coloured titles. Consider hover,
keyboard focus, visited states, DE/EN/FR as well as desktop, tablet and mobile.
After CSS changes on catalogue pages check in particular
that no links fall back to browser default blue.

The implementation lies in `web/gemeinsam.css` and the area CSS files.

## Map actions on detail pages (23.11.2026)

A place that the game data really records may offer a map action. The address
carries the target in the query, so it is shareable and survives a reload:

- Quest or deed: `?id=<ID>` opens the area, selects the entry and jumps to its
  most precise map.
- Vendor: `?vorkarte=<map>&haendler=<ID>` turns the vendor layer on, limits the
  view to that vendor and marks it. A vendor detail links every recorded place;
  a short vendor source (up to five) on an item or recipe page offers the same
  places as an expandable "Wo" list. A vendor list row keeps only its detail
  link.
- Landmark or quest giver: `?vorkarte=<map>&punkt=<lat>,<lon>&name=<name>`
  draws one temporary marker. It is not a quest dot and does not change the
  list or the filter. Without a recorded coordinate no link and no pin exist.

**"Wo" never appears in a list with filters.** Each row of a filtered vendor or
barter list carries identity and classification only; a "Wo" per row would
repeat the same places hundreds of times. From six sources the filter list
takes over and the places stay on the vendor page. The item model builds the
same place entries the vendor page shows (`vendor_source_places` in
`php_viewmodel.py`), so name, chain, coordinates and both actions read the same
on both pages; nothing is merged, because the vendor page lists every recorded
position as well.

The "Wo" list is a `<details>` element (`components/wo_orte.twig`), so it works
without JavaScript. On an item page it sits after the source row, outside the
row link; a result row never nests a second link inside its detail link.
