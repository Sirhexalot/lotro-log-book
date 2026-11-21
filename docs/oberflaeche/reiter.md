# Reiter

**Regel:** Eine Reiterleiste für die ganze Seite. Jede Seite mit Reitern benutzt
`components/reiter.twig`, `web/reiter.css` und `web/reiter.js`. Keine Seite
schreibt eigenes `role="tablist"`-Markup, keine Seite bringt eigene
Reiterfarben mit. Ein neuer Reiter auf einer bestehenden Seite ist ein Eintrag
in der Liste, kein neuer Baustein.

Wer eine neue Reiterstelle baut, prüft danach `tests/test_reiter.py` und
`tests/browser_reiter.js`; beide schlagen fehl, sobald eine Seite wieder eigene
Reiter mitbringt.

## Wo sie steht

| Seite | Kennung | Reiter |
|---|---|---|
| Gegenstand (`entity/item.twig`) | `item` | Woher · Wofür |
| Instanz (`instances/detail.twig`) | `instanz` | Aufgaben · Belohnungen · Beute |
| Klasse (`app/klassen.twig`) | `klassen` | Aufgaben · Taten · Gegenstände |
| Gebiet (`entity/area.twig` + `entitaeten-listen.js`) | `related` | Aufgaben · Taten · Gegenstände |
| Companion (`app/companion.twig`) | `companion` | Windows · macOS |
| Spielstand (`app/spielstand.twig`) | `ordner` | Windows · macOS |
| Handwerk (`app/handwerk.twig`) | `handwerk` | Rezepte · Rohstoffe |

## Dateien

| Datei | Aufgabe |
|---|---|
| `php/templates/components/reiter.twig` | Markup, Macro `reiter(kennung, titel, eintraege, aktiv, versteckt)` |
| `web/reiter.css` | Aussehen; einzige Stelle mit Reiterfarben |
| `web/reiter.js` | `MQL_REITER.mount(host, optionen)`: Auswahl, Panels, Tastatur, Hash |

Eingebunden wird beides zentral: `reiter.css` in `Shell::styles()` und in
`app/layout.twig`, `reiter.js` in beiden Layouts. Keine Seite lädt die Dateien
selbst.

## Markup

```twig
{{ reiter.reiter('item', w.ilabel, [
    {key: 'woher', label: w.tab_where_from, panel: 'item-tab-woher', zahl: page.where_from_count},
    {key: 'wofuer', label: w.tab_used_for, panel: 'item-tab-wofuer', zahl: page.used_for_count}
], 'woher') }}
```

- `kennung` wird Präfix der Reiter-IDs (`item-woher`).
- `panel` ist die ID des `[role="tabpanel"]`; mehrere Reiter dürfen auf dasselbe
  Panel zeigen (Gebietsseite rendert es neu).
- `zahl` ist optional. Gerendert wird sie nur bei Werten größer null, als
  gedämpftes Badge ohne Gold.
- `versteckt` (fünfter Parameter) liefert die Leiste mit `hidden` aus, damit
  Besucher ohne JavaScript alle Bereiche untereinander sehen. `mount` blendet
  sie ein.
- Das Panel selbst bleibt Aufgabe der Seite: es trägt `role="tabpanel"` und
  `aria-labelledby` auf die Reiter-ID (`<kennung>-<key>`).

## Verhalten

`MQL_REITER.mount` übernimmt alles, was die Seite früher selbst gemacht hat:

- genau ein sichtbares Panel, alle anderen `hidden`;
- `aria-selected` und wanderndes `tabindex`;
- Pfeiltasten, Home und End wechseln Auswahl und Fokus zusammen;
- `hash: true` liest den Startreiter aus der Adresse und schreibt ihn beim
  Wechsel (`verlauf: true` für einen Eintrag im Zurück-Verlauf); `popstate` und
  `hashchange` bringen den Reiter auch beim Zurück-Knopf zurück;
- `onShow(key)` läuft bei jedem Wechsel, auch beim ersten, und ist der Ort für
  nachgeladene Listen (Instanzfilter, Handwerksrezepte, Gebietslisten).

Seiten dürfen `aria-selected`, `hidden` oder `tabindex` nicht selbst setzen.
Sie liefern nur Inhalte und sagen, was beim Wechsel passiert.

## Aussehen

- Der aktive Reiter geht in die Fläche darunter über: gleiche Hintergrundfarbe,
  keine untere Kante, goldene Oberkante, `margin-bottom: -1px`.
- **Das Panel gehört zur Komponente.** `.llb-reiter ~ [role="tabpanel"]` trägt
  Rahmen, Fläche, Innenabstand und den Radius `0 6px 6px 6px`. Eine Seite, die
  ihr Panel selbst rahmt, erzeugt einen zweiten Rahmen; solche Regeln gehören
  hierher, nicht in die Seiten-CSS.
- Der Fokusring liegt **innen** (`outline-offset: -3px`). Ein außen liegender
  Ring lässt den Reiter wie ein anderes Bauteil aussehen.
- Inaktive Reiter stehen auf `--fläche` mit `--schwach`; Hover und Fokus nutzen
  `--gold`.
- Farben ausschließlich über Theme-Tokens. Keine festen Palettenwerte: genau
  daran sind die alten Reiter im hellen Design gescheitert (schwarzer
  Suchen-Knopf, unlesbare inaktive Reiter).
- Die Leiste ist eine Zeile und bricht bei Bedarf um; auf dem Handy darf sie
  waagerecht nicht überlaufen.

## Was nicht

- Kein zweites Reiter-Markup „nur für diese Seite“, auch nicht als Kopie.
- Keine Reiterfarbe und kein Panel-Rahmen in einer Seiten-CSS; Änderungen
  gehören in `reiter.css`.
- Keine `aria-pressed`-Knopfgruppe als Reiterersatz — das ist ein Schalter, kein
  Reiter, und wird von Screenreadern anders angekündigt.
- Kein Zähler, der aus dem DOM gezählt wird. Die Seite liefert die Zahl; die
  Komponente zeigt sie nur.
- Keine Inhalte im Reiter selbst verstecken: was nicht sichtbar sein soll, ist
  ein anderes Panel, kein `display:none` im Panel.

## Prüfungen

- `python3 -m unittest tests.test_reiter` – nur die Komponente enthält
  `role="tablist"`, keine Seite bringt Altmarkup oder Altstile mit, beide
  Layouts laden CSS und Skript.
- `node tests/browser_reiter.js http://127.0.0.1:8817` – alle sieben Seiten,
  beide Breiten, Klick, Pfeiltasten, helles Design, kein waagerechter Überlauf.
  Dasselbe Skript läuft gegen die veröffentlichte Adresse.
- `tests/browser_area_tabs.js`, `tests/browser_related_lists.js` und
  `tests/browser_handwerk_reload.js` decken die Inhalte hinter den Reitern ab
  (Suche, Filter, Hash über einen Reload).

## Neue Seite mit Reitern

1. Im Template `{% import 'components/reiter.twig' as reiter %}` ergänzen.
2. Panels als `<section id="…" role="tabpanel" aria-labelledby="<kennung>-<key>">`
   anlegen; nur das Startpanel bleibt sichtbar.
3. `reiter.reiter('<kennung>', '<Titel>', [ … ], '<startkey>')` einsetzen.
4. `MQL_REITER.mount` im Seitenskript aufrufen, `onShow` für nachgeladene Inhalte.
5. `tests/test_reiter.py` um die Seite ergänzen, `tests/browser_reiter.js` um
   Pfad und Reiterzahl.
