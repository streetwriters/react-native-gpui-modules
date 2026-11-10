# @react-native-gpui/crypto

`crypto.getRandomValues`, `crypto.randomUUID` and a WebCrypto `crypto.subtle` for react-native-gpui apps.

## About

This is our own module; it has no upstream library.

## Install

```sh
npm install @react-native-gpui/crypto
```

```js
import '@react-native-gpui/crypto';

const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-512' },
  await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveKey']),
  { name: 'AES-KW', length: 256 },
  false,
  ['wrapKey', 'unwrapKey'],
);
```

## SubtleCrypto

The subset the apps here use, running RustCrypto in native code:

| Method | Support |
| --- | --- |
| `digest` | SHA-1, SHA-256, SHA-384, SHA-512 |
| `generateKey`, `importKey`, `exportKey` | `raw` AES-GCM and AES-KW keys of 128, 192 or 256 bits; `raw` PBKDF2 and HKDF keys (never extractable) |
| `encrypt`, `decrypt` | AES-GCM with a 12 byte `iv`, optional `additionalData` and a 128 bit tag |
| `wrapKey`, `unwrapKey` | `raw` keys with AES-KW (RFC 3394) |
| `deriveBits`, `deriveKey` | PBKDF2 and HKDF with any of the four hashes; the derived key is AES-GCM or AES-KW |

A `CryptoKey` holds its bytes out of reach of JavaScript. `extractable` and `usages` are enforced: an operation a key was not made for rejects with `InvalidAccessError`, an authentication or unwrap failure with `OperationError`. Anything else (other formats such as `jwk`, other algorithms, other IV or tag sizes) rejects with `NotSupportedError`.

Data crosses to native code as `ArrayBuffer`s and is copied, so very large buffers are better processed in chunks.

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Only the algorithms and operations listed under SubtleCrypto are implemented; others reject with `NotSupportedError`.

## License

MIT. See [LICENSE](LICENSE).
