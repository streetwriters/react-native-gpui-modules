# @react-native-gpui/masked-view

Adapter for [`@react-native-masked-view/masked-view`](https://github.com/react-native-masked-view/masked-view) (MIT): shows the children of a view only where a mask element paints.

## About

This package is the desktop adapter for [`@react-native-masked-view/masked-view`](https://github.com/react-native-masked-view/masked-view) 0.3. Install the original library next to it; its JavaScript API is unchanged and this package provides the desktop side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install @react-native-masked-view/masked-view @react-native-gpui/masked-view
```

The module is autolinked on desktop.

## Usage

```js
import MaskedView from '@react-native-masked-view/masked-view';

<MaskedView maskElement={<Text style={{ fontSize: 60 }}>Mask</Text>}>
  <View style={{ flex: 1, backgroundColor: '#2563eb' }} />
</MaskedView>;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Supported

The children show only where the mask element paints, scaled by its alpha. The mask takes no pointer events and is hidden from the accessibility tree.

## Limitations

The view's own background and border are not masked. `androidRenderingMode` is ignored.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-masked-view/masked-view`](https://github.com/react-native-masked-view/masked-view), is MIT licensed.
