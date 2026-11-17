---
id: gpui-kit-popover
title: Popover
---

The kit's `Popover`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name              | Type                         |
| ----------------- | ---------------------------- |
| `open`            | `boolean`                    |
| `controlled`      | `boolean`                    |
| `anchor`          | `string`                     |
| `width`           | `Double`                     |
| `offset`          | `Double`                     |
| `arrow`           | `boolean`                    |
| `appearance`      | `WithDefault<boolean, true>` |
| `overlayClosable` | `WithDefault<boolean, true>` |

## Native events

| Name                         | Type                                                |
| ---------------------------- | --------------------------------------------------- |
| `onGpuiKitPopoverOpenChange` | `DirectEventHandler< Readonly<{ open: boolean }> >` |

## Coverage
