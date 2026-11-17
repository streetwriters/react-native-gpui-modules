import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type DropdownButtonItem = Readonly<{
  label: string;
  icon: string;
  checked: boolean;
  disabled: boolean;
  separator: boolean;
  action: string;
  parent: CodegenTypes.Int32;
}>;

export interface NativeProps extends ViewProps {
  label?: string;
  icon?: string;
  loading?: boolean;
  selected?: boolean;
  disabled?: boolean;
  outline?: boolean;
  variant?: string;
  menuAccessibilityLabel?: string;
  anchor?: CodegenTypes.WithDefault<
    'unset' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    'unset'
  >;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  items?: ReadonlyArray<DropdownButtonItem>;
  slots?: string;
  onGpuiKitDropdownButtonPress?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitDropdownButtonSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDropdownButton', {
  interfaceOnly: true,
});
