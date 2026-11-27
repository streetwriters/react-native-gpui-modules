import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import Native, { Commands } from './GpuiKitTableNativeComponent';
import { SlotHost } from './SlotHost';

export interface DataTableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  fixed?: 'left' | 'right';
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'right' | 'center';
  /** Drops the cell padding of the table; cells and header supply it. */
  flush?: boolean;
  truncate?: boolean;
}

/** A text cell with its own colours (theme names, e.g. `green`) and weight. */
export interface DataTableCell {
  text: string;
  color?: string;
  /** A tint of the theme colour over the whole cell. */
  background?: string;
  weight?: number;
}

export type DataTableRowEvent = NativeSyntheticEvent<Readonly<{ row: number }>>;
export type DataTableCellEvent = NativeSyntheticEvent<
  Readonly<{ row: number; column: number }>
>;
export type DataTableSortEvent = NativeSyntheticEvent<
  Readonly<{ column: number; direction: 'ascending' | 'descending' | 'none' }>
>;
export type DataTableVisibleRange = Readonly<{
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}>;

export type DataTableSize = 'xsmall' | 'small' | 'medium' | 'large' | number;

export interface DataTableGroup {
  label: string;
  span: number;
}

export interface DataTableMenuItem {
  label?: string;
  separator?: boolean;
}

export interface DataTableHandle {
  scrollToRow(row: number): void;
  selectCell(row: number, column: number): void;
  clearSelection(): void;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  /** One entry per row; a cell is text, a styled text, or React Native content. */
  rows: (ReactNode | DataTableCell)[][];
  stripe?: boolean;
  bordered?: boolean;
  size?: DataTableSize;
  headerRowHeight?: number;
  loopSelection?: boolean;
  columnResize?: boolean;
  columnOrder?: boolean;
  sortable?: boolean;
  columnSelectable?: boolean;
  rowSelectable?: boolean;
  cellSelectable?: boolean;
  rowHeader?: boolean;
  fixedColumns?: boolean;
  loading?: boolean;
  /** More rows can be loaded; `onLoadMore` fires near the end of the rows. */
  hasMore?: boolean;
  /** Rows from the end at which `onLoadMore` fires. */
  loadMoreThreshold?: number;
  /** Header rows above the columns; each row's spans cover every column. */
  groupHeaders?: DataTableGroup[][];
  contextMenu?: DataTableMenuItem[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelectRow?: (event: DataTableRowEvent) => void;
  onOpenRow?: (event: DataTableRowEvent) => void;
  onSelectCell?: (event: DataTableCellEvent) => void;
  onSelectColumn?: (column: number) => void;
  onClearSelection?: () => void;
  /** The user moved a column; the app reorders `columns`. */
  onMoveColumn?: (from: number, to: number) => void;
  onLoadMore?: () => void;
  onMenuSelect?: (row: number, item: number) => void;
  onVisibleRangeChange?: (range: DataTableVisibleRange) => void;
  /** A sortable column header was pressed; the app sorts `rows`. */
  onSort?: (event: DataTableSortEvent) => void;
}

const isText = (cell: unknown): cell is string | number =>
  typeof cell === 'string' || typeof cell === 'number';

const isStyled = (cell: unknown): cell is DataTableCell =>
  typeof cell === 'object' &&
  cell !== null &&
  'text' in cell &&
  !('$$typeof' in cell);

export const DataTable = forwardRef<DataTableHandle, DataTableProps>(
  function DataTable(
    {
      columns,
      rows,
      stripe,
      bordered,
      size,
      headerRowHeight,
      loopSelection,
      columnResize,
      columnOrder,
      sortable,
      columnSelectable,
      rowSelectable,
      cellSelectable,
      rowHeader,
      fixedColumns,
      loading,
      hasMore,
      loadMoreThreshold,
      groupHeaders,
      contextMenu,
      onSelectRow,
      onOpenRow,
      onSelectCell,
      onSelectColumn,
      onClearSelection,
      onMoveColumn,
      onLoadMore,
      onMenuSelect,
      onVisibleRangeChange,
      onSort,
      style,
      testID,
    },
    ref,
  ) {
    const native = useRef<ComponentRef<typeof Native>>(null);
    useImperativeHandle(ref, () => ({
      scrollToRow: row =>
        native.current && Commands.scrollToRow(native.current, row),
      selectCell: (row, column) =>
        native.current && Commands.selectCell(native.current, row, column),
      clearSelection: () =>
        native.current && Commands.clearSelection(native.current),
    }));
    const slots = useMemo(
      () =>
        rows.flatMap((row, r) =>
          row.flatMap((cell, c) =>
            cell != null && !isText(cell) && !isStyled(cell)
              ? [{ name: `cell-${r}-${c}`, content: cell as ReactNode }]
              : [],
          ),
        ),
      [rows],
    );
    const { cells, cellStyles } = useMemo(() => {
      const texts: string[] = [];
      const styles: string[] = [];
      for (const row of rows) {
        for (let index = 0; index < columns.length; index++) {
          const cell = row[index];
          if (isStyled(cell)) {
            texts.push(cell.text);
            styles.push(
              cell.color || cell.background || cell.weight
                ? `${cell.color ?? ''};${cell.background ?? ''};${cell.weight ?? ''}`
                : '',
            );
          } else {
            texts.push(isText(cell) ? String(cell) : '');
            styles.push('');
          }
        }
      }
      return { cells: texts, cellStyles: styles };
    }, [rows, columns.length]);
    const nativeColumns = useMemo(
      () =>
        columns.map(column => ({
          key: column.key,
          title: column.title,
          width: column.width ?? 0,
          sortable: column.sortable ?? false,
          fixed: column.fixed ?? '',
          resizable: column.resizable ?? false,
          minWidth: column.minWidth ?? 0,
          maxWidth: column.maxWidth ?? 0,
          align: column.align ?? 'left',
          flush: column.flush ?? false,
          truncate: column.truncate ?? false,
        })),
      [columns],
    );
    return (
      <SlotHost
        style={[{ width: 420, height: 240 }, style]}
        testID={testID}
        native={Native as never}
        nativeRef={native as never}
        nativeProps={{
          columns: nativeColumns,
          cells,
          cellStyles,
          groupHeaders: groupHeaders ? JSON.stringify(groupHeaders) : '',
          size: size === undefined ? '' : String(size),
          headerRowHeight: headerRowHeight ?? 0,
          loopSelection: loopSelection ?? true,
          colResizable: columnResize ?? true,
          colMovable: columnOrder ?? true,
          sortable: sortable ?? true,
          colSelectable: columnSelectable ?? true,
          rowSelectable: rowSelectable ?? true,
          cellSelectable: cellSelectable ?? false,
          rowHeader: rowHeader ?? true,
          colFixed: fixedColumns ?? true,
          loading: loading ?? false,
          hasMore: hasMore ?? false,
          loadMoreThreshold: loadMoreThreshold ?? 20,
          contextMenu: (contextMenu ?? []).map(entry => ({
            label: entry.label ?? '',
            separator: entry.separator ?? false,
          })),
          stripe: stripe ?? false,
          bordered: bordered ?? true,
          onGpuiKitTableSelectRow: onSelectRow,
          onGpuiKitTableOpenRow: onOpenRow,
          onGpuiKitTableSelectCell: onSelectCell,
          onGpuiKitTableSelectColumn: onSelectColumn
            ? (event: { nativeEvent: { column: number } }) =>
                onSelectColumn(event.nativeEvent.column)
            : undefined,
          onGpuiKitTableClearSelection: onClearSelection
            ? () => onClearSelection()
            : undefined,
          onGpuiKitTableMoveColumn: onMoveColumn
            ? (event: { nativeEvent: { from: number; to: number } }) =>
                onMoveColumn(event.nativeEvent.from, event.nativeEvent.to)
            : undefined,
          onGpuiKitTableLoadMore: onLoadMore ? () => onLoadMore() : undefined,
          onGpuiKitTableMenu: onMenuSelect
            ? (event: { nativeEvent: { row: number; item: number } }) =>
                onMenuSelect(event.nativeEvent.row, event.nativeEvent.item)
            : undefined,
          onGpuiKitTableVisibleRange: onVisibleRangeChange
            ? (event: { nativeEvent: DataTableVisibleRange }) =>
                onVisibleRangeChange(event.nativeEvent)
            : undefined,
          onGpuiKitTableSort: onSort,
        }}
        slots={slots}
      />
    );
  },
);
