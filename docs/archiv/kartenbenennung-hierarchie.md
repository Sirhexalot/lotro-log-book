# Map naming and area hierarchy

- **Status:** implemented and checked
- **Decided on:** 20.11.2026
- **Scope:** map naming in `build_daten.py`, map navigation in
  `tools/build_gebiete.py`, quest/deed labels, region-and-area filter,
  breadcrumbs and map header
- **Documentation:** [Data model](../datenraum/lotro-datenraum.md#map-name-map-assignment-and-website-navigation),
  [arc42 building block view, 5.7/5.8](../arc42/05-building-block-view.md), [Risks, chapter 11](../arc42/11-risks-and-technical-debt.md),
  [Decision 9](../arc42/09-architecture-decisions.md)

## Finding of 20.11.2026

Comparison of the website navigation against `geoAreas.xml`, `parchmentMaps.xml` and
`maps/links.xml`:

- Our tree: 6 regions, 70 landscapes, 146 sub-maps, 216 names.
- `geoAreas.xml`: 7 regions, 86 territories, 679 areas.
- 30 landscapes carry exactly one territory name, 6 map an area,
  34 carry their own map names; 19 territories spread over several
  landscapes.
- 17 maps have no label. They produce 193 quest and
  52 deed labels per language as well as 17 of 216 navigation names of the form `Karte <ID>`.
- The region assignment comes from `f[0]`, not from the map region code.

Cause: `kartenname()` in `build_daten.py` ends on `'Karte %d' % ident`
when label, shared child prefix and English name are missing. The word is hard-wired
German and therefore also appears in EN and FR.

## Decision

A map name is derived from the verified area names. The chain reads:
**alias → language label → shared child prefix → English name → first
assigned area → parent map → language-neutral last resort**. The last resort
remains visible as a check finding and must not occur silently.

Area names come from `parchmentMaps.xml` (English key) and
`areas.json` of the own DAT export (DE/EN/FR). They are cleaned like
item names; 8 of 1.610 area names carry `\q` escapes.

## Affected maps and proposed names

| Map | Area (EN) | Area (DE) | Specification |
|---|---|---|---|
| 268450268 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268450269 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268450270 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268450272 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268450273 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268450274 | Helm's Deep | Helms Klamm | place in „West-Rohan: Helms Klamm“ |
| 268453919 | The Glittering Caves | Glitzernde Grotten | place in „West-Rohan: Helms Klamm“ |
| 268451976 | Battle of the Morannon | Die Schlacht am Morannon | own landscape, region for now Gondor |
| 268451156 | Minas Tirith Besieged | Minas Tirith belagert | own sub-map |
| 268451023 | Osgiliath | Osgiliath | own sub-map |
| 268451074 | The Sundering of Osgiliath | Osgiliaths Spaltung | own sub-map |
| 268451575 | Pelennor | Pelennor | own sub-map |
| 268451286 | Field of Onslaught | Feld des Angriffs | own sub-map |
| 268452359 | Cormallen | Cormallen | own sub-map |
| 268450899 | Pelargir | Pelargir | own sub-map |
| 268454943 | The Gnawnshore | Die Zahnküste | own landscape |
| 268455287 | Bâr Guruthos | Bâr Guruthos | own sub-map |

„Eigene Unterkarte“ means: the name replaces the technical identifier; the
assignment to the landscape stays as it follows today from `f[1]`.

## Implementation and check (21.11.2026)

- `build_daten.py` uses the assigned DAT areas for the 17 checked IDs
  from `parchmentMaps.xml` and `areas.json`, localises them in DE/EN/FR and
  replaces the fixed German technical fallback by a language-correct
  check last resort.
- `referenz/gebietsansicht.json` holds the ID-based namings and
  display assignments. The six Helm's Deep variants are merged in the path under
  „West-Rohan: Helms Klamm“; `268453919` already lies as a sub-map
  under this landscape. Map IDs and the game map tree remain
  unchanged.
- `tests/test_kartenbenennung.py` checks the 17 names in all three languages,
  the six display paths and the language-correct last resort.
- Data rebuilt: quests DE/EN/FR, deeds DE/EN/FR, shared
  landscape navigation as well as PHP data/filter indices in
  `~/.cache/llb-php/phpdata`.
- `tests/test_gebiete.py`, `node tests/test_questfinder.js` and
  `tests/test_kartenbenennung.py` passed.

The implementation is complete; this test plan now lies in the archive as a historical
acceptance note.

## Effects on „Region und Gebiet“

The filter tree is part of the acceptance, not only the map overview. The
quest and deed filters are checked separately because their data and
hit counts differ from each other.

- The six top regions and their total counters stay unchanged:
  renamings and merges change neither `f[0]` nor the membership
  of the entries in a region.
- Below the regions, area options can be renamed or merged.
  In particular it must be checked whether the six Helm's Deep maps and the
  map of the Glittering Caves appear in the filter under the intended names
  and how the area counters aggregate through that.
- Region totals from the actually built filters (quests / deeds):
  Eriador 5.527 / 1.037; Gondor 1.293 / 247; Haradwaith 1.549 / 312;
  Mordor 1.400 / 304; Rhovanion 2.701 / 560; Rohan 1.808 / 85.
- Affected area options in the quest filter (option total hits;
  hits from the affected maps in brackets): Rohan → West-Rohan:
  Helms Klamm 43 (35); Gondor → Zentrum von Gondor 156 (1), Ost-Gondor
  199 (36), Alt-Anórien 197 (72), Die Schlacht am Morannon 8 (8);
  Mordor → Draugardh 320 (21); Haradwaith → Mûr Ghala (Der Grat des
  Überflusses) 585 (20).
- In the deed filter: Gondor → Zentrum von Gondor 25 (2), Ost-Gondor 62 (21),
  Alt-Anórien 53 (24); Mordor → Draugardh 21 (5). The affected maps have
  no Rohan deeds; Rohan has 85 hits and nine area options.
- The filter tree was checked visually expanded in quest finder and deed index:
  region overview and affected area options are visible; the
  region values match the generated filter data.
- Acceptance criterion: region totals are unchanged per catalogue; area names
  match the new assignment; area counters yield the same
  hit set per filter as before the renaming, only under the new/merged
  options. A shift between regions would be its own intervention, not
  decided here.
- The visual check shows both the collapsed region overview and
  the expanded affected area options with their generated counters.

## Limits

- **Region stays for now as the quest label sets it.** The Morannon map
  therefore stays under Gondor, although its content belongs to the wasteland. A
  region change from map/area data is its own intervention.
- **Haradwaith stays open.** Six territories lie under „Mûr Ghala“; that
  is a second package, not part of this naming.
- **No adoption of the geoAreas region level.** There Rohan, Gondor and
  Mordor hang under Rhovanion, two regions stay empty.
- **Do not change generated check reports by hand.** `lotro-datenraum-relationen.md`, `-xml-properties.md` and `-semantik*.md` arise from their scripts.
