# react-native-gpui-modules

Modules for [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux: adapters for third-party React Native libraries and our own desktop modules, with the example app that exercises them.

- `modules/<name>`: one package per module, each with its own README, LICENSE, CHANGELOG and documentation
- `example/`: a React Native app with a desktop target, one page or fixture per module and the e2e specs in `example/desktop/e2e`
- `tgz/`: `npm pack` output, git-ignored

## Modules

| Module                                                                  | Kind                                 | Upstream library                                                                                                                |
| ----------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| [`@react-native-gpui/async-storage`](modules/async-storage)             | adapter                              | [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage)                      |
| [`@react-native-gpui/clipboard`](modules/clipboard)                     | adapter                              | [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard)                                      |
| [`@react-native-gpui/config`](modules/config)                           | adapter                              | [`react-native-config`](https://github.com/react-native-config/react-native-config)                                             |
| [`@react-native-gpui/crypto`](modules/crypto)                           | own                                  | builds on [RustCrypto](https://github.com/RustCrypto) crates                                                                    |
| [`@react-native-gpui/device-info`](modules/device-info)                 | adapter                              | [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info)                              |
| [`@react-native-gpui/documents-picker`](modules/documents-picker)       | adapter                              | [`@react-native-documents/picker`](https://github.com/react-native-documents/document-picker)                                   |
| [`@react-native-gpui/fonts`](modules/fonts)                             | own                                  | —                                                                                                                               |
| [`@react-native-gpui/fs`](modules/fs)                                   | own                                  | —                                                                                                                               |
| [`@react-native-gpui/gesture-handler`](modules/gesture-handler)         | adapter                              | [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler)                              |
| [`@react-native-gpui/gpui-kit`](modules/gpui-kit)                       | adapter                              | [GPUI Kit](https://github.com/longbridge/gpui-component)                                                                        |
| [`@react-native-gpui/haptic-feedback`](modules/haptic-feedback)         | adapter                              | [`react-native-haptic-feedback`](https://github.com/mkuczera/react-native-haptic-feedback)                                      |
| [`@react-native-gpui/image-manipulator`](modules/image-manipulator)     | own                                  | —                                                                                                                               |
| [`@react-native-gpui/keyboard-controller`](modules/keyboard-controller) | adapter                              | [`react-native-keyboard-controller`](https://github.com/kirillzyusko/react-native-keyboard-controller)                          |
| [`@react-native-gpui/keychain`](modules/keychain)                       | adapter (with secure storage extras) | [`react-native-keychain`](https://github.com/oblador/react-native-keychain)                                                     |
| [`@react-native-gpui/linear-gradient`](modules/linear-gradient)         | adapter                              | [`react-native-linear-gradient`](https://github.com/react-native-linear-gradient/react-native-linear-gradient)                  |
| [`@react-native-gpui/localize`](modules/localize)                       | adapter                              | [`react-native-localize`](https://github.com/zoontek/react-native-localize)                                                     |
| [`@react-native-gpui/masked-view`](modules/masked-view)                 | adapter                              | [`@react-native-masked-view/masked-view`](https://github.com/react-native-masked-view/masked-view)                              |
| [`@react-native-gpui/mmkv`](modules/mmkv)                               | adapter                              | [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv)                                                            |
| [`@react-native-gpui/netinfo`](modules/netinfo)                         | adapter                              | [`@react-native-community/netinfo`](https://github.com/react-native-netinfo/react-native-netinfo)                               |
| [`@react-native-gpui/nitro-modules`](modules/nitro-modules)             | adapter                              | [`react-native-nitro-modules`](https://github.com/mrousavy/nitro)                                                               |
| [`@react-native-gpui/notifications`](modules/notifications)             | own                                  | —                                                                                                                               |
| [`@react-native-gpui/openpgp`](modules/openpgp)                         | own                                  | builds on [rPGP](https://github.com/rpgp/rpgp)                                                                                  |
| [`@react-native-gpui/pdf`](modules/pdf)                                 | own                                  | builds on [EmbedPDF](https://github.com/embedpdf/embed-pdf-viewer) and PDFium                                                   |
| [`@react-native-gpui/picker`](modules/picker)                           | adapter                              | [`@react-native-picker/picker`](https://github.com/react-native-picker/picker)                                                  |
| [`@react-native-gpui/reanimated`](modules/reanimated)                   | adapter                              | [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated)                                        |
| [`@react-native-gpui/safe-area-context`](modules/safe-area-context)     | adapter                              | [`react-native-safe-area-context`](https://github.com/AppAndFlow/react-native-safe-area-context)                                |
| [`@react-native-gpui/screens`](modules/screens)                         | adapter                              | [`react-native-screens`](https://github.com/software-mansion/react-native-screens)                                              |
| [`@react-native-gpui/slider`](modules/slider)                           | adapter                              | [`@react-native-community/slider`](https://github.com/callstack/react-native-slider)                                            |
| [`@react-native-gpui/spellcheck`](modules/spellcheck)                   | own                                  | —                                                                                                                               |
| [`@react-native-gpui/svg`](modules/svg)                                 | adapter                              | [`react-native-svg`](https://github.com/software-mansion/react-native-svg)                                                      |
| [`@react-native-gpui/system`](modules/system)                           | own                                  | —                                                                                                                               |
| [`@react-native-gpui/unistyles`](modules/unistyles)                     | adapter                              | [`react-native-unistyles`](https://github.com/jpudysz/react-native-unistyles)                                                   |
| [`@react-native-gpui/updater`](modules/updater)                         | own                                  | —                                                                                                                               |
| [`@react-native-gpui/vector-icons`](modules/vector-icons)               | adapter                              | [`@react-native-vector-icons/common`](https://github.com/oblador/react-native-vector-icons)                                     |
| [`@react-native-gpui/webauthn`](modules/webauthn)                       | own                                  | —                                                                                                                               |
| [`@react-native-gpui/webview`](modules/webview)                         | adapter                              | [`react-native-webview`](https://github.com/react-native-webview/react-native-webview)                                          |
| [`@react-native-gpui/worklets`](modules/worklets)                       | adapter                              | [`react-native-worklets`](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-worklets) |

See [AGENTS.md](AGENTS.md) for how modules are structured and versioned.
