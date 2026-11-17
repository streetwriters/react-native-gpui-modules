---
id: gpui-kit-avatar-group
title: AvatarGroup
---

The kit's `AvatarGroup`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| `items`    | `ReadonlyArray<AvatarGroupItem>`                                                |
| `limit`    | `Int32`                                                                         |
| `ellipsis` | `boolean`                                                                       |
| `size`     | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Coverage

- `AvatarGroup::new`: generated, constructor
- `AvatarGroup::child`: generated (items), each Avatar child of the React component becomes an item
- `AvatarGroup::children`: aliased (items), covered by items
- `AvatarGroup::limit`: generated (limit)
- `AvatarGroup::ellipsis`: generated (ellipsis)
- `AvatarGroup::with_size`: generated (size)
- `Avatar::src`: generated (items), an item's src is a web address or a file path
