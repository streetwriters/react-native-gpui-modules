import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<string>;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  cleanable?: boolean;
  disabled?: boolean;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  menuWidth?: CodegenTypes.Double;
  icon?: string;
  controlled?: boolean;
  defaultValue?: string;
  titlePrefix?: string;
  menuMaxHeight?: CodegenTypes.Double;
  emptyText?: string;
  kitStyle?: string;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  value?: string;
  listJson?: string;
  onGpuiKitSelectChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ value: string; index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSelect', {
  interfaceOnly: true,
});
