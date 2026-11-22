# 9. Architecture decisions

The following points are implemented architecture decisions or recognisable conventions. The repository contains no complete ADRs for them with date, decision-maker, alternatives and approval status. Reasons are therefore only named where they can be traced from code, data flow or comments.

| Decision | Reason recognisable in the code | Evidence |
|---|---|---|
| PHP renders prepared models instead of scanning the whole catalogue per request | Page and relation data are resolved during the build and stored in shards. Consequence: data and templates require coordinated releases; outdated shards can lead to inconsistent references. | `tools/php_viewmodel.py`, `tools/build_php_data.py`, `php/src/Data.php` |
| Public pages run through a central front controller | One shared place handles routing, redirects, errors and output. Consequence: correct rewrite/web server rules are part of delivery. | `php/public/index.php`, `php/src/Router.php` |
| Character progress is processed client-side | Import and character switching use browser modules and `localStorage`; the release provides an empty progress file. Consequence: progress is bound to browser/profile and is not a server-side account state. | `web/companion.js`, `web/speicher.js`, `tools/build_release.py` |
| Release is classified into program, data and assets | Manifest and SHA-256 values enable reproducible component versions and targeted uploads. Consequence: the component assignment must be maintained for new files; unknown paths prevent the manifest build. | `tools/release_components.py`, `upload.py` |
| Deed data uses the shared generator in the plugin repository | The website builder invokes it explicitly instead of maintaining a second deed generator. Consequence: the deed build is bound to an external repository and its data/Python environment. | `tools/build_taten_daten.py` |
| Large lists and map views are loaded in stages | Index/compact/detail data are separated in order to keep initial payloads small. Consequence: asset version, start data and shards must match. | `tools/build_karten_kurz.py`, `web/app.js`, `tools/build_release.py` |
| Documentation is written in English, including this file | One language for readers, agents and the mailing of a data-model description; player-facing texts stay DE/EN/FR because they are product. Consequence: generated audit tables must be translated at the generator, quoted labels keep their German wording, and folders outside `docs/arc42/` keep their names because scripts and tests reference them. | `AGENTS.md` (documentation rule), `docs/README.md` (rule and glossary), `docs/datenraum/*.py` |
| The PDF is generated from the Markdown, never maintained beside it | Markdown stays the single source; Mermaid sources live in the document, so a diagram cannot drift from the text. Consequence: a PDF build needs pandoc and a local Chrome, and the file stays in the ignored `output/` folder. | `tools/build_doc_pdf.py`, `docs/datenraum/entity-model.md` |

No formal ADR directory or automatic alignment of this table with code was identified in this documentation step.

### Missing decision evidence

For the decisions above, the point in time, responsible person, alternatives considered, explicit quality trade-off and criteria for re-evaluation are largely undocumented. This table is therefore an architecture status quo, not a retroactively produced approval record. Future important decisions should record these details in an ADR.

### Decided but not yet implemented decisions

These points are decided but not yet effective in the code. They are listed here so that the documentation does not present the state as implemented.

| Decision | Reason | Status and evidence |
|---|---|---|
| Unnamed maps are named after their assigned areas, not after their ID | `parchmentMaps.xml` lists areas with evidenced names in DE/EN/FR for every map; a technical ID is not a game designation. The derivation chain thus ends on a checked name instead of `Karte <ID>`. | Decided on 20.11.2026; implementation open. Plan and acceptance criteria: `docs/archiv/kartenbenennung-hierarchie.md`. After implementation the point moves into the table above. |
