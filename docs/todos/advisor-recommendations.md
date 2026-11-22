# Character advisor recommendations

## Current slice

- [x] Validate the advisor with a fresh local Companion import.
- [x] Add on-demand equipment candidates for a selected gear slot. Candidates use the imported class, race and level, the client's slot mapping and the existing item-requirement rules.
- [x] Compare item level only as an initial signal; label the limitation and do not claim that a candidate is a definite upgrade.
- [x] Keep the full item catalogue lazy-loaded until the player asks for candidates.
- [ ] Verify the candidate list on the real local character in German, English and French.

## Remaining work

- [ ] Evaluate equipped gear beyond item level only when comparable, evidenced stats and item properties are available; otherwise retain the qualified candidate wording.
- [ ] Replace the placeholder “Continue playing” panel with progress-based suggestions from the imported quest/deed state and the existing epic, deed and quest-finder catalogues.
- [ ] Keep missing journal entries neutral; do not infer that a quest is available or unfinished from absence alone.
- [ ] Test each recommendation surface with synthetic imports, in all three languages and on mobile.

All character data and recommendation calculations remain in the browser. Never include a real character export in generated or published data.
