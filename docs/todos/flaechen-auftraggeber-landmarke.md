# Surfaces on quest giver and landmark pages

**Open.** Quest giver and landmark detail pages still show their sections
loose on the page background. Every other entity page frames them with the
surface building block (`llb-flaeche`, `web/flaeche.css`).

## State

Measured on 22.11.2026 against the local PHP preview, dark and light design,
on `/de/auftraggeber/7000838B/` and `/de/landmarke/7000EE27/`:

| Page | Section classes | Background | Border | Padding |
|---|---|---|---|---|
| Quest giver (`givers/detail.twig`) | `katalog-abschnitt` | `rgba(0,0,0,0)` | `0px` | `0px` |
| Landmark (`entity/landmarke.twig`) | `katalog-abschnitt` | `rgba(0,0,0,0)` | `0px` | `0px` |
| Quest, deed, item, instance, vendor | `katalog-abschnitt … llb-flaeche` | `--llb-flaechen-ton` | `1px` | `20px` |

So the two pages read as plain text blocks while the surrounding entity pages
carry a frame. Both pages come from before the surface rule of 21.11.2026.

## Extent

- Quest givers: 5.067 entries, 11.567 quests (`daten/auftraggeber.json`).
- Landmarks: 2.809 named places (`daten/landmarken.json`).

## Work

1. `php/templates/givers/detail.twig`: give every `section.katalog-abschnitt`
   the class `llb-flaeche`, including `giver-quests` and `giver-gleichnamig`.
2. `php/templates/entity/landmarke.twig`: same for the place section.
3. Check page CSS (`web/auftraggeber.css`, `web/katalog.css`) for rules that
   assume an unframed section – drop them instead of copying the frame.
4. Keep mobile width, both designs and the reading width of long texts as they
   are; the surface adds inner padding, which shortens the text column.

## Checks

- `tests/test_darstellung_iststand.py` – the surface rule and its one place.
- Browser check DE/EN/FR, desktop and phone, dark and light: one quest giver
  with description, places and quests; one landmark with quests; one entry
  without quests.
- No data change, no regeneration: this is presentation only.
