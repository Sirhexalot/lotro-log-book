# Tabs

**Rule:** one tab bar for the whole page. Every page with tabs uses
`components/reiter.twig`, `web/reiter.css` and `web/reiter.js`. No page
writes its own `role="tablist"` markup, no page brings its own
tab colours. A new tab on an existing page is an entry
in the list, not a new building block.

Whoever builds a new tab spot checks `tests/test_reiter.py` and
`tests/browser_reiter.js` afterwards; both fail as soon as a page again
brings its own tabs.

## Where it stands

| Page | Identifier | Tabs |
|---|---|---|
| Item (`entity/item.twig`) | `item` | Woher · Wofür |
| Instance (`instances/detail.twig`) | `instanz` | Quests · Rewards · Loot |
| Class (`app/klassen.twig`) | `klassen` | Quests · Deeds · Items |
| Area (`entity/area.twig` + `entitaeten-listen.js`) | `related` | Quests · Deeds · Items |
| Companion (`app/companion.twig`) | `companion` | Windows · macOS |
| Character progress (`app/spielstand.twig`) | `ordner` | Windows · macOS |
| Crafting (`app/handwerk.twig`) | `handwerk` | Recipes · Resources |
| Vendor (`vendors/detail.twig`) | `haendler` | Wo · Was |
| Advisor (`app/ratgeber.twig`) | `rat` | Ausrüstung · Taschen & Bank · Weiterspielen |

## Files

| File | Task |
|---|---|
| `php/templates/components/reiter.twig` | Markup, macro `reiter(kennung, titel, eintraege, aktiv, versteckt)` |
| `web/reiter.css` | appearance; only place with tab colours |
| `web/reiter.js` | `MQL_REITER.mount(host, optionen)`: selection, panels, keyboard, hash |

Both are included centrally: `reiter.css` in `Shell::styles()` and in
`app/layout.twig`, `reiter.js` in both layouts. No page loads the files
itself.

## Markup

```twig
{{ reiter.reiter('item', w.ilabel, [
    {key: 'woher', label: w.tab_where_from, panel: 'item-tab-woher', zahl: page.where_from_count},
    {key: 'wofuer', label: w.tab_used_for, panel: 'item-tab-wofuer', zahl: page.used_for_count}
], 'woher') }}
```

- `kennung` becomes the prefix of the tab IDs (`item-woher`).
- `titel` (second parameter) is the accessible label of the tab bar: it names
  the group of tabs („Händlerangaben“, „Quests, deeds and items“), never the
  entity whose page carries them.
- `panel` is the ID of the `[role="tabpanel"]`; several tabs may point to the same
  panel (the area page re-renders it).
- `zahl` is optional. It is rendered only for values greater than zero, as a
  muted badge without gold.
- Pages that only know their number later set it via
  `reiter.zahl(key, wert)`; `0` or `null` removes the badge again. A
  counter never stands on a tab that has not yet loaded data.
- `versteckt` (fifth parameter) delivers the bar with `hidden` so that
  visitors without JavaScript see all sections one below the other. `mount` makes
  it visible.
- The panel itself remains the page's task: it carries `role="tabpanel"` and
  `aria-labelledby` to the tab ID (`<kennung>-<key>`).

## Behaviour

`MQL_REITER.mount` takes over everything the page used to do itself:

- exactly one visible panel, all others `hidden`;
- `aria-selected` and travelling `tabindex`;
- arrow keys, Home and End switch selection and focus together;
- `hash: true` reads the start tab from the address and writes it on
  switching (`verlauf: true` for an entry in the back history); `popstate` and
  `hashchange` bring the tab back on the back button too;
- `onShow(key)` runs on every switch, also on the first, and is the place for
  reloaded lists (instance filter, crafting recipes, area lists).

Pages may not set `aria-selected`, `hidden` or `tabindex` themselves.
They deliver only content and say what happens on switching.

## Appearance

- The active tab merges into the surface below: same background colour,
  no bottom edge, golden top edge, `margin-bottom: -1px`.
- **The panel belongs to the component.** `.llb-reiter ~ [role="tabpanel"]` carries
  border, surface, inner padding and the radius `0 6px 6px 6px`. A page that
  frames its panel itself creates a second border; such rules belong
  here, not in the page CSS.
- The focus ring lies **inside** (`outline-offset: -3px`). An outside
  ring makes the tab look like a different component.
- Inactive tabs stand on `--fläche` with `--schwach`; hover and focus use
  `--gold`.
- Colours exclusively via theme tokens. No fixed palette values: exactly
  on that the old tabs failed in the light design (black
  search button, illegible inactive tabs).
- The bar is one row and wraps when needed; on the phone it may
  not overflow horizontally.

## What not

- No second tab markup „only for this page“, not even as a copy.
- No tab colour and no panel border in a page CSS; changes
  belong in `reiter.css`.
- No `aria-pressed` button group as a tab substitute — that is a switch, not a
  tab, and screen readers announce it differently.
- No counter that is counted from the DOM. The page delivers the number; the
  component only shows it.
- No hiding of content in the tab itself: what should not be visible is
  a different panel, no `display:none` in the panel.

## Checks

- `python3 -m unittest tests.test_reiter` – only the component contains
  `role="tablist"`, no page brings old markup or old styles, both
  layouts load CSS and script.
- `node tests/browser_reiter.js http://127.0.0.1:8817` – all seven pages,
  both widths, click, arrow keys, light design, no horizontal overflow.
  The same script runs against the published address.
- `tests/browser_area_tabs.js`, `tests/browser_related_lists.js` and
  `tests/browser_handwerk_reload.js` cover the content behind the tabs
  (search, filter, hash over a reload).

## New page with tabs

1. Add `{% import 'components/reiter.twig' as reiter %}` in the template.
2. Create panels as `<section id="…" role="tabpanel" aria-labelledby="<kennung>-<key>">`;
   only the start panel remains visible.
3. Insert `reiter.reiter('<kennung>', '<Titel>', [ … ], '<startkey>')`.
4. Call `MQL_REITER.mount` in the page script, `onShow` for reloaded content.
5. Extend `tests/test_reiter.py` by the page, `tests/browser_reiter.js` by
   path and tab count.
