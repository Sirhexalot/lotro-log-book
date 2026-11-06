# Startseite, Import und Typografie – 6. November 2026

## Änderungen

- Startseiten DE/EN/FR neu gefasst: direkter Karteneinstieg, Taten und Import vor
  dem Bild; drei datierte Neuigkeiten, kurzer Funktionsüberblick und sichtbarer
  LOTROInterface-Link zu Magic Quest Log. Keine Warnliste und keine wiederholten
  Browser-Datenschutzhinweise auf der Startseite.
- Menü und Importüberschrift: „Spielstand importieren“, „Import progress“,
  „Importer la progression“. Ordnerauswahl und die zweite Importstufe benennen
  ihre konkrete Funktion. Der frühere Datenschutzkasten ist ein kurzer Hinweis.
- Datenschutz auf fünf Abschnitte gekürzt, vollständig übersetzt; deutsche
  Fassung auch ohne JavaScript lesbar. Hosting, GoatCounter und Betroffenenrechte
  bleiben genannt. Keine pauschale Behauptung, dass keinerlei Daten übertragen
  werden. Anbieterinformationen geprüft:
  <https://www.goatcounter.com/help/privacy> und
  <https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/>.
- Die Hetzner-Logfrist wird ausdrücklich als **konfigurierbarer Anbieterstandard**
  beschrieben, nicht als geprüfte Kontoeinstellung. Die konkrete Einstellung in
  konsoleH bleibt zu bestätigen; keine Hosting-Einstellung geändert.
- Bestehende Impressumsänderungen erhalten; Sprachumschaltung ergänzt und Footer
  vereinheitlicht. Auf jeder Seite nur Impressum und Datenschutz, in der gewählten
  Sprache. Der Kartenfooter verbraucht echten Layoutraum statt die Karte zu überdecken.
- Gemeinsame Schriftstufen in `gemeinsam.css`: Fließtext 16 px, Bedienung und
  Metadaten 14 px, Abschnittsüberschriften 20 px, Seitentitel 28 px; Schriftfamilie
  identisch, Monospace nur für Pfade/Befehle. Keine willkürliche Kleinschrift in
  Tabellen, Hinweisen, Gebietskacheln und Kartenbedienung. Kleine Ziffern direkt
  in Kartensymbolen bleiben davon getrennt.
- Seitentitel, Sprach-/Navigationsbezeichnungen, Footer, Import-Links und
  fehlenden französischen Startseiten-Text ergänzt. Englische/französische
  FAQ erklärt ausgeschlossene Alternativen jetzt korrekt, statt beide Seiten
  eines Aufgabenpaars pauschal auszuschließen. Katalog- und Fortschrittsdaten
  bleiben unverändert.

## Prüfung

- `node tests/test_i18n.js`: vollständige Schlüsselsätze und Platzhalter in allen
  Sprachen, HTML-Bindungen, Startseiten-Neuigkeiten/Plugin-Link und Datenschutz-Fallback.
- Python-Tests: `../MagicQuestLog/.venv/bin/python -m unittest discover -s tests`.
- `tests/browser_site_polish.js` mit Playwright CLI: 21 Seitenvarianten plus drei
  geöffnete Tatenansichten. Titel, Sprache, Übersetzungsbindungen, Footer,
  Schriftgrößen, Überläufe, Windows-/Mac-Anleitung, Einstieg oberhalb des sichtbaren
  Seitenendes und vollständig eingepasste 4:3-Karte bei veränderter Fenstergröße.
- Importtabelle zusätzlich mit einem synthetischen Charakter geprüft: Texte
  16 px, Tabelle/Buttons/Pfade 14 px; Beschriftungen DE/EN/FR vollständig.
- Screenshots unter `output/playwright/start-polish-*.png` und
  `output/playwright/import-polish-*.png`.

Der Veröffentlichungs-Build hat dieselbe Prüfung bestanden (21 Seitenvarianten
und drei geöffnete Karten, keine JavaScript-Fehler). Upload am 6. November:
42 Dateien / 0,1 MB, 744 Dateien unverändert.
