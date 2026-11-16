# @react-native-gpui/localize

Adapter for [`react-native-localize`](https://github.com/zoontek/react-native-localize) (MIT): reports the locales, country, currencies, calendar, units, number format and time zone of the machine.

## About

This package is the desktop adapter for [`react-native-localize`](https://github.com/zoontek/react-native-localize) 3.7. Install the original library next to it; its JavaScript runs unchanged on desktop, and this package provides the native side. The upstream library is licensed under the MIT license.

## Install

```sh
npm install react-native-localize @react-native-gpui/localize
```

The module is autolinked on desktop.

## Usage

```js
import * as RNLocalize from 'react-native-localize';

const locales = RNLocalize.getLocales();
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

The values are derived from the system locale (and the time zone from the system). The currency, clock, unit and separator tables cover common countries only, and the calendar is always Gregorian. `usesAutoDateAndTime` and `usesAutoTimeZone` return `undefined`. `openAppLanguageSettings` opens System Settings on macOS.

## License

MIT. See [LICENSE](LICENSE). The upstream library, [`react-native-localize`](https://github.com/zoontek/react-native-localize), is MIT licensed.
