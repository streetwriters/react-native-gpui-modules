import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  size?: CodegenTypes.Double;
  placement?: CodegenTypes.WithDefault<
    'unset' | 'top' | 'bottom' | 'left' | 'right',
    'unset'
  >;
  resizable?: CodegenTypes.WithDefault<boolean, true>;
  overlay?: CodegenTypes.WithDefault<boolean, true>;
  overlayClosable?: CodegenTypes.WithDefault<boolean, true>;
  slots?: string;
  onGpuiKitSheetClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSheet', {
  interfaceOnly: true,
});
