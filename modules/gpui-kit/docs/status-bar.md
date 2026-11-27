---
id: gpui-kit-status-bar
title: StatusBar
---

The kit's `StatusBar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type                           |
| ---------- | ------------------------------ |
| `parts`    | `ReadonlyArray<StatusBarPart>` |
| `kitStyle` | `string`                       |

## Coverage

- `StatusBar::new`: generated, constructor; React Native views are the slots of the component
- `StatusBar::left`: generated (left), each item of left; a string is drawn in the bar's type
- `StatusBar::right`: generated (right), each item of right
- `StatusBar (ParentElement)`: generated (children), the center region
- `StatusBar (Styled)`: generated (kitStyle)
