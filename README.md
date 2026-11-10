# react-native-gpui-modules

Modules for [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux: adapters for third-party React Native libraries and our own desktop modules, with the example app that exercises them.

- `modules/<name>`: one package per module, each with its own README, LICENSE, CHANGELOG and documentation
- `example/`: a React Native app with a desktop target, one page or fixture per module and the e2e specs in `example/desktop/e2e`
- `tgz/`: `npm pack` output, git-ignored

## Modules

| Module | Kind | Upstream library |
| --- | --- | --- |
| [`@react-native-gpui/clipboard`](modules/clipboard) | adapter | @react-native-clipboard/clipboard |
| [`@react-native-gpui/device-info`](modules/device-info) | adapter | react-native-device-info |
| [`@react-native-gpui/documents-picker`](modules/documents-picker) | adapter | @react-native-documents/picker |
| [`@react-native-gpui/keychain`](modules/keychain) | adapter (with secure storage extras) | react-native-keychain |
| [`@react-native-gpui/netinfo`](modules/netinfo) | adapter | @react-native-community/netinfo |
| [`@react-native-gpui/webview`](modules/webview) | adapter | react-native-webview |
| [`@react-native-gpui/crypto`](modules/crypto) | own | — |
| [`@react-native-gpui/image-manipulator`](modules/image-manipulator) | own | — |
| [`@react-native-gpui/notifications`](modules/notifications) | own | — |
| [`@react-native-gpui/openpgp`](modules/openpgp) | own | — |
| [`@react-native-gpui/pdf`](modules/pdf) | own | — |
| [`@react-native-gpui/spellcheck`](modules/spellcheck) | own | — |
| [`@react-native-gpui/system`](modules/system) | own | — |
| [`@react-native-gpui/updater`](modules/updater) | own | — |
| [`@react-native-gpui/webauthn`](modules/webauthn) | own | — |

See [AGENTS.md](AGENTS.md) for how modules are structured and versioned.
