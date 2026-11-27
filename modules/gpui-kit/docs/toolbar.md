---
id: gpui-kit-toolbar
title: Toolbar
---

The kit's `Toolbar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name        | Type      |
| ----------- | --------- |
| `disabled`  | `boolean` |
| `size`      | `string`  |
| `itemsJson` | `string`  |
| `kitStyle`  | `string`  |

## Native events

| Name                    | Type                                            |
| ----------------------- | ----------------------------------------------- |
| `onGpuiKitToolbarPress` | `DirectEventHandler< Readonly<{ id: Int32 }> >` |

## Coverage

- `Toolbar::new`: generated, constructor; React Native views are the slots of the component
