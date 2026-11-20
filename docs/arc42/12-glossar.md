# 12. Glossar

| Begriff | Bedeutung in diesem Projekt |
|---|---|
| **Abgeleitete Relation** | Im Build aus Quelldaten berechnete Kante oder Aggregation; kein unabhängiger Quelldatensatz. |
| **Asset** | Ausgelieferte statische Datei wie JavaScript, CSS, Bild oder Karten-Shard. |
| **Browserzustand** | Lokal gespeicherte Auswahl oder Charakterdaten; nicht automatisch Teil des Serverkatalogs. |
| **Build** | Vorgelagerte Verarbeitung, die Quelldaten, Kataloge, Indizes oder Releaseartefakte erzeugt. |
| **Companion-Import** | Lokales Einlesen unterstützter Companion-Dateien im Browser. |
| **DAT-Export** | Außerhalb des Website-Requests aus LOTRO-Spielressourcen gewonnene Quelldaten, aus denen Kataloge gebaut werden. |
| **Detailrelation** | Auf einer Entitätsseite angezeigte Menge verbundener Einträge mit festem Bezug zur Besitzerseite. |
| **Entität** | Fachlich identifizierter Katalogeintrag wie Aufgabe, Tat, Gegenstand oder Gebiet. |
| **ID** | Stabile technische Kennung unabhängig von Name und Sprache. |
| **Kanonische URL** | Bevorzugte öffentliche Adresse mit Sprachpfad, Entitätssegment und stabiler ID. |
| **Katalog** | Sprachbezogener Bestand aus Einträgen und Beziehungen, vorbereitet für Anzeige und Suche. |
| **Webkatalog** | Lokalisierte, vom Browsercode verwendete Datendateien unter `web/`. |
| **PHP-Daten (`phpdata`)** | Für die PHP-Auslieferung vorbereitete JSON-Dateien, Indizes, Listen- und Seitenmodelle. |
| **Shard** | Kleine JSON-Datei, die einen Teil der Einträge enthält; der Bucket wird für Entitätskennungen aus `md5(ID)[:2]` bestimmt. |
| **Seitenmodell** | Beim Build vorbereitete Daten, die Twig für eine bestimmte Entitätsseite ausgibt. |
| **Anwendungsseite** | Interaktive Browseroberfläche, die von PHP/Twig mit gemeinsamer Hülle gerendert wird. |
| **Katalog-/Entitätsseite** | Serverseitig gerenderte Übersicht oder Detailseite für einen Katalogeintrag. |
| **Release** | Zusammengefügtes Verzeichnis aus Programm, vorbereiteten Daten und Assets, das für den Upload bestimmt ist. |
| **Arbeitsbaum** | Dateien des lokalen Checkouts einschließlich nicht eingecheckter Änderungen; nicht notwendigerweise identisch mit Commit oder Live-Release. |
| **Lesemodell** | Für einen Anzeige- oder Auslieferungszweck vorbereitetes Datenformat, z. B. Index oder Seitenmodell. |
| **Manifest** | Releasebeschreibung mit Dateien, Komponenten und Integritätsinformationen. |
| **Relation** | Gerichtete oder typisierte Beziehung zwischen Katalogeinträgen; nicht gleichbedeutend mit bloßem Textverweis oder Kartenposition. |
| **Status unbekannt** | Keine ausreichende Importinformation für „erledigt“, „offen“ oder „gelernt“; nicht gleich null oder „nein“. |
| **Twig** | Serverseitiges Template-System, das PHP-Kontexte in HTML rendert. |
