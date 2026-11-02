# LotRO Magic Quest Map

Eine Karte zu **Magic Quest Log**: pro Gebiet die Karte, darauf die Ziele der
Aufgaben – mit dem eigenen Fortschritt daneben.

Läuft unter **https://mm.sirhexalot.de/**.

Dieses Repository enthält **nur den Code**. Kartenbilder, Aufgabentexte und
Fortschrittsdateien sind Spielmaterial und werden nicht veröffentlicht: sie
entstehen beim Bau aus dem eigenen Spiel und bleiben lokal.

## Was der Code macht

```
hole_karten.py      Kartenbilder aus dem Client (deutsch/englisch)
baue_geografie.py   daten/geografie.json: welche Gruppen sind echte Orte?
baue_startbild.py   web/bild/start*.jpg für die Startseiten
build_daten.py      daten/quests-<sprache>.json und web/daten-<sprache>.js
baue_webp.py        webp/<sprache>/*.webp aus den PNGs
baue_download.py    web/download/mql-spielstand.zip (Journal-Reader)
baue_website.py     dist-web/: die veröffentlichte Fassung
upload.py           dist-web/ per FTPS hochladen
dat/MapExport.java  liest Karten aus den DAT-Archiven
web/                die Seite (ohne Server aufrufbar)
```

## Bauen

Voraussetzungen: Python 3, Pillow, `lupa` (für den Lua-Katalog), Java für den
Kartenexport, ein installierter LOTRO-Client und das Plugin
[MagicQuestLog](https://github.com/Sirhexalot/lotro-magic-quest-log).

```sh
python3 hole_karten.py                                  # Bilder, ~300 MB je Sprache
python3 hole_karten.py --sprache en --ziel Karten_en
python3 baue_geografie.py
python3 baue_startbild.py --sprache de
python3 baue_startbild.py --sprache en
python3 build_daten.py --sprache de                     # braucht lupa
python3 build_daten.py --sprache en
python3 baue_webp.py --sprache de
python3 baue_webp.py --sprache en
python3 baue_download.py
python3 baue_website.py
```

Danach `dist-web/` im Browser öffnen oder hochladen.

## Sprache

Deutsch und Englisch. Die Seite lädt nur die gewählte Sprache
(`daten-de.js`/`daten-en.js`, Bilder aus `karten/de`/`karten/en`). Erste Wahl:
`?lang=`, dann `localStorage`, dann `navigator.language`, sonst Englisch.
Texte stehen in `web/texte.js`.

## Fortschritt

Die Zahlen kommen aus `Progress.lua`. Lokal liest `build_daten.py` sie beim Bau;
auf der Website lädt der Besucher sie im Browser über „Spielstand laden". Die
Datei bleibt dort und wird nicht hochgeladen.

## Rechte

Fan-Projekt, nicht verbunden mit Standing Stone Games, Daybreak Game Company
oder Middle-earth Enterprises. Karten und Spieltexte gehören den jeweiligen
Rechteinhabern. Keine Werbung, keine Konten, keine Profile; auf der Website nur
eine anonyme Reichweitenmessung ohne Cookies (GoatCounter).
