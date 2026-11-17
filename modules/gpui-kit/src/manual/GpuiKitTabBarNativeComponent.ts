import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type TabItem = Readonly<{
  label: string;
  icon: string;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<TabItem>;
  selectedIndex?: CodegenTypes.Int32;
  menu?: boolean;
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
