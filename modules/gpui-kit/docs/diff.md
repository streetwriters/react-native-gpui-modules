---
id: gpui-kit-diff
title: Diff
---

The kit's `Diff`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name              | Type      |
| ----------------- | --------- |
| `patch`           | `string`  |
| `lineNumbers`     | `boolean` |
| `syntaxHighlight` | `boolean` |
| `header`          | `boolean` |
| `softWrap`        | `boolean` |

## Coverage

- `Diff::new`: generated, a unified patch shown as a diff, with syntax highlighting from the kit's highlighter
