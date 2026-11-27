import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type RadioGroupItem = Readonly<{
  label: string;
  disabled: boolean;
  size: string;
  kitStyle: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<RadioGroupItem>;
  layout?: CodegenTypes.WithDefault<'vertical' | 'horizontal', 'vertical'>;
  selectedIndex?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  disabled?: boolean;
  kitStyle?: string;
  slots?: string;
  onGpuiKitRadioGroupChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitRadioGroup', {
  interfaceOnly: true,
});
