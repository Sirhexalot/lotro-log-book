# 2. Randbedingungen

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

### Organisatorische, rechtliche und externe Randbedingungen

- Website, Plugin und Companion-/DAT-Exportwerkzeuge sind getrennte Projekte. Ihre Verfügbarkeit ist keine Erlaubnis, externe Repositories, Spielinstallationen oder Charakterdateien zu verändern.
- Lokale Quelldaten und Buildabhängigkeiten können außerhalb eines frischen Checkouts liegen; deren Versionierung und Verfügbarkeit sind nicht vom HTTP-Request kontrolliert.
- Tracking und Statistik sind getrennte Datenpfade. Eine vollständige rechtliche Bewertung, Auftragsverarbeitung oder verbindliche Aufbewahrungsrichtlinie ist aus diesem Repository nicht ableitbar.
- Technische Verfügbarkeit von Spielinhalten, Karten, Marken oder Bibliotheken belegt keine Nutzungsrechte. Die Rechteklärung liegt außerhalb dieser Architekturbeschreibung.
- Rewrite-Regeln, Hostingkonfiguration, Zugangsdaten und Produktionsberechtigungen liegen teilweise außerhalb des Release-Artefakts.
