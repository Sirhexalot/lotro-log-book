# Class profile: level, lists and explanation

Status as of 22.11.2026. Page: `/de/klassen/`, EN `/en/classes/`,
FR `/fr/classes/` (`php/templates/app/klassen.twig`, `web/klassen.js`).

## Selection

Class, race and level describe one character. With an imported character the
page takes the combination from the local store; „Mein Charakter“ fills it
again after a manual change. Without an import the visitor chooses by hand.

The level is the **only level control on this page**. Its filter panels carry no
level range; the global item search and the quest finder keep theirs because no
character level exists there.

## What the lists show

| Tab | Gate | At level 123 (Hunter/Hobbit, 22.11.2026) |
| --- | --- | ---: |
| Items | minimum level <= level, class/race, armour/weapon knowledge, no further condition | 14.470 |
| Quests | displayed quest level (fallback: prerequisite level) <= level | 11.512 |
| Deeds | displayed deed level <= level | 3.685 |

The class catalogue reads the displayed level `l` from the catalogue, not
`minLevel`/`level` from the client XML. Otherwise level-130 deeds and quests
remained in a level-123 list. The filter matches the level column the visitor
sees.

The item level is strength, not a wear requirement. It stays visible in the
result column and in the sort, but it is not a gate. A level-130 ring does not
appear at level 123 even when its item level is 456.

Default sorting on this page:

- quests/deeds: `levelDesc` (highest level first, name as tie-breaker);
- items: `itemLevelDesc` (item level descending, then minimum level, then name).

Sort values are page-scoped in `kf-…sort`. A level change clears all `kf-`
parameters, rebuilds the lists and updates the tab badges.

## Explanation on the page

Three layers, no help box:

1. **Lead** under the heading: what the page is, what stands above, what stands
   below.
2. **Status** under the selection: which level applies and that the lists follow
   it; without an import it names the level and links the import page.
3. **Short hints where the rule surprises**: item level vs minimum level, faded
   entries in the profile, empty lists and result counts with the level.

The wording rules: DE du/dein, EN you, FR vous/votre. No „Profil“, „vom Spiel
belegt“, „Spieldaten“, „Kombination ist spielbar“, „verfügbar“. Use „lernen“ for
armour and weapons, „tragen“ for items, „bis Stufe“ for quests and deeds. The
exact DE/EN/FR texts live in the `text` object of `web/klassen.js`.

## Data and build

`build_gegenstandssuche.py` fills the minimum level from `items.xml`, otherwise
from the complete client export (`ml`). 52.716 of 52.880 search rows carry one;
164 remain without (fields, plants, three special cases). Rebuild the three
language files and `build_php_data.py --sprache alle`, because the related item
lists use the same rows.

## Tests

- `tests/test_gegenstandssuche.py`: minimum-level fallback and known examples.
- `tests/test_class_data.py`: item gate uses the minimum level, not the item
  level; no level ranges on this page; descending defaults.
- `tests/browser_klassen_stufe.js`: DE/EN/FR, counters, no level range, a usable
  item above the character level, level change, reset, mobile.
- `tests/browser_filter_php.js`: the minimum-level range on the item search.
