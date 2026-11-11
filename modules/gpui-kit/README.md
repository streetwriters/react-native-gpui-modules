# @react-native-gpui/gpui-kit

Adapter for [GPUI Kit](https://github.com/longbridge/gpui-component) (`gpui-kit` on crates.io, Apache-2.0): its components, drawn natively by the kit, as React Native components on desktop.

> **Alpha, in progress.** Generated so far: `Button`, `Input` and the primitives listed in the CHANGELOG. Component sizes are still estimated until the runtime's measurement lands in this module, and the remaining component groups (more inputs, overlays, data, layout) are not wrapped yet.

## About

This package wraps [GPUI Kit](https://gpui-kit.com) 0.9 by Longbridge, a component library for GPUI ([repository](https://github.com/longbridge/gpui-component)). The kit is a Rust crate, so nothing is installed next to this package; it builds the kit from source. GPUI Kit is licensed under the Apache License 2.0.

Versions follow gpui-kit's `<major>.<minor>`: `0.9.x` wraps gpui-kit `0.9.1`.

## Usage

```tsx
import { Button } from '@react-native-gpui/gpui-kit';

<Button label="Save" variant="primary" onPress={() => save()} />;
```

The wrappers, native glue and docs under `docs/gpui-kit` are generated from the kit's rustdoc by `tools/gpui-kit-gen`.

## Development

- `tools/gpui-kit-gen` generates everything under `src/generated`, `desktop/src/generated` and `docs/gpui-kit` from the rustdoc JSON of the gpui-kit 0.9.1 crates, which this module depends on unchanged.
- The module needs the core hooks `register_app_init` and `HostContext::app()` (core 0.87 after the host-component App access change). Until a core alpha with them is released, the example app runs with a copy of the core from the runtime branch placed in `node_modules/@react-native-gpui/core` (the published one is kept as `core.published`). That copy is local and not committed.

## Licence

MIT for this package. gpui-kit is Apache-2.0 and Lucide icons are ISC; see the notices shipped with the crates.
