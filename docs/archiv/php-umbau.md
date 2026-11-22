# Rebuilding the catalogue on PHP + Twig

> Historical state of the PHP switchover. For today's builds and regular releases see [Operations](../betrieb/README.md).

Status as of 09.11.2026. **The site is switched over**: since 09.11.2026
the PHP front controller serves catalogue, application pages and sitemaps; the old
HTML files are removed (see „Publishing“). This text describes the rebuild from generated static
catalogue pages to a PHP application with shared Twig templates. It is the
working basis for the further steps and the acceptance before
publication.

## Why

The static catalogue writes a complete HTML file for every entity.
With 255.543 pages, a change to the header, menu or a
shared text means a complete rebuild and a comparison of hundreds of
thousands of files. The upload does compare contents and skips
unchanged files, but if the change sits in every page, that does not help.

Goal: **a change to the interface is a change to a few files.**
The public URLs, the contents and the operation stay the same.

## Structure

```text
composer.json            Twig as the only dependency, no framework
php/public/index.php     front controller: route, status code, output
php/public/router.php    router for `php -S` (local)
php/src/Catalogue.php    languages, path segments, routes, valid IDs
php/src/Data.php         reads exactly one data shard per request
php/src/Router.php       200 / 301 / 404 by the same rules as .htaccess
php/src/Shell.php        header, menu, breadcrumb, footer, assets
php/src/Page.php         builds the page variables, renders the template
php/src/View.php         Twig environment, `pin` filter, `symbol` function
php/src/Escape.php       escaping as in the previous generator
php/templates/           layout.twig and one template per entity
tools/build_php_data.py  creates shards and finished page models
tools/php_viewmodel.py   rules of the pages, one to one from the generators
tools/build_php_labels.py  labels and icons from build_katalogseiten.py
tests/test_php_parity.py   compares PHP output with the previous generator
```

## Data

`tools/build_php_data.py` writes to `phpdata/` (default) or `--ziel`:

```text
manifest.json                 schema, languages, counters
labels.json                   labels, icons, base URL
<sprache>/maps.json           map table
<sprache>/<art>/<shard>.json  raw data per entity
<sprache>/page-<art>/<shard>.json  finished page models for Twig
```

The shard is a hash of the identifier (`md5(id)[:2]`), not the beginning of the ID:
all game IDs start with `70`, a prefix shard would put the whole catalogue into
one file.

Relations (previous/next quest, prerequisites, „wird vorausgesetzt
von“, exclusions, same quest giver, same location) are resolved **during the build**
and stored with names. A page request therefore reads exactly one
small file and does not run through the catalogue.

## What is already implemented and checked

- Basic framework, router and shared shell (header, menu, breadcrumb,
  footer, assets with version stamp, tracking from the built index).
- **Quest pages**: chips, description, location with map and coordinates,
  quest giver, area path, prerequisites, rewards, „wird vorausgesetzt
  von“, context, objectives behind `<details>`.
- **Deed pages**: chips, location, deed kind, category, rewards with
  title/virtue icon, neighbouring deeds by area and kind.
- **Title, virtue, recipe, profession, area and region pages.**
- **Item pages** (52.798 per language): stats, bonuses, resource occurrences, sources,
  crafting, use, set context, path into the item search.
- **Item search**: tree filter category → kind/hand/class → slot from the
  client fields `category`, `class`, `equipmentCategory`, `slot`, `armourType`
  and `weaponType`; jewellery is the client class „Geschmeide“ with ring,
  bracelet, earring, necklace and talisman. A selection is a branch, not
  a loose single field.
- **Lists and overviews**: type indices with 200 entries per page,
  page navigation, items by kind and rarity (also combined),
  crafting and catalogue page. 3.252 pages in three languages in total.
- Title, description, canonical, `hreflang`, Open Graph and Twitter card
  are created as before.
- 301 for `.html` and for the address without a trailing slash, 301 for
  lower case, real 404.

Check: `tests/test_php_parity.py` compares the PHP output token by token with
the output of the previous generator (headings, texts, links, attributes,
order).

### Findings from the comparison

The comparison found more than formatting errors:

- **Rarity levels were twisted** (1 = legendary, not common).
- **Placeholders in the name** (`Ernte[n]`) were missing in the cleanup.
- **Two dead paths in the old build**: „Ausprägungen“ (variants) and linked
  set parts are never rendered because the access to `model['all']` runs
  into the void. For parity this stays so; activation is a separate
  decision after the switchover.
- **Empty heading „Werte“** on 10 of 52.802 item pages – a
  defect of the old build that is deliberately taken over and corrected afterwards.
- **Two French labels** stood fixed in the generator
  (`Utilisation`, `Ressources`) instead of in the language files.

## Addresses of the application pages

The application had its language in the query (`/index.html?lang=de`). It
now lies in the path, as in the catalogue:

| Before | New (DE) | EN | FR |
|---|---|---|---|
| `start.html` | `/de/` | `/en/` | `/fr/` |
| `index.html?lang=de` | `/de/karte/` | `/en/map/` | `/fr/carte/` |
| `index.html?art=taten&lang=de` | `/de/karte/taten/` | `/en/map/deeds/` | `/fr/carte/prouesses/` |
| `gegenstaende.html?lang=de` | `/de/gegenstandssuche/` | `/en/item-search/` | `/fr/recherche-objets/` |
| `handwerk.html?lang=de` | `/de/handwerk/rezepte/` | `/en/crafting/recipes/` | `/fr/artisanat/recettes/` |
| `reise.html?lang=de` | `/de/reise/` | `/en/travel/` | `/fr/voyage/` |
| `ruf.html?lang=de` | `/de/ruf/` | `/en/reputation/` | `/fr/reputation/` |
| `belohnungen.html?lang=de` | `/de/belohnungen/` | `/en/rewards/` | `/fr/recompenses/` |
| `spielstand.html?lang=de` | `/de/spielstand/` | `/en/progress/` | `/fr/progression/` |
| `companion.html?lang=de` | `/de/companion/` | `/en/companion/` | `/fr/companion/` |
| `plugin.html?lang=de` | `/de/plugin/` | `/en/plugin/` | `/fr/plugin/` |
| `suche.html?lang=de` | `/de/suche/` | `/en/search/` | `/fr/recherche/` |
| `gegenstand.html?lang=de&id=…` | `/de/gegenstand/<ID>/` | … | … |

`handwerk` already belongs to the catalogue page, therefore the crafting browser
lies one level deeper. Query parameters (`id`, `q`, `kat`, `art`, `nach`,
`vorkommen`, …) remain; the old language in the query is dropped.
All old addresses respond with **301** to the new one, including the carried-over query.

The pages themselves lie as Twig templates under `php/templates/app/`; the
shell (title, canonical, `hreflang`, header, footnote, script list) stands in
`app/layout.twig`. The JavaScript of the applications is unchanged, only
`menue.js` and `sprache.js` now know the new addresses and read the
language from the path.

## One public address (10.11.2026)

Until 10.11.2026, `sirhexalot.de`, `www.sirhexalot.de`, `mm.sirhexalot.de`
and `llb.sirhexalot.de` served the same website from the same folder; only the
canonicals pointed to `llb`. Search Console therefore saw three copies of every
page. Since then the following applies:

- **All names except `llb.sirhexalot.de` respond 301** to the same address
  under `llb`, path and query unchanged. The rule stands at the top of
  `public_html/mm/.htaccess`, that is in the document folder that is common to all names
  – not in the hosting panel. The panel knows only a global switch for
  HTTPS and no redirect per name.
- **No `%{HTTPS}` in the condition.** Some hosters terminate TLS before the
  web server; then Apache reads „off“ even on an encrypted request and
  the rule would redirect endlessly to itself. The protocol is handled by the
  HTTPS redirect of the host, the name by the `.htaccess`. Price: one
  `http://` request on an old name needs two hops.
- **The `.htaccess` does not lie in the repository.** Backed-up versions are collected by
  `~/.cache/llb-php/rollback/`; `tools/umschalten.py` replaces only the marked
  PHP block and leaves the host rule standing.

Check (each line one hop, target 200):

```bash
for n in sirhexalot.de www.sirhexalot.de mm.sirhexalot.de; do
  curl -sI "https://$n/de/aufgabe/700005C0.html?x=1" | grep -i '^location:'
done
curl -sI https://sirhexalot.de/phpdata/labels.json | head -1   # 403 = gleicher Ordner
curl -sI https://llb.sirhexalot.de/de/ | head -1               # 200
```

## Done at the switchover

1. **404 and legal texts** lie as files in the release; PHP delivers the
   404 page with real status and `noindex`.
2. **Hardening**: `phpdata/`, `php/`, `vendor/` and `phptmp/` are blocked via
   `.htaccess`, HTML responds with `Cache-Control: max-age=300`,
   sitemaps with one hour; the router checks type and ID in every path.
3. **Switchover** via `tools/umschalten.py`; the old `.htaccess` lies ready as a
   backup, the old catalogue files were removed afterwards.
4. **Comparison**: PHP addresses, sitemaps, 301/404 and browser check DE/EN/FR
   after the switchover.

## Still open

- **HEAD requests** and a separate look at error pages with broken data.
- **Operation**: observe storage space and access times of the shards. The
  Twig cache must be cleared after every release with a template change; for that there is
  now `tools/cache_leeren.py`.

## Acceptance before publication

- `python3 tools/build_php_data.py` and `tests/test_php_parity.py` green.
- Complete URL set identical, no new and no missing addresses.
- Sitemaps valid, complete, with the same URL set as the build.
- Canonicals and `hreflang` identical per entity.
- 301/404 behaviour as before, no redirect chains.
- Start page, map, search, import and character progress usable unchanged.
- Return path to the old state tried out.

## Working location

The repository lies locally under `~/Developer/lotro-log-book` since 09.11.2026;
the former iCloud folder is only a read state. `vendor/` belongs in the repo
because Composer writes the project path into the autoload – if it lies outside,
the class paths point to a different directory.

## iCloud (history)

The former state lay in `~/Documents` and therefore in iCloud. Files not used recently
are only placeholders there (`compressed,dataless`); reading
forces a download. Measured on 09.11.2026: **1534 ms per file** in
`phpdata` against **0,2 ms** on local storage, `daten/*.json` 2270 ms,
even `php/src/*.php` 1508 ms. Consequence: slow builds, a 78-minute release
and a `vendor/` evacuated by iCloud (Composer fatal).

Therefore:

- generated data and Twig cache lie outside: `~/.cache/llb-php/`
  (`LLB_DATA`, `LLB_CACHE`); `vendor/` stays in the repo,
- `Companion-Test` and `MagicQuestLog` stay in iCloud and are only read.

## Publishing

The published site is the PHP application; the document folder contains
entry point, application files, data and images. Build and upload
happen in this order:

```bash
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
python3 tools/build_release.py                    # ~/.cache/llb-release
python3 upload.py --quelle "$HOME/.cache/llb-release" --workers 8
python3 tools/cache_leeren.py                     # Twig lädt Vorlagen nicht selbst nach
python3 tools/umschalten.py --pruefen             # zeigt die neue .htaccess
python3 tools/umschalten.py                       # sichert die alte, schaltet um
python3 tools/umschalten.py --test                # Adressen der Live-Seite
python3 tools/aufraeumen.py --loeschen            # alte HTML-Bestände entfernen
```

**The cache step is mandatory as soon as a `.twig` template has been changed.**
`deploy/index.php` sets `LLB_PRODUCTION=1`, and with that Twig's
`auto_reload` is off: the compiled version stays until its entry
under `phptmp/twig` disappears. Without `tools/cache_leeren.py` a
template change looks like a faulty deployment.

`build_release.py` copies `web/`, `webp/` (as `karten/`), `php/`, `vendor/`
and `phpdata/`, writes `index.php`, `tracking.html` and `robots.txt` and leaves
the old application pages as well as every `fortschritt.js` with character progress out
(755 MB, around 16.800 files).

**Only** the `.htaccess` is switched: a marked block sends
catalogue addresses, old application pages and sitemaps to `index.php`, blocks
`phpdata/`, `php/`, `vendor/` and `phptmp/` and leaves images, scripts and stylesheet
files in place. The old version is backed up beforehand under
`~/.cache/llb-php/rollback/`; `--zurueck` uploads it again.
The earlier catalogue files initially stay in place and are removed after the
check with `tools/aufraeumen.py`.

## Trying it locally

```bash
COMPOSER_VENDOR_DIR="$HOME/.cache/llb-php/vendor" composer install
python3 tools/build_php_labels.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
python3 tools/vorschau_ordner.py        # Verweise für die Vorschau

LLB_VENDOR="$HOME/.cache/llb-php/vendor" \
LLB_DATA="$HOME/.cache/llb-php/phpdata" \
LLB_CACHE="$HOME/.cache/llb-php/twig" \
php -S 127.0.0.1:8812 -t "$HOME/.cache/llb-vorschau" php/public/router.php
```

The preview folder `~/.cache/llb-vorschau` contains only links
(`web/*` and `karten/` → `webp/`). If it is lost,
`tools/vorschau_ordner.py` rebuilds it in seconds; the data under
`~/.cache/llb-php/phpdata` are a separate build and remain untouched by that.

Check against the previous state (oracle = pages created with the old generator,
e.g. under `/tmp/llb-oracle-full`):

```bash
LLB_DATA="$HOME/.cache/llb-php/phpdata" \
LLB_ORACLE=/tmp/llb-oracle-full \
python3 tests/test_php_parity.py --anzahl 20
```
