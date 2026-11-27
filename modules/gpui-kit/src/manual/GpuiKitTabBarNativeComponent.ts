import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type TabItem = Readonly<{
  label: string;
  icon: string;
  disabled: boolean;
  /** An icon before the label, through `Tab::prefix`. */
  prefixIcon: string;
  /** Refines the tab (a KitStyle as JSON). */
  kitStyle: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<TabItem>;
  selectedIndex?: CodegenTypes.Int32;
  menu?: boolean;
  /** The widest a tab may be, in points; 0 for no limit. */
  tabMaxWidth?: CodegenTypes.Double;
  kitStyle?: string;
  slots?: string;
  variant?: CodegenTypes.WithDefault<
    'unset' | 'tab' | 'outline' | 'pill' | 'segmented' | 'underline' | 'folder',
    'unset'
  >;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  onGpuiKitTabBarSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTabBar', {
  interfaceOnly: true,
});
