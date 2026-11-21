# Händler und Tauschhändler

Ein Händler ist ein NPC, bei dem man etwas bekommt. Zwei Quellen liefern die
Einträge, und beide gehören in denselben Katalog:

| Art | Quelle | Anzahl |
|---|---|---|
| Händler (verkauft) | `vendor-items-2026-11-08/vendor-items.json` | 1.199 |
| Händler und Tauschhändler | dieselbe Datei, zusätzlich in `barters.xml` | 270 |
| Tauschhändler (nur Tausch) | Rückwärtsbezug aus `daten/items.json` (`tausch`) | 93 |

Zusammen 1.562 Einträge in `daten/haendler.json`. `build_haendler.py` schreibt
sie, `tools/vendor_viewmodel.py` und `php/src/Vendors.php` machen daraus Seiten
unter `/de/haendler/<ID>/`, `/en/vendor/`, `/fr/marchand/`.

## Kennungen

Seitenadressen verlangen **acht Hexzeichen**; `Catalogue::isValidId` akzeptiert
für Händler nichts anderes. Der Gegenstandsexport schreibt die NPC-Kennung
dezimal (`1879175294`), die Labels-Datei schlüsselt sie genauso. `build_haendler.py`
rechnet deshalb einmal in `%08X` um (`7001F07E`) und merkt sich die dezimale
Form nur für den Label-Abgleich. `php_viewmodel.py` macht dieselbe Umrechnung,
bevor es eine Tauschzeile auf eine Händlerseite verlinkt.

## Was eine Seite zeigt

- Name in DE/EN/FR aus `lore/labels/<sprache>/npc.xml`.
- Typ: „Händler“, „Tauschhändler“ oder „Händler und Tauschhändler“.
- Waren: bei Händlern die verkauften, bei Tauschhändlern die eingetauschten
  Gegenstände, bei „beides“ die Vereinigung. Überschrift entsprechend
  „Warenangebot“ oder „Tauschgegenstände“.
- Standort und Karte nur, wenn `did-positions` eine Position kennt.
- **Keine** Berufsbezeichnung bei reinen Tauschhändlern: der Client liefert sie
  nur auf Englisch („Crafting“), und eine deutsche Seite erfindet keine
  Übersetzung. Der Gegenstandseintrag unter „Woher“ zeigt aus demselben Grund
  nur den Namen.

## Grenzen

- Reine Tauschhändler haben **keinen Standort** in den Exporten (0 von 93). Die
  Seite bleibt ohne Kartenabschnitt, statt einen Ort zu raten.
- Eine Beschreibung gibt es für keinen Händler im Export.
- Tauschmengen und Bedingungen (was man hergibt) stehen nicht in
  `daten/items.json`; die Seite nennt nur, was man bekommt.
- Der Typ „Händler und Tauschhändler“ ist eine Mengenaussage, keine Aussage
  darüber, welche Ware gegen was getauscht wird.

## Prüfungen

`tests/test_item_model.py` hält fest: eine Tauschhändlerseite existiert in allen
drei Sprachen, ihre Kennung ist achtstellig, die Gegenstandsseite verlinkt jede
Tauschzeile, und die Zeile wiederholt die englische Berufsbezeichnung nicht.
Die Typfilter der Händlerliste (`type_filter_vendor`, `type_filter_barter`,
`type_filter_both`) und die Überschrift `barter_items` prüft derselbe Test über
die Quellen.
