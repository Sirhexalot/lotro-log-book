# 6. Runtime view

The following scenarios describe interactions at runtime, not the upstream source data build. Error cases are described only as far as they are visibly handled in the code.

### 6.1 Requesting a detail page

1. The web server routes the public address to `php/public/index.php`.
2. The front controller determines language and path and calls `Router::resolve()`.
3. The router returns a canonical page, a redirect or 404.
4. For an entity page, `Page` reads the prepared page model and, if needed, the required relation data.
5. Twig renders the page with the shared shell and localised navigation.

A missing entity identifier is not automatically interpreted as „annehmbar“ or „offen“; the router checks prepared data and answers with 404 for unknown entries.

### 6.2 Overview, filters and detail relations

```text
Browser → HTTP path → Router
                    ├─ app path → Page::renderApp() → app view/Twig → HTML + JS/CSS
                    ├─ entity path → Data::page(lang, type, ID)
                    │              → RelatedLists (only referenced IDs/shards)
                    │              → entity Twig → HTML + relation data
                    ├─ list path → Data::listPage(canonical path)
                    │            → list Twig → HTML + optional filter index
                    ├─ sitemap path → Sitemap (from sitemaps.json) → XML
                    └─ unknown → 404 with real HTTP status
```

The list forms are not assumed valid from a URL pattern alone. `Router::listPage()` queries the prepared list model; unknown categories/pages remain 404. For a relational detail page, the page model usually stores IDs, while `RelatedLists::forPage()` loads the matching records from typed shards. For quests and deeds, the same compact row form is used as in the public filter list. The general rule is up to five direct entries and, from six, the intended filter component (`FilterRegeln::MAX_DIREKTLISTE`); the implementation is not identical for every relation: in particular, item quest/deed sources activate the browser filter only from eleven entries, and `used_in` has a local recipe component instead of the shared one. These deviations are listed concretely in `docs/todos/entitaetenvertrag-abgleich.md`. The relationship context is meant to survive a reset; this must be checked per adapter.

### 6.3 Application and language paths

Application pages are listed per language in `Catalogue::APP`. Old flat `.html` entries are transferred to the language paths in the front controller. The language from an explicit path takes precedence; addresses without a language are resolved via language selection/cookie and `Accept-Language`.

The technical priority for language-less addresses is more concrete: a valid `llb_sprache` cookie, otherwise the first supported language from `Accept-Language` by quality value, otherwise English. `de-AT`/`de_AT` are recognised as German; other unsupported languages fall back to English. A language prefix in the path bypasses this detection.

### 6.4 Companion import

The browser reads the selected Companion files with JavaScript and processes quest, deed, reputation, crafting and character data. The character list and the active character are stored in the browser; UI components read the active character progress for progress display. An export can happen locally as a backup file or via the intended plugin export function. The PHP catalogue needs no uploaded character progress for normal page requests.

### 6.5 Statistics endpoint

`/api/statistik` accepts JSON actions, starts a session for this purpose with an `HttpOnly`/`SameSite=Lax` cookie and calls `Statistics`. The state lies in a JSON file with an exclusive file lock. The file contains aggregated import numbers as well as short-lived presence and idempotency keys.

Concretely, the endpoint accepts `heartbeat`, `import` or, as the default query, `current`; heartbeat IDs come from the PHP session, import events are deduplicated against double counting for 24 hours. Presence expires after 1.080 seconds. The file operation uses `flock(LOCK_EX)`; if file access is not possible, the class returns a fallback (`active: 0`, import base 150). The client reports event counters and active presence, not the character progress. That is a statement about this statistics class, not a complete assessment of external trackers.

Evidence for section 6: `php/public/index.php`, `php/src/Router.php`, `php/src/Page.php`, `php/src/RelatedLists.php`, `php/src/FilterRegeln.php`, `php/src/Sprache.php`, `php/src/Statistics.php`, `web/companion.js`, `web/speicher.js`, `web/statistik.js`.

### 6.6 Map application: staged data retrieval

1. The page template loader first delivers the map structure, landscape navigation and compact count/level metadata from the `karten-start-*` files. The count metadata also names the map IDs, so that tabs count completely before the subsequent load.
2. When a landscape/area context is opened, the application loads the corresponding map rows from the matching quest or deed shard under `karten-daten/` (up to four at a time); `MQL_SHARD_MAPS` avoids requests for maps without their own entries.
3. When a concrete entry is selected, its detail shard (`detail-map-<id>.js` or `detail-region-<n>.js`) with description, steps and complete objectives is merged in. The language catalogue (`daten-<sprache>.js` or `daten-taten-<sprache>.js`) remains a pure fallback for an old delivery state and is no longer transferred for the map.
4. Map objectives, quest givers and progress colours are composed from the record and the locally imported character state.

Thus the map page does not have to transfer all descriptions and rewards of all catalogue entries at the start. The local delivery/cache version for CSS, JS and map shards is synchronised at release via `stand.js`. Evidence: `tools/build_karten_kurz.py`, `tools/build_release.py`, `web/app.js`, `tests/test_kartenstart.py`.

### 6.7 Filter state and returning from details

1. A browser list reads its state from the URL; where implemented, the language- and area-specific filter memory is consulted for a URL without parameters.
2. Filter changes update hits, facets and counters; URL behaviour depends on the respective adapter.
3. A detail request can carry the list state for the return. The URL takes precedence over local filter memory.
4. Reset removes the state of the area in question. For relation lists, the owner context must be preserved.

Not every surface uses the same adapter or storage mechanism. [Section 5.9](05-building-block-view.md#59-concrete-presentation-and-filter-matrix-by-entity-and-place-of-occurrence) describes the concrete forms; this scenario does not claim complete equality.

### 6.8 Error and boundary flows

| Trigger | Behaviour evidenced in the code | Not covered by the code |
|---|---|---|
| Unknown route/ID | real 404 response | Availability of upstream web servers |
| Non-canonical address | Router can redirect to the canonical URL | Rewrite configuration of the active host |
| PHP exception/fatal error | 500, generic text and error log | Log rotation, alerting and response |
| Missing character import | personal values remain neutral/are omitted | Uniform fallback for all surfaces |
| Missing relation/target ID | link or record is omitted or remains text, depending on view model/template | Global fallback rule |
| Statistics file not usable | defined fallback state in `Statistics` | Persistent storage and operational alerting |
| Filter/asset module not available | depending on page, server list/form can remain | Uniform degraded mode for all apps |

### 6.9 Operational scenarios not evidenced

Backup/recovery of the production inventory, external data source outages during the build, parallel deployments, load peaks and restart after host failure are not described as end-to-end flows in the repository. Requirements and flows for these must be clarified with the operational owners.
