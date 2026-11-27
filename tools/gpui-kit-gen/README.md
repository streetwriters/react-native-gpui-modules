# gpui-kit-gen

Generates `modules/gpui-kit` (TS specs, wrappers, Rust glue, docs, tester screens) from the rustdoc JSON of the gpui-kit 0.9.1 crates on crates.io, which build unchanged on our gpui through gpui-fast's `gpui-pre-*` compatibility crates.

```sh
cd .workspace && RUSTC_BOOTSTRAP=1 RUSTUP_TOOLCHAIN=1.98.1 \
  RUSTDOCFLAGS="-Z unstable-options --output-format json" \
  cargo doc --no-deps -p gpui-base -p gpui-component -p gpui-kit-assets
cd .. && node gen.mjs                # writes src/generated, desktop/src/generated, modules/gpui-kit/docs, COVERAGE.*, gpui-kit-example/desktop/e2e/gpui-kit-c-*.e2e.ts
```

- `components.json`: which components to generate and their per-component choices (event names, skipped methods with a reason, layout). A method with no automatic mapping gets one in `props` (`kind: custom` with its TS type and Rust glue, or `kind: alias`), `slots` (element arguments as React Native children), `extraEvents`, or `state.custom` and `state.commands` (`$call`) for setters of the state entity.
- `manual.json`: the components written by hand in `src/manual` and `desktop/src/manual` and the methods they cover, so that coverage and registration stay in one place.
- `deferred.json`: the components of the kit that are not wrapped, with the reason.
- `events.json`: how an event type becomes an RN event payload.
- `COVERAGE.md`: every method considered and what happened to it.

Generated files carry an `@generated` header and are never edited by hand.

The generator stops with an error when a native prop, generated or in a `src/manual` spec, is named like a layout or view style key or a view prop (`width`, `maxWidth`, `marginTop`, `draggable`, ...): Fabric flattens `style` into a view's props, so the view would read it as its style too.

## Reference app

`reference/` is a plain GPUI app (no React Native) on the same gpui-fast pin that draws each case of `gpui-kit-example/src/fixtures/gpuiKitParityCases.json` with gpui-kit directly, in a hidden window of the case size, and saves `<id>.png`. `--case <id> --click x,y [--type text]` also clicks (and types) through `Window::dispatch_event`, and saves `<id>-after.png` and the events the element reported. `gpui-kit-example/desktop/e2e/gpui-kit-parity.e2e.ts` compares the React Native drawing of every case with it.

```sh
cd reference && RUSTUP_TOOLCHAIN=1.98.1 cargo build
```

`--story <name>` draws one of gpui-component's official stories (v0.9.1) instead, in a hidden 960x1100 window of the default theme, and saves `story-<name>.png`. The story files are vendored unchanged under `reference/src/story/stories`, with the gallery helpers they import in `reference/src/story/support.rs`; `reference/kit-shim` is a local `gpui-kit` crate that gives them their `gpui_kit::` paths over the crates the reference already builds. `gpui-kit-example/desktop/e2e/gpui-kit-stories.e2e.ts` compares each ported story with it.
