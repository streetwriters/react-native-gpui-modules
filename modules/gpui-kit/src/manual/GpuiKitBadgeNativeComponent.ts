import {
  codegenNativeComponent,
  type CodegenTypes,
  type ColorValue,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  dot?: boolean;
  count?: CodegenTypes.Int32;
  icon?: string;
  max?: CodegenTypes.Int32;
  color?: ColorValue;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitBadge', {
  interfaceOnly: true,
});
