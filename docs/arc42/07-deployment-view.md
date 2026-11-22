# 7. Deployment view

### Logical topology

```text
Build environment
  local source data + external export inventories
       │ Python generators / PHP data build
       ▼
  Release directory (program + phpdata + assets + manifest)
       │ upload.py via FTPS
       ▼
Production host (physical details partly open)
  Web server / rewrite rules
       ├── static assets and map images
       └── PHP entry point
            ├── front controller + Twig
            ├── reading phpdata/vendor files
            ├── Twig cache (writable)
            └── statistics file (writable)
  Browser
       ├── HTML/CSS/JavaScript and subsequently loaded JSON shards
       ├── local character/filter state
       └── locally selected Companion files
```

The diagram shows logical nodes. Physical server count, containers, concrete PHP SAPI, CDN, database and hosting product cannot be reliably derived from the repository and are not claimed.

### Release artefact

The PHP release is assembled with `tools/build_release.py`. Target paths are `~/.cache/llb-release` by default, data via `~/.cache/llb-php/phpdata` and terrain via `~/.cache/llb-terrain/public`; all are overridable. The builder deletes the given target directory if it already exists and recreates it. Therefore only a build folder intended specifically for this purpose may serve as the target.

The builder produces compact map start data, copies browser files (without old app HTML entries and without private progress), provides an empty `fortschritt.js`, builds tracking/SEO artefacts, copies localised WebP maps with preview images, optionally includes the terrain manifest with a matching version and copies the PHP app, Twig dependency and prepared PHP data. It then computes a content-based version for CSS/JS including map shards, checks mandatory paths and manifest and writes the release manifest. The `.htaccess` rewrite is deliberately handled separately.

### Runtime

`deploy/index.php` sets the release webroot and `LLB_PRODUCTION=1` and then loads `php/public/index.php`. The front controller takes data, cache and web paths from environment variables or the release default paths. In production, Twig auto-reload is disabled; a template change therefore requires clearing the Twig cache (`tools/cache_leeren.py`).

### Upload

`upload.py` supports manifest/component uploads. `tools/release_components.py` classifies files as `programm`, `daten` or `assets`, rejects unknown paths, symlinks and detected private files and writes file size plus SHA-256 into the manifest. The component version values are based on a canonical digest of the respective file paths, sizes and hashes. During upload the component can be selected individually; server manifest, adoption/migration and orphaned files are separate explicit operational actions. The `.htaccess` is handled separately. Upload credentials and local upload state lie outside the repository.

A release build alone does not switch the website over and uploads nothing. For production, at least release build, successful manifest/file upload and—depending on the change—cache clearing or a separate rewrite switchover are required. For this, the code contains `tools/umschalten.py`, `tools/cache_leeren.py` and `tools/veroeffentlichen.py`; the individual operational actions remain expressly outside this documentation assignment.

### Local preview

`php/public/router.php` is the router for the PHP development server. It serves local web/map resources and routes application requests to the PHP front controller. A terrain build can come from the local cache.

### Second builder in the repository

`baue_website.py` also exists and produces a static website build. The PHP release path is separate from it and is defined by `tools/build_release.py`. Whether and when the static builder is still used for an active flow cannot be derived from its mere existence.

### Execution environments and writable state

- **Local:** `php/public/router.php` serves existing files directly from the web/terrain inventory and routes application requests to the front controller. PHP data, Twig dependency and cache can point to the local cache paths via `LLB_DATA`, `LLB_VENDOR`, `LLB_CACHE`, `LLB_WEB` and `LLB_TERRAIN`.
- **Production:** `deploy/index.php` sets `LLB_ROOT` and `LLB_WEB_ROOT` to the document root, activates `LLB_PRODUCTION=1`; the application reads `phpdata/`, `vendor/` and `phptmp/twig/` next to the entry point.
- **Write access:** catalogue and page models are read-only. Writable are the Twig cache and the statistics file (alternatively `LLB_STATS_FILE`). The front controller creates the Twig cache folder if needed; PHP must therefore be able to write into the respective operational folder.
- **Access protection:** the deployment description requires blocking `phpdata`, `php`, `vendor` and `phptmp` against direct web access. The rewrite/protection rules belong to the separate server configuration, not to the release manifest.

### Deployment, communication and open infrastructure details

- Public browser communication runs over the website URLs; TLS endpoint, proxy/CDN and concrete cache configuration are not fully evidenced.
- The build reads local and external source files. Production requests read prepared artefacts and need no connection to the DAT sources.
- At runtime, catalogue models are read-only; Twig cache and statistics file are writable areas.
- Character data stays in the browser and is not shipped as release content.
- Protection of `phpdata`, PHP sources, dependencies and cache is required; the actual effectiveness must be verified on the active host.

| Topic | Present in the repository | Operational detail still open |
|---|---|---|
| Hosting | Upload target and web paths | Provider, region, owners |
| Web server/PHP | Entry points and minimum version | Product/version, SAPI, worker and process model |
| Network | public domain | TLS, DNS, proxy/CDN |
| Persistence | cache/statistics file | Backup, retention, recovery, monitoring |
| Capacity | no binding SLA values | load budget, scaling, RPO/RTO, alerting |

These values are open and are not derived from a typical shared hosting model.

Evidence: `tools/build_release.py`, `tools/release_components.py`, `deploy/index.php`, `upload.py`, `tools/cache_leeren.py`, `tools/umschalten.py`, `tools/veroeffentlichen.py`, `php/public/router.php`, `php/public/index.php`, `baue_website.py`.
