---
id: gpui-kit-radio-group
title: RadioGroup
---

The kit's `RadioGroup`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                                                  |
| --------------- | ----------------------------------------------------- |
| `items`         | `ReadonlyArray<RadioGroupItem>`                       |
| `layout`        | `WithDefault<'vertical' \| 'horizontal', 'vertical'>` |
| `selectedIndex` | `WithDefault<Int32, -1>`                              |
| `disabled`      | `boolean`                                             |
| `kitStyle`      | `string`                                              |

## Native events

| Name                        | Type                                               |
| --------------------------- | -------------------------------------------------- |
| `onGpuiKitRadioGroupChange` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `RadioGroup::new`: generated, constructor; the id comes from the node tag
- `RadioGroup::vertical`: generated (layout)
- `RadioGroup::horizontal`: generated (layout)
- `RadioGroup::layout`: aliased (layout), covered by layout
- `RadioGroup::child`: generated (items), each Radio child of the React component becomes an item; its children are drawn below its label
- `RadioGroup::children`: aliased (items), covered by items
- `RadioGroup::selected_index`: generated (selectedIndex), -1 selects none
- `RadioGroup::disabled`: generated (disabled)
- `RadioGroup::on_click`: generated (onChange), reports the index clicked
- `RadioGroup::on_change`: aliased (onChange), covered by onChange
- `RadioGroup (Styled)`: generated (kitStyle)
