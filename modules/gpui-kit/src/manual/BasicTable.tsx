import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Native from './GpuiKitBasicTableNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

/** `TableHead` (in `header`) or `TableCell`: text, or React Native content. */
export interface TableCell {
  content: ReactNode;
  width?: number;
  colSpan?: number;
  align?: 'left' | 'center' | 'right';
  kitStyle?: KitStyle;
}

/** `TableRow`. */
export interface TableRow {
  cells: (TableCell | ReactNode)[];
  /** Refines the row, for example a striped `backgroundColor`. */
  kitStyle?: KitStyle;
}

export interface TableProps {
  /** Rows of the `TableHeader`; their cells are `TableHead`s. */
  header?: TableRow[];
  /** Rows of the `TableBody`. */
  rows?: TableRow[];
  /** Rows of the `TableFooter`. */
  footer?: TableRow[];
  /** `TableCaption` below the table. */
  caption?: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** The table's accessibility label. */
  label?: string;
  kitStyle?: KitStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const isText = (content: ReactNode) =>
  typeof content === 'string' || typeof content === 'number';

const asCell = (cell: TableCell | ReactNode): TableCell =>
  cell != null &&
  typeof cell === 'object' &&
  'content' in (cell as object) &&
  !React.isValidElement(cell)
    ? (cell as TableCell)
    : { content: cell as ReactNode };

/** The kit's basic `Table`: header, body and footer rows drawn as given. */
export function Table({
  header = [],
  rows = [],
  footer = [],
  caption,
  size,
  label,
  kitStyle: tableStyle,
  style,
  testID,
}: TableProps) {
  const sections = [
    { kind: 'header', rows: header },
    { kind: 'body', rows },
    { kind: 'footer', rows: footer },
  ].filter(section => section.rows.length > 0);
  const slots: { name: string; content: ReactNode }[] = [];
  const spec = {
    caption: caption ?? '',
    sections: sections.map((section, s) => ({
      kind: section.kind,
      rows: section.rows.map((row, r) => ({
        style: kitStyle(row.kitStyle),
        cells: row.cells.map(asCell).map((cell, c) => {
          const slot = !isText(cell.content) && cell.content != null;
          if (slot)
            slots.push({ name: `cell-${s}-${r}-${c}`, content: cell.content });
          return {
            head: section.kind === 'header',
            text: isText(cell.content) ? String(cell.content) : '',
            slot,
            width: cell.width ?? 0,
            col_span: cell.colSpan ?? 1,
            align: cell.align ?? 'left',
            style: kitStyle(cell.kitStyle),
          };
        }),
      })),
    })),
  };
  return (
    <SlotHost
      style={[{ width: '100%' }, style]}
      testID={testID}
      native={Native as never}
      nativeProps={{
        spec: JSON.stringify(spec),
        size: size ?? 'unset',
        label: label ?? '',
        kitStyle: kitStyle(tableStyle),
      }}
      slots={slots}
    />
  );
}
