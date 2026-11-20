# 9. Architekturentscheidungen

Die folgenden Punkte sind implementierte Architekturentscheidungen bzw. erkennbare Konventionen. Das Repository enthält für sie keine vollständigen ADRs mit Datum, Entscheider, Alternativen und Freigabestatus. Begründungen werden daher nur genannt, wenn sie aus Code, Datenfluss oder Kommentaren nachvollziehbar sind.

| Entscheidung | Im Code erkennbare Begründung | Beleg |
|---|---|---|
| PHP rendert vorbereitete Modelle statt den Gesamtkatalog je Request zu durchsuchen | Seiten- und Relationsdaten werden im Build aufgelöst und in Shards abgelegt. Konsequenz: Daten und Templates benötigen koordinierte Releases; veraltete Shards können zu inkonsistenten Verweisen führen. | `tools/php_viewmodel.py`, `tools/build_php_data.py`, `php/src/Data.php` |
| Öffentliche Seiten laufen durch einen zentralen Front-Controller | Ein gemeinsamer Ort behandelt Routing, Redirects, Fehler und Ausgabe. Konsequenz: korrekte Rewrite-/Webserverregeln sind Teil der Auslieferung. | `php/public/index.php`, `php/src/Router.php` |
| Charakterfortschritt wird clientseitig verarbeitet | Import und Charakterwechsel verwenden Browsermodule und `localStorage`; Release stellt eine leere Fortschrittsdatei bereit. Konsequenz: Fortschritt ist browser-/profilgebunden und kein serverseitiger account state. | `web/companion.js`, `web/speicher.js`, `tools/build_release.py` |
| Release wird in Programm, Daten und Assets klassifiziert | Manifest und SHA-256-Werte ermöglichen reproduzierbare Komponentenstände und gezielte Uploads. Konsequenz: die Komponentenzuordnung muss für neue Dateien gepflegt sein; unbekannte Pfade verhindern den Manifestbau. | `tools/release_components.py`, `upload.py` |
| Tatendaten nutzen den gemeinsamen Generator im Plugin-Repository | Website-Builder ruft diesen explizit auf, statt einen zweiten Tatengenerator zu führen. Konsequenz: Tatenbau ist an ein externes Repository und dessen Daten-/Pythonumgebung gebunden. | `tools/build_taten_daten.py` |
| Große Listen und Kartenansichten werden stufenweise geladen | Index-/Kompakt-/Detaildaten sind getrennt, um initiale Payloads klein zu halten. Konsequenz: Assetstand, Startdaten und Shards müssen zusammenpassen. | `tools/build_karten_kurz.py`, `web/app.js`, `tools/build_release.py` |

Ein formales ADR-Verzeichnis oder ein automatischer Abgleich dieser Tabelle mit Code wurde in diesem Dokumentationsschritt nicht festgestellt.

### Fehlende Entscheidungsnachweise

Für die obigen Entscheidungen sind Zeitpunkt, verantwortliche Person, betrachtete Alternativen, explizite Qualitätsabwägung und Kriterien zur Neubewertung überwiegend nicht dokumentiert. Diese Tabelle ist daher ein Architektur-Iststand, kein nachträglich erzeugtes Freigabeprotokoll. Künftige wichtige Entscheidungen sollten diese Angaben in einem ADR festhalten.
