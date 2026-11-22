# 3. Context and scope

### Participants and neighbouring systems

| Participant / system | Relationship to the LOTRO Log Book | Evidenced scope |
|---|---|---|
| Website visitor | Requests application, list and detail pages | Language paths and page resolution in `php/src/Router.php` |
| Browser | Runs map, search and filter surfaces; holds language selection, filter memory and character data locally | `web/*.js`, among others `speicher.js`, `filtergedaechtnis.js`, `companion.js` |
| LOTRO Companion | Supplies files that the browser import processes | `web/companion.js`, `web/spielstand.js` |
| Game/DAT data | Is exported outside the HTTP request and processed into website data | Generators such as `build_daten.py`, `build_items.py`, `tools/build_php_data.py` |
| MagicQuestLog | Shared generator for deed data; external repository | Invocation in `tools/build_taten_daten.py` |
| Web server / PHP | Routes public pages to the front controller; serves static files | `deploy/index.php`, `php/public/index.php`; rewrite rules are not part of the release folder |
| FTPS target server | Receives built release files | `upload.py` |

### Function and URL space

`Catalogue::APP` maps app keys per language to the public paths. The current app space includes the home page, map and deed mode, quest finder, item search, crafting/recipes, travel, reputation, rewards, character progress import, Companion help, plugin help, global search as well as set, quest giver, vendor, landmark, title, faction, instance and adventure browsers. The app addresses are language-prefixed; quest/deed mode share one map template.

The entity space has separate segments for quests, deeds, items, areas, regions, recipes, professions, titles, virtues, sets, quest givers, vendors, factions and landmarks. The exact German, English and French segments are held exclusively in `php/src/Catalogue.php`; as examples `/de/aufgabe/<ID>/`, `/en/quest/<ID>/`, `/fr/quete/<ID>/`. Application pages, entity pages and data-driven lists are separate route classes in the router. A profession address redirects into the crafting application; that is not a profession detail page.

### Data flow boundary for character progress

Import and character switching are processed in the browser and stored with `localStorage`. The statistics endpoint `/api/statistik` is a separate path: it processes heartbeat and import counter events and stores aggregated counters in a file. The call sites that were inspected do not send character progress to this endpoint.

Evidence: `web/companion.js`, `web/speicher.js`, `web/statistik.js`, `php/public/index.php`, `php/src/Statistics.php`.

### External interfaces

| Interface | Purpose and evidenced format | Not determined by this checkout |
|---|---|---|
| HTTP to browsers | Language paths, HTML, JSON/JavaScript assets, canonical URLs and status codes | TLS endpoint, CDN/proxy, concrete server limits |
| Companion files | Browser processes selected XML/export files locally | Completeness across all Companion versions |
| DAT/game exports | Generators read XML, Lua, JSON and generated intermediate formats | Availability/versioning of external installations |
| MagicQuestLog | Local process invocation for the shared deed generator | Complete compatibility contract of the repositories |
| FTPS | `upload.py` transfers release files and manifest | Provider, server configuration and credentials |
| `/api/statistik` | JSON actions `heartbeat`, `import`, `current`; aggregated file state | External tracking configuration and legal assessment |

These are interfaces derived from the implementing sites, not versioned API contracts.
