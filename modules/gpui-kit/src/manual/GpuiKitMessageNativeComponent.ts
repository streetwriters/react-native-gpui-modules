import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The messages as JSON: alignment, avatar, header, content parts and footer. */
  messagesJson?: string;
  /** Lays the messages out as one `MessageGroup`. */
  grouped?: boolean;
  slots?: string;
  /** A header or footer button was pressed. */
  onGpuiKitMessageAction?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitMessage', {
  interfaceOnly: true,
});
