# @react-native-gpui/linear-gradient

Adapter for [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient) (MIT): paints a linear gradient under the children of the view.

## About

This package is the desktop adapter for [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient) 2.8. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-linear-gradient @react-native-gpui/linear-gradient
```

The module is autolinked on desktop.

## Usage

```js
import { LinearGradient } from 'react-native-linear-gradient';

<LinearGradient colors={['#2563eb', '#7c3aed']} style={{ flex: 1 }}>
  {children}
</LinearGradient>;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Two colors are drawn as one GPUI gradient, with their locations. More than two colors are drawn as one gradient per segment along the axis the direction is closest to, so a diagonal gradient with more than two colors is only approximate. `useAngle` and `angle` are honored, `angleCenter` is read but does not move the gradient.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient), is MIT licensed.
