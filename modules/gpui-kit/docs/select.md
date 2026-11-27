---
id: gpui-kit-select
title: Select
---

The kit's `Select`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                | Type                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| `items`             | `ReadonlyArray<string>`                                                         |
| `placeholder`       | `string`                                                                        |
| `searchPlaceholder` | `string`                                                                        |
| `searchable`        | `boolean`                                                                       |
| `cleanable`         | `boolean`                                                                       |
| `disabled`          | `boolean`                                                                       |
| `appearance`        | `WithDefault<boolean, true>`                                                    |
| `menuWidth`         | `Double`                                                                        |
| `icon`              | `string`                                                                        |
| `controlled`        | `boolean`                                                                       |
| `defaultValue`      | `string`                                                                        |
| `titlePrefix`       | `string`                                                                        |
| `menuMaxHeight`     | `Double`                                                                        |
| `emptyText`         | `string`                                                                        |
| `kitStyle`          | `string`                                                                        |
| `size`              | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `value`             | `string`                                                                        |
| `listJson`          | `string`                                                                        |

## Coverage

- `Select::new`: generated, constructor over a SearchableVec of strings
