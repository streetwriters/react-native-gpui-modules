import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  width?: CodegenTypes.Double;
  marginTop?: CodegenTypes.Double;
  overlay?: CodegenTypes.WithDefault<boolean, true>;
  overlayClosable?: CodegenTypes.WithDefault<boolean, true>;
  keyboard?: CodegenTypes.WithDefault<boolean, true>;
  closeButton?: CodegenTypes.WithDefault<boolean, true>;
  centered?: boolean;
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  slots?: string;
  onGpuiKitDialogOk?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitDialogCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitDialogClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDialog', {
  interfaceOnly: true,
});
