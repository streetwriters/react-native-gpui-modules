import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  date?: string;
  endDate?: string;
  range?: boolean;
  controlled?: boolean;
  dateFormat?: string;
  placeholder?: string;
  cleanable?: boolean;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  numberOfMonths?: CodegenTypes.Int32;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitDatePickerChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ start: string; end: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDatePicker', {
  interfaceOnly: true,
});
