import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  title?: string;
  description?: string;
  tooltip?: string;
  progress?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  status?: CodegenTypes.WithDefault<
    'unset' | 'pending' | 'uploading' | 'processing' | 'failed' | 'complete',
    'unset'
  >;
  slots?: string;
  onGpuiKitAttachmentPress?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAttachmentRemove?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAttachmentRetry?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAttachment', {
  interfaceOnly: true,
});
