# @react-native-gpui/config

Adapter for [`react-native-config`](https://github.com/react-native-config/react-native-config) (MIT): exposes the values of a `.env` file to JavaScript on desktop.

## About

This package is the desktop adapter for [`react-native-config`](https://github.com/react-native-config/react-native-config) 1.7. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-config @react-native-gpui/config
```

The module is autolinked on desktop.

## Usage

```js
import Config from 'react-native-config';

const apiUrl = Config.API_URL;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

The file is read when the app is built, not when it runs. The build reads `ENVFILE` if it is set, otherwise `.env` in the folder named by `RN_GPUI_PROJECT_ROOT`. Changing the file rebuilds the module. Values are read as text, with `\n` expanded to a newline; `export` prefixes and inline comments after a space are dropped.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-config`](https://github.com/react-native-config/react-native-config), is MIT licensed.
