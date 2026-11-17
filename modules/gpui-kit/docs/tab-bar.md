---
id: gpui-kit-tab-bar
title: TabBar
---

The kit's `TabBar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `items`         | `ReadonlyArray<TabItem>`                                                                           |
| `selectedIndex` | `Int32`                                                                                            |
| `menu`          | `boolean`                                                                                          |
| `variant`       | `WithDefault< 'unset' \| 'tab' \| 'outline' \| 'pill' \| 'segmented' \| 'underline' \| 'folder', ` |
| `size`          | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >`                    |

## Native events

| Name                    | Type                                               |
| ----------------------- | -------------------------------------------------- |
| `onGpuiKitTabBarSelect` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `TabBar::new`: generated, constructor; Tabs adds the React Native panel of the selected tab
