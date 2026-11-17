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
  slots?: string;
  titleStyle?: string;
  contentStyle?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitGroupBox', {
  interfaceOnly: true,
});
