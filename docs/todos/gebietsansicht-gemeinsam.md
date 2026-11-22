# Shared area view

## Goal

Quests, deeds, adventure, travel planner and landmark filter should show the same
comprehensible area order. The game map IDs and their parent paths
stay unchanged in the process. New DAT exports must visibly report
deviations from the display rules.

## Already implemented

- `referenz/gebietsansicht.json` holds the approved groups by stable
  map IDs: Dunland-Überblick, Ost-/West-Rohan and the three maps shown
  individually from the Dunland-Überblick.
- `tools/gebietssicht.py` checks map IDs and direct or regional
  parent relations against `daten/karten.json`; `build_gebiete.py` passes the
  metadata on to quests and deeds per language.
- The shared map tile view shows the approved groups. The
  Dunland overview map is reachable via a link in the group heading,
  not as an empty quest tile; the three named maps remain
  independent map IDs.
- The adventure area list is given group labels. The travel planner
  shows the matching group on the maps of its routes. In DE/EN/FR,
  redundant Ost-/West-Rohan prefixes are removed from the map names, without changing the
  map IDs or station assignments.
- Landmark filter and hits show the additional group region → group →
  landscape; filter values and landmarks stay on their original
  map IDs.
- Map overview and landmark index show the group labels in DE/EN/FR.

## Still open

- [ ] **Item sources:** The large quest/deed source filters on
  item detail pages currently show region → landscape, not the additional
  display group. In the current data this affects 13 large
  item source lists with quests/deeds from the approved groups; four
  of them contain both East and West Rohan. Add the group level only for these
  groups, keep map IDs and landscape selection as leaf values.
- [ ] **Export audit:** `validate_configuration()` currently checks the
  configured map IDs and their expected parent relations and stops
  on some deviations. It does not, however, log a comparison of the
  map set or of maps newly added or dropped around the
  groups. Add an ID/parent path diff against an approved baseline;
  do not use name heuristics.

## Checks so far

- Browser check of the map tile overview, landmark filter, adventure map
  and travel planner in DE/EN/FR, desktop and mobile each. Landmark filter with
  map ID `268448407` returns only entries of the Steppe / The Wold / Le Plateau
  in all languages; the DE hit count is 17. A sample route
  Flutwend → Aldburg (Floodwend → Aldburg / Coudeflots → Aldburg) shows
  East Rohan and West Rohan at the stations.
- The adventure map switches to the region view after selecting Rohan;
  area labels and list show Ost-/West-Rohan. Positions and routes were
  not changed.
- `python3 tools/build_gebiete.py`, `python3 build_reise.py` and
  `python3 tools/build_php_data.py --ziel "$HOME/.cache/llb-php/phpdata" --sprache alle`
  run; generated PHP data stays outside the repository.
- `python3 -m unittest tests.test_landmarks tests.test_gebiete tests.test_abenteuer tests.test_reisedaten`
  (43 tests), PHP syntax as well as Python/JavaScript syntax checks passed.
- During the language check it turned out that the travel planner was called
  „Reise“ in the HTML page title in all languages so far. Since then, page title and
  description are set correctly per language for DE/EN/FR.
