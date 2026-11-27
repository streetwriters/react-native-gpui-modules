---
id: gpui-kit-stepper
title: Stepper
---

The kit's `Stepper`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| `items`         | `ReadonlyArray<StepperItem>`                                                    |
| `selectedIndex` | `Int32`                                                                         |
| `textCenter`    | `boolean`                                                                       |
| `disabled`      | `boolean`                                                                       |
| `layout`        | `WithDefault< 'unset' \| 'horizontal' \| 'vertical', 'unset' >`                 |
| `size`          | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `kitStyle`      | `string`                                                                        |

## Native events

| Name                     | Type                                               |
| ------------------------ | -------------------------------------------------- |
| `onGpuiKitStepperSelect` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `Stepper::new`: generated, constructor; the id comes from the node tag
- `Stepper::text_center`: generated (textCenter)
- `Stepper::layout`: generated (layout)
- `Stepper::vertical`: aliased (layout), covered by layout
- `Stepper::selected_index`: generated (selectedIndex)
- `Stepper::item`: generated (items)
- `Stepper::items`: aliased (items), covered by items
- `Stepper::disabled`: generated (disabled)
- `Stepper::on_click`: generated (onSelect), reports the index
- `Stepper::with_size`: generated (size)
- `StepperItem::icon`: generated (items)
- `StepperItem::disabled`: generated (items)
- `StepperItem::child`: generated (items), the title and description of the item, or its React Native content
- `StepperItem (Styled)`: generated (items), an item's kitStyle
- `Stepper (Styled)`: generated (kitStyle)
