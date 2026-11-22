# Vendors and barter vendors

A vendor is an NPC where one gets something. Two sources provide the
entries, and both belong in the same catalogue:

| Kind | Source | Count |
|---|---|---|
| Vendor (sells) | `vendor-items-2026-11-08/vendor-items.json` | 1.199 |
| Vendor and barter vendor | the same file, additionally in `barters.xml` | 270 |
| Barter vendor (barter only) | `barters.xml`, no entry in the vendor export | 818 |

Together 2.287 entries in `daten/haendler.json`. Their offers (price → goods)
come from `daten/tausch.json` (`tools/tausch.py`): 42.612 offers at 3.470
profiles, with prices named in DE/EN/FR from the client labels. `build_haendler.py` writes
them, `tools/vendor_viewmodel.py` and `php/src/Vendors.php` make pages out of
them under `/de/haendler/<ID>/`, `/en/vendor/`, `/fr/marchand/`.

## Identifiers

Page addresses require **eight hex characters**; `Catalogue::isValidId` accepts
nothing else for vendors. The item export writes the NPC identifier
decimal (`1879175294`), the labels file keys it the same way. `build_haendler.py`
therefore converts once into `%08X` (`7001F07E`) and remembers the decimal
form only for the label match. `php_viewmodel.py` does the same conversion
before it links a barter row to a vendor page.

## What a page shows

- Name in DE/EN/FR from `lore/labels/<sprache>/npc.xml`.
- Type: „Händler“, „Tauschhändler“ or „Händler und Tauschhändler“.
- **Two tabs** „Wo“ and „Was“ with their counts (places, goods). A vendor with
  only one of the two shows no tab bar.
- „Wo“ shows **one** map for the picked place and a compact list of every known
  place (region › area, coordinates, map and route links); picking a row swaps
  map and pin. Nine places no longer mean nine stacked map pictures.
- „Was“: the sold goods with the shared item filter, then the barter table.
  Barter rows use the catalogue row (icon, name, price and quality, item level)
  and reuse the filter UI with **level range, quality, barter list** and search.
  The offers arrive as compact rows (goods id, list, price, amount); name,
  level, quality and icon come from the item index the page already loads, so
  1,188 offers stay around 40 KB.
- Without JavaScript the first 50 offers remain readable, with a note that the
  filter needs JavaScript.
- **The list filters goods by level range** (`from`/`to`): a vendor stays when at
  least one of its goods has a minimum level inside the band. The explicit range
  wins over the „Ware für meine Stufe“ shortcut. The list sorts by name or by
  stock level (`sort=stufe`, lowest goods level first, vendors without one last).
- **The list filter has two groups only.** „Normale Händler“ contains every
  vendor that sells (1.469), „Tauschhändler“ every vendor that barters (1.088);
  a vendor that does both is counted in both. There is no third category –
  it said nothing about what the page offers.
- Location and map only if `did-positions` knows a position.
- **No** profession label for pure barter vendors: the client provides it
  only in English („Crafting“), and a German page invents no
  translation. The item entry under „Woher“ shows for the same reason
  only the name.
- **Item pages** put the same price into their „Tauschhändler“ group
  („kostet 500 Zeichen · Geringe Klassen-Gegenstände“) and take the vendor
  name from `daten/haendler.json` instead of the English client row.

## Limits

- Pure barter vendors have **no location** in the exports. The page remains
  without a map section instead of guessing a place.
- There is no description for any vendor in the export.
- Conditions of a barter (class, faction, quest) are not carried yet: the class
  sits on 159 vendors, faction and quest conditions on the profiles. Prices
  and quantities are carried.
- The type „Händler und Tauschhändler“ is a statement about what the page
  shows, not a third filter category.

## Checks

`tests/test_item_model.py` records: a barter vendor page exists in all
three languages, its identifier is eight characters, the item page links every
barter row, and the row does not repeat the English profession label.
The vendor list has two type filters (`type_filter_vendor`,
`type_filter_barter`); `tools/vendor_viewmodel.py` gives a vendor that both
sells and barters the types `vendor` and `barter`, so it appears in both.
`tests/browser_haendler.js` checks the detail page in DE/EN/FR: both tabs and
their counts, the place picker swapping the map, the level and quality filters,
a pure barterer without tabs, 390 px without overflow, and the 50-row fallback
without JavaScript.

## Ware ab Stufe und der Filter für die eigene Stufe (22.11.2026)

- `vendor_index()` schreibt je Händler `ml_min` (kleinste Mindeststufe seiner
  Ware), `ml_max` und `ml_levels` (die belegten Stufen). Grundlage ist
  `daten/items.json`; Händler ohne Ware oder ohne bekannte Stufe bleiben ohne
  Angabe. 1.898 von 2.287 Händlern haben eine Spanne.
- Die Liste zeigt „Ware ab Stufe X“ als eigene Spalte. Der Spaltenkopf ist
  `gw.stufe_heading`; die Zeile nutzt die Wertspalte von `_result_row.twig`.
- Der Filter „Ware für Stufe %s“ ist ein **Verweis**, kein Kästchen: das
  Filtermodul macht aus einem Kästchen einen Wahrheitswert, die Stufe muss aber
  als Zahl in der Adresse stehen (`?stufe=123`). `filter-server.js` behält den
  Parameter bei jeder weiteren Auswahl, damit Filtern die Stufe nicht aufhebt.
- Regel: dasselbe gleitende Fenster von zehn Stufen wie beim Eignungs-Chip –
  eine Ware mit Mindeststufe zwischen Stufe−10 und Stufe. Ohne das Fenster
  träfe fast jeder Händler zu (1.813 von 2.287 bei Stufe 123 statt 390).
- Ohne importierten Spielstand bleibt der Verweis unsichtbar (`web/haendler-liste.js`).
  Geprüft mit `tests/test_vendor_stufe.py` und `tests/browser_haendler_stufe.js`.
