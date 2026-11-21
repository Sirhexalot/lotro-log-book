# 8. Querschnittliche Konzepte

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

### Layoutsystem, Flächen und Zeilen

Das sichtbare Layout folgt einem 12-Spalten-Raster (`--llb-raster` in `web/gemeinsam.css`). Dieselben Abstands- und Flächen-Token gelten für Detailseiten, Filter und die Karten-Detailspalte. Eine Sektion ist eine Fläche mit Rahmen, Radius und Innenabstand; Trennlinien ersetzen keine Gliederung. Der aktive Tab geht in die Fläche über (gleicher Hintergrund, 1 px Überlappung). Ergebniszeilen (`web/filter-ui.css`) halten Icon, Name, Stufe und Fortschritt auf einer Oberkante; das Icon sitzt linksbündig, der Fortschritt rechtsbündig. Kurze Relationslisten behalten die volle Fläche, auch mit nur einem Eintrag. Belohnungen und Quellen nutzen dieselben 64/54-px-Icon-Kacheln wie die Listen. Details: arc42 5.10.

Die gemeinsame Palette in `web/gemeinsam.css` stellt Dark und Light bereit. Dark bleibt der Standard; `data-theme="light"` wählt die warme helle Palette. `theme-init.js` beziehungsweise die inline Initialisierung der PHP-Hüllen liest `mql.theme` vor dem ersten Paint, `theme.js` stellt den barrierefrei beschrifteten Umschalter bereit und speichert die Auswahl lokal. `theme-light.css` ergänzt nur die Oberflächen, die aus Spielkarten- oder Statusgründen feste Farben benötigen. Neue Flächen sollen die gemeinsamen Farbvariablen verwenden und dürfen nicht von einem Modus ausgehen.

### Filterlogik und Darstellung

Filterzustand, Facettenzählung und Kontextbindung sind in 5.9 beschrieben. Darstellungsseitig gilt zusätzlich: Der Fortschritt steht bei Aufgaben/Taten oben in der Filterspalte; Einfachauswahlen zeigen immer einen Chip, auch den Standardwert; der Fortschritt ist pro Eintrag ein Feld, kein zweiter Statuschip. Die Kartenliste kennzeichnet belegte Zustände mit farbigen Symbolen; unbekannter Fortschritt bleibt neutral. Das Filterraster ist 3/9 am Desktop und einspaltig mit Dialog mobil; native Bedienelemente folgen dem aktiven `color-scheme`.

### Performance-Budget der Übersichten

Die Gesamtkartenübersicht darf keine zusätzlichen Netzwerkanfragen erzeugen. Sprungmarken und Gruppenkarten werden aus bereits geladenen Daten (`MQL_GEBIETE`, Baumknoten, Shards) berechnet, nicht aus neuen JSON-Dateien. Die Berechnung erfolgt einmal pro Gruppenkopf, nicht pro Karte; Klick-Handler sitzen am Container. Lokal gemessen (Chromium, 20.11.2026, 8 PHP-Worker): DOMContentLoaded ≈ 43 ms, Load ≈ 121 ms, vollständiger Übersichtsaufbau ≈ 6,5 ms bei leerer Suche, Suche „Dunland“ ≈ 0,4 ms, 80 Landschaftskarten mit lazy Bildern, kein seitlicher Überlauf bei 390 px. Der Tatenindex `/de/tat/` braucht DOMContentLoaded ≈ 94 ms, Load ≈ 97 ms und zeigt nach 50 Treffern; die Suche zeichnet unter 100 ms neu. Diese Werte sind eine lokale Momentaufnahme, kein Produktions-SLA. Neue Funktionen in diesem Bereich dürfen keine neuen Requests einführen und sollen den Aufbau nicht messbar verlangsamen; die Browserprüfung `tests/browser_kartenuebersicht.js` misst dies nach.
