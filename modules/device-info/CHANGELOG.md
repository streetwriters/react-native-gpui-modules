# Changelog

All notable changes to `@react-native-gpui/device-info` are listed here. Each version's section becomes the notes of its GitHub release.

## 14.1.0 - 2026-11-12

- The library's getters now return the module's values on macOS, Windows and Linux. `getVersion`, `getSystemVersion`, `getBundleId`, `getApplicationName`, `getBuildNumber`, `getModel`, `getBrand` and `isTablet` returned `unknown` because the library lists no desktop platform; two of its internal files are replaced for desktop (`sourceOverrides`) instead of patching `node_modules`.
- The patch-package patch is gone.
