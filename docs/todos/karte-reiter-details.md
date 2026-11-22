# Map tabs: counters on first paint, details without the full catalogue

**Status:** implemented, checked locally (20.11.2026)
**Scope:** map view (quests and deeds), start data, shards

## Observation

In the map view, tabs of sub-areas that sit one level deeper in the game than
the shared area list shows them displayed `0/0`:

```text
Eriador › Dunland-Überblick
├─ Das Eisenloch      0/0   (12 Aufgaben, Pfad über Pforte von Rohan)
├─ Galtrev            0/0   (30, Pfad über Dunland)
├─ Isengart           0/0   (14, Pfad über Nan Curunír)
└─ Tâl Methedras      0/0   (13, Pfad über Dunland)
```

After a click on one of the tabs the numbers jumped to the right value; the
list stayed empty, however, because the clicked placeholder node had no
entries. A direct link such as `#map-268446977/268446985` additionally showed
the list of Breeland (37 rows) under the heading „Isengart“.

The first click on a quest also loaded the complete catalogue
(`daten-de.js`, 22,7 MB or 4,5 MB packed), only to obtain description, steps
and the complete objectives.

## Causes

1. The counter index of the start file was built only along the full game path
   (`Eriador|Dunland-Überblick|Nan Curunír|Isengart`). The flat
   tab is called `Eriador|Dunland-Überblick|Isengart` and found nothing.
2. `landschaftReiter()` ran once before the shard loading; afterwards only
   list and detail were redrawn.
3. `gleicheGebieteAn()` looked for existing nodes only on the same level. For
   deeper areas an empty duplicate node arose next to the
   landscape.
4. When starting with a hash, the default area (Breeland) was additionally
   opened; its late-arriving shards overwrote the linked
   list.
5. The short form of the map deliberately contains no description, steps and
   only one objective. The detail area fetched the whole catalogue for that.
6. The start file did not know the existing shards. Overview maps such as
   `268446977` have no shard of their own but cost a 404 on every opening. Up
   to twelve sub-shard files were loaded one after another.

## Implementation

- [x] Index the count metadata additionally by map ID (`fk` in the
      summary, `zusammenfassungNachKarte` in `app.js`). Tabs now count
      correctly before every reload.
- [x] `zaehlEintraege()`: path first, then map ID, then loaded entries.
- [x] `gleicheGebieteAn()` also looks for existing map nodes deeper and
      prefers the verified node; no more empty duplicate nodes.
- [x] The promotion copy of the overview map no longer removes children
      (`__kartenansicht-eigene` is gone); tabs and list of the overview
      stay complete.
- [x] `landschaftOeffnen()` waits for the shards of the landscape and then
      draws tabs, list and detail from one state. A request counter
      prevents a late load from overwriting a newer selection.
- [x] Starting with a hash opens only the linked area.
- [x] `tools/build_karten_kurz.py` writes a detail shard per map or region
      (`detail-map-<id>.js`, `detail-region-<n>.js`) with
      description, steps, complete objectives and `u`/`gi`/`nq`/`pq`/
      `tl`/`lp`. The catalogue (`daten-<sprache>.js`) remains only a fallback.
- [x] `MQL_SHARD_MAPS` names the existing map shards; missing ones are
      no longer requested (no 404 for overview maps).
- [x] Shards are loaded with four concurrent requests instead of one after another.
- [x] `tests/test_kartenstart.py` checks detail shards, field scope,
      start metadata and the load path.

## Acceptance

- Tabs in DE/EN/FR show the numbers before opening: Isengart 14,
  Das Eisenloch 12, Galtrev 30, Tâl Methedras 13 (quests); Isengart 2
  (deeds, the other three have no deeds).
- A click on a tab shows the same number in list and detail.
- A direct link to a sub-area shows its list, not that of the
  default area.
- The first quest selection loads only `detail-map-*.js` (Isengart 16 KB, largest
  shard Auenland 797 KB), never `daten-de.js`.

## Weitere Inhalte: tiles were missing (20.11.2026)

The block **Weitere Inhalte** stood as an empty heading at the bottom of the
area overview: no tile for Epische Geschichte, Klassenaufgaben,
Herkunftsaufgaben, Feste, Missionen, Instanzen, Handwerk, Aufgabenbrett and
Weitere Aufgaben.

Two causes:

1. The tiles arose from the loaded catalogue entries
   (`quests.some(q => q.th === …)`). On the map first start `quests` is empty,
   so the block stayed empty. The decision now comes from the compact
   start metadata (`th`, `a` in the summary), which are present before every
   shard.
2. The topic identifier `th` was missing in the built data. `build_daten.py` read
   the quests from the iCloud copy of the plugin catalogue (status 09.11.), which
   contains no `theme:` paths; only deeds came from the local checkout.
   The quest build now uses `../MagicQuestLog/plugin/…/Quests_*.lua` first
   and falls back to iCloud only when the file is missing.
   `SEKTIONEN` translates the path names `@themeEpic`, `@themeClass`,
   `@themeOrigin`, `@themeOther` (previously „themeEpic“ stood there as the title).

Epische Geschichte still opens the map view, not the finder.
Its chapters lie in `thema-epic-<sprache>.js` (58 KiB); the map view
loads the file only on the call `?gebiet=Epische Geschichte` and rebuilds the
tree afterwards. An empty block is no longer output (this also applies to deeds
that have no topic tiles).

The quest build now reads the local plugin export (15.11.) instead of the
iCloud copy (09.11.). New maps and quests are added through that; the
counters shift (Dunland-Überblick 401 → 494, new sub-areas
„Ring von Isengart“, „Die Tiefen von Isengart“). That is the more recent export,
not a counting error – agree with Adrian before a publication.

## Still to check

- [ ] Browser check desktop and mobile with and without character progress in DE/EN/FR
      after the next build.
- [ ] Request approval and publication (upload) separately.
- [ ] After the release, confirm in the network panel that on the first click
      no `daten-<sprache>.js` is loaded any more.
