# 1. Introduction and goals

LOTRO Log Book is a multilingual website for content and progress from *The Lord of the Rings Online*. Among other things, the code provides quest and deed maps, catalogue and search pages, crafting, travel, adventures, factions, landmarks, instances and pages for individual game entries. The publicly used languages are German, English and French.

### Requirements and stakeholders

The system purpose evidenced by product and repository is to make LOTRO game content findable in a multilingual website and to process optional personal progress data in the browser. Visible functional requirements are: open up content through maps, finders, search, lists and detail pages; show relationships between catalogue entries as far as they emerge from the sources; import supported Companion files locally; build and transfer releases from prepared data.

No separate, approved requirements document with must/can priorities and acceptance criteria was identified as an authoritative source in the examined project inventory. The following stakeholders are therefore derived from the architecture boundaries and are not to be understood as a complete organisational analysis:

| Stakeholder | Architecture interest | Evidence/openness status |
|---|---|---|
| LOTRO players and visitors | Find content, use maps/filters and read details | Capabilities are implemented; formal user goals are not documented |
| Visitors without an import | Use the catalogue and website without plugin or character files | Supported by public pages and browser code |
| Users with a Companion export | Import character progress locally and use it for personal views | Supported by `web/companion.js`, `web/speicher.js` and tests |
| Operators/release owners | Check the data status and transfer releases in a controlled way | Tools exist; roles, approval process and SLA are open |
| Data/generator maintenance | Process sources and relations correctly, avoid unsupported statements | Project rules and audits exist; responsibilities are open |
| Rights holders/external providers | Compliant use of content, libraries and services | Complete approvals/contracts cannot be derived from the application code |

Architecture goals recognisable from the implementation:

- **Do not ship catalogue pages fully pre-rendered as HTML for every entry:** Python prepares data and page models; PHP renders matching page models per request.
- **Do not fully scan large data volumes for every request:** The data is stored in shards and addressed by stable IDs.
- **Process player progress in the browser:** Companion import and character selection live in the browser's JavaScript storage.
- **Use one shared page shell and localised paths:** PHP/Twig and the browser application share navigation, language selection and public language paths.

Evidence: `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_php_data.py`, `php/src/Catalogue.php`, `web/companion.js`, `web/speicher.js`.

### Quality goals (derived from the current code, not as an approved SLA)

| Rank | Quality goal | Implementation visible in the code |
|---|---|---|
| 1 | Serve large catalogues efficiently | Prepared shards, compact relation rows, no full catalogue scan per PHP request |
| 2 | Canonical and real page responses | Central router, 301 for old/non-canonical addresses, 404 for entries that do not exist |
| 3 | Keep progress private in the browser | Companion processing and multi-character storage on the client; release leaves `fortschritt.js` empty |
| 4 | Serve three language paths consistently | Language in URL and localised catalogue/label artefacts |
| 5 | Derive links reproducibly from data | Build view models and indices; generator/contract tests |

The code sets no measurable latency, availability, RPO/RTO or accessibility SLAs. These goals must therefore not be understood as fulfilled operational commitments.

Architecture goal conflicts are in particular: local character progress protects against server-side storage but is bound to browser/profile; prepared catalogues limit request work but increase build coupling and artefact coordination; crawlable HTML pages and interactive filters are combined, but their fallback quality must be checked per surface.
