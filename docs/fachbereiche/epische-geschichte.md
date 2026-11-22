# Epic story: instances, interludes, prologues

Status as of 14.11.2026. The basis are the quests from the own client export
(`full-dat-en-de-fr-2026-11-03/quests.json`), not wiki or tracker lists.

## What the game data provides

- **`Quest_Category`** is the official book assignment („Epos - Band I, Buch 1:
  Aufruhr in der Finsternis“), in all three languages. It matches 1:1 the
  grouping `a` of the web data; the book order does not have to be guessed
  from names.
- **`Quest_IsInstanceQuest`** marks the instance row. The chapter carries
  `Quest_ContainsInstanceQuest`. The chapter row names its instance name
  („Instanz: Othrongroth“ belongs to „Buch 1, Kapitel 11: Othrongroth“).
- **`Quest_IsSessionQuest`** marks session play: they never appear in the
  journal and do not count.
- **`Usage_Operator 2` with status „abgeschlossen“** means „X darf nicht
  abgeschlossen sein“. Thereby a variant is permanently excluded as soon as
  the other was played (e.g. „4. Zwischenspiel: Halros' Wache“ in two
  versions).
- **`Quest_IsCompletionTracked = 0`** is **no** proof for „nicht
  abschließbar“: the character progress contains 247 such entries as completed.
  The marker is therefore not evaluated.

## Implementation

`tools/build_questmerkmale.py` reads the export and writes
`daten/questmerkmale.json` (not checked in, like all `daten/*.json`):

- `instanzen`: instance row → chapter. Only unambiguous pairs: exactly one chapter
  with the same title in the same book category, and this chapter claims
  only one instance. Everything ambiguous remains its own row.
- `ausgeschlossen`: quest → completions that make it impossible.

`build_daten.py` attaches both to the quest data: `ie` (chapter of the
instance row) and additional entries in `e`.

## The view (`tools/build_epik.py` → `epik-<sprache>.js`, `web/epik.js`)

The epic is a view of its own; it uses the map but is not part of the map's
catalogue path.

- `tools/build_epik.py` reads the client path (`theme:epic` → `volume` →
  `category`) from the plugin export, the built rows from `daten-<sprache>.js`
  and the instance pairs from `daten/questmerkmale.json`. It writes the
  finished tree: 10 groups (volumes I–V, Before the Shadow, four story arcs),
  57 book sections and 1.551 quests.
- Book labels are cleaned at build time: the client's `Epos/Episch/Epic/Épique -`
  marker and a leading `Band/Vol./Volume X,` are dropped because the volume is a
  group of its own.
- Places are only proven ones: the quest giver's spot, the objectives of the
  step that names the chapter, or the chapter's place for an instance part
  (1412 of 1551 chapters). Nothing is estimated.
- `web/epik.js` renders the tree, owns folding, the prologue note, instance
  folding and counters, and asks the map app only for its list, filter,
  markers, map and detail pane (`SONDER` registry and host). It follows the
  stored map view (game map by default); only while the terrain is active, the
  drawn map of Middle-earth (`karten/<sprache>/268437554.webp`) lies behind
  the stage. The list title opens the view's own address
  (`?gebiet=Epische Geschichte`) and resets it; the generic list paging skips
  special views, so scrolling does not flatten the tree into a plain list.
- Instance rows disappear from the list; the chapter carries the note
  „Instanz“ or the deviating instance name. Session play that only retells an
  existing quest is not shown twice. A prologue block says that it leads into a
  book but does not count towards its progress.
- **Prologues have no status of their own (22.11.2026).** The generator marks
  every quest of a prologue book with `pr: 1`; the view renders those rows
  without a status mark and the detail pane shows the prologue note instead of
  the progress choice. A mark would contradict the hint directly above it. The
  flag comes from `tools/build_epik.py`, not from the quest name, so it holds in
  all three languages.
- **A click on a map dot opens the path in the tree (22.11.2026).**
  `web/epik.js` exposes `zeige(quest)`; the map app calls it after every
  selection, because the chosen quest may sit in a folded volume or book. The
  row is marked and scrolled into view, so a click never looks as if nothing
  happened.
- **The epic data is generated and never versioned.** `web/epik-<sprache>.js`
  is listed in `.gitignore` like `web/daten-<sprache>.js`. `build_release.py`
  runs `build_epik.py` before copying `web/`, `pruefen()` refuses a release
  without `epik.js`, `epik.css` and the three data files, and
  `tests/test_epik.py` holds that guard.

## Limits

- The instance assignment is a title assignment within the same book, not a
  direct link in the client. 668 of 1.282 instances are unambiguous; the
  rest remains visible.
- The progress proves only what the imported character progress contains. Without an
  import, numbers and markers remain empty; nothing is assumed.
- **Lazily loaded details never delete a known place.** The region and detail
  shards carry an empty `t` list for chapters; a plain merge would wipe the
  place the map already knows and the map would stop following the selection.
  `mergeDetails()` in `web/app.js` therefore treats an empty list or string as
  "no new information", not as a correction.
- From „book completed“ does **not** follow that the prologue is done. Only
  the prologue „Vor dem Schatten“, chapter 6, is a hard prerequisite of the new
  book 1 chapter 1; the old people's prologues are their own chains.

## Check

```bash
python3 -m unittest tests.test_epik
python3 -m unittest tests.test_questmerkmale
LLB_URL=http://127.0.0.1:8817 NODE_PATH=<global node_modules> node tests/browser_epik.js
```

Rebuild after data changes: `python3 tools/build_questmerkmale.py`, then
`build_daten.py` per language, then `tools/build_epik.py`,
`tools/build_php_data.py` and the release. `tools/build_release.py` runs
`build_epik.py` itself before copying the web files.
