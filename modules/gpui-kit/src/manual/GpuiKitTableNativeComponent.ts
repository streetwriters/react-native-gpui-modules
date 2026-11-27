import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type TableColumn = Readonly<{
  key: string;
  title: string;
  width: CodegenTypes.Double;
  sortable: boolean;
  /** `left`, `right`, or empty. */
  fixed: string;
  resizable: boolean;
  minWidth: CodegenTypes.Double;
  maxWidth: CodegenTypes.Double;
  /** `left`, `right` or `center`. */
  align: string;
  /** The column drops the table's cell padding; the cells and the header supply it. */
  flush: boolean;
  /** Cell text is cut with an ellipsis instead of overflowing. */
  truncate: boolean;
}>;

export type TableMenuEntry = Readonly<{
  label: string;
  separator: boolean;
}>;

export interface NativeProps extends ViewProps {
  columns?: ReadonlyArray<TableColumn>;
  cells?: ReadonlyArray<string>;
  /** One `color;background;weight` per cell, empty for the default; colours are theme names. */
  cellStyles?: ReadonlyArray<string>;
  /** Group header rows as JSON: `[[{ label, span }]]`. */
  groupHeaders?: string;
  size?: string;
  headerRowHeight?: CodegenTypes.Double;
  loopSelection?: boolean;
  colResizable?: boolean;
  colMovable?: boolean;
  sortable?: boolean;
  colSelectable?: boolean;
  rowSelectable?: boolean;
  cellSelectable?: boolean;
  rowHeader?: boolean;
  colFixed?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  loadMoreThreshold?: CodegenTypes.Int32;
  contextMenu?: ReadonlyArray<TableMenuEntry>;
  stripe?: boolean;
  bordered?: boolean;
  slots?: string;
  onGpuiKitTableSelectRow?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableOpenRow?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableSelectCell?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32; column: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableSelectColumn?: CodegenTypes.DirectEventHandler<
    Readonly<{ column: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableClearSelection?: CodegenTypes.DirectEventHandler<
    Readonly<{ cleared: boolean }>
  >;
  onGpuiKitTableMoveColumn?: CodegenTypes.DirectEventHandler<
    Readonly<{ from: CodegenTypes.Int32; to: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableLoadMore?: CodegenTypes.DirectEventHandler<
    Readonly<{ rows: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableMenu?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32; item: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableVisibleRange?: CodegenTypes.DirectEventHandler<
    Readonly<{
      rowStart: CodegenTypes.Int32;
      rowEnd: CodegenTypes.Int32;
      columnStart: CodegenTypes.Int32;
      columnEnd: CodegenTypes.Int32;
    }>
  >;
  onGpuiKitTableSort?: CodegenTypes.DirectEventHandler<
    Readonly<{ column: CodegenTypes.Int32; direction: string }>
  >;
}

interface NativeCommands {
  scrollToRow: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    row: CodegenTypes.Int32,
  ) => void;
  selectCell: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    row: CodegenTypes.Int32,
    column: CodegenTypes.Int32,
  ) => void;
  clearSelection: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToRow', 'selectCell', 'clearSelection'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitTable', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
