# Reiter

Eine Reiterleiste für die ganze Seite. Sie steht auf der Gegenstandsseite
(Woher / Wofür), der Instanzseite (Aufgaben / Belohnungen / Beute), der
Klassenseite (Aufgaben / Taten / Gegenstände), der Gebietsseite (verwandte
Listen), bei Companion und Spielstand (Windows / macOS) und im Handwerk
(Rezepte / Rohstoffe).

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
- `zahl` ist optional. Gerendert wird sie nur bei Werten größer null.
- `versteckt` (fünfter Parameter) liefert die Leiste mit `hidden` aus, damit
  Besucher ohne JavaScript alle Bereiche untereinander sehen. `mount` blendet
  sie ein.

## Verhalten

`MQL_REITER.mount` übernimmt alles, was die Seite früher selbst gemacht hat:

- genau ein sichtbares Panel, alle anderen `hidden`;
- `aria-selected` und wanderndes `tabindex`;
- Pfeiltasten, Home und End wechseln Auswahl und Fokus zusammen;
- `hash: true` liest den Startreiter aus der Adresse und schreibt ihn beim
  Wechsel (`verlauf: true` für einen Eintrag im Zurück-Verlauf);
- `onShow(key)` läuft bei jedem Wechsel, auch beim ersten, und ist der Ort für
  nachgeladene Listen (Instanzfilter, Handwerksrezepte, Gebietslisten).

Seiten dürfen `aria-selected`, `hidden` oder `tabindex` nicht selbst setzen.
Sie liefern nur Inhalte und sagen, was beim Wechsel passiert.

## Aussehen

- Der aktive Reiter geht in die Fläche darunter über: gleiche Hintergrundfarbe,
  keine untere Kante, goldene Oberkante, `margin-bottom: -1px`.
- Inaktive Reiter stehen auf `--fläche` mit `--schwach`; Hover und Fokus nutzen
  `--gold`.
- Farben ausschließlich über Theme-Tokens. Keine festen Palettenwerte: genau
  daran sind die alten Reiter im hellen Design gescheitert (schwarzer
  Suchen-Knopf, unlesbare inaktive Reiter).
- Zähler: kleine Zahl mit Rahmen, kein Gold, damit der aktive Reiter die
  Aufmerksamkeit behält.

## Prüfungen

- `python3 -m unittest tests.test_reiter` – nur die Komponente enthält
  `role="tablist"`, keine Seite bringt Altmarkup oder Altstile mit.
- `node tests/browser_reiter.js http://127.0.0.1:8817` – alle sieben Seiten,
  beide Breiten, Tastatur, helles Design, kein waagerechter Überlauf.
- `tests/browser_area_tabs.js`, `tests/browser_related_lists.js` und
  `tests/browser_handwerk_reload.js` decken die Inhalte hinter den Reitern ab.
