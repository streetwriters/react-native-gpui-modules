# @react-native-gpui/updater

Checks a release feed for a newer version of a packaged react-native-gpui app, downloads it, verifies it and installs it.

## About

This is our own module; it has no upstream library.

## Install

```sh
npm install @react-native-gpui/updater
```

## Usage

```js
import updater from '@react-native-gpui/updater';

updater.configure({
  feedUrl: 'https://example.com/releases/darwin/beta',
  channel: 'beta',
});

const update = await updater.checkForUpdates();
if (update) {
  await updater.downloadUpdate();
  await updater.installUpdate();
}
```

The feed is the `latest-mac.yml` (or `<channel>-mac.yml`) file that electron-builder publishes. Only macOS is supported for now.

## Running the Rust tests

The crate has no `[patch.crates-io]` block, so point Cargo at the local core crates. From the repository root:

```sh
R=$PWD/packages/core/ReactGpui
scripts/locked-build.sh cargo test --manifest-path modules/updater/desktop/Cargo.toml \
  --config "patch.crates-io.react-native-gpui.path='$R/rn-gpui'" \
  --config "patch.crates-io.rn-gpui-sys.path='$R/rn-gpui-sys'" \
  --config "patch.crates-io.rn-gpui-module.path='$R/rn-gpui-module'" \
  --config "patch.crates-io.rn-gpui-module-build.path='$R/rn-gpui-module-build'" \
  --config "patch.crates-io.gpui.git='https://github.com/streetwriters/gpui-fast'" --config "patch.crates-io.gpui.rev='5392403'" \
  --config "patch.crates-io.gpui_platform.git='https://github.com/streetwriters/gpui-fast'" --config "patch.crates-io.gpui_platform.rev='5392403'"
```

## Separate app data

When `RN_GPUI_APP_DATA_DIR` is set to a non-empty folder, downloaded updates are kept under `$RN_GPUI_APP_DATA_DIR/cache/<app>/updates` instead of the platform cache folder.

## Platforms

macOS only: zip archives from an electron-builder style feed (`latest-mac.yml`).

## Limitations

Only zip archives, no delta updates. Update an app that is signed and notarized for distribution. An app in `/Applications` installed by an administrator cannot be replaced by a standard user.

## Documentation

[docs/updater.md](docs/updater.md)

## License

MIT. See [LICENSE](LICENSE).
