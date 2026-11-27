---
id: gpui-kit-resizable
title: Resizable
---

The kit's `Resizable`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type      |
| ------------ | --------- |
| `vertical`   | `boolean` |
| `panelsJson` | `string`  |

## Native events

| Name                       | Type                                                |
| -------------------------- | --------------------------------------------------- |
| `onGpuiKitResizableResize` | `DirectEventHandler< Readonly<{ sizes: string }> >` |

## Commands

- `resizePanel`

## Coverage

- `Resizable::new`: generated, constructor; React Native views are the slots of the component
