# Kartenbenennung und Gebietshierarchie

- **Status:** umgesetzt und geprüft
- **Beschlossen am:** 20.11.2026
- **Geltungsbereich:** Kartenbenennung in `build_daten.py`, Kartennavigation in
  `tools/build_gebiete.py`, Aufgaben-/Tatenlabels, Region-und-Gebiet-Filter,
  Breadcrumbs und Kartenkopf
- **Dokumentation:** [Datenmodell](../datenraum/lotro-datenraum.md#kartenname-kartenzuordnung-und-website-navigation),
  [arc42 Bausteinsicht, 5.7/5.8](../arc42/05-bausteinsicht.md), [Risiken, Kapitel 11](../arc42/11-risiken-und-technische-schulden.md),
  [Entscheidung 9](../arc42/09-architekturentscheidungen.md)

## Befund vom 20.11.2026

Abgleich der Website-Navigation gegen `geoAreas.xml`, `parchmentMaps.xml` und
`maps/links.xml`:

- Unser Baum: 6 Regionen, 70 Landschaften, 146 Unterkarten, 216 Namen.
- `geoAreas.xml`: 7 Regionen, 86 Territorien, 679 Gebiete.
- 30 Landschaften tragen exakt einen Territoriumsnamen, 6 bilden ein Gebiet ab,
  34 führen eigene Kartennamen; 19 Territorien verteilen sich auf mehrere
  Landschaften.
- 17 Karten haben keine Beschriftung. Sie erzeugen je Sprache 193 Aufgaben- und
  52 Tatenlabels sowie 17 von 216 Navigationsnamen der Form `Karte <ID>`.
- Die Regionszuordnung kommt aus `f[0]`, nicht aus dem Karten-Regionscode.

Ursache: `kartenname()` in `build_daten.py` endet auf `'Karte %d' % ident`,
wenn Label, gemeinsames Kindpräfix und englischer Name fehlen. Das Wort ist fest
deutsch verdrahtet und erscheint deshalb auch in EN und FR.

## Entscheidung

Ein Kartenname wird aus den belegten Gebietsnamen abgeleitet. Die Kette lautet:
**Alias → Sprachlabel → gemeinsames Kindpräfix → englischer Name → erstes
zugeordnetes Gebiet → Elternkarte → sprachneutraler Notnagel**. Der Notnagel
bleibt als Prüfbefund sichtbar und darf nicht stillschweigend auftreten.

Gebietsnamen kommen aus `parchmentMaps.xml` (englischer Schlüssel) und
`areas.json` des eigenen DAT-Exports (DE/EN/FR). Sie werden wie
Gegenstandsnamen bereinigt; 8 von 1.610 Gebietsnamen tragen `\q`-Escapes.

## Betroffene Karten und Vorschlagsnamen

| Karte | Gebiet (EN) | Gebiet (DE) | Vorgabe |
|---|---|---|---|
| 268450268 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268450269 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268450270 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268450272 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268450273 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268450274 | Helm's Deep | Helms Klamm | in „West-Rohan: Helms Klamm“ einordnen |
| 268453919 | The Glittering Caves | Glitzernde Grotten | in „West-Rohan: Helms Klamm“ einordnen |
| 268451976 | Battle of the Morannon | Die Schlacht am Morannon | eigene Landschaft, Region vorerst Gondor |
| 268451156 | Minas Tirith Besieged | Minas Tirith belagert | eigene Unterkarte |
| 268451023 | Osgiliath | Osgiliath | eigene Unterkarte |
| 268451074 | The Sundering of Osgiliath | Osgiliaths Spaltung | eigene Unterkarte |
| 268451575 | Pelennor | Pelennor | eigene Unterkarte |
| 268451286 | Field of Onslaught | Feld des Angriffs | eigene Unterkarte |
| 268452359 | Cormallen | Cormallen | eigene Unterkarte |
| 268450899 | Pelargir | Pelargir | eigene Unterkarte |
| 268454943 | The Gnawnshore | Die Zahnküste | eigene Landschaft |
| 268455287 | Bâr Guruthos | Bâr Guruthos | eigene Unterkarte |

„Eigene Unterkarte“ heißt: Der Name ersetzt die technische Kennung; die
Zuordnung zur Landschaft bleibt, wie sie heute aus `f[1]` folgt.

## Umsetzung und Prüfung (21.11.2026)

- `build_daten.py` verwendet für die 17 geprüften IDs die zugeordneten DAT-Gebiete
  aus `parchmentMaps.xml` und `areas.json`, lokalisiert sie in DE/EN/FR und
  ersetzt den festen deutschen technischen Rückfall durch einen sprachrichtigen
  Prüfnotnagel.
- `referenz/gebietsansicht.json` hält die ID-basierten Benennungen und
  Anzeigezuordnungen. Die sechs Helm-Klamm-Varianten werden im Pfad unter
  „West-Rohan: Helms Klamm“ zusammengeführt; `268453919` liegt als Unterkarte
  bereits unter dieser Landschaft. Karten-IDs und Spielkartenbaum bleiben
  erhalten.
- `tests/test_kartenbenennung.py` prüft die 17 Namen in allen drei Sprachen,
  die sechs Anzeige-Pfade und den sprachrichtigen Notnagel.
- Daten neu gebaut: Aufgaben DE/EN/FR, Taten DE/EN/FR, gemeinsame
  Landschaftsnavigation sowie PHP-Daten/Filterindizes in
  `~/.cache/llb-php/phpdata`.
- `tests/test_gebiete.py`, `node tests/test_questfinder.js` und
  `tests/test_kartenbenennung.py` bestanden.

Die Umsetzung ist abgeschlossen; dieser Prüfplan liegt nun als historischer
Abnahmevermerk im Archiv.

## Auswirkungen auf „Region und Gebiet“

Der Filterbaum ist Teil der Abnahme, nicht nur die Kartenübersicht. Die
Aufgaben- und Tatenfilter werden getrennt geprüft, weil ihre Daten und
Trefferzahlen voneinander abweichen.

- Die sechs obersten Regionen und ihre Summenzähler bleiben unverändert:
  Umbenennungen und Zusammenfassungen ändern weder `f[0]` noch die Zugehörigkeit
  der Einträge zu einer Region.
- Unterhalb der Regionen können Gebietsoptionen umbenannt oder zusammengeführt
  werden. Insbesondere ist zu prüfen, ob die sechs Helms-Klamm-Karten und die
  Karte der Glitzernden Grotten im Filter unter den vorgesehenen Namen
  erscheinen und wie sich die Gebietszähler dadurch aggregieren.
- Regionssummen aus den tatsächlich gebauten Filtern (Aufgaben / Taten):
  Eriador 5.527 / 1.037; Gondor 1.293 / 247; Haradwaith 1.549 / 312;
  Mordor 1.400 / 304; Rhovanion 2.701 / 560; Rohan 1.808 / 85.
- Betroffene Gebietsoptionen im Aufgabenfilter (Option-Gesamttreffer;
  Treffer von den betroffenen Karten in Klammern): Rohan → West-Rohan:
  Helms Klamm 43 (35); Gondor → Zentrum von Gondor 156 (1), Ost-Gondor
  199 (36), Alt-Anórien 197 (72), Die Schlacht am Morannon 8 (8);
  Mordor → Draugardh 320 (21); Haradwaith → Mûr Ghala (Der Grat des
  Überflusses) 585 (20).
- Im Tatenfilter: Gondor → Zentrum von Gondor 25 (2), Ost-Gondor 62 (21),
  Alt-Anórien 53 (24); Mordor → Draugardh 21 (5). Die betroffenen Karten haben
  keine Rohan-Taten; Rohan hat 85 Treffer und neun Gebietsoptionen.
- Der Filterbaum wurde in Aufgabenfinder und Tatenindex visuell aufgeklappt
  geprüft: Regionsübersicht und betroffene Gebietsoptionen sind sichtbar; die
  Regionswerte stimmen mit den erzeugten Filterdaten überein.
- Abnahmekriterium: Regionssummen sind je Katalog unverändert; Gebietsnamen
  entsprechen der neuen Zuordnung; Gebietszähler ergeben je Filter dieselbe
  Treffermenge wie vor der Umbenennung, nur unter den neuen/zusammengeführten
  Optionen. Eine Verschiebung zwischen Regionen wäre ein eigener, hier nicht
  beschlossener Eingriff.
- Die visuelle Prüfung zeigt sowohl die eingeklappte Regionsübersicht als auch
  die aufgeklappten betroffenen Gebietsoptionen mit ihren erzeugten Zählern.

## Grenzen

- **Region bleibt vorerst, wie das Aufgabenlabel sie setzt.** Die Morannon-Karte
  bleibt damit unter Gondor, obwohl ihr Inhalt zum Ödland gehört. Ein
  Regionswechsel aus Karten-/Gebietsdaten ist ein eigener Eingriff.
- **Haradwaith bleibt offen.** Sechs Territorien liegen unter „Mûr Ghala“; das
  ist ein zweites Paket, nicht Teil dieser Benennung.
- **Keine Übernahme der geoAreas-Regionsebene.** Dort hängen Rohan, Gondor und
  Mordor unter Rhovanion, zwei Regionen bleiben leer.
- **Erzeugte Prüfberichte nicht von Hand ändern.** `lotro-datenraum-relationen.md`, `-xml-properties.md` und `-semantik*.md` entstehen aus ihren Skripten.
