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
}>;

export interface NativeProps extends ViewProps {
  horizontal?: boolean;
  labelWidth?: CodegenTypes.Double;
  columns?: CodegenTypes.Int32;
  fields?: ReadonlyArray<FormField>;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitForm', {
  interfaceOnly: true,
});
