# @react-native-gpui/documents-picker

Desktop native module for [`@react-native-documents/picker`](https://github.com/react-native-documents/document-picker) on react-native-gpui. The library's JavaScript runs unchanged, so an app uses the same import on mobile and desktop.

## Install

```sh
npm install @react-native-documents/picker @react-native-gpui/documents-picker
```

The module is autolinked on desktop.

## Usage

```js
import {
  pick,
  pickDirectory,
  saveDocuments,
  keepLocalCopy,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

try {
  const [file] = await pick({ type: [types.images, types.pdf] });
  const [copy] = await keepLocalCopy({
    files: [{ uri: file.uri, fileName: file.name ?? 'file' }],
    destination: 'cachesDirectory',
  });
} catch (e) {
  if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
  throw e;
}
```

## Behaviour on desktop

- `pick` opens the system open panel. `allowMultiSelection` selects several files. Cancelling rejects with `OPERATION_CANCELED`, as on mobile. Each result has a `file://` `uri`, `name`, `size` and a `type` guessed from the extension.
- `type` is turned into extension filters. Predefined `types.*`, UTIs (`public.image`), MIME types (`image/*`, `application/pdf`) and `.ext` strings are understood; `*/*` and `public.item` allow any file, and unknown values are ignored.
- `pickDirectory` opens the folder panel and resolves with the folder's `file://` uri.
- `saveDocuments` with one source opens the save panel (prefilled with `fileName`, or the source name) and writes the file there. With several sources it asks for a folder. As on iOS the files are moved unless `copy: true`.
- `keepLocalCopy` copies into `<cache or data dir>/<app id>/<uuid>/<fileName>` and resolves with a `file://` `localUri`. `documentDirectory` is the user data directory.
- `isKnownType` resolves from a built-in table for the predefined types and from MIME and extension data otherwise.
- `releaseSecureAccess` and `releaseLongTermAccess` succeed without doing anything. `requestLongTermAccess` returns no bookmark, as desktop paths stay valid.
- `presentationStyle`, `transitionStyle` and `allowVirtualFiles` are ignored. Panels are not attached to the app window.

## License

MIT. See [LICENSE](LICENSE).
