---
id: gpui-kit-hover-card
title: HoverCard
---

The kit's `HoverCard`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                         |
| ------------ | ---------------------------- |
| `anchor`     | `string`                     |
| `width`      | `Double`                     |
| `appearance` | `WithDefault<boolean, true>` |
| `openDelay`  | `WithDefault<Double, -1>`    |
| `closeDelay` | `WithDefault<Double, -1>`    |

## Native events

| Name                           | Type                                                |
| ------------------------------ | --------------------------------------------------- |
| `onGpuiKitHoverCardOpenChange` | `DirectEventHandler< Readonly<{ open: boolean }> >` |

## Coverage

- `HoverCard::new`: generated, constructor
