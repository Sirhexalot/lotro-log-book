# LotRO Magic Quest Map

A map for **Magic Quest Log**: per region the map, on it the objectives of the
quests – with your own progress beside it.

Runs at **https://mm.sirhexalot.de/**.

This repository contains **only the code**. Map images, quest texts and progress
files are game material and are not published: they are created during the build
from your own game and stay local.

## What the code does

```
hole_karten.py      map images from the client (German/English/French)
baue_geografie.py   daten/geografie.json: which groups are real places?
baue_startbild.py   web/bild/start*.jpg for the start pages
build_daten.py      daten/quests-<language>.json and web/daten-<language>.js
baue_webp.py        webp/<language>/*.webp from the PNGs
baue_website.py     dist-web/: the published version
upload.py           upload dist-web/ via FTPS
dat/MapExport.java  reads maps from the DAT archives
web/                the site (opens without a server)
  companion.js      LOTRO Companion files -> progress and plugin files (in the browser)
  speicher.js       characters and their progress, kept in the browser
  menue.js          menu bar with the character switch
  spielstand.html   the Progress page
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
