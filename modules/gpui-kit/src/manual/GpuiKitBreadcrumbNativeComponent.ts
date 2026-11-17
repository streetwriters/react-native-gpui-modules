import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type BreadcrumbItem = Readonly<{
  label: string;
  disabled: boolean;
  style: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<BreadcrumbItem>;
  onGpuiKitBreadcrumbPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitBreadcrumb', {
  interfaceOnly: true,
});
