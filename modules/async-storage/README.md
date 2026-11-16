# @react-native-gpui/async-storage

Adapter for [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage) (MIT): persistent key-value storage on the desktop renderer.

Part of [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux.

## Install

```sh
npm install @react-native-async-storage/async-storage@3.1.x @react-native-gpui/async-storage
```

The module is autolinked on desktop. The library's JavaScript runs unchanged:

```js
import AsyncStorage, {
  createAsyncStorage,
} from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('key', 'value');
const custom = createAsyncStorage('custom');
```

## Storage location

Each named storage is one [redb](https://github.com/cberner/redb) database file, `async-storage/x-<hex>.redb`, in the application data directory (`RN_GPUI_APP_DATA_DIR` when set, otherwise the platform's data folder). The storage behind the legacy API, `getLegacyStorage()`, is `async-storage/legacy.redb`. The file name is the storage name in lowercase hex, so names that differ only in case, such as `Custom` and `custom`, stay separate on case-insensitive file systems.

A database file is locked while the app has it open. If a second instance of the same app runs at the same time, its calls on that storage reject with an error; the data is not affected.

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage), is MIT licensed.
