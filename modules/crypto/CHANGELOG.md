# Changelog

All notable changes to `@react-native-gpui/crypto` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

## 0.1.2 - 2026-11-09

- Enable the `alloc` feature of `aes-kw`, which AES key wrapping needs. The crate only compiled in an app that happened to enable it through another dependency.

## 0.1.1 - 2026-11-08

- The C++ provider serves only `NativeCrypto`, through `cppSpecs` in `react-native.config.js`, so autolink no longer registers the Rust `RNGpuiSubtle` module as a C++ one as well. Needs a CLI that reads `cppSpecs`; an older one ignores it.
- Add `crypto.subtle` with `digest`, `generateKey`, `importKey`, `exportKey`, `encrypt`, `decrypt`, `wrapKey`, `unwrapKey`, `deriveBits` and `deriveKey` for AES-GCM, AES-KW, PBKDF2 and HKDF, and the `CryptoKey` class, checked against the NIST, RFC 3394, RFC 6070 and RFC 5869 vectors.
