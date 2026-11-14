# Changelog

All notable changes to `@react-native-gpui/spellcheck` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- Keep the app dictionary in `$RN_GPUI_APP_DATA_DIR/<app>/` when `RN_GPUI_APP_DATA_DIR` is set and non-empty, so several copies of an app can run with separate data.

## 0.0.1 - 2026-11-12

- First version: `getLanguages()`, `check()`, `suggest()` and `ignore()` through the system spell checker on macOS, and an app dictionary (`learn()`, `forget()`, `getLearnedWords()`) kept in a file under the app's support directory.
