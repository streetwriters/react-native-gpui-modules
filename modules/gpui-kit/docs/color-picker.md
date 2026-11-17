---
id: gpui-kit-color-picker
title: ColorPicker
---

The kit's `ColorPicker`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name             | Type                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| `value`          | `Int32`                                                                         |
| `controlled`     | `boolean`                                                                       |
| `label`          | `string`                                                                        |
| `featuredColors` | `ReadonlyArray<Int32>`                                                          |
| `size`           | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Coverage

- `ColorPicker::new`: generated, constructor over its state entity
