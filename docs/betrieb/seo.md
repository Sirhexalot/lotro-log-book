# Title and description per page

Status as of 14.11.2026. Applies to all catalogue and application pages.

## Why a rule

Until 14.11.2026, titles and descriptions arose in four places: in the
page layout, in every view function of `tools/php_viewmodel.py`, in
`php/src/Sets.php` and in `php/src/Givers.php`. Each place had its
own sentence structure. Consequences: 2.218 set pages with the same sentence, 5.067
quest giver pages from one template, 2.809 landmarks with „Landmarke: Name“,
areas with the brand twice („Katalog: Breeland – LOTRO Log Book.“), and
no length limit.

## The rules

**Title.** Name first, then a classification, then the brand.

- Budget: 60 characters including ` – LOTRO Log Book` (17 characters), so 43 for
  the core. If the classification no longer fits, it is dropped — never the name,
  never the brand.
- The classification is the page kind („Aufgabe“, „Tat“, „Landmarke“), with an
  area when needed („· Eriador › Angmar“), and for items the rarity.
- The brand hangs on the title exactly once. Both layouts check that
  (`php/templates/layout.twig`, `php/templates/app/layout.twig`).

**Description.** At most 155 characters, three building blocks:

1. what the page is: `Typ: Name.`
2. a verified fact: area and level, profession and level, number of parts or
   sources, location.
3. a benefit: what the page additionally shows (map, objectives, set bonuses).

The brand does not appear in the description of an entity page; it stands in the
title. Application pages keep their texts from `build_seo.PAGES`. If a
fact is missing, the sentence is dropped instead of writing a placeholder. Without any
fact, a longer benefit sentence carries the page (`seo.THIN`).

**Language.** Numbers with the separators of the language (`3.200` / `3,200` /
`3 200`), singular and plural from `seo.NOUNS`, French colon with a
space before it (`seo.COLON`).

**Differences.** `seo.dedupe()` adds a further
existing game content for identical texts, for instance a source or ingredient. If there is no meaningful
difference, the texts stay the same. Technical identifiers do not belong in the
search result. Missing details are not commented on and not replaced by
blanket promises about locations, sets or values.

**Lists.** Page 1 does not carry the page number in the text, every following page names
it (`Aufgaben: 200 Einträge mit Stufe, Gebiet und Art, Seite 2 von 76.`).
That also applies to the filter browsers (`Titles`, `Factions`, `Landmarks`,
`Sets`, `Givers`, `Instances`).

## Where it lives

| Place | Task |
| --- | --- |
| `tools/seo.py` | all texts, limits, singular/plural, `dedupe()` |
| `tools/php_viewmodel.py` | calls the building blocks for quests, deeds, items, recipes, titles, virtues, factions, landmarks, areas, regions, professions, lists |
| `tools/set_viewmodel.py`, `tools/giver_viewmodel.py` | set and quest giver detail pages |
| `php/src/Sets.php`, `php/src/Givers.php` | take `seo` from the page model |
| `php/templates/layout.twig`, `php/templates/app/layout.twig` | brand once, fallback to the page name |
| `tools/build_php_data.py` | `dedupe()` before writing the shards |

Application pages (map, search, crafting, start) keep their texts from
`build_seo.PAGES`; they follow the same length rules.

## Checking

```bash
python3 -m unittest tests.test_seo_texte
python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata"
```

Then per kind and language: no empty description, none over 155 characters,
no duplicate texts, name in the title. `tests/test_seo_texte.py` pins the
rules; the figures in the built state stand in the report of 14.11.2026.
