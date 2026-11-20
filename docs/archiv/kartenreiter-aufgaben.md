# Kartenreiter zeigt Aufgaben-Zähler, aber keine Aufgaben

**Status:** umgesetzt, lokal und live abgenommen (16.11.2026)
**Erstellt:** 15. November 2026
**Bereich:** Kartenansicht, Aufgabenfilter, Gebietsbaum

> **Nachtrag 20.11.2026:** Der Karten-Erststart vom 18.11. hat den Fehler über
> einen anderen Weg zurückgebracht: flache Reiter tiefer liegender Gebiete
> fanden keine Zählmetadaten und zeigten wieder `0/0`. Ursachen, Umsetzung und
> Prüfpunkte stehen in [`docs/todos/karte-reiter-details.md`](../todos/karte-reiter-details.md).

## Beobachtung

In der Kartenansicht zeigt der Reiter:

```text
Das Eisenloch 13
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
      └─ Das Eisenloch       ← echter Knoten, 13 Aufgaben
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

- [x] Auswahl bei doppelter Karten-ID korrigieren.
- [x] Den belegten beziehungsweise tieferen Knoten mit echten Aufgaben
      bevorzugen.
- [x] Sicherstellen, dass Kartenreiter-Zähler und Aufgabenliste denselben
      Knoten verwenden.
- [x] `Das Eisenloch` mit 13 Aufgaben prüfen. Der alte Datenstand `9/12` ist
      überholt.
- [x] Doppelte Karten-IDs beim Reiter und bei der Auswahl nach belegten
      Aufgaben und Pfadtiefe auflösen.
- [x] Direkten Kartenlink, Kartenwechsel und Aufgabenliste live prüfen.
- [x] DE, EN und FR prüfen: Reiterklick zeigt jeweils 13 Aufgaben.
- [x] Desktop- und Mobil-Darstellung der Kartenansicht geprüft.
- [ ] Keine künstlichen Gebietsknoten oder belegte Pfade anderer Karten
      versehentlich entfernen.

## Abnahme

- Der Klick auf „Das Eisenloch“ zeigt die 13 zugehörigen Aufgaben.
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

Der Reiterklick wurde lokal und live mit dem echten Kartenstand in DE/EN/FR
geprüft. Der direkte Live-Link lautet:

`https://llb.sirhexalot.de/de/karte/#map-268446977/268447589`
