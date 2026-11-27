import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  value?: CodegenTypes.Int32;
  controlled?: boolean;
  hasValue?: boolean;
  select?: boolean;
  placeholder?: string;
  label?: string;
  featuredColors?: ReadonlyArray<CodegenTypes.Int32>;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitColorPickerChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ color: CodegenTypes.Int32; cleared: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitColorPicker', {
  interfaceOnly: true,
});
