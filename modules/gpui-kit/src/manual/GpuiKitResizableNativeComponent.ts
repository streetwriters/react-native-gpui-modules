import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  vertical?: boolean;
  /** The panels as JSON: sizes, ranges, labels, nested groups and slots. */
  panelsJson?: string;
  slots?: string;
  onGpuiKitResizableResize?: CodegenTypes.DirectEventHandler<
    Readonly<{ sizes: string }>
  >;
}

interface NativeCommands {
  resizePanel: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
    size: CodegenTypes.Double,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['resizePanel'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitResizable', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
