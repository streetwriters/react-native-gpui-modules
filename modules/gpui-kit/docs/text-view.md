---
id: gpui-kit-text-view
title: TextView
---

The kit's `TextView`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                                                    |
| ------------ | ------------------------------------------------------- |
| `format`     | `WithDefault<'unset' \| 'markdown' \| 'html', 'unset'>` |
| `source`     | `string`                                                |
| `selectable` | `boolean`                                               |
| `scrollable` | `boolean`                                               |
| `maxLines`   | `Int32`                                                 |
| `kitStyle`   | `string`                                                |

## Coverage

- `TextView::new`: generated, constructor
