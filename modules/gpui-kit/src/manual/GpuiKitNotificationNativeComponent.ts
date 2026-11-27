import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

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
  /** A pushed notification was clicked (`click`), closed (`close`) or its action pressed (`action`). */
  onGpuiKitNotificationEvent?: CodegenTypes.DirectEventHandler<
    Readonly<{ key: string; kind: string }>
  >;
}

interface NativeCommands {
  push: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    json: string,
  ) => void;
  remove: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    key: string,
  ) => void;
  clear: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['push', 'remove', 'clear'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitNotification', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
