# What the game data yields beyond positions – 6 November 2026

Read-only evaluation of the own DAT export
`Companion-Test/source-exporter/full-dat-en-de-fr-2026-11-03` plus targeted
reloads from the client (read only, nothing installed or changed).
No wiki, Kroel or deed tracker data.

## 1. Rewards: the largest unused block

Every quest and every deed refers to a reward table
(`Quest_QuestTreasureDID`). 9.594 different tables are used by 14.252
quests and all 5.534 deeds.

| Field in the table | Tables | Meaning |
|---|---:|---|
| `FixedItemArray` | 6.039 | fixed items with count |
| `SelectableItemArray` | 1.660 | selection from several items |
| `FixedTitleArray` | 2.511 | titles |
| `SelectableTitleArray` | 13 | titles to choose from |
| `FixedVirtueArray` | 565 | virtue + level |
| `Virtue_XP_Tier` | 9.544 | virtue experience, level |
| `FixedTraitArray` | 258 | trait/skill |
| `FixedEmoteArray` / `SelectableEmoteArray` | 15 | emote |
| `FixedBillingTokenArray` | 122 | store/content unlock, **no** player reward |

Distribution across the entries:

- **Quests:** 9.526 with fixed items, 1.800 with a selection, 204 with a title,
  115 with a trait, 7 with a virtue, 721 with virtue experience.
- **Deeds:** 3.224 with items, 570 with a virtue, 2.377 with a title,
  174 with a trait.

Example „Free the Tree“ (70000008): fixed „Gift Mathom“ plus a selection from three
level 9 items. Example „Barghest-slayer (Advanced)“ (70005BD3):
30× Mark and 1× Entschlossenheit.

### Items in rewards

- **6.905 different items** are granted as a reward.
- 9.502 fixed grants, 5.631 selection options.
- Resolved: name in DE/EN/FR, quality, item level, binding,
  base value. Levels from 1 to 572, median 50.
- Qualities: 2.840 ungewöhnlich, 2.303 selten, 782 besonders, 744 episch,
  228 gewöhnlich, 8 without statement.
- 6.180 of the reward items are bound on acquisition.

### Titles

- **2.545 different titles**, of them 61 with placeholders
  (`${NAME}`, `${RANK}`, `${SURNAME}`), for instance „Warg-hunter“ or
  „Honorary Shirriff“. Our plugin already resolves these placeholders.

### Virtues

- 20 of the 21 virtues appear in reward tables; the names can be
  cleanly assigned via the game's own stat designations
  (Entschlossenheit, Tapferkeit, Weisheit …).
- In addition there are test ranks („Skirmish Test Rank“), which must be filtered out.

## 2. Further evaluable areas

| Area | Records | Content |
|---|---:|---|
| Recipes | 7.925 | result, critical success, ingredients with quantity, chance, duration |
| Recipe items | 6.189 | the learnable recipe items |
| Vendors | ~1.466 | `Vendor_ItemList` with all sold items |
| Barter | 3.479 | barter lists: required items and quantities |
| Mount routes | 5.322 | start, destination, travel mode (plus 2.303 segments) |
| Item sets | 2.226 | members, set level, set bonuses |
| Loot tables | 15.305 | item, quantity, drop frequency |
| Group loot | 6.425 | `TreasureGroupProfile_ItemTable` |
| NPCs | 16.912 | incl. vendor, barter and reputation reference |
| Creatures | 20.835 | incl. species, level, loot references |

In addition, already used fields: reputation reward (`PosRepToGive`,
`PositiveFaction`), LOTRO points (`TurbinePointTier`), repeatable, daily,
time limit, group, instance, quest before/after.

## 3. What explicitly does not work cleanly

- **Item stats:** `Mod_Array` names only the changed stats and
  a progression ID. The numeric values sit in progression tables; without
  their evaluation every display would be guesswork. Quality, level, binding and
  base value, by contrast, are directly readable.
- **Item categories:** The earlier dry run yielded only 54 % hits
  against Compendium; 68 of 77 rules contradictory. So do not adopt categories
  blindly.
- **Quest XP and money:** Only 4.437 of 15.692 quests refer to a
  concrete reward table (`Quest_RewardLevelDID`). There exact values
  per tier stand (example: level 7 → 98 XP, 290 money). For the remaining 8.656 with a tier
  but without a table, the client's standard calculation would have to be replicated
  – do not show without proof.
- **Virtue quantities:** The assignment of virtue name is verified, the meaning of
  `QuestTreasure_Virtue_Increment` and `Virtue_XP_Tier` is not yet
  cross-checked. Until then only „Tugend: Entschlossenheit“, no invented number.
- **Loot chances:** `LootGen_TrophyList_DropFrequency` is a code, not a
  percentage. Without proof of meaning no probabilities.
- **Billing tokens:** content/store unlocks (e.g. „Legendary Moria“),
  no reward in the player's sense.
- **Test content:** test ranks, „DNT“, hiding content and test items must
  be filtered out as before.

## 4. Recommended order

1. **Rewards on quest and deed** (items incl. selection, titles,
   virtue name). Directly visible in the detail, clearly separated from the target location.
2. **Item pages for reward items** – which quest/deed gives
   it, which vendor carries it, which recipe makes it.
3. **Crafting: recipes** with ingredients and result; fits the existing
   crafting page.
4. **Virtue overview:** which deeds give which virtue (name verified).
5. Later: barter and mount routes. Loot chances and item stats only
   after proof of meaning.

Effort: point 1 is an extension of export, catalogue generator, plugin
detail text, web detail and tests. The data volumes stay small (reward
items a few MB), the three languages are completely present.

## 5. Implemented on 6 November 2026

- Reproducible export `Companion-Test/source-exporter/export_rewards.py`
  (uses the same Java reader, writes `rewards-2026-11-06/rewards.json`,
  2,1 MB, with source stamp).
- Catalogue: `rw` on every quest (in the detail block) and every deed (core file).
  **10.268 quests with 19.381 reward entries**, **4.445 deeds with 7.298
  entries**. Same IDs, same order and same quantities in DE/EN/FR;
  `verify_catalog.py` checks that.
- Display: plugin detail text and website show the rewards **before** the
  objectives are shown (the game's quest display shows them likewise). Titles
  are freed from the character name; `${...}` and `[e]` marks are removed.
- Web data: `build_daten.py` merges the detail blocks again. That was
  necessary because otherwise the website would have lost descriptions, steps,
  objectives and rewards since the catalogue split.
- Quality colours on the website, item level and „Zur Auswahl“ separated.
- Quantities of virtues deliberately remain unnamed (meaning of
  `Virtue_Increment`/`Virtue_XP_Tier` still unchecked).
- Check: `verify_catalog.py`, `test_plugin.py`, `test_features.py`,
  `test_struktur.py`, website unit tests, `test_i18n.js` and the browser check
  across 21 page variants plus map view passed.

## 6. Reward overview and recipes (6 November 2026)

- **New page „Belohnungen“** (`belohnungen.html`, DE/EN/FR) with three views:
  virtues (20), titles (2.509 DE / 2.520 EN / 2.494 FR) and items (6.564).
  Every entry names the quests and deeds that give it and links them.
  Search across names and sources; long lists show the first 300 hits.
- **Filter on the deed page:** „Belohnung: alle / Tugend / Titel / LOTRO-Punkte“.
  It applies only where it makes sense (deeds) and stands in the list head.
- **Recipes in crafting:** 7.924 recipes with result, ingredients (optionally separated)
  and critical success, profession and level, search and profession filter. Source:
  `export_recipes.py` (class 1024), 9.198 involved items, 11 professions.
  Profession, level and category names come from the game enums and
  Companion labels; item names are resolved in DE/EN/FR.
- **Data model:** reward items now carry their DID (`rw` entry,
  last field), so that the overview can combine identical items.
  `build_belohnungen.py` and `build_rezepte.py` write a separate file per language;
  `baue_website.py` copies and stamps them along.
- **Title cleanup:** duplicate separators („, , “) and a misplaced
  hyphen before lower-case words are removed; words stay
  unchanged.

### Recipe structure and crafting knowledge

- The recipes follow the structure of game and wiki: **Beruf → Stufe →
  Kategorie**. 10 professions, 17 tiers, 491 raw categories (163 without the
  item level in the name). Example Drechsler/Doomfold: Instrumente,
  Warden-Schnitzereien, Essenzen, Waffen, Verarbeitung.
- Crafting has two tabs **Berufe** and **Rezepte**; the recipe tab selects
  profession and level, below that the categories stand with tables. The search
  skips the tree and searches across result and ingredients.
- **Own crafting knowledge:** `crafting.xml` from Companion contains `<knownRecipe>`
  (Feldobar: 111, of them 108 Drechsler). The import now reads the IDs along
  (`rezepte` in the character store), the page shows ✓ bekannt, ○ fehlt and
  „–“ for foreign professions. Filter „nur fehlende“; counter per level. The starting profession
  is the one with the most known recipes.
- Without import the column stays empty; there are no invented marks.
  The state is as old as the last Companion import.
- The recipe data carry profession keys (`WOODWORKER` …), recipe ID and
  tier code, so that the assignment works without name comparison.
- **Names cleaned:** `\q` becomes the quotation mark (`"Alter Tobi"`),
  `\n` becomes the space; `[e]`/`[n]` marks, `${…}` placeholders and duplicate
  separators are dropped. `verify_catalog.py` checks that no raw mark
  stands in a reward.

## 7. Check tools

- Complete reward tables read: 9.594 tables, 0 read errors.
- 9.693 referenced item, title, trait and emote records
  resolved, names in DE/EN.
- Samples cross-checked: „Free the Tree“, „Barghest-slayer (Advanced)“,
  vendor Carlo Blagrove (125 articles), recipe 70001A60 (ingredients and
  critical success), mount route Esteldín, barter profile 7000AC44.
