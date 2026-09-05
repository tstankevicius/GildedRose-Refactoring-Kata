# TypeScript Gilded Rose refactoring design

Status: Accepted for implementation

## Intent

Refactor the TypeScript implementation so that each inventory rule is easy to
find, understand, test, and extend. Preserve established behavior before adding
Conjured items. Prefer the simplest design that handles the known requirements
over a framework for hypothetical future rules.

## Constraints and assumptions

- Work is limited to the `TypeScript` project.
- The public `Item` class and `GildedRose.items` property must not change.
- `updateQuality()` continues to mutate the supplied items and return them.
- Refactoring commits must preserve behavior and keep the test suite green.
- Conjured behavior is added only after the refactoring is complete.
- Incoming non-legendary quality is assumed to be within 0–50. Sulfuras is the
  documented exception at quality 80.

One update represents the end of one day. Quality rules use the current `sellIn`
before it is decreased. Sulfuras changes neither field. Backstage quality becomes
zero when an update begins at `sellIn: 0`, because that update moves beyond the
concert date.

The requirements describe Conjured as a category, not a single product. Items
whose names start with `"Conjured "` will therefore follow the Conjured rule. For
example, both `Conjured Mana Cake` and `Conjured Elixir` qualify.

## Decision

Keep orchestration and item rules inside `GildedRose`, with distinct
responsibilities:

1. `updateQuality()` traverses and returns the inventory.
2. A single-item method ignores Sulfuras, selects one rule, and decreases
   `sellIn` once.
3. Small methods express ordinary, Aged Brie, Backstage, and later Conjured
   quality changes.
4. One adjustment operation enforces the inclusive 0–50 bounds for
   non-legendary items.

Ordinary behavior is the default rather than a whitelist. Special products are
identified explicitly by name; Conjured is identified by its category prefix.

This accepts that `GildedRose` knows the special product names. With four
established behaviors and one requested addition, keeping the rules together is
easier to inspect than distributing them across a framework. Strategies should
be reconsidered if categories become numerous, rules gain external dependencies,
or behavior must be selected at runtime.

## Alternatives considered

- **Extend the nested conditionals:** smallest feature diff, but further
  interleaves names, date thresholds, bounds, and mutations. It does not meet the
  refactoring goal.
- **Strategy objects:** isolate rules and scale well, but add a selector and
  several files for small behaviors. Name-based classification still exists; it
  is only moved.
- **Functional rule table:** concise and extensible, but correctness depends on
  rule ordering and fallback handling. The decision flow is less direct for this
  small domain.
- **Polymorphic items:** place behavior beside data, but change how callers create
  the supplied `Item` and conflict with the constraint not to alter it.
- **Behavior traits:** can reuse fragments such as `improves` or `expires`, but
  allow meaningless combinations and require readers to reconstruct each product
  rule from multiple flags.

## Delivery sequence

Each commit has one purpose and leaves `npm test` green.

1. Characterize required existing behavior with Vitest. Completed.
2. Record this design before changing production code.
3. Isolate inventory traversal from the update of one item.
4. Replace nested conditions with explicit rules and bounded quality adjustment
   in reviewable refactoring steps.
5. Write Conjured tests, observe them fail locally, implement the smallest passing
   change, and publish the complete green feature.
6. Refactor again only if Conjured exposes concrete duplication or unclear names.
7. Finalize the README and reproducible build, run, and test instructions.

The red phase of TDD is verified locally but not committed; every published
commit remains buildable and testable.

## Acceptance criteria

- [ ] Ordinary items degrade by 1 before expiration and 2 afterward, never below
      0.
- [ ] Aged Brie improves by 1 before expiration and 2 afterward, never above 50.
- [ ] Backstage passes improve by 1, 2, or 3 across the documented thresholds,
      then drop to 0 after the concert and never exceed 50.
- [ ] Sulfuras remains at quality 80 and its `sellIn` never changes.
- [ ] Empty and mixed inventories update correctly.
- [ ] `Item`, `GildedRose.items`, and the `updateQuality()` calling contract remain
      unchanged.
- [ ] Production code expresses item rules directly without a deeply nested
      condition tree.
- [ ] Every `"Conjured "` item degrades by 2 before expiration and 4 afterward,
      never below 0.
- [ ] `npm test` completes once, passes, and reports coverage.
- [ ] The final README documents installation, build, execution, testing, design
      trade-offs, and AI oversight.

## Verification

After every production change, run:

```sh
npm test
```

Before delivery, also run the TypeScript build/type check from a clean dependency
installation, follow the README as a reviewer would, and inspect the diff for
changes to public APIs, other languages, generated files, unrelated files, or
secrets.

## Risks and mitigations

- **Off-by-one dates:** tests cover Backstage and expiration boundaries at 11,
  10, 6, 5, 1, and 0.
- **Accidental Sulfuras mutation:** handling returns before either field changes;
  tests assert the complete item.
- **Incorrect Conjured classification:** tests use multiple names with the
  `"Conjured "` prefix rather than one example product.
- **Over-generalization:** implementation remains in one class until concrete
  complexity justifies extraction.
- **False confidence from coverage:** cases are derived from requirements and
  boundary analysis; full coverage is evidence of execution, not correctness.

## Responsible AI-assisted development

AI assistance may inspect control flow, enumerate alternatives, identify boundary
cases, draft changes, and propose verification. It is not treated as an authority
on requirements or correctness.

Human oversight remains explicit: requirements and ambiguities are resolved
before implementation; design and commit scope are agreed before changes are
published; suggested code is reviewed like third-party code; tests, types, diffs,
and repository state are checked independently; and private context, credentials,
generated artifacts, and unrelated files are excluded from the public repository.
The developer remains accountable for the final design, code, tests, security,
and review explanations.

## Non-goals

- Altering `Item` or introducing item subclasses.
- Building a generic rules engine or dependency-injection framework.
- Defining validation for incoming inventory outside documented bounds.
- Refactoring other language implementations.
- Mixing dependency modernization into the behavioral refactor.
