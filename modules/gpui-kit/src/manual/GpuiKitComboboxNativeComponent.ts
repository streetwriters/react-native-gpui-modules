import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<string>;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  cleanable?: boolean;
  disabled?: boolean;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  menuWidth?: CodegenTypes.Double;
  icon?: string;
  controlled?: boolean;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  multiple?: boolean;
  values?: string;
  defaultValues?: string;
  listJson?: string;
  checkIcon?: string;
  slots?: string;
  onGpuiKitComboboxChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ values: string }>
  >;
  onGpuiKitComboboxConfirm?: CodegenTypes.DirectEventHandler<
    Readonly<{ values: string }>
  >;
  onGpuiKitComboboxQuery?: CodegenTypes.DirectEventHandler<
    Readonly<{ query: string }>
  >;
}

interface NativeCommands {
  requestQuery: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['requestQuery'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitCombobox', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
