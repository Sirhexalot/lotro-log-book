# LOTRO Log Book

Browse quests and deeds by landscape, volume and book. See the game's maps,
search the catalogue and import your own progress from **LOTRO Companion** to
check quests, deed counters, reputation and crafting across characters.

Works without installing a plugin or creating an account, in German, English and
French. It also exports progress files for the **Magic Quest Log** plugin. The name
is **LOTRO Log Book** in every language.

Runs at **https://llb.sirhexalot.de/**.

## Travel planner (08.11.2026)

`reise.html` answers the question the game does not answer: *where is the next
stable-master from here, and which chain of stables gets me to that spot?*

- **Data** comes from the client: `daten/reise-<lang>.json`, built by
  `Companion-Test/source-exporter/travel_export.py` from the DAT-derived lore
  files, and wrapped as `web/reise-<lang>.js` by `build_reise.py`. 382 stables,
  5,103 routes, 289 travel skills.
- **Input**: a place name with suggestions, coordinates (`31.2S 68.4W`) or a
  whole `/loc` line pasted from the game. `/loc` is a built-in chat command, so
  no plugin is needed.
- **Output**: the nearest stable to a free position, then the chain of stables
  with the price in silver, the minimum level and whether a leg is swift travel
  or a ride. A second line shows the same trip without swift travel when that is
  possible.
- **No durations and no kilometres.** The game data carries prices, levels and
  requirements but no riding time; inventing an ETA would be guesswork.
- **Class ports** (Hunter guides, Warden musters) are listed for the chosen
  class. When a port points at a known stable, the result names it as a shortcut.
- **Mithril** is an assumption, not data: a swift leg can be unlocked with one
  coin, and the page says so instead of showing a made-up price.
- The network really has separate clusters (King's Gondor, boats, a few locked
  stables). For those pairs the page says "no route" rather than inventing one.

Entity pages of quests and deeds link here with `?nach=<coordinates>`, so
"Wie komme ich hierhin?" opens the planner with the target already set.

Tests: `python3 -m unittest discover -s tests -p 'test_reisedaten.py'`.

## Crafting resources on the map and on the crafting page (08.11.2026)

`build_vorkommen.py` turns the game's own placements into two views: a
**Vorkommen** layer on the map and a **Rohstoffe** tab on the crafting page.

- **Source**: category 50 ("Crafting Resource") in the DAT-derived lore data, the
  same door `game_maps.py` and the travel planner already use. 158 kinds,
  160 game maps, **140.465 spots**; 4.212 markers (0,6 %) fit no map of our
  catalogue and are dropped rather than guessed.
- **One spot, several kinds**: the files name two to six variants per spot
  (normal and rich, sometimes two trades side by side). The page therefore says
  "one of these can be here" — which one is standing there changes in the game.
  No respawn times, no amounts.
- **Region from the file, not from the numbers**: the first number of
  `markers-<region>-<x>-<y>.xml` is the region. Two regions share the same
  coordinate space, so `attribute()` without it put Gondor dots into Eriador
  frames (checked and fixed).
- **Files**: `web/vorkommen-<lang>.js` holds kinds, area names and the counts per
  map (22 KB); `web/vorkommen/<map>.js` holds the points of one map and loads on
  demand (largest 344 KB). Points are language-neutral, only names differ.
- **Names** DE/EN/FR come from the game's label table (`labels/<lang>/items.xml`),
  e.g. "Ader: Glanz-Skarn", "Windgepeitschte Schwarzeschenzweige".
- **Map**: its own switch group next to "Filter" — the game's 25 map
  categories do not include resources. Canvas dots coloured by trade, a click
  lists the possible kinds and links into crafting. `?vorkommen=<id>&vorkarte=<map>`
  opens the layer for one kind on one map. The legend carries one entry for the
  whole layer (swatch with every chosen colour), not one per trade.
- **Crafting**: `handwerk.html#rohstoffe` — trade → tier → kinds with spot count
  and areas, each area linking back to the map. The cook grows instead of
  gathering and has no landscape spots; four scholar kinds have none recorded.
- Tests: `python3 -m unittest discover -s tests -p 'test_vorkommen.py'`.

### Schnittstelle für den zentralen Katalogbau (08.11.2026)

Geliefert werden **Daten**, keine Seiten. `build_vorkommen.py` schreibt beides:
die Anwendungsdateien (`web/vorkommen-<sprache>.js`, `web/vorkommen/<karte>.js`)
und reines JSON unter `daten/vorkommen/`.

| Angabe | Wert |
|---|---|
| Typ | `vorkommen` (Vorschlag; EN `resource`, FR `ressource` – neu, daher abzustimmen) |
| ID | Knoten-DID des Spiels, achtstelliges Hex, z. B. `1879077402` = „Ader: Kupfer“ |
| Pfad | `/de/vorkommen/1879077402/` (über `build_katalogseiten.py`, nicht selbst gebaut) |
| Quelle | Kategorie 50 („Crafting Resource“) der DAT-abgeleiteten Lore-Marker, `resources.xml` für Beruf/Stufe, `labels/<sprache>/items.xml` für Namen |
| Suchindex | Typbuchstabe **`v`** (frei; belegt sind q, d, t, g, G, r), Name = Sorte, Kontext = „Beruf · Stufe“, Stufe = Handwerksstufe 1–16 |

`daten/vorkommen/vorkommen-<sprache>.json`:

```json
{"k": [["1879077402", "Ader: Kupfer", "PROSPECTOR", 1]],
 "g": [["1879445907", "Südhöhen", 268454004]],
 "m": [["1879445907", [[12, 291], [13, 44]]]]}
```

- `k` Sorten: ID, Name, Beruf, Stufe.
- `g` Gebiete: Gebiets-ID des Spiels, lokalisierter Name, Karten-ID mit den meisten Fundstellen.
- `m` Zählung je Gebiet: Gebiets-ID → `[[Index in k, Fundstellen], …]`. Gezählt werden Stellen, nicht Varianten.

`daten/vorkommen/<karte>.json`: `[[lat, lon, [Index in k, …]], …]` — die Punkte einer Karte,
ortsgenau, sprachneutral. Mehrere Indizes je Punkt heißen: hier kann eines davon stehen.

Fertige Suchzeilen zum Zusammenführen liegen unter `daten/vorkommen/suche-vorkommen-<sprache>.json`,
je 180 Zeilen im Format `[kind, id, name, context, level]`, z. B.
`["v", "1879077402", "Ader: Kupfer", "Schürfer · 1", 1]`.

Zwei Kopierregeln fehlen noch im zentralen `baue_website.py` (bewusst nicht selbst geändert):
`vorkommen-<sprache>.js` und der Ordner `vorkommen/` müssen wie `notizen-*` mit ins Ziel,
und `vorkommen-*.js` gehört in den Stempel-Hash von `stempeln()`.

## SEO foundation (07.11.2026)

`baue_website.py` calls `build_seo.py`: descriptions, Open Graph and Twitter
large-image cards are written into the generated HTML, not injected at runtime.
Three 1200×630 JPEG previews are composed from the existing DE/EN/FR start maps.
Static start pages have reciprocal hreflang links and canonical URLs; legal
pages also have canonicals. Query-driven pages deliberately have no canonical
yet: collapsing item IDs, deeds or language variants onto a German shell would
be wrong. Entity/language-specific HTML is generated separately. Their social
previews currently describe the generic German page; `?lang=` does not select
translated server-side metadata.

The root `sitemap.xml` is an index: `sitemap-seiten.xml` contains 12 existing pages
(no empty item page or search, no fabricated modification dates), and additional
maps live under each language/entity path, e.g. `/de/aufgabe/sitemap.xml`.
`build_sitemaps.py` generates these from the pages actually built, checks limits,
and preserves the stable root sitemap address. `robots.txt` allows crawling and
links that address. Expand these with future entity pages. Search Console already
exists; Bing is deliberately out of scope. A sitemap helps discovery but does
not guarantee indexing; JavaScript and query URLs are not inherently unindexable.

Test: `python3 -m unittest discover -s tests -p 'test_seo.py'`.

**Tracking coverage (08.11.2026):** Google Tag Manager (`GTM-TRC8BF95`) sits in the
`<head>` of every page, including the generated entity pages, which copy the
snippet from `index.html` at build time. GoatCounter is added to the published
pages by `zaehler_einbauen`; `belohnungen.html`, `gegenstand.html` and `suche.html`
were missing from that list and now carry it too. The error page has both
counters on purpose: a 404 without tracking hides exactly the broken links it
should reveal. `test_website.py` checks all three facts.

## Navigation

### Stable entity URLs: full catalogue (07.11.2026)

`build_katalogseiten.py` generates the full static catalogue from the catalogues
shipped by the build. The successful Old Forest pilot has been expanded without
changing its public URLs. The hierarchy comes from the existing game-map tree.
Pages are addressed by **language / entity type / stable ID**, never by their
current navigation position or translated name:

- `/de/aufgabe/700005C0/`, `/en/quest/700005C0/`, `/fr/quete/700005C0/`
- `/de/tat/<id>/`, `/de/gegenstand/<id>/`
- `/de/gebiet/<game-map-id>/`, `/de/region/<game-map-id>/`
- `/de/beruf/WOODWORKER/`, `/de/rezept/7005396E/`, `/de/handwerk/`

IDs retain the catalogue's existing representation (quest/deed/item IDs are
eight-character hexadecimal keys). Renaming or moving an entity must not change
its URL. Professions use their stable profession keys, recipes their recipe IDs;
`handwerk` is the overview, not a substitute entity ID. Recipe detail pages show
ingredients, optional ingredients, critical result/chance and crafting time
where those fields are recorded. Character recipe knowledge is browser-local.

The current output contains 15,118 quests, 5,528 deeds, 6,564 reward items, 7,924
recipes, 10 professions and 226 game-map areas/regions per language. Including
type indexes, crafting/catalogue landing pages and paginated lists, this is
**106,659 HTML pages** across DE/EN/FR. Counts are read from the actual input,
not hard-coded into the generator. Area membership uses existing `fk` paths,
including entries with a recorded position in the area; catalogue counts are
not a claim that every entry is independently playable. Non-geographic entries
are still discoverable through the complete entity indexes. Existing query/hash
URLs and application code are unchanged; unknown references retain legacy URLs.

Detail files are stored flat (`de/aufgabe/700005C0.html`), not in 100,000 separate
directories. The two marked rules in `redirect-mm/.htaccess` resolve the stable
directory-style public URLs, including pagination, to those files. Existing pilot
directories need not be removed. Physical HTML URLs carry the public URL as their
canonical. Entity indexes have 200 entries per page and ordinary previous/next
links. Large area pages show an explicitly labelled excerpt with a map link;
the complete paginated type indexes remain the crawler path to every entity.

**One public address per entity (08.11.2026):** the trailing-slash form is the only
one served. The flat `.html` file and the form without the slash answer with
**301** to it, so search engines never see three addresses for the same record.
Catalogue IDs are uppercase; a link with a lowercase ID goes to `web/kennung.php`
(the host does not load `mod_speling`, and Apache cannot change case). That script
never renders content: it answers **301** to the stored uppercase address, or the
real **404** page with `noindex`, and accepts only whitelisted language/type
segments and valid IDs. It is reachable only through the rewrite rule; a direct
request for `/kennung.php` ends on the error page. Add it to the upload set with
the other catalogue assets.

Content, canonical/hreflang metadata, rewards, requirements, chains, sources and
ordinary navigation links are HTML. Objectives stay in a closed native
`details` block, marked `data-nosnippet`. `web/katalog.js` only enhances the menu
and the optional browser-local progress display using `speicher.js`; it does not
load the full quest catalogue or send character data. A missing completion ID is
labelled “not imported as completed”, not “available”. Reward links are resolved
only by matching a unique name within that quest/deed's recorded item sources.

The landing pages link to the catalogue and the sitemap index points to 27
language/entity sitemaps plus the general pages sitemap. Every build regenerates
these files from its output; no manual URL list is needed for entities. The
existing shared styles/tracking are reused. Each section stays below the sitemap
URL/size limits; a future overflow fails loudly rather than publishing invalid XML.

`web/404.html` is a self-contained DE/EN/FR error page ("Frodo is still looking for
the path") with a decorative SVG traveller, language selection, root-relative
links and `noindex`. With JavaScript off, all three languages stay usable.
`redirect-mm/.htaccess` adds **`ErrorDocument 404 /404.html`**;
deploy this line into the live `.htaccess` without replacing host redirects,
compression or cache settings. It applies to all subdirectories and preserves
the HTTP 404 status. Do not redirect missing entities to the homepage (soft 404).
`upload.py` compares **content hashes**, not modification times: the build writes the whole
catalogue with fresh timestamps, so a time-based check would send all ~110,000 files every
time. One `LIST` per folder supplies the remote sizes; a state entry is `[size, mtime, sha256]`
and is reused without reading the file when size and time match. Typical results measured
with a stub server: first upload 41/41, unchanged run 0/41, one edited file 1/41, and a file
whose timestamp changed but content did not 0/41.

`--verwaiste` lists server files the build no longer contains (report only);
`--verwaiste --loeschen` deletes exactly those, sparing `.htaccess` and the keep list, and
refuses more than 2,000 deletions without `--force`. Nothing is deleted without that call.

`upload.py` still does not automatically deploy `.htaccess`.

Tests: `python3 -m unittest discover -s tests -p 'test_katalogseiten.py'`.

Full output validation (every canonical, heading, entity/app link, closed
objective block and sitemap entry):
`python3 verify_katalogseiten.py /path/to/build`.

Local preview with the same virtual entity paths and real custom 404:
`python3 vorschau.py /path/to/build --port 8806` (HTTP/1.0).

For a catalogue-only deployment while other sessions have unfinished app work:
`deploy_katalogseiten.py --ziel /new/cache/release --prepare` reads live source
data/templates and builds/validates them. `--upload --workers 8` sends flat detail
files using bounded FTPS workers with resumable checkpoints. Only after details
are uploaded does it activate the entity rewrite rules, publish indexes,
sitemaps and the three updated start-page links. It refuses activation if those
live control files changed concurrently. The application, data files and custom
404 are not uploaded. Original control files are backed up in `live-originals/`.

The quest and deed overview starts with **Other content**, followed by landscapes
sorted alphabetically within each region. Region links jump within the overview.
Landscape cards link directly to their sub-areas; the map view repeats these as
larger buttons with progress counts. Selecting a quest leaves the chosen map alone.
The list width can be dragged, adjusted with arrow keys, or reset by double-clicking
the divider; the browser remembers it.

Epic quests use their existing volume/series groups and the catalogue's book
sections, numerically ordered (including Roman book numbers). Later stories with
explicit chapter numbers use those numbers; entries without that evidence stay in
the general group. Festivals, crafting, instances and missions expose the groups
actually present in the catalogue, not inferred categories. Unassigned entries
remain searchable and accessible in one full-width **Other quests** card at the
bottom, without an extra disclosure wrapper. Their original catalogue keys and
links are retained.

Unnamed map records are shown as labelled map variants rather than numeric
“Map 268…” placeholders. Unnamed top-level variants that share a game image with
a named landscape in the same region are grouped into that landscape's card.
Every variant retains its own map ID and coordinate frame; sharing an image does
not mean the projections can be interchanged. Existing direct map links still
open the original variant.

See [the missing-map audit](docs/missing-map-audit.md): an unassigned card is not
necessarily a missing image. No speculative map assignments were added.

### Map markers (07.11.2026)

Dots are a place, not a quest: several quests at the same spot become **one marker
with a count** (up to 55 in the Shire), and markers that would still overlap are
nudged a few pixels apart so each stays clickable. Clicking a stack opens a short
list of those quests. Hovering a row highlights its dot and the other way round;
selecting anywhere scrolls the list to the row. The **legend names every shape**
(filled = giver, open = first objective, numbered ring = objective of the selected
quest, dashed = hunting spot, dotted = place of related quests), with Lucide icons,
and is visible whenever the map has dots — not only with an imported character.

### Positions we do not have (measured 07.11.2026, German catalogue)

- **Quests 12.445 of 15.118** carry at least one map point. Of the 2.673 without:
  **1.627** have target coordinates that fit **no game map** — those rows sit in
  another coordinate space (17 % of all 202.569 position rows have a positive
  longitude; the game's own geo file shows the same share). The target NPCs of
  those quests are in the same space, so borrowing their place does not help.
  **1.031** have no position row at all (214 instances, 258 "other", festivals,
  and objectives that name no place, such as "kill ten of them").
- **Deeds 1.232 of 5.528** show a point: 644 from their own target table, 222 from
  enemy placements (`h`), and **367 from the quests they ask for (`hz`)**. The rest
  are mostly counters (class, reputation, race) that have no single place on a map.
- **Interior maps were tried and dropped (07.11.2026).** `maps.xml` has 1.324 maps
  beyond the 232 parchment maps (inns, jails, caves, dungeons) with their own frames.
  306 of the 1.642 position-less quests fit exactly one of them, the rest overlap.
  But all 271 that the build actually placed were **nameless internal records**
  (name = id): the clear cases are precisely the ones no player sees. The catalogue
  therefore stayed without them; `GameMaps.interior` and `hole_karten.py` know the
  maps, in case a later attempt finds a use.

`hz` is written by `build_catalog_from_export.py` for deeds whose objectives only
say "complete quest X": the deed borrows the quest's first target and the page labels
it **Orte der zugehörigen Aufgaben**. The plugin ignores the field. No position is
invented for the remainder.

This repository contains **only the code**, not generated map images, quest texts
or personal progress. Game data and images are generated locally for the website
build; the deployed website serves those generated catalogue assets. Personal
progress is different: it stays in the visitor's browser and is never included
in the deployed build.

## What the code does

```
hole_karten.py      map images from the client (German/English/French)
baue_geografie.py   daten/geografie.json: which groups are real places?
baue_startbild.py   web/bild/start*.jpg for the start pages
build_daten.py      web/daten-<language>.js (quests) and, with --art taten,
                    web/daten-taten-<language>.js (deeds)
build_referenz.py   web/referenz.js: faction, tier and profession names (DE/EN/FR)
build_vorkommen.py  web/vorkommen-<lang>.js and web/vorkommen/: crafting-resource spots
baue_webp.py        webp/<language>/*.webp from the PNGs
baue_website.py     dist-web/: the published version
upload.py           upload dist-web/ via FTPS
dat/MapExport.java  reads maps from the DAT archives
web/                the site (opens without a server)
  companion.js      LOTRO Companion files -> progress and plugin files (in the browser)
  speicher.js       characters and their progress, kept in the browser
  menue.js          menu bar with the character switch
  spielstand.html   the Progress page
  ruf.html          reputation per faction
  handwerk.html     crafting per profession and tier
  index.html        the map; ?art=taten shows deeds instead of quests
tests/              converter tests (unit, and against a real Companion folder)
```

## Building

Requirements: Python 3, Pillow, `lupa` (for the Lua catalogue), Java for the
map export, an installed LOTRO client and the plugin
[MagicQuestLog](https://github.com/Sirhexalot/lotro-magic-quest-log).

```sh
python3 hole_karten.py                                  # images, ~300 MB per language
python3 hole_karten.py --sprache en --ziel Karten_en
python3 hole_karten.py --sprache fr --ziel Karten_fr
python3 baue_geografie.py
python3 baue_startbild.py --sprache de
python3 baue_startbild.py --sprache en
python3 baue_startbild.py --sprache fr
python3 build_daten.py --sprache de                     # needs lupa
python3 build_daten.py --sprache en
python3 build_daten.py --sprache fr
python3 build_daten.py --sprache de --art taten         # deeds, likewise en/fr
python3 build_referenz.py                               # reputation/crafting names
python3 baue_webp.py --sprache de
python3 baue_webp.py --sprache en
python3 baue_webp.py --sprache fr
python3 baue_website.py
```

Then open `dist-web/` in the browser or upload it. `baue_website.py` tags every
static script and stylesheet with a hash, so a browser never mixes an old file
with a new page after an upload.

## Tests

```sh
node tests/test_companion.js                                   # converter, no game data
node tests/test_import_guide.js                                # guide completion, translations and map navigation
python3 -m unittest discover -s tests -p 'test_website.py'      # landing-page counts and analytics injection
../MagicQuestLog/.venv/bin/python tests/test_companion_real.py # real Companion folder -> plugin
```

The second test reads a real LOTRO Companion `characters` folder (by default the
one inside the Mac's LOTRO Wine prefix, or the path given as argument), converts
it with `web/companion.js` in Node, and hands every written file to the plugin's
own `Characters.lua` in Lua 5.1. Without a Companion folder it is skipped.

## Language

German, English and French. The site loads only the selected language
(`daten-de.js`/`daten-en.js`, images from `karten/de`/`karten/en`). Order of
choice: `?lang=`, then `localStorage`, then `navigator.language`, otherwise
English. Interface texts live in `web/texte.js`; the landing pages have their own
DE/EN/FR copy. `baue_website.py` replaces their catalogue counts from the exact JS
catalogues being published, so the text cannot silently keep older totals.

## Reputation, crafting and deed counters

Companion's `reputation.xml`, `crafting.xml` and the nested objective states of
unfinished quests and deeds are read as well, in the browser like the rest.

- **Names** of factions, reputation tiers, professions and their tier titles come
  from **our own DAT export** (`build_referenz.py`, source: the source exporter with
  the faction and profession records). Where the game varies a word by gender
  ("Geselle"/"Gesellin") both forms are shown. No English fallback was needed.
- **Reputation** shows the tier reached and the points earned. The game's point
  thresholds per tier are not in the decodable data, so the bar measures tiers,
  not points to the next one. For about half the factions Companion records only
  the tiers reached; their points are shown as unknown ("–"), never as 0.
- **Crafting** shows every tier with proficiency and mastery; experience against
  the tier's cap from the DAT; "next" is the first tier not finished.
- **Deed counters**: Companion numbers each counter by objective and condition, and
  the catalogue numbers its goals the same way (`k`). A counter is shown only where
  both match ("44/75"); otherwise the entry reads "3 of 6 sub-goals". Checked on a
  real character: 301 counters matched, none above its goal's total.

## Quest givers, requirements and reputation sources

- **Quest giver**: the first NPC that bestows a quest (catalogue field `g`), named in
  the detail view and beside names that repeat in a list.
- **Requirements** (`v` all completed, `vo` one of them, `vl` minimum level, `vb`
  something we cannot check such as class or faction). The **available** filter
  shows open quests whose requirements the active character meets; the detail view
  lists each requirement with its state.
- **Reputation sources** (`rf`: faction and the game's reward tier 1–6; points per
  tier are not in the data). On the Reputation page a click on a faction lists the
  open quests and deeds that give reputation there (`ruf-quellen-<language>.js`,
  written by `build_referenz.py`), each linking to the map (`index.html?id=…`).
- The server compresses and caches the files (`redirect-mm/.htaccess`).

## Progress

The **Progress** page (`spielstand.html`) takes the visitor's progress from
**LOTRO Companion**: the visitor picks Companion's `characters` folder, and
`web/companion.js` reads `summary.xml`, `questsStatus.xml` and `deedsStatus.xml`
of every character **in the browser** — nothing is uploaded, and the server never
sees a file. Kept per character in `localStorage` (`mql.charaktere`): name,
server, account folder, class, race, level, date and the finished ids. The
subscription id and everything else in Companion's files is not read.

The DE/EN/FR guide separates the three website steps from optional plugin export
and backup. With characters loaded, it shows a completion message and a map button
that keeps the selected language. The website does not require Magic Quest Log.

The plugin has its own page (`plugin.html`, DE/EN/FR): download, installation and
handing the progress over. The import page only points there, and the backup stays
with the browser data.

`companion.html` (DE/EN/FR) is the long form of step 1: how LOTRO Companion reads a
character out of the running game, on Windows and on a Mac, where the files land and
what to do when nothing happens. The import page links to it.

## Header

Two rows with two jobs: the top row is identity (name, search, character switch and
the way to import), the bottom row is the catalogue, with **Plugin fürs Spiel** at its
quiet right end. The character is a state, not a page. Search stays a tool: the map
page has the field with results, every other page links to the search page. On phones
the burger holds everything except the search.

Beside the character switch a small clock shows how old the imported progress is:
green up to three days, yellow up to two weeks, red beyond that, grey when no
date is stored. The tooltip names the date and the age; the clock links to the
import page. It is drawn by `web/menue.js` wherever the header is built.

The header never depends on the page **state**, only on the page **family**: `.kopf`
carries background and line over the full width, `.kopf-innen` holds the content in one
fixed column (`--spalte` on the body: 1000 start, 960 text pages, 1600 map — in the
landscape overview and in the map view alike). `web/menue.js` creates that wrapper where
a page has none, so every page has the same structure. Deriving the offset from the state
made the whole row jump when a landscape was opened; percentages tied it to the scrollbar.
`scrollbar-gutter: stable` keeps the column still when a page grows, and search field
(360 px) and character select (min 180 px) have fixed widths so a loaded character does
not reflow the row.

From there:

- the **menu** on every page switches the character the map shows;
- **Write into the LOTRO folder** (File System Access API: Chrome, Edge) or
  **Download as zip** produces the files the plugin reads:
  `PluginData/<account>/<server>/AllCharacters/MagicQuestLog_Import_<name>.plugindata`
  plus the name list `MagicQuestLog_Characters.plugindata`;
- **Backup** downloads everything as JSON and loads it back.

Conversion rules (same as the plugin's): Companion's decimal keys become the
eight-digit hex ids; finished means `state="COMPLETED"` or `completionCount ≥ 1`;
only top-level entries count. The counters then leave out session plays and
quests ruled out by a finished alternative (`x`, `e` in the catalogue).

A local build may still carry a built-in `fortschritt.js` from the plugin's old
`Progress.lua`; it is shown only while no character is chosen. The published site
ships it empty.

## Sources, statistics and rights

Map images and game text are read from the local LOTRO installation. Map bounds
and parent/child relationships come from LOTRO Companion's game-map definitions,
not MoorMap's geometry. Garan's hand-drawn detail images are not used. MoorMap
remains an optional map-opening integration in the plugin.

Permission to use Companion's libraries is not a licence from the game's rights
holders to redistribute game assets. Neither a source credit nor this project's
fan-project notice supplies that permission.

Companion imports and character data are processed and kept in the browser, not
uploaded to the website or analytics service. This does **not** mean the website
makes no external requests: the published build injects GoatCounter's
`https://gc.zgo.at/count.js`, with the endpoint
`https://sirhexalot.goatcounter.com/count`, for cookie-free visitor statistics.
Local source pages do not inject it. See `web/datenschutz.html` and
[GoatCounter's privacy documentation](https://www.goatcounter.com/help/privacy)
for the distinction between aggregate statistics and technical processing of IP
addresses. No assertion of automatic legal compliance follows from using no cookies.

Browser preferences include `mql.sprache`, `mql.charaktere`, `mql.system`,
`llb.preview.letztesGebiet` and `llb.preview.listenbreite`. The last two names are
retained for compatibility, including on the published site.

Fan project, not affiliated with Standing Stone Games, Daybreak Game Company or
Middle-earth Enterprises. Maps and game texts belong to their respective rights
holders. No advertising, registration or donation feature. Character records are
local to the browser; visitor statistics are separate.
