# @react-native-gpui/keychain

Adapter for [`react-native-keychain`](https://github.com/oblador/react-native-keychain) (MIT): stores secrets in the operating system's credential store, and adds encrypted strings and namespaced items on top.

## About

This package is the desktop adapter for [`react-native-keychain`](https://github.com/oblador/react-native-keychain) 11.0. Install the original library next to it; the library's JavaScript runs unchanged. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-keychain @react-native-gpui/keychain
```

The module is autolinked on desktop.

## Usage

```js
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('user', 'secret');
const credentials = await Keychain.getGenericPassword();
```

Desktop-only extras are named exports of `@react-native-gpui/keychain`:

```js
import {
  isEncryptionAvailable,
  encryptString,
  decryptString,
  setItem,
  getItem,
  deleteItem,
} from '@react-native-gpui/keychain';

if (await isEncryptionAvailable()) {
  const data = await encryptString('session', 'a secret'); // Uint8Array
  const text = await decryptString('session', data);
  await setItem('session', 'token', 'abc');
  const token = await getItem('session', 'token'); // 'abc', or null
  await deleteItem('session', 'token'); // true when there was one
}
```

## Platforms

macOS (Keychain) is tested. Windows (Credential Manager, protected with DPAPI) and Linux (Secret Service through D-Bus; building needs the libdbus development package) are written but not tested.

## Limitations

`getAllGenericPasswordServices` and `getAllInternetCredentialServers` reject, and access-control and biometric options are ignored. The react-native-keychain API stores items under the service the caller names, as the library does. The extras (`setItem`, `getItem`, `deleteItem`, `encryptString`, `decryptString`) always use the app's own namespace, so a caller cannot name another app's service.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-keychain`](https://github.com/oblador/react-native-keychain), is MIT licensed.
