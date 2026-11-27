import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  time?: string;
  controlled?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  precision?: CodegenTypes.WithDefault<'minute' | 'second', 'minute'>;
  hourCycle?: CodegenTypes.WithDefault<'h23' | 'h12', 'h23'>;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitTimeFieldChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ time: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTimeField', {
  interfaceOnly: true,
});
