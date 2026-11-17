---
id: gpui-kit-dropdown-button
title: DropdownButton
---

The kit's `DropdownButton`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                     | Type                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `label`                  | `string`                                                                                         |
| `icon`                   | `string`                                                                                         |
| `loading`                | `boolean`                                                                                        |
| `selected`               | `boolean`                                                                                        |
| `disabled`               | `boolean`                                                                                        |
| `outline`                | `boolean`                                                                                        |
| `variant`                | `string`                                                                                         |
| `menuAccessibilityLabel` | `string`                                                                                         |
| `anchor`                 | `WithDefault< 'unset' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right', 'unset' ` |
| `size`                   | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >`                  |
| `items`                  | `ReadonlyArray<DropdownButtonItem>`                                                              |

## Native events

| Name                            | Type                                               |
| ------------------------------- | -------------------------------------------------- |
| `onGpuiKitDropdownButtonPress`  | `DirectEventHandler<Readonly<{}>>`                 |
| `onGpuiKitDropdownButtonSelect` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `DropdownButton::new`: generated, constructor; the id comes from the node tag
- `DropdownButton::button`: generated (label), label, icon and loading of the action half, onPress for its click
- `DropdownButton::dropdown_menu`: generated (items), a PopupMenu built from the items; onSelect reports the index
- `DropdownButton::dropdown_menu_with_anchor`: generated (anchor)
- `DropdownButton::menu_accessibility_label`: generated (menuAccessibilityLabel)
- `DropdownButton::outline`: generated (outline)
- `DropdownButton::disabled`: generated (disabled)
- `DropdownButton::selected`: generated (selected)
- `DropdownButton::with_size`: generated (size)
- `DropdownButton::with_variant`: generated (variant)
- `PopupMenu::submenu`: generated (items[].children), an item with children opens a submenu built with PopupMenu::submenu_with_icon
- `PopupMenuItem::action`: generated (items[].action), a registered action name built with App::build_action; the item shows its keybinding and dispatches it
- `PopupMenuItem::element`: generated (items[].content), React Native content, rendered by a child renderer each time the menu draws
