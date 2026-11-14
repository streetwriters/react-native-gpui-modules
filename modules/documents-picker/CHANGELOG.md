# Changelog

All notable changes to `@react-native-gpui/documents-picker` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- `keepLocalCopy` copies into `$RN_GPUI_APP_DATA_DIR/<id>` (`documentDirectory`) or `$RN_GPUI_APP_DATA_DIR/cache/<id>` (`cachesDirectory`) when `RN_GPUI_APP_DATA_DIR` is set and non-empty.

## 11.0.0 - 2026-11-12

- Add the desktop native module for `@react-native-documents/picker` 11.0: `pick`, `pickDirectory`, `saveDocuments`, `keepLocalCopy`, `isKnownType` and the release functions.
