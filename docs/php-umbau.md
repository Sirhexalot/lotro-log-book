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
- **Aufgabenseiten**: Chips, Beschreibung, Ort mit Karte und Koordinaten,
  Auftraggeber, Gebietsweg, Voraussetzungen, Belohnungen, „wird vorausgesetzt
  von“, Zusammenhang, Ziele hinter `<details>`.
- **Tatenseiten**: Chips, Ort, Tat-Art, Kategorie, Belohnungen mit
  Titel-/Tugend-Symbol, Nachbartaten nach Gebiet und Art.
- **Titel-, Tugend-, Rezept-, Berufs-, Gebiets- und Regionsseiten.**
- **Gegenstandsseiten** (52.798 je Sprache): Werte, Boni, Vorkommen, Quellen,
  Herstellung, Verwendung, Set-Zusammenhang, Weg in die Gegenstandssuche.
- **Listen und Übersichten**: Typindizes mit 200 Einträgen je Seite,
  Seitennavigation, Gegenstände nach Art und Seltenheit (auch kombiniert),
  Handwerks- und Katalogseite. Insgesamt 3.252 Seiten in drei Sprachen.
- Titel, Beschreibung, Canonical, `hreflang`, Open Graph und Twitter-Karte
  werden wie bisher erzeugt.
- 301 für `.html` und für die Adresse ohne Schrägstrich, 301 für
  Kleinschreibung, echte 404.

Prüfung: `tests/test_php_parity.py` vergleicht die PHP-Ausgabe tokenweise mit
der Ausgabe des bisherigen Generators (Überschriften, Texte, Links, Attribute,
Reihenfolge).

### Befunde aus dem Abgleich

Der Abgleich hat mehr gefunden als Formatierungsfehler:

- **Seltenheitsstufen waren verdreht** (1 = legendär, nicht gewöhnlich).
- **Platzhalter im Namen** (`Ernte[n]`) fehlten in der Bereinigung.
- **Zwei tote Pfade im alten Bau**: „Ausprägungen“ (Varianten) und verlinkte
  Set-Teile werden nie gerendert, weil der Zugriff auf `model['all']` ins Leere
  läuft. Für die Parität bleibt das so; die Aktivierung ist eine eigene
  Entscheidung nach der Umschaltung.
- **Leere Überschrift „Werte“** auf 10 von 52.802 Gegenstandsseiten – ein
  Defekt des alten Baus, der bewusst mit übernommen und danach korrigiert wird.
- **Zwei französische Beschriftungen** standen fest im Generator
  (`Utilisation`, `Ressources`) statt in den Sprachdateien.

## Noch offen (Reihenfolge der weiteren Arbeit)

1. **Anwendungsseiten in Twig**: Karte, Suche, Gegenstandssuche, Handwerk,
   Spielstand, Companion, Plugin, Reise, 404 — Hülle aus PHP, JavaScript
   unverändert, gleiche Adressen.
2. **Sitemaps aus PHP** (Index + Teil-Sitemaps aus demselben Routenverzeichnis).
3. **Härten**: fataler Fehler nie als HTTP 200, strenge Prüfung von Typ und ID,
   HEAD-Anfragen, Cache-Kopfzeilen, Datenverzeichnis außerhalb des Webroots.
4. **Umschaltung**: markierter `.htaccess`-Block, alter Bestand bleibt als
   Rückweg liegen.
5. **Vollständiger Abgleich** aller Seiten und Sitemaps, dann Browserprüfung
   DE/EN/FR, Desktop und Mobil.

## Abnahme vor der Veröffentlichung

- `python3 tools/build_php_data.py` und `tests/test_php_parity.py` grün.
- Vollständige URL-Menge identisch, keine neuen und keine fehlenden Adressen.
- Sitemaps gültig, vollständig, mit derselben URL-Menge wie der Build.
- Canonicals und `hreflang` je Entität identisch.
- 301/404-Verhalten wie bisher, keine Weiterleitungsketten.
- Startseite, Karte, Suche, Import und Spielstand unverändert nutzbar.
- Rückweg auf den alten Stand erprobt.

## Arbeitsort

Das Repository liegt seit 09.11.2026 lokal unter `~/Developer/lotro-log-book`;
der frühere iCloud-Ordner ist nur noch Lesestand. `vendor/` gehört ins Repo,
weil Composer den Projektpfad ins Autoload schreibt – liegt es außerhalb,
lauten die Klassenpfade auf ein anderes Verzeichnis.

## iCloud (Historie)

Der frühere Stand lag in `~/Documents` und damit in iCloud. Nicht zuletzt
benutzte Dateien sind dort nur Platzhalter (`compressed,dataless`); Lesen
erzwingt einen Download. Gemessen am 09.11.2026: **1534 ms je Datei** in
`phpdata` gegenüber **0,2 ms** auf lokalem Speicher, `daten/*.json` 2270 ms,
sogar `php/src/*.php` 1508 ms. Folge: langsame Builds, ein 78-Minuten-Release
und ein von iCloud evakuiertes `vendor/` (Composer-Fatals).

Deshalb:

- erzeugte Daten und Twig-Cache liegen außerhalb: `~/.cache/llb-php/`
  (`LLB_DATA`, `LLB_CACHE`); `vendor/` bleibt im Repo,
- `Companion-Test` und `MagicQuestLog` bleiben in iCloud und werden nur gelesen.

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
