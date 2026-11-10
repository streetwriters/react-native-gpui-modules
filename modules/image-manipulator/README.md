# @react-native-gpui/image-manipulator

Crops, resizes, rotates, flips and re-encodes images on desktop, with an API shaped like [`expo-image-manipulator`](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)'s `manipulateAsync`.

## About

This is our own module; it has no upstream library.

## Install

```sh
npm install @react-native-gpui/image-manipulator
```

## Usage

```js
import {
  manipulateAsync,
  SaveFormat,
} from '@react-native-gpui/image-manipulator';

const { uri, width, height, base64 } = await manipulateAsync(
  pickedUri,
  [
    { crop: { originX: 40, originY: 10, width: 300, height: 300 } },
    { resize: { width: 256, height: 256 } },
  ],
  { compress: 0.8, format: SaveFormat.JPEG, base64: true },
);

const dataUrl = `data:image/jpeg;base64,${base64}`;
```

## Platforms

macOS is tested. Windows and Linux are not tested yet.

## Limitations

Works on bitmaps decoded by the module; formats and operations are the ones in the documentation. Animated images are read as their first frame.

## Documentation

[docs/image-manipulator.md](docs/image-manipulator.md)

## License

MIT. See [LICENSE](LICENSE).
