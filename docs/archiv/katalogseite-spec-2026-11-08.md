# Detail page: structure and linking (spec for `build_katalogseiten.py`)

Status as of 08.11.2026. This file describes how an entity page should look and
which data make which links. It is a **work order to the central
catalogue build**: `build_katalogseiten.py` is on the blocked list and is not
touched here.

## Section order

`Kurz · Ort oder Vorkommen · Woher · Wofür · Zusammenhang`

No section „Details“ (ID, map IDs, source, state) — it is dropped.

| Section | Content | Source |
|---|---|---|
| **Kurz** | icon, name, one line level/area, markers (session play, alternative, repeatable), **description** | `n`, `l`, `z`/`u`, `x`, `e`, `rp`, `d` |
| **Ort** | with exactly **one** point: map section + coordinates; with **many** points: map and point count, no route | `gt`, `t`, `fk` |
| **Woher** | quest giver, area/region, prerequisites, level condition | `g`, `z`, `r`, `fk`, `v`, `vo`, `vl`, `vb` |
| **Wofür** | rewards with image and link, title, virtue, trait, emote; below that „Wird vorausgesetzt von“ | `rw`, back reference |
| **Zusammenhang** | quest sequence (`pq`/`nq`), excluding alternatives, same quest giver, occurrences in the area | `pq`, `nq`, `e`, `g`, `fk` |

The description stands **at the top**, not at the end. Parenthetical additions after values
are dropped („Auftraggeber: Ghân-buri-Ghân“, not „(noch ohne eigene Seite)“).

## Icons

- One Lucide icon per entity, **inline** before the `<h1>` in `.katalog-inhalt`:
  `scroll-text` quest, `trophy` deed, `package` item, `book-open` recipe,
  `map` area, `globe` region, `briefcase` profession, `award` title, `shield` virtue,
  `gem` resource occurrence. Catalogue `library`, crafting `hammer`.
- Markup: `<svg class="symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">…</svg>`
- Colour via `currentColor`; the pages set `color: var(--gold)` on the `<h1>`.
- No sprite file: the build copies no new assets, and inline works
  also with `file://`.

## Rewards

`rw` carries seven fields per entry: kind, name, quality, item level, count,
binding, **ID**. The ID has been filled since 08.11.2026 (19.039 of 19.385
entries), resolved via the reward index (`build_belohnungen.py`) with the
key (source ID, name) — names alone are not unique.

- Row: image `bild/items/<ID>.webp` (20 px, round, dark ground), then the name as
  link `/<sprache>/<segment>/<ID>/` (`gegenstand`, `item`, `objet`).
- If the image is missing, the place disappears (`onerror`), no empty frame remains.
- „Zur Auswahl“ stays one row: `zur Auswahl: A · B · C`, each entry with image.
- Titles, virtues, traits and emotes stay text (no ID in the reward index).

## Back reference „Wird vorausgesetzt von“

From the `v` lists of all quests: quest → quests that require it. Derive as an index
once per language (6.533 quests with prerequisites), do not search per page. For deeds the section is dropped (no verified link).

## Links that already exist

Area `/de/gebiet/<id>/`, region `/de/region/<id>/`, prerequisite and sequel
`/de/aufgabe/<id>/`, map `index.html?id=<id>`, travel `reise.html?nach=<lat>+<lon>`.

## What does not go on the page

Experience and money (not in the extractable data), quantities for virtues
(unknown), a deed link via `hz` (those are only positions).

## Deeds

Same order, with three deviations: icon `trophy`, „Woher“ names the deed kind and
the category instead of a quest giver, and „Wofür“ shows virtue, LOTRO points and title.
A back reference to quests is missing as long as the deed does not name its quests with IDs.
