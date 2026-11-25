# Client data refresh: adoption checks

The 22 November patch was exported separately under
`~/.cache/llb-data-update-20261122-verified/` using `tools/update_data.py`.
The active catalogue and game plugin were not updated.

## Adopted on 25.11.2026: recipes and items

Two families are published; the catalogue (quests, deeds, positions) is not.

- **Recipes** from `recipes/recipes.json` of the export, filtered by the four
  withheld IDs below into `~/.cache/llb-adopt-20261122/recipes.json`:
  `build_rezepte.py --sprache <de|en|fr> --quelle <filtered> --ziel web`.
  7 924 → 7 926 recipes in every language, i.e. exactly `7007764C` and
  `700777B8`. 50 German rows changed, mostly the result-item names that follow
  from the item export (e.g. „Teak-Brett" → „Teakbrett").
- **Items** from `items/items.json` of the export:
  `LLB_REZEPTE_EXPORT=<filtered> LLB_ITEM_EXPORT=<export>/items/items.json
  python3 build_items.py` (the two environment variables were added for this
  run; the defaults still point at the 06.11./08.11. exports). 22 records
  changed, 10 of them German names — the `n.de` corrections from `diff.json`.
  The four result items of the withheld recipes (`70076B37`, `70076B3E`,
  `70076B42`, `70076B58`) were removed again, so no German-only item page
  appears.
- `tools/build_php_data.py --sprache alle` rebuilt the whole PHP data
  (18 041 files); the release was uploaded as the `daten` component (1 113
  files, 189.6 MB) and checked live: the two recipes answer 200 in DE/EN/FR,
  the withheld recipe and the withheld title 404, `70070BD9` shows „Teakbrett".

Still open, and the reason this stays a partial adoption:

- **Quests, deeds and the 13 objective coordinates** need the plugin catalogues
  regenerated from the same export first
  (`MagicQuestLog/tools/build_catalog_from_export.py --export
  <export>/catalogue --enums <enum-names.json> --output <scratch>`), then
  `build_daten.py` and the PHP data again. That step also carries the quest text
  changes from the patch and touches the plugin checkout, so it is its own run.
- The remaining checkboxes below (withheld recipes and title, Golwen mission,
  Rhûn labels, source families not covered) are unchanged.

- [x] Read the four result IDs and the Nan Ogol reward title directly from
  the updated DATs. A targeted DE/EN/FR export and separate EN and FR runs
  confirm that the decoder returns only German names for these IDs. The
  four result IDs are absent from the Companion `items.xml` input that
  defines the scope of the full item export; they are not absent from the DATs.
- [ ] Keep recipes `70076B3C`, `70076B49`, `70076B4A`, `70076B52` and title
  `70075B12` out of the all-language candidate pending verified EN/FR names.
  The banquet (`70076B52`) also uses the other three affected results as
  ingredients. For `7007764C` and `700777B8`, the result and every exported
  ingredient have names in all three languages and exist in the current item
  model.
- [x] Build recipe-only candidate data for DE/EN/FR in
  `~/.cache/llb-recipe-audit.Pqqz1e/` with the four unresolved recipes
  excluded. Verify that both remaining new recipes are present and all
  their item targets have page models in each language. Rendered recipe
  pages and links still need to be checked in the full candidate build.
- [x] Review the map diff against the old web model and the DAT position records.
  The test candidate changes only the objective coordinates of 12 quests and
  one deed: two Kighân quests (`700715A7`, `70073DAD`), seven variants of
  „Aus der Asche erhebt sich die Tugend“ (`700749BE`–`700749C4`), three Nan Ogol
  quests (`700761A0`, `70077611`, `700776EE`) and „Schätze des Agarnaith“
  (`7004ADE6`). The objective/condition IDs, target IDs, game regions and map
  bounds support the changes. The map frames and hierarchy stay untouched.
- [ ] Keep the existing public position for the Golwen mission (`70075E88`):
  the changed DAT record is a named mission hotspot without a target ID;
  there is no independent evidence for placing it on the public map.
  Keep `Rhûn` on the four affected German maps (`268455274`, `268455278`,
  `268455280`, `268455287`): `Äußeres Mordor` is evidenced for area `70074545`,
  not for the region labels of those maps. Raw position changes that do not
  resolve to a verified public objective pin are not imported.
- [ ] Refresh or explicitly retain the source families not covered by this
  pass, including factions, NPCs/vendors, chest loot, resources, travel and
  map art. No raw-export count establishes that these are unchanged.
- [x] Build the isolated DE/EN/FR PHP candidate in
  `~/.cache/llb-php-candidate-92vrxog0/`. The search and recipe indexes contain
  exactly the two approved additions, and the map shards agree with the
  PHP objective data on all 13 patched records in every language.
  `review.json` lists the affected IDs, before/after coordinates, and evidence.
  The active data, map hierarchy, and withheld recipes/title stay unchanged.
- [x] Verify rendered pages on that candidate in DE/EN/FR: global search →
  crafting list → recipe page, all 36 ingredient/result link checks (HTTP 200)
  and the link from each result back to its recipe. All four withheld recipe
  IDs and the withheld title return 404 in each language. The epic files are
  byte-identical to the active files; volumes, books, chapter details and map
  markers work on desktop and mobile in all three languages. The full German
  epic browser regression and 15 update/item model tests passed.
- [ ] Review the isolated candidate before replacing the active data.
  Publication is separate and requires an explicit request.
