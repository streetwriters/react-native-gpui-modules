import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type TreeNode = Readonly<{
  id: string;
  label: string;
  depth: CodegenTypes.Int32;
  expanded: boolean;
  disabled: boolean;
}>;

export type TreeMenuEntry = Readonly<{
  label: string;
  separator: boolean;
  /** Shown for files only, not for folders. */
  filesOnly: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<TreeNode>;
  /** Indent of a row: `indent * depth + indentOffset`. */
  indent?: CodegenTypes.WithDefault<CodegenTypes.Double, 16>;
  indentOffset?: CodegenTypes.Double;
  /** Refines each row (a KitStyle as JSON). */
  rowStyle?: string;
  /** Refines the tree (a KitStyle as JSON). */
  kitStyle?: string;
  contextMenu?: ReadonlyArray<TreeMenuEntry>;
  onGpuiKitTreeMenu?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: string; item: CodegenTypes.Int32 }>
  >;
  onGpuiKitTreeSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32; id: string }>
  >;
  onGpuiKitTreeToggle?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: string; expanded: boolean }>
  >;
}

interface NativeCommands {
  selectItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    id: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['selectItem'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitTree', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
