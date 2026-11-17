import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type ButtonGroupItem = Readonly<{
  label: string;
  icon: string;
  selected: boolean;
  disabled: boolean;
  variant: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<ButtonGroupItem>;
  multiple?: boolean;
  compact?: boolean;
  outline?: boolean;
  disabled?: boolean;
  layout?: CodegenTypes.WithDefault<
    'unset' | 'horizontal' | 'vertical',
    'unset'
  >;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  variant?: string;
  onGpuiKitButtonGroupPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ pressed: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitButtonGroup', {
  interfaceOnly: true,
});
