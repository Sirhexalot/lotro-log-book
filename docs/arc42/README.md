# LOTRO Log Book – Architecture documentation according to arc42

[Documentation overview](../README.md) · [Official arc42 overview](https://arc42.de/overview/)

- **Documentation status:** 20.11.2026
- **Scope:** Repository `lotro-log-book` including website, data preparation, tests and release tools.
- **Guiding principle:** This documentation describes the state that can be evidenced in the code and at runtime. Where there are contradictions, the documentation is to be corrected; it does not justify a change in behaviour. A desired behaviour change needs its own assignment.

## Source status and delimitation

The statements below were checked against the named files in the checkout. At the time of documentation the repository contains numerous uncommitted changes. This documentation therefore describes the **present working tree**, not automatically the last commit or the live version. For operational questions, release build and live behaviour must be checked additionally.

Existing README and `docs/` files serve as references and context, not as proof that a behaviour still applies. Old numbers and dated test records are not adopted as current system values. Where the code path has not yet been traced completely, this is stated explicitly.

The separate `MagicQuestLog` repository and tools from `Companion-Test` are external data and build dependencies. They are not part of this repository's change scope. Their actual influence is named where the website code calls them or reads generated files from them.

---

## Chapters

1. [Introduction and goals](01-introduction-and-goals.md)
2. [Constraints](02-constraints.md)
3. [Context and scope](03-context-and-scope.md)
4. [Solution strategy](04-solution-strategy.md)
5. [Building block view](05-building-block-view.md)
6. [Runtime view](06-runtime-view.md)
7. [Deployment view](07-deployment-view.md)
8. [Cross-cutting concepts](08-crosscutting-concepts.md)
9. [Architecture decisions](09-architecture-decisions.md)
10. [Quality requirements and checks](10-quality-requirements.md)
11. [Risks and technical debt](11-risks-and-technical-debt.md)
12. [Glossary](12-glossary.md)

---

## Maintenance note

Changes to this documentation should rest on verifiable implementation. On every change, the source files named in each case are to be checked again. If code and this documentation diverge, the contradiction is to be recorded first; the documentation is adapted to the confirmed code. Requirements or desired architecture changes are not derived from an outdated documentation statement alone.
