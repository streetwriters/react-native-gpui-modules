import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  axis?: CodegenTypes.WithDefault<
    'unset' | 'vertical' | 'horizontal' | 'both',
    'unset'
  >;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitScrollArea', {
  interfaceOnly: true,
});
