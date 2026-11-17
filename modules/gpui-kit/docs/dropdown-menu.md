---
id: gpui-kit-dropdown-menu
title: DropdownMenu
---

The kit's `DropdownMenu`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                      |
| ------------ | ------------------------- |
| `open`       | `boolean`                 |
| `controlled` | `boolean`                 |
| `anchor`     | `string`                  |
| `items`      | `ReadonlyArray<MenuItem>` |

## Native events

| Name                              | Type                                                |
| --------------------------------- | --------------------------------------------------- |
| `onGpuiKitDropdownMenuOpenChange` | `DirectEventHandler< Readonly<{ open: boolean }> >` |
| `onGpuiKitDropdownMenuSelect`     | `DirectEventHandler< Readonly<{ index: Int32 }> >`  |

## Coverage

- `DropdownMenu::new`: generated, constructor
- `ContextMenu::menu`: generated (items), a DropdownMenu popup opened by a secondary press on the React Native trigger; the kit's context_menu extension cannot hear presses that React Native content takes
