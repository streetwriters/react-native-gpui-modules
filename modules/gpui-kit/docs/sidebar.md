---
id: gpui-kit-sidebar
title: Sidebar
---

The kit's `Sidebar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `width`       | `Double`                                                             |
| `collapsed`   | `boolean`                                                            |
| `collapsible` | `WithDefault< 'unset' \| 'icon' \| 'offcanvas' \| 'none', 'unset' >` |
| `groups`      | `ReadonlyArray<SidebarGroupSpec>`                                    |
| `items`       | `ReadonlyArray<SidebarItemSpec>`                                     |

## Native events

| Name                    | Type                                               |
| ----------------------- | -------------------------------------------------- |
| `onGpuiKitSidebarPress` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `Sidebar::new`: generated, constructor
