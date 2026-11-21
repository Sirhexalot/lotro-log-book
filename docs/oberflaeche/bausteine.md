# Gemeinsame Bausteine

Wiederkehrende Bausteine liegen an einem Ort, damit dieselbe Sache nicht je Seite anders aussieht. Der Ordner `php/templates/components/` enthält das Markup, eine gleichnamige CSS-Datei in `web/` den Look, JavaScript nur dort, wo Verhalten nötig ist.

Ein Baustein wird nur daraus, was **dieselbe Bedeutung** an mindestens drei Stellen hat und sich in **ein Markup** bringen lässt. Reine Ähnlichkeit im Aussehen genügt nicht: sonst entsteht eine Universaldatei mit Schaltern für jeden Sonderfall.

## Namensregeln

- Ordner und Dateien: `components/<baustein>.twig`, `web/<baustein>.css`, `web/<baustein>.js` (nur bei Bedarf).
- CSS-Klassen: `llb-<baustein>`; Varianten über Attribute (`data-dichte="kompakt"`, `data-ton="…"`), nicht über neue Klassennamen.
- Farben, Abstände und Radien ausschließlich aus den Token in `web/gemeinsam.css`.
- Die Überschriftsebene gehört zum Kontext, nicht zum Baustein: h2 auf einer Katalogseite, h3 im Kartenpanel, das schon einen Entitätstitel trägt.

## Fläche (Sektion mit Überschrift)

`php/templates/components/flaeche.twig`, `web/flaeche.css`, geladen über `Shell::styles()` und im Kartenapp über `karte.twig`. Katalogseiten und Karten-Detailspalte verwenden dieselben Token, damit „Beschreibung“, „Belohnungen“ und „Voraussetzungen“ auf beiden Flächen gleich aussehen.

- Makro: `flaeche(titel, ebene = 2, klasse = '', kennung = '')`, Inhalt über `{% call %}`.
- Variante `data-dichte="kompakt"` für die schmale Detailspalte.
- Übergangsweise Alias-Selektoren für Abschnitte, die ihre Fläche noch aus ihrer Seitenstruktur beziehen (`.entity-detail-reading > section` und Verwandte). Sie fallen weg, sobald die Seiten selbst `llb-flaeche` tragen.
- Die Fläche der Bezugsreiter bleibt vorerst in `web/katalog.css` (`.item-bezugsreiter > [role="tabpanel"]`), weil die Reiter-Komponente ihren Panel-Look selbst besitzt.

## Fakten (Label und Wert)

`web/fakten.css`, ohne eigenes Twig-Makro: die Form ist bereits eindeutig `<dl><dt>Label</dt><dd>Wert</dd>…</dl>`, und genau so schreibt sie auch `app.js`. Ein Makro müsste für zusammengesetzte Werte (Gebietspfade mit mehreren Links) Arrays bauen und würde die Vorlagen nur länger machen.

- `.llb-fakten` – zweispaltig, Label schwach, Wert umbruchfähig, Links in Gold.
- `data-dichte="kompakt"` – kleinere Schrift, engerer Abstand, auch mobil zwei Spalten (Karten-Detailspalte, dort sind die Labels kurz).
- Mobil ohne `kompakt` steht das Label über dem Wert.
- `.katalog-werte-raster` (Gegenstandswerte, Instanzfakten) bleibt getrennt: Es ist eine Werte-Tabelle mit Trennlinien, keine Label-Wert-Liste.

## Bestehende Bausteine

- **Reiter:** `components/reiter.twig`, `web/reiter.css`, `web/reiter.js`.
- **Filter:** `web/filter-ui.js`, `filter-ui.css`, `filterzustand.js`, `filteradapter.js` mit Seitenkonfigurationen (`aufgaben-filter.js`, `gegenstaende-filter.js`, `handwerk-filter.js`, `karten-aufgabenfilter.js`).
- **Trefferzeile:** `php/templates/entity/_result_row.twig` (serverseitig) und `web/treffer-zeile.js` (im Browser); beide bilden denselben Vertrag ab.
- **Statuswahl:** `web/status.js` (`MQL_STATUS_UI`).
- **Symbol-Kachel:** `.mql-row-icon` in `web/filter-ui.css`, Größen 64/54 px.

## Prüfen

- Ein Baustein wird in DE/EN/FR auf Desktop und Handy geprüft, in Dark und Light.
- `tests/test_darstellung_iststand.py` hält Fläche, Raster, Zeilen und Kartenpanel fest; neue Bausteine bekommen dort eine Prüfung.
- Nach dem Entfernen alter Regeln beweist ein `grep`, dass die alten Klassennamen nirgends mehr vorkommen.
