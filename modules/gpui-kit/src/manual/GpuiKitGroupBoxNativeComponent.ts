import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  variant?: CodegenTypes.WithDefault<
    'unset' | 'normal' | 'fill' | 'outline',
    'unset'
  >;
  title?: string;
  footer?: string;
  slots?: string;
  titleStyle?: string;
  contentStyle?: string;
  kitStyle?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitGroupBox', {
  interfaceOnly: true,
});
