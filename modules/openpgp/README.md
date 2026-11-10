# @react-native-gpui/openpgp

OpenPGP key generation, encryption and decryption for react-native-gpui apps, on the [rPGP](https://github.com/rpgp/rpgp) Rust library. The API has the shape of the `react-native-openpgp` module used by mobile apps: `generate`, `encrypt` and `decrypt`.

## About

This is our own module; it has no upstream library.

## Install

```sh
npm install @react-native-gpui/openpgp
```

The module is autolinked on desktop.

## Usage

```js
import OpenPGP from '@react-native-gpui/openpgp';

const { publicKey, privateKey } = await OpenPGP.generate({ name: 'Ada', email: 'ada@example.com' });
const encrypted = await OpenPGP.encrypt('hello', publicKey);
const message = await OpenPGP.decrypt(encrypted, privateKey, 'passphrase');
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Key generation, encryption and decryption of messages with a public or private key; no signing, key import or key management beyond that.

## License

MIT. See [LICENSE](LICENSE).
