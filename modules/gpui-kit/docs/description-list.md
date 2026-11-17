---
id: gpui-kit-description-list
title: DescriptionList
---

The kit's `DescriptionList`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| `layout`     | `WithDefault< 'unset' \| 'horizontal' \| 'vertical', 'unset' >`                 |
| `bordered`   | `WithDefault<boolean, true>`                                                    |
| `columns`    | `Int32`                                                                         |
| `labelWidth` | `Double`                                                                        |
| `size`       | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `items`      | `ReadonlyArray<DescriptionListItem>`                                            |

## Coverage

- `DescriptionList::new`: generated, constructor
- `DescriptionList::vertical`: aliased (layout), covered by layout
- `DescriptionList::horizontal`: aliased (layout), covered by layout
- `DescriptionList::layout`: generated (layout)
- `DescriptionList::label_width`: generated (labelWidth)
- `DescriptionList::bordered`: generated (bordered)
- `DescriptionList::columns`: generated (columns)
- `DescriptionList::item`: generated (items), label, value and span of an item
- `DescriptionList::child`: generated (items), an item with a value that is React content uses the value-N slot
- `DescriptionList::children`: aliased (items), covered by items
- `DescriptionList::separator`: generated (items), an item with separator set
- `DescriptionList::with_size`: generated (size)
- `DescriptionItem::new`: generated (items)
- `DescriptionItem::value`: generated (items)
- `DescriptionItem::span`: generated (items)
