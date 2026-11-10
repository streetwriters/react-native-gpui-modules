# @react-native-gpui/webview

Adapter for [`react-native-webview`](https://github.com/react-native-webview/react-native-webview) (MIT): shows web content in the operating system's web view.

## About

This package is the desktop adapter for [`react-native-webview`](https://github.com/react-native-webview/react-native-webview) 13.16. Install the original library next to it; the library's JavaScript runs unchanged. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-webview @react-native-gpui/webview
```

The module is autolinked on desktop.

## Usage

```tsx
import { WebView } from 'react-native-webview';

<WebView source={{ uri: 'https://example.com' }} style={{ flex: 1 }} />;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

The desktop web view has the native component and module for the library's main props, events and methods; props for features the platform web view does not have (for example mobile-only cache and download options) are ignored.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-webview`](https://github.com/react-native-webview/react-native-webview), is MIT licensed.
