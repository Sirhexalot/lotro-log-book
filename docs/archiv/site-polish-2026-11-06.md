# Start page, import and typography – 6 November 2026

## Changes

- Start pages DE/EN/FR rewritten: direct map entry, deeds and import before
  the image; three dated news items, a short feature overview and a visible
  LOTROInterface link to Magic Quest Log. No warning list and no repeated
  browser privacy notes on the start page.
- Menu and import heading: „Spielstand importieren“, „Import progress“,
  „Importer la progression“. Folder selection and the second import step name
  their concrete function. The former privacy box is a short note.
- Privacy shortened to five sections, fully translated; the German
  version is also readable without JavaScript. Hosting, GoatCounter and data subject rights
  remain named. No blanket claim that no data at all is transferred. Provider information checked:
  <https://www.goatcounter.com/help/privacy> and
  <https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/>.
- The Hetzner log retention is expressly described as a **configurable provider standard**,
  not as a checked account setting. The concrete setting in
  konsoleH remains to be confirmed; no hosting setting changed.
- Existing imprint changes retained; language switch added and footer
  unified. On every page only imprint and privacy, in the selected
  language. The map footer uses real layout space instead of covering the map.
- Shared type sizes in `gemeinsam.css`: body text 16 px, controls and
  metadata 14 px, section headings 20 px, page titles 28 px; font family
  identical, monospace only for paths/commands. No arbitrary small type in
  tables, notes, area tiles and map controls. Small digits directly
  in map symbols remain separate from that.
- Page titles, language/navigation labels, footer, import links and
  the missing French start page text added. The English/French
  FAQ now explains excluded alternatives correctly, instead of blanket
  excluding both sides of a quest pair. Catalogue and progress data
  stay unchanged.

## Check

- `node tests/test_i18n.js`: complete key sets and placeholders in all
  languages, HTML bindings, start page news/plugin link and privacy fallback.
- Python tests: `../MagicQuestLog/.venv/bin/python -m unittest discover -s tests`.
- `tests/browser_site_polish.js` with Playwright CLI: 21 page variants plus three
  opened deed views. Title, language, translation bindings, footer,
  font sizes, overflows, Windows/Mac instructions, entry above the visible
  page end and fully fitted 4:3 map at a changed window size.
- Import table additionally checked with a synthetic character: texts
  16 px, table/buttons/paths 14 px; labels DE/EN/FR complete.
- Screenshots under `output/playwright/start-polish-*.png` and
  `output/playwright/import-polish-*.png`.

The publication build passed the same check (21 page variants
and three opened maps, no JavaScript errors). Upload on 6 November:
42 files / 0,1 MB, 744 files unchanged.
