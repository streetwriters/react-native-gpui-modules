# @react-native-gpui/slider

Adapter for [`@react-native-community/slider`](https://github.com/callstack/react-native-slider) (MIT): draws the slider with the desktop renderer: the track, the filled part, and the thumb, with pointer dragging.

## About

This package is the desktop adapter for [`@react-native-community/slider`](https://github.com/callstack/react-native-slider) 5.2. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install @react-native-community/slider @react-native-gpui/slider
```

The module is autolinked on desktop.

## Usage

```js
import Slider from '@react-native-community/slider';

<Slider
  minimumValue={0}
  maximumValue={100}
  value={value}
  onValueChange={setValue}
/>;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Dragging with the pointer and pressing the track set the value, and fire `onSlidingStart`, `onValueChange` and `onSlidingComplete`. `disabled`, `inverted`, `step`, the track and thumb colors and `thumbSize` are honored. The slider is in the tab order and takes focus when pressed; the arrow keys move it by one `step` (a hundredth of the range without one), Home and End move it to the ends, and each press fires `onValueChange` and `onSlidingComplete`. `vertical` and the image props are ignored.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-community/slider`](https://github.com/callstack/react-native-slider), is MIT licensed.
