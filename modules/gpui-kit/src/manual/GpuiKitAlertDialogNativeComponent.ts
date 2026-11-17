import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  description?: string;
  width?: CodegenTypes.Double;
  confirm?: boolean;
  keyboard?: CodegenTypes.WithDefault<boolean, true>;
  centered?: boolean;
  okText?: string;
  cancelText?: string;
  slots?: string;
  onGpuiKitAlertDialogOk?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAlertDialogCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAlertDialogClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAlertDialog', {
  interfaceOnly: true,
});
