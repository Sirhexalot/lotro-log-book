# Item suitability for the imported character

Status as of 22.11.2026. Logic: `web/eignung.js`. Class table:
`web/klassen-proficiency.js` (generated). Data: `tools/gegenstand_anforderungen.py`
from the client catalogue, merged into `daten/items.json` by `build_items.py`.

## One signal next to another

The item name keeps the **rarity colour** (ordinary, uncommon, rare,
incomparable, legendary) exactly as in the game. Suitability is a **separate
chip with a word**: „Passt", „Passt, aber prüfen", „Älter", „Überholt", „Zu
hoch", „Nicht für dich", „Unklar". The chip sits on its own line under the name
and meta line — left, where the item is described — while the value column
keeps its numbers. In the reward browser it joins the meta line. Every chip carries the reason as a tooltip.

The numbers themselves stay neutral. Reference is always the **minimum level**,
never the item level: a level-123 character wears minimum level 120 at item
level 388, so a green „388" would be a lie. There is no colour legend above the
lists (22.11.2026): the word is the legend.

## States

| Chip | Condition | Colour |
| --- | --- | --- |
| Passt | minimum level at most 10 below the character, class/race, armour/weapon known | green |
| Passt, aber prüfen | fits, but a further requirement exists or the import names no class | green |
| Älter | 11–14 levels below | yellow |
| Überholt | 15 levels and more below | grey |
| Zu hoch | minimum level above the character, not scalable | red |
| Nicht für dich | other class, other race, or armour/weapon type the class does not use | red |
| Unklar | above the level cap of 160, scalable above the character, or a class known but no level | grey, dashed |

Red wins over grey: a heavy-armour piece for a hunter stays red even at 40
levels distance, because grey means "wearable but outdated".

An item with no known requirement at all (loot containers, virtue tokens,
fields) carries **no chip**: there is no statement to make. That is why the
instance loot list is mostly chip-free — it lists containers, not gear.

„Passt, aber prüfen" appears **only instead of green**. At yellow or grey the
chip carries the reason as tooltip. Without an imported character there is no
chip at all.

Armour and weapon proficiency come with the level the class learns it (a hunter
uses the crossbow from level 7), so a level-5 hunter sees „Nicht für dich" on a
crossbow.

## Filter

The item search and the class profile add a filter group **Eignung** with one
option per state and the matching count. It only appears when a character (or,
on the class profile, the chosen profile) is known. The choice travels as
`eig` in the address (`eig=passt,ueberholt`); page-scoped on the class profile
as every other filter there.

## Where it appears

Item search, class profile, item page (the „requires level" chip), recipe
results, quest and deed rewards, the reward browser, set pieces, vendor lists
and instance loot. Under the name in every list row; in the reward browser it
joins the meta line.

On the class profile the chip follows the **selection above the list**, not the
import: a hand-set level judges by that level. Every other list uses the
imported character.

## Data

`tools/gegenstand_anforderungen.py` reads `items.xml` once and returns
`ml` (minimum level), `rk` (class, `;`-separated), `rr` (race), `at` (armour
type), `wt` (weapon type), `ex` (further requirement) and `sc` (scalable).
`build_items.py` merges it into `daten/items.json` and fills the ~7,500 missing
minimum levels from the complete export (`ml`), the same fallback the item index
uses.

Generator joins: `build_gegenstandssuche.py` (index rows, plus `scalable`),
`build_belohnungen.py` (reward browser), `build_rezepte.py` (recipe results).
PHP surfaces get the values as `data-eignung-*` attributes
(`php/templates/components/eignung.twig`) and are painted on load.

## Tests

- `tests/test_eignung.js`: thresholds 0/10/11/14/15, class, race, armour and
  weapon proficiency, scalable, level cap, no character, warning only on green,
  catalogue rows.
- `tests/browser_klassen_stufe.js`: the class profile counts and its level gate.
