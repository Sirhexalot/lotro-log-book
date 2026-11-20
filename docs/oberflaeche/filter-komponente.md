# Gemeinsame Filterkomponente – lokaler Implementierungsstand

## Umfang

Die gemeinsamen Bausteine sind implementiert und mit isolierten synthetischen
Testseiten geprüft. **Gegenstandssuche, Sets und Belohnungen sind jetzt in den
regulären PHP-Templates lokal angebunden, aber noch nicht veröffentlicht.**
Auftraggeber, Landmarken, Fraktionen, Instanzen sowie die drei Handwerksreiter
sind ebenfalls lokal auf die Komponente migriert. Keine
Veröffentlichung ist erfolgt. Der detaillierte Umsetzungsplan liegt unter
`~/.opencode/plan/lotro-filter-navigation-handwerk-2026-11-12.md`.

- `web/filterzustand.js`: reine Zustandsnormalisierung, Aktionen, Chips und
  adapterbasierte URL-Codecs; direkt mit Node testbar.
- `web/filteradapter.js`: deklarative Query-Codecs, Clientadapter mit
  Deduplizierung/Pagination und Serveradapter mit validiertem HTML-Modell.
- `web/filtergedaechtnis.js`: kompatible read/write/clear-API; neue Einträge
  verwenden `{v:2,q:...}`, `readState` erkennt Legacy- und unbekannte Versionen.
- `web/filter-ui.js` und `.css`: eine gemountete UI je Listenroot, Desktopsidebar,
  nativer Mobil-Dialog, Fokusführung, Chips, Rangevalidierung, History und
  Requestabbruch. UI-Texte kommen aus der Konfiguration.

## Adaptervertrag

`MQL_FILTER_UI.mount(root, {config, adapter, characterContext})` liefert
`ready`, `dispatch`, `getState`, `setCharacterContext` und asynchrones `destroy`.
Das Root benötigt ein Element mit `data-filter-results`. Initiales GET-Markup
kann mit `data-filter-fallback` markiert werden und wird nur im erweiterten
Modus versteckt. Die Komponente ist nicht innerhalb eines konkurrierenden
Formularcontrollers zu mounten. Alte Seitenlistener beim Migrieren ablösen.

`adapter.load(state, {signal, characterContext})` liefert
`{state,total,facets,pagination,capabilities,payload}`.
`adapter.renderResults(result,target)` rendert ausschließlich die Ergebnisse.
Fachliche Filterprädikate, Sortierung und Facetten bleiben im Datenadapter.
Der öffentliche Serveradapter serialisiert nur den konfigurierten URL-Codec,
niemals den Charakterkontext.

Serverantwort: genau ein Root mit `data-filter-area="<bereich>"` und
`data-filter-schema="1"`, darin ein JSON-Skript
`type="application/json" data-filter-model` und genau ein
`data-filter-results`-Fragment. JSON in PHP HTML-sicher mit JSON_HEX_TAG,
JSON_HEX_AMP, JSON_HEX_APOS und JSON_HEX_QUOT serialisieren. Der bestehende
GET-Endpunkt muss ohne JavaScript vollständig bedienbar bleiben.
Paginationlinks des erweiterten Modus erhalten `data-filter-page="2"` usw.
Ein vollständiges ausführbares Beispiel liefern die isolierten Testfixtures.

## Reproduzierbare Tests

### Entitätenvertrag

`docs/datenraum/lotro-datenraum-entitaeten.json` ist die eine Quelle für die
Ausprägung jeder Entität: Zeilenfelder, Filtergruppen, erlaubte Relationen,
Fortschritt und der Status jeder Liste.

- `component`: die Liste nutzt die gemeinsame Filterkomponente.
- `direct`: höchstens fünf Einträge, direkte Darstellung.
- `open`: bekannte Lücke mit Grund; `tests/test_relationen_audit.py` prüft, dass
  sie in den echten Daten tatsächlich über der Schwelle liegt.

Die Listenzeile trägt nur Identität und Einordnung (Symbol, Name, Beruf/Art,
Stufe oder Lernstand) und führt selbst zum Detail. Zutaten, Quellen, Werte und
 weitere Angaben gehören ausschließlich auf die Detailseite;
`tests/test_entitaeten_vertrag.py` hält das fest.

### Relationale Listen auf Detailseiten

Für jede relationale Liste auf einer Detailseite gilt dieselbe globale Schwelle:

- **0 bis einschließlich 5 Einträge:** direkte Liste, ohne Filterkomponente.
- **Ab 6 Einträgen:** gemeinsame Filterkomponente mit derselben Ergebnisdarstellung
  wie auf der zugehörigen Standardliste; auf Detailseiten nutzt sie die volle
  Inhaltsbreite.
- Die Suchzeile nutzt diese volle Breite. Das Suchfeld wächst flexibel, ohne
  Mindestbreite, damit der Suchknopf nicht aus dem Bildschirm läuft. Die
  Trefferleiste darf einzelne Bedienelemente umbrechen; sie darf aber weder
  den Filtercontainer überschreiten noch einen horizontalen Seitenüberlauf
  erzeugen. Auf Mobilgeräten sind Umbrüche innerhalb der Trefferleiste erlaubt.

Die Beziehung selbst bleibt fester Kontext und kann durch „Zurücksetzen“ nicht
entfernt werden. Die Schwelle ist im PHP-Seitenmodell als
`FilterRegeln::MAX_DIREKTLISTE` definiert und wird vom Relation-Renderer
übernommen.

Lokale Gegenstandssuche (kein Build/Upload, bindet nur an Loopback):

```bash
python3 tools/filter_vorschau.py --port 8924
```

Adresse: `http://127.0.0.1:8924/gegenstaende.html?lang=de` (auch en/fr).
Die Vorschau ersetzt ausschließlich beim lokalen HTTP-Aufruf den alten
Seitencontroller durch `gegenstaende-filter.js`. Spielkategorien, Namen und
Suchdaten stammen aus dem vorhandenen Gegenstandsindex, nicht aus Fixtures.
Gegenstandslinks öffnen derzeit die öffentliche Detailseite.

```bash
node tests/test_filterzustand.js
node tests/test_filteradapter.js
NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_filter_consistency.js
NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_item_filter_preview.js
```

Der Browserlauf startet und beendet einen eigenen HTTP-Fixtureserver und
isolierte Chromium-Kontexte. Er berührt weder echte Charakterstände noch
Hosting oder Vorschauprozesse anderer Sitzungen. Playwright wird aus der
vorhandenen Installation geladen; kein neuer npm-Build ist nötig.

Geprüft: DE/EN/FR × Client/Server × zehn Viewportbreiten
(360/390/430/768/900/901/1000/1001/1280/1440), Checkbox-ODER, Rangevalidierung,
Chips, Reset, Reload, explizit leere Suchadresse vor Gedächtnis, getrennte
Bereichsschlüssel, Dialog/Focus-Trap/Escape/History, Querformat,
zehn aufeinanderfolgende Updates ohne doppelte Bindungen, Fehlerantworten,
ungültiges Modell/falscher Bereich, konkurrierende Requests, Abbau/Remount
und serverseitige Suche ohne JavaScript. Screenshots liegen standardmäßig
unter `~/.cache/llb-filter-browser-tests`, konfigurierbar über
`LLB_FILTER_ARTIFACTS`; keine Bildartefakte im Repository.

## Verbleibende Abnahme

- Ausbau der Abnahme der echten Referenzen: vollständige Filterkombinationen,
  Same-Member-Prädikat, Pagination, Herkunft der Stufenwerte und Detailrückwege.
- Personenbezogene Verfügbarkeitsregeln samt Import-/Backupintegration.
- Echte Geräteprüfung mit iOS-Safari, Bildschirmtastatur und Safe Area.
- Screenreaderprüfung, 200%-Zoom und vollständige Detailrückwege/Scrollrestore.

Fixtureabnahme ist ausdrücklich keine Abnahme dieser noch nicht migrierten
Produktionsseiten und kein Nachweis eines physischen iOS-Tests.

### Nachprüfung der echten lokalen Gegenstandssuche

Nach Nutzer-Screenshot korrigiert: Suchfeld und Zähler/Sortierung liegen in
getrennten flexiblen Zeilen; Baumknoten zeigen Checkbox und Aufklappen ohne
doppelte Beschriftung; leere Kinderlisten erzeugen keinen Aufklapper.
Ergebniszeilen enthalten wieder Symbol, Seltenheitsfarbe und Metadaten.
Zähler werden sprachgerecht formatiert. Der neue reale Index-Browserlauf prüft
DE/EN/FR bei 390/768/901/1280/1440 px, Sortierfeld im sichtbaren Bereich,
fehlenden horizontalen Overflow, Zeilenbestandteile und mobile Auswahl.
Desktop- und Mobil-Screenshots wurden zusätzlich visuell geprüft.

### Verbindliches Inhaltsraster, lokal umgesetzt

`filter-ui.css` definiert jetzt statt einzelner Marker-/Margin-Korrekturen:

- 280/300-px-Filterspalte, 24-px-Spaltengasse und gemeinsame obere Kante von
  Filtergruppen und Ergebnisliste. Trefferleiste/Chips/Fehler liegen auf der
  Ergebnisspalte, Suche weiterhin auf voller Inhaltsbreite.
- Filterzeile: 16 px Pfeil, 16 px Checkbox, flexibler Text, 7ch Trefferzahl,
  jeweils 8 px Zwischenraum. SVG-Pfeile ersetzen Textzeichen/native Marker.
  Gruppenüberschriften und flache Optionen verwenden dieselben Achsen.
- 16 px Einzug je Unterebene, unveränderte rechte Zahlenkante; Gruppenüberschriften
  und einzeilige Optionen sind in ihrer Zeile zentriert. Bei umgebrochenen
  Labels bleiben Checkbox und Aufklapppfeil an der **ersten Textzeile**.
  Desktop mindestens 32 px, Mobil mindestens 44 px Zeilenhöhe. Karten
  innen/untereinander je 12 px.
- Ergebniszeile: 32 px Symbolspalte, 12 px Textabstand, identische Kante für
  Titel/Metadaten und durchgehende Trennlinien; Pagination im Ergebniscontainer.

Der reale Browserlauf misst zusätzlich Checkbox-/Text-/Zahlenfluchten zwischen
Kategorie und Seltenheit, Pfeil-/Checkboxmittellinien, künstlich mehrzeilige
Labels, Ergebnistextachsen und gemeinsame Containerkanten (Toleranz 1 CSS-px).
Dieses Raster gilt inzwischen für alle unten dokumentierten migrierten Seiten.

## Reguläre PHP-Referenzen

`tests/browser_filter_php.js` prüft Gegenstandssuche und Sets in DE/EN/FR,
390/901/1440 px, Sets-Auswahl/Reload, Dialog und No-JS-Suche mit echten Daten.
Der lokale Testlauf ist grün; außerdem 198 Python-Tests im aktuellen Stand.
Die Sets behalten ihr serverseitiges Prädikat und die GET-Formulare. Der
Serveradapter liest strukturierte Formularfelder plus `data-filter-total`,
statt Zähler aus übersetzten Texten zu parsen. Auf migrierten Roots beendet
sich der alte sets.js-Controller vor dem Binden von Listenern.

Aktueller lokaler PHP-Server auf Port 8927 verwendet einen isolierten
Composer-Autoloader unter `~/.cache/llb-php/filter-vendor-r4d4wh8c` und Daten
unter `~/.cache/llb-php/phpdata`; bestehende gemeinsame Vendor-Dateien blieben
unverändert. Lokale Adressen: `/de/gegenstandssuche/` und `/de/set/`.

Beim Vorbereiten der nächsten Welle wurde Factions::query korrigiert: Die
Methode erhält nun die bereits geladenen Fraktionszeilen für die erlaubten
Geografiewerte. Die Fraktionsseite ist inzwischen ebenfalls migriert (siehe unten).

## Lokaler Rollout: Serverkataloge und Handwerk

Die obige Referenzphase ist inzwischen erweitert: `filter-server.js` liest
die bestehenden GET-Formulare von Sets, Auftraggebern, Landmarken, Fraktionen
und Instanzen. Geografie bleibt Region → Landschaft; verschachtelte Optionen
können über `groupId` auf die fachlich getrennte Landschaftsgruppe verweisen.
Damit bleiben die bisherigen UND/ODER-Prädikate im PHP erhalten. Sortierung,
Zahlenbereiche, Nachweischeckbox und Pagination bleiben normale GET-Parameter.
Auf migrierten Listen laufen weder sets.js noch auftraggeber.js als zweiter
Filtercontroller. Auftraggeberdetails verwenden ihre bisherige Fortschrittslogik.

`handwerk-filter.js` verwaltet genau eine aktive Filterinstanz für Berufe,
Rezepte und Rohstoffe. Reiter und URL bleiben beim Wechsel/Reload erhalten;
Suchtexte sind pro Reiter getrennt. Beruf/Stufe/Umfang können übernommen
werden. Der alte Rezeptcontroller liefert nur seinen Ergebnisrenderer;
alte Filter-/Reiterlistener werden auf der migrierten Seite nicht registriert.
Die Berufsübersicht ist ohne Import ein öffentlicher Katalog; mit belegten
Berufsdaten kann der Umfang auf eigene Berufe eingeschränkt werden.

Materialien stammen aus allen Pflicht-/optionalen Rezeptzutaten und werden
nach Item-ID dedupliziert. Verwendungen behalten alle Berufs-/Stufenbezüge;
Beruf und Stufe müssen von derselben Verwendung erfüllt sein. Herstellungslinks
stammen aus Ergebnis-IDs der Rezepte. Explizite Sammelvorkommen sind eigene
Resource-Datensätze mit echten Kartenreferenzen, NICHT per Namen mit Items
verbunden. Unbekannte Itemherkunft bleibt unbekannt. Geografiefilter trifft
direkte Sammelvorkommen, keine geratenen Verarbeitungsketten.

Positive Rezeptkenntnis aus alten Importen bleibt sichtbar und filterbar.
Ein negativer Lernstandfilter ist nur bei explizitem complete-Rezeptnachweis
verfügbar; dieser Umbau erzeugt selbst keinen solchen Nachweis. Importer und
Sicherungsformat wurden dafür nicht stillschweigend umgestellt.

Neue Abnahme: `tests/browser_filter_rollout.js` prüft 21 reale Sprach-/Seiten-
bzw. Reiterkombinationen: alle fünf angefragten Bereiche in DE/EN/FR,
Desktop/Mobil, Auswahl/Reset/Reload, Server-Back/Forward, Geografie-Kindauswahl,
Serverformulare ohne JS sowie synthetischen Legacy-Rezeptstand ohne erfundene
Negativzustände. Zusätzliche Referenztests und 60 Fixture-Viewportkombinationen
bleiben bestehen. Aktuell 198 Python- und 13 Node-Testdateien grün.

Screenshots der echten Seiten liegen unter `~/.cache/llb-filter-browser-tests/`.
Kein Upload, kein Push und kein physischer iOS-/Screenreader-Test erfolgt.
Die vollständige ursprüngliche Handwerks-Datenpipeline/Importerweiterung ist
ein eigener Ausbau, nicht durch die Filterintegration als erledigt behauptet.

## Nachprüfung: leere Gruppen und Fundgebiete

Leere Optionsgruppen werden nach Facettenauswertung verborgen. Ausgewählte
Nulltreffer bleiben sichtbar/entfernbar. Öffnungszustände werden unabhängig
vom DOM gehalten, damit nach Rückkehr einer ausgeblendeten Gruppe nicht
ungewollt alle zuvor offenen Gruppen geschlossen sind.

Fundgebiete im Materialreiter bilden Region → Landschaft → benannter Fundort.
Page.php liefert dafür ausschließlich die bereits vorhandene sprachrichtige
Spielkartenhierarchie (ID, Parent, Tier, Name) als sicheres JSON. Gruppierung
erfolgt über die im Resourceindex belegte Karten-ID und Elternkette; fehlende
Zuordnung wird ausdrücklich benannt statt geraten. Region/Landschaft/Fundort
bleiben getrennte Filtergruppen mit gemeinsamem verschachteltem UI.

Rezeptkategorien sind im geprüften `CraftingUICategory.xml` ein flaches Enum
mit code/name, ohne Parentfeld. Der vorhandene Rezeptexport trägt pro Rezept
genau eine solche Kategorie und einen Beruf. Keine darüberliegende
Kategorienhierarchie als Spieldaten ausgeben. Berufsfilter grenzt die angebotenen
Kategorien bereits über Facetten ein.

`tests/browser_filter_refinements.js` prüft DE/EN/FR: verschwundene leere
Rüstungsart bei Waffensets, erhaltene aktive Nullauswahl, verschachtelte
Fundgebiete, Landschaftsauswahl, Reload und Mobilansicht.
