# 10. Quality requirements and checks

### Quality tree

```text
LOTRO Log Book
├── Content findable and factually correct
│   ├── stable IDs and canonical URLs
│   ├── traceable relations and geography
│   └── no unsupported status/location statements
├── Content accessible
│   ├── German, English and French
│   ├── server-side HTML for catalogue content
│   └── interactive filters and maps in the browser
├── Personal progress private and usable
│   ├── local import
│   └── neutral state when data is missing
└── Delivery controllable
    ├── prepared data and release manifest
    ├── real HTTP status codes and protected internal files
    └── separate write areas for cache/statistics
```

The branches are derived from implemented properties, not from an approved, prioritised quality requirements catalogue.

### Quality characteristics and observable check points

| Characteristic | Check question / relevant behaviour | Existing check anchors |
|---|---|---|
| Correctness of the relations | Do entities only reach existing or permitted targets? Are direct and derived edges handled cleanly? | `tests/test_relationen_audit.py`, `tests/test_entitaeten_vertrag.py`, `tests/test_php_viewmodel_links.py`, `docs/datenraum/` audits |
| Rendering/data parity | Does the server-side PHP result match the catalogue/reference output? | `tests/test_php_parity.py` |
| Canonical addresses | Are ID spelling, slash form, legacy and unknown URLs correct? | `tests/test_router.py`, `tests/test_alte_adressen.py` |
| Filter and list contracts | Do filters, context, pagination and row rules remain correct? | `tests/test_filterbereiche.py`, `tests/test_vendor_filters.py`, `tests/test_vendor_viewmodel.py`, `tests/browser_related_lists.js`, `tests/test_entitaeten_vertrag.py`, `tests/test_darstellung_iststand.py`, `tests/browser_listen_iststand.js`, `tests/browser_entitaeten_matrix.js`, `tests/test_entitaeten_matrix.py` |
| Character progress import | Are IDs/states processed correctly and locally? | `tests/test_companion.js`, `tests/test_speicher.js`, `tests/test_companion_real.py` (separate real Companion integration test) |
| Map/geography behaviour | Are map start data, area assignment and pins correct? | `tests/test_kartenstart.py`, `tests/test_gebiete.py`, `tests/test_map_following.py`, `tests/test_landmarks.py`, `tests/test_gelaende.py`, `tests/browser_kartenuebersicht.js`, `tests/browser_tatenindex.js` |
| Multilingualism and texts | Are language paths, translations and player texts consistent? | `tests/test_sprache.py`, `tests/test_i18n.js`, `tests/test_spielertexte.py`, browser language tests |
| Release safety/consistency | Are private files omitted, components classified and releases checked? | `tests/test_release_components.py`, `tests/test_component_upload.py`, `tests/test_upload.py`, `tests/test_resource_packaging.py` |

The names of the tests are evidence for existing check anchors, not automatically a report about their last run or complete semantic coverage.

### Quality scenarios and measurement gaps

| ID | Scenario | Observable success criterion | Open measurement boundary |
|---|---|---|---|
| Q-01 Catalogue response | Visitor calls an existing detail ID | canonical page with 200; unknown ID with a real 404 | response time and load targets are missing |
| Q-02 Relations | Build produces a permitted relationship | target exists or a defined text/omission fallback applies | completeness of external sources not guaranteed |
| Q-03 Language | Visitor calls a supported language variant | route, labels and catalogue model use the same language | translation quality needs domain sign-off |
| Q-04 Missing import | progress function without character data | UI claims neither completion nor availability and shows no invented percentage | surface coverage of the tests varies |
| Q-05 Release | a change is built as a release | manifest classifies files; build checks run; cache/rewrite steps are separately executable | no end-to-end deployment test in this documentation |
| Q-06 Relation boundary | detail relation has five or six hits | five direct entries; from six the intended filter component, context preserved | not all relations are aligned; see `docs/todos/entitaetenvertrag-abgleich.md` |
| Q-08 Deed index load budget | `/de/tat/` is opened and searched | status 200, at least 40 hits, DOMContentLoaded < 1500 ms, load < 3000 ms, < 100 requests, search < 100 ms, no overflow at 390 px | local Chromium measurement with 8 PHP workers; no production/device SLA |
| Q-07 Overview without extra cost | overall map overview is opened and searched | no additional network requests; jump marks and group maps from loaded data; build and search stay within the local budget (build < 20 ms, search < 5 ms, no overflow at 390 px) | local Chromium measurement, no production/device SLA; browser check not in the Python suite |

For the overall map overview there is a local, reproducible budget (Q-07). Beyond that, quantitative targets for latency, availability, error rate, accessibility, data freshness, recovery time and supported browsers are not evidenced as binding requirements. Measured values for them are not invented.

### Kinds of checks present in the repository

- Python unit tests under `tests/test_*.py`, among others for routing, PHP parity, data builds, filters, maps and release components.
- Node tests under `tests/*.js` for browser logic, import, language and filters.
- Browser check scripts under `tests/browser_*.js`.
- Live acceptance scripts under `tests/live_*.js`.
- `tests/test_php_parity.py` compares the PHP output with a static reference output; its reference is determined via `LLB_ORACLE` or a local cache path.

The existence of a test script does not prove that it ran in the current run or that all functionality is covered by it.

### Not evidenced as repository automation

During the inspection, no `.github/workflows/`, PHPUnit/PHPStan/Infection configurations or coverage configurations were found in the checkout. `composer.json` declares Twig, but no `require-dev` tools. That says nothing about external GitHub settings or tools additionally installed locally.

No test run was started in this documentation step. A measured code coverage, a passed overall status or a permanently active CI quality gate is therefore not claimed. Browser/live scripts can require external services, running servers or browser profiles; they are not to be equated with an isolated unit test.

Evidence: `tests/`, `composer.json`; configuration search in the checkout of 19.11.2026. The actual dependencies and prerequisites are stated in the respective test code.
