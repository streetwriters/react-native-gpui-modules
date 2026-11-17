---
id: gpui-kit-button-group
title: ButtonGroup
---

The kit's `ButtonGroup`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| `items`    | `ReadonlyArray<ButtonGroupItem>`                                                |
| `multiple` | `boolean`                                                                       |
| `compact`  | `boolean`                                                                       |
| `outline`  | `boolean`                                                                       |
| `disabled` | `boolean`                                                                       |
| `layout`   | `WithDefault< 'unset' \| 'horizontal' \| 'vertical', 'unset' >`                 |
| `size`     | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `variant`  | `string`                                                                        |

## Native events

| Name                        | Type                                                  |
| --------------------------- | ----------------------------------------------------- |
| `onGpuiKitButtonGroupPress` | `DirectEventHandler< Readonly<{ pressed: string }> >` |

## Coverage

- `ButtonGroup::new`: generated, constructor; the id comes from the node tag
- `ButtonGroup::child`: generated (items), each Button child of the React component becomes an item
- `ButtonGroup::children`: aliased (items), covered by items
- `ButtonGroup::multiple`: generated (multiple)
- `ButtonGroup::layout`: generated (layout)
- `ButtonGroup::compact`: generated (compact)
- `ButtonGroup::outline`: generated (outline)
- `ButtonGroup::on_click`: generated (onPress), reports the indices of the pressed buttons
- `ButtonGroup::disabled`: generated (disabled)
- `ButtonGroup::with_size`: generated (size)
- `ButtonGroup::with_variant`: generated (variant)
