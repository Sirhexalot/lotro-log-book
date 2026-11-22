# 4. Solution strategy

1. **Build time:** Python generators combine the locally available data sources and write web catalogues as well as PHP data artefacts.
2. **PHP data preparation:** `tools/build_php_data.py` reads web catalogues and `daten/*.json`, builds localised list and detail models, resolves relations and stores results in JSON shards.
3. **HTTP request:** `php/public/index.php` determines language and path, `Router` classifies the request, `Data` reads the required files and `Page`/specialised classes prepare the Twig context.
4. **Presentation:** Twig renders complete HTML. Browser JavaScript supplements the interactive applications and progressive filter functions.
5. **Release:** `tools/build_release.py` assembles static assets, PHP code, templates, `vendor/` and the prepared `phpdata/` inventory. `upload.py` transfers the release; Twig cache and web server switchover are separate steps.

The PHP request does not rebuild complete catalogues. `Data::page()` and `Data::entity()` determine the file bucket from `md5(ID)[:2]`; `relationRows()` groups requested IDs by bucket. This keeps access limited to the requested records, even when a detail page loads connected entries.

Evidence: `tools/build_php_data.py`, `tools/php_viewmodel.py`, `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_release.py`.

### Architecture approach

The solution moves source-dependent and compute-intensive data integration into the build. PHP/Twig delivers the prepared data needed for the route and page at request time; JavaScript supplements interactive filters, maps and local character views. JSON shards and stable IDs limit data access and decouple URLs from translated names. The release bundles program, data and assets, while upload, rewrite switchover and Twig cache clearing remain separate operational steps.

| Approach | Goal | Main consequence |
|---|---|---|
| Python data build before the request | Unite sources and prepare relations | Build order and compatible data states matter |
| PHP front controller plus Twig | Handle routing, status codes and HTML centrally | Web server rules must reach the entry point correctly |
| JSON indices and shards | limited read access without a request database | Producer and reader must use the same format |
| Browser modules without a framework | Interaction with shipped web assets | Coordinate load order, cache versions and browser compatibility |
| Local character state | personal views without a server profile | State is bound to browser/profile |
| Release components with a manifest | Transfer and verify changes selectively | Classification and confirmed server state become part of operations |

This documents the implemented strategy, not trade-offs invented after the fact.
