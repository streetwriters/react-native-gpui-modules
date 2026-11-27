import {
  codegenNativeCommands,
  codegenNativeComponent,
  type HostComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type ListRow = Readonly<{
  label: string;
  disabled: boolean;
  /** The section the row is in. */
  section: CodegenTypes.Int32;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<ListRow>;
  selectedIndex?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  controlled?: boolean;
  searchable?: boolean;
  /** How many sections the rows are in; each may have a header and a footer slot. */
  sectionCount?: CodegenTypes.WithDefault<CodegenTypes.Int32, 1>;
  /** Rows can be selected (default `true`). */
  selectable?: CodegenTypes.WithDefault<boolean, true>;
  loading?: boolean;
  /** More rows can be loaded: the list asks for them near its end. */
  hasMore?: boolean;
  /** How many rows before the end the list asks for more. */
  loadMoreThreshold?: CodegenTypes.WithDefault<CodegenTypes.Int32, 20>;
  /** Rows can be dragged to reorder them. */
  rowsDraggable?: boolean;
  /** Refines each row and the list (KitStyles as JSON). */
  itemStyle?: string;
  kitStyle?: string;
  slots?: string;
  onGpuiKitListSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitListConfirm?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitListCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitListLoadMore?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  /** A row was dropped before or after another; both by their index in `items`. */
  onGpuiKitListMove?: CodegenTypes.DirectEventHandler<
    Readonly<{
      from: CodegenTypes.Int32;
      to: CodegenTypes.Int32;
      position: string;
    }>
  >;
}

interface NativeCommands {
  /** Scrolls row `row` of `section` into view; `strategy` is `top`, `center` or `bottom`. */
  scrollToItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    section: CodegenTypes.Int32,
    row: CodegenTypes.Int32,
    strategy: string,
  ) => void;
  scrollToSelected: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToItem', 'scrollToSelected'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitList', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
