# Gemeinsame Bausteine

Wiederkehrende Bausteine liegen an einem Ort, damit dieselbe Sache nicht je Seite anders aussieht. Der Ordner `php/templates/components/` enthält das Markup, eine gleichnamige CSS-Datei in `web/` den Look, JavaScript nur dort, wo Verhalten nötig ist.

Ein Baustein wird nur daraus, was **dieselbe Bedeutung** an mindestens drei Stellen hat und sich in **ein Markup** bringen lässt. Reine Ähnlichkeit im Aussehen genügt nicht: sonst entsteht eine Universaldatei mit Schaltern für jeden Sonderfall.

## Namensregeln

- Ordner und Dateien: `components/<baustein>.twig`, `web/<baustein>.css`, `web/<baustein>.js` (nur bei Bedarf).
- CSS-Klassen: `llb-<baustein>`; Varianten über Attribute (`data-dichte="kompakt"`, `data-ton="…"`), nicht über neue Klassennamen.
- Farben, Abstände und Radien ausschließlich aus den Token in `web/gemeinsam.css`.
- Die Überschriftsebene gehört zum Kontext, nicht zum Baustein: h2 auf einer Katalogseite, h3 im Kartenpanel, das schon einen Entitätstitel trägt.

## Fläche (Sektion mit Überschrift)

`php/templates/components/flaeche.twig`, `web/flaeche.css`, geladen über `Shell::styles()` und im Kartenapp über `karte.twig`. Katalogseiten und Karten-Detailspalte tragen dieselbe Fläche, dieselbe Überschrift und denselben Rhythmus.

- Makro: `flaeche(titel, ebene = 2, klasse = '', kennung = '')`, Inhalt über `{% call %}`.
- Die Überschrift gehört zum Baustein: h2/h3/h4 einheitlich `--text-abschnitt` (20 px), Gewicht 500, `0 0 8px`; nach oben kein Abstand. Die Ebene folgt nur der Dokumenthierarchie (h2 im Katalog, h3 im Panel).
- Ein Innenabstand über `--llb-flaechen-innen`; der Abstand zwischen Flächen ist `--llb-flaechen-abstand` (12 px) für die Katalog-Spalte wie für die Panel-Spalte.
- `data-ton="hell"` ist der hellere Grund für Belohnungen und Werte; Rahmen, Rundung und Abstände bleiben gleich.
- `<details>`-Abschnitte tragen ebenfalls `llb-flaeche`; ihre Zusammenfassung liest sich wie die Abschnittsüberschrift und behält das Aufklapp-Dreieck, Gold nur bei Hover/Fokus.
- Der Fließtext bleibt Sache der Umgebung: 16 px auf Detailseiten, 14 px in der Karten-Detailspalte.
- Es gibt keine Struktur-Aliase mehr; jeder Abschnitt trägt `llb-flaeche` selbst. Die Panel-Fläche der Bezugsreiter bleibt bei der Reiter-Komponente (`reiter.css`).

## Fakten (Label und Wert)

`web/fakten.css`, ohne eigenes Twig-Makro: die Form ist bereits eindeutig `<dl><dt>Label</dt><dd>Wert</dd>…</dl>`, und genau so schreibt sie auch `app.js`. Ein Makro müsste für zusammengesetzte Werte (Gebietspfade mit mehreren Links) Arrays bauen und würde die Vorlagen nur länger machen.

- `.llb-fakten` – zweispaltig, Label schwach, Wert umbruchfähig, Links in Gold.
- `data-dichte="kompakt"` – kleinere Schrift, engerer Abstand, auch mobil zwei Spalten (Karten-Detailspalte, dort sind die Labels kurz).
- Mobil ohne `kompakt` steht das Label über dem Wert.
- `.katalog-werte-raster` (Gegenstandswerte, Instanzfakten) bleibt getrennt: Es ist eine Werte-Tabelle mit Trennlinien, keine Label-Wert-Liste.

## Reiter

`php/templates/components/reiter.twig`, `web/reiter.css`, `web/reiter.js`, geladen über `Shell::styles()` und beide Layouts.

- Makro: `reiter(kennung, titel, eintraege, aktiv, versteckt)`; jeder Eintrag ist `{key, label, panel, zahl}`.
- Der aktive Reiter geht in das Panel darunter über (goldene Oberkante, `margin-bottom:-1px`); Farben nur aus Token.
- Verhalten kommt aus `MQL_REITER.mount`: ein sichtbares Panel, `aria-selected`/`tabindex`, Pfeiltasten/Home/End, optionaler Hash samt Zurück-Knopf, `onShow` für nachgeladene Inhalte.
- Zähler sind optional und erscheinen nur bei Werten größer null; die Seite liefert die Zahl.
- Keine Seite bringt eigenes `role="tablist"`-Markup oder eigene Reiterfarben mit. Wächter: `tests/test_reiter.py`, `tests/browser_reiter.js`.
- Vertrag, Seitenliste und Vorgehen für neue Reiter: [`reiter.md`](reiter.md).

## Hinweiszeile

`web/hinweis.css` – die leise Zeile für Einordnungen, Koordinaten, Hinweise und Intros.

- `.llb-hinweis` färbt nur mit `--schwach` und folgt der umgebenden Schriftgröße.
- `data-groesse="bedienung"` (14 px) und `data-groesse="klein"` (12 px) wählen eine Stufe aus der gemeinsamen Skala; die Karten-Detailspalte nutzt `klein`.
- Ersetzt die früheren Seitenklassen `katalog-hinweis`, `katalog-marken` und `detail-lage`. Auch die statischen Kataloggeneratoren schreiben `llb-hinweis`.
- Kein Hinweisbaustein: `.mql-row-help` (Hilfszeile mit Import-Link in Ergebnislisten) und die Hinweisflächen der Abenteuerübersicht.

## Klappe (Flyout)

`web/klappe.css` und `web/klappe.js` – ein Knopf mit einem Panel daneben.

- Markup: `button[aria-expanded][aria-controls]` plus Panel mit `.llb-klappe-feld` und `hidden`. Das Panel bringt Fläche, Rahmen, Schatten, maximal 60 vh Höhe und Scrollen mit; Öffnungsrichtung, Breite und Inhalt gehören zur Seite.
- Verhalten über `MQL_KLAPPE.bind(knopf, feld, {vorOeffnen, rahmen})`: Klick schaltet, Klick außerhalb schließt (Capture-Phase, damit Marker-Klicks nicht verschluckt werden), Escape schließt und gibt den Fokus zurück, `aria-expanded` wird geführt. `vorOeffnen` füllt Listen erst beim Öffnen.
- Verwendet von Notizenfilter, Vorkommen und der vollständigen Legende auf der Karte. `rahmen` ist standardmäßig das Elternelement des Knopfes; die Legende übergibt ihre Zeile, weil Knopf und Panel dort Geschwister sind.
- Bewusst getrennt: der Filter der Kartenliste ist ein `dialog` (mobil modal), die Kapitel-Ziele sind native `<details>`, und die Familienmenüs gehören zur Kopfzeile.

## Kartenbild mit Pin

`php/templates/components/karte.twig`, `web/karte.css` – der Kartenausschnitt aus dem Client mit einer markierten Stelle.

- Makro `karte(lang, bild, link, pin_x, pin_y, klasse, gross, label, alt)`: Bildname unter `/karten/<sprache>/`, optionaler Link in die Kartenansicht, optionale Pin-Koordinaten, `gross` für die Karte oben auf einer Gebietsseite (640 px).
- `.llb-karte` ist 4:3 mit dunklem Grund hinter transparenten Bildrändern; `.llb-karte-pin` sitzt prozentual im Bild.
- Die Breite bestimmt die Umgebung: 320 px Standard, 240 px in der Zeile neben Text (`.katalog-ort-flex`), volle Spalte im Ortsbereich, 640 px als Gebietskarte.
- Die Zeile `.katalog-ort-flex` (Bild neben Hinweisen und Aktionen) bleibt vorerst eine Seitenregel; sie ist Layout, nicht das Bild.

## Knopf und Aktionszeile

`web/knopf.css` – ein Knopf in drei Arten und drei Größen, dazu die Zeile für Aktionen.

- **Arten:** ohne Attribut die ruhige Flächentaste (Flächenton, Rahmen, goldene Beschriftung); `data-art="haupt"` gefüllt gold für die Hauptaktion einer Seite; `data-art="rand"` goldene Kontur auf dunklem Grund (Import, Plugin, Feedback). Im hellen Theme wird die Konturvariante zur gefüllten Goldtaste.
- **Größen:** Standard 8/14 px; `data-groesse="gross"` 9/18 px, fett, mindestens 44 px hoch; `data-groesse="klein"` 6/10 px mit kompakter Schrift.
- Fokusring, Hoverfarbe und Textfarbe (`var(--grund)` auf Gold, also in beiden Themes lesbar) stehen einmal hier.
- `.llb-aktionen` hält Platzhalter in einer Zeile, bricht bei Enge um; `data-dichte="kompakt"` ist die Stufe der Detailspalte.
- `.katalog-link` ist kein Knopf, sondern ein Textlink in einer Aktionszeile und bleibt unverändert.

## Ziele-Klappe (native `<details>`)

`details.katalog-ziele.llb-flaeche` – die Aufgabenziele auf einer Fläche, getrennt von der Flyout-Klappe oben.

- Der Marker gehört in den Textfluss: `summary { list-style-position: inside; }`. Sonst steht der Pfeil am Flächenrand und die Zusammenfassung wirkt nicht eingerückt.
- Prüfung: die Einzugsmessung in `tests/browser_entity_headers.js`.

## Symbol-Kachel

`web/kachel.css` – eine quadratische Kachel für Entitiesymbole und Gegenstandsbilder.

- `.llb-kachel` mit `data-art="gegenstand"` für Bilder; die bisherigen Klassen `.mql-row-icon`, `.detail-symbol` und `.detail-reward-symbol` laufen auf dieselbe Deklaration.
- Größe über `--llb-kachel`: 64 px in Listen und Katalogköpfen, 54 px auf dem Handy und in der Karten-Detailspalte (`--llb-kachel: 54px`).
- Die Kachel besitzt Rahmen, Rundung, Zentrierung und Bildpassung; Liste und Panel behalten Grid, Flex und Abstände.
- **Laden:** Katalogseiten über `Shell::styles()`, App-Seiten über `php/templates/app/layout.twig`. Ergebniszeilen entstehen in geteilten Skripten (`treffer-zeile.js`), deshalb gehört `kachel.css` ins gemeinsame Layout einer Hülle, nie in eine einzelne Seite.
- **Belohnungen** (`web/belohnungen.js`) setzen dieselbe Kachel: `.bl-symbol.mql-row-icon`, Zeile 64/54 px, die Belohnungsart färbt nur das Symbol.
- Nicht die Kachel: `.gegenstand-symbol` (20 px, inline im Belohnungstext) und `.related-symbol` (schmale Symbolspalte ohne Rahmen).

## Bestehende Bausteine

- **Reiter:** `components/reiter.twig`, `web/reiter.css`, `web/reiter.js` — Vertrag in [`reiter.md`](reiter.md).
- **Filter:** `web/filter-ui.js`, `filter-ui.css`, `filterzustand.js`, `filteradapter.js` mit Seitenkonfigurationen (`aufgaben-filter.js`, `gegenstaende-filter.js`, `handwerk-filter.js`, `karten-aufgabenfilter.js`).
- **Trefferzeile:** `php/templates/entity/_result_row.twig` (serverseitig) und `web/treffer-zeile.js` (im Browser); beide bilden denselben Vertrag ab.
- **Statuswahl:** `web/status.js` (`MQL_STATUS_UI`).
- **Symbol-Kachel:** `.mql-row-icon` in `web/filter-ui.css`, Größen 64/54 px.

## Prüfen

- Ein Baustein wird in DE/EN/FR auf Desktop und Handy geprüft, in Dark und Light.
- `tests/test_darstellung_iststand.py` hält Fläche, Raster, Zeilen und Kartenpanel fest; neue Bausteine bekommen dort eine Prüfung.
- Reiter prüfen `tests/test_reiter.py` und `tests/browser_reiter.js`; der Python-Test hält auch die Dokumentation und ihre Verweise fest.
- Nach dem Entfernen alter Regeln beweist ein `grep`, dass die alten Klassennamen nirgends mehr vorkommen.
