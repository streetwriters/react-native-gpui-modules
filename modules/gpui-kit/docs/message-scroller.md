---
id: gpui-kit-message-scroller
title: MessageScroller
---

The kit's `MessageScroller`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                   | Type                         |
| ---------------------- | ---------------------------- |
| `keysJson`             | `string`                     |
| `scrollbar`            | `WithDefault<boolean, true>` |
| `jumpButton`           | `WithDefault<boolean, true>` |
| `contentStyle`         | `string`                     |
| `listStyle`            | `string`                     |
| `rowStyle`             | `string`                     |
| `bottomFade`           | `Int32`                      |
| `jumpButtonLabel`      | `string`                     |
| `jumpButtonText`       | `string`                     |
| `jumpButtonVariant`    | `string`                     |
| `jumpButtonSize`       | `string`                     |
| `jumpButtonStyle`      | `string`                     |
| `jumpButtonTransition` | `WithDefault<Int32, -1>`     |

## Commands

- `scrollToEnd`
- `scrollToItem`
- `remeasureItems`

## Coverage

- `MessageScroller::new`: generated, constructor; React Native views are the slots
