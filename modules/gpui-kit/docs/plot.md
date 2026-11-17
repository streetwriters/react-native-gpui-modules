---
id: gpui-kit-plot
title: Plot
---

The kit's `Plot`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name     | Type                                                     |
| -------- | -------------------------------------------------------- |
| `links`  | `ReadonlyArray<PlotLink>`                                |
| `data`   | `ReadonlyArray<PlotPoint>`                               |
| `layers` | `ReadonlyArray<PlotLayerDef>`                            |
| `curve`  | `WithDefault<'linear' \| 'natural' \| 'step', 'linear'>` |

## Coverage

- `ScalePoint`: generated (data), the x scale
- `ScaleLinear`: generated (data), the y scale
- `Line`: generated (layers: line, dots)
- `Area`: generated (layers: area)
- `Grid`: generated (layers: grid)
- `PlotAxis`: generated (layers: axis)
- `Curve`: generated (curve)
- `Bar`: generated (layers: bar), bars on a band scale
- `Arc`: generated (layers: pie, donut), Pie arcs painted with Arc
- `ScaleBand`: generated (layers: bar), the cross scale of the bar layer
- `RadialLine`: generated (layers: radar), a closed radial line over the points
- `Sankey`: generated (layers: sankey, links), the points are nodes and links the flows
