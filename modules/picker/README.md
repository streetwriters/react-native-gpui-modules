# @react-native-gpui/picker

Adapter for [`@react-native-picker/picker`](https://github.com/react-native-picker/picker) (MIT): draws the selected item of a picker as a dropdown button. A press opens the desktop context menu of the items.

## About

This package is the desktop adapter for [`@react-native-picker/picker`](https://github.com/react-native-picker/picker) 2.11. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install @react-native-picker/picker @react-native-gpui/picker
```

The module is autolinked on desktop.

## Usage

```js
import { Picker } from '@react-native-picker/picker';

<Picker selectedValue={language} onValueChange={setLanguage}>
  <Picker.Item label="Java" value="java" />
  <Picker.Item label="Rust" value="rust" />
</Picker>;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Choosing an item calls `onValueChange` with the item's value and index, and the picker shows the selected label. `enabled`, `color`, `style` and `testID` are honored; `placeholder` is shown when nothing is selected. The Android, iOS and Windows props are ignored.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`@react-native-picker/picker`](https://github.com/react-native-picker/picker), is MIT licensed.
