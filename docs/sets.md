# Sets: Datenbasis und nächste Integration

Stand: 09.11.2026. **Setliste, Detailseiten und Navigation sind veröffentlicht.**
Die Auswertung bleibt bei belegten Angaben;
fehlende Werte, Effekte und Gegenstände werden sichtbar als unvollständig behandelt.

## Generator

```bash
python3 build_sets.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
python3 -m unittest tests.test_sets tests.test_sets_php tests.test_set_viewmodel -v
```

`build_sets.py` liest `sets.xml`, `stats.xml`, `classes.xml` und die
DE/EN/FR-Labels des lokalen Companion-Clientexports. Gegenstände werden über
`daten/items.json` und `daten/gegenstand-details.json` anhand ihrer IDs
zugeordnet. Die Abhängigkeiten werden nur gelesen.

Ausgabe (generiertes Spielmaterial, von Git ausgeschlossen):

- `daten/sets.json`: vollständige Setmodelle samt Quellenmetadaten,
  Teileverweisen und typisierten Bonusdefinitionen.
- `daten/sets-suche-de.json`, `…-en.json`, `…-fr.json`: sprachrichtige
  Listenindizes mit Filtermerkmalen pro Teil.
- `daten/sets-pruefung.json`: maschinenlesbarer Prüfbericht.

Quell- und Zielpfade lassen sich mit `--quelle`, `--items`, `--details` und
`--ziel` überschreiben. Ein dedizierter Zielordner wird angelegt, aber nicht
geleert. Pflichtquellen fehlen nicht stillschweigend: der Bau bricht dann ab.

## Datenvertrag

- Neue öffentliche Set-IDs: achtstelliges Großbuchstaben-Hex der Spiel-ID.
  Die dezimale Quell-ID bleibt zusätzlich erhalten. Namen sind keine Identität;
  gleichnamige Sets werden nicht zusammengelegt.
- Setnamen nutzen die sprachrichtigen Labels. Die zusätzliche Zeile mit der
  Höchststufe wird nicht Teil des Namens. Technische Namen wie `DNT` werden
  nicht als Spielertexte übernommen.
- `level` und `maxLevel` bleiben als getrennte, rohe Quellenmetadaten erhalten.
  Sie sind **kein** bestätigtes Minimum/Maximum und kein Setfilter.
- Fehlende Gegenstände bleiben als Verweis mit `available: false` im Set.
  Fehlende Gegenstandsdaten, Übersetzungen und widersprüchliche Rückverweise
  werden separat gemeldet. Nicht verfügbare Teile dürfen keinen Detailseitenlink
  bekommen.
- Filtermerkmale bleiben pro Teil erhalten. Ein Klassenwert von Teil A darf
  nicht mit der Rüstungsart oder Stufe von Teil B einen Scheintreffer ergeben.
- Leere/unbenennbare Sets bleiben im vollständigen Modell und Prüfbericht,
  fehlen aber im Listenindex. Eine fehlende Klassenauflösung wird nicht als
  zuverlässig bekannt oder als „alle Klassen“ ausgegeben.
- Bonusgruppen erhalten ihre Teileanzahl und alle ursprünglichen Definitionen.
  Konstanten, Skalierungsverweise, Operatoren, Beschreibungen und Effekte werden
  nicht miteinander verrechnet oder still entfernt.
- `display_ready` gilt für vollständige, übersetzte Effekt-/Overridebeschreibungen
  und typisierte Konstanten (`INTEGER` oder ausdrücklich `isPercentage`).
  `SUBSTRACT` kehrt das Vorzeichen um; `SET` wird nicht als Addition angezeigt.
  Prozentwerte werden als gespeicherte Prozentpunkte angezeigt, nicht mit 100
  multipliziert. Andere Operatoren und nicht endliche Werte bleiben gesperrt.
- Ein übersetzter Statname allein belegt keine Einheit. Skalierungskurven werden
  nicht mit dem unklaren Set-Level oder einer beliebigen Gegenstandsstufe
  ausgewertet. Solche Werte erhalten einen ausdrücklichen Hinweis.
- Mehrfachklassen aus der Quelle (z. B. `Burglar;Corsair`) sind einzelne Filterwerte.
  Geschmeide wird über die ItemClass 49 des Clients erkannt; Enum-Labels kommen
  aus der Quelle, nicht aus Setnamen.

## Prüfstand des integrierten Baus

2.223 Setdefinitionen, 2.218 Listeneinträge, 11.159 Teileverweise und 4.479
Bonusgruppen. Vier Sets sind leer, ein Set hat nur einen technischen Namen.
498 Teileverweise aus 46 Sets fehlen im aktuellen Gegenstandskatalog.
672 Teileverweise haben keine Detaildaten. 52 Bonusgruppen haben eine
auffällige Teileanzahl. 1.997 Statdefinitionen bleiben ohne sichere vollständige
Darstellung; bei 885 Bonusbestandteilen fehlen brauchbare Labels in mindestens
einer Sprache. Diese Zahlen sind Prüfstände, keine dauerhaften Katalogzahlen.

## Oberfläche und Integration

- Liste: `/de/set/`, `/en/set/`, `/fr/ensemble/`; Detail mit stabiler Hex-ID,
  z. B. `/de/set/70069B64/` für das Umbar-Set mit den acht Teilen.
- GET-Filter: `q`, `class[]`, `category[]`, `armour[]`, `from`, `to`, `page`.
  Mehrfachwerte einer Gruppe gelten als Oder, verschiedene Gruppen als Und.
  Alle Kriterien müssen durch dasselbe verfügbare Teil erfüllt sein. Fehlende
  Angaben gelten nicht als passende Werte. Klassenspezifische Filter schließen
  nachweislich uneingeschränkte Teile ein, nicht jedoch unbekannte Klassenangaben.
- Facetten zählen Sets ohne die eigene Filterauswahl, mit allen anderen
  Kriterien. Gewählte Nulltreffer bleiben sichtbar. Je Seite 30 Ergebnisse.
- Suche/Filter/Pagination funktionieren serverseitig ohne JavaScript. Mobil
  klappt `sets.js` die Filter ein; ohne JS bleiben sie bedienbar offen.
  Mit JavaScript übernehmen Checkboxen und Stufenänderungen die Filter sofort:
  Treffer und Facetten werden nachgeladen, ohne Filterposition/Fokus zu verlieren.
  „Anwenden“ ist dann ausgeblendet; ohne JS bleibt der Knopf erhalten.
  Überholte Anfragen werden abgebrochen, Zurück/Vorwärts stellt die Filter wieder
  her. Sprachlinks und Canonical-/Robots-Angaben folgen dem aktuellen Filterstand.
- Details verwenden vorhandene Item-Viewmodel-Werte. Kein zweiter Statsrechner,
  keine Besitz-/Vollständigkeitsbehauptung über importierte Charaktere.
- `Sets.php` liefert die gemeinsame PHP/Twig-Hülle und DE/EN/FR-Texte.
  `tools/set_viewmodel.py` erzeugt Setshards und ersetzt die alte Set-Minianzeige
  am Gegenstand durch verlinkte Setnamen, ohne den falschen Stufenbereich.
- Menüeintrag in `Shell.php` und `menue.js`, zentrale Suche mit Typ `s` in
  `build_suche.py`/`suche.js`. Suchdaten nach dem Setbau für alle Sprachen erneuern.
- Setlisten und Details stehen in den Sprachsitemaps. Gefilterte Listen tragen
  `noindex,follow` und eine normalisierte eigene Canonical-URL. Sprachwechsel
  erhält die Filter, beginnt aber auf Seite 1, da Suchbegriffe sprachabhängig sind.
- Der Release prüft Setassets, Templates und alle drei Filterindizes. Tracking
  kommt unverändert aus der gemeinsamen Hülle; keine Spielstände im Release.

## Prüfung und verbleibende Grenzen

Generator-, PHP-Filter-/Routing- und Viewmodeltests prüfen Vorzeichen, unsichere
Skalierung, Textvorlagen, gleiche Filterzeugen, Mehrfachklassen, echte 404,
Namensgleichheit und fehlende Teile. Browserprüfung lokal in DE/EN/FR auf Desktop
und Mobil: Filter/Neuladen, Umbar mit acht Karten und drei Bonusstufen,
unvollständiges Set, Gegenstandsverweis, Suche/Details ohne JavaScript.

Die vollständige Python-Suite hat weiterhin den bereits vorher vorhandenen
Fehler in `test_katalogseiten.test_one_public_address_per_entity`: sie erwartet
den früheren Apache-Block `LLB ENTITY URLS` statt des PHP-Blocks. Daraus keine
vollständige grüne Testsuite behaupten.

Noch nicht aufgelöste Stat-/Effektangaben sind Datenlücken, keine stillen Nullen.
Eine weitergehende Zahlenberechnung benötigt belegte Einheiten und die korrekte
Bezugsstufe.

## Veröffentlichung 09.11.2026

Release aus `~/.cache/llb-release`: zuerst 2.309 Datendateien (191,6 MB), danach
18 Anwendungs-/Assetdateien (15,4 MB) per bestehendem FTPS-Uploader übertragen.
Betroffene kompilierte Twig-Vorlagen wurden gezielt geleert; `.htaccess` blieb
unverändert. Keine Charakterdaten veröffentlicht.

Live geprüft: Listen und Sofortfilter in DE/EN/FR, Desktop/Mobil, Umbar mit acht
Teilen und drei Bonusstufen, zentrale Set-Suchtreffer und Gegenstandsverweis.
Alle drei Set-Sitemaps liefern je 2.219 URLs. Kleinschreibung und `.html` werden
per 301 kanonisiert; unbekannte Sets liefern 404, der private Setindex 403.
Die allgemeinen Live-URL-Checks bestehen ebenfalls. Die Besucherzähler waren
im isolierten Browser-Test blockiert; deren tatsächliche Übermittlung wurde
damit nicht getestet. Eine zusätzliche Startseitenankündigung war nicht Teil
dieses Releases.
