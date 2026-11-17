---
id: gpui-kit-marker
title: Marker
---

The kit's `Marker`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                        | Type                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| `variant`                   | `WithDefault< 'unset' \| 'plain' \| 'separator' \| 'border', 'unset' >` |
| `alignment`                 | `WithDefault< 'unset' \| 'start' \| 'center' \| 'end', 'unset' >`       |
| `loadingStyle`              | `WithDefault< 'unset' \| 'spinner' \| 'shimmer', 'unset' >`             |
| `loading`                   | `boolean`                                                               |
| `text`                      | `string`                                                                |
| `icon`                      | `string`                                                                |
| `accessibilityRoleOverride` | `string`                                                                |
| `separatorStyle`            | `string`                                                                |
| `shimmerDuration`           | `Double`                                                                |
| `shimmerHighlightColor`     | `Int32`                                                                 |
| `shimmerSpread`             | `Double`                                                                |
| `shimmerReverse`            | `boolean`                                                               |
| `shimmerOnce`               | `boolean`                                                               |

## Coverage

- `Marker::new`: generated, constructor; the id comes from the node tag
- `Marker::id`: generated, the id comes from the node tag
- `Marker::with_variant`: generated (variant)
- `Marker::alignment`: generated (alignment)
- `Marker::loading`: generated (loading)
- `Marker::with_loading_style`: generated (loadingStyle)
- `Marker::icon`: generated (icon), a slot named icon (React children) or the icon prop
- `Marker::content`: generated (text), a slot named content (React children) and the text prop
- `MarkerIcon::child`: generated (icon), the icon slot
- `MarkerContent::text`: generated (text)
- `MarkerContent::child`: generated, the content slot
- `Marker::role`: generated (accessibilityRoleOverride), a string: implicit, presentational or an accessibility role name
- `Marker::with_shimmer_style`: generated (shimmerDuration), ShimmerStyle from shimmerDuration, shimmerHighlightColor, shimmerSpread, shimmerReverse and shimmerOnce
- `Marker::separator_style`: generated (separatorStyle), a KitStyle (colors, border, radius, padding, font size and weight, opacity) refined into a StyleRefinement
