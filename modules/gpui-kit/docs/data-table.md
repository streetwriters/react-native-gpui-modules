---
id: gpui-kit-data-table
title: DataTable
---

The kit's `DataTable`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                | Type                            |
| ------------------- | ------------------------------- |
| `columns`           | `ReadonlyArray<TableColumn>`    |
| `cells`             | `ReadonlyArray<string>`         |
| `cellStyles`        | `ReadonlyArray<string>`         |
| `groupHeaders`      | `string`                        |
| `size`              | `string`                        |
| `headerRowHeight`   | `Double`                        |
| `loopSelection`     | `boolean`                       |
| `colResizable`      | `boolean`                       |
| `colMovable`        | `boolean`                       |
| `sortable`          | `boolean`                       |
| `colSelectable`     | `boolean`                       |
| `rowSelectable`     | `boolean`                       |
| `cellSelectable`    | `boolean`                       |
| `rowHeader`         | `boolean`                       |
| `colFixed`          | `boolean`                       |
| `loading`           | `boolean`                       |
| `hasMore`           | `boolean`                       |
| `loadMoreThreshold` | `Int32`                         |
| `contextMenu`       | `ReadonlyArray<TableMenuEntry>` |
| `stripe`            | `boolean`                       |
| `bordered`          | `boolean`                       |

## Native events

| Name                           | Type                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `onGpuiKitTableSelectRow`      | `DirectEventHandler< Readonly<{ row: Int32 }> >`       |
| `onGpuiKitTableOpenRow`        | `DirectEventHandler< Readonly<{ row: Int32 }> >`       |
| `onGpuiKitTableSelectColumn`   | `DirectEventHandler< Readonly<{ column: Int32 }> >`    |
| `onGpuiKitTableClearSelection` | `DirectEventHandler< Readonly<{ cleared: boolean }> >` |
| `onGpuiKitTableLoadMore`       | `DirectEventHandler< Readonly<{ rows: Int32 }> >`      |
| `onGpuiKitTableVisibleRange`   | `DirectEventHandler< Readonly<{ rowStart: Int32`       |

## Commands

- `scrollToRow`
- `selectCell`
- `clearSelection`

## Coverage

- `DataTable::new`: generated, constructor over a TableState whose delegate holds the columns, the cells and the React Native cell renderers
