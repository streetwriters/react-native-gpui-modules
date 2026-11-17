---
id: gpui-kit-sheet
title: Sheet
---

The kit's `Sheet`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name              | Type                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `open`            | `boolean`                                                                   |
| `title`           | `string`                                                                    |
| `size`            | `Double`                                                                    |
| `placement`       | `WithDefault< 'unset' \| 'top' \| 'bottom' \| 'left' \| 'right', 'unset' >` |
| `resizable`       | `WithDefault<boolean, true>`                                                |
| `overlay`         | `WithDefault<boolean, true>`                                                |
| `overlayClosable` | `WithDefault<boolean, true>`                                                |

## Native events

| Name                  | Type                               |
| --------------------- | ---------------------------------- |
| `onGpuiKitSheetClose` | `DirectEventHandler<Readonly<{}>>` |

## Coverage

- `Sheet::new`: generated, constructor
