---
id: gpui-kit-badge
title: Badge
---

The kit's `Badge`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name    | Type                                                                            |
| ------- | ------------------------------------------------------------------------------- |
| `dot`   | `boolean`                                                                       |
| `count` | `Int32`                                                                         |
| `icon`  | `string`                                                                        |
| `max`   | `Int32`                                                                         |
| `color` | `ColorValue`                                                                    |
| `size`  | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Coverage

- `Badge::new`: generated, the wrapper is as big as its child, from a native-tree slot, and the indicator overflows its corner as in the kit
- `Badge::dot`: generated (dot)
- `Badge::count`: generated (count)
- `Badge::icon`: generated (icon)
- `Badge::max`: generated (max)
- `Badge::color`: generated (color)
- `Badge::with_size`: generated (size)
- `Badge::xsmall`: aliased (size), covered by with_size
- `Badge::small`: aliased (size), covered by with_size
- `Badge::large`: aliased (size), covered by with_size
- `ParentElement::extend`: generated (children), the child the badge sits on, as React Native content
