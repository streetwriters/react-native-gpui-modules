---
id: gpui-kit-carousel
title: Carousel
---

The kit's `Carousel`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                         | Type                    |
| ---------------------------- | ----------------------- |
| `vertical`                   | `boolean`               |
| `looping`                    | `boolean`               |
| `controls`                   | `boolean`               |
| `pagination`                 | `boolean`               |
| `selectedIndex`              | `Int32`                 |
| `controlled`                 | `boolean`               |
| `size`                       | `string`                |
| `slides`                     | `ReadonlyArray<string>` |
| `slideStyle`                 | `string`                |
| `kitStyle`                   | `string`                |
| `contentStyle`               | `string`                |
| `trackStyle`                 | `string`                |
| `itemStyle`                  | `string`                |
| `paginationLabels`           | `boolean`               |
| `previousLabel`              | `string`                |
| `nextLabel`                  | `string`                |
| `previousAccessibilityLabel` | `string`                |
| `nextAccessibilityLabel`     | `string`                |

## Native events

| Name                      | Type                                               |
| ------------------------- | -------------------------------------------------- |
| `onGpuiKitCarouselChange` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `Carousel::new`: generated, constructor; React Native views are the slots of the component
