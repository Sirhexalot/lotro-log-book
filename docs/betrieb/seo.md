# Titel und Description je Seite

Stand: 14.11.2026. Gilt für alle Katalog- und Anwendungsseiten.

## Warum eine Regel

Bis 14.11.2026 entstanden Titel und Description an vier Stellen: im
Seitenlayout, in jeder View-Funktion von `tools/php_viewmodel.py`, in
`php/src/Sets.php` und in `php/src/Givers.php`. Jede Stelle hatte ihren
eigenen Satzbau. Folgen: 2.218 Set-Seiten mit demselben Satz, 5.067
Auftraggeber-Seiten mit einer Vorlage, 2.809 Landmarken mit „Landmarke: Name“,
Gebiete mit der Marke doppelt („Katalog: Breeland – LOTRO Log Book.“), und
keine Längengrenze.

## Die Regeln

**Titel.** Name zuerst, dann eine Einordnung, dann die Marke.

- Budget: 60 Zeichen inklusive ` – LOTRO Log Book` (17 Zeichen), also 43 für
  den Kern. Passt die Einordnung nicht mehr, fällt sie weg — nie der Name,
  nie die Marke.
- Einordnung ist die Seitenart („Aufgabe“, „Tat“, „Landmarke“), bei Bedarf mit
  Gebiet („· Eriador › Angmar“), bei Gegenständen die Seltenheit.
- Die Marke hängt genau einmal am Titel. Beide Layouts prüfen das
  (`php/templates/layout.twig`, `php/templates/app/layout.twig`).

**Description.** Höchstens 155 Zeichen, drei Bausteine:

1. was die Seite ist: `Typ: Name.`
2. ein belegter Fakt: Gebiet und Stufe, Beruf und Stufe, Anzahl Teile oder
   Quellen, Fundort.
3. ein Nutzen: was die Seite zusätzlich zeigt (Karte, Ziele, Setboni).

Die Marke kommt in der Description einer Entitätsseite nicht vor; sie steht im
Titel. Anwendungsseiten behalten ihre Texte aus `build_seo.PAGES`. Fehlt ein
Fakt, fällt der Satz weg, statt einen Platzhalter zu schreiben. Ohne jeden
Fakt trägt ein längerer Nutzen-Satz die Seite (`seo.THIN`).

**Sprache.** Zahlen mit den Trennzeichen der Sprache (`3.200` / `3,200` /
`3 200`), Ein- und Mehrzahl aus `seo.NOUNS`, französischer Doppelpunkt mit
Leerzeichen davor (`seo.COLON`).

**Unterschiede.** `seo.dedupe()` ergänzt bei gleichen Texten einen weiteren
vorhandenen Spielinhalt, etwa eine Quelle oder Zutat. Gibt es keinen sinnvollen
Unterschied, bleiben die Texte gleich. Technische Kennungen gehören nicht ins
Suchergebnis. Fehlende Angaben werden nicht kommentiert und nicht durch
pauschale Versprechen über Fundorte, Sets oder Werte ersetzt.

**Listen.** Seite 1 trägt die Seitenzahl nicht im Text, jede Folgeseite nennt
sie (`Aufgaben: 200 Einträge mit Stufe, Gebiet und Art, Seite 2 von 76.`).
Das gilt auch für die Filterbrowser (`Titles`, `Factions`, `Landmarks`,
`Sets`, `Givers`, `Instances`).

## Wo es steht

| Ort | Aufgabe |
| --- | --- |
| `tools/seo.py` | alle Texte, Grenzen, Ein-/Mehrzahl, `dedupe()` |
| `tools/php_viewmodel.py` | ruft die Bausteine für Aufgaben, Taten, Gegenstände, Rezepte, Titel, Tugenden, Fraktionen, Landmarken, Gebiete, Regionen, Berufe, Listen |
| `tools/set_viewmodel.py`, `tools/giver_viewmodel.py` | Set- und Auftraggeber-Detailseiten |
| `php/src/Sets.php`, `php/src/Givers.php` | nehmen `seo` aus dem Seitenmodell |
| `php/templates/layout.twig`, `php/templates/app/layout.twig` | Marke einmal, Fallback auf den Seitennamen |
| `tools/build_php_data.py` | `dedupe()` vor dem Schreiben der Shards |

Anwendungsseiten (Karte, Suche, Handwerk, Start) behalten ihre Texte aus
`build_seo.PAGES`; sie folgen denselben Längenregeln.

## Prüfen

```bash
python3 -m unittest tests.test_seo_texte
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
```

Danach je Art und Sprache: keine leere Description, keine über 155 Zeichen,
keine doppelten Texte, Name im Titel. `tests/test_seo_texte.py` hält die
Regeln fest; die Zahlen im gebauten Stand stehen im Bericht vom 14.11.2026.
