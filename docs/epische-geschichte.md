# Epische Geschichte: Instanzen, Zwischenspiele, Prologe

Stand 14.11.2026. Grundlage sind die Aufgaben aus dem eigenen Client-Export
(`full-dat-en-de-fr-2026-11-03/quests.json`), nicht Wiki- oder Tracker-Listen.

## Was die Spieldaten hergeben

- **`Quest_Category`** ist die offizielle Buchzuordnung („Epos - Band I, Buch 1:
  Aufruhr in der Finsternis“), in allen drei Sprachen. Sie deckt sich 1:1 mit der
  Gruppierung `a` der Webdaten; die Buchreihenfolge muss nicht aus Namen geraten
  werden.
- **`Quest_IsInstanceQuest`** markiert die Instanzzeile. Das Kapitel trägt
  `Quest_ContainsInstanceQuest`. Die Kapitelzeile nennt ihren Instanznamen
  („Instanz: Othrongroth“ gehört zu „Buch 1, Kapitel 11: Othrongroth“).
- **`Quest_IsSessionQuest`** markiert Sitzungsspiele: Sie erscheinen nie im
  Journal und zählen nicht.
- **`Usage_Operator 2` mit Status „abgeschlossen“** heißt „X darf nicht
  abgeschlossen sein“. Damit ist eine Variante dauerhaft ausgeschlossen, sobald
  die andere gespielt wurde (z. B. „4. Zwischenspiel: Halros' Wache“ in zwei
  Fassungen).
- **`Quest_IsCompletionTracked = 0`** ist **kein** Beleg für „nicht
  abschließbar“: Der Charakterstand enthält 247 solcher Einträge als erledigt.
  Die Kennzeichnung wird deshalb nicht ausgewertet.

## Umsetzung

`tools/build_questmerkmale.py` liest den Export und schreibt
`daten/questmerkmale.json` (nicht eingecheckt, wie alle `daten/*.json`):

- `instanzen`: Instanzzeile → Kapitel. Nur eindeutige Paare: genau ein Kapitel
  mit gleichem Titel in derselben Buchkategorie, und dieses Kapitel beansprucht
  nur eine Instanz. Alles Mehrdeutige bleibt eine eigene Zeile.
- `ausgeschlossen`: Aufgabe → Abschlüsse, die sie unmöglich machen.

`build_daten.py` hängt beides an die Aufgabendaten: `ie` (Kapitel der
Instanzzeile) und zusätzliche Einträge in `e`.

Die Oberfläche (`web/app.js`):

- Instanzzeilen der epischen Geschichte verschwinden aus der Liste; das Kapitel
  trägt den Vermerk „Instanz“ bzw. den abweichenden Instanznamen. Sie zählen
  nicht doppelt, bleiben aber über ihre ID erreichbar.
- Sitzungsspiele, die nur eine bereits vorhandene Aufgabe nacherzählen
  (Zwischenspiele), werden nicht als zweite Zeile gezeigt.
- Ein Prolog-Block sagt oben, dass er in ein Buch führt, aber nicht zu dessen
  Fortschritt zählt.
- Zwischenspiele sortieren nach ihrer Nummer („1.“, „2.“ …).

## Grenzen

- Die Instanzzuordnung ist eine Titelzuordnung innerhalb desselben Buchs, keine
  direkte Verknüpfung im Client. 668 von 1.282 Instanzen sind eindeutig; der
  Rest bleibt sichtbar.
- Der Fortschritt belegt nur, was der importierte Spielstand enthält. Ohne
  Import bleiben Zahlen und Markierungen leer; es wird nichts angenommen.
- Aus „Buch abgeschlossen“ folgt **nicht**, dass der Prolog erledigt ist. Nur
  der Prolog „Vor dem Schatten“, Kapitel 6, ist harte Voraussetzung des neuen
  Buch 1 Kapitel 1; die alten Volks-Prologe sind eigene Ketten.

## Prüfung

```bash
python3 -m unittest tests.test_questmerkmale
LLB_URL=http://127.0.0.1:8914 NODE_PATH=<global node_modules> node tests/browser_epik.js
```

Neu bauen nach Datenänderungen: `python3 tools/build_questmerkmale.py`, dann
`build_daten.py` je Sprache, danach `tools/build_php_data.py` und der Release.
