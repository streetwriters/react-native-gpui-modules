import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  controlled?: boolean;
  anchor?: string;
  width?: CodegenTypes.Double;
  offset?: CodegenTypes.Double;
  arrow?: boolean;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  overlayClosable?: CodegenTypes.WithDefault<boolean, true>;
  slots?: string;
  onGpuiKitPopoverOpenChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitPopover', {
  interfaceOnly: true,
});
