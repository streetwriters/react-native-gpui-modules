---
id: gpui-kit-form
title: Form
---

The kit's `Form`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                       |
| ------------ | -------------------------- |
| `horizontal` | `boolean`                  |
| `labelWidth` | `Double`                   |
| `columns`    | `Int32`                    |
| `fields`     | `ReadonlyArray<FormField>` |

## Coverage

- `Form::new`: generated, constructor; a Field per entry whose control is the field-N slot
- `Field::new`: generated (fields), label, description, required, visible, colSpan
