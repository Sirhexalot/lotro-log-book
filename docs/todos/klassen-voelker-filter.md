# Klassen- und Völkerprofile mit passenden Kataloglisten

Stand: 20.11.2026
Status: umgesetzt und in lokaler Vorschau geprüft (DE/EN/FR)

## Umgesetzt

- Einstieg `Charakter → Klassen & Völker`, mit Sprachpfaden `/de/klassen/`,
  `/en/classes/` und `/fr/classes/`.
- Auswahl angebotener Völker je Klasse aus `classes.xml` und `races.xml`;
  lokalisierte Namen aus den Client-Labels. Eine separate Kombinationsmatrix
  wird nicht gezeigt.
- Auswahl von Klasse, Volk und Stufe. „Mein Charakter“ übernimmt den aktiven
  Import ausschließlich lokal im Browser.
- Waffen- und Rüstungskenntnisse mit Freischaltstufe aus `classes.xml` und
  übersetzten Typnamen aus den Client-Enums.
- `tools/build_class_data.py` erzeugt die drei Sprachdateien beim Release-Bau.

## Umsetzung

- Aufgaben und Taten: vollständige Liste nach ausgewählter Klasse, Volk und
  Stufe; `requiredClass` und `requiredRace` werden gemeinsam angewendet.
- Gegenstände: eine gemeinsame Liste aus passenden `requiredClass`-gebundenen
  Verbrauchsgütern/Klassenwerkzeugen und Ausrüstung. Klasse, Volk, Stufe,
  explizite Gegenstandsbeschränkungen sowie Waffen-/Rüstungskenntnis samt
  Freischaltstufe grenzen die Basisliste ein.
- Einträge mit zusätzlicher Ausrüstungsbedingung wie Eigenschaft, Ruf,
  Fraktionsrang oder Effekt erscheinen nicht in der Ausrüstungsliste.
- Aufgaben, Taten und die gemeinsame Gegenstandsliste verwenden die
  Standard-Filterkomponente mit Suche, passenden Facetten, Sortierung und
  Pagination. Je Liste bleibt der Profilkontext beim Filtern und Zurücksetzen
  erhalten.
- Die Ergebnisliste folgt mit gleichbleibendem Abstand direkt auf die
  Filterleiste; ein veralteter Ladefehler verschwindet, sobald Filtern wieder
  funktioniert. Ergebniszeilen ohne Symbol nutzen die volle Textbreite.
- Daten bleiben im Browser; „Mein Charakter“ liest nur den lokalen Import.

## Abnahme

- Hobbit-Jäger: keine schwere Rüstung; Armbrustkenntnis erst ab Stufe 7.
- Hobbit-Wächter: schwere Rüstung ab der belegten Freischaltstufe.
- Jäger-Bärenfallen und Jäger/Hüter-Öle erscheinen gemeinsam in der
  Gegenstandsliste; geteilte Klassenanforderungen bleiben an den Einträgen
  erkennbar.
- Eine klassengebundene Volkstat erscheint nur für eine erlaubte Kombination;
  allgemeine Aufgaben und Taten bleiben auffindbar.
- Importierte Klasse, Volk, Stufe und Fortschritt verlassen den Browser nicht.
