# 7. Verteilungssicht

### Logische Topologie

```text
Buildumgebung
  lokale Quelldaten + externe Exportbestände
       │ Python-Generatoren / PHP-Datenbuild
       ▼
  Releaseverzeichnis (Programm + phpdata + Assets + Manifest)
       │ upload.py über FTPS
       ▼
Produktionshost (physische Details teilweise offen)
  Webserver / Rewrite-Regeln
       ├── statische Assets und Kartenbilder
       └── PHP-Einstiegspunkt
            ├── Front-Controller + Twig
            ├── lesende phpdata-/vendor-Dateien
            ├── Twig-Cache (schreibbar)
            └── Statistikdatei (schreibbar)
  Browser
       ├── HTML/CSS/JavaScript und nachgeladene JSON-Shards
       ├── lokaler Charakter-/Filterzustand
       └── lokal ausgewählte Companion-Dateien
```

Das Diagramm zeigt logische Knoten. Physische Serverzahl, Container, konkrete PHP-SAPI, CDN, Datenbank und Hostingprodukt sind aus dem Repository nicht sicher ableitbar und werden nicht behauptet.

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

### Verteilung, Kommunikation und offene Infrastrukturangaben

- Öffentliche Browserkommunikation erfolgt über die Website-URLs; TLS-Endpunkt, Proxy/CDN und konkrete Cachekonfiguration sind nicht vollständig belegt.
- Der Build liest lokale und externe Quelldateien. Produktionsrequests lesen vorbereitete Artefakte und benötigen keine Verbindung zu den DAT-Quellen.
- Zur Laufzeit sind Katalogmodelle lesend; Twig-Cache und Statistikdatei sind schreibbare Bereiche.
- Charakterdaten bleiben im Browser und werden nicht als Releaseinhalt ausgeliefert.
- Schutz von `phpdata`, PHP-Quellen, Abhängigkeiten und Cache ist erforderlich; die tatsächliche Wirksamkeit muss am aktiven Host überprüft werden.

| Thema | Im Repository vorhanden | Noch offene Betriebsangabe |
|---|---|---|
| Hosting | Uploadziel und Webpfade | Anbieter, Region, Verantwortliche |
| Webserver/PHP | Einstiegspunkte und Mindestversion | Produkt/Version, SAPI, Worker- und Prozessmodell |
| Netzwerk | öffentliche Domain | TLS, DNS, Proxy/CDN |
| Persistenz | Cache-/Statistikdatei | Backup, Aufbewahrung, Wiederherstellung, Monitoring |
| Kapazität | keine verbindlichen SLA-Werte | Lastbudget, Skalierung, RPO/RTO, Alarmierung |

Diese Werte sind offen und werden nicht aus einem typischen Shared-Hosting-Modell abgeleitet.

Belege: `tools/build_release.py`, `tools/release_components.py`, `deploy/index.php`, `upload.py`, `tools/cache_leeren.py`, `tools/umschalten.py`, `tools/veroeffentlichen.py`, `php/public/router.php`, `php/public/index.php`, `baue_website.py`.
