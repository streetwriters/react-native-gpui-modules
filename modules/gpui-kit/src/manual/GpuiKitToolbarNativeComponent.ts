import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  disabled?: boolean;
  size?: string;
  /** The items as JSON: buttons, toggles, separators, spacers, groups and slots. */
  itemsJson?: string;
  /** Refines the toolbar (a KitStyle as JSON). */
  kitStyle?: string;
  slots?: string;
  onGpuiKitToolbarPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: CodegenTypes.Int32 }>
  >;
  onGpuiKitToolbarToggle?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: CodegenTypes.Int32; checked: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitToolbar', {
  interfaceOnly: true,
});
