---
id: gpui-kit-command
title: Command
---

The kit's `Command`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                         |
| ------------- | ---------------------------- |
| `items`       | `ReadonlyArray<CommandItem>` |
| `placeholder` | `string`                     |
| `searchable`  | `boolean`                    |
| `filterable`  | `boolean`                    |
| `bordered`    | `boolean`                    |

## Native events

| Name                      | Type                                               |
| ------------------------- | -------------------------------------------------- |
| `onGpuiKitCommandSelect`  | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitCommandConfirm` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitCommandCancel`  | `DirectEventHandler<Readonly<{}>>`                 |
| `onGpuiKitCommandQuery`   | `DirectEventHandler< Readonly<{ text: string }> >` |

## Coverage

- `Command::new`: generated, constructor
