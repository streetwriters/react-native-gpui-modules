---
id: gpui-kit-time-field
title: TimeField
---

The kit's `TimeField`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| `time`       | `string`                                                                        |
| `controlled` | `boolean`                                                                       |
| `disabled`   | `boolean`                                                                       |
| `invalid`    | `boolean`                                                                       |
| `precision`  | `WithDefault<'minute' \| 'second', 'minute'>`                                   |
| `hourCycle`  | `WithDefault<'h23' \| 'h12', 'h23'>`                                            |
| `size`       | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Native events

| Name                       | Type                                               |
| -------------------------- | -------------------------------------------------- |
| `onGpuiKitTimeFieldChange` | `DirectEventHandler< Readonly<{ time: string }> >` |

## Coverage

- `TimeField::new`: generated, constructor over its state entity
