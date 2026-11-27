import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  count?: CodegenTypes.Int32;
  /** The size of every row along the scroll axis. */
  itemSize?: CodegenTypes.WithDefault<CodegenTypes.Double, 32>;
  /** The cross-axis size of the rows; 0 fills the list. */
  crossSize?: CodegenTypes.Double;
  horizontal?: boolean;
  /** Generated rows as JSON, instead of the slots: `{ columns, text, firstText, rowStyle, cellStyle }`. */
  templateJson?: string;
  /** Refines the list (a KitStyle as JSON). */
  kitStyle?: string;
  /** Overlay scrollbars: `vertical`, `horizontal`, `both`, or empty for none. */
  scrollbars?: string;
  slots?: string;
  onGpuiKitVirtualListVisibleRange?: CodegenTypes.DirectEventHandler<
    Readonly<{ start: CodegenTypes.Int32; end: CodegenTypes.Int32 }>
  >;
}

interface NativeCommands {
  scrollToItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
  ) => void;
  /** `strategy` is `top`, `center` or `bottom`. */
  scrollToItemWith: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
    strategy: string,
  ) => void;
  scrollToEnd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToItem', 'scrollToItemWith', 'scrollToEnd'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitVirtualList', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
