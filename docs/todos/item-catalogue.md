# Item catalogue: damage type filter, barter goods and the recognition base

## Decision (22.11.2026)

Three layers, each with its own scope. The rule: an item belongs in the finder
when a player can **get it on purpose**; everything else is *identification*.

| Layer | Contents | Where it lives |
| --- | --- | --- |
| Finder | every item with an evidenced source: quests, deeds, recipes, vendors, instance chests, **barter** | `daten/items.json` → `web/gegenstaende-<sprache>.js` |
| Pages | the same set, one page per id | `phpdata/<sprache>/page-i/` |
| Recognition | **all** items the client knows, including worn gear without any source | `daten/gegenstand-erkennung.json` + `web/erkennung/<sprache>/` |

Deliberately **not** imported: 33.611 items that only appear in generic loot
tables, 23.172 quest/object props (a beehive, a slaughtered sheep) and the
remaining items without evidence. They are identifiable, not findable, and get
no page.

Categories (seven), the tree shape, suitability and the split between minimum
and item level stay untouched.

## Damage type

Own filter group beside the tree, not a third tree level — a level would
multiply every weapon type by every damage type. Only weapons carry it; the
value comes from the client's `damageType`. Keys are game values (`FIRE`), so
`?schaden=FIRE` means the same in every language.

## Barter as a source

`build_items.py` reads `barters.xml` (`<receive>` inside a profile, profiles
attached to barterers) and writes `item['tausch']` with the barterer, the
occupation and the profile name. The barterer id stays **decimal**, as in the
source file, because `build_haendler.py` expects digits and the page model
converts to eight-digit hex on its own. Many barterers share one profile (all
hunter trainers carry the same list); such rows are collapsed per occupation and
profile and keep a `weitere` count.

Items that reach us only this way get their name, category, slot, quality,
level, description and icon from the full client export. Names are normalised
once: `q` is always the client's quality **name** (`RARE`, `INCOMPARABLE` …),
never a number — `gegenstand-details.json` had stored the enum ordinal, which
made a rare item look legendary.

## State on 22.11.2026

| | |
| --- | --- |
| Catalogue (`items.json`) | 76.983 |
| Finder rows per language | 77.061 |
| Items with barter evidence | 35.231 (in the finder) |
| Recognition base | 152.087 (all named client items) |
| Item pages per language | 77.061 / 77.057 / 77.057 |
| Sitemap URLs | 361.105 |
| Icons | 10.352 needed, 3.898 new, 0 missing |

Payload per language: 8,6 MB raw, **1,1 MB gzip** (before: 5,4 MB / 0,8 MB).
The live site serves gzip.

### Remaining gap (regenerated 22.11.2026)

75.082 client items are still not in the finder; 7.615 of them name an evidence:

- **7.341 with a vendor source** — the vendor export is merged into the
  catalogue only partially; the vendor page work decides how these arrive.
- **347 with a barter source** — the export carries no localised name for them
  (mounts such as „Helles rotbraunes Ross“, damaged armour); only the English
  client name exists. They stay out rather than appear in English on a German
  page. Their barter evidence is recorded in the report.

The rest is the group deliberately left out: generic loot tables, quest props,
items without any evidence.

## Measurements

| Profile | List ready | Typing |
| --- | --- | --- |
| Desktop | 496–646 ms | 13–14 ms |
| 4× slower CPU | 1,4 s | 32 ms |
| 6× slower CPU | 2,1 s | 52 ms |

The earlier 48 s figure came from transferring the raw 8,6 MB without
compression over a throttled test line; with gzip that is about 1,1 MB. No
further sharding is needed for the finder at this size.

## Verification

- `python3 -m unittest discover -s tests -p 'test_*.py'` — 488 tests green.
- `node tests/browser_schadensart.js` — DE/EN/FR.
- `node tests/browser_item_filter_preview.js` — real index, layout, category
  counts and mobile selection in all three languages.
- `node tests/browser_ratgeber.js` — import, gear, bags, candidates.
- Spot checks: a trophy page reads its description and „Tauschhändler“;
  `70055277` now shows its real quality; every finder id is in the recognition
  base and in the client catalogue.

## Filter order and the „Sonstiges“ buckets (22.11.2026)

Order of the filter column: **category, suitability, item level, minimum level,
source, damage type, rarity**. Suitability comes second because with an import it
answers the first question („does it fit me?“); rarity is last because it follows
the level and adds the least.

„Sonstiges“ (27.600 items, 209 client classes) gets a middle level of eleven
buckets, matched on the **English** `ItemClass` name and documented in `BUENDEL`:

| Bucket | Items |
| --- | --- |
| Legendäre Schrift (traceries, words) | 13.584 |
| Handwerk (craft, ingredient, tool, recipe) | 2.894 |
| Haus und Einrichtung | 2.589 |
| Verbrauch und Aufwertung (food, potion, scroll, oil) | 2.275 |
| Kleidung und Kosmetik | 1.705 |
| Klassenwerkzeug | 1.581 |
| Ohne Zuordnung | 1.190 |
| Aufgabe und Zugang | 1.072 |
| Tauschwährung | 465 |
| Reittiere | 228 |
| Trophäen und Sammeln | 17 |

The exact class stays visible as the level below, so nothing is lost. An
unmatched class lands in „Ohne Zuordnung“ instead of being dropped; the guard
requires less than 10 % there. Keys are game-stable, the labels follow the
language.

## Advisor: comparison on the recognition base

`web/ratgeber.js` looks worn items up in the recognition shards and compares
against the finder catalogue:

- **Reference level** comes from the export when it carries one, otherwise from
  the client reference (`Gegenstandsstufe 402 (Referenzwert des Spiels)`).
- **Scaled items** are compared with the client's curve
  (`web/skalierung.js`, 49 curves from `progressions.xml`), not with the
  catalogue's upper bound: „Makellose Überhose“ is 474 there, 408 at level 123.
  Curves without a progression id (`Item_Level#120-`) keep their stated level.
- **Same kind only**: armour keeps its armour type, weapons stay weapons, and
  jewellery is recognised although the client files it under “other”.
- **A dagger is `EITHER_HAND`**: the off hand offers items too, as the client
  says.
- **Legendary items** get `Nächstes Umschmieden` from `web/umschmieden.js`
  (progression 1879422471, cap 570) instead of an unrelated list.
- Identical rows collapse; a candidate must beat the reference level. Without a
  reference level the list says so instead of inventing an upgrade.

## Open

- [x] The advisor looks worn items up in the recognition base and compares
      against the finder (see above).
- [ ] Decide whether barter goods beyond armour and weapons need a page of their
      own; today they all have one, with name, quality, description and source.
- [x] Vendor page and barter prices: `tools/tausch.py` writes
      `daten/tausch.json`, the vendor page shows offers as price → goods, and
      the item page names the price and the translated barter list
      („kostet 500 Zeichen · Geringe Klassen-Gegenstände“).
