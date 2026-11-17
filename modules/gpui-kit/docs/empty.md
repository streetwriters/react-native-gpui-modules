---
id: gpui-kit-empty
title: Empty
---

The kit's `Empty`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type     |
| ------------- | -------- |
| `title`       | `string` |
| `description` | `string` |
| `icon`        | `string` |

## Coverage

- `Empty::new`: generated, constructor
- `Empty::header`: generated (title), EmptyHeader built from the media, title and description slots and props
- `Empty::content`: generated, the content slot (React children)
- `EmptyHeader::media`: generated (icon), EmptyMedia with the icon prop or a media slot
- `EmptyHeader::title`: generated (title), EmptyTitle with the title prop or a title slot
- `EmptyHeader::description`: generated (description), EmptyDescription with the description prop or a description slot
- `EmptyMedia::with_variant`: generated (icon), the icon variant is used when the icon prop is set
- `EmptyContent::child`: generated, the content slot
