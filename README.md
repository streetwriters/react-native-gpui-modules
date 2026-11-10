# react-native-gpui-modules

Modules for [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux: adapters for third-party React Native libraries and our own desktop modules, with the example app that exercises them.

- `modules/<name>`: one package per module, each with its own README, LICENSE, CHANGELOG and documentation
- `example/`: a React Native app with a desktop target, one page or fixture per module and the e2e specs in `example/desktop/e2e`
- `tgz/`: `npm pack` output, git-ignored

## Modules

| Module                                                              | Kind                                 | Upstream library                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| [`@react-native-gpui/clipboard`](modules/clipboard)                 | adapter                              | [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard)                                      |
| [`@react-native-gpui/device-info`](modules/device-info)             | adapter                              | [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info)                              |
| [`@react-native-gpui/documents-picker`](modules/documents-picker)   | adapter                              | [`@react-native-documents/picker`](https://github.com/react-native-documents/document-picker)                                   |
| [`@react-native-gpui/gesture-handler`](modules/gesture-handler)     | adapter                              | [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler)                              |
| [`@react-native-gpui/keychain`](modules/keychain)                   | adapter (with secure storage extras) | [`react-native-keychain`](https://github.com/oblador/react-native-keychain)                                                     |
| [`@react-native-gpui/netinfo`](modules/netinfo)                     | adapter                              | [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo)                               |
| [`@react-native-gpui/reanimated`](modules/reanimated)               | adapter                              | [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated)                                        |
| [`@react-native-gpui/safe-area-context`](modules/safe-area-context) | adapter                              | [`react-native-safe-area-context`](https://github.com/AppAndFlow/react-native-safe-area-context)                                |
| [`@react-native-gpui/screens`](modules/screens)                     | adapter                              | [`react-native-screens`](https://github.com/software-mansion/react-native-screens)                                              |
| [`@react-native-gpui/svg`](modules/svg)                             | adapter                              | [`react-native-svg`](https://github.com/software-mansion/react-native-svg)                                                      |
| [`@react-native-gpui/vector-icons`](modules/vector-icons)           | adapter                              | [`@react-native-vector-icons/common`](https://github.com/oblador/react-native-vector-icons)                                     |
| [`@react-native-gpui/webview`](modules/webview)                     | adapter                              | [`react-native-webview`](https://github.com/react-native-webview/react-native-webview)                                          |
| [`@react-native-gpui/worklets`](modules/worklets)                   | adapter                              | [`react-native-worklets`](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-worklets) |
| [`@react-native-gpui/crypto`](modules/crypto)                       | own                                  | builds on [RustCrypto](https://github.com/RustCrypto) crates                                                                    |
| [`@react-native-gpui/fonts`](modules/fonts)                         | own                                  | —                                                                                                                               |
| [`@react-native-gpui/fs`](modules/fs)                               | own                                  | —                                                                                                                               |
| [`@react-native-gpui/image-manipulator`](modules/image-manipulator) | own                                  | —                                                                                                                               |
| [`@react-native-gpui/notifications`](modules/notifications)         | own                                  | —                                                                                                                               |
| [`@react-native-gpui/openpgp`](modules/openpgp)                     | own                                  | builds on [rPGP](https://github.com/rpgp/rpgp)                                                                                  |
| [`@react-native-gpui/pdf`](modules/pdf)                             | own                                  | builds on [EmbedPDF](https://github.com/embedpdf/embed-pdf-viewer) and PDFium                                                   |
| [`@react-native-gpui/spellcheck`](modules/spellcheck)               | own                                  | —                                                                                                                               |
| [`@react-native-gpui/system`](modules/system)                       | own                                  | —                                                                                                                               |
| [`@react-native-gpui/updater`](modules/updater)                     | own                                  | —                                                                                                                               |
| [`@react-native-gpui/webauthn`](modules/webauthn)                   | own                                  | —                                                                                                                               |

See [AGENTS.md](AGENTS.md) for how modules are structured and versioned.
