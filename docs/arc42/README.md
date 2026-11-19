# LOTRO Log Book – Architekturdokumentation nach arc42

- **Dokumentationsstand:** 19.11.2026
- **Geltungsbereich:** Repository `lotro-log-book` einschließlich Website, Datenaufbereitung, Tests und Release-Werkzeugen.
- **Leitlinie:** Diese Dokumentation beschreibt den im Code und in der Laufzeit belegbaren Stand. Bei Widersprüchen ist die Dokumentation zu korrigieren; sie begründet keine Änderung am Verhalten. Eine gewünschte Verhaltensänderung braucht einen eigenen Auftrag.

## Quellenstatus und Abgrenzung

Die Aussagen unten wurden gegen die genannten Dateien im Checkout geprüft. Das Repository enthält zum Dokumentationszeitpunkt zahlreiche nicht eingecheckte Änderungen. Diese Dokumentation beschreibt daher den **vorliegenden Arbeitsbaum**, nicht automatisch den letzten Commit oder die Live-Version. Bei betrieblichen Fragen sind Release-Build und Live-Verhalten zusätzlich zu prüfen.

Vorhandene README- und `docs/`-Dateien dienen als Fundstellen und Kontext, nicht als Beleg dafür, dass ein Verhalten noch gilt. Alte Zahlen und datierte Prüfstände werden nicht als aktuelle Systemwerte übernommen. Wo der Codepfad noch nicht vollständig nachvollzogen wurde, steht das ausdrücklich dabei.

Das separate Repository `MagicQuestLog` und Werkzeuge aus `Companion-Test` sind externe Daten- bzw. Build-Abhängigkeiten. Sie gehören nicht zum Änderungsumfang dieses Repositories. Ihr tatsächlicher Einfluss wird dort benannt, wo der Website-Code sie aufruft oder erzeugte Dateien von ihnen einliest.

---

## 1. Einführung und Ziele

LOTRO Log Book ist eine mehrsprachige Website für Inhalte und Fortschritt aus *The Lord of the Rings Online*. Der Code bietet unter anderem Aufgaben- und Tatenkarten, Katalog- und Suchseiten, Handwerk, Reisen, Abenteuer, Fraktionen, Landmarken, Instanzen und Seiten zu einzelnen Spieleinträgen. Die öffentlich verwendeten Sprachen sind Deutsch, Englisch und Französisch.

Aus der Implementierung erkennbare Architekturziele:

- **Katalogseiten nicht je Eintrag vollständig vorab als HTML ausliefern:** Python bereitet Daten und Seitenmodelle vor; PHP rendert passende Seitenmodelle zur Anfrage.
- **Große Datenmengen nicht für jede Anfrage vollständig durchsuchen:** Die Daten werden in Shards abgelegt und anhand stabiler IDs adressiert.
- **Spielerfortschritt im Browser verarbeiten:** Companion-Import und Charakterauswahl liegen im JavaScript-Speicher des Browsers.
- **Eine gemeinsame Seitenhülle und lokalisierte Pfade verwenden:** PHP/Twig und die Browseranwendung teilen Navigation, Sprachauswahl und öffentliche Sprachpfade.

Belege: `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_php_data.py`, `php/src/Catalogue.php`, `web/companion.js`, `web/speicher.js`.

### Qualitätsziele (aus dem Ist-Code abgeleitet, nicht als freigegebene SLA)

| Rang | Qualitätsziel | Im Code sichtbare Umsetzung |
|---|---|---|
| 1 | Große Kataloge effizient ausliefern | Vorbereitete Shards, kompakte Relationszeilen, keine Vollkatalogsuche pro PHP-Request |
| 2 | Kanonische und echte Seitenantworten | Zentraler Router, 301 für alte/nichtkanonische Adressen, 404 für nicht vorhandene Einträge |
| 3 | Fortschritt privat im Browser halten | Companion-Verarbeitung und Mehrcharakterspeicher clientseitig; Release setzt `fortschritt.js` leer |
| 4 | Drei Sprachpfade konsistent bedienen | Sprache in URL und lokalisierte Katalog-/Labelartefakte |
| 5 | Verknüpfungen reproduzierbar aus Daten ableiten | Build-Viewmodels und Indizes; Generator-/Vertragstests |

Der Code setzt keine messbaren Latenz-, Verfügbarkeits-, RPO/RTO- oder Accessibility-SLAs. Diese Ziele dürfen daher nicht als erfüllte Betriebszusagen verstanden werden.

## 2. Randbedingungen

### Technische Randbedingungen

- Composer verlangt PHP **8.1 oder höher** und Twig `^3.8`; in `composer.json` sind keine weiteren Laufzeitpakete aufgeführt.
- Der PHP-Code verwendet einen Front-Controller und Twig, kein in `composer.json` deklariertes PHP-Framework.
- Python erzeugt Katalogdaten, lokalisierte Beschriftungen, Seitenmodelle und Release-Dateien.
- Der Browserteil besteht aus HTML, CSS und JavaScript. Die Anwendungslogik und Filtermodule liegen in `web/`.
- Website-Daten werden in JSON-Dateien bereitgestellt. In der PHP-Laufzeit ist in den eingesehenen Daten- und Routingpfaden keine Datenbankanbindung vorhanden.

Belege: `composer.json`, `php/public/index.php`, `php/src/Data.php`, `tools/build_php_data.py`.

### Produkt- und Betriebsgrenzen

- Die unterstützten Anwendungssprachen sind in `Catalogue::LANGS` auf `de`, `en`, `fr` festgelegt.
- Quest-/Tat- und Gegenstandsdaten werden nicht im Request aus dem Spielclient extrahiert; PHP liest vorbereitete Dateien.
- Der Website-Build ruft für die Tatendaten explizit einen gemeinsamen Generator aus dem separaten `MagicQuestLog`-Repository auf (`tools/build_taten_daten.py`).
- `tools/build_release.py` erzeugt einen PHP-Release ohne `.htaccess`; die Umschaltung bzw. Webserver-Konfiguration ist ein separater Betriebsschritt.

Belege: `php/src/Catalogue.php`, `tools/build_taten_daten.py`, `tools/build_release.py`.

## 3. Kontextabgrenzung

### Beteiligte und Nachbarsysteme

| Beteiligter / System | Beziehung zum LOTRO Log Book | Belegter Umfang |
|---|---|---|
| Website-Besucher | Ruft Anwendungs-, Listen- und Detailseiten ab | Sprachpfade und Seitenauflösung in `php/src/Router.php` |
| Browser | Führt Karten-, Such- und Filteroberflächen aus; hält Sprachwahl, Filtergedächtnis und Charakterdaten lokal | `web/*.js`, unter anderem `speicher.js`, `filtergedaechtnis.js`, `companion.js` |
| LOTRO Companion | Liefert Dateien, die der Browserimport verarbeitet | `web/companion.js`, `web/spielstand.js` |
| Spiel-/DAT-Daten | Werden außerhalb des HTTP-Requests exportiert und zu Website-Daten verarbeitet | Generatoren wie `build_daten.py`, `build_items.py`, `tools/build_php_data.py` |
| MagicQuestLog | Gemeinsamer Generator für Tatendaten; externes Repository | Aufruf in `tools/build_taten_daten.py` |
| Webserver / PHP | Leitet öffentliche Seiten an den Front-Controller; stellt statische Dateien bereit | `deploy/index.php`, `php/public/index.php`; Rewrite-Regeln sind nicht Teil des Release-Ordners |
| FTPS-Zielserver | Erhält gebaute Release-Dateien | `upload.py` |

### Funktions- und URL-Raum

`Catalogue::APP` ordnet App-Schlüssel je Sprache den öffentlichen Pfaden zu. Zum aktuellen App-Raum gehören Startseite, Karte und Tatenmodus, Aufgabenfinder, Gegenstandssuche, Handwerk/Rezepte, Reise, Ruf, Belohnungen, Spielstandimport, Companion-Hilfe, Plugin-Hilfe, globale Suche sowie Set-, Auftraggeber-, Händler-, Landmarken-, Titel-, Fraktions-, Instanz- und Abenteuerbrowser. Die App-Adressen sind sprachpräfigiert; der Aufgaben-/Tatenmodus teilt sich ein Karten-Template.

Der Entitätsraum hat getrennte Segmente für Aufgaben, Taten, Gegenstände, Gebiete, Regionen, Rezepte, Berufe, Titel, Tugenden, Sets, Auftraggeber, Händler, Fraktionen und Landmarken. Die genauen deutschen, englischen und französischen Segmente stehen ausschließlich in `php/src/Catalogue.php`; beispielhaft `/de/aufgabe/<ID>/`, `/en/quest/<ID>/`, `/fr/quete/<ID>/`. Anwendungsseiten, Entitätsseiten und datengetriebene Listen sind im Router getrennte Routeklassen. Eine Berufsadresse leitet in die Handwerksanwendung; das ist keine Beruf-Detailseite.

### Datenflussgrenze beim Charakterfortschritt

Der Import und Charakterwechsel werden im Browser verarbeitet und mit `localStorage` gespeichert. Der Statistik-Endpunkt `/api/statistik` ist ein separater Pfad: Er verarbeitet Heartbeat- und Importzählereignisse und speichert aggregierte Zähler in einer Datei. Die eingesehenen Aufrufstellen senden keinen Charakterspielstand an diesen Endpunkt.

Belege: `web/companion.js`, `web/speicher.js`, `web/statistik.js`, `php/public/index.php`, `php/src/Statistics.php`.

## 4. Lösungsstrategie

1. **Build-Zeit:** Python-Generatoren verbinden die lokal verfügbaren Datenquellen und schreiben Webkataloge sowie PHP-Datenartefakte.
2. **PHP-Datenaufbereitung:** `tools/build_php_data.py` liest Webkataloge und `daten/*.json`, baut lokalisierte Listen- und Detailmodelle, löst Relationen auf und legt Ergebnisse in JSON-Shards ab.
3. **HTTP-Anfrage:** `php/public/index.php` bestimmt Sprache und Pfad, `Router` klassifiziert die Anfrage, `Data` liest die benötigten Dateien und `Page`/spezialisierte Klassen bereiten den Twig-Kontext vor.
4. **Darstellung:** Twig rendert vollständiges HTML. Browser-JavaScript ergänzt die interaktiven Anwendungen und progressive Filterfunktionen.
5. **Release:** `tools/build_release.py` stellt statische Assets, PHP-Code, Vorlagen, `vendor/` und den vorbereiteten `phpdata/`-Bestand zusammen. `upload.py` überträgt den Release; Twig-Cache und Webserver-Umschaltung sind separate Schritte.

Die PHP-Anfrage baut keine vollständigen Kataloge neu auf. `Data::page()` und `Data::entity()` bestimmen den Dateibucket aus `md5(ID)[:2]`; `relationRows()` gruppiert angeforderte IDs nach Bucket. So bleibt der Zugriff auf die angefragten Datensätze begrenzt, auch wenn eine Detailseite verbundene Einträge lädt.

Belege: `tools/build_php_data.py`, `tools/php_viewmodel.py`, `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_release.py`.

## 5. Bausteinsicht

### 5.1 Daten- und Build-Schicht

- **Spiel- und Exportdaten:** liegen außerhalb der normalen PHP-Anfrage und werden über Python-Werkzeuge verarbeitet.
- **Webkataloge:** `build_daten.py` erzeugt lokalisierte Aufgaben-/Taten-Dateien; weitere Generatoren erstellen unter anderem Gegenstände, Rezepte, Reise-, Fraktions-, Landmarken- und Instanzdaten.
- **PHP-Datenbuilder:** `tools/build_php_data.py` erzeugt den für PHP bestimmten, lokalisierten Bestand unter `phpdata/`, darunter Entitäts-Shards, Seitenmodelle, Listenmodelle, Indizes und Sitemapdaten.
- **Seitenmodelle:** `tools/php_viewmodel.py` berechnet Darstellungsdaten und Verknüpfungen im Build, damit PHP nicht für jede Seite den Gesamtkatalog durchsucht.

### 5.2 PHP-Anwendung

| Baustein | Verantwortung |
|---|---|
| `php/public/index.php` | HTTP-Einstieg, Fehlerstatus, API-Endpunkt, Legacy-Weiterleitungen, Routing, Sitemap-Ausgabe und Dispatch |
| `php/public/router.php` | Entwicklungsserver-Router: vorhandene Dateien direkt bedienen, sonst zum Front-Controller |
| `Router` | Kanonische Pfade, Listen-/Detailauflösung, Sprachpfade, ID-Schreibweise, Redirects und 404 |
| `Catalogue`, `Sprache` | Sprachcodes, Segment-/URLtabellen, Beschriftungen und Auswahl bei sprachlosen Pfaden |
| `Data` | Read-only JSON-Zugriff auf Entitäts-, Seiten-, Listen-, Filter- und Anwendungsindizes |
| `Page` | Gemeinsame View-Kontexte und Rendering für App-, Listen- und Entitätsseiten |
| `Sets`, `Givers`, `Vendors`, `Landmarks`, `Factions`, `Titles`, `Instances`, `Adventures` | Fachspezifische Listen-/Detailansichten; erlaubte Filter und Paginierung bei serverseitigen Browsern |
| `RelatedLists`, `FilterRegeln` | Auflösen der Detailseiten-Relationen und gemeinsame Darstellungsgrenze direkte Liste vs. Filter |
| `Shell`, `View`, `Escape` | Gemeinsame HTML-Hülle, Twig-Konfiguration, Tracking-/Assetmetadaten und HTML-Escaping |
| `Sitemap` | XML-Ausgabe der Build-URLlisten |
| `Statistics` | Nicht-katalogbezogene, dateibasierte Aggregatzähler für den API-Endpunkt |
| `php/templates/` | Twig-Templates nach App-, Entitäts-, Listen- und Fachbrowserfamilie |

Es gibt keine persistenten Repositoryklassen für einen Datenbankserver und keine serverseitige Authentifizierung des Katalogs. Geschäftslogik ist zwischen Build-Viewmodels, PHP-Listenadaptern, Browsermodulen und Templates verteilt; diese Aufgabenteilung ist für Änderungen relevant.

### 5.3 Browseranwendung

- `web/app.js` und zugehörige Styles/Module steuern Aufgaben- und Tatenkarten sowie Gebiets- und Fortschrittsansichten.
- Separate Browsermodule implementieren unter anderem Abenteuerübersicht, Reiseplaner, Gegenstandssuche, Handwerk, Filter, Spielstandimport und Charakterverwaltung.
- `web/companion.js` liest importierte Companion-Dateien im Browser; `web/speicher.js` verwaltet mehrere lokale Charaktere.
- `localStorage` wird zusätzlich für Sprache, Filterzustände, Karten-/Ansichtsoptionen und weitere lokale Bedienpräferenzen verwendet.

Die funktionalen Browserbereiche und ihre Hauptmodule sind:

| Bereich | Einstieg / Hauptmodule | Datenform oder Zweck |
|---|---|---|
| Aufgaben- und Tatenkarte | `app.js`, `karten-aufgabenfilter.js`, `karten-start-*.js`, `karten-kurz-*.js`, `karten-daten/` | Kartenbaum und Startmetadaten; separate Aufgaben-/Taten-Shards sowie Details beim Öffnen |
| Aufgabenfinder | `aufgabenfinder.js`, `aufgaben-filter.js` | Such-/Filteroberfläche und Trefferlisten für Aufgaben |
| Gegenstandssuche | `gegenstaende.js`, `gegenstaende-filter.js`, `gegenstaende-*.js` | Vollständiger kompakter Gegenstandssuchindex |
| Handwerk | `handwerk.js`, `handwerk-filter.js`, `rohstoffe.js`, `zutaten.js`, `rezepte-*.js`, `referenz.js` | Berufe, Rezepte, Lernstand, Zutaten und Sammelvorkommen |
| Spielstandimport | `companion.js`, `spielstand.js`, `speicher.js` | Companion-Dateien, Fortschritt mehrerer Charaktere, lokale Sicherung |
| Abenteuer | `abenteuer.js`, `abenteuer-logik.js`, `abenteuer-karte.js`, `abenteuer-*.js` | Inhaltsblöcke, Gebietszuordnung, Karte und clientseitiger Fortschritt |
| Reise | `reise.js`, `reise-*.js` | Stationen, Verbindungen und Reisefertigkeiten aus vorbereiteten Daten |
| Ruf | `ruf.js`, `ruf-quellen-*.js`, `referenz.js` | Rufquellen und lokal importierter Charakterruf |
| Belohnungen und Titel | `belohnungen.js`, `suche.js`, `taten-index.js`, `titles/list.twig` und ergänzende Module | Quellen-/Katalogsuche; Titelindex wird serverseitig bereitgestellt |
| Entitätslisten auf Detailseiten | `entitaeten-listen.js`, `filter-server.js`, `filter-ui.js`, `filteradapter.js`, `filterzustand.js`, `filtergedaechtnis.js` | Gemeinsames Filter-/Sortier-/Seitenmodell für relationale Listen |
| Gelände | `gelaende.js`, `gelaende.css`, `tools/build_gelaende.py` | Kachelmanifest und clientseitiges Nachladen der Geländekacheln |
| Gemeinsame Hülle | `menue.js`, `familienmenue.js`, `sprache.js`, `sprachwahl.js`, `status.js`, `statistik.js`, `texte*.js`, `gemeinsam.css` | Navigation, Sprache, Status-/Statistikmeldung, lokalisierte Texte und gemeinsame Gestaltung |

Dies ist die Modulzuordnung der zentralen Einstiegspunkte, keine Behauptung, dass jedes Hilfsmodul einzeln aufgeführt ist.

### Fachliche Datenpipelines

Die folgenden Pfade sind getrennte Generatorläufe; nicht jeder wird durch einen einzelnen Orchestrator automatisch in der richtigen Reihenfolge ausgeführt. Eingaben in iCloud-/Companion-/Plugin-Pfaden sind extern und werden vom Website-Repository nicht versioniert.

| Datenbereich | Belegter Hauptpfad | Übergabe an PHP / Browser |
|---|---|---|
| Aufgaben | DAT-/MagicQuestLog-Questkatalog und Detaildateien → `build_daten.py` → `web/daten-<sprache>.js`; zusätzliche Merkmale über `tools/build_questmerkmale.py` | Aufgabenkatalog als PHP-Seitenmodell, Karten-/Finderdaten und Such-/Filterzeilen |
| Taten | DAT-Export → `tools/build_taten_daten.py` (gemeinsamer externer MagicQuestLog-Erzeuger) → `build_daten.py --art taten` → `web/daten-taten-<sprache>.js` | Tatseiten, Tatenindex, Karten-/Filterdaten; Dublettenabbildung separat als `ersetzt`/Redirectdaten |
| Karten/Geografie | Spielkarten- und Geografiedaten, darunter die aus dem Plugin-Repo verwendeten Spielkartenregeln → Kartentabelle und `web/daten-<sprache>.js` | `maps.json`, Kartenbaum, Namen, Rahmen, `fk`-Pfad und Viewmodel-Kartenlinks |
| Gegenstände | Client-Items → `build_items.py` → `daten/items.json`; ergänzende Details/Typen/Sets und vollständiger Namensexport → `build_gegenstaende.py`, `build_gegenstandssuche.py`, `itemnamen.py` | Itementitäten, Itemseiten, Filterlabels und lokalisierte Suchdateien |
| Belohnungen | Aufgaben-/Tatbelohnungen plus Titel-/Tugend-/Itembestand → `build_belohnungen.py` | Browser-Belohnungsdateien und Quellen-/Filterinformationen; PHP baut seine Relation aus den Katalogdaten |
| Rezepte und Berufe | Rezeptexport → `build_rezepte.py`; Berufe aus `referenz.js`/`build_referenz.py` | Rezeptentitäten, Zutaten- und Ergebnisbeziehungen, Berufsgruppierungen |
| Sets | Set-/Itemdefinitionen → `build_sets.py` → `daten/sets.json`; `tools/set_viewmodel.py` löst Itemseiten und Mitglieder für die Anzeige auf | Setseiten, Setindex, Setmitglieder/Boni sowie Rückverweis von Items auf Sets |
| Auftraggeber | Client-Questgeber-/Positionsdaten → `build_auftraggeber.py` → `daten/auftraggeber.json`; `tools/giver_viewmodel.py` verbindet Questbestand und Kartenbaum | Auftraggeberdetails und Filterindex mit Quests, Standorten und Gebietskontext |
| Händler | `build_haendler.py` erstellt `daten/haendler.json` aus Item-/Vendorquellen | Händlerdetails und `vendors-index.json`, Warenlisten sowie kartografische Standorte |
| Fraktionen und Rufquellen | DAT-Klasse 1889 → `tools/build_fraktionen.py`; Rangnamen aus `referenz.js`, Quellen aus `web/ruf-quellen-<sprache>.js` | Fraktionsseiten, Filterindex und Browser-Rufansicht |
| Landmarken | DAT-Landmarken, Positionsexport und `locations.json` → `tools/build_landmarken.py` | Landmarkenseiten, Zielverknüpfungen und `landmarks-index.json` |
| Instanzen | ausgewählte DAT-Templates + `tools/export_instance_finder.py` Auswahl → `tools/build_instanzen.py`; Questgeografie nur ergänzend | Instanzfilterindex; explizite Finder-Auswahl, Stufen-/Gruppen-/Schwierigkeitswerte |
| Abenteuer | `referenz/inhaltspakete.json`, Kartenbaum und Aufgabenbestand → `tools/build_abenteuer.py` / `catalogues()` | Sprachkatalog in `phpdata/<sprache>/abenteuer.json` und `web/abenteuer-<sprache>.js` |
| Vorkommen | Client-/Lore-Ressourcen → `build_vorkommen.py` | Vorkommen-Metadaten, Gebietssummen und per Karte nachladbare Browserdaten; Gegenstandsseiten nutzen diese Zuordnung |
| Kartennotizen | `build_notizen.py` und Symbolvorbereitung `build_notizsymbole.py` | Browser-Kartenlayer für Händler, Stallmeister, Briefkästen und weitere Notizarten |
| Gelände | DAT-Radarkacheln → `tools/build_gelaende.py` | versioniertes Manifest und Tile-Pyramide, bei Fehlen bleiben Spielkarten die Rückfallebene |
| Übersetzung/Labels | `tools/build_php_labels.py` aus Sprach-/Katalogworttabellen | `phpdata/labels.json`, gelesen von `Catalogue`/`Shell` |
| Sitemap/SEO | `tools/build_php_data.py` sammelt tatsächliche Seiten-URLs; `build_seo.py` erstellt Grunddateien und Vorschauen | `sitemaps.json`, robots.txt und beim Request als XML gerenderte Sitemaps |

`build_daten.py`, `build_katalogseiten.py` und `baue_website.py` bewahren zusätzlich frühere bzw. statische Baupfade. Diese dürfen nicht mit dem PHP-Release verwechselt werden. `tools/build_app_templates.py` ist im eigenen Docstring ausdrücklich ein **einmaliges Migrationswerkzeug**, kein laufender Buildschritt. Quellen: die jeweiligen Generatoren in der Tabelle und `tools/build_php_data.py`.

### PHP-Datenartefakte und Lesemodelle

`tools/build_php_data.py` schreibt keinen einzelnen monolithischen Katalog. Das zentrale Format besteht aus:

| Pfad/Dateigruppe | Schlüsselung | Leser und Aufgabe |
|---|---|---|
| `manifest.json` | Buildschema, Sprachen, Arten und Anzahl je Sprache | Build-/Kompatibilitätsübersicht; keine fachliche Relation |
| `<sprache>/<art>/<shard>.json` | `entities[ID]`, Bucket `md5(ID)[:2]` | `Data::entity()` für Roh-/Listenentitäten wie `q`, `d`, `i`, `recipe`, `set`, `giver`, `vendor`, `area`, `region` |
| `<sprache>/page-<art>/<shard>.json` | `entities[ID]` | `Data::page()` für Twig-fertige Detailmodelle |
| `page-list/<shard>.json` | `pages[kanonischer Sprachpfad]` | `Data::listPage()` für Typindizes, Unterlisten und Paginierung |
| `filter-q`, `filter-d`, `filter-i` | kompakte Filterzeile nach ID | `RelatedLists` und relationale Listen; kein vollständiger Beschreibungstext |
| `<sprache>/maps.json` | Kartentabelle nach Karten-ID | Kartennamen und Kartenpfade |
| `*-index.json` | eine kompakte Zeile pro Eintrag bzw. Filterdimension | Serverseitige Browser für Auftraggeber, Händler, Landmarken, Fraktionen, Titel und Instanzen |
| `<sprache>/sets-index.json`, `filter-items.json` | Set-/Itemfacetten | Set- und Gegenstandslisten |
| `<sprache>/deed-redirects.json` | alte Tat-ID → aktuelle ID | Kanonische Weiterleitung ersetzter Dubletten |
| `<sprache>/zutaten-ohne.json` | Item-IDs ohne belegte Herkunftsantwort | Schaltet leere Herkunftsbedienung in Rezept-/Handwerksansichten ab |
| `<sprache>/abenteuer.json` | Abenteuerblöcke, Gebiete, Aufgaben | Abenteuerseite; Browsergegenstück wird zusätzlich unter `web/` geschrieben |
| `sitemaps.json` | Sitemapindex und kanonische URL-Listen | `Sitemap::index()` und `Sitemap::section()` |
| `labels.json` | lokalisierte Wörter, Segmente, Familien, Symbole und App-Metadaten | `Catalogue`, `Shell` und Vorlagen |

Das genaue Nutzschema variiert je Art und wird durch die Writer in `tools/build_php_data.py` sowie die Leser `Data`, `RelatedLists` und Fachklassen bestimmt. `manifest.json` dokumentiert nicht jedes Feld eines Datensatzes und ist kein JSON-Schema-Validator.

### 5.4 Datenmodell: Form und Identität

Das Datenmodell ist **kein relationales Datenbankschema**. Es gibt zur Laufzeit keine SQL-Tabellen oder Fremdschlüsselprüfung. Die maßgeblichen Datensätze kommen aus Exporten und Generatoren; `tools/build_php_data.py` legt daraus lokalisierte JSON-Entitäten, Seitenmodelle, Indizes und Relationszeilen ab. PHP liest diese Dateien nur. Relationen sind je nach Fall als IDs im Quelldatensatz, als beim Build aufgelöste ID-Listen oder als zusammengefasste Anzeige-/Filterwerte repräsentiert.

Der Builder kennt folgende Katalogarten (interne Kennungen): `q` Aufgabe, `d` Tat, `i` Gegenstand, `recipe` Rezept, `p` Beruf, `title` Titel, `virtue` Tugend, `set` Set, `giver` Auftraggeber, `vendor` Händler, `f` Fraktion, `l` Landmarke, `area` Gebiet und `region` Region. Die vollständige Erzeugung ist in `language_data()`, `main()` und den Viewmodel-Funktionen von `tools/build_php_data.py` und `tools/php_viewmodel.py` nachvollziehbar.

IDs werden in der Regel als Zeichenketten geführt und durch ihren Quelltyp interpretiert. Aufgaben-/Taten-/Gegenstands-IDs stammen aus den Katalogdaten; Karten-IDs stammen aus der Kartentabelle. Berufsschlüssel sind stabile Schlüssel. Gebiet und Region teilen den Kartendatenraum, werden aber nach `tier` in getrennten Entitätsarten abgelegt (`map_kind()`). Der Shard ist **kein fachlicher Schlüssel**: `md5(ID)[:2]` bestimmt nur, in welcher Datei ein Datensatz liegt. Sprachversionen der PHP-Daten haben dieselben fachlichen IDs, aber lokalisierte Namen und Ausgabetexte.

### 5.5 Entitäten und fachliche Beziehungen

Die Tabelle benennt die im Code erzeugten wesentlichen Entitäten und die belegten Beziehungen. „Direkt“ heißt, dass ein Quellfeld bzw. Generator-Datensatz die Verknüpfung ausdrücklich trägt. „Abgeleitet“ heißt, dass der Website-Build sie aus solchen Angaben errechnet. Solche Bezeichnungen behaupten nicht, dass die Quellbeziehung im Spiel dieselbe Semantik wie eine Website-Navigation hat.

| Entität / Beziehung | Quelle und Schlüssel | Beziehung im Website-Datenmodell | Status und Grenze |
|---|---|---|---|
| Aufgabe (`q`) | `MQL_QUESTS`, Kennung `i` | `pq` Vorgänger, `nq` nächster Eintrag, `v` alle Voraussetzungen, `vo` alternative Voraussetzungen, `e` ausschließende Alternativen; `vl` Stufenangabe und `vb` zusätzliche Voraussetzung bleiben Fakten am Eintrag. | Diese Felder werden in `build_relations()` nur auf existierende Quest-IDs im selben Aufgabenbestand aufgelöst. Querverweise zu Taten aus dem gemeinsamen Achievable-Raum sind damit nicht automatisch Bestandteil dieser Quest-Seitenrelationen. |
| Tat (`d`) | `MQL_QUESTS` aus dem Tatkatalog, Kennung `i` | Dieselbe Relationserzeugung wie für Aufgaben: Vorgänger, nächster Eintrag, Voraussetzung, Alternative, Ausschluss und Rückverweis auf voraussetzende Taten. Kontextliste zusätzlich nach gemeinsamem Gebiet oder Art. | Sequenz-/Voraussetzungsrelationen sind quellfeldbasiert; „gleiche Art“ und „gleiches Gebiet“ sind abgeleitete Kontextgruppen, keine Spielvoraussetzungen. Dubletten-Weiterleitungen werden separat als alte ID → aktuelle ID gespeichert. |
| Aufgabe ↔ Auftraggeber (`q` ↔ `giver`) | `build_auftraggeber.py` erzeugt `daten/auftraggeber.json`; `giver_viewmodel.py` verbindet dessen Quest-IDs mit dem Questbestand. | Ein Auftraggeber hat eine Liste zugeordneter Aufgaben; Questdetail kann über `QUEST_GIVERS` einen Auftraggeberlink erhalten. | Die Zuordnung folgt der Auftraggeber-Datenquelle. Fehlende oder nicht im Katalog vorhandene IDs werden beim Erzeugen der verknüpften Ansichten nicht als gültige Katalogseite ausgegeben. Mehrere Auftraggeber-/Standortbeziehungen werden im Index erhalten; der Questseiten-Link kann einen ausgewählten Auftraggeber verwenden. |
| Aufgabe/Tat ↔ Gegenstand (`q,d` ↔ `i`) | `rw` (Belohnung) in Aufgaben-/Tatenquellen; `quellen` im Gegenstandsdatensatz. | Belohnungslisten verlinken Gegenstände, soweit eine eindeutige ID vorhanden ist; Gegenstandsseiten gruppieren Bezugsquellen nach Aufgaben bzw. Taten. Die Zuordnung von Itemseiten zu Kartengebieten wird aus den `fk`-Pfaden der Quellen berechnet. | Eine ID ist stärker als ein Name. Namensauflösung über `item_link()` wird nur bei genau einem Treffer verlinkt; mehrdeutige Namen bleiben unverlinkt. Kartenmitgliedschaft ist abgeleitet und bedeutet „in diesem Kartenpfad wird eine Quelle geführt“, nicht zwingend Fundort oder Zielposition des Gegenstands. |
| Gegenstand ↔ Rezept (`i` ↔ `recipe`) | Rezeptfelder für Zutaten, optionale Zutaten und Resultate; normalisierte Listen `zutat`, `verwendung`, `herstellung` bzw. `rezepte` in den Quelldaten. Rezept-ID ist `row[10]`; Gegenstands-ID stammt aus Itemquelle. | `recipe_view()` stellt Zutaten/optionale Zutaten als Rezept → Gegenstand dar. `item_view()` baut getrennte Listen `used_in` (Gegenstand als Zutat) und `crafted_by` (Rezept erzeugt den Gegenstand). Kritischer und normaler Erfolg können eigene Rollen und Mengen tragen. | Die Richtungen sind fachlich verschieden und werden nicht zu einer generischen Rezeptkante verschmolzen. Nicht auflösbare oder fehlende Itemseiten können als Text ohne Detail-URL erscheinen. |
| Gegenstand ↔ Set (`i` ↔ `set`) | `daten/sets.json`, Gegenstandsdetails und Set-Viewmodel; Set-ID als eigener Schlüssel. | Ein Item kann auf ein Set zeigen; die Setseite führt definierte Mitglieder und Boni. Itemseiten zeigen den Setblock mit Mitgliedern. | Setmitglieder sind die Setdefinition und nicht automatisch eine „ähnlicher Gegenstand“-Relation. Ein Setmitglied ohne passende Katalogseite kann als Text ohne Link angezeigt werden. |
| Gegenstand ↔ Gegenstand (Namensvarianten) | Sauberer lokalisierter Name in den Itemdatensätzen. | `ItemContext.variants()` sammelt andere Gegenstands-IDs mit gleichem bereinigtem Namen und zeigt die Varianten getrennt nach Stufe/Seltenheit. | Abgeleitete Namensgleichheit, keine bewiesene Spiel-Äquivalenz oder Setzugehörigkeit; jeder Eintrag behält seine eigene stabile ID. |
| Gegenstand ↔ Händler / Tauschquelle (`i` ↔ `vendor`) | Händlerdaten aus `daten/haendler.json`; Itemdatensatz enthält Händler-/Tauschquellen. | Gegenstandsseite zeigt Händler und Tauschquellen; Händlerdetail liefert sein Warenangebot. `RelatedLists` löst Händlerlisten über den Händlerindex und Tauschzeilen aus dem Seitenmodell. | Händler-IDs und Tauschquellen sind verschiedene Beziehungstypen. Aus einer Händlerzuordnung folgt keine Verfügbarkeit für jeden Charakter oder zu jeder Zeit. |
| Aufgabe/Tat ↔ Gebiet/Region (`q,d` ↔ `area,region`) | `fk` Kartenpfad in Quest-/Tatdatensatz; Kartenbaum mit `idx`, `eltern`, `tier`. | Datensätze werden den in `fk` enthaltenen Karten zugeordnet. `members_index()` sammelt Aufgaben und Taten je Karte; Regionen aggregieren in der Ansicht ihre Untergebiete. | `fk` ist Karten-/Navigationspfad, nicht zwingend exakte Questposition. Kartenmitgliedschaft und geografische Elternschaft sind getrennte Beziehungen. Unbenannte Karten können bei der Darstellung weggelassen oder einem benannten Kartenkontext zugeordnet werden. |
| Gegenstand ↔ Gebiet/Region (`i` ↔ `area,region`) | `item.quellen` verweist auf Aufgaben/Taten; deren `fk` liefert Kartenpfade. | `members_index()` leitet Item-Mitgliedschaft transitiv aus den Kartenpfaden der Quellen ab. | Zweifach abgeleitet; keine direkte Ortsposition des Gegenstands. Die Karte zeigt hier eine geerbte Quellenzuordnung. |
| Belohnung ↔ Gegenstand/Titel/Tugend (`q,d` → `i,title,virtue`) | Belohnungstupel `rw` mit Art, Name, Menge und – sofern geliefert – stabiler Ziel-ID. | Quest-/Tatseiten gruppieren feste und wählbare Gegenstände sowie Titel, Tugenden, Traits und Emotes. Gegenstandsseiten werden bei vorhandener ID verlinkt; Name-only-Auflösungen werden bei Mehrdeutigkeit nicht verlinkt. Titel/Tugend-Quellenseiten beruhen auf den eigenen Titel-/Tugendgeneratoren und sind nicht bei jedem Rewardtupel automatisch dieselbe Datenkante. | `rw` ist eine Belohnungsangabe, keine Garantie der Charakterverfügbarkeit. Ausgewählte Belohnungen und feste Belohnungen sind unterschiedlich gekennzeichnet; Beträge/Mengen werden nur ausgegeben, wenn Quelldaten sie tragen. |
| Gebiet ↔ Region / Untergebiet | Kartenquelle, Schlüssel `idx`, Elternfeld `eltern`, Einordnung über `tier`. | `area_view()` bildet Kinder aus dem Elternfeld; `map_kind()` unterscheidet Regionen und Gebiete. | Kartenbaumbeziehung aus Kartendaten. Eine Region sammelt ihre Inhalte in der Anzeige über ihre Kinder; das erzeugt nicht zwingend eine direkte `fk`-Kante jedes Kindes zur Region. |
| Landmarke ↔ Aufgabe/Tat (`l` ↔ `q,d`) | `daten/landmarken.json`: `targets`, ergänzt durch bekannte Katalog-IDs. | Landmarkendetail löst Ziele auf existierende Aufgaben oder Taten auf. | `targets` bezeichnet zugeordnete Spielziele aus dem Landmarken-Generator. Das ist nicht dasselbe wie ein Beweis, dass die Aufgabe genau an der Landmarkenposition abgeschlossen wird. |
| Fraktion ↔ Rufquelle (`f` ↔ `q,d,i`) | `daten/fraktionen.json`, lokalisierte `sources`; Herkunft aus Rufquellendaten. | Fraktionsseite gruppiert Quellen nach Typ und zeigt belegte Stufe/Stärke/Ort. `write_faction_index()` zählt Aufgaben/Taten und leitet Regionen/Gebiete aus deren `fk` ab. | Rufquelle ist eine explizite Datenzuordnung; räumliche Facetten des Fraktionsindex sind transitiv aus den Quellen. Nicht jede Quelle hat eine Katalogseite oder eine klickbare URL. |
| Titel/Tugend ↔ Quelle (`title,virtue` ↔ `q,d`) | Titel-/Tugenddatensatz enthält lokalisierte Quellenzeilen. | `honor_view()` baut Quellzeilen und verlinkt sie nur, wenn die Quell-ID im passenden Aufgaben-/Tatbestand vorhanden ist; sonst kann auf die Anwendungskarte verlinkt werden. | Quellenliste ist generatorseitige Zuordnung; Karte/Region-Zusätze sind Anzeigeinformationen, keine separate bestätigte Geokante. |
| Beruf ↔ Rezept (`p` ↔ `recipe`) | Berufskennung `row[9]` im Rezeptdatensatz; Rezeptbestand. | `profession_view()` gruppiert Rezepte je Beruf nach Stufe/Tier. In `language_data()` werden nur Berufe mit mindestens einem vorhandenen Rezept als Katalogart ausgegeben. | Eine gruppierte Listenbeziehung aus dem Rezeptfeld, keine eigene Beruf-zu-Gegenstand-Beziehung. |
| Händler ↔ Gegenstand (`vendor` ↔ `i`) | Vendor-Item-Export, umgekehrt nach Vendor gruppiert; ausschließlich Items, die im Website-Itembestand vorhanden sind. | Händlerdetails führen Waren; Itemdetail führt den Händlerlink. Vendorstandorte stammen aus Positionsdaten, Koordinaten werden über `GameMaps` einer Karte zugewiesen, soweit der Rahmen passt. | Der Standort kann auf Regionsebene bekannt sein, ohne präzise Karte/Pin. Ein Warenangebot beweist weder Preis noch Verfügbarkeit für einen Charakter. Händler und Tauschhändler sind im Typfeld unterscheidbar. |
| Instanz ↔ Finder-/Questkontext | Client-Finder-Auswahl und Private-Encounter-Templates; optionaler Questbezug über `PrivateEncounterTemplate_InstanceQuest`. | `tools/build_instanzen.py` schneidet auf die explizite Finder-Auswahl zu und übernimmt Stufe/Gruppe/Schwierigkeit aus dem Finderexport; Gebiet kann aus dem zugehörigen Quest-`fk` kommen. | Die auswählbare Finderliste ist die fachliche Grundmenge, nicht jede DAT-Vorlage. Questbezug und Geografie sind optionale Kontextangaben und bestimmen nicht die Schwierigkeits-/Stufenwerte. |
| Abenteuer ↔ Gebiet ↔ Aufgabe | Redaktionelle Inhaltsblockdefinition `referenz/inhaltspakete.json`, Karten-Elternbaum, Aufgaben-`fk`. | Kartenwurzeln und ausgeschlossene Teilbäume weisen jeder Karte höchstens einen Inhaltsblock zu. Eine nicht wiederholbare Aufgabe wird dem tiefsten zugewiesenen Karteneintrag zugeordnet; P10/P90-Stufenbereiche sind berechnet und ausdrücklich abgeleitet. | Kartenpaketzuordnung ist redaktionell gepflegt; Levelband des Pakets redaktionell, Gebietsbereich statistisch abgeleitet. Filterbedingungen schließen Wiederholungen, Sessions, Instanzen, Dailies und technische Einträge aus. |
| Beruf/Rezept/Gegenstand ↔ Vorkommen | Ressourcenklassifikation im Rezept-/Itembestand plus pro Karte erzeugte Vorkommensdaten. | `item_view()` verbindet Gegenstand mit Vorkommenart, Beruf, Stufe und belegten Sammelorten; die Handwerksseite gruppiert nach Beruf/Stufe und führt aus der Gebietsauswahl in die Karte. | Ressourcenpunkte bezeichnen mögliche Sammelarten an einem Ort, nicht den garantierten konkreten Gegenstand, Menge oder Respawn-Zeit. |

**Gemeinsame Datensatzfelder von Aufgaben und Taten:** `i` ID, `n` Name, `g` Auftraggebername, `gt` Auftraggeberort, `t` Ziele, `s` Schritte, `rw` Belohnungen, `v/vo/vl/vb` Voraussetzungen, `rf` Rufquelle, `fk` Karten-/Navigationspfad, `x` Sitzungsspiel und `e` ausschließende Alternativen. `h` (Gegnerorte) und `hz` (Orte verknüpfter Aufgaben) sind keine austauschbaren Ersatzwerte für eine bestätigte Zielposition. Die Kurzschlüssel sind Quellformat, nicht ein global typisiertes Schema. Beleg: `AGENTS.md` Datenquellen sowie Verwendung in `tools/php_viewmodel.py` und `tools/build_php_data.py`.

**Kardinalität und Richtung:** `pq`, `v`, `vo`, `e`, Belohnungen, Kartenpfade und Quellenlisten sind Mehrfachwerte; `nq` ist im Datensatz ein einzelner optionaler Verweis. Die Buildrelation `required_by` ist die Umkehrung von `v` (nicht von `vo`). Rezept ↔ Gegenstand ist fachlich vielfach-zu-vielfach und rollenbehaftet (normale/optionale Zutat, normales/kritisches Ergebnis); Mengen und Rollen gehören zur Kante. Set ↔ Item und Aufgabe/Tat ↔ Gebiet sind ebenfalls Mehrfachzuordnungen. Auftraggebername `g` allein ist dagegen ein Textfakt und keine stabile Auftraggeber-ID; `gt` ist ein Ortstext/-wert und nicht gleichbedeutend mit der Kartenposition. Die PHP-Viewmodels bewahren diese Unterschiede, wo die Quelle sie mitliefert.

### 5.6 Gespeicherte Relation, abgeleitete Kante und Darstellung unterscheiden

Für die Interpretation gilt folgende Trennung:

1. **Quellfakt:** Felder wie Quest-IDs in `pq`, `v`, `vo`, `e`; `fk`-Kartenpfade; Rezeptzutaten/-resultate; Setmitglieder; Landmarken-`targets`; Fraktions-`sources`. Der Website-Code erhält oder verarbeitet diese Quelldaten. Ein Quellfakt belegt zunächst genau die angegebene Zuordnung, nicht darüber hinausgehende Spielregeln.
2. **Build-abgeleitete Relation:** `build_relations()` bildet inverse Questvoraussetzungen (`required_by`) und löst IDs auf Namen auf. `members_index()` leitet Gebietsmitgliedschaft von Gegenständen über deren Quellen ab. Fraktions-/Titel-/Landmarkenfilterindizes leiten Regionen oder Trefferzahlen aus Quellen bzw. Zielen ab. Diese Werte sind reproduzierbare Ableitungen, keine unabhängigen Quelldatensätze.
3. **Navigations- oder Filterkontext:** Aufgaben/Taten mit gleichem Auftraggeber oder gerundetem Koordinatenpunkt sowie Taten derselben Art oder desselben Gebiets erscheinen als Zusammenhang. Gemeinsame `fk`-Pfadwerte steuern Listen und Filter. Diese Gruppierungen dienen Orientierung; sie sind keine Voraussetzung, direkte Questkette oder eindeutige Koordinate.
4. **Darstellungslink:** `php_viewmodel.py` und `RelatedLists.php` erzeugen aus Datensatz-IDs oder schon vorhandenen kanonischen URLs klickbare Links. Ein sichtbarer Link ist nicht immer ein eigenständiger Fremdschlüssel; er kann bei nicht auflösbarer ID fehlen oder bei eindeutigem Namen erst im Viewmodel entstehen.

PHP hält die langen Relationslisten nicht vollständig im Seitenmodell: Die Viewmodels speichern häufig nur IDs wie `related_quests`, `related_deeds`, `related_used_in` und `related_crafted_by`. `RelatedLists::forPage()` bestimmt daraus die Shardtypen, lädt nur angeforderte Zeilen und holt Aufgaben-/Taten-/Gegenstandstreffer aus `filter-q`, `filter-d`, `filter-i` oder Rezeptshards. Seitenlisten- und Detailmodelle sind dadurch getrennte Lesemodelle; JSON-Shards sind ein Auslieferungsformat, keine kanonische relationale Datenbank.

### 5.7 Datenmodellgrenzen und Schlüsselregeln

- **Keine Namensschlüssel als Ersatz für IDs:** Name ist Anzeige- und Suchtext. Itemnamen werden nur dann zu einer Item-URL, wenn `ViewBuilder.item_link()` genau einen passenden Gegenstand findet.
- **Keine implizite Vollständigkeit:** Eine nicht erzeugte Kante kann bedeuten, dass die Quelle sie nicht enthält, das Ziel im Website-Katalog fehlt oder der betreffende Builder diesen Beziehungstyp nicht ausgibt. Ein fehlender Link beweist nicht, dass die Beziehung im Spiel nicht existiert.
- **Keine Charakterrelationen im Katalogmodell:** Charakterstände aus Companion sind Browserdaten und werden nicht als Katalog-Fremdschlüssel in `phpdata` gespeichert.
- **Abgeschlossene Daten statt Laufzeit-Join:** Das PHP-Leseformat ist nach Sprache und Datentyp getrennt. Die Buildphase kann mehrere Gesamtbestände verbinden; eine einzelne Anfrage liest einzelne Datensatzshards und vorbereitete Indizes.
- **Indizes sind Projektionen:** `givers-index.json`, `vendors-index.json`, `landmarks-index.json`, `factions-index.json`, `titles-index.json`, `instances-index.json` und Seitenmodelle enthalten für Listen optimierte Teilmengen und aggregierte Werte. Sie ersetzen nicht jeweils den vollständigen Quelldatensatz.

Belege: `tools/build_php_data.py` (`build_relations`, `language_data`, `members_index`-Aufruf, Shard-/Indexschreiber), `tools/php_viewmodel.py`, `tools/related_filter_data.py`, `php/src/Data.php`, `php/src/RelatedLists.php`. Das bestehende Entitätenmanifest `docs/datenraum/lotro-datenraum-entitaeten.json` ist ein Abgleichsartefakt für Listen, Filter und UI-Verträge; es beschreibt nicht allein alle Quelldaten oder sämtliche Kanten.

### 5.8 Weitere Datenmodelle der Browseranwendungen

Nicht jede Websitefunktion ist eine Entitätskante im PHP-Katalog. Folgende Datenräume werden getrennt geführt und dürfen nicht in das Kernmodell hineingedeutet werden:

| Datenraum | Identität und Beziehungen | Grenze |
|---|---|---|
| Kartenmetadaten | Karten-ID, Elternkarte, Region/Tier, Koordinatenrahmen, Bild | Karten-ID und Kartenposition sind nicht automatisch Questziel oder Landmarke |
| Kartenstart-/Kurz-/Detaildaten | kompakte Metadaten für Erstansicht; Aufgaben-/Taten-IDs pro Gebiet; Vollrecord bei Auswahl | UI-Ladeebenen derselben Katalogdaten, keine zusätzlichen Fachentitäten |
| Reise | Stallmeister-/Reiseknoten, gerichtete oder typisierte Routen und Reisefertigkeiten in exportierten Reisedaten | Route und Reisefertigkeit belegen nicht, dass ein bestimmter Charakter die Verbindung freigeschaltet hat; keine erfundene Weglinie oder Reisezeit |
| Vorkommen | Sammelart, Gebiet/Karte und Vorkommenspunkt-/Zählwerte | Der Punkt ist eine mögliche Ressource, kein einzelner sicher dort liegender Gegenstand |
| Kartennotizen | Note-/Objektcode, Name, Karten-ID und Position | Darstellungs-Layer; nicht automatisch ein Katalogeintrag oder eine Aufgabe |
| Geländekacheln | Clientversion im Manifest, Kachelkoordinate und Bild | Rasterdarstellung mit Coverage; keine eigenständige Spielkarten-/Questentität |
| Charakterfortschritt | lokaler Charakterdatensatz, importierte Quest-/Tat-/Ruf-/Handwerkszustände | Browserzustand; keine Server- oder PHP-Katalogbeziehung |

Belege: `tools/build_karten_kurz.py`, `build_reise.py`, `build_vorkommen.py`, `build_notizen.py`, `tools/build_gelaende.py`, `web/speicher.js`, `web/companion.js`.

### 5.9 Konkrete Darstellungs- und Filtermatrix nach Entität und Auftrittsort

Diese Matrix beschreibt den **gegenwärtigen Code**, nicht einen Sollzustand. „Listenzeile“ meint die sichtbare Ergebniseinheit; Felder, die ausdrücklich nur als Suche/Filter oder Zähler dienen, sind keine Zeilenfelder. Die gemeinsame Schwelle für relationale Detail-Listen beträgt fünf: bis einschließlich fünf bleibt die serverseitige Liste sichtbar, ab sechs wird – soweit für die Relation implementiert – ein Filter montiert. Welche Komponente greift, hängt aber vom Relationstyp ab.

#### Öffentliche Indizes und Anwendungsbrowser

| Entität | Auftrittsort und konkrete Zeile | Suche/Filter | Sortierung, Umfang und Link/Fallback |
|---|---|---|---|
| **Aufgabe (`q`)** | `/de/aufgabe/` usw.: generische alphabetische Katalogliste aus `entity/list.twig`, Linktext Name, optional Symbol; seitenseitig paginiert. Aufgabenfinder: Symbol, Name, Stufe, Region/Gebiet und Status; Trefferlink zur kanonischen Aufgabenseite. Karte: Aufgabenzeile mit Name, Stufe/Einordnung und Statussteuerung; Detailwerte erst nach Auswahl. | Öffentlicher Aufgabenfinder: Textsuche über Name, ID, Auftraggeber und Gebiet; Thema, Klasse, Herkunft, Region/Gebiet, Merkmale, Stufenbereich und – nur bei importiertem Statusbeleg – Fortschritt. In eingebetteten Aufgaben-Relationslisten werden die vorhandenen Aufgabenzeilen gefiltert; dort sind je Relation nur tatsächlich vorhandene Gruppen auswählbar. | Finder alphabetisch oder Stufe aufsteigend, Name/ID als stabiler Gleichstand; 30 zunächst, „Weitere anzeigen“. Deed-/Aufgaben-Index hat 200 je Seite als Serverliste. Einträge ohne Ortsangabe bleiben auffindbar; keine Karte/kein Pin wird aus dem Namen abgeleitet. |
| **Tat (`d`)** | `/de/tat/`: alphabetische Serverliste bleibt im HTML verborgen, sichtbar ist ab erster Darstellung der Filterindex; Filtertreffer zeigen Symbol, Name, Tatart, Stufe, Gebiet und importierten Status. Karte: Tatzeile im Tatenmodus. Detailseiten zeigen Art-Chips, Beschreibung, Karte/Ort, Fakten und feste/wählbare Belohnungen. | Tatenindex: Art, Belohnungsarten (Punkte/Tugend/Titel/Gegenstand, soweit im Bestand), Region/Gebiet, Stufenbereich und Merkmale, plus Suche. Detail-„Zusammenhang“ nutzt die Taten-Filterkonfiguration und ihren festen Elternkontext. | Index: Name, danach ID; 50 zunächst, dann „Weitere anzeigen“ im clientseitigen Index; crawlbare Serverliste 200 je Seite. Keine Detailseite für nicht vorhandene/ersetzte ID; alte Dubletten-ID wird kanonisch weitergeleitet. |
| **Gegenstand (`i`)** | Gegenstandssuche: Symbol, Name, Kategorie, Seltenheit, Art/Platz/Klasse/Gattung und positiver Gegenstandsstufenwert; ganze Zeile verlinkt auf Itemdetail. Katalogindex `/de/gegenstand/`: schlichte alphabetische Namensliste mit optionalem Symbol und Verweis zur Suche. Belohnungsbrowser: Gegenstandsname, Belohnungsart, Stufe. Set-/Händler-/Rezept-/Questdetails zeigen Gegenstand nur in der passenden Relation. | Gegenstandssuche: Text, Client-Kategoriebaum mit je nach Kategorie passenden Unterzweigen, Seltenheit und Stufenbereich. Mehrere Baumzweige sind Oder; Facetten werden ohne eigene Filtergruppe gezählt, gewählte und vorhandene Werte bleiben sichtbar. Keine Charakterfilter. URL speichert Suche, Zweige, Seltenheit, Stufe und Sortierung. | Gegenstandssuche: Name oder Gegenstandsstufe, danach Name/ID; 50 Treffer und „Weitere anzeigen“. Ohne Itembild wird der Symbolplatz ausgeblendet, nicht durch ein fremdes Bild ersetzt. Der Katalogindex ist eine eigene, einfache Linkliste und hat nicht dieselben Facetten wie die Suche. |
| **Rezept (`recipe`)** | Handwerk → Rezepte: Tabelle der Rezeptzeilen; Name führt zur Rezeptdetailseite, Lernstand wird als Status dargestellt, Zutaten nicht in der Trefferzeile. Berufsdetail: Rezepte in Stufenabschnitten, alphabetische Namenslinks. Itemdetail: getrennte Listen „Wofür“ (Item als Zutat) und „Herstellung“ (Rezept erzeugt Item); Zeile zeigt Rezeptname plus Beruf/Stufe, Resultatrolle falls vorhanden. | Handwerk: Beruf, Stufe/Tier, Kategorie, Lernstand; „eigene Berufe“ nur mit Charakterdaten. Textsuche kann Rezeptname, ID und Zutatenname treffen. Filterstatus erlaubt „gelernt“ nur mit positiver Importinformation und „nicht gelernt“ nur bei vollständigem Rezeptdatensatz. Kontextliste „Wofür“ hat bei mehr als fünf Einträgen Suche und Rollenwahl (normale/optionale Zutat); „Herstellung“ nutzt Rezeptfilter, aber separat. | Handwerk: Name, Tier oder Gegenstandsstufe; 50 und weitere Treffer. Berufsdetail gruppiert nach Tier/Stufe. Fehlender Rezeptstatus bleibt unbekannt, nicht „ungelernt“. Zutaten, Mengen, optionale Zutaten und Erfolgsresultate stehen auf Rezeptdetail; unaufgelöste Items bleiben Text statt falschem Link. |
| **Beruf (`p`)** | Nur Handwerk-Reiter „Berufe“ als öffentlicher Browser; Beruf ist keine normale Detailentität. Treffer zeigen Berufsname und – soweit Charakterimport vorhanden – Tier sowie belegten Fortschritt/XP je Tier. Rezeptdetail verlinkt den Beruf zurück in die Handwerksliste. | Handwerk → Berufe: Berufssuche und Mehrfachauswahl Beruf; mit Charakter eigener Berufestand, ansonsten kein persönlicher Fortschrittfilter. | Alphabetisch, 50 und weitere Treffer; keine eigenständige Beruf-Detailseite. Nicht vorhandene Fortschrittswerte werden weggelassen. Eine alte Berufsadresse führt zur Handwerksanwendung. |
| **Set (`set`)** | Setbrowser: Setname und kompakte Meta aus belegten Klassen-/Rüstungsarten; öffnet Setdetail. Setdetail: Setteile als Karten mit Symbol, Name, Item-Chips und ggf. Klassen-/Werteangaben; darunter Setboni mit Schwelle/Wirkung. | Suche über Set- und Mitgliedsnamen; Klasse, Ausrüstungsart, Rüstungsart, benötigte Charakterstufe von/bis. Alle aktiven Itemfilter müssen vom **selben verfügbaren Setteil** erfüllt werden. | Name, dann ID; 30 je Seite. Facetten zählen nach den übrigen Bedingungen, gewählter Wert bleibt sichtbar. Mitglieder ohne Itemseite werden je identischem Namen zu einer gezählten, nicht verlinkten Zeile zusammengeführt; fehlende Werte/Boni werden nicht erfunden. |
| **Auftraggeber (`giver`)** | Browser: Name und Meta aus bis zu drei Gebieten/Regionen, Art sowie Aufgabenanzahl; klickbare Treffer führen zu Detail. Detail: Name, Art/Titel, vorhandene Beschreibung, eingeklappte Begrüßung, Standortkarten/Koordinaten und Aufgabenliste mit Fortschritt. | Suche, Region→Landschaft-Baum, Auftraggeberart, Aufgabenstufenbereich und Merkmale. Ab sechs Aufgaben zusätzlich Fortschritt/Erledigte-ausblenden; Level und Merkmal müssen zur selben Aufgabe passen. | Name/ID oder Stufe aufsteigend, Name bei Gleichstand; 30 je Seite. Aufgabenliste verlinkt nur existierende Katalog-IDs; fehlende Beschreibung/Begrüßung/Standorte entfallen. Neutrales Symbol statt NPC-Porträt. |
| **Händler (`vendor`)** | Browser: Name und Meta aus Standortnamen plus Warenanzahl; Treffer zur Händlerdetailseite. Detail: Name/Titel/Typ, alle belegten Plätze mit Karte/Pin/Koordinaten/Ortskette, danach Warenangebot mit Itemlink, wo verfügbar. | Browser: Suche, Region→Landschaft-Baum, Typ (normal/Tausch/both), außerdem belegter Gegenstandsstufenbereich, soweit in der Listenimplementierung angeboten. In Itemdetails werden Händlerangebote bei mehr als fünf mit der Händler-Relationskomponente (Suche, Ort, Typ) gefiltert. Tauschquellen sind eine getrennte, nicht mit Händler-IDs vermischte Gruppe. | Browser: Name, dann ID; 30 je Seite. Relationseinträge ohne kanonische Händler-URL werden nicht als Händlerlink ausgegeben. Standort ohne passenden Kartenrahmen bleibt textlich/auf Regionsebene statt erfundenem Pin; Angebot belegt keinen Preis. |
| **Titel (`title`)** | Titelbrowser: Titelname, Herkunftsart (Aufgabe/Tat) und Quellenzahl; Titeldetail: Quellenliste mit klickbarem Aufgabennamen/Tatnamen, wenn eine URL existiert, optionalem Zusatztext. | Browser: Suche, Herkunft (Aufgabe/Tat), Tatart, Region und Landschaft. Orte sind aus den Quellaufgaben/-taten abgeleitet, nicht Titelpositionen. | Name, dann ID; 30 je Seite. Quellen ohne Katalogziel bleiben Text oder erhalten den vorgesehenen Kartenlink, soweit vorhanden; Herkunft ohne Quellen ist nicht als „keine Herkunft“ erfunden. |
| **Tugend (`virtue`)** | Keine eigenständige öffentliche Filterliste im aktuellen PHP-Browser. Tugenddetail zeigt Tugendname und Quellen; Tugenden können außerdem als Belohnung in Aufgaben-/Tatdetails und in Belohnungsdaten auftauchen. | Detailquellen können über gemeinsame Aufgaben-/Tatenfilter erweitert werden; kein eigener Tugendfacettenbrowser. Belohnungsbrowser filtert ausschließlich Gegenstände. | Verlinkung nur, wenn Quell-ID auflösbar ist; sonst bleibt Quellenbezeichnung ohne falschen Kataloglink. |
| **Fraktion (`f`)** | Fraktionsbrowser: Fraktionsname und bis zu drei aus Rufquellen abgeleitete Ortsnamen. Detail: Beschreibungstexte, Rangfolge/Stufen und Rufquellengruppen „Aufgaben“/„Taten“; Charakterruf wird nicht in den Katalog geschrieben. | Browser: Suche, Region→Landschaft und boolesches „mit Rufquellen“. | Name, dann ID; 30 je Seite. Quellen ohne Seitenziel sind nicht verlinkt; fehlende Rufquelle bleibt leer bzw. wird im Detail als eigener Quellstatus dargestellt, keine Region aus dem Fraktionsnamen geraten. |
| **Landmarke (`l`)** | Browser: Landmarkenname, Gebiet und Zahl belegter Aufgaben; Detail: falls Position/Karte existiert Bild mit Pin, Koordinaten/Karten-/Regionslink und „Auf der Karte öffnen“, anschließend Aufgabenliste. | Browser: Suche, Region→Landschaft und „mit Aufgaben“. | Name, dann ID; 30 je Seite. Ohne Position keine Ortsgrafik/Pin; ohne Landschaft gesonderter „Ohne Landschaft“-Zweig. Zielaufgaben werden nur verlinkt, wenn sie im Aufgabenbestand existieren. |
| **Gebiet (`area`)** | Gebietsdetail: Name, Karte, Link zur Kartenanwendung, Elternregion, direkte Untergebiete und Inhaltsreiter mit Zähler für Aufgaben, Taten und Gegenstände. Zeile im Regions-/Abenteuerkontext zeigt Gebietsname, ggf. Region/Fortschritt. | Detailinhalt: gleiche Filteradapter wie jeweilige Entität (Aufgabe/Tat/Gegenstand), aber auf unveränderliche Gebietsmitgliedschaft begrenzt. Fortschritt nur bei importiertem Charakter. | Alphabetisch in Untergebieten; Relationstab folgt fester Reihenfolge Aufgabe → Tat → Gegenstand. Bis 5 direkte Links, ab 6 Filter mit Suche/Facetten/Sortierung/Seitenlimit je Entität. Fehlen Karte oder Mitglieder, wird kein Platzhalterdatensatz erzeugt. |
| **Region (`region`)** | Regionsdetail: Name/Karte, Untergebiete und dieselben Inhaltsgruppen über deren aggregierte Mitglieder; Regions-/Abenteueransichten zeigen Name, Kartenpunkt bzw. Fortschrittsring/Stufenpassung nur bei belegter Position und Charaktergrundlage. | Inhaltsfilter entspricht Aufgabe/Tat/Gegenstand; Elternregion ist fester Kontext. Abenteuergebietsauswahl folgt eigenen Zugang-/Stufen-/Fortschrittsregeln, nicht dem PHP-Detailfilter. | Alphabetisch sortierte Untergebiete, Mitglieder innerhalb der Relation nach dem passenden Adapter. Ohne Import bleibt persönlicher Fortschritt leer/neutral; fehlende Kartenverknüpfung erzeugt keinen geschätzten Punkt. |
| **Instanz (Finder-Eintrag, keine Katalog-Detailentität)** | Instanzbrowser zeigt Name, Cluster/Gruppe und belegte Metadaten; öffnende Aufgabe wird nicht automatisch als Link vorausgesetzt. Keine Instanzdetailseite. | Suche, Cluster, Art, überlappender Stufenbereich, Gruppengröße und Schwierigkeit/Tier. | Cluster, Gruppe, Name, ID; 200 je Seite. Stufenfilter schließt Einträge ohne Stufenbereich aus. Es wird nur die explizite Spielauswahl aufgenommen; persönliche Freischaltung/Verfügbarkeit wird nicht behauptet. |

#### Relationslisten auf Detailseiten: konkrete Komponenten und Ausnahmen

| Besitzerseite | Relation/Auftritt | Bis 5 Einträge | Ab 6 Einträge | Zeile und fehlende Auflösung |
|---|---|---|---|---|
| Aufgabe | „Wird vorausgesetzt von“ sowie aus Quell-URLs erkannte Aufgaben/Taten/Items | direkte Links als no-JS-Ausgabe | Aufgaben-/Tatenadapter mit Suche, Art/Merkmalen, Geografie, Stufen-/Statusfilter soweit in den Zeilen vorhanden; Elementtyp bestimmt Tab | Aufgaben/Taten: Symbol, Name, Typ/Stufe, Region/Gebiet, Status; nur vorhandene IDs. Belohnungen selbst sind eine direkte Rewarddarstellung, keine Relationsfilterliste. |
| Tat | „Zusammenhang“ (Nachbarn nach Quell-/Gebietskontext) | direkte Links | Aufgaben-/Tatenadapter des jeweiligen Typs; Kontext bleibt beim Reset erhalten | Name plus passende Typ-/Orts-/Stufen-/Fortschrittsmetadaten. Nicht vorhandene Zielseiten nicht als URL konstruieren. |
| Gegenstand | „Woher“ Aufgaben/Taten | direkte Quellenlinks | eigener Aufgaben-/Tat-Finder für große Gruppen; Filterkontext ist das Item und bleibt beim Reset | Eintrag kann Quellenart/Zusatz tragen; kein Filter auf einen nicht belegten Ort. |
| Gegenstand | „Wofür“ (Rezept als Zutat) | direkte Rezeptlinks inkl. belegter Rollen-/Mengenangabe | **kein** gemeinsamer Filter-UI-Mount: lokaler Suchtext plus Rollenwahl normal/optional | Rezeptname verlinkt zum Rezept; Rolle/Menge kann in dieser Relation stehen. |
| Gegenstand | „Herstellung“ (Rezept erzeugt Item) | direkte Rezeptlinks | separater gemeinsamer Rezeptfilter, getrennt von „Wofür“ | Rezeptzeile nach Beruf/Stufe; normale/kritische Ergebnisrolle bleibt unterschieden. |
| Gegenstand | Händler/Tauschquellen | direkte Zeilen | Händler: gemeinsame Vendor-Komponente mit Suche/Ort/Typ; Tausch: eigene Gruppe ohne Ortsfacetten | Händlerlink nur bei existierender ID. Tauschzeile kann unlinked bleiben und Titel/Gebiet als Textzusatz zeigen. |
| Gegenstand | weitere Quellen | direkte Anzeige gemäß Quellenmodell | gruppenspezifisch; ein einfacher Suchfilter, sofern Template `group.filter` trägt | Itemtemplate rendert Quellen-/Rollen-/Mengenangaben. Das ist nicht für jede Gruppe dieselbe Komponente. |
| Rezept | Zutaten und optionale Zutaten | immer direkte Zutatenlisten, keine 5/6-Umschaltung | unverändert direkte Liste; automatische Herkunftsbedienung nur, wenn Itemseite eine belegte Herkunftsantwort hat | Menge, Symbol, optionaler Anteil/Chance; Itemlink nur bei aufgelöster Itemseite, andernfalls Text. |
| Rezept | Kontext-/Rückrelationen | direkte Zeile | bei Relationstyp `recipe` gemeinsame Rezeptkomponente, falls als Related-List-Modell geliefert | Keine Vermischung normaler und kritischer Ergebniskante; fehlendes Itemziel bleibt unlinked. |
| Set | Setteile und Setboni | immer Setkarten/Bonusabschnitte, keine Filterumschaltung | unverändert; fehlende Teile nach Name gruppiert, ohne Itemlink | Ein Teil zeigt Symbol/Name, vorhandene Itemchips/Werte/Klasse und ggf. Anzahl; Bonus nur aus vorhandener Definition. |
| Auftraggeber | Aufgaben dieses Auftraggebers | direkte Aufgabenliste | Aufgabenadapter mit Fortschritt; zusätzliche Anzeige „erledigte ausblenden“ im Giver-Skript | Aufgabenname plus Status; nicht verfügbare IDs ausgelassen. Mehrere Auftraggeberzuordnungen bleiben im Datenmodell, Questdetail kann einen ausgewählten Link zeigen. |
| Händler | Warenangebot | direkte Itemlinks/Textsätze | Itemadapter nur, wenn der Gruppenhost und Filterindex vorhanden sind; sonst Template-Direktliste | Itemname, im passenden Kontext Händler/Standort; nicht auflösbares Item wird nicht als erfundener Itemlink ausgegeben. |
| Titel/Tugend | Quellenliste | direkte Quellenzeilen | gemeinsamer Aufgaben-/Tatenfilter, sobald Relationsmodell die IDs liefert | Quellenname und optionaler Zusatz; Link nur mit gültiger Aufgaben-/Tat-/Kartenadresse. Das Template zeigt fehlende URL ausdrücklich als unlinked Text. |
| Fraktion | Rufquellen | gruppierte Aufgaben-/Tatenlisten | Aufgaben-/Tatenadapter je Quelltyp; Quelltyp bleibt getrennt | Stufe/Stärke/Ort als Quellfakt in der Detaildarstellung, nicht als Fortschrittsbehauptung des Besuchers. |
| Landmarke | Aufgaben am Ort | direkte Aufgabenlinks | Aufgabenadapter | Nur Landmarken-`targets`, die auf existierende Aufgaben auflösen; kein Ziel bedeutet keine Aufgabenliste. |
| Gebiet/Region | Aufgaben, Taten, Gegenstände | direkte Links bis 5 je Tab | pro Typ separater Adapter und Tab; fester Gebiets-/Regionskontext kann nicht abgewählt werden | Reihenfolge q → d → i. Name/Typ-/Stufe/Status/Ort nach Zeilenadapter. Leere Typen werden nicht als Fake-Zeilen dargestellt. |

**Wichtiger Abgleich zum JSON-Entitätenvertrag:** Die global formulierte Schwelle gilt für Relationslisten, während einzelne Listen ausdrücklich `direct` (z. B. Rezeptzutaten und Setteile) oder `component` sind. Die explizit `direct` markierten Listen sind daher nicht allein wegen ihrer Länge eine Abweichung. Bestätigte Differenzen sind derzeit: Item-Aufgaben-/Tatquellen werden im Template ab 6 als Filtercontainer angelegt, aber `item-task-filter.js` mountet den Filter erst ab 11; und die Itemliste „Wofür“ verwendet ab 6 einen lokalen Such-/Rollenfilter statt der gemeinsamen Rezeptlistenkomponente mit deren Sortier-/Paginationverhalten. Weitere Feldabweichungen und nicht oberflächenspezifische Vertragsangaben sind als offene Prüfpunkte in `docs/todos/entitaetenvertrag-abgleich.md` gesammelt. Vertrag, Implementierung und Tests müssen dieselbe Oberflächenregel sichern.

#### Gemeinsames Verhalten der Filteroberfläche

- Gemeinsame Browserfilter lesen den Zustand aus URL-Parametern; wenn keine explizite Auswahl vorhanden ist, kann der gespeicherte Zustand `mql.filter.<bereich>.<sprache>` greifen. Die URL gewinnt vor Gedächtnis. Reset entfernt den Bereichszustand. Relationfilter schreiben typpräfixierte Parameter (`q.*`, `d.*`, `recipe.*` usw.), damit Tabs und Elternpfad unabhängig bleiben.
- Multi-Checkboxen innerhalb einer Gruppe sind im Allgemeinen Oder; verschiedene Filtergruppen wirken als Und. Region/Gebiet-Bäume erlauben nur gültige Pfade; eine ausgewählte Landschaft schränkt auf diese Landschaft innerhalb der Region ein. Die Facetten zählen Kandidaten unter den jeweils anderen aktuellen Bedingungen, und aktive/gezählte Optionen bleiben sichtbar.
- Browserfilter sortieren lokal, filtern vor dem Seitenfenster und deduplizieren nach stabiler ID. Clientlisten nutzen „Weitere anzeigen“ und sortieren wahlweise Name/Stufe; PHP-Fachbrowser liefern GET-Formular und nummerierte Seiten. Das sind zwei unterschiedliche Paginationsmodelle, nicht ein gemeinsames Seitenlimit.
- Die gemeinsame Filteroberfläche ersetzt ihr GET-Fallback erst nach erfolgreichem Laden; bei Fehler bleibt „Als Seite öffnen“/Fallback sichtbar. Mobile Filter werden als Dialog geöffnet; Desktop zeigt Filterspalte neben Treffern. Filter-Chips zeigen auch den nicht entfernbaren Standardwert einer Einfachauswahl als Zustandschip.
- Fortschrittsfilter und Statusfarben existieren nur bei Entitäten mit importierbarem Status und belegter Importgrundlage. Ein fehlender Status wird nicht als erledigt, offen, verfügbar oder 0 % interpretiert.

Belege für diese Ist-Matrix: `docs/datenraum/lotro-datenraum-entitaeten.json`, `php/templates/entity/`, `php/templates/{sets,givers,vendors,landmarks,titles,factions,instances}/`, `php/src/{RelatedLists,FilterRegeln,Sets,Givers,Vendors,Landmarks,Titles,Factions,Instances}.php`, `web/{entitaeten-listen,filter-ui,filteradapter,filterzustand,filtergedaechtnis,aufgaben-filter,gegenstaende-filter,handwerk-filter}.js`, `tests/test_entitaeten_vertrag.py`, `tests/browser_related_lists.js`.

## 6. Laufzeitsicht

### 6.1 Aufruf einer Detailseite

1. Der Webserver leitet die öffentliche Adresse an `php/public/index.php`.
2. Der Front-Controller bestimmt Sprache und Pfad und ruft `Router::resolve()` auf.
3. Der Router liefert eine kanonische Seite, eine Weiterleitung oder 404.
4. Bei einer Entitätsseite liest `Page` das vorbereitete Seitenmodell und bei Bedarf die benötigten Relationsdaten.
5. Twig rendert die Seite mit gemeinsamer Hülle und lokalisierter Navigation.

Eine fehlende Entitätskennung wird nicht automatisch als „annehmbar“ oder „offen“ interpretiert; der Router prüft vorbereitete Daten und antwortet bei unbekannten Einträgen mit 404.

### 6.2 Übersicht, Filter und Detail-Relationen

```text
Browser → HTTP-Pfad → Router
                    ├─ App-Pfad → Page::renderApp() → App-View/Twig → HTML + JS/CSS
                    ├─ Entitäts-Pfad → Data::page(lang, type, ID)
                    │                  → RelatedLists (nur referenzierte IDs/Shards)
                    │                  → Entitäts-Twig → HTML + Relationsdaten
                    ├─ Listen-Pfad → Data::listPage(kanonischer Pfad)
                    │                → Listen-Twig → HTML + optionaler Filterindex
                    ├─ Sitemap-Pfad → Sitemap (aus sitemaps.json) → XML
                    └─ unbekannt → 404 mit echtem HTTP-Status
```

Die Listenformen werden nicht allein aus einem URL-Muster als gültig angenommen. `Router::listPage()` fragt das vorbereitete Listenmodell ab; unbekannte Kategorien/Seiten bleiben 404. Für eine relationale Detailseite speichert das Seitenmodell meist IDs, während `RelatedLists::forPage()` die passenden Datensätze aus typisierten Shards nachlädt. Bei Aufgaben und Taten wird dieselbe kompakte Zeilenform wie in der öffentlichen Filterliste verwendet. Die UI blendet bei bis zu fünf Elementen die direkte Liste ein, ab sechs die Filterkomponente (`FilterRegeln::MAX_DIREKTLISTE`); der Beziehungskontext bleibt beim Zurücksetzen erhalten.

### 6.3 Anwendung und Sprachpfade

Anwendungsseiten werden in `Catalogue::APP` je Sprache aufgelistet. Alte flache `.html`-Einstiege werden im Front-Controller auf die Sprachpfade überführt. Die Sprache aus einem expliziten Pfad hat Vorrang; Adressen ohne Sprache werden über Sprachwahl/Cookie und `Accept-Language` aufgelöst.

Die technische Priorität bei sprachlosen Adressen ist konkreter: gültiger `llb_sprache`-Cookie, sonst erste unterstützte Sprache aus `Accept-Language` nach Qualitätswert, sonst Englisch. `de-AT`/`de_AT` werden als Deutsch erkannt; andere nicht unterstützte Sprachen fallen auf Englisch zurück. Ein Sprachpräfix im Pfad umgeht diese Erkennung.

### 6.4 Companion-Import

Der Browser liest die ausgewählten Companion-Dateien mit JavaScript und verarbeitet Quest-, Tat-, Ruf-, Handwerks- und Charakterdaten. Die Charakterliste und der aktive Charakter werden im Browser gespeichert; UI-Komponenten lesen den aktiven Spielstand für Fortschrittsdarstellung. Ein Export kann lokal als Sicherungsdatei beziehungsweise über die vorgesehene Plugin-Exportfunktion erfolgen. Der PHP-Katalog benötigt für normale Seitenanfragen keinen hochgeladenen Charakterstand.

### 6.5 Statistik-Endpunkt

`/api/statistik` nimmt JSON-Aktionen entgegen, startet dafür eine Session mit `HttpOnly`-/`SameSite=Lax`-Cookie und ruft `Statistics` auf. Der Zustand liegt in einer JSON-Datei mit exklusiver Dateisperre. Die Datei enthält aggregierte Importzahlen sowie kurzlebige Präsenz- und Idempotenzschlüssel.

Konkret akzeptiert der Endpunkt `heartbeat`, `import` oder als Standardabfrage `current`; Heartbeat-IDs stammen aus der PHP-Session, Importereignisse werden 24 Stunden gegen Doppelzählung dedupliziert. Präsenz läuft nach 1.080 Sekunden ab. Die Dateioperation verwendet `flock(LOCK_EX)`; bei nicht möglichem Dateizugriff liefert die Klasse einen Fallback (`active: 0`, Importbasis 150). Der Client meldet Ereigniszähler und aktive Präsenz, nicht den Charakterspielstand. Das ist eine Aussage über diese Statistikklasse, keine vollständige Bewertung externer Tracker.

Belege für Abschnitt 6: `php/public/index.php`, `php/src/Router.php`, `php/src/Page.php`, `php/src/RelatedLists.php`, `php/src/FilterRegeln.php`, `php/src/Sprache.php`, `php/src/Statistics.php`, `web/companion.js`, `web/speicher.js`, `web/statistik.js`.

### 6.6 Kartenanwendung: abgestufter Datenabruf

1. Der Seitentemplate-Loader liefert zunächst Kartenstruktur, Landschaftsnavigation sowie kompakte Zähl-/Stufenmetadaten aus den `karten-start-*`-Dateien.
2. Beim Öffnen eines Landschafts-/Gebietskontexts lädt die Anwendung die entsprechenden Kartenzeilen aus dem passenden Aufgaben- oder Taten-Shard unter `karten-daten/`.
3. Bei Auswahl eines konkreten Eintrags wird dessen ausführlicher Datensatz aus dem Sprachkatalog (`daten-<sprache>.js` bzw. `daten-taten-<sprache>.js`) hinzugemischt.
4. Kartenziele, Auftraggeber und Fortschrittsfarben werden aus dem Datensatz und dem lokal importierten Charakterzustand zusammengesetzt.

So muss die Kartenseite nicht zu Beginn alle Beschreibungen und Belohnungen aller Katalogeinträge übertragen. Die lokale Auslieferung/Cacheversion für CSS, JS und Karten-Shards wird beim Release über `stand.js` synchronisiert. Belege: `tools/build_karten_kurz.py`, `tools/build_release.py`, `web/app.js`, `tests/test_kartenstart.py`.

## 7. Verteilungssicht

### Release-Artefakt

Der PHP-Release wird mit `tools/build_release.py` zusammengestellt. Zielpfade sind per Standard `~/.cache/llb-release`, Daten per `~/.cache/llb-php/phpdata` und Gelände per `~/.cache/llb-terrain/public`; alle sind überschreibbar. Der Builder löscht das angegebene Zielverzeichnis, wenn es bereits existiert, und legt es neu an. Deshalb darf nur ein eigens dafür vorgesehener Buildordner als Ziel dienen.

Der Builder erzeugt kompakte Kartenstartdaten, kopiert Browserdateien (ohne alte App-HTML-Einstiege und ohne privaten Fortschritt), stellt ein leeres `fortschritt.js` bereit, baut Tracking-/SEO-Artefakte, kopiert lokalisierte WebP-Karten mit Vorschaubildern, nimmt optional das Gelände-Manifest samt passender Version auf und kopiert PHP-App, Twig-Abhängigkeit und vorbereitete PHP-Daten. Danach berechnet er einen inhaltsbasierten Stand für CSS/JS einschließlich Karten-Shards, prüft Pflichtpfade und Manifest und schreibt das Release-Manifest. Das `.htaccess`-Rewrite wird bewusst separat behandelt.

### Laufzeit

`deploy/index.php` setzt den Release-Webroot und `LLB_PRODUCTION=1` und lädt danach `php/public/index.php`. Der Front-Controller bezieht Daten-, Cache- und Webpfade aus Umgebungsvariablen oder den Release-Standardpfaden. In Produktion ist Twig-Auto-Reload deaktiviert; eine Vorlagenänderung benötigt daher das Leeren des Twig-Caches (`tools/cache_leeren.py`).

### Upload

`upload.py` unterstützt Manifest-/Komponenten-Uploads. `tools/release_components.py` klassifiziert Dateien als `programm`, `daten` oder `assets`, lehnt unbekannte Pfade, Symlinks und erkannte private Dateien ab und schreibt Dateigröße plus SHA-256 in das Manifest. Die Komponentenversionswerte basieren auf einer kanonischen Zusammenfassung der jeweiligen Dateipfade, Größen und Hashes. Beim Upload kann die Komponente einzeln gewählt werden; Servermanifest, Adoption/Migration und verwaiste Dateien sind eigene explizite Betriebsaktionen. Die `.htaccess` wird getrennt behandelt. Upload-Zugangsdaten und lokaler Uploadstand liegen außerhalb des Repositories.

Ein Release-Build allein schaltet die Website nicht um und lädt nichts hoch. Für Produktion sind mindestens Releasebau, erfolgreicher Manifest-/Dateiupload und – je nach Änderung – Cacheleeren beziehungsweise eine separate Rewrite-Umschaltung erforderlich. Der Code enthält hierfür `tools/umschalten.py`, `tools/cache_leeren.py` und `tools/veroeffentlichen.py`; die einzelnen Betriebsaktionen bleiben ausdrücklich außerhalb dieses Dokumentationsauftrags.

### Lokale Vorschau

`php/public/router.php` ist der Router für den PHP-Entwicklungsserver. Er stellt lokale Web-/Kartenressourcen bereit und leitet Anwendungsanfragen an den PHP-Front-Controller. Ein Terrain-Build kann aus dem lokalen Cache kommen.

### Zweiter Builder im Repository

`baue_website.py` ist ebenfalls vorhanden und erzeugt einen statischen Website-Build. Der PHP-Releasepfad ist davon getrennt und wird durch `tools/build_release.py` definiert. Ob und wann der statische Builder noch für einen aktiven Ablauf verwendet wird, ist aus seiner bloßen Existenz nicht ableitbar.

### Ausführungsumgebungen und writable state

- **Lokal:** `php/public/router.php` leitet vorhandene Dateien direkt aus dem Web-/Terrainbestand aus und Anwendungsanfragen zum Front-Controller. PHP-Daten, Twig-Abhängigkeit und Cache können über `LLB_DATA`, `LLB_VENDOR`, `LLB_CACHE`, `LLB_WEB` und `LLB_TERRAIN` auf die lokalen Cachepfade zeigen.
- **Produktion:** `deploy/index.php` setzt `LLB_ROOT` und `LLB_WEB_ROOT` auf den Dokumentenstamm, aktiviert `LLB_PRODUCTION=1`; die Anwendung liest `phpdata/`, `vendor/` und `phptmp/twig/` neben dem Einstieg.
- **Schreibzugriffe:** Katalog- und Seitenmodelle sind nur lesend. Schreibbar sind Twig-Cache und Statistikdatei (alternativ `LLB_STATS_FILE`). Der Front-Controller erzeugt bei Bedarf den Twig-Cacheordner; PHP muss daher in den jeweiligen Betriebsordner schreiben können.
- **Zugriffsschutz:** Die Deploymentbeschreibung verlangt, `phpdata`, `php`, `vendor` und `phptmp` gegen direkten Webzugriff zu sperren. Die Rewrite-/Schutzregeln gehören zur getrennten Serverkonfiguration, nicht zum Releasemanifest.

Belege: `tools/build_release.py`, `tools/release_components.py`, `deploy/index.php`, `upload.py`, `tools/cache_leeren.py`, `tools/umschalten.py`, `tools/veroeffentlichen.py`, `php/public/router.php`, `php/public/index.php`, `baue_website.py`.

## 8. Querschnittliche Konzepte

### Sprache und URLs

Die drei unterstützten Sprachcodes und die sprachabhängigen Pfadsegmente sind in `php/src/Catalogue.php` zentral hinterlegt. IDs bleiben unabhängig von übersetzten Namen; kanonische Slash-Adressen, Großschreibung und Weiterleitungen werden durch den Router geprüft. Webdaten, Labels und Katalog-Viewmodels werden sprachspezifisch gebaut; die Sprachen sind keine zur Anfrage frei umschaltbare Übersetzung über ein gemeinsames englisches Datensatzobjekt.

### Listen- und Filterverhalten

Detailseiten und Indexseiten verwenden dieselben kompakten Zeilenmodelle, soweit die Relation fachlich passt. Relationale Filterlisten übernehmen Kontext-IDs, filtern/sortieren/paginieren deren Treffer und bewahren den Kontext beim Zurücksetzen. Die Clientkomponente wird über `entitaeten-listen.js` und die gemeinsamen Filtermodule angesteuert; serverseitige Katalogbrowser wie Händler-, Fraktions-, Landmarken- und Titelindex haben eigene PHP-Filterregeln. Diese sind nicht eine einzige universelle Filterimplementierung.

### Fehler- und HTTP-Verhalten

Der Front-Controller setzt für Exceptions und fatale PHP-Fehler HTTP 500 und zeigt generischen Text; der Fehlerort wird ins PHP-Errorlog geschrieben. Unbekannte Pfade und IDs erhalten echtes 404, Weiterleitungen tragen `X-Robots-Tag: noindex`. Sitemapdateien werden als XML mit einer Stunde Cache ausgegeben; HTML-Katalogantworten werden mit `max-age=0, must-revalidate` ausgeliefert. Für sprachlose Root-/Legacy-Adressen hängt 302/301 davon ab, ob das Ziel von Besucherpräferenz oder einem fest angegebenen Sprachwert abhängt.

### HTML-Sicherheit

Twig ist mit `autoescape: html`, `strict_variables: true`, `debug: false` und einem konfigurierbaren Cache eingerichtet. JSON für Inline-Skripte/Attribute wird in den PHP-Viewkontexten mit JSON-HEX-Flags und – wo benötigt – `JSON_THROW_ON_ERROR` kodiert. PHP-Ausgaben außerhalb von Twig verwenden unter anderem `Escape.php`. Ausnahmen für bereits erzeugtes HTML müssen im jeweiligen Code belegt sein. Das Release-Manifest lehnt erkannte Schlüssel-/Secretdateien ab und nimmt Test-, Cache- und Upload-State-Dateien nicht auf.

### Browserzustand und Datenschutz

Charakterdaten liegen im Browser-Speicher. Sprache und verschiedene Filter-/Ansichtspräferenzen werden ebenfalls lokal gehalten; manche Such-/Filterzustände stehen zusätzlich in URL-Parametern, die als teilbare/rekonstruierbare Ansicht dienen. `Statistics` ist davon getrennt und schreibt aggregierte Statistiken dateibasiert. Die Website verwendet zusätzlich eingebundene Tracking-Skripte; deren genaue Laufzeit- und Datenschutzkonfiguration hängt auch von den ausgelieferten Assets und dem Produktionsumfeld ab und ist nicht allein aus `Statistics.php` abzuleiten. Die im Repository enthaltenen Datenschutztexte und Serverkonfiguration müssen für eine rechtliche Bewertung separat geprüft werden.

### Caching

Twig-Cache, HTTP-Cache-Header und Versionsparameter von Assets sind getrennte Mechanismen. `Shell` stellt den aus ausgelieferten JS-/CSS-Dateien ermittelten Assetstand für Versionsparameter bereit; `build_release.py` berechnet seinen Stand einschließlich Karten-Shards inhaltsbasiert. Produktions-Twig lädt geänderte Vorlagen nicht selbst nach; deshalb ist der separate Cache-Leerungsschritt Bestandteil des Releaseablaufs. HTML wird serverseitig revalidiert, während der Cachelebenszyklus statischer Dateien zusätzlich von der Webserverkonfiguration abhängt.

## 9. Architekturentscheidungen

Die folgenden Entscheidungen sind durch die gegenwärtige Implementierung und ihre Codekommentare erkennbar. Sie werden hier als Ist-Architektur festgehalten; dieses Kapitel ist kein Ersatz für eine gesonderte Freigabe geplanter Änderungen.

| Entscheidung | Im Code erkennbare Begründung | Beleg |
|---|---|---|
| PHP rendert vorbereitete Modelle statt den Gesamtkatalog je Request zu durchsuchen | Seiten- und Relationsdaten werden im Build aufgelöst und in Shards abgelegt. Konsequenz: Daten und Templates benötigen koordinierte Releases; veraltete Shards können zu inkonsistenten Verweisen führen. | `tools/php_viewmodel.py`, `tools/build_php_data.py`, `php/src/Data.php` |
| Öffentliche Seiten laufen durch einen zentralen Front-Controller | Ein gemeinsamer Ort behandelt Routing, Redirects, Fehler und Ausgabe. Konsequenz: korrekte Rewrite-/Webserverregeln sind Teil der Auslieferung. | `php/public/index.php`, `php/src/Router.php` |
| Charakterfortschritt wird clientseitig verarbeitet | Import und Charakterwechsel verwenden Browsermodule und `localStorage`; Release stellt eine leere Fortschrittsdatei bereit. Konsequenz: Fortschritt ist browser-/profilgebunden und kein serverseitiger account state. | `web/companion.js`, `web/speicher.js`, `tools/build_release.py` |
| Release wird in Programm, Daten und Assets klassifiziert | Manifest und SHA-256-Werte ermöglichen reproduzierbare Komponentenstände und gezielte Uploads. Konsequenz: die Komponentenzuordnung muss für neue Dateien gepflegt sein; unbekannte Pfade verhindern den Manifestbau. | `tools/release_components.py`, `upload.py` |
| Tatendaten nutzen den gemeinsamen Generator im Plugin-Repository | Website-Builder ruft diesen explizit auf, statt einen zweiten Tatengenerator zu führen. Konsequenz: Tatenbau ist an ein externes Repository und dessen Daten-/Pythonumgebung gebunden. | `tools/build_taten_daten.py` |
| Große Listen und Kartenansichten werden stufenweise geladen | Index-/Kompakt-/Detaildaten sind getrennt, um initiale Payloads klein zu halten. Konsequenz: Assetstand, Startdaten und Shards müssen zusammenpassen. | `tools/build_karten_kurz.py`, `web/app.js`, `tools/build_release.py` |

Ein formales ADR-Verzeichnis oder ein automatischer Abgleich dieser Tabelle mit Code wurde in diesem Dokumentationsschritt nicht festgestellt.

## 10. Qualitätsanforderungen und Prüfungen

### Qualitätsmerkmale und beobachtbare Prüfpunkte

| Merkmal | Prüffrage / relevantes Verhalten | Vorhandene Prüfanker |
|---|---|---|
| Korrektheit der Relationen | Erreichen Entitäten nur existierende bzw. zulässige Ziele? Sind direkte und abgeleitete Kanten sauber behandelt? | `tests/test_relationen_audit.py`, `tests/test_entitaeten_vertrag.py`, `tests/test_php_viewmodel_links.py`, `docs/datenraum/` Audits |
| Rendering-/Datenparität | Entspricht das serverseitige PHP-Ergebnis dem Katalog-/Referenzoutput? | `tests/test_php_parity.py` |
| Kanonische Adressen | Sind ID-Schreibweise, Slashform, Legacy- und unbekannte URLs korrekt? | `tests/test_router.py`, `tests/test_alte_adressen.py` |
| Filter- und Listenverträge | Bleiben Filter, Kontext, Paginierung und Zeilenregeln korrekt? | `tests/test_filterbereiche.py`, `tests/test_vendor_filters.py`, `tests/test_vendor_viewmodel.py`, `tests/browser_related_lists.js`, `tests/test_entitaeten_vertrag.py` |
| Spielstandimport | Werden IDs/Zustände korrekt und lokal verarbeitet? | `tests/test_companion.js`, `tests/test_speicher.js`, `tests/test_companion_real.py` (separater echter Companion-Integrationstest) |
| Karten-/Geografieverhalten | Stimmen Kartenstartdaten, Gebietszuordnung und Pins? | `tests/test_kartenstart.py`, `tests/test_gebiete.py`, `tests/test_map_following.py`, `tests/test_landmarks.py`, `tests/test_gelaende.py` |
| Mehrsprachigkeit und Texte | Sind Sprachpfade, Übersetzungen und Spielertexte konsistent? | `tests/test_sprache.py`, `tests/test_i18n.js`, `tests/test_spielertexte.py`, Browser-Sprachtests |
| Release-Sicherheit/-Konsistenz | Werden private Dateien ausgelassen, Komponenten klassifiziert und Releases geprüft? | `tests/test_release_components.py`, `tests/test_component_upload.py`, `tests/test_upload.py`, `tests/test_resource_packaging.py` |

Die Namen der Tests sind Belege für vorhandene Prüfanker, nicht automatisch ein Bericht über ihren letzten Lauf oder die vollständige Semantikabdeckung.

### Im Repository vorhandene Prüfarten

- Python-Unittests unter `tests/test_*.py`, unter anderem zu Routing, PHP-Parität, Datenbuilds, Filtern, Karten und Release-Komponenten.
- Node-Tests unter `tests/*.js` für Browserlogik, Import, Sprache und Filter.
- Browser-Prüfskripte unter `tests/browser_*.js`.
- Live-Abnahme-Skripte unter `tests/live_*.js`.
- `tests/test_php_parity.py` vergleicht die PHP-Ausgabe mit einer statischen Referenzausgabe; seine Referenz wird über `LLB_ORACLE` oder einen lokalen Cachepfad bestimmt.

Die Existenz eines Testskripts belegt nicht, dass es im aktuellen Lauf ausgeführt wurde oder dass die gesamte Funktionalität dadurch abgedeckt ist.

### Nicht als Repository-Automation belegt

Bei der Inspektion wurden keine `.github/workflows/`, PHPUnit-/PHPStan-/Infection-Konfigurationen oder Coverage-Konfigurationen im Checkout gefunden. `composer.json` deklariert Twig, aber keine `require-dev`-Werkzeuge. Das sagt nichts über externe GitHub-Einstellungen oder lokal zusätzlich installierte Werkzeuge aus.

Es wurde in diesem Dokumentationsschritt kein Testlauf gestartet. Eine gemessene Codeabdeckung, ein bestandener Gesamtstatus oder ein dauerhaft aktives CI-Quality-Gate wird daher nicht behauptet. Browser-/Live-Skripte können externe Dienste, laufende Server oder Browserprofile voraussetzen; sie sind nicht mit einem isolierten Unit-Test gleichzusetzen.

Belege: `tests/`, `composer.json`; Konfigurationssuche im Checkout vom 19.11.2026. Die tatsächlichen Abhängigkeiten und Voraussetzungen stehen jeweils im Testcode.

## 11. Risiken und technische Schulden

- **Arbeitsbaum und Live-Version können auseinanderliegen.** Zum Dokumentationszeitpunkt sind viele Dateien geändert oder neu und nicht eingecheckt. Für einen Live-Befund müssen Release-Manifest und veröffentlichte Version mitbetrachtet werden.
- **Mehrere Buildpfade existieren.** Der PHP-Release und `baue_website.py` haben verschiedene Artefaktformen. Ein Befehl aus dem einen Ablauf belegt nicht automatisch das Verhalten des anderen.
- **Builds hängen von außerhalb des Repositories erzeugten Daten ab.** `tools/build_php_data.py` liest `daten/*.json` und `web/*`; Tatendaten benötigen zusätzlich das externe MagicQuestLog-Repository. Vollständige Reproduzierbarkeit ist nur mit passenden Quellen und Versionen möglich.
- **Lokale Quelldaten sind nicht vollständig im Repository.** Mehrere Generatoren lesen fest konfigurierte Pfade in Companion-/Client-/Plugin-Installationen. Ein Checkout allein reicht deshalb nicht zwingend zum vollständigen Neuaufbau; Pfad, Exportstand und externe Toolversionen sind Releasevoraussetzungen.
- **Buildreihenfolge ist fachlich bedeutsam.** PHP-Seitenmodelle konsumieren bereits gebaute Aufgaben, Taten, Gegenstände, Rezepte, Karten, Händler-/Fraktions-/Landmarkendaten. Ein veralteter Vorläufer kann formal gültige, aber fachlich gemischte Indizes erzeugen; ein einzelnes universelles Pipeline-Manifest mit allen Quellversionen ist nicht belegt.
- **Datenmodell ist verteilt und polyglott.** Relationserzeugung liegt teilweise in Python, teilweise in Browsergeneratoren und teilweise im PHP-Renderer. Kurzschlüsselfelder sind nicht durch ein zentrales JSON-Schema typisiert; Regressionstests und Datenraum-Audits sind damit wichtige Verträge.
- **Reale Spielsemantik ist nicht immer aus Katalogkanten ableitbar.** Kartenpfad, Quelle, Ziel, Ort und Verfügbarkeit sind verschiedene Aussagen. Unvollständige Exporte oder nicht aufgelöste Kennungen dürfen nicht durch Namen oder Geometrie „repariert“ werden, ohne eine eigene Regel mit Beleg.
- **Externe Betriebsparameter bleiben relevant.** Rewrite-Regeln, Schutz der nicht öffentlichen Releaseverzeichnisse, PHP-Schreibrechte, Twig-Cache und tatsächliche Laufzeitversionen liegen teilweise außerhalb der im Repository versionierten Anwendung.
- **Produktions-Rewrite-Regeln liegen außerhalb des PHP-Release-Artefakts.** Der Release-Builder kopiert keine `.htaccess`; eine korrekte Anwendung hängt damit auch von der separat gepflegten Webserver-Konfiguration ab.
- **Dokumentationsdrift ist bereits möglich.** Bestehende Dokumente enthalten datierte oder statische Buildbeschreibungen. Ihre Aussagen gelten erst nach Abgleich mit aktuellem Code und Zielumgebung.
- **Abdeckung und CI-Status sind unbekannt.** Ohne gemessene Coverage und überprüfte CI-Konfiguration dürfen keine Schwellen oder „alles geprüft“-Aussagen vorausgesetzt werden.

Diese Punkte sind Befunde aus der Code-/Repository-Inspektion, keine Aussage, dass die jeweiligen Abläufe aktuell fehlerhaft sind.

## 12. Glossar

| Begriff | Bedeutung in diesem Projekt |
|---|---|
| **DAT-Export** | Außerhalb des Website-Requests aus LOTRO-Spielressourcen gewonnene Quelldaten, aus denen Kataloge gebaut werden. |
| **Webkatalog** | Lokalisierte, vom Browsercode verwendete Datendateien unter `web/`. |
| **PHP-Daten (`phpdata`)** | Für die PHP-Auslieferung vorbereitete JSON-Dateien, Indizes, Listen- und Seitenmodelle. |
| **Shard** | Kleine JSON-Datei, die einen Teil der Einträge enthält; der Bucket wird für Entitätskennungen aus `md5(ID)[:2]` bestimmt. |
| **Seitenmodell** | Beim Build vorbereitete Daten, die Twig für eine bestimmte Entitätsseite ausgibt. |
| **Anwendungsseite** | Interaktive Browseroberfläche, die von PHP/Twig mit gemeinsamer Hülle gerendert wird. |
| **Katalog-/Entitätsseite** | Serverseitig gerenderte Übersicht oder Detailseite für einen Katalogeintrag. |
| **Release** | Zusammengefügtes Verzeichnis aus Programm, vorbereiteten Daten und Assets, das für den Upload bestimmt ist. |
| **Arbeitsbaum** | Dateien des lokalen Checkouts einschließlich nicht eingecheckter Änderungen; nicht notwendigerweise identisch mit Commit oder Live-Release. |

---

## Pflegehinweis

Änderungen an dieser Dokumentation sollen sich auf nachprüfbare Implementierung stützen. Bei jeder Änderung sind die jeweils genannten Quelldateien erneut zu prüfen. Wenn Code und diese Dokumentation auseinanderlaufen, ist zuerst der Widerspruch festzuhalten; die Dokumentation wird an den bestätigten Code angepasst. Anforderungen oder gewünschte Architekturänderungen werden nicht allein aus einer veralteten Dokumentationsaussage abgeleitet.
