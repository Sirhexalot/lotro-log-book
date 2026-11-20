# 11. Risiken und technische Schulden

Die folgenden Punkte unterscheiden strukturelle Risiken von bestätigten Defekten. Priorität und Risikoeigner sind nicht dokumentiert, sofern nicht ausdrücklich genannt.

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
- **Betriebstopologie ist nur teilweise dokumentiert.** Anbieter, PHP-/Webserverkonfiguration, Backups und Monitoring fehlen. Auswirkung: Ausfallbehebung hängt von implizitem Wissen ab. Maßnahme: Betriebsverantwortliche und Hostingkonfiguration in einem geeigneten Betriebsdokument erfassen.
- **Filtervertrag und konkrete UI-Auftritte sind nicht überall synchron.** Der offene Audit steht in `docs/todos/entitaetenvertrag-abgleich.md`. Auswirkung: inkonsistente Relationslisten oder Zeileninhalte. Maßnahme: Vertrag, Code und Browserprüfungen je Entität gemeinsam abgleichen.

Diese Punkte sind Befunde aus der Code-/Repository-Inspektion, keine Aussage, dass die jeweiligen Abläufe aktuell fehlerhaft sind.
