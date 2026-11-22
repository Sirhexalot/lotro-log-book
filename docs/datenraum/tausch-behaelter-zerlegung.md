# Barter, containers, disenchanting and a slim item set

**Status as of:** 20.11.2026. **Status:** data model drafted, no pipeline and
no page yet. The numbers are measured on the client dump of 01.11.2026
(`lore/` of the Companion installation, same state as
`LotroCompanion/lotro-data`) and on the own full item export of 08.11.2026.
They describe the set, not today's server availability.

This document supplements the [entity contract](lotro-datenraum-entitaeten.json)
and the [item pipeline](gegenstaende-iststand.md). It describes three
records that complete existing pages without inventing a new entity:
barter vendors, containers and disenchanting. In addition there is a slim
item set from the **own client export**, so that items without their
own catalogue page can also be shown with name and icon.

## 1. Why these three

Today the item page answers "where from" via quests, deeds, recipes,
vendors and a narrow barter set from the recipe source export. Three
questions remain open and are proven in the client:

- **What can I barter this for, and what does it cost?** (`barters.xml`)
- **Where does this come from?** For field crops, crates and relics every reference is missing
  (`containers.xml`).
- **What comes out of it when disenchanting?** (`disenchantments.xml`)

All three are pure item relations. They need no new page,
but one group each in the existing "where from/where for" surface and one
addition to the vendor page.

## 2. Volumes and coverage

| Source | Records | Relation to the catalogue |
|---|---:|---|
| `items-2026-11-08/items.json` (own client) | 152,088 items | 45,897 IDs referenced by barter, disenchanting and instance loot, of which 18,245 in the catalogue; **27,652 here only** |
| `barters.xml` | 1,096 vendors, 3,469 profiles (12,360 references), 42,594 offers, 58,933 costs, 42,590 gifts | 36,096 different gifts, of which 11,586 in the catalogue; 3,063 costs, of which 2,557 in the catalogue |
| `containers.xml` | 6,262 (5,735 containers, 527 relic containers) | 4,626 with trophy list, 926 with treasure list, 494 with both, 1,204 without list |
| `disenchantments.xml` | 27,333 rows | 10,315 sources in the catalogue; 26,341 with result, 992 without; 45 different results, of which 22 in the catalogue |

Noteworthy: the 45 disenchanting results are exclusively
exchange vouchers ("Receipt of …"). Disenchanting therefore yields no equipment
but a barter paper. That is not an error in the data and must not be presented as
"loot".

**All referenced IDs are in the own full export**, with names in DE, EN
and FR, quality, level and icon ID. Checked on 20.11.2026: 36,827
barter IDs, 27,378 disenchanting IDs and 44,639 container IDs, not a single gap.
A fallback to Companion name labels is therefore superfluous.

## 3. ID format

All game IDs are 32-bit numbers. The data space and the website carry them as
eight-digit uppercase hex (`70000821`), the Companion XML files and the
full export as a decimal number (`1879050273`). The conversion happens once during the
build (`'%08X' % int(wert)`); the data model holds only the hex format.

## 4. Data model

### 4.1 Slim item set `daten/item-kurz.json`

The own catalogue (`daten/items.json`, 52,802 records) is a
merge of equipment details, rewards, recipes and resource occurrences –
not a complete item catalogue. The 27,652 referenced items
missing there are mainly category `ITEM` (other), plus
equipment without a detail record. They are fully described in the client;
only their inclusion in the catalogue is missing.

```json
{"schema": 1, "quelle": "items-2026-11-08/items.json", "stand": "2026-11-08",
 "items": {
   "7005DEB4": {"n": {"de": "Wappen des Sperlings", "en": "…", "fr": "…"},
                "q": "RARE", "l": 1, "ic": 1092686755}
 }}
```

- **Supplementary only.** A record from `daten/items.json` always wins; the file
  fills gaps only and creates **no** catalogue page.
- **Inclusion rule:** all IDs that barter, disenchanting or instance loot
  reference and that are missing in the catalogue (27,652). Container pools stay out,
  because they never appear as a row – the container stands as a source on the
  item, not the other way round.
- **Icons:** `ic` is the client's icon ID. 5,344 icons are needed;
  950 already sit in `web/bild/items/`, the remaining 4,394 in `itemIcons.zip`.
- **Not in the search.** `build_gegenstandssuche.py` stays with the curated
  catalogue, otherwise the result list would grow by 27,652 junk entries.
- Two groups need a decision beforehand: 1,336 recipe objects
  ("Recipe: …") and 1,984 records with the `x` flag. Until then they are not included as
  normal barter goods.
- A record from this file creates **no** catalogue page. An item
  without a page is named with client name and icon, but not linked.

### 4.2 Barter `daten/tausch.json`

A profile is a vendor's offer: a list of costs and a
list of gifts. The same profile can be used by several vendors
(3,469 profiles against 12,360 references), which is why the vendor reference sits on the
offer, not on the profile.

```json
{"schema": 1,
 "quelle": {"datei": "lore/barters.xml", "stand": "2026-11-01"},
 "haendler": {
   "70000AAE": {"name": "Jolfur", "titel": "Hunter Trainer",
                "klasse": "Hunter",
                "ort": {"karte": 268437557, "x": 41.2, "y": 63.8,
                        "gebiet": "Eriador"}}
 },
 "angebote": [
   {"profil": "7000B0C8",
    "haendler": ["70000AAE"],
    "geben": [["7000A2C1", 100], ["7000A2C2", 16]],
    "erhalten": [["7000B7D1", 1]],
    "bedingung": {"klasse": "Hunter", "fraktion": ["7000BEEF", 4],
                  "aufgabe": null}}
 ]}
```

Rules:

- **Quantities.** If `quantity` is missing in the source, 1 applies (44,161 of 58,933 costs
  carry a quantity, 14,772 do not; for the gifts 783 of 42,590). The 1 is
  therefore proven and not an assumption.
- **Conditions** stay separate and are not offset into a "from level X".
  `requiredClass` sits on the vendor (159 of 1,096) or on the profile
  (12), `requiredFaction` on 565 profiles in the format `"<fraktion>;<stufe>"`,
  `requiredQuest` on 505. The meaning of the level number still has to be proven and
  is carried only as a raw value until then.
- **Location** comes from `did-positions-2026-11-03/positions.jsonl` (world position
  `instance` 0); 1,095 of the 1,096 vendors have a position. Map and
  coordinates arise with the same rule as for quest givers and
  landmarks, no invented point.
- **Merging with the existing set.** `daten/items.json` already carries a field
  `tausch` from the recipe source export (recipes only, type `tausch`). The new
  source is merged additively and deduplicated by `(händler, abgaben, gabe)`;
  the old set is not silently replaced.
- **No silver price.** Barter costs items, not coins. Vendor prices
  in silver are in `vendors.xml` and remain a separate statement.

### 4.3 Containers `daten/behaelter.json`

A container is a world object (field, crate, node), not an item. It
references loot tables; the resolution uses the same graph as the
instance chests.

```json
{"schema": 1,
 "behaelter": {
   "70000D11": {"name": "Southlinch Field", "art": "container",
                "pool": [{"i": "7001A2B3", "p": 0.25},
                         {"i": "7001A2B4", "p": 0.25}]}
 }}
```

- `art` is `container` or `relics`. Relic containers (527) reference
  `relicsListId` and yield relics, not items; they get their
  own branch instead of outputting relics as items.
- 1,204 containers have neither trophy nor treasure list. They stay in the set
  with a name, but without a pool – no invented loot.
- Probabilities are chances per opening, not a sum above 100 %. With
  several independent rolls each chance stands on its own, as with the
  instance chests.
- On the website the container appears only as a **source** of an item
  ("where from: container"), not as its own entity.

### 4.4 Disenchanting `daten/zerlegung.json`

```json
{"schema": 1,
 "zerlegung": {
   "7000C1D2": [{"i": "7001F0A1", "menge": 1}]
 },
 "ohne_ergebnis": ["7000C1D3"]}
```

- 992 sources have no `resultItemId`. They are in `ohne_ergebnis` and
  create no "disenchanting yields" row.
- Result names come from the catalogue or the slim item set; the 45
  vouchers are mainly not in the catalogue and stay without a link.
- The relation is directed and not symmetric: "is disenchanted into" is
  not a use of the result.

### 4.5 Shared loot graph `tools/lootgraph.py`

The resolution of trophy, treasure, weighted and filtered tables
currently sits in `tools/build_instanz_beute.py` (described in domain terms in
[`docs/fachbereiche/instanzenfinder-dat.md`](../fachbereiche/instanzenfinder-dat.md)).
It is extracted as its own module so that instance chests and containers
use the same logic:

- `lade_graph(pfad)` → `{(tag, id): element}`
- `loese(graph, "trophyList", id)` → `{item_id: chance}`
- `chance()` and `gewicht()` encapsulate the rule "`dropFrequency` is a chance,
  `weight` is relative to its pool".

No second resolver, no deviating probability calculation.

## 5. Integration into pages and contract

| Place | Group | Content | From six records |
|---|---|---|---|
| Item | **Where from: barter** | vendor, place, costs | filter component |
| Item | **Where from: containers** | container name, chance | filter component |
| Item | **Disenchanting yields** | result, quantity | directly |
| Vendor | **Barter goods** | gift, costs, condition | filter component |

The entity contract is extended accordingly (`i`: `where_barter`,
`where_containers`, `disenchants_into`; `vendor`: `barter`), each with status
`open` and reason: source and model exist, the page does not yet build the group.
The row fields stay with identity and classification; quantities and prices
belong on the detail page, not in the list.

Rules that apply here as well:

- No link without a catalogue page. For 24,510 of the 36,096 barter gifts there is no
  page; they are named, not linked.
- No invented prices, levels or reputation thresholds.
- Missing information leads to omitting the row or the heading, not to
  "not checked".

## 6. Planned pipeline

1. A generator for the slim item set reads the own
   full export and writes only missing, referenced IDs.
2. `tools/build_tausch.py` → `daten/tausch.json`; positions from the
   did-positions export, map via `game_maps` as with quest givers.
3. `tools/build_behaelter.py` → `daten/behaelter.json` via `lootgraph`.
4. `tools/build_zerlegung.py` → `daten/zerlegung.json`.
5. `tools/php_viewmodel.py` adds the groups; `build_php_data.py` writes
   them into the page models. Then contract status from `open` to `component`.
6. Add the new `daten/*.json` to `tools/build_release.py` and `.gitignore`
   (the files stay local, like all data).

## 7. Checks

- Costs and gifts resolve against the catalogue or full export; no empty
  names in the output.
- Every offer has at least one cost and one gift.
- Totals: 42,594 offers, 6,262 containers, 27,333 disenchantments; deviations
  are reported, not silently swallowed.
- Sample Glinghant/"Gloves of the Seven Stars": profile present, costs
  Mark 100 + Medallion 16, vendor at a position.
- Disenchanting: 992 without result stay without a row.
- Entity contract and `php_viewmodel` name the same group names.

## 8. Open points

- Meaning of the number in `requiredFaction="<id>;<n>"` (reputation level?) is not
  proven; raw value only until then.
- Whether barter goods without a catalogue page should get their own, slim page
  (name, icon, barter places) or stay nameless.
- Whether relic containers and relics are shown at all; relics are not
  items in the catalogue.
- Whether the container reference also appears on the map view (resource occurrences show
  find spots today, no containers).
