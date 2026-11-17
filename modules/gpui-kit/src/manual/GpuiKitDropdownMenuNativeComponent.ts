import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type MenuItem = Readonly<{
  label: string;
  icon: string;
  checked: boolean;
  disabled: boolean;
  separator: boolean;
}>;

export interface NativeProps extends ViewProps {
  open?: boolean;
  controlled?: boolean;
  anchor?: string;
  items?: ReadonlyArray<MenuItem>;
  onGpuiKitDropdownMenuOpenChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: boolean }>
  >;
  onGpuiKitDropdownMenuSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDropdownMenu', {
  interfaceOnly: true,
});
