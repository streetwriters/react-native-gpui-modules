import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type TreeNode = Readonly<{
  id: string;
  label: string;
  depth: CodegenTypes.Int32;
  expanded: boolean;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<TreeNode>;
  onGpuiKitTreeSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32; id: string }>
  >;
  onGpuiKitTreeToggle?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: string; expanded: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTree', {
  interfaceOnly: true,
});
