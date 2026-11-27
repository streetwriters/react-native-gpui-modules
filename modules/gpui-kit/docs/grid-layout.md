---
id: gpui-kit-grid-layout
title: GridLayout
---

The kit's `GridLayout`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name               | Type                         |
| ------------------ | ---------------------------- |
| `columns`          | `WithDefault<Int32, 12>`     |
| `itemsDraggable`   | `WithDefault<boolean, true>` |
| `itemsResizable`   | `WithDefault<boolean, true>` |
| `compaction`       | `string`                     |
| `preventCollision` | `boolean`                    |
| `reflow`           | `Int32`                      |
| `rowHeight`        | `Double`                     |
| `label`            | `string`                     |
| `areasJson`        | `string`                     |
| `itemsJson`        | `string`                     |

## Native events

| Name                        | Type                                                 |
| --------------------------- | ---------------------------------------------------- |
| `onGpuiKitGridLayoutChange` | `DirectEventHandler< Readonly<{ layout: string }> >` |
| `onGpuiKitGridLayoutSelect` | `DirectEventHandler< Readonly<{ id: string }> >`     |

## Commands

- `setAreas`

## Coverage

- `GridLayout::new`: generated, constructor; React Native views are the slots
