import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  anchor?: string;
  width?: CodegenTypes.Double;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  openDelay?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  closeDelay?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  slots?: string;
  onGpuiKitHoverCardOpenChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitHoverCard', {
  interfaceOnly: true,
});
