import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  spec?: string;
  label?: string;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  kitStyle?: string;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitBasicTable', {
  interfaceOnly: true,
});
