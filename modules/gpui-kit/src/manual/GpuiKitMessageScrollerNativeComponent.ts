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
  scrollbar?: boolean;
  jumpButton?: boolean;
  slots?: string;
}

interface NativeCommands {
  scrollToEnd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  scrollToItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToEnd', 'scrollToItem'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitMessageScroller', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
