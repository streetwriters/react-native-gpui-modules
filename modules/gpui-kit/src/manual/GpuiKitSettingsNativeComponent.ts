import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The pages, their groups and items as JSON (see `Settings.tsx`). */
  pagesJson?: string;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  /** `normal`, `outline` or `fill`; empty keeps the kit's. */
  groupVariant?: string;
  sidebarWidth?: CodegenTypes.Double;
  slots?: string;
  /** A kit field changed: the item's key and its new value as JSON. */
  onGpuiKitSettingsChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ key: string; value: string }>
  >;
  /** The reset button of an item with React Native content was pressed. */
  onGpuiKitSettingsReset?: CodegenTypes.DirectEventHandler<
    Readonly<{ key: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSettings', {
  interfaceOnly: true,
});
