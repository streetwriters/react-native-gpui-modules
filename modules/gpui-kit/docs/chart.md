---
id: gpui-kit-chart
title: Chart
---

The kit's `Chart`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `kind`        | `WithDefault< \| 'unset' \| 'line' \| 'area' \| 'bar' \| 'pie' \| 'candlestick' \| 'radar' \| 'sank` |
| `data`        | `ReadonlyArray<ChartPoint>`                                                                          |
| `nodes`       | `ReadonlyArray<string>`                                                                              |
| `links`       | `ReadonlyArray<ChartLink>`                                                                           |
| `color`       | `Int32`                                                                                              |
| `grid`        | `boolean`                                                                                            |
| `xAxis`       | `boolean`                                                                                            |
| `yAxis`       | `boolean`                                                                                            |
| `dots`        | `boolean`                                                                                            |
| `smooth`      | `boolean`                                                                                            |
| `innerRadius` | `Double`                                                                                             |
| `outerRadius` | `Double`                                                                                             |
| `specJson`    | `string`                                                                                             |

## Coverage

- `LineChart::new`: generated (kind), kind line
- `AreaChart::new`: generated (kind), kind area
- `BarChart::new`: generated (kind), kind bar
- `PieChart::new`: generated (kind), kind pie
