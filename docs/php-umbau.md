# Umbau des Katalogs auf PHP + Twig

Stand: 09.11.2026. **Die Seite ist umgestellt**: seit dem 09.11.2026 liefert
der PHP-Front-Controller Katalog, Anwendungsseiten und Sitemaps aus; die alten
HTML-Dateien sind entfernt (siehe „Veröffentlichen“). Dieser Text beschreibt den Umbau von erzeugten statischen
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
- **Gegenstandssuche**: Baumfilter Kategorie → Art/Hand/Klasse → Platz aus den
  Client-Feldern `category`, `class`, `equipmentCategory`, `slot`, `armourType`
  und `weaponType`; Schmuck ist die Client-Klasse „Geschmeide“ mit Ring,
  Armband, Ohrring, Halskette und Talisman. Eine Auswahl ist ein Zweig, nicht
  ein loses Einzelfeld.
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

## Adressen der Anwendungsseiten

Die Anwendung hatte ihre Sprache in der Abfrage (`/index.html?lang=de`). Sie
liegt jetzt im Pfad, wie im Katalog:

| Bisher | Neu (DE) | EN | FR |
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

`handwerk` gehört schon der Katalogseite, deshalb liegt der Handwerksbrowser
eine Ebene tiefer. Abfrageparameter (`id`, `q`, `kat`, `art`, `nach`,
`vorkommen`, …) bleiben erhalten; die alte Sprache in der Abfrage fällt weg.
Alle alten Adressen antworten mit **301** auf die neue, mitgenommene Abfrage
eingeschlossen.

Die Seiten selbst liegen als Twig-Vorlagen unter `php/templates/app/`; die
Hülle (Titel, Canonical, `hreflang`, Kopfzeile, Fußnote, Skriptliste) steht in
`app/layout.twig`. Das JavaScript der Anwendungen ist unverändert, nur
`menue.js` und `sprache.js` kennen jetzt die neuen Adressen und lesen die
Sprache aus dem Pfad.

## Erledigt bei der Umschaltung

1. **404 und Rechtstexte** liegen als Dateien im Release; PHP liefert die
   404-Seite mit echtem Status und `noindex`.
2. **Härten**: `phpdata/`, `php/`, `vendor/` und `phptmp/` sind per
   `.htaccess` gesperrt, HTML antwortet mit `Cache-Control: max-age=300`,
   Sitemaps mit einer Stunde; Typ und ID prüft der Router in jedem Pfad.
3. **Umschaltung** über `tools/umschalten.py`; die alte `.htaccess` liegt als
   Sicherung bereit, die alten Katalogdateien wurden danach entfernt.
4. **Abgleich**: PHP-Adressen, Sitemaps, 301/404 und Browserprüfung DE/EN/FR
   nach der Umschaltung.

## Noch offen

- **HEAD-Anfragen** und ein eigener Blick auf Fehlerseiten bei kaputten Daten.
- **Betrieb**: Speicherplatz und Zugriffszeiten der Shards beobachten, Twig-
  Cache nach Releases leeren (`phptmp/twig`).

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

## Veröffentlichen

Die veröffentlichte Seite ist die PHP-Anwendung; der Dokumentenordner enthält
Einstiegspunkt, Anwendungsdateien, Daten und Bilder. Gebaut und hochgeladen
wird in dieser Reihenfolge:

```bash
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
python3 tools/build_release.py                    # ~/.cache/llb-release
python3 upload.py --quelle "$HOME/.cache/llb-release" --workers 8
python3 tools/umschalten.py --pruefen             # zeigt die neue .htaccess
python3 tools/umschalten.py                       # sichert die alte, schaltet um
python3 tools/umschalten.py --test                # Adressen der Live-Seite
python3 tools/aufraeumen.py --loeschen            # alte HTML-Bestände entfernen
```

`build_release.py` kopiert `web/`, `webp/` (als `karten/`), `php/`, `vendor/`
und `phpdata/`, schreibt `index.php`, `tracking.html` und `robots.txt` und lässt
die alten Anwendungsseiten sowie jedes `fortschritt.js` mit Spielstand weg
(755 MB, rund 16.800 Dateien).

Umgeschaltet wird **nur** die `.htaccess`: ein markierter Block schickt
Katalogadressen, alte Anwendungsseiten und Sitemaps an `index.php`, sperrt
`phpdata/`, `php/`, `vendor/` und `phptmp/` und lässt Bilder, Skripte und Stile
Dateien bleiben. Die alte Fassung wird vorher unter
`~/.cache/llb-php/rollback/` gesichert; `--zurueck` lädt sie wieder hoch.
Die früheren Katalogdateien bleiben zunächst liegen und werden nach der
Prüfung mit `tools/aufraeumen.py` entfernt.

## Lokal ausprobieren

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

Der Vorschauordner `~/.cache/llb-vorschau` enthält nur Verweise
(`web/*` und `karten/` → `webp/`). Geht er verloren, baut
`tools/vorschau_ordner.py` ihn in Sekunden neu; die Daten unter
`~/.cache/llb-php/phpdata` sind ein eigener Build und bleiben davon unberührt.

Prüfung gegen den bisherigen Stand (Orakel = mit dem alten Generator erzeugte
Seiten, z. B. unter `/tmp/llb-oracle-full`):

```bash
LLB_DATA="$HOME/.cache/llb-php/phpdata" \
LLB_ORACLE=/tmp/llb-oracle-full \
python3 tests/test_php_parity.py --anzahl 20
```
