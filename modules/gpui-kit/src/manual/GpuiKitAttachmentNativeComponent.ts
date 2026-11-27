import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The attachments as JSON, one for a single card; see `AttachmentProps`. */
  itemsJson?: string;
  /** Lays the attachments out as a scrolling row (`AttachmentGroup`). */
  asGroup?: boolean;
  /** The color the group's edges fade into; 0 for none. */
  edgeFade?: CodegenTypes.Int32;
  slots?: string;
  onGpuiKitAttachmentPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitAttachmentRemove?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitAttachmentRetry?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAttachment', {
  interfaceOnly: true,
});
