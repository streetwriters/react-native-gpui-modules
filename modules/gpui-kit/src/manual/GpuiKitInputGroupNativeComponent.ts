import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  value?: string;
  controlled?: boolean;
  placeholder?: string;
  startText?: string;
  endText?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  slots?: string;
  onGpuiKitInputGroupChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitInputGroup', {
  interfaceOnly: true,
});
