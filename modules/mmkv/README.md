# @react-native-gpui/mmkv

Adapter for [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv) (MIT): fast synchronous key-value storage on the desktop renderer.

Part of [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux.

## Install

Install it next to `react-native-mmkv` and the Nitro adapter it builds on:

```sh
npm install react-native-mmkv@4.3.x react-native-nitro-modules@0.37.x @react-native-gpui/nitro-modules @react-native-gpui/mmkv
```

Keep using `react-native-mmkv` as you do on iOS and Android; its JavaScript API is unchanged. Autolinking builds the desktop side when the app is built.

```js
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();
storage.set('name', 'desktop');
const user = createMMKV({ id: 'user', encryptionKey: 'secret' });
```

## Storage location

Files are kept in the `mmkv` folder of the application data directory (`RN_GPUI_APP_DATA_DIR` when set, otherwise the platform's data folder). App groups are an iOS feature and are not used.

## Platforms

macOS is tested. The MMKV core and the glue build for Windows and Linux, but are not tested yet.

## Not supported

`addMemoryWarningListener` has no effect: desktop has no memory warnings.

## Licenses

MIT. See [LICENSE](LICENSE). `react-native-mmkv` is MIT, copyright Marc Rousavy.

The build downloads the MMKV core, Tencent MMKV 2.4.0 (the version react-native-mmkv pins), from GitHub and checks its SHA-256. It is cached in the native dependency cache, so it is downloaded once. The MMKV core is copyright Tencent and licensed under the [BSD 3-Clause License](https://github.com/Tencent/MMKV/blob/v2.4.0/LICENSE.TXT).
