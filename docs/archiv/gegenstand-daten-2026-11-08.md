# Item data for the central catalogue (08.11.2026)

This handover keeps the shared rules of 08.11.2026: **no second
item list**, no separate page, no separate generator. Only lookup data is delivered
for IDs that the central index already carries.

## Type, path, source

| Point | Value |
|---|---|
| Type letter | `G` (existing equipment type in the index) |
| Path segment | `gegenstand` (existing, `/de/gegenstand/<ID>/`) |
| Source | existing `G` stock from `rewards-stats`; this file supplements it |
| Linking | exclusively via the eight-digit item ID, never via the name |
| Name collisions | 520 names exist two or three times; the ID decides |

The central index keeps navigation, order, sitemap and search. The
JSON file is a reference work (`items` as an object by ID), not a list.

## Files

| File | Content | Size |
|---|---|---:|
| `daten/gegenstand-details.json` | 40.755 equipment details by item ID (exactly the existing `G` index) | 19,0 MB |
| `daten/gegenstand-sets.json` | 2.223 sets with members and bonuses | 607 KB |
| `daten/gegenstand-stat-labels.json` | 30 used stats in DE/EN/FR | 4 KB |
| `daten/gegenstand-typen.json` | slot, armour, weapon, quality and kind labels | 4 KB |
| `Companion-Test/source-exporter/items-2026-11-08/icons/gegenstaende/` | 3.927 item icons, 32×32 WebP | 15 MB |

The icons are inventory symbols, not a 3D view. In the list area they are
not loaded; only the detail view needs a file.

## Fields in `gegenstand-details.json`

```json
{
  "schema": 1,
  "note": "Lookup by item ID; not a second item list.",
  "items": {
    "70043B7E": {
      "name": {"de": "Gepolsterte Überhose des Mathom-Jägers",
               "en": "Mathom-hunter's Padded Leggings",
               "fr": "Jambières matelassées de chasseur de Mathoms"},
      "quality": "INCOMPARABLE",
      "level": 1,
      "minLevel": 1,
      "category": "ARMOUR",
      "kind": "a",
      "slot": "LEGS",
      "subtype": "MEDIUM",
      "icon": 1090526315,
      "armour": 13,
      "dps": 0,
      "damage": 0,
      "speed": 0.0,
      "damageType": "",
      "binding": 1,
      "unique": false,
      "essenceSlots": 0,
      "scalable": true,
      "stats": []
    }
  }
}
```

- `kind`: `a` armour, `w` weapon, `j` jewellery.
- `slot`: `HEAD`, `CHEST`, `FINGER`, `MAIN_HAND`, …
- `subtype`: for armour `LIGHT`/`MEDIUM`/`HEAVY`/`SHIELD`/…, for weapons
  `ONE_HANDED_SWORD`/`BOW`/…, for jewellery empty.
- `binding`: `1` bound on acquisition, `2` bound on equipping, `0` free.
- `stats`: `[statId, Wert]`; the labels stand in
  `gegenstand-stat-labels.json`.
- `sources`: only `q` (quest) and `d` (deed); the names are resolved by the central
  catalogue from its own data.
- `vendors`: vendor IDs; names and positions come from the central
  NPC stock.
- `recipe`: recipe ID for „hergestellt durch“.
- `set`: set ID; members and bonuses stand in `gegenstand-sets.json`.
- `scalable`: item scales with the level; `level` is then only a
  display value, not a fixed item level.

## Section order (rule 4)

| Section | Data source |
|---|---|
| **Kurz** | `name`, `quality`, `level`, `minLevel`, `slot`, `subtype`, `kind` |
| **Ort oder Vorkommen** | `vendors` (vendor IDs); positions not yet linked. No single point, therefore no „Ort“ without a check. |
| **Woher** | `sources` (quest/deed), `recipe`, `vendors` |
| **Wofür** | `stats`, `armour`, `dps`, `damage`, `speed`, `damageType`, set bonuses |
| **Zusammenhang** | `set`, `recipe`, `essenceSlots`, `requiredClass`, `requiredProfession` |
| **Details** | `icon`, `description`, IDs, `scalable`, `unique`, `binding` |

## Search

The index already carries the `G` rows. This file delivers only the details
for them. If new `G` rows are needed, the fields are:
**type `G`, ID, name, context (`kind · slot`), level (`minLevel`)**.
No additional search list is created.

## Scope and honest limits

- **40.755** equipment items, exactly the IDs of the existing `G` index
  (21.257 armour, 6.964 weapons, 12.534 jewellery). The file contains no
  additional IDs and no order; it only supplements the existing
  entries.
- The complete export covers 79.325 equipment parts; for the website
  deliberately only the 40.755 IDs of the central index were taken over.
- **2.223** sets, **11.159** set parts; **10.487** of them lie in the `G` index.
  Output set members outside the index only as text, do not link them.
- **3.927** icons, all present. They cover the 40.755 `G` IDs.
- **19.246** of the 40.755 items scale. For them no fixed
  stat values are given; the page must show „skaliert ab …“.
- **233 ingredient types** (recipes) have no source in the game data; that
  concerns the recipe page, not these item details.
- **Vendor positions** are not yet linked. 820 of the 40.755 items
  have vendor IDs; the positions lie in
  `did-positions-2026-11-03/positions.jsonl` and can be supplemented from there.
- **Reward sources**: the `G` index is not the reward index (`g`).
  Therefore this file contains no quest/deed sources; „Woher“ comes from
  vendors, recipes and sets.
- **Stat values** are computed from the progression curves and rounded. Before
  a live statement, check them once against an in-game tooltip.

## Regenerating

The detail file is filtered from the full export. The ID list is the
`G` set of the central index (one ID per line):

```sh
cd ../Companion-Test/source-exporter
python3 export_item_details.py --ids /pfad/g-ids.txt \
  --output ../../lotro-log-book/daten/gegenstand-details.json
python3 export_item_sets.py --output ../../lotro-log-book/daten/gegenstand-sets.json
```

## Check

- 152.100 item IDs from the DAT inventory, 152.088 written with names
  (12 without a usable name).
- Sample of 60 items: 60/60 names, 60/60 icons, 59/60 level (1
  scaling), DPS/durability/quality 100 % congruent with the DAT.
- 10/10 recipes: result and ingredients exact.
- 2.223 sets, 0 missing members.
- All 3.927 required icons present.
- No page, no separate generator, no second list in the web directory.
