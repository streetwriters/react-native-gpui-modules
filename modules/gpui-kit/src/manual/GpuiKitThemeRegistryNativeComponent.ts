import type React from 'react';
import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The theme whose colors are reported; empty for the active theme. */
  selected?: string;
  /** The registry, the active theme and the selected theme's colors, as JSON. */
  onGpuiKitThemeRegistryChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ json: string }>
  >;
}

interface NativeCommands {
  apply: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    name: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['apply'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitThemeRegistry', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
