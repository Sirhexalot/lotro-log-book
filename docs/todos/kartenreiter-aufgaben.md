# Kartenreiter zeigt Aufgaben-Zähler, aber keine Aufgaben

**Status:** offen
**Erstellt:** 15. November 2026
**Bereich:** Kartenansicht, Aufgabenfilter, Gebietsbaum

## Beobachtung

In der Kartenansicht zeigt der Reiter:

```text
Das Eisenloch 9/12
```

Nach dem Öffnen steht rechts jedoch:

```text
Das Eisenloch
gesamt 0
erledigt 0
offen 0
```

Die Karte selbst wird angezeigt, aber die zugehörigen Aufgaben erscheinen
nicht in der Liste.

## Ursache

Die Aufgaben- und Gebietsstruktur enthält für die Karten-ID `268447589`
mehrere Knoten:

```text
Eriador
└─ Dunland-Überblick
   ├─ Das Eisenloch          ← ergänzter direkter Knoten, 0 Aufgaben
   └─ Pforte von Rohan
      └─ Das Eisenloch       ← echter Knoten, 12 Aufgaben
```

Der Zähler des Kartenreiters wird aus dem belegten, tieferen Knoten berechnet.
Beim Klick auf den Reiter sucht `web/app.js` aber den ersten Knoten mit dieser
Karten-ID und landet beim leeren direkten Knoten.

Betroffene Logik:

- `web/app.js:348–360`: Ergänzung der gemeinsamen Gebietsstruktur
- `web/app.js:3225–3233`: Auswahl eines Kartenreiters
- `web/app.js:679–685`: Suche eines Knotens über die Karten-ID
- `web/gebiete-de.js`: gemeinsamer Gebietsindex

## Umsetzung

- [ ] Auswahl bei doppelter Karten-ID korrigieren.
- [ ] Den belegten beziehungsweise tieferen Knoten mit echten Aufgaben
      bevorzugen.
- [ ] Sicherstellen, dass Kartenreiter-Zähler und Aufgabenliste denselben
      Knoten verwenden.
- [ ] `Das Eisenloch` mit 12 Aufgaben und dem sichtbaren Zähler 9/12 prüfen.
- [ ] Weitere doppelte Karten-IDs systematisch suchen und testen.
- [ ] Marker, Kartenwechsel, Detailansicht und Rückweg prüfen.
- [ ] DE, EN und FR prüfen.
- [ ] Desktop und Mobil prüfen.
- [ ] Keine künstlichen Gebietsknoten oder belegte Pfade anderer Karten
      versehentlich entfernen.

## Abnahme

- Der Klick auf „Das Eisenloch 9/12“ zeigt die 12 zugehörigen Aufgaben.
- Der rechte Bereich zeigt nicht mehr `gesamt 0`.
- Der Zähler bleibt konsistent mit Liste und Fortschritt.
- Kartenmarker und Aufgabenauswahl gehören zur gleichen Aufgabenmenge.
- Andere Kartenreiter und direkte Karten-/Gebietslinks bleiben funktionsfähig.
- Die Korrektur ist ohne Veröffentlichung der unfertigen
  Aufgaben-Navigation testbar.

## Relevante Prüfung

```bash
git diff --check
python3 -m unittest discover -s tests -p 'test_*.py'
```

Zusätzlich ist eine Browserprüfung mit dem echten Kartenstand in DE/EN/FR
erforderlich. Ein lokaler Vorschau-Build ist gegenüber der Live-Seite zu
bevorzugen.
