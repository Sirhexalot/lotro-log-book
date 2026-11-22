# LOTRO Log Book – Documentation

| If you want to … | Read on |
|---|---|
| understand the structure and decisions of the site | [arc42 – twelve chapters](arc42/README.md) |
| follow one game area or its data pipeline | [Subject areas](fachbereiche/README.md) |
| change lists, filters or links | [Interface rules](oberflaeche/README.md) |
| run, publish or check SEO locally | [Operations](betrieb/README.md) |
| find data sources, the entity contract or data-semantics audits | [Data space](datenraum/README.md) |
| look for open work or acceptance criteria | [TODOs](todos/README.md) |
| find an earlier rebuild or a dated test record | [Archive](archiv/README.md) |

Valid references belong in the matching topic folder, open work orders in
`todos/`, superseded states in `archiv/`. When moving a file, also check the
references in [README](../README.md), [AGENTS.md](../AGENTS.md), scripts and
tests. Do not move machine-readable contracts without checking their consumers.

## Documentation language: English

Documentation in `docs/` is written **in English**. This applies to new files
and to every existing file as soon as it is touched.

- **What counts as documentation:** everything under `docs/**/*.md`, the folder
  READMEs, and the generated tables in `docs/datenraum/`.
- **What does not count:** player-facing website texts (they stay DE/EN/FR),
  code comments and identifiers, commit messages, `daten/`, `web/`, `phpdata/`.
- **Generated documentation is translated at the generator.** A hand-edited table
  would be overwritten by the next audit run. The English headings and labels of
  `lotro-datenraum-*.md` come from the scripts in `docs/datenraum/`.
- **Quoted game terms stay as they are.** When a text quotes a visible label or a
  data key, it keeps the original wording: `Aufgabe`, `Startklar`, `aufgabe`,
  `entitaeten`. A translation of a quote would be unusable.
- **Folder and file names outside `arc42/` keep their current spelling.** Paths
  are stable identifiers: `AGENTS.md`, scripts and tests refer to them, so they
  change only as a dedicated rename.

[AGENTS.md](../AGENTS.md) holds the binding work rules; this folder holds the
reasoning behind them.

## Glossary for English documentation

German game and project terms have one fixed English equivalent. Use it, do not
invent a second one.

| German | English | Note |
|---|---|---|
| Aufgabe | quest | the entity key `q` |
| Tat | deed | the entity key `d` |
| Gegenstand | item | |
| Rezept | recipe | |
| Set | set | |
| Titel | title | |
| Tugend | virtue | |
| Fraktion | faction | |
| Landmarke | landmark | |
| Auftraggeber | quest giver | the role, not a separate NPC identity |
| Händler | vendor | trading vendor: barter vendor |
| Instanz | instance | |
| Region | region | top level of the map tree |
| Landschaft | landscape | the map tab level |
| Gebiet | area | |
| Untergebiet | sub-area | |
| Merkmal | feature | quest traits in the finder |
| Stufe | level | |
| Fortschritt | progress | |
| Spielstand | character progress | the imported Companion data |
| Lernstand | crafting knowledge | which recipes a character knows |
| Ruf | reputation | |
| Belohnung | reward | |
| Vorkommen | resource occurrence | a crafting resource spawn spot |
| Voraussetzung | prerequisite | |
| Abenteuerüberblick | adventure overview | |
| Katalog | catalogue | |
| Kachel | tile | |
| Reiter | tab | |
| Filterbaum | filter tree | |
| Prüfstand | test record | a dated verification snapshot |
| Auflage/Stand | status as of | |
