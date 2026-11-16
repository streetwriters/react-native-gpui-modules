# Changelog

All notable changes to `@react-native-gpui/nitro-modules` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- First release, for `react-native-nitro-modules` 0.37.x.
- Nitro Hybrid Objects written in C++ run on desktop: `NitroModules.createHybridObject`, promises, callbacks from any thread and `ArrayBuffer`.
- Nitro Views written in C++ are hosted as C++ host components. A library adds desktop support with `rn_gpui_nitro_library` in its CMake and a view class that inherits `HybridDesktopView`; see `docs/nitro-views.md`.
- `rn_gpui_nitro_library` accepts a package without `nitro.json`; it then has no autolinked Hybrid Objects.
