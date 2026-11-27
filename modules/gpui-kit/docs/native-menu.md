---
id: gpui-kit-native-menu
title: NativeMenu
---

The kit's `NativeMenu`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                            |
| ------------- | ------------------------------- |
| `items`       | `ReadonlyArray<NativeMenuItem>` |
| `contextMenu` | `WithDefault<boolean, true>`    |

## Native events

| Name                        | Type                                               |
| --------------------------- | -------------------------------------------------- |
| `onGpuiKitNativeMenuSelect` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Commands

- `open`

## Coverage

- `NativeMenu::new`: generated, built from items when the menu opens
- `NativeMenu::menu`: generated (items)
- `NativeMenu::menu_with_disabled`: generated (items), an item's disabled
- `NativeMenu::menu_with_check`: generated (items), an item's checked
- `NativeMenu::menu_with_icon`: generated (items), an item's icon or iconSvg
- `NativeMenu::menu_with_icon_disabled`: generated (items), an item with an icon and disabled
- `NativeMenu::menu_with_icon_and_disabled`: aliased (items), covered by items
- `NativeMenu::separator`: generated (items), an item's separator
- `NativeMenu::submenu`: generated (items), an item's children
- `NativeMenu::show`: generated (contextMenu), at a right-click on the content, or below it with open()
