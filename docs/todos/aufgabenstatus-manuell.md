# Implementation concept: setting quest status manually

**Implementation status:** status control implemented; final full acceptance still open.

Already implemented:

- separate storage of manual quest and deed status
- effective status through a central `MQL_SPEICHER` API
- section-wise overwriting by the Companion import
- backup and restore of the `manuell` field
- plugin export with the effective status, without invented sub-objective counters
- shared status component on catalogue detail pages, quest finder,
  map list and quest detail
- status control in quest giver and source lists
- status changes trigger a recalculation of finder, list and
  progress displays
- compact select fields without additional completion checkmarks in the lists
- manual status maintenance even without a previous Companion import, via a local
  profile „Manuelle Angaben“
- quest/deed sources connected on title, virtue, area, region and
  item pages as well as reputation sources
- adventure overviews use the effective manual quest status for
  their totals and recommendations
- first unit and browser checks in `tests/test_speicher.js` and
  `tests/browser_manual_status.js`

Still open:

- full map/finder/detail acceptance in DE/EN/FR, desktop and mobile
- accept item pages fully in the browser after the current PHP rebuild
- accept backup/import messages and plugin export with all manual cases
  fully in the browser

## Goal

Quests and deeds should be settable manually in the browser to **offen**, **in Arbeit** or
**erledigt**. The entry applies until the next matching
import from LOTRO Companion. The import stays authoritative and replaces the
manual entries.

The data, as before, stays exclusively in the browser.

## Scope

Status control is offered for individual quests or deeds
in the following places:

- map view: quest list on the left
- map view: selected quest detail on the right
- quest finder
- individual quest/deed detail page
- lists of individual quests at quest givers as well as source lists, provided a
  progress status is already shown there

Pure totals, area tiles, region progress and adventure overviews
get no individual status control. Their numbers follow automatically
from the effective status.

## Status model

Import data and manual entries are stored separately.

Example:

```js
{
  quests: ["70001234"],
  laufend: {
    "70005678": [[1, 0, 0, null]]
  },
  manuell: {
    quests: {
      "70009999": "laufend",
      "7000AAAA": "erledigt"
    },
    deeds: {}
  }
}
```

Allowed manual values:

- `offen`
- `laufend`
- `fertig`

No entry in `manuell` means: use the import status.

The existing import structure `quests`, `deeds` and `laufend` stays intact.
That prevents unnecessary changes to backups, plugin export and
existing data.

## Precedence and import rules

At runtime a manual entry takes precedence over the display of the
last imported character progress.

On a new import the following applies:

1. The imported data of the read section is replaced.
2. The manual entries of this section are deleted.
3. The visible status afterwards comes again exclusively from the import.

Sections are handled separately:

- `questsStatus.xml` replaces quest status and deletes `manuell.quests`.
- `deedsStatus.xml` replaces deed status and deletes `manuell.deeds`.
- If a file is missing in the import, the existing section must not be emptied
  blindly.

That way an incomplete import cannot accidentally lose all entries of a
character.

After an import the message should name the number of discarded manual entries,
for example:

> 18 Aufgaben importiert. 3 manuelle Statusangaben wurden durch den Import
> ersetzt.

## Central storage API

`web/speicher.js` receives central functions so that map view, finder and
catalogue do not each develop their own status logic:

- `status(art, id)` – effective status: `offen`, `laufend`, `fertig` or
  neutral/unknown
- `importStatus(art, id)` – status from the import only
- `setzeStatus(art, id, status)` – store a manual entry
- `entferneManuellenStatus(art, id)` – back to the import status
- `manuelleStatus(art, id)` – checks whether a manual entry exists
- `loescheManuelleStatus(art)` – call on the matching import

Existing direct accesses to `quests`, `deeds` and `laufend` are replaced step by
step in the display areas by the central status query.
The import data itself stays separately available for prerequisites, feasibility and
objective counters.

## UI control

### Shared status component

The status is shown as a compact select field with icon and text:

- `· offen`
- `◐ in Arbeit`
- `✓ erledigt`

The select field contains three states:

- Offen
- In Arbeit
- Erledigt

A manual entry is subtly marked by the golden field border and a
reset action. A visible „Import“ label is not
shown; the reset action uses the import status again. Icon and
text always stay visible.

### Map list

The status icon on the left and the status area remain a separate click area.
A click on the quest name still opens the detail. That way the
existing row selection is not triggered unintentionally.

### Quest detail

The current status line is extended:

```text
Stufe 140 · von Cána · Angmar · Eriador · [◐ In Arbeit ▾] ⓘ
```

The info icon explains the manual status and the import rule.

### Quest finder

The status already shown on the right is implemented as a button:

```text
Sturm auf Gwathrenost                         ◐ In Arbeit ▾
```

The status filters continue to use the effective status.

### Detail pages and source lists

The existing status display is extended by the same component. Only where
an individual quest or deed is unambiguously identified is the
change offered.

## Help and explanation

No large separate help area and no new main page are needed.
Three small levels of explanation are recommended:

1. **ⓘ next to every status**
   - desktop: tooltip on hover and focus
   - mobile: explanation after tapping
2. **details section on the character progress page**
   Title: „Wie funktionieren manuelle Aufgabenstatus?“
3. **short note in the status menu**
   > Manuelle Angaben gelten bis zum nächsten passenden Import. Der Import
   > kann sie ersetzen.

The help section explains:

- Offen, In Arbeit und Erledigt
- that „In Arbeit“ does not create imported sub-objectives
- that the next Companion import is authoritative
- that the entries are stored only in the browser
- that the plugin/character export exports the current effective state

The texts are added in German, English and French.

## Backup and export

### Browser backup

`manuell` is included in the existing JSON backup. Old
backups without this field are read in as an empty manual status collection.

### Plugin/character export

The existing plugin export should use the status that is effective at export time.
A quest set manually to „Erledigt“ is therefore also taken into the plugin export
until the next import.

For „In Arbeit“ the imported sub-objective counters can be missing. The export must
therefore not create invented counters; it exports the status without
sub-objective information.

## Affected files

Presumably:

- `web/speicher.js`
- `web/companion.js`
- `web/app.js`
- `web/aufgaben-filter.js`
- `web/karten-aufgabenfilter.js`
- `web/katalog.js`
- `web/auftraggeber.js`
- `web/entitaeten-listen.js`
- `web/plugin.js` or the export functions in
  `web/companion.js`
- shared status/catalogue CSS files
- `web/texte*.js` and `web/texte-spielstand.js`
- Companion, storage and finder tests

Before implementation, the status adapters actually in use and the
current inclusion of the three language files must be checked once more.

## Tests and acceptance

Automated tests:

- old character record without `manuell`
- manual offen, laufend and erledigt
- status change and reset
- importing quests deletes only manual quest status
- importing deeds deletes only manual deed status
- import without `questsStatus.xml` or `deedsStatus.xml` does not delete the section
- backup and restore
- plugin export with effective status
- finder and map filter use the same status

Browser check in DE, EN and FR:

- map view desktop and mobile
- finder desktop and mobile
- detail page
- character switch
- import after manual changes
- backup and plugin export

## Implementation steps

1. Define the shared status and storage logic in `speicher.js`.
2. Implement the import merge with section-wise deletion of manual entries.
3. Build the status component and the info explanation.
4. Connect map list and quest detail.
5. Connect quest finder and detail/source lists.
6. Adjust backup and plugin export.
7. Add translations.
8. Run unit, import and browser checks.
9. Create the project TODO under `docs/todos/` with the concrete acceptance points
   or update it after implementation.
