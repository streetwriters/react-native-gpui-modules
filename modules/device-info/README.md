# @react-native-gpui/device-info

Desktop native module for [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info) on react-native-gpui. The library's JavaScript API is unchanged.

## About

This package is the desktop adapter for [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info) 14.1. Install the original library next to it; the library's JavaScript runs unchanged. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-device-info @react-native-gpui/device-info
```

## What it returns

The native module reports the model, brand, system name and version, and the app's name, version, build number and bundle identifier. These feed the library's synchronous getters: `getModel`, `getBrand`, `getSystemVersion`, `getVersion`, `getBuildNumber`, `getReadableVersion`, `getBundleId`, `getApplicationName` and `isTablet` (always `false`).

- The app version, build number and identifier come from `RN_GPUI_APP_VERSION`, `RN_GPUI_APP_BUILD` and `RN_GPUI_APP_ID`, which the desktop build sets from `desktop.json`; without them they are `0.0.0`, `0` and the executable's name.
- `react-native-device-info` only runs its getters on the platforms its source lists, and lists no desktop system. This package replaces two of the library's internal files for desktop (`nativeInterface.ts` and `supported-platform-info.ts`) so that every getter that supports Windows also runs on macOS, Windows and Linux. No patching of `node_modules` is needed.
- Getters that call methods the module does not have, such as `getDeviceName` or `getBatteryLevel`, keep the library's behaviour: they reject or return `unknown`. `getSystemName` is one of them and returns `unknown`.

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Getters that need hardware or mobile-only APIs, such as `getDeviceName` or `getBatteryLevel`, keep the library's behaviour: they reject or return `unknown`. `isTablet` is always `false`.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info), is MIT licensed.
