---
id: gpui-kit-sidebar
title: Sidebar
---

The kit's `Sidebar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name             | Type                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| `groupsJson`     | `string`                                                             |
| `side`           | `string`                                                             |
| `sidebarWidth`   | `Double`                                                             |
| `collapsed`      | `boolean`                                                            |
| `collapsible`    | `WithDefault< 'unset' \| 'icon' \| 'offcanvas' \| 'none', 'unset' >` |
| `headerKit`      | `boolean`                                                            |
| `headerMenuJson` | `string`                                                             |
| `headerStyle`    | `string`                                                             |
| `footerKit`      | `boolean`                                                            |
| `footerStyle`    | `string`                                                             |
| `kitStyle`       | `string`                                                             |

## Native events

| Name                         | Type                                               |
| ---------------------------- | -------------------------------------------------- |
| `onGpuiKitSidebarPress`      | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitSidebarHeaderMenu` | `DirectEventHandler< Readonly<{ id: Int32 }> >`    |

## Coverage

- `Sidebar::new`: generated, constructor; groups and their items are the menu
- `Sidebar::side`: generated (side)
- `Sidebar::collapsible`: generated (collapsible)
- `Sidebar::collapsed`: generated (collapsed)
- `Sidebar::header`: generated (header, kitHeader), React Native content, in the kit's SidebarHeader with kitHeader
- `Sidebar::footer`: generated (footer, kitFooter), React Native content, in the kit's SidebarFooter with kitFooter
- `SidebarHeader::dropdown_menu`: generated (headerMenu)
- `SidebarGroup::new`: generated (groups)
- `SidebarMenuItem::new`: generated (groups[].items), label, icon, active, disabled, open, clickToOpen, children
- `SidebarMenuItem::suffix`: generated (groups[].items[].suffix), React Native content
- `SidebarMenuItem::label_style`: generated (groups[].items[].labelStyle)
- `SidebarMenuItem::context_menu`: generated (groups[].items[].contextMenu), items, labels, links and separators
