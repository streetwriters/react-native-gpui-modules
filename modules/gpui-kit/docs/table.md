---
id: gpui-kit-table
title: Table
---

The kit's `Table`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type                         |
| ---------- | ---------------------------- |
| `columns`  | `ReadonlyArray<TableColumn>` |
| `cells`    | `ReadonlyArray<string>`      |
| `stripe`   | `boolean`                    |
| `bordered` | `boolean`                    |

## Native events

| Name                      | Type                                             |
| ------------------------- | ------------------------------------------------ |
| `onGpuiKitTableSelectRow` | `DirectEventHandler< Readonly<{ row: Int32 }> >` |
| `onGpuiKitTableOpenRow`   | `DirectEventHandler< Readonly<{ row: Int32 }> >` |

## Coverage

- `DataTable::new`: generated, constructor over a TableState whose delegate holds the columns, the cells and the React Native cell renderers
