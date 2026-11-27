---
id: gpui-kit-tree
title: Tree
---

The kit's `Tree`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                           |
| -------------- | ------------------------------ |
| `items`        | `ReadonlyArray<TreeNode>`      |
| `indent`       | `WithDefault<Double, 16>`      |
| `indentOffset` | `Double`                       |
| `rowStyle`     | `string`                       |
| `kitStyle`     | `string`                       |
| `contextMenu`  | `ReadonlyArray<TreeMenuEntry>` |

## Commands

- `selectItem`

## Coverage

- `Tree::new`: generated, constructor over its state entity and a delegate that holds the rows
