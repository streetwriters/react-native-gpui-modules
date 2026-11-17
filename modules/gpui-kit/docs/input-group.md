---
id: gpui-kit-input-group
title: InputGroup
---

The kit's `InputGroup`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| `value`       | `string`                                                                        |
| `controlled`  | `boolean`                                                                       |
| `placeholder` | `string`                                                                        |
| `startText`   | `string`                                                                        |
| `endText`     | `string`                                                                        |
| `disabled`    | `boolean`                                                                       |
| `readonly`    | `boolean`                                                                       |
| `invalid`     | `boolean`                                                                       |
| `size`        | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |

## Native events

| Name                        | Type                                               |
| --------------------------- | -------------------------------------------------- |
| `onGpuiKitInputGroupChange` | `DirectEventHandler< Readonly<{ text: string }> >` |

## Coverage

- `InputGroup::new`: generated, constructor
