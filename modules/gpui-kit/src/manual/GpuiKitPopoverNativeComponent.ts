import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  controlled?: boolean;
  anchor?: string;
  contentWidth?: CodegenTypes.Double;
  offset?: CodegenTypes.Double;
  arrow?: boolean;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  overlayClosable?: CodegenTypes.WithDefault<boolean, true>;
  /** Refines the popover's content box (a KitStyle as JSON). */
  kitStyle?: string;
  slots?: string;
  onGpuiKitPopoverOpenChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitPopover', {
  interfaceOnly: true,
});
