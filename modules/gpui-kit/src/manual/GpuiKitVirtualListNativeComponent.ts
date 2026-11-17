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
  slots?: string;
}

interface NativeCommands {
  scrollToItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
  ) => void;
  scrollToEnd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToItem', 'scrollToEnd'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitVirtualList', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
