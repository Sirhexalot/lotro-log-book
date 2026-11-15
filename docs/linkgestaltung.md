# Regeln für Links und Schrift

Stand: 15.11.2026. Diese Regeln gelten für alle Website-Seiten und ergänzen die
gemeinsamen Gestaltungsregeln in `AGENTS.md`.

## Links nach Funktion

- **Inhaltslinks** müssen auch ohne Hover als Links erkennbar sein. Sie verwenden
  die vorhandene Akzentfarbe Gold und eine sichtbare Unterstreichung.
- **Besuchte Inhaltslinks** bleiben in Gold. Es gibt keine eigene Besuchsfarbe.
- **Brotkrumen und Footerlinks** sind nachgeordnet: gedämpfte Textfarbe, keine
  dauerhafte Unterstreichung; bei Hover und Tastaturfokus werden sie
  hervorgehoben.
- **Buttons und buttonartige Links** behalten eine Fläche und erhalten eine
  explizite Textfarbe. Für Katalog-Buttons (`.katalog-knopf`) ist das Gold.
  Eine Ausnahme von der Inhaltslink-Regel darf nie dazu führen, dass die
  Browser-Standardfarbe Blau sichtbar wird.
- **Navigation, Kacheln, Trefferflächen und Kartenlinks** behalten ihre jeweils
  eigene Komponentendarstellung. Nicht jede klickbare Fläche wird zusätzlich
  wie ein Textlink unterstrichen.
- Tastaturfokus muss klar sichtbar sein (`:focus-visible`).

## Farben und Informationsrollen

- Keine neue Farbe einführen. Bestehende Gold-Akzente bleiben erhalten.
- Semantische Farben, insbesondere Gegenstands-Seltenheiten, dürfen nicht durch
  eine allgemeine Linkregel überschrieben werden.
- Keine breite Regel wie `.katalog-seite a { color: ... }`: Sie überstimmt
  Breadcrumbs, Footerlinks, Buttons und semantisch gefärbte Inhalte.
- Linkzustände gezielt über Rolle und Komponente festlegen. Bei Ausnahmen von
  allgemeinen Regeln immer Farbe und Dekoration gemeinsam prüfen.

## Schrift

- Gemeinsame Tokens aus `gemeinsam.css` verwenden: Fließtext `--text-normal`,
  Bedienung `--text-bedienung`, Abschnitt `--text-abschnitt`, Titel
  `--text-titel`.
- Metadaten und Bedienhinweise nicht willkürlich verkleinern. Mobile Reiter
  bleiben mindestens auf der Bedienungsstufe; dichte Kartenbedienelemente
  dürfen nur dann kompakt sein, wenn Lesbarkeit und Bedienbarkeit erhalten sind.
- Die Hierarchie und der Zeilenfluss müssen auf Desktop, Tablet und Mobil
  funktionieren; auf schmalen Displays keinen zusätzlichen horizontalen
  Seitenüberlauf verursachen.

## Prüfung bei Änderungen

Repräsentative Anwendungs- und Katalogseiten prüfen, darunter Inhaltslinks,
Breadcrumbs, Buttons, Kacheln und semantisch gefärbte Titel. Hover,
Tastaturfokus, besuchte Zustände, DE/EN/FR sowie Desktop, Tablet und Mobil
berücksichtigen. Nach CSS-Änderungen an Katalogseiten insbesondere kontrollieren,
dass keine Links in Browser-Standardblau zurückfallen.

Die Umsetzung liegt in `web/gemeinsam.css` und `web/katalog.css`.
