import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type FormField = Readonly<{
  label: string;
  description: string;
  required: boolean;
  visible: boolean;
  colSpan: CodegenTypes.Int32;
  colStart: CodegenTypes.Int32;
  labelIndent: boolean;
  kitStyle: string;
}>;

export interface NativeProps extends ViewProps {
  horizontal?: boolean;
  labelWidth?: CodegenTypes.Double;
  columns?: CodegenTypes.Int32;
  fields?: ReadonlyArray<FormField>;
  slots?: string;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitForm', {
  interfaceOnly: true,
});
