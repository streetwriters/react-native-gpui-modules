import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  mode?: string;
  shadow?: CodegenTypes.WithDefault<boolean, true>;
  /** Where notifications show, such as `top-right`; empty keeps the theme's. */
  notificationPlacement?: string;
  /** How many notifications show at once; 0 keeps the theme's. */
  notificationMaxItems?: CodegenTypes.Int32;
  onGpuiKitThemeChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ dark: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTheme', {
  interfaceOnly: true,
});
