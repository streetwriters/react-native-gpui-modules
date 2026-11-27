import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type NativeMenuItem = Readonly<{
  label: string;
  icon: string;
  /** SVG markup drawn as the icon, instead of `icon`. */
  iconSvg: string;
  checked: boolean;
  disabled: boolean;
  separator: boolean;
  /** The index of the submenu entry this item belongs to, or -1. */
  parent: CodegenTypes.Int32;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<NativeMenuItem>;
  /** Opens the menu where the content is right-clicked. */
  contextMenu?: CodegenTypes.WithDefault<boolean, true>;
  slots?: string;
  onGpuiKitNativeMenuSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

interface NativeCommands {
  /** Opens the menu below the content's bottom-left corner. */
  open: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['open'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitNativeMenu', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
