# Map tab shows quest counters but no quests

**Status:** implemented, accepted locally and live (16.11.2026)
**Created:** 15 November 2026
**Scope:** map view, quest filter, area tree

> **Addendum 20.11.2026:** the map first start of 18.11. brought the error back
> by another route: flat tabs of deeper areas
> found no count metadata and showed `0/0` again. Causes, implementation and
> check points are in [`docs/todos/karte-reiter-details.md`](../todos/karte-reiter-details.md).

## Observation

In the map view the tab shows:

```text
Das Eisenloch 13
```

After opening, however, the right side says:

```text
Das Eisenloch
gesamt 0
erledigt 0
offen 0
```

The map itself is shown, but the associated quests do not appear
in the list.

## Cause

The quest and area structure contains several nodes
for map ID `268447589`:

```text
Eriador
└─ Dunland-Überblick
   ├─ Das Eisenloch          ← ergänzter direkter Knoten, 0 Aufgaben
   └─ Pforte von Rohan
      └─ Das Eisenloch       ← echter Knoten, 13 Aufgaben
```

The counter of the map tab is computed from the verified, deeper node.
On a click on the tab, however, `web/app.js` looks for the first node with this
map ID and lands on the empty direct node.

Affected logic:

- `web/app.js:348–360`: extension of the shared area structure
- `web/app.js:3225–3233`: selection of a map tab
- `web/app.js:679–685`: lookup of a node via the map ID
- `web/gebiete-de.js`: shared area index

## Implementation

- [x] Fix the selection with a duplicate map ID.
- [x] Prefer the verified or deeper node with real quests.
- [x] Ensure that map tab counter and quest list use the same
      node.
- [x] Check `Das Eisenloch` with 13 quests. The old data state `9/12` is
      outdated.
- [x] Resolve duplicate map IDs in the tab and in the selection by verified
      quests and path depth.
- [x] Check direct map link, map change and quest list live.
- [x] Check DE, EN and FR: a tab click shows 13 quests each time.
- [x] Checked desktop and mobile presentation of the map view.
- [ ] Do not accidentally remove artificial area nodes or verified paths of other maps.

## Acceptance

- The click on „Das Eisenloch“ shows the 13 associated quests.
- The right area no longer shows `gesamt 0`.
- The counter stays consistent with list and progress.
- Map markers and quest selection belong to the same quest set.
- Other map tabs and direct map/area links remain functional.
- The correction is testable without publishing the unfinished
  quest navigation.

## Relevant check

```bash
git diff --check
python3 -m unittest discover -s tests -p 'test_*.py'
```

The tab click was checked locally and live with the real map state in DE/EN/FR.
The direct live link is:

`https://llb.sirhexalot.de/de/karte/#map-268446977/268447589`
