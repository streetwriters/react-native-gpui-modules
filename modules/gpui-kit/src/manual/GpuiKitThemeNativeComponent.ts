import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  mode?: string;
  onGpuiKitThemeChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ dark: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTheme', {
  interfaceOnly: true,
});
