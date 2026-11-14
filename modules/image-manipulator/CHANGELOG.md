# Changelog

All notable changes to `@react-native-gpui/image-manipulator` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- Write results under `$RN_GPUI_APP_DATA_DIR/cache/<app>/ImageManipulator` when `RN_GPUI_APP_DATA_DIR` is set and non-empty.

## 0.0.1 - 2026-11-12

- First version.
- `manipulateAsync` applies crop, resize, rotate and flip actions in order, and encodes JPEG, PNG or lossless WebP, optionally with a base64 copy.
- Reads file paths, `file://` URIs and base64 `data:` URIs, applies a JPEG's EXIF orientation, and flattens transparency onto white for JPEG.
