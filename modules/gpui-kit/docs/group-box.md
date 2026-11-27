---
id: gpui-kit-group-box
title: GroupBox
---

The kit's `GroupBox`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                                                                 |
| -------------- | -------------------------------------------------------------------- |
| `variant`      | `WithDefault< 'unset' \| 'normal' \| 'fill' \| 'outline', 'unset' >` |
| `title`        | `string`                                                             |
| `footer`       | `string`                                                             |
| `titleStyle`   | `string`                                                             |
| `contentStyle` | `string`                                                             |
| `kitStyle`     | `string`                                                             |

## Coverage

- `GroupBox::new`: generated, constructor
- `GroupBox::id`: generated, the id comes from the node tag
- `GroupBox::with_variant`: generated (variant)
- `GroupBox::title`: generated (title), a slot named title (React children) or the title prop
- `GroupBox::footer`: generated, a slot named footer (React children)
- `GroupBox::child`: generated, the body slot (React children)
- `GroupBox::title_style`: generated (titleStyle), a KitStyle refined into a StyleRefinement
- `GroupBox::content_style`: generated (contentStyle), a KitStyle refined into a StyleRefinement
