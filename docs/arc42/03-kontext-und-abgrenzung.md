# 3. Kontextabgrenzung

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

### Externe Schnittstellen

| Schnittstelle | Zweck und belegtes Format | Nicht durch diesen Checkout festgelegt |
|---|---|---|
| HTTP zu Browsern | Sprachpfade, HTML, JSON/JavaScript-Assets, kanonische URLs und Statuscodes | TLS-Endpunkt, CDN/Proxy, konkrete Serverlimits |
| Companion-Dateien | Browser verarbeitet ausgewählte XML-/Exportdateien lokal | Vollständigkeit aller Companion-Versionen |
| DAT-/Spiel-Exporte | Generatoren lesen XML, Lua, JSON und erzeugte Zwischenformate | Verfügbarkeit/Versionierung externer Installationen |
| MagicQuestLog | Lokaler Prozessaufruf für den gemeinsamen Taten-Generator | Vollständiger Kompatibilitätsvertrag der Repositories |
| FTPS | `upload.py` überträgt Release-Dateien und Manifest | Anbieter, Serverkonfiguration und Zugangsdaten |
| `/api/statistik` | JSON-Aktionen `heartbeat`, `import`, `current`; aggregierter Dateistand | Externe Trackingkonfiguration und rechtliche Bewertung |

Dies sind aus den implementierenden Stellen abgeleitete Schnittstellen, keine versionierten API-Verträge.
