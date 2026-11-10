# Filtergedächtnis und Sortierung

Stand: 10.11.2026, veröffentlicht. Gilt für **Gegenstände**, **Auftraggeber**
und **Rezepte**.

## Verhalten

| Situation | Ergebnis |
| --- | --- |
| Filter oder Sortierung ändern | Der Stand wird lokal gespeichert |
| Detailseite → Rücklink zur Liste | Link trägt den gespeicherten Stand |
| Liste ohne Parameter öffnen | Gespeicherter Stand wird wiederhergestellt |
| Adresse enthält bereits Filter | Adresse gewinnt, nichts wird überschrieben |
| „Zurücksetzen“ | Löscht den gespeicherten Stand |
| Andere Sprache | Eigener Speicher je Sprache |

Der Browser-Zurück-Knopf funktionierte schon vorher, weil die Filter in der
Adresse stehen. Verloren gingen sie über die eigenen Rückwege („Alle
Auftraggeber“, Breadcrumb „Gegenstände“, „Handwerk“) – die tragen den Stand
jetzt mit.

## Speicher

- Schlüssel: `mql.filter.<bereich>.<sprache>`, Inhalt `{"q": "<query>"}`
- Bereiche: `gegenstaende`, `auftraggeber`, `rezepte`
- Gespeichert wird nur die Abfragezeichenfolge (Suche, Filter, Stufe,
  Sortierung). Keine Charakterdaten, keine Kennungen.
- Privater Modus oder voller Speicher: Lesen/Schreiben schlägt still fehl, die
  Liste funktioniert ohne Gedächtnis weiter.
- Ein defekter Eintrag wird wie „nichts gespeichert“ behandelt.

## Rücklinks

`web/katalog.js` ergänzt auf Detailseiten die Links zu den Listen, sofern der
Link keine eigene Filterabfrage hat:

- `/de/gegenstandssuche/`, `/en/item-search/`, `/fr/recherche-objets/`
- `/de/auftraggeber/`, `/en/quest-giver/`, `/fr/donneur-de-quete/`
- `/de/handwerk/rezepte/` und die alte Adresse `/handwerk.html?lang=…`

Ein `?lang=de` gilt nicht als Filter und wird ersetzt.

## Sortierung

- In der Adresse: `sort=name` (Standard, darf fehlen) oder `sort=stufe`.
- **Stufe** ist aufsteigend. Einträge ohne belegte Stufe stehen zuletzt, bei
  gleicher Stufe entscheidet der Name.
- Gegenstände und Rezepte sortieren im Browser vor „mehr laden“ bzw. der
  100er-Grenze.
- Auftraggeber sortiert der Server (`Givers::sorted`) vor der Seitenaufteilung;
  „Stufe“ ist dort die niedrigste Aufgabe des Auftraggebers. Funktioniert auch
  ohne JavaScript und beim Blättern.
- Die Sortierung wird wie ein Filter gespeichert und in Sprachlinks,
  Pagination und Canonical mitgeführt. Sortierte Listen bleiben `noindex`.

## Tests

```bash
node tests/test_filtergedaechtnis.js
python3 -m unittest tests.test_givers_php -v
```

Zusätzlich in der Browserprüfung: Filter setzen, Detailseite öffnen, über den
Rücklink zurückkehren, Zustand prüfen; Sortierung nach Stufe in DE/EN/FR;
frische Liste ohne Parameter stellt den Stand wieder her.

Die bekannte Grenze: Ein anderer Browser oder ein gelöschter Speicher kennt den
Stand nicht. Das ist gewollt – es gibt kein Konto und keine Serverablage.
