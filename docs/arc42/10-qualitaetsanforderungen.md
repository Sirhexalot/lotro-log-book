# 10. Qualitätsanforderungen und Prüfungen

### Qualitätsbaum

```text
LOTRO Log Book
├── Inhalte auffindbar und fachlich korrekt
│   ├── stabile IDs und kanonische URLs
│   ├── nachvollziehbare Relationen und Geografie
│   └── keine unbelegten Status-/Ortsaussagen
├── Inhalte zugänglich
│   ├── Deutsch, Englisch und Französisch
│   ├── serverseitiges HTML für Kataloginhalte
│   └── interaktive Filter und Karten im Browser
├── Persönlicher Fortschritt privat und brauchbar
│   ├── lokaler Import
│   └── neutraler Zustand bei fehlenden Daten
└── Auslieferung beherrschbar
    ├── vorbereitete Daten und Release-Manifest
    ├── echte HTTP-Statuscodes und geschützte interne Dateien
    └── getrennte Schreibbereiche für Cache/Statistik
```

Die Äste sind aus implementierten Eigenschaften abgeleitet, nicht aus einem freigegebenen, priorisierten Qualitätsanforderungskatalog.

### Qualitätsmerkmale und beobachtbare Prüfpunkte

| Merkmal | Prüffrage / relevantes Verhalten | Vorhandene Prüfanker |
|---|---|---|
| Korrektheit der Relationen | Erreichen Entitäten nur existierende bzw. zulässige Ziele? Sind direkte und abgeleitete Kanten sauber behandelt? | `tests/test_relationen_audit.py`, `tests/test_entitaeten_vertrag.py`, `tests/test_php_viewmodel_links.py`, `docs/datenraum/` Audits |
| Rendering-/Datenparität | Entspricht das serverseitige PHP-Ergebnis dem Katalog-/Referenzoutput? | `tests/test_php_parity.py` |
| Kanonische Adressen | Sind ID-Schreibweise, Slashform, Legacy- und unbekannte URLs korrekt? | `tests/test_router.py`, `tests/test_alte_adressen.py` |
| Filter- und Listenverträge | Bleiben Filter, Kontext, Paginierung und Zeilenregeln korrekt? | `tests/test_filterbereiche.py`, `tests/test_vendor_filters.py`, `tests/test_vendor_viewmodel.py`, `tests/browser_related_lists.js`, `tests/test_entitaeten_vertrag.py`, `tests/test_darstellung_iststand.py`, `tests/browser_listen_iststand.js`, `tests/browser_entitaeten_matrix.js`, `tests/test_entitaeten_matrix.py` |
| Spielstandimport | Werden IDs/Zustände korrekt und lokal verarbeitet? | `tests/test_companion.js`, `tests/test_speicher.js`, `tests/test_companion_real.py` (separater echter Companion-Integrationstest) |
| Karten-/Geografieverhalten | Stimmen Kartenstartdaten, Gebietszuordnung und Pins? | `tests/test_kartenstart.py`, `tests/test_gebiete.py`, `tests/test_map_following.py`, `tests/test_landmarks.py`, `tests/test_gelaende.py`, `tests/browser_kartenuebersicht.js`, `tests/browser_tatenindex.js` |
| Mehrsprachigkeit und Texte | Sind Sprachpfade, Übersetzungen und Spielertexte konsistent? | `tests/test_sprache.py`, `tests/test_i18n.js`, `tests/test_spielertexte.py`, Browser-Sprachtests |
| Release-Sicherheit/-Konsistenz | Werden private Dateien ausgelassen, Komponenten klassifiziert und Releases geprüft? | `tests/test_release_components.py`, `tests/test_component_upload.py`, `tests/test_upload.py`, `tests/test_resource_packaging.py` |

Die Namen der Tests sind Belege für vorhandene Prüfanker, nicht automatisch ein Bericht über ihren letzten Lauf oder die vollständige Semantikabdeckung.

### Qualitätsszenarien und Messlücken

| ID | Szenario | Beobachtbares Erfolgskriterium | Offene Messgrenze |
|---|---|---|---|
| Q-01 Katalogantwort | Besucher ruft eine vorhandene Detail-ID auf | kanonische Seite mit 200; unbekannte ID mit echtem 404 | Antwortzeit- und Lastziel fehlen |
| Q-02 Relationen | Build erzeugt eine zulässige Beziehung | Ziel ist vorhanden oder definierter Text-/Auslassungsfallback greift | Vollständigkeit externer Quellen nicht garantiert |
| Q-03 Sprache | Besucher ruft eine unterstützte Sprachvariante auf | Route, Labels und Katalogmodell nutzen dieselbe Sprache | Übersetzungsqualität braucht fachliche Abnahme |
| Q-04 Fehlender Import | Fortschrittsfunktion ohne Charakterdaten | UI behauptet weder Abschluss noch Verfügbarkeit und zeigt keinen erfundenen Prozentwert | Oberflächenabdeckung der Tests ist unterschiedlich |
| Q-05 Release | Änderung wird als Release gebaut | Manifest klassifiziert Dateien; Buildprüfungen laufen; Cache-/Rewrite-Schritte sind separat ausführbar | Kein End-to-End-Deploymenttest in dieser Dokumentation |
| Q-06 Relationsgrenze | Detailrelation hat fünf bzw. sechs Treffer | fünf direkte Einträge; ab sechs vorgesehene Filterkomponente, Kontext bleibt erhalten | Nicht alle Relationen sind abgeglichen; siehe `docs/todos/entitaetenvertrag-abgleich.md` |
| Q-08 Tatenindex-Ladebudget | `/de/tat/` wird geöffnet und durchsucht | Status 200, mindestens 40 Treffer, DOMContentLoaded < 1500 ms, Load < 3000 ms, < 100 Requests, Suche < 100 ms, kein Überlauf bei 390 px | Lokale Chromium-Messung mit 8 PHP-Workern; kein Produktions-/Geräte-SLA |
| Q-07 Übersicht ohne Mehrkosten | Gesamtkartenübersicht wird geöffnet und durchsucht | Keine zusätzlichen Netzwerkrequests; Sprungmarken und Gruppenkarten aus geladenen Daten; Aufbau und Suche bleiben unter dem lokalen Budget (Aufbau < 20 ms, Suche < 5 ms, kein Überlauf bei 390 px) | Lokale Chromium-Messung, kein Produktions-/Geräte-SLA; Browserprüfung nicht in der Python-Suite |

Für die Gesamtkartenübersicht gibt es ein lokales, reproduzierbares Budget (Q-07). Darüber hinaus sind quantitative Ziele für Latenz, Verfügbarkeit, Fehlerrate, Barrierefreiheit, Datenfrische, Wiederherstellungszeit und unterstützte Browser nicht als verbindliche Anforderungen belegt. Messwerte dafür werden nicht erfunden.

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
