---
id: gpui-kit-combobox
title: Combobox
---

The kit's `Combobox`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

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
| `size`              | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `multiple`          | `boolean`                                                                       |
| `values`            | `string`                                                                        |

## Native events

| Name                       | Type                                                 |
| -------------------------- | ---------------------------------------------------- |
| `onGpuiKitComboboxChange`  | `DirectEventHandler< Readonly<{ values: string }> >` |
| `onGpuiKitComboboxConfirm` | `DirectEventHandler< Readonly<{ values: string }> >` |

## Coverage

- `Combobox::new`: generated, constructor over a SearchableVec of strings
