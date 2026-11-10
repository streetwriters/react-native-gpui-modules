# @react-native-gpui/netinfo

Desktop native module for [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo) on react-native-gpui. The library's JavaScript runs unchanged: `fetch`, `addEventListener` and `useNetInfo` report the state of the machine's network interfaces.

## About

This package is the desktop adapter for [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo) 11.4. Install the original library next to it; the library's JavaScript runs unchanged. The upstream library is licensed under the MIT license.

## Install

```sh
npm install @react-native-community/netinfo @react-native-gpui/netinfo
```

The module is autolinked on desktop.

## Usage

```js
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

const state = await NetInfo.fetch();
const unsubscribe = NetInfo.addEventListener(next => console.log(next.isConnected));
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Only the state of the network interfaces is reported (type, connected, details such as the address); mobile-only details like cellular generation or SSID are not available.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo), is MIT licensed.
