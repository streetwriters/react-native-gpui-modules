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
