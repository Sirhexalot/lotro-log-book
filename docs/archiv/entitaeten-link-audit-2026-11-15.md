# Entity link audit

**Status as of:** 15 November 2026  
**Checked stock:** existing `phpdata` shards, viewmodel, router,
catalogue templates and the currently built DE/EN/FR pages.

## Follow-up check 16.11.2026

After the link corrections the complete PHP data stock was rebuilt
and checked with `tools/audit_php_links.py`:

- **1.449.979 internal URLs**
- **0 unresolvable targets**
- The previously 4.572 wrong landmark parent links (51 map IDs in three
  languages) now use the actual map type.
- For set members, **10.654 of 11.152** links to existing item pages are verified
  per language. The remaining 498 IDs have no item page
  in the catalogue and remain without a link.
- The link audit is reproducible: `python3 tools/audit_php_links.py <phpdata>`.
- The corrected relations were checked live at
  `https://llb.sirhexalot.de/de/aufgabe/700000A4/`,
  `https://llb.sirhexalot.de/de/landmarke/70003BCA/` and
  `https://llb.sirhexalot.de/de/set/7000D487/`.

## Result

The automatic stock test found **1.310.641 URL fields** in page and
list models:

| Result | Count | Assessment |
|---|---:|---|
| target is a built entity page | 1.173.049 | technically valid |
| target is an application/catalogue search | 133.020 | mostly intended fallbacks, check individually on the domain level |
| unresolvable entity URL | 4.572 | real error |
| external URL | 0 | none |

The 4.572 broken URLs are **153 unique URLs**, that is 51 map IDs
each in DE, EN and FR. All come from `page-l` landmark pages and
have the form:

```text
/de/region/<Gebiets-oder-Karten-ID>/
/en/region/<Gebiets-oder-Karten-ID>/
/fr/region/<Gebiets-oder-Karten-ID>/
```

There are only six built top-level region pages. Many of the 51 IDs are,
however, area maps or sub-maps and therefore must not be linked as `region`.

Examples:

```text
268437653  Breeland
268442355
268442330
268446977  Dunland-Überblick
268451108
268453364
268453641
268454914
268455271
```

These 51 map IDs are fully affected; the deviation is not
language-dependent:

```text
268437576, 268437592, 268437615, 268437653, 268437678, 268437713,
268439511, 268442268, 268442330, 268442355, 268446977, 268447030,
268447045, 268447051, 268447390, 268448407, 268448422, 268449335,
268449746, 268450720, 268450778, 268450882, 268450890, 268450932,
268450944, 268451108, 268451115, 268451272, 268451796, 268452083,
268452166, 268452250, 268452253, 268452631, 268452663, 268453364,
268453454, 268453641, 268453653, 268453997, 268454129, 268454241,
268454323, 268454363, 268454497, 268454617, 268454914, 268454915,
268454945, 268455271, 268455280
```

## Concrete gaps

### 1. Landmark → region: wrong entity type

In `tools/php_viewmodel.py:603–606` the parent map of every landmark is
linked blanket as `region`:

```python
ort['region'] = {'url': route(lang, 'region', str(eltern.get('idx'))), ...}
```

The parent map must be linked as region or area based on the actual map tree.
For area maps no region link may arise.
That is the only currently proven group of broken URLs.

### 2. Set → item: existing IDs without link

The set pages contain **498 members per language**, 1.494 entries in total,
with an existing item ID and a built item detail page,
but `url: null`.

Affected logic: `tools/php_viewmodel.py:1053–1063`. The members are
explicitly taken over as unlinked there, although `iid in builder.items`
is already checked.

Example structure:

```json
{"id":"7005CC84","name":"Aufsteigendes Licht","url":null}
```

These links can point directly via the ID to
`/<sprache>/<item-segment>/<id>/` without name resolution.

### 3. Faction → quest/deed: unpublished sources

The faction data contain 10.059 sources per language. 59 per
language remain without a link because the IDs belong to hidden DNT quests and
possess no quest page. In total these are 177 `url: null` entries.

Examples:

```text
7002451E  DNT HIDING CONTENT - Task: Broken Wooden Maces
70024523  DNT HIDING CONTENT - Task: Blackened Sword Sheaths
70024525  DNT HIDING CONTENT - Task: Blackened Feathers
```

This is currently not a broken link but a domain limit of the
published catalogue. In the implementation TODO, however, it must be fixed
whether such sources stay as text, drop out of the faction pages or
point to an application search.

### 4. Quests → area/map: not every path part is linked

39.694 `area_trail` entries have no URL value. This affects above all
further path parts after the first two map levels as well as maps that cannot
be resolved as a published map in the viewmodel. The visible
map/area label remains text.

This is not automatically a gap: map variants without a named or
published entity page should not be linked as technical „Karte 268…“.
The remaining cases, however, need a targeted
parity check against the game map tree.

### 5. Quest/deed → reward: check IDs and reward kinds separately

52.858 `items` entries without a URL lie predominantly in quest rewards.
Contained in them are:

- items without a stable item ID in the imported reward set,
- titles, virtues, traits and emotes that are output only as
  icon/text in the current viewmodel,
- selectable or variable rewards without unambiguous target assignment.

Title and virtue pages exist in principle. The audit must therefore check the
raw data for a stable title/virtue ID on these rewards. Only then is a missing link a real gap; a pure
name resolution would not be reliable because of variants and translations.

## Link matrix of the current state

| Source | Target | current state |
|---|---|---|
| quest | quest | canonical links for prerequisites, chains and exclusions |
| quest | quest giver | detail page, otherwise search fallback when ID is missing |
| quest | area/region | map path partly canonical, further parts partly text |
| quest | item | ID link, otherwise name without link |
| quest | map/travel | application path, deliberate on the domain level |
| deed | item | ID link, text when ID is missing |
| deed | area/map | map/application path, neighbouring deeds canonical |
| deed | title/virtue | currently predominantly text |
| item | quest/deed | canonical source links, missing sources as application |
| item | recipe | canonical recipe links |
| item | find area | map application with resource occurrence parameters |
| item | set | set link present; set members back to the item missing |
| recipe | item | canonical item link, name-based fallback |
| recipe | profession | crafting/profession address, deliberately no independent detail page |
| area | quest/deed/item | canonical list links |
| area | parent area/region | canonical, must be unified with the landmark logic |
| landmark | quest/deed | canonical links |
| landmark | area | canonical area link |
| landmark | region | currently wrong type for 51 map IDs (153 URLs) |
| faction | quest/deed | canonical, except 59 DNT IDs without target page |
| title/virtue | quest/deed | canonical, missing targets fall back to the application |
| set | item | 498 existing item IDs so far without link |
| instance | — | application list without its own detail pages; no missing detail route |

## Router and language check

- The checked canonical entity URLs match the language segments in
  `php/src/Catalogue.php`.
- The built DE/EN/FR target pages exist in parallel across languages for the valid entity links.
- No old `.html` links were found in the checked page models.
- The 133.020 application paths are no 404 targets. Frequent intended
  targets are item search with filters, crafting/recipe filter, map,
  deeds, travel and reputation.
- `php/src/Catalogue.php::appLink()` still contains legacy URL generation,
  but is not used as a canonical detail route for the current viewmodel entity links.
  That must be secured separately against
  `Router::legacyTarget()` on later changes.

## Check limits

The URL stock test can only check URLs that are present in the built JSON model.
It does not detect on its own:

- relations whose ID is already lost in the raw model,
- wrong but technically existing entity types,
- links that are added only by JavaScript,
- missing links in pure running text without a URL field,
- visible differences between the static old build and the PHP page without
  an additional browser comparison.

These points are recorded as their own work steps in the implementation TODO.
