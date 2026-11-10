# Auftraggeber

Stand: 10.11.2026. **Veröffentlicht.** Übersicht und Detailseiten laufen in
DE/EN/FR, samt Menü, zentraler Suche, Kartenlinks, Baumfilter und Fortschritt
aus dem importierten Charakter.

## Quellen

Alle Angaben kommen aus dem Client-Export und den Spieldefinitionen. Nichts wird
aus Namen, Wiki oder Vermutungen ergänzt.

| Angabe | Quelle |
| --- | --- |
| Wer eine Aufgabe vergibt | `lore/quests.xml`, `<bestower npcId>`; Lücke aus `Quest_BestowalRoles` des DAT-Exports |
| Name in DE/EN/FR | `lore/labels/<sprache>/npc.xml`; Rückfall auf `Name.texts` des NPC-Rohexports |
| Tätigkeit | `lore/NPCs.xml` `title` → derselbe Labelbestand |
| Begrüßung, Beschreibung | `npcs-*/raw.jsonl` (`NPC_ActionPicker_GreetingString`, `Description`) |
| Art (Person/Kreatur/Gegenstand) | `class_index` des Rohexports; `NPC_IsInanimate` macht daraus ein Objekt |
| Standort | `did-positions-*/positions.jsonl` (instanzlos), Zuordnung zur Karte über `game_maps.GameMaps.attribute` |
| Aufgaben, Stufe, Merkmale | bestehender Webkatalog `daten/quests-<sprache>.json` |

Ein Standort bekommt nur dann eine Karte, wenn die Spielkarte im eigenen
Kartenbestand liegt. Koordinaten bleiben auch ohne Karte stehen; sie werden
nicht verschoben und nicht gemittelt, um „auf die Karte zu passen“.

## Regeln

- **Nur belegte Namen.** Fehlt der Name in einer der drei Sprachen, entfällt der
  Eintrag und wird im Prüfbericht gezählt. 187 solcher IDs bleiben außen vor.
- **Mehrere Auftraggeber je Aufgabe** bleiben erhalten (802 Aufgaben). Die
  Aufgaben-Detailseite verlinkt den ersten Auftraggeber, den das Spiel nennt.
- **Technische Aufgabenbretter** mit reiner Stufenspanne als Namen („21-30“,
  „151-160 Hamât Renewed“) bekommen keine Seite: 22 Einträge. Der Name allein
  wäre als Überschrift wertlos.
- **Standorte werden geclustert**: Punkte einer Region innerhalb von 0,3
  Karteneinheiten gelten als ein Ort; höchstens acht Orte je Auftraggeber.
  Mehrere weit auseinanderliegende Orte bleiben getrennt.
- **Keine Porträts.** Für normale NSCs enthält der geprüfte Export kein
  fertiges Bild. Die Seite zeigt ein neutrales Symbol; es wird kein Wiki- oder
  KI-Bild als Spielaussehen ausgegeben.
- **Keine erfundene Biografie.** Die Beschreibung erscheint nur, wenn der Client
  selbst eine mitliefert (261 Einträge, überwiegend Aufgaben-Gegenstände).
  Begrüßungen stehen eingeklappt und mit Spoilerhinweis.
- **Kein Fortschrittsanspruch ohne Import.** Ohne Charakter steht „Kein
  Charakter importiert – der Abschluss ist nicht bekannt.“ Der Zähler nennt nur
  die bei uns zugeordneten Aufgaben, nicht alle spielbaren.

## Adressen und Filter

- Liste: `/de/auftraggeber/`, `/en/quest-giver/`, `/fr/donneur-de-quete/`
- Detail: ID anhängen, z. B. `/de/auftraggeber/70000002/`
- Filter als GET-Parameter: `q`, `region[]`, `area[]`, `kind[]`, `tag[]`,
  `from`, `to`, `page`
- Region und Landschaft sind Kartenschlüssel (stabile Spiel-IDs), keine Namen.
  Der Filter zeigt die Landschaften unter ihrer Region als Baum, wie die
  Gegenstandssuche. Namenlose Karten („Karte 268450271“) sind keine Landschaft;
  solche Orte behalten nur ihre Region.
- Jede Trefferzeile nennt zuerst die Art (Person, Kreatur, Gegenstand oder
  „Art nicht belegt“), damit gleichnamige Einträge und Gegenstände erkennbar sind.
- Sortierung über `sort=name` (Standard) oder `sort=stufe`; „Stufe“ ist die
  niedrigste Aufgabe, unbekannte Stufen stehen zuletzt. Der Server sortiert vor
  der Seitenaufteilung, damit Blättern und JavaScript-freie Nutzung stimmen.
- Der Filterstand wird lokal gemerkt und beim parameterlosen Aufruf
  wiederhergestellt; Rücklinks von Detailseiten tragen ihn mit
  (`docs/filter-sortierung.md`).
- Detailseiten verlinken unter „Weitere Einträge mit diesem Namen“ die übrigen
  Spiel-IDs desselben Namens mit Ort und Aufgabenzahl. Die Einträge bleiben
  getrennt, weil die Spieldaten keine Identität belegen; ab zwölf verweist ein
  Link auf die nach dem Namen gefilterte Liste.
- Stufe und Merkmal müssen von **derselben Aufgabe** erfüllt sein. Ein Ort
  genügt aus einem beliebigen Standort des Auftraggebers.
- Facetten zählen ohne die eigene Filtergruppe; gewählte Nulltreffer bleiben
  sichtbar. 30 Einträge je Seite.
- Checkboxen und Stufenfelder filtern sofort (`sets.js` bedient die gemeinsame
  Filterhülle). Ohne JavaScript bleibt „Anwenden“ als Rückfall.
- Gefilterte Listen tragen `noindex,follow` und eine eigene Canonical-URL.
  Sprachwechsel behält die Filter und beginnt auf Seite 1.

## Aufbau

| Datei | Aufgabe |
| --- | --- |
| `build_auftraggeber.py` | Datenbasis und Prüfbericht aus den Spieldateien |
| `tools/giver_viewmodel.py` | Listenindex, Detailseiten, Kartenspuren, Aufgabenzeilen |
| `php/src/Givers.php` | Filterlogik, Facetten, Seiten, DE/EN/FR-Texte |
| `php/templates/givers/` | Listen- und Detailvorlage |
| `web/auftraggeber.css` | Kopfdarstellung und Aufgabenliste |
| `web/auftraggeber.js` | Fortschritt, Zähler, „Erledigte ausblenden“ |

Der Menüeintrag sitzt in der Familie **Welt** (`Shell.php` und `menue.js`), die
zentrale Suche hat den Typ `n` (`build_suche.py`, `suche.js`). Die
Aufgaben-Detailseite verlinkt über `gi` auf den Auftraggeber.

## Bauen

```bash
python3 build_auftraggeber.py
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
../MagicQuestLog/.venv/bin/python build_suche.py --sprache de
# ebenso en und fr
```

`tools/build_php_data.py` verlangt `daten/auftraggeber.json`; fehlt sie, bricht
der Bau mit einem Hinweis ab.

## Prüfstand (10.11.2026)

- 5.067 Auftraggeber, 11.567 Aufgaben mit Auftraggeber, 13.076 Zuordnungen
- 802 Aufgaben mit mehreren Auftraggebern
- 4.896 mit Standort, 4.284 davon mit Karte; 920 Positionen ohne Karte
- 5 namenlose Karten fliegen aus dem Landschaftsfilter (20 Einträge, u. a. Aragorn);
  sie behalten ihre Region
- 507 Namen kommen mehrfach vor (1.892 Zeilen), 405 davon mit gleichem Namen und
  Ort; Querverweise statt Verschmelzen
- 1.335 mit Tätigkeit, 1.297 mit Begrüßung, 261 mit Beschreibung
- Arten: 4.075 Personen, 175 Kreaturen, 347 Gegenstände, 470 ohne belegte Art
- 171 ohne jeden Standort, 187 ohne vollständigen Namen, 22 Stufenbretter
- Sitemaps: je Sprache Liste plus 5.067 Detailadressen

Tests:

```bash
python3 -m unittest tests.test_auftraggeber tests.test_giver_viewmodel \
  tests.test_givers_php tests.test_giver_catalogue -v
node tests/test_giver_controls.js
```

Die vollständige Python-Suite behält den bekannten Fehler in
`test_katalogseiten.test_one_public_address_per_entity` (erwartet den alten
Apache-Block statt des PHP-Blocks). Daraus keine grüne Gesamtsuite ableiten.

## Veröffentlichung 10.11.2026

Release aus `~/.cache/llb-release` (19.894 Dateien, 798,4 MB): zuerst 3.077
Datendateien (196,6 MB), danach 17 Anwendungs-/Assetdateien (16,1 MB) über den
bestehenden FTPS-Uploader. Die `.htaccess` blieb unverändert; ihre
Sprachregel deckt auch die neuen Segmente mit Bindestrich ab. Keine
Charakterdaten im Release.

Live geprüft:

- Listen und Detailseiten in DE/EN/FR, Baumfilter mit Sofortfilterung und
  erhaltenem Aufklappzustand, Art in jeder Zeile, Querverweise bei gleichem
  Namen, Kartenvorschau und Mobilansicht ohne Überlauf.
- Menüeintrag unter **Welt**, zentrale Suche mit eigener Gruppe und Rücklink
  von der Aufgaben-Detailseite.
- Kleinschreibung und `.html` werden per 301 kanonisiert; unbekannte IDs
  liefern 404, der Giver-Index 403.
- Alle drei Sitemaps liefern je 5.068 URLs; der Sitemap-Index nennt sie.
- 5.067 Giver-Zeilen in `suche-de.js`.

## Offene Punkte

- 470 Einträge haben keine belegte Art, weil der Rohexport sie nicht enthält
  („explicit IDs only“). Ein vollständigerer NPC-Export würde das schließen.
- 920 Positionen liegen in Innenräumen oder Instanzen ohne eigene Karte. Sie
  zeigen Koordinaten, aber keinen Kartenausschnitt.
- Porträts fehlen weiterhin. Ein eigenes Rendering aus den Aussehensdaten wäre
  ein separates Projekt; Fremdbilder bleiben ausgeschlossen.
- Abschnitt „Auftraggeber in diesem Gebiet“ auf den Gebietsseiten ist noch
  nicht eingebaut.
