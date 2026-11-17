---
id: gpui-kit-date-picker
title: DatePicker
---

The kit's `DatePicker`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name             | Type                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| `date`           | `string`                                                                        |
| `endDate`        | `string`                                                                        |
| `range`          | `boolean`                                                                       |
| `controlled`     | `boolean`                                                                       |
| `dateFormat`     | `string`                                                                        |
| `placeholder`    | `string`                                                                        |
| `cleanable`      | `boolean`                                                                       |
| `appearance`     | `WithDefault<boolean, true>`                                                    |
| `numberOfMonths` | `Int32`                                                                         |
| `size`           | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Coverage

- `DatePicker::new`: generated, constructor over its state entity
