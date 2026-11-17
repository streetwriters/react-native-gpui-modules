import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type StepperItem = Readonly<{
  title: string;
  icon: string;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<StepperItem>;
  selectedIndex?: CodegenTypes.Int32;
  textCenter?: boolean;
  disabled?: boolean;
  layout?: CodegenTypes.WithDefault<
    'unset' | 'horizontal' | 'vertical',
    'unset'
  >;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitStepperSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitStepper', {
  interfaceOnly: true,
});
