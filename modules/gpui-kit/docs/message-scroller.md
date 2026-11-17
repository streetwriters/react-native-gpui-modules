---
id: gpui-kit-message-scroller
title: MessageScroller
---

The kit's `MessageScroller`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type      |
| ------------ | --------- |
| `count`      | `Int32`   |
| `scrollbar`  | `boolean` |
| `jumpButton` | `boolean` |

## Commands

- `scrollToEnd`
- `scrollToItem`

## Coverage

- `MessageScroller::new`: generated, constructor; React Native views are the slots
