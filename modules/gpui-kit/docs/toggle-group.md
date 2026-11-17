---
id: gpui-kit-toggle-group
title: ToggleGroup
---

The kit's `ToggleGroup`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name        | Type                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| `items`     | `ReadonlyArray<ToggleGroupItem>`                                                |
| `segmented` | `boolean`                                                                       |
| `single`    | `boolean`                                                                       |
| `disabled`  | `boolean`                                                                       |
| `variant`   | `WithDefault<'unset' \| 'ghost' \| 'outline', 'unset'>`                         |
| `size`      | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Native events

| Name                         | Type                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `onGpuiKitToggleGroupChange` | `DirectEventHandler< Readonly<{ checked: string }> >` |

## Coverage

- `ToggleGroup::new`: generated, constructor; the id comes from the node tag
- `ToggleGroup::child`: generated (items), each Toggle child of the React component becomes an item
- `ToggleGroup::children`: aliased (items), covered by items
- `ToggleGroup::on_click`: generated (onChange), reports the indices that are checked
- `ToggleGroup::segmented`: generated (segmented)
- `ToggleGroup::single`: generated (single)
- `ToggleGroup::with_variant`: generated (variant)
- `ToggleGroup::disabled`: generated (disabled)
- `ToggleGroup::with_size`: generated (size)
