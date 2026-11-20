# 6. Laufzeitsicht

Die folgenden Szenarien beschreiben Interaktionen zur Laufzeit, nicht den vorgelagerten Quelldatenbuild. Fehlerfälle sind nur so weit beschrieben, wie sie im Code sichtbar behandelt werden.

### 6.1 Aufruf einer Detailseite

1. Der Webserver leitet die öffentliche Adresse an `php/public/index.php`.
2. Der Front-Controller bestimmt Sprache und Pfad und ruft `Router::resolve()` auf.
3. Der Router liefert eine kanonische Seite, eine Weiterleitung oder 404.
4. Bei einer Entitätsseite liest `Page` das vorbereitete Seitenmodell und bei Bedarf die benötigten Relationsdaten.
5. Twig rendert die Seite mit gemeinsamer Hülle und lokalisierter Navigation.

Eine fehlende Entitätskennung wird nicht automatisch als „annehmbar“ oder „offen“ interpretiert; der Router prüft vorbereitete Daten und antwortet bei unbekannten Einträgen mit 404.

### 6.2 Übersicht, Filter und Detail-Relationen

```text
Browser → HTTP-Pfad → Router
                    ├─ App-Pfad → Page::renderApp() → App-View/Twig → HTML + JS/CSS
                    ├─ Entitäts-Pfad → Data::page(lang, type, ID)
                    │                  → RelatedLists (nur referenzierte IDs/Shards)
                    │                  → Entitäts-Twig → HTML + Relationsdaten
                    ├─ Listen-Pfad → Data::listPage(kanonischer Pfad)
                    │                → Listen-Twig → HTML + optionaler Filterindex
                    ├─ Sitemap-Pfad → Sitemap (aus sitemaps.json) → XML
                    └─ unbekannt → 404 mit echtem HTTP-Status
```

Die Listenformen werden nicht allein aus einem URL-Muster als gültig angenommen. `Router::listPage()` fragt das vorbereitete Listenmodell ab; unbekannte Kategorien/Seiten bleiben 404. Für eine relationale Detailseite speichert das Seitenmodell meist IDs, während `RelatedLists::forPage()` die passenden Datensätze aus typisierten Shards nachlädt. Bei Aufgaben und Taten wird dieselbe kompakte Zeilenform wie in der öffentlichen Filterliste verwendet. Die allgemeine Regel ist bis fünf direkte Einträge und ab sechs die vorgesehene Filterkomponente (`FilterRegeln::MAX_DIREKTLISTE`); die Umsetzung ist nicht für jede Relation deckungsgleich: insbesondere Item-Aufgaben-/Tatquellen aktivieren den Browserfilter erst ab elf Einträgen, und `used_in` hat eine lokale statt der gemeinsamen Rezeptkomponente. Diese Abweichungen sind in `docs/todos/entitaetenvertrag-abgleich.md` konkret aufgeführt. Der Beziehungskontext soll beim Zurücksetzen erhalten bleiben; dies ist je Adapter zu prüfen.

### 6.3 Anwendung und Sprachpfade

Anwendungsseiten werden in `Catalogue::APP` je Sprache aufgelistet. Alte flache `.html`-Einstiege werden im Front-Controller auf die Sprachpfade überführt. Die Sprache aus einem expliziten Pfad hat Vorrang; Adressen ohne Sprache werden über Sprachwahl/Cookie und `Accept-Language` aufgelöst.

Die technische Priorität bei sprachlosen Adressen ist konkreter: gültiger `llb_sprache`-Cookie, sonst erste unterstützte Sprache aus `Accept-Language` nach Qualitätswert, sonst Englisch. `de-AT`/`de_AT` werden als Deutsch erkannt; andere nicht unterstützte Sprachen fallen auf Englisch zurück. Ein Sprachpräfix im Pfad umgeht diese Erkennung.

### 6.4 Companion-Import

Der Browser liest die ausgewählten Companion-Dateien mit JavaScript und verarbeitet Quest-, Tat-, Ruf-, Handwerks- und Charakterdaten. Die Charakterliste und der aktive Charakter werden im Browser gespeichert; UI-Komponenten lesen den aktiven Spielstand für Fortschrittsdarstellung. Ein Export kann lokal als Sicherungsdatei beziehungsweise über die vorgesehene Plugin-Exportfunktion erfolgen. Der PHP-Katalog benötigt für normale Seitenanfragen keinen hochgeladenen Charakterstand.

### 6.5 Statistik-Endpunkt

`/api/statistik` nimmt JSON-Aktionen entgegen, startet dafür eine Session mit `HttpOnly`-/`SameSite=Lax`-Cookie und ruft `Statistics` auf. Der Zustand liegt in einer JSON-Datei mit exklusiver Dateisperre. Die Datei enthält aggregierte Importzahlen sowie kurzlebige Präsenz- und Idempotenzschlüssel.

Konkret akzeptiert der Endpunkt `heartbeat`, `import` oder als Standardabfrage `current`; Heartbeat-IDs stammen aus der PHP-Session, Importereignisse werden 24 Stunden gegen Doppelzählung dedupliziert. Präsenz läuft nach 1.080 Sekunden ab. Die Dateioperation verwendet `flock(LOCK_EX)`; bei nicht möglichem Dateizugriff liefert die Klasse einen Fallback (`active: 0`, Importbasis 150). Der Client meldet Ereigniszähler und aktive Präsenz, nicht den Charakterspielstand. Das ist eine Aussage über diese Statistikklasse, keine vollständige Bewertung externer Tracker.

Belege für Abschnitt 6: `php/public/index.php`, `php/src/Router.php`, `php/src/Page.php`, `php/src/RelatedLists.php`, `php/src/FilterRegeln.php`, `php/src/Sprache.php`, `php/src/Statistics.php`, `web/companion.js`, `web/speicher.js`, `web/statistik.js`.

### 6.6 Kartenanwendung: abgestufter Datenabruf

1. Der Seitentemplate-Loader liefert zunächst Kartenstruktur, Landschaftsnavigation sowie kompakte Zähl-/Stufenmetadaten aus den `karten-start-*`-Dateien. Die Zählmetadaten nennen auch die Karten-IDs, damit Reiter vor dem Nachladen vollständig zählen.
2. Beim Öffnen eines Landschafts-/Gebietskontexts lädt die Anwendung die entsprechenden Kartenzeilen aus dem passenden Aufgaben- oder Taten-Shard unter `karten-daten/` (bis zu vier gleichzeitig); `MQL_SHARD_MAPS` vermeidet Anfragen für Karten ohne eigene Einträge.
3. Bei Auswahl eines konkreten Eintrags wird dessen Detail-Shard (`detail-map-<id>.js` bzw. `detail-region-<n>.js`) mit Beschreibung, Schritten und vollständigen Zielen hinzugemischt. Der Sprachkatalog (`daten-<sprache>.js` bzw. `daten-taten-<sprache>.js`) bleibt reiner Rückfall für einen alten Auslieferungsstand und wird für die Karte nicht mehr übertragen.
4. Kartenziele, Auftraggeber und Fortschrittsfarben werden aus dem Datensatz und dem lokal importierten Charakterzustand zusammengesetzt.

So muss die Kartenseite nicht zu Beginn alle Beschreibungen und Belohnungen aller Katalogeinträge übertragen. Die lokale Auslieferung/Cacheversion für CSS, JS und Karten-Shards wird beim Release über `stand.js` synchronisiert. Belege: `tools/build_karten_kurz.py`, `tools/build_release.py`, `web/app.js`, `tests/test_kartenstart.py`.

### 6.7 Filterzustand und Rückkehr aus Details

1. Eine Browserliste liest ihren Zustand aus der URL; wo implementiert, wird bei parameterloser URL das sprach- und bereichsspezifische Filtergedächtnis herangezogen.
2. Filteränderungen aktualisieren Treffer, Facetten und Zähler; URL-Verhalten hängt vom jeweiligen Adapter ab.
3. Ein Detailaufruf kann den Listenstand für die Rückkehr mitführen. Die URL hat Vorrang vor lokalem Filtergedächtnis.
4. Reset entfernt den Zustand des betreffenden Bereichs. Bei Relationslisten muss der Besitzerkontext erhalten bleiben.

Nicht jede Oberfläche nutzt denselben Adapter oder Speichermechanismus. [Abschnitt 5.9](05-bausteinsicht.md#59-konkrete-darstellungs--und-filtermatrix-nach-entität-und-auftrittsort) beschreibt die konkreten Ausprägungen; dieses Szenario behauptet keine vollständige Gleichheit.

### 6.8 Fehler- und Grenzabläufe

| Auslöser | Codebelegtes Verhalten | Nicht durch den Code abgedeckt |
|---|---|---|
| Unbekannte Route/ID | echte 404-Antwort | Verfügbarkeit vorgeschalteter Webserver |
| Nichtkanonische Adresse | Router kann auf kanonische URL weiterleiten | Rewritekonfiguration des aktiven Hosts |
| PHP-Exception/fataler Fehler | 500, generischer Text und Errorlog | Logrotation, Alarmierung und Reaktion |
| Fehlender Charakterimport | persönliche Werte bleiben neutral/werden weggelassen | Einheitlicher Fallback für alle Oberflächen |
| Fehlende Relation/Ziel-ID | Link oder Datensatz entfällt bzw. bleibt Text, je Viewmodel/Template | Globale Fallbackregel |
| Statistikdatei nicht nutzbar | definierter Fallbackzustand in `Statistics` | Dauerhafte Speicherung und Betriebsalarmierung |
| Filter-/Assetmodul nicht verfügbar | je nach Seite kann Serverliste/Formular erhalten bleiben | Einheitlicher degradierter Modus für alle Apps |

### 6.9 Nicht belegte Betriebsszenarien

Backup/Wiederherstellung des Produktionsbestands, externe Datenquellenausfälle während des Builds, parallele Deployments, Lastspitzen und Wiederanlauf nach Hostausfall sind im Repository nicht als durchgängige Abläufe beschrieben. Anforderungen und Abläufe dafür müssen mit den Betriebsverantwortlichen geklärt werden.
