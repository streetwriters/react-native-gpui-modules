---
id: gpui-kit-grid-layout
title: GridLayout
---

The kit's `GridLayout`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name        | Type                          |
| ----------- | ----------------------------- |
| `columns`   | `Int32`                       |
| `draggable` | `boolean`                     |
| `resizable` | `boolean`                     |
| `areas`     | `ReadonlyArray<GridAreaSpec>` |

## Native events

| Name                        | Type                                                 |
| --------------------------- | ---------------------------------------------------- |
| `onGpuiKitGridLayoutChange` | `DirectEventHandler< Readonly<{ layout: string }> >` |

## Coverage

- `GridLayout::new`: generated, constructor; React Native views are the slots
