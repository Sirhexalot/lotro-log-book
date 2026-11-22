# Quest navigation for LOTRO Log Book

**Plan status as of:** 16 November 2026
**Status:** implemented and published; residual acceptance of individual edge cases open.

This document bundles the complete plan for quests in the LOTRO Log Book,
the previous UI renderings, the discarded intermediate states and the
binding decisions. It describes the website exclusively. The
separate quest view in the plugin **Magic Quest Log 0.5.4** is already
implemented and is mentioned here only as a reference.

## Goal

The website should offer two clear paths: areas lead via their
complete tiles and sub-area links into the map view; topics lead
with the matching preselection into the separate quest finder.

- The area overview stays complete; the finder is reachable via a
  prominent button and is not a main menu item.
- Epic quests keep their order by volume, book and chapter.
- A quest leads from the catalogue page traceably to area, map,
  quest giver, target and, if applicable, travel planner.
- Verified data is made visible; missing data is not guessed.
- The interface works without character progress, with imported character progress,
  without JavaScript as basic content and in DE, EN and FR.
- The navigation stays commonly comprehensible for quests and deeds, without
  needlessly rebuilding deed navigation or `/de/abenteuer/`.

## Binding final decision (16.11.2026)

The following rules replace the earlier target pictures of a shared
quest tree and a quest browser embedded in it. These older
drafts are retained further below as history but are **no
implementation specification**.

### 1. Quest page: areas remain the main content

- The existing landscape/area overview stays completely intact:
  **no area tile and no sub-area link may be dropped in the rebuild**.
- The existing groupings and jump markers by region stay. An
  area or sub-area selection leads into the matching map view.
- Existing order, map images, area information and links are
  not replaced by placeholders, shortened example grids or a new
  tree view.
- A prominent button **„Alle Aufgaben im Finder“** stands to the right of the
  quest page heading in the same line and leads to the separate
  finder application. The finder becomes **no navigation item** in the main menu.
- The finder is not embedded in the map overview. The quest page
  remains the entry via areas and topics; the finder is the search across
  the complete quest stock.

### 2. Topic entries

In addition to the areas, the page offers topic entries. A topic entry
opens the finder with the respective topic preselected. The topics follow
the verified groups of the plugin quest tree; do not guess categories from
quest names.

Binding page structure for mockup and implementation:

```text
Aufgabenseite
├─ Überschrift mit rechtsbündigem Button „Alle Aufgaben im Finder“
├─ Regionssprungmarken
├─ alle vorhandenen Gebietskacheln und Untergebietslinks
├─ eigener Bereich „Alte Geschichten“ mit den drei belegten Karten
└─ Themen-Einstiege
   ├─ Epische Geschichte → Kartenansicht
   └─ alle übrigen Themen → separater Finder mit Themenvorauswahl

Aufgabenfinder (eigene Seite, kein Hauptmenüpunkt)
├─ Suche und Trefferzahl
├─ Filterspalte: Thema / Klasse / Herkunft / Region und Gebiet /
│                 Merkmale / Stufe / Fortschritt
└─ Trefferliste mit Statusfarbe + Symbol/Text und Karten-/Gebietslink
```

The diagram fixes the content areas, not a pixel position.
The existing area groups, tiles and sub-area links are authoritative;
no area may replace them with a reduced example presentation.

- **Epische Geschichte** opens the map view with the epic
  quest structure. Volumes/series, books and chapters remain in their
  narrative/numeric correct order.
- **Klassenaufgaben** opens the finder with the topic „Klassenaufgaben“
  preselected.
- **Herkunftsaufgaben** opens the finder with the topic „Herkunftsaufgaben“
  preselected.
- **Feste und Ereignisse**, **Missionen**, **Instanzen und Schlachten**,
  **Handwerk**, **Aufgabenbrett** and **Weitere Aufgaben** each open the
  finder with the matching topic preselected.
- Class and origin topics remain as entries, although the
  finder additionally has separate filters for individual classes and origins.
- **Aufgabenbrett is exclusively a topic.** There must be no separate
  quest board filter group and no duplicate quest board selection.
- A heading such as „Weitere Inhalte“ may visually group topics on the quest page.
  It is not a selectable topic, no additional
  navigation node and no artificial filter shell.

### 3. Separate quest finder

The finder is a separate application page with search field, filter column and
hit list. Filter groups are:

1. **Thema** – including quest board and class/origin topics
2. **Klasse** – separate filter group for individual classes
3. **Herkunft** – separate filter group for individual origins/races
4. **Region und Gebiet**
5. **Merkmale** – verified quest features, but no quest board
6. **Stufe**
7. **Fortschritt**

The visible order of the filter groups begins with **Fortschritt → Stufe
→ Region und Gebiet → Thema**. After that follow class, origin and features.
Topic, class and origin are separate, combinable filter groups.
Selection options and labels must come from verified source data;
do not infer a class, origin or assignment from a quest name.
A topic entry presets only its topic filter, not automatically
class or origin.
With **Region und Gebiet**, a narrower area selection replaces the already
chosen parent region. A broad region must not
expand an area selection back to the whole region via an OR link.

The progress filter stands **in the filter column**, not as a bar above
search or hit list. It offers „Alle“, „Offen“ and „Erledigt“; „Annehmbar“
exists only when character progress is imported. For feasibility the same rules apply
as in `app.js`: running quests count as open,
prerequisites `v`/`vo`, level limit and lock `vb` are taken into account;
completed exclusion alternatives lock the feasibility.

Every hit makes its progress directly recognisable. Used are the
**existing status colours** from `web/style.css` and the map legend:
done `--fertig` (green), open `--offen` (orange), running `--laufend`
(blue). Colour is never the only signal; icon and status text additionally name the
state. A running quest stays marked as „läuft“;
sub-objectives must not appear as their own overall status „erledigt“. Without
imported character progress the status stays neutral. A missing import must be shown neither
as „offen“ nor as „nicht erledigt“.

Search term and filter state must be traceable via URL and reset.
Hits open the verified map/area context via their stable quest ID. Without a verified map location a quest remains findable in the finder,
but receives no invented map or position.

### 4. Alte Geschichten

„Alte Geschichten“ remains a separate area next to the normal regions and
topics. There are map data, map images and map frames for it; the area
therefore leads **into the map view**, not into the finder.

Verified maps and quest references from `web/karten-kurz-de.js`:

| Map | Map ID | Quests with map reference |
| --- | ---: | ---: |
| Belagertes Mordor | `268453374` | 81 |
| Azanulbizar, 2799 D.Z. | `268453555` | 101 |
| Nud-melek, 1981 D.Z. | `268453582` | 0 |

The 182 quests with a map reference are the sum of the first two maps;
Nud-melek remains visible as a verified map despite zero assigned quests.
These counters are a checked data snapshot of 16.11.2026, not permanently
fixed values. On implementation they are to be determined from the current source data,
not entered as constants.

### 5. Mockup and implementation limits

- A mockup must show the real area overview completely or clearly
  make clear that it is only an excerpt. „Weitere Gebiete folgen“,
  empty region headings and example tiles are no complete
  mockup.
- Before code changes the complete mockup is checked against this structure:
  region navigation, all area tiles/sub-area links, Alte
  Geschichten with maps, topic entries, button and separate finder page.
- The mockup must show the quest page **and** the separate finder target page.
- In the finder mockup progress lies in the filter column; a progress bar
  above the search/hit list is wrong.
- The hit list shows status colours according to the map legend; if
  character progress is missing the status stays neutral.
- Class and origin stand as separate filter groups next to topic.
- Aufgabenbrett appears under topic and nowhere as its own filter group.
- Layout details not expressly decided remain proposals
  and must not change the rules above.

## Rendering 1: original draft – toggle

**Status: discarded.**

The first draft separated two structures:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Aufgaben                                      [Nach Landschaft ▾]    │
├──────────────────────────────────────────────────────────────────────┤
│ Suche …                 [Alle] [Offen] [Erledigt] [Machbar]          │
├──────────────────────┬──────────────────────────┬───────────────────┤
│ Landschaft / Thema   │ Karte                    │ Details           │
│                      │                          │                   │
│ Eriador              │      4:3-Spielkarte      │ Beschreibung       │
│ Rhovanion            │      Auftraggeber         │ Ziele eingeklappt  │
│ Epische Geschichte   │      Ziele / Marker       │ Belohnungen        │
│ Klassenaufgaben      │                          │                   │
└──────────────────────┴──────────────────────────┴───────────────────┘
```

Why discarded:

- A toggle each time hides the other sensible orientation.
- Filter and selection state had to be synchronised for two structures.
- Users expect both the landscape and the topic in the same
  quest overview.

## Rendering 2: intermediate state – four topic entries

**Status: discarded or retained only as a historical sketch.**

The experiment worktree contained an intermediate state with entry tiles
above the landscape tree:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Aufgaben                                                            │
│ Finde Aufgaben nach Ort oder Inhalt.                                │
├───────────────────────┬───────────────────────┬──────────────────────┤
│ Epische Geschichte    │ Klassenaufgaben       │ Herkunftsaufgaben    │
│ Bände, Bücher …       │ Aufgaben deiner Klasse│ Aufgaben deiner Rasse│
├───────────────────────┼───────────────────────┼──────────────────────┤
│ Feste und Ereignisse  │                                           │
│ Zeitlich begrenzte …  │                                           │
└───────────────────────┴────────────────────────────────────────────┘
│ Landschaften nach Region                                             │
│ [Eriador] [Rhovanion] [Rohan] …                                     │
```

The tiles were useful as a quick entry. The reasoning at the time,
to therefore take topics into the same tree as the areas, was discarded on
16.11.2026. The decided version uses separate topic entries
and a separate finder; see the binding final decision above.

## Rendering 3: earlier target picture – shared quest tree

**Status: superseded on 16.11.2026; do not implement.** The sketch shows a
shared topic/area tree and a quest browser embedded in it.
Both contradict the now binding separate finder page. Authoritative
is exclusively the binding final decision above.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ LOTRO Log Book   Suche …                              Charakter ▾  Sprache │
├────────────────────────────────────────────────────────────────────────────┤
│ Startseite › Aufgaben                                                      │
├────────────────────────────────────────────────────────────────────────────┤
│ Aufgaben                                                                    │
│ Landschaften und Themen                                                     │
│                                                                            │
│ [Eriador]          [Rhovanion]        [Rohan]          [Gondor]             │
│ [Mordor]           [Haradwaith]       [Rhûn]           [Alte Geschichten]   │
│                                                                            │
│ [Epische Geschichte] [Klassenaufgaben] [Herkunftsaufgaben]                 │
│ [Feste und Ereignisse] [Missionen] [Instanzen und Schlachten]              │
│ [Handwerk]                                  [Weitere Aufgaben]             │
│                                                                            │
│ Bereiche sind gleichrangig; jede Kachel nennt Treffer-/Fortschrittszahlen. │
├────────────────────────────────────────────────────────────────────────────┤
│ Suche in Aufgaben …       [Alle] [Offen] [Erledigt] [Machbar]              │
│                                                                            │
│ Eriador                                                                    │
│ ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────────────┐ │
│ │ Auenland           │ │ Breeland           │ │ Ered Luin               │ │
│ │ 128 Aufgaben       │ │ 214 Aufgaben       │ │ 96 Aufgaben              │ │
│ │ Fortschritt …      │ │ Fortschritt …      │ │ Fortschritt …            │ │
│ └────────────────────┘ └────────────────────┘ └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

The following former rules are likewise superseded and must not be used as a
current specification:

- Regions and landscapes follow the verified game map hierarchy.
- Landscapes are shown within a region in the agreed order;
  technical or nameless maps are not output as a landscape.
- Topic nodes lead directly into their existing groups.
- Epische Geschichte shows volume → book → chapter → quests.
- Quests without a secure landscape assignment remain findable in „Weitere Aufgaben“;
  no map positions are invented.
- The tile view may become multi-column on desktop and single-column on mobile.
  Search and progress filter remain visible or
  reachable.

## Rendering 4: earlier target picture – quest browser in the map view

**Status: superseded on 16.11.2026; do not use as layout specification.** The
sketch mixes area tree, map view and quest list in one browser.
The now decided finder is its own application with filter column and
hit list; area/topic entries remain on the separate quest page.

```text
Desktop
┌──────────────────────┬─────────────────────────────────────────────────────┐
│ Aufgabenbrowser      │ Aufgaben in Eriador › Auenland                      │
│                      │                                                     │
│ Suche …              │ 214 Aufgaben · Stufe 1–15                          │
│ [Alle]               │ [Erledigte ausblenden] [Sortierung ▾]               │
│ [Offen]              │                                                     │
│ [Erledigt]           │ ┌─────────────────────────────────────────────────┐ │
│ [Machbar]            │ │ Eine unerwartete Party       Stufe 5 · Michelbinge│ │
│                      │ │ Auftraggeber: … · 3 Ziele · Belohnungen …       │ │
│ Eriador              │ └─────────────────────────────────────────────────┘ │
│  ├ Auenland          │ ┌─────────────────────────────────────────────────┐ │
│  ├ Breeland          │ │ Ein alter Freund             Stufe 7 · Hobbingen │ │
│  └ Ered Luin         │ │ …                                                │ │
│                      │ └─────────────────────────────────────────────────┘ │
└──────────────────────┴─────────────────────────────────────────────────────┘

Mobil
┌──────────────────────────────┐
│ ‹ Alle Aufgaben              │
│ Aufgaben in Auenland         │
│ [Suche …]                    │
│ [Filter · 4]                 │
│ 214 Aufgaben                 │
│ ┌──────────────────────────┐ │
│ │ Eine unerwartete Party   │ │
│ │ Stufe 5 · Michelbinge   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Ein alter Freund         │ │
│ └──────────────────────────┘ │
│ [Liste] [Karte] [Details]   │
└──────────────────────────────┘
```

These former operating rules remain valid only where they do not contradict the
binding final decision:

- Search, filter and sorting stand in the address or in the
  local filter memory, provided the page is an application list.
- Filters count from the hits; chosen values remain visible.
- Level, area, kind, quest giver and progress come from the same
  quest and must not be combined from separate records.
- Lists reload on scrolling; no separate „Mehr“ button.
- Keyboard focus, arrow keys, Enter, Escape and sufficient touch targets
  are tested.

## Rendering 5: map and details

**Status: target picture; existing map rules continue to apply.**

```text
┌────────────── Aufgabenliste ─────────────┬──────────── Karte ───────────┬──── Details ────┐
│ ‹ Alle Landschaften                       │ Legende: ● Geber ○ Ziel     │ Eine Aufgabe    │
│ Auenland                                  │ [Filter] [Vorkommen]         │                 │
│  ✓ Eine unerwartete Party                 │ [Questgeber anzeigen]       │ Beschreibung    │
│    Ein alter Freund                       │                              │ Auftraggeber   │
│                                           │         4:3-Karte            │ Voraussetzungen│
│                                           │       ●       ○              │ Belohnungen    │
│                                           │                              │ [Ziele einblenden]│
└───────────────────────────────────────────┴──────────────────────────────┴─────────────────┘
```

Rules:

- Desktop: list, map and details in three columns; the list column is
  draggable and stores its width locally.
- The map stays undistorted in 4:3 ratio. No zoom, pan or
  reset button.
- On selection the map follows the quest giver to the smallest verified
  matching map; shown objectives look for a shared verified map.
- Identical locations are bundled as a collection marker with count. Hover and selection
  connect marker and list row.
- Quest givers, objectives, hunting grounds and locations of associated quests remain distinguishable in the
  legend.
- Description and rewards are visible by default. Steps and objectives
  lie per entry behind „Ziele einblenden“.
- Without a secure position there is no invented pin; the entry remains
  searchable and receives at most an area context.
- The map bar has two fixed rows: legend on top, actions and
  map information below. Resource occurrences are one legend entry with
  colour gradient, not a separate entry per profession.

## Data and link model

### Sources and generators

- Quests: `build_daten.py` including QuestDetails in DE/EN/FR.
- Shared landscape navigation: `tools/build_gebiete.py`.
- Map tree, borders and parent relations: game definitions via
  `MagicQuestLog/tools/game_maps.py`; no MoorMap geometry.
- Quest positions: verified quest giver/target positions and map frames.
- Quest detail pages: `build_aufgaben.py`,
  `php/templates/entity/quest.twig` and the associated viewmodels.
- Epic: `tools/build_questmerkmale.py`, then `build_daten.py`.

### Public addresses

The identity of a quest is language, entity and stable ID:

```text
/de/aufgabe/700005C0/
/en/quest/700005C0/
/fr/quete/700005C0/
```

Names and navigation hierarchy are no identity. Internal links use
only canonical addresses; old `.html` and flat addresses remain at most as
301 redirects.

### Quest detail page

The detail page orders the verified information into:

1. title and fact chips
2. description
3. location: map section, coordinates and map link, if verifiable
4. Woher: quest giver, area, prerequisites and chains
5. Wofür: fixed and selectable rewards, titles, virtues and other verified
   reward types
6. Zusammenhang: follow-up quests, exclusions, same quest giver and
   related entries
7. objectives and steps in closed `<details data-nosnippet>`

Quantities, routes, game rights, rewards or positions are not established
by estimation.

## Progress and privacy

- Character progress is optional and stays local in the browser.
- Companion files are processed exclusively in the browser.
- „Nicht importiert“ does not mean „nie gespielt“ and not „sicher
  verfügbar“.
- Session plays, monster play entries and quests excluded by completed alternatives
  are not falsely counted as open feasible quests.
- The published `fortschritt.js` stays empty.
- The quest plan must contain no account, server or character data.

## Keep website and plugin separate

### Website

Affected website files and tools:

- `web/app.js`
- `web/landschaft.css`
- `php/templates/app/aufgabenfinder.twig`
- `web/aufgabenfinder.css`
- `web/aufgabenfinder.js`
- `web/karten-aufgabenfilter.js`
- `build_aufgaben.py`
- `tools/build_gebiete.py`
- PHP routing/viewmodel for the finder routes in DE/EN/FR
- matching quest/finder tests and browser checks

The experiment worktree
`/Users/adrian/Developer/Lotro/lotro-log-book-aufgaben-navigation` is
reference and working state, but not automatically published code. Before
adoption the changes must be checked, cleaned and tested in the local website repository.

### Plugin

The plugin is a separate project under
`/Users/adrian/Developer/Lotro/MagicQuestLog`. The shared quest view
is implemented there in 0.5.4:

- Landscapes and topics are equally ranked main nodes.
- The structure toggle was removed.
- Quest and deed IDs as well as imported progress are retained.

Plugin builds, ZIPs, PluginData and game installation do not belong in this
website repository.

## Implementation phases

### Phase 1 – stock and data contract

- [ ] Inventory the existing area overview and ensure that every
      area tile and every sub-area link is retained in the target.
- [ ] Fix finder routes, topic keys as well as class/origin keys in
      DE/EN/FR and link them with stable source data.
- [ ] Check the actual data source and counting method for topic/finder hits;
      do not adopt mockup counters as production data.
- [ ] Derive map images, parent relations and quest references for „Alte Geschichten“
      from the current map data.
- [ ] Create no technical map names, classes, origins or topics from
      unverified name heuristics.

### Phase 2 – quest page and entries

- [ ] Retain existing area/sub-area tiles and region jump markers completely;
      selection leads to the matching map view.
- [ ] Add a prominent finder button on the quest page; add no
      finder navigation item in the main menu.
- [ ] Add topic entries and map their targets exactly: Epische
      Geschichte → map view; remaining topics → finder with preselection.
- [ ] Present „Alte Geschichten“ as its own map area; derive maps and
      hit counts from the data.
- [ ] Do not output placeholder regions or shortened example grids as a complete
      area overview.

### Phase 3 – separate quest finder

- [ ] Implement a separate finder application page with search field, filter column and
      hit list in DE/EN/FR.
- [ ] Implement filter groups topic, class, origin, region/area, features, level and
      progress separately; quest board only under topic.
- [ ] Preselect topic entries via URL/application state; reset
      resets all groups and the search term traceably.
- [ ] Show the progress filter exclusively in the filter column.
- [ ] Mark hit status with `--offen`, `--fertig`, `--laufend` and the existing
      partial progress display from the map legend; explain status
      additionally with icon or text.
- [ ] Without imported character progress leave the status neutral; offer „annehmbar“ only with
      imported character progress.
- [ ] Hits open the verified map context via stable quest ID;
      without a map reference invent no location or pin.
- [ ] Keep the existing quest detail page and its verified links reachable
      unchanged.

### Phase 4 – map and responsive presentation

- [ ] Check the map view for area and topic targets; retain existing rules on
      map frames, markers and 4:3 presentation.
- [ ] Check the finder layout separately for desktop and mobile; on mobile hits
      and filters must be operable without horizontal overflow.
- [ ] Check keyboard operation, focus guidance, touch targets and filter states.

### Phase 5 – quality assurance

- [x] Run Python tests and catalogue check.
- [ ] Run browser check in DE/EN/FR on desktop and mobile.
- [ ] With synthetic character progress check completed, running (also with sub-objectives),
      open and acceptable quests.
- [ ] Check without character progress: no status is falsely marked as open or
      done; „annehmbar“ is not offered.
- [ ] Check every topic entry: exactly the matching topic is preselected;
      class/origin remain separate filter groups.
- [ ] Check quest board: present as topic, not present as its own filter group.
- [ ] Reconcile all areas and sub-areas against the previous stock.
- [ ] Check „Alte Geschichten“ against map data, including Nud-melek
      without quest reference.
- [ ] Check basic content readable without JavaScript and real 404/301.
- [x] Create the build outside iCloud and run `verify_katalogseiten.py`.
- [x] Publish only after local acceptance; live acceptance on 16.11.2026.

## Acceptance criteria

The work is only done when:

- the area overview has lost no area tile and no
  sub-area link compared with the stock;
- no finder main menu item exists and the prominent button opens the separate
  finder;
- every topic has its agreed target and a correct preselection;
- Epische Geschichte and Alte Geschichten open the map view;
- class and origin are independent filter groups and Aufgabenbrett appears only
  as a topic;
- progress stands in the finder filter column and hits use the legend colours
  together with a comprehensible status signal;
- the status without import is neutral and „annehmbar“ requires an import;
- landscapes/topics/filters in DE/EN/FR use the same verified structure and stable
  keys;
- no unverified position, map, class, origin or category appears as a fact;
- finder, map view, keyboard operation, mobile view and no-JavaScript
  basic content work;
- existing character progress is neither overwritten nor published;
- tests, build check and browser check are documented as passed.

## Check commands

```bash
# Website-Repository
python3 -m unittest discover -s tests -p 'test_*.py'
node tests/test_i18n.js
node tests/test_questfinder.js
python3 baue_website.py --ziel "$HOME/.cache/llb-dist"
python3 verify_katalogseiten.py "$HOME/.cache/llb-dist"

# Browserprüfung bei laufender Vorschau, nur im isolierten Profil
node tests/browser_navigation.js
```

On data changes the respectively matching generators from
`AGENTS.md` are to be run beforehand. A single green partial check is no reason to publish
the unfinished quest navigation.

## Historical references

- Experiment worktree:
  `/Users/adrian/Developer/Lotro/lotro-log-book-aufgaben-navigation`
- Starting state before the experiment: commit `95fc39c`
- Plugin reference, shared quest view: commit `8b67b98`
- Plugin release with description: commit `002f26c`
- Earlier interface check: `docs/archiv/site-polish-2026-11-06.md`
- Epic quest logic: `docs/fachbereiche/epische-geschichte.md`
- Quest pages: `build_aufgaben.py` and
  `docs/archiv/katalogseite-spec-2026-11-08.md`
