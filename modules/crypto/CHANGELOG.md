# Changelog

All notable changes to `@react-native-gpui/crypto` are listed here.

## Unreleased

- The C++ provider serves only `NativeCrypto`, through `cppSpecs` in `react-native.config.js`, so autolink no longer registers the Rust `RNGpuiSubtle` module as a C++ one as well. Needs a CLI that reads `cppSpecs`; an older one ignores it.
- Add `crypto.subtle` with `digest`, `generateKey`, `importKey`, `exportKey`, `encrypt`, `decrypt`, `wrapKey`, `unwrapKey`, `deriveBits` and `deriveKey` for AES-GCM, AES-KW, PBKDF2 and HKDF, and the `CryptoKey` class, checked against the NIST, RFC 3394, RFC 6070 and RFC 5869 vectors.
