# Rework entity linking completely

**Status:** partly implemented; technical URL audit passed (16.11.2026)
**Created:** 15 November 2026
**Audit:** `docs/archiv/entitaeten-link-audit-2026-11-15.md`

## Goal

All verified relations between quests, deeds, items, recipes,
areas, regions, quest givers, landmarks, factions, titles, virtues,
sets and instances should point either to a canonical detail page or, for a reason,
to an application. Unverified or deliberately
excluded relations must remain documented as such.

## Priority 1: fix broken targets

- [x] In `tools/php_viewmodel.py`, no longer link the landmark parent map blanket
      as `region`.
- [x] Centralise the map tree rule: top-level map → region,
      sub-map/area → area; technical or unpublished
      maps stay text.
- [x] Check the 51 affected map IDs (153 language-dependent URLs) from the audit automatically against
      `phpdata/*/page-area` and `page-region`.
- [x] Reduce all 4.572 faulty URL fields to 0 after the rebuild.
      Follow-up check: 1.449.979 internal URLs, 0 unresolvable.

## Priority 2: actually link existing IDs

- [x] In set members (`tools/set_viewmodel.py`) link existing
      item IDs directly to item detail pages.
- [x] For the formerly 498 affected set members per language, check whether an
      item page is built. Result: For 10.654 of 11.152 set members
      per language an item page exists; 498 IDs are already missing from the item
      catalogue and therefore deliberately remain without a link.
- [x] Add a regression: `members[].id` with an existing
      item page must not have `members[].url == null`.
- [x] Check raw data for title, virtue, trait and emote rewards:
      output stable IDs and link them on detail pages when the IDs
      are unambiguously present. The current quest/deed export contains no
      stable IDs for these reward kinds; name resolution remains
      excluded.
- [ ] Evaluate item, recipe and deed rewards separately by ID, name and
      selectable variant; do not force an uncertain
      name resolution.

## Priority 3: decide domain fallbacks

- [ ] Document the 59 DNT sources per language (177 entries in total) as a deliberate
      exception and fix a uniform presentation.
- [ ] For `area_trail` classify the 39.694 text cases:
      published area page, technical map, missing map ID or
      deliberately non-linkable hierarchy.
- [ ] Check whether quest givers without `gi` should continue to lead to the search
      or whether a verified giver ID can be added from the source data.
- [ ] Keep application paths only where no unambiguous detail page
      exists: map, travel, item search, crafting, reputation and
      instance finder.
- [ ] Allow no legacy `.html` or non-canonical entity links in new
      viewmodels/templates.

## Complete technical check

- [ ] Reconcile the link matrix from the audit against `php_viewmodel.py`,
      `RelatedLists.php`, all entity Twig templates and the generators.
- [ ] Check all URL fields of the `phpdata` pages again:
      valid detail page, valid application, legacy, 404.
- [ ] Additionally check raw data IDs that reach no URL entry in the viewmodel.
- [ ] Check `RelatedLists.php` for title, virtue, set, landmark, faction,
      quest giver and area; URL detection and list filters must not
      lose any relations.
- [ ] Check JavaScript links and `data-*` targets in map, search, crafting and
      adventure views separately from the server-side JSON.
- [ ] Check back links and „Wird vorausgesetzt von“ in all entity types.

## Language and URL acceptance

- [ ] Check DE, EN and FR for every corrected relation.
- [ ] Check canonical paths against `php/src/Catalogue.php`.
- [ ] Test upper/lower case, trailing slash, old `.html` addresses and real
      404 via `php/src/Router.php`.
- [ ] Check static no-JavaScript pages: all important relations
      must appear as an HTML link or comprehensible text.
- [ ] Check JavaScript views on desktop and mobile.

## Tests and acceptance criteria

- [x] Take the audit script into the repository as a reproducible check building block.
- [x] `git diff --check`
- [x] `python3 -m unittest discover -s tests -p 'test_*.py'` (263 tests)
- [ ] Run existing PHP/catalogue parity tests.
- [x] Browser check of the corrected DE/EN/FR relations and the
      published set tiles.
- [x] No broken entity URLs in the built stock (1.449.979 checked,
      0 unresolvable).
- [ ] Every remaining `url: null` relation is fully classified and justified in the
      audit.
- [ ] Only canonical internal detail pages are created as entity links.
- [ ] Application paths are deliberate and parallel across languages.

## Not part of this TODO

- No change to the already uncommitted quest/map changes
  without their own TODOs.
- Add no new game content or relations from external wikis.
- The checked corrections were published on 16.11.2026; further
  link relations remain outside this completed scope.
