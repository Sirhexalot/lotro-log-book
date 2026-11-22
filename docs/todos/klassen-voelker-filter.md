# Class and race profiles with matching catalogue lists

Status as of 20.11.2026
Status: implemented and checked in the local preview (DE/EN/FR)

## Implemented

- Entry `Charakter → Klassen & Völker`, with language paths `/de/klassen/`,
  `/en/classes/` and `/fr/classes/`.
- Selection of the races offered per class from `classes.xml` and `races.xml`;
  localised names from the client labels. A separate combination matrix
  is not shown.
- Selection of class, race and level. „Mein Charakter“ takes over the active
  import exclusively locally in the browser.
- Weapon and armour proficiencies with unlock level from `classes.xml` and
  translated type names from the client enums.
- `tools/build_class_data.py` creates the three language files during the release build.

## Implementation

- Quests and deeds: complete list by the selected class, race and
  level; `requiredClass` and `requiredRace` are applied together.
- Items: one shared list from matching `requiredClass`-bound
  consumables/class tools and equipment. Class, race, level,
  explicit item restrictions as well as weapon/armour proficiency including
  unlock level narrow the base list.
- Entries with an additional equipment condition such as attribute, reputation,
  faction rank or effect do not appear in the equipment list.
- Quests, deeds and the shared item list use the
  standard filter component with search, matching facets, sorting and
  pagination. Per list, the profile context is retained when filtering and resetting.
- The result list follows the filter bar directly at a constant distance;
  an outdated load error disappears as soon as filtering
  works again. Result rows without an icon use the full text width.
- Data stays in the browser; „Mein Charakter“ reads only the local import.

## Acceptance

- Hobbit hunter: no heavy armour; crossbow proficiency only from level 7.
- Hobbit warden: heavy armour from the verified unlock level.
- Hunter bear traps and hunter/warden oils appear together in the
  item list; shared class requirements remain recognisable on the entries.
- A class-bound racial stat appears only for a permitted combination;
  general quests and deeds remain findable.
- Imported class, race, level and progress do not leave the browser.
