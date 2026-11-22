# 4. Lösungsstrategie

1. **Build-Zeit:** Python-Generatoren verbinden die lokal verfügbaren Datenquellen und schreiben Webkataloge sowie PHP-Datenartefakte.
2. **PHP-Datenaufbereitung:** `tools/build_php_data.py` liest Webkataloge und `daten/*.json`, baut lokalisierte Listen- und Detailmodelle, löst Relationen auf und legt Ergebnisse in JSON-Shards ab.
3. **HTTP-Anfrage:** `php/public/index.php` bestimmt Sprache und Pfad, `Router` klassifiziert die Anfrage, `Data` liest die benötigten Dateien und `Page`/spezialisierte Klassen bereiten den Twig-Kontext vor.
4. **Darstellung:** Twig rendert vollständiges HTML. Browser-JavaScript ergänzt die interaktiven Anwendungen und progressive Filterfunktionen.
5. **Release:** `tools/build_release.py` stellt statische Assets, PHP-Code, Vorlagen, `vendor/` und den vorbereiteten `phpdata/`-Bestand zusammen. `upload.py` überträgt den Release; Twig-Cache und Webserver-Umschaltung sind separate Schritte.

Die PHP-Anfrage baut keine vollständigen Kataloge neu auf. `Data::page()` und `Data::entity()` bestimmen den Dateibucket aus `md5(ID)[:2]`; `relationRows()` gruppiert angeforderte IDs nach Bucket. So bleibt der Zugriff auf die angefragten Datensätze begrenzt, auch wenn eine Detailseite verbundene Einträge lädt.

Belege: `tools/build_php_data.py`, `tools/php_viewmodel.py`, `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_release.py`.

### Architekturansatz

Die Lösung verschiebt quellenabhängige und rechenintensive Datenintegration in den Build. PHP/Twig liefert beim Request die für Route und Seite benötigten vorbereiteten Daten; JavaScript ergänzt interaktive Filter, Karten und lokale Charakteransichten. JSON-Shards und stabile IDs begrenzen Datenzugriffe und entkoppeln URLs von übersetzten Namen. Der Release bündelt Programm, Daten und Assets, während Upload, Rewrite-Umschaltung und Twig-Cacheleerung getrennte Betriebsschritte bleiben.

| Ansatz | Ziel | Wesentliche Konsequenz |
|---|---|---|
| Python-Datenbuild vor dem Request | Quellen vereinigen und Relationen vorbereiten | Buildreihenfolge und kompatible Datenstände sind wichtig |
| PHP-Front-Controller plus Twig | Routing, Statuscodes und HTML zentral behandeln | Webserverregeln müssen den Einstiegspunkt korrekt erreichen |
| JSON-Indizes und Shards | begrenzte Lesezugriffe ohne Requestdatenbank | Erzeuger und Leser müssen dasselbe Format verwenden |
| Browsermodule ohne Framework | Interaktion mit ausgelieferten Webassets | Ladereihenfolge, Cacheversionen und Browserkompatibilität abstimmen |
| Lokaler Charakterzustand | persönliche Ansichten ohne Serverprofil | Zustand ist an Browser/Profil gebunden |
| Releasekomponenten mit Manifest | Änderungen gezielt übertragen und prüfen | Klassifikation und bestätigter Serverstand werden Betriebsbestandteil |

Das dokumentiert die implementierte Strategie, nicht nachträglich erfundene Alternativenabwägungen.
