# Cards without an assigned map

Audit of the landscape-first website build, 4 November 2026. This is catalogue
data, not a character's progress. Nothing was copied from LOTRO Completionist.

## Findings

- Every map image referenced by the published quest/deed catalogues is present
  in German, English and French (232 WebP files per language; build check passes).
- German has 11 geographical overview cards without an assigned map; English
  has 12 and French 17. Non-geographical content cards are intentionally excluded.
- All quests in the 11 German groups below lack both quest-giver coordinates and
  target positions. Downloading an image cannot provide that missing association.
- Udûn, North Ithilien and South Ithilien already have local PNG and WebP images.
  Completionist also serves an Udûn image, but it is not needed to fill an asset gap.

## German quest groups requiring review

| Group | Catalogue quests | Quests with positions |
| --- | ---: | ---: |
| Festplatz | 24 | 0 |
| Die Zwergenfestungen | 34 | 0 |
| Festungen des Nordens | 8 | 0 |
| Ackerland | 27 | 0 |
| Entwasser | 32 | 0 |
| Fangorn | 2 | 0 |
| Rohan - West-Emnet | 1 | 0 |
| Anórien | 2 | 0 |
| Anórien (schlachtgezeichnet) | 17 | 0 |
| Ithilien | 12 | 0 |
| Umbar-môkh | 5 | 0 |

English additionally has an unassigned Ikorbân Valley card. French additionally
has unassigned Les Hauts du Nord, Les Landes d'Etten, Les Monts Brumeux,
Les Terres Solitaires, Westfold and Monts de l'Hatokali cards. These may include
language/category-name mismatches; differing card counts are not proof of missing
game regions or missing assets.

## Follow-up approach

1. Compare each group's original journal category and map identifiers across all
   three languages, matching quests by ID rather than translated names.
2. Check the game's map hierarchy and documented region coverage. Similar names
   are candidates, not evidence: Ithilien can refer to north or south; Anórien has
   multiple versions and regional maps.
3. Where data cannot decide, verify the quest in-game or against a specific
   LOTRO-Wiki quest page. Preserve unresolved groups visibly with “No map assigned”.
4. Only export an image from the installed client when a confirmed map references
   an image that is actually absent. The current build has no such missing files.
