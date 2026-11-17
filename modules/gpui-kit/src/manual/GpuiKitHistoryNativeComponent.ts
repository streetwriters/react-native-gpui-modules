import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  maxEntries?: CodegenTypes.Int32;
  onGpuiKitHistoryChange?: CodegenTypes.DirectEventHandler<
    Readonly<{
      current: string;
      canBack: boolean;
      canForward: boolean;
      length: CodegenTypes.Int32;
      moved: string;
    }>
  >;
}

interface NativeCommands {
  push: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    entry: string,
  ) => void;
  replaceCurrent: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    entry: string,
  ) => void;
  back: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  forward: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  clear: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['push', 'replaceCurrent', 'back', 'forward', 'clear'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitHistory', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
