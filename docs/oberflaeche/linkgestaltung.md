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
