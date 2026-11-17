---
id: gpui-kit-accordion
title: Accordion
---

The kit's `Accordion`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name             | Type                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| `items`          | `ReadonlyArray<AccordionItem>`                                                  |
| `multiple`       | `boolean`                                                                       |
| `bordered`       | `WithDefault<boolean, true>`                                                    |
| `disabled`       | `boolean`                                                                       |
| `size`           | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `titleStyle`     | `string`                                                                        |
| `contentStyle`   | `string`                                                                        |
| `itemHoverStyle` | `string`                                                                        |

## Native events

| Name                       | Type                                               |
| -------------------------- | -------------------------------------------------- |
| `onGpuiKitAccordionToggle` | `DirectEventHandler< Readonly<{ open: string }> >` |

## Coverage

- `Accordion::new`: generated, constructor; the id comes from the node tag
- `Accordion::multiple`: generated (multiple)
- `Accordion::bordered`: generated (bordered)
- `Accordion::disabled`: generated (disabled)
- `Accordion::item`: generated (items), an AccordionItem per entry; its content is the item-N slot
- `Accordion::on_toggle_click`: generated (onToggle), reports the indices of the open items
- `Accordion::with_size`: generated (size)
- `AccordionItem::title`: generated (items)
- `AccordionItem::icon`: generated (items)
- `AccordionItem::open`: generated (items)
- `AccordionItem::disabled`: generated (items)
- `AccordionItem::child`: generated (items), the content slot of the item
- `AccordionItem::title_style`: generated (titleStyle), a KitStyle for every item
- `AccordionItem::content_style`: generated (contentStyle), a KitStyle for every item
- `AccordionItem::hover`: generated (itemHoverStyle), a KitStyle used as the hover refinement of every item
