---
id: gpui-kit-popup-menu
title: PopupMenu
---

The kit's `PopupMenu`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name    | Type                      |
| ------- | ------------------------- |
| `items` | `ReadonlyArray<MenuItem>` |

## Native events

| Name                       | Type                                               |
| -------------------------- | -------------------------------------------------- |
| `onGpuiKitPopupMenuSelect` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `PopupMenu::new`: generated, constructor
