# LotRO Magic Quest Map

A map for **Magic Quest Log**: per region the map, on it the objectives of the
quests – with your own progress beside it.

Runs at **https://mm.sirhexalot.de/**.

This repository contains **only the code**. Map images, quest texts and progress
files are game material and are not published: they are created during the build
from your own game and stay local.

## What the code does

```
hole_karten.py      map images from the client (German/English)
baue_geografie.py   daten/geografie.json: which groups are real places?
baue_startbild.py   web/bild/start*.jpg for the start pages
build_daten.py      daten/quests-<language>.json and web/daten-<language>.js
baue_webp.py        webp/<language>/*.webp from the PNGs
baue_download.py    web/download/mql-spielstand.zip (journal reader)
baue_website.py     dist-web/: the published version
upload.py           upload dist-web/ via FTPS
dat/MapExport.java  reads maps from the DAT archives
web/                the site (opens without a server)
```

## Building

Requirements: Python 3, Pillow, `lupa` (for the Lua catalogue), Java for the
map export, an installed LOTRO client and the plugin
[MagicQuestLog](https://github.com/Sirhexalot/lotro-magic-quest-log).

```sh
python3 hole_karten.py                                  # images, ~300 MB per language
python3 hole_karten.py --sprache en --ziel Karten_en
python3 baue_geografie.py
python3 baue_startbild.py --sprache de
python3 baue_startbild.py --sprache en
python3 build_daten.py --sprache de                     # needs lupa
python3 build_daten.py --sprache en
python3 baue_webp.py --sprache de
python3 baue_webp.py --sprache en
python3 baue_download.py
python3 baue_website.py
```

Then open `dist-web/` in the browser or upload it.

## Language

German and English. The site loads only the selected language
(`daten-de.js`/`daten-en.js`, images from `karten/de`/`karten/en`). Order of
choice: `?lang=`, then `localStorage`, then `navigator.language`, otherwise
English. Texts live in `web/texte.js`.

## Progress

The numbers come from `Progress.lua`. Locally `build_daten.py` reads it during
the build; on the website the visitor loads it in the browser via "Load
progress". The file stays there and is not uploaded.

## Rights

Fan project, not affiliated with Standing Stone Games, Daybreak Game Company or
Middle-earth Enterprises. Maps and game texts belong to their respective rights
holders. No advertising, no accounts, no profiles; on the website only
anonymous reach measurement without cookies (GoatCounter).
