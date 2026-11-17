---
id: gpui-kit-breadcrumb
title: Breadcrumb
---

The kit's `Breadcrumb`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name    | Type                            |
| ------- | ------------------------------- |
| `items` | `ReadonlyArray<BreadcrumbItem>` |

## Native events

| Name                       | Type                                               |
| -------------------------- | -------------------------------------------------- |
| `onGpuiKitBreadcrumbPress` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `Breadcrumb::new`: generated, constructor
- `Breadcrumb::child`: generated (items)
- `Breadcrumb::children`: aliased (items), covered by items
- `BreadcrumbItem::new`: generated (items), label
- `BreadcrumbItem::disabled`: generated (items)
- `BreadcrumbItem::on_click`: generated (onPress), reports the index
- `BreadcrumbItem::style`: generated (items[].style), a KitStyle refined into the item style
