# @react-native-gpui/keyboard-controller

Adapter for [`react-native-keyboard-controller`](https://github.com/kirillzyusko/react-native-keyboard-controller) (MIT): a desktop has no soft keyboard, so the keyboard views pass their children through and the keyboard never shows.

## About

This package is the desktop adapter for [`react-native-keyboard-controller`](https://github.com/kirillzyusko/react-native-keyboard-controller) 1.23. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-keyboard-controller @react-native-gpui/keyboard-controller
```

The module is autolinked on desktop.

## Usage

```js
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';

<KeyboardProvider>
  <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    {children}
  </KeyboardAvoidingView>
</KeyboardProvider>;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

The keyboard height is always 0 and no keyboard events fire. `KeyboardController.dismiss()` blurs the focused TextInput, unless `keepFocus` is set. `setFocusTo('next' | 'prev')` moves focus through the focused window's tab order, as Tab and Shift+Tab do, so it reaches every focusable view, not only TextInputs; `current` is a no-op. It needs `@react-native-gpui/core` 0.87.0-alpha.4 or later. `setInputMode`, `setDefaultMode`, `preload` and `setTranslucent` do nothing. The keyboard controller module is provided in JavaScript, not in Rust.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-keyboard-controller`](https://github.com/kirillzyusko/react-native-keyboard-controller), is MIT licensed.
