import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type ToggleGroupItem = Readonly<{
  label: string;
  icon: string;
  checked: boolean;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<ToggleGroupItem>;
  segmented?: boolean;
  single?: boolean;
  disabled?: boolean;
  variant?: CodegenTypes.WithDefault<'unset' | 'ghost' | 'outline', 'unset'>;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitToggleGroupChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ checked: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitToggleGroup', {
  interfaceOnly: true,
});
