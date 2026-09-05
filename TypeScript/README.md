# Gilded Rose — TypeScript

This project refactors the TypeScript implementation of the Gilded Rose kata and
adds support for Conjured items. The public `Item` class and inventory update
contract remain unchanged.

## Prerequisites

- Node.js 18 or later
- npm

Run all commands below from the `TypeScript` directory.

## Install

```sh
npm ci
```

`package-lock.json` is versioned so reviewers install the same dependency tree
used to verify this submission.

`npm audit` reports known vulnerabilities in the pinned dev dependencies;
upgrading them is known and deliberately deferred — see
[Non-goals](specs/refactoring-design.md#non-goals).

## Build

Check that the TypeScript project compiles without emitting generated files:

```sh
npm run compile
```

The compiler checks this project's source while skipping type checks inside
third-party declaration files. This keeps the existing TypeScript and dependency
versions intact instead of mixing dependency modernization into the kata.

## Run

Run the supplied inventory simulation for its default two-day period:

```sh
npm start
```

Pass a different number of update days after `--`:

```sh
npm start -- 10
```

## Test

The canonical verification command for this submission is:

```sh
npm test
```

It performs one non-interactive Vitest run and writes an Istanbul coverage report
to `coverage/`.

For Vitest watch mode, use:

```sh
npm run test:vitest
```

The upstream Jest and Mocha starter suites duplicated this coverage and are
removed; the TextTest starter fixture remains in the repository but is not part
of this submission. The canonical and verified acceptance suite is
`test/vitest/gilded-rose.spec.ts`.

## Behavior

- Ordinary items degrade by 1 each day and by 2 after their sell-by date.
- Aged Brie improves by 1 each day and by 2 after its sell-by date.
- Backstage passes improve faster at 10 and 5 days, then become worthless after
  the concert.
- Sulfuras changes neither `sellIn` nor `quality`.
- Names beginning with `"Conjured "` identify the Conjured category.

The requirements say that expired items degrade twice as fast and that Conjured
items degrade twice as fast as ordinary items. Applying both rules means
Conjured quality decreases by 2 before expiration and by 4 afterward. Quality is
kept between 0 and 50 for nonlegendary items; Sulfuras is the documented
exception at quality 80.

## Design and trade-offs

`GildedRose` keeps inventory traversal separate from updating one item. Product
selection is explicit, each established behavior has a small method, and a
single adjustment operation enforces quality bounds. Ordinary behavior is the
default, while special products are selected by name or, for Conjured items, by
prefix.

The rules remain together in one class because the domain currently has only a
few stable categories. A strategy hierarchy or generic rule engine would add
selection and navigation overhead without solving a present requirement. The
full decision record and alternatives are in
[`specs/refactoring-design.md`](specs/refactoring-design.md).

## AI-assisted development

AI assistance was used to inspect the original control flow, enumerate boundary
cases and design alternatives, and draft implementation and documentation
changes. Requirements, assumptions, design direction, and commit boundaries were
reviewed by the developer before publication.

AI output was treated like third-party code: behavior was protected with tests,
the TypeScript source was type-checked, diffs and generated files were inspected,
and no credentials or private application context were added to the repository.
The developer remains responsible for the submitted decisions and code.
