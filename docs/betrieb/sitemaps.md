# Sitemap change dates

The live PHP sitemap adds `<lastmod>` from the render-ready page models prepared
by `tools/build_php_data.py`. It does not use build time, file modification
times, page requests, or deployment time as a proxy for content changes.
The existing sitemap structure already partitions by language and entity type
(52 child sitemaps, including the split item sections). Dates and fingerprints
are keyed by the full canonical URL, so a translated model changing in one
language does not advance the corresponding page in the other languages.
Item maps are split at 45,000 URLs (for example,
`/de/gegenstand/sitemap-1.xml` and `sitemap-2.xml`), safely below the protocol
limit of 50,000. Language and entity type are already explicit in each path;
the existing names remain stable.

## Per-page tracking

`tools/sitemap_lastmod.py` fingerprints each sitemap-listed detail page and
catalogue list page using canonical JSON and SHA-256. The stored value is
compared with the previous build:

- an unchanged fingerprint keeps its previous date;
- a changed fingerprint receives the build date in `Europe/Berlin`;
- a newly listed URL receives the build date after the initial baseline;
- removed URLs are removed from the persisted state.

Because the fingerprint is taken from the localized, render-ready page model,
it covers generated content and data corrections that affect that page.
Template/CSS-only changes are deliberately excluded; use the explicit manual
reset only when a verified presentation change materially changes the page
content or usefulness.

The first baseline is **2026-11-25**, the date of the latest data release when
tracking was introduced. It is stored in `referenz/sitemap-start.json`. This
one-time date is used for every URL in the first tracked build, including URLs
without a page-model fingerprint. The first baseline is not recalculated on
later builds.

Application URLs and the set catalogue landing page do not currently have
dedicated render-ready page models in the sitemap generator. They keep their
baseline date and change only when an operator deliberately resets all sitemap
dates. This avoids pretending that a general data build changed their content.

The compressed URL/hash/date state lives outside the repository at
`~/.cache/llb-php/sitemap-state.json.gz`. A missing state file is recovered
from the existing sitemap dates where possible; the generator then records
current fingerprints. Back up this state with the generated PHP data if
preserving the exact per-page change history matters.

## XML output

`phpdata/sitemaps.json` keeps `sections` as URL arrays and adds a parallel
`lastmod` date array for each section. The PHP renderer emits `<lastmod>` only
when the date array length matches the URL array and the date is valid. Each
child sitemap in `/sitemap.xml` receives the latest valid date from its URLs.
The static sitemap builder does not add dates; only the live PHP sitemap path
is affected.
This gives crawlers a per-child-sitemap change signal. It does not guarantee
that Google will skip unchanged sitemaps or avoid recrawling their URLs.

For a deliberate full refresh (for example, a verified template change that
meaningfully updates every page), use:

```bash
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata" --sprache alle --sitemap-neu YYYY-MM-DD
```

Choose the actual date of the content update. This flag is never set
automatically. The generated sitemap data can be uploaded only as part of an
explicitly approved release; building it locally does not publish it.

## Verification

Run:

```bash
python3 -m unittest tests.test_sitemap_lastmod
php -l php/src/Sitemap.php
```

After a data build, `tools/pruefe_entitaeten.py` still validates the URL lists
from `sitemaps.json`; the parallel date arrays do not change its contract.
