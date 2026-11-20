# Kartenreiter: Zähler beim ersten Bild, Details ohne Vollkatalog

**Status:** umgesetzt, lokal geprüft (20.11.2026)
**Bereich:** Kartenansicht (Aufgaben und Taten), Startdaten, Shards

## Beobachtung

In der Kartenansicht zeigten Reiter von Untergebieten, die im Spiel eine
Ebene tiefer liegen als die gemeinsame Gebietsliste sie anzeigt, `0/0`:

```text
Eriador › Dunland-Überblick
├─ Das Eisenloch      0/0   (12 Aufgaben, Pfad über Pforte von Rohan)
├─ Galtrev            0/0   (30, Pfad über Dunland)
├─ Isengart           0/0   (14, Pfad über Nan Curunír)
└─ Tâl Methedras      0/0   (13, Pfad über Dunland)
```

Nach einem Klick auf einen der Reiter sprangen die Zahlen auf den richtigen
Wert; die Liste blieb aber leer, weil der angeklickte Platzhalterknoten keine
Einträge hatte. Ein Direktlink wie `#map-268446977/268446985` zeigte zusätzlich
die Liste von Breeland (37 Zeilen) unter der Überschrift „Isengart“.

Der erste Klick auf eine Aufgabe lud außerdem den vollständigen Katalog
(`daten-de.js`, 22,7 MB bzw. 4,5 MB gepackt), nur um Beschreibung, Schritte
und die vollständigen Ziele zu erhalten.

## Ursachen

1. Der Zähler-Index der Startdatei war nur nach dem vollen Spielpfad
   (`Eriador|Dunland-Überblick|Nan Curunír|Isengart`) aufgebaut. Der flache
   Reiter heißt `Eriador|Dunland-Überblick|Isengart` und fand nichts.
2. `landschaftReiter()` lief einmal vor dem Shard-Laden; danach wurden nur
   Liste und Detail neu gezeichnet.
3. `gleicheGebieteAn()` suchte vorhandene Knoten nur auf derselben Ebene. Für
   tiefer liegende Gebiete entstand ein leerer Doppelknoten neben der
   Landschaft.
4. Beim Start mit Hash wurde zusätzlich das Standardgebiet (Breeland)
   geöffnet; dessen spät eintreffende Shards überschrieben die verlinkte
   Liste.
5. Die Kurzfassung der Karte enthält bewusst keine Beschreibung, Schritte und
   nur ein Ziel. Der Detailbereich holte dafür den ganzen Katalog.
6. Die Startdatei kannte die vorhandenen Shards nicht. Übersichtskarten wie
   `268446977` haben keinen eigenen Shard, kosteten aber bei jedem Öffnen
   einen 404. Bis zu zwölf Untershard-Dateien wurden nacheinander geladen.

## Umsetzung

- [x] Zählmetadaten zusätzlich nach Karten-ID indizieren (`fk` in der
      Zusammenfassung, `zusammenfassungNachKarte` in `app.js`). Reiter zählen
      jetzt vor jedem Nachladen richtig.
- [x] `zaehlEintraege()`: Pfad zuerst, dann Karten-ID, dann geladene Einträge.
- [x] `gleicheGebieteAn()` sucht vorhandene Karten knoten auch tiefer und
      bevorzugt den belegten Knoten; keine leeren Doppelknoten mehr.
- [x] Die Promotionskopie der Übersichtskarte entfernt keine Kinder mehr
      (`__kartenansicht-eigene` entfällt); Reiter und Liste der Übersicht
      bleiben vollständig.
- [x] `landschaftOeffnen()` wartet auf die Shards der Landschaft und zeichnet
      dann Reiter, Liste und Detail aus einem Stand. Ein Auftragszähler
      verhindert, dass ein spätes Laden eine neuere Auswahl überschreibt.
- [x] Start mit Hash öffnet nur noch das verlinkte Gebiet.
- [x] `tools/build_karten_kurz.py` schreibt je Karte bzw. Region einen
      Detail-Shard (`detail-map-<id>.js`, `detail-region-<n>.js`) mit
      Beschreibung, Schritten, vollständigen Zielen und `u`/`gi`/`nq`/`pq`/
      `tl`/`lp`. Der Katalog (`daten-<sprache>.js`) bleibt nur Rückfall.
- [x] `MQL_SHARD_MAPS` nennt die vorhandenen Karten-Shards; fehlende werden
      nicht mehr angefragt (kein 404 für Übersichtskarten).
- [x] Shards werden mit vier gleichzeitigen Anfragen geladen statt nacheinander.
- [x] `tests/test_kartenstart.py` prüft Detail-Shards, Feldumfang,
      Start-Metadaten und den Ladepfad.

## Abnahme

- Reiter in DE/EN/FR zeigen die Zahlen vor dem Öffnen: Isengart 14,
  Das Eisenloch 12, Galtrev 30, Tâl Methedras 13 (Aufgaben); Isengart 2
  (Taten, die anderen drei haben keine Taten).
- Klick auf einen Reiter zeigt dieselbe Zahl in Liste und Detail.
- Direktlink auf ein Untergebiet zeigt dessen Liste, nicht die des
  Standardgebiets.
- Erste Aufgabenauswahl lädt nur `detail-map-*.js` (Isengart 16 KB, größter
  Shard Auenland 797 KB), nie `daten-de.js`.

## Weitere Inhalte: Kacheln fehlten (20.11.2026)

Der Block **Weitere Inhalte** stand als leere Überschrift unten auf der
Gebietsübersicht: keine Kachel für Epische Geschichte, Klassenaufgaben,
Herkunftsaufgaben, Feste, Missionen, Instanzen, Handwerk, Aufgabenbrett und
Weitere Aufgaben.

Zwei Ursachen:

1. Die Kacheln entstanden aus den geladenen Katalogeinträgen
   (`quests.some(q => q.th === …)`). Beim Karten-Erststart ist `quests` leer,
   also blieb der Block leer. Die Entscheidung kommt jetzt aus den kompakten
   Startmetadaten (`th`, `a` in der Zusammenfassung), die vor jedem Shard
   vorliegen.
2. Die Themenkennung `th` fehlte in den gebauten Daten. `build_daten.py` las
   die Aufgaben aus der iCloud-Kopie des Plugin-Katalogs (Stand 09.11.), die
   keine `theme:`-Pfade enthält; nur Taten kamen aus dem lokalen Checkout.
   Der Aufgabenbau nutzt jetzt zuerst `../MagicQuestLog/plugin/…/Quests_*.lua`
   und fällt nur bei fehlender Datei auf iCloud zurück.
   `SEKTIONEN` übersetzt die Pfadnamen `@themeEpic`, `@themeClass`,
   `@themeOrigin`, `@themeOther` (vorher stand „themeEpic“ als Titel da).

Die Epische Geschichte öffnet weiterhin die Kartenansicht, nicht den Finder.
Ihre Kapitel liegen in `thema-epic-<sprache>.js` (58 KiB); die Kartenansicht
lädt die Datei erst beim Aufruf `?gebiet=Epische Geschichte` und baut den Baum
danach neu. Ein leerer Block wird nicht mehr ausgegeben (gilt auch für Taten,
die keine Themenkacheln haben).

Der Aufgabenbau liest jetzt den lokalen Plugin-Export (15.11.) statt der
iCloud-Kopie (09.11.). Dadurch kommen neue Karten und Aufgaben hinzu; die
Zähler verschieben sich (Dunland-Überblick 401 → 494, neue Untergebiete
„Ring von Isengart“, „Die Tiefen von Isengart“). Das ist der aktuellere Export,
kein Zählfehler – vor einer Veröffentlichung mit Adrian abstimmen.

## Noch zu prüfen

- [ ] Browserprüfung Desktop und Mobil mit und ohne Spielstand in DE/EN/FR
      nach dem nächsten Build.
- [ ] Freigabe und Veröffentlichung (Upload) getrennt beauftragen.
- [ ] Nach dem Release im Netzwerk-Panel bestätigen, dass beim ersten Klick
      kein `daten-<sprache>.js` mehr geladen wird.
