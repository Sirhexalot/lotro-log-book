# 8. Cross-cutting concepts

### Language and URLs

The three supported language codes and the language-dependent path segments are held centrally in `php/src/Catalogue.php`. IDs remain independent of translated names; canonical slash addresses, capitalisation and redirects are checked by the router. Web data, labels and catalogue view models are built per language; the languages are not a translation freely switchable per request over one shared English record object.

### List and filter behaviour

Detail pages and index pages use the same compact row models as far as the relation fits the domain. Relational filter lists take over context IDs, filter/sort/paginate their hits and preserve the context on reset. The client component is driven via `entitaeten-listen.js` and the shared filter modules; server-side catalogue browsers such as the vendor, faction, landmark and title index have their own PHP filter rules. These are not one single universal filter implementation.

### Error and HTTP behaviour

For exceptions and fatal PHP errors, the front controller sets HTTP 500 and shows generic text; the error location is written to the PHP error log. Unknown paths and IDs receive a real 404, redirects carry `X-Robots-Tag: noindex`. Sitemap files are output as XML with one hour of cache; HTML catalogue responses are delivered with `max-age=0, must-revalidate`. For language-less root/legacy addresses, 302/301 depends on whether the target depends on visitor preference or on a fixed language value.

### HTML safety

Twig is configured with `autoescape: html`, `strict_variables: true`, `debug: false` and a configurable cache. JSON for inline scripts/attributes is encoded in the PHP view contexts with JSON-HEX flags and—where needed—`JSON_THROW_ON_ERROR`. PHP output outside Twig uses, among other things, `Escape.php`. Exceptions for already generated HTML must be evidenced in the respective code. The release manifest rejects detected key/secret files and does not include test, cache and upload state files.

### Browser state and privacy

Character data lies in browser storage. Language and various filter/view preferences are also held locally; some search/filter states additionally stand in URL parameters that serve as a shareable/reconstructable view. `Statistics` is separate from this and writes aggregated statistics file-based. The website additionally uses embedded tracking scripts; their exact runtime and privacy configuration also depends on the shipped assets and the production environment and cannot be derived from `Statistics.php` alone. The privacy texts and server configuration contained in the repository must be checked separately for a legal assessment.

### Caching

Twig cache, HTTP cache headers and version parameters of assets are separate mechanisms. `Shell` provides the asset version determined from the shipped JS/CSS files for version parameters; `build_release.py` computes its version including map shards on a content basis. Production Twig does not reload changed templates by itself; the separate cache clearing step is therefore part of the release flow. HTML is revalidated server-side, while the cache lifecycle of static files additionally depends on the web server configuration.

### Layout system, surfaces and rows

Recurring building blocks lie in `php/templates/components/` (markup) and a CSS file of the same name in `web/`; the surface of a section is called `llb-flaeche` and applies to catalogue pages as well as to the map detail column. Rules, names and inventory are in [Shared building blocks](../oberflaeche/bausteine.md).

The visible layout follows a 12-column grid (`--llb-raster` in `web/gemeinsam.css`). The same spacing and surface tokens apply to detail pages, filters and the map detail column. A section is a surface with border, radius and inner spacing; divider lines do not replace structure. The active tab merges into the surface (same background, 1 px overlap). Result rows (`web/filter-ui.css`) keep icon, name, level and progress on one top edge; the icon sits flush left, the progress flush right. Short relation lists keep the full surface, even with only one entry. Rewards and sources use the same 64/54-px icon tiles as the lists. Details: arc42 5.10.

The shared palette in `web/gemeinsam.css` provides dark and light. Dark remains the default; `data-theme="light"` selects the warm light palette. `theme-init.js` or the inline initialisation of the PHP shells reads `mql.theme` before the first paint, `theme.js` provides the accessibly labelled switch and stores the selection locally. Raw fixed colour shades lie exclusively as `--llb-palette-*` in `gemeinsam.css`; surfaces and interactions use role tokens such as `--grund`, `--fläche`, `--text`, `--offen` and `--rand-bedienung`. Profession colours and map/overlay colours are their own token families because they carry domain or graphic meaning. `theme-light.css` only supplements the surfaces that need fixed colours for game map or status reasons. New CSS colours are checked in `tests/test_theme.py` against direct colour values outside the central palette. The status colours for text meet at least 4,5:1 on the raised surface in both themes; the visible control borders at least 3:1 on the surfaces used. New surfaces should use shared role tokens and must not assume one mode. The book-and-quill mark lies in `web/lotro-log-book-mark.svg`; header, footer and favicon use the same brand shape, embedded for the themes as inline SVG via `<use>`.

### Filter logic and presentation

Filter state, facet counting and context binding are described in 5.9. On the presentation side, the following also applies: for quests/deeds the progress stands at the top of the filter column; single selections always show a chip, including the default value; progress is one field per entry, not a second status chip. The map list marks evidenced states with coloured icons; unknown progress remains neutral. The filter grid is 3/9 on the desktop and single-column with a dialog on mobile; native controls follow the active `color-scheme`.

### Performance budget of the overviews

The overall map overview must not create additional network requests. Jump marks and group maps are computed from already loaded data (`MQL_GEBIETE`, tree nodes, shards), not from new JSON files. The computation happens once per group head, not per map; click handlers sit on the container. Measured locally (Chromium, 20.11.2026, 8 PHP workers): DOMContentLoaded ≈ 43 ms, load ≈ 121 ms, complete overview build ≈ 6,5 ms with an empty search, search „Dunland“ ≈ 0,4 ms, 80 landscape maps with lazy images, no horizontal overflow at 390 px. The deed index `/de/tat/` needs DOMContentLoaded ≈ 94 ms, load ≈ 97 ms and shows after 50 hits; the search redraws in under 100 ms. These values are a local snapshot, not a production SLA. New functions in this area must not introduce new requests and should not measurably slow down the build; the browser check `tests/browser_kartenuebersicht.js` measures this.
