import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type DescriptionListItem = Readonly<{
  label: string;
  value: string;
  span: CodegenTypes.Int32;
  separator: boolean;
}>;

export interface NativeProps extends ViewProps {
  layout?: CodegenTypes.WithDefault<
    'unset' | 'horizontal' | 'vertical',
    'unset'
  >;
  bordered?: CodegenTypes.WithDefault<boolean, true>;
  columns?: CodegenTypes.Int32;
  labelWidth?: CodegenTypes.Double;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  items?: ReadonlyArray<DescriptionListItem>;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDescriptionList', {
  interfaceOnly: true,
});
