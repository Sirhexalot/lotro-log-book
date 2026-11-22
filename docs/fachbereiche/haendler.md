# Vendors and barter vendors

A vendor is an NPC where one gets something. Two sources provide the
entries, and both belong in the same catalogue:

| Kind | Source | Count |
|---|---|---|
| Vendor (sells) | `vendor-items-2026-11-08/vendor-items.json` | 1.199 |
| Vendor and barter vendor | the same file, additionally in `barters.xml` | 270 |
| Barter vendor (barter only) | reverse reference from `daten/items.json` (`tausch`) | 93 |

Together 1.562 entries in `daten/haendler.json`. `build_haendler.py` writes
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
- Goods: for vendors the sold, for barter vendors the bartered
  items, for „beides“ the union. Heading accordingly
  „Warenangebot“ or „Tauschgegenstände“.
- Location and map only if `did-positions` knows a position.
- **No** profession label for pure barter vendors: the client provides it
  only in English („Crafting“), and a German page invents no
  translation. The item entry under „Woher“ shows for the same reason
  only the name.

## Limits

- Pure barter vendors have **no location** in the exports (0 of 93). The
  page remains without a map section instead of guessing a place.
- There is no description for any vendor in the export.
- Barter amounts and conditions (what one gives) are not in
  `daten/items.json`; the page names only what one gets.
- The type „Händler und Tauschhändler“ is a statement about amounts, not a
  statement about which goods are traded for what.

## Checks

`tests/test_item_model.py` records: a barter vendor page exists in all
three languages, its identifier is eight characters, the item page links every
barter row, and the row does not repeat the English profession label.
The type filters of the vendor list (`type_filter_vendor`, `type_filter_barter`,
`type_filter_both`) and the heading `barter_items` are checked by the same test via
the sources.
