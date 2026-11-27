---
id: gpui-kit-bubble
title: Bubble
---

The kit's `Bubble`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `text`          | `string`                                                                                            |
| `variant`       | `WithDefault< \| 'unset' \| 'filled' \| 'secondary' \| 'muted' \| 'tinted' \| 'outline' \| 'ghost'` |
| `align`         | `string`                                                                                            |
| `reactionsJson` | `string`                                                                                            |
| `contentStyle`  | `string`                                                                                            |
| `groupJson`     | `string`                                                                                            |

## Coverage

- `Bubble::new`: generated, constructor; React Native views are the slots
