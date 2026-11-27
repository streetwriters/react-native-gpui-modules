---
id: gpui-kit-virtual-list
title: VirtualList
---

The kit's `VirtualList`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                      |
| -------------- | ------------------------- |
| `count`        | `Int32`                   |
| `itemSize`     | `WithDefault<Double, 32>` |
| `crossSize`    | `Double`                  |
| `horizontal`   | `boolean`                 |
| `templateJson` | `string`                  |
| `kitStyle`     | `string`                  |
| `scrollbars`   | `string`                  |

## Commands

- `scrollToItem`
- `scrollToItemWith`
- `scrollToEnd`

## Coverage

- `v_virtual_list`: generated (itemSize), vertical lists
- `h_virtual_list`: generated (horizontal), horizontal lists
- `VirtualListScrollHandle::scroll_to_item`: generated (scrollToItem()), command
- `VirtualListScrollHandle::scroll_to_bottom`: generated (scrollToEnd()), command
