# AGENTS.md

A change is one unit of work: a feature, a fix, a refactor. It can span several commits or a whole PR.

This repository holds every module for [react-native-gpui](https://github.com/streetwriters/react-native-gpui): adapters for third-party React Native libraries and our own desktop modules. New modules go here, never into react-native-gpui.

## Commits

- One-line Conventional Commits subject, lower-case start, at most 100 characters. Add a brief body only when the subject is not enough.
- No attribution lines (`Co-Authored-By` or similar).

## Every change

- Add an entry to the `CHANGELOG.md` of each module it touches, under `## Unreleased`. Keep changelogs current; a release renames `Unreleased` to `## <version> - <date>`, and that section becomes the GitHub release notes.
- Update the module's documentation (`docs/` in the module, and its README when usage changes).
- Find the simplest solution, and verify it before calling it done.

## Modules

Every module lives in `modules/<name>` and has:

- `README.md`: what the module is (one paragraph); the upstream library and its repository link for an adapter, or "our own module" for a standalone one; the license (ours, and the upstream library's for an adapter); install; a usage example; supported platforms (macOS is tested, say what is not); limitations.
- `LICENSE`.
- `CHANGELOG.md`: the title `# Changelog`, the line "All notable changes to `<package>` are listed here. Each version's section becomes the notes of its GitHub release.", then `## Unreleased` and `## <version> - <date>` sections.
- `package.json` with `license`, `description` and `repository` (`git+https://github.com/streetwriters/react-native-gpui-modules.git` with `directory`).
- Documentation in `docs/` when the README is not enough.

## Versions

- A module that adapts a library: that library's `<major>.<minor>` plus our own patch, for example `@react-native-gpui/documents-picker` `11.0.x` for `@react-native-documents/picker` `11.0.x`. Its peer is the upstream `<major>.<minor>.x`, with a `react-native` peer of `0.<minor>.x`.
- A standalone module: its own version, starting at `0.0.1`.
- Dependencies between our packages, and on `@react-native-gpui/*` runtime packages, use the exact version.

## The gpui pin

- The modules build against the same gpui-fast revision as the runtime ([react-native-gpui](https://github.com/streetwriters/react-native-gpui), `packages/core/ReactGpui/GPUI_PIN.md`). Autolink writes it into the `[patch.crates-io]` block of `example/desktop/Cargo.toml` and of each module crate that is its own workspace root.
- When the runtime's pin changes, update the core packages the example uses, run `npx react-native-gpui autolink` in `example` and `npm run test:rust`, and commit the manifests they rewrite, in the same sitting.

## Code

- Few comments, technical only. No references to plans, tickets or history.
- No unnecessary tests, and none for project files such as CI or scripts. Use temporary test files while implementing, and never commit or push them.

## Testing

- Every module is exercised in the example app (`example/`): a page or fixture per module, and an e2e spec in `example/desktop/e2e`.
- Run only the specs your change affects. Do not run the whole suite unless asked.
- Unit tests of a module run with `npm run test:unit`; Rust tests with `npm run test:rust`; `npm run lint`, `npm run typecheck` and `npm run check:versions` cover the rest. `scripts/ci/clean-install.mjs` builds a fresh app from the packed modules; it runs in CI only, never locally.

## Pull requests

- Keep the body short and unwrapped. Say what was implemented and what changed: what it adds, fixes or breaks. Don't list files or code references.
- For performance work, add a before/after table.
