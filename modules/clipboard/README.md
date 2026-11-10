# @react-native-gpui/clipboard

Adapter for [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard) (MIT): reads and writes the system clipboard on desktop.

## About

This package is the desktop adapter for [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard) 1.16. Install the original library next to it; the library's JavaScript runs unchanged. The upstream library is licensed under the MIT license.

## Install

```sh
npm install @react-native-clipboard/clipboard @react-native-gpui/clipboard
```

## Supported on desktop

`getString`, `setString`, `getStrings`, `setStrings` (the first string), `setHTML`, `hasString`, `hasImage`, `getImage` and `getImagePNG`. `setImage`, `getImageJPG` and `getHTML` reject, and `hasURL`, `hasNumber` and `hasWebURL` are `false`.

## Desktop extension: `setRich`

```js
import { setRich } from '@react-native-gpui/clipboard';

setRich({
  'text/plain': 'Title\n\nBody',
  'text/html': '<h1>Title</h1><p>Body</p>',
  'text/markdown': '# Title\n\nBody',
});
```

Writes the flavours as one clipboard item, so a paste target takes the richest form it understands. `text/plain` is required. `text/markdown` is stored on macOS (`net.daringfireball.markdown`) and dropped elsewhere.

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

`setImage`, `getImageJPG` and `getHTML` reject, `hasURL`, `hasNumber` and `hasWebURL` are `false`, and `setStrings` writes only the first string. The `text/markdown` flavour of `setRich` is stored on macOS only.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard), is MIT licensed.
