---
id: gpui-kit-calendar
title: Calendar
---

The kit's `Calendar`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name               | Type                     |
| ------------------ | ------------------------ |
| `date`             | `string`                 |
| `endDate`          | `string`                 |
| `range`            | `boolean`                |
| `controlled`       | `boolean`                |
| `numberOfMonths`   | `Int32`                  |
| `firstDayOfWeek`   | `WithDefault<Int32, -1>` |
| `disabledWeekdays` | `ReadonlyArray<Int32>`   |

## Coverage

- `Calendar::new`: generated, constructor over its state entity
