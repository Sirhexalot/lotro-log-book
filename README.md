# LOTRO Log Book

The web companion of **Magic Quest Log**: per region the map with the objectives of
quests and deeds, your progress beside it, and pages for **deeds** with their running
counters, **reputation** and **crafting** — for every character loaded from LOTRO
Companion. Same name in every language.

Runs at **https://llb.sirhexalot.de/**.

## Navigation

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
remain searchable and accessible under the collapsed **Other quests** section at
the bottom. Their original catalogue keys and links are retained.

See [the missing-map audit](docs/missing-map-audit.md): an unassigned card is not
necessarily a missing image. No speculative map assignments were added.

This repository contains **only the code**. Map images, quest texts and progress
files are game material and are not published: they are created during the build
from your own game and stay local.

## What the code does

```
hole_karten.py      map images from the client (German/English/French)
baue_geografie.py   daten/geografie.json: which groups are real places?
baue_startbild.py   web/bild/start*.jpg for the start pages
build_daten.py      web/daten-<language>.js (quests) and, with --art taten,
                    web/daten-taten-<language>.js (deeds)
build_referenz.py   web/referenz.js: faction, tier and profession names (DE/EN/FR)
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
English. Texts live in `web/texte.js`.

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

## Rights

Fan project, not affiliated with Standing Stone Games, Daybreak Game Company or
Middle-earth Enterprises. Maps and game texts belong to their respective rights
holders. No advertising, no accounts, no profiles; on the website only
anonymous reach measurement without cookies (GoatCounter).
