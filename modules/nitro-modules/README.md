# @react-native-gpui/nitro-modules

Adapter for [`react-native-nitro-modules`](https://github.com/mrousavy/nitro) (MIT): runs Nitro Hybrid Objects and Nitro Views written in C++ on the desktop renderer.

Part of [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux.

## Install

Install it next to `react-native-nitro-modules`:

```sh
npm install react-native-nitro-modules@0.37.x @react-native-gpui/nitro-modules
```

Keep using `NitroModules.createHybridObject` and `getHostComponent` as you do on iOS and Android; the JavaScript API is unchanged. Autolinking builds the desktop side when the app is built.

A Nitro library needs its own desktop support to run: its Hybrid Objects and views must be implemented in C++ and built through [`rn_gpui_nitro_library`](docs/nitro-views.md). The Swift and Kotlin implementations of a library do not run on desktop.

## Usage

```ts
import { NitroModules } from 'react-native-nitro-modules';

const math = NitroModules.createHybridObject<Math>('Math');
math.add(1, 2);
```

## Platforms

macOS is tested. Windows and Linux build the same C++ and the platform glue for them is written, but it is not tested. A Nitro View is hosted as a native view on macOS (an `NSView` the library returns), and on Windows and Linux through the composition surface the library draws into.

## Limitations

- Only C++ Hybrid Objects and views run. Libraries whose Nitro autolinking is Swift or Kotlin need a C++ implementation for desktop.

## Documentation

[Adding desktop support to a Nitro library](docs/nitro-views.md)

## License

MIT. See [LICENSE](LICENSE). `react-native-nitro-modules` is MIT, copyright Marc Rousavy.
