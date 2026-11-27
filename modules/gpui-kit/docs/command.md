---
id: gpui-kit-command
title: Command
---

The kit's `Command`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                         |
| --------------- | ---------------------------- |
| `entriesJson`   | `string`                     |
| `placeholder`   | `string`                     |
| `searchable`    | `WithDefault<boolean, true>` |
| `filterable`    | `WithDefault<boolean, true>` |
| `bordered`      | `WithDefault<boolean, true>` |
| `listMaxHeight` | `Double`                     |
| `kitStyle`      | `string`                     |
| `autoFocus`     | `boolean`                    |
| `loading`       | `boolean`                    |

## Native events

| Name                      | Type                                               |
| ------------------------- | -------------------------------------------------- |
| `onGpuiKitCommandSelect`  | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitCommandConfirm` | `DirectEventHandler< Readonly<{ index: Int32`      |
| `onGpuiKitCommandCancel`  | `DirectEventHandler<Readonly<{}>>`                 |

## Coverage

- `Command::new`: generated, constructor
