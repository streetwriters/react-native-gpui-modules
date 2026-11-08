# @react-native-gpui/clipboard

Desktop native module for [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard) on react-native-gpui. The library's JavaScript API is unchanged.

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

## License

MIT.
