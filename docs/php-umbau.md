# Umbau des Katalogs auf PHP + Twig

Stand: 09.11.2026. Dieser Text beschreibt den Umbau von erzeugten statischen
Katalogseiten zu einer PHP-Anwendung mit gemeinsamen Twig-Vorlagen. Er ist die
Arbeitsgrundlage für die weiteren Schritte und die Abnahme vor der
Veröffentlichung.

## Warum

Der statische Katalog schreibt für jede Entität eine vollständige HTML-Datei.
Bei 255.543 Seiten bedeutet eine Änderung an Kopfzeile, Menü oder einem
gemeinsamen Text einen vollständigen Neubau und einen Abgleich von Hundert-
tausenden Dateien. Der Upload vergleicht zwar Inhalte und überspringt
Unverändertes, aber wenn die Änderung in jeder Seite steckt, hilft das nicht.

Ziel: **eine Änderung an der Oberfläche ist eine Änderung an wenigen Dateien.**
Die öffentlichen URLs, die Inhalte und die Bedienung bleiben gleich.

## Aufbau

```text
composer.json            Twig als einzige Abhängigkeit, kein Framework
php/public/index.php     Front-Controller: Route, Statuscode, Ausgabe
php/public/router.php    Router für `php -S` (lokal)
php/src/Catalogue.php    Sprachen, Pfadsegmente, Routen, gültige IDs
php/src/Data.php         liest genau einen Datenshard je Anfrage
php/src/Router.php       200 / 301 / 404 nach denselben Regeln wie .htaccess
php/src/Shell.php        Kopfzeile, Menü, Breadcrumb, Fußzeile, Assets
php/src/Page.php         baut die Seitenvariablen, rendert die Vorlage
php/src/View.php         Twig-Umgebung, `pin`-Filter, `symbol`-Funktion
php/src/Escape.php       Escaping wie im bisherigen Generator
php/templates/           layout.twig und je Entität eine Vorlage
tools/build_php_data.py  erzeugt Shards und fertige Seitenmodelle
tools/php_viewmodel.py   Regeln der Seiten, eins zu eins aus den Generatoren
tools/build_php_labels.py  Beschriftungen und Symbole aus build_katalogseiten.py
tests/test_php_parity.py   vergleicht PHP-Ausgabe mit dem bisherigen Generator
```

## Daten

`tools/build_php_data.py` schreibt nach `phpdata/` (Standard) bzw. `--ziel`:

```text
manifest.json                 Schema, Sprachen, Zähler
labels.json                   Beschriftungen, Symbole, Basis-URL
<sprache>/maps.json           Kartentabelle
<sprache>/<art>/<shard>.json  Rohdaten je Entität
<sprache>/page-<art>/<shard>.json  fertige Seitenmodelle für Twig
```

Der Shard ist ein Hash der Kennung (`md5(id)[:2]`), nicht der Anfang der ID:
alle Spiel-IDs beginnen mit `70`, ein Präfix-Shard würde den ganzen Katalog in
eine Datei legen.

Beziehungen (vorherige/nächste Aufgabe, Voraussetzungen, „wird vorausgesetzt
von“, Ausschlüsse, gleicher Auftraggeber, gleicher Ort) werden **beim Bauen**
aufgelöst und mit Namen abgelegt. Eine Seitenanfrage liest deshalb genau eine
kleine Datei und läuft nicht durch den Katalog.

## Was bereits umgesetzt und geprüft ist

- Grundgerüst, Router und gemeinsame Hülle (Kopfzeile, Menü, Breadcrumb,
  Fußzeile, Assets mit Versionsstempel, Tracking aus dem gebauten Index).
- **Aufgabenseiten** in DE/EN/FR: Chips, Beschreibung, Ort mit Karte und
  Koordinaten, Auftraggeber, Gebietsweg, Voraussetzungen, Belohnungen,
  „wird vorausgesetzt von“, Zusammenhang, Ziele hinter `<details>`.
- **Tatenseiten** in DE/EN/FR: Chips, Ort, Tat-Art, Kategorie, Belohnungen
  (mit Titel/Tugend-Symbol), Nachbartaten nach Gebiet und Art.
- Titel, Beschreibung, Canonical, `hreflang`, Open Graph und Twitter-Karte
  werden wie bisher erzeugt.
- 301 für `.html` und für die Adresse ohne Schrägstrich, 301 für
  Kleinschreibung, echte 404.

Prüfung: `tests/test_php_parity.py` vergleicht die PHP-Ausgabe tokenweise mit
der Ausgabe des bisherigen Generators (Überschriften, Texte, Links, Attribute,
Reihenfolge). Geprüfte Aufgabenseiten in DE/EN/FR sind **abweichungsfrei**;
Tatenseiten ebenso.

## Noch offen (Reihenfolge der weiteren Arbeit)

1. **Gegenstandsseiten** (52.798 je Sprache, größter Block): Werte, Stats,
   Varianten, Quellen, Herstellung, Verwendung, Vorkommen.
2. **Rezeptseiten** und **Berufsseiten**.
3. **Titel-** und **Tugendseiten**.
4. **Gebiets- und Regionsseiten**.
5. **Listen- und Übersichtsseiten** (200 Einträge je Seite, Seitennavigation,
   Gegenstandsliste mit Verweis auf die Suche).
6. **Sitemaps aus PHP** (Index + Teil-Sitemaps, aus dem Routenverzeichnis).
7. **Umschaltung**: `.htaccess`-Block, damit PHP die Katalogpfade bedient;
   alter Bestand bleibt als Rückweg liegen.
8. **Vollständiger Abgleich** aller Seiten und Sitemaps gegen den bisherigen
   Stand, dann Browserprüfung DE/EN/FR, Desktop und Mobil.

## Abnahme vor der Veröffentlichung

- `python3 tools/build_php_data.py` und `tests/test_php_parity.py` grün.
- Vollständige URL-Menge identisch, keine neuen und keine fehlenden Adressen.
- Sitemaps gültig, vollständig, mit derselben URL-Menge wie der Build.
- Canonicals und `hreflang` je Entität identisch.
- 301/404-Verhalten wie bisher, keine Weiterleitungsketten.
- Startseite, Karte, Suche, Import und Spielstand unverändert nutzbar.
- Rückweg auf den alten Stand erprobt.

## iCloud

Das Repository liegt in `~/Documents` und damit in iCloud. Nicht zuletzt
benutzte Dateien sind dort nur Platzhalter (`compressed,dataless`); Lesen
erzwingt einen Download. Gemessen am 09.11.2026: **1534 ms je Datei** in
`phpdata` gegenüber **0,2 ms** auf lokalem Speicher, `daten/*.json` 2270 ms,
sogar `php/src/*.php` 1508 ms. Folge: langsame Builds, ein 78-Minuten-Release
und ein von iCloud evakuiertes `vendor/` (Composer-Fatals).

Deshalb:

- erzeugte Daten, `vendor/` und Twig-Cache liegen außerhalb: `~/.cache/llb-php/`
  (`LLB_DATA`, `LLB_VENDOR`, `LLB_CACHE`),
- das Projekt wird nach `~/Developer/lotro-log-book` verschoben; iCloud dient
  nur noch als Sicherung.

## Lokal ausprobieren

```bash
COMPOSER_VENDOR_DIR="$HOME/.cache/llb-php/vendor" composer install
python3 tools/build_php_labels.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"

LLB_VENDOR="$HOME/.cache/llb-php/vendor" \
LLB_DATA="$HOME/.cache/llb-php/phpdata" \
LLB_CACHE="$HOME/.cache/llb-php/twig" \
php -S 127.0.0.1:8812 -t php/public php/public/router.php
```

Prüfung gegen den bisherigen Stand (Orakel = mit dem alten Generator erzeugte
Seiten, z. B. unter `/tmp/llb-oracle-full`):

```bash
LLB_DATA="$HOME/.cache/llb-php/phpdata" \
LLB_ORACLE=/tmp/llb-oracle-full \
python3 tests/test_php_parity.py --anzahl 20
```
