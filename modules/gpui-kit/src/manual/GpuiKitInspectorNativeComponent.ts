import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  /** Turns the inspector on or off when the value changes. */
  open?: CodegenTypes.WithDefault<boolean, false>;
}

interface NativeCommands {
  toggle: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['toggle'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitInspector', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
