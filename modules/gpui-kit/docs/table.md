---
id: gpui-kit-table
title: Table
---

The kit's `Table`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| `spec`     | `string`                                                                        |
| `label`    | `string`                                                                        |
| `size`     | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `kitStyle` | `string`                                                                        |

## Coverage

- `Table::new`: generated, constructor; sections and rows come from the spec built by the Table wrapper
- `Table::child`: generated (header, rows, footer), one TableHeader, TableBody and TableFooter
- `Table::children`: generated (rows), covered by the rows of each section
- `Table::accessibility_label`: generated (label)
- `TableHeader::new`: generated (header)
- `TableBody::new`: generated (rows)
- `TableFooter::new`: generated (footer)
- `TableRow::new`: generated (rows), a row's kitStyle refines it
- `TableHead::new`: generated (header), cells of header rows
- `TableHead::col_span`: generated (colSpan)
- `TableHead::text_center`: generated (align)
- `TableHead::text_right`: generated (align)
- `TableCell::new`: generated (rows), text, or React Native content in the cell-S-R-C slot
- `TableCell::col_span`: generated (colSpan)
- `TableCell::text_center`: generated (align)
- `TableCell::text_right`: generated (align)
- `TableCaption::new`: generated (caption)
