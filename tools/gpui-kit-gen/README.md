# gpui-kit-gen

Generates `modules/gpui-kit` (TS specs, wrappers, Rust glue, docs, tester screens) from the rustdoc JSON of the gpui-kit 0.9.1 crates on crates.io, which build unchanged on our gpui through gpui-fast's `gpui-pre-*` compatibility crates.

```sh
cd .workspace && RUSTC_BOOTSTRAP=1 RUSTUP_TOOLCHAIN=1.98.1 \
  RUSTDOCFLAGS="-Z unstable-options --output-format json" \
  cargo doc --no-deps -p gpui-base -p gpui-component -p gpui-kit-assets
cd .. && node gen.mjs                # writes src/generated, desktop/src/generated, docs/gpui-kit, COVERAGE.*
```

- `components.json`: which components to generate and their per-component choices (event names, skipped methods with a reason, layout).
- `events.json`: how an event type becomes an RN event payload.
- `COVERAGE.md`: every method considered and what happened to it.

Generated files carry an `@generated` header and are never edited by hand.
