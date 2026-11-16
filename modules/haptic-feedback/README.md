# @react-native-gpui/haptic-feedback

Adapter for [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback) (MIT): plays the haptic feedback of the trackpad on macOS. Windows and Linux have no haptic hardware, so the calls do nothing there.

## About

This package is the desktop adapter for [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback) 3.0. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-haptic-feedback @react-native-gpui/haptic-feedback
```

The module is autolinked on desktop.

## Usage

```js
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

ReactNativeHapticFeedback.trigger('impactLight');
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Vibration patterns (`triggerPattern`) play their types in order without the timing between them. `playAHAP` rejects, since AHAP files are Apple Core Haptics only. `getSystemHapticStatus` reports `vibrationEnabled` and a `null` ringer mode.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback), is MIT licensed.
