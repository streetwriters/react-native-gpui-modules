import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  message?: string;
  kind?: CodegenTypes.WithDefault<
    'unset' | 'info' | 'success' | 'warning' | 'error',
    'unset'
  >;
  placement?: CodegenTypes.WithDefault<
    'unset' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    'unset'
  >;
  autohide?: CodegenTypes.WithDefault<boolean, true>;
  onGpuiKitNotificationClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitNotification', {
  interfaceOnly: true,
});
