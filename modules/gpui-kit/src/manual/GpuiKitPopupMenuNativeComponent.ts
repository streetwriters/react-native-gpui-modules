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
  items?: ReadonlyArray<MenuItem>;
  onGpuiKitPopupMenuSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitPopupMenu', {
  interfaceOnly: true,
});
