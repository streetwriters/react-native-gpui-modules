import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import Native from './GpuiKitTableNativeComponent';
import { SlotHost } from './SlotHost';

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
}

export type TableRowEvent = NativeSyntheticEvent<Readonly<{ row: number }>>;
export type TableSortEvent = NativeSyntheticEvent<
  Readonly<{ column: number; direction: 'ascending' | 'descending' | 'none' }>
>;

export interface TableProps {
  columns: TableColumn[];
  /** One entry per row; a cell is text, or React Native content. */
  rows: ReactNode[][];
  stripe?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelectRow?: (event: TableRowEvent) => void;
  onOpenRow?: (event: TableRowEvent) => void;
  /** A sortable column header was pressed; the app sorts `rows`. */
  onSort?: (event: TableSortEvent) => void;
}

const isText = (cell: ReactNode) =>
  typeof cell === 'string' || typeof cell === 'number';

export function Table({
  columns,
  rows,
  stripe,
  bordered,
  onSelectRow,
  onOpenRow,
  onSort,
  style,
  testID,
}: TableProps) {
  const slots = rows.flatMap((row, r) =>
    row.flatMap((cell, c) =>
      cell != null && !isText(cell)
        ? [{ name: `cell-${r}-${c}`, content: cell }]
        : [],
    ),
  );
  return (
    <SlotHost
      style={[{ width: 420, height: 240 }, style]}
      testID={testID}
      native={Native as never}
      nativeProps={{
        columns: columns.map(column => ({
          key: column.key,
          title: column.title,
          width: column.width ?? 0,
          sortable: column.sortable ?? false,
        })),
        cells: rows.flatMap(row =>
          columns.map((_, index) =>
            isText(row[index]) ? String(row[index]) : '',
          ),
        ),
        stripe: stripe ?? false,
        bordered: bordered ?? true,
        onGpuiKitTableSelectRow: onSelectRow,
        onGpuiKitTableOpenRow: onOpenRow,
        onGpuiKitTableSort: onSort,
      }}
      slots={slots}
    />
  );
}
