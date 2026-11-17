---
id: gpui-kit-list
title: List
---

The kit's `List`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                     |
| --------------- | ------------------------ |
| `items`         | `ReadonlyArray<ListRow>` |
| `selectedIndex` | `WithDefault<Int32, -1>` |
| `controlled`    | `boolean`                |
| `searchable`    | `boolean`                |

## Native events

| Name                   | Type                                               |
| ---------------------- | -------------------------------------------------- |
| `onGpuiKitListSelect`  | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitListConfirm` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitListCancel`  | `DirectEventHandler<Readonly<{}>>`                 |

## Coverage

- `List::new`: generated, constructor over its state entity and a delegate that holds the rows
- `ListState::searchable`: generated (searchable), `SearchableList` is `List` with a search field
- `ListDelegate::perform_search`: generated (searchable), rows are filtered by their label
- `SearchableListDelegate`: aliased, the search machinery behind `Select` and `Combobox`, which wrap it with their own lists
