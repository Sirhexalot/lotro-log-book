# Compacted exports: properties, ID references and data loss

The stored historical exports are checked against the active local Companion lore. Without a shared source timestamp, differences do not prove a game or decoder error. All open values and field deviations are listed in full in `lotro-datenraum-exportvergleich.json`.

## Complete structure of the checked compact sets

## items

| Property path (`<id>` = dynamic key) | Types/occurrences |
| --- | --- |
| `$.items.<id>` | dict: 152088 |
| `$.items.<id>.ar` | int: 152088 |
| `$.items.<id>.at` | str: 152088 |
| `$.items.<id>.b` | int: 152088 |
| `$.items.<id>.c` | str: 152088 |
| `$.items.<id>.d` | dict: 62499 |
| `$.items.<id>.d.de` | str: 62499 |
| `$.items.<id>.d.en` | str: 62499 |
| `$.items.<id>.d.fr` | str: 62499 |
| `$.items.<id>.dmg` | float: 22918, int: 129170 |
| `$.items.<id>.dps` | float: 22918, int: 129170 |
| `$.items.<id>.dt` | str: 152088 |
| `$.items.<id>.es` | int: 8633 |
| `$.items.<id>.ic` | int: 152088 |
| `$.items.<id>.l` | int: 152088 |
| `$.items.<id>.m` | list: 152088 |
| `$.items.<id>.m[]` | list: 183918 |
| `$.items.<id>.m[][]` | int: 367836 |
| `$.items.<id>.ml` | int: 149602, null: 2486 |
| `$.items.<id>.n` | dict: 152088 |
| `$.items.<id>.n.de` | str: 152088 |
| `$.items.<id>.n.en` | str: 152088 |
| `$.items.<id>.n.fr` | str: 152088 |
| `$.items.<id>.q` | null: 2823, str: 149265 |
| `$.items.<id>.rc` | str: 31345 |
| `$.items.<id>.rp` | str: 6630 |
| `$.items.<id>.s` | str: 152088 |
| `$.items.<id>.set` | str: 11159 |
| `$.items.<id>.sm` | int: 29743 |
| `$.items.<id>.spd` | float: 152088 |
| `$.items.<id>.sx` | int: 8808 |
| `$.items.<id>.u` | int: 152088 |
| `$.items.<id>.wt` | str: 152088 |
| `$.items.<id>.x` | int: 152088 |
| `$.items.<id>.xl` | int: 15112 |
| `$.manifest` | dict: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.inventory` | str: 1 |
| `$.manifest.item_ids` | int: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.lore` | str: 1 |
| `$.manifest.written` | int: 1 |
| `$.sets.<id>` | dict: 2223 |
| `$.sets.<id>.b` | list: 2223 |
| `$.sets.<id>.b[]` | list: 4371 |
| `$.sets.<id>.b[][]` | int: 4371, list: 4371 |
| `$.sets.<id>.b[][][]` | list: 1742 |
| `$.sets.<id>.b[][][][]` | str: 3484 |
| `$.sets.<id>.i` | list: 2223 |
| `$.sets.<id>.i[]` | str: 11159 |
| `$.sets.<id>.l` | int: 2123, null: 100 |
| `$.sets.<id>.n` | dict: 2223 |
| `$.sets.<id>.n.de` | str: 2223 |
| `$.sets.<id>.n.en` | str: 2223 |
| `$.sets.<id>.n.fr` | str: 2223 |
| `$.sets.<id>.x` | int: 2160, null: 63 |
| `$.stats.de.<id>` | list: 5301 |
| `$.stats.de.<id>[]` | bool: 5301, str: 5301 |
| `$.stats.en.<id>` | list: 5342 |
| `$.stats.en.<id>[]` | bool: 5342, str: 5342 |
| `$.stats.fr.<id>` | list: 5301 |
| `$.stats.fr.<id>[]` | bool: 5301, str: 5301 |

## rewards

| Property path (`<id>` = dynamic key) | Types/occurrences |
| --- | --- |
| `$.emotes.<id>` | dict: 18 |
| `$.emotes.<id>.n` | dict: 18 |
| `$.emotes.<id>.n.de` | str: 18 |
| `$.emotes.<id>.n.en` | str: 18 |
| `$.emotes.<id>.n.fr` | str: 18 |
| `$.items.<id>` | dict: 6901 |
| `$.items.<id>.b` | int: 6177 |
| `$.items.<id>.l` | int: 6901 |
| `$.items.<id>.n` | dict: 6901 |
| `$.items.<id>.n.de` | str: 6901 |
| `$.items.<id>.n.en` | str: 6901 |
| `$.items.<id>.n.fr` | str: 6901 |
| `$.items.<id>.q` | int: 6893 |
| `$.manifest` | dict: 1 |
| `$.manifest.backend` | str: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.emotes` | int: 1 |
| `$.manifest.export` | str: 1 |
| `$.manifest.items` | int: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.reward_tables` | int: 1 |
| `$.manifest.schema` | int: 1 |
| `$.manifest.source_archives` | list: 1 |
| `$.manifest.source_archives[]` | dict: 26 |
| `$.manifest.source_archives[].file` | str: 26 |
| `$.manifest.source_archives[].size` | int: 26 |
| `$.manifest.titles` | int: 1 |
| `$.manifest.traits` | int: 1 |
| `$.manifest.virtue_names_source` | str: 1 |
| `$.manifest.virtues` | int: 1 |
| `$.tables.<id>` | dict: 8081 |
| `$.tables.<id>.choice` | list: 1660 |
| `$.tables.<id>.choice[]` | list: 5631 |
| `$.tables.<id>.choice[][]` | int: 5631, str: 5631 |
| `$.tables.<id>.emotes` | list: 15 |
| `$.tables.<id>.emotes[]` | int: 20 |
| `$.tables.<id>.fixed` | list: 6039 |
| `$.tables.<id>.fixed[]` | list: 9498 |
| `$.tables.<id>.fixed[][]` | int: 9498, str: 9498 |
| `$.tables.<id>.titles` | list: 2524 |
| `$.tables.<id>.titles[]` | str: 2551 |
| `$.tables.<id>.traits` | list: 258 |
| `$.tables.<id>.traits[]` | str: 252 |
| `$.tables.<id>.virtues` | list: 565 |
| `$.tables.<id>.virtues[]` | list: 704 |
| `$.tables.<id>.virtues[][]` | int: 1408 |
| `$.titles.<id>` | dict: 2545 |
| `$.titles.<id>.n` | dict: 2545 |
| `$.titles.<id>.n.de` | str: 2545 |
| `$.titles.<id>.n.en` | str: 2545 |
| `$.titles.<id>.n.fr` | str: 2545 |
| `$.traits.<id>` | dict: 204 |
| `$.traits.<id>.n` | dict: 204 |
| `$.traits.<id>.n.de` | str: 204 |
| `$.traits.<id>.n.en` | str: 204 |
| `$.traits.<id>.n.fr` | str: 204 |
| `$.virtues.<id>` | dict: 20 |
| `$.virtues.<id>.n` | dict: 20 |
| `$.virtues.<id>.n.de` | str: 20 |
| `$.virtues.<id>.n.en` | str: 20 |
| `$.virtues.<id>.n.fr` | str: 20 |

## recipes

| Property path (`<id>` = dynamic key) | Types/occurrences |
| --- | --- |
| `$.categories.<id>` | dict: 513 |
| `$.categories.<id>.de` | str: 513 |
| `$.categories.<id>.en` | str: 513 |
| `$.categories.<id>.fr` | str: 513 |
| `$.items.<id>` | dict: 9198 |
| `$.items.<id>.b` | int: 485 |
| `$.items.<id>.l` | int: 9041 |
| `$.items.<id>.n` | dict: 9198 |
| `$.items.<id>.n.de` | str: 9198 |
| `$.items.<id>.n.en` | str: 9198 |
| `$.items.<id>.n.fr` | str: 9198 |
| `$.items.<id>.q` | int: 9041 |
| `$.manifest` | dict: 1 |
| `$.manifest.backend` | str: 1 |
| `$.manifest.created_utc` | str: 1 |
| `$.manifest.export` | str: 1 |
| `$.manifest.items` | int: 1 |
| `$.manifest.label_source` | str: 1 |
| `$.manifest.languages` | list: 1 |
| `$.manifest.languages[]` | str: 3 |
| `$.manifest.recipes` | int: 1 |
| `$.manifest.schema` | int: 1 |
| `$.professions.<id>` | dict: 17 |
| `$.professions.<id>.de` | str: 17 |
| `$.professions.<id>.en` | str: 17 |
| `$.professions.<id>.fr` | str: 17 |
| `$.recipes` | list: 1 |
| `$.recipes[]` | dict: 7924 |
| `$.recipes[].c` | int: 7924 |
| `$.recipes[].ch` | float: 4557 |
| `$.recipes[].cr` | list: 4557 |
| `$.recipes[].cr[]` | int: 4557, str: 4557 |
| `$.recipes[].i` | list: 7924 |
| `$.recipes[].i[]` | list: 20810 |
| `$.recipes[].i[][]` | int: 20810, str: 20810 |
| `$.recipes[].id` | str: 7924 |
| `$.recipes[].o` | list: 4102 |
| `$.recipes[].o[]` | list: 8197 |
| `$.recipes[].o[][]` | float: 8197, int: 8197, str: 8197 |
| `$.recipes[].p` | str: 7924 |
| `$.recipes[].r` | list: 7924 |
| `$.recipes[].r[]` | int: 7924, str: 7924 |
| `$.recipes[].t` | int: 7815 |
| `$.recipes[].ti` | float: 7924 |
| `$.tiers.<id>` | dict: 17 |
| `$.tiers.<id>.de` | str: 17 |
| `$.tiers.<id>.en` | str: 17 |
| `$.tiers.<id>.fr` | str: 17 |

## recipe-sources

| Property path (`<id>` = dynamic key) | Types/occurrences |
| --- | --- |
| `$.created_utc` | str: 1 |
| `$.recipes_with_source` | int: 1 |
| `$.sources.<id>` | list: 4230 |
| `$.sources.<id>[]` | dict: 23701 |
| `$.sources.<id>[].art` | str: 23701 |
| `$.sources.<id>[].gebiet` | str: 23701 |
| `$.sources.<id>[].id` | str: 23701 |
| `$.sources.<id>[].name` | str: 23701 |
| `$.sources.<id>[].titel` | str: 23701 |

## ID checks

| Relation | Occurrences | Resolved | Open | Distinct open |
| --- | --- | --- | --- | --- |
| Item export ID → Companion item | 152088 | 152088 | 0 | 0 |
| Companion item → item export ID (coverage) | 152100 | 152088 | 12 | 12 |
| Set export ID → Companion set | 2223 | 2223 | 0 | 0 |
| Item export set → set export ID | 11159 | 11159 | 0 | 0 |
| Set export i[] → item export ID | 11159 | 11159 | 0 | 0 |
| Recipe export id → Companion recipe | 7924 | 7924 | 0 | 0 |
| Recipe export p → exported profession | 7924 | 7924 | 0 | 0 |
| Recipe export t → exported tier | 7815 | 7815 | 0 | 0 |
| Recipe export c → exported category | 7924 | 7924 | 0 | 0 |
| Recipe r → recipe item set | 7924 | 7924 | 0 | 0 |
| Recipe r → complete item export | 7924 | 7924 | 0 | 0 |
| Recipe cr → recipe item set | 4557 | 4557 | 0 | 0 |
| Recipe cr → complete item export | 4557 | 4557 | 0 | 0 |
| Recipe i → recipe item set | 20810 | 20810 | 0 | 0 |
| Recipe i → complete item export | 20810 | 20810 | 0 | 0 |
| Recipe o → recipe item set | 8197 | 8197 | 0 | 0 |
| Recipe o → complete item export | 8197 | 8197 | 0 | 0 |
| Reward fixed → exported items set | 9498 | 9498 | 0 | 0 |
| Reward choice → exported items set | 5631 | 5631 | 0 | 0 |
| Reward titles → exported titles set | 2551 | 2551 | 0 | 0 |
| Reward traits → exported traits set | 252 | 252 | 0 | 0 |
| Reward virtues → exported virtues set | 704 | 660 | 44 | 44 |
| Reward emotes → exported emotes set | 20 | 20 | 0 | 0 |
| Recipe source key → exported recipe ID | 4230 | 4224 | 6 | 6 |

## Field comparison item export ↔ Companion

Only fields actually present on both sides are compared. Uncompared values do not count as identical. Because of the documented fallback logic, the minimum level is not treated as a direct equality field.

| Compact field | Companion attribute | Compared | Identical | Deviating |
| --- | --- | --- | --- | --- |
| q | quality | 149265 | 149265 | 0 |
| l | level | 149591 | 149591 | 0 |
| c | category | 152088 | 152088 | 0 |
| s | slot | 90792 | 90792 | 0 |
| at | armourType | 41194 | 41194 | 0 |
| wt | weaponType | 22918 | 22918 | 0 |
| dt | damageType | 22918 | 22918 | 0 |
| rc | requiredClass | 31345 | 31345 | 0 |
| rp | requiredProfession | 6630 | 6630 | 0 |

## Set membership

0 item IDs are assigned to several sets in the Companion set. The compact item structure has only one scalar `set` value; it cannot represent this relation without loss. The set member lists are the authoritative complete reverse direction in the checked data state. 0 emitted item-set assignments contradict the member list.

## Classification of the open references

- All 12 Companion IDs missing from the item export have an empty name in the checked Companion state (12 actually checked). That alone does not prove the exact cause of their absence from the historical DAT export.
- 44 distinct references from `tables[].virtues` are missing from the compact virtue catalogue. Their actual stat labels are listed in full in the JSON. No join across identically named virtues and no silent interpretation of these stats as regular virtue objects.
- 6 recipe source keys are missing from the recipe export; 1 of them exist in the Companion recipe set. So separate export filters or timestamps must be checked, not automatically the source references deleted.

## Quests/deeds → compacted reward tables

The exporter filters tables without reward kinds it can use. A missing table key in the compact export therefore does not prove a broken DAT reference.

| Source | Table references | Resolvable in compact set | Not included |
| --- | --- | --- | --- |
| quests.json | 14252 | 10440 | 3812 |
| deeds.json | 5534 | 4452 | 1082 |

## Proven code transformations (not to be confused with raw data)

- `export_rewards.py:export`: fixed and selectable titles are merged into one list; the same applies to emotes. Without the raw tables the original selection role cannot be reconstructed.
- `export_items.py:main`: item IDs come from `items.xml`, not from a complete re-determination of all item classes. With multiple memberships, set assignment overwrites the previous scalar value.
- `export_items.py:compact`: binding 0/1/2, minimum-level fallbacks, 0/empty-string defaults and curve computation are transformations.
- `export_recipes.py:export`: a recipe without a resolved result or without resolved ingredients is dropped; missing quantities can become 1.

## Reproduction

`python3 lotro_datenraum_exportvergleich.py`. No client access and no write operation outside the plan folder. SHA-256 of all inputs used here is in the JSON evidence.
