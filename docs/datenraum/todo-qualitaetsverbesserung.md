# TODO: Improve data quality based on the LOTRO data space audit

**Project:** LOTRO Log Book, website only  
**Status as of:** 17 November 2026  
**Status:** prioritised working basis; no code change commissioned yet  
**Audit basis:** [`lotro-datenraum.md`](lotro-datenraum.md) and the evidence
linked there

## Goal

The website should present proven game information correctly and traceably,
without losing differences through data compression or reporting unknown
values as certain game statements.

The audit is an ongoing, source-bound partial state. It is not an approval to
regenerate all data or to interpret every unexplained property in domain terms.

## Priorities and acceptance criteria

### 1. Preserve information losses for items and recipes

- [ ] Provide separate values for binding, `BIND_ON_ACQUIRE` and
  `BOUND_TO_ACCOUNT_ON_ACQUIRE`. Existing pages and compact fields may keep
  running until the switch.
- [ ] Represent recipe variants completely with their respective ingredient and
  result assignment.
- [ ] Result comparison and output take item ID, quantity and result level into
  account.
- [ ] Regression tests prove that no variants disappear through grouping or
  deduplication.

**Acceptance:** Test cases cover the documented cases from
`lotro-datenraum-semantik-pruefung.json`; counted sets do not change without
explanation. Existing IDs, URLs and previous detail pages are preserved.

### 2. Keep missing, null, unresolved and computed apart

- [ ] For data whose origin is known, distinguish:
  explicit value (including `0`), missing source value,
  failed reference/table resolution and computed value.
- [ ] Do not silently present unresolved values as 0, false, "free",
  "no prerequisite" or "no source".
- [ ] For each affected field, document whether the difference is relevant up
  to the public page; do not add meaningless empty displays.

**Acceptance:** Tests check both the raw/intermediate value and the
presentation and ensure that a lookup fallback is not output as a proven game
value.

### 3. Do not oversimplify relations and prerequisites

- [ ] Model quest givers, vendors and barter vendors as roles with proven target
  types, not as synonyms for a single NPC record.
- [ ] Evaluate quest/deed prerequisites as feasibility only when
  operator, status and AND/OR structure are preserved and supported.
- [ ] Log unresolved references with source field, ID and checked target space
  instead of discarding them without comment.
- [ ] Keep map, map geometry, area, image, marker and placement apart; do not
  force mixed `parentId` target spaces into one map tree.

**Acceptance:** Reference tests check source field, target type and ID;
condition tests check nested AND/OR cases and unknown operators.
Unknown semantics stay marked as unknown.

### 4. Extend the existing quality assurance

- [ ] Show source → generated data set → page model as separate
  review steps.
- [ ] Add automated regressions for new confirmed rules.
- [ ] Check multilingualism via stable IDs and relations; do not derive
  translations from equally large sets.
- [ ] Run a small browser acceptance only for surfaces actually changed and in
  DE/EN/FR.

**Acceptance:** The review report names input data, export status, executed
tests and known limits. A successful partial check is not called a
complete semantic approval.

## Order

1. Make the source/intermediate model for item binding and recipe variants
   concrete.
2. Change pipeline and regression tests; only then switch the affected views.
3. Add unknown/null/lookup status based on concrete fields.
4. Extend condition and reference checks.
5. Only adopt further confirmed semantic areas one by one.

## Limits and non-goals

- No change to `MagicQuestLog`, game installation, character files or
  published content.
- No blanket rebuild of all website data and no unreviewed
  publication.
- No derivation of game server availability from client DAT or
  Companion data alone.
- No interpretation of unexplained effects, probabilities or
  conditions as a confirmed game rule.
- The technical audit material stays under `docs/datenraum/`; this TODO
  prioritises possible follow-up work but does not carry it out itself.
